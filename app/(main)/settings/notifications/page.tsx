"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoBell } from '@/components/Icons';

interface NotifCategory {
  key: string;
  label: string;
  icon: string;
  desc: string;
  push: boolean;
  email: boolean;
  inApp: boolean;
}

export default function NotificationPreferencesPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);

  const [activeTab, setActiveTab] = useState<'channels' | 'categories' | 'schedule'>('channels');

  // Global Channel Toggles
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [badgeCount, setBadgeCount] = useState(true);

  // Category-level settings
  const [categories, setCategories] = useState<NotifCategory[]>([
    { key: 'jobs', label: 'Job Matches & Updates', icon: '💼', desc: 'New job postings, applications, and status changes', push: true, email: true, inApp: true },
    { key: 'messages', label: 'Messages & Chat', icon: '💬', desc: 'New messages, chat requests, and replies', push: true, email: false, inApp: true },
    { key: 'payments', label: 'Payments & Wallet', icon: '💰', desc: 'Earnings, payments received, and escrow updates', push: true, email: true, inApp: true },
    { key: 'reviews', label: 'Reviews & Ratings', icon: '⭐', desc: 'New reviews, rating changes, and feedback', push: true, email: true, inApp: true },
    { key: 'safety', label: 'Safety & Verification', icon: '🛡️', desc: 'Background checks, QR verification, and safety alerts', push: true, email: true, inApp: true },
    { key: 'social', label: 'Social & Friends', icon: '👥', desc: 'Friend requests, mentions, tags, and reactions', push: false, email: false, inApp: true },
    { key: 'community', label: 'Community & Events', icon: '🎉', desc: 'Community updates, event reminders, and group activity', push: false, email: false, inApp: true },
    { key: 'marketplace', label: 'Marketplace', icon: '🛍️', desc: 'Price drops, listing views, and buyer messages', push: true, email: false, inApp: true },
    { key: 'promotions', label: 'Promotions & Tips', icon: '🎁', desc: 'Platform tips, feature updates, and offers', push: false, email: true, inApp: true },
    { key: 'birthdays', label: 'Birthdays & Milestones', icon: '🎂', desc: 'Friend birthdays, work anniversaries, and milestones', push: false, email: false, inApp: true },
  ]);

  // Schedule
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietStart, setQuietStart] = useState('22:00');
  const [quietEnd, setQuietEnd] = useState('07:00');
  const [weekendQuiet, setWeekendQuiet] = useState(false);
  const [urgentOverride, setUrgentOverride] = useState(true);

  const updateCategory = (key: string, field: 'push' | 'email' | 'inApp', value: boolean) => {
    setCategories(prev =>
      prev.map(c => c.key === key ? { ...c, [field]: value } : c)
    );
  };

  const ToggleSwitch = ({ value, onChange, size = 'normal' }: { value: boolean; onChange: (v: boolean) => void; size?: 'normal' | 'small' }) => (
    <button
      onClick={() => onChange(!value)}
      className={`${size === 'small' ? 'w-9 h-5' : 'w-11 h-6'} rounded-full relative transition-colors shrink-0`}
      style={{ background: value ? t.accent : isDark ? '#333' : '#ccc' }}
    >
      <div
        className={`${size === 'small' ? 'w-4 h-4' : 'w-5 h-5'} rounded-full bg-white absolute transition-all shadow-sm`}
        style={{ top: '2px', left: value ? (size === 'small' ? '18px' : '22px') : '2px' }}
      />
    </button>
  );

  const tabs = [
    { key: 'channels' as const, label: 'Channels', icon: '📡' },
    { key: 'categories' as const, label: 'Categories', icon: '📂' },
    { key: 'schedule' as const, label: 'Schedule', icon: '🕐' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/settings')} style={{ background: 'none', border: 'none', color: t.text, cursor: 'pointer' }}>
          <IcoBack size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Notification Controls</h1>
          <p className="text-[10px]" style={{ color: t.textMuted }}>
            Choose how and when you receive notifications
          </p>
        </div>
        <IcoBell size={22} color={t.accent} />
      </div>

      {/* Summary Banner */}
      <div
        className="rounded-2xl p-4 flex items-center gap-3"
        style={{
          background: `linear-gradient(135deg, ${t.accent}10, #f59e0b08)`,
          border: `1px solid ${t.accent}20`,
        }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: `${t.accent}15` }}>
          🔔
        </div>
        <div className="flex-1">
          <p className="text-xs font-bold">
            {categories.filter(c => c.push).length} of {categories.length} categories have push enabled
          </p>
          <p className="text-[9px]" style={{ color: t.textMuted }}>
            {quietHoursEnabled ? `Quiet hours: ${quietStart} - ${quietEnd}` : 'Quiet hours are off'}
          </p>
        </div>
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

      {/* CHANNELS TAB */}
      {activeTab === 'channels' && (
        <div className="space-y-3">
          <div className="rounded-2xl p-4 space-y-3" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold">Delivery Methods</p>
            <p className="text-[10px]" style={{ color: t.textMuted }}>
              Control global notification delivery. Disabling a channel here will turn it off for all categories.
            </p>
            {[
              { label: 'Push Notifications', desc: 'Receive alerts on your device', icon: '📲', value: pushEnabled, set: setPushEnabled },
              { label: 'Email Notifications', desc: 'Get updates in your inbox', icon: '📧', value: emailEnabled, set: setEmailEnabled },
              { label: 'In-App Notifications', desc: 'See alerts inside Datore', icon: '🔔', value: inAppEnabled, set: setInAppEnabled },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-3 py-1.5" style={{ borderTop: `1px solid ${t.cardBorder}` }}>
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-[9px]" style={{ color: t.textMuted }}>{item.desc}</p>
                  </div>
                </div>
                <ToggleSwitch value={item.value} onChange={item.set} />
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-4 space-y-3" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold">Alert Preferences</p>
            {[
              { label: 'Notification Sound', desc: 'Play a sound for incoming notifications', icon: '🔊', value: soundEnabled, set: setSoundEnabled },
              { label: 'Vibration', desc: 'Vibrate for incoming notifications', icon: '📳', value: vibrationEnabled, set: setVibrationEnabled },
              { label: 'Badge Count', desc: 'Show unread count on the app icon', icon: '🔴', value: badgeCount, set: setBadgeCount },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-[9px]" style={{ color: t.textMuted }}>{item.desc}</p>
                  </div>
                </div>
                <ToggleSwitch value={item.value} onChange={item.set} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CATEGORIES TAB */}
      {activeTab === 'categories' && (
        <div className="space-y-3">
          <p className="text-[10px] px-1" style={{ color: t.textMuted }}>
            Customize notifications for each category. Toggle Push, Email, and In-App independently.
          </p>
          {categories.map(cat => (
            <div
              key={cat.key}
              className="rounded-2xl p-4"
              style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}
            >
              <div className="flex items-start gap-2.5 mb-3">
                <span className="text-lg">{cat.icon}</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold">{cat.label}</p>
                  <p className="text-[9px]" style={{ color: t.textMuted }}>{cat.desc}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[
                  { key: 'push' as const, label: 'Push', icon: '📲', enabled: pushEnabled },
                  { key: 'email' as const, label: 'Email', icon: '📧', enabled: emailEnabled },
                  { key: 'inApp' as const, label: 'In-App', icon: '🔔', enabled: inAppEnabled },
                ].map(channel => (
                  <button
                    key={channel.key}
                    onClick={() => channel.enabled && updateCategory(cat.key, channel.key, !cat[channel.key])}
                    className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-medium transition-all"
                    style={{
                      background: cat[channel.key] && channel.enabled ? `${t.accent}15` : 'transparent',
                      border: `1.5px solid ${cat[channel.key] && channel.enabled ? t.accent : t.cardBorder}`,
                      color: cat[channel.key] && channel.enabled ? t.accent : t.textMuted,
                      opacity: channel.enabled ? 1 : 0.4,
                    }}
                  >
                    <span className="text-[10px]">{channel.icon}</span>
                    {channel.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SCHEDULE TAB */}
      {activeTab === 'schedule' && (
        <div className="space-y-3">
          {/* Quiet Hours */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold">Quiet Hours</p>
                <p className="text-[9px]" style={{ color: t.textMuted }}>
                  Silence non-urgent notifications during these hours
                </p>
              </div>
              <ToggleSwitch value={quietHoursEnabled} onChange={setQuietHoursEnabled} />
            </div>

            {quietHoursEnabled && (
              <div className="space-y-3 pt-2" style={{ borderTop: `1px solid ${t.cardBorder}` }}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[10px] font-medium mb-1" style={{ color: t.textMuted }}>Start Time</p>
                    <input
                      type="time"
                      value={quietStart}
                      onChange={e => setQuietStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-xs"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        color: t.text,
                        border: `1px solid ${t.cardBorder}`,
                        outline: 'none',
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium mb-1" style={{ color: t.textMuted }}>End Time</p>
                    <input
                      type="time"
                      value={quietEnd}
                      onChange={e => setQuietEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg text-xs"
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        color: t.text,
                        border: `1px solid ${t.cardBorder}`,
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-xs font-medium">Extended Weekend Quiet</p>
                    <p className="text-[9px]" style={{ color: t.textMuted }}>
                      Keep quiet hours active all day on weekends
                    </p>
                  </div>
                  <ToggleSwitch value={weekendQuiet} onChange={setWeekendQuiet} size="small" />
                </div>

                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-xs font-medium">Allow Urgent Alerts</p>
                    <p className="text-[9px]" style={{ color: t.textMuted }}>
                      Safety alerts and payment notifications will still come through
                    </p>
                  </div>
                  <ToggleSwitch value={urgentOverride} onChange={setUrgentOverride} size="small" />
                </div>
              </div>
            )}
          </div>

          {/* Digest */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold">Email Digest</p>
            <p className="text-[10px]" style={{ color: t.textMuted }}>
              Instead of individual email notifications, receive a summary digest.
            </p>
            {[
              { label: 'Instant', desc: 'Send each notification as a separate email' },
              { label: 'Daily Digest', desc: 'One summary email at the end of each day' },
              { label: 'Weekly Digest', desc: 'One summary email every Monday morning' },
              { label: 'Never', desc: 'Do not send any email notifications' },
            ].map((opt, idx) => (
              <button
                key={opt.label}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left"
                style={{
                  background: idx === 1 ? `${t.accent}10` : 'transparent',
                  border: `1.5px solid ${idx === 1 ? t.accent : t.cardBorder}`,
                }}
              >
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0"
                  style={{ borderColor: idx === 1 ? t.accent : t.textMuted }}
                >
                  {idx === 1 && <div className="w-2.5 h-2.5 rounded-full" style={{ background: t.accent }} />}
                </div>
                <div>
                  <p className="text-xs font-medium">{opt.label}</p>
                  <p className="text-[9px]" style={{ color: t.textMuted }}>{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
