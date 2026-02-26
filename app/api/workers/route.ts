import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const query = searchParams.get("q");
  const verified = searchParams.get("verified") === "true";
  const sort = searchParams.get("sort") || "price_asc";

  let q = supabase.from("workers").select("*, profiles(*)").eq("available", true);
  if (category) q = q.contains("categories", [category]);
  if (sort === "price_asc") q = q.order("hourly_rate", { ascending: true });
  else if (sort === "price_desc") q = q.order("hourly_rate", { ascending: false });
  q = q.limit(50);
  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  let workers = data || [];
  if (verified) workers = workers.filter((w: any) => w.profiles?.verified);
  if (query) {
    const s = query.toLowerCase();
    workers = workers.filter((w: any) => w.profiles?.name?.toLowerCase().includes(s) || JSON.stringify(w.skills || []).toLowerCase().includes(s));
  }
  return NextResponse.json({ workers });
}
