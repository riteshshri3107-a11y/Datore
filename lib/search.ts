/* ═══════════════════════════════════════════════════════════════
   SEARCH & DISCOVERY ENGINE — Client-Side Index
   ═══════════════════════════════════════════════════════════════
   Phase 1 (Current): In-memory inverted index + TF-IDF scoring
   Phase 2: OpenSearch/Elasticsearch backend
   Phase 3: ML-powered personalized ranking, embeddings
   
   Indexes: workers, jobs, listings, communities, posts
   Features: fuzzy matching, filters, facets, regional boosting
   ═══════════════════════════════════════════════════════════════ */

// ═══ Types ═══
export type SearchableType = 'worker' | 'job' | 'listing' | 'community' | 'post' | 'service';

export interface SearchDocument {
  id: string;
  type: SearchableType;
  title: string;
  body: string;
  tags: string[];
  category?: string;
  location?: string;
  rating?: number;
  timestamp?: number;
  metadata?: Record<string, any>;
}

export interface SearchResult {
  document: SearchDocument;
  score: number;
  highlights: string[];
  matchedFields: string[];
}

export interface SearchFilters {
  types?: SearchableType[];
  categories?: string[];
  locations?: string[];
  minRating?: number;
  dateRange?: { from:number; to:number };
  tags?: string[];
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  facets: {
    types: Record<string, number>;
    categories: Record<string, number>;
    locations: Record<string, number>;
  };
  query: string;
  took: number;
}

// ═══ Inverted Index ═══
const invertedIndex = new Map<string, Set<string>>(); // token → doc IDs
const documents = new Map<string, SearchDocument>();    // id → document
const docFrequency = new Map<string, number>();         // token → # docs containing it

// ═══ Tokenizer ═══
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1)
    .map(t => stem(t)); // Basic stemming
}

// ═══ Basic Stemmer (Porter-ish, simplified) ═══
function stem(word: string): string {
  if (word.length < 4) return word;
  return word
    .replace(/ing$/, '')
    .replace(/tion$/, 't')
    .replace(/sion$/, 's')
    .replace(/ness$/, '')
    .replace(/ment$/, '')
    .replace(/able$/, '')
    .replace(/ible$/, '')
    .replace(/ful$/, '')
    .replace(/less$/, '')
    .replace(/ly$/, '')
    .replace(/er$/, '')
    .replace(/est$/, '')
    .replace(/ies$/, 'y')
    .replace(/ied$/, 'y')
    .replace(/s$/, '');
}

// ═══ N-gram Generator (for fuzzy matching) ═══
function ngrams(word: string, n: number = 2): string[] {
  const grams: string[] = [];
  const padded = `_${word}_`;
  for (let i = 0; i <= padded.length - n; i++) {
    grams.push(padded.slice(i, i + n));
  }
  return grams;
}

// ═══ Index a Document ═══
export function indexDocument(doc: SearchDocument) {
  documents.set(doc.id, doc);
  
  // Combine searchable text with field weighting
  const fields = [
    { text:doc.title, weight:3 },
    { text:doc.body, weight:1 },
    { text:doc.tags.join(' '), weight:2 },
    { text:doc.category || '', weight:2 },
    { text:doc.location || '', weight:1.5 },
  ];

  const docTokens = new Set<string>();
  for (const { text } of fields) {
    for (const token of tokenize(text)) {
      docTokens.add(token);
      const set = invertedIndex.get(token) || new Set();
      set.add(doc.id);
      invertedIndex.set(token, set);
    }
  }

  // Update doc frequency
  for (const token of docTokens) {
    docFrequency.set(token, (docFrequency.get(token) || 0) + 1);
  }
}

// ═══ Bulk Index ═══
export function indexBulk(docs: SearchDocument[]) {
  for (const doc of docs) indexDocument(doc);
}

// ═══ TF-IDF Score ═══
function tfidf(token: string, docId: string): number {
  const doc = documents.get(docId);
  if (!doc) return 0;
  
  const allText = `${doc.title} ${doc.title} ${doc.title} ${doc.body} ${doc.tags.join(' ')} ${doc.category || ''}`; // title weighted 3x
  const tokens = tokenize(allText);
  const tf = tokens.filter(t => t === token).length / Math.max(tokens.length, 1);
  const idf = Math.log(documents.size / Math.max(docFrequency.get(token) || 1, 1));
  return tf * idf;
}

// ═══ Fuzzy Match Score ═══
function fuzzyScore(query: string, text: string): number {
  const qGrams = new Set(ngrams(query.toLowerCase()));
  const tGrams = new Set(ngrams(text.toLowerCase()));
  let overlap = 0;
  for (const g of qGrams) if (tGrams.has(g)) overlap++;
  return overlap / Math.max(qGrams.size, 1);
}

// ═══ Main Search Function ═══
export function search(query: string, filters?: SearchFilters, limit: number = 20, offset: number = 0): SearchResponse {
  const startTime = performance.now();
  const queryTokens = tokenize(query);
  
  // Gather candidate documents from inverted index
  const candidates = new Map<string, number>(); // docId → score
  
  for (const token of queryTokens) {
    // Exact match
    const exactDocs = invertedIndex.get(token);
    if (exactDocs) {
      for (const docId of exactDocs) {
        candidates.set(docId, (candidates.get(docId) || 0) + tfidf(token, docId) * 2);
      }
    }
    
    // Prefix match (autocomplete)
    for (const [indexToken, docIds] of invertedIndex.entries()) {
      if (indexToken.startsWith(token) && indexToken !== token) {
        for (const docId of docIds) {
          candidates.set(docId, (candidates.get(docId) || 0) + tfidf(indexToken, docId) * 0.8);
        }
      }
    }
  }

  // Fuzzy fallback for low results
  if (candidates.size < 5 && query.length >= 3) {
    for (const [docId, doc] of documents.entries()) {
      if (candidates.has(docId)) continue;
      const fScore = fuzzyScore(query, `${doc.title} ${doc.body} ${doc.tags.join(' ')}`);
      if (fScore > 0.3) candidates.set(docId, fScore * 0.5);
    }
  }

  // Apply filters
  let filtered: Array<{ doc:SearchDocument; score:number }> = [];
  for (const [docId, score] of candidates.entries()) {
    const doc = documents.get(docId);
    if (!doc) continue;
    
    if (filters?.types && !filters.types.includes(doc.type)) continue;
    if (filters?.categories && doc.category && !filters.categories.includes(doc.category)) continue;
    if (filters?.locations && doc.location && !filters.locations.includes(doc.location)) continue;
    if (filters?.minRating && doc.rating && doc.rating < filters.minRating) continue;
    if (filters?.dateRange && doc.timestamp) {
      if (doc.timestamp < filters.dateRange.from || doc.timestamp > filters.dateRange.to) continue;
    }
    if (filters?.tags && filters.tags.length > 0) {
      const docTagsLower = doc.tags.map(t => t.toLowerCase());
      if (!filters.tags.some(t => docTagsLower.includes(t.toLowerCase()))) continue;
    }

    // Boost factors
    let boostedScore = score;
    if (doc.rating) boostedScore *= (1 + doc.rating / 10); // Rating boost
    if (doc.timestamp) boostedScore *= (1 + Math.max(0, 1 - (Date.now() - doc.timestamp) / 86400_000 / 30)); // Recency boost (30d)
    
    filtered.push({ doc, score:boostedScore });
  }

  // Sort by score
  filtered.sort((a, b) => b.score - a.score);

  // Build facets
  const facets = { types:{} as Record<string,number>, categories:{} as Record<string,number>, locations:{} as Record<string,number> };
  for (const { doc } of filtered) {
    facets.types[doc.type] = (facets.types[doc.type] || 0) + 1;
    if (doc.category) facets.categories[doc.category] = (facets.categories[doc.category] || 0) + 1;
    if (doc.location) facets.locations[doc.location] = (facets.locations[doc.location] || 0) + 1;
  }

  // Generate highlights
  const results: SearchResult[] = filtered.slice(offset, offset + limit).map(({ doc, score }) => {
    const highlights: string[] = [];
    const matchedFields: string[] = [];
    for (const token of queryTokens) {
      if (doc.title.toLowerCase().includes(token)) { matchedFields.push('title'); highlights.push(highlightSnippet(doc.title, token)); }
      if (doc.body.toLowerCase().includes(token)) { matchedFields.push('body'); highlights.push(highlightSnippet(doc.body, token)); }
    }
    return { document:doc, score, highlights, matchedFields:[...new Set(matchedFields)] };
  });

  return {
    results,
    total: filtered.length,
    facets,
    query,
    took: performance.now() - startTime,
  };
}

// ═══ Highlight Snippet ═══
function highlightSnippet(text: string, token: string, contextChars: number = 60): string {
  const lower = text.toLowerCase();
  const idx = lower.indexOf(token);
  if (idx < 0) return text.slice(0, contextChars * 2);
  const start = Math.max(0, idx - contextChars);
  const end = Math.min(text.length, idx + token.length + contextChars);
  return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
}

// ═══ Trending / Popular ═══
const searchHistory: string[] = [];
export function getTrending(limit: number = 10): string[] {
  const freq = new Map<string, number>();
  for (const q of searchHistory.slice(-500)) {
    freq.set(q, (freq.get(q) || 0) + 1);
  }
  return [...freq.entries()].sort((a,b) => b[1] - a[1]).slice(0, limit).map(([q]) => q);
}

export function recordSearch(query: string) {
  searchHistory.push(query.toLowerCase().trim());
  if (searchHistory.length > 1000) searchHistory.splice(0, 500);
}

// ═══ Suggestions / Autocomplete ═══
export function suggest(prefix: string, limit: number = 8): string[] {
  if (prefix.length < 2) return [];
  const lower = prefix.toLowerCase();
  const matches = new Set<string>();
  for (const token of invertedIndex.keys()) {
    if (token.startsWith(lower) && token.length > lower.length) matches.add(token);
    if (matches.size >= limit) break;
  }
  return [...matches].slice(0, limit);
}

// ═══ Index Count ═══
export function getIndexStats(): { documents:number; tokens:number; avgTokensPerDoc:number } {
  return {
    documents: documents.size,
    tokens: invertedIndex.size,
    avgTokensPerDoc: documents.size > 0 ? invertedIndex.size / documents.size : 0,
  };
}
