"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { getPosts, getJobs, getListings, searchWorkers } from '@/lib/supabase';
import { search, indexBulk, suggest, getTrending, recordSearch, getIndexStats, type SearchableType, type SearchFilters } from '@/lib/search';
import { DEMO_WORKERS, DEMO_JOBS } from '@/lib/demoData';
import { IcoBack, IcoSearch, IcoMic, IcoClose } from '@/components/Icons';

const TYPE_COLORS: Record<SearchableType, {color:string;icon:string}> = {
  worker: { color:'#22c55e', icon:'👷' },
  job: { color:'#6366f1', icon:'💼' },
  listing: { color:'#ec4899', icon:'🛒' },
  community: { color:'#06b6d4', icon:'👥' },
  post: { color:'#8b5cf6', icon:'📝' },
  service: { color:'#f59e0b', icon:'⚡' },
};

export default function UniversalSearch() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const t = getTheme(isDark);
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ReturnType<typeof search> | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [voiceSrch, setVoiceSrch] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [indexReady, setIndexReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build index on mount — fetch from Supabase + fallback to demo
  useEffect(() => {
    (async () => {
      const docs: any[] = [];
      try {
        const [dbWorkers, dbJobs, dbListings, dbPosts] = await Promise.all([
          searchWorkers(), getJobs(), getListings(), getPosts(),
        ]);
        if (dbWorkers && dbWorkers.length > 0) {
          docs.push(...dbWorkers.map((w: any) => ({
            id:`w_${w.id}`, type:'worker' as SearchableType, title: w.profiles?.name || 'Worker',
            body: `${w.skills?.join(' ') || ''} ${w.bio || ''}`, tags: w.skills || [],
            category:'Workers', location: w.profiles?.city || '', rating: w.profiles?.rating,
            metadata:{ path:`/jobplace/providers/${w.id}` },
          })));
        }
        if (dbJobs && dbJobs.length > 0) {
          docs.push(...dbJobs.map((j: any) => ({
            id:`j_${j.id}`, type:'job' as SearchableType, title: j.title || 'Job',
            body: j.description || '', tags: [j.category_id].filter(Boolean),
            category: j.category_id || 'Jobs', location: j.location_text || '',
            metadata:{ amount: j.budget, path:`/jobplace/job/${j.id}` },
          })));
        }
        if (dbListings && dbListings.length > 0) {
          docs.push(...dbListings.map((l: any) => ({
            id:`l_${l.id}`, type:'listing' as SearchableType, title: l.title || 'Listing',
            body: l.description || '', tags: [l.category].filter(Boolean),
            category: l.category || 'Listings', location: l.location_text || '',
            rating: undefined, metadata:{ price: l.price, path:`/marketplace/${l.id}` },
          })));
        }
        if (dbPosts && dbPosts.length > 0) {
          docs.push(...dbPosts.slice(0, 30).map((p: any) => ({
            id:`p_${p.id}`, type:'post' as SearchableType, title: p.author_name || 'Post',
            body: p.content || '', tags: p.hashtags || [],
            category: 'Posts', location: p.location_text || '',
            metadata:{ path:`/home` },
          })));
        }
      } catch {}
      // Fallback: add demo data if DB returned nothing
      if (docs.length === 0) {
        docs.push(
          ...DEMO_WORKERS.map(w => ({
            id:`w_${w.id}`, type:'worker' as SearchableType, title:w.full_name,
            body:`${w.bio} ${w.skills.join(' ')}`, tags:w.skills,
            category:'Workers', location:w.city, rating:w.rating,
            metadata:{ hourly:w.hourly_rate, path:`/jobplace/providers/${w.id}` },
          })),
          ...DEMO_JOBS.map(j => ({
            id:`j_${j.id}`, type:'job' as SearchableType, title:j.title,
            body:j.desc, tags:[j.category], category:j.category,
            location:j.location, rating:undefined,
            metadata:{ amount:j.amount, payment:j.payment, path:`/jobplace/job/${j.id}` },
          })),
          { id:'s1', type:'service' as SearchableType, title:'Home Cleaning', body:'Professional deep cleaning, regular maintenance, move-in/out cleaning', tags:['cleaning','home'], category:'Services', location:'Toronto', rating:4.7, metadata:{path:'/jobplace?cat=cleaning'} },
          { id:'s2', type:'service' as SearchableType, title:'Math Tutoring', body:'Grade 1-12 math tutoring, exam prep, homework help', tags:['tutoring','math','education'], category:'Education', location:'Toronto', rating:4.9, metadata:{path:'/jobplace?cat=tutoring'} },
          { id:'s3', type:'service' as SearchableType, title:'Pet Care', body:'Dog walking, cat sitting, pet grooming, veterinary transport', tags:['pets','dog','cat'], category:'Pet Care', location:'Toronto', rating:4.8, metadata:{path:'/jobplace?cat=petcare'} },
          { id:'c1', type:'community' as SearchableType, title:'Toronto Tech Workers', body:'Community for tech professionals in the GTA area', tags:['tech','toronto','networking'], category:'Communities', location:'Toronto', metadata:{path:'/buddy-groups'} },
          { id:'c2', type:'community' as SearchableType, title:'GTA Parents Network', body:'Support group for parents, playdates, childcare sharing', tags:['parents','childcare','family'], category:'Communities', location:'Toronto', metadata:{path:'/buddy-groups'} },
        );
      }
      indexBulk(docs);
      setIndexReady(true);
    })();
  }, []);

  const doSearch = (q: string) => {
    if (!q.trim()) { setResults(null); return; }
    const res = search(q, filters, 20);
    setResults(res);
    recordSearch(q);
    setSuggestions([]);
  };

  const handleInputChange = (val: string) => {
    setQuery(val);
    if (val.length >= 2) setSuggestions(suggest(val));
    else setSuggestions([]);
  };

  const trending = getTrending(6);
  const stats = getIndexStats();

  return (
    <div className="space-y-4 animate-fade-in pb-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:t.card }}><IcoBack size={18} color={t.textMuted} /></button>
        <h1 className="text-xl font-bold flex-1">🔍 Search Everything</h1>
        <span className="text-[9px] px-2 py-1 rounded-lg" style={{ background:t.card, color:t.textMuted }}>{stats.documents} indexed</span>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-2xl px-4 py-3" style={{ background:t.card, border:`1px solid ${query?t.accent+'44':t.cardBorder}`, boxShadow:query?`0 0 0 3px ${t.accent}11`:'none', transition:'all 0.2s' }}>
          <IcoSearch size={18} color={query?t.accent:t.textMuted} />
          <input ref={inputRef} value={query} onChange={e => handleInputChange(e.target.value)} onKeyDown={e => e.key==='Enter' && doSearch(query)} placeholder="Search workers, jobs, services, communities..." className="flex-1 text-sm outline-none bg-transparent" style={{ color:t.text }} autoFocus />
          {query && <button onClick={() => { setQuery(''); setResults(null); setSuggestions([]); inputRef.current?.focus(); }}><IcoClose size={16} color={t.textMuted} /></button>}
          <button onClick={() => { setVoiceSrch(true); setTimeout(() => { setVoiceSrch(false); setQuery('plumber'); doSearch('plumber'); }, 2000); }} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:voiceSrch?'rgba(239,68,68,0.1)':'rgba(139,92,246,0.06)' }}>
            <IcoMic size={16} color={voiceSrch?'#ef4444':'#8b5cf6'} />
          </button>
        </div>
        {voiceSrch && <p className="text-[10px] text-center mt-1 animate-pulse" style={{ color:'#ef4444' }}>🎙️ Listening...</p>}

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20" style={{ background:t.card, border:`1px solid ${t.cardBorder}`, boxShadow:'0 8px 30px rgba(0,0,0,0.2)' }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => { setQuery(s); doSearch(s); }} className="w-full text-left px-4 py-2.5 text-xs hover:opacity-80" style={{ borderBottom:`1px solid ${t.cardBorder}` }}>
                <IcoSearch size={12} color={t.textMuted} /> <span className="ml-2">{s}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth:'none' }}>
        <button onClick={() => setShowFilters(!showFilters)} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap" style={{ background:showFilters?`${t.accent}15`:t.card, color:showFilters?t.accent:t.textMuted, border:`1px solid ${showFilters?t.accent+'33':t.cardBorder}` }}>⚙️ Filters</button>
        {Object.entries(TYPE_COLORS).map(([type, { color, icon }]) => {
          const active = filters.types?.includes(type as SearchableType);
          return (
            <button key={type} onClick={() => {
              const newTypes = active ? filters.types?.filter(t => t !== type) : [...(filters.types || []), type as SearchableType];
              setFilters({...filters, types: newTypes?.length ? newTypes : undefined });
              if (query) doSearch(query);
            }} className="px-3 py-1.5 rounded-lg text-[10px] font-semibold whitespace-nowrap capitalize" style={{ background:active?`${color}15`:t.card, color:active?color:t.textMuted, border:`1px solid ${active?color+'33':t.cardBorder}` }}>
              {icon} {type}s
            </button>
          );
        })}
      </div>

      {/* Rating Filter */}
      {showFilters && (
        <div className="p-3 rounded-xl" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
          <p className="text-[10px] font-bold mb-2">Min Rating</p>
          <div className="flex gap-2">
            {[0,3,4,4.5].map(r => (
              <button key={r} onClick={() => { setFilters({...filters, minRating:r||undefined}); if(query) doSearch(query); }} className="px-3 py-1 rounded-lg text-[10px]" style={{ background:filters.minRating===r?`${t.accent}15`:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', color:filters.minRating===r?t.accent:t.textMuted }}>{r === 0 ? 'Any' : `${r}+ ⭐`}</button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">{results.total} results <span style={{ color:t.textMuted }}>in {results.took.toFixed(1)}ms</span></p>
            {/* Facets */}
            <div className="flex gap-1">
              {Object.entries(results.facets.types).map(([type, count]) => (
                <span key={type} className="text-[8px] px-1.5 py-0.5 rounded capitalize" style={{ background:`${TYPE_COLORS[type as SearchableType]?.color || '#888'}15`, color:TYPE_COLORS[type as SearchableType]?.color || '#888' }}>{type}: {count}</span>
              ))}
            </div>
          </div>

          {results.results.map(r => {
            const tc = TYPE_COLORS[r.document.type] || { color:'#888', icon:'📄' };
            return (
              <div key={r.document.id} onClick={() => r.document.metadata?.path && router.push(r.document.metadata.path)} className="rounded-xl p-3.5 cursor-pointer" style={{ background:t.card, border:`1px solid ${t.cardBorder}`, transition:'all 0.2s' }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background:`${tc.color}12` }}>{tc.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[8px] px-1.5 py-0.5 rounded capitalize font-semibold" style={{ background:`${tc.color}15`, color:tc.color }}>{r.document.type}</span>
                      {r.document.rating && <span className="text-[9px]" style={{ color:'#f59e0b' }}>⭐ {r.document.rating}</span>}
                      <span className="text-[8px]" style={{ color:t.textMuted }}>Score: {r.score.toFixed(2)}</span>
                    </div>
                    <h4 className="text-sm font-semibold truncate">{r.document.title}</h4>
                    <p className="text-xs truncate mt-0.5" style={{ color:t.textSecondary }}>{r.document.body.slice(0, 120)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {r.document.location && <span className="text-[9px]" style={{ color:t.textMuted }}>📍 {r.document.location}</span>}
                      {r.document.tags.slice(0,3).map(tag => <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', color:t.textMuted }}>{tag}</span>)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {results.results.length === 0 && (
            <div className="text-center py-12 rounded-2xl" style={{ background:t.card }}>
              <p className="text-3xl mb-2">🔍</p>
              <p className="text-sm font-medium">No results found</p>
              <p className="text-xs" style={{ color:t.textMuted }}>Try different keywords or remove filters</p>
            </div>
          )}
        </div>
      ) : (
        /* Trending & Quick Access */
        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold mb-2">🔥 Popular Searches</p>
            <div className="flex flex-wrap gap-2">
              {['plumber','babysitter','tutoring','cleaning','dog walker','electrician','moving','cooking','pet care','painter'].map(q => (
                <button key={q} onClick={() => { setQuery(q); doSearch(q); }} className="px-3 py-1.5 rounded-lg text-xs" style={{ background:t.card, border:`1px solid ${t.cardBorder}`, color:t.textSecondary }}>{q}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold mb-2">📂 Browse by Category</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label:'Workers', icon:'👷', q:'worker', color:'#22c55e' },
                { label:'Jobs', icon:'💼', q:'job', color:'#6366f1' },
                { label:'Services', icon:'⚡', q:'service', color:'#f59e0b' },
                { label:'Communities', icon:'👥', q:'community', color:'#06b6d4' },
                { label:'Education', icon:'📚', q:'tutoring education', color:'#8b5cf6' },
                { label:'Home', icon:'🏠', q:'cleaning plumbing repair', color:'#ec4899' },
              ].map(c => (
                <button key={c.label} onClick={() => { setQuery(c.q); doSearch(c.q); }} className="flex flex-col items-center gap-1.5 p-3 rounded-xl" style={{ background:t.card, border:`1px solid ${t.cardBorder}` }}>
                  <span className="text-xl">{c.icon}</span>
                  <span className="text-[10px] font-semibold" style={{ color:c.color }}>{c.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
