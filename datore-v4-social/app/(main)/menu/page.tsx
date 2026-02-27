"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, getProfile, signOut } from "@/lib/supabase";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";

export default function MenuPage() {
  const router = useRouter();
  const { isDark, toggle } = useThemeStore(); const t = getTheme(isDark);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => { (async () => { const { data: { session } } = await supabase.auth.getSession(); if (session?.user) setProfile(await getProfile(session.user.id)); })(); }, []);

  const Section = ({ title, items }: { title: string; items: any[] }) => (
    <div style={{ marginBottom: 20 }}>
      <h3 style={{ fontSize: 12, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, padding: "0 4px" }}>{title}</h3>
      <div style={{ background: t.bgCard, borderRadius: 14, border: `1px solid ${t.border}`, overflow: "hidden" }}>
        {items.map((item, i) => <button key={i} onClick={item.action} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 16px", background: "none", border: "none", borderBottom: i < items.length - 1 ? `1px solid ${t.border}` : "none", cursor: "pointer", color: item.danger ? t.danger : t.text, fontFamily: "inherit", fontSize: 14, textAlign: "left" }}><span style={{ fontSize: 20, width: 28, textAlign: "center" }}>{item.icon}</span><div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{item.label}</div>{item.desc && <div style={{ fontSize: 12, color: t.textMuted, marginTop: 2 }}>{item.desc}</div>}</div>{item.badge && <span style={{ padding: "2px 8px", borderRadius: 10, background: t.danger, color: "#fff", fontSize: 11, fontWeight: 700 }}>{item.badge}</span>}</button>)}
      </div>
    </div>
  );

  return (
    <div style={{ padding: "16px 16px 40px" }} className="anim-fade">
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, marginBottom: 16 }}>Menu</h1>

      {/* Profile card */}
      <div onClick={() => router.push("/profile")} style={{ display: "flex", alignItems: "center", gap: 14, padding: 16, background: t.bgCard, borderRadius: 14, border: `1px solid ${t.border}`, marginBottom: 20, cursor: "pointer" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: t.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: t.accent, fontWeight: 700, border: `2px solid ${t.accent}` }}>{profile?.name?.[0] || "?"}</div>
        <div><div style={{ fontWeight: 700, fontSize: 16 }}>{profile?.name || "User"}</div><div style={{ fontSize: 12, color: t.textSecondary }}>View your profile</div></div>
      </div>

      <Section title="General" items={[
        { icon: "📸", label: "Memories", desc: "Browse old photos, posts & milestones", action: () => router.push("/memories") },
        { icon: "💾", label: "Saved", desc: "Find saved posts, listings & workers", action: () => router.push("/saved") },
        { icon: "🔔", label: "Notifications", desc: "Booking alerts & community updates", action: () => router.push("/notifications") },
      ]} />

      <Section title="Professional" items={[
        { icon: "📊", label: "Activity Hub", desc: "Track bookings, earnings & analytics", action: () => router.push("/dashboard") },
        { icon: "🏪", label: "My Listings", desc: "Manage your marketplace items", action: () => router.push("/marketplace/my-listings") },
        { icon: "🛡️", label: "Verification", desc: "Get police-verified badge", action: () => router.push("/profile") },
        { icon: "👑", label: "Admin Panel", desc: "Platform management", action: () => router.push("/admin") },
      ]} />

      <Section title="Create" items={[
        { icon: "📝", label: "New Post", desc: "Share updates with your community", action: () => router.push("/create") },
        { icon: "🏷️", label: "Marketplace Listing", desc: "Sell something locally", action: () => router.push("/marketplace/create") },
        { icon: "👥", label: "Community Group", desc: "Start a new community", action: () => router.push("/community") },
      ]} />

      <Section title="Settings" items={[
        { icon: isDark ? "☀️" : "🌙", label: `${isDark ? "Light" : "Dark"} Mode`, desc: `Switch to ${isDark ? "light" : "dark"} theme`, action: toggle },
        { icon: "⚙️", label: "Settings & Privacy", desc: "Account, notifications, privacy", action: () => router.push("/settings") },
        { icon: "🚪", label: "Log Out", danger: true, action: async () => { await signOut(); router.push("/"); } },
      ]} />
    </div>
  );
}
