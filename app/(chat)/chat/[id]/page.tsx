"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase, getChatMessages, sendMessage, subscribeToChatMessages, getProfile } from "@/lib/supabase";

export default function ChatPage() {
  const router = useRouter();
  const { id: roomId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [otherName, setOtherName] = useState("Chat");
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push("/login"); return; }
      setUserId(session.user.id);
      const profile = await getProfile(session.user.id);
      setUserName(profile?.name || "Me");
      setMessages(await getChatMessages(roomId as string));
      const { data: room } = await supabase.from("chat_rooms").select("*").eq("id", roomId).single();
      if (room) {
        const otherId = room.participant_1 === session.user.id ? room.participant_2 : room.participant_1;
        const op = await getProfile(otherId);
        setOtherName(op?.name || "User");
      }
    })();
  }, [roomId, router]);

  useEffect(() => {
    const channel = subscribeToChatMessages(roomId as string, (msg: any) => setMessages(p => [...p, msg]));
    return () => { supabase.removeChannel(channel); };
  }, [roomId]);

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    await sendMessage(roomId as string, userId, userName, input.trim());
    setInput("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "var(--bg-primary)" }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, background: "var(--bg-secondary)" }}>
        <button onClick={() => router.push("/messages")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-primary)", fontSize: 18 }}>←</button>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", fontWeight: 700 }}>{otherName[0]}</div>
        <div><div style={{ fontWeight: 700, fontSize: 15 }}>{otherName}</div><div style={{ fontSize: 11, color: "var(--accent)" }}>Online</div></div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((m: any) => <div key={m.id} style={{ display: "flex", justifyContent: m.sender_id === userId ? "flex-end" : "flex-start" }}>
          <div style={{ maxWidth: "75%", padding: "10px 14px", borderRadius: 16, fontSize: 14, lineHeight: 1.5, background: m.sender_id === userId ? "var(--accent)" : "var(--bg-card)", color: m.sender_id === userId ? "#0A0A0F" : "var(--text-primary)" }}>{m.content}</div>
        </div>)}
        <div ref={messagesEnd} />
      </div>
      <div style={{ padding: "10px 16px", borderTop: "1px solid var(--border)", display: "flex", gap: 8, background: "var(--bg-secondary)" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="Type a message..." style={{ flex: 1, padding: "12px 16px", background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 14, fontFamily: "var(--font-body)", outline: "none" }} />
        <button onClick={handleSend} style={{ padding: "12px 16px", background: "var(--accent)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 16 }}>➤</button>
      </div>
    </div>
  );
}
