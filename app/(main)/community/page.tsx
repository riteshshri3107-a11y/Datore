"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';

const GROUPS = [
  { id: '1', name: 'Toronto Handyworkers', members: 2340, icon: '🔧', desc: 'Local handyman services' },
  { id: '2', name: 'GTA Babysitters', members: 1890, icon: '👶', desc: 'Trusted babysitting community' },
  { id: '3', name: 'Home Cleaning Pros', members: 3100, icon: '🧹', desc: 'Professional cleaners network' },
  { id: '4', name: 'Tech Support Hub', members: 920, icon: '💻', desc: 'IT and tech assistance' },
  { id: '5', name: 'Pet Lovers GTA', members: 4200, icon: '🐕', desc: 'Pet care and walking' },
  { id: '6', name: 'Tutoring Network', members: 1560, icon: '📚', desc: 'Academic tutoring' },
];

export default function CommunityPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState('discover');

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold">👥 Community</h1>
      <div className="flex gap-2">
        {['discover', 'joined', 'manage'].map(tb => (
          <button key={tb} onClick={() => setTab(tb)} className="glass-button px-4 py-2 rounded-xl text-xs font-medium capitalize"
            style={{ background: tab === tb ? t.accentLight : t.surface, color: tab === tb ? t.accent : t.textSecondary }}>{tb}</button>
        ))}
      </div>
      <input placeholder="Search communities..." className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={{ background: t.input, color: t.text, borderColor: t.inputBorder }} />
      <div className="space-y-2.5">
        {GROUPS.map((g, i) => (
          <div key={g.id} className={`glass-card rounded-2xl p-4 flex items-center gap-3 animate-slide-up stagger-${i + 1}`}
            style={{ background: t.card, borderColor: t.cardBorder, boxShadow: t.glassShadow, animationFillMode: 'both' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: t.accentLight }}>{g.icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{g.name}</h3>
              <p className="text-xs" style={{ color: t.textSecondary }}>{g.desc}</p>
              <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>{g.members.toLocaleString()} members</p>
            </div>
            <button className="glass-button px-3 py-1.5 rounded-xl text-xs font-medium" style={{ background: t.accentLight, color: t.accent }}>Join</button>
          </div>
        ))}
      </div>
    </div>
  );
}
