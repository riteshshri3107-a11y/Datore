"use client";
export const dynamic = "force-dynamic";
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
export default function ProfileEditPage() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const t = getTheme(isDark);
  const s = { background: t.input, color: t.text, borderColor: t.inputBorder };
  return (
    <div className="space-y-4 animate-fade-in max-w-lg mx-auto">
      <div className="flex items-center gap-3"><button onClick={() => router.back()}>←</button><h1 className="text-xl font-bold">Edit Profile</h1></div>
      <div className="glass-card rounded-2xl p-5 space-y-3" style={{ background: t.card, borderColor: t.cardBorder }}>
        <input placeholder="Full Name" className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={s} />
        <input placeholder="Phone" className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={s} />
        <input placeholder="City" className="glass-input w-full px-4 py-3 rounded-xl text-sm" style={s} />
        <textarea placeholder="Bio" rows={3} className="glass-input w-full px-4 py-3 rounded-xl text-sm resize-none" style={s} />
        <button className="btn-accent w-full py-3 rounded-xl">Save</button>
      </div>
    </div>
  );
}
