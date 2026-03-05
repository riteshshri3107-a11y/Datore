"use client";
export const dynamic = "force-dynamic";
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { signOut } from '@/lib/supabase';
import {
  IcoUser, IcoSettings, IcoWallet, IcoDashboard, IcoQR, IcoShield,
  IcoFriends, IcoCalendar, IcoCommunity, IcoChat, IcoJobs, IcoMap,
  IcoCompare, IcoStar, IcoMarket, IcoList, IcoBell, IcoSearch,
  IcoBookmark, IcoBack, IcoLogout, IcoMic, IcoGlobe, IcoBook,
  IcoFilm, IcoGamepad, IcoHealth, IcoStore, IcoPlus, IcoMusic, IcoVideo,
  IcoGrid, IcoEdit, IcoFlag,
} from '@/components/Icons';

/* ─── Facebook-style categorized grid ─── */
const CATEGORIES = [
  {
    title: 'Social',
    color: '#ec4899',
    items: [
      { Icon: IcoFriends,   label: 'Friends',       path: '/friends',      color: '#ec4899' },
      { Icon: IcoChat,      label: 'Messages',      path: '/inbox',        color: '#f97316' },
      { Icon: IcoCommunity, label: 'Groups',         path: '/buddy-groups', color: '#06b6d4' },
      { Icon: IcoCalendar,  label: 'Events',         path: '/events',       color: '#8b5cf6' },
      { Icon: IcoBell,      label: 'Notifications',  path: '/notifications',color: '#ef4444' },
      { Icon: IcoBookmark,  label: 'Saved',          path: '/saved',        color: '#eab308' },
    ],
  },
  {
    title: 'Professional',
    color: '#3b82f6',
    items: [
      { Icon: IcoJobs,    label: 'Post a Job',      path: '/jobplace/create',    color: '#3b82f6' },
      { Icon: IcoUser,    label: 'Find Workers',    path: '/jobplace/providers', color: '#22c55e' },
      { Icon: IcoMap,     label: 'Map View',         path: '/jobplace/map',       color: '#f59e0b' },
      { Icon: IcoCompare, label: 'Compare',          path: '/compare',            color: '#3b82f6' },
      { Icon: IcoStar,    label: 'Buddy List',       path: '/buddylist',          color: '#eab308' },
      { Icon: IcoEdit,    label: 'Pro Profile',      path: '/professional',       color: '#6366f1' },
    ],
  },
  {
    title: 'Shopping',
    color: '#22c55e',
    items: [
      { Icon: IcoGlobe,  label: 'Global Shop',      path: '/shopping',  color: '#22c55e' },
      { Icon: IcoStore,  label: 'NetYard Local',      path: '/nearby',    color: '#f97316' },
      { Icon: IcoMarket, label: 'Marketplace',       path: '/marketplace', color: '#ec4899' },
    ],
  },
  {
    title: 'Entertainment',
    color: '#ec4899',
    items: [
      { Icon: IcoFilm,    label: 'Movies & TV',     path: '/entertainment', color: '#ec4899' },
      { Icon: IcoVideo,   label: 'Reels',            path: '/reels',         color: '#ef4444' },
      { Icon: IcoGamepad, label: 'Games',             path: '/entertainment', color: '#8b5cf6' },
      { Icon: IcoMusic,   label: 'Music',             path: '/entertainment', color: '#06b6d4' },
    ],
  },
  {
    title: 'Learning',
    color: '#8b5cf6',
    items: [
      { Icon: IcoBook,     label: 'Library',          path: '/learning', color: '#8b5cf6' },
      { Icon: IcoList,     label: 'Micro-Learning',   path: '/learn',    color: '#06b6d4' },
      { Icon: IcoBookmark, label: 'News & Science',   path: '/learning', color: '#3b82f6' },
    ],
  },
  {
    title: 'Health & Wellness',
    color: '#10b981',
    items: [
      { Icon: IcoHealth, label: 'Health',        path: '/health', color: '#10b981' },
      { Icon: IcoUser,   label: 'Fitness',       path: '/health', color: '#22c55e' },
      { Icon: IcoStar,   label: 'Yoga & Diet',   path: '/health', color: '#06b6d4' },
    ],
  },
  {
    title: 'AI & Tools',
    color: '#8b5cf6',
    items: [
      { Icon: IcoMic,    label: 'Deto AI',        path: '/deto',      color: '#8b5cf6' },
      { Icon: IcoSearch, label: 'Search',          path: '/search',    color: '#6b7280' },
      { Icon: IcoQR,     label: 'QR Verify',       path: '/qr-verify', color: '#06b6d4' },
    ],
  },
  {
    title: 'Account & Settings',
    color: '#6366f1',
    items: [
      { Icon: IcoUser,      label: 'My Profile',    path: '/profile',    color: '#6366f1' },
      { Icon: IcoSettings,  label: 'Settings',       path: '/settings',   color: '#8b5cf6' },
      { Icon: IcoWallet,    label: 'Wallet',          path: '/wallet',     color: '#22c55e' },
      { Icon: IcoDashboard, label: 'Dashboard',       path: '/dashboard',  color: '#3b82f6' },
      { Icon: IcoShield,    label: 'Safety Center',   path: '/safety',     color: '#22c55e' },
      { Icon: IcoShield,    label: 'Privacy',          path: '/privacy',    color: '#06b6d4' },
    ],
  },
  {
    title: 'Admin',
    color: '#ef4444',
    items: [
      { Icon: IcoShield,    label: 'Moderation',      path: '/admin/moderation',      color: '#ef4444' },
      { Icon: IcoDashboard, label: 'Observability',    path: '/admin/observability',   color: '#06b6d4' },
      { Icon: IcoSettings,  label: 'Infrastructure',   path: '/admin/infrastructure',  color: '#8b5cf6' },
      { Icon: IcoFlag,      label: 'Feature Flags',    path: '/admin/features',        color: '#f59e0b' },
      { Icon: IcoDashboard, label: 'Audit Log',         path: '/admin/audit',           color: '#f59e0b' },
    ],
  },
];

export default function MenuPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

  return (
    <div className="space-y-5 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}>
          <IcoBack size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold">Menu</h1>
          <p className="text-xs" style={{ color: t.textMuted }}>All features & shortcuts</p>
        </div>
      </div>

      {/* Search bar */}
      <button
        onClick={() => router.push('/search')}
        className="w-full flex items-center gap-3 rounded-xl"
        style={{
          padding: '12px 16px',
          background: cardBg,
          border: `1px solid ${cardBorder}`,
          cursor:'pointer', textAlign:'left',
        }}
      >
        <IcoSearch size={16} color={t.textMuted} />
        <span className="text-sm" style={{ color: t.textMuted }}>Search Datore...</span>
      </button>

      {/* ─── Categorized Grid Blocks (Facebook-style) ─── */}
      {CATEGORIES.map(cat => (
        <div key={cat.title}>
          {/* Category header with colored accent */}
          <div className="flex items-center gap-2 mb-2.5 px-1">
            <div style={{ width:3, height:16, borderRadius:2, background: cat.color }} />
            <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: cat.color }}>
              {cat.title}
            </h2>
          </div>

          {/* Icon grid — 3 columns like Facebook */}
          <div className="grid grid-cols-3 gap-2">
            {cat.items.map((item, i) => (
              <button
                key={`${item.path}-${i}`}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center gap-2 rounded-xl transition-all duration-200"
                style={{
                  padding: '16px 8px 12px',
                  background: cardBg,
                  border: `1px solid ${cardBorder}`,
                  cursor:'pointer',
                }}
              >
                {/* Icon circle with colored background */}
                <div style={{
                  width:44, height:44, borderRadius:14,
                  background: `${item.color}15`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'all 0.2s',
                }}>
                  <item.Icon size={22} color={item.color} />
                </div>
                <span className="text-[11px] font-medium text-center leading-tight" style={{ color: t.text }}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* ─── Sign Out (separate, like Facebook) ─── */}
      <div className="pt-2">
        <button
          onClick={async () => { await signOut(); router.push('/auth/login'); }}
          className="w-full flex items-center justify-center gap-2 rounded-xl"
          style={{
            padding:'14px',
            background:'rgba(239,68,68,0.06)',
            border:'1px solid rgba(239,68,68,0.12)',
            cursor:'pointer',
          }}
        >
          <IcoLogout size={16} color="#ef4444" />
          <span className="text-sm font-semibold" style={{ color:'#ef4444' }}>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
