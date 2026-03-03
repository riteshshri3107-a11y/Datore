import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function getAuthUser(req: Request) {
  const auth = req.headers.get('authorization');
  const cookie = req.headers.get('cookie');
  let token = '';
  if (auth?.startsWith('Bearer ')) token = auth.slice(7);
  else if (cookie) {
    const m = cookie.match(/sb-[^=]+-auth-token=([^;]+)/);
    if (m) { try { const p = JSON.parse(decodeURIComponent(m[1])); token = p?.[0] || p?.access_token || ''; } catch { token = m[1]; } }
  }
  if (!token) return null;
  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;
  const { data: profile } = await supabaseAdmin.from('profiles')
    .select('role, trust_score, full_name, is_verified').eq('id', user.id).single();
  return { id: user.id, email: user.email || '', role: profile?.role || 'user',
    trustScore: profile?.trust_score || 0, name: profile?.full_name || '', verified: profile?.is_verified || false };
}

export async function createNotification(userId: string, title: string, msg: string, type = 'system', link?: string) {
  return supabaseAdmin.from('notifications').insert({ user_id: userId, title, message: msg, type, link, is_read: false });
}

export async function logModeration(cType: string, cId: string, authorId: string, orig: string, cleaned: string, severity: string, action: string, flags: any[]) {
  return supabaseAdmin.from('moderation_queue').insert({
    content_type: cType, content_id: cId, author_id: authorId,
    original_text: orig, cleaned_text: cleaned, severity, action, flags,
    status: action === 'block' ? 'rejected' : 'pending',
  });
}
