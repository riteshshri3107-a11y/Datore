/* ═══════════════════════════════════════════════════════════════
   CONTENT MODERATION ENGINE — ML-Ready Pipeline
   ═══════════════════════════════════════════════════════════════
   Phase 1 (Current): Rule-based classification
   Phase 2 (30-90d):  Integrate ML classifiers (Perspective API / custom)
   Phase 3 (90-180d): Human review queue + appeals workflow
   
   Categories: profanity, hate, threats, adult, PII, spam, scam
   Actions: allow, censor, flag, block, escalate
   ═══════════════════════════════════════════════════════════════ */

import { detectPII } from './security';

// ═══ Types ═══
export type ContentType = 'post' | 'comment' | 'message' | 'profile' | 'listing' | 'review' | 'image_meta';
export type Severity = 'none' | 'low' | 'medium' | 'high' | 'critical';
export type ModerationAction = 'allow' | 'censor' | 'flag' | 'block' | 'escalate';

export interface ModerationResult {
  safe: boolean;
  severity: Severity;
  action: ModerationAction;
  flags: ModerationFlag[];
  cleaned: string;
  confidence: number; // 0-1
  reviewRequired: boolean;
  metadata: {
    processingTime: number;
    rulesTriggered: string[];
    piiDetected: string[];
  };
}

export interface ModerationFlag {
  category: string;
  description: string;
  severity: Severity;
  matchedPattern: string;
}

// ═══ Pattern Libraries ═══
const PATTERNS = {
  // Profanity — catches variants, leet speak, partial words
  profanity: {
    severe: /\b(c[u\*]nt|n[i1!]gg[ae3]r?\w*|f[a4@]gg?[o0]t\w*|m[o0]th[ae3]r\s*f[u\*v][ck]+\w*)\b/gi,
    moderate: /\b(f[u\*v][ck]+\w*|sh[i1!]+t\w*|b[i1!]tch\w*|d[i1!]ck\w*|c[o0]ck\w*|wh[o0]re\w*|slut\w*|p[u\*]ssy\w*|a[s$]{1,2}h?[o0]?l?e?\b|a[s$]{2}\b|stfu|gtfo)\b/gi,
    mild: /\b(damn\w*|crap\w*|hell|piss\w*|stfu|wtf|lmfao|bastard\w*)\b/gi,
  },

  // Hate speech — racial, gender, religious, orientation
  hate: /\b(kill\s+(all|them|yourself)|go\s+die|kys|hate\s+(all|every)\s+\w+|supremac\w*|master\s*race|ethnic\s*cleans\w*|gas\s+the|death\s+to)\b/gi,

  // Threats — violence, harm
  threats: /\b(bomb\w*|shoot\s+up|attack\w*|massacre|terroris\w*|blow\s+up|stab\w*|murder\w*|assassinat\w*|gun\s+down|knife\s+you|beat\s+(you|them)\s+up)\b/gi,

  // Adult content
  adult: /\b(p[o0]rn\w*|xxx|nsfw|hentai|onlyfans|stripper\w*|escort\w*|prostitut\w*|explicit|18\+|nude[s]?|naked|sex\s*tape|cam\s*girl|erotic\w*)\b/gi,

  // Spam patterns
  spam: /\b(buy\s+now|click\s+here|free\s+money|act\s+now|limited\s+offer|congratulations\s+you\s+won|make\s+\$?\d+\s*k?|nigerian\s+prince|wire\s+transfer)\b/gi,

  // Scam patterns
  scam: /\b(send\s+(me\s+)?your\s+(password|credit|ssn|bank)|verify\s+your\s+account|urgent\s+.*\s+transfer|crypto\s+invest\w*|guaranteed\s+return|double\s+your\s+money)\b/gi,

  // Contact info in public posts (could enable stalking)
  contactLeakage: /\b(\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})\b/gi,
};

// ═══ Image Filename/Metadata Check ═══
const UNSAFE_IMAGE_PATTERNS = /\b(nsfw|porn|xxx|nude|naked|adult|explicit|18\+|hentai|sex|erotic|gore|blood|death|murder|violence)\b/i;

export function isImageSafe(fileName: string, altText?: string): boolean {
  const combined = `${fileName} ${altText || ''}`;
  return !UNSAFE_IMAGE_PATTERNS.test(combined);
}

// ═══ Main Moderation Function ═══
export function moderateContent(text: string, contentType: ContentType = 'post'): ModerationResult {
  const startTime = performance.now();
  const flags: ModerationFlag[] = [];
  const rulesTriggered: string[] = [];
  let cleaned = text;
  let highestSeverity: Severity = 'none';
  const severityRank: Record<Severity, number> = { none:0, low:1, medium:2, high:3, critical:4 };

  const addFlag = (category: string, description: string, severity: Severity, matched: string) => {
    flags.push({ category, description, severity, matchedPattern:matched });
    rulesTriggered.push(`${category}:${severity}`);
    if (severityRank[severity] > severityRank[highestSeverity]) highestSeverity = severity;
  };

  // Reset regex lastIndex
  const resetAll = () => {
    Object.values(PATTERNS).forEach(p => {
      if (p instanceof RegExp) p.lastIndex = 0;
      else if (typeof p === 'object') Object.values(p).forEach(r => { if (r instanceof RegExp) r.lastIndex = 0; });
    });
  };
  resetAll();

  // 1. Hate speech — critical
  if (PATTERNS.hate.test(text)) {
    addFlag('hate_speech', 'Hate speech or incitement detected', 'critical', text.match(PATTERNS.hate)?.[0] || '');
  }
  PATTERNS.hate.lastIndex = 0;

  // 2. Threats — critical
  if (PATTERNS.threats.test(text)) {
    addFlag('threats', 'Violent threats detected', 'critical', text.match(PATTERNS.threats)?.[0] || '');
  }
  PATTERNS.threats.lastIndex = 0;

  // 3. Adult content — high
  if (PATTERNS.adult.test(text)) {
    addFlag('adult', 'Adult/explicit content detected', 'high', text.match(PATTERNS.adult)?.[0] || '');
  }
  PATTERNS.adult.lastIndex = 0;

  // 4. Profanity — tiered severity
  if (PATTERNS.profanity.severe.test(text)) {
    addFlag('profanity', 'Severe profanity (slurs)', 'critical', text.match(PATTERNS.profanity.severe)?.[0] || '');
    PATTERNS.profanity.severe.lastIndex = 0;
    cleaned = cleaned.replace(PATTERNS.profanity.severe, m => m[0] + '★'.repeat(Math.max(1,m.length-1)));
  }
  PATTERNS.profanity.severe.lastIndex = 0;

  if (PATTERNS.profanity.moderate.test(text)) {
    addFlag('profanity', 'Moderate profanity', 'medium', text.match(PATTERNS.profanity.moderate)?.[0] || '');
    PATTERNS.profanity.moderate.lastIndex = 0;
    cleaned = cleaned.replace(PATTERNS.profanity.moderate, m => m[0] + '★'.repeat(Math.max(1,m.length-1)));
  }
  PATTERNS.profanity.moderate.lastIndex = 0;

  if (PATTERNS.profanity.mild.test(text)) {
    addFlag('profanity', 'Mild profanity', 'low', text.match(PATTERNS.profanity.mild)?.[0] || '');
    PATTERNS.profanity.mild.lastIndex = 0;
    cleaned = cleaned.replace(PATTERNS.profanity.mild, m => m[0] + '★'.repeat(Math.max(1,m.length-1)));
  }
  PATTERNS.profanity.mild.lastIndex = 0;

  // 5. Spam — medium
  if (PATTERNS.spam.test(text)) {
    addFlag('spam', 'Spam patterns detected', 'medium', text.match(PATTERNS.spam)?.[0] || '');
  }
  PATTERNS.spam.lastIndex = 0;

  // 6. Scam — high
  if (PATTERNS.scam.test(text)) {
    addFlag('scam', 'Potential scam detected', 'high', text.match(PATTERNS.scam)?.[0] || '');
  }
  PATTERNS.scam.lastIndex = 0;

  // 7. PII detection
  const piiResult = detectPII(text);
  if (piiResult.hasPII && contentType !== 'message') {
    addFlag('pii', `PII detected: ${piiResult.types.join(', ')}`, 'medium', piiResult.types.join(','));
    // Auto-mask PII in public content
    if (['post', 'comment', 'listing', 'review'].includes(contentType)) {
      cleaned = piiResult.masked;
    }
  }

  // 8. Contact info in public content
  if (['post', 'comment', 'listing'].includes(contentType)) {
    PATTERNS.contactLeakage.lastIndex = 0;
    if (PATTERNS.contactLeakage.test(text)) {
      addFlag('contact_leakage', 'Contact info in public content', 'low', 'email/phone');
    }
    PATTERNS.contactLeakage.lastIndex = 0;
  }

  // ═══ Determine Action ═══
  let action: ModerationAction = 'allow';
  let reviewRequired = false;

  if (highestSeverity === 'critical') {
    action = 'block';
    reviewRequired = true;
  } else if (highestSeverity === 'high') {
    action = 'block';
    reviewRequired = true;
  } else if (highestSeverity === 'medium') {
    action = 'censor'; // Auto-censor moderate content
    reviewRequired = false;
  } else if (highestSeverity === 'low') {
    action = 'censor'; // Mild censoring
    reviewRequired = false;
  }

  // Confidence based on pattern match density
  const wordCount = text.split(/\s+/).length;
  const flagDensity = flags.length / Math.max(wordCount, 1);
  const confidence = Math.min(1, 0.5 + flagDensity * 5);

  const processingTime = performance.now() - startTime;

  return {
    safe: flags.length === 0,
    severity: highestSeverity,
    action,
    flags,
    cleaned,
    confidence,
    reviewRequired,
    metadata: {
      processingTime,
      rulesTriggered,
      piiDetected: piiResult.types,
    },
  };
}

// ═══ Quick Check (for real-time typing validation) ═══
export function quickCheck(text: string): { severity:Severity; hasBadWords:boolean } {
  if (!text || text.length < 2) return { severity:'none', hasBadWords:false };
  const allPatterns = [PATTERNS.profanity.severe, PATTERNS.profanity.moderate, PATTERNS.hate, PATTERNS.threats];
  for (const pat of allPatterns) {
    pat.lastIndex = 0;
    if (pat.test(text)) {
      pat.lastIndex = 0;
      return { severity: pat === PATTERNS.hate || pat === PATTERNS.threats ? 'critical' : 'medium', hasBadWords:true };
    }
    pat.lastIndex = 0;
  }
  return { severity:'none', hasBadWords:false };
}

// ═══ Moderation Queue Entry (for human review) ═══
export interface ModerationQueueItem {
  id: string;
  contentType: ContentType;
  contentId: string;
  authorId: string;
  originalText: string;
  moderationResult: ModerationResult;
  status: 'pending' | 'approved' | 'rejected' | 'escalated';
  reviewedBy?: string;
  reviewedAt?: string;
  appealText?: string;
  createdAt: string;
}

// ═══ Create Queue Entry (for Supabase integration) ═══
export function createQueueEntry(
  contentType: ContentType,
  contentId: string,
  authorId: string,
  text: string,
  result: ModerationResult
): ModerationQueueItem {
  return {
    id: `mod_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    contentType,
    contentId,
    authorId,
    originalText: text,
    moderationResult: result,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
}
