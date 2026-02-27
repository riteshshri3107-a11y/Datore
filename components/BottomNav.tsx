"use client";
import { useRouter, usePathname } from "next/navigation";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark } = useThemeStore();
  const t = getTheme(isDark);

  const nav = [
    { href: "/home", icon: "🏠", label: "Home" },
    { href: "/search", icon: "🔍", label: "Search" },
    { href: "/marketplace", icon: "🏪", label: "Market" },
    { href: "/messages", icon: "💬", label: "Chat" },
    { href: "/dashboard", icon: "📊", label: "Activity" },
  ];

  return (
    <nav style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: t.navBg, backdropFilter: "blur(20px)", borderTop: `1px solid ${t.border}`, display: "flex", justifyContent: "space-around", padding: "6px 0 env(safe-area-inset-bottom, 6px)", zIndex: 100 }}>
      {nav.map(n => {
        const active = pathname === n.href || (n.href !== "/home" && pathname.startsWith(n.href));
        return <button key={n.href} onClick={() => router.push(n.href)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "4px 12px", background: "none", border: "none", cursor: "pointer", color: active ? t.accent : t.textMuted, transition: "color .2s" }}><span style={{ fontSize: 20 }}>{n.icon}</span><span style={{ fontSize: 10, fontWeight: 600 }}>{n.label}</span></button>;
      })}
    </nav>
  );
}
