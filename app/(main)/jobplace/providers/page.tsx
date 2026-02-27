"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { searchWorkers } from '@/lib/supabase';
import { JOB_CATEGORIES } from '@/types';
import { formatCurrency } from '@/lib/utils';

const DEMO_WORKERS = [
  { id: '1', full_name: 'Maria Santos', skills: ['Babysitting', 'Tutoring'], hourly_rate: 22, rating: 4.9, review_count: 47, completed_jobs: 52, availability: 'available', city: 'Toronto', background_check: 'clear', trust_score: 92, is_police_verified: true, categories: ['Babysitting'], avatar_url: '' },
  { id: '2', full_name: 'James O\'Brien', skills: ['Plumbing', 'Electrical'], hourly_rate: 45, rating: 4.7, review_count: 31, completed_jobs: 38, availability: 'available', city: 'Mississauga', background_check: 'clear', trust_score: 88, is_police_verified: true, categories: ['Plumbing'], avatar_url: '' },
  { id: '3', full_name: 'Priya Sharma', skills: ['House Cleaning', 'Cooking'], hourly_rate: 28, rating: 4.8, review_count: 63, completed_jobs: 71, availability: 'busy', city: 'Brampton', background_check: 'clear', trust_score: 95, is_police_verified: true, categories: ['House Cleaning'], avatar_url: '' },
  { id: '4', full_name: 'David Chen', skills: ['Tutoring', 'Tech Support'], hourly_rate: 40, rating: 4.6, review_count: 22, completed_jobs: 28, availability: 'available', city: 'Toronto', background_check: 'clear', trust_score: 85, is_police_verified: false, categories: ['Tutoring'], avatar_url: '' },
  { id: '5', full_name: 'Aisha Hassan', skills: ['Pet Care', 'Gardening'], hourly_rate: 20, rating: 4.9, review_count: 55, completed_jobs: 60, availability: 'available', city: 'Scarborough', background_check: 'clear', trust_score: 94, is_police_verified: true, categories: ['Pet Care'], avatar_url: '' },
  { id: '6', full_name: 'Mike Johnson', skills: ['Moving', 'General Labor'], hourly_rate: 30, rating: 4.5, review_count: 18, completed_jobs: 22, availability: 'scheduled', city: 'North York', background_check: 'pending', trust_score: 78, is_police_verified: false, categories: ['Moving'], avatar_url: '' },
];

export default function ProvidersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [search, setSearch] = useState(searchParams?.get('skill') || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [workers, setWorkers] = useState<any[]>(DEMO_WORKERS);

  useEffect(() => {
    searchWorkers({ category: selectedCategory, skill: search }).then(data => {
      if (data && data.length > 0) setWorkers(data);
    });
  }, [selectedCategory]);

  const filtered = workers
    .filter(w => {
      if (selectedCategory && !w.categories?.includes(selectedCategory)) return false;
      if (search && !w.skills?.some((s: string) => s.toLowerCase().includes(search.toLowerCase())) && !w.full_name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price_low') return a.hourly_rate - b.hourly_rate;
      if (sortBy === 'price_high') return b.hourly_rate - a.hourly_rate;
      if (sortBy === 'jobs') return b.completed_jobs - a.completed_jobs;
      return 0;
    });

  const availabilityColor = (a: string) => a === 'available' ? '#22c55e' : a === 'busy' ? '#ef4444' : '#f59e0b';
  const trustColor = (s: number) => s >= 80 ? '#22c55e' : s >= 60 ? '#eab308' : '#ef4444';

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-lg">←</button>
          <h1 className="text-xl font-bold">👷 Service Providers</h1>
        </div>
        <button onClick={() => router.push('/jobplace/map')} className="glass-button px-3 py-2 rounded-xl text-xs font-medium" style={{ background: t.surface, color: t.accent, borderColor: t.cardBorder }}>🗺️ Map</button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search skills... (e.g., Babysitter, Plumber)"
        className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={{ background: t.input, color: t.text, borderColor: t.inputBorder }} />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
          className="glass-input px-3 py-2 rounded-xl text-xs" style={{ background: t.input, color: t.text, borderColor: t.inputBorder }}>
          <option value="">All Skills</option>
          {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="glass-input px-3 py-2 rounded-xl text-xs" style={{ background: t.input, color: t.text, borderColor: t.inputBorder }}>
          <option value="rating">⭐ Rating</option>
          <option value="price_low">💰 Price: Low</option>
          <option value="price_high">💰 Price: High</option>
          <option value="jobs">📋 Most Jobs</option>
        </select>
      </div>

      <p className="text-xs" style={{ color: t.textMuted }}>{filtered.length} workers found</p>

      <div className="space-y-3">
        {filtered.map((w, i) => (
          <div key={w.id} onClick={() => router.push(`/worker/${w.id}`)}
            className={`glass-card rounded-2xl p-4 cursor-pointer animate-slide-up stagger-${(i % 6) + 1}`}
            style={{ background: t.card, borderColor: t.cardBorder, boxShadow: t.glassShadow, animationFillMode: 'both' }}>
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
                  style={{ background: `linear-gradient(135deg, ${t.accent}33, #8b5cf633)`, color: t.accent }}>
                  {w.full_name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                  style={{ background: availabilityColor(w.availability), borderColor: isDark ? '#1a1a2e' : '#f5f7ff' }}></div>
              </div>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{w.full_name}</h3>
                  {w.is_police_verified && <span className="text-xs" title="Police Verified">🛡️</span>}
                  {w.background_check === 'clear' && <span className="text-xs" title="Background Clear">✅</span>}
                </div>

                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs" style={{ color: '#f59e0b' }}>★ {w.rating}</span>
                  <span className="text-xs" style={{ color: t.textMuted }}>({w.review_count} reviews)</span>
                  <span className="text-xs" style={{ color: t.textMuted }}>• {w.completed_jobs} jobs</span>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {w.skills?.slice(0, 3).map((s: string) => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: t.accentLight, color: t.accent }}>{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3">
                    <span className="text-xs" style={{ color: t.textSecondary }}>📍 {w.city}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: availabilityColor(w.availability) + '22', color: availabilityColor(w.availability) }}>
                      {w.availability === 'available' ? '🟢 Available' : w.availability === 'busy' ? '🔴 Busy' : '🟡 Scheduled'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold" style={{ color: t.accent }}>{formatCurrency(w.hourly_rate)}/hr</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px]" style={{ color: t.textMuted }}>Trust:</span>
                      <span className="text-[10px] font-bold" style={{ color: trustColor(w.trust_score) }}>{w.trust_score}/100</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
