"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase, getWorker, getReviewsForUser, createBooking, getOrCreateChatRoom } from "@/lib/supabase";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";
import { formatCurrency, timeAgo } from "@/lib/utils";

export default function WorkerPage() {
  const router = useRouter(); const { id } = useParams();
  const { isDark } = useThemeStore(); const t = getTheme(isDark);
  const [worker, setWorker] = useState<any>(null); const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true); const [showBooking, setShowBooking] = useState(false);
  const [bookForm, setBookForm] = useState({ service: "", description: "", date: "", time: "", hours: 1 });
  const [bookLoading, setBookLoading] = useState(false); const [bookSuccess, setBookSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => { (async () => {
    const { data: { session } } = await supabase.auth.getSession(); setCurrentUser(session?.user || null);
    const [w, r] = await Promise.all([getWorker(id as string), getReviewsForUser(id as string)]);
    setWorker(w); setReviews(r); setLoading(false);
  })(); }, [id]);

  const handleBook = async () => {
    if (!currentUser || !worker) return; setBookLoading(true);
    const amount = (worker.hourly_rate || 200) * bookForm.hours;
    await createBooking({ worker_id: id, customer_id: currentUser.id, worker_name: worker.profiles?.name, service: bookForm.service || "General", description: bookForm.description, amount, scheduled_date: bookForm.date, scheduled_time: bookForm.time });
    setBookLoading(false); setBookSuccess(true); setTimeout(() => { setShowBooking(false); setBookSuccess(false); }, 2000);
  };
  const handleChat = async () => { if (!currentUser) return; const room = await getOrCreateChatRoom(currentUser.id, id as string); if (room) router.push(`/chat/${room.id}`); };

  const inp = { width: "100%", padding: "10px 14px", background: t.bg, border: `1px solid ${t.border}`, borderRadius: 8, color: t.text, fontSize: 14, fontFamily: "inherit", outline: "none", marginBottom: 10 } as const;

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}><p style={{ color: t.textMuted }}>Loading...</p></div>;
  if (!worker) return <div style={{ padding: 40, textAlign: "center" }}><p>Worker not found</p></div>;
  const p = worker.profiles || {}; const amount = (worker.hourly_rate || 200) * bookForm.hours; const fee = Math.round(amount * 0.01);

  return (
    <div style={{ padding: "0 0 100px" }} className="anim-fade">
      <div style={{ padding: "50px 20px 24px", background: `linear-gradient(180deg, ${t.accentDim} 0%, transparent 100%)`, textAlign: "center", position: "relative" }}>
        <button onClick={() => router.back()} style={{ position: "absolute", top: 12, left: 12, background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: "50%", width: 36, height: 36, cursor: "pointer", color: t.text, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: t.accentDim, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 10px", color: t.accent, fontWeight: 700, border: `3px solid ${t.accent}` }}>{p.name?.[0] || "?"}</div>
        <h1 style={{ fontSize: 20, fontWeight: 700 }}>{p.name}</h1>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 6 }}>{p.verified && <span style={{ fontSize: 11, color: t.accent, padding: "3px 8px", background: t.accentDim, borderRadius: 10 }}>🛡️ Verified</span>}{worker.licensed && <span style={{ fontSize: 11, color: "#60A5FA", padding: "3px 8px", background: "rgba(59,130,246,0.1)", borderRadius: 10 }}>Licensed</span>}</div>
        <div style={{ fontSize: 12, color: t.textSecondary, marginTop: 6 }}>⭐ {p.rating || "New"} ({p.review_count || 0}) • 📍 {p.city || "India"}</div>
      </div>
      <div style={{ padding: "0 16px" }}>
        {p.bio && <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: 14, marginTop: 14 }}><p style={{ fontSize: 14, color: t.textSecondary, lineHeight: 1.6 }}>{p.bio}</p></div>}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: 14, textAlign: "center" }}><div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: t.accent }}>{formatCurrency(worker.hourly_rate || 0)}</div><div style={{ fontSize: 11, color: t.textMuted }}>per hour</div></div>
          <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: 14, textAlign: "center" }}><div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, color: t.accent }}>{p.job_count || 0}</div><div style={{ fontSize: 11, color: t.textMuted }}>jobs done</div></div>
        </div>
        <div style={{ marginTop: 20 }}><h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? <p style={{ color: t.textMuted, fontSize: 13 }}>No reviews yet</p> : reviews.slice(0, 5).map((r: any) => <div key={r.id} style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 10, padding: 12, marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontWeight: 600, fontSize: 13 }}>{r.from_user_name || "User"}</span><span style={{ color: t.accent, fontSize: 12 }}>⭐ {r.overall_rating}</span></div><p style={{ fontSize: 13, color: t.textSecondary }}>{r.review_text}</p></div>)}
        </div>
      </div>
      <div style={{ position: "fixed", bottom: 70, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 448, padding: "0 16px" }}>
        <div style={{ display: "flex", gap: 8, background: t.navBg, backdropFilter: "blur(20px)", padding: 10, borderRadius: 14, border: `1px solid ${t.border}` }}>
          <button onClick={handleChat} style={{ width: 44, height: 44, borderRadius: 10, background: t.bgElevated, border: `1px solid ${t.border}`, cursor: "pointer", fontSize: 18 }}>💬</button>
          <button onClick={() => setShowBooking(true)} style={{ flex: 1, padding: 12, background: t.accent, color: "#0A0A0F", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit" }}>📅 Book Now</button>
        </div>
      </div>
      {showBooking && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowBooking(false)}>
        <div className="anim-slide" style={{ width: "100%", maxWidth: 480, background: t.bgSecondary, borderRadius: "20px 20px 0 0", padding: "24px 20px 40px" }} onClick={e => e.stopPropagation()}>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Book {p.name}</h2>
          {bookSuccess ? <div style={{ textAlign: "center", padding: 20 }}><p style={{ fontSize: 32 }}>✅</p><p style={{ fontWeight: 700 }}>Booking Sent!</p></div> : <>
            <input value={bookForm.service} onChange={e => setBookForm(f => ({...f, service: e.target.value}))} placeholder="Service needed" style={inp} />
            <textarea value={bookForm.description} onChange={e => setBookForm(f => ({...f, description: e.target.value}))} placeholder="Describe work..." rows={3} style={{...inp, resize: "vertical" as const}} />
            <div style={{ display: "flex", gap: 8 }}><input type="date" value={bookForm.date} onChange={e => setBookForm(f => ({...f, date: e.target.value}))} style={{...inp, flex: 1}} /><input type="time" value={bookForm.time} onChange={e => setBookForm(f => ({...f, time: e.target.value}))} style={{...inp, flex: 1}} /></div>
            <label style={{ fontSize: 11, color: t.textMuted }}>Hours: {bookForm.hours}</label>
            <input type="range" min={1} max={8} value={bookForm.hours} onChange={e => setBookForm(f => ({...f, hours: +e.target.value}))} style={{ width: "100%", marginBottom: 12, accentColor: t.accent }} />
            <div style={{ background: t.bg, borderRadius: 10, padding: 12, marginBottom: 14 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ color: t.textSecondary, fontSize: 13 }}>Total</span><span style={{ fontWeight: 700, color: t.accent }}>{formatCurrency(amount)}</span></div><p style={{ fontSize: 11, color: t.textMuted }}>Worker gets {formatCurrency(amount - fee)} (99%) • 1% platform fee</p></div>
            <button onClick={handleBook} disabled={bookLoading} style={{ width: "100%", padding: 14, background: t.accent, color: "#0A0A0F", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "inherit", opacity: bookLoading ? 0.6 : 1 }}>{bookLoading ? "Sending..." : `Confirm & Pay ${formatCurrency(amount)}`}</button>
          </>}
        </div>
      </div>}
    </div>
  );
}
