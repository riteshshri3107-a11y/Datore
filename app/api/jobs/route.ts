export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withApiGuard, schemas } from '@/lib/apiGuard';
import { track, trackTiming } from '@/lib/observability';
import { getJobs, createJob } from '@/lib/supabase';

export const GET = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const url = new URL(req.url);
  const category = url.searchParams.get('category') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const data = await getJobs({ category: category || undefined });
  trackTiming('api_jobs_latency', Date.now() - start, { method:'GET' });
  return NextResponse.json({ data, page, limit, total: data.length });
}, { requireAuth: true, rateLimit: 60 });

export const POST = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const { body, userId } = ctx;
  const { data: created, error } = await createJob({ ...body, poster_id: userId, status: 'open' });
  if (error) return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
  track('job_created', { userId, category:body.category });
  trackTiming('api_jobs_latency', Date.now() - start, { method:'POST' });
  return NextResponse.json({ data: created, message:'Job posted' }, { status:201 });
}, { requireAuth:true, rateLimit:10, bodySchema:schemas.createJob, moderateFields:['title','description'], moderateAs:'listing' });
