"use client";
export const dynamic = "force-dynamic";
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';
export default function DashboardPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const stats = [
    { label: 'Balance', value: formatCurrency(125), icon: '💰', color: '#22c55e' },
    { label: 'Active Jobs', value: '2', icon: '💼', color: '#6366f1' },
    { label: 'Completed', value: '15', icon: '✅', color: '#3b82f6' },
    { label: 'Rating', value: '4.8', icon: '⭐', color: '#f59e0b' },
  ];
  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold">📊 Dashboard</h1>
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((s, i) => (
          <div key={i} className="glass-card rounded-2xl p-4" style={{ background: t.card, borderColor: t.cardBorder, boxShadow: t.glassShadow }}>
            <span className="text-xl">{s.icon}</span>
            <p className="text-xl font-bold mt-2" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: t.textSecondary }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
