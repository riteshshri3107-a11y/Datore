"use client";
import { useRouter, usePathname } from "next/navigation";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";

export default function TopNav({ unreadCount = 0 }: { unreadCount?: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useThemeStore();
  const t = getTheme(isDark);

  const tabs = [
    { href: "/home", icon: "🏠", label: "Home" },
    { href: "/community", icon: "👥", label: "Community" },
    { href: "/create", icon: "➕", label: "Create" },
    { href: "/marketplace", icon: "🏪", label: "Market" },
    { href: "/profile", icon: "👤", label: "Profile" },
  ];

  return (
    <div style={{ position: "sticky", top: 0, zIndex: 100, background: t.navBg, backdropFilter: "blur(20px)", borderBottom: `1px solid ${t.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px", maxWidth: 480, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, cursor: "pointer" }} onClick={() => router.push("/home")}>⚡</div>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, fontWeight: 400 }}>Datore</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => router.push("/menu")} style={{ width: 36, height: 36, borderRadius: "50%", background: t.bgCard, border: `1px solid ${t.border}`, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>☰</button>
          <button onClick={() => router.push("/inbox")} style={{ width: 36, height: 36, borderRadius: "50%", background: t.bgCard, border: `1px solid ${t.border}`, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>✉️</button>
          <button onClick={() => router.push("/notifications")} style={{ width: 36, height: 36, borderRadius: "50%", background: t.bgCard, border: `1px solid ${t.border}`, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>🔔{unreadCount > 0 && <span style={{ position: "absolute", top: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: t.danger, color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount > 9 ? "9+" : unreadCount}</span>}</button>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", maxWidth: 480, margin: "0 auto" }}>
        {tabs.map(tab => {
          const active = pathname === tab.href || (tab.href !== "/home" && pathname.startsWith(tab.href));
          return <button key={tab.href} onClick={() => router.push(tab.href)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 12px", background: "none", border: "none", cursor: "pointer", color: active ? t.accent : t.textMuted, borderBottom: active ? `2px solid ${t.accent}` : "2px solid transparent", transition: "all .2s" }}><span style={{ fontSize: 18 }}>{tab.icon}</span><span style={{ fontSize: 10, fontWeight: 600 }}>{tab.label}</span></button>;
        })}
      </div>
    </div>
  );
}
