"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';
import { JOB_CATEGORIES } from '@/types';

const DEMO_PROVIDERS = [
  { id: '1', name: 'Maria Santos', skills: ['Babysitting'], lat: 43.6532, lng: -79.3832, rating: 4.9, hourly_rate: 22, availability: 'available', trust_score: 92, completed_jobs: 52, is_verified: true },
  { id: '2', name: 'James O\'Brien', skills: ['Plumbing'], lat: 43.6611, lng: -79.3957, rating: 4.7, hourly_rate: 45, availability: 'available', trust_score: 88, completed_jobs: 38, is_verified: true },
  { id: '3', name: 'Priya Sharma', skills: ['Cleaning'], lat: 43.6405, lng: -79.3711, rating: 4.8, hourly_rate: 28, availability: 'busy', trust_score: 95, completed_jobs: 71, is_verified: true },
  { id: '4', name: 'David Chen', skills: ['Tutoring'], lat: 43.6702, lng: -79.4003, rating: 4.6, hourly_rate: 40, availability: 'available', trust_score: 85, completed_jobs: 28, is_verified: false },
  { id: '5', name: 'Aisha Hassan', skills: ['Pet Care'], lat: 43.6480, lng: -79.3550, rating: 4.9, hourly_rate: 20, availability: 'available', trust_score: 94, completed_jobs: 60, is_verified: true },
  { id: '6', name: 'Alex Kim', skills: ['Moving'], lat: 43.6560, lng: -79.4150, rating: 4.5, hourly_rate: 30, availability: 'scheduled', trust_score: 78, completed_jobs: 22, is_verified: false },
  { id: '7', name: 'Rosa Martinez', skills: ['Cooking'], lat: 43.6650, lng: -79.3650, rating: 4.8, hourly_rate: 35, availability: 'available', trust_score: 90, completed_jobs: 45, is_verified: true },
  { id: '8', name: 'Tom Wilson', skills: ['Gardening'], lat: 43.6350, lng: -79.4050, rating: 4.4, hourly_rate: 25, availability: 'available', trust_score: 82, completed_jobs: 19, is_verified: true },
];

export default function MapPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [search, setSearch] = useState('');
  const [radius, setRadius] = useState(10);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [mapReady, setMapReady] = useState(false);

  const filtered = DEMO_PROVIDERS.filter(w =>
    !search || w.skills.some(s => s.toLowerCase().includes(search.toLowerCase())) || w.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const loadMap = async () => {
      const L = await import('leaflet');
      await import('leaflet/dist/leaflet.css');

      if (mapInstance.current) mapInstance.current.remove();

      const map = L.map(mapRef.current!, { zoomControl: false }).setView([43.6532, -79.3832], 13);

      L.tileLayer(isDark
        ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
        : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        { attribution: '©OpenStreetMap ©CARTO', maxZoom: 19 }
      ).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // User location
      const userIcon = L.divIcon({ className: 'custom-marker', html: '<div style="width:16px;height:16px;background:#6366f1;border-radius:50%;border:3px solid white;box-shadow:0 0 10px rgba(99,102,241,0.5);"></div>', iconSize: [16, 16], iconAnchor: [8, 8] });
      L.marker([43.6532, -79.3832], { icon: userIcon }).addTo(map).bindPopup('<b>📍 You are here</b>');

      // Radius circle
      L.circle([43.6532, -79.3832], { radius: radius * 1000, color: accentColor, fillColor: accentColor, fillOpacity: 0.05, weight: 1, dashArray: '5,5' }).addTo(map);

      // Worker markers
      filtered.forEach(w => {
        const avColor = w.availability === 'available' ? '#22c55e' : w.availability === 'busy' ? '#ef4444' : '#f59e0b';
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `<div class="marker-pin ${w.availability === 'available' ? 'available' : ''}" style="display:flex;align-items:center;gap:4px;">
            <span style="font-size:14px;">${w.skills[0] === 'Babysitting' ? '👶' : w.skills[0] === 'Plumbing' ? '🔧' : w.skills[0] === 'Cleaning' ? '🧹' : w.skills[0] === 'Tutoring' ? '📚' : w.skills[0] === 'Pet Care' ? '🐕' : w.skills[0] === 'Moving' ? '🚚' : w.skills[0] === 'Cooking' ? '🍳' : '🌿'}</span>
            <span>★${w.rating} · $${w.hourly_rate}/hr</span>
            <span style="width:8px;height:8px;border-radius:50%;background:${avColor};"></span>
          </div>`,
          iconSize: [150, 32], iconAnchor: [75, 16]
        });

        L.marker([w.lat, w.lng], { icon }).addTo(map).on('click', () => setSelectedWorker(w));
      });

      mapInstance.current = map;
      setMapReady(true);
    };

    loadMap();
    return () => { if (mapInstance.current) mapInstance.current.remove(); };
  }, [isDark, search, radius, accentColor]);

  const availColor = (a: string) => a === 'available' ? '#22c55e' : a === 'busy' ? '#ef4444' : '#f59e0b';
  const trustColor = (s: number) => s >= 80 ? '#22c55e' : s >= 60 ? '#eab308' : '#ef4444';

  return (
    <div className="animate-fade-in" style={{ margin: '-1rem -0.75rem', height: 'calc(100vh - 56px)' }}>
      {/* Search overlay */}
      <div className="absolute top-16 left-0 right-0 z-10 px-3">
        <div className="max-w-4xl mx-auto flex gap-2">
          <div className="flex-1 relative">
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search workers... (Babysitter, Plumber)"
              className="glass-input w-full px-4 py-3 rounded-2xl text-sm pr-20"
              style={{ background: isDark ? 'rgba(15,15,26,0.9)' : 'rgba(255,255,255,0.9)', color: t.text, borderColor: t.cardBorder, backdropFilter: 'blur(20px)' }} />
            <button onClick={() => router.back()} className="absolute right-2 top-1/2 -translate-y-1/2 glass-button px-3 py-1.5 rounded-xl text-xs"
              style={{ background: t.surface, color: t.textSecondary }}>← Back</button>
          </div>
        </div>
        {/* Radius filter */}
        <div className="max-w-4xl mx-auto flex gap-1.5 mt-2">
          {[5, 10, 25, 50].map(r => (
            <button key={r} onClick={() => setRadius(r)}
              className="glass-button px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{ background: radius === r ? t.accent : (isDark ? 'rgba(15,15,26,0.85)' : 'rgba(255,255,255,0.85)'), color: radius === r ? 'white' : t.textSecondary, borderColor: radius === r ? t.accent : t.cardBorder, backdropFilter: 'blur(20px)' }}>
              {r}km
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }}></div>

      {/* Worker detail panel */}
      {selectedWorker && (
        <div className="fixed bottom-0 left-0 right-0 z-20 p-3 md:pb-3 pb-20">
          <div className="max-w-md mx-auto glass-card rounded-2xl p-4"
            style={{ background: isDark ? 'rgba(15,15,26,0.95)' : 'rgba(255,255,255,0.95)', borderColor: t.cardBorder, boxShadow: t.shadow, backdropFilter: 'blur(24px)' }}>
            <button onClick={() => setSelectedWorker(null)} className="absolute top-3 right-3 text-sm" style={{ color: t.textMuted }}>✕</button>

            <div className="flex items-start gap-3">
              <div className="relative">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold"
                  style={{ background: `linear-gradient(135deg, ${t.accent}33, #8b5cf633)`, color: t.accent }}>
                  {selectedWorker.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2"
                  style={{ background: availColor(selectedWorker.availability), borderColor: isDark ? '#0f0f1a' : '#fff' }}></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-base">{selectedWorker.name}</h3>
                  {selectedWorker.is_verified && <span>🛡️</span>}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-sm" style={{ color: '#f59e0b' }}>★ {selectedWorker.rating}</span>
                  <span className="text-xs" style={{ color: t.textMuted }}>• {selectedWorker.completed_jobs} jobs</span>
                  <span className="text-xs font-bold" style={{ color: trustColor(selectedWorker.trust_score) }}>🔰 {selectedWorker.trust_score}/100</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {selectedWorker.skills.map((s: string) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full" style={{ background: t.accentLight, color: t.accent }}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg" style={{ color: t.accent }}>${selectedWorker.hourly_rate}</p>
                <p className="text-xs" style={{ color: t.textMuted }}>/hr</p>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button className="btn-accent flex-1 py-2.5 rounded-xl text-sm">💬 Chat</button>
              <button className="btn-accent flex-1 py-2.5 rounded-xl text-sm" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', boxShadow: '0 4px 15px rgba(34,197,94,0.3)' }}>✅ Hire Now</button>
              <button onClick={() => router.push(`/worker/${selectedWorker.id}`)} className="glass-button py-2.5 px-4 rounded-xl text-xs font-medium"
                style={{ background: t.surface, color: t.textSecondary, borderColor: t.cardBorder }}>Profile</button>
            </div>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="absolute bottom-20 md:bottom-3 left-3 z-10">
        <div className="glass-button px-3 py-2 rounded-xl text-xs"
          style={{ background: isDark ? 'rgba(15,15,26,0.85)' : 'rgba(255,255,255,0.85)', color: t.textSecondary, backdropFilter: 'blur(20px)', borderColor: t.cardBorder }}>
          🟢 {filtered.filter(w => w.availability === 'available').length} available nearby
        </div>
      </div>
    </div>
  );
}
