import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const workerId = new URL(req.url).searchParams.get("id");
  if (!workerId) return NextResponse.json({ error: "Worker ID required" }, { status: 400 });
  const { data: profile } = await supabase.from("profiles").select("name, verified, verified_at, verification_expiry, rating, review_count, job_count, avatar_url").eq("id", workerId).single();
  if (!profile) return NextResponse.json({ error: "Worker not found" }, { status: 404 });
  await supabase.from("qr_scans").insert({ worker_id: workerId, scanned_at: new Date().toISOString() });
  return NextResponse.json({
    name: profile.name, verified: profile.verified,
    verified_at: profile.verified_at, expires: profile.verification_expiry,
    rating: profile.rating, reviews: profile.review_count, jobs: profile.job_count,
    safe: profile.verified && new Date(profile.verification_expiry || 0) > new Date(),
  });
}
