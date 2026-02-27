"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, getProfile, updateProfile, signOut, getWorker, createWorkerProfile } from "@/lib/supabase";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";

export default function ProfilePage() {
  const router = useRouter(); const { isDark } = useThemeStore(); const t = getTheme(isDark);
  const [profile, setProfile] = useState<any>(null); const [editing, setEditing] = useState(false);
  const [aboutTab, setAboutTab] = useState("intro");
  const [form, setForm] = useState<any>({}); const [saving, setSaving] = useState(false); const [loading, setLoading] = useState(true);

  useEffect(() => { (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { router.push("/login"); return; }
    const [p, w] = await Promise.all([getProfile(session.user.id), getWorker(session.user.id).catch(() => null)]);
    setProfile(p);
    setForm({ name: p?.name || "", bio: p?.bio || "", city: p?.city || "", phone: p?.phone || "", work: p?.work || "", education: p?.education || "", hobbies: p?.hobbies || "", interests: p?.interests || "", travel: p?.travel || "", links: p?.links || "", hourly_rate: w?.hourly_rate || 200, skills: (w?.skills || []).map((s: any) => typeof s === "string" ? s : s.name).join(", ") });
    setLoading(false);
  })(); }, [router]);

  const handleSave = async () => {
    if (!profile) return; setSaving(true);
    await updateProfile(profile.id, { name: form.name, bio: form.bio, city: form.city, phone: form.phone, work: form.work, education: form.education, hobbies: form.hobbies, interests: form.interests, travel: form.travel, links: form.links });
    if (profile.role === "seller" || profile.role === "both") { const skills = form.skills.split(",").map((s: string) => s.trim()).filter(Boolean).map((s: string) => ({ name: s })); await createWorkerProfile(profile.id, { hourly_rate: +form.hourly_rate || 200, skills }); }
    setProfile((p: any) => ({ ...p, ...form })); setEditing(false); setSaving(false);
  };

  const inp = { width: "100%", padding: "10px 14px", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 10 } as const;
  const aboutTabs = [
    { id: "intro", label: "Intro" }, { id: "work", label: "Work" }, { id: "education", label: "Education" },
    { id: "hobbies", label: "Hobbies" }, { id: "interests", label: "Interests" }, { id: "travel", label: "Travel" },
    { id: "links", label: "Links" }, { id: "contact", label: "Contact" },
  ];

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}><p style={{ color: t.textMuted }}>Loading...</p></div>;

  return (
    <div style={{ padding: "16px 16px 40px" }} className="anim-fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26 }}>Profile</h1>
        <button onClick={() => editing ? handleSave() : setEditing(true)} style={{ padding: "8px 14px", background: editing ? t.accent : t.bgCard, color: editing ? "#0A0A0F" : t.textSecondary, border: `1px solid ${t.border}`, borderRadius: 10, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: 600 }}>{editing ? (saving ? "Saving..." : "💾 Save") : "✏️ Edit"}</button>
      </div>

      {/* Profile Header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: t.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 10px", color: t.accent, fontWeight: 700, border: `3px solid ${t.accent}` }}>{profile?.name?.[0] || "?"}</div>
        {editing ? <input value={form.name} onChange={e => setForm((f: any) => ({...f, name: e.target.value}))} style={{...inp, textAlign: "center" as const, maxWidth: 280, margin: "0 auto"}} /> : <h2 style={{ fontSize: 20, fontWeight: 700 }}>{profile?.name}</h2>}
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 6 }}>{profile?.verified && <span style={{ fontSize: 11, color: t.accent, padding: "3px 8px", background: t.accentDim, borderRadius: 10 }}>🛡️ Verified</span>}<span style={{ fontSize: 11, color: t.textMuted, padding: "3px 8px", background: t.bgCard, borderRadius: 10, border: `1px solid ${t.border}` }}>{profile?.role}</span></div>
      </div>

      {/* About Section */}
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>About</h3>
        <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 6, marginBottom: 12 }}>
          {aboutTabs.map(tab => <button key={tab.id} onClick={() => setAboutTab(tab.id)} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${aboutTab === tab.id ? t.accentBorder : t.border}`, background: aboutTab === tab.id ? t.accentDim : t.bgCard, color: aboutTab === tab.id ? t.accent : t.textSecondary, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit" }}>{tab.label}</button>)}
        </div>
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16 }}>
          {aboutTab === "intro" && (editing ? <>
            <label style={{ fontSize: 12, color: t.textMuted, display: "block", marginBottom: 4 }}>Bio</label>
            <textarea value={form.bio} onChange={e => setForm((f: any) => ({...f, bio: e.target.value}))} rows={3} style={{...inp, resize: "vertical" as const}} placeholder="Tell people about yourself..." />
            <label style={{ fontSize: 12, color: t.textMuted, display: "block", marginBottom: 4 }}>City</label>
            <input value={form.city} onChange={e => setForm((f: any) => ({...f, city: e.target.value}))} style={inp} placeholder="e.g. Raipur" />
          </> : <div>{profile?.bio ? <p style={{ fontSize: 14, color: t.textSecondary, lineHeight: 1.6, marginBottom: 8 }}>{profile.bio}</p> : <p style={{ color: t.textMuted, fontSize: 13 }}>No bio yet — tap Edit to add one</p>}{profile?.city && <p style={{ fontSize: 13, color: t.textSecondary }}>📍 {profile.city}</p>}{profile?.education && <p style={{ fontSize: 13, color: t.textSecondary, marginTop: 4 }}>🎓 {profile.education}</p>}</div>)}
          {aboutTab === "work" && (editing ? <><label style={{ fontSize: 12, color: t.textMuted, display: "block", marginBottom: 4 }}>Work</label><input value={form.work} onChange={e => setForm((f: any) => ({...f, work: e.target.value}))} style={inp} placeholder="Company, role..." /></> : <p style={{ fontSize: 14, color: form.work ? t.textSecondary : t.textMuted }}>{form.work || "No work info added yet"}</p>)}
          {aboutTab === "education" && (editing ? <><label style={{ fontSize: 12, color: t.textMuted, display: "block", marginBottom: 4 }}>Education</label><input value={form.education} onChange={e => setForm((f: any) => ({...f, education: e.target.value}))} style={inp} placeholder="School, degree..." /></> : <p style={{ fontSize: 14, color: form.education ? t.textSecondary : t.textMuted }}>{form.education || "No education info added yet"}</p>)}
          {aboutTab === "hobbies" && (editing ? <><label style={{ fontSize: 12, color: t.textMuted, display: "block", marginBottom: 4 }}>Hobbies</label><input value={form.hobbies} onChange={e => setForm((f: any) => ({...f, hobbies: e.target.value}))} style={inp} placeholder="Reading, painting..." /></> : <p style={{ fontSize: 14, color: form.hobbies ? t.textSecondary : t.textMuted }}>{form.hobbies || "No hobbies added yet"}</p>)}
          {aboutTab === "interests" && (editing ? <><label style={{ fontSize: 12, color: t.textMuted, display: "block", marginBottom: 4 }}>Interests</label><input value={form.interests} onChange={e => setForm((f: any) => ({...f, interests: e.target.value}))} style={inp} placeholder="AI, music, cooking..." /></> : <p style={{ fontSize: 14, color: form.interests ? t.textSecondary : t.textMuted }}>{form.interests || "No interests added yet"}</p>)}
          {aboutTab === "travel" && (editing ? <><label style={{ fontSize: 12, color: t.textMuted, display: "block", marginBottom: 4 }}>Travel</label><input value={form.travel} onChange={e => setForm((f: any) => ({...f, travel: e.target.value}))} style={inp} placeholder="Places visited..." /></> : <p style={{ fontSize: 14, color: form.travel ? t.textSecondary : t.textMuted }}>{form.travel || "No travel info added yet"}</p>)}
          {aboutTab === "links" && (editing ? <><label style={{ fontSize: 12, color: t.textMuted, display: "block", marginBottom: 4 }}>Links</label><input value={form.links} onChange={e => setForm((f: any) => ({...f, links: e.target.value}))} style={inp} placeholder="Portfolio, LinkedIn..." /></> : <p style={{ fontSize: 14, color: form.links ? t.textSecondary : t.textMuted }}>{form.links || "No links added yet"}</p>)}
          {aboutTab === "contact" && <div>{[["Email", profile?.email], ["Phone", profile?.phone || (editing ? "" : "Not set")], ["Since", profile?.member_since]].filter(([,v]) => v).map(([l,v]) => <div key={l as string} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${t.border}` }}><span style={{ color: t.textMuted, fontSize: 13 }}>{l}</span><span style={{ fontSize: 13 }}>{v}</span></div>)}{editing && <><label style={{ fontSize: 12, color: t.textMuted, display: "block", marginTop: 8, marginBottom: 4 }}>Phone</label><input value={form.phone} onChange={e => setForm((f: any) => ({...f, phone: e.target.value}))} style={inp} placeholder="+91..." /></>}</div>}
        </div>
      </div>

      {/* Skills section for workers */}
      {(profile?.role === "seller" || profile?.role === "both") && editing && <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Worker Details</h3>
        <label style={{ fontSize: 12, color: t.textMuted, display: "block", marginBottom: 4 }}>Hourly Rate (₹)</label>
        <input type="number" value={form.hourly_rate} onChange={e => setForm((f: any) => ({...f, hourly_rate: e.target.value}))} style={inp} />
        <label style={{ fontSize: 12, color: t.textMuted, display: "block", marginBottom: 4 }}>Skills (comma separated)</label>
        <input value={form.skills} onChange={e => setForm((f: any) => ({...f, skills: e.target.value}))} style={inp} placeholder="Plumbing, Electrical" />
      </div>}

      <button onClick={async () => { await signOut(); router.push("/"); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 10, cursor: "pointer", width: "100%", fontFamily: "inherit", color: t.danger }}>🚪 <span style={{ fontSize: 14, fontWeight: 600 }}>Log Out</span></button>
    </div>
  );
}
