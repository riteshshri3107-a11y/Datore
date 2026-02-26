"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { supabase, getChatRooms, getProfile } from "@/lib/supabase";
import { timeAgo } from "@/lib/utils";

export default function MessagesPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push("/login"); return; }
      setUserId(session.user.id);
      const r = await getChatRooms(session.user.id);
      // Enrich with other participant's profile
      const enriched = await Promise.all((r || []).map(async (room: any) => {
        const otherId = room.participant_1 === session.user.id ? room.participant_2 : room.participant_1;
        const profile = await getProfile(otherId);
        return { ...room, otherProfile: profile };
      }));
      setRooms(enriched);
      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><p style={{color:"var(--text-muted)"}}>Loading...</p></div>;

  return (
    <div style={{ padding: "16px 16px 40px" }} className="animate-fade-up">
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, marginBottom: 20 }}>Messages</h1>
      {rooms.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40 }}>
          <MessageCircle size={48} color="var(--text-muted)" style={{ margin: "0 auto 12px" }} />
          <p style={{ fontWeight: 700, marginBottom: 4 }}>No conversations yet</p>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Start a chat by visiting a worker&apos;s profile</p>
          <button onClick={() => router.push("/search")} style={{ marginTop: 12, padding: "10px 20px", background: "var(--accent)", color: "#0A0A0F", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "var(--font-body)" }}>Find Workers</button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {rooms.map((room: any) => (
            <div key={room.id} onClick={() => router.push(`/chat/${room.id}`)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 12px", cursor: "pointer", borderRadius: "var(--radius-sm)", background: "var(--bg-card)", marginBottom: 8, border: "1px solid var(--border)" }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "var(--accent)", fontWeight: 700, flexShrink: 0 }}>{room.otherProfile?.name?.[0] || "?"}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{room.otherProfile?.name || "User"}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{timeAgo(room.last_message_at)}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{room.last_message || "Start a conversation"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
