"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoHome, IcoCommunity, IcoPlus, IcoSearch, IcoQR, IcoMenu, IcoChat, IcoFriends, IcoBell, IcoUser, IcoGlobe, IcoStore, IcoBook, IcoPlay, IcoFilm, IcoHealth } from './Icons';

/* All nav items — uniform hex badge format */
const NAV_LEFT = [
  { label:'Home', Icon:IcoHome, path:'/home', color:'#6366f1', g1:'#6366f1', g2:'#4f46e5' },
  { label:'Community', Icon:IcoCommunity, path:'/community', color:'#06b6d4', g1:'#06b6d4', g2:'#0891b2' },
  { label:'Create', Icon:IcoPlus, path:'/create', color:'#22c55e', g1:'#22c55e', g2:'#16a34a' },
];

const NAV_HEX = [
  { label:'Global Shop', Icon:IcoGlobe, path:'/shopping', color:'#22c55e', g1:'#22c55e', g2:'#16a34a' },
  { label:'NearBy', Icon:IcoStore, path:'/nearby', color:'#f97316', g1:'#f97316', g2:'#ea580c' },
  { label:'Learning', Icon:IcoBook, path:'/learning', color:'#8b5cf6', g1:'#8b5cf6', g2:'#7c3aed' },
  { label:'Entertain', Icon:IcoPlay, path:'/entertainment', color:'#ec4899', g1:'#ec4899', g2:'#db2777' },
  { label:'Health', Icon:IcoHealth, path:'/health', color:'#10b981', g1:'#10b981', g2:'#059669' },
  { label:'Reels', Icon:IcoFilm, path:'/reels', color:'#ef4444', g1:'#ef4444', g2:'#dc2626' },
];

/* Right-side actions — ordered RTL: Notifications, Friends, Chat, Menu, QR, Search ... Profile (extreme right) */
const NAV_RIGHT = [
  { label:'Search', Icon:IcoSearch, path:'/search', color:'#6366f1', g1:'#6366f1', g2:'#4f46e5' },
  { label:'QR Scan', Icon:IcoQR, path:'/qr-verify', color:'#f59e0b', g1:'#f59e0b', g2:'#d97706' },
  { label:'Menu', Icon:IcoMenu, path:'/menu', color:'#8b5cf6', g1:'#8b5cf6', g2:'#7c3aed' },
  { label:'Chat', Icon:IcoChat, path:'/inbox', color:'#06b6d4', g1:'#06b6d4', g2:'#0891b2', badge:true },
  { label:'Friends', Icon:IcoFriends, path:'/friends', color:'#22c55e', g1:'#22c55e', g2:'#16a34a' },
  { label:'Alerts', Icon:IcoBell, path:'/notifications', color:'#ef4444', g1:'#ef4444', g2:'#dc2626', badge:true },
];

/* Premium hexagonal badge with SVG hex shape — uniform for all icons */
function HexBadge({ Icon, label, color, g1, g2, active, onClick, badge, small }: { Icon:any; label:string; color:string; g1:string; g2:string; active:boolean; onClick:()=>void; badge?:boolean; small?:boolean }) {
  const w = small ? 36 : 42;
  const h = small ? 40 : 46;
  const iconSize = small ? 14 : 16;
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-[3px] group relative" title={label} style={{background:'none',border:'none',cursor:'pointer',padding:0}}>
      <div className="relative" style={{width:w,height:h}}>
        {/* SVG hex shape — smooth anti-aliased edges */}
        <svg viewBox="0 0 42 46" width={w} height={h} style={{position:'absolute',top:0,left:0}}>
          <defs>
            <linearGradient id={`hg-${label.replace(/\s/g,'')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={active?g1:`${color}30`}/>
              <stop offset="100%" stopColor={active?g2:`${color}18`}/>
            </linearGradient>
          </defs>
          {/* Outer hex border */}
          <polygon points="21,1 40,12 40,34 21,45 2,34 2,12" fill="none" stroke={active?color:`${color}40`} strokeWidth={active?1.5:1} strokeLinejoin="round"/>
          {/* Inner hex fill */}
          <polygon points="21,3 38,13.5 38,32.5 21,43 4,32.5 4,13.5" fill={`url(#hg-${label.replace(/\s/g,'')})`} strokeLinejoin="round"/>
        </svg>
        {/* Icon centered */}
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:1}}>
          <Icon size={iconSize} color={active?'#fff':color} />
        </div>
        {/* Active glow */}
        {active && <div style={{position:'absolute',inset:-4,borderRadius:'50%',background:`${color}12`,filter:'blur(8px)',zIndex:0}} />}
      </div>
      {badge && <span style={{position:'absolute',top:0,right:0,width:7,height:7,borderRadius:'50%',background:'#ef4444',border:'1.5px solid rgba(15,15,26,0.92)',zIndex:2}} />}
      <span style={{
        fontSize: 8, fontWeight: active?700:500, letterSpacing: 0.2,
        color: active ? color : 'rgba(255,255,255,0.4)',
        textAlign: 'center', lineHeight: 1.1,
        transition: 'color 0.2s'
      }}>{label}</span>
    </button>
  );
}

/* Profile avatar button — extreme right, always shows user icon */
function ProfileBtn({ active, onClick, isDark, accentColor }: { active:boolean; onClick:()=>void; isDark:boolean; accentColor:string }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-[3px] group" title="Profile" style={{background:'none',border:'none',cursor:'pointer',padding:0}}>
      <div style={{
        width: 38, height: 38, borderRadius: '50%',
        background: active
          ? `linear-gradient(135deg, #a78bfa, #8b5cf6)`
          : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        border: active ? '2px solid #a78bfa' : `2px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: active ? '0 2px 12px rgba(167,139,250,0.4)' : 'none',
        transition: 'all 0.25s ease',
      }}>
        <IcoUser size={18} color={active ? '#fff' : isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'} />
      </div>
      <span style={{
        fontSize: 8, fontWeight: active ? 700 : 500, letterSpacing: 0.2,
        color: active ? '#a78bfa' : 'rgba(255,255,255,0.4)',
        textAlign: 'center', lineHeight: 1.1,
        transition: 'color 0.2s'
      }}>Profile</span>
    </button>
  );
}

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);

  return (
    <nav className="sticky top-0 z-50 hidden md:block" style={{
      background: isDark ? 'rgba(12,12,22,0.88)' : 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    }}>
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between" style={{height:64}}>
        {/* Logo — Original Datore brand */}
        <div onClick={()=>router.push('/home')} className="flex items-center gap-2.5 cursor-pointer group">
          <div style={{
            width:36, height:36, borderRadius:10,
            background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 12px rgba(99,102,241,0.35)',
            transition:'transform 0.2s',
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

        {/* Center Nav — Uniform hex badge format */}
        <div className="flex items-center gap-1">
          {NAV_LEFT.map(item => (
            <HexBadge key={item.path} Icon={item.Icon} label={item.label} color={item.color} g1={item.g1} g2={item.g2} active={!!pathname?.startsWith(item.path)} onClick={()=>router.push(item.path)} />
          ))}

          {/* Hex Divider */}
          <div style={{width:1,height:28,background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)',margin:'0 6px',borderRadius:1}} />

          {/* Hex Icon Group */}
          <div className="flex items-center gap-1">
            {NAV_HEX.map(item => (
              <HexBadge key={item.path} Icon={item.Icon} label={item.label} color={item.color} g1={item.g1} g2={item.g2} active={!!pathname?.startsWith(item.path)} onClick={()=>router.push(item.path)} />
            ))}
          </div>
        </div>

        {/* Right Actions — Uniform hex badges, RTL: action icons then Profile at extreme right */}
        <div className="flex items-center gap-1">
          {NAV_RIGHT.map(item => (
            <HexBadge key={item.path} Icon={item.Icon} label={item.label} color={item.color} g1={item.g1} g2={item.g2} active={!!pathname?.startsWith(item.path)} onClick={()=>router.push(item.path)} badge={item.badge} small />
          ))}

          {/* Divider before Profile */}
          <div style={{width:1,height:28,background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)',margin:'0 4px',borderRadius:1}} />

          {/* Profile — Extreme right, always shows user avatar */}
          <ProfileBtn active={!!pathname?.startsWith('/profile')} onClick={()=>router.push('/profile')} isDark={isDark} accentColor={accentColor} />
        </div>
      </div>
    </nav>
  );
}
