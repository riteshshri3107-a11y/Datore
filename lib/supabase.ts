import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
export const supabase = createClient(url, key);

// AUTH
export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${window.location.origin}/home` } });
}
export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}
export async function signUpWithEmail(email: string, password: string, full_name: string) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name } } });
  if (data.user && !error) {
    await supabase.from('profiles').upsert({ id: data.user.id, email, full_name, role: 'user', trust_score: 50 });
  }
  return { data, error };
}
export async function signOut() { return supabase.auth.signOut(); }
export async function getSession() { return supabase.auth.getSession(); }

// PROFILES
export async function getProfile(userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data;
}
export async function updateProfile(userId: string, updates: any) {
  return supabase.from('profiles').upsert({ id: userId, ...updates });
}

// WORKERS
export async function searchWorkers(filters: any = {}) {
  let q = supabase.from('worker_profiles').select('*');
  if (filters.category) q = q.contains('categories', [filters.category]);
  if (filters.skill) q = q.contains('skills', [filters.skill]);
  if (filters.minRating) q = q.gte('rating', filters.minRating);
  if (filters.availability) q = q.eq('availability', filters.availability);
  q = q.order('rating', { ascending: false }).limit(50);
  const { data } = await q;
  return data || [];
}
export async function getWorker(id: string) {
  const { data } = await supabase.from('worker_profiles').select('*').eq('id', id).single();
  return data;
}
export async function updateWorkerAvailability(userId: string, availability: string) {
  return supabase.from('worker_profiles').update({ availability }).eq('user_id', userId);
}
export async function getNearbyWorkers(lat: number, lng: number, radiusKm: number, skill?: string) {
  let { data } = await supabase.from('worker_profiles').select('*').eq('availability', 'available');
  if (!data) return [];
  return data.filter((w: any) => {
    const dist = haversine(lat, lng, w.location_lat, w.location_lng);
    const matchSkill = !skill || w.skills?.some((s: string) => s.toLowerCase().includes(skill.toLowerCase()));
    return dist <= radiusKm && matchSkill;
  }).map((w: any) => ({ ...w, distance: haversine(lat, lng, w.location_lat, w.location_lng) }))
    .sort((a: any, b: any) => a.distance - b.distance);
}

// JOBS
export async function createJob(job: any) {
  return supabase.from('jobs').insert(job).select().single();
}
export async function getJobs(filters: any = {}) {
  let q = supabase.from('jobs').select('*').eq('status', 'open');
  if (filters.category) q = q.eq('category', filters.category);
  if (filters.urgency) q = q.eq('urgency', filters.urgency);
  q = q.order('created_at', { ascending: false }).limit(50);
  const { data } = await q;
  return data || [];
}
export async function getJob(id: string) {
  const { data } = await supabase.from('jobs').select('*').eq('id', id).single();
  return data;
}
export async function getMyJobs(userId: string) {
  const { data } = await supabase.from('jobs').select('*').eq('poster_id', userId).order('created_at', { ascending: false });
  return data || [];
}
export async function updateJobStatus(jobId: string, status: string, assignedTo?: string) {
  const updates: any = { status };
  if (assignedTo) updates.assigned_to = assignedTo;
  return supabase.from('jobs').update(updates).eq('id', jobId);
}

// LISTINGS
export async function createListing(listing: any) {
  return supabase.from('listings').insert(listing).select().single();
}
export async function getListings(filters: any = {}) {
  let q = supabase.from('listings').select('*').eq('status', 'active');
  if (filters.category) q = q.eq('category', filters.category);
  q = q.order('created_at', { ascending: false }).limit(50);
  const { data } = await q;
  return data || [];
}
export async function getListing(id: string) {
  const { data } = await supabase.from('listings').select('*').eq('id', id).single();
  return data;
}
export async function getMyListings(userId: string) {
  const { data } = await supabase.from('listings').select('*').eq('seller_id', userId).order('created_at', { ascending: false });
  return data || [];
}

// CHAT
export async function getChatRooms(userId: string) {
  const { data } = await supabase.from('chat_rooms').select('*').or(`user1_id.eq.${userId},user2_id.eq.${userId}`).order('updated_at', { ascending: false });
  return data || [];
}
export async function getChatMessages(roomId: string) {
  const { data } = await supabase.from('messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true });
  return data || [];
}
export async function sendMessage(msg: any) {
  return supabase.from('messages').insert(msg);
}
export async function createChatRoom(user1Id: string, user2Id: string, jobId?: string) {
  const existing = await supabase.from('chat_rooms').select('*')
    .or(`and(user1_id.eq.${user1Id},user2_id.eq.${user2Id}),and(user1_id.eq.${user2Id},user2_id.eq.${user1Id})`).single();
  if (existing.data) return existing.data;
  const { data } = await supabase.from('chat_rooms').insert({ user1_id: user1Id, user2_id: user2Id, job_id: jobId }).select().single();
  return data;
}

// REVIEWS
export async function createReview(review: any) {
  const { data, error } = await supabase.from('reviews').insert(review).select().single();
  if (!error) { /* update average rating on worker_profiles */ }
  return { data, error };
}
export async function getReviews(targetId: string) {
  const { data } = await supabase.from('reviews').select('*').eq('target_id', targetId).order('created_at', { ascending: false });
  return data || [];
}

// WALLET
export async function getWalletBalance(userId: string) {
  const { data } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
  return data || { available: 0, escrowed: 0, pending: 0 };
}
export async function getTransactions(userId: string) {
  const { data } = await supabase.from('wallet_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
}

// NOTIFICATIONS
export async function getNotifications(userId: string) {
  const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
  return data || [];
}
export async function markNotificationRead(id: string) {
  return supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

// UTILS
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
