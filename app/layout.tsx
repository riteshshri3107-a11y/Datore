import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Datore - Find Trusted Experts for Any Job",
  description: "By AARNAIT AI - The safe marketplace for police-verified professionals.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="antialiased">{children}</body></html>;
}
