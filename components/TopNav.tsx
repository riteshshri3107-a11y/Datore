"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoHome, IcoCommunity, IcoPlus, IcoSearch, IcoQR, IcoMenu, IcoChat, IcoFriends, IcoBell, IcoUser, IcoGlobe, IcoStore, IcoBook, IcoPlay, IcoFilm, IcoHealth } from './Icons';

/* CR-11: Hexagonal color parity — consistent color mapping across all nav icons */
const NAV_MAIN = [
  { label:'Home', Icon:IcoHome, path:'/home', color:'#5B2D8E', g1:'#5B2D8E', g2:'#4A2377' },
  { label:'Profile', Icon:IcoUser, path:'/profile', color:'#607D8B', g1:'#607D8B', g2:'#546E7A' },
  { label:'Community', Icon:IcoCommunity, path:'/community', color:'#2196F3', g1:'#2196F3', g2:'#1976D2' },
  { label:'Create', Icon:IcoPlus, path:'/create', color:'#22c55e', g1:'#22c55e', g2:'#16a34a' },
];

const NAV_HEX = [
  { label:'Global Shop', Icon:IcoGlobe, path:'/shopping', color:'#22c55e', g1:'#22c55e', g2:'#16a34a' },
  { label:'NearBy', Icon:IcoStore, path:'/nearby', color:'#4CAF50', g1:'#4CAF50', g2:'#388E3C' },
  { label:'Learning', Icon:IcoBook, path:'/learning', color:'#FFC107', g1:'#FFC107', g2:'#FFA000' },
  { label:'Entertain', Icon:IcoPlay, path:'/entertainment', color:'#E91E63', g1:'#E91E63', g2:'#C2185B' },
  { label:'Health', Icon:IcoHealth, path:'/health', color:'#00C853', g1:'#00C853', g2:'#00A844' },
  { label:'Reels', Icon:IcoFilm, path:'/reels', color:'#FF6B35', g1:'#FF6B35', g2:'#E55A2B' },
];

/* Premium hexagonal badge with SVG hex shape */
function HexBadge({ Icon, label, color, g1, g2, active, onClick }: { Icon:any; label:string; color:string; g1:string; g2:string; active:boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-[3px] group" title={label} style={{background:'none',border:'none',cursor:'pointer',padding:0}}>
      <div className="relative" style={{width:42,height:46}}>
        {/* SVG hex shape — smooth anti-aliased edges */}
        <svg viewBox="0 0 42 46" width="42" height="46" style={{position:'absolute',top:0,left:0}}>
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
          <Icon size={16} color={active?'#fff':color} />
        </div>
        {/* Active glow */}
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

/* Smooth hex icon button for right actions — NOW matches nav hex style */
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
        {/* Logo — Original Datore brand (inline SVG, never changes) */}
        <div onClick={()=>router.push('/home')} className="flex items-center gap-2.5 cursor-pointer group">
          <div style={{
            width:36, height:36, borderRadius:10,
            background:'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 2px 12px rgba(99,102,241,0.35)',
            transition:'transform 0.2s',
          }}>
            {/* Play-button triangle — original Datore mark */}
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

        {/* Main Nav — Same hex badge style */}
        <div className="flex items-center gap-1">
          {NAV_MAIN.map(item => (
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

        {/* Right Actions — Hex style matching main nav */}
        {/* CR-11: Right actions with consistent hex color fills */}
        <div className="flex items-center gap-0.5">
          <ActionBtn Icon={IcoSearch} path="/search" router={router} active={!!pathname?.startsWith('/search')} muted={muted} color="#5B2D8E" />
          <ActionBtn Icon={IcoQR} path="/qr-verify" router={router} active={!!pathname?.startsWith('/qr')} muted={muted} color="#FFC107" />
          <ActionBtn Icon={IcoMenu} path="/menu" router={router} active={!!pathname?.startsWith('/menu')} muted={muted} color="#607D8B" />
          <ActionBtn Icon={IcoChat} path="/inbox" router={router} active={!!pathname?.startsWith('/inbox')} badge muted={muted} color="#00BCD4" />
          <ActionBtn Icon={IcoFriends} path="/friends" router={router} active={!!pathname?.startsWith('/friends')} muted={muted} color="#2196F3" />
          <ActionBtn Icon={IcoBell} path="/notifications" router={router} active={!!pathname?.startsWith('/notification')} muted={muted} color="#FF5252" />
        </div>
      </div>
    </nav>
  );
}
