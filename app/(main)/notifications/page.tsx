"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, getNotifications, markAllNotificationsRead } from "@/lib/supabase";
import { timeAgo } from "@/lib/utils";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push("/login"); return; }
      setNotifs(await getNotifications(session.user.id)); setLoading(false);
    })();
  }, [router]);

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}><p style={{ color: "var(--text-muted)" }}>Loading...</p></div>;

  return (
    <div style={{ padding: "16px 16px 40px" }} className="animate-fade-up">
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, marginBottom: 20 }}>Notifications</h1>
      {notifs.length === 0 ? <div style={{ textAlign: "center", padding: 40 }}><p style={{ fontSize: 48 }}>🔔</p><p style={{ fontWeight: 700 }}>No notifications yet</p></div> :
        notifs.map((n: any) => <div key={n.id} style={{ display: "flex", gap: 12, padding: "14px 12px", background: n.is_read ? "var(--bg-card)" : "var(--accent-dim)", border: "1px solid", borderColor: n.is_read ? "var(--border)" : "var(--accent-border)", borderRadius: "var(--radius-sm)", marginBottom: 8 }}>
          <span style={{ fontSize: 24 }}>{n.type === "booking" ? "📅" : n.type === "payment" ? "💰" : "🔔"}</span>
          <div><div style={{ fontWeight: 700, fontSize: 14 }}>{n.title}</div><p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{n.message}</p><p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{timeAgo(n.created_at)}</p></div>
        </div>)
      }
    </div>
  );
}
