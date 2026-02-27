"use client";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showBot, setShowBot] = useState(false);
  const [botMsgs, setBotMsgs] = useState([{ from: "bot", text: "Hello! I'm Datore AI. How can I help?" }]);
  const [botInput, setBotInput] = useState("");
  const [botLoading, setBotLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (!data.session?.user) router.push("/login"); });
  }, [router]);

  const sendBot = async () => {
    if (!botInput.trim() || botLoading) return;
    const msg = botInput.trim();
    setBotMsgs(p => [...p, { from: "user", text: msg }]);
    setBotInput(""); setBotLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: msg }) });
      const data = await res.json();
      setBotMsgs(p => [...p, { from: "bot", text: data.reply }]);
    } catch { setBotMsgs(p => [...p, { from: "bot", text: "Sorry, something went wrong." }]); }
    finally { setBotLoading(false); }
  };

  const nav = [
    { href: "/home", icon: "🏠", label: "Home" }, { href: "/search", icon: "🔍", label: "Search" },
    { href: "/messages", icon: "💬", label: "Messages" }, { href: "/dashboard", icon: "📊", label: "Dashboard" },
    { href: "/profile", icon: "👤", label: "Profile" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <main style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", paddingBottom: 80 }}>{children}</main>
      <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "rgba(18,18,26,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-around", padding: "8px 0", zIndex: 100 }}>
        {nav.map(n => <button key={n.href} onClick={() => router.push(n.href)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 12px", background: "none", border: "none", cursor: "pointer", color: pathname === n.href ? "var(--accent)" : "var(--text-muted)", fontFamily: "var(--font-body)" }}><span style={{ fontSize: 20 }}>{n.icon}</span><span style={{ fontSize: 10, fontWeight: 600 }}>{n.label}</span></button>)}
      </nav>
      <button onClick={() => setShowBot(!showBot)} className="animate-glow" style={{ position: "fixed", bottom: 80, right: 16, width: 56, height: 56, borderRadius: "50%", background: "var(--accent)", color: "#0A0A0F", border: "none", cursor: "pointer", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 4px 20px rgba(0,212,170,0.3)" }}>{showBot ? "✕" : "🤖"}</button>
      {showBot && <div style={{ position: "fixed", bottom: 144, right: 16, width: "calc(100% - 32px)", maxWidth: 380, height: 420, background: "var(--bg-secondary)", borderRadius: "var(--radius)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", zIndex: 95, boxShadow: "0 12px 48px rgba(0,0,0,0.5)" }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
          <div><div style={{ fontWeight: 700, fontSize: 14 }}>Datore AI</div><div style={{ fontSize: 11, color: "var(--accent)" }}>Online</div></div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {botMsgs.map((m, i) => <div key={i} style={{ display: "flex", justifyContent: m.from === "user" ? "flex-end" : "flex-start" }}><div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: 16, fontSize: 13, lineHeight: 1.5, background: m.from === "user" ? "var(--accent)" : "var(--bg-elevated)", color: m.from === "user" ? "#0A0A0F" : "var(--text-primary)" }}>{m.text}</div></div>)}
        </div>
        <div style={{ padding: "10px 12px", borderTop: "1px solid var(--border)", display: "flex", gap: 8 }}>
          <input value={botInput} onChange={e => setBotInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendBot()} placeholder="Ask anything..." style={{ flex: 1, padding: "10px 14px", background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 13, fontFamily: "var(--font-body)", outline: "none" }} />
          <button onClick={sendBot} style={{ padding: "10px 12px", background: "var(--accent)", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontSize: 16 }}>➤</button>
        </div>
      </div>}
    </div>
  );
}
