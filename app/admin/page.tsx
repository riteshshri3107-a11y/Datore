"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({ users: 0, workers: 0, bookings: 0, revenue: 0, pending: 0 });
  const [users, setUsers] = useState<any[]>([]); const [bookings, setBookings] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => { (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { router.push("/login"); return; }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
    if (profile?.role !== "admin") { setIsAdmin(false); setLoading(false); return; }
    setIsAdmin(true);
    const [u, b, v] = await Promise.all([supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100), supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(100), supabase.from("verifications").select("*").order("submitted_at", { ascending: false })]);
    setUsers(u.data || []); setBookings(b.data || []); setVerifications(v.data || []);
    setStats({ users: (u.data || []).length, workers: (u.data || []).filter((x: any) => x.role === "seller" || x.role === "both").length, bookings: (b.data || []).length, revenue: (b.data || []).reduce((s: number, x: any) => s + (x.platform_fee || 0), 0), pending: (v.data || []).filter((x: any) => x.status === "pending").length });
    setLoading(false);
  })(); }, [router]);

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0A0A0F", color: "#F0F0F5" }}><p>Loading...</p></div>;
  if (!isAdmin) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#0A0A0F", color: "#F0F0F5", textAlign: "center" }}><div><p style={{ fontSize: 32 }}>🔒</p><h2>Admin Only</h2><p style={{ color: "#9090A8", margin: "8px 0 16px", fontSize: 14 }}>Set role to admin in Supabase profiles table.</p><button onClick={() => router.push("/home")} style={{ padding: "10px 20px", background: "#00D4AA", color: "#0A0A0F", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600, fontFamily: "inherit" }}>Go Home</button></div></div>;

  const tabs = [["overview","📊"],["users","👥"],["verify","🛡️"],["bookings","📅"],["revenue","💰"]];
  const t = { bg: "#0A0A0F", card: "#1A1A26", accent: "#00D4AA", text: "#F0F0F5", muted: "#9090A8", border: "rgba(255,255,255,0.06)", dim: "rgba(0,212,170,0.08)" };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.bg, color: t.text }}>
      <nav style={{ width: 180, background: "#12121A", borderRight: `1px solid ${t.border}`, padding: "16px 10px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, paddingLeft: 8 }}><div style={{ width: 28, height: 28, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>⚡</div><span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18 }}>Admin</span></div>
        {tabs.map(([id, icon]) => <button key={id} onClick={() => setTab(id)} style={{ display: "block", width: "100%", padding: "10px 12px", marginBottom: 2, borderRadius: 10, background: tab === id ? t.dim : "transparent", color: tab === id ? t.accent : t.muted, border: "none", cursor: "pointer", fontSize: 13, fontWeight: tab === id ? 700 : 400, fontFamily: "inherit", textAlign: "left" }}>{icon} {id.charAt(0).toUpperCase() + id.slice(1)}</button>)}
        <button onClick={() => router.push("/home")} style={{ display: "block", width: "100%", padding: "10px 12px", marginTop: 16, borderRadius: 10, background: "transparent", color: t.muted, border: "none", cursor: "pointer", fontSize: 13, fontFamily: "inherit", textAlign: "left" }}>← Back</button>
      </nav>
      <main style={{ flex: 1, padding: 20, overflowY: "auto" }}>
        {tab === "overview" && <><h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, marginBottom: 16 }}>Dashboard</h1><div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12 }}>{[{ n: stats.users, l: "Users", c: "#00D4AA" },{ n: stats.workers, l: "Workers", c: "#60A5FA" },{ n: stats.bookings, l: "Bookings", c: "#FBBF24" },{ n: formatCurrency(stats.revenue), l: "Revenue", c: "#A855F7" },{ n: stats.pending, l: "Pending", c: "#FF4D6A" }].map((s, i) => <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16 }}><div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: s.c }}>{s.n}</div><div style={{ fontSize: 12, color: t.muted, marginTop: 4 }}>{s.l}</div></div>)}</div></>}
        {tab === "users" && <><h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, marginBottom: 16 }}>Users ({users.length})</h1>{users.map(u => <div key={u.id} style={{ display: "flex", justifyContent: "space-between", padding: 12, background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, marginBottom: 6 }}><div><div style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</div><div style={{ fontSize: 12, color: t.muted }}>{u.email}</div></div><div style={{ display: "flex", gap: 6, alignItems: "center" }}><span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 8, background: t.dim, color: t.accent }}>{u.role}</span>{u.verified ? <span>✅</span> : <span>❌</span>}</div></div>)}</>}
        {tab === "bookings" && <><h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, marginBottom: 16 }}>Bookings ({bookings.length})</h1>{bookings.map(b => <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: 12, background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, marginBottom: 6 }}><div><div style={{ fontWeight: 700, fontSize: 14 }}>{b.service}</div><div style={{ fontSize: 12, color: t.muted }}>{b.status}</div></div><div style={{ textAlign: "right" }}><div style={{ fontWeight: 700, color: t.accent }}>{formatCurrency(b.amount)}</div><div style={{ fontSize: 11, color: t.muted }}>Fee: {formatCurrency(b.platform_fee || 0)}</div></div></div>)}</>}
        {tab === "verify" && <><h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, marginBottom: 16 }}>Verification ({stats.pending} pending)</h1>{verifications.length === 0 ? <p style={{ color: t.muted }}>No requests</p> : verifications.map(v => <div key={v.id} style={{ padding: 12, background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, marginBottom: 6 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700 }}>{v.user_name || "User"}</span><span style={{ fontSize: 12, padding: "3px 8px", borderRadius: 8, background: v.status === "pending" ? "rgba(251,191,36,0.1)" : t.dim, color: v.status === "pending" ? "#FBBF24" : t.accent }}>{v.status}</span></div></div>)}</>}
        {tab === "revenue" && <><h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, marginBottom: 16 }}>Revenue</h1><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}><div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16 }}><div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: t.accent }}>{formatCurrency(stats.revenue)}</div><div style={{ fontSize: 12, color: t.muted }}>Platform (1%)</div></div><div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16 }}><div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: "#60A5FA" }}>{formatCurrency(bookings.reduce((s: number, b: any) => s + (b.worker_payout || 0), 0))}</div><div style={{ fontSize: 12, color: t.muted }}>Workers (99%)</div></div><div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16 }}><div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: "#FBBF24" }}>{formatCurrency(bookings.reduce((s: number, b: any) => s + (b.amount || 0), 0))}</div><div style={{ fontSize: 12, color: t.muted }}>Total Volume</div></div></div></>}
      </main>
    </div>
  );
}
