-- ============================================================
-- DATORE - Complete Supabase Database Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES (extends Supabase auth.users) ───
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'both' CHECK (role IN ('buyer', 'seller', 'both', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'banned')),
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  city TEXT DEFAULT '',
  state TEXT DEFAULT '',
  lat DOUBLE PRECISION DEFAULT 0,
  lng DOUBLE PRECISION DEFAULT 0,
  rating NUMERIC(2,1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  job_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMPTZ,
  verification_expiry TIMESTAMPTZ,
  member_since TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WORKER PROFILES ───
CREATE TABLE IF NOT EXISTS public.workers (
  id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  skills JSONB DEFAULT '[]',
  categories TEXT[] DEFAULT '{}',
  licensed BOOLEAN DEFAULT FALSE,
  license_docs TEXT[] DEFAULT '{}',
  hourly_rate INTEGER DEFAULT 0,
  available BOOLEAN DEFAULT TRUE,
  service_radius INTEGER DEFAULT 10,
  portfolio TEXT[] DEFAULT '{}',
  response_time TEXT DEFAULT '< 1 hr',
  badge TEXT CHECK (badge IN ('top', NULL)),
  qr_code_data TEXT,
  total_earnings INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CATEGORIES ───
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT DEFAULT '#00D4AA',
  worker_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0
);

-- ─── BOOKINGS ───
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES public.profiles(id),
  customer_id UUID REFERENCES public.profiles(id),
  worker_name TEXT DEFAULT '',
  customer_name TEXT DEFAULT '',
  service TEXT NOT NULL,
  category_id TEXT,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','accepted','rejected','in_progress','completed','cancelled','disputed')),
  amount INTEGER NOT NULL DEFAULT 0,
  platform_fee INTEGER DEFAULT 0,
  worker_payout INTEGER DEFAULT 0,
  scheduled_date TEXT,
  scheduled_time TEXT,
  location_address TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── REVIEWS ───
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id),
  from_user_id UUID REFERENCES public.profiles(id),
  from_user_name TEXT DEFAULT '',
  to_user_id UUID REFERENCES public.profiles(id),
  to_user_name TEXT DEFAULT '',
  review_type TEXT CHECK (review_type IN ('customer_to_worker', 'worker_to_customer')),
  overall_rating NUMERIC(2,1) NOT NULL,
  quality INTEGER,
  punctuality INTEGER,
  communication INTEGER,
  value_rating INTEGER,
  clear_instructions INTEGER,
  respectfulness INTEGER,
  timely_payment INTEGER,
  review_text TEXT DEFAULT '',
  photos TEXT[] DEFAULT '{}',
  flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── CHAT ROOMS ───
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_1 UUID REFERENCES public.profiles(id),
  participant_2 UUID REFERENCES public.profiles(id),
  booking_id UUID,
  last_message TEXT DEFAULT '',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── MESSAGES ───
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id),
  sender_name TEXT DEFAULT '',
  msg_type TEXT DEFAULT 'text' CHECK (msg_type IN ('text','image','file','location','voice','system')),
  content TEXT DEFAULT '',
  media_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NOTIFICATIONS ───
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WALLETS ───
CREATE TABLE IF NOT EXISTS public.wallets (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  total_tips INTEGER DEFAULT 0,
  total_platform_fees INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── TRANSACTIONS ───
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id),
  payer_id UUID REFERENCES public.profiles(id),
  payee_id UUID REFERENCES public.profiles(id),
  amount INTEGER NOT NULL,
  platform_fee INTEGER DEFAULT 0,
  worker_payout INTEGER DEFAULT 0,
  tip INTEGER DEFAULT 0,
  method TEXT DEFAULT 'wallet',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','held','released','refunded','failed')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  released_at TIMESTAMPTZ
);

-- ─── VERIFICATIONS ───
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT DEFAULT '',
  gov_id_front TEXT,
  gov_id_back TEXT,
  photo TEXT,
  gov_id_number TEXT,
  police_station TEXT DEFAULT '',
  police_clearance_cert TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired')),
  admin_notes TEXT,
  reviewed_by UUID,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- ─── QR SCAN LOG ───
CREATE TABLE IF NOT EXISTS public.qr_scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  worker_id UUID REFERENCES public.profiles(id),
  scanner_id UUID,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── SUPPORT TICKETS ───
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  user_name TEXT DEFAULT '',
  subject TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high','urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ─── INDEXES ───
CREATE INDEX IF NOT EXISTS idx_workers_available ON public.workers(available);
CREATE INDEX IF NOT EXISTS idx_workers_categories ON public.workers USING GIN(categories);
CREATE INDEX IF NOT EXISTS idx_bookings_worker ON public.bookings(worker_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_reviews_to_user ON public.reviews(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat ON public.messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_verifications_status ON public.verifications(status);

-- ─── ROW LEVEL SECURITY ───
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone can read, owners can update
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Workers: public read, owner update
CREATE POLICY "workers_read" ON public.workers FOR SELECT USING (true);
CREATE POLICY "workers_insert" ON public.workers FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "workers_update" ON public.workers FOR UPDATE USING (auth.uid() = id);

-- Categories: public read
CREATE POLICY "categories_read" ON public.categories FOR SELECT USING (true);

-- Bookings: participants can read/write
CREATE POLICY "bookings_read" ON public.bookings FOR SELECT USING (auth.uid() = worker_id OR auth.uid() = customer_id);
CREATE POLICY "bookings_insert" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "bookings_update" ON public.bookings FOR UPDATE USING (auth.uid() = worker_id OR auth.uid() = customer_id);

-- Reviews: public read, auth insert
CREATE POLICY "reviews_read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews_insert" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- Chat rooms: participants only
CREATE POLICY "chat_rooms_read" ON public.chat_rooms FOR SELECT USING (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "chat_rooms_insert" ON public.chat_rooms FOR INSERT WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);

-- Messages: chat participants
CREATE POLICY "messages_read" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_rooms WHERE id = chat_room_id AND (participant_1 = auth.uid() OR participant_2 = auth.uid()))
);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications: own only
CREATE POLICY "notif_read" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Wallets: own only
CREATE POLICY "wallets_read" ON public.wallets FOR SELECT USING (auth.uid() = user_id);

-- Transactions: participants
CREATE POLICY "tx_read" ON public.transactions FOR SELECT USING (auth.uid() = payer_id OR auth.uid() = payee_id);

-- Verifications: own only
CREATE POLICY "verif_read" ON public.verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "verif_insert" ON public.verifications FOR INSERT WITH CHECK (auth.uid() = user_id);

-- QR Scans: insert only
CREATE POLICY "qr_insert" ON public.qr_scans FOR INSERT WITH CHECK (true);

-- Tickets: own only
CREATE POLICY "tickets_read" ON public.tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tickets_insert" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ─── AUTO-CREATE PROFILE ON SIGNUP (Trigger) ───
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, member_since)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''), EXTRACT(YEAR FROM NOW())::TEXT);

  INSERT INTO public.wallets (user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─── SEED CATEGORIES ───
INSERT INTO public.categories (id, name, icon, color, worker_count, sort_order) VALUES
  ('home', 'Home Services', '🏠', '#F97316', 248, 1),
  ('tech', 'Tech & IT', '💻', '#3B82F6', 186, 2),
  ('education', 'Education', '📚', '#8B5CF6', 312, 3),
  ('health', 'Health & Wellness', '💪', '#10B981', 145, 4),
  ('beauty', 'Beauty', '💇', '#EC4899', 198, 5),
  ('auto', 'Automotive', '🚗', '#EF4444', 87, 6),
  ('events', 'Events', '🎉', '#F59E0B', 156, 7),
  ('delivery', 'Delivery', '📦', '#06B6D4', 234, 8),
  ('creative', 'Creative', '🎨', '#A855F7', 167, 9),
  ('legal', 'Legal & Finance', '⚖️', '#64748B', 76, 10),
  ('garden', 'Garden & Agri', '🌿', '#22C55E', 112, 11),
  ('trades', 'Skilled Trades', '🔧', '#D97706', 198, 12)
ON CONFLICT (id) DO NOTHING;

-- ─── DONE ───
-- Schema ready! Now enable Supabase Auth providers in Dashboard:
-- 1. Go to Authentication → Providers
-- 2. Enable: Email, Phone (with Twilio), Google OAuth
