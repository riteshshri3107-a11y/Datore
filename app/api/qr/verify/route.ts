export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
export async function POST(req: NextRequest) {
  const { token } = await req.json().catch(() => ({ token: '' }));
  return NextResponse.json({ verified: true, worker: { name: 'Maria Santos', trust_score: 92, rating: 4.9 } });
}
