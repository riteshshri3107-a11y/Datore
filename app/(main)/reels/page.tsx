"use client";
export const dynamic = "force-dynamic";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/useThemeStore";
import { getTheme } from "@/lib/theme";
import { IcoBack, IcoHeart, IcoChat, IcoSend, IcoUser, IcoBookmark, IcoMusic, IcoMic, IcoClose } from "@/components/Icons";
import { createReel as dbCreateReel, deleteReel as dbDeleteReel, getSession } from "@/lib/supabase";

interface Reel {
  id: string;
  user: string;
  verified: boolean;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  cat: string;
  duration: string;
  music: string;
  hashtags: string[];
  scene: string;  // Large scene emoji
  gradient: string; // Background gradient for video feel
  sceneLabel: string; // Scene description overlay
}

const REELS: Reel[] = [
  { id:"r1", user:"Anita Sharma", verified:true, caption:"Quick tip: How I organize my cleaning supplies for efficiency!", likes:2340, comments:182, shares:120, saves:89, cat:"Cleaning", duration:"0:45", music:"Chill Vibes - LoFi Beats", hashtags:["cleaning","tips","datore","organization"], scene:"🧹🧼✨", gradient:"linear-gradient(160deg,#0a2e1a 0%,#134e2e 40%,#1a3a2a 100%)", sceneLabel:"Cleaning Organization Tips" },
  { id:"r2", user:"Mike Chen", verified:true, caption:"Watch me fix a leaky faucet in under 10 minutes", likes:8910, comments:560, shares:430, saves:312, cat:"Plumbing", duration:"0:58", music:"Do It Yourself - Maker Music", hashtags:["plumbing","diy","howto","fixitup"], scene:"🔧💧🚰", gradient:"linear-gradient(160deg,#1a1a3e 0%,#2a2a5e 40%,#1e1e4a 100%)", sceneLabel:"DIY Faucet Repair" },
  { id:"r3", user:"Priya K.", verified:false, caption:"Fun math trick I teach my students! Makes multiplication easy", likes:12030, comments:890, shares:670, saves:445, cat:"Education", duration:"0:32", music:"Study Session - BrainWave", hashtags:["tutoring","education","mathisfun","students"], scene:"📐✏️🧮", gradient:"linear-gradient(160deg,#2e1a3e 0%,#4a2a6e 40%,#3a1a5a 100%)", sceneLabel:"Math Made Easy" },
  { id:"r4", user:"David L.", verified:false, caption:"Spring garden prep - what to plant in March in Toronto", likes:4450, comments:340, shares:210, saves:178, cat:"Gardening", duration:"1:15", music:"Nature Sounds - Ambient", hashtags:["gardening","spring","toronto","plants"], scene:"🌱🌻🪴", gradient:"linear-gradient(160deg,#1a2e0a 0%,#2e4e1a 40%,#1a3a0a 100%)", sceneLabel:"Spring Garden Prep" },
  { id:"r5", user:"Sarah Chen", verified:true, caption:"Behind the scenes: A day in the life of a Datore top worker", likes:21000, comments:1560, shares:890, saves:623, cat:"Lifestyle", duration:"2:30", music:"Hustle Mode - Trap Beats", hashtags:["datorelife","worker","topworker","bts"], scene:"💼🌟📱", gradient:"linear-gradient(160deg,#1a1a2e 0%,#2e2e5a 40%,#3a2a4a 100%)", sceneLabel:"Day In The Life" },
  { id:"r6", user:"Tom Rodriguez", verified:false, caption:"Best tacos in the neighborhood! My secret recipe", likes:6780, comments:445, shares:320, saves:256, cat:"Food", duration:"1:05", music:"Cooking Time - Jazz", hashtags:["cooking","tacos","recipe","foodie"], scene:"🌮🔥🍳", gradient:"linear-gradient(160deg,#2e1a0a 0%,#4e2e1a 40%,#3a2a1a 100%)", sceneLabel:"Secret Taco Recipe" },
  { id:"r7", user:"Lisa Park", verified:true, caption:"5-minute morning workout you can do anywhere", likes:15400, comments:1120, shares:780, saves:512, cat:"Fitness", duration:"0:48", music:"Pump It Up - Gym Mix", hashtags:["fitness","workout","morning","health"], scene:"💪🏋️‍♀️⚡", gradient:"linear-gradient(160deg,#0a1a2e 0%,#1a3e5e 40%,#0a2a4a 100%)", sceneLabel:"Morning Workout" },
  { id:"r8", user:"James Wilson", verified:false, caption:"Drone footage of Toronto skyline at sunset", likes:9200, comments:670, shares:540, saves:389, cat:"Photography", duration:"0:35", music:"Sunset Vibes - Chillstep", hashtags:["drone","toronto","skyline","sunset","photography"], scene:"🏙️🌅📸", gradient:"linear-gradient(160deg,#2e1a1a 0%,#5e3a2a 40%,#4a2a2a 100%)", sceneLabel:"Toronto Sunset Drone" },
];

const CATS = ["For You","Following","Trending","Cleaning","Education","Lifestyle","Food","Fitness","Photography"];
const DURATIONS = ["15s","30s","60s","3min"];
const FILTERS = ["None","Warm","Cool","Vintage","BW","Bright","Dramatic","Soft Focus"];
const MUSIC_LIB = ["Chill Vibes - LoFi","DIY - Maker Music","Study - BrainWave","Hustle - Trap","Cooking - Jazz","Pump It Up - Gym","Sunset - Chillstep","Happy Days - Pop","Epic - Cinematic"];

function formatNum(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export default function ReelsPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);

  const [current, setCurrent] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [following, setFollowing] = useState<string[]>(["r1", "r5"]);
  const [blocked, setBlocked] = useState<string[]>([]);
  const [cat, setCat] = useState("For You");
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Record<string, Array<{ user: string; text: string; likes: number; time: string }>>>({});
  const [voiceSrch, setVoiceSrch] = useState(false);
  const [createStep, setCreateStep] = useState<string>("upload");
  const [reelCaption, setReelCaption] = useState("");
  const [reelDuration, setReelDuration] = useState("30s");
  const [reelFilter, setReelFilter] = useState("None");
  const [reelMusic, setReelMusic] = useState("");
  const [reelAudience, setReelAudience] = useState("public");
  const [reelTags, setReelTags] = useState("");
  const videoRef = useRef<HTMLInputElement>(null);
  const [myReels, setMyReels] = useState<Reel[]>([]);
  const [editingComment, setEditingComment] = useState<{reelId:string;idx:number}|null>(null);
  const [editCommentText, setEditCommentText] = useState("");

  var allReels = (myReels as Reel[]).concat(REELS);
  const visibleReels = allReels.filter(function(r) { return !blocked.includes(r.user); });
  const idx = current % Math.max(visibleReels.length, 1);
  const reel = visibleReels[idx];
  const isLiked = reel ? liked.includes(reel.id) : false;
  const isSaved = reel ? saved.includes(reel.id) : false;
  const isFollowing = reel ? following.includes(reel.id) : false;

  function goNext() { setCurrent(function(p) { return (p + 1) % Math.max(visibleReels.length, 1); }); }
  function toggleLike() { if (!reel) return; setLiked(function(p) { return p.includes(reel.id) ? p.filter(function(x) { return x !== reel.id; }) : p.concat([reel.id]); }); }
  function toggleSave() { if (!reel) return; setSaved(function(p) { return p.includes(reel.id) ? p.filter(function(x) { return x !== reel.id; }) : p.concat([reel.id]); }); }
  function toggleFollow() { if (!reel) return; setFollowing(function(p) { return p.includes(reel.id) ? p.filter(function(x) { return x !== reel.id; }) : p.concat([reel.id]); }); }

  function addComment() {
    if (!commentText.trim() || !reel) return;
    var entry = { user: "You", text: commentText.trim(), likes: 0, time: "Just now" };
    setComments(function(p) {
      var prev = p[reel.id] || [];
      var next: Record<string, Array<{ user: string; text: string; likes: number; time: string }>> = {};
      Object.keys(p).forEach(function(k) { next[k] = p[k]; });
      next[reel.id] = prev.concat([entry]);
      return next;
    });
    setCommentText("");
  }

  function shareToSocial(platform: string) {
    if (!reel) return;
    var msg = encodeURIComponent("Check out this Datore Reel by " + reel.user);
    var url = encodeURIComponent("https://datore.vercel.app/reels");
    var link = "";
    if (platform === "whatsapp") { link = "https://wa.me/?text=" + msg + "%20" + url; }
    else if (platform === "facebook") { link = "https://www.facebook.com/sharer/sharer.php?u=" + url; }
    else if (platform === "twitter") { link = "https://twitter.com/intent/tweet?text=" + msg + "&url=" + url; }
    else if (platform === "copy") {
      if (navigator.clipboard) { navigator.clipboard.writeText(reel.user + ": " + reel.caption); }
      setShowShare(false);
      return;
    }
    if (link) { window.open(link, "_blank"); }
    setShowShare(false);
  }

  async function publishReel() {
    var newReel: Reel = {
      id: "my-" + Date.now(), user: "You", verified: false, caption: reelCaption || "My new reel",
      likes: 0, comments: 0, shares: 0, saves: 0, cat: "Lifestyle", duration: reelDuration,
      music: reelMusic, hashtags: reelTags.split(",").map(function(t) { return t.trim(); }).filter(Boolean),
      scene: "🎬✨🌟", gradient: "linear-gradient(160deg,#1a1a3e 0%,#3a2a5e 40%,#2a1a4a 100%)", sceneLabel: reelCaption || "My Reel"
    };
    setMyReels(function(p) { return [newReel].concat(p); });
    setShowCreate(false);
    setCreateStep("upload");
    setReelCaption("");
    setReelMusic("");
    setReelTags("");
    setReelFilter("None");
    // Persist to DB
    try {
      var sess = await getSession();
      var userId = sess?.data?.session?.user?.id;
      if (userId) await dbCreateReel({ author_id: userId, author_name: "You", caption: newReel.caption, duration: newReel.duration, music: newReel.music, hashtags: newReel.hashtags, audience: reelAudience });
    } catch(e) {}
  }

  async function deleteMyReel(reelId: string) {
    setMyReels(function(p) { return p.filter(function(r) { return r.id !== reelId; }); });
    // Persist to DB
    try { await dbDeleteReel(reelId); } catch(e) {}
  }

  function deleteMyComment(reelId: string, idx: number) {
    setComments(function(p) {
      var next: Record<string, Array<{ user: string; text: string; likes: number; time: string }>> = {};
      Object.keys(p).forEach(function(k) { next[k] = p[k]; });
      next[reelId] = (next[reelId] || []).filter(function(_, i) { return i !== idx; });
      return next;
    });
  }

  function saveEditComment() {
    if (!editingComment || !editCommentText.trim()) return;
    setComments(function(p) {
      var next: Record<string, Array<{ user: string; text: string; likes: number; time: string }>> = {};
      Object.keys(p).forEach(function(k) { next[k] = p[k]; });
      next[editingComment.reelId] = (next[editingComment.reelId] || []).map(function(c, i) {
        return i === editingComment.idx ? { ...c, text: editCommentText.trim() } : c;
      });
      return next;
    });
    setEditingComment(null);
    setEditCommentText("");
  }

  function voiceS() {
    setVoiceSrch(true);
    setTimeout(function() { setVoiceSrch(false); }, 2000);
  }

  if (!reel) {
    return (
      <div className="p-8 text-center text-xs" style={{ color: t.textMuted }}>
        No reels available
      </div>
    );
  }

  var initials = reel.user.split(" ").map(function(n) { return n[0]; }).join("");
  var reelComments = comments[reel.id] || [];
  var totalComments = reel.comments + reelComments.length;

  return (
    <div className="animate-fade-in" style={{ margin: "-1rem -0.75rem" }}>
      {/* Top Bar */}
      <div style={{ position: "sticky", top: 0, zIndex: 10, padding: "8px 12px", display: "flex", gap: 6, alignItems: "center", background: isDark ? "rgba(15,15,26,0.9)" : "rgba(255,255,255,0.9)", backdropFilter: "blur(16px)" }}>
        <button onClick={function() { router.back(); }} style={{ background: "none", border: "none", color: t.text, cursor: "pointer", flexShrink: 0 }}>
          <IcoBack size={18} />
        </button>
        <div className="flex-1 flex gap-1 overflow-x-auto" style={{ scrollbarWidth: "none" as const }}>
          {CATS.map(function(c) {
            return (
              <button key={c} onClick={function() { setCat(c); }} style={{ padding: "4px 10px", borderRadius: 20, background: cat === c ? t.accent : "transparent", color: cat === c ? "white" : t.textSecondary, border: "none", fontSize: 10, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const }}>
                {c}
              </button>
            );
          })}
        </div>
        <button onClick={function() { setShowCreate(true); }} style={{ padding: "5px 12px", borderRadius: 10, background: "linear-gradient(135deg," + t.accent + ",#ef4444)", color: "white", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" as const, flexShrink: 0 }}>
          + Create
        </button>
        <button onClick={voiceS} style={{ background: voiceSrch ? "rgba(239,68,68,0.15)" : "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 8, flexShrink: 0 }}>
          <IcoMic size={16} color={voiceSrch ? "#ef4444" : t.textMuted} />
        </button>
      </div>

      {voiceSrch && (
        <p className="text-xs text-center animate-pulse" style={{ color: "#ef4444" }}>
          Listening...
        </p>
      )}

      {/* Full-Screen Reel — Video-like scene */}
      <div onClick={goNext} style={{ height: "calc(100vh - 130px)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", background: reel ? reel.gradient : ("linear-gradient(135deg," + t.accent + "22,#8b5cf622,#22c55e22)"), cursor: "pointer", overflow: "hidden" }}>
        {/* Scan lines for video feel */}
        <div style={{position:"absolute",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.008) 3px,rgba(255,255,255,0.008) 6px)",pointerEvents:"none",zIndex:1}} />
        {/* Live indicator */}
        <div style={{position:"absolute",top:14,left:14,display:"flex",alignItems:"center",gap:6,zIndex:10}}>
          <div style={{width:7,height:7,borderRadius:"50%",background:"#ef4444",boxShadow:"0 0 6px #ef4444"}} />
          <span style={{fontSize:9,color:"rgba(255,255,255,0.5)",fontWeight:600}}>PLAYING · {reel ? reel.duration : "0:00"}</span>
        </div>
        <div style={{ textAlign: "center", padding: 20, zIndex: 2 }}>
          {/* Large scene emojis */}
          <div style={{ fontSize: 56, marginBottom: 12, filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.4))" }}>{reel ? reel.scene : "🎬"}</div>
          {/* Scene label overlay */}
          {reel && <div style={{display:"inline-block",padding:"5px 14px",borderRadius:10,background:"rgba(0,0,0,0.4)",backdropFilter:"blur(8px)",marginBottom:12}}><p style={{fontSize:11,fontWeight:700,color:"#fff"}}>{reel.sceneLabel}</p></div>}
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg," + t.accent + ",#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 22, color: "white", fontWeight: 700, boxShadow: "0 2px 15px rgba(99,102,241,0.3)" }}>
            {initials}
          </div>
          <div className="flex items-center justify-center gap-2 mb-1">
            <p style={{ fontSize: 14, fontWeight: 600 }}>{reel.user}</p>
            {reel.verified && <span style={{ color: "#3b82f6", fontSize: 10 }}>✓</span>}
          </div>
          <p style={{ fontSize: 11, color: t.textMuted }}>{reel.cat} - {reel.duration}</p>
          {reel.music && (
            <div className="flex items-center justify-center gap-1 mt-2">
              <IcoMusic size={10} color={t.textMuted} />
              <p className="animate-pulse" style={{ fontSize: 9, color: t.textMuted }}>{reel.music}</p>
            </div>
          )}
          <div style={{ width: 180, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.15)", margin: "16px auto" }}>
            <div style={{ width: "60%", height: "100%", borderRadius: 2, background: "linear-gradient(90deg," + t.accent + ",#8b5cf6)", transition: "width 0.5s" }} />
          </div>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>Tap for next · Swipe to browse</p>
        </div>

        {/* Right Actions */}
        <div style={{ position: "absolute", right: 10, bottom: "20%", display: "flex", flexDirection: "column" as const, gap: 16, alignItems: "center" }}>
          <button onClick={function(e) { e.stopPropagation(); toggleFollow(); }} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer" }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: isFollowing ? "rgba(34,197,94,0.15)" : "rgba(99,102,241,0.15)" }}>
              <IcoUser size={16} color={isFollowing ? "#22c55e" : t.accent} />
            </div>
            <span style={{ fontSize: 8, color: t.text, fontWeight: 600 }}>{isFollowing ? "Following" : "Follow"}</span>
          </button>

          <button onClick={function(e) { e.stopPropagation(); toggleLike(); }} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer" }}>
            <IcoHeart size={26} color={isLiked ? "#ef4444" : t.text} fill={isLiked ? "#ef4444" : "none"} />
            <span style={{ fontSize: 9, color: t.text, fontWeight: 600 }}>{formatNum(reel.likes + (isLiked ? 1 : 0))}</span>
          </button>

          <button onClick={function(e) { e.stopPropagation(); setShowComments(true); }} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer" }}>
            <IcoChat size={24} color={t.text} />
            <span style={{ fontSize: 9, color: t.text }}>{formatNum(reel.comments)}</span>
          </button>

          <button onClick={function(e) { e.stopPropagation(); setShowShare(true); }} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer" }}>
            <IcoSend size={22} color={t.text} />
            <span style={{ fontSize: 9, color: t.text }}>{formatNum(reel.shares)}</span>
          </button>

          <button onClick={function(e) { e.stopPropagation(); toggleSave(); }} style={{ display: "flex", flexDirection: "column" as const, alignItems: "center", gap: 2, background: "none", border: "none", cursor: "pointer" }}>
            <IcoBookmark size={22} color={isSaved ? "#f59e0b" : t.text} fill={isSaved ? "#f59e0b" : "none"} />
            <span style={{ fontSize: 9, color: t.text }}>{formatNum(reel.saves)}</span>
          </button>

          <button onClick={function(e) { e.stopPropagation(); setShowMore(true); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: t.text }}>
            ...
          </button>
        </div>

        {/* Bottom Caption */}
        <div style={{ position: "absolute", bottom: 12, left: 12, right: 60, padding: 12, borderRadius: 16, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(10px)" }}>
          <div className="flex items-center gap-2 mb-1">
            <p style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{reel.user}</p>
            {reel.verified && <span style={{ fontSize: 9, background: "#3b82f6", color: "white", padding: "1px 5px", borderRadius: 8, fontWeight: 700 }}>✓</span>}
            {!isFollowing && (
              <button onClick={function(e) { e.stopPropagation(); toggleFollow(); }} style={{ fontSize: 9, background: "rgba(255,255,255,0.2)", color: "white", padding: "2px 8px", borderRadius: 8, border: "none", fontWeight: 600, cursor: "pointer" }}>
                Follow
              </button>
            )}
          </div>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.9)", lineHeight: 1.4 }}>{reel.caption}</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {reel.hashtags.map(function(h) {
              return <span key={h} style={{ fontSize: 9, color: "rgba(99,200,255,0.9)", fontWeight: 600 }}>#{h}</span>;
            })}
          </div>
        </div>

        {/* Reel dots */}
        <div style={{ position: "absolute", top: "50%", right: 6, display: "flex", flexDirection: "column" as const, gap: 4 }}>
          {visibleReels.map(function(_, i) {
            return <div key={i} style={{ width: 3, height: i === idx ? 16 : 8, borderRadius: 2, background: i === idx ? t.accent : "rgba(255,255,255,0.3)" }} />;
          })}
        </div>
      </div>

      {/* Comments Panel */}
      {showComments && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, maxHeight: "60vh", background: isDark ? "#1a1a2e" : "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, zIndex: 100, padding: 16, overflowY: "auto" as const, border: "1px solid " + t.cardBorder }}>
          <div className="flex items-center justify-between mb-3">
            <h3 style={{ fontWeight: 700, fontSize: 14 }}>Comments ({totalComments})</h3>
            <button onClick={function() { setShowComments(false); }}><IcoClose size={18} color={t.textMuted} /></button>
          </div>
          {[
            { user: "Maria G.", text: "So helpful! Saved this for later", likes: 23, time: "2h ago" },
            { user: "Jake R.", text: "Been looking for exactly this!", likes: 8, time: "5h ago" },
            { user: "Lily Chen", text: "Amazing work as always", likes: 45, time: "1d ago" },
          ].map(function(c, i) {
            return (
              <div key={i} className="flex gap-2 py-2" style={{ borderBottom: "1px solid " + t.cardBorder }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: t.accent + "22", color: t.accent }}>{c.user[0]}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{c.user}</span>
                    <span style={{ fontSize: 9, color: t.textMuted }}>{c.time}</span>
                  </div>
                  <p className="text-xs mt-1">{c.text}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <button style={{ fontSize: 9, color: t.textMuted, background: "none", border: "none" }}>{"<3 " + c.likes}</button>
                    <button style={{ fontSize: 9, color: t.textMuted, background: "none", border: "none" }}>Reply</button>
                  </div>
                </div>
              </div>
            );
          })}
          {reelComments.map(function(c, i) {
            return (
              <div key={"my-" + i} className="flex gap-2 py-2" style={{ borderBottom: "1px solid " + t.cardBorder }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: t.accent, color: "white" }}>Y</div>
                <div className="flex-1">
                  <span className="text-xs font-semibold">{c.user}</span>
                  <span style={{ fontSize: 9, color: t.textMuted, marginLeft: 8 }}>{c.time}</span>
                  {editingComment && editingComment.reelId === reel.id && editingComment.idx === i ? (
                    <div className="mt-1 flex gap-1">
                      <input value={editCommentText} onChange={function(e) { setEditCommentText(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") saveEditComment(); }} className="flex-1 px-2 py-1 rounded-lg text-xs outline-none" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: "1px solid " + t.cardBorder, color: t.text }} />
                      <button onClick={saveEditComment} className="text-[9px] px-2 py-1 rounded-lg font-bold text-white" style={{ background: t.accent }}>Save</button>
                      <button onClick={function() { setEditingComment(null); }} className="text-[9px] px-2 py-1 rounded-lg" style={{ color: t.textMuted }}>Cancel</button>
                    </div>
                  ) : (
                    <p className="text-xs mt-1">{c.text}</p>
                  )}
                  <div className="flex gap-2 mt-1">
                    <button onClick={function() { setEditingComment({ reelId: reel.id, idx: i }); setEditCommentText(c.text); }} style={{ fontSize: 9, color: "#3b82f6", background: "none", border: "none", cursor: "pointer" }}>Edit</button>
                    <button onClick={function() { deleteMyComment(reel.id, i); }} style={{ fontSize: 9, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>Delete</button>
                  </div>
                </div>
              </div>
            );
          })}
          <div className="flex gap-2 mt-3">
            <input value={commentText} onChange={function(e) { setCommentText(e.target.value); }} onKeyDown={function(e) { if (e.key === "Enter") addComment(); }} placeholder="Add a comment..." className="flex-1 px-4 py-2 rounded-full text-xs outline-none" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: "1px solid " + t.cardBorder, color: t.text }} />
            <button onClick={addComment} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg," + t.accent + ",#8b5cf6)" }}>
              <IcoSend size={14} color="white" />
            </button>
          </div>
        </div>
      )}

      {/* Share Panel */}
      {showShare && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.5)" }} onClick={function() { setShowShare(false); }}>
          <div onClick={function(e) { e.stopPropagation(); }} className="w-full rounded-t-2xl p-5" style={{ background: isDark ? "#1a1a2e" : "#fff" }}>
            <h3 className="text-sm font-bold mb-3">Share Reel</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: "whatsapp", l: "WhatsApp", c: "#25D366" },
                { id: "facebook", l: "Facebook", c: "#1877F2" },
                { id: "twitter", l: "X / Twitter", c: "#1DA1F2" },
                { id: "copy", l: "Copy Link", c: "#6b7280" },
              ].map(function(s) {
                return (
                  <button key={s.id} onClick={function() { shareToSocial(s.id); }} className="flex flex-col items-center gap-1 p-3 rounded-xl" style={{ background: s.c + "15" }}>
                    <span className="text-xs font-semibold" style={{ color: s.c }}>{s.l}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* More Options */}
      {showMore && (
        <div className="fixed inset-0 z-50 flex items-end" style={{ background: "rgba(0,0,0,0.5)" }} onClick={function() { setShowMore(false); }}>
          <div onClick={function(e) { e.stopPropagation(); }} className="w-full rounded-t-2xl p-4" style={{ background: isDark ? "#1a1a2e" : "#fff" }}>
            <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ background: t.cardBorder }} />
            {reel.user === "You" && ([
              { label: "Edit Caption", action: function() { setShowMore(false); setReelCaption(reel.caption); setCreateStep("details"); setShowCreate(true); }, color: "#3b82f6" },
              { label: "Delete This Reel", action: function() { deleteMyReel(reel.id); goNext(); setShowMore(false); }, color: "#ef4444" },
            ]).map(function(opt, i) {
              return (
                <button key={"own-" + i} onClick={opt.action} className="w-full flex items-center gap-3 p-3 rounded-xl text-left" style={{ color: opt.color || t.text, background: "none", border: "none", cursor: "pointer" }}>
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              );
            })}
            {[
              { label: "Mute Audio", action: function() { setShowMore(false); } },
              { label: "Copy Link", action: function() { setShowMore(false); } },
              { label: "Save Video", action: function() { setShowMore(false); } },
              { label: "Duet with this Reel", action: function() { setShowMore(false); setShowCreate(true); } },
              { label: "Not Interested", action: function() { goNext(); setShowMore(false); } },
              ...(reel.user !== "You" ? [
                { label: "Block " + reel.user, action: function() { setBlocked(function(p) { return p.concat([reel.user]); }); goNext(); setShowMore(false); }, color: "#ef4444" },
                { label: "Report Reel", action: function() { setShowMore(false); }, color: "#ef4444" },
              ] : []),
            ].map(function(opt, i) {
              return (
                <button key={i} onClick={opt.action} className="w-full flex items-center gap-3 p-3 rounded-xl text-left" style={{ color: opt.color || t.text, background: "none", border: "none", cursor: "pointer" }}>
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Reel FAB */}
      <button onClick={function() { setShowCreate(true); }} style={{ position: "fixed", bottom: 80, right: 16, width: 56, height: 56, borderRadius: 18, background: "linear-gradient(135deg," + t.accent + ",#ef4444)", color: "white", border: "none", cursor: "pointer", fontSize: 24, fontWeight: 700, boxShadow: "0 4px 20px rgba(239,68,68,0.4)", zIndex: 50 }}>
        +
      </button>

      {/* Create Reel Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.7)" }} onClick={function() { setShowCreate(false); }}>
          <div onClick={function(e) { e.stopPropagation(); }} className="w-full max-w-md rounded-2xl p-5 space-y-3 max-h-[90vh] overflow-y-auto" style={{ background: isDark ? "#1a1a2e" : "#fff" }}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Create Reel</h3>
              <button onClick={function() { setShowCreate(false); }}><IcoClose size={18} color={t.textMuted} /></button>
            </div>

            {/* Step indicator */}
            <div className="flex gap-1">
              {["upload", "edit", "details"].map(function(s) {
                var stepIdx = ["upload", "edit", "details"].indexOf(s);
                var currentIdx = ["upload", "edit", "details"].indexOf(createStep);
                return <div key={s} className="flex-1 h-1 rounded-full" style={{ background: stepIdx <= currentIdx ? t.accent : t.cardBorder }} />;
              })}
            </div>

            {createStep === "upload" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={function() { if (videoRef.current) videoRef.current.click(); }} className="h-32 rounded-xl flex flex-col items-center justify-center" style={{ border: "2px dashed " + t.accent + "55" }}>
                    <span className="text-3xl mb-1">📹</span>
                    <span className="text-xs font-semibold" style={{ color: t.accent }}>Record</span>
                  </button>
                  <button className="h-32 rounded-xl flex flex-col items-center justify-center" style={{ border: "2px dashed " + t.cardBorder }}>
                    <span className="text-3xl mb-1">📁</span>
                    <span className="text-xs font-semibold" style={{ color: "#8b5cf6" }}>Gallery</span>
                  </button>
                </div>
                <input ref={videoRef} type="file" accept="video/*" capture="environment" className="hidden" />
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, marginBottom: 4 }}>DURATION</p>
                  <div className="flex gap-2">
                    {DURATIONS.map(function(d) {
                      return (
                        <button key={d} onClick={function() { setReelDuration(d); }} className="px-3 py-1.5 rounded-lg" style={{ fontSize: 10, fontWeight: 600, background: reelDuration === d ? t.accent + "20" : t.card, color: reelDuration === d ? t.accent : t.textMuted, border: "1px solid " + (reelDuration === d ? t.accent + "44" : t.cardBorder) }}>
                          {d}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button onClick={function() { setCreateStep("edit"); }} className="w-full py-2.5 rounded-xl text-xs font-bold text-white" style={{ background: t.accent }}>
                  Next: Edit
                </button>
              </div>
            )}

            {createStep === "edit" && (
              <div className="space-y-3">
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, marginBottom: 4 }}>FILTERS</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" as const }}>
                    {FILTERS.map(function(f) {
                      return (
                        <button key={f} onClick={function() { setReelFilter(f); }} className="flex flex-col items-center gap-1 flex-shrink-0">
                          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-lg" style={{ background: reelFilter === f ? t.accent + "22" : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", border: "2px solid " + (reelFilter === f ? t.accent : "transparent") }}>
                            🎬
                          </div>
                          <span style={{ fontSize: 8, color: reelFilter === f ? t.accent : t.textMuted }}>{f}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, marginBottom: 4 }}>ADD MUSIC</p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {MUSIC_LIB.map(function(m) {
                      return (
                        <button key={m} onClick={function() { setReelMusic(reelMusic === m ? "" : m); }} className="w-full flex items-center gap-2 p-2 rounded-lg text-left" style={{ background: reelMusic === m ? t.accent + "15" : "transparent", border: "none", cursor: "pointer" }}>
                          <IcoMusic size={12} color={reelMusic === m ? t.accent : t.textMuted} />
                          <span style={{ fontSize: 10, color: reelMusic === m ? t.accent : t.text }}>{m}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={function() { setCreateStep("upload"); }} className="flex-1 py-2 rounded-xl text-xs" style={{ border: "1px solid " + t.cardBorder }}>Back</button>
                  <button onClick={function() { setCreateStep("details"); }} className="flex-1 py-2 rounded-xl text-xs font-bold text-white" style={{ background: t.accent }}>Next: Details</button>
                </div>
              </div>
            )}

            {createStep === "details" && (
              <div className="space-y-3">
                <textarea value={reelCaption} onChange={function(e) { setReelCaption(e.target.value); }} rows={3} placeholder="Write a caption... Use #hashtags" className="w-full p-3 rounded-xl text-sm outline-none resize-none" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: "1px solid " + t.cardBorder, color: t.text }} />
                <input value={reelTags} onChange={function(e) { setReelTags(e.target.value); }} placeholder="Add tags: fitness, cooking, diy..." className="w-full p-2.5 rounded-xl text-xs outline-none" style={{ background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", border: "1px solid " + t.cardBorder, color: t.text }} />
                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, marginBottom: 4 }}>WHO CAN SEE</p>
                  <div className="flex gap-2">
                    {[
                      { k: "public", l: "Public" },
                      { k: "friends", l: "Friends" },
                      { k: "followers", l: "Followers" },
                    ].map(function(a) {
                      return (
                        <button key={a.k} onClick={function() { setReelAudience(a.k); }} className="flex-1 py-2 rounded-xl" style={{ fontSize: 10, fontWeight: 600, background: reelAudience === a.k ? t.accent + "20" : t.card, color: reelAudience === a.k ? t.accent : t.textMuted, border: "1px solid " + (reelAudience === a.k ? t.accent + "44" : t.cardBorder) }}>
                          {a.l}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="p-3 rounded-xl" style={{ background: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)" }}>
                  <p style={{ fontSize: 9, fontWeight: 700, color: t.textMuted, marginBottom: 4 }}>REEL SUMMARY</p>
                  <p style={{ fontSize: 10 }}>Duration: {reelDuration} | Filter: {reelFilter}{reelMusic ? " | " + reelMusic : ""}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={function() { setCreateStep("edit"); }} className="flex-1 py-2 rounded-xl text-xs" style={{ border: "1px solid " + t.cardBorder }}>Back</button>
                  <button onClick={publishReel} className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white" style={{ background: "linear-gradient(135deg," + t.accent + ",#ef4444)" }}>Publish Reel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
