"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoHome, IcoCommunity, IcoFilm, IcoSearch, IcoBell, IcoGrid, IcoUser } from './Icons';

/* ─── Core tabs: Home, Community (includes NearBy), Reels ─── */
const CORE_TABS = [
  { label:'Home',      Icon:IcoHome,      path:'/home',          color:'#6366f1' },
  { label:'Community',  Icon:IcoCommunity, path:'/community',     color:'#06b6d4' },
  { label:'Reels',      Icon:IcoFilm,      path:'/reels',         color:'#ef4444' },
];

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, accentColor } = useThemeStore();
  const t = getTheme(isDark, 'medium', accentColor);
  const muted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  return (
    <nav className="sticky top-0 z-50 hidden md:block" style={{
      background: isDark ? 'rgba(12,12,22,0.92)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    }}>
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between" style={{height:56}}>

        {/* ─── Logo ─── */}
        <div onClick={()=>router.push('/home')} className="flex items-center gap-2.5 cursor-pointer shrink-0">
          <div style={{
            width:36, height:36, borderRadius:10,
            background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 12px rgba(99,102,241,0.35)',
          }}>
            <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
              <path d="M15 8.134a1 1 0 010 1.732l-13 7.5A1 1 0 010 16.5v-15A1 1 0 012 .634l13 7.5z" fill="white"/>
            </svg>
          </div>
          <span style={{
            fontWeight:800, fontSize:19, letterSpacing:-0.5,
            background:'linear-gradient(135deg,#6366f1,#a78bfa)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
          }}>Datore</span>
        </div>

        {/* ─── Core Tabs (Facebook-style wide tabs with active underline) ─── */}
        <div className="flex items-center" style={{gap:2}}>
          {CORE_TABS.map(tab => {
            const active = !!pathname?.startsWith(tab.path);
            return (
              <button
                key={tab.path}
                onClick={()=>router.push(tab.path)}
                className="relative flex items-center justify-center gap-2 transition-all duration-200"
                title={tab.label}
                style={{
                  background:'none', border:'none', cursor:'pointer',
                  padding:'6px 20px', height:56,
                  borderRadius:0,
                }}
              >
                <tab.Icon size={20} color={active ? tab.color : muted} />
                <span style={{
                  fontSize:13, fontWeight: active ? 700 : 500,
                  color: active ? tab.color : muted,
                  letterSpacing: 0.1,
                  transition:'color 0.2s',
                }}>{tab.label}</span>
                {/* Active indicator bar (like Facebook's blue bottom border) */}
                {active && (
                  <div style={{
                    position:'absolute', bottom:0, left:8, right:8,
                    height:3, borderRadius:'3px 3px 0 0',
                    background: tab.color,
                    boxShadow: `0 -2px 8px ${tab.color}40`,
                  }} />
                )}
                {/* Hover background */}
                {!active && (
                  <div style={{
                    position:'absolute', inset:'4px 0',
                    borderRadius:8,
                    background:'transparent',
                    transition:'background 0.2s',
                  }} className="group-hover:bg-white/5" />
                )}
              </button>
            );
          })}
        </div>

        {/* ─── Right Actions (4 circle buttons like Facebook) ─── */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Search */}
          <CircleBtn Icon={IcoSearch} onClick={()=>router.push('/search')} active={!!pathname?.startsWith('/search')} muted={muted} isDark={isDark} />
          {/* Notifications (includes messages alerts) */}
          <CircleBtn Icon={IcoBell} onClick={()=>router.push('/notifications')} active={!!pathname?.startsWith('/notification')} muted={muted} isDark={isDark} badge />
          {/* Menu Grid */}
          <CircleBtn Icon={IcoGrid} onClick={()=>router.push('/menu')} active={!!pathname?.startsWith('/menu')} muted={muted} isDark={isDark} isMenu />
          {/* Profile avatar */}
          <button onClick={()=>router.push('/profile')} style={{
            width:34, height:34, borderRadius:'50%',
            background: !!pathname?.startsWith('/profile')
              ? `linear-gradient(135deg,${accentColor},#8b5cf6)`
              : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            border: !!pathname?.startsWith('/profile') ? `2px solid ${accentColor}` : '2px solid transparent',
            cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.2s',
          }} title="Profile">
            <IcoUser size={16} color={!!pathname?.startsWith('/profile') ? '#fff' : muted} />
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ─── Facebook-style circular action button ─── */
function CircleBtn({ Icon, onClick, active, muted, isDark, badge, isMenu }: {
  Icon:any; onClick:()=>void; active?:boolean; muted:string; isDark:boolean; badge?:boolean; isMenu?:boolean;
}) {
  return (
    <button onClick={onClick} className="relative" style={{
      width:38, height:38, borderRadius:'50%',
      background: active
        ? (isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)')
        : isMenu
          ? (isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)')
          : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
      border:'none', cursor:'pointer',
      display:'flex', alignItems:'center', justifyContent:'center',
      transition:'all 0.2s',
    }} title={isMenu ? 'Menu' : undefined}>
      <Icon size={18} color={active ? '#6366f1' : isMenu ? '#6366f1' : muted} />
      {badge && (
        <span style={{
          position:'absolute', top:4, right:4,
          width:8, height:8, borderRadius:'50%',
          background:'#ef4444',
          border:`2px solid ${isDark ? 'rgba(12,12,22,0.92)' : '#fff'}`,
        }} />
      )}
    </button>
  );
}
