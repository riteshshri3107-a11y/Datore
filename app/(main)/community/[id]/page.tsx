"use client";
export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";
export default function CommunityDetailPage() { const router = useRouter(); const { isDark } = useThemeStore(); const t = getTheme(isDark); return <div style={{ padding: "16px 16px 40px" }}><button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: t.text }}>←</button><div style={{ textAlign: "center", padding: 40 }}><p style={{ fontSize: 40 }}>👥</p><p style={{ fontWeight: 700 }}>Community Detail</p><p style={{ color: t.textMuted, fontSize: 13 }}>Full community features coming soon!</p></div></div>; }
