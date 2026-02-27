"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { DEMO_WORKERS, DEMO_JOBS, MARKETPLACE_LISTINGS, SEARCH_SUGGESTIONS, HASHTAGS } from '@/lib/demoData';
import { JOB_CATEGORIES } from '@/types';

export default function SearchPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [search, setSearch] = useState('');
  const [listening, setListening] = useState(false);
  const [tab, setTab] = useState<'all'|'workers'|'jobs'|'marketplace'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try { setRecentSearches(JSON.parse(localStorage.getItem('datore-recent-search') || '[]')); } catch {}
    }
  }, []);

  const saveSearch = (q: string) => {
    const updated = [q, ...recentSearches.filter(s => s !== q)].slice(0, 8);
    setRecentSearches(updated);
    if (typeof window !== 'undefined') { try { localStorage.setItem('datore-recent-search', JSON.stringify(updated)); } catch {} }
  };

  const startVoiceSearch = () => {
    setListening(true);
    // Simulate voice recognition
    setTimeout(() => {
      const phrases = ['babysitter near me', 'plumber today', 'dog walker this weekend', 'cleaner for house'];
      const result = phrases[Math.floor(Math.random() * phrases.length)];
      setSearch(result);
      saveSearch(result);
      setListening(false);
    }, 2000);
  };

  const q = search.toLowerCase();
  const suggestions = search.length > 0 ? SEARCH_SUGGESTIONS.filter(s => s.toLowerCase().includes(q)).slice(0, 5) : [];
  const hashtagMatches = search.startsWith('#') ? HASHTAGS.filter(h => h.includes(q)).slice(0, 6) : [];

  // Search results
  const matchedWorkers = search.length >= 2 ? DEMO_WORKERS.filter(w => w.full_name.toLowerCase().includes(q) || w.skills.some(s => s.toLowerCase().includes(q)) || w.city.toLowerCase().includes(q)) : [];
  const matchedJobs = search.length >= 2 ? DEMO_JOBS.filter(j => j.title.toLowerCase().includes(q) || j.category.toLowerCase().includes(q) || j.desc.toLowerCase().includes(q)) : [];
  const matchedListings = search.length >= 2 ? MARKETPLACE_LISTINGS.filter(l => l.title.toLowerCase().includes(q) || l.category.toLowerCase().includes(q)) : [];

  const hasResults = matchedWorkers.length + matchedJobs.length + matchedListings.length > 0;

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <h1 className="text-xl font-bold">Search</h1>

      {/* Search bar with voice */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && search) saveSearch(search); }}
            placeholder="Search workers, jobs, items, #hashtags..."
            className="w-full p-3 pl-4 pr-10 rounded-xl text-sm outline-none"
            style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} autoFocus />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs" style={{ color:t.textMuted }}>X</button>
          )}
        </div>
        <button onClick={startVoiceSearch} className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
          background: listening ? 'rgba(239,68,68,0.15)' : `linear-gradient(135deg,${t.accent},#8b5cf6)`,
          color: listening ? '#ef4444' : 'white',
          border: listening ? '2px solid #ef4444' : 'none',
        }}>
          <span className={`text-sm font-bold ${listening ? 'animate-pulse' : ''}`}>{listening ? 'REC' : 'MIC'}</span>
        </button>
      </div>

      {listening && (
        <div className="glass-card rounded-xl p-4 text-center" style={{ background:'rgba(239,68,68,0.08)', borderColor:'#ef444433' }}>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="w-1 rounded-full animate-pulse" style={{ height: 8 + Math.random()*20, background:'#ef4444', animationDelay:`${i*0.1}s` }}></div>
            ))}
          </div>
          <p className="text-sm font-medium" style={{ color:'#ef4444' }}>Listening... Speak now</p>
          <p className="text-[10px] mt-1" style={{ color:t.textMuted }}>Say "Find babysitter near me" or "Post a job"</p>
        </div>
      )}

      {/* Auto-suggestions dropdown */}
      {(suggestions.length > 0 || hashtagMatches.length > 0) && (
        <div className="glass-card rounded-xl overflow-hidden" style={{ background:t.card, borderColor:t.cardBorder }}>
          {hashtagMatches.length > 0 && (
            <div className="p-3 flex flex-wrap gap-1.5" style={{ borderBottom:`1px solid ${t.cardBorder}` }}>
              {hashtagMatches.map(h => (
                <button key={h} onClick={() => { setSearch(h); saveSearch(h); }} className="px-2.5 py-1 rounded-lg text-xs" style={{ background:t.accentLight, color:t.accent }}>{h}</button>
              ))}
            </div>
          )}
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => { setSearch(s); saveSearch(s); }} className="w-full p-3 text-left text-sm flex items-center gap-2" style={{ borderBottom:i<suggestions.length-1?`1px solid ${t.cardBorder}`:'none', color:t.text }}>
              <span style={{ color:t.textMuted }}>Q</span> {s}
            </button>
          ))}
        </div>
      )}

      {/* Search results */}
      {search.length >= 2 && hasResults && (
        <div className="space-y-4">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {(['all','workers','jobs','marketplace'] as const).map(tb => {
              const count = tb==='workers'?matchedWorkers.length:tb==='jobs'?matchedJobs.length:tb==='marketplace'?matchedListings.length:matchedWorkers.length+matchedJobs.length+matchedListings.length;
              return (
                <button key={tb} onClick={() => setTab(tb)} className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap capitalize" style={{ background:tab===tb?t.accentLight:'transparent', color:tab===tb?t.accent:t.textSecondary }}>{tb} ({count})</button>
              );
            })}
          </div>

          {(tab === 'all' || tab === 'workers') && matchedWorkers.length > 0 && (
            <div>
              {tab === 'all' && <h3 className="text-xs font-semibold mb-2" style={{ color:t.textMuted }}>WORKERS</h3>}
              <div className="space-y-2">{matchedWorkers.map(w => (
                <div key={w.id} onClick={() => router.push(`/worker/${w.id}`)} className="glass-card rounded-xl p-3 flex items-center gap-3 cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{ background:`${t.accent}22`, color:t.accent }}>{w.full_name.split(' ').map(n=>n[0]).join('')}</div>
                  <div className="flex-1"><p className="text-sm font-medium">{w.full_name}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{w.skills.join(', ')} - {w.city}</p></div>
                  <div className="text-right"><span className="text-xs font-bold" style={{ color:'#f59e0b' }}>{w.rating}</span><p className="text-[10px]" style={{ color:t.accent }}>${w.hourly_rate}/hr</p></div>
                </div>
              ))}</div>
            </div>
          )}

          {(tab === 'all' || tab === 'jobs') && matchedJobs.length > 0 && (
            <div>
              {tab === 'all' && <h3 className="text-xs font-semibold mb-2" style={{ color:t.textMuted }}>JOBS</h3>}
              <div className="space-y-2">{matchedJobs.map(j => (
                <div key={j.id} onClick={() => router.push(`/jobplace/job/${j.id}`)} className="glass-card rounded-xl p-3 flex items-center gap-3 cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }}>
                  <div className="flex-1"><p className="text-sm font-medium">{j.title}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{j.category} - {j.location}</p></div>
                  <span className="font-bold text-sm" style={{ color:t.accent }}>${j.amount}</span>
                </div>
              ))}</div>
            </div>
          )}

          {(tab === 'all' || tab === 'marketplace') && matchedListings.length > 0 && (
            <div>
              {tab === 'all' && <h3 className="text-xs font-semibold mb-2" style={{ color:t.textMuted }}>MARKETPLACE</h3>}
              <div className="space-y-2">{matchedListings.map(l => (
                <div key={l.id} onClick={() => router.push(`/marketplace/listing/${l.id}`)} className="glass-card rounded-xl p-3 flex items-center gap-3 cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }}>
                  <div className="flex-1"><p className="text-sm font-medium">{l.title}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{l.category} - {l.condition}</p></div>
                  <span className="font-bold text-sm" style={{ color:t.accent }}>${l.price}</span>
                </div>
              ))}</div>
            </div>
          )}
        </div>
      )}

      {/* Empty search state */}
      {search.length < 2 && !listening && (
        <div className="space-y-4">
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2"><h3 className="text-xs font-semibold" style={{ color:t.textMuted }}>RECENT SEARCHES</h3>
                <button onClick={() => { setRecentSearches([]); localStorage.removeItem('datore-recent-search'); }} className="text-[10px]" style={{ color:t.accent }}>Clear</button>
              </div>
              <div className="flex flex-wrap gap-1.5">{recentSearches.map((s, i) => (
                <button key={i} onClick={() => setSearch(s)} className="px-3 py-1.5 rounded-xl text-xs" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', color:t.textSecondary, border:`1px solid ${t.cardBorder}` }}>{s}</button>
              ))}</div>
            </div>
          )}

          {/* Trending hashtags */}
          <div>
            <h3 className="text-xs font-semibold mb-2" style={{ color:t.textMuted }}>TRENDING HASHTAGS</h3>
            <div className="flex flex-wrap gap-1.5">{HASHTAGS.slice(0, 10).map(h => (
              <button key={h} onClick={() => setSearch(h)} className="px-3 py-1.5 rounded-xl text-xs font-medium" style={{ background:t.accentLight, color:t.accent }}>{h}</button>
            ))}</div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold mb-2" style={{ color:t.textMuted }}>BROWSE CATEGORIES</h3>
            <div className="grid grid-cols-2 gap-2">{JOB_CATEGORIES.slice(0, 12).map(c => (
              <button key={c} onClick={() => { setSearch(c); saveSearch(c); }} className="glass-card rounded-xl p-3 text-left text-sm font-medium" style={{ background:t.card, borderColor:t.cardBorder }}>{c}</button>
            ))}</div>
          </div>
        </div>
      )}

      {search.length >= 2 && !hasResults && !listening && (
        <div className="text-center py-12 glass-card rounded-2xl" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-xl mb-2">No Results</p>
          <p className="text-sm" style={{ color:t.textSecondary }}>No results for "{search}"</p>
          <p className="text-xs mt-2" style={{ color:t.textMuted }}>Try a different search term or use voice search</p>
        </div>
      )}
    </div>
  );
}
