"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';
import { URGENCY_OPTIONS } from '@/types';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [showChat, setShowChat] = useState(false);

  const job = {
    id: params.id, title: 'Babysitter Needed', category: 'Babysitting', urgency: 'immediate',
    payment_type: 'hourly', amount: 25, location_name: 'Toronto, ON', poster_name: 'Sarah M.',
    description: 'Need a babysitter for 2 kids ages 3 and 5. Evening shift 6-10pm. Must have experience with toddlers. References preferred.',
    status: 'open', created_at: new Date().toISOString(),
  };

  const urgency = URGENCY_OPTIONS.find(u => u.value === job.urgency);

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-lg">←</button>
        <h1 className="text-xl font-bold">Job Details</h1>
      </div>

      <div className="glass-card rounded-2xl p-5 space-y-4" style={{ background: t.card, borderColor: t.cardBorder, boxShadow: t.glassShadow }}>
        <div className="flex items-center gap-2">
          <span className={`urgency-badge urgency-${job.urgency}`}>{urgency?.label}</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: t.accentLight, color: t.accent }}>{job.category}</span>
        </div>

        <h2 className="text-xl font-bold">{job.title}</h2>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: t.accentLight, color: t.accent }}>
              {job.poster_name[0]}
            </div>
            <div>
              <p className="text-sm font-medium">{job.poster_name}</p>
              <p className="text-xs" style={{ color: t.textMuted }}>Job Poster</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass-card rounded-xl p-3" style={{ background: t.surface, borderColor: t.cardBorder }}>
            <p className="text-xs" style={{ color: t.textSecondary }}>💰 Payment</p>
            <p className="font-bold text-lg" style={{ color: t.accent }}>{formatCurrency(job.amount)}</p>
            <p className="text-xs" style={{ color: t.textMuted }}>per {job.payment_type === 'hourly' ? 'hour' : 'job'}</p>
          </div>
          <div className="glass-card rounded-xl p-3" style={{ background: t.surface, borderColor: t.cardBorder }}>
            <p className="text-xs" style={{ color: t.textSecondary }}>📍 Location</p>
            <p className="font-semibold text-sm mt-1">{job.location_name}</p>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-2">Description</h3>
          <p className="text-sm leading-relaxed" style={{ color: t.textSecondary }}>{job.description}</p>
        </div>

        <div className="flex gap-2">
          <button onClick={() => setShowChat(true)} className="btn-accent flex-1 py-3 rounded-xl text-sm">💬 Chat with Poster</button>
          <button onClick={() => router.push('/jobplace/providers')} className="glass-button flex-1 py-3 rounded-xl text-sm font-medium"
            style={{ background: t.surface, color: t.text, borderColor: t.cardBorder }}>👷 Apply</button>
        </div>
      </div>
    </div>
  );
}
