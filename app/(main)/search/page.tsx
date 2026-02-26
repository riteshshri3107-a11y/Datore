"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search as SearchIcon, Star, Shield, SlidersHorizontal, X } from "lucide-react";
import { supabase, getCategories, searchWorkers } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

export default function SearchPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("cat") || "");
  const [categories, setCategories] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ verified: false, licensed: false, minRating: 0, minPrice: 0, maxPrice: 5000, sortBy: "price_asc" });

  useEffect(() => { getCategories().then(setCategories); }, []);

  useEffect(() => {
    async function search() {
      setLoading(true);
      const results = await searchWorkers({ query, category, ...filters });
      setWorkers(results);
      setLoading(false);
    }
    search();
  }, [query, category, filters]);

  const chipStyle = (active: boolean) => ({ padding: "7px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: "1px solid", borderColor: active ? "var(--accent-border)" : "var(--border)", background: active ? "var(--accent-dim)" : "var(--bg-secondary)", color: active ? "var(--accent)" : "var(--text-secondary)", cursor: "pointer", whiteSpace: "nowrap" as const, fontFamily: "var(--font-body)" });

  return (
    <div style={{ padding: "16px 16px 40px" }} className="animate-fade-up">
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)" }}>
          <SearchIcon size={18} color="var(--text-muted)" />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search skills, workers..." style={{ flex: 1, background: "transparent", border: "none", color: "var(--text-primary)", fontSize: 14, outline: "none", fontFamily: "var(--font-body)" }} />
          {query && <button onClick={() => setQuery("")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={16} /></button>}
        </div>
        <button onClick={() => setShowFilters(!showFilters)} style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)", background: showFilters ? "var(--accent)" : "var(--bg-secondary)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: showFilters ? "#0A0A0F" : "var(--text-secondary)" }}><SlidersHorizontal size={18} /></button>
      </div>

      {showFilters && (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            <button onClick={() => setFilters(f => ({...f, verified: !f.verified}))} style={chipStyle(filters.verified)}>✅ Verified Only</button>
            <button onClick={() => setFilters(f => ({...f, licensed: !f.licensed}))} style={chipStyle(filters.licensed)}>📜 Licensed Only</button>
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 6, display: "block" }}>Min Rating: {filters.minRating}★</label>
            <input type="range" min={0} max={5} step={0.5} value={filters.minRating} onChange={e => setFilters(f => ({...f, minRating: +e.target.value}))} style={{ width: "100%" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Min ₹</label>
              <input type="number" value={filters.minPrice} onChange={e => setFilters(f => ({...f, minPrice: +e.target.value}))} style={{ width: "100%", padding: "8px 10px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 13, fontFamily: "var(--font-body)", outline: "none" }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Max ₹</label>
              <input type="number" value={filters.maxPrice} onChange={e => setFilters(f => ({...f, maxPrice: +e.target.value}))} style={{ width: "100%", padding: "8px 10px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 13, fontFamily: "var(--font-body)", outline: "none" }} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Sort By</label>
            <div style={{ display: "flex", gap: 6 }}>
              {[["price_asc","Price ↑"],["price_desc","Price ↓"]].map(([v,l]) => (
                <button key={v} onClick={() => setFilters(f => ({...f, sortBy: v}))} style={chipStyle(filters.sortBy===v)}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 16 }}>
        <button onClick={() => setCategory("")} style={chipStyle(!category)}>All</button>
        {categories.map(c => (<button key={c.id} onClick={() => setCategory(c.id)} style={chipStyle(category===c.id)}>{c.icon} {c.name}</button>))}
      </div>

      <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>{loading ? "Searching..." : `${workers.length} result${workers.length !== 1 ? "s" : ""} found`}</p>

      {!loading && workers.length === 0 ? (
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 40, textAlign: "center" }}>
          <p style={{ fontSize: 32, marginBottom: 8 }}>🔍</p>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>No results found</p>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Try different keywords or adjust filters</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {workers.map((w: any) => { const p = w.profiles || {}; return (
            <div key={w.id} onClick={() => router.push(`/worker/${w.id}`)} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, cursor: "pointer" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, color: "var(--accent)", fontWeight: 700 }}>{p.name?.[0] || "?"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name || "Worker"}</span>
                    {p.verified && <Shield size={14} color="var(--accent)" />}
                    {w.licensed && <span style={{ fontSize: 10, padding: "2px 6px", background: "rgba(59,130,246,0.15)", color: "#60A5FA", borderRadius: 4 }}>Licensed</span>}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>{(w.skills || []).slice(0, 3).map((sk: any) => typeof sk === "string" ? sk : sk.name).join(", ") || "General"}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Star size={12} fill="var(--accent)" color="var(--accent)" />
                    <span style={{ fontSize: 12, color: "var(--accent)" }}>{p.rating || "New"}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>({p.review_count || 0})</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>• {w.response_time}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}><div style={{ fontWeight: 700, color: "var(--accent)", fontSize: 15 }}>{formatCurrency(w.hourly_rate || 0)}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>/hr</div></div>
              </div>
            </div>
          ); })}
        </div>
      )}
    </div>
  );
}
