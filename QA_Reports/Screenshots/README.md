# QA Screenshots Evidence

This directory contains screenshot evidence for QA test failures identified during code-level audit.

**Note:** Screenshots below are documented as placeholders from code-level analysis.
In a live testing environment, actual browser screenshots would be captured at these locations.

## Screenshot Index

### Authentication Issues
- `Auth_Signup_PageMissing.png` - No /signup route exists. Only /login page available
- `Auth_PasswordReset_Missing.png` - No forgot-password/reset-password page
- `Login_FormValidation_Missing.png` - Missing inline form validation errors

### Profile Issues
- `Profile_CoverPhoto_Missing.png` - No cover photo feature in profile

### Home Feed Issues
- `Home_VideoPlayback_Missing.png` - Video upload works but no inline player
- `Home_SavePost_Missing.png` - No bookmark/save button on posts
- `Home_Pagination_Missing.png` - No infinite scroll, all posts loaded at once
- `Home_HardcodedColors.png` - Audience badge uses hardcoded colors

### Community Issues
- `Community_ModeratorUI_Missing.png` - No moderator management interface
- `Community_SearchBox_Inconsistent.png` - Search design differs from main search

### Messaging Issues
- `Messages_Placeholder_Page.png` - Messages page is placeholder only
- `Chat_VoiceMessage_Missing.png` - No voice message recording
- `Chat_VideoCall_Disabled.png` - Video calls feature-flagged as disabled
- `Chat_FileShare_Missing.png` - Only text/image types, no file attachment
- `Chat_MessageEdit_Disabled.png` - Messages immutable per RLS policy
- `Inbox_Duplicate_Page.png` - /inbox and /messages are duplicate pages
- `Messages_DualEntryPoints.png` - Inconsistent messaging entry points

### Notification Issues
- `Notifications_PushReal_Missing.png` - No Service Worker/FCM push notifications
- `Notifications_BackButton_TextArrow.png` - Uses text "<-" instead of IcoBack

### Navigation Issues
- `TopNav_NotificationActive_Bug.png` - Active state checks /notification vs /notifications
- `TopNav_NamingConfusion.png` - "Netyard" tab vs /community page naming
- `Nav_CommunityPath_Inconsistent.png` - TopNav=/netyard, BottomNav=/community
- `Settings_TermsLink_Broken.png` - /terms page does not exist
- `JobPlace_HardcodedJobLink.png` - Hardcoded /jobplace/job/1

### UI Consistency Issues
- `Friends_SearchBox_Inconsistent.png` - Different search design from main
- `Marketplace_SearchBox_Different.png` - Different search with autocomplete
- `Marketplace_MicIcon_Missing.png` - No mic icon in marketplace search
- `Settings_SearchBox_Different.png` - Different search layout
- `Settings_MicIcon_Missing.png` - No mic icon in settings search
- `Menu_SearchBox_ButtonStyle.png` - Button instead of input
- `JobPlace_MicIcon_Missing.png` - No search/mic on jobplace
- `Events_BackButton_TextArrow.png` - Text arrow instead of icon
- `JobPlace_Buttons_Inconsistent.png` - Different button classes
- `Marketplace_Buttons_Inconsistent.png` - Inline gradient buttons differ
- `Wallet_Buttons_Inconsistent.png` - Custom boxShadow pattern
- `Notifications_FilterButtons_Inconsistent.png` - Inconsistent filter chips
- `Home_Cards_NoGlassClass.png` - No glass-card class used
- `Community_Cards_DualStyling.png` - Dual styling approach
- `Menu_Cards_InlineOnly.png` - Inline styles only, no glass-card
- `Menu_Grid_NotResponsive.png` - Fixed 3-col grid, no breakpoints
- `Reels_Grid_NotResponsive.png` - Fixed 3-col grid
- `Search_HardcodedColors.png` - Hardcoded TYPE_COLORS
- `Events_HardcodedColors.png` - Hardcoded category colors
- `Reels_HardcodedColors.png` - Direct hex colors
- `MultiPage_TextColor_Inconsistent.png` - Mixed textMuted/textSecondary
- `MultiPage_Spacing_Inconsistent.png` - Varying space-y and gap values
- `Settings_2FA_NotImplemented.png` - MFA field exists but no setup UI

### Settings Issues
- `Settings_2FA_NotImplemented.png` - mfa_enabled field but no enrollment

### API Backend Issues (CRITICAL)
- `API_Chat_EmptyData.png` - GET /api/chat returns hardcoded empty array, no DB query
- `API_Jobs_EmptyData.png` - GET /api/jobs returns hardcoded empty array, no DB query
- `API_Workers_NotImplemented.png` - Workers API is a stub with TODO comments
- `API_Listings_NotImplemented.png` - Listings API is a stub with TODO comments
- `API_Bookings_NotImplemented.png` - Bookings API is a stub with TODO comments
- `API_QRVerify_AlwaysTrue.png` - SECURITY: QR verify always returns true without DB check
- `API_Payments_MockOnly.png` - Payments returns mock data, no Stripe/Adyen integration

### Data Persistence Issues (CRITICAL)
- `Profile_AvatarNotPersisted.png` - Avatar stored in localStorage, not Supabase storage
- `Community_GroupNotSaved.png` - Group creation does not call createCommunity
- `Community_PostNotSaved.png` - Community posts not saved to database
- `Friends_RequestsNotPersisted.png` - Friend operations only modify local state
- `Friends_BlockingClientOnly.png` - Blocking is client-side only via localStorage
- `Wallet_DummyData.png` - All wallet data is hardcoded mock, not from DB
- `Chat_MessagesNotPersisted.png` - Chat messages lost on page refresh
- `Search_DemoDataOnly.png` - Search only queries hardcoded demo data
- `Search_VoiceSearchFake.png` - Voice search always returns "plumber"

### Security Issues
- `AdminLogin_OrgCodeNotValidated.png` - Admin org code never validated server-side
- `Middleware_InMemoryRateLimit.png` - Rate limiting resets on server restart
