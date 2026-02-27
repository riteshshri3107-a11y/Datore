"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, getChatRooms, getProfile } from "@/lib/supabase";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";
import { timeAgo } from "@/lib/utils";

export default function MessagesPage() {
  const router = useRouter(); const { isDark } = useThemeStore(); const t = getTheme(isDark);
  const [rooms, setRooms] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { router.push("/login"); return; }
    const r = await getChatRooms(session.user.id);
    const enriched = await Promise.all((r || []).map(async (room: any) => { const otherId = room.participant_1 === session.user.id ? room.participant_2 : room.participant_1; return { ...room, otherProfile: await getProfile(otherId) }; }));
    setRooms(enriched); setLoading(false);
  })(); }, [router]);

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}><p style={{ color: t.textMuted }}>Loading...</p></div>;
  return (
    <div style={{ padding: "16px 16px 40px" }} className="anim-fade">
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, marginBottom: 20 }}>Messages</h1>
      {rooms.length === 0 ? <div style={{ textAlign: "center", padding: 40 }}><p style={{ fontSize: 48 }}>💬</p><p style={{ fontWeight: 700 }}>No conversations yet</p><p style={{ color: t.textMuted, fontSize: 13 }}>Start a chat from a worker profile</p></div> :
        rooms.map((room: any) => <div key={room.id} onClick={() => router.push(`/chat/${room.id}`)} style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, cursor: "pointer", borderRadius: 12, background: t.bgCard, marginBottom: 6, border: `1px solid ${t.border}` }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: t.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: t.accent, fontWeight: 700 }}>{room.otherProfile?.name?.[0] || "?"}</div>
          <div style={{ flex: 1 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700, fontSize: 13 }}>{room.otherProfile?.name || "User"}</span><span style={{ fontSize: 11, color: t.textMuted }}>{timeAgo(room.last_message_at)}</span></div><p style={{ fontSize: 12, color: t.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{room.last_message || "Start chatting"}</p></div>
        </div>)}
    </div>
  );
}
