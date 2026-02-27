"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { DEMO_WORKERS, toggleFavorite, getFavorites } from '@/lib/demoData';

export default function MapPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [search, setSearch] = useState('');
  const [radius, setRadius] = useState(10);
  const [selected, setSelected] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = DEMO_WORKERS.filter(w =>
    !search || w.full_name.toLowerCase().includes(search.toLowerCase()) || w.skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  useEffect(() => { if (selected) setIsFav(getFavorites().includes(selected.id)); }, [selected]);

  const initMap = useCallback(() => {
    if (mapRef.current || !containerRef.current) return;
    try {
      const L = (window as any).L;
      if (!L) { setMapError(true); return; }
      const map = L.map(containerRef.current, { zoomControl: false }).setView([43.6532, -79.3832], 13);
      L.tileLayer(isDark ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution:'\u00a9OSM', maxZoom:19 }).addTo(map);
      L.control.zoom({ position:'bottomright' }).addTo(map);
      const userIcon = L.divIcon({ className:'', html:'<div style="width:18px;height:18px;background:#6366f1;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(99,102,241,0.6);"></div>', iconSize:[18,18], iconAnchor:[9,9] });
      L.marker([43.6532, -79.3832], { icon: userIcon }).addTo(map).bindPopup('<b>\ud83d\udccd You are here</b>');
      L.circle([43.6532, -79.3832], { radius:radius*1000, color:accentColor, fillOpacity:0.05, weight:1, dashArray:'6,4' }).addTo(map);
      DEMO_WORKERS.forEach(w => {
        const ac = w.availability==='available'?'#22c55e':w.availability==='busy'?'#ef4444':'#f59e0b';
        const bg = w.availability==='available'?'linear-gradient(135deg,#22c55e,#16a34a)':w.availability==='busy'?'linear-gradient(135deg,#ef4444,#dc2626)':'linear-gradient(135deg,#6366f1,#8b5cf6)';
        const icon = L.divIcon({ className:'', html:`<div style="background:${bg};border-radius:14px;padding:4px 10px;color:white;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 4px 15px rgba(0,0,0,0.3);border:2px solid rgba(255,255,255,0.4);display:flex;align-items:center;gap:5px;cursor:pointer;"><span>\u2605${w.rating}</span><span>$${w.hourly_rate}/hr</span><span style="width:7px;height:7px;border-radius:50%;background:${ac};"></span></div>`, iconSize:[130,28], iconAnchor:[65,14] });
        L.marker([w.lat, w.lng], { icon }).addTo(map).on('click', () => setSelected(w));
      });
      mapRef.current = map;
      setMapReady(true);
    } catch(e) { console.error(e); setMapError(true); }
  }, [isDark, accentColor, radius]);

  useEffect(() => {
    if (!document.querySelector('link[href*="leaflet"]')) { const l=document.createElement('link'); l.rel='stylesheet'; l.href='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(l); }
    if ((window as any).L) { initMap(); } else { const s=document.createElement('script'); s.src='https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload=()=>setTimeout(initMap,150); s.onerror=()=>setMapError(true); document.head.appendChild(s); }
    return () => { if(mapRef.current){try{mapRef.current.remove();}catch{}mapRef.current=null;} };
  }, [initMap]);

  const handleFav = () => { if(!selected) return; const now=toggleFavorite(selected.id); setIsFav(now); };
  const ad = (a:string)=>a==='available'?'#22c55e':a==='busy'?'#ef4444':'#f59e0b';

  return (
    <div style={{ margin:'-1rem -0.75rem', height:'calc(100vh - 60px)', position:'relative' }}>
      <div style={{ position:'absolute', top:10, left:10, right:10, zIndex:1000 }}>
        <div className="max-w-lg mx-auto flex gap-2">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="\ud83d\udd0d Search workers..." style={{ flex:1, padding:'10px 16px', borderRadius:16, border:`1px solid ${t.cardBorder}`, background:isDark?'rgba(15,15,26,0.93)':'rgba(255,255,255,0.93)', color:t.text, backdropFilter:'blur(20px)', fontSize:13, outline:'none' }} />
          <button onClick={()=>router.push('/jobplace/providers')} style={{ padding:'10px 16px', borderRadius:16, background:isDark?'rgba(15,15,26,0.93)':'rgba(255,255,255,0.93)', color:t.textSecondary, border:`1px solid ${t.cardBorder}`, backdropFilter:'blur(20px)', fontSize:12, fontWeight:600, cursor:'pointer' }}>\ud83d\udccb List</button>
        </div>
        <div className="max-w-lg mx-auto flex gap-1.5 mt-2">
          {[5,10,25,50].map(r=>(<button key={r} onClick={()=>setRadius(r)} style={{ padding:'5px 14px', borderRadius:12, background:radius===r?t.accent:(isDark?'rgba(15,15,26,0.85)':'rgba(255,255,255,0.85)'), color:radius===r?'white':t.textSecondary, border:`1px solid ${radius===r?t.accent:t.cardBorder}`, fontSize:11, fontWeight:600, cursor:'pointer' }}>{r}km</button>))}
        </div>
      </div>
      <div ref={containerRef} style={{ width:'100%', height:'100%' }} />
      {!mapReady && !mapError && <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:isDark?'#0f0f1a':'#f5f7ff', gap:12 }}><div className="animate-pulse" style={{ fontSize:32 }}>\ud83d\uddfa\ufe0f</div><p style={{ color:t.textSecondary }}>Loading map...</p></div>}
      {mapError && <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:isDark?'#0f0f1a':'#f5f7ff', gap:12, padding:20 }}><p style={{ fontSize:32 }}>\u26a0\ufe0f</p><p style={{ fontWeight:600 }}>Map could not load</p><button onClick={()=>router.push('/jobplace/providers')} style={{ padding:'10px 24px', borderRadius:14, background:`linear-gradient(135deg,${t.accent},#8b5cf6)`, color:'white', border:'none', fontSize:13, fontWeight:600, cursor:'pointer' }}>Switch to List View</button></div>}
      {mapReady && <div style={{ position:'absolute', bottom:selected?210:80, left:10, zIndex:1000 }}><div style={{ padding:'6px 14px', borderRadius:12, background:isDark?'rgba(15,15,26,0.9)':'rgba(255,255,255,0.9)', color:t.text, backdropFilter:'blur(16px)', border:`1px solid ${t.cardBorder}`, fontSize:12 }}>\ud83d\udfe2 {filtered.filter(w=>w.availability==='available').length} available nearby</div></div>}
      {selected && (
        <div style={{ position:'absolute', bottom:70, left:8, right:8, zIndex:1001 }}>
          <div className="max-w-md mx-auto" style={{ background:isDark?'rgba(15,15,26,0.96)':'rgba(255,255,255,0.96)', borderRadius:20, padding:16, border:`1px solid ${t.cardBorder}`, boxShadow:'0 -4px 30px rgba(0,0,0,0.2)', backdropFilter:'blur(24px)' }}>
            <button onClick={()=>setSelected(null)} style={{ position:'absolute', top:16, right:16, color:t.textMuted, background:'none', border:'none', fontSize:18, cursor:'pointer' }}>\u2715</button>
            <div style={{ display:'flex', gap:12 }}>
              <div onClick={()=>router.push(`/worker/${selected.id}`)} style={{ width:54, height:54, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:700, background:`linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color:t.accent, cursor:'pointer', flexShrink:0, position:'relative' }}>
                {selected.full_name.split(' ').map((n:string)=>n[0]).join('')}
                <div style={{ position:'absolute', bottom:-2, right:-2, width:12, height:12, borderRadius:'50%', background:ad(selected.availability), border:`2px solid ${isDark?'#0f0f1a':'#fff'}` }}></div>
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontWeight:700, fontSize:15, margin:0 }}>{selected.full_name} {selected.is_police_verified&&'\ud83d\udee1\ufe0f'}</p>
                <p style={{ fontSize:12, color:t.textSecondary, margin:'2px 0' }}>\u2605{selected.rating} \u00b7 {selected.completed_jobs} jobs \u00b7 Trust: <span style={{ color:selected.trust_score>=80?'#22c55e':'#eab308', fontWeight:700 }}>{selected.trust_score}</span></p>
                <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>{selected.skills.map((s:string)=><span key={s} style={{ fontSize:10, padding:'2px 8px', borderRadius:20, background:t.accentLight, color:t.accent }}>{s}</span>)}</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}><span style={{ fontWeight:700, fontSize:17, color:t.accent }}>${selected.hourly_rate}</span><div style={{ fontSize:10, color:t.textMuted }}>/hr</div></div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:12 }}>
              <button onClick={()=>router.push(`/chat/${selected.id}`)} style={{ flex:1, padding:'10px', borderRadius:14, background:`linear-gradient(135deg,${t.accent},#8b5cf6)`, color:'white', border:'none', fontSize:12, fontWeight:600, cursor:'pointer' }}>\ud83d\udcac Chat</button>
              <button onClick={()=>router.push(`/worker/${selected.id}`)} style={{ flex:1, padding:'10px', borderRadius:14, background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'white', border:'none', fontSize:12, fontWeight:600, cursor:'pointer' }}>\u2705 Hire</button>
              <button onClick={handleFav} style={{ padding:'10px 14px', borderRadius:14, background:isFav?'rgba(234,179,8,0.15)':t.surface, color:isFav?'#eab308':t.textSecondary, border:`1px solid ${isFav?'rgba(234,179,8,0.3)':t.cardBorder}`, fontSize:12, cursor:'pointer' }}>{isFav?'\u2b50':'\u2606'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}