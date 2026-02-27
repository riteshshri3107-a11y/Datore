-- ========================================
-- DATORE v5 — JobPlace + Token Economy
-- Run in Supabase SQL Editor
-- ========================================

-- Jobs table (JobPlace)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poster_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  poster_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  urgency TEXT DEFAULT 'no_rush' CHECK (urgency IN ('immediate','today','tomorrow','by_date','no_rush')),
  scheduled_date DATE,
  payment_type TEXT DEFAULT 'fixed' CHECK (payment_type IN ('fixed','hourly')),
  amount NUMERIC DEFAULT 0,
  location_text TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','assigned','in_progress','completed','cancelled')),
  assigned_to UUID REFERENCES auth.users(id),
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Service Profiles (providers who list themselves)
CREATE TABLE IF NOT EXISTS service_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  skills TEXT[] DEFAULT '{}',
  categories TEXT[] DEFAULT '{}',
  hourly_rate NUMERIC DEFAULT 0,
  fixed_rate NUMERIC,
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available','busy','scheduled','offline')),
  location_text TEXT,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_sharing BOOLEAN DEFAULT false,
  bio TEXT,
  certifications TEXT,
  completed_jobs INTEGER DEFAULT 0,
  trust_score INTEGER DEFAULT 50,
  response_time TEXT DEFAULT '< 1hr',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Applications
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES auth.users(id),
  provider_name TEXT,
  message TEXT,
  proposed_amount NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Token Wallets
CREATE TABLE IF NOT EXISTS token_wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  available_tokens NUMERIC DEFAULT 0,
  escrowed_tokens NUMERIC DEFAULT 0,
  total_earned NUMERIC DEFAULT 0,
  total_spent NUMERIC DEFAULT 0,
  tips_received NUMERIC DEFAULT 0,
  tips_given NUMERIC DEFAULT 0,
  social_credits INTEGER DEFAULT 0,
  kyc_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Token Transactions (ledger)
CREATE TABLE IF NOT EXISTS token_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type TEXT NOT NULL CHECK (type IN ('purchase','escrow_lock','escrow_release','payment','tip','withdrawal','refund','social_credit')),
  amount NUMERIC NOT NULL,
  direction TEXT NOT NULL CHECK (direction IN ('credit','debit')),
  reference_id UUID,
  description TEXT,
  balance_after NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Marketplace Listings
CREATE TABLE IF NOT EXISTS listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  category TEXT,
  condition TEXT DEFAULT 'Good',
  location_text TEXT,
  images TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active','sold','reserved','removed')),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add new columns to profiles if they don't exist
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS work TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS education TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS hobbies TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS interests TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS travel TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS links TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS contact_info TEXT;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Enable RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE token_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Policies (permissive for now)
CREATE POLICY "jobs_all" ON jobs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "sp_all" ON service_profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "ja_all" ON job_applications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "tw_all" ON token_wallets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "tt_all" ON token_transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "listings_all" ON listings FOR ALL USING (true) WITH CHECK (true);

-- Auto-create token wallet on new user
CREATE OR REPLACE FUNCTION create_token_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO token_wallets (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_profile_create_wallet ON profiles;
CREATE TRIGGER on_profile_create_wallet
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION create_token_wallet();

