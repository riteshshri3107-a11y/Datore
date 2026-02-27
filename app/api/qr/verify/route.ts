export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export async function GET(req: NextRequest) {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const wid = new URL(req.url).searchParams.get("id");
  if (!wid) return NextResponse.json({ error: "Worker ID required" }, { status: 400 });
  const { data } = await sb.from("profiles").select("name, verified, rating, review_count").eq("id", wid).single();
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
