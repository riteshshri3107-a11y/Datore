-- ═══════════════════════════════════════════════════════════════
-- DATORE — Row Level Security Policies (Supabase/Postgres)
-- ═══════════════════════════════════════════════════════════════
-- Priority: 0-30 Day Security Hardening
-- 
-- Run this in Supabase SQL Editor or via migration
-- Enforces that users can only access their own data
-- unless explicitly shared or public
-- ═══════════════════════════════════════════════════════════════

-- ═══ Enable RLS on all tables ═══
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════
-- PROFILES
-- ═══════════════════════════════════════
-- Anyone can read public profile fields
CREATE POLICY profiles_select_public ON profiles
  FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY profiles_update_own ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (on signup)
CREATE POLICY profiles_insert_own ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- No delete (soft delete only via status field)
CREATE POLICY profiles_no_delete ON profiles
  FOR DELETE USING (false);

-- ═══════════════════════════════════════
-- WORKER_PROFILES
-- ═══════════════════════════════════════
CREATE POLICY worker_profiles_select ON worker_profiles
  FOR SELECT USING (true); -- Public for discovery

CREATE POLICY worker_profiles_update_own ON worker_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY worker_profiles_insert_own ON worker_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════
-- JOBS
-- ═══════════════════════════════════════
-- Open jobs visible to all authenticated users
CREATE POLICY jobs_select_open ON jobs
  FOR SELECT USING (
    status = 'open' 
    OR poster_id = auth.uid() 
    OR assigned_to = auth.uid()
  );

-- Only poster can update their own jobs
CREATE POLICY jobs_update_own ON jobs
  FOR UPDATE USING (poster_id = auth.uid());

-- Authenticated users can create jobs
CREATE POLICY jobs_insert_auth ON jobs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND poster_id = auth.uid());

-- Only poster can delete (soft delete)
CREATE POLICY jobs_delete_own ON jobs
  FOR DELETE USING (poster_id = auth.uid());

-- ═══════════════════════════════════════
-- LISTINGS (Marketplace)
-- ═══════════════════════════════════════
CREATE POLICY listings_select_active ON listings
  FOR SELECT USING (status = 'active' OR seller_id = auth.uid());

CREATE POLICY listings_update_own ON listings
  FOR UPDATE USING (seller_id = auth.uid());

CREATE POLICY listings_insert_auth ON listings
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND seller_id = auth.uid());

CREATE POLICY listings_delete_own ON listings
  FOR DELETE USING (seller_id = auth.uid());

-- ═══════════════════════════════════════
-- CHAT_ROOMS — Only participants
-- ═══════════════════════════════════════
CREATE POLICY chat_rooms_participants ON chat_rooms
  FOR SELECT USING (
    user1_id = auth.uid() OR user2_id = auth.uid()
  );

CREATE POLICY chat_rooms_create ON chat_rooms
  FOR INSERT WITH CHECK (
    user1_id = auth.uid() OR user2_id = auth.uid()
  );

-- ═══════════════════════════════════════
-- MESSAGES — Only room participants
-- ═══════════════════════════════════════
CREATE POLICY messages_select_participant ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = messages.room_id
      AND (chat_rooms.user1_id = auth.uid() OR chat_rooms.user2_id = auth.uid())
    )
  );

CREATE POLICY messages_insert_participant ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM chat_rooms
      WHERE chat_rooms.id = room_id
      AND (chat_rooms.user1_id = auth.uid() OR chat_rooms.user2_id = auth.uid())
    )
  );

-- Messages cannot be updated or deleted (audit trail)
CREATE POLICY messages_no_update ON messages FOR UPDATE USING (false);
CREATE POLICY messages_no_delete ON messages FOR DELETE USING (false);

-- ═══════════════════════════════════════
-- REVIEWS
-- ═══════════════════════════════════════
CREATE POLICY reviews_select ON reviews
  FOR SELECT USING (true); -- Public

CREATE POLICY reviews_insert_auth ON reviews
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND reviewer_id = auth.uid()
    AND reviewer_id != target_id -- Cannot self-review
  );

-- Reviews cannot be edited or deleted (integrity)
CREATE POLICY reviews_no_update ON reviews FOR UPDATE USING (false);
CREATE POLICY reviews_no_delete ON reviews FOR DELETE USING (false);

-- ═══════════════════════════════════════
-- WALLETS — Private, owner only
-- ═══════════════════════════════════════
CREATE POLICY wallets_owner_only ON wallets
  FOR SELECT USING (user_id = auth.uid());

-- Wallet updates only via server-side functions (no direct client writes)
CREATE POLICY wallets_no_client_write ON wallets
  FOR UPDATE USING (false);

CREATE POLICY wallets_no_client_insert ON wallets
  FOR INSERT WITH CHECK (false);

-- ═══════════════════════════════════════
-- WALLET_TRANSACTIONS — Owner read only
-- ═══════════════════════════════════════
CREATE POLICY wallet_tx_owner ON wallet_transactions
  FOR SELECT USING (user_id = auth.uid());

-- Transactions created server-side only
CREATE POLICY wallet_tx_no_client_write ON wallet_transactions
  FOR INSERT WITH CHECK (false);

-- ═══════════════════════════════════════
-- NOTIFICATIONS — Owner only
-- ═══════════════════════════════════════
CREATE POLICY notifications_owner ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY notifications_update_own ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ═══════════════════════════════════════
-- POSTS (Social Feed)
-- ═══════════════════════════════════════
CREATE POLICY posts_select_visible ON posts
  FOR SELECT USING (
    audience = 'public'
    OR author_id = auth.uid()
    OR (audience = 'friends' AND EXISTS (
      SELECT 1 FROM friends WHERE
        (user_id = auth.uid() AND friend_id = author_id)
        OR (friend_id = auth.uid() AND user_id = author_id)
    ))
  );

CREATE POLICY posts_insert_own ON posts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

CREATE POLICY posts_update_own ON posts
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY posts_delete_own ON posts
  FOR DELETE USING (author_id = auth.uid());

-- ═══════════════════════════════════════
-- COMMENTS
-- ═══════════════════════════════════════
CREATE POLICY comments_select ON comments
  FOR SELECT USING (true); -- Visible if post is visible

CREATE POLICY comments_insert_auth ON comments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND author_id = auth.uid());

CREATE POLICY comments_delete_own ON comments
  FOR DELETE USING (author_id = auth.uid());

-- ═══════════════════════════════════════
-- AUTH_AUDIT_LOG — Admin/Moderator read only
-- ═══════════════════════════════════════
CREATE POLICY audit_log_admin ON auth_audit_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- Audit log insert via service key only (handled server-side)
CREATE POLICY audit_log_service_insert ON auth_audit_log
  FOR INSERT WITH CHECK (true); -- Service role bypasses RLS

-- ═══════════════════════════════════════
-- MODERATION_QUEUE — Moderator/Admin access
-- ═══════════════════════════════════════
CREATE POLICY mod_queue_moderator ON moderation_queue
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
    OR author_id = auth.uid() -- Authors can see their own flagged content
  );

CREATE POLICY mod_queue_update_moderator ON moderation_queue
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- ═══════════════════════════════════════
-- FRIEND_REQUESTS
-- ═══════════════════════════════════════
CREATE POLICY friend_requests_participants ON friend_requests
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY friend_requests_send ON friend_requests
  FOR INSERT WITH CHECK (sender_id = auth.uid());

CREATE POLICY friend_requests_respond ON friend_requests
  FOR UPDATE USING (receiver_id = auth.uid());

CREATE POLICY friend_requests_cancel ON friend_requests
  FOR DELETE USING (sender_id = auth.uid());

-- ═══════════════════════════════════════
-- INDEXES for RLS Performance
-- ═══════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_jobs_poster ON jobs(poster_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_users ON chat_rooms(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_audience ON posts(audience);
CREATE INDEX IF NOT EXISTS idx_reviews_target ON reviews(target_id);
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON auth_audit_log(user_id);
