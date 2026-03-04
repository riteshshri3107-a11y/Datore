export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { track, log } from '@/lib/observability';

// Webhook endpoint -- no user auth, but requires webhook secret
export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature') || req.headers.get('x-webhook-secret') || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || '';

  if (!signature || !webhookSecret) {
    track('webhook_unauthorized', { ip: req.ip || 'unknown' });
    log('warn', 'Webhook received without valid signature', {}, 'payments');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const eventType = body.type || 'unknown';

    track('webhook_received', { type: eventType });
    log('info', `Payment webhook: ${eventType}`, { id: body.id }, 'payments');

    switch (eventType) {
      case 'payment_intent.succeeded': {
        const paymentIntentId = body.data?.object?.id;
        const amountReceived = body.data?.object?.amount_received;

        if (paymentIntentId) {
          // Update the transaction status to completed
          const { data: txn } = await supabaseAdmin
            .from('transactions')
            .update({ status: 'completed' })
            .eq('stripe_payment_intent_id', paymentIntentId)
            .select('id, booking_id, payee_id, worker_payout')
            .single();

          if (txn) {
            // Update the booking status to paid
            await supabaseAdmin
              .from('bookings')
              .update({ status: 'paid' })
              .eq('id', txn.booking_id);

            // Credit worker earnings
            if (txn.payee_id && txn.worker_payout) {
              const { data: worker } = await supabaseAdmin
                .from('workers')
                .select('total_earnings')
                .eq('id', txn.payee_id)
                .single();

              if (worker) {
                await supabaseAdmin
                  .from('workers')
                  .update({ total_earnings: (worker.total_earnings || 0) + txn.worker_payout })
                  .eq('id', txn.payee_id);
              }
            }
          }
        }

        track('payment_success', { amount: amountReceived, paymentIntentId });
        break;
      }

      case 'payment_intent.payment_failed': {
        const failedIntentId = body.data?.object?.id;
        const failureMessage = body.data?.object?.last_payment_error?.message;

        if (failedIntentId) {
          await supabaseAdmin
            .from('transactions')
            .update({ status: 'failed' })
            .eq('stripe_payment_intent_id', failedIntentId);
        }

        track('payment_failed', { reason: failureMessage, paymentIntentId: failedIntentId });
        break;
      }

      case 'charge.dispute.created': {
        const disputePaymentIntent = body.data?.object?.payment_intent;

        if (disputePaymentIntent) {
          await supabaseAdmin
            .from('transactions')
            .update({ status: 'disputed' })
            .eq('stripe_payment_intent_id', disputePaymentIntent);
        }

        track('payment_dispute', { amount: body.data?.object?.amount });
        log('warn', 'Payment dispute created', { id: body.data?.object?.id }, 'payments');
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    track('webhook_error', { error: err.message });
    log('error', 'Webhook processing error', { error: err.message }, 'payments');
    return NextResponse.json({ error: 'Processing error' }, { status: 500 });
  }
}
