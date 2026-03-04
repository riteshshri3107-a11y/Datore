"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoHome, IcoCommunity, IcoPlus, IcoSearch, IcoQR, IcoMenu, IcoChat, IcoFriends, IcoBell, IcoUser, IcoGlobe, IcoStore, IcoBook, IcoPlay, IcoFilm, IcoHealth } from './Icons';

/* ── Social‑media‑first grouping ──────────────────────────
 *  Core Feed   → Home · Community · Reels        (what I consume)
 *  Create      → Create                          (what I produce — prominent)
 *  Discovery   → NearBy · Shop · Learn · Fun · Health  (where I explore)
 *  Comms       → Chat · Friends · Alerts         (my people)
 *  Utility     → Search · QR · Profile · Menu    (tools & settings)
 * ──────────────────────────────────────────────── */

const NAV_FEED = [
  { label:'Home',      Icon:IcoHome,      path:'/home',          color:'#6366f1', g1:'#6366f1', g2:'#4f46e5' },
  { label:'Community', Icon:IcoCommunity, path:'/community',     color:'#06b6d4', g1:'#06b6d4', g2:'#0891b2' },
  { label:'Reels',     Icon:IcoFilm,      path:'/reels',         color:'#ef4444', g1:'#ef4444', g2:'#dc2626' },
];

const NAV_CREATE = { label:'Create', Icon:IcoPlus, path:'/create', color:'#22c55e', g1:'#22c55e', g2:'#16a34a' };

const NAV_DISCOVER = [
  { label:'NearBy',    Icon:IcoStore,  path:'/nearby',        color:'#f97316', g1:'#f97316', g2:'#ea580c' },
  { label:'Shop',      Icon:IcoGlobe,  path:'/shopping',      color:'#22c55e', g1:'#22c55e', g2:'#16a34a' },
  { label:'Learn',     Icon:IcoBook,   path:'/learning',      color:'#8b5cf6', g1:'#8b5cf6', g2:'#7c3aed' },
  { label:'Entertain', Icon:IcoPlay,   path:'/entertainment', color:'#ec4899', g1:'#ec4899', g2:'#db2777' },
  { label:'Health',    Icon:IcoHealth, path:'/health',        color:'#10b981', g1:'#10b981', g2:'#059669' },
];

/* Premium hexagonal badge with SVG hex shape */
function HexBadge({ Icon, label, color, g1, g2, active, onClick, size='md' }: { Icon:any; label:string; color:string; g1:string; g2:string; active:boolean; onClick:()=>void; size?:'md'|'lg' }) {
  const w = size === 'lg' ? 46 : 42;
  const h = size === 'lg' ? 50 : 46;
  const ico = size === 'lg' ? 18 : 16;
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-[3px] group" title={label} style={{background:'none',border:'none',cursor:'pointer',padding:0}}>
      <div className="relative" style={{width:w,height:h}}>
        <svg viewBox="0 0 42 46" width={w} height={h} style={{position:'absolute',top:0,left:0}}>
          <defs>
            <linearGradient id={`hg-${label.replace(/\s/g,'')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={active?g1:`${color}30`}/>
              <stop offset="100%" stopColor={active?g2:`${color}18`}/>
            </linearGradient>
          </defs>
          <polygon points="21,1 40,12 40,34 21,45 2,34 2,12" fill="none" stroke={active?color:`${color}40`} strokeWidth={active?1.5:1} strokeLinejoin="round"/>
          <polygon points="21,3 38,13.5 38,32.5 21,43 4,32.5 4,13.5" fill={`url(#hg-${label.replace(/\s/g,'')})`} strokeLinejoin="round"/>
        </svg>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:1}}>
          <Icon size={ico} color={active?'#fff':color} />
        </div>
        {active && <div style={{position:'absolute',inset:-4,borderRadius:'50%',background:`${color}12`,filter:'blur(8px)',zIndex:0}} />}
      </div>
      <span style={{
        fontSize: 8, fontWeight: active?700:500, letterSpacing: 0.2,
        color: active ? color : 'rgba(255,255,255,0.4)',
        textAlign: 'center', lineHeight: 1.1,
        transition: 'color 0.2s'
      }}>{label}</span>
    </button>
  );
}

/* Hex icon button for right‑side actions */
function ActionBtn({ Icon, path, badge, router, active, muted, color }: { Icon:any; path:string; badge?:boolean; router:any; active?:boolean; muted:string; color?:string }) {
  const c = color || '#6366f1';
  return (
    <button onClick={()=>router.push(path)} className="relative flex flex-col items-center gap-[2px]" title={path.slice(1)} style={{background:'none',border:'none',cursor:'pointer',padding:0}}>
      <div className="relative" style={{width:38,height:42}}>
        <svg viewBox="0 0 42 46" width="38" height="42" style={{position:'absolute',top:0,left:0}}>
          <defs>
            <linearGradient id={`ha-${path.replace(/\//g,'')}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={active?c:`${c}25`}/>
              <stop offset="100%" stopColor={active?c:`${c}12`}/>
            </linearGradient>
          </defs>
          <polygon points="21,1 40,12 40,34 21,45 2,34 2,12" fill="none" stroke={active?c:`${c}35`} strokeWidth={active?1.5:1} strokeLinejoin="round"/>
          <polygon points="21,3 38,13.5 38,32.5 21,43 4,32.5 4,13.5" fill={`url(#ha-${path.replace(/\//g,'')})`} strokeLinejoin="round"/>
        </svg>
        <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:1}}>
          <Icon size={15} color={active?'#fff':muted} />
        </div>
        {active && <div style={{position:'absolute',inset:-3,borderRadius:'50%',background:`${c}12`,filter:'blur(6px)',zIndex:0}} />}
      </div>
      {badge && <span style={{position:'absolute',top:1,right:1,width:7,height:7,borderRadius:'50%',background:'#ef4444',border:'1.5px solid rgba(15,15,26,0.92)',zIndex:2}} />}
    </button>
  );
}

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const muted = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

  return (
    <nav className="sticky top-0 z-50 hidden md:block" style={{
      background: isDark ? 'rgba(12,12,22,0.88)' : 'rgba(255,255,255,0.88)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    }}>
      <div className="max-w-6xl mx-auto px-5 flex items-center justify-between" style={{height:64}}>
        {/* ── Logo ── */}
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

        {/* ── Core Feed + Create + Discovery (seamless, no divider gap) ── */}
        <div className="flex items-center gap-0.5">
          {/* Feed: Home · Community · Reels */}
          {NAV_FEED.map(item => (
            <HexBadge key={item.path} Icon={item.Icon} label={item.label} color={item.color} g1={item.g1} g2={item.g2} active={!!pathname?.startsWith(item.path)} onClick={()=>router.push(item.path)} />
          ))}

          {/* Create — slightly larger to stand out */}
          <HexBadge
            Icon={NAV_CREATE.Icon} label={NAV_CREATE.label}
            color={NAV_CREATE.color} g1={NAV_CREATE.g1} g2={NAV_CREATE.g2}
            active={!!pathname?.startsWith(NAV_CREATE.path)}
            onClick={()=>router.push(NAV_CREATE.path)}
            size="lg"
          />

          {/* Discovery: NearBy · Shop · Learn · Entertain · Health */}
          {NAV_DISCOVER.map(item => (
            <HexBadge key={item.path} Icon={item.Icon} label={item.label} color={item.color} g1={item.g1} g2={item.g2} active={!!pathname?.startsWith(item.path)} onClick={()=>router.push(item.path)} />
          ))}
        </div>

        {/* ── Right: Comms + Utility ── */}
        <div className="flex items-center gap-0.5">
          {/* Communication cluster */}
          <ActionBtn Icon={IcoChat} path="/inbox" router={router} active={!!pathname?.startsWith('/inbox')} badge muted={muted} color="#06b6d4" />
          <ActionBtn Icon={IcoFriends} path="/friends" router={router} active={!!pathname?.startsWith('/friends')} muted={muted} color="#22c55e" />
          <ActionBtn Icon={IcoBell} path="/notifications" router={router} active={!!pathname?.startsWith('/notification')} muted={muted} color="#ef4444" />
          {/* Utility cluster */}
          <ActionBtn Icon={IcoSearch} path="/search" router={router} active={!!pathname?.startsWith('/search')} muted={muted} color="#6366f1" />
          <ActionBtn Icon={IcoQR} path="/qr-verify" router={router} active={!!pathname?.startsWith('/qr')} muted={muted} color="#f59e0b" />
          <ActionBtn Icon={IcoUser} path="/profile" router={router} active={!!pathname?.startsWith('/profile')} muted={muted} color="#a78bfa" />
          <ActionBtn Icon={IcoMenu} path="/menu" router={router} active={!!pathname?.startsWith('/menu')} muted={muted} color="#8b5cf6" />
        </div>
      </div>
    </nav>
  );
}
