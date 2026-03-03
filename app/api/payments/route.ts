export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withApiGuard, schemas } from '@/lib/apiGuard';
import { track, trackTiming } from '@/lib/observability';

export const POST = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const { body, userId } = ctx;
  // Server-side payment — never trust client amounts
  // TODO: Integrate Stripe/Adyen PCI-compliant provider
  const txn = { id:`txn_${Date.now()}`, userId, amount:body.amount, jobId:body.jobId, status:'pending', created_at:new Date().toISOString() };
  track('payment_initiated', { userId, amount:body.amount });
  trackTiming('api_payment_latency', Date.now() - start);
  return NextResponse.json({ data:txn, message:'Payment initiated' }, { status:201 });
}, { requireAuth:true, rateLimit:5, bodySchema:schemas.createPayment });
