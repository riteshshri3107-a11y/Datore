"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, getBookings, getWallet } from "@/lib/supabase";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";
import { formatCurrency, statusColor } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter(); const { isDark } = useThemeStore(); const t = getTheme(isDark);
  const [wallet, setWallet] = useState<any>(null); const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); const [tab, setTab] = useState("active");

  useEffect(() => { (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { router.push("/login"); return; }
    const [w, b] = await Promise.all([getWallet(session.user.id), getBookings(session.user.id)]);
    setWallet(w); setBookings(b); setLoading(false);
  })(); }, [router]);

  const active = bookings.filter(b => ["requested","accepted","in_progress"].includes(b.status));
  const history = bookings.filter(b => ["completed","cancelled","rejected"].includes(b.status));
  const shown = tab === "active" ? active : history;

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}><p style={{ color: t.textMuted }}>Loading...</p></div>;
  return (
    <div style={{ padding: "16px 16px 40px" }} className="anim-fade">
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, marginBottom: 16 }}>Activity Hub</h1>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
        <div style={{ background: t.bgCard, border: `1px solid ${t.accentBorder}`, borderRadius: 14, padding: 14 }}><div style={{ fontSize: 18, marginBottom: 4 }}>💰</div><div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: t.accent }}>{formatCurrency(wallet?.balance || 0)}</div><div style={{ fontSize: 11, color: t.textMuted }}>Balance</div></div>
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: 14 }}><div style={{ fontSize: 18, marginBottom: 4 }}>💼</div><div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22 }}>{formatCurrency(wallet?.total_earned || 0)}</div><div style={{ fontSize: 11, color: t.textMuted }}>Earned</div></div>
      </div>
      <div style={{ display: "flex", gap: 4, background: t.bgSecondary, borderRadius: 12, padding: 3, marginBottom: 14 }}>{["active","history"].map(tt => <button key={tt} onClick={() => setTab(tt)} style={{ flex: 1, padding: 8, borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", background: tab === tt ? t.accent : "transparent", color: tab === tt ? "#0A0A0F" : t.textMuted, textTransform: "capitalize" as const }}>{tt}</button>)}</div>
      {shown.length === 0 ? <div style={{ textAlign: "center", padding: 28, background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14 }}><p style={{ color: t.textMuted, fontSize: 13 }}>No {tab} bookings</p></div> :
        shown.map((b: any) => <div key={b.id} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: 14, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontWeight: 700, fontSize: 14 }}>{b.service}</span><span style={{ fontSize: 11, fontWeight: 600, color: statusColor(b.status), padding: "3px 8px", background: `${statusColor(b.status)}15`, borderRadius: 10 }}>{b.status.replace("_"," ")}</span></div>
          <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontSize: 12, color: t.textMuted }}>{b.scheduled_date}</span><span style={{ fontWeight: 700, color: t.accent, fontSize: 14 }}>{formatCurrency(b.amount)}</span></div>
        </div>)}
    </div>
  );
}
