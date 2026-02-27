"use client";
export const dynamic = "force-dynamic";
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
export default function MyListingsPage() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const t = getTheme(isDark);
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3"><button onClick={() => router.back()}>←</button><h1 className="text-xl font-bold">My Listings</h1></div>
      <div className="text-center py-12"><p className="text-3xl mb-3">📦</p><p style={{ color: t.textSecondary }}>No listings yet</p>
        <button onClick={() => router.push('/marketplace/create')} className="btn-accent text-sm px-5 py-2.5 rounded-xl mt-4">+ Create Listing</button>
      </div>
    </div>
  );
}
