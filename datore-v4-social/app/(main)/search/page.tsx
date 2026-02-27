"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCategories, searchWorkers } from "@/lib/supabase";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";
import { formatCurrency } from "@/lib/utils";

export default function SearchPage() {
  const router = useRouter(); const { isDark } = useThemeStore(); const t = getTheme(isDark);
  const [query, setQuery] = useState(""); const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]); const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ verified: false, licensed: false, minRating: 0, sortBy: "price_asc" });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { getCategories().then(setCategories); }, []);
  useEffect(() => { (async () => { setLoading(true); setWorkers(await searchWorkers({ query, category, ...filters })); setLoading(false); })(); }, [query, category, filters]);

  const chip = (a: boolean) => ({ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${a ? t.accentBorder : t.border}`, background: a ? t.accentDim : t.bgCard, color: a ? t.accent : t.textSecondary, cursor: "pointer", whiteSpace: "nowrap" as const, fontFamily: "inherit" });

  return (
    <div style={{ padding: "16px 16px 40px" }} className="anim-fade">
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: t.bgSecondary, border: `1px solid ${t.border}`, borderRadius: 10 }}><span>🔍</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search skills, workers..." style={{ flex: 1, background: "transparent", border: "none", color: t.text, fontSize: 14, outline: "none", fontFamily: "inherit" }} /></div>
        <button onClick={() => setShowFilters(!showFilters)} style={{ width: 44, height: 44, borderRadius: 10, background: showFilters ? t.accent : t.bgSecondary, border: `1px solid ${t.border}`, cursor: "pointer", color: showFilters ? "#0A0A0F" : t.textSecondary, fontSize: 16 }}>⚙️</button>
      </div>
      {showFilters && <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: 14, marginBottom: 14 }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}><button onClick={() => setFilters(f => ({...f, verified: !f.verified}))} style={chip(filters.verified)}>✅ Verified</button><button onClick={() => setFilters(f => ({...f, licensed: !f.licensed}))} style={chip(filters.licensed)}>📜 Licensed</button></div>
        <label style={{ fontSize: 11, color: t.textMuted }}>Min Rating: {filters.minRating}★</label>
        <input type="range" min={0} max={5} step={0.5} value={filters.minRating} onChange={e => setFilters(f => ({...f, minRating: +e.target.value}))} style={{ width: "100%", accentColor: t.accent }} />
      </div>}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 14 }}><button onClick={() => setCategory("")} style={chip(!category)}>All</button>{categories.map((c: any) => <button key={c.id} onClick={() => setCategory(c.id)} style={chip(category===c.id)}>{c.icon} {c.name}</button>)}</div>
      <p style={{ fontSize: 13, color: t.textMuted, marginBottom: 10 }}>{loading ? "Searching..." : `${workers.length} results`}</p>
      {!loading && workers.length === 0 ? <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: 40, textAlign: "center" }}><p style={{ fontSize: 32 }}>🔍</p><p style={{ fontWeight: 700 }}>No results</p></div> : workers.map((w: any) => { const p = w.profiles || {}; return (
        <div key={w.id} onClick={() => router.push(`/worker/${w.id}`)} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: 14, cursor: "pointer", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: t.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: t.accent, fontWeight: 700, flexShrink: 0 }}>{p.name?.[0] || "?"}</div>
            <div style={{ flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontWeight: 700, fontSize: 14 }}>{p.name || "Worker"}</span>{p.verified && <span style={{ fontSize: 11, color: t.accent }}>🛡️</span>}{w.licensed && <span style={{ fontSize: 10, padding: "2px 6px", background: "rgba(59,130,246,0.1)", color: "#60A5FA", borderRadius: 4 }}>Licensed</span>}</div><div style={{ fontSize: 12, color: t.textMuted }}>⭐ {p.rating || "New"} • {w.response_time || "< 1hr"}</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontWeight: 700, color: t.accent, fontSize: 14 }}>{formatCurrency(w.hourly_rate || 0)}</div><div style={{ fontSize: 11, color: t.textMuted }}>/hr</div></div>
          </div>
        </div>
      ); })}
    </div>
  );
}
