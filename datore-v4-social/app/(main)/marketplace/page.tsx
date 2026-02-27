"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";
import { formatCurrency } from "@/lib/utils";

export default function MarketplacePage() {
  const router = useRouter();
  const { isDark } = useThemeStore(); const t = getTheme(isDark);
  const [tab, setTab] = useState("browse");
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("");

  const categories = [
    { id: "vehicles", icon: "🚗", name: "Vehicles" }, { id: "property", icon: "🏠", name: "Property" },
    { id: "electronics", icon: "📱", name: "Electronics" }, { id: "apparel", icon: "👗", name: "Apparel" },
    { id: "home_goods", icon: "🛋️", name: "Home Goods" }, { id: "garden", icon: "🌿", name: "Garden" },
    { id: "sports", icon: "⚽", name: "Sports" }, { id: "toys", icon: "🎮", name: "Toys & Games" },
    { id: "instruments", icon: "🎸", name: "Instruments" }, { id: "office", icon: "💼", name: "Office" },
    { id: "pets", icon: "🐾", name: "Pet Supplies" }, { id: "free", icon: "🎁", name: "Free Stuff" },
    { id: "entertainment", icon: "🎬", name: "Entertainment" }, { id: "family", icon: "👨‍👩‍👧", name: "Family" },
    { id: "hobbies", icon: "🎨", name: "Hobbies" }, { id: "home_improve", icon: "🔨", name: "DIY Supplies" },
    { id: "classifieds", icon: "📋", name: "Classifieds" }, { id: "groups", icon: "👥", name: "Buy & Sell Groups" },
  ];

  // Demo listings
  const listings = [
    { id: "1", title: "iPhone 15 Pro Max 256GB", price: 89999, cat: "electronics", condition: "Like New", img: "📱", location: "Raipur", time: "2h ago" },
    { id: "2", title: "Royal Enfield Classic 350", price: 165000, cat: "vehicles", condition: "Good", img: "🏍️", location: "Raipur", time: "5h ago" },
    { id: "3", title: "IKEA Study Desk", price: 4500, cat: "home_goods", condition: "Good", img: "🪑", location: "Bhilai", time: "1d ago" },
    { id: "4", title: "PS5 + 3 Games Bundle", price: 42000, cat: "entertainment", condition: "Excellent", img: "🎮", location: "Raipur", time: "3h ago" },
    { id: "5", title: "Acoustic Guitar Yamaha F310", price: 7500, cat: "instruments", condition: "Good", img: "🎸", location: "Durg", time: "6h ago" },
    { id: "6", title: "Cricket Kit Complete Set", price: 3200, cat: "sports", condition: "New", img: "🏏", location: "Raipur", time: "1d ago" },
  ];

  const filtered = listings.filter(l => (!selectedCat || l.cat === selectedCat) && (!search || l.title.toLowerCase().includes(search.toLowerCase())));
  const chip = (a: boolean) => ({ padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, border: `1px solid ${a ? t.accentBorder : t.border}`, background: a ? t.accentDim : t.bgCard, color: a ? t.accent : t.textSecondary, cursor: "pointer", whiteSpace: "nowrap" as const, fontFamily: "inherit" });

  return (
    <div style={{ padding: "16px 16px 40px" }} className="anim-fade">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26 }}>Marketplace</h1>
        <button onClick={() => router.push("/marketplace/create")} style={{ padding: "8px 16px", background: t.accent, color: "#0A0A0F", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>+ Sell</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, background: t.bgSecondary, borderRadius: 12, padding: 3, marginBottom: 14 }}>
        {[["browse","🔍 Browse"],["buying","🛒 Buying"],["selling","💰 Selling"]].map(([id, label]) => <button key={id} onClick={() => setTab(id)} style={{ flex: 1, padding: 8, borderRadius: 10, fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer", fontFamily: "inherit", background: tab === id ? t.accent : "transparent", color: tab === id ? "#0A0A0F" : t.textMuted }}>{label}</button>)}
      </div>

      {/* Search */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: t.bgSecondary, border: `1px solid ${t.border}`, borderRadius: 10, marginBottom: 14 }}>
        <span>🔍</span><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search marketplace..." style={{ flex: 1, background: "transparent", border: "none", color: t.text, fontSize: 14, outline: "none", fontFamily: "inherit" }} />
      </div>

      {/* Location */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14 }}>
        <span style={{ fontSize: 13, color: t.textMuted }}>📍 Raipur, CG</span>
        <span style={{ fontSize: 12, color: t.textMuted }}>•</span>
        <span style={{ fontSize: 13, color: t.accent, cursor: "pointer" }}>40 km radius ▾</span>
      </div>

      {/* Categories */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 8, marginBottom: 14 }}>
        <button onClick={() => setSelectedCat("")} style={chip(!selectedCat)}>All</button>
        {categories.map(c => <button key={c.id} onClick={() => setSelectedCat(selectedCat === c.id ? "" : c.id)} style={chip(selectedCat === c.id)}>{c.icon} {c.name}</button>)}
      </div>

      {/* Listings Grid */}
      {tab === "browse" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {filtered.map(l => <div key={l.id} onClick={() => router.push(`/marketplace/listing/${l.id}`)} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, overflow: "hidden", cursor: "pointer" }}>
          <div style={{ height: 120, background: t.bgElevated, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>{l.img}</div>
          <div style={{ padding: 10 }}>
            <div style={{ fontWeight: 700, color: t.accent, fontSize: 15, marginBottom: 2 }}>{formatCurrency(l.price)}</div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{l.title}</div>
            <div style={{ fontSize: 11, color: t.textMuted }}>📍 {l.location} • {l.time}</div>
          </div>
        </div>)}
      </div>}
      {tab === "buying" && <div style={{ textAlign: "center", padding: 40 }}><p style={{ fontSize: 40 }}>🛒</p><p style={{ fontWeight: 700 }}>Your purchases</p><p style={{ color: t.textMuted, fontSize: 13, marginTop: 4 }}>Items you've inquired about will appear here</p></div>}
      {tab === "selling" && <div style={{ textAlign: "center", padding: 40 }}><p style={{ fontSize: 40 }}>💰</p><p style={{ fontWeight: 700 }}>Your listings</p><button onClick={() => router.push("/marketplace/create")} style={{ marginTop: 12, padding: "10px 20px", background: t.accent, color: "#0A0A0F", border: "none", borderRadius: 10, fontWeight: 600, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>Create Listing</button></div>}
    </div>
  );
}
