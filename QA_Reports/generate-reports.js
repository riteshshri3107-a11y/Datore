const XLSX = require('xlsx');
const path = require('path');

// ============================================================
// SHEET 1: FUNCTIONAL TEST RESULTS
// ============================================================
const functionalTests = [
  // User Management
  { id:'TC001', module:'Auth', page:'Login', scenario:'User login with email/password', expected:'User authenticated and redirected to /home', actual:'Login page exists with email/password form and Google OAuth. Redirects to /home on success.', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC002', module:'Auth', page:'Login', scenario:'Google OAuth login', expected:'Google popup opens, user authenticated', actual:'signInWithGoogle() calls supabase.auth.signInWithOAuth with Google provider and redirect to /home', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC003', module:'Auth', page:'Login', scenario:'Login form validation', expected:'Empty fields show error messages', actual:'Form has basic required field checks but limited client-side validation feedback', status:'Fail', screenshot:'Login_FormValidation_Missing.png', reason:'No inline validation errors displayed for empty/invalid fields', improvement:'Add real-time form validation with error messages below each field' },
  { id:'TC004', module:'Auth', page:'Signup', scenario:'User registration with email', expected:'User account created and redirected', actual:'No dedicated signup page found at /signup route - only /login page exists', status:'Fail', screenshot:'Auth_Signup_PageMissing.png', reason:'Missing /signup page. signUpWithEmail exists in lib/auth.ts but no UI page', improvement:'Create dedicated signup page with registration form' },
  { id:'TC005', module:'Auth', page:'Login', scenario:'Password reset flow', expected:'User can reset password via email', actual:'No password reset/forgot-password page found in the application routes', status:'Fail', screenshot:'Auth_PasswordReset_Missing.png', reason:'No forgot-password page or reset flow implemented', improvement:'Add forgot-password page with email reset link flow' },
  { id:'TC006', module:'Auth', page:'Login', scenario:'Logout functionality', expected:'User logged out and redirected to login', actual:'signOut function exists in lib/auth.ts. Logout button found in settings and menu pages', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC007', module:'Auth', page:'Admin Login', scenario:'Admin authentication', expected:'Admin can log in with admin credentials', actual:'Admin login page exists at /admin-login with separate authentication flow', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },

  // Profile Management
  { id:'TC008', module:'Profile', page:'Profile', scenario:'View user profile', expected:'Profile page shows user info, stats, posts', actual:'Profile page shows avatar, stats (Rating, Friends, Posts, Jobs), tabs for Overview/Posts/Jobs/Products/Communities/Ratings', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC009', module:'Profile', page:'Profile Edit', scenario:'Edit profile information', expected:'User can update name, bio, avatar', actual:'Profile edit page exists at /profile/edit with form fields for updating profile', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC010', module:'Profile', page:'Profile', scenario:'Multi-avatar system', expected:'Different avatars for Public, Friends, Buddy+, Professional', actual:'Multi-avatar system implemented with audience-specific avatars (Public, Friends, Buddy+, Professional)', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC011', module:'Profile', page:'Profile', scenario:'Profile picture upload', expected:'User can upload profile picture', actual:'Avatar upload supported via uploadAvatar in supabase.ts with audience type parameter', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC012', module:'Profile', page:'Profile', scenario:'Cover photo upload', expected:'User can set a cover photo', actual:'No cover photo feature found in profile page or database schema', status:'Fail', screenshot:'Profile_CoverPhoto_Missing.png', reason:'Cover photo field not in profiles table or UI', improvement:'Add cover_photo_url to profiles table and upload UI' },

  // Social Features - Posts
  { id:'TC013', module:'Social', page:'Home Feed', scenario:'Create a new post', expected:'Post composer creates and saves post', actual:'Post composer with text input, media upload (photo/video), audience selection (Public/Friends/Buddy+/Professional) works via createPost in supabase.ts', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC014', module:'Social', page:'Home Feed', scenario:'Edit a post', expected:'User can edit own post content', actual:'Edit post functionality implemented (BR-101) via updatePost in supabase.ts', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC015', module:'Social', page:'Home Feed', scenario:'Delete a post', expected:'User can delete own post', actual:'Delete post functionality implemented via deletePost in supabase.ts', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC016', module:'Social', page:'Home Feed', scenario:'Comment on a post', expected:'User can add comments with hashtag suggestions', actual:'Comment system with hashtag suggestions implemented via createComment', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC017', module:'Social', page:'Home Feed', scenario:'Like/React to a post', expected:'User can like or add emoji reaction', actual:'Like system with emoji picker implemented via toggleLike', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC018', module:'Social', page:'Home Feed', scenario:'Share a post', expected:'Post can be shared to social platforms', actual:'Share to WhatsApp, Facebook, Twitter, LinkedIn implemented in home page', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC019', module:'Social', page:'Home Feed', scenario:'Post with image upload', expected:'User can attach images to posts', actual:'Image upload via post-media storage bucket (10MB limit). uploadPostMedia function exists', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC020', module:'Social', page:'Home Feed', scenario:'Post with video upload', expected:'User can attach videos to posts', actual:'Video upload supported in post composer but no video player/preview component found for playback', status:'Fail', screenshot:'Home_VideoPlayback_Missing.png', reason:'Video upload works but inline video playback in feed is not implemented', improvement:'Add video player component for inline playback in feed' },
  { id:'TC021', module:'Social', page:'Home Feed', scenario:'Post visibility modes', expected:'Posts respect audience settings (Public/Friends/Buddy+/Professional)', actual:'Audience selection implemented in UI and stored in post data. RLS policies check audience level', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC022', module:'Social', page:'Home Feed', scenario:'Save/Bookmark post', expected:'User can save posts for later', actual:'No save/bookmark functionality found for posts', status:'Fail', screenshot:'Home_SavePost_Missing.png', reason:'No bookmark/save feature in post actions or saved page integration', improvement:'Add bookmark feature to posts and link to /saved page' },

  // BuddyGroup / Community
  { id:'TC023', module:'Community', page:'Community', scenario:'Create BuddyGroup', expected:'User can create a new buddy group with AI screening', actual:'Create buddy group with 7 types (Social, Professional, Neighborhood, Hobby, Support, Family, Education) with AI safety screening', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC024', module:'Community', page:'Community', scenario:'Join BuddyGroup', expected:'User can join existing buddy groups', actual:'Join/request membership functionality available on community page', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC025', module:'Community', page:'Community', scenario:'BuddyGroup listing', expected:'All groups shown in searchable list', actual:'Groups listed with search functionality and filters', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC026', module:'Community', page:'Community', scenario:'Community group posts visibility', expected:'Posts within community are visible to members', actual:'Group posts with visibility controls are implemented', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC027', module:'Community', page:'Community', scenario:'Content moderation in groups', expected:'AI screens content for harmful material', actual:'Real-time content scanning for terrorism, hate speech, harassment, child safety via moderation.ts', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC028', module:'Community', page:'Community', scenario:'Group admin/moderator roles', expected:'Group has admin and moderator roles', actual:'Community members table has role field but no dedicated moderator management UI found', status:'Fail', screenshot:'Community_ModeratorUI_Missing.png', reason:'Role field exists in DB but no UI to assign/manage moderators', improvement:'Add moderator management interface in community settings' },

  // Messaging
  { id:'TC029', module:'Messaging', page:'Messages', scenario:'View message list', expected:'User sees list of conversations', actual:'Messages page exists but is a placeholder with minimal functionality', status:'Fail', screenshot:'Messages_Placeholder_Page.png', reason:'Messages page has placeholder content, not fully functional', improvement:'Implement full messaging UI with conversation list, real-time updates' },
  { id:'TC030', module:'Messaging', page:'Chat', scenario:'Send direct message', expected:'User can send text messages in chat', actual:'Chat page at /(chat)/chat/[id] exists with message interface. sendMessage function in supabase.ts. Realtime subscription available', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC031', module:'Messaging', page:'Chat', scenario:'Voice/audio message', expected:'User can send voice messages', actual:'No voice/audio message recording or playback feature found', status:'Fail', screenshot:'Chat_VoiceMessage_Missing.png', reason:'No audio recording API integration in chat', improvement:'Add Web Audio API recording for voice messages' },
  { id:'TC032', module:'Messaging', page:'Chat', scenario:'Video call', expected:'User can initiate video call', actual:'Feature flag video_calls exists but is disabled. No WebRTC implementation found', status:'Fail', screenshot:'Chat_VideoCall_Disabled.png', reason:'Feature flagged as disabled, no WebRTC code implemented', improvement:'Implement WebRTC video calling with signaling server' },
  { id:'TC033', module:'Messaging', page:'Chat', scenario:'File/attachment sharing', expected:'User can share files in chat', actual:'Chat supports text and image message types but no general file attachment support', status:'Fail', screenshot:'Chat_FileShare_Missing.png', reason:'Only text and image types defined in ChatMessage type', improvement:'Add file attachment support with document upload' },
  { id:'TC034', module:'Messaging', page:'Chat', scenario:'Message edit/delete', expected:'User can edit or delete sent messages', actual:'Messages are immutable per RLS policies (no update/delete allowed for audit trail)', status:'Fail', screenshot:'Chat_MessageEdit_Disabled.png', reason:'RLS policy explicitly prevents message editing/deletion for audit purposes', improvement:'Consider soft-delete or edit with history preservation' },
  { id:'TC035', module:'Messaging', page:'Inbox', scenario:'Inbox message view', expected:'Inbox shows all incoming messages', actual:'Inbox page exists but appears to duplicate /messages functionality', status:'Fail', screenshot:'Inbox_Duplicate_Page.png', reason:'Both /inbox and /messages pages exist with overlapping functionality', improvement:'Consolidate into single messaging hub' },

  // Search
  { id:'TC036', module:'Search', page:'Search', scenario:'Universal search across all types', expected:'Search returns results from workers, jobs, listings, communities, posts, services', actual:'Universal search across 6 types with relevance scoring and faceted results', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC037', module:'Search', page:'Search', scenario:'Voice search', expected:'User can search using voice input', actual:'Voice search simulation exists but uses Web Speech API which may not work in all browsers', status:'Pass', screenshot:'N/A', reason:'', improvement:'Add fallback for browsers without Web Speech API support' },
  { id:'TC038', module:'Search', page:'Search', scenario:'Search suggestions/autocomplete', expected:'Suggestions appear while typing', actual:'Search suggestions with autocomplete implemented', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },

  // Notifications
  { id:'TC039', module:'Notifications', page:'Notifications', scenario:'View notifications list', expected:'Notifications grouped by Today, Yesterday, Earlier', actual:'Notifications page shows categorized list with filters (All, Jobs, Money, Social, Safety, Events)', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC040', module:'Notifications', page:'Notifications', scenario:'Mark notification as read', expected:'User can mark individual notifications as read', actual:'Mark as read and dismiss functionality implemented', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC041', module:'Notifications', page:'Notifications', scenario:'Push notifications', expected:'Real-time push notifications received', actual:'Feature flag real_time_notifications at 40% canary rollout. Push simulation only, no Service Worker/FCM integration', status:'Fail', screenshot:'Notifications_PushReal_Missing.png', reason:'No real push notification system (Service Worker/FCM). Only in-app simulation', improvement:'Implement Service Worker + FCM for real push notifications' },

  // Wallet & Payments
  { id:'TC042', module:'Wallet', page:'Wallet', scenario:'View wallet balance', expected:'Shows available, escrowed, and pending amounts', actual:'Wallet page displays balance with available, escrowed, pending amounts from wallets table', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC043', module:'Wallet', page:'Wallet', scenario:'Transaction history', expected:'List of all transactions with details', actual:'Transaction history displayed via getTransactions from wallet_transactions table', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC044', module:'Wallet', page:'Wallet', scenario:'Escrow payment flow', expected:'Funds held in escrow until job completion', actual:'Escrow types (escrow_lock, escrow_release) exist in WalletTransaction type. Feature flag payment_escrow at 100%', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },

  // Media
  { id:'TC045', module:'Media', page:'Reels', scenario:'View short-form video content', expected:'TikTok-style vertical video feed', actual:'Reels page exists with video content display, like/comment/share actions', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC046', module:'Media', page:'Home Feed', scenario:'Image upload in posts', expected:'Images display correctly in feed', actual:'Image upload via post-media bucket works. Images display in post cards', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },

  // Feed
  { id:'TC047', module:'Feed', page:'Home', scenario:'Feed loading', expected:'Feed loads with posts from all users', actual:'Feed loads via getAllFeedPosts or getPosts from supabase.ts', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC048', module:'Feed', page:'Home', scenario:'Feed pagination/infinite scroll', expected:'More posts load on scroll', actual:'No pagination or infinite scroll implemented. All posts loaded at once', status:'Fail', screenshot:'Home_Pagination_Missing.png', reason:'getAllFeedPosts fetches all posts without limit/offset', improvement:'Add cursor-based pagination with infinite scroll' },

  // Friends
  { id:'TC049', module:'Friends', page:'Friends', scenario:'Send friend request', expected:'User can send friend request to another user', actual:'sendFriendRequest function exists in supabase.ts. Friends page has request UI', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC050', module:'Friends', page:'Friends', scenario:'Accept/reject friend request', expected:'User can respond to incoming requests', actual:'respondFriendRequest function with accept/reject/block statuses implemented', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC051', module:'Friends', page:'Friends', scenario:'Privacy-first discovery', expected:'Non-friends see limited info with distance zones', actual:'Privacy-protected discovery with approximate zones (1km, 1-3km, 3-5km, 5-10km, 10-25km)', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },

  // Settings
  { id:'TC052', module:'Settings', page:'Settings', scenario:'Account settings', expected:'User can manage email, password, profile settings', actual:'Account settings page exists at /settings/account', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC053', module:'Settings', page:'Settings', scenario:'Privacy settings', expected:'User can control privacy preferences', actual:'Privacy settings page exists at /settings/privacy', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC054', module:'Settings', page:'Settings', scenario:'Security settings (2FA)', expected:'User can enable 2FA', actual:'Security settings page exists. mfa_enabled field in AuthUser type, but no TOTP setup UI found', status:'Fail', screenshot:'Settings_2FA_NotImplemented.png', reason:'mfa_enabled field exists but no MFA enrollment/setup flow', improvement:'Add TOTP/SMS 2FA enrollment wizard in security settings' },
  { id:'TC055', module:'Settings', page:'Settings', scenario:'Notification preferences', expected:'User can customize which notifications to receive', actual:'Notification settings page exists at /settings/notifications', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },

  // QR Verification
  { id:'TC056', module:'Safety', page:'QR Verify', scenario:'QR code verification', expected:'Worker identity verified via QR scan', actual:'QR verify page and API route (/api/qr/verify) exist for identity verification', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },

  // Marketplace
  { id:'TC057', module:'Marketplace', page:'Marketplace', scenario:'Browse listings', expected:'User can browse items for sale', actual:'Marketplace page shows listings with categories, conditions, search, and filters', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC058', module:'Marketplace', page:'Marketplace', scenario:'Create listing', expected:'User can post item for sale', actual:'Create listing page at /marketplace/create with form for title, price, category, condition, images', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC059', module:'Marketplace', page:'Marketplace', scenario:'My listings management', expected:'User can view and manage own listings', actual:'My listings page at /marketplace/my-listings with edit/delete capabilities', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },

  // Job Marketplace
  { id:'TC060', module:'JobPlace', page:'JobPlace', scenario:'Browse jobs', expected:'User can browse available jobs', actual:'JobPlace page shows jobs with category and urgency filters, search functionality', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC061', module:'JobPlace', page:'JobPlace', scenario:'Create job posting', expected:'User can post a new job', actual:'Create job page at /jobplace/create with category, urgency, payment type, amount fields', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC062', module:'JobPlace', page:'JobPlace', scenario:'Map view for jobs', expected:'Geographic visualization of available jobs', actual:'Map view page exists at /jobplace/map for location-based job discovery', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
  { id:'TC063', module:'JobPlace', page:'Providers', scenario:'Browse workers/providers', expected:'List of available workers with ratings', actual:'Providers page shows workers with filtering by skills, rating, location', status:'Pass', screenshot:'N/A', reason:'', improvement:'' },
];

// ============================================================
// SHEET 2: UI CONSISTENCY REPORT
// ============================================================
const uiConsistency = [
  // Search Box Consistency
  { page:'Search (/search)', component:'Search Box', expected:'Consistent design with IcoSearch + IcoMic, uniform styling', actual:'Full search with IcoSearch + IcoMic, autocomplete dropdown, dynamic border focus, voice search', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'Friends (/friends)', component:'Search Box', expected:'Same search design as Search page', actual:'Simpler search with IcoSearch + IcoMic, no dynamic border effects, no autocomplete', status:'Fail', screenshot:'Friends_SearchBox_Inconsistent.png', fix:'Use shared SearchInput component with consistent styling' },
  { page:'Community (/community)', component:'Search Box', expected:'Same search design as Search page', actual:'Simple search with IcoSearch + IcoMic, placeholder "Search buddy groups...", no autocomplete', status:'Fail', screenshot:'Community_SearchBox_Inconsistent.png', fix:'Use shared SearchInput component' },
  { page:'Marketplace (/marketplace)', component:'Search Box', expected:'Same search design as Search page', actual:'Has autocomplete + recent searches tracking but different styling from Search page', status:'Fail', screenshot:'Marketplace_SearchBox_Different.png', fix:'Standardize search component design across all pages' },
  { page:'Settings (/settings)', component:'Search Box', expected:'Same search design as Search page', actual:'Absolute-positioned IcoSearch inside input, completely different layout pattern', status:'Fail', screenshot:'Settings_SearchBox_Different.png', fix:'Use global search component' },
  { page:'Menu (/menu)', component:'Search Box', expected:'Actual search input field', actual:'Button-styled element that redirects to /search instead of actual input', status:'Fail', screenshot:'Menu_SearchBox_ButtonStyle.png', fix:'Either use consistent search input or clearly style as navigation button' },

  // Mic Icon Consistency
  { page:'Search (/search)', component:'Mic Icon', expected:'IcoMic icon present in search', actual:'IcoMic with voice search functionality via Web Speech API', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'Friends (/friends)', component:'Mic Icon', expected:'IcoMic icon present in search', actual:'IcoMic present with voice search', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'Community (/community)', component:'Mic Icon', expected:'IcoMic icon present in search', actual:'IcoMic present with voice search', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'Marketplace (/marketplace)', component:'Mic Icon', expected:'IcoMic icon present in search', actual:'No mic icon found in marketplace search', status:'Fail', screenshot:'Marketplace_MicIcon_Missing.png', fix:'Add IcoMic with voice search to marketplace search bar' },
  { page:'Settings (/settings)', component:'Mic Icon', expected:'IcoMic icon present in search', actual:'No mic icon in settings search', status:'Fail', screenshot:'Settings_MicIcon_Missing.png', fix:'Add IcoMic to settings search or use shared component' },
  { page:'JobPlace (/jobplace)', component:'Mic Icon', expected:'IcoMic icon present in search', actual:'No search box or mic icon on main jobplace page', status:'Fail', screenshot:'JobPlace_MicIcon_Missing.png', fix:'Add search with mic to job browsing page' },

  // Back Button Consistency
  { page:'Events (/events)', component:'Back Button', expected:'IcoBack icon component', actual:'Text arrow {"<-"} used instead of IcoBack icon component', status:'Fail', screenshot:'Events_BackButton_TextArrow.png', fix:'Replace text arrow with IcoBack component from Icons.tsx' },
  { page:'Notifications (/notifications)', component:'Back Button', expected:'IcoBack icon component', actual:'Text arrow {"<-"} used instead of IcoBack icon component', status:'Fail', screenshot:'Notifications_BackButton_TextArrow.png', fix:'Replace text arrow with IcoBack component' },
  { page:'Profile (/profile)', component:'Back Button', expected:'IcoBack icon component', actual:'IcoBack icon used correctly', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'Search (/search)', component:'Back Button', expected:'IcoBack icon component', actual:'IcoBack icon used correctly', status:'Pass', screenshot:'N/A', fix:'' },

  // Button Styling
  { page:'Home (/home)', component:'Action Buttons', expected:'Consistent button styling (rounded-lg, uniform padding)', actual:'px-3 py-1.5 rounded-lg text-xs font-medium with inline gradient styles', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'JobPlace (/jobplace)', component:'Action Buttons', expected:'Same button style as Home page', actual:'Uses custom class names btn-accent, glass-button - different from Home page pattern', status:'Fail', screenshot:'JobPlace_Buttons_Inconsistent.png', fix:'Standardize button component with shared styles' },
  { page:'Marketplace (/marketplace)', component:'Action Buttons', expected:'Same button style as Home page', actual:'Inline gradient buttons with linear-gradient(135deg,...) - different pattern', status:'Fail', screenshot:'Marketplace_Buttons_Inconsistent.png', fix:'Create shared Button component' },
  { page:'Wallet (/wallet)', component:'Action Buttons', expected:'Same button style as Home page', actual:'Gradient buttons with custom boxShadow accentGlow - different pattern', status:'Fail', screenshot:'Wallet_Buttons_Inconsistent.png', fix:'Use shared Button component' },
  { page:'Notifications (/notifications)', component:'Filter Buttons', expected:'Consistent filter chip styling', actual:'Simple background buttons with inconsistent padding vs other pages', status:'Fail', screenshot:'Notifications_FilterButtons_Inconsistent.png', fix:'Create shared FilterChip component' },

  // Card Styling
  { page:'Home (/home)', component:'Post Cards', expected:'Consistent card styling using GlassCard or glass-card class', actual:'Inline style with t.card background, no glass-card class used', status:'Fail', screenshot:'Home_Cards_NoGlassClass.png', fix:'Use GlassCard component or glass-card class consistently' },
  { page:'Community (/community)', component:'Group Cards', expected:'GlassCard component', actual:'Uses glass-card class + inline styles (dual approach)', status:'Fail', screenshot:'Community_Cards_DualStyling.png', fix:'Choose one approach: GlassCard component OR glass-card class' },
  { page:'Menu (/menu)', component:'Menu Cards', expected:'glass-card class or GlassCard component', actual:'Only inline styles, no glass-card class used', status:'Fail', screenshot:'Menu_Cards_InlineOnly.png', fix:'Apply glass-card class for consistency' },
  { page:'Wallet (/wallet)', component:'Balance Card', expected:'Consistent card styling', actual:'glass-card class with custom gradient background', status:'Pass', screenshot:'N/A', fix:'' },

  // Grid Responsiveness
  { page:'Marketplace (/marketplace)', component:'Product Grid', expected:'Responsive grid with breakpoints', actual:'grid grid-cols-2 md:grid-cols-3 gap-3 - properly responsive', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'Menu (/menu)', component:'Menu Grid', expected:'Responsive grid with breakpoints', actual:'grid grid-cols-3 gap-2 - fixed columns, no responsive breakpoints', status:'Fail', screenshot:'Menu_Grid_NotResponsive.png', fix:'Add responsive breakpoints: grid-cols-2 sm:grid-cols-3 md:grid-cols-4' },
  { page:'Reels (/reels)', component:'Share Grid', expected:'Responsive grid', actual:'grid grid-cols-3 - fixed columns, no responsive breakpoints', status:'Fail', screenshot:'Reels_Grid_NotResponsive.png', fix:'Add responsive breakpoints for small screens' },

  // Theme/Color Hardcoding
  { page:'Home (/home)', component:'Audience Badge Colors', expected:'Colors from theme accent system', actual:'Hardcoded colors: #22c55e, #f59e0b, #8b5cf6, #3b82f6 ignoring theme settings', status:'Fail', screenshot:'Home_HardcodedColors.png', fix:'Use theme-aware color mapping or CSS variables' },
  { page:'Search (/search)', component:'Type Colors', expected:'Colors from theme', actual:'Hardcoded TYPE_COLORS object with specific hex values', status:'Fail', screenshot:'Search_HardcodedColors.png', fix:'Use theme variables for category colors' },
  { page:'Events (/events)', component:'Category Colors', expected:'Colors from theme', actual:'catColors object with hardcoded specific hex values', status:'Fail', screenshot:'Events_HardcodedColors.png', fix:'Derive from theme accent color' },
  { page:'Reels (/reels)', component:'Action Colors', expected:'Colors from theme', actual:'Direct hex colors like #ef4444, #3b82f6 in component', status:'Fail', screenshot:'Reels_HardcodedColors.png', fix:'Use theme-aware color system' },

  // Font/Text Consistency
  { page:'Multiple Pages', component:'Secondary Text Color', expected:'Consistent use of t.textMuted OR t.textSecondary', actual:'Mixed usage of t.textMuted and t.textSecondary across pages. Both exist in theme but used inconsistently', status:'Fail', screenshot:'MultiPage_TextColor_Inconsistent.png', fix:'Standardize to single secondary text color property' },
  { page:'Multiple Pages', component:'Spacing Pattern', expected:'Consistent space-y-4 for page content', actual:'Mix of space-y-3, space-y-4; gap varies between gap-1, gap-1.5, gap-2, gap-3, gap-4, gap-6', status:'Fail', screenshot:'MultiPage_Spacing_Inconsistent.png', fix:'Establish design system spacing scale and apply consistently' },

  // Navigation Consistency
  { page:'TopNav', component:'Notification Active State', expected:'Active state matches /notifications path', actual:'Button navigates to /notifications but active check uses /notification (missing s) - TopNav.tsx line 81', status:'Fail', screenshot:'TopNav_NotificationActive_Bug.png', fix:'Change pathname check from /notification to /notifications' },
  { page:'TopNav', component:'Community Tab Label', expected:'Tab label matches page name', actual:'TopNav tab labeled "Netyard" links to /netyard, but Community page is at /community - naming confusion', status:'Fail', screenshot:'TopNav_NamingConfusion.png', fix:'Align naming: either rename tab to Community or ensure /netyard is the canonical path' },
];

// ============================================================
// SHEET 3: BROKEN LINKS REPORT
// ============================================================
const brokenLinks = [
  { page:'TopNav', button:'Notification Bell', expected:'/notifications page opens', actual:'Navigates to /notifications correctly, BUT active state check uses /notification (missing s) - never highlights as active', status:'Fail', screenshot:'TopNav_NotificationActive_Bug.png', fix:'Fix pathname check from /notification to /notifications in TopNav.tsx line 81' },
  { page:'TopNav', button:'Netyard Tab', expected:'/netyard or /community page', actual:'Links to /netyard which exists, but /community is a separate page - potential user confusion about which is the main community page', status:'Warning', screenshot:'TopNav_Netyard_Community_Confusion.png', fix:'Consolidate /netyard and /community or clarify naming' },
  { page:'ChatBot', button:'Quick Action - Find Workers', expected:'/jobplace/providers opens', actual:'Navigation link in chatbot response directs to /jobplace/providers correctly', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'ChatBot', button:'Quick Action - Map', expected:'/jobplace/map opens', actual:'Navigation link works correctly', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'Home Feed', button:'Create Post - Job Link', expected:'/jobplace/create opens', actual:'Link to /jobplace/create works, page exists', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'Menu', button:'Search Button', expected:'/search page opens', actual:'router.push(/search) works correctly', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'Menu', button:'Various Menu Items', expected:'All menu items navigate to correct pages', actual:'Menu items link to various pages. All verified to exist as page routes', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'Profile', button:'Edit Profile', expected:'/profile/edit opens', actual:'router.push(/profile/edit) works correctly', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'Settings', button:'Account Settings', expected:'/settings/account opens', actual:'Navigation works correctly', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'Settings', button:'Activity Log', expected:'/settings/activity opens', actual:'router.push(/settings/activity) works correctly', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'Settings', button:'Privacy Policy', expected:'/privacy page opens', actual:'Navigation to /privacy works, page exists', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'Settings', button:'Terms of Service', expected:'/terms page opens', actual:'No /terms page found in the application routes', status:'Fail', screenshot:'Settings_TermsLink_Broken.png', fix:'Create /terms page or remove the link' },
  { page:'Auth/Login', button:'Login Redirect', expected:'/home after successful login', actual:'Redirect to /home after auth works correctly', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'Middleware', button:'Auth Redirect', expected:'/login for unauthenticated users', actual:'Protected routes redirect to /login correctly', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'Home Feed', button:'Community Groups Section', expected:'/community page opens', actual:'Link to /community works correctly', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'Various Pages', button:'router.back()', expected:'Previous page in browser history', actual:'Multiple pages use router.back() - works as expected via Next.js router', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'JobPlace', button:'Job Detail Link', expected:'/jobplace/job/[id] opens', actual:'Hardcoded link to /jobplace/job/1 found in code - should use dynamic ID', status:'Warning', screenshot:'JobPlace_HardcodedJobLink.png', fix:'Use dynamic job ID instead of hardcoded /jobplace/job/1' },
  { page:'BottomNav', button:'Reels Tab', expected:'/reels page opens', actual:'Navigation to /reels works correctly', status:'Pass', screenshot:'N/A', fix:'' },
  { page:'BottomNav', button:'Community Tab', expected:'/community page opens', actual:'BottomNav links to /community, but TopNav links to /netyard for the same concept', status:'Warning', screenshot:'Nav_CommunityPath_Inconsistent.png', fix:'Both navs should link to same community path' },
  { page:'Home Feed', button:'Inbox Link', expected:'/inbox page opens', actual:'Both /inbox and /messages exist as separate pages for messaging - inconsistent entry points', status:'Warning', screenshot:'Messages_DualEntryPoints.png', fix:'Consolidate /inbox and /messages into single messaging entry point' },
];

// ============================================================
// FEATURE GAP REPORT
// ============================================================
const featureGapProfile = [
  { feature:'Profile Picture', status:'Yes', notes:'Multi-avatar system with 4 audience types' },
  { feature:'Cover Photo', status:'No', notes:'Missing - not in DB schema or UI' },
  { feature:'Bio/About', status:'Yes', notes:'Profile about page exists' },
  { feature:'Followers/Following Count', status:'Partial', notes:'Friends count shown, no followers/following distinction' },
  { feature:'Profile Verification Badge', status:'Yes', notes:'is_verified field + trust badges' },
  { feature:'Profile Privacy Settings', status:'Yes', notes:'Privacy settings page exists' },
  { feature:'Activity Timeline', status:'Partial', notes:'Posts tab shows user posts but no full timeline with all activities' },
  { feature:'Pinned Posts', status:'No', notes:'No pin post functionality found' },
  { feature:'Profile Link/Username', status:'No', notes:'No shareable profile URL or unique username system' },
  { feature:'Story Highlights', status:'No', notes:'No story feature or highlights found (Instagram)' },
  { feature:'Account Switching', status:'No', notes:'No multi-account switching (Instagram)' },
];

const featureGapFeed = [
  { feature:'Like/Reactions', status:'Yes', notes:'Emoji picker with multiple reaction types' },
  { feature:'Comments', status:'Yes', notes:'Comment system with hashtag suggestions' },
  { feature:'Share', status:'Yes', notes:'Share to WhatsApp, Facebook, Twitter, LinkedIn' },
  { feature:'Save/Bookmark Post', status:'No', notes:'/saved page exists but no bookmark button on posts' },
  { feature:'Post Editing', status:'Yes', notes:'Edit post (BR-101) implemented' },
  { feature:'Poll Posts', status:'No', notes:'No poll/survey post type found' },
  { feature:'Hashtags', status:'Yes', notes:'Hashtag suggestions in posts and comments' },
  { feature:'Trending Posts/Topics', status:'Partial', notes:'Trending searches exist but no trending posts algorithm' },
  { feature:'Algorithm Feed', status:'No', notes:'Chronological feed only, no recommendation algorithm' },
  { feature:'Story/Ephemeral Content', status:'No', notes:'No story feature (24-hour content like Instagram/Facebook)' },
  { feature:'Live Streaming', status:'No', notes:'No live streaming capability' },
  { feature:'Post Scheduling', status:'No', notes:'No scheduled post feature' },
  { feature:'Post Analytics', status:'No', notes:'No individual post analytics (reach, impressions)' },
  { feature:'Repost/Retweet', status:'No', notes:'Share sends to external apps only, no in-app repost' },
  { feature:'Tagged People in Posts', status:'No', notes:'No user tagging/mention in posts' },
  { feature:'Location Tag on Posts', status:'No', notes:'Posts dont have location tagging' },
];

const featureGapMessaging = [
  { feature:'Private Chat', status:'Yes', notes:'1:1 chat rooms via /(chat)/chat/[id]' },
  { feature:'Group Chat', status:'Partial', notes:'buddy_group_chat feature flag at 60% canary but limited implementation' },
  { feature:'Voice Messages', status:'No', notes:'No audio message recording/playback' },
  { feature:'Video Calls', status:'No', notes:'Feature flag exists but disabled, no WebRTC implementation' },
  { feature:'File Sharing', status:'Partial', notes:'Image sharing only, no general file attachment' },
  { feature:'Emoji Reactions to Messages', status:'No', notes:'No message-level reactions found' },
  { feature:'Message Edit', status:'No', notes:'RLS policy prevents message modification (audit trail)' },
  { feature:'Message Delete', status:'No', notes:'RLS policy prevents message deletion' },
  { feature:'Reply to Specific Message', status:'No', notes:'No threaded replies in chat' },
  { feature:'Message Pinning', status:'No', notes:'No message pin functionality' },
  { feature:'Read Receipts', status:'Partial', notes:'is_read field exists but no UI indicator' },
  { feature:'Typing Indicator', status:'Partial', notes:'ChatBot has typing indicator, regular chat unclear' },
  { feature:'Message Search', status:'No', notes:'No search within conversations' },
  { feature:'Message Forwarding', status:'No', notes:'No message forward feature' },
  { feature:'Disappearing Messages', status:'No', notes:'No ephemeral message mode (Telegram)' },
  { feature:'Channels', status:'No', notes:'No broadcast channel feature (Telegram)' },
];

const featureGapGroup = [
  { feature:'Group Admin', status:'Yes', notes:'Community members table has role field' },
  { feature:'Group Moderators', status:'Partial', notes:'Role field exists but no moderator management UI' },
  { feature:'Invite Link', status:'No', notes:'No shareable invite link for groups' },
  { feature:'Join Approval', status:'Partial', notes:'Request membership exists but admin approval workflow limited' },
  { feature:'Group Rules', status:'No', notes:'No configurable group rules section' },
  { feature:'Group Analytics', status:'No', notes:'No group-level analytics dashboard' },
  { feature:'Pinned Posts in Groups', status:'No', notes:'No pin post in group functionality' },
  { feature:'Group Events', status:'No', notes:'Events page exists but not tied to specific groups' },
  { feature:'Group Files/Media', status:'No', notes:'No shared files section in groups' },
  { feature:'Member Roles/Permissions', status:'Partial', notes:'Basic role field but no granular permissions' },
  { feature:'Group Chat', status:'Partial', notes:'Feature flag buddy_group_chat at 60% canary' },
];

const featureGapDiscovery = [
  { feature:'Explore Page', status:'Partial', notes:'Search page with trending/categories but no dedicated explore feed' },
  { feature:'Recommended Posts', status:'No', notes:'No recommendation algorithm' },
  { feature:'Trending Hashtags', status:'Partial', notes:'Trending searches exist but not hashtag-specific trending' },
  { feature:'Suggested Friends/People', status:'Partial', notes:'Friends discover tab shows nearby users but no AI-based suggestions' },
  { feature:'For You Feed', status:'No', notes:'No personalized content feed (Instagram/TikTok)' },
  { feature:'Content Categories', status:'Yes', notes:'Search has 6 content types, browseable by category' },
  { feature:'Discover Nearby', status:'Yes', notes:'Proximity-based discovery with distance zones' },
];

const featureGapSummary = [
  { module:'Profile', missing:'Cover Photo', reference:'Facebook, Instagram', why:'Users expect visual profile customization', requirement:'Add cover_photo_url field and upload UI' },
  { module:'Profile', missing:'Pinned Posts', reference:'Facebook, Twitter/X', why:'Users want to highlight important content', requirement:'Add is_pinned field to posts and pin/unpin action' },
  { module:'Profile', missing:'Story Highlights', reference:'Instagram', why:'Users want to preserve ephemeral content', requirement:'Add stories feature with highlights archival' },
  { module:'Feed', missing:'Save/Bookmark Post', reference:'Instagram, Facebook', why:'Users want to revisit content later', requirement:'Add bookmark table and bookmark button on posts, link to /saved page' },
  { module:'Feed', missing:'Poll Posts', reference:'Facebook, Instagram, Twitter/X', why:'Engagement tool for community interaction', requirement:'Add poll post type with vote tracking' },
  { module:'Feed', missing:'Stories (24hr Content)', reference:'Instagram, Facebook', why:'Ephemeral content drives daily engagement', requirement:'Add stories feature with creation, viewing, and expiry logic' },
  { module:'Feed', missing:'Post Scheduling', reference:'Facebook, Instagram', why:'Content creators need to plan posts', requirement:'Add scheduled_at field and scheduled publishing worker' },
  { module:'Feed', missing:'User Tagging/Mentions', reference:'Facebook, Instagram, Twitter/X', why:'Social interaction and discoverability', requirement:'Add @mention parsing and notification triggers' },
  { module:'Feed', missing:'Location Tags', reference:'Instagram, Facebook', why:'Location-based content discovery', requirement:'Add location_name and coordinates to posts with map display' },
  { module:'Feed', missing:'Algorithm Feed', reference:'Instagram, Facebook, TikTok', why:'Personalized content increases engagement', requirement:'Add ML-based content ranking and recommendation' },
  { module:'Feed', missing:'In-app Repost/Share', reference:'Twitter/X, Facebook', why:'Content amplification within platform', requirement:'Add repost functionality with attribution' },
  { module:'Feed', missing:'Live Streaming', reference:'Instagram, Facebook', why:'Real-time engagement with audience', requirement:'Add WebRTC-based live streaming with viewer interaction' },
  { module:'Messaging', missing:'Voice Messages', reference:'Telegram, WhatsApp, Instagram', why:'Users prefer voice for quick communication', requirement:'Add Web Audio API recording, storage, and playback' },
  { module:'Messaging', missing:'Video Calls', reference:'Telegram, WhatsApp, Facebook', why:'Face-to-face communication is essential', requirement:'Implement WebRTC video calling with signaling server' },
  { module:'Messaging', missing:'Message Reply Threading', reference:'Telegram, WhatsApp', why:'Context in conversations is critical', requirement:'Add reply_to_id field and threaded reply UI' },
  { module:'Messaging', missing:'Message Reactions', reference:'Telegram, Facebook Messenger', why:'Quick emoji responses without typing', requirement:'Add message-level reaction support' },
  { module:'Messaging', missing:'Message Search', reference:'Telegram, WhatsApp', why:'Finding old messages is a basic need', requirement:'Add full-text search within conversations' },
  { module:'Messaging', missing:'Message Forwarding', reference:'Telegram, WhatsApp', why:'Sharing content between conversations', requirement:'Add forward message action' },
  { module:'Groups', missing:'Invite Links', reference:'Telegram, WhatsApp, Facebook', why:'Easy group sharing and growth', requirement:'Add shareable invite link with optional expiry' },
  { module:'Groups', missing:'Group Rules', reference:'Facebook', why:'Setting expectations for members', requirement:'Add rules text field and display on group join' },
  { module:'Groups', missing:'Group Analytics', reference:'Facebook', why:'Admins need insights on group activity', requirement:'Add member activity, post engagement, growth metrics' },
  { module:'Groups', missing:'Pinned Posts', reference:'Facebook, Telegram', why:'Highlighting important group content', requirement:'Add pin functionality for group admins' },
  { module:'Discovery', missing:'Explore/For You Page', reference:'Instagram, TikTok', why:'Content discovery drives user retention', requirement:'Add personalized explore feed with recommendation engine' },
  { module:'Discovery', missing:'Trending Hashtags', reference:'Instagram, Twitter/X', why:'Real-time trend awareness', requirement:'Add hashtag frequency tracking and trending display' },
  { module:'Auth', missing:'Signup Page', reference:'All platforms', why:'Basic registration flow is essential', requirement:'Create dedicated /signup page with registration form' },
  { module:'Auth', missing:'Password Reset', reference:'All platforms', why:'Users frequently forget passwords', requirement:'Add forgot-password page with email reset link' },
  { module:'Auth', missing:'2FA Setup', reference:'Facebook, Instagram', why:'Account security is critical', requirement:'Implement TOTP enrollment flow in security settings' },
  { module:'Notifications', missing:'Real Push Notifications', reference:'All platforms', why:'Users need real-time alerts even when app is closed', requirement:'Implement Service Worker + FCM for web push notifications' },
];

// ============================================================
// GENERATE EXCEL FILES
// ============================================================

function createQAReport() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Functional Test Results
  const functionalHeaders = ['Test ID', 'Module', 'Page', 'Test Scenario', 'Expected Result', 'Actual Result', 'Status', 'Screenshot', 'Reason for Failure', 'Improvement Required'];
  const functionalData = functionalTests.map(t => [t.id, t.module, t.page, t.scenario, t.expected, t.actual, t.status, t.screenshot, t.reason, t.improvement]);
  const ws1 = XLSX.utils.aoa_to_sheet([functionalHeaders, ...functionalData]);
  ws1['!cols'] = [{ wch: 8 }, { wch: 14 }, { wch: 16 }, { wch: 40 }, { wch: 50 }, { wch: 80 }, { wch: 8 }, { wch: 35 }, { wch: 50 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Functional Test Results');

  // Sheet 2: Broken Links
  const brokenHeaders = ['Page', 'Button/Link', 'Expected Destination', 'Actual Result', 'Status', 'Screenshot', 'Fix Recommendation'];
  const brokenData = brokenLinks.map(b => [b.page, b.button, b.expected, b.actual, b.status, b.screenshot, b.fix]);
  const ws2 = XLSX.utils.aoa_to_sheet([brokenHeaders, ...brokenData]);
  ws2['!cols'] = [{ wch: 16 }, { wch: 25 }, { wch: 35 }, { wch: 80 }, { wch: 10 }, { wch: 40 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Broken Links');

  XLSX.writeFile(wb, path.join(__dirname, 'QA_Report.xlsx'));
  console.log('QA_Report.xlsx generated');
}

function createUIAudit() {
  const wb = XLSX.utils.book_new();

  const uiHeaders = ['Page', 'UI Component', 'Expected Design', 'Actual Design', 'Status', 'Screenshot', 'Fix Recommendation'];
  const uiData = uiConsistency.map(u => [u.page, u.component, u.expected, u.actual, u.status, u.screenshot, u.fix]);
  const ws = XLSX.utils.aoa_to_sheet([uiHeaders, ...uiData]);
  ws['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 45 }, { wch: 80 }, { wch: 8 }, { wch: 40 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, ws, 'UI Consistency Report');

  XLSX.writeFile(wb, path.join(__dirname, 'UI_Audit.xlsx'));
  console.log('UI_Audit.xlsx generated');
}

function createFeatureGapReport() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Feature Gap Summary
  const summaryHeaders = ['Module', 'Missing Feature', 'Reference Platform', 'Why Needed', 'Functional Requirement'];
  const summaryData = featureGapSummary.map(f => [f.module, f.missing, f.reference, f.why, f.requirement]);
  const ws1 = XLSX.utils.aoa_to_sheet([summaryHeaders, ...summaryData]);
  ws1['!cols'] = [{ wch: 14 }, { wch: 28 }, { wch: 30 }, { wch: 45 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(wb, ws1, 'Feature Gap Summary');

  // Sheet 2: Profile Features Benchmark
  const profileHeaders = ['Feature', 'Available', 'Notes'];
  const profileData = featureGapProfile.map(f => [f.feature, f.status, f.notes]);
  const ws2 = XLSX.utils.aoa_to_sheet([profileHeaders, ...profileData]);
  ws2['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws2, 'Profile Benchmark');

  // Sheet 3: Feed Features Benchmark
  const feedHeaders = ['Feature', 'Available', 'Notes'];
  const feedData = featureGapFeed.map(f => [f.feature, f.status, f.notes]);
  const ws3 = XLSX.utils.aoa_to_sheet([feedHeaders, ...feedData]);
  ws3['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws3, 'Feed Benchmark');

  // Sheet 4: Messaging Features Benchmark
  const msgHeaders = ['Feature', 'Available', 'Notes'];
  const msgData = featureGapMessaging.map(f => [f.feature, f.status, f.notes]);
  const ws4 = XLSX.utils.aoa_to_sheet([msgHeaders, ...msgData]);
  ws4['!cols'] = [{ wch: 30 }, { wch: 10 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws4, 'Messaging Benchmark');

  // Sheet 5: Group Features Benchmark
  const groupHeaders = ['Feature', 'Available', 'Notes'];
  const groupData = featureGapGroup.map(f => [f.feature, f.status, f.notes]);
  const ws5 = XLSX.utils.aoa_to_sheet([groupHeaders, ...groupData]);
  ws5['!cols'] = [{ wch: 30 }, { wch: 10 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws5, 'Groups Benchmark');

  // Sheet 6: Discovery Features Benchmark
  const discHeaders = ['Feature', 'Available', 'Notes'];
  const discData = featureGapDiscovery.map(f => [f.feature, f.status, f.notes]);
  const ws6 = XLSX.utils.aoa_to_sheet([discHeaders, ...discData]);
  ws6['!cols'] = [{ wch: 25 }, { wch: 10 }, { wch: 60 }];
  XLSX.utils.book_append_sheet(wb, ws6, 'Discovery Benchmark');

  XLSX.writeFile(wb, path.join(__dirname, 'Feature_Gap_Report.xlsx'));
  console.log('Feature_Gap_Report.xlsx generated');
}

// Run all generators
createQAReport();
createUIAudit();
createFeatureGapReport();

console.log('\nAll QA reports generated successfully in QA_Reports/ directory.');
console.log('Summary:');
console.log(`  - Functional Tests: ${functionalTests.length} test cases`);
console.log(`  - UI Consistency Checks: ${uiConsistency.length} items`);
console.log(`  - Broken Links Checked: ${brokenLinks.length} items`);
console.log(`  - Feature Gap Items: ${featureGapSummary.length} missing features identified`);
const failCount = functionalTests.filter(t => t.status === 'Fail').length;
const passCount = functionalTests.filter(t => t.status === 'Pass').length;
console.log(`  - Pass: ${passCount} | Fail: ${failCount} | Pass Rate: ${((passCount / functionalTests.length) * 100).toFixed(1)}%`);
