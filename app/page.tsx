export const dynamic = "force-dynamic";
"use client";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const router = useRouter();
  const features = [
    { icon: "🛡️", title: "Police Verified", desc: "Every worker with a green badge has passed a police background clearance check." },
    { icon: "💰", title: "Escrow Payments", desc: "Money held securely until job is done. Only 1% fee — 99% goes to worker." },
    { icon: "📱", title: "QR Safety Scan", desc: "Scan worker QR code in person to verify identity and safety profile." },
    { icon: "⭐", title: "Dual Ratings", desc: "Both workers and customers rate each other after every job." },
    { icon: "🤖", title: "AI Assistant", desc: "Built-in chatbot helps find pros, get estimates, and manage bookings." },
    { icon: "🎙️", title: "Voice Commands", desc: "Search hands-free. Just say what you need and Datore finds it." },
  ];
  const cats = [
    { icon: "🏠", name: "Home Services", n: 248 }, { icon: "💻", name: "Tech & IT", n: 186 },
    { icon: "📚", name: "Education", n: 312 }, { icon: "💪", name: "Health", n: 145 },
    { icon: "💇", name: "Beauty", n: 198 }, { icon: "🚗", name: "Auto", n: 87 },
    { icon: "🎉", name: "Events", n: 156 }, { icon: "🔧", name: "Trades", n: 198 },
  ];
  const B = (p: any) => <button onClick={p.onClick} style={{ padding: p.big ? "16px 32px" : "8px 16px", background: p.primary ? "var(--accent)" : p.outline ? "var(--bg-elevated)" : "none", color: p.primary ? "#0A0A0F" : "var(--text-primary)", border: p.outline ? "1px solid var(--border)" : "none", borderRadius: "var(--radius-sm)", fontSize: p.big ? 16 : 14, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>{p.children}</button>;

  return (
    <div className="animate-fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 26 }}>Datore</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}><B onClick={() => router.push("/login")}>Log In</B><B primary onClick={() => router.push("/login")}>Sign Up</B></div>
      </div>
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "60px 20px", position: "relative" }}>
        <div style={{ position: "absolute", top: "-50%", left: "-50%", width: "200%", height: "200%", background: "radial-gradient(circle at 50% 50%, rgba(0,212,170,0.06) 0%, transparent 50%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: 20, background: "var(--accent-dim)", color: "var(--accent)", fontSize: 13, fontWeight: 700, marginBottom: 24 }}>Trusted by 10,000+ users across India</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 8vw, 64px)", lineHeight: 1.05, marginBottom: 20 }}>Find <span style={{ color: "var(--accent)" }}>Trusted</span> Experts<br />for Any Job</h1>
          <p style={{ fontSize: 17, color: "var(--text-secondary)", maxWidth: 420, margin: "0 auto 32px", lineHeight: 1.6 }}>The safe, reliable marketplace connecting you with police-verified professionals at affordable rates.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}><B big primary onClick={() => router.push("/home")}>Hire a Professional</B><B big outline onClick={() => router.push("/login")}>Post Your Skills</B></div>
        </div>
      </div>
      <div style={{ padding: "60px 20px", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, textAlign: "center", marginBottom: 40 }}>Built on <span style={{ color: "var(--accent)" }}>Trust</span> & Safety</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {features.map((f, i) => <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 28, textAlign: "center" }}><div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div><h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3><p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</p></div>)}
        </div>
      </div>
      <div style={{ padding: "40px 20px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, textAlign: "center", marginBottom: 32 }}>12+ Skill Categories</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          {cats.map((c, i) => <div key={i} onClick={() => router.push("/search")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "20px 12px", borderRadius: "var(--radius)", cursor: "pointer", border: "1px solid var(--border)", background: "var(--bg-card)", textAlign: "center" }}><span style={{ fontSize: 32 }}>{c.icon}</span><span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span><span style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.n} pros</span></div>)}
        </div>
      </div>
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: 40, background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--accent-border)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 12 }}>Ready to get started?</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Join thousands on Datore today.</p>
          <B big primary onClick={() => router.push("/login")}>Join Datore Free</B>
        </div>
      </div>
      <div style={{ padding: "24px 20px", borderTop: "1px solid var(--border)", textAlign: "center" }}><p style={{ color: "var(--text-muted)", fontSize: 13 }}>© 2026 Datore by AARNAIT AI. All rights reserved.</p></div>
    </div>
  );
}
