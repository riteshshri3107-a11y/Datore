export interface Profile {
  id: string; name: string; email?: string; phone?: string;
  role: "buyer"|"seller"|"both"|"admin"; status: "active"|"suspended"|"banned";
  avatar_url?: string; bio?: string; city?: string; state?: string;
  lat?: number; lng?: number; rating?: number; review_count?: number;
  job_count?: number; verified?: boolean; verified_at?: string;
  verification_expiry?: string; member_since?: string; created_at?: string;
}
export interface Worker {
  id: string; skills?: any[]; categories?: string[]; licensed?: boolean;
  hourly_rate?: number; available?: boolean; service_radius?: number;
  portfolio?: string[]; response_time?: string; badge?: string;
  total_earnings?: number; profiles?: Profile;
}
export interface Booking {
  id: string; worker_id: string; customer_id: string; worker_name?: string;
  customer_name?: string; service: string; category_id?: string;
  description?: string; status: string; amount: number; platform_fee?: number;
  worker_payout?: number; scheduled_date?: string; scheduled_time?: string;
  created_at?: string; completed_at?: string;
}
export interface Review {
  id: string; booking_id?: string; from_user_id: string; from_user_name?: string;
  to_user_id: string; to_user_name?: string; overall_rating: number;
  review_text?: string; created_at?: string; flagged?: boolean;
}
export interface ChatRoom {
  id: string; participant_1: string; participant_2: string;
  last_message?: string; last_message_at?: string;
}
export interface Message {
  id: string; chat_room_id: string; sender_id: string; sender_name?: string;
  msg_type?: string; content: string; is_read?: boolean; created_at?: string;
}
export interface Notification {
  id: string; user_id: string; type: string; title: string;
  message: string; is_read: boolean; data?: any; created_at?: string;
}
export interface Wallet {
  user_id: string; balance: number; total_earned: number;
  total_spent: number; total_tips: number;
}
