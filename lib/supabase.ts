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
export async function getProfileStats(userId: string) {
  const { data } = await supabase.from('profile_stats').select('*').eq('id', userId).single();
  return data;
}

// ═══ POSTS ═══
export async function createPost(post: { user_id: string; content: string; media_urls?: string[]; media_type?: string; post_type?: string; visibility?: string; location_text?: string; location_lat?: number; location_lng?: number; hashtags?: string[] }) {
  return supabase.from('posts').insert({ visibility: 'public', post_type: 'text', ...post }).select().single();
}
export async function getPosts(visibility: string = 'public', limit: number = 50) {
  const { data } = await supabase.from('feed_posts').select('*').limit(limit);
  return data || [];
}
export async function getAllFeedPosts(limit: number = 50) {
  const { data } = await supabase.from('feed_posts').select('*').limit(limit);
  return data || [];
}
export async function getMyPosts(userId: string) {
  const { data } = await supabase.from('posts').select('*').eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data || [];
}
export async function deletePost(postId: string) { return supabase.from('posts').delete().eq('id', postId); }
export async function updatePost(postId: string, content: string) {
  return supabase.from('posts').update({ content }).eq('id', postId);
}

// ═══ LIKES (polymorphic: post, reel, comment, listing) ═══
export async function toggleLike(userId: string, targetId: string, targetType: string = 'post') {
  const { data: existing } = await supabase.from('likes').select('id').eq('user_id', userId).eq('target_id', targetId).eq('target_type', targetType).single();
  if (existing) { await supabase.from('likes').delete().eq('id', existing.id); return false; }
  else { await supabase.from('likes').insert({ user_id: userId, target_id: targetId, target_type: targetType }); return true; }
}
export async function getLikes(targetId: string, targetType: string = 'post') {
  const { data } = await supabase.from('likes').select('*').eq('target_id', targetId).eq('target_type', targetType);
  return data || [];
}

// ═══ COMMENTS (polymorphic: post, reel) ═══
export async function getComments(targetId: string, targetType: string = 'post') {
  const { data } = await supabase.from('comments').select('*, profiles:user_id(name, avatar_url)')
    .eq('target_id', targetId).eq('target_type', targetType).order('created_at', { ascending: true });
  return data || [];
}
export async function createComment(comment: { user_id: string; target_id: string; target_type: string; content: string; parent_id?: string }) {
  return supabase.from('comments').insert(comment).select().single();
}
export async function deleteComment(commentId: string) {
  return supabase.from('comments').delete().eq('id', commentId);
}

// ═══ FOLLOWS ═══
export async function followUser(followerId: string, followingId: string) {
  return supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });
}
export async function unfollowUser(followerId: string, followingId: string) {
  return supabase.from('follows').delete().eq('follower_id', followerId).eq('following_id', followingId);
}
export async function getFollowers(userId: string) {
  const { data } = await supabase.from('follows').select('*, profiles:follower_id(id, name, avatar_url, verified)').eq('following_id', userId);
  return data || [];
}
export async function getFollowing(userId: string) {
  const { data } = await supabase.from('follows').select('*, profiles:following_id(id, name, avatar_url, verified)').eq('follower_id', userId);
  return data || [];
}
export async function isFollowing(followerId: string, followingId: string) {
  const { data } = await supabase.from('follows').select('id').eq('follower_id', followerId).eq('following_id', followingId).single();
  return !!data;
}

// ═══ STORIES ═══
export async function createStory(story: { user_id: string; media_url: string; media_type: string; caption?: string; location_text?: string }) {
  const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  return supabase.from('stories').insert({ ...story, expires_at }).select().single();
}
export async function getStories() {
  const { data } = await supabase.from('stories').select('*, profiles:user_id(name, avatar_url)')
    .gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false });
  return data || [];
}

// ═══ REELS ═══
export async function createReel(reel: { user_id: string; video_url: string; thumbnail_url?: string; caption?: string; duration_seconds?: number; hashtags?: string[]; location_text?: string; location_lat?: number; location_lng?: number }) {
  return supabase.from('reels').insert(reel).select().single();
}
export async function getReels(limit: number = 20) {
  const { data } = await supabase.from('reels').select('*, profiles:user_id(name, avatar_url, verified)')
    .order('created_at', { ascending: false }).limit(limit);
  return data || [];
}

// ═══ SAVES / BOOKMARKS ═══
export async function toggleSave(userId: string, targetId: string, targetType: string = 'post') {
  const { data: existing } = await supabase.from('saves').select('id').eq('user_id', userId).eq('target_id', targetId).eq('target_type', targetType).single();
  if (existing) { await supabase.from('saves').delete().eq('id', existing.id); return false; }
  else { await supabase.from('saves').insert({ user_id: userId, target_id: targetId, target_type: targetType }); return true; }
}
export async function getSavedItems(userId: string) {
  const { data } = await supabase.from('saves').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
}

// ═══ USER BLOCKS ═══
export async function blockUser(blockerId: string, blockedId: string) {
  return supabase.from('user_blocks').insert({ blocker_id: blockerId, blocked_id: blockedId });
}
export async function unblockUser(blockerId: string, blockedId: string) {
  return supabase.from('user_blocks').delete().eq('blocker_id', blockerId).eq('blocked_id', blockedId);
}
export async function getBlockedUsers(userId: string) {
  const { data } = await supabase.from('user_blocks').select('*, profiles:blocked_id(id, name, avatar_url)').eq('blocker_id', userId);
  return data || [];
}

// ═══ REPORTS ═══
export async function reportContent(reporterId: string, targetId: string, targetType: string, reason: string, description?: string) {
  return supabase.from('reports').insert({ reporter_id: reporterId, target_id: targetId, target_type: targetType, reason, description });
}

// ═══ HASHTAGS ═══
export async function getTrendingHashtags(limit: number = 20) {
  const { data } = await supabase.from('hashtags').select('*').order('trending_score', { ascending: false }).limit(limit);
  return data || [];
}

// ═══ JOBS ═══
export async function createJob(job: any) {
  return supabase.from('jobs').insert(job).select().single();
}
export async function getJobs(filters: any = {}) {
  let q = supabase.from('jobs').select('*, profiles:customer_id(name, avatar_url)').eq('status', 'open');
  if (filters.category) q = q.eq('category_id', filters.category);
  q = q.order('created_at', { ascending: false }).limit(50);
  const { data } = await q; return data || [];
}
export async function getJob(id: string) {
  const { data } = await supabase.from('jobs').select('*, profiles:customer_id(name, avatar_url)').eq('id', id).single();
  return data;
}
export async function getMyJobs(userId: string) {
  const { data } = await supabase.from('jobs').select('*').eq('customer_id', userId).order('created_at', { ascending: false });
  return data || [];
}
export async function deleteJob(jobId: string) { return supabase.from('jobs').delete().eq('id', jobId); }
export async function updateJobStatus(jobId: string, status: string, workerId?: string) {
  const updates: any = { status }; if (workerId) updates.worker_id = workerId;
  return supabase.from('jobs').update(updates).eq('id', jobId);
}

// ═══ JOB APPLICATIONS ═══
export async function applyToJob(application: { job_id: string; provider_id: string; provider_name: string; message: string; proposed_amount?: number }) {
  return supabase.from('job_applications').insert(application).select().single();
}
export async function getJobApplications(jobId: string) {
  const { data } = await supabase.from('job_applications').select('*, profiles:provider_id(name, avatar_url)').eq('job_id', jobId);
  return data || [];
}

// ═══ LISTINGS (Marketplace) ═══
export async function createListing(listing: any) {
  return supabase.from('listings').insert(listing).select().single();
}
export async function getListings(filters: any = {}) {
  let q = supabase.from('listings').select('*, profiles:user_id(name, avatar_url)').eq('status', 'active');
  if (filters.category) q = q.eq('category', filters.category);
  q = q.order('created_at', { ascending: false }).limit(50);
  const { data } = await q; return data || [];
}
export async function getListing(id: string) {
  const { data } = await supabase.from('listings').select('*, profiles:user_id(name, avatar_url)').eq('id', id).single();
  return data;
}
export async function getMyListings(userId: string) {
  const { data } = await supabase.from('listings').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
}
export async function deleteListing(id: string) { return supabase.from('listings').delete().eq('id', id); }
export async function updateListing(id: string, updates: any) {
  return supabase.from('listings').update(updates).eq('id', id);
}

// ═══ WORKERS ═══
export async function searchWorkers(filters: any = {}) {
  let q = supabase.from('workers').select('*, profiles:id(name, avatar_url, city, rating, review_count, verified)');
  if (filters.available) q = q.eq('available', true);
  q = q.order('created_at', { ascending: false }).limit(50);
  const { data } = await q; return data || [];
}
export async function getWorker(id: string) {
  const { data } = await supabase.from('workers').select('*, profiles:id(name, avatar_url, city, rating, review_count, bio, verified, email, phone)').eq('id', id).single();
  return data;
}
export async function createWorkerProfile(worker: any) {
  return supabase.from('workers').insert(worker).select().single();
}
export async function updateWorkerProfile(userId: string, updates: any) {
  return supabase.from('workers').update(updates).eq('id', userId);
}
export async function getNearbyWorkers(lat: number, lng: number, radiusKm: number, skill?: string) {
  const { data } = await supabase.from('workers').select('*, profiles:id(name, avatar_url, city, lat, lng, rating, review_count, verified)').eq('available', true);
  if (!data) return [];
  return data.filter((w: any) => {
    if (!w.profiles?.lat || !w.profiles?.lng) return false;
    const dist = haversine(lat, lng, w.profiles.lat, w.profiles.lng);
    return dist <= radiusKm && (!skill || w.skills?.some((s: string) => s.toLowerCase().includes(skill.toLowerCase())));
  }).map((w: any) => ({ ...w, distance: haversine(lat, lng, w.profiles.lat, w.profiles.lng) }))
    .sort((a: any, b: any) => a.distance - b.distance);
}

// ═══ CHAT (with Realtime WebSocket) ═══
export async function getChatRooms(userId: string) {
  const { data } = await supabase.from('chat_rooms').select('*, p1:participant_1(name, avatar_url), p2:participant_2(name, avatar_url)')
    .or('participant_1.eq.' + userId + ',participant_2.eq.' + userId).order('last_message_at', { ascending: false });
  return data || [];
}
export async function getChatMessages(roomId: string) {
  const { data } = await supabase.from('messages').select('*').eq('chat_room_id', roomId).order('created_at', { ascending: true });
  return data || [];
}
export async function sendMessage(msg: { chat_room_id: string; sender_id: string; sender_name: string; content: string; msg_type?: string }) {
  const { data } = await supabase.from('messages').insert({ msg_type: 'text', ...msg }).select().single();
  await supabase.from('chat_rooms').update({ last_message: msg.content, last_message_at: new Date().toISOString() }).eq('id', msg.chat_room_id);
  return data;
}
export async function createChatRoom(user1Id: string, user2Id: string, bookingId?: string) {
  const { data: existing } = await supabase.from('chat_rooms').select('*')
    .or('and(participant_1.eq.' + user1Id + ',participant_2.eq.' + user2Id + '),and(participant_1.eq.' + user2Id + ',participant_2.eq.' + user1Id + ')').single();
  if (existing) return existing;
  const { data } = await supabase.from('chat_rooms').insert({ participant_1: user1Id, participant_2: user2Id, booking_id: bookingId }).select().single();
  return data;
}
export function subscribeToMessages(roomId: string, callback: (msg: any) => void) {
  return supabase.channel('room-' + roomId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: 'chat_room_id=eq.' + roomId }, (payload: any) => callback(payload.new))
    .subscribe();
}

// ═══ BOOKINGS ═══
export async function createBooking(booking: any) {
  return supabase.from('bookings').insert(booking).select().single();
}
export async function getMyBookings(userId: string) {
  const { data } = await supabase.from('bookings').select('*')
    .or('customer_id.eq.' + userId + ',worker_id.eq.' + userId)
    .order('created_at', { ascending: false });
  return data || [];
}
export async function updateBookingStatus(bookingId: string, status: string) {
  return supabase.from('bookings').update({ status, updated_at: new Date().toISOString() }).eq('id', bookingId);
}
export async function deleteBooking(bookingId: string) {
  return supabase.from('bookings').delete().eq('id', bookingId);
}

// ═══ REVIEWS ═══
export async function createReview(review: any) { return supabase.from('reviews').insert(review).select().single(); }
export async function getReviews(toUserId: string) {
  const { data } = await supabase.from('reviews').select('*, profiles:from_user_id(name, avatar_url)')
    .eq('to_user_id', toUserId).order('created_at', { ascending: false });
  return data || [];
}

// ═══ NOTIFICATIONS (with Realtime) ═══
export async function getNotifications(userId: string) {
  const { data } = await supabase.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(50);
  return data || [];
}
export async function markNotificationRead(id: string) { return supabase.from('notifications').update({ is_read: true }).eq('id', id); }
export async function markAllNotificationsRead(userId: string) { return supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false); }
export function subscribeToNotifications(userId: string, callback: (notif: any) => void) {
  return supabase.channel('notifs-' + userId)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: 'user_id=eq.' + userId }, (payload: any) => callback(payload.new))
    .subscribe();
}

// ═══ WALLET ═══
export async function getWalletBalance(userId: string) {
  const { data } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
  return data || { balance: 0, total_earned: 0, total_spent: 0, total_tips: 0, total_platform_fees: 0 };
}
export async function getTokenWallet(userId: string) {
  const { data } = await supabase.from('token_wallets').select('*').eq('user_id', userId).single();
  return data || { available_tokens: 0, escrowed_tokens: 0, total_earned: 0, total_spent: 0, social_credits: 0 };
}
export async function getTransactions(userId: string) {
  const { data } = await supabase.from('transactions').select('*')
    .or('payer_id.eq.' + userId + ',payee_id.eq.' + userId)
    .order('created_at', { ascending: false });
  return data || [];
}
export async function getTokenTransactions(userId: string) {
  const { data } = await supabase.from('token_transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
}

// ═══ EVENTS ═══
export async function getEvents() {
  const { data } = await supabase.from('events').select('*, profiles:organizer_id(name, avatar_url)')
    .gte('date', new Date().toISOString().split('T')[0]).order('date', { ascending: true });
  return data || [];
}
export async function createEvent(event: any) {
  return supabase.from('events').insert(event).select().single();
}
export async function joinEvent(eventId: string, userId: string) {
  return supabase.from('event_attendees').insert({ event_id: eventId, user_id: userId });
}
export async function leaveEvent(eventId: string, userId: string) {
  return supabase.from('event_attendees').delete().eq('event_id', eventId).eq('user_id', userId);
}

// ═══ COMMUNITIES ═══
export async function getCommunities() {
  const { data } = await supabase.from('communities').select('*').eq('is_public', true).order('member_count', { ascending: false });
  return data || [];
}
export async function getCommunity(id: string) {
  const { data } = await supabase.from('communities').select('*').eq('id', id).single();
  return data;
}
export async function createCommunity(community: any) { return supabase.from('communities').insert(community).select().single(); }
export async function joinCommunity(communityId: string, userId: string) {
  return supabase.from('community_members').insert({ community_id: communityId, user_id: userId });
}
export async function leaveCommunity(communityId: string, userId: string) {
  return supabase.from('community_members').delete().eq('community_id', communityId).eq('user_id', userId);
}

// ═══ BUDDY GROUPS ═══
export async function getBuddyGroups(userId: string) {
  const { data } = await supabase.from('buddy_group_members').select('*, buddy_groups(*)').eq('user_id', userId);
  return data?.map((d: any) => d.buddy_groups) || [];
}
export async function createBuddyGroup(group: any) { return supabase.from('buddy_groups').insert(group).select().single(); }
export async function joinBuddyGroup(groupId: string, userId: string) {
  return supabase.from('buddy_group_members').insert({ group_id: groupId, user_id: userId });
}
export async function leaveBuddyGroup(groupId: string, userId: string) {
  return supabase.from('buddy_group_members').delete().eq('group_id', groupId).eq('user_id', userId);
}

// ═══ VERIFICATIONS ═══
export async function submitVerification(verification: any) {
  return supabase.from('verifications').insert(verification).select().single();
}
export async function getVerification(userId: string) {
  const { data } = await supabase.from('verifications').select('*').eq('user_id', userId).order('submitted_at', { ascending: false }).limit(1).single();
  return data;
}

// ═══ QR SCANS ═══
export async function recordQRScan(scan: { worker_id: string; scanner_id: string; lat?: number; lng?: number }) {
  return supabase.from('qr_scans').insert(scan).select().single();
}

// ═══ TICKETS (Support) ═══
export async function createTicket(ticket: any) { return supabase.from('tickets').insert(ticket).select().single(); }
export async function getMyTickets(userId: string) {
  const { data } = await supabase.from('tickets').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  return data || [];
}

// ═══ CATEGORIES ═══
export async function getCategories() {
  const { data } = await supabase.from('categories').select('*').eq('active', true).order('sort_order', { ascending: true });
  return data || [];
}

// ═══ PUSH TOKENS ═══
export async function registerPushToken(userId: string, token: string, platform: string) {
  return supabase.from('push_tokens').upsert({ user_id: userId, token, platform }, { onConflict: 'user_id,token' });
}

// ═══ NEARBY POSTS (uses DB function) ═══
export async function getNearbyPosts(lat: number, lng: number, radiusKm: number = 25) {
  const { data } = await supabase.rpc('get_nearby_posts', { user_lat: lat, user_lng: lng, radius_km: radiusKm });
  return data || [];
}

// ═══ STORAGE (File Uploads to Supabase Storage) ═══
export async function uploadAvatar(userId: string, file: File, audience: string = 'public') {
  const ext = file.name.split('.').pop();
  const filePath = userId + '/' + audience + '_' + Date.now() + '.' + ext;
  const { error } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
  if (error) return { url: null, error };
  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
  await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', userId);
  return { url: publicUrl, error: null };
}
export async function uploadPostMedia(userId: string, file: File) {
  const filePath = userId + '/' + Date.now() + '_' + file.name;
  const { error } = await supabase.storage.from('postmedia').upload(filePath, file);
  if (error) return { url: null, error };
  const { data: { publicUrl } } = supabase.storage.from('postmedia').getPublicUrl(filePath);
  return { url: publicUrl, error: null };
}

// ═══ SERVICE PROFILES ═══
export async function getServiceProfile(userId: string) {
  const { data } = await supabase.from('service_profiles').select('*').eq('user_id', userId).single();
  return data;
}
export async function updateServiceProfile(userId: string, updates: any) {
  return supabase.from('service_profiles').update(updates).eq('user_id', userId);
}

// ═══ UTILS ═══
export function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; const dLat = (lat2 - lat1) * Math.PI / 180; const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
