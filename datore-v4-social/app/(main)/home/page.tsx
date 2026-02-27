"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, getCategories, getProfile } from "@/lib/supabase";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";
import { formatCurrency } from "@/lib/utils";

export default function HomePage() {
  const router = useRouter();
  const { isDark } = useThemeStore(); const t = getTheme(isDark);
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
      setWorkers(data || []); setLoading(false);
    })();
  }, [router]);

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}><div style={{ width: 40, height: 40, border: `3px solid ${t.border}`, borderTopColor: t.accent, borderRadius: "50%", animation: "spin 1s linear infinite" }} /></div>;

  return (
    <div style={{ padding: "16px 16px 40px" }} className="anim-fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div><p style={{ fontSize: 13, color: t.textMuted }}>Welcome back</p><h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26 }}>{profile?.name || "Friend"} 👋</h1></div>
      </div>
      <div onClick={() => router.push("/search")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: t.bgSecondary, border: `1px solid ${t.border}`, borderRadius: 14, marginBottom: 20, cursor: "pointer" }}><span>🔍</span><span style={{ color: t.textMuted, fontSize: 15 }}>What service do you need?</span></div>

      {/* Quick Actions - Social features */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
        {[["🏪","Marketplace","/marketplace"],["👥","Community","/community"],["📝","Create Post","/create"],["💾","Saved","/saved"],["📸","Memories","/memories"]].map(([icon,label,href]) =>
          <button key={href as string} onClick={() => router.push(href as string)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 16px", borderRadius: 14, border: `1px solid ${t.border}`, background: t.bgCard, cursor: "pointer", whiteSpace: "nowrap", minWidth: 80 }}><span style={{ fontSize: 22 }}>{icon}</span><span style={{ fontSize: 11, fontWeight: 600, color: t.textSecondary }}>{label}</span></button>
        )}
      </div>

      {/* Categories */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Service Categories</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
          {categories.slice(0, 8).map((c: any) => <div key={c.id} onClick={() => router.push(`/search?cat=${c.id}`)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "12px 6px", borderRadius: 10, cursor: "pointer", border: `1px solid ${t.border}`, background: t.bgCard, textAlign: "center" }}><span style={{ fontSize: 24 }}>{c.icon}</span><span style={{ fontSize: 10, fontWeight: 600, color: t.textSecondary }}>{c.name}</span></div>)}
        </div>
      </div>

      {/* Featured Workers */}
      <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Featured Professionals</h2>
      {workers.length === 0 ? <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: 32, textAlign: "center" }}><p style={{ fontSize: 28, marginBottom: 8 }}>🔍</p><p style={{ color: t.textSecondary, fontSize: 14 }}>No workers yet. Be the first!</p><button onClick={() => router.push("/profile")} style={{ marginTop: 12, padding: "10px 20px", background: t.accent, color: "#0A0A0F", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Post Your Skills</button></div> : workers.map((w: any) => { const p = w.profiles || {}; return (
        <div key={w.id} onClick={() => router.push(`/worker/${w.id}`)} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: 14, cursor: "pointer", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: t.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: t.accent, fontWeight: 700, flexShrink: 0 }}>{p.name?.[0] || "?"}</div>
            <div style={{ flex: 1 }}><div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontWeight: 700, fontSize: 14 }}>{p.name || "Worker"}</span>{p.verified && <span style={{ fontSize: 11, color: t.accent }}>🛡️</span>}</div><div style={{ fontSize: 12, color: t.textMuted }}>⭐ {p.rating || "New"} ({p.review_count || 0})</div></div>
            <div style={{ textAlign: "right" }}><div style={{ fontWeight: 700, color: t.accent, fontSize: 14 }}>{formatCurrency(w.hourly_rate || 0)}</div><div style={{ fontSize: 11, color: t.textMuted }}>/hr</div></div>
          </div>
        </div>
      ); })}
    </div>
  );
}
