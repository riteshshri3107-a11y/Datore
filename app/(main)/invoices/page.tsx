"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack } from '@/components/Icons';

const INVOICES = [
  { id:'INV-001', client:'John Davidson', service:'House Cleaning', date:'2026-02-25', amount:120, status:'paid', items:[{desc:'Deep Cleaning (3hrs)',qty:1,rate:100},{desc:'Supplies',qty:1,rate:20}] },
  { id:'INV-002', client:'Maria Garcia', service:'Plumbing Repair', date:'2026-02-22', amount:185, status:'pending', items:[{desc:'Pipe Repair (2hrs)',qty:1,rate:150},{desc:'Parts',qty:1,rate:35}] },
  { id:'INV-003', client:'TechCorp Inc.', service:'Office Cleaning', date:'2026-02-18', amount:350, status:'paid', items:[{desc:'Weekly Cleaning',qty:1,rate:300},{desc:'Window Cleaning',qty:1,rate:50}] },
  { id:'INV-004', client:'Alex Kim', service:'Tutoring', date:'2026-02-15', amount:90, status:'overdue', items:[{desc:'Math Tutoring (1.5hrs)',qty:1,rate:60},{desc:'Materials',qty:1,rate:30}] },
];

export default function InvoicesPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [expanded, setExpanded] = useState<string|null>(null);
  const [filter, setFilter] = useState('all');

  const statusColor: Record<string,string> = { paid:'#22c55e', pending:'#f59e0b', overdue:'#ef4444', draft:'#6b7280' };
  const filtered = filter === 'all' ? INVOICES : INVOICES.filter(i=>i.status===filter);
  const totalRevenue = INVOICES.filter(i=>i.status==='paid').reduce((s,i)=>s+i.amount,0);
  const totalPending = INVOICES.filter(i=>i.status==='pending'||i.status==='overdue').reduce((s,i)=>s+i.amount,0);

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={()=>router.back()} style={{ background:'none', border:'none', color:t.text, cursor:'pointer' }}><IcoBack size={20} /></button>
        <h1 className="text-xl font-bold flex-1">Invoices & Receipts</h1>
        <button className="px-4 py-2 rounded-xl text-xs font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>+ Create</button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-[10px]" style={{ color:t.textMuted }}>Total Received</p>
          <p className="text-xl font-bold" style={{ color:'#22c55e' }}>${totalRevenue}</p>
        </div>
        <div className="glass-card rounded-xl p-4" style={{ background:t.card, borderColor:t.cardBorder }}>
          <p className="text-[10px]" style={{ color:t.textMuted }}>Outstanding</p>
          <p className="text-xl font-bold" style={{ color:'#f59e0b' }}>${totalPending}</p>
        </div>
      </div>

      <div className="flex gap-1.5 overflow-x-auto">
        {['all','paid','pending','overdue'].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} className="px-3 py-1.5 rounded-xl text-xs font-medium capitalize" style={{ background:filter===f?t.accentLight:'transparent', color:filter===f?t.accent:t.textSecondary }}>{f}</button>
        ))}
      </div>

      {filtered.map(inv=>(
        <div key={inv.id} className="glass-card rounded-xl overflow-hidden" style={{ background:t.card, borderColor:t.cardBorder }}>
          <div className="p-4 cursor-pointer" onClick={()=>setExpanded(expanded===inv.id?null:inv.id)}>
            <div className="flex items-center justify-between">
              <div><p className="font-semibold text-sm">{inv.id}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{inv.client} · {inv.service}</p><p className="text-[10px]" style={{ color:t.textMuted }}>{inv.date}</p></div>
              <div className="text-right"><p className="font-bold text-lg" style={{ color:t.accent }}>${inv.amount}</p><span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:`${statusColor[inv.status]}22`, color:statusColor[inv.status] }}>{inv.status}</span></div>
            </div>
          </div>
          {expanded===inv.id && (
            <div className="px-4 pb-4 space-y-3" style={{ borderTop:`1px solid ${t.cardBorder}` }}>
              <table className="w-full mt-3">
                <thead><tr className="text-[10px]" style={{ color:t.textMuted }}><th className="text-left py-1">Item</th><th className="text-right py-1">Qty</th><th className="text-right py-1">Rate</th><th className="text-right py-1">Total</th></tr></thead>
                <tbody>{inv.items.map((item,i)=>(<tr key={i} className="text-xs"><td className="py-1">{item.desc}</td><td className="text-right">{item.qty}</td><td className="text-right">${item.rate}</td><td className="text-right font-semibold">${item.qty*item.rate}</td></tr>))}</tbody>
                <tfoot><tr style={{ borderTop:`1px solid ${t.cardBorder}` }}><td colSpan={3} className="text-xs font-bold py-2">Total</td><td className="text-right text-sm font-bold" style={{ color:t.accent }}>${inv.amount}</td></tr></tfoot>
              </table>
              <div className="flex gap-2">
                <button className="flex-1 py-2 rounded-xl text-xs font-semibold text-white" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)` }}>Download PDF</button>
                <button className="flex-1 py-2 rounded-xl text-xs font-medium" style={{ background:t.surface, color:t.textSecondary, border:`1px solid ${t.cardBorder}` }}>Send to Client</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}