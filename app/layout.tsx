import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Datore — Trusted Skills & Social Marketplace", description: "By AARNAIT AI — Police-verified professionals, social marketplace & community." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
