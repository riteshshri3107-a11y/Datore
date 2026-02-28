"use client";
export const dynamic = "force-dynamic";
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { signOut } from '@/lib/supabase';
import { IcoUser, IcoSettings, IcoWallet, IcoDashboard, IcoQR, IcoShield, IcoFriends, IcoCalendar, IcoCommunity, IcoChat, IcoJobs, IcoMap, IcoCompare, IcoStar, IcoMarket, IcoList, IcoBell, IcoSearch, IcoBookmark, IcoBack, IcoLogout, IcoMic } from '@/components/Icons';

const MENU = [
  { section: 'Account', items: [
    { Icon: IcoUser, label: 'My Profile', path: '/profile', color:'#6366f1' },
    { Icon: IcoSettings, label: 'Settings', path: '/settings', color:'#8b5cf6' },
    { Icon: IcoWallet, label: 'Wallet & Tokens', path: '/wallet', color:'#22c55e' },
    { Icon: IcoDashboard, label: 'Dashboard', path: '/dashboard', color:'#3b82f6' },
  ]},
  { section: 'Safety & Verification', items: [
    { Icon: IcoQR, label: 'QR Verification', path: '/qr-verify', color:'#06b6d4' },
    { Icon: IcoShield, label: 'Safety Center', path: '/safety', color:'#22c55e' },
  ]},
  { section: 'Social', items: [
    { Icon: IcoFriends, label: 'Friends', path: '/friends', color:'#ec4899' },
    { Icon: IcoCalendar, label: 'Events', path: '/events', color:'#8b5cf6' },
    { Icon: IcoCommunity, label: 'Community Groups', path: '/community', color:'#06b6d4' },
    { Icon: IcoChat, label: 'Messages', path: '/inbox', color:'#f97316' },
  ]},
  { section: 'Jobs & Services', items: [
    { Icon: IcoJobs, label: 'My Jobs', path: '/jobplace', color:'#6366f1' },
    { Icon: IcoUser, label: 'Find Workers', path: '/jobplace/providers', color:'#22c55e' },
    { Icon: IcoMap, label: 'Map View', path: '/jobplace/map', color:'#f59e0b' },
    { Icon: IcoCompare, label: 'Compare Workers', path: '/compare', color:'#3b82f6' },
    { Icon: IcoStar, label: 'Buddy List', path: '/buddylist', color:'#eab308' },
  ]},
  { section: 'Marketplace', items: [
    { Icon: IcoMarket, label: 'Browse Items', path: '/marketplace', color:'#ec4899' },
    { Icon: IcoList, label: 'My Listings', path: '/marketplace/my-listings', color:'#f97316' },
  ]},
  { section: 'AI & Voice', items: [
    { Icon: IcoChat, label: 'Deto AI Companion', path: '/deto', color:'#8b5cf6' },
    { Icon: IcoMic, label: 'Voice Commerce', path: '/voice-commerce', color:'#06b6d4' },
  ]},
  { section: 'More', items: [
    { Icon: IcoBell, label: 'Notifications', path: '/notifications', color:'#ef4444' },
    { Icon: IcoSearch, label: 'Search', path: '/search', color:'#6b7280' },
    { Icon: IcoBookmark, label: 'Saved / Favorites', path: '/saved', color:'#eab308' },
  ]},
];

export default function MenuPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold">Menu</h1>
      </div>
      {MENU.map(section => (
        <div key={section.section}>
          <h2 className="text-[10px] font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: t.textMuted }}>{section.section}</h2>
          <div className="glass-card rounded-2xl overflow-hidden" style={{ background: t.card, borderColor: t.cardBorder }}>
            {section.items.map((item, i) => (
              <button key={item.path} onClick={() => router.push(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                style={{ borderBottom: i < section.items.length - 1 ? `1px solid ${t.cardBorder}` : 'none' }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:`${item.color}15` }}>
                  <item.Icon size={18} color={item.color} />
                </span>
                <span className="text-sm font-medium flex-1">{item.label}</span>
                <span style={{ color: t.textMuted, fontSize: 12 }}>›</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={async () => { await signOut(); router.push('/login'); }}
        className="glass-card rounded-2xl p-4 w-full flex items-center justify-center gap-2 font-medium text-sm"
        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>
        <IcoLogout size={18} color="#ef4444" /> Log Out
      </button>
    </div>
  );
}
