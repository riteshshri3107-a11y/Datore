"use client";
import { useRouter } from "next/navigation";
import { Shield, Wallet, QrCode, Star, Bot, Mic } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const features = [
    { icon: <Shield size={28} />, title: "Police Verified", desc: "Every worker with a green badge has passed a police background clearance check, verified by local authorities." },
    { icon: <Wallet size={28} />, title: "Escrow Payments", desc: "Your money is held securely until the job is completed. Only 1% service fee — 99% goes directly to the worker." },
    { icon: <QrCode size={28} />, title: "QR Safety Scan", desc: "Scan your worker's QR code in person to instantly verify their identity, rating, and safety profile." },
    { icon: <Star size={28} />, title: "Dual Ratings", desc: "Both workers and customers rate each other after every job, building a transparent trust ecosystem." },
    { icon: <Bot size={28} />, title: "AI Assistant", desc: "Our built-in chatbot helps you find the right professional, get price estimates, and manage bookings." },
    { icon: <Mic size={28} />, title: "Voice Commands", desc: "Search hands-free with voice commands. Just say what you need and Datore finds it." },
  ];
  const categories = [
    { icon: "🏠", name: "Home Services", count: 248 }, { icon: "💻", name: "Tech & IT", count: 186 },
    { icon: "📚", name: "Education", count: 312 }, { icon: "💪", name: "Health", count: 145 },
    { icon: "💇", name: "Beauty", count: 198 }, { icon: "🚗", name: "Auto", count: 87 },
    { icon: "🎉", name: "Events", count: 156 }, { icon: "🔧", name: "Trades", count: 198 },
  ];

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 26 }}>Datore</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => router.push("/login")} style={{ padding: "8px 16px", background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600 }}>Log In</button>
          <button onClick={() => router.push("/login")} style={{ padding: "8px 16px", background: "var(--accent)", color: "#0A0A0F", border: "none", borderRadius: "var(--radius-sm)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600 }}>Sign Up</button>
        </div>
      </div>

      {/* Hero */}
      <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "60px 20px", position: "relative" }}>
        <div style={{ position: "absolute", top: "-50%", left: "-50%", width: "200%", height: "200%", background: "radial-gradient(circle at 50% 50%, rgba(0,212,170,0.06) 0%, transparent 50%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: 20, background: "var(--accent-dim)", color: "var(--accent)", fontSize: 13, fontWeight: 700, marginBottom: 24 }}>
            Trusted by 10,000+ users across India
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(36px, 8vw, 64px)", lineHeight: 1.05, marginBottom: 20 }}>
            Find <span style={{ color: "var(--accent)" }}>Trusted</span> Experts<br />for Any Job
          </h1>
          <p style={{ fontSize: 17, color: "var(--text-secondary)", maxWidth: 420, margin: "0 auto 32px", lineHeight: 1.6 }}>
            The safe, reliable marketplace connecting you with police-verified professionals at affordable rates. Every skill matters.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => router.push("/home")} style={{ padding: "16px 32px", background: "var(--accent)", color: "#0A0A0F", border: "none", borderRadius: "var(--radius-sm)", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>Hire a Professional</button>
            <button onClick={() => router.push("/login")} style={{ padding: "16px 32px", background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>Post Your Skills</button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "60px 20px", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, textAlign: "center", marginBottom: 40 }}>Built on <span style={{ color: "var(--accent)" }}>Trust</span> & Safety</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 28, textAlign: "center", transition: "all 0.25s" }}>
              <div style={{ marginBottom: 16, color: "var(--accent)" }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div style={{ padding: "40px 20px 60px", maxWidth: 1200, margin: "0 auto" }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 32, textAlign: "center", marginBottom: 12 }}>12+ Skill Categories</h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", marginBottom: 32 }}>From home repairs to creative work — find anyone for anything</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 12 }}>
          {categories.map((c, i) => (
            <div key={i} onClick={() => router.push("/search")} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "20px 12px", borderRadius: "var(--radius)", cursor: "pointer", border: "1px solid var(--border)", background: "var(--bg-card)", textAlign: "center", transition: "all 0.25s" }}>
              <span style={{ fontSize: 32 }}>{c.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</span>
              <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{c.count} pros</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "60px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", padding: 40, background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--accent-border)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 28, marginBottom: 12 }}>Ready to get started?</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Join thousands on Datore — whether you need help or want to offer your skills.</p>
          <button onClick={() => router.push("/login")} style={{ padding: "14px 32px", background: "var(--accent)", color: "#0A0A0F", border: "none", borderRadius: "var(--radius-sm)", fontSize: 16, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>Join Datore Free</button>
        </div>
      </div>

      <div style={{ padding: "24px 20px", borderTop: "1px solid var(--border)", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: 13 }}>© 2026 Datore by AARNAIT AI. All rights reserved.</p>
      </div>
    </div>
  );
}
