export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withApiGuard, schemas } from '@/lib/apiGuard';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { track, trackTiming } from '@/lib/observability';

export const GET = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const url = new URL(req.url);
  const category = url.searchParams.get('category') || '';
  const search = url.searchParams.get('q') || '';
  const condition = url.searchParams.get('condition') || '';
  const status = url.searchParams.get('status') || 'active';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const offset = (page - 1) * limit;

  let query = supabaseAdmin
    .from('listings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }
  if (category) {
    query = query.eq('category', category);
  }
  if (condition) {
    query = query.eq('condition', condition);
  }
  if (search) {
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    console.error('[Listings GET] Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }

  trackTiming('api_listings_latency', Date.now() - start, { method: 'GET' });
  return NextResponse.json({ data: data || [], page, limit, total: count || 0 });
}, { requireAuth: true, rateLimit: 60 });

export const POST = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const { body, userId } = ctx;

  // Look up the user's name for denormalized storage
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single();

  const { data, error } = await supabaseAdmin
    .from('listings')
    .insert({
      user_id: userId,
      user_name: profile?.name || '',
      title: body.name || body.title,
      description: body.description,
      price: body.price,
      category: body.category || null,
      condition: body.condition || null,
      location_text: body.location_text || null,
      images: body.images || [],
      status: 'active',
      views_count: 0,
    })
    .select()
    .single();

  if (error) {
    console.error('[Listings POST] Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }

  track('listing_created', { userId, category: body.category });
  trackTiming('api_listings_latency', Date.now() - start, { method: 'POST' });
  return NextResponse.json({ data, message: 'Listing created' }, { status: 201 });
}, {
  requireAuth: true,
  rateLimit: 10,
  bodySchema: schemas.createListing,
  moderateFields: ['name', 'description'],
  moderateAs: 'listing',
});
