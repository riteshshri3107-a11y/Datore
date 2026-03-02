"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoHome, IcoCommunity, IcoPlus, IcoMarket, IcoJobs, IcoSearch, IcoQR, IcoShield, IcoMenu, IcoChat, IcoFriends, IcoBell, IcoUser, IcoGlobe, IcoStore, IcoGrad, IcoMic, IcoGamepad, IcoFilm } from './Icons';

const NAV_MAIN = [
  { label:'Home', Icon:IcoHome, path:'/home', color:'#6366f1' },
  { label:'Profile', Icon:IcoUser, path:'/profile', color:'#8b5cf6', hex:true },
  { label:'Community', Icon:IcoCommunity, path:'/community', color:'#06b6d4' },
  { label:'Create', Icon:IcoPlus, path:'/create', color:'#22c55e' },
];

const NAV_HEX = [
  { label:'Global\nShop', Icon:IcoGlobe, path:'/shopping', color:'#22c55e' },
  { label:'Near\nBy', Icon:IcoStore, path:'/nearby', color:'#f97316' },
  { label:'Educ\nation', Icon:IcoGrad, path:'/education', color:'#8b5cf6' },
  { label:'Games', Icon:IcoGamepad, path:'/games', color:'#ec4899' },
  { label:'Reels', Icon:IcoFilm, path:'/reels', color:'#ef4444' },
];

/* Hexagonal badge — uniform frame for ALL icons */
function HexBadge({ Icon, label, color, active, onClick }: { Icon:any; label:string; color:string; active:boolean; onClick:()=>void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-0.5 relative" title={label.replace('\n',' ')}>
      {/* Outer hex frame (border) */}
      <div style={{
        width: 44, height: 48, position:'relative',
        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        background: active ? color : `${color}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s ease',
      }}>
        {/* Inner hex fill */}
        <div style={{
          width: 40, height: 44,
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          background: active ? color : `${color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={17} color={active ? '#fff' : color} />
        </div>
      </div>
      {active && <div style={{ position:'absolute', top:-2, right:-2, width:36, height:40, borderRadius:'50%', background:`${color}15`, filter:'blur(8px)', zIndex:-1 }} />}
      <span style={{ fontSize: 8, fontWeight: 600, color: active ? color : '#888', textAlign: 'center', lineHeight: 1.1, whiteSpace: 'pre-line' }}>{label}</span>
    </button>
  );
}

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  return (
    <nav className="sticky top-0 z-50 hidden md:block" style={{ background:isDark?'rgba(15,15,26,0.92)':'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${t.cardBorder}` }}>
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo */}
        <div onClick={()=>router.push('/home')} className="flex items-center gap-2 cursor-pointer">
          <img src="/logo-icon.png" alt="Datore" width={32} height={32} style={{ borderRadius:8 }} />
          <span className="font-bold text-lg" style={{ color:t.accent }}>Datore</span>
        </div>

        {/* Main Nav */}
        <div className="flex items-center gap-1">
          {NAV_MAIN.map(item => {
            const active = pathname?.startsWith(item.path);
            return (
              <button key={item.path} onClick={()=>router.push(item.path)} className="flex flex-col items-center px-3 py-1 rounded-xl text-xs" style={{ background:active?`${item.color}15`:'transparent', color:active?item.color:t.textSecondary }}>
                <item.Icon size={18} color={active?item.color:t.textSecondary} />
                <span style={{ fontSize:10, fontWeight:active?600:500 }}>{item.label}</span>
              </button>
            );
          })}

          {/* Hex Icon Group -- Global Shop, Jobs, Education */}
          <div className="flex items-end gap-1 ml-2 px-2 py-1 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
            {NAV_HEX.map(item => (
              <HexBadge key={item.path} Icon={item.Icon} label={item.label} color={item.color} active={!!pathname?.startsWith(item.path)} onClick={()=>router.push(item.path)} />
            ))}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          <button onClick={()=>router.push('/search')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ color:t.textSecondary }} title="Search"><IcoSearch size={18} /></button>
          <button onClick={()=>router.push('/qr-verify')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(6,182,212,0.12)' }} title="QR Verify"><IcoQR size={18} color="#06b6d4" /></button>
          <button onClick={()=>router.push('/menu')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ color:t.textSecondary }}><IcoMenu size={18} /></button>
          <button onClick={()=>router.push('/inbox')} className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{ color:t.textSecondary }}><IcoChat size={18} /><span style={{ position:'absolute', top:2, right:2, width:8, height:8, borderRadius:'50%', background:'#ef4444' }}></span></button>
          <button onClick={()=>router.push('/friends')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ color:t.textSecondary }}><IcoFriends size={18} /></button>
          <button onClick={()=>router.push('/notifications')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ color:t.textSecondary }}><IcoBell size={18} /></button>
        </div>
      </div>
    </nav>
  );
}
