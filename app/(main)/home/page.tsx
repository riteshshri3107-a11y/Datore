export const dynamic = "force-dynamic";
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, getCategories, getProfile } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push("/login"); return; }
      const [p, cats] = await Promise.all([getProfile(session.user.id), getCategories()]);
      setProfile(p); setCategories(cats);
      const { data } = await supabase.from("workers").select("*, profiles(*)").eq("available", true).limit(8);
      setWorkers(data || []);
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}><div style={{ width: 40, height: 40, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", animation: "spin 1s linear infinite" }} /></div>;

  return (
    <div style={{ padding: "16px 16px 40px" }} className="animate-fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><p style={{ fontSize: 13, color: "var(--text-muted)" }}>Welcome back</p><h1 style={{ fontFamily: "var(--font-display)", fontSize: 26 }}>{profile?.name || "Friend"} 👋</h1></div>
        <button onClick={() => router.push("/notifications")} style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bg-card)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🔔</button>
      </div>
      <div onClick={() => router.push("/search")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius)", marginBottom: 24, cursor: "pointer" }}>
        <span>🔍</span><span style={{ color: "var(--text-muted)", fontSize: 15 }}>What service do you need?</span>
      </div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Categories</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {categories.slice(0, 8).map((c: any) => <div key={c.id} onClick={() => router.push(`/search?cat=${c.id}`)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "14px 8px", borderRadius: "var(--radius-sm)", cursor: "pointer", border: "1px solid var(--border)", background: "var(--bg-card)", textAlign: "center" }}><span style={{ fontSize: 28 }}>{c.icon}</span><span style={{ fontSize: 11, fontWeight: 600 }}>{c.name}</span></div>)}
        </div>
      </div>
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Featured Professionals</h2>
        {workers.length === 0 ? <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 32, textAlign: "center" }}><p style={{ fontSize: 28, marginBottom: 8 }}>🔍</p><p style={{ color: "var(--text-secondary)", fontSize: 14 }}>No workers yet. Be the first!</p><button onClick={() => router.push("/profile")} style={{ marginTop: 12, padding: "10px 20px", background: "var(--accent)", color: "#0A0A0F", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)" }}>Post Your Skills</button></div> : workers.map((w: any) => { const p = w.profiles || {}; return (
          <div key={w.id} onClick={() => router.push(`/worker/${w.id}`)} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, cursor: "pointer", marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>{p.name?.[0] || "?"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontWeight: 700, fontSize: 15 }}>{p.name || "Worker"}</span>{p.verified && <span style={{ fontSize: 12, color: "var(--accent)" }}>✓</span>}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>⭐ {p.rating || "New"} ({p.review_count || 0})</div>
              </div>
              <div style={{ textAlign: "right" }}><div style={{ fontWeight: 700, color: "var(--accent)", fontSize: 15 }}>{formatCurrency(w.hourly_rate || 0)}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>/hr</div></div>
            </div>
          </div>
        ); })}
      </div>
    </div>
  );
}
