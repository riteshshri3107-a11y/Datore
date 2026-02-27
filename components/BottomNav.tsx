"use client";
import { usePathname, useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';

const ITEMS = [
  { path: '/home', label: 'Home', icon: '🏠' },
  { path: '/search', label: 'Search', icon: '🔍' },
  { path: '/jobplace', label: 'Jobs', icon: '💼' },
  { path: '/marketplace', label: 'Market', icon: '🏪' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

export default function BottomNav() {
  const router = useRouter();
  const path = usePathname();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);

  return (
    <nav className="glass-nav fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ background: t.nav }}>
      <div className="flex justify-around py-1.5 px-2">
        {ITEMS.map(item => {
          const active = path?.startsWith(item.path);
          return (
            <button key={item.path} onClick={() => router.push(item.path)}
              className="flex flex-col items-center py-1 px-3 rounded-xl transition-all"
              style={{ color: active ? t.accent : t.textMuted }}>
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
              {active && <div className="w-4 h-0.5 rounded-full mt-0.5" style={{ background: t.accent }}></div>}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
