"use client";
export const dynamic = "force-dynamic";
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { signOut } from '@/lib/supabase';

const MENU = [
  { section: 'Account', items: [
    { icon: 'U', label: 'My Profile', path: '/profile' },
    { icon: 'S', label: 'Settings', path: '/settings' },
    { icon: '$', label: 'Wallet', path: '/wallet' },
    { icon: 'D', label: 'Dashboard', path: '/dashboard' },
  ]},
  { section: 'Activity', items: [
    { icon: 'J', label: 'My Jobs', path: '/jobplace' },
    { icon: 'L', label: 'My Listings', path: '/marketplace/my-listings' },
    { icon: '*', label: 'Buddy List', path: '/buddylist' },
    { icon: 'F', label: 'Saved / Favorites', path: '/saved' },
  ]},
  { section: 'Discover', items: [
    { icon: 'M', label: 'Map View', path: '/jobplace/map' },
    { icon: 'W', label: 'Find Workers', path: '/jobplace/providers' },
    { icon: 'P', label: 'Marketplace', path: '/marketplace' },
    { icon: 'G', label: 'Community', path: '/community' },
  ]},
  { section: 'Support', items: [
    { icon: 'N', label: 'Notifications', path: '/notifications' },
    { icon: 'C', label: 'Messages', path: '/inbox' },
  ]},
];

export default function MenuPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <div className="flex items-center gap-3"><button onClick={() => router.back()} className="text-lg">{'<-'}</button><h1 className="text-xl font-bold">Menu</h1></div>
      {MENU.map(section => (
        <div key={section.section}>
          <h2 className="text-xs font-semibold uppercase tracking-wider mb-2 px-1" style={{ color: t.textMuted }}>{section.section}</h2>
          <div className="glass-card rounded-2xl overflow-hidden" style={{ background: t.card, borderColor: t.cardBorder }}>
            {section.items.map((item, i) => (
              <button key={item.path} onClick={() => router.push(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
                style={{ borderBottom: i < section.items.length - 1 ? `1px solid ${t.cardBorder}` : 'none' }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background:`${t.accent}15`, color:t.accent }}>{item.icon}</span>
                <span className="text-sm font-medium flex-1">{item.label}</span>
                <span style={{ color: t.textMuted, fontSize: 12 }}>{'>'}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={async () => { await signOut(); router.push('/login'); }}
        className="glass-card rounded-2xl p-4 w-full text-center font-medium text-sm"
        style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}>Log Out</button>
    </div>
  );
}
