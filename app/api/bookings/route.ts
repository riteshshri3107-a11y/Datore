export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withApiGuard } from '@/lib/apiGuard';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { track, trackTiming } from '@/lib/observability';

export const GET = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const url = new URL(req.url);
  const status = url.searchParams.get('status') || '';
  const role = url.searchParams.get('role') || ''; // 'worker' or 'customer'
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const offset = (page - 1) * limit;
  const { userId, userRole } = ctx;

  let query = supabaseAdmin
    .from('bookings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Non-admin users can only see their own bookings
  if (userRole !== 'admin' && userRole !== 'moderator') {
    if (role === 'worker') {
      query = query.eq('worker_id', userId);
    } else if (role === 'customer') {
      query = query.eq('customer_id', userId);
    } else {
      query = query.or(`worker_id.eq.${userId},customer_id.eq.${userId}`);
    }
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('[Bookings GET] Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }

  trackTiming('api_bookings_latency', Date.now() - start, { method: 'GET' });
  return NextResponse.json({ data: data || [], page, limit, total: count || 0 });
}, { requireAuth: true, rateLimit: 60 });

export const POST = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const { body, userId } = ctx;

  // Look up customer name
  const { data: customerProfile } = await supabaseAdmin
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single();

  // Look up worker name
  const { data: workerProfile } = await supabaseAdmin
    .from('profiles')
    .select('name')
    .eq('id', body.worker_id)
    .single();

  // Calculate platform fee (e.g. 10%)
  const amount = body.amount || 0;
  const platformFee = Math.round(amount * 0.1 * 100) / 100;
  const workerPayout = Math.round((amount - platformFee) * 100) / 100;

  const { data, error } = await supabaseAdmin
    .from('bookings')
    .insert({
      worker_id: body.worker_id,
      customer_id: userId,
      worker_name: workerProfile?.name || '',
      customer_name: customerProfile?.name || '',
      service: body.service || '',
      category_id: body.category_id || null,
      description: body.description || '',
      status: 'pending',
      amount,
      platform_fee: platformFee,
      worker_payout: workerPayout,
      scheduled_date: body.scheduled_date || null,
      scheduled_time: body.scheduled_time || null,
      location_address: body.location_address || null,
      location_lat: body.location_lat || null,
      location_lng: body.location_lng || null,
    })
    .select()
    .single();

  if (error) {
    console.error('[Bookings POST] Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }

  track('booking_created', { userId, workerId: body.worker_id });
  trackTiming('api_bookings_latency', Date.now() - start, { method: 'POST' });
  return NextResponse.json({ data, message: 'Booking created' }, { status: 201 });
}, {
  requireAuth: true,
  rateLimit: 10,
  moderateFields: ['description'],
  moderateAs: 'post',
});
