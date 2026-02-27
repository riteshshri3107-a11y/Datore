"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, getBookings, getWallet } from "@/lib/supabase";
import { formatCurrency, statusColor } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("active");

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push("/login"); return; }
      const [w, b] = await Promise.all([getWallet(session.user.id), getBookings(session.user.id)]);
      setWallet(w); setBookings(b); setLoading(false);
    })();
  }, [router]);

  const active = bookings.filter(b => ["requested", "accepted", "in_progress"].includes(b.status));
  const history = bookings.filter(b => ["completed", "cancelled", "rejected"].includes(b.status));
  const shown = tab === "active" ? active : history;

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}><p style={{ color: "var(--text-muted)" }}>Loading...</p></div>;

  return (
    <div style={{ padding: "16px 16px 40px" }} className="animate-fade-up">
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, marginBottom: 20 }}>Dashboard</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--accent-border)", borderRadius: "var(--radius)", padding: 16 }}><div style={{ fontSize: 20, marginBottom: 4 }}>💰</div><div style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--accent)" }}>{formatCurrency(wallet?.balance || 0)}</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Balance</div></div>
        <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}><div style={{ fontSize: 20, marginBottom: 4 }}>💼</div><div style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>{formatCurrency(wallet?.total_earned || 0)}</div><div style={{ fontSize: 12, color: "var(--text-muted)" }}>Earned</div></div>
      </div>
      <div style={{ display: "flex", gap: 4, background: "var(--bg-secondary)", borderRadius: "var(--radius)", padding: 4, marginBottom: 16 }}>
        {["active", "history"].map(t => <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: 10, borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "var(--font-body)", background: tab === t ? "var(--accent)" : "transparent", color: tab === t ? "#0A0A0F" : "var(--text-muted)", textTransform: "capitalize" as const }}>{t}</button>)}
      </div>
      {shown.length === 0 ? <div style={{ textAlign: "center", padding: 32, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}><p style={{ color: "var(--text-muted)", fontSize: 13 }}>No {tab} bookings</p></div> :
        shown.map((b: any) => <div key={b.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, marginBottom: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontWeight: 700 }}>{b.service}</span><span style={{ fontSize: 12, fontWeight: 600, color: statusColor(b.status), padding: "4px 10px", background: `${statusColor(b.status)}15`, borderRadius: 12 }}>{b.status.replace("_", " ")}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 13, color: "var(--text-muted)" }}>{b.scheduled_date} {b.scheduled_time}</span><span style={{ fontWeight: 700, color: "var(--accent)" }}>{formatCurrency(b.amount)}</span></div>
        </div>)
      }
    </div>
  );
}
