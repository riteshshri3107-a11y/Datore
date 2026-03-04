export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withApiGuard, schemas } from '@/lib/apiGuard';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { track, trackTiming } from '@/lib/observability';

export const GET = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const url = new URL(req.url);
  const category = url.searchParams.get('category') || '';
  const status = url.searchParams.get('status') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('jobs')
    .select('*, profiles!jobs_customer_id_fkey(name, avatar_url)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq('category_id', category);
  }
  if (status) {
    query = query.eq('status', status);
  }

  // Users see their own jobs (as customer or worker)
  const { userId, userRole } = ctx;
  if (userRole !== 'admin' && userRole !== 'moderator') {
    query = query.or(`customer_id.eq.${userId},worker_id.eq.${userId}`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('[Jobs GET] Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }

  trackTiming('api_jobs_latency', Date.now() - start, { method: 'GET' });
  return NextResponse.json({ data: data || [], page, limit, total: count || 0 });
}, { requireAuth: true, rateLimit: 60 });

export const POST = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const { body, userId } = ctx;

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .insert({
      customer_id: userId,
      category_id: body.category,
      job_description: body.description,
      scheduled_time: body.scheduled_time || null,
      agreed_price: body.amount,
      status: 'open',
    })
    .select()
    .single();

  if (error) {
    console.error('[Jobs POST] Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  }

  track('job_created', { userId, category: body.category });
  trackTiming('api_jobs_latency', Date.now() - start, { method: 'POST' });
  return NextResponse.json({ data, message: 'Job posted' }, { status: 201 });
}, { requireAuth: true, rateLimit: 10, bodySchema: schemas.createJob, moderateFields: ['title', 'description'], moderateAs: 'listing' });
