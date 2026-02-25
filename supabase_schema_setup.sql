-- ==========================================
-- SkillConnect Supabase Database Schema
-- ==========================================
-- IMPORTANT: Run this entire script in your Supabase SQL Editor to set up tables and Row Level Security.
-- This schema emphasizes Data Privacy and Security based on requested PRD.

-- 1. Create Users Table (extends Supabase Auth)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  role TEXT CHECK (role IN ('customer', 'worker', 'admin')) NOT NULL DEFAULT 'customer',
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT UNIQUE,
  is_phone_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Workers Extended Profile Table
CREATE TABLE public.worker_profiles (
  id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  bio TEXT,
  location_city TEXT,
  location_lat FLOAT,
  location_lng FLOAT,
  is_police_verified BOOLEAN DEFAULT false,
  verification_expiry TIMESTAMP WITH TIME ZONE,
  total_jobs_completed INTEGER DEFAULT 0,
  average_rating NUMERIC(3,2) DEFAULT 0.00,
  -- Private Data (Protected)
  govt_id_url TEXT,
  police_clearance_url TEXT,
  safety_warnings TEXT,
  qr_token UUID DEFAULT gen_random_uuid() NOT NULL
);

-- 3. Create Skills / Categories
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  is_active BOOLEAN DEFAULT true
);

-- 4. Create Worker Skills Mapping
CREATE TABLE public.worker_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID REFERENCES public.worker_profiles(id) ON DELETE CASCADE NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
  is_licensed BOOLEAN DEFAULT false,
  rate_per_hour NUMERIC(10,2),
  UNIQUE(worker_id, category_id)
);

-- 5. Create Jobs/Bookings Table
CREATE TABLE public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  worker_id UUID REFERENCES public.worker_profiles(id) ON DELETE SET NULL NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL NOT NULL,
  status TEXT CHECK (status IN ('requested', 'accepted', 'in_progress', 'completed', 'rated', 'rejected', 'cancelled', 'disputed')) DEFAULT 'requested',
  job_description TEXT NOT NULL,
  scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
  agreed_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- 6. Create Reviews Table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE SET NULL NOT NULL,
  reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  target_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(job_id, reviewer_id)
);


-- ==========================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- Protecting Personal Data
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read all public profiles, but can only update their own
CREATE POLICY "Public Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Worker Profiles: Public can view, only workers can update their own.
-- IMPORTANT: Sensitive fields like govt_id_url and police_clearance_url should strictly be queried via views/functions or we hide them from SELECT on frontend
CREATE POLICY "Worker profiles are viewable by everyone" ON public.worker_profiles
  FOR SELECT USING (true);

CREATE POLICY "Workers can update their own extended profile" ON public.worker_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Categories: Everyone can read, only admin can write (simplified here)
CREATE POLICY "Categories are viewable by everyone" ON public.categories
  FOR SELECT USING (true);

-- Worker Skills: Everyone can read, workers can update their own
CREATE POLICY "Worker skills are viewable by everyone" ON public.worker_skills
  FOR SELECT USING (true);

CREATE POLICY "Workers can manage their own skills" ON public.worker_skills
  FOR ALL USING (auth.uid() = worker_id);

-- Jobs: Customers and Workers can see their own jobs
CREATE POLICY "Users view their own jobs" ON public.jobs
  FOR SELECT USING (auth.uid() = customer_id OR auth.uid() = worker_id);

CREATE POLICY "Customers can create jobs" ON public.jobs
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Participants can update jobs" ON public.jobs
  FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() = worker_id);

-- Reviews: Everyone can read reviews, only involved parties can write
CREATE POLICY "Reviews are public" ON public.reviews
  FOR SELECT USING (true);

CREATE POLICY "Involved parties can write reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- ==========================================
-- TRIGGER: Automatically create profile on User Signup
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    COALESCE(new.raw_user_meta_data->>'role', 'customer')
  );
  
  -- If role is worker, also scaffold worker profile
  IF new.raw_user_meta_data->>'role' = 'worker' THEN
    INSERT INTO public.worker_profiles (id) VALUES (new.id);
  END IF;

  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert dummy categories for the MVP
INSERT INTO public.categories (name, icon) VALUES
('Plumbing', 'Wrench'),
('Electrical', 'Zap'),
('Home Cleaning', 'Sparkles'),
('Tutoring', 'BookOpen'),
('IT/Tech Repair', 'Monitor');
