"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack, IcoEdit, IcoTrash } from '@/components/Icons';

/* CR-07: Datore Organization — Admin Ad Manager
   Create, schedule, and push advertisements to users on the Home feed. */

interface AdCampaign {
  id: string;
  title: string;
  body: string;
  type: 'text'|'image'|'video';
  target: string;
  status: 'active'|'paused'|'scheduled'|'ended';
  startDate: string;
  endDate: string;
  budget: string;
  impressions: number;
  clicks: number;
  ctr: number;
  frequencyCap: number;
}

const DEMO_CAMPAIGNS: AdCampaign[] = [
  {id:'c1',title:'Hire Local Workers',body:'Post a job on Datore — verified workers, real reviews, instant booking.',type:'text',target:'All Users',status:'active',startDate:'2026-03-01',endDate:'2026-03-31',budget:'$500',impressions:45200,clicks:3120,ctr:6.9,frequencyCap:3},
  {id:'c2',title:'AI & Robotics Classes',body:'Enroll your child in AARNAIT AI-certified robotics classes. Ages 3-14.',type:'image',target:'Parents 25-45',status:'active',startDate:'2026-03-01',endDate:'2026-04-15',budget:'$300',impressions:28900,clicks:1890,ctr:6.5,frequencyCap:2},
  {id:'c3',title:'Datore Premium Trial',body:'Go Premium — unlimited job postings, 0% fees. Free 30-day trial.',type:'text',target:'Job Posters',status:'scheduled',startDate:'2026-03-15',endDate:'2026-04-15',budget:'$1000',impressions:0,clicks:0,ctr:0,frequencyCap:5},
  {id:'c4',title:'Safety & Trust Campaign',body:'Datore: verified workers, background checks, secure payments. Trust built in.',type:'text',target:'New Users',status:'paused',startDate:'2026-02-01',endDate:'2026-03-15',budget:'$200',impressions:12300,clicks:560,ctr:4.6,frequencyCap:2},
];

export default function AdminAdsPage() {
  const router = useRouter();
  const {isDark,glassLevel,accentColor} = useThemeStore();
  const t = getTheme(isDark,glassLevel,accentColor);
  const [campaigns,setCampaigns] = useState<AdCampaign[]>(DEMO_CAMPAIGNS);
  const [showCreate,setShowCreate] = useState(false);
  const [newAd,setNewAd] = useState({title:'',body:'',type:'text' as 'text'|'image'|'video',target:'All Users',budget:'',startDate:'',endDate:'',frequencyCap:3});

  const totalImpressions = campaigns.reduce((s,c)=>s+c.impressions,0);
  const totalClicks = campaigns.reduce((s,c)=>s+c.clicks,0);
  const avgCTR = totalImpressions > 0 ? ((totalClicks/totalImpressions)*100).toFixed(1) : '0';

  const createCampaign = () => {
    if(!newAd.title||!newAd.body) return;
    const campaign: AdCampaign = {
      id:`c${Date.now()}`,title:newAd.title,body:newAd.body,type:newAd.type,
      target:newAd.target,status:'scheduled',startDate:newAd.startDate||'2026-03-15',
      endDate:newAd.endDate||'2026-04-15',budget:newAd.budget||'$0',
      impressions:0,clicks:0,ctr:0,frequencyCap:newAd.frequencyCap,
    };
    setCampaigns(p=>[campaign,...p]);
    setShowCreate(false);
    setNewAd({title:'',body:'',type:'text',target:'All Users',budget:'',startDate:'',endDate:'',frequencyCap:3});
  };

  const toggleStatus = (id:string) => {
    setCampaigns(p=>p.map(c=>c.id===id?{...c,status:c.status==='active'?'paused':'active'}:c));
  };

  const deleteCampaign = (id:string) => {
    setCampaigns(p=>p.filter(c=>c.id!==id));
  };

  const statusColors:Record<string,{bg:string;text:string}> = {
    active:{bg:'rgba(34,197,94,0.12)',text:'#22c55e'},
    paused:{bg:'rgba(245,158,11,0.12)',text:'#f59e0b'},
    scheduled:{bg:'rgba(59,130,246,0.12)',text:'#3b82f6'},
    ended:{bg:'rgba(107,114,128,0.12)',text:'#6b7280'},
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{background:'none',border:'none',color:t.text,cursor:'pointer'}}><IcoBack size={20}/></button>
        <h1 className="text-xl font-bold flex-1">Ad Manager</h1>
        <button onClick={()=>setShowCreate(true)} className="px-4 py-2 rounded-xl text-xs font-bold text-white" style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)'}}>+ Create Ad</button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-4 gap-2">
        {[
          {l:'Campaigns',v:campaigns.length.toString(),c:'#6366f1'},
          {l:'Impressions',v:totalImpressions>=1000?(totalImpressions/1000).toFixed(1)+'K':totalImpressions.toString(),c:'#3b82f6'},
          {l:'Clicks',v:totalClicks>=1000?(totalClicks/1000).toFixed(1)+'K':totalClicks.toString(),c:'#22c55e'},
          {l:'Avg CTR',v:avgCTR+'%',c:'#f59e0b'},
        ].map(s=>(
          <div key={s.l} className="p-3 rounded-xl text-center" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
            <p className="text-lg font-bold" style={{color:s.c}}>{s.v}</p>
            <p className="text-[8px]" style={{color:t.textMuted}}>{s.l}</p>
          </div>
        ))}
      </div>

      {/* Campaign List */}
      <div className="space-y-2">
        <h2 className="text-xs font-bold" style={{color:t.textMuted}}>CAMPAIGNS</h2>
        {campaigns.map(c=>{
          const sc = statusColors[c.status]||statusColors.ended;
          return (
            <div key={c.id} className="p-3 rounded-xl" style={{background:t.card,border:`1px solid ${t.cardBorder}`}}>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-xs font-bold">{c.title}</p>
                    <span className="text-[7px] px-1.5 py-0.5 rounded-full font-bold capitalize" style={{background:sc.bg,color:sc.text}}>{c.status}</span>
                    <span className="text-[7px] px-1.5 py-0.5 rounded-full" style={{background:'rgba(139,92,246,0.1)',color:'#8b5cf6'}}>{c.type}</span>
                  </div>
                  <p className="text-[10px]" style={{color:t.textSecondary}}>{c.body}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[8px]" style={{color:t.textMuted}}>Target: {c.target}</span>
                    <span className="text-[8px]" style={{color:t.textMuted}}>Budget: {c.budget}</span>
                    <span className="text-[8px]" style={{color:t.textMuted}}>Cap: {c.frequencyCap}x/user</span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[8px]" style={{color:t.textMuted}}>{c.startDate} → {c.endDate}</span>
                  </div>
                  {c.impressions>0&&(
                    <div className="flex items-center gap-4 mt-2">
                      <div><p className="text-[8px]" style={{color:t.textMuted}}>Impressions</p><p className="text-xs font-bold">{c.impressions.toLocaleString()}</p></div>
                      <div><p className="text-[8px]" style={{color:t.textMuted}}>Clicks</p><p className="text-xs font-bold">{c.clicks.toLocaleString()}</p></div>
                      <div><p className="text-[8px]" style={{color:t.textMuted}}>CTR</p><p className="text-xs font-bold" style={{color:c.ctr>5?'#22c55e':'#f59e0b'}}>{c.ctr}%</p></div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={()=>toggleStatus(c.id)} className="px-3 py-1.5 rounded-lg text-[9px] font-medium" style={{background:c.status==='active'?'rgba(245,158,11,0.1)':'rgba(34,197,94,0.1)',color:c.status==='active'?'#f59e0b':'#22c55e'}}>
                    {c.status==='active'?'Pause':'Activate'}
                  </button>
                  <button onClick={()=>deleteCampaign(c.id)} className="px-3 py-1.5 rounded-lg text-[9px]" style={{background:'rgba(239,68,68,0.1)',color:'#ef4444'}}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Ad Modal */}
      {showCreate&&(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{background:'rgba(0,0,0,0.6)'}} onClick={()=>setShowCreate(false)}>
          <div onClick={e=>e.stopPropagation()} className="w-full max-w-md rounded-2xl p-5 space-y-3 max-h-[90vh] overflow-y-auto" style={{background:isDark?'#1a1a2e':'#fff',color:t.text}}>
            <h2 className="text-lg font-bold">Create Ad Campaign</h2>

            <div><label className="text-[9px] font-bold" style={{color:t.textMuted}}>TITLE</label>
              <input value={newAd.title} onChange={e=>setNewAd(p=>({...p,title:e.target.value}))} placeholder="Ad campaign title" className="w-full p-2.5 rounded-xl text-xs outline-none mt-1" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/></div>

            <div><label className="text-[9px] font-bold" style={{color:t.textMuted}}>AD CONTENT</label>
              <textarea value={newAd.body} onChange={e=>setNewAd(p=>({...p,body:e.target.value}))} rows={3} placeholder="Write the ad text..." className="w-full p-2.5 rounded-xl text-xs outline-none resize-none mt-1" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/></div>

            <div className="grid grid-cols-3 gap-2">
              {(['text','image','video'] as const).map(ty=>(
                <button key={ty} onClick={()=>setNewAd(p=>({...p,type:ty}))} className="py-2 rounded-xl text-[10px] font-semibold capitalize" style={{background:newAd.type===ty?t.accentLight:t.card,color:newAd.type===ty?t.accent:t.textMuted,border:`1px solid ${newAd.type===ty?t.accent+'33':t.cardBorder}`}}>{ty}</button>
              ))}
            </div>

            <div><label className="text-[9px] font-bold" style={{color:t.textMuted}}>TARGET AUDIENCE</label>
              <div className="flex gap-1.5 mt-1">
                {['All Users','Parents 25-45','Job Posters','New Users','Premium Users'].map(ta=>(
                  <button key={ta} onClick={()=>setNewAd(p=>({...p,target:ta}))} className="px-2.5 py-1.5 rounded-lg text-[8px] font-medium" style={{background:newAd.target===ta?t.accentLight:t.card,color:newAd.target===ta?t.accent:t.textMuted,border:`1px solid ${newAd.target===ta?t.accent+'33':t.cardBorder}`}}>{ta}</button>
                ))}
              </div></div>

            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[9px] font-bold" style={{color:t.textMuted}}>BUDGET</label>
                <input value={newAd.budget} onChange={e=>setNewAd(p=>({...p,budget:e.target.value}))} placeholder="$500" className="w-full p-2 rounded-xl text-xs outline-none mt-1" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/></div>
              <div><label className="text-[9px] font-bold" style={{color:t.textMuted}}>FREQUENCY CAP</label>
                <input type="number" value={newAd.frequencyCap} onChange={e=>setNewAd(p=>({...p,frequencyCap:Number(e.target.value)}))} className="w-full p-2 rounded-xl text-xs outline-none mt-1" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/></div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div><label className="text-[9px] font-bold" style={{color:t.textMuted}}>START DATE</label>
                <input type="date" value={newAd.startDate} onChange={e=>setNewAd(p=>({...p,startDate:e.target.value}))} className="w-full p-2 rounded-xl text-xs outline-none mt-1" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/></div>
              <div><label className="text-[9px] font-bold" style={{color:t.textMuted}}>END DATE</label>
                <input type="date" value={newAd.endDate} onChange={e=>setNewAd(p=>({...p,endDate:e.target.value}))} className="w-full p-2 rounded-xl text-xs outline-none mt-1" style={{background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.03)',border:`1px solid ${t.cardBorder}`,color:t.text}}/></div>
            </div>

            <div className="flex gap-2">
              <button onClick={createCampaign} disabled={!newAd.title||!newAd.body} className="flex-1 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-40" style={{background:'linear-gradient(135deg,#6366f1,#8b5cf6)'}}>Create Campaign</button>
              <button onClick={()=>setShowCreate(false)} className="px-6 py-3 rounded-xl text-sm" style={{border:`1px solid ${t.cardBorder}`,color:t.textMuted}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
