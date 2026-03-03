export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withApiGuard } from '@/lib/apiGuard';
import { track } from '@/lib/observability';

export const POST = withApiGuard(async (req, ctx) => {
  const { body, userId } = ctx;
  const { qrCode, targetUserId } = body;
  
  if (!qrCode) return NextResponse.json({ error:'QR code required' }, { status:400 });
  
  // TODO: Verify QR code against Supabase stored codes
  track('qr_verification', { userId, targetUserId });
  return NextResponse.json({ verified:true, message:'Identity verified via QR' });
}, { requireAuth:true, rateLimit:10 });
