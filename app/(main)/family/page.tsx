"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack } from '@/components/Icons';

const FAMILY = [{id:'f1',name:'You',role:'Admin',avatar:'👤',spending:240,limit:500},{id:'f2',name:'Partner',role:'Adult',avatar:'👩',spending:180,limit:300},{id:'f3',name:'Sam (Kid)',role:'Child',avatar:'👦',spending:15,limit:50},{id:'f4',name:'Grandma',role:'Elderly',avatar:'👵',spending:45,limit:200}];
const PETS = [{name:'Max',type:'Dog',breed:'Golden Retriever',nextVet:'Mar 15'},{name:'Luna',type:'Cat',breed:'Siamese',nextVet:'Apr 2'}];

export default function FamilyPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<'members'|'wallet'|'activity'|'pets'>('members');

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold flex-1">Family Hub</h1>
        <button className="px-3 py-2 rounded-xl text-xs font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>+ Invite</button>
      </div>
      <div className="flex gap-1">{(['members','wallet','activity','pets'] as const).map(tb=>(<button key={tb} onClick={()=>setTab(tb)} className="px-4 py-2 rounded-xl text-xs font-medium capitalize" style={{ background:tab===tb?t.accentLight:'transparent', color:tab===tb?t.accent:t.textSecondary }}>{tb}</button>))}</div>
      {tab==='members' && <div className="space-y-3">{FAMILY.map(m=>(<div key={m.id} className="glass-card rounded-xl p-4 flex items-center gap-3" style={{ background:t.card, borderColor:t.cardBorder }}><span className="text-2xl">{m.avatar}</span><div className="flex-1"><p className="font-semibold text-sm">{m.name}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{m.role}{m.role==='Elderly'?' · Simplified UI Mode':''}</p></div><span className="text-[10px] px-2 py-1 rounded-full" style={{ background:`${t.accent}22`, color:t.accent }}>{m.role}</span></div>))}</div>}
      {tab==='wallet' && <div className="space-y-3"><div className="glass-card rounded-xl p-4" style={{ background:`linear-gradient(135deg,${t.accent}15,#22c55e22)`, borderColor:t.cardBorder }}><p className="text-[10px]" style={{ color:t.textMuted }}>Family Wallet Balance</p><p className="text-2xl font-bold" style={{ color:t.accent }}>$1,250.00</p></div>{FAMILY.map(m=>(<div key={m.id} className="glass-card rounded-xl p-3 flex items-center gap-3" style={{ background:t.card, borderColor:t.cardBorder }}><span className="text-lg">{m.avatar}</span><div className="flex-1"><p className="text-xs font-semibold">{m.name}</p><div className="h-1.5 rounded-full mt-1" style={{ background:t.surface }}><div className="h-full rounded-full" style={{ width:`${(m.spending/m.limit)*100}%`, background:m.spending/m.limit>0.8?'#ef4444':t.accent }} /></div></div><span className="text-xs font-bold" style={{ color:t.accent }}>${m.spending}/${m.limit}</span></div>))}</div>}
      {tab==='activity' && <div className="space-y-2">{['You booked House Cleaning for Saturday','Partner purchased Groceries on Marketplace','Sam used Tutoring service','Grandma called Deto AI for help with booking'].map((a,i)=>(<div key={i} className="glass-card rounded-xl p-3 flex items-center gap-3" style={{ background:t.card, borderColor:t.cardBorder }}><div className="w-2 h-2 rounded-full" style={{ background:['#6366f1','#ec4899','#f59e0b','#22c55e'][i] }} /><p className="text-xs flex-1">{a}</p><span className="text-[10px]" style={{ color:t.textMuted }}>{['2h','5h','1d','2d'][i]} ago</span></div>))}</div>}
      {tab==='pets' && <div className="space-y-3">{PETS.map(p=>(<div key={p.name} className="glass-card rounded-xl p-4 flex items-center gap-3" style={{ background:t.card, borderColor:t.cardBorder }}><span className="text-3xl">{p.type==='Dog'?'🐕':'🐱'}</span><div className="flex-1"><p className="font-semibold text-sm">{p.name}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{p.breed} · Next Vet: {p.nextVet}</p></div><button className="px-3 py-1.5 rounded-lg text-[10px] font-medium" style={{ background:t.accentLight, color:t.accent }}>Book Service</button></div>))}<button className="w-full py-3 rounded-xl text-xs font-medium" style={{ background:t.surface, color:t.textSecondary, border:`1px solid ${t.cardBorder}` }}>+ Add Pet Profile</button></div>}
    </div>
  );
}