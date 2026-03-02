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
    <div style={{
      minHeight:'100vh',
      background: isDark
        ? 'linear-gradient(180deg, #0a0a16 0%, #0f0f1e 30%, #121225 100%)'
        : 'linear-gradient(180deg, #f8f9ff 0%, #f0f2ff 50%, #eef0ff 100%)',
      color: t.text,
    }}>
      {/* Subtle ambient glow */}
      {isDark && (
        <div style={{
          position:'fixed', top:0, left:'50%', transform:'translateX(-50%)',
          width:800, height:400, borderRadius:'50%',
          background:`radial-gradient(ellipse, ${t.accent}06 0%, transparent 70%)`,
          pointerEvents:'none', zIndex:0
        }} />
      )}
      <TopNav />
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 py-5 pb-24 md:pb-6" style={{minHeight:'calc(100vh - 70px)'}}>
        {children}
      </main>
      <BottomNav />
      <ChatBot />
    </div>
  );
}
