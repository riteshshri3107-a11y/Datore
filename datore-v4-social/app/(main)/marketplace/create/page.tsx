"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";

export default function CreateListingPage() {
  const router = useRouter();
  const { isDark } = useThemeStore(); const t = getTheme(isDark);
  const [form, setForm] = useState({ title: "", price: "", category: "", condition: "Good", description: "", location: "Raipur" });
  const [success, setSuccess] = useState(false);
  const u = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const inp = { width: "100%", padding: "12px 14px", background: t.bgSecondary, border: `1px solid ${t.border}`, borderRadius: 10, color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 12 } as const;
  const cats = ["Vehicles","Electronics","Apparel","Home Goods","Sports","Toys","Instruments","Office","Pet Supplies","Free Stuff","Garden","DIY Supplies"];

  return (
    <div style={{ padding: "16px 16px 40px" }} className="anim-fade">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}><button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: t.text }}>←</button><h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22 }}>New Listing</h1></div>
      {success ? <div style={{ textAlign: "center", padding: 40 }}><p style={{ fontSize: 40 }}>✅</p><p style={{ fontWeight: 700, fontSize: 18 }}>Listed!</p><button onClick={() => router.push("/marketplace")} style={{ marginTop: 16, padding: "12px 24px", background: t.accent, color: "#0A0A0F", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Back to Marketplace</button></div> : <>
        <div style={{ height: 160, background: t.bgCard, border: `2px dashed ${t.border}`, borderRadius: 14, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: 16, cursor: "pointer" }}><span style={{ fontSize: 36 }}>📷</span><span style={{ fontSize: 13, color: t.textMuted, marginTop: 8 }}>Add Photos</span></div>
        <input value={form.title} onChange={e => u("title", e.target.value)} placeholder="What are you selling?" style={inp} />
        <input value={form.price} onChange={e => u("price", e.target.value)} placeholder="Price (₹)" type="number" style={inp} />
        <select value={form.category} onChange={e => u("category", e.target.value)} style={{...inp, appearance: "auto" as any}}>
          <option value="">Select Category</option>{cats.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {["New","Like New","Good","Fair"].map(c => <button key={c} onClick={() => u("condition", c)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${form.condition === c ? t.accentBorder : t.border}`, background: form.condition === c ? t.accentDim : t.bgSecondary, color: form.condition === c ? t.accent : t.textSecondary, cursor: "pointer", fontFamily: "inherit" }}>{c}</button>)}
        </div>
        <textarea value={form.description} onChange={e => u("description", e.target.value)} placeholder="Describe your item..." rows={4} style={{...inp, resize: "vertical" as const}} />
        <input value={form.location} onChange={e => u("location", e.target.value)} placeholder="📍 Location" style={inp} />
        <button onClick={() => setSuccess(true)} style={{ width: "100%", padding: 14, background: t.accent, color: "#0A0A0F", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Publish Listing</button>
      </>}
    </div>
  );
}
