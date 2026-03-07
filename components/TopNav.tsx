"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoHome, IcoCommunity, IcoFilm, IcoSearch, IcoBell, IcoGrid, IcoUser } from './Icons';

const hexClip = 'polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%)';

const LEFT_TABS = [
  { label:'Home',    Icon:IcoHome,      path:'/home',    color:'#6366f1' },
  { label:'Netyard', Icon:IcoCommunity, path:'/netyard', color:'#8b5cf6' },
  { label:'Reel',    Icon:IcoFilm,      path:'/reels',   color:'#ec4899' },
];

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, accentColor } = useThemeStore();
  const t = getTheme(isDark, 'medium', accentColor);
  const muted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  return (
    <>
    {/* ─── Mobile top bar (portrait) ─── */}
    <div className="sticky top-0 z-50 md:hidden" style={{
      background: isDark ? 'rgba(12,12,22,0.92)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    }}>
      <div className="flex items-center justify-between px-4" style={{height:48}}>
        <div onClick={()=>router.push('/home')} className="flex items-center gap-2 cursor-pointer">
          <div style={{
            width:28, height:28,
            clipPath: hexClip,
            background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 8px rgba(99,102,241,0.3)',
          }}>
            <svg width="12" height="14" viewBox="0 0 16 18" fill="none">
              <path d="M15 8.134a1 1 0 010 1.732l-13 7.5A1 1 0 010 16.5v-15A1 1 0 012 .634l13 7.5z" fill="white"/>
            </svg>
          </div>
          <span style={{
            fontWeight:800, fontSize:17, letterSpacing:-0.5,
            background:'linear-gradient(135deg,#6366f1,#a78bfa)',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'
          }}>Datore</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={()=>router.push('/search')} style={{width:34,height:34,borderRadius:10,background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <IcoSearch size={18} color={!!pathname?.startsWith('/search') ? '#6366f1' : muted} />
          </button>
          <button onClick={()=>router.push('/notifications')} className="relative" style={{width:34,height:34,borderRadius:10,background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <IcoBell size={18} color={!!pathname?.startsWith('/notifications') ? '#6366f1' : muted} />
            <span style={{position:'absolute',top:4,right:4,width:7,height:7,borderRadius:'50%',background:'#ef4444',border:`2px solid ${isDark?'rgba(12,12,22,0.92)':'#fff'}`}} />
          </button>
          <button onClick={()=>router.push('/profile')} style={{width:34,height:34,borderRadius:10,background:'none',border:'none',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <IcoUser size={18} color={!!pathname?.startsWith('/profile') ? '#6366f1' : muted} />
          </button>
        </div>
      </div>
    </div>

    {/* ─── Desktop top nav ─── */}
    <nav className="sticky top-0 z-50 hidden md:block" style={{
      background: isDark ? 'rgba(12,12,22,0.92)' : 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    }}>
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between" style={{height:56}}>

        {/* ─── Left: Datore logo, Home, Netyard, Reel ─── */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Logo */}
          <div onClick={()=>router.push('/home')} className="flex items-center gap-2.5 cursor-pointer mr-2">
            <div style={{
              width:36, height:36,
              clipPath: hexClip,
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

          {/* Tab buttons */}
          {LEFT_TABS.map(tab => {
            const active = !!pathname?.startsWith(tab.path);
            return (
              <button
                key={tab.path}
                onClick={()=>router.push(tab.path)}
                className="flex items-center justify-center gap-1.5"
                title={tab.label}
                style={{
                  width:42, height:46,
                  clipPath: hexClip,
                  background: active
                    ? `linear-gradient(135deg,${tab.color},${tab.color}cc)`
                    : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  border:'none', cursor:'pointer',
                  transition:'all 0.2s',
                }}
              >
                <tab.Icon size={18} color={active ? '#fff' : muted} />
              </button>
            );
          })}
        </div>

        {/* ─── Right: Search, Notification, Menu, Profile ─── */}
        <div className="flex items-center gap-2 shrink-0">
          <HexBtn Icon={IcoSearch} onClick={()=>router.push('/search')} active={!!pathname?.startsWith('/search')} muted={muted} isDark={isDark} />
          <HexBtn Icon={IcoBell} onClick={()=>router.push('/notifications')} active={!!pathname?.startsWith('/notifications')} muted={muted} isDark={isDark} badge />
          <HexBtn Icon={IcoGrid} onClick={()=>router.push('/menu')} active={!!pathname?.startsWith('/menu')} muted={muted} isDark={isDark} isMenu />
          <button onClick={()=>router.push('/profile')} style={{
            width:38, height:42,
            clipPath: hexClip,
            background: !!pathname?.startsWith('/profile')
              ? `linear-gradient(135deg,${accentColor},#8b5cf6)`
              : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            border:'none', cursor:'pointer',
            display:'flex', alignItems:'center', justifyContent:'center',
            transition:'all 0.2s',
          }} title="Profile">
            <IcoUser size={16} color={!!pathname?.startsWith('/profile') ? '#fff' : muted} />
          </button>
        </div>
      </div>
    </nav>
    </>
  );
}

/* ─── Hexagon action button ─── */
function HexBtn({ Icon, onClick, active, muted, isDark, badge, isMenu }: {
  Icon:any; onClick:()=>void; active?:boolean; muted:string; isDark:boolean; badge?:boolean; isMenu?:boolean;
}) {
  return (
    <button onClick={onClick} className="relative" style={{
      width:38, height:42,
      clipPath: hexClip,
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
          position:'absolute', top:2, right:6,
          width:8, height:8, borderRadius:'50%',
          background:'#ef4444',
          border:`2px solid ${isDark ? 'rgba(12,12,22,0.92)' : '#fff'}`,
        }} />
      )}
    </button>
  );
}
