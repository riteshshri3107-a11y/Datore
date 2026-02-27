"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';

export default function WorkerDetailPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);

  const worker = { id: '1', full_name: 'Maria Santos', skills: ['Babysitting', 'Tutoring'], hourly_rate: 22, rating: 4.9, review_count: 47, completed_jobs: 52, availability: 'available', city: 'Toronto', trust_score: 92, is_police_verified: true, background_check: 'clear', bio: 'Experienced babysitter and tutor with 5+ years of experience. First aid certified.' };
  const trustColor = (s: number) => s >= 80 ? '#22c55e' : s >= 60 ? '#eab308' : '#ef4444';

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <div className="flex items-center gap-3"><button onClick={() => router.back()}>←</button><h1 className="text-xl font-bold">Worker Profile</h1></div>

      <div className="glass-card rounded-2xl p-5 text-center" style={{ background: t.card, borderColor: t.cardBorder, boxShadow: t.glassShadow }}>
        <div className="relative inline-block">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold mx-auto"
            style={{ background: `linear-gradient(135deg, ${t.accent}44, #8b5cf644)`, color: t.accent }}>MS</div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 bg-green-500" style={{ borderColor: isDark ? '#1a1a2e' : '#fff' }}></div>
        </div>
        <h2 className="text-xl font-bold mt-3">{worker.full_name}</h2>
        <div className="flex items-center justify-center gap-2 mt-1">
          {worker.is_police_verified && <span className="text-xs">🛡️ Police Verified</span>}
          {worker.background_check === 'clear' && <span className="text-xs">✅ Background Clear</span>}
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div><p className="font-bold">{worker.rating}</p><p className="text-xs" style={{ color: '#f59e0b' }}>★ Rating</p></div>
          <div><p className="font-bold">{worker.completed_jobs}</p><p className="text-xs" style={{ color: t.textMuted }}>Jobs</p></div>
          <div><p className="font-bold" style={{ color: trustColor(worker.trust_score) }}>{worker.trust_score}</p><p className="text-xs" style={{ color: t.textMuted }}>Trust</p></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="glass-card rounded-xl p-3" style={{ background: t.card, borderColor: t.cardBorder }}>
          <p className="text-xs" style={{ color: t.textSecondary }}>💰 Rate</p>
          <p className="font-bold" style={{ color: t.accent }}>{formatCurrency(worker.hourly_rate)}/hr</p>
        </div>
        <div className="glass-card rounded-xl p-3" style={{ background: t.card, borderColor: t.cardBorder }}>
          <p className="text-xs" style={{ color: t.textSecondary }}>📍 Location</p>
          <p className="font-semibold text-sm">{worker.city}</p>
        </div>
      </div>

      <div className="glass-card rounded-2xl p-4" style={{ background: t.card, borderColor: t.cardBorder }}>
        <h3 className="font-semibold text-sm mb-2">About</h3>
        <p className="text-sm" style={{ color: t.textSecondary }}>{worker.bio}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {worker.skills.map(s => <span key={s} className="text-xs px-2.5 py-1 rounded-full" style={{ background: t.accentLight, color: t.accent }}>{s}</span>)}
        </div>
      </div>

      <div className="flex gap-2">
        <button className="btn-accent flex-1 py-3 rounded-xl text-sm">💬 Chat</button>
        <button className="btn-accent flex-1 py-3 rounded-xl text-sm" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 15px rgba(34,197,94,0.3)' }}>✅ Hire Now</button>
      </div>
    </div>
  );
}
