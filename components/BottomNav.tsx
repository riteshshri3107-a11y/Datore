"use client";
import { useRouter, usePathname } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';

const NAV = [
  { label:'Home', icon:'H', path:'/home' },
  { label:'Jobs', icon:'J', path:'/jobplace' },
  { label:'Create', icon:'+', path:'/create' },
  { label:'Messages', icon:'C', path:'/inbox' },
  { label:'Profile', icon:'P', path:'/profile' },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ background:isDark?'rgba(15,15,26,0.92)':'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)', borderTop:`1px solid ${t.cardBorder}` }}>
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto px-2">{NAV.map(item=>{const active=pathname?.startsWith(item.path);return(<button key={item.path} onClick={()=>router.push(item.path)} className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl" style={{ color:active?t.accent:t.textMuted }}><span className="text-lg">{item.icon}</span><span style={{ fontSize:9, fontWeight:active?600:400 }}>{item.label}</span></button>);})}</div>
    </nav>
  );
}
