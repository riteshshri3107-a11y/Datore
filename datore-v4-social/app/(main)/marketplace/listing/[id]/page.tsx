"use client";
export const dynamic = "force-dynamic";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";
export default function ListingDetailPage() {
  const router = useRouter(); const { isDark } = useThemeStore(); const t = getTheme(isDark);
  return <div style={{ padding: "16px 16px 40px" }} className="anim-fade"><div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}><button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: t.text }}>←</button><h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22 }}>Listing Details</h1></div><div style={{ height: 240, background: t.bgCard, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, marginBottom: 16 }}>📱</div><div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16 }}><h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Sample Listing</h2><div style={{ fontSize: 22, fontWeight: 700, color: t.accent, marginBottom: 8 }}>₹10,000</div><p style={{ color: t.textSecondary, fontSize: 14, lineHeight: 1.6 }}>This is a demo listing. Full marketplace with real data coming soon!</p></div><button onClick={() => router.push("/messages")} style={{ width: "100%", padding: 14, background: t.accent, color: "#0A0A0F", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit", marginTop: 16 }}>💬 Message Seller</button></div>;
}
