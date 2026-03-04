"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { getWalletBalance, getProfileStats, getMyJobs, getMyBookings } from '@/lib/supabase';
import { formatCurrency } from '@/lib/utils';

export default function DashboardPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const { user } = useAuthStore();
  const [stats, setStats] = useState([
    { label: 'Balance', value: '$0', icon: '💰', color: '#22c55e' },
    { label: 'Active Jobs', value: '0', icon: '💼', color: '#6366f1' },
    { label: 'Completed', value: '0', icon: '✅', color: '#3b82f6' },
    { label: 'Rating', value: '0', icon: '⭐', color: '#f59e0b' },
  ]);

  useEffect(() => {
    if (!user?.id) return;
    async function load() {
      const [walletRes, profileRes, jobsRes, bookingsRes] = await Promise.all([
        getWalletBalance(user!.id),
        getProfileStats(user!.id),
        getMyJobs(user!.id),
        getMyBookings(user!.id),
      ]);
      const balance = walletRes?.data?.balance || 0;
      const ps = profileRes?.data;
      const jobs = jobsRes?.data || [];
      const bookings = bookingsRes?.data || [];
      const activeJobs = jobs.filter((j: any) => j.status === 'open' || j.status === 'assigned' || j.status === 'in_progress').length;
      const completedBookings = bookings.filter((b: any) => b.status === 'completed').length;
      setStats([
        { label: 'Balance', value: formatCurrency(balance), icon: '💰', color: '#22c55e' },
        { label: 'Active Jobs', value: String(activeJobs), icon: '💼', color: '#6366f1' },
        { label: 'Completed', value: String(ps?.total_jobs || completedBookings), icon: '✅', color: '#3b82f6' },
        { label: 'Rating', value: String(ps?.avg_rating?.toFixed(1) || '0'), icon: '⭐', color: '#f59e0b' },
      ]);
    }
    load();
  }, [user?.id]);

  return (
    <div className="space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-2 gap-2.5">
        {stats.map((s, i) => (
          <div key={i} className="glass-card rounded-2xl p-4" style={{ background: t.card, borderColor: t.cardBorder, boxShadow: t.glassShadow }}>
            <span className="text-xl">{s.icon}</span>
            <p className="text-xl font-bold mt-2" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: t.textSecondary }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
