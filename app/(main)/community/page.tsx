"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";

export default function CommunityPage() {
  const router = useRouter(); const { isDark } = useThemeStore(); const t = getTheme(isDark);
  const [tab, setTab] = useState("discover");
  const groups = [
    { id: "1", icon: "🔧", name: "Raipur Skilled Trades", members: 1240, desc: "Local plumbers, electricians, carpenters" },
    { id: "2", icon: "💻", name: "Tech Freelancers India", members: 5680, desc: "Web dev, app dev, AI/ML professionals" },
    { id: "3", icon: "📚", name: "Home Tutors Network", members: 890, desc: "Teachers & tutors across all subjects" },
    { id: "4", icon: "💇", name: "Beauty & Wellness Pros", members: 2100, desc: "Salon, spa, fitness professionals" },
    { id: "5", icon: "🏠", name: "Raipur Buy & Sell", members: 8900, desc: "Local marketplace for everything" },
    { id: "6", icon: "🎉", name: "Event Planners Hub", members: 760, desc: "Wedding, birthday, corporate events" },
    { id: "7", icon: "🤖", name: "AI & Robotics Learners", members: 3400, desc: "Learn AI, robotics & IoT together" },
    { id: "8", icon: "💪", name: "Fitness Community CG", members: 1890, desc: "Trainers, nutritionists & fitness lovers" },
  ];

  return (
    <div style={{ padding: "16px 16px 40px" }} className="anim-fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26 }}>Communities</h1>
        <button style={{ padding: "8px 16px", background: t.accent, color: "#0A0A0F", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>+ Create</button>
      </div>
      <div style={{ display: "flex", gap: 4, background: t.bgSecondary, borderRadius: 12, padding: 3, marginBottom: 16 }}>
        {[["discover","🔍 Discover"],["joined","👥 Joined"],["manage","⚙️ Manage"]].map(([id,label]) => <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: 8, borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", background: tab === id ? t.accent : "transparent", color: tab === id ? "#0A0A0F" : t.textMuted }}>{label}</button>)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: t.bgSecondary, border: `1px solid ${t.border}`, borderRadius: 10, marginBottom: 16 }}>
        <span>🔍</span><input placeholder="Search communities..." style={{ flex: 1, background: "transparent", border: "none", color: t.text, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
      </div>
      {groups.map(g => <div key={g.id} style={{ display: "flex", gap: 14, alignItems: "center", padding: 14, background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, marginBottom: 8, cursor: "pointer" }}>
        <div style={{ width: 50, height: 50, borderRadius: 14, background: t.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{g.icon}</div>
        <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{g.name}</div><div style={{ fontSize: 12, color: t.textMuted, marginBottom: 2 }}>{g.members.toLocaleString()} members</div><div style={{ fontSize: 12, color: t.textSecondary }}>{g.desc}</div></div>
        <button style={{ padding: "6px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${t.accentBorder}`, background: t.accentDim, color: t.accent, cursor: "pointer", fontFamily: "inherit" }}>Join</button>
      </div>)}
    </div>
  );
}
