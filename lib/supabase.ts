import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Auth ───
export async function signUpWithEmail(email: string, password: string, metadata?: Record<string, string>) {
  return supabase.auth.signUp({ email, password, options: { data: metadata } });
}
export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}
export async function signInWithPhone(phone: string) {
  return supabase.auth.signInWithOtp({ phone });
}
export async function verifyPhoneOtp(phone: string, token: string) {
  return supabase.auth.verifyOtp({ phone, token, type: "sms" });
}
export async function signInWithGoogle() {
  return supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/home` } });
}
export async function signOut() {
  return supabase.auth.signOut();
}
export async function getSession() {
  return supabase.auth.getSession();
}
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

// ─── Profiles ───
export async function getProfile(userId: string) {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
}
export async function updateProfile(userId: string, updates: Record<string, any>) {
  return supabase.from("profiles").update({ ...updates, updated_at: new Date().toISOString() }).eq("id", userId);
}

// ─── Workers ───
export async function getWorker(workerId: string) {
  const { data } = await supabase.from("workers").select("*, profiles(*)").eq("id", workerId).single();
  return data;
}
export async function searchWorkers(filters: {
  category?: string; query?: string; verified?: boolean; licensed?: boolean;
  minPrice?: number; maxPrice?: number; minRating?: number; sortBy?: string;
}) {
  let q = supabase.from("workers").select("*, profiles(*)").eq("available", true);
  if (filters.category) q = q.contains("categories", [filters.category]);
  if (filters.licensed) q = q.eq("licensed", true);
  if (filters.minPrice) q = q.gte("hourly_rate", filters.minPrice);
  if (filters.maxPrice) q = q.lte("hourly_rate", filters.maxPrice);
  if (filters.sortBy === "price_asc") q = q.order("hourly_rate", { ascending: true });
  else if (filters.sortBy === "price_desc") q = q.order("hourly_rate", { ascending: false });
  else q = q.order("hourly_rate", { ascending: true }); // default
  q = q.limit(50);
  const { data } = await q;
  let workers = data || [];
  // Client-side filtering for profile fields
  if (filters.verified) workers = workers.filter((w: any) => w.profiles?.verified);
  if (filters.minRating) workers = workers.filter((w: any) => (w.profiles?.rating || 0) >= filters.minRating!);
  if (filters.query) {
    const s = filters.query.toLowerCase();
    workers = workers.filter((w: any) =>
      w.profiles?.name?.toLowerCase().includes(s) ||
      JSON.stringify(w.skills || []).toLowerCase().includes(s)
    );
  }
  return workers;
}
export async function createWorkerProfile(userId: string, data: Record<string, any>) {
  return supabase.from("workers").upsert({ id: userId, ...data });
}

// ─── Categories ───
export async function getCategories() {
  const { data } = await supabase.from("categories").select("*").eq("active", true).order("sort_order");
  return data || [];
}

// ─── Bookings ───
export async function createBooking(booking: Record<string, any>) {
  const fee = Math.round(booking.amount * 0.01);
  return supabase.from("bookings").insert({
    ...booking, platform_fee: fee, worker_payout: booking.amount - fee, status: "requested",
  }).select().single();
}
export async function getBookings(userId: string) {
  const { data } = await supabase.from("bookings").select("*")
    .or(`worker_id.eq.${userId},customer_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  return data || [];
}
export async function updateBookingStatus(bookingId: string, status: string) {
  return supabase.from("bookings").update({
    status, updated_at: new Date().toISOString(),
    ...(status === "completed" ? { completed_at: new Date().toISOString() } : {}),
  }).eq("id", bookingId);
}

// ─── Reviews ───
export async function createReview(review: Record<string, any>) {
  return supabase.from("reviews").insert(review);
}
export async function getReviewsForUser(userId: string) {
  const { data } = await supabase.from("reviews").select("*").eq("to_user_id", userId).order("created_at", { ascending: false });
  return data || [];
}

// ─── Chat ───
export async function getOrCreateChatRoom(userId1: string, userId2: string) {
  // Check if room exists
  const { data: existing } = await supabase.from("chat_rooms").select("*")
    .or(`and(participant_1.eq.${userId1},participant_2.eq.${userId2}),and(participant_1.eq.${userId2},participant_2.eq.${userId1})`)
    .limit(1).single();
  if (existing) return existing;
  // Create new room
  const { data } = await supabase.from("chat_rooms").insert({
    participant_1: userId1, participant_2: userId2,
  }).select().single();
  return data;
}
export async function sendMessage(chatRoomId: string, senderId: string, senderName: string, content: string) {
  await supabase.from("messages").insert({ chat_room_id: chatRoomId, sender_id: senderId, sender_name: senderName, content });
  await supabase.from("chat_rooms").update({ last_message: content, last_message_at: new Date().toISOString() }).eq("id", chatRoomId);
}
export async function getChatMessages(chatRoomId: string) {
  const { data } = await supabase.from("messages").select("*").eq("chat_room_id", chatRoomId).order("created_at", { ascending: true });
  return data || [];
}
export function subscribeToChatMessages(chatRoomId: string, callback: (msg: any) => void) {
  return supabase.channel(`chat:${chatRoomId}`).on("postgres_changes",
    { event: "INSERT", schema: "public", table: "messages", filter: `chat_room_id=eq.${chatRoomId}` },
    (payload) => callback(payload.new)
  ).subscribe();
}
export async function getChatRooms(userId: string) {
  const { data } = await supabase.from("chat_rooms").select("*")
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order("last_message_at", { ascending: false });
  return data || [];
}

// ─── Notifications ───
export async function getNotifications(userId: string) {
  const { data } = await supabase.from("notifications").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
  return data || [];
}
export async function markNotificationRead(notifId: string) {
  return supabase.from("notifications").update({ is_read: true }).eq("id", notifId);
}
export async function markAllNotificationsRead(userId: string) {
  return supabase.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
}
export async function createNotification(userId: string, type: string, title: string, message: string, data?: any) {
  return supabase.from("notifications").insert({ user_id: userId, type, title, message, data: data || {} });
}

// ─── Wallet ───
export async function getWallet(userId: string) {
  const { data } = await supabase.from("wallets").select("*").eq("user_id", userId).single();
  return data;
}

// ─── Verifications ───
export async function submitVerification(verification: Record<string, any>) {
  return supabase.from("verifications").insert(verification);
}

// ─── Storage ───
export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return urlData.publicUrl;
}

// ─── Realtime Notifications ───
export function subscribeToNotifications(userId: string, callback: (notif: any) => void) {
  return supabase.channel(`notif:${userId}`).on("postgres_changes",
    { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
    (payload) => callback(payload.new)
  ).subscribe();
}
