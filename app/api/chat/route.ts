export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
const r: Record<string, string> = { help: "I can help you find workers, make bookings, check payments, browse the marketplace, and more!", categories: "We have 12+ service categories plus a full marketplace for buying and selling locally.", price: "Workers set their own rates. We only charge 1% platform fee — 99% goes to the worker.", safety: "All workers can get police-verified. Scan their QR code in person to verify identity.", payment: "Payments held in escrow until job done. We support UPI, cards, and wallet.", verify: "Go to Profile → Get Police Verified. Upload ID and police clearance certificate.", marketplace: "Browse our marketplace to buy, sell, and trade locally. List items for free!", community: "Join communities to connect with professionals, local groups, and interest-based networks." };
export async function POST(req: NextRequest) {
  const { message } = await req.json(); const msg = (message || "").toLowerCase();
  let reply = "I can help with Datore! Ask about categories, pricing, safety, marketplace, or communities.";
  for (const [key, val] of Object.entries(r)) { if (msg.includes(key)) { reply = val; break; } }
  if (msg.includes("hello") || msg.includes("hi")) reply = "Hello! Welcome to Datore. How can I help?";
  if (msg.includes("book")) reply = "Search → Pick a worker → Book Now → Choose date/time → Confirm. Payment held in escrow.";
  return NextResponse.json({ reply });
}
