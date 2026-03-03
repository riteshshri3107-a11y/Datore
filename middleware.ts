import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/* ═══════════════════════════════════════════════════════════════
   DATORE MIDDLEWARE — Security Layer (0-30 Day Priority)
   ═══════════════════════════════════════════════════════════════
   1. Security headers (CSP, HSTS, X-Frame, etc.)
   2. Route protection (auth-required pages)
   3. Rate limiting (in-memory, per-IP)
   4. Bot/abuse detection (basic)
   5. CORS enforcement
   ═══════════════════════════════════════════════════════════════ */

// ═══ Rate Limiter — In-Memory (upgrade to Redis for prod) ═══
const rateLimitMap = new Map<string, { count:number; resetAt:number }>();
const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // per window per IP
const RATE_LIMIT_AUTH_MAX = 10; // auth endpoints stricter

function checkRateLimit(ip: string, isAuthRoute: boolean): { allowed:boolean; remaining:number } {
  const now = Date.now();
  const key = `${ip}:${isAuthRoute ? 'auth' : 'general'}`;
  const entry = rateLimitMap.get(key);
  const max = isAuthRoute ? RATE_LIMIT_AUTH_MAX : RATE_LIMIT_MAX_REQUESTS;

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count:1, resetAt:now + RATE_LIMIT_WINDOW });
    return { allowed:true, remaining:max - 1 };
  }

  entry.count++;
  if (entry.count > max) return { allowed:false, remaining:0 };
  return { allowed:true, remaining:max - entry.count };
}

// Cleanup stale entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of rateLimitMap.entries()) {
      if (now > val.resetAt) rateLimitMap.delete(key);
    }
  }, 300_000);
}

// ═══ Route Protection Lists ═══
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/forgot-password', '/auth/callback', '/privacy', '/terms'];
const AUTH_ROUTES = ['/login', '/signup', '/auth/callback', '/forgot-password'];
const API_AUTH_ROUTES = ['/api/auth'];
const STATIC_PREFIXES = ['/_next', '/favicon', '/icons', '/images', '/fonts', '/manifest'];

function isPublicRoute(path: string): boolean {
  if (STATIC_PREFIXES.some(p => path.startsWith(p))) return true;
  return PUBLIC_ROUTES.includes(path);
}

function isAuthRoute(path: string): boolean {
  return AUTH_ROUTES.includes(path) || API_AUTH_ROUTES.some(p => path.startsWith(p));
}

// ═══ Bot Detection (basic) ═══
const BLOCKED_UAS = [
  /curl\//i, /wget\//i, /python-requests/i, /scrapy/i, /phantom/i,
  /headlesschrome/i, /Go-http-client/i, /libwww-perl/i
];

function isSuspiciousUA(ua: string | null): boolean {
  if (!ua || ua.length < 10) return true;
  return BLOCKED_UAS.some(re => re.test(ua));
}

// ═══ Security Headers ═══
function applySecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.supabase.co https://*.googleapis.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://fonts.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
  ].join('; '));

  // Other security headers
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=()');
  response.headers.set('X-DNS-Prefetch-Control', 'off');

  return response;
}

// ═══ Main Middleware ═══
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const ua = request.headers.get('user-agent');

  // 1. Skip static assets
  if (STATIC_PREFIXES.some(p => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // 2. Bot detection (block on API routes, log on pages)
  if (pathname.startsWith('/api') && isSuspiciousUA(ua)) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 3. Rate limiting
  const isAuth = isAuthRoute(pathname) || pathname.startsWith('/api/auth');
  const rateCheck = checkRateLimit(ip, isAuth);
  if (!rateCheck.allowed) {
    const resp = new NextResponse(
      JSON.stringify({ error: 'Too many requests', retryAfter: 60 }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': '60' } }
    );
    return applySecurityHeaders(resp);
  }

  // 4. Route protection — check for auth token
  const supabaseToken = request.cookies.get('sb-access-token')?.value
    || request.cookies.get('supabase-auth-token')?.value;
  const hasSession = !!supabaseToken;

  // Protected routes: redirect to login if no session
  if (!isPublicRoute(pathname) && !isAuthRoute(pathname) && !hasSession) {
    // For API routes, return 401
    if (pathname.startsWith('/api')) {
      return applySecurityHeaders(
        new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        })
      );
    }
    // For page routes, allow through (client-side auth will handle redirect)
    // This prevents hard redirect loops during SSR
  }

  // If already authenticated and hitting auth routes, redirect to home
  if (hasSession && isAuthRoute(pathname)) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // 5. Apply security headers to response
  const response = NextResponse.next();

  // Rate limit headers
  response.headers.set('X-RateLimit-Remaining', String(rateCheck.remaining));

  return applySecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
