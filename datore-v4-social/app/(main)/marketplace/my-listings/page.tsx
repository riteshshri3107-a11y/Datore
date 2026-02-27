"use client";
export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";
export default function MyListingsPage() {
  const router = useRouter(); const { isDark } = useThemeStore(); const t = getTheme(isDark);
  return <div style={{ padding: "16px 16px 40px" }} className="anim-fade"><h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, marginBottom: 20 }}>My Listings</h1><div style={{ textAlign: "center", padding: 40, background: t.bgCard, borderRadius: 14, border: `1px solid ${t.border}` }}><p style={{ fontSize: 40 }}>🏷️</p><p style={{ fontWeight: 700, marginTop: 8 }}>No listings yet</p><button onClick={() => router.push("/marketplace/create")} style={{ marginTop: 16, padding: "12px 24px", background: t.accent, color: "#0A0A0F", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Create Listing</button></div></div>;
}
