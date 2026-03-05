"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { signOut } from '@/lib/supabase';
import { IcoBack, IcoUser, IcoShield, IcoSettings, IcoBell, IcoWallet, IcoSearch } from '@/components/Icons';

const SECTIONS = [
  {
    title: 'Your Account',
    items: [
      { icon: '🏠', label: 'Account Center', desc: 'Manage your personal details, linked accounts, and identity verification', path: '/settings/account', color: '#6366f1' },
      { icon: '🔐', label: 'Security Hub', desc: 'Password, two-factor authentication, login sessions, and trusted devices', path: '/settings/security', color: '#ef4444' },
      { icon: '🛡️', label: 'Privacy & Safety', desc: 'Control who sees your profile, posts, and how your data is used', path: '/settings/privacy', color: '#22c55e' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: '🔔', label: 'Notification Controls', desc: 'Customize push, email, and in-app alerts for jobs, messages, and events', path: '/settings/notifications', color: '#f59e0b' },
      { icon: '🎨', label: 'Accessibility & Display', desc: 'Theme, language, font size, contrast, and motion preferences', path: '/settings/accessibility', color: '#8b5cf6' },
    ],
  },
  {
    title: 'Your Information',
    items: [
      { icon: '📊', label: 'Activity & Data', desc: 'View your activity history, download your data, or manage storage', path: '/settings/activity', color: '#3b82f6' },
      { icon: '💰', label: 'Wallet & Payments', desc: 'Token balance, escrow, transaction history, and payout settings', path: '/wallet', color: '#06b6d4' },
    ],
  },
  {
    title: 'Quick Actions',
    items: [
      { icon: '👤', label: 'Edit Profile', desc: 'Update your name, bio, avatar, skills, and location', path: '/profile/edit', color: '#ec4899' },
      { icon: '🏅', label: 'Verification Status', desc: 'QR identity verification, police check, and trust score details', path: '/qr-verify', color: '#f97316' },
    ],
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor, toggle, setGlass, setAccent } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [searchQuery, setSearchQuery] = useState('');
  const ACCENTS = ['#6366f1','#ec4899','#22c55e','#f59e0b','#3b82f6','#8b5cf6','#ef4444','#06b6d4'];

  const filteredSections = searchQuery.trim()
    ? SECTIONS.map(s => ({
        ...s,
        items: s.items.filter(i =>
          i.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          i.desc.toLowerCase().includes(searchQuery.toLowerCase())
        ),
      })).filter(s => s.items.length > 0)
    : SECTIONS;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', color: t.text, cursor: 'pointer' }}>
          <IcoBack size={20} />
        </button>
        <h1 className="text-xl font-bold flex-1">Settings</h1>
      </div>

      {/* Search Settings */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: t.textMuted }}>
          <IcoSearch size={16} />
        </div>
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search settings..."
          className="w-full pl-10 pr-4 py-3 rounded-xl text-sm"
          style={{
            background: t.card,
            color: t.text,
            border: `1px solid ${t.cardBorder}`,
            outline: 'none',
          }}
        />
      </div>

      {/* Profile Quick Card */}
      <button
        onClick={() => router.push('/profile')}
        className="w-full p-4 rounded-2xl flex items-center gap-3 transition-all"
        style={{
          background: `linear-gradient(135deg, ${t.accent}12, ${t.accent}06)`,
          border: `1px solid ${t.accent}25`,
        }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)` }}
        >
          RS
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold">Rajesh S.</p>
          <p className="text-[10px]" style={{ color: t.textMuted }}>
            View your profile and manage visibility
          </p>
        </div>
        <span style={{ color: t.textMuted }}>→</span>
      </button>

      {/* Settings Sections */}
      {filteredSections.map(section => (
        <div key={section.title}>
          <p
            className="text-[10px] font-bold uppercase tracking-wider mb-2 px-1"
            style={{ color: t.textMuted }}
          >
            {section.title}
          </p>
          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}
          >
            {section.items.map((item, idx) => (
              <button
                key={item.label}
                onClick={() => router.push(item.path)}
                className="w-full flex items-center gap-3 p-4 transition-colors"
                style={{
                  borderBottom: idx < section.items.length - 1 ? `1px solid ${t.cardBorder}` : 'none',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: `${item.color}15` }}
                >
                  {item.icon}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold">{item.label}</p>
                  <p className="text-[10px] leading-tight mt-0.5" style={{ color: t.textMuted }}>
                    {item.desc}
                  </p>
                </div>
                <span className="text-sm shrink-0" style={{ color: t.textMuted }}>→</span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Quick Theme Toggle */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider mb-2 px-1" style={{ color: t.textMuted }}>
          Quick Theme
        </p>
        <div className="rounded-2xl p-4 space-y-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
              <p className="text-[10px]" style={{ color: t.textMuted }}>
                Switch between dark and light theme
              </p>
            </div>
            <button
              onClick={toggle}
              className="w-12 h-6 rounded-full relative transition-colors"
              style={{ background: isDark ? t.accent : '#ccc' }}
            >
              <div
                className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                style={{ left: isDark ? '26px' : '2px' }}
              />
            </button>
          </div>

          {/* Glass Level */}
          <div>
            <p className="text-xs font-medium mb-2">Glass Intensity</p>
            <div className="flex gap-2">
              {(['subtle', 'medium', 'heavy'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGlass(g)}
                  className="flex-1 py-2 rounded-xl text-xs font-medium capitalize transition-all"
                  style={{
                    background: glassLevel === g ? `${t.accent}20` : t.surface,
                    color: glassLevel === g ? t.accent : t.textSecondary,
                    border: glassLevel === g ? `1px solid ${t.accent}40` : `1px solid transparent`,
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Accent Colors */}
          <div>
            <p className="text-xs font-medium mb-2">Accent Color</p>
            <div className="flex gap-2 flex-wrap">
              {ACCENTS.map(c => (
                <button
                  key={c}
                  onClick={() => setAccent(c)}
                  className="w-8 h-8 rounded-full transition-transform"
                  style={{
                    background: c,
                    border: accentColor === c ? '3px solid white' : '2px solid transparent',
                    transform: accentColor === c ? 'scale(1.2)' : 'scale(1)',
                    boxShadow: accentColor === c ? `0 0 12px ${c}55` : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div
        className="rounded-2xl p-4 text-center space-y-1"
        style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}
      >
        <p className="text-[10px] font-bold" style={{ color: t.textMuted }}>Datore v2.4.0</p>
        <p className="text-[9px]" style={{ color: t.textMuted }}>Safe Service Marketplace</p>
        <div className="flex justify-center gap-4 pt-1">
          <button onClick={() => router.push('/privacy')} className="text-[10px]" style={{ color: t.accent }}>
            Privacy Policy
          </button>
          <button onClick={() => router.push('/terms')} className="text-[10px]" style={{ color: t.accent }}>
            Terms of Service
          </button>
        </div>
      </div>

      {/* Log Out */}
      <button
        onClick={async () => {
          await signOut();
          router.push('/login');
        }}
        className="rounded-2xl p-4 w-full text-center font-medium text-sm transition-colors"
        style={{
          background: 'rgba(239,68,68,0.08)',
          color: t.danger,
          border: '1px solid rgba(239,68,68,0.15)',
        }}
      >
        Log Out
      </button>

      <div className="h-4" />
    </div>
  );
}
