-- ================================================================
-- DATORE v5 — Complete Production Migration
-- ================================================================
-- Run in: Supabase Dashboard > SQL Editor > New Query
-- Safe to run multiple times (IF NOT EXISTS everywhere)
-- ================================================================

-- ============================
-- CORE TABLES
-- ============================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  avatar_public TEXT,
  avatar_friends TEXT,
  avatar_buddy TEXT,
  avatar_professional TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user','worker','moderator','admin')),
  is_verified BOOLEAN DEFAULT FALSE,
  trust_score INTEGER DEFAULT 50 CHECK (trust_score >= 0 AND trust_score <= 100),
  location_lat FLOAT,
  location_lng FLOAT,
  city TEXT,
  country TEXT,
  bio TEXT,
  work TEXT,
  education TEXT,
  skills TEXT[],
  hobbies TEXT[],
  experience JSONB DEFAULT '[]',
  certifications TEXT[],
  resume_score INTEGER,
  open_to_work BOOLEAN DEFAULT FALSE,
  job_preferences JSONB DEFAULT '{}',
  theme TEXT DEFAULT 'dark',
  voice_search_enabled BOOLEAN DEFAULT TRUE,
  notifications_enabled BOOLEAN DEFAULT TRUE,
  friends_count INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 4.5,
  xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  skills TEXT[],
  categories TEXT[],
  hourly_rate NUMERIC DEFAULT 0,
  fixed_rate NUMERIC,
  experience_years INTEGER DEFAULT 0,
  certifications TEXT[],
  completed_jobs INTEGER DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  availability TEXT DEFAULT 'offline' CHECK (availability IN ('available','busy','offline')),
  location_lat FLOAT,
  location_lng FLOAT,
  city TEXT,
  is_police_verified BOOLEAN DEFAULT FALSE,
  background_check TEXT DEFAULT 'none',
  trust_score INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  poster_name TEXT,
  poster_avatar TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  urgency TEXT DEFAULT 'today',
  target_date DATE,
  payment_type TEXT DEFAULT 'fixed',
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency TEXT DEFAULT 'CAD',
  location_lat FLOAT,
  location_lng FLOAT,
  location_name TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open','assigned','in_progress','completed','cancelled')),
  assigned_to UUID REFERENCES profiles(id),
  applications JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_name TEXT,
  seller_avatar TEXT,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL CHECK (price >= 0),
  category TEXT,
  condition TEXT DEFAULT 'good',
  images TEXT[],
  location_name TEXT,
  location_lat FLOAT,
  location_lng FLOAT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','sold','removed')),
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- SOCIAL TABLES
-- ============================

CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT,
  author_avatar TEXT,
  text TEXT NOT NULL,
  text_cleaned TEXT,
  type TEXT DEFAULT 'text' CHECK (type IN ('text','photo','video')),
  media_url TEXT,
  audience TEXT DEFAULT 'public' CHECK (audience IN ('public','friends','buddy','professional')),
  hashtags TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  is_flagged BOOLEAN DEFAULT FALSE,
  moderation_severity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  author_name TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  to_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(from_user_id, to_user_id)
);

-- ============================
-- COMMUNICATION TABLES
-- ============================

CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sender_name TEXT,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text','image','video','file','system')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  message TEXT,
  type TEXT DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- FINANCIAL TABLES
-- ============================

CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  available NUMERIC DEFAULT 0,
  escrowed NUMERIC DEFAULT 0,
  pending NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'CAD',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'completed',
  reference_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  total NUMERIC NOT NULL,
  pay_method TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed','processing','shipped','delivered','cancelled')),
  shipping_address JSONB,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  price TEXT,
  provider TEXT,
  pay_method TEXT,
  status TEXT DEFAULT 'confirmed',
  confirmation_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reviewer_name TEXT,
  reviewer_avatar TEXT,
  target_id UUID,
  job_id UUID,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- COMMUNITY TABLES
-- ============================

CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  avatar_url TEXT,
  member_count INTEGER DEFAULT 1,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(community_id, user_id)
);

CREATE TABLE IF NOT EXISTS buddy_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  member_ids UUID[] DEFAULT '{}',
  risk_score INTEGER DEFAULT 0,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- SECURITY & COMPLIANCE TABLES
-- ============================

CREATE TABLE IF NOT EXISTS auth_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  event TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  device_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  author_id UUID,
  original_text TEXT NOT NULL,
  cleaned_text TEXT,
  severity TEXT NOT NULL,
  action TEXT NOT NULL,
  flags JSONB DEFAULT '[]',
  status TEXT DEFAULT 'pending',
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consent_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  granted BOOLEAN NOT NULL,
  legal_basis TEXT,
  source TEXT DEFAULT 'settings',
  policy_version TEXT DEFAULT '2.0',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS data_subject_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  regime TEXT DEFAULT 'pipeda',
  status TEXT DEFAULT 'pending',
  details TEXT,
  deadline TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================
-- ENABLE RLS ON ALL TABLES
-- ============================
DO $$
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END $$;

-- ============================
-- RLS POLICIES
-- ============================

-- Profiles
DROP POLICY IF EXISTS profiles_select ON profiles;
CREATE POLICY profiles_select ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS profiles_update ON profiles;
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS profiles_insert ON profiles;
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Workers
DROP POLICY IF EXISTS workers_select ON worker_profiles;
CREATE POLICY workers_select ON worker_profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS workers_insert ON worker_profiles;
CREATE POLICY workers_insert ON worker_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS workers_update ON worker_profiles;
CREATE POLICY workers_update ON worker_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Jobs
DROP POLICY IF EXISTS jobs_select ON jobs;
CREATE POLICY jobs_select ON jobs FOR SELECT USING (true);
DROP POLICY IF EXISTS jobs_insert ON jobs;
CREATE POLICY jobs_insert ON jobs FOR INSERT WITH CHECK (auth.uid() = poster_id);
DROP POLICY IF EXISTS jobs_update ON jobs;
CREATE POLICY jobs_update ON jobs FOR UPDATE USING (auth.uid() = poster_id);
DROP POLICY IF EXISTS jobs_delete ON jobs;
CREATE POLICY jobs_delete ON jobs FOR DELETE USING (auth.uid() = poster_id);

-- Listings
DROP POLICY IF EXISTS listings_select ON listings;
CREATE POLICY listings_select ON listings FOR SELECT USING (true);
DROP POLICY IF EXISTS listings_insert ON listings;
CREATE POLICY listings_insert ON listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
DROP POLICY IF EXISTS listings_delete ON listings;
CREATE POLICY listings_delete ON listings FOR DELETE USING (auth.uid() = seller_id);

-- Posts
DROP POLICY IF EXISTS posts_select ON posts;
CREATE POLICY posts_select ON posts FOR SELECT USING (audience = 'public' OR author_id = auth.uid());
DROP POLICY IF EXISTS posts_insert ON posts;
CREATE POLICY posts_insert ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
DROP POLICY IF EXISTS posts_update ON posts;
CREATE POLICY posts_update ON posts FOR UPDATE USING (auth.uid() = author_id);
DROP POLICY IF EXISTS posts_delete ON posts;
CREATE POLICY posts_delete ON posts FOR DELETE USING (auth.uid() = author_id);

-- Comments
DROP POLICY IF EXISTS comments_select ON comments;
CREATE POLICY comments_select ON comments FOR SELECT USING (true);
DROP POLICY IF EXISTS comments_insert ON comments;
CREATE POLICY comments_insert ON comments FOR INSERT WITH CHECK (auth.uid() = author_id);

-- Likes
DROP POLICY IF EXISTS likes_select ON likes;
CREATE POLICY likes_select ON likes FOR SELECT USING (true);
DROP POLICY IF EXISTS likes_insert ON likes;
CREATE POLICY likes_insert ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS likes_delete ON likes;
CREATE POLICY likes_delete ON likes FOR DELETE USING (auth.uid() = user_id);

-- Friends
DROP POLICY IF EXISTS friends_select ON friend_requests;
CREATE POLICY friends_select ON friend_requests FOR SELECT USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
DROP POLICY IF EXISTS friends_insert ON friend_requests;
CREATE POLICY friends_insert ON friend_requests FOR INSERT WITH CHECK (auth.uid() = from_user_id);
DROP POLICY IF EXISTS friends_update ON friend_requests;
CREATE POLICY friends_update ON friend_requests FOR UPDATE USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Chat Rooms
DROP POLICY IF EXISTS chatrooms_select ON chat_rooms;
CREATE POLICY chatrooms_select ON chat_rooms FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
DROP POLICY IF EXISTS chatrooms_insert ON chat_rooms;
CREATE POLICY chatrooms_insert ON chat_rooms FOR INSERT WITH CHECK (auth.uid() = user1_id);

-- Messages
DROP POLICY IF EXISTS messages_select ON messages;
CREATE POLICY messages_select ON messages FOR SELECT USING (true);
DROP POLICY IF EXISTS messages_insert ON messages;
CREATE POLICY messages_insert ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Wallets
DROP POLICY IF EXISTS wallets_select ON wallets;
CREATE POLICY wallets_select ON wallets FOR SELECT USING (auth.uid() = user_id);

-- Transactions
DROP POLICY IF EXISTS txns_select ON wallet_transactions;
CREATE POLICY txns_select ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);

-- Orders
DROP POLICY IF EXISTS orders_select ON orders;
CREATE POLICY orders_select ON orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS orders_insert ON orders;
CREATE POLICY orders_insert ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bookings
DROP POLICY IF EXISTS bookings_select ON bookings;
CREATE POLICY bookings_select ON bookings FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS bookings_insert ON bookings;
CREATE POLICY bookings_insert ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Notifications
DROP POLICY IF EXISTS notif_select ON notifications;
CREATE POLICY notif_select ON notifications FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS notif_update ON notifications;
CREATE POLICY notif_update ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Reviews
DROP POLICY IF EXISTS reviews_select ON reviews;
CREATE POLICY reviews_select ON reviews FOR SELECT USING (true);
DROP POLICY IF EXISTS reviews_insert ON reviews;
CREATE POLICY reviews_insert ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Communities
DROP POLICY IF EXISTS communities_select ON communities;
CREATE POLICY communities_select ON communities FOR SELECT USING (true);
DROP POLICY IF EXISTS communities_insert ON communities;
CREATE POLICY communities_insert ON communities FOR INSERT WITH CHECK (auth.uid() = creator_id);
DROP POLICY IF EXISTS communities_delete ON communities;
CREATE POLICY communities_delete ON communities FOR DELETE USING (auth.uid() = creator_id);

-- Consent
DROP POLICY IF EXISTS consent_select ON consent_records;
CREATE POLICY consent_select ON consent_records FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS consent_insert ON consent_records;
CREATE POLICY consent_insert ON consent_records FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DSR
DROP POLICY IF EXISTS dsr_select ON data_subject_requests;
CREATE POLICY dsr_select ON data_subject_requests FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS dsr_insert ON data_subject_requests;
CREATE POLICY dsr_insert ON data_subject_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin tables (service_role only)
DROP POLICY IF EXISTS audit_deny ON auth_audit_log;
CREATE POLICY audit_deny ON auth_audit_log FOR SELECT USING (false);
DROP POLICY IF EXISTS modqueue_deny ON moderation_queue;
CREATE POLICY modqueue_deny ON moderation_queue FOR SELECT USING (false);

-- ============================
-- INDEXES
-- ============================
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
CREATE INDEX IF NOT EXISTS idx_jobs_poster ON jobs(poster_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_audience ON posts(audience);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_reviews_target ON reviews(target_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_workers_avail ON worker_profiles(availability);
CREATE INDEX IF NOT EXISTS idx_friends_users ON friend_requests(from_user_id, to_user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);

-- ============================
-- AUTO-CREATE PROFILE + WALLET ON SIGNUP
-- ============================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, trust_score)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user',
    50
  ) ON CONFLICT (id) DO NOTHING;

  INSERT INTO wallets (user_id, available, escrowed, pending)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================
-- REALTIME SUBSCRIPTIONS
-- ============================
-- Enable realtime for chat and notifications
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ============================
-- DONE! Create storage buckets manually:
-- Dashboard > Storage > New Bucket:
--   "avatars"    (Public, 2MB max, image/*)
--   "post-media" (Public, 10MB max, image/*,video/*)
--   "documents"  (Private, 5MB max)
-- ============================
