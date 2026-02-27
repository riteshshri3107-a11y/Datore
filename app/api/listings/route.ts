export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
export async function GET(req: NextRequest) { return NextResponse.json({ listings: [], message: "Marketplace listings API - coming soon" }); }
export async function POST(req: NextRequest) { const body = await req.json(); return NextResponse.json({ listing: body, message: "Listing created (demo)" }); }
