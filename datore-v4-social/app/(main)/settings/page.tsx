"use client";
export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";
import { signOut } from "@/lib/supabase";

export default function SettingsPage() {
  const router = useRouter(); const { isDark, toggle } = useThemeStore(); const t = getTheme(isDark);
  const items = [
    { icon: isDark ? "☀️" : "🌙", label: `Theme: ${isDark ? "Dark" : "Light"}`, action: toggle, badge: "Toggle" },
    { icon: "👤", label: "Account", action: () => router.push("/profile") },
    { icon: "🔔", label: "Notifications", action: () => {} },
    { icon: "🔒", label: "Privacy & Safety", action: () => {} },
    { icon: "🌐", label: "Language", action: () => {} },
    { icon: "📧", label: "Email Preferences", action: () => {} },
    { icon: "❓", label: "Help & Support", action: () => {} },
    { icon: "📜", label: "Terms of Service", action: () => {} },
    { icon: "ℹ️", label: "About Datore", action: () => {} },
    { icon: "🚪", label: "Log Out", action: async () => { await signOut(); router.push("/"); }, danger: true },
  ];
  return (
    <div style={{ padding: "16px 16px 40px" }} className="anim-fade">
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, marginBottom: 20 }}>Settings</h1>
      <div style={{ background: t.bgCard, borderRadius: 14, border: `1px solid ${t.border}`, overflow: "hidden" }}>
        {items.map((item, i) => <button key={i} onClick={item.action} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "14px 16px", background: "none", border: "none", borderBottom: i < items.length - 1 ? `1px solid ${t.border}` : "none", cursor: "pointer", color: (item as any).danger ? t.danger : t.text, fontFamily: "inherit", fontSize: 14 }}><span>{item.icon} {item.label}</span>{(item as any).badge && <span style={{ padding: "4px 12px", borderRadius: 20, background: t.accentDim, color: t.accent, fontSize: 12, fontWeight: 600 }}>{(item as any).badge}</span>}</button>)}
      </div>
    </div>
  );
}
