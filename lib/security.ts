/* ═══════════════════════════════════════════════════════════════
   SECURITY MODULE — Input Sanitization, CSRF, XSS Prevention
   ═══════════════════════════════════════════════════════════════
   - Input sanitization (HTML, SQL injection prevention)
   - XSS protection utilities
   - CSRF token generation and validation
   - PII detection and masking
   - Request validation schemas
   ═══════════════════════════════════════════════════════════════ */

// ═══ HTML Sanitization — Strip all tags ═══
export function sanitizeHTML(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// ═══ Strip Script Tags (keep safe HTML if needed) ═══
export function stripScripts(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '');
}

// ═══ SQL Injection Prevention ═══
export function sanitizeForQuery(input: string): string {
  // Never build raw SQL — this is a safety net for edge cases
  return input
    .replace(/['";\\]/g, '')
    .replace(/--/g, '')
    .replace(/\/\*/g, '')
    .replace(/\*\//g, '')
    .replace(/\b(union|select|insert|update|delete|drop|create|alter|exec|execute)\b/gi, '')
    .trim();
}

// ═══ PII Detection ═══
const PII_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
  ssn: /\b\d{3}-?\d{2}-?\d{4}\b/g,
  creditCard: /\b(?:\d[ -]*?){13,16}\b/g,
  postalCode: /\b[A-Z]\d[A-Z]\s?\d[A-Z]\d\b/gi,
  indianAadhaar: /\b\d{4}\s?\d{4}\s?\d{4}\b/g,
  indianPAN: /\b[A-Z]{5}\d{4}[A-Z]\b/g,
};

export interface PIIDetectionResult {
  hasPII: boolean;
  types: string[];
  masked: string;
}

export function detectPII(text: string): PIIDetectionResult {
  const types: string[] = [];
  let masked = text;

  for (const [type, pattern] of Object.entries(PII_PATTERNS)) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      types.push(type);
      pattern.lastIndex = 0;
      masked = masked.replace(pattern, (match) => {
        if (type === 'email') return match.slice(0, 3) + '***@***';
        if (type === 'phone') return '***-***-' + match.slice(-4);
        if (type === 'creditCard') return '****-****-****-' + match.slice(-4);
        return '*'.repeat(match.length);
      });
    }
  }

  return { hasPII: types.length > 0, types, masked };
}

// ═══ CSRF Token ═══
export function generateCSRFToken(): string {
  if (typeof window === 'undefined') return '';
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function storeCSRFToken(): string {
  const token = generateCSRFToken();
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('csrf_token', token);
  }
  return token;
}

export function validateCSRFToken(token: string): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  const stored = sessionStorage.getItem('csrf_token');
  return !!stored && stored === token;
}

// ═══ Input Validation Schemas ═══
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (val: any) => string | null; // returns error message or null
}

export function validateInput(value: any, rules: ValidationRule): string | null {
  if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
    return 'This field is required';
  }
  if (typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) return `Minimum ${rules.minLength} characters`;
    if (rules.maxLength && value.length > rules.maxLength) return `Maximum ${rules.maxLength} characters`;
    if (rules.pattern && !rules.pattern.test(value)) return 'Invalid format';
  }
  if (rules.custom) return rules.custom(value);
  return null;
}

// ═══ Common Validators ═══
export const validators = {
  email: { required:true, pattern:/^[^\s@]+@[^\s@]+\.[^\s@]+$/, maxLength:254 },
  password: { required:true, minLength:8, maxLength:128 },
  displayName: { required:true, minLength:2, maxLength:50, pattern:/^[a-zA-Z0-9\s._-]+$/ },
  postContent: { required:true, minLength:1, maxLength:5000 },
  comment: { required:true, minLength:1, maxLength:2000 },
  jobTitle: { required:true, minLength:5, maxLength:200 },
  jobDescription: { required:true, minLength:20, maxLength:5000 },
  searchQuery: { maxLength:500 },
};

// ═══ Secure Random ID ═══
export function secureId(length: number = 16): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, b => b.toString(36)).join('').slice(0, length);
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ═══ Safe JSON Parse ═══
export function safeJSONParse<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

// ═══ URL Validation ═══
export function isSafeURL(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// ═══ Rate Limit Helper (Client-Side Debounce) ═══
export function createThrottle(fn: Function, ms: number) {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= ms) {
      lastCall = now;
      return fn(...args);
    }
  };
}
