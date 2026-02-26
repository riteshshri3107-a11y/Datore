import { NextRequest, NextResponse } from "next/server";
export async function POST(req: NextRequest) {
  const body = await req.json();
  // Placeholder for Stripe integration
  return NextResponse.json({
    message: "Payment intent created (demo mode)",
    amount: body.amount,
    fee: Math.round(body.amount * 0.01),
    worker_gets: body.amount - Math.round(body.amount * 0.01),
  });
}
