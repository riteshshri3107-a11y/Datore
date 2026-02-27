"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCategories, searchWorkers } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ verified: false, licensed: false, minRating: 0, sortBy: "price_asc" });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { getCategories().then(setCategories); }, []);
  useEffect(() => {
    (async () => { setLoading(true); const r = await searchWorkers({ query, category, ...filters }); setWorkers(r); setLoading(false); })();
  }, [query, category, filters]);

  const chip = (a: boolean) => ({ padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: "1px solid", borderColor: a ? "var(--accent-border)" : "var(--border)", background: a ? "var(--accent-dim)" : "var(--bg-secondary)", color: a ? "var(--accent)" : "var(--text-secondary)", cursor: "pointer", whiteSpace: "nowrap" as const, fontFamily: "var(--font-body)" });

  return (
    <div style={{ padding: "16px 16px 40px" }} className="animate-fade-up">
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
          <span>🔍</span>
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search skills, workers..." style={{ flex: 1, background: "transparent", border: "none", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)} style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)", background: showFilters ? "var(--accent)" : "var(--bg-secondary)", border: "1px solid var(--border)", cursor: "pointer", color: showFilters ? "#0A0A0F" : "var(--text-secondary)", fontSize: 18 }}>⚙️</button>
      </div>
      {showFilters && <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <button onClick={() => setFilters(f => ({...f, verified: !f.verified}))} style={chip(filters.verified)}>✅ Verified</button>
          <button onClick={() => setFilters(f => ({...f, licensed: !f.licensed}))} style={chip(filters.licensed)}>📜 Licensed</button>
        </div>
        <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Min Rating: {filters.minRating}★</label>
        <input type="range" min={0} max={5} step={0.5} value={filters.minRating} onChange={e => setFilters(f => ({...f, minRating: +e.target.value}))} style={{ width: "100%", accentColor: "var(--accent)" }} />
      </div>}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        <button onClick={() => setCategory("")} style={chip(!category)}>All</button>
        {categories.map((c: any) => <button key={c.id} onClick={() => setCategory(c.id)} style={chip(category===c.id)}>{c.icon} {c.name}</button>)}
      </div>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>{loading ? "Searching..." : `${workers.length} results`}</p>
      {!loading && workers.length === 0 ? <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 40, textAlign: "center" }}><p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p><p style={{ fontWeight: 700 }}>No results</p></div> : workers.map((w: any) => { const p = w.profiles || {}; return (
        <div key={w.id} onClick={() => router.push(`/worker/${w.id}`)} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, cursor: "pointer", marginBottom: 10 }}>
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>{p.name?.[0] || "?"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontWeight: 700, fontSize: 15 }}>{p.name || "Worker"}</span>{p.verified && <span style={{ fontSize: 12, color: "var(--accent)" }}>🛡️</span>}{w.licensed && <span style={{ fontSize: 10, padding: "2px 6px", background: "rgba(59,130,246,0.15)", color: "#60A5FA", borderRadius: 4 }}>Licensed</span>}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>⭐ {p.rating || "New"} • {w.response_time || "< 1hr"}</div>
            </div>
            <div style={{ textAlign: "right" }}><div style={{ fontWeight: 700, color: "var(--accent)" }}>{formatCurrency(w.hourly_rate || 0)}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>/hr</div></div>
          </div>
        </div>
      ); })}
    </div>
  );
}
