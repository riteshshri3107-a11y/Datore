"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { useAuth } from '@/lib/useAuth';
import { getWalletBalance, getTransactions } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

export default function WalletPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const { user, loading: authLoading } = useAuth();
  const [balance, setBalance] = useState({ available: 0, escrowed: 0, pending: 0, earned: 0 });
  const [showAdd, setShowAdd] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [bankAcc, setBankAcc] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');
  const [txns, setTxns] = useState<{id:string;type:string;desc:string;amount:number;date:string}[]>([]);

  // Load wallet data from Supabase for the authenticated user
  useEffect(() => {
    if (!user) return;
    getWalletBalance(user.id).then((data:any) => {
      setBalance({ available: data.available || 0, escrowed: data.escrowed || 0, pending: data.pending || 0, earned: (data.available||0) + (data.escrowed||0) + (data.pending||0) });
    });
    getTransactions(user.id).then((data:any[]) => {
      if (data.length > 0) {
        setTxns(data.map((t:any) => ({ id:t.id, type:t.type||'purchase', desc:t.description||'Transaction', amount:t.amount||0, date:t.created_at ? new Date(t.created_at).toLocaleDateString() : '' })));
      }
    });
  }, [user]);

  if (authLoading) return <div className="flex items-center justify-center py-20"><p className="text-sm">Loading wallet...</p></div>;
  if (!user) { router.push('/'); return null; }

  const handleAddTokens = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return alert('Enter a valid amount');
    if (cardNum.length < 16) return alert('Enter a valid card number');
    setProcessing(true);
    setTimeout(() => {
      setBalance(prev => ({ ...prev, available: prev.available + amt, earned: prev.earned + amt }));
      setTxns(prev => [{ id: Date.now().toString(), type:'purchase', desc:`Token Purchase (+$${amt})`, amount: amt, date: new Date().toLocaleDateString() }, ...prev]);
      setProcessing(false); setShowAdd(false); setAmount(''); setCardNum(''); setCardExp(''); setCardCvc('');
      setSuccess(`✅ $${amt.toFixed(2)} added to your wallet!`);
      setTimeout(() => setSuccess(''), 3000);
    }, 2000);
  };

  const handleWithdraw = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return alert('Enter a valid amount');
    if (amt > balance.available) return alert('Insufficient balance');
    if (bankAcc.length < 5) return alert('Enter a valid bank account');
    setProcessing(true);
    setTimeout(() => {
      setBalance(prev => ({ ...prev, available: prev.available - amt, pending: prev.pending + amt }));
      setTxns(prev => [{ id: Date.now().toString(), type:'withdraw', desc:`Withdrawal to bank`, amount: -amt, date: new Date().toLocaleDateString() }, ...prev]);
      setProcessing(false); setShowWithdraw(false); setAmount(''); setBankAcc('');
      setSuccess(`✅ $${amt.toFixed(2)} withdrawal initiated! (2-3 business days)`);
      setTimeout(() => setSuccess(''), 4000);
    }, 2000);
  };

  const txnIcon:any = { purchase:'💳', escrow:'🔒', completed:'✅', tip:'🎁', withdraw:'🏦' };
  const txnColor = (type:string) => type==='escrow'||type==='withdraw' ? '#ef4444' : '#22c55e';

  return (
    <div className="space-y-4 animate-fade-in ">
      <h1 className="text-xl font-bold">💰 Wallet</h1>
      {success && <div style={{ padding:'12px 16px', borderRadius:14, background:'rgba(34,197,94,0.15)', color:'#22c55e', fontSize:13, fontWeight:600, textAlign:'center' }}>{success}</div>}

      {/* Balance Card */}
      <div className="glass-card rounded-2xl p-5" style={{ background:`linear-gradient(135deg,${t.accent}22,#8b5cf622)`, borderColor:t.cardBorder, boxShadow:t.glassShadow }}>
        <p className="text-xs" style={{ color:t.textMuted }}>Available Balance</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(balance.available)}</p>
        <div className="flex gap-6 mt-3">
          <div><p className="text-[10px]" style={{ color:t.textMuted }}>Escrowed</p><p className="text-sm font-semibold">{formatCurrency(balance.escrowed)}</p></div>
          <div><p className="text-[10px]" style={{ color:t.textMuted }}>Pending</p><p className="text-sm font-semibold">{formatCurrency(balance.pending)}</p></div>
          <div><p className="text-[10px]" style={{ color:t.textMuted }}>Total Earned</p><p className="text-sm font-semibold">{formatCurrency(balance.earned)}</p></div>
        </div>
        <div className="flex gap-3 mt-4">
          <button onClick={() => { setShowAdd(true); setAmount(''); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white border-none cursor-pointer" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)`, boxShadow:`0 4px 15px ${t.accentGlow}` }}>+ Add Tokens</button>
          <button onClick={() => { setShowWithdraw(true); setAmount(''); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer" style={{ background:t.surface, color:t.text, border:`1px solid ${t.cardBorder}` }}>Withdraw</button>
        </div>
      </div>

      {/* Transactions */}
      <h2 className="text-sm font-semibold" style={{ color:t.textSecondary }}>Transaction History</h2>
      <div className="space-y-2">
        {txns.map(tx => (
          <div key={tx.id} className="glass-card rounded-xl p-3.5 flex items-center gap-3" style={{ background:t.card, borderColor:t.cardBorder }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: tx.amount >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}>{txnIcon[tx.type]||'💰'}</div>
            <div className="flex-1"><p className="text-sm font-medium">{tx.desc}</p><p className="text-[11px]" style={{ color:t.textMuted }}>{tx.date}</p></div>
            <span className="font-bold text-sm" style={{ color: txnColor(tx.type) }}>{tx.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}</span>
          </div>
        ))}
      </div>

      {/* ADD TOKENS MODAL */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={() => !processing && setShowAdd(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }}>
            <h3 className="font-bold text-lg">💳 Add Tokens</h3>
            <div>
              <label className="text-xs font-medium" style={{ color:t.textMuted }}>Amount ($)</label>
              <div className="flex gap-2 mt-1">
                {[25,50,100,200].map(a => (
                  <button key={a} onClick={() => setAmount(a.toString())} className="flex-1 py-2 rounded-xl text-xs font-semibold"
                    style={{ background: amount===a.toString() ? t.accentLight : t.surface, color: amount===a.toString() ? t.accent : t.textSecondary, border:`1px solid ${amount===a.toString() ? t.accent+'55' : t.cardBorder}` }}>${a}</button>
                ))}
              </div>
              <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g,''))} placeholder="Or enter custom amount" className="w-full mt-2 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color:t.textMuted }}>Card Number</label>
              <input value={cardNum} onChange={e => setCardNum(e.target.value.replace(/\D/g,'').slice(0,16))} placeholder="4242 4242 4242 4242" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            </div>
            <div className="flex gap-2">
              <div className="flex-1"><label className="text-xs font-medium" style={{ color:t.textMuted }}>Expiry</label><input value={cardExp} onChange={e => setCardExp(e.target.value)} placeholder="MM/YY" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} /></div>
              <div className="flex-1"><label className="text-xs font-medium" style={{ color:t.textMuted }}>CVC</label><input value={cardCvc} onChange={e => setCardCvc(e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="123" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} /></div>
            </div>
            <button onClick={handleAddTokens} disabled={processing} className="w-full py-3 rounded-xl text-sm font-semibold text-white border-none cursor-pointer"
              style={{ background: processing ? '#888' : `linear-gradient(135deg,${t.accent},#8b5cf6)`, opacity: processing ? 0.7 : 1 }}>
              {processing ? '⏳ Processing...' : `Add ${amount ? '$'+amount : 'Tokens'}`}
            </button>
            <p className="text-[10px] text-center" style={{ color:t.textMuted }}>🔒 Secured with 256-bit encryption</p>
            {!processing && <button onClick={() => setShowAdd(false)} className="w-full py-2 rounded-xl text-xs" style={{ color:t.textMuted }}>Cancel</button>}
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {showWithdraw && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={() => !processing && setShowWithdraw(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }}>
            <h3 className="font-bold text-lg">🏦 Withdraw</h3>
            <p className="text-xs" style={{ color:t.textMuted }}>Available: <span className="font-bold" style={{ color:t.accent }}>{formatCurrency(balance.available)}</span></p>
            <div>
              <label className="text-xs font-medium" style={{ color:t.textMuted }}>Amount ($)</label>
              <input value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g,''))} placeholder="Enter amount" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
              <button onClick={() => setAmount(balance.available.toString())} className="text-xs mt-1" style={{ color:t.accent }}>Withdraw all</button>
            </div>
            <div>
              <label className="text-xs font-medium" style={{ color:t.textMuted }}>Bank Account / E-Transfer Email</label>
              <input value={bankAcc} onChange={e => setBankAcc(e.target.value)} placeholder="email@bank.com or account number" className="w-full mt-1 p-3 rounded-xl text-sm outline-none" style={{ background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)', border:`1px solid ${t.cardBorder}`, color:t.text }} />
            </div>
            <button onClick={handleWithdraw} disabled={processing} className="w-full py-3 rounded-xl text-sm font-semibold text-white border-none cursor-pointer"
              style={{ background: processing ? '#888' : 'linear-gradient(135deg,#22c55e,#16a34a)', opacity: processing ? 0.7 : 1 }}>
              {processing ? '⏳ Processing...' : `Withdraw ${amount ? '$'+amount : ''}`}
            </button>
            <p className="text-[10px] text-center" style={{ color:t.textMuted }}>⏱ 2-3 business days via e-Transfer</p>
            {!processing && <button onClick={() => setShowWithdraw(false)} className="w-full py-2 rounded-xl text-xs" style={{ color:t.textMuted }}>Cancel</button>}
          </div>
        </div>
      )}
    </div>
  );
}
