import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  // Placeholder for Stripe webhook
  return NextResponse.json({ received: true });
}
