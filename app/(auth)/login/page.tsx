"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpWithEmail, signInWithEmail, signInWithGoogle, supabase } from "@/lib/supabase";
import { getTheme } from "@/lib/theme";

export default function LoginPage() {
  const router = useRouter();
  const [dark, setDark] = useState(true); const t = getTheme(dark);
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [name, setName] = useState(""); const [role, setRole] = useState("both");
  const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (tab === "register") {
        const { data, error: err } = await signUpWithEmail(email, password, { full_name: name });
        if (err) throw err;
        if (data.user) { await supabase.from("profiles").update({ name, role }).eq("id", data.user.id); if (role === "seller" || role === "both") await supabase.from("workers").upsert({ id: data.user.id, available: true }); }
        setSuccess("Account created! Check email for verification.");
      } else {
        const { error: err } = await signInWithEmail(email, password);
        if (err) throw err; router.push("/home");
      }
    } catch (err: any) { setError(err.message || "Something went wrong"); } finally { setLoading(false); }
  };

  const inp = { width: "100%", padding: "14px 16px", background: t.bgSecondary, border: `1px solid ${t.border}`, borderRadius: 10, color: t.text, fontSize: 15, fontFamily: "inherit", outline: "none", marginBottom: 12 } as const;
  const tabStyle = (a: boolean) => ({ flex: 1, padding: 10, borderRadius: 10, fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", background: a ? t.accent : "transparent", color: a ? "#0A0A0F" : t.textMuted } as const);
  const chip = (a: boolean) => ({ flex: 1, padding: "8px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: `1px solid ${a ? t.accentBorder : t.border}`, background: a ? t.accentDim : t.bgSecondary, color: a ? t.accent : t.textSecondary, cursor: "pointer", fontFamily: "inherit" } as const);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 100px", minHeight: "100vh", background: t.bg, color: t.text }} className="anim-fade">
      <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 10 }}><button onClick={() => setDark(!dark)} style={{ width: 36, height: 36, borderRadius: "50%", background: t.bgCard, border: `1px solid ${t.border}`, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>{dark ? "☀️" : "🌙"}</button></div>
      <div style={{ textAlign: "center", marginBottom: 32, paddingTop: 20 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}><div style={{ width: 44, height: 44, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚡</div><span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 30 }}>Datore</span></div>
        <p style={{ color: t.textSecondary }}>{tab === "login" ? "Welcome back!" : "Create your account"}</p>
      </div>
      <div style={{ display: "flex", gap: 4, background: t.bgSecondary, borderRadius: 14, padding: 4, marginBottom: 24 }}>
        <button onClick={() => { setTab("login"); setError(""); }} style={tabStyle(tab === "login")}>Log In</button>
        <button onClick={() => { setTab("register"); setError(""); }} style={tabStyle(tab === "register")}>Sign Up</button>
      </div>
      {tab === "register" && <><input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" style={inp} /><div style={{ marginBottom: 12 }}><label style={{ fontSize: 13, color: t.textSecondary, marginBottom: 6, display: "block" }}>I want to...</label><div style={{ display: "flex", gap: 8 }}>{[["buyer","Hire"],["seller","Offer Skills"],["both","Both"]].map(([v,l]) => <button key={v} onClick={() => setRole(v)} style={chip(role===v)}>{l}</button>)}</div></div></>}
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" style={inp} />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6 chars)" type="password" style={inp} />
      {error && <p style={{ color: t.danger, fontSize: 13, marginBottom: 12, padding: "8px 12px", background: "rgba(255,77,106,0.08)", borderRadius: 8 }}>{error}</p>}
      {success && <p style={{ color: t.accent, fontSize: 13, marginBottom: 12, padding: "8px 12px", background: t.accentDim, borderRadius: 8 }}>{success}</p>}
      <button onClick={handleSubmit} disabled={loading || !email || !password} style={{ width: "100%", padding: 14, background: t.accent, color: "#0A0A0F", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", opacity: loading ? 0.6 : 1 }}>{loading ? "Please wait..." : tab === "login" ? "Log In" : "Create Account"}</button>
      <div style={{ height: 1, background: t.border, margin: "20px 0" }} />
      <button onClick={() => { setError(""); signInWithGoogle(); }} style={{ width: "100%", padding: 14, background: t.bgElevated, color: t.text, border: `1px solid ${t.border}`, borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>🔵 Sign in with Google</button>
      <div style={{ textAlign: "center", marginTop: 20 }}><button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: t.textMuted, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← Back to home</button></div>
    </div>
  );
}
