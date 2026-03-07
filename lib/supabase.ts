import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
if (typeof window !== 'undefined' && (!url || !key)) console.warn('[Datore] Supabase credentials missing — check Vercel env vars');
export const supabase = createClient(url, key);

// ═══ AUTH ═══
export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/home' } });
}
export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}
export async function signUpWithEmail(email: string, password: string, full_name: string) {
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name } } });
  return { data, error };
}
export async function signOut() { return supabase.auth.signOut(); }
export async function getSession() { return supabase.auth.getSession(); }
export function onAuthStateChange(cb: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(cb);
}

// ═══ PROFILES ═══
export async function getProfile(userId: string) {
  const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
  return data;
}
export async function updateProfile(userId: string, updates: any) {
  return supabase.from('profiles').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', userId);
}

// ═══ POSTS (replaces localStorage datore-user-posts) ═══
export async function createPost(post: { author_id: string; author_name: string; text: string; text_cleaned?: string; audience?: string; type?: string; media_url?: string }) {
  return supabase.from('posts').insert({ audience: 'public', type: 'text', ...post }).select().single();
}
export async function getPosts(audience: string = 'public', limit: number = 50) {
  const { data } = await supabase.from('posts').select('*').eq('audience', audience)
    .order('created_at', { ascending: false }).limit(limit);
  return data || [];
}
export async function getAllFeedPosts(limit: number = 50) {
  const { data } = await supabase.from('posts').select('*')
    .order('created_at', { ascending: false }).limit(limit);
  return data || [];
}
export async function getMyPosts(userId: string) {
  const { data } = await supabase.from('posts').select('*').eq('author_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}
export async function deletePost(postId: string) { return supabase.from('posts').delete().eq('id', postId); }
export async function updatePost(postId: string, text: string, textCleaned?: string) {
  return supabase.from('posts').update({ text, text_cleaned: textCleaned || text }).eq('id', postId);
}

// ═══ LIKES ═══
export async function toggleLike(userId: string, postId: string) {
  const { data: existing } = await supabase.from('likes').select('id').eq('user_id', userId).eq('post_id', postId).single();
  if (existing) { await supabase.from('likes').delete().eq('id', existing.id); return false; }
  else { await supabase.from('likes').insert({ user_id: userId, post_id: postId }); return true; }
}

// ═══ COMMENTS (replaces localStorage datore-comments-*) ═══
export async function getComments(postId: string) {
  const { data } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
  return data || [];
}
export async function createComment(comment: { post_id: string; author_id: string; author_name: string; text: string }) {
  return supabase.from('comments').insert(comment).select().single();
}
export async function deleteComment(commentId: string) { return supabase.from('comments').delete().eq('id', commentId); }
export async function updateComment(commentId: string, text: string) {
  return supabase.from('comments').update({ text }).eq('id', commentId);
}

// ═══ JOBS ═══
export async function createJob(job: any) { return supabase.from('jobs').insert(job).select().single(); }
export async function getJobs(filters: any = {}) {
  let q = supabase.from('jobs').select('*').eq('status', 'open');
  if (filters.category) q = q.eq('category', filters.category);
  if (filters.urgency) q = q.eq('urgency', filters.urgency);
  q = q.order('created_at', { ascending: false }).limit(50);
  const { data } = await q; return data || [];
}
export async function getJob(id: string) {
  const { data } = await supabase.from('jobs').select('*').eq('id', id).single(); return data;
}
export async function getMyJobs(userId: string) {
  const { data } = await supabase.from('jobs').select('*').eq('poster_id', userId).order('created_at', { ascending: false });
  return data || [];
}
export async function deleteJob(jobId: string) { return supabase.from('jobs').delete().eq('id', jobId); }
export async function updateJobStatus(jobId: string, status: string, assignedTo?: string) {
  const updates: any = { status }; if (assignedTo) updates.assigned_to = assignedTo;
  return supabase.from('jobs').update(updates).eq('id', jobId);
}

// ═══ LISTINGS (Marketplace) ═══
export async function createListing(listing: any) { return supabase.from('listings').insert(listing).select().single(); }
export async function getListings(filters: any = {}) {
  let q = supabase.from('listings').select('*').eq('status', 'active');
  if (filters.category) q = q.eq('category', filters.category);
  q = q.order('created_at', { ascending: false }).limit(50);
  const { data } = await q; return data || [];
}
export async function getListing(id: string) {
  const { data } = await supabase.from('listings').select('*').eq('id', id).single(); return data;
}
export async function getMyListings(userId: string) {
  const { data } = await supabase.from('listings').select('*').eq('seller_id', userId).order('created_at', { ascending: false });
  return data || [];
}
export async function deleteListing(id: string) { return supabase.from('listings').delete().eq('id', id); }
export async function updateListing(id: string, updates: any) {
  return supabase.from('listings').update(updates).eq('id', id);
}

// ═══ REELS ═══
export async function createReel(reel: { author_id: string; author_name: string; caption: string; duration?: string; filter?: string; music?: string; hashtags?: string[]; audience?: string; media_url?: string }) {
  return supabase.from('reels').insert({ audience: 'public', ...reel }).select().single();
}
export async function getReels(limit: number = 50) {
  const { data } = await supabase.from('reels').select('*').order('created_at', { ascending: false }).limit(limit);
  return data || [];
}
export async function getMyReels(userId: string) {
  const { data } = await supabase.from('reels').select('*').eq('author_id', userId).order('created_at', { ascending: false });
  return data || [];
}
export async function deleteReel(id: string) { return supabase.from('reels').delete().eq('id', id); }
export async function updateReel(id: string, updates: { caption?: string }) {
  return supabase.from('reels').update(updates).eq('id', id);
}

// ═══ STATUSES ═══
export async function createStatus(status: { author_id: string; text: string; background?: string }) {
  return supabase.from('statuses').insert(status).select().single();
}
export async function getStatuses(limit: number = 50) {
  const { data } = await supabase.from('statuses').select('*').order('created_at', { ascending: false }).limit(limit);
  return data || [];
}
export async function getMyStatuses(userId: string) {
  const { data } = await supabase.from('statuses').select('*').eq('author_id', userId).order('created_at', { ascending: false });
  return data || [];
}
export async function deleteStatus(id: string) { return supabase.from('statuses').delete().eq('id', id); }
export async function updateStatus(id: string, text: string) {
  return supabase.from('statuses').update({ text }).eq('id', id);
}

// ═══ WORKERS ═══
export async function searchWorkers(filters: any = {}) {
  let q = supabase.from('worker_profiles').select('*');
  if (filters.category) q = q.contains('categories', [filters.category]);
  if (filters.skill) q = q.contains('skills', [filters.skill]);
  if (filters.minRating) q = q.gte('rating', filters.minRating);
  if (filters.availability) q = q.eq('availability', filters.availability);
  q = q.order('rating', { ascending: false }).limit(50);
  const { data } = await q; return data || [];
}
export async function getWorker(id: string) {
  const { data } = await supabase.from('worker_profiles').select('*').eq('id', id).single(); return data;
}
export async function updateWorkerAvailability(userId: string, availability: string) {
  return supabase.from('worker_profiles').update({ availability }).eq('user_id', userId);
}
export async function getNearbyWorkers(lat: number, lng: number, radiusKm: number, skill?: string) {
  const { data } = await supabase.from('worker_profiles').select('*').eq('availability', 'available');
  if (!data) return [];
  return data.filter((w: any) => {
    const dist = haversine(lat, lng, w.location_lat, w.location_lng);
    return dist <= radiusKm && (!skill || w.skills?.some((s: string) => s.toLowerCase().includes(skill.toLowerCase())));
  }).map((w: any) => ({ ...w, distance: haversine(lat, lng, w.location_lat, w.location_lng) }))
    .sort((a: any, b: any) => a.distance - b.distance);
}

// ═══ CHAT (with Realtime WebSocket) ═══
export async function getChatRooms(userId: string) {
  const { data } = await supabase.from('chat_rooms').select('*')
    .or('user1_id.eq.' + userId + ',user2_id.eq.' + userId).order('updated_at', { ascending: false });
  return data || [];
}
export async function getChatMessages(roomId: string) {
  const { data } = await supabase.from('messages').select('*').eq('room_id', roomId).order('created_at', { ascending: true });
  return data || [];
}
export async function sendMessage(msg: { room_id: string; sender_id: string; sender_name: string; content: string }) {
  const { data } = await supabase.from('messages').insert(msg).select().single();
  await supabase.from('chat_rooms').update({ last_message: msg.content, last_message_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', msg.room_id);
  return data;
}
export async function createChatRoom(user1Id: string, user2Id: string, jobId?: string) {
  const { data: existing } = await supabase.from('chat_rooms').select('*')
    .or('and(user1_id.eq.' + user1Id + ',user2_id.eq.' + user2Id + '),and(user1_id.eq.' + user2Id + ',user2_id.eq.' + user1Id + ')').single();
  if (existing) return existing;
  const { data } = await supabase.from('chat_rooms').insert({ user1_id: user1Id, user2_id: user2Id, job_id: jobId }).select().single();
  return data;
}
export async function deleteMessage(messageId: string) { return supabase.from('messages').delete().eq('id', messageId); }
export async function updateMessage(messageId: string, content: string) {
  return supabase.from('messages').update({ content, edited: true }).eq('id', messageId);
}
export function subscribeToMessages(roomId: string, callback: (msg: any) => void) {
  return supabase.channel('room-' + roomId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'room_id=eq.' + roomId }, (payload: any) => callback(payload.new))
    .subscribe();
}

// ═══ ORDERS (replaces localStorage datore-orders) ═══
export async function createOrder(order: { user_id: string; items: any[]; total: number; pay_method: string; shipping_address?: any }) {
  return supabase.from('orders').insert({ ...order, status: 'confirmed' }).select().single();
}
export async function getMyOrders(userId: string) {
  const { data } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
}
export async function updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
  const updates: any = { status }; if (trackingNumber) updates.tracking_number = trackingNumber;
  return supabase.from('orders').update(updates).eq('id', orderId);
}

// ═══ BOOKINGS (replaces localStorage datore-bookings) ═══
export async function createBooking(booking: { user_id: string; name: string; type: string; price: string; provider: string; pay_method: string; confirmation_code: string }) {
  return supabase.from('bookings').insert({ ...booking, status: 'confirmed' }).select().single();
}
export async function getMyBookings(userId: string) {
  const { data } = await supabase.from('bookings').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
}

// ═══ REVIEWS ═══
export async function createReview(review: any) { return supabase.from('reviews').insert(review).select().single(); }
export async function getReviews(targetId: string) {
  const { data } = await supabase.from('reviews').select('*').eq('target_id', targetId).order('created_at', { ascending: false });
  return data || [];
}

// ═══ NOTIFICATIONS (with Realtime) ═══
export async function getNotifications(userId: string) {
  const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
  return data || [];
}
export async function markNotificationRead(id: string) { return supabase.from('notifications').update({ is_read: true }).eq('id', id); }
export function subscribeToNotifications(userId: string, callback: (notif: any) => void) {
  return supabase.channel('notifs-' + userId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: 'user_id=eq.' + userId }, (payload: any) => callback(payload.new))
    .subscribe();
}

// ═══ WALLET ═══
export async function getWalletBalance(userId: string) {
  const { data } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
  return data || { available: 0, escrowed: 0, pending: 0 };
}
export async function getTransactions(userId: string) {
  const { data } = await supabase.from('wallet_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
}
export async function addWalletTokens(userId: string, amount: number) {
  const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
  const newAvailable = (wallet?.available || 0) + amount;
  await supabase.from('wallets').upsert({ user_id: userId, available: newAvailable, escrowed: wallet?.escrowed || 0, pending: wallet?.pending || 0 }, { onConflict: 'user_id' });
  await supabase.from('wallet_transactions').insert({ user_id: userId, type: 'purchase', description: `Token Purchase (+$${amount})`, amount });
  return { available: newAvailable, escrowed: wallet?.escrowed || 0, pending: wallet?.pending || 0, earned: newAvailable + (wallet?.escrowed || 0) };
}
export async function withdrawWalletTokens(userId: string, amount: number) {
  const { data: wallet } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
  if (!wallet || wallet.available < amount) return { error: 'Insufficient balance' };
  const newAvailable = wallet.available - amount;
  const newPending = (wallet.pending || 0) + amount;
  await supabase.from('wallets').update({ available: newAvailable, pending: newPending }).eq('user_id', userId);
  await supabase.from('wallet_transactions').insert({ user_id: userId, type: 'withdraw', description: 'Withdrawal to bank', amount: -amount });
  return { available: newAvailable, escrowed: wallet.escrowed || 0, pending: newPending, earned: newAvailable + (wallet.escrowed || 0) };
}

// ═══ FRIENDS ═══
export async function sendFriendRequest(fromId: string, toId: string) {
  return supabase.from('friend_requests').insert({ from_user_id: fromId, to_user_id: toId, status: 'pending' });
}
export async function respondFriendRequest(requestId: string, accept: boolean) {
  return supabase.from('friend_requests').update({ status: accept ? 'accepted' : 'rejected' }).eq('id', requestId);
}
export async function getFriends(userId: string) {
  const { data } = await supabase.from('friend_requests').select('*')
    .eq('status', 'accepted').or('from_user_id.eq.' + userId + ',to_user_id.eq.' + userId);
  return data || [];
}
export async function getFriendRequests(userId: string) {
  const { data } = await supabase.from('friend_requests').select('*').eq('to_user_id', userId).eq('status', 'pending');
  return data || [];
}

// ═══ COMMUNITIES ═══
export async function getCommunities() {
  const { data } = await supabase.from('communities').select('*').eq('is_public', true).order('member_count', { ascending: false });
  return data || [];
}
export async function createCommunity(community: any) { return supabase.from('communities').insert(community).select().single(); }
export async function deleteCommunity(id: string) { return supabase.from('communities').delete().eq('id', id); }
export async function updateCommunity(id: string, updates: { name?: string; description?: string }) {
  return supabase.from('communities').update(updates).eq('id', id);
}

// ═══ BUDDY GROUPS ═══
export async function getBuddyGroups(userId: string) {
  const { data } = await supabase.from('buddy_groups').select('*').contains('member_ids', [userId]);
  return data || [];
}
export async function createBuddyGroup(group: any) { return supabase.from('buddy_groups').insert(group).select().single(); }
export async function deleteBuddyGroup(id: string) { return supabase.from('buddy_groups').delete().eq('id', id); }

// ═══ STORAGE (File Uploads to Supabase Storage) ═══
export async function uploadAvatar(userId: string, file: File, audience: string = 'public') {
  const ext = file.name.split('.').pop();
  const filePath = userId + '/' + audience + '_' + Date.now() + '.' + ext;
  const { error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
  if (error) return { url: null, error };
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
  await supabase.from('profiles').update({ ['avatar_' + audience]: publicUrl, avatar_url: publicUrl }).eq('id', userId);
  return { url: publicUrl, error: null };
}
export async function uploadPostMedia(userId: string, file: File) {
  const filePath = userId + '/' + Date.now() + '_' + file.name;
  const { error } = await supabase.storage.from('postmedia').upload(filePath, file);
  if (error) return { url: null, error };
  const { data: { publicUrl } } = supabase.storage.from('postmedia').getPublicUrl(filePath);
  return { url: publicUrl, error: null };
}

// ═══ CONSENT (GDPR/PIPEDA) ═══
export async function recordConsent(userId: string, purpose: string, granted: boolean, legalBasis: string = 'consent') {
  return supabase.from('consent_records').insert({ user_id: userId, purpose, granted, legal_basis: legalBasis });
}
export async function submitDSR(userId: string, type: string, details: string) {
  const deadline = new Date(); deadline.setDate(deadline.getDate() + 30);
  return supabase.from('data_subject_requests').insert({ user_id: userId, type, details, deadline: deadline.toISOString() });
}

// ═══ UTILS ═══
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
