"use client";
import { useEffect } from "react";
import { useThemeStore } from "@/store/useThemeStore";
export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isDark, set } = useThemeStore();
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("datore-theme") : null;
    if (saved) set(saved === "dark");
  }, [set]);
  return <div style={{ background: isDark ? "#0A0A0F" : "#F5F6FA", color: isDark ? "#F0F0F5" : "#1A1A2E", minHeight: "100vh", transition: "background .3s, color .3s" }}>{children}</div>;
}
