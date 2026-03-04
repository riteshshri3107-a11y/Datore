"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';
import { getListings } from '@/lib/supabase';
import { MARKETPLACE_CATEGORIES } from '@/types';

const CON: Record<string,string> = { 'Like New':'#22c55e', 'Excellent':'#3b82f6', 'Good':'#f59e0b', 'Fair':'#6b7280' };
const CATS = ['All', ...MARKETPLACE_CATEGORIES];

function getRecent(): string[] { try { return JSON.parse(localStorage.getItem('datore-mkt-recent')||'[]'); } catch { return []; } }
function addRecent(q: string) { try { const r = getRecent().filter(x=>x!==q); r.unshift(q); localStorage.setItem('datore-mkt-recent', JSON.stringify(r.slice(0,8))); } catch {} }
function clearRecent() { try { localStorage.removeItem('datore-mkt-recent'); } catch {} }

export default function MarketplacePage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const sugRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setRecent(getRecent()); }, []);

  useEffect(() => {
    setLoading(true);
    getListings({ category: cat !== 'All' ? cat : undefined }).then(data => {
      setListings(data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [cat]);

  const filtered = listings.filter(l => !search || l.title?.toLowerCase().includes(search.toLowerCase()));

  // Generate suggestions from listing titles and categories
  const allTitles = listings.map(l => l.title).filter(Boolean);
  const suggestions = search.length >= 1
    ? [...new Set([
        ...allTitles.filter(t => t.toLowerCase().includes(search.toLowerCase())),
        ...MARKETPLACE_CATEGORIES.filter(c => c.toLowerCase().includes(search.toLowerCase())),
      ])].slice(0, 8)
    : [];

  const applySuggestion = (s: string) => {
    setSearch(s); setShowSuggestions(false); addRecent(s); setRecent(getRecent());
  };

  const handleSearch = (v: string) => {
    setSearch(v); setShowSuggestions(true);
  };

  const handleBlur = () => { setTimeout(() => setShowSuggestions(false), 200); };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return <span>{text.slice(0,idx)}<b style={{ color:t.accent }}>{text.slice(idx,idx+query.length)}</b>{text.slice(idx+query.length)}</span>;
  };

  const getImageDisplay = (l: any) => {
    if (l.images && l.images.length > 0) {
      return <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />;
    }
    return <span className="text-3xl">📦</span>;
  };

  const timeAgoShort = (dateStr: string) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Marketplace</h1>
        <div className="flex gap-2">
          <button onClick={() => router.push('/marketplace/my-listings')} className="px-3 py-2 rounded-xl text-xs font-medium" style={{ background:t.surface, color:t.textSecondary, border:`1px solid ${t.cardBorder}` }}>My Listings</button>
          <button onClick={() => router.push('/marketplace/create')} className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>+ Sell Item</button>
        </div>
      </div>

      {/* Search with Auto-Suggest */}
      <div style={{ position:'relative' }}>
        <input ref={inputRef} value={search} onChange={e => handleSearch(e.target.value)} onFocus={() => setShowSuggestions(true)} onBlur={handleBlur} placeholder="🔍 Search items..." className="w-full p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${showSuggestions&&(suggestions.length>0||recent.length>0)?t.accent+'55':t.cardBorder}`, color:t.text }} />

        {showSuggestions && (suggestions.length > 0 || (search.length === 0 && recent.length > 0)) && (
          <div ref={sugRef} style={{ position:'absolute', top:'100%', left:0, right:0, marginTop:4, borderRadius:12, background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}`, boxShadow:'0 8px 32px rgba(0,0,0,0.2)', zIndex:50, maxHeight:320, overflowY:'auto' }}>
            {search.length === 0 && recent.length > 0 && (
              <>
                <div style={{ padding:'8px 12px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ fontSize:11, fontWeight:600, color:t.textMuted }}>Recent Searches</span>
                  <button onClick={() => { clearRecent(); setRecent([]); }} style={{ fontSize:10, color:'#ef4444', background:'none', border:'none', cursor:'pointer' }}>Clear All</button>
                </div>
                {recent.map((r,i) => (
                  <button key={i} onClick={() => applySuggestion(r)} style={{ width:'100%', padding:'8px 12px', textAlign:'left', background:'none', border:'none', borderTop:`1px solid ${t.cardBorder}`, color:t.text, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ color:t.textMuted }}>🕒</span> {r}
                  </button>
                ))}
              </>
            )}
            {suggestions.map((s,i) => {
              const matchedListing = listings.find(l => l.title === s);
              const sugCat = matchedListing?.category;
              return (
                <button key={i} onClick={() => applySuggestion(s)} style={{ width:'100%', padding:'10px 12px', textAlign:'left', background:'none', border:'none', borderTop:i>0||recent.length>0?`1px solid ${t.cardBorder}`:'none', color:t.text, fontSize:13, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                  <span>{highlightMatch(s, search)}</span>
                  {sugCat && <span style={{ fontSize:10, padding:'2px 8px', borderRadius:6, background:t.accentLight, color:t.accent, fontWeight:600 }}>{sugCat}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {CATS.map(c => (
          <button key={c} onClick={() => setCat(c)} className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap" style={{ background:cat===c?t.accentLight:'transparent', color:cat===c?t.accent:t.textSecondary, border:cat===c?`1px solid ${t.accent}33`:'1px solid transparent' }}>{c}</button>
        ))}
      </div>
      <p className="text-xs" style={{ color:t.textMuted }}>{filtered.length} items found</p>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse text-lg" style={{ color: t.accent }}>Loading...</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {filtered.map(l => (
            <div key={l.id} onClick={() => router.push(`/marketplace/listing/${l.id}`)} className="glass-card rounded-xl overflow-hidden cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }}>
              <div className="h-28 flex items-center justify-center text-3xl" style={{ background:`linear-gradient(135deg,${t.accent}15,#8b5cf615)` }}>{getImageDisplay(l)}</div>
              <div className="p-3">
                <p className="font-semibold text-sm truncate">{l.title}</p>
                <p className="font-bold mt-1" style={{ color:t.accent }}>{formatCurrency(l.price || 0)}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:(CON[l.condition]||'#888')+'22', color:CON[l.condition]||'#888' }}>{l.condition || 'N/A'}</span>
                  <span className="text-[10px]" style={{ color:t.textMuted }}>{timeAgoShort(l.created_at)}</span>
                </div>
                {l.profiles?.name && <p className="text-[10px] mt-1" style={{ color: t.textMuted }}>{l.profiles.name}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
