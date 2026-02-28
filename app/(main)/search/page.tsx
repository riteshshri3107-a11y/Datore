"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { DEMO_WORKERS, DEMO_JOBS, MARKETPLACE_LISTINGS, SEARCH_SUGGESTIONS, HASHTAGS } from '@/lib/demoData';
import { JOB_CATEGORIES } from '@/types';

// Relevance scoring
function scoreWorker(w: any, q: string): number {
  let s = 0;
  if (w.full_name.toLowerCase().includes(q)) s += 10;
  if (w.skills.some((sk: string) => sk.toLowerCase().includes(q))) s += 8;
  if (w.city.toLowerCase().includes(q)) s += 5;
  if (w.availability === 'available') s += 3;
  s += w.rating;
  s += w.trust_score / 20;
  return s;
}
function scoreJob(j: any, q: string): number {
  let s = 0;
  if (j.title.toLowerCase().includes(q)) s += 10;
  if (j.category.toLowerCase().includes(q)) s += 8;
  if (j.desc.toLowerCase().includes(q)) s += 4;
  const urgMap: Record<string,number> = { immediate:5, today:4, tomorrow:3, by_date:2, no_rush:1 };
  s += urgMap[j.urgency] || 0;
  return s;
}

const SMART_SUGGEST: Record<string, string[]> = {
  babysit: ['Also try: "childcare", "nanny", "after-school care"'],
  plumb: ['Also try: "pipe repair", "drain cleaning", "water heater"'],
  clean: ['Also try: "deep clean", "move-out clean", "laundry"'],
  tutor: ['Also try: "math help", "homework", "test prep"'],
  pet: ['Also try: "dog walking", "cat sitting", "grooming"'],
  move: ['Also try: "packing", "furniture assembly", "junk removal"'],
  cook: ['Also try: "meal prep", "personal chef", "catering"'],
};

export default function SearchPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [search, setSearch] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceText, setVoiceText] = useState('');
  const [tab, setTab] = useState<'all'|'workers'|'jobs'|'marketplace'>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'relevance'|'rating'|'price'>('relevance');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try { setRecentSearches(JSON.parse(localStorage.getItem('datore-recent-search') || '[]')); } catch {}
    }
    inputRef.current?.focus();
  }, []);

  const saveSearch = (q: string) => {
    const u = [q, ...recentSearches.filter(s => s !== q)].slice(0, 10);
    setRecentSearches(u);
    if (typeof window !== 'undefined') try { localStorage.setItem('datore-recent-search', JSON.stringify(u)); } catch {}
  };

  const startVoice = () => {
    setListening(true);
    setVoiceText('Listening...');
    // Try real Web Speech API first
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.lang = 'en-US'; rec.interimResults = true;
      rec.onresult = (e: any) => {
        const t = Array.from(e.results).map((r: any) => r[0].transcript).join('');
        setVoiceText(t);
        setSearch(t);
      };
      rec.onend = () => { setListening(false); if (search) saveSearch(search); };
      rec.onerror = () => {
        // Fallback to simulation
        setTimeout(() => {
          const phrases = ['babysitter near me','plumber today','house cleaner this week','dog walker weekend','tutor for math'];
          const r = phrases[Math.floor(Math.random()*phrases.length)];
          setSearch(r); setVoiceText(r); saveSearch(r); setListening(false);
        }, 2000);
      };
      rec.start();
    } else {
      setTimeout(() => {
        const phrases = ['babysitter near me','plumber today','house cleaner this week','dog walker weekend','tutor for math'];
        const r = phrases[Math.floor(Math.random()*phrases.length)];
        setSearch(r); setVoiceText(r); saveSearch(r); setListening(false);
      }, 2000);
    }
  };

  const q = search.toLowerCase().trim();
  const isHashtag = q.startsWith('#');
  const hashtagMatches = isHashtag ? HASHTAGS.filter(h => h.includes(q)).slice(0,8) : [];
  const suggestions = !isHashtag && q.length >= 1 ? SEARCH_SUGGESTIONS.filter(s => s.toLowerCase().includes(q)).slice(0,5) : [];

  // Smart AI suggestion
  const smartHint = Object.entries(SMART_SUGGEST).find(([k]) => q.includes(k));

  // Scored + sorted results
  const matchedWorkers = q.length >= 2 ? DEMO_WORKERS.filter(w => scoreWorker(w, q) > 5).sort((a,b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price') return a.hourly_rate - b.hourly_rate;
    return scoreWorker(b, q) - scoreWorker(a, q);
  }) : [];
  const matchedJobs = q.length >= 2 ? DEMO_JOBS.filter(j => scoreJob(j, q) > 3).sort((a,b) => scoreJob(b, q) - scoreJob(a, q)) : [];
  const matchedListings = q.length >= 2 ? MARKETPLACE_LISTINGS.filter(l => l.title.toLowerCase().includes(q) || l.category.toLowerCase().includes(q)) : [];

  const total = matchedWorkers.length + matchedJobs.length + matchedListings.length;
  const urgColors: Record<string,string> = { immediate:'#ef4444', today:'#f97316', tomorrow:'#eab308', by_date:'#3b82f6', no_rush:'#22c55e' };

  return (
    <div className="space-y-4 animate-fade-in ">
      <div className="flex items-center gap-3">
        <img src="/logo-icon.png" alt="" width={28} height={28} style={{ borderRadius:7 }} />
        <h1 className="text-xl font-bold flex-1">Search</h1>
      </div>

      {/* Search bar with voice */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key==='Enter' && search) saveSearch(search); }}
            placeholder="Search workers, jobs, items, #hashtags..."
            className="w-full p-3 pl-4 pr-10 rounded-xl text-sm outline-none"
            style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color:t.textMuted }}>X</button>}
        </div>
        <button onClick={startVoice} className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{
          background: listening ? 'rgba(239,68,68,0.15)' : `linear-gradient(135deg,${t.accent},#8b5cf6)`,
          color: listening ? '#ef4444' : 'white', border: listening ? '2px solid #ef4444' : 'none',
        }}>
          <span className={`text-xs font-bold ${listening ? 'animate-pulse' : ''}`}>{listening ? 'REC' : 'MIC'}</span>
        </button>
      </div>

      {/* Voice listening UI */}
      {listening && (
        <div className="glass-card rounded-xl p-4 text-center" style={{ background:'rgba(239,68,68,0.08)', borderColor:'#ef444433' }}>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="w-1 rounded-full" style={{ height: 6 + Math.random()*24, background:'#ef4444', animation:`pulse ${0.3+i*0.1}s ease-in-out infinite alternate` }}></div>
            ))}
          </div>
          <p className="text-sm font-medium" style={{ color:'#ef4444' }}>{voiceText || 'Listening...'}</p>
          <p className="text-[10px] mt-1" style={{ color:t.textMuted }}>Say "Find babysitter near me" or "Post a job"</p>
          <button onClick={() => setListening(false)} className="mt-2 text-[10px] px-3 py-1 rounded-full" style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444' }}>Cancel</button>
        </div>
      )}

      {/* Auto-suggestions + hashtag matches */}
      {(suggestions.length > 0 || hashtagMatches.length > 0) && !listening && (
        <div className="glass-card rounded-xl overflow-hidden" style={{ background:t.card, borderColor:t.cardBorder }}>
          {hashtagMatches.length > 0 && (
            <div className="p-3 flex flex-wrap gap-1.5" style={{ borderBottom: suggestions.length ? `1px solid ${t.cardBorder}` : 'none' }}>
              {hashtagMatches.map(h => (
                <button key={h} onClick={() => { setSearch(h); saveSearch(h); }} className="px-2.5 py-1 rounded-lg text-xs font-medium" style={{ background:t.accentLight, color:t.accent }}>{h}</button>
              ))}
            </div>
          )}
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => { setSearch(s); saveSearch(s); }} className="w-full p-3 text-left text-sm flex items-center gap-3 hover:opacity-80" style={{ borderBottom:i<suggestions.length-1?`1px solid ${t.cardBorder}`:'none', color:t.text }}>
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', color:t.textMuted }}>Q</span>
              <span className="flex-1">{s}</span>
              <span className="text-[10px]" style={{ color:t.textMuted }}>search</span>
            </button>
          ))}
        </div>
      )}

      {/* Smart AI suggestion */}
      {smartHint && q.length >= 3 && (
        <div className="p-3 rounded-xl flex items-center gap-2" style={{ background:`${t.accent}11`, border:`1px solid ${t.accent}22` }}>
          <span className="text-xs font-bold" style={{ color:t.accent }}>AI</span>
          <p className="text-xs" style={{ color:t.accent }}>{smartHint[1][0]}</p>
        </div>
      )}

      {/* Results */}
      {q.length >= 2 && total > 0 && !listening && (
        <div className="space-y-3">
          {/* Tabs + sort */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1 overflow-x-auto">
              {(['all','workers','jobs','marketplace'] as const).map(tb => {
                const c = tb==='workers'?matchedWorkers.length:tb==='jobs'?matchedJobs.length:tb==='marketplace'?matchedListings.length:total;
                return <button key={tb} onClick={() => setTab(tb)} className="px-3 py-1.5 rounded-xl text-[11px] font-medium whitespace-nowrap capitalize" style={{ background:tab===tb?t.accentLight:'transparent', color:tab===tb?t.accent:t.textSecondary }}>{tb} ({c})</button>;
              })}
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="text-[10px] px-2 py-1 rounded-lg outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', color:t.textSecondary, border:`1px solid ${t.cardBorder}` }}>
              <option value="relevance">Relevance</option>
              <option value="rating">Rating</option>
              <option value="price">Price Low</option>
            </select>
          </div>

          {/* Workers */}
          {(tab==='all'||tab==='workers') && matchedWorkers.length > 0 && (
            <div>
              {tab==='all' && <h3 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color:t.textMuted }}>Workers ({matchedWorkers.length})</h3>}
              <div className="space-y-2">{matchedWorkers.map(w => (
                <div key={w.id} className="glass-card rounded-xl p-3 flex items-center gap-3" style={{ background:t.card, borderColor:t.cardBorder }}>
                  <div onClick={() => router.push(`/worker/${w.id}`)} className="w-11 h-11 rounded-xl flex items-center justify-center text-xs font-bold cursor-pointer" style={{ background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent }}>{w.full_name.split(' ').map((n:string)=>n[0]).join('')}</div>
                  <div className="flex-1 cursor-pointer" onClick={() => router.push(`/worker/${w.id}`)}>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{w.full_name}</p>
                      {w.is_police_verified && <span className="text-[9px] px-1 py-0.5 rounded" style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e' }}>Verified</span>}
                    </div>
                    <p className="text-[10px]" style={{ color:t.textMuted }}>{w.skills.join(', ')} - {w.city}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="w-2 h-2 rounded-full" style={{ background:w.availability==='available'?'#22c55e':'#f59e0b' }}></span>
                      <span className="text-[10px]" style={{ color:t.textMuted }}>{w.availability} | Trust: {w.trust_score}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold" style={{ color:'#f59e0b' }}>{w.rating}</span>
                    <p className="text-xs font-bold" style={{ color:t.accent }}>${w.hourly_rate}/hr</p>
                    <button onClick={() => router.push(`/chat/${w.id}`)} className="mt-1 text-[10px] px-2 py-0.5 rounded-lg font-medium" style={{ background:t.accentLight, color:t.accent }}>Chat</button>
                  </div>
                </div>
              ))}</div>
            </div>
          )}

          {/* Jobs - with urgency badges */}
          {(tab==='all'||tab==='jobs') && matchedJobs.length > 0 && (
            <div>
              {tab==='all' && <h3 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color:t.textMuted }}>Jobs ({matchedJobs.length})</h3>}
              <div className="space-y-2">{matchedJobs.map(j => (
                <div key={j.id} onClick={() => router.push(`/jobplace/job/${j.id}`)} className="glass-card rounded-xl p-3 flex items-center gap-3 cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold">{j.title}</p>
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium capitalize" style={{ background:`${urgColors[j.urgency]||t.accent}15`, color:urgColors[j.urgency]||t.accent }}>{j.urgency}</span>
                    </div>
                    <p className="text-[10px]" style={{ color:t.textMuted }}>{j.category} - {j.location}</p>
                  </div>
                  <span className="font-bold text-sm shrink-0" style={{ color:t.accent }}>${j.amount}{j.payment==='hourly'?'/hr':''}</span>
                </div>
              ))}</div>
            </div>
          )}

          {/* Marketplace */}
          {(tab==='all'||tab==='marketplace') && matchedListings.length > 0 && (
            <div>
              {tab==='all' && <h3 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color:t.textMuted }}>Marketplace ({matchedListings.length})</h3>}
              <div className="space-y-2">{matchedListings.map(l => (
                <div key={l.id} onClick={() => router.push(`/marketplace/listing/${l.id}`)} className="glass-card rounded-xl p-3 flex items-center gap-3 cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }}>
                  <div className="flex-1"><p className="text-sm font-semibold">{l.title}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{l.category} - {l.condition}</p></div>
                  <span className="font-bold text-sm" style={{ color:t.accent }}>${l.price}</span>
                </div>
              ))}</div>
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {q.length >= 2 && total === 0 && !listening && (
        <div className="text-center py-10 glass-card rounded-2xl" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-lg font-bold mb-1">No results</p>
          <p className="text-sm" style={{ color:t.textSecondary }}>Nothing found for "{search}"</p>
          <p className="text-xs mt-2" style={{ color:t.textMuted }}>Try a different term, use #hashtags, or voice search</p>
          <button onClick={() => router.push('/jobplace/create')} className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Post a Job Instead</button>
        </div>
      )}

      {/* Empty state */}
      {q.length < 2 && !listening && (
        <div className="space-y-4">
          {recentSearches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider" style={{ color:t.textMuted }}>Recent Searches</h3>
                <button onClick={() => { setRecentSearches([]); localStorage.removeItem('datore-recent-search'); }} className="text-[10px]" style={{ color:t.accent }}>Clear all</button>
              </div>
              <div className="flex flex-wrap gap-1.5">{recentSearches.map((s, i) => (
                <button key={i} onClick={() => setSearch(s)} className="px-3 py-1.5 rounded-xl text-xs flex items-center gap-1" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', color:t.textSecondary, border:`1px solid ${t.cardBorder}` }}>
                  {s}
                  <span onClick={e => { e.stopPropagation(); const u=recentSearches.filter((_,j)=>j!==i); setRecentSearches(u); localStorage.setItem('datore-recent-search',JSON.stringify(u)); }} className="ml-1 opacity-50">x</span>
                </button>
              ))}</div>
            </div>
          )}

          {/* Trending */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color:t.textMuted }}>Trending</h3>
            <div className="flex flex-wrap gap-1.5">
              {HASHTAGS.slice(0,12).map((h,i) => (
                <button key={h} onClick={() => setSearch(h)} className="px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1" style={{ background:t.accentLight, color:t.accent }}>
                  {h}
                  {i < 3 && <span className="text-[9px] px-1 py-0 rounded" style={{ background:'rgba(239,68,68,0.12)', color:'#ef4444' }}>HOT</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Quick category access */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color:t.textMuted }}>Browse by Category</h3>
            <div className="grid grid-cols-3 gap-2">{JOB_CATEGORIES.slice(0,12).map(c => (
              <button key={c} onClick={() => { setSearch(c); saveSearch(c); }} className="glass-card rounded-xl p-2.5 text-left text-xs font-medium" style={{ background:t.card, borderColor:t.cardBorder }}>{c}</button>
            ))}</div>
          </div>

          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => router.push('/jobplace/map')} className="p-3 rounded-xl text-xs font-medium text-center" style={{ background:`${t.accent}11`, color:t.accent, border:`1px solid ${t.accent}22` }}>
              Open Map View
            </button>
            <button onClick={() => router.push('/compare')} className="p-3 rounded-xl text-xs font-medium text-center" style={{ background:'rgba(139,92,246,0.08)', color:'#8b5cf6', border:'1px solid rgba(139,92,246,0.2)' }}>
              Compare Workers
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
