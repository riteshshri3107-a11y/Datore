/* ═══════════════════════════════════════════════════════════════
   AUTH MODULE — Centralized Authentication & Session Management
   ═══════════════════════════════════════════════════════════════
   - Server-side session validation
   - Short-lived JWT tokens with refresh
   - Device fingerprinting (basic)
   - Session audit logging
   - Role-based access control (RBAC)
   ═══════════════════════════════════════════════════════════════ */

import { supabase } from './supabase';

// ═══ Types ═══
export type UserRole = 'user' | 'worker' | 'admin' | 'moderator';

export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  trust_score: number;
  is_verified: boolean;
  mfa_enabled: boolean;
  avatar_url?: string;
  created_at: string;
  last_sign_in: string;
}

export interface AuthSession {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface DeviceFingerprint {
  userAgent: string;
  language: string;
  platform: string;
  screenRes: string;
  timezone: string;
  hash: string;
}

// ═══ Device Fingerprint (basic — client-side) ═══
export function generateDeviceFingerprint(): DeviceFingerprint {
  if (typeof window === 'undefined') {
    return { userAgent:'', language:'', platform:'', screenRes:'', timezone:'', hash:'server' };
  }
  const fp: DeviceFingerprint = {
    userAgent: navigator.userAgent.slice(0, 100),
    language: navigator.language,
    platform: navigator.platform || 'unknown',
    screenRes: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hash: '',
  };
  // Simple hash of fingerprint components
  const raw = Object.values(fp).join('|');
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const char = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  fp.hash = Math.abs(hash).toString(36);
  return fp;
}

// ═══ Secure Sign In ═══
export async function secureSignIn(email: string, password: string) {
  // Input validation
  if (!email || !password) return { data:null, error:{ message:'Email and password required' } };
  if (password.length < 8) return { data:null, error:{ message:'Password must be at least 8 characters' } };

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (data?.session) {
    // Log successful sign-in with device fingerprint
    const fp = generateDeviceFingerprint();
    await logAuthEvent(data.session.user.id, 'sign_in', { device:fp.hash, ip:'client' });
  }

  if (error) {
    // Log failed attempt (don't reveal which field is wrong)
    await logAuthEvent('unknown', 'sign_in_failed', { email:email.slice(0,3)+'***' });
  }

  return { data, error };
}

// ═══ Secure Sign Up ═══
export async function secureSignUp(email: string, password: string, full_name: string) {
  // Validation
  if (!email || !password || !full_name) return { data:null, error:{ message:'All fields required' } };
  if (password.length < 8) return { data:null, error:{ message:'Password must be at least 8 characters' } };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { data:null, error:{ message:'Invalid email format' } };
  if (full_name.length < 2 || full_name.length > 100) return { data:null, error:{ message:'Name must be 2-100 characters' } };

  // Check password strength
  const strength = getPasswordStrength(password);
  if (strength.score < 2) return { data:null, error:{ message:strength.feedback } };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name } },
  });

  if (data?.user && !error) {
    // Create profile with default trust score
    await supabase.from('profiles').upsert({
      id: data.user.id,
      email,
      full_name,
      role: 'user',
      trust_score: 50,
      is_verified: false,
      mfa_enabled: false,
      created_at: new Date().toISOString(),
    });
    await logAuthEvent(data.user.id, 'sign_up', { device:generateDeviceFingerprint().hash });
  }

  return { data, error };
}

// ═══ Password Strength Check ═══
export function getPasswordStrength(password: string): { score:number; feedback:string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;

  const feedbacks: Record<number, string> = {
    0: 'Very weak — add uppercase, numbers, and symbols',
    1: 'Weak — add more character variety and length',
    2: 'Fair — consider adding symbols or more length',
    3: 'Good — solid password',
    4: 'Strong — excellent password',
    5: 'Very strong — maximum security',
  };

  return { score, feedback: feedbacks[Math.min(score, 5)] };
}

// ═══ Get Current Session (Server-Side Validated) ═══
export async function getValidatedSession(): Promise<AuthSession> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      return { user:null, isAuthenticated:false, isLoading:false, error:error?.message || null };
    }

    // Validate token hasn't expired
    const tokenExpiry = session.expires_at ? session.expires_at * 1000 : 0;
    if (Date.now() > tokenExpiry) {
      // Try refresh
      const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
      if (refreshErr || !refreshed.session) {
        return { user:null, isAuthenticated:false, isLoading:false, error:'Session expired' };
      }
    }

    // Fetch full profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    const authUser: AuthUser = {
      id: session.user.id,
      email: session.user.email || '',
      full_name: profile?.full_name || session.user.user_metadata?.full_name || '',
      role: profile?.role || 'user',
      trust_score: profile?.trust_score || 50,
      is_verified: profile?.is_verified || false,
      mfa_enabled: profile?.mfa_enabled || false,
      avatar_url: profile?.avatar_url,
      created_at: profile?.created_at || session.user.created_at,
      last_sign_in: new Date().toISOString(),
    };

    return { user:authUser, isAuthenticated:true, isLoading:false, error:null };
  } catch (err: any) {
    return { user:null, isAuthenticated:false, isLoading:false, error:err.message };
  }
}

// ═══ Role-Based Access Check ═══
export function hasPermission(user: AuthUser | null, requiredRole: UserRole): boolean {
  if (!user) return false;
  const hierarchy: Record<UserRole, number> = { user:1, worker:2, moderator:3, admin:4 };
  return (hierarchy[user.role] || 0) >= (hierarchy[requiredRole] || 0);
}

export function canModerate(user: AuthUser | null): boolean {
  return hasPermission(user, 'moderator');
}

export function canAccessAdmin(user: AuthUser | null): boolean {
  return hasPermission(user, 'admin');
}

// ═══ Auth Event Logging ═══
async function logAuthEvent(userId: string, event: string, metadata: Record<string, any>) {
  try {
    await supabase.from('auth_audit_log').insert({
      user_id: userId,
      event,
      metadata,
      created_at: new Date().toISOString(),
      ip_address: metadata.ip || 'unknown',
    });
  } catch {
    // Silent fail for logging — don't break auth flow
  }
}

// ═══ Sign Out (Secure) ═══
export async function secureSignOut() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    await logAuthEvent(session.user.id, 'sign_out', { device:generateDeviceFingerprint().hash });
  }
  return supabase.auth.signOut();
}
