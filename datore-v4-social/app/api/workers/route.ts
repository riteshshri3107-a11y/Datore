export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export async function GET(req: NextRequest) {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { searchParams } = new URL(req.url); const cat = searchParams.get("category"); const q = searchParams.get("q");
  let query = sb.from("workers").select("*, profiles(*)").eq("available", true);
  if (cat) query = query.contains("categories", [cat]);
  query = query.order("hourly_rate", { ascending: true }).limit(50);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  let workers = data || [];
  if (q) { const s = q.toLowerCase(); workers = workers.filter((w: any) => w.profiles?.name?.toLowerCase().includes(s) || JSON.stringify(w.skills || []).toLowerCase().includes(s)); }
  return NextResponse.json({ workers });
}
