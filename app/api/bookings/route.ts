export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withApiGuard, schemas } from '@/lib/apiGuard';
import { track, trackTiming } from '@/lib/observability';
import { getMyBookings, createBooking } from '@/lib/supabase';

export const GET = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const { userId } = ctx;
  const page = parseInt(new URL(req.url).searchParams.get('page') || '1');
  const limit = Math.min(parseInt(new URL(req.url).searchParams.get('limit') || '20'), 50);

  const data = await getMyBookings(userId);

  trackTiming('api_bookings_latency', Date.now() - start, { method:'GET' });
  return NextResponse.json({ data, page, limit, total: data.length });
}, { requireAuth: true, rateLimit: 60 });

export const POST = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const { body, userId } = ctx;

  const { data: created, error } = await createBooking({ ...body, user_id: userId, confirmation_code: 'BK-' + Date.now().toString(36).toUpperCase() });
  if (error) return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });

  track('bookings_created', { userId });
  trackTiming('api_bookings_latency', Date.now() - start, { method:'POST' });
  return NextResponse.json({ data: created, message:'Booking confirmed' }, { status:201 });
}, {
  requireAuth: true,
  rateLimit: 10,
  bodySchema: undefined,
  moderateFields: ['title','description','name','text','content'],
  moderateAs: 'post',
});
