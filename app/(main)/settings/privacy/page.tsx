"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoShield, IcoUser, IcoCommunity } from '@/components/Icons';

type Audience = 'everyone' | 'connections' | 'trusted' | 'only_me';
const AUDIENCES: { key: Audience; label: string; icon: string }[] = [
  { key: 'everyone', label: 'Everyone', icon: '🌐' },
  { key: 'connections', label: 'Connections Only', icon: '🤝' },
  { key: 'trusted', label: 'Trusted Circle', icon: '🔒' },
  { key: 'only_me', label: 'Only Me', icon: '👤' },
];

interface BlockedUser {
  id: string;
  name: string;
  avatar: string;
  blockedOn: string;
}

export default function PrivacyPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);

  // Privacy Visibility Controls
  const [profileVisibility, setProfileVisibility] = useState<Audience>('everyone');
  const [postDefaultAudience, setPostDefaultAudience] = useState<Audience>('connections');
  const [jobHistoryVisibility, setJobHistoryVisibility] = useState<Audience>('connections');
  const [onlineStatusVisible, setOnlineStatusVisible] = useState(true);
  const [showLastSeen, setShowLastSeen] = useState(true);
  const [showLocation, setShowLocation] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [allowTagging, setAllowTagging] = useState(true);
  const [searchEngineIndexing, setSearchEngineIndexing] = useState(false);

  // Data Usage Controls
  const [personalizedAds, setPersonalizedAds] = useState(false);
  const [analyticsSharing, setAnalyticsSharing] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [cookieConsent, setCookieConsent] = useState<'essential' | 'functional' | 'all'>('functional');

  // Interaction Controls
  const [whoCanMessage, setWhoCanMessage] = useState<Audience>('connections');
  const [whoCanReview, setWhoCanReview] = useState<Audience>('connections');
  const [commentApproval, setCommentApproval] = useState(false);

  // Blocked Users
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([
    { id: 'b1', name: 'Unknown User 2847', avatar: '🚫', blockedOn: 'Feb 12, 2026' },
    { id: 'b2', name: 'Spam Account #591', avatar: '🚫', blockedOn: 'Jan 28, 2026' },
  ]);

  const [activeTab, setActiveTab] = useState<'visibility' | 'data' | 'interactions' | 'blocked'>('visibility');

  const ToggleSwitch = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className="w-11 h-6 rounded-full relative transition-colors shrink-0"
      style={{ background: value ? t.accent : isDark ? '#333' : '#ccc' }}
    >
      <div
        className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm"
        style={{ left: value ? '22px' : '2px' }}
      />
    </button>
  );

  const AudienceSelector = ({
    value,
    onChange,
    label,
  }: {
    value: Audience;
    onChange: (v: Audience) => void;
    label: string;
  }) => (
    <div className="space-y-2">
      <p className="text-xs font-medium">{label}</p>
      <div className="grid grid-cols-2 gap-1.5">
        {AUDIENCES.map(a => (
          <button
            key={a.key}
            onClick={() => onChange(a.key)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-all"
            style={{
              background: value === a.key ? `${t.accent}18` : 'transparent',
              border: `1.5px solid ${value === a.key ? t.accent : t.cardBorder}`,
              color: value === a.key ? t.accent : t.textSecondary,
            }}
          >
            <span>{a.icon}</span>
            <span>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const tabs = [
    { key: 'visibility' as const, label: 'Visibility', icon: '👁️' },
    { key: 'data' as const, label: 'Data Usage', icon: '📊' },
    { key: 'interactions' as const, label: 'Interactions', icon: '💬' },
    { key: 'blocked' as const, label: 'Blocked', icon: '🚫' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/settings')} style={{ background: 'none', border: 'none', color: t.text, cursor: 'pointer' }}>
          <IcoBack size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Privacy & Safety</h1>
          <p className="text-[10px]" style={{ color: t.textMuted }}>
            Control your visibility and data on Datore
          </p>
        </div>
        <IcoShield size={22} color={t.accent} />
      </div>

      {/* Privacy Score Banner */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: `linear-gradient(135deg, ${t.accent}15, #22c55e10)`,
          border: `1px solid ${t.accent}25`,
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold">Privacy Strength</p>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#22c55e20', color: '#22c55e' }}>
            Strong
          </span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: isDark ? '#1a1a2e' : '#e5e7eb' }}>
          <div className="h-full rounded-full transition-all" style={{ width: '78%', background: `linear-gradient(90deg, ${t.accent}, #22c55e)` }} />
        </div>
        <p className="text-[9px] mt-1.5" style={{ color: t.textMuted }}>
          78/100 - Your privacy settings are well configured. Consider hiding your email for a higher score.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all"
            style={{
              background: activeTab === tab.key ? `${t.accent}18` : 'transparent',
              color: activeTab === tab.key ? t.accent : t.textSecondary,
              border: activeTab === tab.key ? `1px solid ${t.accent}40` : '1px solid transparent',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* VISIBILITY TAB */}
      {activeTab === 'visibility' && (
        <div className="space-y-3">
          {/* Profile Visibility */}
          <div className="rounded-2xl p-4 space-y-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold flex items-center gap-2">
              <IcoUser size={14} color={t.accent} /> Profile Visibility
            </p>
            <AudienceSelector value={profileVisibility} onChange={setProfileVisibility} label="Who can see your full profile?" />
            <AudienceSelector value={postDefaultAudience} onChange={setPostDefaultAudience} label="Default audience for new posts" />
            <AudienceSelector value={jobHistoryVisibility} onChange={setJobHistoryVisibility} label="Who can see your job history?" />
          </div>

          {/* Contact Info Visibility */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold">Contact & Presence</p>
            {[
              { label: 'Show Online Status', desc: 'Let others see when you are active', value: onlineStatusVisible, set: setOnlineStatusVisible },
              { label: 'Show Last Seen', desc: 'Display when you were last active', value: showLastSeen, set: setShowLastSeen },
              { label: 'Show Location', desc: 'Display your city on your profile', value: showLocation, set: setShowLocation },
              { label: 'Show Phone Number', desc: 'Make your phone visible to connections', value: showPhone, set: setShowPhone },
              { label: 'Show Email Address', desc: 'Make your email visible to connections', value: showEmail, set: setShowEmail },
              { label: 'Allow Tagging', desc: 'Let others tag you in posts and comments', value: allowTagging, set: setAllowTagging },
              { label: 'Search Engine Indexing', desc: 'Allow search engines to find your profile', value: searchEngineIndexing, set: setSearchEngineIndexing },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-3 py-1">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="text-[9px]" style={{ color: t.textMuted }}>{item.desc}</p>
                </div>
                <ToggleSwitch value={item.value} onChange={item.set} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DATA USAGE TAB */}
      {activeTab === 'data' && (
        <div className="space-y-3">
          <div className="rounded-2xl p-4 space-y-3" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold">Data Preferences</p>
            {[
              { label: 'Personalized Recommendations', desc: 'Use your activity to suggest relevant jobs, services, and items', value: personalizedAds, set: setPersonalizedAds },
              { label: 'Usage Analytics', desc: 'Help improve Datore by sharing anonymous usage patterns', value: analyticsSharing, set: setAnalyticsSharing },
              { label: 'Location Services', desc: 'Enable nearby worker discovery and job matching', value: locationTracking, set: setLocationTracking },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-3 py-1">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{item.label}</p>
                  <p className="text-[9px]" style={{ color: t.textMuted }}>{item.desc}</p>
                </div>
                <ToggleSwitch value={item.value} onChange={item.set} />
              </div>
            ))}
          </div>

          {/* Cookie Preferences */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold">Cookie Preferences</p>
            <p className="text-[10px]" style={{ color: t.textMuted }}>
              Choose what types of cookies Datore can use. Essential cookies are always required for the platform to function.
            </p>
            {[
              { key: 'essential' as const, label: 'Essential Only', desc: 'Login, security, basic platform functions' },
              { key: 'functional' as const, label: 'Functional', desc: 'Essential + theme preferences, saved searches, shortcuts' },
              { key: 'all' as const, label: 'Full Experience', desc: 'All cookies including performance analytics' },
            ].map(opt => (
              <button
                key={opt.key}
                onClick={() => setCookieConsent(opt.key)}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                style={{
                  background: cookieConsent === opt.key ? `${t.accent}12` : 'transparent',
                  border: `1.5px solid ${cookieConsent === opt.key ? t.accent : t.cardBorder}`,
                }}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: cookieConsent === opt.key ? t.accent : t.textMuted }}
                >
                  {cookieConsent === opt.key && (
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.accent }} />
                  )}
                </div>
                <div className="text-left">
                  <p className="text-xs font-medium">{opt.label}</p>
                  <p className="text-[9px]" style={{ color: t.textMuted }}>{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Data Request */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold">Your Data Rights</p>
            <p className="text-[10px]" style={{ color: t.textMuted }}>
              Under PIPEDA, GDPR, and applicable data protection laws, you have the right to access, port, or delete your personal data.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => router.push('/settings/activity')}
                className="p-3 rounded-xl text-center"
                style={{ background: `${t.accent}10`, border: `1px solid ${t.accent}25` }}
              >
                <p className="text-lg mb-1">📥</p>
                <p className="text-[10px] font-semibold" style={{ color: t.accent }}>Download Data</p>
              </button>
              <button className="p-3 rounded-xl text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <p className="text-lg mb-1">🗑️</p>
                <p className="text-[10px] font-semibold" style={{ color: '#ef4444' }}>Request Deletion</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERACTIONS TAB */}
      {activeTab === 'interactions' && (
        <div className="space-y-3">
          <div className="rounded-2xl p-4 space-y-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold flex items-center gap-2">
              <IcoCommunity size={14} color={t.accent} /> Communication Controls
            </p>
            <AudienceSelector value={whoCanMessage} onChange={setWhoCanMessage} label="Who can send you messages?" />
            <AudienceSelector value={whoCanReview} onChange={setWhoCanReview} label="Who can leave you reviews?" />
            <div className="flex items-center justify-between gap-3 py-1">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium">Require Comment Approval</p>
                <p className="text-[9px]" style={{ color: t.textMuted }}>Manually approve comments on your posts before they appear</p>
              </div>
              <ToggleSwitch value={commentApproval} onChange={setCommentApproval} />
            </div>
          </div>

          {/* Safety Tips */}
          <div
            className="rounded-2xl p-4 space-y-2"
            style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}
          >
            <p className="text-xs font-bold" style={{ color: '#22c55e' }}>Safety Tips</p>
            {[
              'Always verify workers via QR scan before starting a job',
              'Never share your password or wallet PIN with anyone',
              'Use the in-app messaging system for all job-related communication',
              'Report suspicious profiles immediately using the safety button',
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[10px] mt-0.5" style={{ color: '#22c55e' }}>✓</span>
                <p className="text-[10px]" style={{ color: t.textSecondary }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BLOCKED TAB */}
      {activeTab === 'blocked' && (
        <div className="space-y-3">
          <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold mb-1">Blocked Accounts</p>
            <p className="text-[10px] mb-3" style={{ color: t.textMuted }}>
              Blocked users cannot view your profile, send messages, or see your posts and listings.
            </p>
            {blockedUsers.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-2xl mb-2">🎉</p>
                <p className="text-xs font-medium">No blocked accounts</p>
                <p className="text-[10px]" style={{ color: t.textMuted }}>
                  You haven't blocked anyone yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {blockedUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm"
                      style={{ background: 'rgba(239,68,68,0.1)' }}
                    >
                      {user.avatar}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-medium">{user.name}</p>
                      <p className="text-[9px]" style={{ color: t.textMuted }}>
                        Blocked on {user.blockedOn}
                      </p>
                    </div>
                    <button
                      onClick={() => setBlockedUsers(prev => prev.filter(u => u.id !== user.id))}
                      className="text-[10px] px-3 py-1.5 rounded-lg font-medium"
                      style={{ background: `${t.accent}12`, color: t.accent }}
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Restricted Accounts Info */}
          <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold mb-2">How Blocking Works on Datore</p>
            {[
              { q: 'Can blocked users see my profile?', a: 'No. Your profile, posts, and listings are completely hidden from them.' },
              { q: 'Will they know they are blocked?', a: 'They will not receive a notification, but they may notice they cannot find your profile.' },
              { q: 'What about active jobs?', a: 'Any active jobs or transactions between you will be flagged for dispute resolution.' },
              { q: 'Can I re-block someone?', a: 'Yes. You can block and unblock users at any time from their profile or this page.' },
            ].map((faq, i) => (
              <div key={i} className="py-2" style={{ borderTop: i > 0 ? `1px solid ${t.cardBorder}` : 'none' }}>
                <p className="text-[10px] font-semibold">{faq.q}</p>
                <p className="text-[9px] mt-0.5" style={{ color: t.textMuted }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
