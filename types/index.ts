// Types matching actual Supabase database schema

export interface Profile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'buyer' | 'seller' | 'both' | 'admin';
  status: string;
  avatar_url?: string;
  bio?: string;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  review_count?: number;
  job_count?: number;
  verified?: boolean;
  verified_at?: string;
  verification_expiry?: string;
  member_since?: string;
  created_at: string;
  updated_at?: string;
  work?: string;
  education?: string;
  hobbies?: string;
  interests?: string;
  travel?: string;
  links?: any;
  contact_info?: any;
  theme?: any;
}

export interface Worker {
  id: string;
  skills?: string[];
  categories?: string[];
  licensed?: boolean;
  license_docs?: string[];
  hourly_rate?: number;
  available?: boolean;
  service_radius?: number;
  portfolio?: string[];
  response_time?: string;
  badge?: string;
  qr_code_data?: string;
  total_earnings?: number;
  created_at: string;
  profiles?: Profile;
}

export interface WorkerProfile {
  id: string;
  bio?: string;
  location_city?: string;
  location_lat?: number;
  location_lng?: number;
  is_police_verified?: boolean;
  verification_expiry?: string;
  total_jobs_completed?: number;
  average_rating?: number;
  govt_id_url?: string;
  police_clearance_url?: string;
  safety_warnings?: string;
  qr_token?: string;
}

export interface Job {
  id: string;
  customer_id: string;
  worker_id?: string;
  category_id?: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  job_description?: string;
  scheduled_time?: string;
  agreed_price?: number;
  created_at: string;
  completed_at?: string;
  profiles?: { name: string; avatar_url?: string };
}

export interface Listing {
  id: string;
  user_id: string;
  user_name?: string;
  title: string;
  description?: string;
  price?: number;
  category?: string;
  condition?: string;
  location_text?: string;
  images?: string[];
  status: 'active' | 'sold' | 'removed';
  views_count?: number;
  created_at: string;
  profiles?: { name: string; avatar_url?: string };
}

export interface Post {
  id: string;
  user_id: string;
  content?: string;
  media_urls?: string[];
  media_type?: string;
  post_type: string;
  location_text?: string;
  location_lat?: number;
  location_lng?: number;
  hashtags?: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  views_count: number;
  is_pinned: boolean;
  is_archived: boolean;
  visibility: 'public' | 'followers' | 'private';
  linked_job_id?: string;
  linked_listing_id?: string;
  created_at: string;
  updated_at?: string;
  // from join
  user_name?: string;
  avatar_url?: string;
  verified?: boolean;
}

export interface Reel {
  id: string;
  user_id: string;
  post_id?: string;
  video_url: string;
  thumbnail_url?: string;
  caption?: string;
  duration_seconds?: number;
  audio_name?: string;
  hashtags?: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  views_count: number;
  location_text?: string;
  created_at: string;
  profiles?: { name: string; avatar_url?: string; verified?: boolean };
}

export interface Comment {
  id: string;
  user_id: string;
  target_id: string;
  target_type: string;
  parent_id?: string;
  content: string;
  likes_count: number;
  is_flagged: boolean;
  created_at: string;
  updated_at?: string;
  profiles?: { name: string; avatar_url?: string };
}

export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  location_text?: string;
  views_count: number;
  viewers?: string[];
  expires_at: string;
  created_at: string;
  profiles?: { name: string; avatar_url?: string };
}

export interface ChatRoom {
  id: string;
  participant_1: string;
  participant_2: string;
  booking_id?: string;
  last_message?: string;
  last_message_at?: string;
  created_at: string;
  p1?: { name: string; avatar_url?: string };
  p2?: { name: string; avatar_url?: string };
}

export interface Message {
  id: string;
  chat_room_id: string;
  sender_id: string;
  sender_name?: string;
  msg_type: 'text' | 'image' | 'system';
  content: string;
  media_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface Booking {
  id: string;
  worker_id: string;
  customer_id: string;
  worker_name?: string;
  customer_name?: string;
  service?: string;
  category_id?: string;
  description?: string;
  status: string;
  amount?: number;
  platform_fee?: number;
  worker_payout?: number;
  scheduled_date?: string;
  scheduled_time?: string;
  location_address?: string;
  created_at: string;
  completed_at?: string;
  updated_at?: string;
}

export interface Review {
  id: string;
  booking_id?: string;
  from_user_id: string;
  from_user_name?: string;
  to_user_id: string;
  to_user_name?: string;
  review_type?: string;
  overall_rating: number;
  quality?: number;
  punctuality?: number;
  communication?: number;
  review_text?: string;
  photos?: string[];
  created_at: string;
  profiles?: { name: string; avatar_url?: string };
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  data?: any;
  created_at: string;
}

export interface Wallet {
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  total_tips: number;
  total_platform_fees: number;
  updated_at: string;
}

export interface TokenWallet {
  id: string;
  user_id: string;
  available_tokens: number;
  escrowed_tokens: number;
  total_earned: number;
  total_spent: number;
  tips_received: number;
  tips_given: number;
  social_credits: number;
  kyc_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  booking_id?: string;
  payer_id: string;
  payee_id: string;
  amount: number;
  platform_fee?: number;
  worker_payout?: number;
  tip?: number;
  method?: string;
  status: string;
  stripe_payment_intent_id?: string;
  created_at: string;
  released_at?: string;
}

export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  location?: string;
  category?: string;
  attendee_count: number;
  is_online: boolean;
  status: string;
  created_at: string;
  profiles?: { name: string; avatar_url?: string };
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  category?: string;
  image_url?: string;
  creator_id?: string;
  member_count: number;
  is_public: boolean;
  rules?: string;
  created_at: string;
}

export type ThemeMode = 'light' | 'dark';
export type GlassLevel = 'none' | 'subtle' | 'medium' | 'heavy';

export const JOB_CATEGORIES = [
  'Babysitting', 'House Cleaning', 'Plumbing', 'Electrical', 'Carpentry',
  'Painting', 'Gardening', 'Moving', 'Pet Care', 'Tutoring',
  'Cooking', 'Delivery', 'Personal Training', 'Photography', 'Music Lessons',
  'Tech Support', 'Auto Repair', 'Beauty & Wellness', 'Event Planning', 'General Labor'
] as const;

export const MARKETPLACE_CATEGORIES = [
  'Vehicles', 'Property Rentals', 'Electronics', 'Apparel', 'Home Goods',
  'Garden & Outdoor', 'Sports', 'Toys & Games', 'Instruments', 'Office Supplies',
  'Pet Supplies', 'Free Stuff', 'Entertainment', 'Family', 'Hobbies',
  'DIY Supplies', 'Classifieds', 'Buy & Sell Groups'
] as const;

export const URGENCY_OPTIONS = [
  { value: 'immediate', label: 'Immediate', color: '#ef4444' },
  { value: 'today', label: 'Today', color: '#f97316' },
  { value: 'tomorrow', label: 'Tomorrow', color: '#eab308' },
  { value: 'by_date', label: 'By Date', color: '#3b82f6' },
  { value: 'no_rush', label: 'No Rush', color: '#22c55e' },
] as const;
