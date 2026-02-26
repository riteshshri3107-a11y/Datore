"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Star, Shield, MapPin, Clock, QrCode, MessageCircle, Calendar } from "lucide-react";
import { supabase, getWorker, getReviewsForUser, createBooking, getOrCreateChatRoom } from "@/lib/supabase";
import { formatCurrency, timeAgo } from "@/lib/utils";

export default function WorkerProfilePage() {
  const router = useRouter();
  const { id } = useParams();
  const [worker, setWorker] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [bookForm, setBookForm] = useState({ service: "", description: "", date: "", time: "", hours: 1 });
  const [bookLoading, setBookLoading] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
      const [w, r] = await Promise.all([getWorker(id as string), getReviewsForUser(id as string)]);
      setWorker(w);
      setReviews(r);
      setLoading(false);
    }
    load();
  }, [id]);

  const handleBook = async () => {
    if (!currentUser || !worker) return;
    setBookLoading(true);
    const amount = (worker.hourly_rate || 200) * bookForm.hours;
    const { data } = await createBooking({
      worker_id: id, customer_id: currentUser.id,
      worker_name: worker.profiles?.name || "", customer_name: "",
      service: bookForm.service || (worker.skills?.[0]?.name || "General Service"),
      description: bookForm.description, amount,
      scheduled_date: bookForm.date, scheduled_time: bookForm.time,
    });
    setBookLoading(false);
    if (data) { setBookSuccess(true); setTimeout(() => { setShowBooking(false); setBookSuccess(false); }, 2000); }
  };

  const handleChat = async () => {
    if (!currentUser) return;
    const room = await getOrCreateChatRoom(currentUser.id, id as string);
    if (room) router.push(`/chat/${room.id}`);
  };

  const inp = { width: "100%", padding: "10px 14px", background: "var(--bg-primary)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text-primary)", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", marginBottom: 10 } as const;

  if (loading) return <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"60vh"}}><p style={{color:"var(--text-muted)"}}>Loading...</p></div>;
  if (!worker) return <div style={{padding:40,textAlign:"center"}}><p>Worker not found</p><button onClick={()=>router.back()} style={{marginTop:12,color:"var(--accent)",background:"none",border:"none",cursor:"pointer"}}>Go Back</button></div>;

  const p = worker.profiles || {};
  const amount = (worker.hourly_rate || 200) * bookForm.hours;
  const fee = Math.round(amount * 0.01);

  return (
    <div style={{ padding: "0 0 100px" }} className="animate-fade-up">
      {/* Header */}
      <div style={{ padding: "60px 20px 30px", background: "linear-gradient(180deg, rgba(0,212,170,0.08) 0%, transparent 100%)", textAlign: "center", position: "relative" }}>
        <button onClick={() => router.back()} style={{ position: "absolute", top: 16, left: 16, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "50%", width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-primary)" }}><ArrowLeft size={18} /></button>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "var(--accent-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 12px", color: "var(--accent)", fontWeight: 700, border: "3px solid var(--accent)" }}>{p.name?.[0] || "?"}</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{p.name}</h1>
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 8 }}>
          {p.verified && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--accent)", padding: "4px 10px", background: "var(--accent-dim)", borderRadius: 12 }}><Shield size={12} /> Police Verified</span>}
          {worker.licensed && <span style={{ fontSize: 12, color: "#60A5FA", padding: "4px 10px", background: "rgba(59,130,246,0.1)", borderRadius: 12 }}>Licensed</span>}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 16, fontSize: 13, color: "var(--text-secondary)" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Star size={14} fill="var(--accent)" color="var(--accent)" /> {p.rating || "New"} ({p.review_count || 0})</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={14} /> {p.city || "India"}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={14} /> {worker.response_time}</span>
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* Bio */}
        {p.bio && <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, marginTop: 16 }}><p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{p.bio}</p></div>}

        {/* Skills & Rate */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--accent)" }}>{formatCurrency(worker.hourly_rate || 0)}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>per hour</div>
          </div>
          <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: 16, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color: "var(--accent)" }}>{p.job_count || 0}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>jobs completed</div>
          </div>
        </div>

        {/* Skills list */}
        {(worker.skills || []).length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 10 }}>Skills</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {(worker.skills || []).map((sk: any, i: number) => (
                <span key={i} style={{ padding: "6px 14px", background: "var(--accent-dim)", color: "var(--accent)", borderRadius: 16, fontSize: 13, fontWeight: 600 }}>{typeof sk === "string" ? sk : sk.name}</span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>Reviews ({reviews.length})</h3>
          {reviews.length === 0 ? <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No reviews yet</p> : reviews.slice(0, 5).map((r: any) => (
            <div key={r.id} style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{r.from_user_name || "User"}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 13, color: "var(--accent)" }}><Star size={12} fill="var(--accent)" /> {r.overall_rating}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5 }}>{r.review_text}</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>{timeAgo(r.created_at)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div style={{ position: "fixed", bottom: 70, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 448, padding: "0 16px" }}>
        <div style={{ display: "flex", gap: 10, background: "rgba(18,18,26,0.95)", backdropFilter: "blur(20px)", padding: 12, borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
          <button onClick={() => setShowQR(true)} style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}><QrCode size={18} /></button>
          <button onClick={handleChat} style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)", background: "var(--bg-elevated)", border: "1px solid var(--border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}><MessageCircle size={18} /></button>
          <button onClick={() => setShowBooking(true)} style={{ flex: 1, padding: 12, background: "var(--accent)", color: "#0A0A0F", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "var(--font-body)" }}><Calendar size={18} /> Book Now</button>
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={() => setShowBooking(false)}>
          <div style={{ width: "100%", maxWidth: 480, background: "var(--bg-secondary)", borderRadius: "20px 20px 0 0", padding: "24px 20px 40px", maxHeight: "80vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Book {p.name}</h2>
            {bookSuccess ? (
              <div style={{ textAlign: "center", padding: 20 }}><p style={{ fontSize: 32, marginBottom: 8 }}>✅</p><p style={{ fontWeight: 700 }}>Booking Sent!</p><p style={{ color: "var(--text-secondary)", fontSize: 13 }}>The worker will respond shortly.</p></div>
            ) : (
              <>
                <input value={bookForm.service} onChange={e => setBookForm(f => ({...f, service: e.target.value}))} placeholder="Service needed (e.g. Plumbing)" style={inp} />
                <textarea value={bookForm.description} onChange={e => setBookForm(f => ({...f, description: e.target.value}))} placeholder="Describe the work..." rows={3} style={{...inp, resize: "vertical" as const}} />
                <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <input type="date" value={bookForm.date} onChange={e => setBookForm(f => ({...f, date: e.target.value}))} style={{...inp, flex: 1}} />
                  <input type="time" value={bookForm.time} onChange={e => setBookForm(f => ({...f, time: e.target.value}))} style={{...inp, flex: 1}} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4, display: "block" }}>Hours: {bookForm.hours}</label>
                  <input type="range" min={1} max={8} value={bookForm.hours} onChange={e => setBookForm(f => ({...f, hours: +e.target.value}))} style={{ width: "100%" }} />
                </div>
                <div style={{ background: "var(--bg-primary)", borderRadius: "var(--radius-sm)", padding: 14, marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: "var(--text-secondary)", fontSize: 13 }}>{formatCurrency(worker.hourly_rate)} × {bookForm.hours} hrs</span><span>{formatCurrency(amount)}</span></div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ color: "var(--text-secondary)", fontSize: 13 }}>Platform fee (1%)</span><span style={{ fontSize: 13 }}>{formatCurrency(fee)}</span></div>
                  <div style={{ height: 1, background: "var(--border)", margin: "6px 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontWeight: 700 }}>Total</span><span style={{ fontWeight: 700, color: "var(--accent)" }}>{formatCurrency(amount)}</span></div>
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>Worker receives {formatCurrency(amount - fee)} (99%) • Held in escrow until completed</p>
                </div>
                <button onClick={handleBook} disabled={bookLoading} style={{ width: "100%", padding: 14, background: "var(--accent)", color: "#0A0A0F", border: "none", borderRadius: "var(--radius-sm)", fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "var(--font-body)", opacity: bookLoading ? 0.6 : 1 }}>
                  {bookLoading ? "Sending..." : `Confirm & Pay ${formatCurrency(amount)}`}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowQR(false)}>
          <div style={{ width: "90%", maxWidth: 360, background: "var(--bg-secondary)", borderRadius: "var(--radius)", padding: 24, textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <QrCode size={48} color="var(--accent)" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Safety QR Code</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: 13, marginBottom: 16 }}>Scan this in person to verify {p.name}&apos;s identity and safety profile.</p>
            <div style={{ width: 160, height: 160, background: "#fff", borderRadius: 12, margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 11, color: "#333", padding: 8, textAlign: "center" }}>QR Code<br/>{p.name}<br/>ID: {(id as string).slice(0, 8)}<br/>{p.verified ? "✅ Verified" : "⏳ Unverified"}</div>
            </div>
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Valid for 24 hours • {p.verified ? "Police Cleared" : "Pending Verification"}</p>
          </div>
        </div>
      )}
    </div>
  );
}
