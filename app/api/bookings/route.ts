import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const fee = Math.round(body.amount * 0.01);
  const { data, error } = await supabase.from("bookings").insert({
    ...body, platform_fee: fee, worker_payout: body.amount - fee, status: "requested",
  }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  // Notify worker
  await supabase.from("notifications").insert({
    user_id: body.worker_id, type: "booking", title: "New Booking Request",
    message: `${body.customer_name || "A customer"} wants to book you for ${body.service}.`,
    data: { booking_id: data.id },
  });
  return NextResponse.json({ booking: data });
}
