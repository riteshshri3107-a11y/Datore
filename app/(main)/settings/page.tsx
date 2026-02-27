"use client";
export const dynamic = "force-dynamic";
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { signOut } from '@/lib/supabase';

export default function SettingsPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor, toggle, setGlass, setAccent } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const ACCENTS = ['#6366f1', '#ec4899', '#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <h1 className="text-xl font-bold">⚙️ Settings</h1>

      <div className="glass-card rounded-2xl p-5 space-y-5" style={{ background: t.card, borderColor: t.cardBorder }}>
        <h2 className="font-semibold">🎨 Appearance</h2>

        <div className="flex items-center justify-between">
          <div><p className="text-sm font-medium">Dark Mode</p><p className="text-xs" style={{ color: t.textSecondary }}>Toggle dark/light theme</p></div>
          <button onClick={toggle} className="w-12 h-6 rounded-full relative transition-colors" style={{ background: isDark ? t.accent : '#ccc' }}>
            <div className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: isDark ? '26px' : '2px' }}></div>
          </button>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Glass Effect</p>
          <div className="flex gap-2">
            {(['subtle', 'medium', 'heavy'] as const).map(g => (
              <button key={g} onClick={() => setGlass(g)} className="glass-button flex-1 py-2 rounded-xl text-xs font-medium capitalize"
                style={{ background: glassLevel === g ? t.accentLight : t.surface, color: glassLevel === g ? t.accent : t.textSecondary }}>{g}</button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Accent Color</p>
          <div className="flex gap-2 flex-wrap">
            {ACCENTS.map(c => (
              <button key={c} onClick={() => setAccent(c)} className="w-8 h-8 rounded-full transition-transform"
                style={{ background: c, border: accentColor === c ? '3px solid white' : 'none', transform: accentColor === c ? 'scale(1.2)' : 'scale(1)', boxShadow: accentColor === c ? `0 0 10px ${c}55` : 'none' }}></button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-5 space-y-3" style={{ background: t.card, borderColor: t.cardBorder }}>
        {[['👤', 'Edit Profile', '/profile/edit'], ['💰', 'Wallet', '/wallet'], ['🔔', 'Notifications', '/notifications'], ['🛡️', 'Verification', '/profile']].map(([icon, label, path]) => (
          <button key={label} onClick={() => router.push(path as string)} className="w-full flex items-center gap-3 py-2">
            <span>{icon}</span><span className="text-sm font-medium">{label}</span><span className="ml-auto" style={{ color: t.textMuted }}>→</span>
          </button>
        ))}
      </div>

      <button onClick={async () => { await signOut(); router.push('/login'); }}
        className="glass-card rounded-2xl p-4 w-full text-center font-medium text-sm"
        style={{ background: 'rgba(239,68,68,0.1)', color: t.danger, borderColor: 'rgba(239,68,68,0.2)' }}>
        🚪 Log Out
      </button>
    </div>
  );
}
