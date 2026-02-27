"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { getJobs } from '@/lib/supabase';
import { JOB_CATEGORIES, URGENCY_OPTIONS } from '@/types';
import { formatCurrency, timeAgo } from '@/lib/utils';

const DEMO_JOBS = [
  { id: '1', title: 'Babysitter Needed', category: 'Babysitting', urgency: 'immediate', payment_type: 'hourly', amount: 25, location_name: 'Toronto, ON', poster_name: 'Sarah M.', poster_avatar: '', status: 'open', created_at: new Date(Date.now()-3600000).toISOString(), description: 'Need a babysitter for 2 kids ages 3 and 5. Evening shift 6-10pm.' },
  { id: '2', title: 'House Deep Clean', category: 'House Cleaning', urgency: 'today', payment_type: 'fixed', amount: 150, location_name: 'Mississauga, ON', poster_name: 'John D.', poster_avatar: '', status: 'open', created_at: new Date(Date.now()-7200000).toISOString(), description: '3 bedroom house deep cleaning needed today.' },
  { id: '3', title: 'Math Tutor Grade 10', category: 'Tutoring', urgency: 'tomorrow', payment_type: 'hourly', amount: 35, location_name: 'Brampton, ON', poster_name: 'Lisa K.', poster_avatar: '', status: 'open', created_at: new Date(Date.now()-10800000).toISOString(), description: 'Looking for experienced math tutor for grade 10 student.' },
  { id: '4', title: 'Fix Leaky Faucet', category: 'Plumbing', urgency: 'no_rush', payment_type: 'fixed', amount: 80, location_name: 'Scarborough, ON', poster_name: 'Mark R.', poster_avatar: '', status: 'open', created_at: new Date(Date.now()-86400000).toISOString(), description: 'Kitchen faucet is leaking. Need a plumber to fix it.' },
  { id: '5', title: 'Dog Walker - Daily', category: 'Pet Care', urgency: 'by_date', payment_type: 'hourly', amount: 18, location_name: 'North York, ON', poster_name: 'Emily W.', poster_avatar: '', status: 'open', created_at: new Date(Date.now()-172800000).toISOString(), description: 'Need a daily dog walker for my golden retriever. 30 min walks.' },
];

export default function JobPlacePage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<'browse'|'my_jobs'|'providers'>('browse');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState<any[]>(DEMO_JOBS);

  useEffect(() => {
    getJobs({ category: selectedCategory || undefined, urgency: selectedUrgency || undefined }).then(data => {
      if (data && data.length > 0) setJobs(data);
    });
  }, [selectedCategory, selectedUrgency]);

  const filteredJobs = jobs.filter(j => {
    if (selectedCategory && j.category !== selectedCategory) return false;
    if (selectedUrgency && j.urgency !== selectedUrgency) return false;
    if (search && !j.title.toLowerCase().includes(search.toLowerCase()) && !j.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">💼 JobPlace</h1>
        <button onClick={() => router.push('/jobplace/create')} className="btn-accent text-xs px-4 py-2 rounded-xl">+ Post Job</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'browse', label: '🔍 Browse', path: '' },
          { key: 'providers', label: '👷 Workers', path: '/jobplace/providers' },
          { key: 'map', label: '🗺 Map View', path: '/jobplace/map' },
        ].map(tb => (
          <button key={tb.key} onClick={() => tb.path ? router.push(tb.path) : setTab('browse')}
            className="glass-button px-3 py-2 rounded-xl text-xs font-medium"
            style={{ background: tab === tb.key ? t.accentLight : t.surface, color: tab === tb.key ? t.accent : t.textSecondary, borderColor: tab === tb.key ? `${t.accent}44` : t.cardBorder }}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs... (e.g., Babysitter, Plumber)"
        className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={{ background: t.input, color: t.text, borderColor: t.inputBorder }} />

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
          className="glass-input px-3 py-2 rounded-xl text-xs" style={{ background: t.input, color: t.text, borderColor: t.inputBorder }}>
          <option value="">All Categories</option>
          {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={selectedUrgency} onChange={e => setSelectedUrgency(e.target.value)}
          className="glass-input px-3 py-2 rounded-xl text-xs" style={{ background: t.input, color: t.text, borderColor: t.inputBorder }}>
          <option value="">All Urgency</option>
          {URGENCY_OPTIONS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
        </select>
      </div>

      {/* Job Cards */}
      <div className="space-y-3">
        {filteredJobs.map((job, i) => (
          <div key={job.id} onClick={() => router.push(`/jobplace/job/${job.id}`)}
            className={`glass-card rounded-2xl p-4 cursor-pointer animate-slide-up stagger-${(i % 6) + 1}`}
            style={{ background: t.card, borderColor: t.cardBorder, boxShadow: t.glassShadow, animationFillMode: 'both' }}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`urgency-badge urgency-${job.urgency}`}>
                    {URGENCY_OPTIONS.find(u => u.value === job.urgency)?.label || job.urgency}
                  </span>
                  <span className="text-xs" style={{ color: t.textMuted }}>{timeAgo(job.created_at)}</span>
                </div>
                <h3 className="font-semibold text-base mb-1">{job.title}</h3>
                <p className="text-xs mb-2" style={{ color: t.textSecondary }}>{job.description?.slice(0, 80)}...</p>
                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: t.textSecondary }}>📍 {job.location_name}</span>
                  <span className="text-xs" style={{ color: t.textSecondary }}>👤 {job.poster_name}</span>
                </div>
              </div>
              <div className="text-right ml-3">
                <p className="font-bold text-lg" style={{ color: t.accent }}>{formatCurrency(job.amount)}</p>
                <p className="text-xs" style={{ color: t.textSecondary }}>/{job.payment_type === 'hourly' ? 'hr' : 'job'}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: t.accentLight, color: t.accent }}>{job.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-3xl mb-3">📋</p>
          <p className="font-medium" style={{ color: t.textSecondary }}>No jobs found</p>
          <p className="text-sm" style={{ color: t.textMuted }}>Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
