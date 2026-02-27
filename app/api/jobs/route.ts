export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
export async function GET(req: NextRequest) {
  return NextResponse.json({ message: 'jobs endpoint', data: [] });
}
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ message: 'jobs created', data: body });
}
