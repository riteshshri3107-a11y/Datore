"use client";
import ThemeProvider from '@/components/ThemeProvider';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import ChatBot from '@/components/ChatBot';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TopNav />
      <main className="max-w-4xl mx-auto px-3 py-4 pb-24 md:pb-8 min-h-screen">{children}</main>
      <BottomNav />
      <ChatBot />
    </ThemeProvider>
  );
}
