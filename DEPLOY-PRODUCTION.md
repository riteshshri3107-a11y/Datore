# DATORE v5 — Complete Production Deployment Guide

## Prerequisites Already Done
- [x] Supabase project created (ghztxqviaquxhzhsobiz)
- [x] Migration SQL executed — 22 tables, 50+ RLS policies, indexes, triggers all live
- [x] Anon key obtained
- [x] v9 production zip downloaded with backend integration

---

## STEP 1: Complete .env.local (30 seconds)

1. Unzip `datore-v5-production-v9.zip` to a folder on your computer
2. Open `.env.local` in any text editor (VS Code, Notepad, etc.)
3. Go to: **Supabase Dashboard** → **Settings** (gear icon bottom-left) → **API**
4. Under "Project API keys", find **service_role** `secret`
5. Click the **eye icon** to reveal the key (starts with `eyJ...`)
6. Copy it
7. In `.env.local`, replace `PASTE_YOUR_SERVICE_ROLE_KEY_HERE` with the actual key
8. Save the file

Your `.env.local` should now look like:
```
NEXT_PUBLIC_SUPABASE_URL=https://ghztxqviaquxhzhsobiz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi....(your anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi....(your service role key)
NEXT_PUBLIC_APP_URL=https://datore.vercel.app
NODE_ENV=production
```

---

## STEP 2: Verify Migration (30 seconds)

Go to: **Supabase Dashboard** → **Table Editor** (left sidebar)

You should see these tables (scroll down if needed):
- profiles, worker_profiles, jobs, listings
- posts, comments, likes, friend_requests
- chat_rooms, messages, notifications
- wallets, wallet_transactions, orders, bookings
- reviews, communities, community_members, buddy_groups
- auth_audit_log, moderation_queue, consent_records, data_subject_requests

If any are missing, re-run `db/migration-complete.sql` in SQL Editor.

---

## STEP 3: Create Storage Buckets (2 minutes)

Go to: **Supabase Dashboard** → **Storage** (left sidebar, bucket icon)

### Bucket 1: avatars
1. Click **"New bucket"** button (top right)
2. Name: `avatars`
3. Toggle **"Public bucket"** to ON (green)
4. Click **"Create bucket"**
5. After creation → click on "avatars" → **Policies** tab
6. Click **"New policy"** → **"For full customization"**
7. Policy name: `avatar_upload`
8. Allowed operation: **INSERT**
9. Target roles: **authenticated**
10. WITH CHECK expression: `true`
11. Click **"Review"** → **"Save policy"**
12. Add another policy: **SELECT** for **public** with USING: `true`

### Bucket 2: post-media
1. Click **"New bucket"**
2. Name: `post-media`
3. Toggle **"Public bucket"** to ON
4. Click **"Create bucket"**
5. Add same 2 policies as avatars (INSERT for authenticated, SELECT for public)

### Bucket 3: documents
1. Click **"New bucket"**
2. Name: `documents`
3. Leave "Public bucket" OFF (private)
4. Click **"Create bucket"**
5. Add policy: INSERT for authenticated, SELECT for authenticated

### Verification:
You should now see 3 buckets in Storage:
- avatars (Public)
- post-media (Public)
- documents (Private)

---

## STEP 4: Enable Realtime (1 minute)

This powers live chat and push notifications.

### Method A: Via Dashboard (Recommended)
1. Go to: **Supabase Dashboard** → **Database** → **Replication** (under Database in sidebar)
2. Find the table called `supabase_realtime`
3. Under "Source", toggle ON for these tables:
   - **messages** ✓
   - **notifications** ✓
4. Click **Save** if prompted

### Method B: Via SQL Editor (Alternative)
If you can't find Replication in the UI, run this in SQL Editor:
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

### Verification:
Go to **Database** → **Replication** — you should see messages and notifications listed as enabled.

---

## STEP 5: Deploy to Vercel (5-10 minutes)

### 5A: Install Tools (if not already installed)

Open your computer's terminal (Command Prompt on Windows, Terminal on Mac):

```bash
# Install Node.js if not installed: https://nodejs.org (download LTS version)
node --version    # Should show v18+ or v20+

# Install Git if not installed: https://git-scm.com
git --version     # Should show version

# Install Vercel CLI
npm install -g vercel
```

### 5B: Prepare Your Project

```bash
# Navigate to your unzipped project folder
cd path/to/datore-v5-production-v9

# Initialize git
git init
git add .
git commit -m "Datore v5 production deploy"
```

### 5C: Push to GitHub

1. Go to **github.com** → Click **"+"** (top right) → **"New repository"**
2. Name: `datore` (or `datore-v5`)
3. Leave it **Private**
4. Do NOT initialize with README
5. Click **"Create repository"**
6. Copy the remote URL shown (https://github.com/YOUR_USERNAME/datore.git)

```bash
# In your terminal:
git remote add origin https://github.com/YOUR_USERNAME/datore.git
git branch -M main
git push -u origin main
```

### 5D: Deploy on Vercel

1. Go to **vercel.com** → Sign in (use your GitHub account)
2. Click **"Add New..."** → **"Project"**
3. Find your `datore` repo → Click **"Import"**
4. Framework Preset: **Next.js** (should auto-detect)
5. **CRITICAL — Environment Variables**: Click "Environment Variables" and add ALL 4:

```
Name                              Value
─────────────────────────────     ──────────────
NEXT_PUBLIC_SUPABASE_URL          https://ghztxqviaquxhzhsobiz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY     eyJhbGciOiJIUzI1NiIs...(your full anon key)
SUPABASE_SERVICE_ROLE_KEY         eyJhbGciOi...(your service role key)
NEXT_PUBLIC_APP_URL               (leave blank for now)
```

6. Click **"Deploy"**
7. Wait 1-3 minutes for build to complete
8. You'll get a URL like: `https://datore-abc123.vercel.app`

### 5E: Update APP_URL After Deploy

1. In Vercel Dashboard → Your project → **Settings** → **Environment Variables**
2. Find `NEXT_PUBLIC_APP_URL`
3. Set value to your new URL: `https://datore-abc123.vercel.app`
4. Click **Save**
5. Go to **Deployments** tab → Click **"..."** on latest → **"Redeploy"**

---

## STEP 6: Configure Auth Redirect URLs (2 minutes)

### 6A: Supabase Auth Settings

1. Go to: **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Site URL**: Set to your Vercel URL
   ```
   https://datore-abc123.vercel.app
   ```
3. **Redirect URLs**: Click **"Add URL"** and add:
   ```
   https://datore-abc123.vercel.app/home
   https://datore-abc123.vercel.app/login
   https://datore-abc123.vercel.app/**
   ```
4. Click **Save**

### 6B: Google OAuth (for "Sign in with Google")

#### In Google Cloud Console:
1. Go to: **console.cloud.google.com**
2. Select your project (or create one: "Datore")
3. **APIs & Services** → **Credentials**
4. Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
5. If asked to configure consent screen first:
   - User Type: **External**
   - App name: **Datore**
   - User support email: **rs@aarnaitai.com**
   - Authorized domains: add `supabase.co`
   - Developer email: **rs@aarnaitai.com**
   - Click **Save and Continue** through all steps
6. Back in Credentials → **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
7. Application type: **Web application**
8. Name: **Datore Web**
9. Authorized redirect URIs → **"+ ADD URI"**:
   ```
   https://ghztxqviaquxhzhsobiz.supabase.co/auth/v1/callback
   ```
10. Click **"CREATE"**
11. **Copy the Client ID and Client Secret** shown in the popup

#### In Supabase:
1. **Supabase Dashboard** → **Authentication** → **Providers**
2. Find **Google** → Click to expand
3. Toggle **"Enable Sign in with Google"** to ON
4. Paste your **Client ID**
5. Paste your **Client Secret**
6. Click **Save**

### 6C: Phone OTP (Optional — for SMS verification)

This requires a Twilio account:
1. Go to **twilio.com** → Sign up for free trial
2. Get a phone number
3. Note your Account SID, Auth Token, and phone number
4. In Supabase → Authentication → Providers → **Phone** → Enable
5. Add Twilio credentials
6. Save

---

## STEP 7: Run the Test Agent (2 minutes)

The test agent verifies everything is working:

```bash
cd path/to/your/datore-project

# Pre-deploy checks (runs locally)
node datore-test-agent.js --check

# After deploy — test your live URL
node datore-test-agent.js --test https://datore-abc123.vercel.app

# Or do everything at once
node datore-test-agent.js --all
```

The agent tests:
- Environment configuration (keys present, format correct)
- Project structure (all required files exist)
- Supabase client (63 functions present)
- Security (headers, rate limiting, no exposed secrets)
- Build (npm install + next build pass)
- All 14 critical page routes respond
- All 7 API routes respond
- Supabase connectivity (auth service, OAuth status)
- SSL/TLS active
- Performance (TTFB measurement)
- Vulnerability checks (.env.local not exposed, .git not exposed)

Green ✓ = pass, Red ✗ = must fix, Yellow ⚠ = warning

---

## STEP 8: Test Manually (5 minutes)

Open your Vercel URL in a browser:

### Test 1: Sign Up
1. Click "Sign Up"
2. Enter email + password + name
3. Check: Supabase Dashboard → Authentication → Users → your user should appear
4. Check: Table Editor → profiles → your profile auto-created
5. Check: Table Editor → wallets → wallet auto-created with 0 balance

### Test 2: Create a Post
1. Go to Home feed
2. Write "Hello Datore!" and post
3. Check: Table Editor → posts → your post should appear

### Test 3: Chat
1. Open Messages
2. Start a conversation (if another test user exists)
3. Messages should appear in Table Editor → messages

### Test 4: Upload Avatar
1. Go to Profile → Edit
2. Upload a photo
3. Check: Supabase → Storage → avatars → your file should appear

---

## Troubleshooting

### Build fails on Vercel
- Check Vercel → Deployments → click failed deployment → read build logs
- Most common: TypeScript errors that don't break dev but break prod build
- Fix: Check the specific error line and file

### "Supabase credentials missing" in console
- Vercel → Settings → Environment Variables → ensure all 4 are set
- Redeploy after adding/changing env vars

### Google OAuth not working
- Ensure redirect URI exactly matches: `https://ghztxqviaquxhzhsobiz.supabase.co/auth/v1/callback`
- Ensure Google provider is enabled in Supabase Auth

### Pages show demo data only
- This is expected until real users create content
- The demo data displays alongside real data as a fallback

### Chat not updating in real-time
- Ensure Realtime is enabled for `messages` table (Step 4)
- Check Supabase plan limits (free tier: 200 concurrent connections)
