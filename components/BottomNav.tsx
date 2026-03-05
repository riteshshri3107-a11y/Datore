"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoHome, IcoCommunity, IcoFilm, IcoBell, IcoGrid } from './Icons';

/* ─── Mobile bottom nav: Home, Community, Reels, Notifications, Menu ─── */
const NAV = [
  { label:'Home',          Icon:IcoHome,       path:'/home' },
  { label:'Community',     Icon:IcoCommunity,  path:'/community' },
  { label:'Reels',         Icon:IcoFilm,       path:'/reels' },
  { label:'Notifications', Icon:IcoBell,       path:'/notifications', badge:true },
  { label:'Menu',          Icon:IcoGrid,       path:'/menu' },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const muted = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{
      background: isDark ? 'rgba(12,12,22,0.92)' : 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(24px) saturate(180%)',
      WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
    }}>
      <div className="flex items-center justify-around max-w-lg mx-auto" style={{height:60,padding:'0 8px'}}>
        {NAV.map(item => {
          const active = pathname?.startsWith(item.path);
          return (
            <button key={item.path} onClick={()=>router.push(item.path)} className="relative" style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:2,
              padding:'4px 12px', background:'none', border:'none', cursor:'pointer',
              transition:'all 0.2s'
            }}>
              <div className="relative">
                <item.Icon size={22} color={active ? t.accent : muted} />
                {item.badge && <span style={{position:'absolute',top:-2,right:-4,width:7,height:7,borderRadius:'50%',background:'#ef4444',border:`2px solid ${isDark?'rgba(12,12,22,0.92)':'rgba(255,255,255,0.92)'}`}} />}
              </div>
              <span style={{fontSize:9,fontWeight:active?700:400,color:active?t.accent:muted,letterSpacing:0.2}}>{item.label}</span>
              {active && <div style={{position:'absolute',top:-1,left:'50%',transform:'translateX(-50%)',width:16,height:2.5,borderRadius:2,background:t.accent}} />}
            </button>
          );
        })}
      </div>
      {/* Home indicator line for iPhone */}
      <div style={{height:4}} />
    </nav>
  );
}
