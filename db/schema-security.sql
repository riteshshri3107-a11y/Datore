-- ═══════════════════════════════════════════════════════════════
-- DATORE — Security Tables Schema (Supabase/Postgres)
-- ═══════════════════════════════════════════════════════════════
-- Run BEFORE rls-policies.sql
-- ═══════════════════════════════════════════════════════════════

-- Auth Audit Log — tracks all auth events
CREATE TABLE IF NOT EXISTS auth_audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  event TEXT NOT NULL, -- sign_in, sign_out, sign_up, sign_in_failed, password_change, mfa_enable
  metadata JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  device_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moderation Queue — flagged content for review
CREATE TABLE IF NOT EXISTS moderation_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_type TEXT NOT NULL, -- post, comment, message, listing, review, image_meta
  content_id TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  original_text TEXT NOT NULL,
  cleaned_text TEXT,
  severity TEXT NOT NULL, -- none, low, medium, high, critical
  action TEXT NOT NULL, -- allow, censor, flag, block, escalate
  flags JSONB DEFAULT '[]',
  confidence FLOAT DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected, escalated
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  appeal_text TEXT,
  appeal_status TEXT, -- null, pending, approved, rejected
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rate Limit Tracking (server-side, supplements middleware in-memory)
CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL, -- ip:endpoint or user_id:endpoint
  count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  window_seconds INTEGER DEFAULT 60,
  UNIQUE(key)
);

-- Device Registry — tracks known devices per user
CREATE TABLE IF NOT EXISTS user_devices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  device_hash TEXT NOT NULL,
  user_agent TEXT,
  platform TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  is_trusted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_hash)
);

-- Content Reports — user-submitted reports
CREATE TABLE IF NOT EXISTS content_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) NOT NULL,
  content_type TEXT NOT NULL,
  content_id TEXT NOT NULL,
  reason TEXT NOT NULL, -- spam, harassment, hate_speech, adult, scam, impersonation, other
  description TEXT,
  status TEXT DEFAULT 'pending', -- pending, investigating, resolved, dismissed
  resolved_by UUID REFERENCES profiles(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- Friend Requests table (if not exists)
CREATE TABLE IF NOT EXISTS friend_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(sender_id, receiver_id)
);

-- Friends table (accepted friendships)
CREATE TABLE IF NOT EXISTS friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  friend_id UUID REFERENCES profiles(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- Posts table (social feed)
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  text TEXT NOT NULL,
  media_url TEXT,
  media_type TEXT, -- text, photo, video
  audience TEXT DEFAULT 'public', -- public, friends, buddy, professional
  likes INTEGER DEFAULT 0,
  is_moderated BOOLEAN DEFAULT false,
  moderation_status TEXT, -- clean, censored, blocked
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  text TEXT NOT NULL,
  is_moderated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add security columns to profiles if not exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_sign_in TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active'; -- active, suspended, banned

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audit_created ON auth_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mod_queue_status ON moderation_queue(status);
CREATE INDEX IF NOT EXISTS idx_mod_queue_severity ON moderation_queue(severity);
CREATE INDEX IF NOT EXISTS idx_reports_status ON content_reports(status);
CREATE INDEX IF NOT EXISTS idx_devices_user ON user_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);

-- Cleanup function for expired rate limits
CREATE OR REPLACE FUNCTION cleanup_rate_limits() RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE window_start + (window_seconds || ' seconds')::interval < NOW();
END;
$$ LANGUAGE plpgsql;
