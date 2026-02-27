"use client";
export const dynamic = "force-dynamic";
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
const ITEMS = [
  { icon: '💼', label: 'Post a Job', desc: 'Find workers for your task', path: '/jobplace/create', color: '#6366f1' },
  { icon: '📦', label: 'Sell an Item', desc: 'List on marketplace', path: '/marketplace/create', color: '#f59e0b' },
  { icon: '👷', label: 'Offer Service', desc: 'List your skills', path: '/profile/edit', color: '#22c55e' },
  { icon: '👥', label: 'Create Group', desc: 'Start a community', path: '/community', color: '#ec4899' },
  { icon: '📝', label: 'Post Update', desc: 'Share with community', path: '/community', color: '#3b82f6' },
  { icon: '🎉', label: 'Create Event', desc: 'Organize an event', path: '/community', color: '#8b5cf6' },
];
export default function CreatePage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold">✨ Create</h1>
      <div className="grid grid-cols-2 gap-2.5">
        {ITEMS.map((item, i) => (
          <button key={i} onClick={() => router.push(item.path)}
            className={`glass-card rounded-2xl p-4 text-left animate-slide-up stagger-${i + 1}`}
            style={{ background: t.card, borderColor: t.cardBorder, boxShadow: t.glassShadow, animationFillMode: 'both' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-2" style={{ background: item.color + '22' }}>{item.icon}</div>
            <h3 className="font-semibold text-sm">{item.label}</h3>
            <p className="text-xs mt-0.5" style={{ color: t.textSecondary }}>{item.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
