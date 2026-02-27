"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';

const DEMO_TXS = [
  { id: '1', type: 'purchase', amount: 100, description: 'Token Purchase', status: 'completed', created_at: new Date().toISOString() },
  { id: '2', type: 'escrow_lock', amount: -25, description: 'Escrow: Babysitting Job', status: 'completed', created_at: new Date(Date.now()-3600000).toISOString() },
  { id: '3', type: 'earning', amount: 45, description: 'Completed: House Cleaning', status: 'completed', created_at: new Date(Date.now()-86400000).toISOString() },
  { id: '4', type: 'tip', amount: 5, description: 'Tip received', status: 'completed', created_at: new Date(Date.now()-172800000).toISOString() },
];

export default function WalletPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);

  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <h1 className="text-xl font-bold">💰 Wallet</h1>

      <div className="glass-card rounded-2xl p-5" style={{ background: `linear-gradient(135deg, ${t.accent}33, #8b5cf633)`, borderColor: `${t.accent}44`, boxShadow: `0 4px 20px ${t.accentGlow}` }}>
        <p className="text-sm" style={{ color: t.textSecondary }}>Available Balance</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(125)}</p>
        <div className="flex gap-4 mt-3">
          <div><p className="text-xs" style={{ color: t.textMuted }}>Escrowed</p><p className="font-semibold text-sm">{formatCurrency(25)}</p></div>
          <div><p className="text-xs" style={{ color: t.textMuted }}>Pending</p><p className="font-semibold text-sm">{formatCurrency(0)}</p></div>
          <div><p className="text-xs" style={{ color: t.textMuted }}>Total Earned</p><p className="font-semibold text-sm">{formatCurrency(250)}</p></div>
        </div>
        <div className="flex gap-2 mt-4">
          <button className="btn-accent flex-1 py-2.5 rounded-xl text-sm">+ Add Tokens</button>
          <button className="glass-button flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ background: 'rgba(255,255,255,0.1)', color: t.text }}>Withdraw</button>
        </div>
      </div>

      <h2 className="text-sm font-semibold" style={{ color: t.textSecondary }}>Transaction History</h2>
      <div className="space-y-2">
        {DEMO_TXS.map(tx => (
          <div key={tx.id} className="glass-card rounded-xl p-3 flex items-center justify-between" style={{ background: t.card, borderColor: t.cardBorder }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base"
                style={{ background: tx.amount > 0 ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}>
                {tx.type === 'purchase' ? '💳' : tx.type === 'escrow_lock' ? '🔒' : tx.type === 'earning' ? '💵' : '🎁'}
              </div>
              <div>
                <p className="text-sm font-medium">{tx.description}</p>
                <p className="text-xs" style={{ color: t.textMuted }}>{new Date(tx.created_at).toLocaleDateString()}</p>
              </div>
            </div>
            <p className="font-bold text-sm" style={{ color: tx.amount > 0 ? t.success : t.danger }}>
              {tx.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
