import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Datore - Find Trusted Experts for Any Job",
  description: "The safe, reliable marketplace connecting you with police-verified professionals at affordable rates. By AARNAIT AI.",
  manifest: "/manifest.json",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, themeColor: "#00D4AA" };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en"><head><meta name="apple-mobile-web-app-capable" content="yes" /></head>
    <body className="antialiased">{children}</body></html>
  );
}
