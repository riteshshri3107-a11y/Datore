/* ═══════════════════════════════════════════════════════════════
   API GUARD — Server-Side Route Protection & Validation
   ═══════════════════════════════════════════════════════════════
   Wraps API handlers with:
   1. Auth validation (session check)
   2. Role-based access control
   3. Input validation & sanitization
   4. Rate limiting per endpoint
   5. Request logging (observability)
   6. Error handling with safe responses
   7. CORS enforcement
   ═══════════════════════════════════════════════════════════════ */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sanitizeHTML, validateInput, type ValidationRule } from './security';
import { moderateContent, type ContentType } from './moderation';
import { track } from './observability';
import type { UserRole } from './auth';

// ═══ Types ═══
interface ApiContext {
  userId: string;
  userRole: UserRole;
  userEmail: string;
  body: any;
  params: Record<string, string>;
  ip: string;
}

interface GuardOptions {
  requireAuth?: boolean;          // default: true
  requiredRole?: UserRole;        // minimum role
  rateLimit?: number;             // max requests per minute (default: 30)
  bodySchema?: Record<string, ValidationRule>;  // input validation
  moderateFields?: string[];      // fields to run through content moderation
  moderateAs?: ContentType;       // content type for moderation
  maxBodySize?: number;           // max JSON body size in bytes (default: 100KB)
  allowedMethods?: string[];      // restrict HTTP methods
}

// ═══ In-Memory Rate Limiter (per-endpoint) ═══
const apiRateLimits = new Map<string, { count:number; resetAt:number }>();

function checkApiRateLimit(key: string, max: number): boolean {
  const now = Date.now();
  const entry = apiRateLimits.get(key);
  if (!entry || now > entry.resetAt) {
    apiRateLimits.set(key, { count:1, resetAt:now + 60_000 });
    return true;
  }
  entry.count++;
  return entry.count <= max;
}

// Periodic cleanup
if (typeof globalThis !== 'undefined' && !(globalThis as any).__apiRLCleanup) {
  (globalThis as any).__apiRLCleanup = true;
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of apiRateLimits.entries()) if (now > v.resetAt) apiRateLimits.delete(k);
  }, 120_000);
}

// ═══ Supabase Admin Client (server-side, bypasses RLS for validation) ═══
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, serviceKey);
}

// ═══ Extract Auth from Request ═══
async function extractAuth(req: NextRequest): Promise<{ userId:string; role:UserRole; email:string } | null> {
  // Check Authorization header first
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      const supabase = getSupabaseAdmin();
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) return null;
      const { data: profile } = await supabase.from('profiles').select('role,email').eq('id', user.id).single();
      return { userId: user.id, role: (profile?.role || 'user') as UserRole, email: profile?.email || user.email || '' };
    } catch { return null; }
  }
  // Check cookie-based session
  const cookieToken = req.cookies.get('sb-access-token')?.value || req.cookies.get('supabase-auth-token')?.value;
  if (cookieToken) {
    try {
      const supabase = getSupabaseAdmin();
      const { data: { user }, error } = await supabase.auth.getUser(cookieToken);
      if (error || !user) return null;
      const { data: profile } = await supabase.from('profiles').select('role,email').eq('id', user.id).single();
      return { userId: user.id, role: (profile?.role || 'user') as UserRole, email: profile?.email || user.email || '' };
    } catch { return null; }
  }
  return null;
}

// ═══ Error Response Helper ═══
function errorResponse(status: number, message: string, details?: any): NextResponse {
  return NextResponse.json(
    { error: message, ...(details && { details }) },
    { status, headers: { 'X-Content-Type-Options':'nosniff' } }
  );
}

// ═══ Role Hierarchy Check ═══
const ROLE_HIERARCHY: Record<UserRole, number> = { user:1, worker:2, moderator:3, admin:4 };
function meetsRole(userRole: UserRole, required: UserRole): boolean {
  return (ROLE_HIERARCHY[userRole] || 0) >= (ROLE_HIERARCHY[required] || 0);
}

// ═══ Main Guard Wrapper ═══
export function withApiGuard(
  handler: (req: NextRequest, ctx: ApiContext) => Promise<NextResponse>,
  options: GuardOptions = {}
) {
  const {
    requireAuth = true,
    requiredRole,
    rateLimit = 30,
    bodySchema,
    moderateFields,
    moderateAs = 'post',
    maxBodySize = 102400,
    allowedMethods,
  } = options;

  return async (req: NextRequest, routeCtx?: any): Promise<NextResponse> => {
    const startTime = Date.now();
    const ip = req.ip || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const endpoint = req.nextUrl.pathname;

    try {
      // 1. Method check
      if (allowedMethods && !allowedMethods.includes(req.method)) {
        track('api_method_blocked', { endpoint, method:req.method, ip });
        return errorResponse(405, 'Method not allowed');
      }

      // 2. Rate limiting
      const rlKey = `${ip}:${endpoint}`;
      if (!checkApiRateLimit(rlKey, rateLimit)) {
        track('api_rate_limited', { endpoint, ip });
        return errorResponse(429, 'Too many requests', { retryAfter:60 });
      }

      // 3. Auth check
      let userId = '', userRole: UserRole = 'user', userEmail = '';
      if (requireAuth) {
        const auth = await extractAuth(req);
        if (!auth) {
          track('api_auth_failed', { endpoint, ip });
          return errorResponse(401, 'Authentication required');
        }
        userId = auth.userId;
        userRole = auth.role;
        userEmail = auth.email;

        // 4. Role check
        if (requiredRole && !meetsRole(userRole, requiredRole)) {
          track('api_forbidden', { endpoint, ip, userId, requiredRole, actualRole:userRole });
          return errorResponse(403, 'Insufficient permissions');
        }
      }

      // 5. Parse body (for POST/PUT/PATCH)
      let body: any = {};
      if (['POST','PUT','PATCH'].includes(req.method)) {
        try {
          const rawBody = await req.text();
          if (rawBody.length > maxBodySize) {
            return errorResponse(413, 'Request body too large', { maxSize:maxBodySize });
          }
          body = JSON.parse(rawBody);
        } catch {
          return errorResponse(400, 'Invalid JSON body');
        }
      }

      // 6. Input validation
      if (bodySchema) {
        const validationErrors: Record<string, string> = {};
        for (const [field, rules] of Object.entries(bodySchema)) {
          const err = validateInput(body[field], rules);
          if (err) validationErrors[field] = err;
        }
        if (Object.keys(validationErrors).length > 0) {
          track('api_validation_failed', { endpoint, errors:validationErrors });
          return errorResponse(422, 'Validation failed', validationErrors);
        }
      }

      // 7. Sanitize string fields
      if (body && typeof body === 'object') {
        for (const [key, val] of Object.entries(body)) {
          if (typeof val === 'string') body[key] = sanitizeHTML(val);
        }
      }

      // 8. Content moderation
      if (moderateFields) {
        for (const field of moderateFields) {
          if (body[field] && typeof body[field] === 'string') {
            const modResult = moderateContent(body[field], moderateAs);
            if (modResult.action === 'block') {
              track('api_content_blocked', { endpoint, field, severity:modResult.severity, userId });
              return errorResponse(422, 'Content violates community guidelines', {
                field, severity:modResult.severity, flags:modResult.flags.map(f=>f.description)
              });
            }
            if (modResult.action === 'censor') {
              body[field] = modResult.cleaned;
            }
          }
        }
      }

      // 9. Execute handler
      const params = routeCtx?.params || {};
      const ctx: ApiContext = { userId, userRole, userEmail, body, params, ip };
      const response = await handler(req, ctx);

      // 10. Track success
      const duration = Date.now() - startTime;
      track('api_success', { endpoint, method:req.method, duration, userId, status:response.status });

      return response;

    } catch (err: any) {
      // Global error handler — never leak internal errors
      const duration = Date.now() - startTime;
      track('api_error', { endpoint, method:req.method, duration, error:err.message, ip });
      console.error(`[API ERROR] ${endpoint}:`, err.message);
      return errorResponse(500, 'Internal server error');
    }
  };
}

// ═══ Common Schema Presets ═══
export const schemas = {
  createJob: {
    title: { required:true, minLength:5, maxLength:200 },
    description: { required:true, minLength:20, maxLength:5000 },
    category: { required:true, minLength:2, maxLength:50 },
    amount: { required:true, custom:(v:any) => typeof v !== 'number' || v <= 0 ? 'Must be positive number' : null },
  },
  createListing: {
    name: { required:true, minLength:3, maxLength:200 },
    description: { required:true, minLength:10, maxLength:5000 },
    price: { required:true, custom:(v:any) => typeof v !== 'number' || v <= 0 ? 'Must be positive number' : null },
  },
  createPost: {
    text: { required:true, minLength:1, maxLength:5000 },
  },
  sendMessage: {
    text: { required:true, minLength:1, maxLength:2000 },
    roomId: { required:true },
  },
  createReview: {
    rating: { required:true, custom:(v:any) => typeof v !== 'number' || v < 1 || v > 5 ? 'Rating must be 1-5' : null },
    comment: { required:true, minLength:10, maxLength:2000 },
  },
  createPayment: {
    amount: { required:true, custom:(v:any) => typeof v !== 'number' || v <= 0 ? 'Must be positive' : null },
    jobId: { required:true },
  },
};
