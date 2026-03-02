"use client";
export const dynamic = "force-dynamic";
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { signOut } from '@/lib/supabase';
import { IcoUser, IcoSettings, IcoWallet, IcoDashboard, IcoQR, IcoShield, IcoFriends, IcoCalendar, IcoCommunity, IcoChat, IcoJobs, IcoMap, IcoCompare, IcoStar, IcoMarket, IcoList, IcoBell, IcoSearch, IcoBookmark, IcoBack, IcoLogout, IcoMic } from '@/components/Icons';

const MENU = [
  { section: 'Account', items: [
    { Icon: IcoUser, label: 'My Profile', path: '/profile', color:'#6366f1', badge:'' },
    { Icon: IcoSettings, label: 'Settings', path: '/settings', color:'#8b5cf6', badge:'' },
    { Icon: IcoWallet, label: 'Wallet & Tokens', path: '/wallet', color:'#22c55e', badge:'' },
    { Icon: IcoDashboard, label: 'Dashboard', path: '/dashboard', color:'#3b82f6', badge:'' },
  ]},
  { section: 'Safety & Verification', items: [
    { Icon: IcoQR, label: 'QR Verification', path: '/qr-verify', color:'#06b6d4', badge:'' },
    { Icon: IcoShield, label: 'Safety Center', path: '/safety', color:'#22c55e', badge:'' },
  ]},
  { section: 'Social', items: [
    { Icon: IcoFriends, label: 'Friends', path: '/friends', color:'#ec4899', badge:'' },
    { Icon: IcoCalendar, label: 'Events', path: '/events', color:'#8b5cf6', badge:'' },
    { Icon: IcoCommunity, label: 'Buddy Groups', path: '/buddy-groups', color:'#06b6d4', badge:'BR-96/97' },
    { Icon: IcoChat, label: 'Messages', path: '/inbox', color:'#f97316', badge:'' },
  ]},
  { section: 'Professional', items: [
    { Icon: IcoJobs, label: 'Professional Profile', path: '/professional', color:'#3b82f6', badge:'BR-98' },
    { Icon: IcoUser, label: 'Find Workers', path: '/jobplace/providers', color:'#22c55e', badge:'' },
    { Icon: IcoMap, label: 'Map View', path: '/jobplace/map', color:'#f59e0b', badge:'' },
    { Icon: IcoCompare, label: 'Compare Workers', path: '/compare', color:'#3b82f6', badge:'' },
    { Icon: IcoStar, label: 'Buddy List', path: '/buddylist', color:'#eab308', badge:'' },
  ]},
  { section: 'Shopping', items: [
    { Icon: IcoMarket, label: 'Global Shop', path: '/shopping', color:'#ec4899', badge:'BR-99' },
    { Icon: IcoList, label: 'NearBy (Local Jobs + Buy/Sell)', path: '/nearby', color:'#f97316', badge:'Local' },
  ]},
  { section: 'Learning & Entertainment', items: [
    { Icon: IcoBookmark, label: 'Learning (Library, News, Science, History, Awards)', path: '/learning', color:'#8b5cf6', badge:'' },
    { Icon: IcoList, label: 'Micro-Learning', path: '/learn', color:'#06b6d4', badge:'' },
    { Icon: IcoList, label: 'Entertainment (Movies, TV, Games, Matches, Vacations)', path: '/entertainment', color:'#ec4899', badge:'NEW' },
    { Icon: IcoList, label: 'Reels', path: '/reels', color:'#ef4444', badge:'' },
  ]},
  { section: 'Health & Wellness', items: [
    { Icon: IcoList, label: 'Health (Doctors, Fitness, Diet, Yoga, Exercises)', path: '/health', color:'#10b981', badge:'NEW' },
  ]},
  { section: 'AI & Voice', items: [
    { Icon: IcoChat, label: 'Deto AI Assistant (Voice + Actions + Scheduling)', path: '/deto', color:'#8b5cf6', badge:'BR-104/105/106' },
  ]},
  { section: 'More', items: [
    { Icon: IcoBell, label: 'Notifications', path: '/notifications', color:'#ef4444', badge:'' },
    { Icon: IcoSearch, label: 'Search', path: '/search', color:'#6b7280', badge:'BR-102' },
    { Icon: IcoBookmark, label: 'Saved / Favorites', path: '/saved', color:'#eab308', badge:'' },
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
          <div className="space-y-1">
            {section.items.map(item => (
              <button key={item.path} onClick={() => router.push(item.path)} className="w-full flex items-center gap-3 p-3 rounded-xl text-left" style={{ background: 'transparent' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: item.color + '15' }}>
                  <item.Icon size={16} color={item.color} />
                </div>
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {item.badge && <span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold" style={{ background: item.color + '15', color: item.color }}>{item.badge}</span>}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button onClick={async () => { await signOut(); router.push('/auth/login'); }} className="w-full flex items-center gap-3 p-3 rounded-xl text-left" style={{ background:'rgba(239,68,68,0.06)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'rgba(239,68,68,0.15)' }}><IcoLogout size={16} color="#ef4444" /></div>
        <span className="text-sm font-medium" style={{ color:'#ef4444' }}>Sign Out</span>
      </button>
    </div>
  );
}
