"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Star, Shield, ChevronRight, Bell } from "lucide-react";
import { supabase, getCategories, getProfile } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [nearbyWorkers, setNearbyWorkers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push("/login"); return; }
      const [p, cats] = await Promise.all([getProfile(session.user.id), getCategories()]);
      setProfile(p);
      setCategories(cats);
      const { data: workers } = await supabase.from("workers").select("*, profiles(*)").eq("available", true).limit(8);
      setNearbyWorkers(workers || []);
      setLoading(false);
    }
    load();
  }, [router]);

  const handleSearch = () => router.push(searchQuery.trim() ? `/search?q=${encodeURIComponent(searchQuery)}` : "/search");

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><div style={{textAlign:"center"}}><div style={{width:40,height:40,border:"3px solid var(--border)",borderTopColor:"var(--accent)",borderRadius:"50%",animation:"spin 1s linear infinite",margin:"0 auto 12px"}}/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style><p style={{color:"var(--text-muted)",fontSize:14}}>Loading...</p></div></div>;

  return (
    <div style={{ padding: "16px 16px 40px" }} className="animate-fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><p style={{ fontSize: 13, color: "var(--text-muted)" }}>Welcome back</p><h1 style={{ fontFamily: "var(--font-display)", fontSize: 26 }}>{profile?.name || "Friend"} 👋</h1></div>
        <button onClick={() => router.push("/notifications")} style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bg-card)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}><Bell size={20} /></button>
      </div>

      <div onClick={() => router.push("/search")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius)", marginBottom: 24, cursor: "pointer" }}>
        <Search size={18} color="var(--text-muted)" />
        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSearch()} placeholder="What service do you need?" style={{ flex: 1, background: "transparent", border: "none", color: "var(--text-primary)", fontSize: 15, outline: "none", fontFamily: "var(--font-body)" }} />
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Categories</h2>
          <button onClick={() => router.push("/search")} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)" }}>See All <ChevronRight size={14} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {categories.slice(0, 8).map(c => (
            <div key={c.id} onClick={() => router.push(`/search?cat=${c.id}`)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "14px 8px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid var(--border)", background: "var(--bg-card)", textAlign: "center" }}>
              <span style={{ fontSize: 28 }}>{c.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, lineHeight: 1.3 }}>{c.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Featured Professionals</h2>
          <button onClick={() => router.push("/search")} style={{ background: "none", border: "none", color: "var(--accent)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontFamily: "var(--font-body)" }}>View All <ChevronRight size={14} /></button>
        </div>
        {nearbyWorkers.length === 0 ? (
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 32, textAlign: "center" }}>
            <p style={{ fontSize: 28, marginBottom: 8 }}>🔍</p>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>No workers found yet. Be the first to post your skills!</p>
            <button onClick={() => router.push("/profile")} style={{ marginTop: 12, padding: "10px 20px", background: "var(--accent)", color: "#0A0A0F", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)" }}>Post Your Skills</button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {nearbyWorkers.map((w: any) => { const p = w.profiles || {}; return (
              <div key={w.id} onClick={() => router.push(`/worker/${w.id}`)} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, cursor: "pointer" }}>
                <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0, color: "var(--accent)", fontWeight: 700 }}>{p.name?.[0] || "?"}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{p.name || "Worker"}</span>
                      {p.verified && <Shield size={14} color="var(--accent)" />}
                    </div>
                    <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 4 }}>{(w.skills || []).slice(0, 2).map((sk: any) => typeof sk === "string" ? sk : sk.name).join(", ") || "General"}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, color: "var(--accent)" }}><Star size={12} fill="var(--accent)" /> {p.rating || "New"}</span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{p.review_count || 0} reviews</span>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}><div style={{ fontWeight: 700, color: "var(--accent)", fontSize: 15 }}>{formatCurrency(w.hourly_rate || 0)}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>per hour</div></div>
                </div>
              </div>
            ); })}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {[{ n: "10K+", l: "Users" }, { n: "1%", l: "Platform Fee" }, { n: "99%", l: "Worker Gets" }].map((s, i) => (
          <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: "16px 8px", textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--accent)" }}>{s.n}</div>
            <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
