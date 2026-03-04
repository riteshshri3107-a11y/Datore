export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withApiGuard, schemas } from '@/lib/apiGuard';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { track, trackTiming } from '@/lib/observability';

export const POST = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const { body, userId } = ctx;

  // Verify the booking exists and belongs to this user
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from('bookings')
    .select('id, worker_id, customer_id, amount, platform_fee, worker_payout, status')
    .eq('id', body.jobId)
    .single();

  if (bookingError || !booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
  }

  if (booking.customer_id !== userId) {
    return NextResponse.json({ error: 'Not authorized to pay for this booking' }, { status: 403 });
  }

  if (booking.status === 'paid') {
    return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
  }

  // Use the server-side booking amount, not the client-provided amount
  const amount = booking.amount;
  const platformFee = booking.platform_fee || Math.round(amount * 0.1 * 100) / 100;
  const workerPayout = booking.worker_payout || Math.round((amount - platformFee) * 100) / 100;

  // Create the transaction record
  const { data: transaction, error: txnError } = await supabaseAdmin
    .from('transactions')
    .insert({
      booking_id: booking.id,
      payer_id: userId,
      payee_id: booking.worker_id,
      amount,
      platform_fee: platformFee,
      worker_payout: workerPayout,
      tip: body.tip || 0,
      method: body.method || 'stripe',
      status: 'pending',
      stripe_payment_intent_id: body.stripe_payment_intent_id || null,
    })
    .select()
    .single();

  if (txnError) {
    console.error('[Payments POST] Transaction insert error:', txnError.message);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }

  // Update booking status to pending_payment
  await supabaseAdmin
    .from('bookings')
    .update({ status: 'pending_payment' })
    .eq('id', booking.id);

  track('payment_initiated', { userId, amount, bookingId: booking.id });
  trackTiming('api_payment_latency', Date.now() - start);
  return NextResponse.json({ data: transaction, message: 'Payment initiated' }, { status: 201 });
}, { requireAuth: true, rateLimit: 5, bodySchema: schemas.createPayment });
