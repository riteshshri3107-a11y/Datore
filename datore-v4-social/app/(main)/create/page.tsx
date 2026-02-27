"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";

export default function CreatePage() {
  const router = useRouter(); const { isDark } = useThemeStore(); const t = getTheme(isDark);
  const [postType, setPostType] = useState("");
  const types = [
    { id: "post", icon: "📝", label: "Post", desc: "Share an update" },
    { id: "story", icon: "📸", label: "Story", desc: "Share a moment" },
    { id: "reel", icon: "🎬", label: "Reel", desc: "Short video clip" },
    { id: "milestone", icon: "🎉", label: "Life Update", desc: "Share a milestone" },
    { id: "listing", icon: "🏷️", label: "Marketplace Listing", desc: "Sell something" },
    { id: "community", icon: "👥", label: "Community Group", desc: "Start a group" },
    { id: "event", icon: "📅", label: "Event", desc: "Create an event" },
    { id: "fundraiser", icon: "💝", label: "Fundraiser", desc: "Raise money for a cause" },
  ];

  if (postType === "listing") { router.push("/marketplace/create"); return null; }

  return (
    <div style={{ padding: "16px 16px 40px" }} className="anim-fade">
      <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, marginBottom: 20 }}>Create</h1>
      {!postType ? <div>
        <p style={{ color: t.textSecondary, fontSize: 14, marginBottom: 16 }}>What would you like to create?</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {types.map(tp => <button key={tp.id} onClick={() => setPostType(tp.id)} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 20, borderRadius: 14, border: `1px solid ${t.border}`, background: t.bgCard, cursor: "pointer", textAlign: "center" }}><span style={{ fontSize: 32 }}>{tp.icon}</span><span style={{ fontWeight: 700, fontSize: 14, color: t.text }}>{tp.label}</span><span style={{ fontSize: 11, color: t.textMuted }}>{tp.desc}</span></button>)}
        </div>
      </div> : <div>
        <button onClick={() => setPostType("")} style={{ background: "none", border: "none", cursor: "pointer", color: t.textMuted, fontSize: 13, fontFamily: "inherit", marginBottom: 16 }}>← Back to types</button>
        <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: 16 }}>
          <textarea placeholder={`What's on your mind?`} rows={6} style={{ width: "100%", padding: 12, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 10, color: t.text, fontSize: 15, fontFamily: "inherit", outline: "none", resize: "vertical" as const, marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {["📷 Photo","🎥 Video","📍 Location","😊 Feeling","🏷️ Tag"].map(a => <button key={a} style={{ padding: "6px 12px", borderRadius: 8, fontSize: 12, border: `1px solid ${t.border}`, background: t.bgSecondary, color: t.textSecondary, cursor: "pointer", fontFamily: "inherit" }}>{a}</button>)}
          </div>
          <button style={{ width: "100%", padding: 12, background: t.accent, color: "#0A0A0F", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Publish {postType}</button>
        </div>
      </div>}
    </div>
  );
}
