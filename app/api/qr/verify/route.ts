export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withApiGuard } from '@/lib/apiGuard';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { track } from '@/lib/observability';

export const POST = withApiGuard(async (req, ctx) => {
  const { body, userId } = ctx;
  const { qrCode, targetUserId } = body;

  if (!qrCode) {
    return NextResponse.json({ error: 'QR code required' }, { status: 400 });
  }

  if (!targetUserId) {
    return NextResponse.json({ error: 'Target user ID required' }, { status: 400 });
  }

  // Check against the workers table qr_code_data
  const { data: worker, error: workerError } = await supabaseAdmin
    .from('workers')
    .select('id, qr_code_data, badge')
    .eq('id', targetUserId)
    .single();

  let verified = false;
  let source = '';

  if (worker && worker.qr_code_data === qrCode) {
    verified = true;
    source = 'workers';
  }

  // Also check worker_profiles qr_token if not found in workers
  if (!verified) {
    const { data: workerProfile } = await supabaseAdmin
      .from('worker_profiles')
      .select('id, qr_token, is_police_verified')
      .eq('id', targetUserId)
      .single();

    if (workerProfile && workerProfile.qr_token === qrCode) {
      verified = true;
      source = 'worker_profiles';
    }
  }

  if (!verified) {
    track('qr_verification_failed', { userId, targetUserId });
    return NextResponse.json({ verified: false, message: 'QR code verification failed' }, { status: 400 });
  }

  // Fetch the target user's profile for response
  const { data: targetProfile } = await supabaseAdmin
    .from('profiles')
    .select('name, avatar_url, verified, rating, review_count')
    .eq('id', targetUserId)
    .single();

  track('qr_verification_success', { userId, targetUserId, source });
  return NextResponse.json({
    verified: true,
    message: 'Identity verified via QR',
    profile: targetProfile || null,
  });
}, { requireAuth: true, rateLimit: 10 });
