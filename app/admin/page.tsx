export const dynamic = "force-dynamic";
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState({ users: 0, workers: 0, bookings: 0, revenue: 0, pending: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push("/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
      if (profile?.role !== "admin") { setIsAdmin(false); setLoading(false); return; }
      setIsAdmin(true);
      const [u, b, v] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("verifications").select("*").order("submitted_at", { ascending: false }),
      ]);
      setUsers(u.data || []); setBookings(b.data || []); setVerifications(v.data || []);
      setStats({ users: (u.data || []).length, workers: (u.data || []).filter((x: any) => x.role === "seller" || x.role === "both").length, bookings: (b.data || []).length, revenue: (b.data || []).reduce((s: number, x: any) => s + (x.platform_fee || 0), 0), pending: (v.data || []).filter((x: any) => x.status === "pending").length });
      setLoading(false);
    })();
  }, [router]);

  const approve = async (id: string, userId: string) => {
    await supabase.from("verifications").update({ status: "approved", reviewed_at: new Date().toISOString() }).eq("id", id);
    await supabase.from("profiles").update({ verified: true, verified_at: new Date().toISOString() }).eq("id", userId);
    setVerifications(v => v.map(x => x.id === id ? { ...x, status: "approved" } : x));
  };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}><p style={{ color: "var(--text-muted)" }}>Loading...</p></div>;
  if (!isAdmin) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center" }}><div><p style={{ fontSize: 32 }}>🔒</p><h2>Admin Only</h2><p style={{ color: "var(--text-muted)", margin: "8px 0 16px", fontSize: 14 }}>Set role to admin in Supabase profiles table.</p><button onClick={() => router.push("/home")} style={{ padding: "10px 20px", background: "var(--accent)", color: "#0A0A0F", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: 600, fontFamily: "var(--font-body)" }}>Go Home</button></div></div>;

  const tabs = [["overview","📊 Overview"],["users","👥 Users"],["verify","🛡️ Verify"],["bookings","📅 Bookings"],["revenue","💰 Revenue"]];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav style={{ width: 200, background: "var(--bg-secondary)", borderRight: "1px solid var(--border)", padding: "20px 12px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, paddingLeft: 8 }}><div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div><span style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>Admin</span></div>
        {tabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} style={{ display: "block", width: "100%", padding: "10px 12px", marginBottom: 4, borderRadius: "var(--radius-sm)", background: tab === id ? "var(--accent-dim)" : "transparent", color: tab === id ? "var(--accent)" : "var(--text-secondary)", border: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === id ? 700 : 400, fontFamily: "var(--font-body)", textAlign: "left" }}>{label}</button>)}
        <button onClick={() => router.push("/home")} style={{ display: "block", width: "100%", padding: "10px 12px", marginTop: 20, borderRadius: "var(--radius-sm)", background: "transparent", color: "var(--text-muted)", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "var(--font-body)", textAlign: "left" }}>← Back</button>
      </nav>
      <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        {tab === "overview" && <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 20 }}>Dashboard</h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
            {[{ n: stats.users, l: "Users", c: "#00D4AA" },{ n: stats.workers, l: "Workers", c: "#60A5FA" },{ n: stats.bookings, l: "Bookings", c: "#FBBF24" },{ n: formatCurrency(stats.revenue), l: "Revenue", c: "#A855F7" },{ n: stats.pending, l: "Pending Verifications", c: "#FF4D6A" }].map((s, i) => <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}><div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: s.c }}>{s.n}</div><div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{s.l}</div></div>)}
          </div>
        </div>}
        {tab === "users" && <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 20 }}>Users ({users.length})</h1>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>{["Name","Email","Role","Verified","Status"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{h}</th>)}</tr></thead>
              <tbody>{users.map(u => <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}><td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>{u.name}</td><td style={{ padding: "10px 14px", fontSize: 13, color: "var(--text-secondary)" }}>{u.email}</td><td style={{ padding: "10px 14px" }}><span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 8, background: "var(--accent-dim)", color: "var(--accent)" }}>{u.role}</span></td><td style={{ padding: "10px 14px" }}>{u.verified ? "✅" : "❌"}</td><td style={{ padding: "10px 14px", fontSize: 13, color: u.status === "active" ? "var(--accent)" : "var(--danger)" }}>{u.status}</td></tr>)}</tbody>
            </table>
          </div>
        </div>}
        {tab === "verify" && <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 20 }}>Verification ({stats.pending} pending)</h1>
          {verifications.length === 0 ? <p style={{ color: "var(--text-muted)" }}>No requests</p> : verifications.map(v => <div key={v.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontWeight: 700 }}>{v.user_name || "User"}</span><span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 8, background: v.status === "pending" ? "rgba(251,191,36,0.1)" : "var(--accent-dim)", color: v.status === "pending" ? "#FBBF24" : "var(--accent)" }}>{v.status}</span></div>
            {v.status === "pending" && <button onClick={() => approve(v.id, v.user_id)} style={{ padding: "8px 14px", background: "var(--accent)", color: "#0A0A0F", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)" }}>✅ Approve</button>}
          </div>)}
        </div>}
        {tab === "bookings" && <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 20 }}>Bookings ({bookings.length})</h1>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>{["Service","Amount","Fee (1%)","Worker (99%)","Status"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{h}</th>)}</tr></thead>
              <tbody>{bookings.map(b => <tr key={b.id} style={{ borderBottom: "1px solid var(--border)" }}><td style={{ padding: "10px 14px", fontSize: 13 }}>{b.service}</td><td style={{ padding: "10px 14px", fontSize: 13 }}>{formatCurrency(b.amount)}</td><td style={{ padding: "10px 14px", fontSize: 13, color: "#A855F7" }}>{formatCurrency(b.platform_fee)}</td><td style={{ padding: "10px 14px", fontSize: 13, color: "var(--accent)" }}>{formatCurrency(b.worker_payout)}</td><td style={{ padding: "10px 14px" }}><span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 8, background: "var(--accent-dim)", color: "var(--accent)" }}>{b.status}</span></td></tr>)}</tbody>
            </table>
          </div>
        </div>}
        {tab === "revenue" && <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 20 }}>Revenue</h1>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}><div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--accent)" }}>{formatCurrency(stats.revenue)}</div><div style={{ fontSize: 13, color: "var(--text-muted)" }}>Platform (1%)</div></div>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}><div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#60A5FA" }}>{formatCurrency(bookings.reduce((s: number, b: any) => s + (b.worker_payout || 0), 0))}</div><div style={{ fontSize: 13, color: "var(--text-muted)" }}>Workers (99%)</div></div>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}><div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#FBBF24" }}>{formatCurrency(bookings.reduce((s: number, b: any) => s + (b.amount || 0), 0))}</div><div style={{ fontSize: 13, color: "var(--text-muted)" }}>Total Volume</div></div>
          </div>
        </div>}
      </main>
    </div>
  );
}
