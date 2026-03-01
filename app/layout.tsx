import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Datore -- Safe Service Marketplace', description: 'Verified workers, secure payments, real-time job marketplace' };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
