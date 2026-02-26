"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, Shield, Briefcase, DollarSign, Star, MessageCircle, BarChart3, Settings, ArrowLeft, CheckCircle, XCircle, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";

type Tab = "overview"|"users"|"verification"|"bookings"|"payments"|"reviews"|"settings";

export default function AdminDashboard() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState({ users: 0, workers: 0, bookings: 0, revenue: 0, pending_verifications: 0, active_bookings: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push("/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
      if (profile?.role !== "admin") { setIsAdmin(false); setLoading(false); return; }
      setIsAdmin(true);

      const [u, w, b, v, r, tx] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("workers").select("id").then(r => r.data?.length || 0),
        supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(100),
        supabase.from("verifications").select("*").order("submitted_at", { ascending: false }),
        supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("transactions").select("platform_fee").then(r => (r.data || []).reduce((s: number, t: any) => s + (t.platform_fee || 0), 0)),
      ]);
      setUsers(u.data || []);
      setBookings(b.data || []);
      setVerifications(v.data || []);
      setReviews(r.data || []);
      setStats({
        users: (u.data || []).length, workers: w as number, bookings: (b.data || []).length,
        revenue: tx as number, pending_verifications: (v.data || []).filter((x: any) => x.status === "pending").length,
        active_bookings: (b.data || []).filter((x: any) => ["requested","accepted","in_progress"].includes(x.status)).length,
      });
      setLoading(false);
    }
    load();
  }, [router]);

  const approveVerification = async (id: string, userId: string) => {
    await supabase.from("verifications").update({ status: "approved", reviewed_at: new Date().toISOString(), expires_at: new Date(Date.now() + 365*24*60*60*1000).toISOString() }).eq("id", id);
    await supabase.from("profiles").update({ verified: true, verified_at: new Date().toISOString(), verification_expiry: new Date(Date.now() + 365*24*60*60*1000).toISOString() }).eq("id", userId);
    setVerifications(v => v.map(x => x.id === id ? { ...x, status: "approved" } : x));
  };
  const rejectVerification = async (id: string) => {
    await supabase.from("verifications").update({ status: "rejected", reviewed_at: new Date().toISOString() }).eq("id", id);
    setVerifications(v => v.map(x => x.id === id ? { ...x, status: "rejected" } : x));
  };

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"}}><p style={{color:"var(--text-muted)"}}>Loading admin...</p></div>;
  if (!isAdmin) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", textAlign: "center", padding: 20 }}>
      <div><p style={{ fontSize: 32, marginBottom: 12 }}>🔒</p><h2 style={{ marginBottom: 8 }}>Admin Access Only</h2>
        <p style={{ color: "var(--text-muted)", marginBottom: 16, fontSize: 14 }}>Set your profile role to &quot;admin&quot; in Supabase to access this page.</p>
        <button onClick={() => router.push("/home")} style={{ padding: "10px 20px", background: "var(--accent)", color: "#0A0A0F", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontWeight: 600, fontFamily: "var(--font-body)" }}>Go Home</button>
      </div>
    </div>
  );

  const tabs: { id: Tab; icon: any; label: string }[] = [
    { id: "overview", icon: BarChart3, label: "Overview" }, { id: "users", icon: Users, label: "Users" },
    { id: "verification", icon: Shield, label: "Verify" }, { id: "bookings", icon: Briefcase, label: "Bookings" },
    { id: "payments", icon: DollarSign, label: "Revenue" }, { id: "reviews", icon: Star, label: "Reviews" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <nav style={{ width: 220, background: "var(--bg-secondary)", borderRight: "1px solid var(--border)", padding: "20px 12px", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 28, paddingLeft: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>⚡</div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>Admin</span>
        </div>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", marginBottom: 4, borderRadius: "var(--radius-sm)", background: tab === t.id ? "var(--accent-dim)" : "transparent", color: tab === t.id ? "var(--accent)" : "var(--text-secondary)", border: "none", cursor: "pointer", fontSize: 14, fontWeight: tab === t.id ? 700 : 400, fontFamily: "var(--font-body)" }}>
            <t.icon size={18} /> {t.label}
          </button>
        ))}
        <button onClick={() => router.push("/home")} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", marginTop: 20, borderRadius: "var(--radius-sm)", background: "transparent", color: "var(--text-muted)", border: "none", cursor: "pointer", fontSize: 14, fontFamily: "var(--font-body)" }}><ArrowLeft size={18} /> Back to App</button>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 24, overflowY: "auto" }}>
        {tab === "overview" && (
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 20 }}>Dashboard Overview</h1>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
              {[{ n: stats.users, l: "Total Users", c: "#00D4AA" }, { n: stats.workers, l: "Workers", c: "#60A5FA" }, { n: stats.active_bookings, l: "Active Bookings", c: "#FBBF24" }, { n: formatCurrency(stats.revenue), l: "Platform Revenue", c: "#A855F7" }, { n: stats.pending_verifications, l: "Pending Verifications", c: "#FF4D6A" }, { n: stats.bookings, l: "Total Bookings", c: "#F97316" }].map((s, i) => (
                <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: s.c }}>{s.n}</div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Recent Bookings</h2>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Service","Worker","Customer","Amount","Status"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {bookings.slice(0, 10).map(b => (
                    <tr key={b.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px 14px", fontSize: 13 }}>{b.service}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13 }}>{b.worker_name || "-"}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13 }}>{b.customer_name || "-"}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--accent)" }}>{formatCurrency(b.amount)}</td>
                      <td style={{ padding: "10px 14px" }}><span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 8, background: "var(--accent-dim)", color: "var(--accent)" }}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 20 }}>Users ({users.length})</h1>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Name","Email","Role","Verified","Status"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{h}</th>)}
                </tr></thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "10px 14px", fontSize: 13, fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--text-secondary)" }}>{u.email}</td>
                      <td style={{ padding: "10px 14px" }}><span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 8, background: "var(--accent-dim)", color: "var(--accent)" }}>{u.role}</span></td>
                      <td style={{ padding: "10px 14px" }}>{u.verified ? <CheckCircle size={16} color="var(--accent)" /> : <XCircle size={16} color="var(--text-muted)" />}</td>
                      <td style={{ padding: "10px 14px" }}><span style={{ fontSize: 11, color: u.status === "active" ? "var(--accent)" : "var(--danger)" }}>{u.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "verification" && (
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 20 }}>Verification Queue ({stats.pending_verifications} pending)</h1>
            {verifications.length === 0 ? <p style={{ color: "var(--text-muted)" }}>No verification requests</p> : verifications.map(v => (
              <div key={v.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontWeight: 700 }}>{v.user_name || "User"}</span>
                  <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 8, background: v.status === "pending" ? "rgba(251,191,36,0.1)" : v.status === "approved" ? "var(--accent-dim)" : "rgba(255,77,106,0.1)", color: v.status === "pending" ? "#FBBF24" : v.status === "approved" ? "var(--accent)" : "var(--danger)" }}>{v.status}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>Police Station: {v.police_station || "N/A"} • ID: {v.gov_id_number || "N/A"}</p>
                {v.status === "pending" && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => approveVerification(v.id, v.user_id)} style={{ flex: 1, padding: "8px 14px", background: "var(--accent)", color: "#0A0A0F", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)" }}>✅ Approve</button>
                    <button onClick={() => rejectVerification(v.id)} style={{ flex: 1, padding: "8px 14px", background: "rgba(255,77,106,0.1)", color: "var(--danger)", border: "1px solid rgba(255,77,106,0.2)", borderRadius: 8, fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)" }}>❌ Reject</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab === "bookings" && (
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 20 }}>All Bookings ({bookings.length})</h1>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Service","Worker","Customer","Amount","Fee","Worker Gets","Status","Date"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>{h}</th>)}
                </tr></thead>
                <tbody>{bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td style={{ padding: "10px 14px", fontSize: 13 }}>{b.service}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13 }}>{b.worker_name || "-"}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13 }}>{b.customer_name || "-"}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13 }}>{formatCurrency(b.amount)}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13, color: "#A855F7" }}>{formatCurrency(b.platform_fee)}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--accent)" }}>{formatCurrency(b.worker_payout)}</td>
                    <td style={{ padding: "10px 14px" }}><span style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 8, background: "var(--accent-dim)", color: "var(--accent)" }}>{b.status}</span></td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--text-muted)" }}>{b.scheduled_date || "-"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "payments" && (
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 20 }}>Revenue & Payments</h1>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--accent)" }}>{formatCurrency(stats.revenue)}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Platform Revenue (1%)</div>
              </div>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#60A5FA" }}>{formatCurrency(bookings.reduce((s, b) => s + (b.worker_payout || 0), 0))}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Worker Payouts (99%)</div>
              </div>
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "#FBBF24" }}>{formatCurrency(bookings.reduce((s, b) => s + (b.amount || 0), 0))}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Total Transacted</div>
              </div>
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Platform fee: 1% per transaction. Worker receives 99%.</p>
          </div>
        )}

        {tab === "reviews" && (
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 20 }}>Reviews ({reviews.length})</h1>
            {reviews.map(r => (
              <div key={r.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 14, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14 }}>{r.from_user_name} → {r.to_user_name}</span>
                  <span style={{ color: "var(--accent)", fontSize: 13 }}>★ {r.overall_rating}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{r.review_text || "No text"}</p>
                {r.flagged && <span style={{ fontSize: 11, color: "var(--danger)", marginTop: 4, display: "block" }}>⚠️ Flagged: {r.flag_reason}</span>}
              </div>
            ))}
          </div>
        )}

        {tab === "settings" && (
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 20 }}>Platform Settings</h1>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 20, maxWidth: 500 }}>
              {[{ l: "Platform Fee", v: "1%", d: "Applied to each transaction" }, { l: "Worker Share", v: "99%", d: "Goes to the worker" }, { l: "Verification Expiry", v: "12 months", d: "Police badge renewal period" }, { l: "QR Code Validity", v: "24 hours", d: "Dynamic QR codes regenerate daily" }, { l: "Escrow Hold", v: "Until completed", d: "Payment released on job completion" }].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                  <div><div style={{ fontWeight: 600, fontSize: 14 }}>{s.l}</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>{s.d}</div></div>
                  <span style={{ fontWeight: 700, color: "var(--accent)" }}>{s.v}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
