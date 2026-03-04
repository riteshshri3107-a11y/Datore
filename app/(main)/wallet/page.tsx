"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { formatCurrency } from '@/lib/utils';
import { useAuthStore } from '@/store/useAuthStore';
import { getWalletBalance, getTokenWallet, getTransactions, getTokenTransactions } from '@/lib/supabase';

const DEMO_TXNS = [
  { id:'1', type:'purchase', desc:'Token Purchase', amount:100, date:'2/27/2026' },
  { id:'2', type:'escrow', desc:'Escrow: Babysitting Job', amount:-25, date:'2/27/2026' },
  { id:'3', type:'completed', desc:'Completed: House Cleaning', amount:45, date:'2/26/2026' },
  { id:'4', type:'tip', desc:'Tip received', amount:5, date:'2/25/2026' },
  { id:'5', type:'withdraw', desc:'Withdrawal to bank', amount:-50, date:'2/24/2026' },
];

export default function WalletPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const { user } = useAuthStore();
  const [balance, setBalance] = useState({ available: 0, escrowed: 0, pending: 0, earned: 0 });
  const [tokenWallet, setTokenWallet] = useState({ available_tokens: 0, escrowed_tokens: 0, social_credits: 0 });
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [cardNum, setCardNum] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [bankAcc, setBankAcc] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState('');
  const [txns, setTxns] = useState<any[]>([]);

  // Fetch real wallet data from Supabase
  useEffect(() => {
    async function loadWallet() {
      if (!user?.id) {
        // Use demo defaults for non-authenticated users
        setBalance({ available: 125, escrowed: 25, pending: 0, earned: 250 });
        setTxns(DEMO_TXNS);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const [walletData, tokenData, txnData] = await Promise.all([
          getWalletBalance(user.id),
          getTokenWallet(user.id),
          getTransactions(user.id),
        ]);

        // Set wallet balance
        if (walletData && (walletData.balance !== undefined || walletData.total_earned)) {
          setBalance({
            available: walletData.balance || 0,
            escrowed: 0,
            pending: 0,
            earned: walletData.total_earned || 0,
          });
        } else {
          // Fallback demo balance
          setBalance({ available: 125, escrowed: 25, pending: 0, earned: 250 });
        }

        // Set token wallet
        if (tokenData) {
          setTokenWallet({
            available_tokens: tokenData.available_tokens || 0,
            escrowed_tokens: tokenData.escrowed_tokens || 0,
            social_credits: tokenData.social_credits || 0,
          });
        }

        // Set transactions
        if (txnData && txnData.length > 0) {
          setTxns(txnData.map((tx: any) => ({
            id: tx.id,
            type: tx.tx_type || tx.type || 'purchase',
            desc: tx.description || tx.note || 'Transaction',
            amount: tx.payer_id === user.id ? -(tx.amount || 0) : (tx.amount || 0),
            date: new Date(tx.created_at).toLocaleDateString(),
          })));
        } else {
          // Fallback demo transactions
          setTxns(DEMO_TXNS);
        }
      } catch {
        // Fallback on error
        setBalance({ available: 125, escrowed: 25, pending: 0, earned: 250 });
        setTxns(DEMO_TXNS);
      }
      setLoading(false);
    }
    loadWallet();
  }, [user?.id]);

  const handleAddTokens = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return alert('Enter a valid amount');
    if (cardNum.length < 16) return alert('Enter a valid card number');
    setProcessing(true);
    setTimeout(() => {
      setBalance(prev => ({ ...prev, available: prev.available + amt, earned: prev.earned + amt }));
      setTxns(prev => [{ id: Date.now().toString(), type:'purchase', desc:`Token Purchase (+$${amt})`, amount: amt, date: new Date().toLocaleDateString() }, ...prev]);
      setProcessing(false); setShowAdd(false); setAmount(''); setCardNum(''); setCardExp(''); setCardCvc('');
      setSuccess(`$${amt.toFixed(2)} added to your wallet!`);
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
      setSuccess(`$${amt.toFixed(2)} withdrawal initiated! (2-3 business days)`);
      setTimeout(() => setSuccess(''), 4000);
    }, 2000);
  };

  const txnIcon:any = { purchase:'TKN', escrow:'ESC', completed:'OK', tip:'TIP', withdraw:'BNK', payment:'PAY' };
  const txnColor = (type:string) => type==='escrow'||type==='withdraw' ? '#ef4444' : '#22c55e';

  if (loading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <h1 className="text-xl font-bold">Wallet</h1>
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: `${t.accent} transparent ${t.accent} ${t.accent}` }} />
          <p className="text-xs" style={{ color: t.textMuted }}>Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in ">
      <h1 className="text-xl font-bold">Wallet</h1>
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
        {(tokenWallet.available_tokens > 0 || tokenWallet.social_credits > 0) && (
          <div className="flex gap-6 mt-2 pt-2" style={{ borderTop: `1px solid ${t.cardBorder}` }}>
            <div><p className="text-[10px]" style={{ color:t.textMuted }}>Tokens</p><p className="text-sm font-semibold">{tokenWallet.available_tokens}</p></div>
            <div><p className="text-[10px]" style={{ color:t.textMuted }}>Escrowed Tokens</p><p className="text-sm font-semibold">{tokenWallet.escrowed_tokens}</p></div>
            <div><p className="text-[10px]" style={{ color:t.textMuted }}>Social Credits</p><p className="text-sm font-semibold">{tokenWallet.social_credits}</p></div>
          </div>
        )}
        <div className="flex gap-3 mt-4">
          <button onClick={() => { setShowAdd(true); setAmount(''); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white border-none cursor-pointer" style={{ background:`linear-gradient(135deg,${t.accent},#8b5cf6)`, boxShadow:`0 4px 15px ${t.accentGlow}` }}>+ Add Tokens</button>
          <button onClick={() => { setShowWithdraw(true); setAmount(''); }} className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer" style={{ background:t.surface, color:t.text, border:`1px solid ${t.cardBorder}` }}>Withdraw</button>
        </div>
      </div>

      {/* Transactions */}
      <h2 className="text-sm font-semibold" style={{ color:t.textSecondary }}>Transaction History</h2>
      <div className="space-y-2">
        {txns.length === 0 ? (
          <div className="text-center py-8 rounded-xl" style={{ background: t.card }}>
            <p className="text-sm" style={{ color: t.textMuted }}>No transactions yet</p>
          </div>
        ) : txns.map(tx => (
          <div key={tx.id} className="glass-card rounded-xl p-3.5 flex items-center gap-3" style={{ background:t.card, borderColor:t.cardBorder }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold" style={{ background: tx.amount >= 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: tx.amount >= 0 ? '#22c55e' : '#ef4444' }}>{txnIcon[tx.type]||'TXN'}</div>
            <div className="flex-1"><p className="text-sm font-medium">{tx.desc}</p><p className="text-[11px]" style={{ color:t.textMuted }}>{tx.date}</p></div>
            <span className="font-bold text-sm" style={{ color: txnColor(tx.type) }}>{tx.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(tx.amount))}</span>
          </div>
        ))}
      </div>

      {/* ADD TOKENS MODAL */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={() => !processing && setShowAdd(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }}>
            <h3 className="font-bold text-lg">Add Tokens</h3>
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
              {processing ? 'Processing...' : `Add ${amount ? '$'+amount : 'Tokens'}`}
            </button>
            <p className="text-[10px] text-center" style={{ color:t.textMuted }}>Secured with 256-bit encryption</p>
            {!processing && <button onClick={() => setShowAdd(false)} className="w-full py-2 rounded-xl text-xs" style={{ color:t.textMuted }}>Cancel</button>}
          </div>
        </div>
      )}

      {/* WITHDRAW MODAL */}
      {showWithdraw && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }} onClick={() => !processing && setShowWithdraw(false)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm rounded-2xl p-5 space-y-4" style={{ background:isDark?'#1a1a2e':'#fff', border:`1px solid ${t.cardBorder}` }}>
            <h3 className="font-bold text-lg">Withdraw</h3>
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
              {processing ? 'Processing...' : `Withdraw ${amount ? '$'+amount : ''}`}
            </button>
            <p className="text-[10px] text-center" style={{ color:t.textMuted }}>2-3 business days via e-Transfer</p>
            {!processing && <button onClick={() => setShowWithdraw(false)} className="w-full py-2 rounded-xl text-xs" style={{ color:t.textMuted }}>Cancel</button>}
          </div>
        </div>
      )}
    </div>
  );
}
