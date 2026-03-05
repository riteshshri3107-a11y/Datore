export interface User {
  id: string; email: string; full_name: string; avatar_url?: string; phone?: string;
  role: 'user' | 'worker' | 'admin'; is_verified: boolean; trust_score: number;
  location_lat?: number; location_lng?: number; city?: string; country?: string;
  created_at: string;
}

export interface WorkerProfile {
  id: string; user_id: string; skills: string[]; categories: string[];
  hourly_rate: number; fixed_rate?: number; bio: string; experience_years: number;
  certifications?: string[]; completed_jobs: number; rating: number; review_count: number;
  availability: 'available' | 'busy' | 'scheduled' | 'offline';
  location_lat: number; location_lng: number; city: string;
  is_police_verified: boolean; background_check: 'clear' | 'pending' | 'flagged' | 'none';
  avatar_url?: string; full_name: string; created_at: string;
}

export interface Job {
  id: string; poster_id: string; poster_name: string; poster_avatar?: string;
  title: string; description: string; category: string;
  urgency: 'immediate' | 'today' | 'tomorrow' | 'by_date' | 'no_rush';
  target_date?: string; payment_type: 'fixed' | 'hourly';
  amount: number; currency: string;
  location_lat: number; location_lng: number; location_name: string;
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
  assigned_to?: string; created_at: string;
}

export interface Listing {
  id: string; seller_id: string; seller_name: string; seller_avatar?: string;
  title: string; description: string; price: number; category: string;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  images: string[]; location_name: string;
  location_lat: number; location_lng: number;
  status: 'active' | 'sold' | 'removed'; created_at: string;
}

export interface Review {
  id: string; reviewer_id: string; reviewer_name: string; reviewer_avatar?: string;
  target_id: string; job_id: string; rating: number; comment: string;
  created_at: string;
}

export interface ChatMessage {
  id: string; room_id: string; sender_id: string; sender_name: string;
  content: string; type: 'text' | 'image' | 'job_card' | 'system';
  created_at: string;
}

export interface WalletTransaction {
  id: string; user_id: string; type: 'purchase' | 'escrow_lock' | 'escrow_release' | 'tip' | 'withdrawal' | 'earning';
  amount: number; description: string; status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

export interface Notification {
  id: string; user_id: string; title: string; message: string;
  type: 'job' | 'booking' | 'chat' | 'payment' | 'review' | 'system';
  is_read: boolean; link?: string; created_at: string;
}

export type ThemeMode = 'light' | 'dark';
export type GlassLevel = 'none' | 'subtle' | 'medium' | 'heavy';

export const JOB_CATEGORIES = [
  'IT & Software', 'Non-IT', 'Management', 'Civil Construction',
  'Finance & Accounting', 'Healthcare', 'Marketing & Sales', 'Human Resources',
  'Engineering', 'Design & Creative', 'Education & Training', 'Legal',
  'Operations & Logistics', 'Customer Service', 'Data & Analytics',
  'Consulting', 'Manufacturing', 'Retail & Hospitality', 'Government & Public Sector', 'Other'
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
