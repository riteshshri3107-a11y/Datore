"use client";
export const dynamic = "force-dynamic";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";
export default function SavedPage() {
  const { isDark } = useThemeStore(); const t = getTheme(isDark);
  return <div style={{ padding: "16px 16px 40px" }} className="anim-fade"><h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, marginBottom: 20 }}>Saved</h1><div style={{ textAlign: "center", padding: 40, background: t.bgCard, borderRadius: 14, border: `1px solid ${t.border}` }}><p style={{ fontSize: 48 }}>💾</p><p style={{ fontWeight: 700, marginTop: 8 }}>Your saved items</p><p style={{ color: t.textMuted, fontSize: 13, marginTop: 8 }}>Posts, listings & workers you save will appear here</p></div></div>;
}
