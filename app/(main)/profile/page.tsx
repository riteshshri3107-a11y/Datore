export const dynamic = "force-dynamic";
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, getProfile, updateProfile, signOut, getWorker, createWorkerProfile } from "@/lib/supabase";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.push("/login"); return; }
      const [p, w] = await Promise.all([getProfile(session.user.id), getWorker(session.user.id).catch(() => null)]);
      setProfile(p);
      setForm({ name: p?.name || "", bio: p?.bio || "", city: p?.city || "", phone: p?.phone || "", hourly_rate: w?.hourly_rate || 200, skills: (w?.skills || []).map((s: any) => typeof s === "string" ? s : s.name).join(", ") });
      setLoading(false);
    })();
  }, [router]);

  const handleSave = async () => {
    if (!profile) return; setSaving(true);
    await updateProfile(profile.id, { name: form.name, bio: form.bio, city: form.city, phone: form.phone });
    if (profile.role === "seller" || profile.role === "both") {
      const skills = form.skills.split(",").map((s: string) => s.trim()).filter(Boolean).map((s: string) => ({ name: s }));
      await createWorkerProfile(profile.id, { hourly_rate: +form.hourly_rate || 200, skills });
    }
    setProfile((p: any) => ({ ...p, ...form })); setEditing(false); setSaving(false);
  };

  const inp = { width: "100%", padding: "10px 14px", background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", marginBottom: 10 } as const;

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}><p style={{ color: "var(--text-muted)" }}>Loading...</p></div>;

  return (
    <div style={{ padding: "16px 16px 40px" }} className="animate-fade-up">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26 }}>Profile</h1>
        <button onClick={() => editing ? handleSave() : setEditing(true)} style={{ padding: "8px 16px", background: editing ? "var(--accent)" : "var(--bg-card)", color: editing ? "#0A0A0F" : "var(--text-secondary)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600 }}>{editing ? (saving ? "Saving..." : "💾 Save") : "✏️ Edit"}</button>
      </div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 12px", color: "var(--accent)", fontWeight: 700, border: "3px solid var(--accent)" }}>{profile?.name?.[0] || "?"}</div>
        {editing ? <input value={form.name} onChange={e => setForm((f: any) => ({...f, name: e.target.value}))} style={{...inp, textAlign: "center" as const, maxWidth: 280, margin: "0 auto"}} /> : <h2 style={{ fontSize: 22, fontWeight: 700 }}>{profile?.name}</h2>}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 4 }}>
          {profile?.verified && <span style={{ fontSize: 12, color: "var(--accent)", padding: "4px 10px", background: "var(--accent-dim)", borderRadius: 12 }}>🛡️ Verified</span>}
          <span style={{ fontSize: 12, color: "var(--text-muted)", padding: "4px 10px", background: "var(--bg-card)", borderRadius: 12 }}>{profile?.role}</span>
        </div>
      </div>
      {editing ? <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
        <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Bio</label>
        <textarea value={form.bio} onChange={e => setForm((f: any) => ({...f, bio: e.target.value}))} rows={3} style={{...inp, resize: "vertical" as const}} />
        <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>City</label>
        <input value={form.city} onChange={e => setForm((f: any) => ({...f, city: e.target.value}))} style={inp} placeholder="e.g. Raipur" />
        <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Phone</label>
        <input value={form.phone} onChange={e => setForm((f: any) => ({...f, phone: e.target.value}))} style={inp} placeholder="+91..." />
        {(profile?.role === "seller" || profile?.role === "both") && <>
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Hourly Rate (₹)</label>
          <input type="number" value={form.hourly_rate} onChange={e => setForm((f: any) => ({...f, hourly_rate: e.target.value}))} style={inp} />
          <label style={{ fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 4 }}>Skills (comma separated)</label>
          <input value={form.skills} onChange={e => setForm((f: any) => ({...f, skills: e.target.value}))} style={inp} placeholder="Plumbing, Electrical" />
        </>}
      </div> : <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16 }}>
        {profile?.bio && <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>{profile.bio}</p>}
        {[["Email", profile?.email], ["City", profile?.city], ["Phone", profile?.phone], ["Since", profile?.member_since]].filter(([,v]) => v).map(([l,v]) => <div key={l as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)" }}><span style={{ color: "var(--text-muted)", fontSize: 13 }}>{l}</span><span style={{ fontSize: 13 }}>{v}</span></div>)}
      </div>}
      <button onClick={async () => { await signOut(); router.push("/"); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", cursor: "pointer", width: "100%", fontFamily: "var(--font-body)", color: "var(--danger)", marginTop: 16 }}>🚪 <span style={{ fontSize: 14, fontWeight: 600 }}>Log Out</span></button>
    </div>
  );
}
