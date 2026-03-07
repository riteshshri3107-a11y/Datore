/* ═══════════════════════════════════════════════════════════════
   CONTENT ADDRESSABLE STORAGE — Media Fingerprinting & Dedup
   ═══════════════════════════════════════════════════════════════
   Phase 1 (Current): Client-side hashing + dedup index
   Phase 2: Server-side with Supabase Edge Functions + S3 CAS
   Phase 3: Perceptual hashing for near-duplicate image detection

   Features:
   - SHA-256 content hashing for exact dedup
   - Perceptual hashing (average hash) for similar image detection
   - Reference counting for safe garbage collection
   - Chunk-based dedup for large files (CDC)
   ═══════════════════════════════════════════════════════════════ */

import { log, track } from './observability';

// ═══ Types ═══
export interface CASEntry {
  hash: string;           // Content hash (SHA-256 hex)
  size: number;           // Bytes
  mimeType: string;
  storageUrl: string;     // Actual storage location (Supabase Storage URL)
  references: Set<string>; // Set of referencing entity IDs (post IDs, user IDs, etc.)
  createdAt: number;
  lastAccessedAt: number;
  perceptualHash?: string; // For images: average hash for near-duplicate detection
}

export interface DeduplicationResult {
  isDuplicate: boolean;
  hash: string;
  existingUrl?: string;
  savedBytes: number;
}

export interface SimilarityMatch {
  hash: string;
  storageUrl: string;
  similarity: number;     // 0-1, where 1 = identical
  hammingDistance: number;
}

// ═══ CAS Index (hash -> entry) ═══
const casIndex = new Map<string, CASEntry>();

// ═══ Perceptual Hash Index (phash -> content hash) ═══
const perceptualIndex = new Map<string, string>();

// ═══ SHA-256 Hash (Web Crypto API) ═══
export async function sha256(data: ArrayBuffer): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback: FNV-1a based hash (less secure, but works in all environments)
  return fnvHash(new Uint8Array(data));
}

// ═══ FNV-1a Fallback Hash ═══
function fnvHash(data: Uint8Array): string {
  let h1 = 0x811c9dc5;
  let h2 = 0x311c9dc5;
  for (let i = 0; i < data.length; i++) {
    h1 ^= data[i];
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= data[i];
    h2 = Math.imul(h2, 0x01000193);
  }
  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

// ═══ Average Perceptual Hash (for images) ═══
// Downscales image concept to 8x8 grid, computes average brightness hash
export function computePerceptualHash(pixelData: Uint8Array, width: number, height: number): string {
  // Downsample to 8x8
  const gridSize = 8;
  const grid: number[] = new Array(gridSize * gridSize).fill(0);
  const cellW = width / gridSize;
  const cellH = height / gridSize;

  for (let gy = 0; gy < gridSize; gy++) {
    for (let gx = 0; gx < gridSize; gx++) {
      let sum = 0;
      let count = 0;
      const startX = Math.floor(gx * cellW);
      const endX = Math.floor((gx + 1) * cellW);
      const startY = Math.floor(gy * cellH);
      const endY = Math.floor((gy + 1) * cellH);

      for (let y = startY; y < endY; y++) {
        for (let x = startX; x < endX; x++) {
          const idx = (y * width + x) * 4; // RGBA
          // Luminance: 0.299R + 0.587G + 0.114B
          const luminance = pixelData[idx] * 0.299 + pixelData[idx + 1] * 0.587 + pixelData[idx + 2] * 0.114;
          sum += luminance;
          count++;
        }
      }
      grid[gy * gridSize + gx] = count > 0 ? sum / count : 0;
    }
  }

  // Compute average
  const avg = grid.reduce((a, b) => a + b, 0) / grid.length;

  // Generate hash: 1 if above average, 0 if below
  let hash = '';
  for (const val of grid) {
    hash += val >= avg ? '1' : '0';
  }

  // Convert binary string to hex
  let hex = '';
  for (let i = 0; i < hash.length; i += 4) {
    hex += parseInt(hash.substring(i, i + 4), 2).toString(16);
  }

  return hex;
}

// ═══ Hamming Distance (for comparing perceptual hashes) ═══
export function hammingDistance(hashA: string, hashB: string): number {
  if (hashA.length !== hashB.length) return Infinity;

  let distance = 0;
  // Compare hex chars by converting to binary
  for (let i = 0; i < hashA.length; i++) {
    const a = parseInt(hashA[i], 16);
    const b = parseInt(hashB[i], 16);
    let xor = a ^ b;
    while (xor) {
      distance += xor & 1;
      xor >>= 1;
    }
  }
  return distance;
}

// ═══ Check for Duplicate Before Upload ═══
export async function checkDuplicate(file: File | ArrayBuffer, referenceId: string): Promise<DeduplicationResult> {
  const data = file instanceof File ? await file.arrayBuffer() : file;
  const hash = await sha256(data);
  const size = data.byteLength;

  const existing = casIndex.get(hash);
  if (existing) {
    // Add reference to existing entry
    existing.references.add(referenceId);
    existing.lastAccessedAt = Date.now();

    track('cas_duplicate_found', { hash: hash.substring(0, 12), savedBytes: String(size) });
    log('info', `Duplicate detected, reusing existing: ${hash.substring(0, 12)}...`, { refs: existing.references.size }, 'cas');

    return {
      isDuplicate: true,
      hash,
      existingUrl: existing.storageUrl,
      savedBytes: size,
    };
  }

  return { isDuplicate: false, hash, savedBytes: 0 };
}

// ═══ Register Uploaded Content ═══
export function registerContent(
  hash: string,
  storageUrl: string,
  size: number,
  mimeType: string,
  referenceId: string,
  perceptualHash?: string,
): void {
  const entry: CASEntry = {
    hash,
    size,
    mimeType,
    storageUrl,
    references: new Set([referenceId]),
    createdAt: Date.now(),
    lastAccessedAt: Date.now(),
    perceptualHash,
  };

  casIndex.set(hash, entry);

  if (perceptualHash) {
    perceptualIndex.set(perceptualHash, hash);
  }

  track('cas_content_registered', { hash: hash.substring(0, 12), size: String(size), type: mimeType });
}

// ═══ Remove a Reference (when post/user deleted) ═══
export function removeReference(hash: string, referenceId: string): boolean {
  const entry = casIndex.get(hash);
  if (!entry) return false;

  entry.references.delete(referenceId);

  // If no more references, content is orphaned (eligible for GC)
  if (entry.references.size === 0) {
    track('cas_content_orphaned', { hash: hash.substring(0, 12) });
    return true; // Caller should delete from storage
  }
  return false;
}

// ═══ Find Similar Images (perceptual hash comparison) ═══
export function findSimilar(perceptualHash: string, threshold: number = 0.9): SimilarityMatch[] {
  const maxHashBits = perceptualHash.length * 4; // Each hex char = 4 bits
  const maxDistance = Math.floor(maxHashBits * (1 - threshold));
  const matches: SimilarityMatch[] = [];

  for (const [pHash, contentHash] of perceptualIndex) {
    const dist = hammingDistance(perceptualHash, pHash);
    if (dist <= maxDistance) {
      const entry = casIndex.get(contentHash);
      if (entry) {
        matches.push({
          hash: contentHash,
          storageUrl: entry.storageUrl,
          similarity: 1 - dist / maxHashBits,
          hammingDistance: dist,
        });
      }
    }
  }

  matches.sort((a, b) => b.similarity - a.similarity);
  track('cas_similar_search', { matches: String(matches.length) });
  return matches;
}

// ═══ Content-Defined Chunking (CDC) for Large Files ═══
// Rabin fingerprint inspired: split files at content-defined boundaries
export function contentDefinedChunking(data: Uint8Array, targetChunkSize: number = 64 * 1024): Uint8Array[] {
  const MIN_CHUNK = targetChunkSize / 4;
  const MAX_CHUNK = targetChunkSize * 4;
  const MASK = targetChunkSize - 1; // Works best when targetChunkSize is power of 2

  const chunks: Uint8Array[] = [];
  let start = 0;
  let fingerprint = 0;

  for (let i = 0; i < data.length; i++) {
    fingerprint = ((fingerprint << 1) + data[i]) >>> 0;
    const chunkLen = i - start;

    // Split at content-defined boundary or max chunk size
    if ((chunkLen >= MIN_CHUNK && (fingerprint & MASK) === 0) || chunkLen >= MAX_CHUNK) {
      chunks.push(data.slice(start, i + 1));
      start = i + 1;
      fingerprint = 0;
    }
  }

  // Remaining data
  if (start < data.length) {
    chunks.push(data.slice(start));
  }

  track('cas_chunked', { chunks: String(chunks.length), totalSize: String(data.length) });
  return chunks;
}

// ═══ Deduplicate Chunks ═══
export async function deduplicateChunks(
  chunks: Uint8Array[],
  referenceId: string,
): Promise<Array<{ chunkIndex: number; hash: string; isDuplicate: boolean; size: number }>> {
  const results = [];

  for (let i = 0; i < chunks.length; i++) {
    const hash = await sha256(chunks[i].buffer);
    const existing = casIndex.get(hash);

    if (existing) {
      existing.references.add(referenceId);
      results.push({ chunkIndex: i, hash, isDuplicate: true, size: chunks[i].length });
    } else {
      results.push({ chunkIndex: i, hash, isDuplicate: false, size: chunks[i].length });
    }
  }

  const dupeCount = results.filter(r => r.isDuplicate).length;
  const savedBytes = results.filter(r => r.isDuplicate).reduce((sum, r) => sum + r.size, 0);
  track('cas_chunks_deduped', {
    total: String(chunks.length),
    duplicates: String(dupeCount),
    savedBytes: String(savedBytes),
  });

  return results;
}

// ═══ Garbage Collection (remove orphaned content) ═══
export function collectGarbage(): Array<{ hash: string; storageUrl: string; size: number }> {
  const orphaned: Array<{ hash: string; storageUrl: string; size: number }> = [];

  for (const [hash, entry] of casIndex) {
    if (entry.references.size === 0) {
      orphaned.push({ hash, storageUrl: entry.storageUrl, size: entry.size });
      casIndex.delete(hash);
      if (entry.perceptualHash) {
        perceptualIndex.delete(entry.perceptualHash);
      }
    }
  }

  if (orphaned.length > 0) {
    const totalBytes = orphaned.reduce((sum, o) => sum + o.size, 0);
    track('cas_gc_completed', { removed: String(orphaned.length), freedBytes: String(totalBytes) });
    log('info', `CAS GC: removed ${orphaned.length} orphaned entries (${(totalBytes / 1024 / 1024).toFixed(2)} MB)`, {}, 'cas');
  }

  return orphaned;
}

// ═══ CAS Statistics ═══
export function getCASStats() {
  let totalSize = 0;
  let totalRefs = 0;

  for (const entry of casIndex.values()) {
    totalSize += entry.size;
    totalRefs += entry.references.size;
  }

  return {
    totalEntries: casIndex.size,
    totalSizeMB: Number((totalSize / 1024 / 1024).toFixed(2)),
    totalReferences: totalRefs,
    perceptualHashes: perceptualIndex.size,
    avgRefsPerEntry: casIndex.size > 0 ? Number((totalRefs / casIndex.size).toFixed(1)) : 0,
  };
}
