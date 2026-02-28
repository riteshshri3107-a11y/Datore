"use client";
export const dynamic = "force-dynamic";
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { addUserListing } from '@/lib/demoData';

export default function CreateListingPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [condition, setCondition] = useState('Like New');
  const [desc, setDesc] = useState('');
  const [posted, setPosted] = useState(false);
  const [photos, setPhotos] = useState<{name:string;preview:string}[]>([]);
  const mktPhotoRef = useRef<HTMLInputElement>(null);
  const mktCamRef = useRef<HTMLInputElement>(null);

  const handleMktPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || photos.length >= 5) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotos(prev => [...prev, { name:file.name, preview:ev.target?.result as string }]);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePost = () => {
    if (!title || !price) return alert('Please fill in title and price');
    addUserListing({ title, price: parseFloat(price), category, condition, desc });
    setPosted(true);
    setTimeout(() => router.push('/marketplace/my-listings'), 2000);
  };

  if (posted) return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in max-w-lg mx-auto">
      <p className="text-5xl mb-4">Done!</p>
      <h2 className="text-xl font-bold">Listing Posted!</h2>
      <p className="text-sm mt-2" style={{ color:t.textSecondary }}>Your item is now live on the marketplace.</p>
    </div>
  );

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <div className="flex items-center gap-3"><button onClick={() => router.back()} className="text-lg">{'<-'}</button><h1 className="text-xl font-bold">Sell an Item</h1></div>
      <div className="glass-card rounded-2xl p-5 space-y-4" style={{ background:t.card, borderColor:t.cardBorder }}>
        <input ref={mktPhotoRef} type="file" accept="image/*" className="hidden" onChange={handleMktPhoto} />
        <input ref={mktCamRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleMktPhoto} />
        {/* Photo preview area */}
        {photos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photos.map((p, i) => (
              <div key={i} className="relative shrink-0 w-24 h-24 rounded-xl overflow-hidden" style={{ border:`1px solid ${t.cardBorder}` }}>
                <img src={p.preview} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                <button onClick={() => setPhotos(prev => prev.filter((_,j) => j!==i))} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white" style={{ background:'rgba(0,0,0,0.7)' }}>X</button>
              </div>
            ))}
          </div>
        )}
        {photos.length < 5 && (
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => mktCamRef.current?.click()} className="h-24 rounded-xl flex flex-col items-center justify-center" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)', border:`2px dashed ${t.accent}44` }}>
              <span className="text-sm font-bold" style={{ color:t.accent }}>Take Photo</span>
              <span className="text-[10px]" style={{ color:t.textMuted }}>Open camera</span>
            </button>
            <button onClick={() => mktPhotoRef.current?.click()} className="h-24 rounded-xl flex flex-col items-center justify-center" style={{ background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.02)', border:`2px dashed ${t.cardBorder}` }}>
              <span className="text-sm font-bold" style={{ color:'#8b5cf6' }}>Upload Photo</span>
              <span className="text-[10px]" style={{ color:t.textMuted }}>From gallery</span>
            </button>
          </div>
        )}
        {photos.length > 0 && <p className="text-[10px]" style={{ color:'#22c55e' }}>{photos.length} photo(s) attached</p>}
        <div>
          <label className="text-xs font-medium" style={{ color:t.textMuted }}>Title</label>
          <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What are you selling?" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color:t.textMuted }}>Price ($)</label>
          <input value={price} onChange={e => setPrice(e.target.value.replace(/[^0-9.]/g,''))} placeholder="0.00" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs font-medium" style={{ color:t.textMuted }}>Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }}>
              {['Electronics','Furniture','Sports','Kitchen','Baby','Auto','Other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs font-medium" style={{ color:t.textMuted }}>Condition</label>
            <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }}>
              {['Like New','Excellent','Good','Fair'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-medium" style={{ color:t.textMuted }}>Description</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Describe your item..." className="w-full mt-1 p-3 rounded-xl text-sm outline-none resize-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
        </div>
        <button onClick={handlePost} className="w-full py-3 rounded-xl text-sm font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Post Listing</button>
      </div>
    </div>
  );
}
