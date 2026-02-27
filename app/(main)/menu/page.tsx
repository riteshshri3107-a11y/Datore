"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, getProfile, signOut } from "@/lib/supabase";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";
import { GlassCard, GlassButton } from "@/components/Glass";
export default function MenuPage() {
  const router = useRouter(); const { isDark, toggle } = useThemeStore(); const t = getTheme(isDark);
  const [profile, setProfile] = useState<any>(null);
  useEffect(() => { (async () => { const { data: { session } } = await supabase.auth.getSession(); if (session?.user) setProfile(await getProfile(session.user.id)); })(); }, []);
  const Section = ({ title, items }: { title: string; items: any[] }) => <div style={{ marginBottom: 16 }}>
    <h3 style={{ fontSize: 11, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, padding: "0 4px" }}>{title}</h3>
    <GlassCard style={{ padding: 0, overflow: "hidden" }}>{items.map((item, i) => <button key={i} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "13px 16px", background: "none", border: "none", borderBottom: i < items.length - 1 ? `1px solid ${t.borderGlass}` : "none", cursor: "pointer", color: item.danger ? t.danger : t.text, fontFamily: "inherit", fontSize: 14, textAlign: "left" }}><span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{item.icon}</span><div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{item.label}</div>{item.desc && <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>{item.desc}</div>}</div></button>)}</GlassCard>
  </div>;
  return <div style={{ padding: "16px 16px 40px" }} className="anim-fade">
    <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, marginBottom: 14 }}>Menu</h1>
    <GlassCard onClick={() => router.push("/profile")} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, cursor: "pointer", padding: 14 }}><div style={{ width: 48, height: 48, borderRadius: 16, background: t.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: t.accent, fontWeight: 700, border: `2px solid ${t.accent}` }}>{profile?.name?.[0] || "?"}</div><div><div style={{ fontWeight: 700, fontSize: 15 }}>{profile?.name || "User"}</div><div style={{ fontSize: 12, color: t.textSecondary }}>View your profile</div></div></GlassCard>
    <Section title="General" items={[{ icon: "📸", label: "Memories", action: () => router.push("/memories") },{ icon: "💾", label: "Saved", action: () => router.push("/saved") },{ icon: "🔔", label: "Notifications", action: () => router.push("/notifications") }]} />
    <Section title="Professional" items={[{ icon: "💼", label: "JobPlace", desc: "Post & find jobs", action: () => router.push("/jobplace") },{ icon: "📊", label: "Activity Hub", action: () => router.push("/dashboard") },{ icon: "💰", label: "Token Wallet", action: () => router.push("/wallet") },{ icon: "🏪", label: "My Listings", action: () => router.push("/marketplace/my-listings") },{ icon: "👑", label: "Admin Panel", action: () => router.push("/admin") }]} />
    <Section title="Create" items={[{ icon: "📝", label: "New Post", action: () => router.push("/create") },{ icon: "💼", label: "Post a Job", action: () => router.push("/jobplace/create") },{ icon: "🏷️", label: "Sell Something", action: () => router.push("/marketplace/create") },{ icon: "👥", label: "Community", action: () => router.push("/community") }]} />
    <Section title="Settings" items={[{ icon: isDark ? "☀️" : "🌙", label: `${isDark ? "Light" : "Dark"} Mode`, action: toggle },{ icon: "⚙️", label: "Settings & Privacy", action: () => router.push("/settings") },{ icon: "🚪", label: "Log Out", danger: true, action: async () => { await signOut(); router.push("/"); } }]} />
  </div>;
}
