"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getProfile, getServiceProfile } from "@/lib/supabase";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";
import { GlassCard, GlassButton, Spinner } from "@/components/Glass";
export default function VerifyPage() {
  const router = useRouter(); const { id } = useParams(); const { isDark } = useThemeStore(); const t = getTheme(isDark);
  const [profile, setProfile] = useState<any>(null); const [sp, setSp] = useState<any>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { (async () => { const [p, s] = await Promise.all([getProfile(id as string), getServiceProfile(id as string).catch(() => null)]); setProfile(p); setSp(s); setLoading(false); })(); }, [id]);
  if (loading) return <Spinner />;
  if (!profile) return <GlassCard style={{ margin: 20, textAlign: "center", padding: 40 }}><p style={{ fontSize: 40 }}>❌</p><p style={{ fontWeight: 700 }}>User not found</p></GlassCard>;
  const trustScore = sp?.trust_score || 50; const trustColor = trustScore >= 70 ? t.accent : trustScore >= 40 ? t.warning : t.danger; const trustLabel = trustScore >= 70 ? "🟢 Excellent" : trustScore >= 40 ? "🟡 Moderate" : "🔴 Risky";
  return <div style={{ padding: "16px 16px 40px" }} className="anim-fade">
    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, marginBottom: 14, textAlign: "center" }}>🛡️ Identity Verification</h1>
    <GlassCard glow style={{ textAlign: "center", padding: 28, marginBottom: 14 }}>
      <div style={{ width: 72, height: 72, borderRadius: 20, background: t.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 10px", color: t.accent, fontWeight: 700, border: `2px solid ${t.accent}` }}>{profile.name?.[0]}</div>
      <h2 style={{ fontSize: 20, fontWeight: 700 }}>{profile.name}</h2>
      <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 8 }}>{profile.verified ? <span style={{ padding: "4px 12px", borderRadius: 10, background: t.accentDim, color: t.accent, fontSize: 12, fontWeight: 700 }}>✅ ID Verified</span> : <span style={{ padding: "4px 12px", borderRadius: 10, background: "rgba(255,182,54,0.1)", color: t.warning, fontSize: 12, fontWeight: 700 }}>⚠️ Not Verified</span>}</div>
    </GlassCard>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
      <GlassCard style={{ textAlign: "center", padding: 14 }}><div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>Rating</div><div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: t.accent }}>⭐ {profile.rating || "New"}</div><div style={{ fontSize: 11, color: t.textMuted }}>{profile.review_count || 0} reviews</div></GlassCard>
      <GlassCard style={{ textAlign: "center", padding: 14 }}><div style={{ fontSize: 12, color: t.textMuted, marginBottom: 4 }}>Trust Score</div><div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, color: trustColor }}>{trustScore}/100</div><div style={{ fontSize: 11, color: trustColor }}>{trustLabel}</div></GlassCard>
    </div>
    <GlassCard style={{ marginBottom: 14 }}><h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>Criminal Background</h3><div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 12, height: 12, borderRadius: "50%", background: profile.verified ? t.accent : t.warning }} /><span style={{ fontSize: 14 }}>{profile.verified ? "No Record — Verified ✅" : "Limited / Not Verified ⚠️"}</span></div></GlassCard>
    <div style={{ display: "flex", gap: 8 }}><GlassButton full>☑️ Confirm Identity</GlassButton><GlassButton variant="danger" full>⚠️ Report Suspicious</GlassButton></div>
  </div>;
}
