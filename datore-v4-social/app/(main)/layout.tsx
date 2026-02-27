"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useThemeStore } from "@/store/useThemeStore";
import ThemeProvider from "@/components/ThemeProvider";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import ChatBot from "@/components/ChatBot";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { if (!data.session?.user) router.push("/login"); });
    const saved = typeof window !== "undefined" ? localStorage.getItem("datore-theme") : null;
    if (saved) useThemeStore.getState().set(saved === "dark");
  }, [router]);

  return (
    <ThemeProvider>
      <TopNav />
      <main style={{ maxWidth: 480, margin: "0 auto", minHeight: "100vh", paddingBottom: 80 }}>{children}</main>
      <BottomNav />
      <ChatBot />
    </ThemeProvider>
  );
}
