export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withApiGuard, schemas } from '@/lib/apiGuard';
import { track, trackTiming } from '@/lib/observability';
import { searchWorkers } from '@/lib/supabase';

export const GET = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const url = new URL(req.url);
  const category = url.searchParams.get('category') || '';
  const search = url.searchParams.get('q') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

  const data = await searchWorkers({ category: category || undefined, skill: search || undefined });

  trackTiming('api_workers_latency', Date.now() - start, { method:'GET' });
  return NextResponse.json({ data, page, limit, total: data.length });
}, { requireAuth: true, rateLimit: 60 });

export const POST = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const { body, userId } = ctx;

  // TODO: Replace with real Supabase insert
  const created = { id: Date.now().toString(), ...body, created_by:userId, created_at:new Date().toISOString() };
  
  track('workers_created', { userId });
  trackTiming('api_workers_latency', Date.now() - start, { method:'POST' });
  return NextResponse.json({ data:created, message:'Created successfully' }, { status:201 });
}, {
  requireAuth: true,
  rateLimit: 10,
  bodySchema: undefined,
  moderateFields: ['title','description','name','text','content'],
  moderateAs: 'post',
});
