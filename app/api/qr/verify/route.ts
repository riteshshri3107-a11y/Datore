export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withApiGuard } from '@/lib/apiGuard';
import { track } from '@/lib/observability';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export const POST = withApiGuard(async (req, ctx) => {
  const { body, userId } = ctx;
  const { qrCode, targetUserId } = body;

  if (!qrCode) return NextResponse.json({ error: 'QR code required' }, { status: 400 });
  if (!targetUserId) return NextResponse.json({ error: 'Target user ID required' }, { status: 400 });

  const { data: storedCode } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('user_id', targetUserId)
    .eq('code', qrCode)
    .eq('is_active', true)
    .single();

  if (!storedCode) {
    track('qr_verification_failed', { userId, targetUserId });
    return NextResponse.json({ verified: false, message: 'Invalid or expired QR code' }, { status: 401 });
  }

  if (storedCode.expires_at && new Date(storedCode.expires_at) < new Date()) {
    track('qr_verification_expired', { userId, targetUserId });
    return NextResponse.json({ verified: false, message: 'QR code has expired' }, { status: 401 });
  }

  track('qr_verification_success', { userId, targetUserId });
  return NextResponse.json({ verified: true, message: 'Identity verified via QR' });
}, { requireAuth: true, rateLimit: 10 });
