"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoHome, IcoCommunity, IcoPlus, IcoMarket, IcoJobs, IcoSearch, IcoQR, IcoShield, IcoMenu, IcoChat, IcoFriends, IcoBell, IcoUser } from './Icons';

const NAV = [
  { label:'Home', Icon:IcoHome, path:'/home' },
  { label:'Community', Icon:IcoCommunity, path:'/community' },
  { label:'Create', Icon:IcoPlus, path:'/create' },
  { label:'Market', Icon:IcoMarket, path:'/marketplace' },
  { label:'Jobs', Icon:IcoJobs, path:'/jobplace' },
];

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  return (
    <nav className="sticky top-0 z-50 hidden md:block" style={{ background:isDark?'rgba(15,15,26,0.85)':'rgba(255,255,255,0.85)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${t.cardBorder}` }}>
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <div onClick={()=>router.push('/home')} className="flex items-center gap-2 cursor-pointer"><img src="/logo-icon.png" alt="Datore" width={32} height={32} style={{ borderRadius:8 }} /><span className="font-bold text-lg" style={{ color:t.accent }}>Datore</span></div>
        <div className="flex items-center gap-1">{NAV.map(item=>{const active=pathname?.startsWith(item.path);return(<button key={item.path} onClick={()=>router.push(item.path)} className="flex flex-col items-center px-3 py-1.5 rounded-xl text-xs" style={{ background:active?t.accentLight:'transparent', color:active?t.accent:t.textSecondary }} aria-label={item.label}><item.Icon size={18} color={active?t.accent:t.textSecondary} /><span className="font-medium" style={{ fontSize:10 }}>{item.label}</span></button>);})}</div>
        <div className="flex items-center gap-1">
          <button onClick={()=>router.push('/search')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ color:t.textSecondary }} title="Search" aria-label="Search"><IcoSearch size={18} /></button>
          <button onClick={()=>router.push('/qr-verify')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(6,182,212,0.12)', color:'#06b6d4' }} title="QR Verify" aria-label="QR Verify"><IcoQR size={18} color="#06b6d4" /></button>
          <button onClick={()=>router.push('/safety')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:'rgba(34,197,94,0.12)', color:'#22c55e' }} title="Safety" aria-label="Safety"><IcoShield size={18} color="#22c55e" /></button>
          <button onClick={()=>router.push('/menu')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ color:t.textSecondary }} aria-label="Menu"><IcoMenu size={18} /></button>
          <button onClick={()=>router.push('/inbox')} className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{ color:t.textSecondary }} aria-label="Chat"><IcoChat size={18} /><span style={{ position:'absolute', top:2, right:2, width:8, height:8, borderRadius:'50%', background:'#ef4444' }}></span></button>
          <button onClick={()=>router.push('/friends')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ color:t.textSecondary }} title="Friends" aria-label="Friends"><IcoFriends size={18} /></button>
          <button onClick={()=>router.push('/notifications')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ color:t.textSecondary }} aria-label="Notifications"><IcoBell size={18} /></button>
          <button onClick={()=>router.push('/profile')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent }} aria-label="Profile"><IcoUser size={18} color={t.accent} /></button>
        </div>
      </div>
    </nav>
  );
}
