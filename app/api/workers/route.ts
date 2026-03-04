export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withApiGuard } from '@/lib/apiGuard';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { track, trackTiming } from '@/lib/observability';

export const GET = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const url = new URL(req.url);
  const category = url.searchParams.get('category') || '';
  const search = url.searchParams.get('q') || '';
  const available = url.searchParams.get('available');
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('workers')
    .select('*, profiles!workers_id_fkey(name, avatar_url, rating, review_count, city, state)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.contains('categories', [category]);
  }
  if (available === 'true') {
    query = query.eq('available', true);
  }
  if (search) {
    query = query.or(`skills.ilike.%${search}%,categories.cs.{${search}}`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('[Workers GET] Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch workers' }, { status: 500 });
  }

  trackTiming('api_workers_latency', Date.now() - start, { method: 'GET' });
  return NextResponse.json({ data: data || [], page, limit, total: count || 0 });
}, { requireAuth: true, rateLimit: 60 });

export const POST = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const { body, userId } = ctx;

  // Check if worker profile already exists
  const { data: existing } = await supabaseAdmin
    .from('workers')
    .select('id')
    .eq('id', userId)
    .single();

  if (existing) {
    // Update existing worker profile
    const { data, error } = await supabaseAdmin
      .from('workers')
      .update({
        skills: body.skills || [],
        categories: body.categories || [],
        licensed: body.licensed || false,
        hourly_rate: body.hourly_rate || null,
        available: body.available ?? true,
        service_radius: body.service_radius || null,
        response_time: body.response_time || null,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Workers POST] Supabase update error:', error.message);
      return NextResponse.json({ error: 'Failed to update worker profile' }, { status: 500 });
    }

    track('worker_updated', { userId });
    trackTiming('api_workers_latency', Date.now() - start, { method: 'POST' });
    return NextResponse.json({ data, message: 'Worker profile updated' });
  }

  // Create new worker profile
  const { data, error } = await supabaseAdmin
    .from('workers')
    .insert({
      id: userId,
      skills: body.skills || [],
      categories: body.categories || [],
      licensed: body.licensed || false,
      hourly_rate: body.hourly_rate || null,
      available: body.available ?? true,
      service_radius: body.service_radius || null,
      response_time: body.response_time || null,
    })
    .select()
    .single();

  if (error) {
    console.error('[Workers POST] Supabase insert error:', error.message);
    return NextResponse.json({ error: 'Failed to create worker profile' }, { status: 500 });
  }

  // Update profile role to worker
  await supabaseAdmin
    .from('profiles')
    .update({ role: 'worker' })
    .eq('id', userId);

  track('worker_created', { userId });
  trackTiming('api_workers_latency', Date.now() - start, { method: 'POST' });
  return NextResponse.json({ data, message: 'Worker profile created' }, { status: 201 });
}, {
  requireAuth: true,
  rateLimit: 10,
});
