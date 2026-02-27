"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';

const NAV = [
  { label:'Home', icon:'🏠', path:'/home' },
  { label:'Community', icon:'👥', path:'/community' },
  { label:'Create', icon:'✨', path:'/create' },
  { label:'Market', icon:'🏪', path:'/marketplace' },
  { label:'Jobs', icon:'💼', path:'/jobplace' },
];

export default function TopNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  return (
    <nav className="sticky top-0 z-50 hidden md:block" style={{ background:isDark?'rgba(15,15,26,0.85)':'rgba(255,255,255,0.85)', backdropFilter:'blur(20px)', borderBottom:`1px solid ${t.cardBorder}` }}>
      <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
        <div onClick={()=>router.push('/home')} className="flex items-center gap-2 cursor-pointer"><span className="text-xl">🛡️</span><span className="font-bold text-lg" style={{ color:t.accent }}>Datore</span></div>
        <div className="flex items-center gap-1">{NAV.map(item=>{const active=pathname?.startsWith(item.path);return(<button key={item.path} onClick={()=>router.push(item.path)} className="flex flex-col items-center px-3 py-1.5 rounded-xl text-xs" style={{ background:active?t.accentLight:'transparent', color:active?t.accent:t.textSecondary }}><span className="text-base">{item.icon}</span><span className="font-medium" style={{ fontSize:10 }}>{item.label}</span></button>);})}</div>
        <div className="flex items-center gap-2">
          <button onClick={()=>router.push('/menu')} className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ color:t.textSecondary }}>☰</button>
          <button onClick={()=>router.push('/inbox')} className="w-9 h-9 rounded-xl flex items-center justify-center relative" style={{ color:t.textSecondary }}>💬<span style={{ position:'absolute', top:2, right:2, width:8, height:8, borderRadius:'50%', background:'#ef4444' }}></span></button>
          <button onClick={()=>router.push('/buddylist')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ color:t.textSecondary }}>⭐</button>
          <button onClick={()=>router.push('/notifications')} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ color:t.textSecondary }}>🔔</button>
          <button onClick={()=>router.push('/profile')} className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent }}>👤</button>
        </div>
      </div>
    </nav>
  );
}
