"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const [dark, setDark] = useState(true);
  const t = dark ? { bg: "#0A0A0F", card: "#1A1A26", accent: "#00D4AA", text: "#F0F0F5", muted: "#9090A8", dimMuted: "#606078", border: "rgba(255,255,255,0.06)", accentDim: "rgba(0,212,170,0.08)" } : { bg: "#F5F6FA", card: "#FFFFFF", accent: "#00B894", text: "#1A1A2E", muted: "#5A5A7A", dimMuted: "#8A8AA8", border: "rgba(0,0,0,0.08)", accentDim: "rgba(0,184,148,0.06)" };

  const features = [
    { icon: "🛡️", title: "Police Verified", desc: "Every worker with a green badge has passed police background clearance." },
    { icon: "💰", title: "Escrow Payments", desc: "Money held securely until job is done. Only 1% fee — 99% goes to worker." },
    { icon: "📱", title: "QR Safety Scan", desc: "Scan worker QR code in person to verify identity and safety profile." },
    { icon: "🏪", title: "Social Marketplace", desc: "Buy, sell, and trade locally — from vehicles to electronics, all in one place." },
    { icon: "👥", title: "Communities", desc: "Join skill groups, local communities, and professional networks." },
    { icon: "🤖", title: "AI Assistant", desc: "Built-in chatbot helps find pros, get estimates, and manage bookings." },
  ];
  const cats = [ { icon: "🏠", name: "Home Services" }, { icon: "💻", name: "Tech & IT" }, { icon: "📚", name: "Education" }, { icon: "💪", name: "Health" }, { icon: "💇", name: "Beauty" }, { icon: "🚗", name: "Auto" }, { icon: "🎉", name: "Events" }, { icon: "🔧", name: "Trades" } ];
  const B = (p: any) => <button onClick={p.onClick} style={{ padding: p.big ? "16px 32px" : "8px 16px", background: p.primary ? t.accent : "none", color: p.primary ? "#0A0A0F" : t.text, border: p.outline ? `1px solid ${t.border}` : "none", borderRadius: 10, fontSize: p.big ? 16 : 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{p.children}</button>;

  return (
    <div style={{ background: t.bg, color: t.text, transition: "all .3s" }} className="anim-fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}><div style={{ width: 36, height: 36, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div><span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26 }}>Datore</span></div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => setDark(!dark)} style={{ width: 36, height: 36, borderRadius: "50%", background: t.card, border: `1px solid ${t.border}`, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{dark ? "☀️" : "🌙"}</button>
          <B onClick={() => router.push("/login")}>Log In</B>
          <B primary onClick={() => router.push("/login")}>Sign Up</B>
        </div>
      </div>
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "60px 20px", position: "relative" }}>
        <div style={{ position: "absolute", top: "-50%", left: "-50%", width: "200%", height: "200%", background: `radial-gradient(circle at 50% 50%, ${t.accentDim} 0%, transparent 50%)`, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: 20, background: t.accentDim, color: t.accent, fontSize: 13, fontWeight: 700, marginBottom: 24 }}>🚀 Skills + Social + Marketplace — All in One</div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: "clamp(36px, 8vw, 64px)", lineHeight: 1.05, marginBottom: 20 }}>Find <span style={{ color: t.accent }}>Trusted</span> Experts<br />Buy · Sell · Connect</h1>
          <p style={{ fontSize: 17, color: t.muted, maxWidth: 460, margin: "0 auto 32px", lineHeight: 1.6 }}>The safe, social marketplace connecting you with police-verified professionals, local deals, and vibrant communities.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}><B big primary onClick={() => router.push("/home")}>Explore Datore</B><B big outline onClick={() => router.push("/login")}>Join Free</B></div>
        </div>
      </div>
      <div style={{ padding: "60px 20px", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, textAlign: "center", marginBottom: 40 }}>Everything You Need, <span style={{ color: t.accent }}>One Platform</span></h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {features.map((f, i) => <div key={i} style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, padding: 28, textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div><h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3><p style={{ fontSize: 14, color: t.muted, lineHeight: 1.6 }}>{f.desc}</p></div>)}
        </div>
      </div>
      <div style={{ padding: "40px 20px 80px", maxWidth: 1200, margin: "0 auto", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 32, marginBottom: 32 }}>12+ Skill Categories</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 12, maxWidth: 600, margin: "0 auto" }}>
          {cats.map((c, i) => <div key={i} style={{ padding: "16px 8px", borderRadius: 14, cursor: "pointer", border: `1px solid ${t.border}`, background: t.card, textAlign: "center" }}><span style={{ fontSize: 28 }}>{c.icon}</span><div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{c.name}</div></div>)}
        </div>
      </div>
      <div style={{ padding: "24px 20px", borderTop: `1px solid ${t.border}`, textAlign: "center" }}><p style={{ color: t.dimMuted, fontSize: 13 }}>© 2026 Datore by AARNAIT AI. All rights reserved.</p></div>
    </div>
  );
}
