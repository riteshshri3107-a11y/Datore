"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';
import { MARKETPLACE_LISTINGS } from '@/lib/demoData';

const CON: Record<string,string> = { 'Like New':'#22c55e', 'Excellent':'#3b82f6', 'Good':'#f59e0b', 'Fair':'#6b7280' };
const IMG: Record<string,string> = { phone:'Phone', bike:'Bike', furniture:'Chair', gaming:'Game', baby:'Baby', kitchen:'Pan', auto:'Car', outdoor:'Tent' };

export default function ListingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const l = MARKETPLACE_LISTINGS.find(x => x.id === params.id) || MARKETPLACE_LISTINGS[0];
  const [showOffer, setShowOffer] = useState(false);
  const [offer, setOffer] = useState('');
  const [sent, setSent] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const handleOffer = () => { if (!offer) return; setSent(true); setShowOffer(false); };

  const shareToSocial = (platform: string) => {
    const url = encodeURIComponent('https://datore.vercel.app');
    const msg = encodeURIComponent(`Check out ${l.title} for ${formatCurrency(l.price)} on Datore!`);
    let link = '';
    if (platform === 'whatsapp') link = `https://wa.me/?text=${msg}%20${url}`;
    else if (platform === 'facebook') link = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${msg}`;
    else if (platform === 'twitter') link = `https://twitter.com/intent/tweet?text=${msg}&url=${url}`;
    else if (platform === 'copy') { navigator.clipboard?.writeText(`${l.title} - ${formatCurrency(l.price)} on Datore - https://datore.vercel.app`); }
    if (link) window.open(link, '_blank');
    setShowShare(false);
  };

  return (
    <div className="space-y-4 animate-fade-in ">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-lg">{'<-'}</button>
        <h1 className="text-xl font-bold flex-1">Listing Details</h1>
        <button onClick={() => setShowShare(!showShare)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background:t.accentLight, color:t.accent }}>Share</button>
      </div>

      {showShare && (
        <div className="glass-card rounded-xl p-3 flex gap-2 flex-wrap" style={{ background:t.card, borderColor:t.cardBorder }}>
          {[
            { id:'whatsapp', label:'WhatsApp', color:'#25D366' },
            { id:'facebook', label:'Facebook', color:'#1877F2' },
            { id:'twitter', label:'X/Twitter', color:'#1DA1F2' },
            { id:'copy', label:'Copy Link', color:'#6b7280' },
          ].map(s => (
            <button key={s.id} onClick={() => shareToSocial(s.id)} className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ background:s.color }}>{s.label}</button>
          ))}
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden" style={{ background:t.card, borderColor:t.cardBorder }}>
        <div className="h-48 flex items-center justify-center text-3xl font-bold" style={{ background:`linear-gradient(135deg,${t.accent}15,#8b5cf615)`, color:t.accent+'66' }}>{IMG[l.img] || 'Item'}</div>
      </div>
      <div className="glass-card rounded-2xl p-5" style={{ background:t.card, borderColor:t.cardBorder }}>
        <h2 className="text-lg font-bold">{l.title}</h2>
        <p className="text-2xl font-bold mt-1" style={{ color:t.accent }}>{formatCurrency(l.price)}</p>
        <p className="text-sm mt-3" style={{ color:t.textSecondary }}>{l.desc}</p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <span className="text-xs px-3 py-1 rounded-full" style={{ background:(CON[l.condition]||'#888')+'22', color:CON[l.condition]||'#888' }}>{l.condition}</span>
          <span className="text-xs px-3 py-1 rounded-full" style={{ background:t.accentLight, color:t.accent }}>{l.category}</span>
        </div>
        <div className="mt-4 pt-3" style={{ borderTop:`1px solid ${t.cardBorder}` }}>
          <p className="text-xs" style={{ color:t.textMuted }}>Location: {l.location} - Posted {l.posted}</p>
          <p className="text-xs mt-1" style={{ color:t.textMuted }}>Seller: <span className="font-semibold" style={{ color:t.text }}>{l.seller}</span></p>
        </div>
      </div>

      {sent && <div className="p-3 rounded-xl text-center text-sm font-semibold" style={{ background:'rgba(34,197,94,0.15)', color:'#22c55e' }}>Your offer of ${offer} has been sent to {l.seller}!</div>}

      <div className="flex gap-2 sticky bottom-20 md:bottom-4">
        <button onClick={() => router.push(`/chat/${l.sellerId}`)} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Message Seller</button>
        <button onClick={() => setShowOffer(true)} className="flex-1 py-3 rounded-xl text-sm font-semibold" style={{ background:t.surface, color:t.text, border:`1px solid ${t.cardBorder}` }}>Make Offer</button>
      </div>

      {/* Offer Modal */}
      {showOffer && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={() => setShowOffer(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }}>
            <h3 className="font-bold text-lg">Make an Offer</h3>
            <p className="text-xs" style={{ color:t.textMuted }}>Listed price: <span className="font-bold" style={{ color:t.accent }}>{formatCurrency(l.price)}</span></p>
            <div className="flex gap-2">
              {[Math.round(l.price*0.8), Math.round(l.price*0.9), l.price].map(p => (
                <button key={p} onClick={() => setOffer(p.toString())} className="flex-1 py-2 rounded-xl text-xs font-semibold"
                  style={{ background:offer===p.toString()?t.accentLight:t.surface, color:offer===p.toString()?t.accent:t.textSecondary, border:`1px solid ${offer===p.toString()?t.accent+'55':t.cardBorder}` }}>
                  {formatCurrency(p)}
                </button>
              ))}
            </div>
            <input value={offer} onChange={e => setOffer(e.target.value.replace(/[^0-9]/g,''))} placeholder="Or enter custom amount" className="w-full p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            <button onClick={handleOffer} className="w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background:'linear-gradient(135deg,#22c55e,#16a34a)' }}>Send Offer {offer ? `($${offer})` : ''}</button>
            <button onClick={() => setShowOffer(false)} className="w-full py-2 rounded-xl text-xs" style={{ color:t.textMuted }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
