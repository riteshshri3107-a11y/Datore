"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { DEMO_WORKERS, toggleFavorite, getFavorites } from '@/lib/demoData';

const CENTER = { lat: 43.6532, lng: -79.3832 };

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

const ALL_SKILLS = Array.from(new Set(DEMO_WORKERS.flatMap(w => w.skills)));

export default function MapPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [search, setSearch] = useState('');
  const [radius, setRadius] = useState(10);
  const [skillFilter, setSkillFilter] = useState('All');
  const [selected, setSelected] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const mapRef = useRef<any>(null);
  const circleRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter workers by search, skill, and radius
  const filtered = DEMO_WORKERS.filter(w => {
    const dist = distanceKm(CENTER.lat, CENTER.lng, w.lat, w.lng);
    const inRadius = dist <= radius;
    const matchSearch = !search || w.full_name.toLowerCase().includes(search.toLowerCase()) || w.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchSkill = skillFilter === 'All' || w.skills.includes(skillFilter);
    return inRadius && matchSearch && matchSkill;
  });

  const availableCount = filtered.filter(w => w.availability === 'available').length;

  useEffect(() => { if (selected) setIsFav(getFavorites().includes(selected.id)); }, [selected]);

  // Initialize map once
  const initMap = useCallback(() => {
    if (mapRef.current || !containerRef.current) return;
    try {
      const L = (window as any).L;
      if (!L) { setMapError(true); return; }
      const map = L.map(containerRef.current, { zoomControl: false }).setView([CENTER.lat, CENTER.lng], 13);
      L.tileLayer(isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { attribution: 'OSM', maxZoom: 19 }
      ).addTo(map);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.control.scale({ position: 'bottomleft', metric: true, imperial: false, maxWidth: 150 }).addTo(map);

      // User location marker
      const userIcon = L.divIcon({
        className: '',
        html: '<div style="width:18px;height:18px;background:#6366f1;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(99,102,241,0.6);"></div>',
        iconSize: [18, 18], iconAnchor: [9, 9]
      });
      L.marker([CENTER.lat, CENTER.lng], { icon: userIcon }).addTo(map).bindPopup('<b>You are here</b>');

      // Radius circle
      circleRef.current = L.circle([CENTER.lat, CENTER.lng], {
        radius: radius * 1000,
        color: accentColor || '#6366f1',
        fillOpacity: 0.05, weight: 2, dashArray: '8,6'
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
    } catch (e) { console.error(e); setMapError(true); }
  }, [isDark, accentColor]);

  // Load Leaflet
  useEffect(() => {
    if (!document.querySelector('link[href*="leaflet"]')) {
      const l = document.createElement('link'); l.rel = 'stylesheet';
      l.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(l);
    }
    if ((window as any).L) { initMap(); } else {
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = () => setTimeout(initMap, 200);
      s.onerror = () => setMapError(true);
      document.head.appendChild(s);
    }
    return () => { if (mapRef.current) { try { mapRef.current.remove(); } catch {} mapRef.current = null; } };
  }, [initMap]);

  // Update circle + markers when radius/search/skill changes
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    const L = (window as any).L;
    if (!L) return;

    // Update radius circle
    if (circleRef.current) {
      circleRef.current.setRadius(radius * 1000);
    }

    // Adjust zoom based on radius
    const zoomMap: Record<number, number> = { 5: 14, 10: 13, 25: 12, 50: 11 };
    const zoom = radius <= 3 ? 15 : radius <= 7 ? 14 : radius <= 15 ? 13 : radius <= 30 ? 12 : 11;
    mapRef.current.setView([CENTER.lat, CENTER.lng], zoomMap[radius] || zoom, { animate: true });

    // Clear old markers
    markersRef.current.forEach(m => { try { mapRef.current.removeLayer(m); } catch {} });
    markersRef.current = [];

    // Add filtered workers
    filtered.forEach(w => {
      const ac = w.availability === 'available' ? '#22c55e' : w.availability === 'busy' ? '#ef4444' : '#f59e0b';
      const bg = w.availability === 'available'
        ? 'linear-gradient(135deg,#22c55e,#16a34a)'
        : w.availability === 'busy'
          ? 'linear-gradient(135deg,#ef4444,#dc2626)'
          : 'linear-gradient(135deg,#f59e0b,#d97706)';
      const icon = L.divIcon({
        className: '',
        html: `<div style="background:${bg};border-radius:14px;padding:4px 10px;color:white;font-size:11px;font-weight:700;white-space:nowrap;box-shadow:0 4px 15px rgba(0,0,0,0.3);border:2px solid rgba(255,255,255,0.4);display:flex;align-items:center;gap:5px;cursor:pointer;">` +
              `<span style="font-size:12px;">*${w.rating}</span>` +
              `<span>$${w.hourly_rate}/hr</span>` +
              `<span style="width:7px;height:7px;border-radius:50%;background:${ac};"></span></div>`,
        iconSize: [130, 28], iconAnchor: [65, 14]
      });
      const marker = L.marker([w.lat, w.lng], { icon }).addTo(mapRef.current);
      marker.on('click', () => setSelected(w));
      markersRef.current.push(marker);
    });
  }, [radius, search, skillFilter, mapReady, filtered]);

  const handleFav = () => { if (!selected) return; const now = toggleFavorite(selected.id); setIsFav(now); };

  return (
    <div style={{ margin: '-1rem -0.75rem', height: 'calc(100vh - 60px)', position: 'relative' }}>
      {/* Top controls */}
      <div style={{ position: 'absolute', top: 10, left: 10, right: 10, zIndex: 1000 }}>
        <div className=" flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or skill..."
            style={{ flex: 1, padding: '10px 16px', borderRadius: 16, border: `1px solid ${t.cardBorder}`, background: isDark ? 'rgba(15,15,26,0.93)' : 'rgba(255,255,255,0.93)', color: t.text, backdropFilter: 'blur(20px)', fontSize: 13, outline: 'none' }} />
          <button onClick={() => router.push('/jobplace/providers')}
            style={{ padding: '10px 16px', borderRadius: 16, background: isDark ? 'rgba(15,15,26,0.93)' : 'rgba(255,255,255,0.93)', color: t.textSecondary, border: `1px solid ${t.cardBorder}`, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>List</button>
        </div>

        {/* Radius selector */}
        <div className=" flex gap-1.5 mt-2">
          {[5, 10, 25, 50].map(r => (
            <button key={r} onClick={() => setRadius(r)}
              style={{ padding: '5px 14px', borderRadius: 12, background: radius === r ? (accentColor || '#6366f1') : (isDark ? 'rgba(15,15,26,0.85)' : 'rgba(255,255,255,0.85)'), color: radius === r ? 'white' : t.textSecondary, border: `1px solid ${radius === r ? (accentColor || '#6366f1') : t.cardBorder}`, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
              {r}km
            </button>
          ))}
          <div style={{ flex: 1 }}></div>
          <span style={{ padding: '5px 10px', borderRadius: 12, background: isDark ? 'rgba(15,15,26,0.85)' : 'rgba(255,255,255,0.85)', color: t.accent, border: `1px solid ${t.cardBorder}`, fontSize: 11, fontWeight: 700 }}>
            {filtered.length} workers
          </span>
        </div>

        {/* Range Slider */}
        <div className="flex items-center gap-3 mt-1.5 px-1">
          <span style={{ fontSize:10, color:t.textMuted, minWidth:28 }}>1km</span>
          <input type="range" min={1} max={50} value={radius} onChange={e => setRadius(Number(e.target.value))} style={{ flex:1, accentColor: accentColor||'#6366f1', height:4, cursor:'pointer' }} />
          <span style={{ fontSize:10, color:t.textMuted, minWidth:32 }}>50km</span>
          <span style={{ fontSize:11, fontWeight:700, color:t.accent, minWidth:40, textAlign:'right' }}>{radius}km</span>
        </div>

        {/* Skill filter */}
        <div className=" flex gap-1 mt-2 overflow-x-auto pb-1">
          <button onClick={() => setSkillFilter('All')}
            style={{ padding: '4px 12px', borderRadius: 10, background: skillFilter === 'All' ? (accentColor || '#6366f1') : (isDark ? 'rgba(15,15,26,0.8)' : 'rgba(255,255,255,0.8)'), color: skillFilter === 'All' ? 'white' : t.textSecondary, border: `1px solid ${skillFilter === 'All' ? 'transparent' : t.cardBorder}`, fontSize: 10, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            All Skills
          </button>
          {ALL_SKILLS.map(sk => (
            <button key={sk} onClick={() => setSkillFilter(sk)}
              style={{ padding: '4px 12px', borderRadius: 10, background: skillFilter === sk ? (accentColor || '#6366f1') : (isDark ? 'rgba(15,15,26,0.8)' : 'rgba(255,255,255,0.8)'), color: skillFilter === sk ? 'white' : t.textSecondary, border: `1px solid ${skillFilter === sk ? 'transparent' : t.cardBorder}`, fontSize: 10, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              {sk}
            </button>
          ))}
        </div>
      </div>

      {/* Map container */}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

      {/* Loading / Error states */}
      {!mapReady && !mapError && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isDark ? '#0f0f1a' : '#f5f7ff', gap: 12 }}>
          <div className="animate-pulse" style={{ fontSize: 24, fontWeight: 700, color: t.accent }}>Loading Map...</div>
          <p style={{ color: t.textSecondary, fontSize: 13 }}>Connecting to OpenStreetMap</p>
        </div>
      )}
      {mapError && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isDark ? '#0f0f1a' : '#f5f7ff', gap: 12, padding: 20 }}>
          <p style={{ fontWeight: 600, fontSize: 18 }}>Map could not load</p>
          <p style={{ color: t.textSecondary, fontSize: 13 }}>CDN may be blocked. Try the list view instead.</p>
          <button onClick={() => router.push('/jobplace/providers')} style={{ padding: '10px 24px', borderRadius: 14, background: `linear-gradient(135deg,${t.accent},#8b5cf6)`, color: 'white', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Switch to List View</button>
        </div>
      )}

      {/* Bottom stats bar */}
      {mapReady && (
        <div style={{ position: 'absolute', bottom: selected ? 210 : 80, left: 10, zIndex: 1000 }}>
          <div style={{ padding: '6px 14px', borderRadius: 12, background: isDark ? 'rgba(15,15,26,0.9)' : 'rgba(255,255,255,0.9)', color: t.text, backdropFilter: 'blur(16px)', border: `1px solid ${t.cardBorder}`, fontSize: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }}></span>
            <span>{availableCount} available</span>
            <span style={{ color: t.textMuted }}>|</span>
            <span style={{ color: t.textMuted }}>{filtered.length} total in {radius}km</span>
            {skillFilter !== 'All' && <><span style={{ color: t.textMuted }}>|</span><span style={{ color: t.accent }}>{skillFilter}</span></>}
          </div>
        </div>
      )}

      {/* Selected worker card */}
      {selected && (
        <div style={{ position: 'absolute', bottom: 70, left: 8, right: 8, zIndex: 1001 }}>
          <div className="" style={{ background: isDark ? 'rgba(15,15,26,0.96)' : 'rgba(255,255,255,0.96)', borderRadius: 20, padding: 16, border: `1px solid ${t.cardBorder}`, boxShadow: '0 -4px 30px rgba(0,0,0,0.2)', backdropFilter: 'blur(24px)' }}>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 16, right: 16, color: t.textMuted, background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', fontWeight: 700 }}>X</button>
            <div style={{ display: 'flex', gap: 12 }}>
              <div onClick={() => router.push(`/worker/${selected.id}`)} style={{ width: 54, height: 54, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, background: `linear-gradient(135deg,${t.accent}33,#8b5cf633)`, color: t.accent, cursor: 'pointer', flexShrink: 0, position: 'relative' }}>
                {selected.full_name.split(' ').map((n: string) => n[0]).join('')}
                <div style={{ position: 'absolute', bottom: -2, right: -2, width: 12, height: 12, borderRadius: '50%', background: selected.availability === 'available' ? '#22c55e' : selected.availability === 'busy' ? '#ef4444' : '#f59e0b', border: `2px solid ${isDark ? '#0f0f1a' : '#fff'}` }}></div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 15, margin: 0 }}>{selected.full_name} {selected.is_police_verified ? '[V]' : ''}</p>
                <p style={{ fontSize: 12, color: t.textSecondary, margin: '2px 0' }}>
                  *{selected.rating} | {selected.completed_jobs} jobs | Trust: <span style={{ color: selected.trust_score >= 80 ? '#22c55e' : '#eab308', fontWeight: 700 }}>{selected.trust_score}</span>
                </p>
                <p style={{ fontSize: 10, color: t.textMuted }}>{distanceKm(CENTER.lat, CENTER.lng, selected.lat, selected.lng).toFixed(1)}km away</p>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                  {selected.skills.map((s: string) => <span key={s} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: t.accentLight, color: t.accent }}>{s}</span>)}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{ fontWeight: 700, fontSize: 17, color: t.accent }}>${selected.hourly_rate}</span>
                <div style={{ fontSize: 10, color: t.textMuted }}>/hr</div>
                {selected.fixed_rate && <div style={{ fontSize: 10, color: t.textMuted }}>${selected.fixed_rate} fixed</div>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button onClick={() => router.push(`/chat/${selected.id}`)} style={{ flex: 1, padding: '10px', borderRadius: 14, background: `linear-gradient(135deg,${t.accent},#8b5cf6)`, color: 'white', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Chat</button>
              <button onClick={() => router.push(`/worker/${selected.id}`)} style={{ flex: 1, padding: '10px', borderRadius: 14, background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: 'white', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Hire</button>
              <button onClick={() => router.push(`/qr-verify`)} style={{ padding: '10px 14px', borderRadius: 14, background: 'rgba(6,182,212,0.12)', color: '#06b6d4', border: `1px solid #06b6d433`, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>QR</button>
              <button onClick={handleFav} style={{ padding: '10px 14px', borderRadius: 14, background: isFav ? 'rgba(234,179,8,0.15)' : t.surface, color: isFav ? '#eab308' : t.textSecondary, border: `1px solid ${t.cardBorder}`, fontSize: 12, cursor: 'pointer' }}>{isFav ? 'Saved' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
