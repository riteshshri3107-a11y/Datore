export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ message: 'Payment processed', data: body });
}
