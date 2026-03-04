export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withApiGuard } from '@/lib/apiGuard';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { track, trackTiming } from '@/lib/observability';

// Providers route queries the service_profiles table joined with profiles
export const GET = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const url = new URL(req.url);
  const category = url.searchParams.get('category') || '';
  const search = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('service_profiles')
    .select('*, profiles!service_profiles_user_id_fkey(name, avatar_url, rating, review_count, city, state, verified)', { count: 'exact' })
    .order('id', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.contains('categories', [category]);
  }
  if (search) {
    query = query.or(`skills.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('[Providers GET] Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }

  trackTiming('api_providers_latency', Date.now() - start, { method: 'GET' });
  return NextResponse.json({ data: data || [], page, limit, total: count || 0 });
}, { requireAuth: true, rateLimit: 60 });

export const POST = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const { body, userId } = ctx;

  // Check if service profile already exists for this user
  const { data: existing } = await supabaseAdmin
    .from('service_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('service_profiles')
      .update({
        skills: body.skills || [],
        categories: body.categories || [],
        hourly_rate: body.hourly_rate || null,
        fixed_rate: body.fixed_rate || null,
        availability: body.availability || null,
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('[Providers POST] Supabase update error:', error.message);
      return NextResponse.json({ error: 'Failed to update service profile' }, { status: 500 });
    }

    track('provider_updated', { userId });
    trackTiming('api_providers_latency', Date.now() - start, { method: 'POST' });
    return NextResponse.json({ data, message: 'Service profile updated' });
  }

  const { data, error } = await supabaseAdmin
    .from('service_profiles')
    .insert({
      user_id: userId,
      skills: body.skills || [],
      categories: body.categories || [],
      hourly_rate: body.hourly_rate || null,
      fixed_rate: body.fixed_rate || null,
      availability: body.availability || null,
    })
    .select()
    .single();

  if (error) {
    console.error('[Providers POST] Supabase insert error:', error.message);
    return NextResponse.json({ error: 'Failed to create service profile' }, { status: 500 });
  }

  track('provider_created', { userId });
  trackTiming('api_providers_latency', Date.now() - start, { method: 'POST' });
  return NextResponse.json({ data, message: 'Service profile created' }, { status: 201 });
}, {
  requireAuth: true,
  rateLimit: 10,
});
