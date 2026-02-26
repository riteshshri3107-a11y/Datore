"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Check } from "lucide-react";
import { supabase, getNotifications, markAllNotificationsRead } from "@/lib/supabase";
import { timeAgo } from "@/lib/utils";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push("/login"); return; }
      const n = await getNotifications(session.user.id);
      setNotifs(n);
      setLoading(false);
    }
    load();
  }, [router]);

  const handleMarkAll = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      await markAllNotificationsRead(session.user.id);
      setNotifs(n => n.map(x => ({ ...x, is_read: true })));
    }
  };

  const icons: Record<string, string> = { booking: "📅", payment: "💰", review: "⭐", verification: "🛡️", system: "🔔", message: "💬" };

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><p style={{color:"var(--text-muted)"}}>Loading...</p></div>;

  return (
    <div style={{ padding: "16px 16px 40px" }} className="animate-fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26 }}>Notifications</h1>
        {notifs.some(n => !n.is_read) && (
          <button onClick={handleMarkAll} style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", background: "var(--accent-dim)", color: "var(--accent)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "var(--font-body)" }}><Check size={14} /> Mark all read</button>
        )}
      </div>
      {notifs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <Bell size={48} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontWeight: 700, marginBottom: 4 }}>No notifications yet</p>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>You&apos;ll be notified about bookings, messages, and more</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {notifs.map(n => (
            <div key={n.id} style={{ display: "flex", gap: 12, padding: "14px 12px", background: n.is_read ? "var(--bg-card)" : "var(--accent-dim)", border: "1px solid", borderColor: n.is_read ? "var(--border)" : "var(--accent-border)", borderRadius: "var(--radius-sm)" }}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{icons[n.type] || "🔔"}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{n.title}</div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.4 }}>{n.message}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{timeAgo(n.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
