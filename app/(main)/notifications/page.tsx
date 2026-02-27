"use client";
export const dynamic = "force-dynamic";
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
const NOTIFS = [
  { id: '1', title: 'New job match!', message: 'A babysitting job was posted near you', type: 'job', is_read: false, created_at: new Date().toISOString() },
  { id: '2', title: 'Review received', message: 'Sarah gave you 5 stars!', type: 'review', is_read: false, created_at: new Date(Date.now()-3600000).toISOString() },
  { id: '3', title: 'Payment received', message: 'You earned $45 for cleaning job', type: 'payment', is_read: true, created_at: new Date(Date.now()-86400000).toISOString() },
];
export default function NotificationsPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold">🔔 Notifications</h1>
      <div className="space-y-2">
        {NOTIFS.map(n => (
          <div key={n.id} className="glass-card rounded-xl p-4 flex items-start gap-3"
            style={{ background: n.is_read ? t.card : t.accentLight, borderColor: n.is_read ? t.cardBorder : `${t.accent}33` }}>
            <span className="text-lg">{n.type === 'job' ? '💼' : n.type === 'review' ? '⭐' : '💰'}</span>
            <div><p className="text-sm font-medium">{n.title}</p><p className="text-xs" style={{ color: t.textSecondary }}>{n.message}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}
