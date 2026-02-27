"use client";
import { usePathname, useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';

const NAV_ITEMS = [
  { path: '/home', label: 'Home', icon: '🏠' },
  { path: '/community', label: 'Community', icon: '👥' },
  { path: '/create', label: 'Create', icon: '✨' },
  { path: '/marketplace', label: 'Market', icon: '🏪' },
  { path: '/jobplace', label: 'Jobs', icon: '💼' },
];

export default function TopNav() {
  const router = useRouter();
  const path = usePathname();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);

  return (
    <nav className="glass-nav sticky top-0 z-50" style={{ background: t.nav }}>
      <div className="max-w-4xl mx-auto px-3">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-1 cursor-pointer" onClick={() => router.push('/home')}>
            <span className="text-xl">🛡️</span>
            <span className="font-bold text-lg" style={{ background: `linear-gradient(135deg, ${t.accent}, #8b5cf6)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Datore</span>
          </div>
          <div className="flex items-center gap-0.5">
            {NAV_ITEMS.map(item => {
              const active = path?.startsWith(item.path);
              return (
                <button key={item.path} onClick={() => router.push(item.path)}
                  className="flex flex-col items-center px-2.5 py-1 rounded-xl transition-all"
                  style={{ background: active ? t.accentLight : 'transparent', color: active ? t.accent : t.textSecondary }}>
                  <span className="text-base">{item.icon}</span>
                  <span className="text-[10px] font-medium mt-0.5">{item.label}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => router.push('/menu')} className="text-lg p-1.5 rounded-xl transition-colors" style={{ color: t.textSecondary }}>☰</button>
            <button onClick={() => router.push('/inbox')} className="text-lg p-1.5 rounded-xl transition-colors relative" style={{ color: t.textSecondary }}>
              💬<span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full" style={{ background: t.danger }}></span>
            </button>
            <button onClick={() => router.push('/notifications')} className="text-lg p-1.5 rounded-xl transition-colors" style={{ color: t.textSecondary }}>🔔</button>
          </div>
        </div>
      </div>
    </nav>
  );
}
