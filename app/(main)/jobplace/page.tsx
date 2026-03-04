"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { getJobs } from '@/lib/supabase';
import { JOB_CATEGORIES } from '@/types';
import { formatCurrency, timeAgo } from '@/lib/utils';

export default function JobPlacePage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<'browse'|'my_jobs'|'providers'>('browse');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getJobs({ category: selectedCategory || undefined }).then(data => {
      setJobs(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [selectedCategory]);

  const filteredJobs = jobs.filter(j => {
    if (search) {
      const s = search.toLowerCase();
      const desc = (j.job_description || '').toLowerCase();
      const cat = (j.category_id || '').toLowerCase();
      const posterName = (j.profiles?.name || '').toLowerCase();
      if (!desc.includes(s) && !cat.includes(s) && !posterName.includes(s)) return false;
    }
    return true;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' };
      case 'assigned': return { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6' };
      case 'in_progress': return { bg: 'rgba(249,115,22,0.12)', color: '#f97316' };
      case 'completed': return { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' };
      default: return { bg: 'rgba(107,114,128,0.12)', color: '#6b7280' };
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">JobPlace</h1>
        <button onClick={() => router.push('/jobplace/create')} className="btn-accent text-xs px-4 py-2 rounded-xl">+ Post Job</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'browse', label: 'Browse', path: '' },
          { key: 'providers', label: 'Workers', path: '/jobplace/providers' },
          { key: 'map', label: 'Map View', path: '/jobplace/map' },
        ].map(tb => (
          <button key={tb.key} onClick={() => tb.path ? router.push(tb.path) : setTab('browse')}
            className="glass-button px-3 py-2 rounded-xl text-xs font-medium"
            style={{ background: tab === tb.key ? t.accentLight : t.surface, color: tab === tb.key ? t.accent : t.textSecondary, borderColor: tab === tb.key ? `${t.accent}44` : t.cardBorder }}>
            {tb.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..."
        className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={{ background: t.input, color: t.text, borderColor: t.inputBorder }} />

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
          className="glass-input px-3 py-2 rounded-xl text-xs" style={{ background: t.input, color: t.text, borderColor: t.inputBorder }}>
          <option value="">All Categories</option>
          {JOB_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Job Cards */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse text-lg" style={{ color: t.accent }}>Loading...</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job, i) => {
            const sc = getStatusColor(job.status);
            return (
              <div key={job.id} onClick={() => router.push(`/jobplace/job/${job.id}`)}
                className={`glass-card rounded-2xl p-4 cursor-pointer animate-slide-up stagger-${(i % 6) + 1}`}
                style={{ background: t.card, borderColor: t.cardBorder, boxShadow: t.glassShadow, animationFillMode: 'both' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: sc.bg, color: sc.color }}>{job.status}</span>
                      <span className="text-xs" style={{ color: t.textMuted }}>{timeAgo(job.created_at)}</span>
                    </div>
                    <h3 className="font-semibold text-base mb-1">{job.job_description?.slice(0, 60) || 'No description'}{(job.job_description?.length || 0) > 60 ? '...' : ''}</h3>
                    <div className="flex items-center gap-3">
                      {job.profiles?.name && <span className="text-xs" style={{ color: t.textSecondary }}>Posted by {job.profiles.name}</span>}
                      {job.scheduled_time && <span className="text-xs" style={{ color: t.textSecondary }}>Scheduled: {new Date(job.scheduled_time).toLocaleDateString()}</span>}
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    {job.agreed_price ? (
                      <p className="font-bold text-lg" style={{ color: t.accent }}>{formatCurrency(job.agreed_price)}</p>
                    ) : (
                      <p className="text-xs font-medium" style={{ color: t.textMuted }}>Price TBD</p>
                    )}
                    {job.category_id && <span className="inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ background: t.accentLight, color: t.accent }}>{job.category_id}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <p className="font-medium" style={{ color: t.textSecondary }}>No jobs found</p>
          <p className="text-sm" style={{ color: t.textMuted }}>Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
