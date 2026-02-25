# SkillConnect — Full-Stack Mobile App Development Prompt

## 🎯 Project Vision

Build a **peer-to-peer skills marketplace mobile application** (similar to Kijiji / Facebook Marketplace, but for human skills and services). The platform enables individuals to list their skills at affordable market rates, connecting them with users who need those services — especially as AI and robotics displace traditional jobs. The app prioritizes **trust, safety, affordability, and accessibility**.

**App Name (Suggested):** SkillConnect (or as specified by the client)  
**Platforms:** iOS & Android (cross-platform using React Native or Flutter)  
**Backend:** Node.js / Firebase / Supabase (or equivalent scalable backend)  
**Database:** PostgreSQL / Firestore  
**Payments:** Stripe / Razorpay with in-app wallet system  

---

## 📐 Core Architecture & Tech Stack

### Recommended Stack

| Layer | Technology |
|---|---|
| Frontend (Mobile) | React Native (Expo) or Flutter |
| Frontend (Web Admin) | React.js / Next.js |
| Backend API | Node.js + Express / NestJS |
| Database | PostgreSQL (primary) + Redis (caching) |
| Real-time | Socket.io / Firebase Realtime DB |
| Auth | Firebase Auth / Auth0 (phone OTP + email + social login) |
| Payments | Stripe Connect / Razorpay (with split payment support) |
| Maps & Location | Google Maps SDK + Geolocation API |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| Voice/Video Calls | Twilio / Agora.io / WebRTC |
| Chatbot | Dialogflow / OpenAI API / Rasa |
| QR Code | react-native-qrcode-svg + camera scanner |
| File Storage | AWS S3 / Firebase Storage / Cloudinary |
| Search | Algolia / Elasticsearch |
| CI/CD | GitHub Actions + Fastlane |

---

## 👥 User Roles

### 1. Worker (Seller / Service Provider)
- Individuals offering skills and services
- Can be **Licensed** or **Non-Licensed**
- Can apply for **Criminal Background Check Verification Badge**
- Sets their own pricing (encouraged to be below standard market rates)
- Has a public profile with QR code for in-person identity verification

### 2. Customer (Buyer / Service Seeker)
- Individuals looking to hire workers for tasks/services
- Can browse, filter, book, pay, and rate workers
- Can scan worker QR codes for safety verification

### 3. Admin (Platform Owner — AARNAIT AI)
- Manages users, categories, verifications, disputes, and payouts
- Monitors platform analytics and revenue (1% commission)
- Approves/rejects criminal check badge applications

---

## 🔐 Authentication & Onboarding

### Registration Flow
1. **Sign Up** via Phone Number (OTP), Email, Google, or Apple Sign-In
2. **Role Selection:** "I want to hire" / "I want to offer my skills" / "Both"
3. **Profile Setup:**
   - Full Name, Profile Photo, Date of Birth, Gender
   - Address (with GPS auto-detect)
   - Government ID upload (Aadhaar, PAN, Driver's License, Passport — based on country)
   - Bio / About Me section
4. **For Workers — Additional Fields:**
   - Select skill categories (multi-select)
   - Licensed or Non-Licensed toggle per skill
   - License/certification document upload (if applicable)
   - Hourly rate or per-job pricing
   - Availability schedule (calendar-based)
   - Service radius (how far they're willing to travel)
5. **Terms & Conditions + Privacy Policy** acceptance
6. **Email/Phone Verification** before account activation

### Login
- Phone OTP / Email + Password / Biometric (Fingerprint / Face ID)
- "Remember Me" and session management
- Multi-device support with active session tracking

---

## 🛡️ Criminal Background Check & Safety Badge System

### Verification Flow
1. Worker applies for "Verified Safe" badge from within the app
2. Worker uploads:
   - Government-issued ID (front + back)
   - Recent passport-size photo
   - Local police station name and address
   - Police Clearance Certificate (PCC) or equivalent document
3. **Admin Review:**
   - Admin verifies document authenticity
   - (Optional) Integration with local police verification API where available
   - Admin approves or rejects with reason
4. **Badge Display:**
   - ✅ Green "Police Verified" badge on profile
   - Badge shows: verification date, issuing authority, and expiry date
   - Badge auto-expires after 12 months — worker must re-verify annually
5. **Non-Verified Workers:**
   - Can still operate on the platform
   - Shown with a "Not Yet Verified" neutral indicator
   - Users are informed that this worker hasn't completed background verification

### QR Code Safety Profile System
- Every worker gets a **unique dynamic QR code** on their profile
- When a customer meets a worker in person, they **scan the QR code** using the app's built-in scanner
- **QR scan reveals a Safety Profile Card:**
  - Worker's verified name and photo
  - Police verification badge status (Verified / Not Verified)
  - License status per skill
  - Overall rating and total completed jobs
  - Member since date
  - Any safety warnings or flags
- QR codes are **time-limited and refresh periodically** to prevent screenshot fraud
- Scanning also **logs the meeting** for safety audit trail (timestamp + GPS location)

---

## 📂 Skill Categories & Classification

### Worker Classification

**By Verification:**
- 🟢 Police Verified + Licensed
- 🔵 Police Verified + Non-Licensed
- 🟡 Not Verified + Licensed
- ⚪ Not Verified + Non-Licensed

**By Skill Category (Expandable — Admin can add/remove):**

| Category | Example Skills |
|---|---|
| Home Services | Plumbing, Electrical, Carpentry, Painting, Cleaning |
| Tech & IT | Computer Repair, Phone Repair, Website Setup, Data Entry, Basic Coding |
| Education & Tutoring | Math Tutor, Language Teacher, Music Lessons, Homework Help |
| Health & Wellness | Yoga Instructor, Personal Trainer, Massage Therapy, Elder Care |
| Beauty & Grooming | Haircut, Makeup, Mehendi, Nail Art |
| Automotive | Car Wash, Mechanic, Driving Lessons |
| Events & Entertainment | DJ, Photography, Videography, Catering, Decoration |
| Delivery & Errands | Grocery Pickup, Courier, Moving Help, Pet Walking |
| Creative & Design | Graphic Design, Video Editing, Content Writing, Social Media |
| Legal & Finance | Tax Filing Help, Document Assistance, Notary |
| Agriculture & Gardening | Lawn Mowing, Gardening, Farm Help |
| Skilled Trades | Welding, Masonry, Tiling, AC Repair |
| Miscellaneous | Any skill not in above categories (admin-moderated) |

### Sub-Categories
- Each main category has sub-categories (admin-configurable)
- Workers can list in up to 5 categories
- Each listing can have different pricing

---

## 🔍 Search, Discovery & Filtering

### Search Features
- **Text Search** with auto-suggestions and typo tolerance (powered by Algolia/Elasticsearch)
- **Voice Command Search:** "Find me a plumber near me under ₹500/hour"
- **Category Browsing** with visual icons
- **Recent Searches** and **Saved Searches**

### Filter Options

| Filter | Options |
|---|---|
| Distance / Radius | 1 km, 5 km, 10 km, 25 km, 50 km, Custom |
| Price Range | Slider (min–max per hour or per job) |
| Rating | 4★+, 3★+, Any |
| Verification Status | Police Verified Only / All |
| License Status | Licensed Only / Non-Licensed / All |
| Availability | Available Now / Available Today / This Week / Custom Date |
| Category | Dropdown or multi-select |
| Sort By | Distance, Price (Low→High), Price (High→Low), Rating, Most Jobs Completed, Newest |

### Map View
- Google Maps integration showing nearby workers as pins
- Tap pin to see mini-profile card
- Cluster view when zoomed out
- Real-time location for "Available Now" workers (with their permission)

---

## 👤 User Profiles

### Worker Profile (Public View)
- Profile photo + cover photo
- Name, Bio, Location (city-level, not exact address)
- Verification badges (Police Verified, Licensed, Top Rated)
- Skills listed with individual pricing
- Portfolio / Work photos gallery (up to 20 images)
- Availability calendar
- Rating (overall + breakdown: Punctuality, Quality, Communication, Value)
- Reviews from customers (with replies)
- Total jobs completed
- Member since date
- Response time indicator
- QR Code button (for in-person scanning)
- "Hire Me" / "Contact" / "Save" buttons

### Customer Profile (Public View)
- Profile photo
- Name, Location (city-level)
- Rating as a customer
- Reviews from workers
- Member since date
- Jobs posted count

### Profile Settings (Private)
- Edit personal information
- Manage skills and pricing (workers)
- Notification preferences
- Privacy settings (who can see what)
- Linked payment methods
- Verification documents
- Block/report management
- Account deletion option

---

## 💬 In-App Communication

### Chat System
- **Real-time text messaging** between customer and worker
- Supports: Text, Images, Files (PDFs for quotes/invoices), Location sharing, Voice messages
- **Read receipts** and **typing indicators**
- Chat history preserved per job/booking
- **Pre-booking chat:** Users can message workers before hiring
- **Smart Reply Suggestions:** Quick replies like "Yes, I'm available", "What time?", "Send me the address"
- **Auto-translate** for multi-language support (using Google Translate API)
- Chat is **disabled** after 7 days of job completion (to encourage platform use)
- Report/block within chat

### Voice & Video Calls
- **In-app voice calling** (VoIP) — no personal phone numbers exchanged
- **Optional video call** for consultations or remote assessments
- Call duration tracking
- Call recording opt-in (with consent notification)
- Powered by Twilio / Agora.io / WebRTC

---

## 🤖 AI Chatbot & Voice Assistant

### Chatbot Features
- Available on every screen via floating action button
- **Capabilities:**
  - Help users find the right worker: "I need someone to fix my AC"
  - Answer FAQs: pricing, how verification works, payment process
  - Guide new users through onboarding
  - Help workers optimize their profiles
  - Handle basic dispute resolution
  - Provide price suggestions based on market rates
  - Multi-language support (Hindi, English, regional languages)
- **Powered by:** OpenAI API / Dialogflow / Custom fine-tuned model
- Escalation to human support when chatbot can't resolve

### Voice Command Integration
- "Hey SkillConnect, find me an electrician nearby"
- "Book [Worker Name] for tomorrow at 3 PM"
- "What's my wallet balance?"
- "Show me my upcoming bookings"
- Voice-to-text for search and chat
- Accessibility-first design for visually impaired users

---

## 📅 Booking & Job Management

### Booking Flow
1. Customer selects a worker and chooses a service
2. Selects date, time, and provides job description
3. (Optional) Attaches photos or documents describing the job
4. Sends booking request to worker
5. Worker accepts / rejects / proposes alternative time
6. Once accepted → booking confirmed → both parties notified
7. Customer can cancel before worker starts (cancellation policy applies)

### Job Lifecycle States
```
REQUESTED → ACCEPTED → IN_PROGRESS → COMPLETED → RATED
              ↓
           REJECTED / CANCELLED / DISPUTED
```

### Job Details Screen
- Job status with timeline visualization
- Worker/Customer details
- Chat thread linked to this job
- Location with map
- Agreed price
- Start/end time
- Before/after photos (uploaded by worker)
- Invoice auto-generated on completion
- Rate & Review prompt after completion

---

## 💰 Payment System

### Payment Architecture
- **In-app payments only** (no cash transactions encouraged)
- **Commission Model:** 1% platform fee to AARNAIT AI, 99% to the worker
- **Payment Split:** Handled automatically via Stripe Connect / Razorpay Split Payments

### Payment Flow
1. Customer books a service → amount is **held in escrow**
2. Worker completes the job
3. Customer confirms job completion (or auto-confirmed after 48 hours)
4. Payment released: 99% to worker's wallet, 1% to platform
5. Worker can withdraw to bank account (instant or scheduled)

### Payment Features
- **In-App Wallet** for both customers and workers
- **Add Money** via UPI, Credit/Debit Card, Net Banking, Mobile Wallets
- **Transaction History** with filters and export
- **Auto-invoicing** with GST compliance (for India)
- **Tipping:** Customer can add optional tip (100% goes to worker)
- **Refund System:** Full/partial refunds for disputed jobs
- **Subscription Plans (Future):** Premium worker profiles with lower commission
- **Promo Codes & Referral Credits**

### Revenue Dashboard (Admin)
- Total transactions
- Commission earned (1% tracking)
- Payout history
- Refund tracking
- Revenue by category, city, and time period

---

## ⭐ Dual Rating & Review System

### Rating Structure
- **After every completed job, BOTH parties rate each other**
- Rating is mandatory to unlock next booking/job

**Customer Rates Worker:**

| Criteria | Scale |
|---|---|
| Quality of Work | 1–5 ★ |
| Punctuality | 1–5 ★ |
| Communication | 1–5 ★ |
| Value for Money | 1–5 ★ |
| Overall Rating | Auto-calculated average |
| Written Review | Optional (up to 500 characters) |
| Photo Review | Optional (upload before/after images) |

**Worker Rates Customer:**

| Criteria | Scale |
|---|---|
| Clear Instructions | 1–5 ★ |
| Respectfulness | 1–5 ★ |
| Timely Payment | 1–5 ★ |
| Overall Rating | Auto-calculated average |
| Written Review | Optional (up to 500 characters) |

### Rating Rules
- Reviews are **visible only after both parties have submitted** (prevents retaliation)
- Users can **report fake reviews** (admin moderation)
- Workers with consistent 4.5+ ★ rating earn a "Top Rated" badge
- Customers with consistent 4.5+ ★ rating earn a "Great Customer" badge
- Workers below 2.0 ★ after 10+ jobs receive a warning → potential suspension

---

## 🔔 Notifications System

### Push Notifications
- New booking request / acceptance / rejection
- Chat messages
- Payment received / refund processed
- Verification status update
- Rating received
- Promotional offers and platform updates
- Nearby new worker matches for saved searches
- Job reminders (30 min before scheduled time)

### In-App Notification Center
- All notifications in a feed with read/unread states
- Filter by type (Bookings, Payments, Chat, System)
- Notification preferences (granular on/off per type)

### Email Notifications
- Booking confirmations
- Payment receipts
- Weekly summary (earnings for workers, spending for customers)
- Account security alerts

---

## 🛡️ Safety & Trust Features

### For Customers
- QR code scanning for in-person worker verification
- Police verification badge visibility
- Share live location with emergency contacts during service
- SOS / Emergency button (sends GPS location to emergency contacts + platform)
- In-app reporting and blocking
- Escrow payment (money held until job is done)

### For Workers
- Customer rating visible before accepting jobs
- Option to decline jobs without penalty (within limits)
- GPS tracking during active jobs (with consent)
- Harassment reporting system
- Income protection: guaranteed payout for completed work

### Platform Safety
- AI-powered content moderation for chat (flag inappropriate messages)
- Fake profile detection (duplicate phone/email, AI face detection)
- Document verification via OCR + manual review
- Automated fraud detection on payments
- Two-factor authentication (2FA)
- Data encryption at rest and in transit (AES-256, TLS 1.3)

---

## 🌐 Localization & Accessibility

### Multi-Language Support
- English, Hindi, and regional Indian languages (Phase 1)
- Auto-detect device language
- In-app language switcher
- Chat auto-translate

### Accessibility
- Screen reader compatibility (VoiceOver / TalkBack)
- High contrast mode
- Adjustable font sizes
- Voice command navigation
- Haptic feedback for key actions

---

## 📊 Admin Dashboard (Web Panel)

### Dashboard Modules
1. **Overview:** Total users, active workers, jobs completed, revenue
2. **User Management:** View/edit/suspend/delete users, manual verification
3. **Verification Queue:** Pending police check applications with approve/reject
4. **Category Management:** Add/edit/remove skill categories and sub-categories
5. **Job Monitoring:** Active jobs, disputes, cancellations
6. **Payment Management:** Transaction logs, commission tracking, refund processing
7. **Reviews Moderation:** Flagged reviews, fake review detection
8. **Reports & Analytics:** Revenue charts, user growth, popular categories, geographic heatmaps
9. **Content Management:** Push notifications, banners, promotions, FAQs
10. **Support Tickets:** Customer support inbox with priority and status tracking
11. **Settings:** Platform fee percentage, cancellation policies, badge expiry durations

---

## 📱 Screen-by-Screen Breakdown (Key Screens)

1. **Splash Screen** → Animated logo
2. **Onboarding Carousel** → 3–4 slides explaining the app
3. **Login / Register** → Phone OTP, Email, Social
4. **Role Selection** → Buyer / Seller / Both
5. **Home Feed** → Category grid + nearby workers + search bar + chatbot FAB
6. **Search Results** → List/Map toggle + filters
7. **Worker Profile** → Full details + hire button + QR code
8. **Booking Screen** → Date/time picker + job description + price confirmation
9. **Chat Screen** → Messaging + media + voice messages + call button
10. **Voice/Video Call Screen** → In-app calling UI
11. **QR Scanner** → Camera-based scanner → Safety Profile Card overlay
12. **Job Tracking** → Live status + timeline + map
13. **Payment Screen** → Wallet, Pay, Transaction history
14. **Rating Screen** → Star rating + written review + photo upload
15. **My Profile** → Edit profile, settings, documents, wallet
16. **Notification Center** → All notifications feed
17. **Chatbot Screen** → AI assistant conversation
18. **Admin Panel (Web)** → All admin modules

---

## 🚀 Development Phases

### Phase 1 — MVP (8–12 Weeks)
- User registration and authentication (OTP + email)
- Worker and customer profiles
- Skill categories (pre-loaded, admin-managed)
- Basic search with distance filter
- In-app chat (text only)
- Booking flow (request → accept → complete)
- Basic payment integration (escrow + 1% commission split)
- Dual rating system
- Push notifications
- Basic admin panel

### Phase 2 — Trust & Safety (4–6 Weeks)
- Police verification badge system
- QR code generation and scanning
- Safety Profile Card
- SOS / Emergency button
- Document upload and OCR verification
- Enhanced admin verification queue

### Phase 3 — Communication & AI (4–6 Weeks)
- Voice and video calling (VoIP)
- AI Chatbot integration
- Voice command search
- Smart reply suggestions
- Auto-translate in chat
- Voice messages in chat

### Phase 4 — Growth & Optimization (Ongoing)
- Advanced analytics dashboard
- Promo codes and referral system
- Worker subscription tiers
- Multi-language rollout
- Performance optimization
- Marketing integrations (deep links, app install campaigns)
- Web version (responsive PWA)

---

## 📋 Non-Functional Requirements

| Requirement | Target |
|---|---|
| App Load Time | < 3 seconds |
| API Response Time | < 500ms (95th percentile) |
| Uptime | 99.9% |
| Concurrent Users | 10,000+ (scalable) |
| Data Encryption | AES-256 at rest, TLS 1.3 in transit |
| GDPR / Data Privacy | Compliant (with Indian IT Act as applicable) |
| Offline Mode | Basic browsing + cached profiles |
| App Size | < 50 MB (initial install) |
| Min OS Support | iOS 14+ / Android 8+ |

---

## 💡 Monetization Strategy

| Revenue Stream | Details |
|---|---|
| Transaction Commission | 1% on every completed job payment |
| Featured Listings | Workers pay to appear at top of search results |
| Premium Worker Subscription | Lower commission (0.5%), priority support, enhanced profile |
| Promoted Categories | Businesses sponsor skill categories |
| In-App Advertising (Optional) | Non-intrusive banner/native ads (Phase 4+) |

---

## 📎 Key API Integrations

- **Google Maps Platform** — Geocoding, Distance Matrix, Places, Maps SDK
- **Firebase** — Auth, Cloud Messaging, Firestore, Storage, Analytics
- **Stripe Connect / Razorpay** — Payments, Split Payments, Payouts
- **Twilio / Agora** — Voice and Video Calling
- **OpenAI / Dialogflow** — Chatbot and NLP
- **Google Translate API** — Multi-language chat
- **Algolia / Elasticsearch** — Search
- **SendGrid / AWS SES** — Transactional emails
- **Cloudinary** — Image optimization and CDN

---

## ✅ Acceptance Criteria Summary

The app is considered complete when:
1. Users can register, create profiles, and switch between buyer/seller roles
2. Workers can list skills with pricing across categories
3. Customers can search, filter by distance/price/rating/verification, and book workers
4. Police verification badge system is functional with admin approval workflow
5. QR code scanning shows the worker's Safety Profile Card
6. In-app chat (text, image, voice message) and VoIP calling work reliably
7. AI Chatbot assists users with search, FAQs, and onboarding
8. Voice command search functions correctly
9. Payments process via escrow with automatic 99/1% split
10. Dual rating system works — both parties rate after job completion
11. Push notifications work for all key events
12. Admin panel allows full platform management
13. App passes security audit and performance benchmarks

---

*This prompt document is prepared for Detorte. All intellectual property rights reserved.*
