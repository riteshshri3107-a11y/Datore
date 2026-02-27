"use client";
export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";
export default function InboxPage() {
  const router = useRouter(); const { isDark } = useThemeStore(); const t = getTheme(isDark);
  return <div style={{ padding: "16px 16px 40px" }} className="anim-fade"><h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, marginBottom: 20 }}>Inbox</h1><div style={{ textAlign: "center", padding: 40, background: t.bgCard, borderRadius: 14, border: `1px solid ${t.border}` }}><p style={{ fontSize: 48 }}>✉️</p><p style={{ fontWeight: 700, marginTop: 8 }}>Direct Messages</p><p style={{ color: t.textMuted, fontSize: 13, marginTop: 8 }}>Marketplace inquiries & direct messages</p><button onClick={() => router.push("/messages")} style={{ marginTop: 12, padding: "10px 20px", background: t.accent, color: "#0A0A0F", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Go to Chat</button></div></div>;
}
