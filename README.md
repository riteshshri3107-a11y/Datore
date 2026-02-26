# Datore - Peer-to-Peer Skills Marketplace

**By AARNAIT AI** | [datore.vercel.app](https://datore.vercel.app)

A safe, reliable marketplace connecting you with police-verified professionals at affordable rates.

## Tech Stack
- **Next.js 14** (App Router, TypeScript)
- **Supabase** (Auth, PostgreSQL, Realtime, Storage)
- **Tailwind CSS** (Custom dark theme)
- **Zustand** (State management)
- **Stripe** (Escrow payments - optional)

## Features
- 🛡️ Police verification badges with annual renewal
- 📱 QR code safety profiles (scan to verify)
- 💰 Escrow payments (99% to worker, 1% platform fee)
- ⭐ Dual rating system (both parties rate)
- 🤖 AI chatbot assistant
- 💬 Real-time chat (Supabase Realtime)
- 🔍 Search with filters (category, price, rating, verified)
- 📊 Admin dashboard with 7 modules
- 12+ skill categories

## Setup

### 1. Run SQL Schema
Go to Supabase Dashboard → SQL Editor → paste contents of `supabase_schema.sql` → Run

### 2. Enable Auth Providers
Supabase Dashboard → Authentication → Providers → Enable Email + Google

### 3. Install & Run
```bash
npm install
npm run dev
```

### 4. Deploy to Vercel
Push to GitHub → Import in Vercel → Add env vars → Deploy

### 5. Make yourself Admin
In Supabase → Table Editor → profiles → find your row → set role to "admin"
Then visit /admin

## Environment Variables
See `.env.example` for all required variables.

## Project Structure
```
app/
  (auth)/login/     - Login & registration
  (main)/           - Main app (home, search, profile, dashboard, messages, notifications)
  (chat)/chat/[id]/ - Real-time chat
  admin/            - Admin dashboard
  api/              - API routes (workers, bookings, payments, chat, qr)
lib/                - Supabase client, utilities
store/              - Zustand state stores
types/              - TypeScript interfaces
```
