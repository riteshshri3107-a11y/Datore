"use client";
import { useState } from "react";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";

export default function ChatBot() {
  const { isDark } = useThemeStore();
  const t = getTheme(isDark);
  const [show, setShow] = useState(false);
  const [msgs, setMsgs] = useState([{ from: "bot", text: "Hello! I'm Datore AI. How can I help?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim(); setMsgs(p => [...p, { from: "user", text: msg }]); setInput(""); setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: msg }) });
      const data = await res.json(); setMsgs(p => [...p, { from: "bot", text: data.reply }]);
    } catch { setMsgs(p => [...p, { from: "bot", text: "Sorry, something went wrong." }]); }
    finally { setLoading(false); }
  };

  return <>
    <button onClick={() => setShow(!show)} className="anim-glow" style={{ position: "fixed", bottom: 76, right: 16, width: 52, height: 52, borderRadius: "50%", background: t.accent, color: "#0A0A0F", border: "none", cursor: "pointer", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: `0 4px 20px ${t.accentGlow}` }}>{show ? "✕" : "🤖"}</button>
    {show && <div className="anim-slide" style={{ position: "fixed", bottom: 136, right: 16, width: "calc(100% - 32px)", maxWidth: 360, height: 400, background: t.bgSecondary, borderRadius: 16, border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", zIndex: 95, boxShadow: "0 12px 48px rgba(0,0,0,0.4)" }}>
      <div style={{ padding: "10px 14px", borderBottom: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 28, height: 28, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div><div><div style={{ fontWeight: 700, fontSize: 13 }}>Datore AI</div><div style={{ fontSize: 10, color: t.accent }}>Online</div></div></div>
      <div style={{ flex: 1, overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 6 }}>
        {msgs.map((m, i) => <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}><div style={{ maxWidth: "80%", padding: "8px 12px", borderRadius: 14, fontSize: 13, lineHeight: 1.5, background: m.from === "user" ? t.accent : t.bgElevated, color: m.from === "user" ? "#0A0A0F" : t.text }}>{m.text}</div></div>)}
      </div>
      <div style={{ padding: "8px 10px", borderTop: `1px solid ${t.border}`, display: "flex", gap: 6 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask anything..." style={{ flex: 1, padding: "8px 12px", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 13, fontFamily: "inherit", outline: "none" }} />
        <button onClick={send} style={{ padding: "8px 10px", background: t.accent, border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14 }}>➤</button>
      </div>
    </div>}
  </>;
}
