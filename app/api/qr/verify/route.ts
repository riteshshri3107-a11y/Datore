export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const workerId = new URL(req.url).searchParams.get("id");
  if (!workerId) return NextResponse.json({ error: "Worker ID required" }, { status: 400 });
  const { data: profile } = await supabase.from("profiles").select("name, verified, rating, review_count").eq("id", workerId).single();
  if (!profile) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ name: profile.name, verified: profile.verified, rating: profile.rating, reviews: profile.review_count });
}
