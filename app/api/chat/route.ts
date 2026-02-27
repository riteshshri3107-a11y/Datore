export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";

const responses: Record<string, string> = {
  "help": "I can help you find workers, make bookings, check payments, and more! Try asking about categories, pricing, or safety features.",
  "categories": "We have 12+ categories: Home Services, Tech & IT, Education, Health, Beauty, Auto, Events, Delivery, Creative, Legal, Garden, and Skilled Trades.",
  "price": "Workers set their own hourly rates. We only charge 1% platform fee — the worker keeps 99% of every payment.",
  "safety": "All workers can get police-verified with a green badge. You can also scan their QR code in person to verify identity.",
  "payment": "Payments are held in escrow until the job is done. We support UPI, cards, and wallet payments.",
  "verify": "To get verified, go to Profile → Get Police Verified. Upload your ID and police clearance certificate.",
};

export async function POST(req: NextRequest) {
  const { message } = await req.json();
  const msg = (message || "").toLowerCase();
  let reply = "I can help you with Datore! Ask me about categories, pricing, safety, payments, or verification.";
  for (const [key, val] of Object.entries(responses)) {
    if (msg.includes(key)) { reply = val; break; }
  }
  if (msg.includes("hello") || msg.includes("hi")) reply = "Hello! Welcome to Datore. How can I help you today?";
  if (msg.includes("book")) reply = "To book a worker: Search → Pick a worker → Click 'Book Now' → Choose date/time → Confirm. Payment is held in escrow until completion.";
  return NextResponse.json({ reply });
}
