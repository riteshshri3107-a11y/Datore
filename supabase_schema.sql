-- DATORE v5 Database Schema

-- Profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT, full_name TEXT, avatar_url TEXT, phone TEXT,
  role TEXT DEFAULT 'user', is_verified BOOLEAN DEFAULT FALSE,
  trust_score INTEGER DEFAULT 50,
  location_lat FLOAT, location_lng FLOAT, city TEXT, country TEXT,
  bio TEXT, work TEXT, education TEXT, skills TEXT[], hobbies TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Worker Profiles
CREATE TABLE IF NOT EXISTS worker_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  full_name TEXT, avatar_url TEXT, bio TEXT,
  skills TEXT[], categories TEXT[],
  hourly_rate NUMERIC DEFAULT 0, fixed_rate NUMERIC,
  experience_years INTEGER DEFAULT 0, certifications TEXT[],
  completed_jobs INTEGER DEFAULT 0, rating NUMERIC DEFAULT 0, review_count INTEGER DEFAULT 0,
  availability TEXT DEFAULT 'offline',
  location_lat FLOAT, location_lng FLOAT, city TEXT,
  is_police_verified BOOLEAN DEFAULT FALSE,
  background_check TEXT DEFAULT 'none',
  trust_score INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Jobs
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id UUID REFERENCES profiles(id),
  poster_name TEXT, poster_avatar TEXT,
  title TEXT NOT NULL, description TEXT, category TEXT NOT NULL,
  urgency TEXT DEFAULT 'today', target_date DATE,
  payment_type TEXT DEFAULT 'fixed', amount NUMERIC NOT NULL, currency TEXT DEFAULT 'CAD',
  location_lat FLOAT, location_lng FLOAT, location_name TEXT,
  status TEXT DEFAULT 'open', assigned_to UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings (Marketplace)
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES profiles(id),
  seller_name TEXT, seller_avatar TEXT,
  title TEXT NOT NULL, description TEXT, price NUMERIC NOT NULL,
  category TEXT, condition TEXT DEFAULT 'good',
  images TEXT[], location_name TEXT,
  location_lat FLOAT, location_lng FLOAT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id UUID REFERENCES profiles(id),
  reviewer_name TEXT, reviewer_avatar TEXT,
  target_id UUID, job_id UUID,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Rooms
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES profiles(id),
  user2_id UUID REFERENCES profiles(id),
  job_id UUID, last_message TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES chat_rooms(id),
  sender_id UUID REFERENCES profiles(id),
  sender_name TEXT, content TEXT,
  type TEXT DEFAULT 'text',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallets
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES profiles(id),
  available NUMERIC DEFAULT 0,
  escrowed NUMERIC DEFAULT 0,
  pending NUMERIC DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet Transactions
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  type TEXT, amount NUMERIC, description TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  title TEXT, message TEXT,
  type TEXT DEFAULT 'system',
  is_read BOOLEAN DEFAULT FALSE, link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for development)
CREATE POLICY "Public read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Own update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Own insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public read" ON worker_profiles FOR SELECT USING (true);
CREATE POLICY "All insert" ON worker_profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Own update" ON worker_profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Public read" ON jobs FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON jobs FOR INSERT WITH CHECK (auth.uid() = poster_id);
CREATE POLICY "Own update" ON jobs FOR UPDATE USING (auth.uid() = poster_id);

CREATE POLICY "Public read" ON listings FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON listings FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Public read" ON reviews FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

CREATE POLICY "Own read" ON chat_rooms FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Auth insert" ON chat_rooms FOR INSERT WITH CHECK (true);

CREATE POLICY "Room read" ON messages FOR SELECT USING (true);
CREATE POLICY "Auth insert" ON messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Own read" ON wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own read" ON wallet_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Own read" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own update" ON notifications FOR UPDATE USING (auth.uid() = user_id);
