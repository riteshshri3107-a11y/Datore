export const dynamic = "force-dynamic";
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpWithEmail, signInWithEmail, signInWithGoogle, supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("both");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (tab === "register") {
        const { data, error: err } = await signUpWithEmail(email, password, { full_name: name });
        if (err) throw err;
        if (data.user) {
          await supabase.from("profiles").update({ name, role }).eq("id", data.user.id);
          if (role === "seller" || role === "both") await supabase.from("workers").upsert({ id: data.user.id, available: true });
        }
        setSuccess("Account created! Check email for verification.");
      } else {
        const { error: err } = await signInWithEmail(email, password);
        if (err) throw err;
        router.push("/home");
      }
    } catch (err: any) { setError(err.message || "Something went wrong"); }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => { setError(""); const { error: err } = await signInWithGoogle(); if (err) setError(err.message); };

  const inp = { width: "100%", padding: "14px 16px", background: "var(--bg-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", color: "var(--text-primary)", fontSize: 15, fontFamily: "var(--font-body)", outline: "none", marginBottom: 12 } as const;
  const tabStyle = (a: boolean) => ({ flex: 1, padding: 10, borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "var(--font-body)", background: a ? "var(--accent)" : "transparent", color: a ? "#0A0A0F" : "var(--text-muted)" } as const);
  const chip = (a: boolean) => ({ flex: 1, padding: "8px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, border: "1px solid", borderColor: a ? "var(--accent-border)" : "var(--border)", background: a ? "var(--accent-dim)" : "var(--bg-secondary)", color: a ? "var(--accent)" : "var(--text-secondary)", cursor: "pointer", fontFamily: "var(--font-body)" } as const);

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 100px", minHeight: "100vh" }} className="animate-fade-up">
      <div style={{ textAlign: "center", marginBottom: 32, paddingTop: 40 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚡</div>
          <span style={{ fontFamily: "var(--font-display)", fontSize: 30 }}>Datore</span>
        </div>
        <p style={{ color: "var(--text-secondary)" }}>{tab === "login" ? "Welcome back!" : "Create your account"}</p>
      </div>
      <div style={{ display: "flex", gap: 4, background: "var(--bg-secondary)", borderRadius: "var(--radius)", padding: 4, marginBottom: 24 }}>
        <button onClick={() => { setTab("login"); setError(""); }} style={tabStyle(tab === "login")}>Log In</button>
        <button onClick={() => { setTab("register"); setError(""); }} style={tabStyle(tab === "register")}>Sign Up</button>
      </div>
      {tab === "register" && <>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" style={inp} />
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>I want to...</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[["buyer","Hire"],["seller","Offer Skills"],["both","Both"]].map(([v,l]) => <button key={v} onClick={() => setRole(v)} style={chip(role===v)}>{l}</button>)}
          </div>
        </div>
      </>}
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" style={inp} />
      <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (min 6 chars)" type="password" style={inp} />
      {error && <p style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12, padding: "8px 12px", background: "rgba(255,77,106,0.08)", borderRadius: 8 }}>{error}</p>}
      {success && <p style={{ color: "var(--accent)", fontSize: 13, marginBottom: 12, padding: "8px 12px", background: "var(--accent-dim)", borderRadius: 8 }}>{success}</p>}
      <button onClick={handleSubmit} disabled={loading || !email || !password} style={{ width: "100%", padding: 14, background: "var(--accent)", color: "#0A0A0F", border: "none", borderRadius: "var(--radius-sm)", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", opacity: loading ? 0.6 : 1 }}>{loading ? "Please wait..." : tab === "login" ? "Log In" : "Create Account"}</button>
      <div style={{ height: 1, background: "var(--border)", margin: "20px 0" }} />
      <button onClick={handleGoogle} style={{ width: "100%", padding: 14, background: "var(--bg-elevated)", color: "var(--text-primary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>🔵 Sign in with Google</button>
      <div style={{ textAlign: "center", marginTop: 20 }}><button onClick={() => router.push("/")} style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)" }}>← Back to home</button></div>
    </div>
  );
}
