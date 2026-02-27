"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, getNotifications } from "@/lib/supabase";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";
import { timeAgo } from "@/lib/utils";

export default function NotificationsPage() {
  const router = useRouter(); const { isDark } = useThemeStore(); const t = getTheme(isDark);
  const [notifs, setNotifs] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { const { data: { session } } = await supabase.auth.getSession(); if (!session?.user) { router.push("/login"); return; } setNotifs(await getNotifications(session.user.id)); setLoading(false); })(); }, [router]);
  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}><p style={{ color: t.textMuted }}>Loading...</p></div>;
  return (
    <div style={{ padding: "16px 16px 40px" }} className="anim-fade">
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, marginBottom: 20 }}>Notifications</h1>
      {notifs.length === 0 ? <div style={{ textAlign: "center", padding: 40 }}><p style={{ fontSize: 48 }}>🔔</p><p style={{ fontWeight: 700 }}>No notifications yet</p></div> :
        notifs.map((n: any) => <div key={n.id} style={{ display: "flex", gap: 10, padding: 12, background: n.is_read ? t.bgCard : t.accentDim, border: `1px solid ${n.is_read ? t.border : t.accentBorder}`, borderRadius: 12, marginBottom: 6 }}>
          <span style={{ fontSize: 22 }}>{n.type === "booking" ? "📅" : n.type === "payment" ? "💰" : "🔔"}</span>
          <div><div style={{ fontWeight: 700, fontSize: 13 }}>{n.title}</div><p style={{ fontSize: 12, color: t.textSecondary }}>{n.message}</p><p style={{ fontSize: 11, color: t.textMuted, marginTop: 2 }}>{timeAgo(n.created_at)}</p></div>
        </div>)}
    </div>
  );
}
