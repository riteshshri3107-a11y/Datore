"use client";
export const dynamic = "force-dynamic";
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import ChatBot from '@/components/ChatBot';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  return (
    <div style={{ minHeight:'100vh', background: isDark ? '#0f0f1a' : '#f5f7ff', color: t.text }}>
      <TopNav />
      <main className="w-full max-w-4xl mx-auto px-4 py-4 pb-20 md:pb-4">
        {children}
      </main>
      <BottomNav />
      <ChatBot />
    </div>
  );
}
