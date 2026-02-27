"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
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
        <div className="h-32 rounded-xl flex flex-col items-center justify-center cursor-pointer" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`2px dashed ${t.cardBorder}` }}>
          <p className="text-xl">Camera</p>
          <p className="text-xs mt-2" style={{ color:t.textMuted }}>Tap to add photos</p>
        </div>
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
