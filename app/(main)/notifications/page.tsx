"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { DEMO_NOTIFICATIONS } from '@/lib/demoData';

const ICONS: Record<string,{icon:string; color:string}> = {
  job: { icon:'B', color:'#6366f1' },
  review: { icon:'*', color:'#f59e0b' },
  payment: { icon:'$', color:'#22c55e' },
  birthday: { icon:'!', color:'#ec4899' },
  event: { icon:'E', color:'#8b5cf6' },
  safety: { icon:'S', color:'#06b6d4' },
  anniversary: { icon:'A', color:'#f97316' },
  qr: { icon:'Q', color:'#3b82f6' },
  hire: { icon:'H', color:'#22c55e' },
  social: { icon:'F', color:'#6366f1' },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [filter, setFilter] = useState('all');
  const [readIds, setReadIds] = useState<string[]>([]);

  const markRead = (id: string) => { if (!readIds.includes(id)) setReadIds([...readIds, id]); };

  const filters = ['all','job','payment','social','safety','event'];
  const filtered = filter === 'all' ? DEMO_NOTIFICATIONS : DEMO_NOTIFICATIONS.filter(n => n.type === filter || (filter === 'social' && ['birthday','anniversary','social'].includes(n.type)));
  const unreadCount = DEMO_NOTIFICATIONS.filter(n => !n.isRead && !readIds.includes(n.id)).length;

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3"><button onClick={() => router.back()} className="text-lg">{'<-'}</button><h1 className="text-xl font-bold">Notifications</h1>
          {unreadCount > 0 && <span className="text-[10px] px-2 py-0.5 rounded-full text-white font-bold" style={{ background:'#ef4444' }}>{unreadCount}</span>}
        </div>
        <button onClick={() => setReadIds(DEMO_NOTIFICATIONS.map(n => n.id))} className="text-xs" style={{ color:t.accent }}>Mark all read</button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap capitalize" style={{ background:filter===f?t.accentLight:'transparent', color:filter===f?t.accent:t.textSecondary }}>{f}</button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(n => {
          const isRead = n.isRead || readIds.includes(n.id);
          const ic = ICONS[n.type] || { icon:'N', color:t.accent };
          return (
            <div key={n.id} onClick={() => { markRead(n.id); if (n.link) router.push(n.link); }}
              className="glass-card rounded-xl p-3.5 flex items-start gap-3 cursor-pointer transition-all"
              style={{ background: isRead ? t.card : `${ic.color}08`, borderColor: isRead ? t.cardBorder : `${ic.color}33`, borderWidth: isRead ? 1 : 1 }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0" style={{ background:`${ic.color}15`, color:ic.color }}>{ic.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold" style={{ fontWeight: isRead ? 500 : 700 }}>{n.title}</p>
                  {!isRead && <span className="w-2 h-2 rounded-full shrink-0 mt-1.5" style={{ background:ic.color }}></span>}
                </div>
                <p className="text-xs mt-0.5" style={{ color:t.textSecondary }}>{n.message}</p>
                <p className="text-[10px] mt-1" style={{ color:t.textMuted }}>{n.time}</p>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 glass-card rounded-2xl" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-sm" style={{ color:t.textSecondary }}>No {filter} notifications</p>
        </div>
      )}
    </div>
  );
}
