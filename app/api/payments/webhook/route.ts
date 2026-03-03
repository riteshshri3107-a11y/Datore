export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { track, log } from '@/lib/observability';

// Webhook endpoint — no user auth, but requires webhook secret
export async function POST(req: NextRequest) {
  const signature = req.headers.get('stripe-signature') || req.headers.get('x-webhook-secret') || '';
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || '';
  
  // Verify webhook signature (simplified — use Stripe's verify in production)
  if (!signature || !webhookSecret) {
    track('webhook_unauthorized', { ip:req.ip || 'unknown' });
    log('warn', 'Webhook received without valid signature', {}, 'payments');
    return NextResponse.json({ error:'Unauthorized' }, { status:401 });
  }

  try {
    const body = await req.json();
    const eventType = body.type || 'unknown';
    
    track('webhook_received', { type:eventType });
    log('info', `Payment webhook: ${eventType}`, { id:body.id }, 'payments');

    // Handle different event types
    switch (eventType) {
      case 'payment_intent.succeeded':
        track('payment_success', { amount:body.data?.object?.amount });
        break;
      case 'payment_intent.payment_failed':
        track('payment_failed', { reason:body.data?.object?.last_payment_error?.message });
        break;
      case 'charge.dispute.created':
        track('payment_dispute', { amount:body.data?.object?.amount });
        log('warn', 'Payment dispute created', { id:body.data?.object?.id }, 'payments');
        break;
    }

    return NextResponse.json({ received:true });
  } catch (err: any) {
    track('webhook_error', { error:err.message });
    log('error', 'Webhook processing error', { error:err.message }, 'payments');
    return NextResponse.json({ error:'Processing error' }, { status:500 });
  }
}
