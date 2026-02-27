"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase, getChatMessages, sendMessage, subscribeToChatMessages, getProfile } from "@/lib/supabase";

export default function ChatPage() {
  const router = useRouter(); const { id: roomId } = useParams();
  const [messages, setMessages] = useState<any[]>([]); const [input, setInput] = useState("");
  const [userId, setUserId] = useState(""); const [userName, setUserName] = useState(""); const [otherName, setOtherName] = useState("Chat");
  const messagesEnd = useRef<HTMLDivElement>(null);

  useEffect(() => { (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { router.push("/login"); return; }
    setUserId(session.user.id); const profile = await getProfile(session.user.id); setUserName(profile?.name || "Me");
    setMessages(await getChatMessages(roomId as string));
    const { data: room } = await supabase.from("chat_rooms").select("*").eq("id", roomId).single();
    if (room) { const otherId = room.participant_1 === session.user.id ? room.participant_2 : room.participant_1; const op = await getProfile(otherId); setOtherName(op?.name || "User"); }
  })(); }, [roomId, router]);

  useEffect(() => { const ch = subscribeToChatMessages(roomId as string, (msg: any) => setMessages(p => [...p, msg])); return () => { supabase.removeChannel(ch); }; }, [roomId]);
  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  const handleSend = async () => { if (!input.trim()) return; await sendMessage(roomId as string, userId, userName, input.trim()); setInput(""); };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0A0A0F" }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 10, background: "#12121A" }}>
        <button onClick={() => router.push("/messages")} style={{ background: "none", border: "none", cursor: "pointer", color: "#F0F0F5", fontSize: 18 }}>←</button>
        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,212,170,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00D4AA", fontWeight: 700, fontSize: 14 }}>{otherName[0]}</div>
        <div><div style={{ fontWeight: 700, fontSize: 14, color: "#F0F0F5" }}>{otherName}</div><div style={{ fontSize: 10, color: "#00D4AA" }}>Online</div></div>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 6 }}>
        {messages.map((m: any) => <div key={m.id} style={{ display: "flex", justifyContent: m.sender_id === userId ? "flex-end" : "flex-start" }}><div style={{ maxWidth: "75%", padding: "8px 12px", borderRadius: 14, fontSize: 14, lineHeight: 1.5, background: m.sender_id === userId ? "#00D4AA" : "#1A1A26", color: m.sender_id === userId ? "#0A0A0F" : "#F0F0F5" }}>{m.content}</div></div>)}
        <div ref={messagesEnd} />
      </div>
      <div style={{ padding: "8px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 8, background: "#12121A" }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="Type a message..." style={{ flex: 1, padding: "10px 14px", background: "#0A0A0F", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, color: "#F0F0F5", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
        <button onClick={handleSend} style={{ padding: "10px 14px", background: "#00D4AA", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14 }}>➤</button>
      </div>
    </div>
  );
}
