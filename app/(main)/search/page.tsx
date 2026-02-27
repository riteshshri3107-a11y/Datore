"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { JOB_CATEGORIES } from '@/types';

export default function SearchPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold">🔍 Search</h1>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs, workers, listings..."
        className="glass-input w-full px-4 py-3.5 rounded-2xl text-sm" style={{ background: t.input, color: t.text, borderColor: t.inputBorder }} autoFocus />
      
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color: t.textSecondary }}>Browse Categories</h2>
        <div className="grid grid-cols-2 gap-2">
          {JOB_CATEGORIES.map((c, i) => (
            <button key={c} onClick={() => router.push(`/jobplace/providers?skill=${c}`)}
              className="glass-card rounded-xl p-3 text-left text-sm font-medium"
              style={{ background: t.card, borderColor: t.cardBorder }}>{c}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
