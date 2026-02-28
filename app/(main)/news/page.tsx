"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack } from '@/components/Icons';

const NEWS = [
  { id:'n1', title:'Datore Launches AI-Powered Safety Verification', category:'Product', time:'2 hours ago', summary:'New QR-based worker verification system uses AI trust scoring to ensure safety for every interaction.', featured:true },
  { id:'n2', title:'Top 10 In-Demand Skills in Toronto This Winter', category:'Industry', time:'5 hours ago', summary:'Snow removal, plumbing, and electrical top the charts as demand surges 40% this season.' },
  { id:'n3', title:'How to Earn 5 Stars: Tips from Top Workers', category:'Tips', time:'1 day ago', summary:'We interviewed 50 top-rated workers to discover the habits that earn consistent 5-star reviews.' },
  { id:'n4', title:'New Marketplace Feature: Buy & Sell Locally', category:'Product', time:'2 days ago', summary:'Browse and sell items in your neighborhood with our new integrated marketplace.' },
  { id:'n5', title:'Safety First: Emergency SOS Feature Coming Soon', category:'Safety', time:'3 days ago', summary:'One-tap SOS during jobs will alert emergency contacts with GPS location and audio recording.' },
  { id:'n6', title:'Gig Economy Report: Canada 2026', category:'Industry', time:'1 week ago', summary:'The Canadian gig economy grew 23% in 2025, with service platforms leading the charge.' },
];

const CATS = ['All','Product','Industry','Tips','Safety'];
const CAT_COLORS: Record<string,string> = { Product:'#6366f1', Industry:'#22c55e', Tips:'#f59e0b', Safety:'#ef4444' };

export default function NewsPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [cat, setCat] = useState('All');
  const [expanded, setExpanded] = useState<string|null>(null);
  const [bookmarked, setBookmarked] = useState<string[]>([]);

  const filtered = cat === 'All' ? NEWS : NEWS.filter(n => n.category === cat);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold">News & Updates</h1>
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {CATS.map(c => (
          <button key={c} onClick={()=>setCat(c)} className="px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap" style={{ background:cat===c?t.accentLight:'transparent', color:cat===c?t.accent:t.textSecondary, border:cat===c?`1px solid ${t.accent}33`:'1px solid transparent' }}>{c}</button>
        ))}
      </div>

      {filtered.map(n => (
        <div key={n.id} onClick={()=>setExpanded(expanded===n.id?null:n.id)} className="glass-card rounded-xl overflow-hidden cursor-pointer" style={{ background:t.card, borderColor:t.cardBorder }}>
          {(n as any).featured && <div className="h-1" style={{ background:`linear-gradient(90deg,${t.accent},#8b5cf6)` }} />}
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background:`${CAT_COLORS[n.category]||t.accent}22`, color:CAT_COLORS[n.category]||t.accent }}>{n.category}</span>
                  <span className="text-[10px]" style={{ color:t.textMuted }}>{n.time}</span>
                </div>
                <h3 className="font-semibold text-sm">{n.title}</h3>
                {expanded === n.id && <p className="text-xs mt-2" style={{ color:t.textSecondary, lineHeight:1.6 }}>{n.summary}</p>}
              </div>
              <button onClick={e=>{e.stopPropagation();setBookmarked(prev=>prev.includes(n.id)?prev.filter(x=>x!==n.id):[...prev,n.id]);}} className="text-lg">{bookmarked.includes(n.id)?'🔖':'📑'}</button>
            </div>
            {expanded === n.id && (
              <div className="flex gap-2 mt-3">
                <button className="px-3 py-1.5 rounded-lg text-[11px] font-medium" style={{ background:t.accentLight, color:t.accent }}>Read More</button>
                <button className="px-3 py-1.5 rounded-lg text-[11px] font-medium" style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e' }}>Share</button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
