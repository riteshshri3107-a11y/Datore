export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withApiGuard, schemas } from '@/lib/apiGuard';
import { track, trackTiming } from '@/lib/observability';

export const GET = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const url = new URL(req.url);
  const category = url.searchParams.get('category') || '';
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);
  const data: any[] = [];
  trackTiming('api_jobs_latency', Date.now() - start, { method:'GET' });
  return NextResponse.json({ data, page, limit, total:0 });
}, { requireAuth: true, rateLimit: 60 });

export const POST = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const { body, userId } = ctx;
  const created = { id: Date.now().toString(), ...body, poster_id:userId, created_at:new Date().toISOString(), status:'open' };
  track('job_created', { userId, category:body.category });
  trackTiming('api_jobs_latency', Date.now() - start, { method:'POST' });
  return NextResponse.json({ data:created, message:'Job posted' }, { status:201 });
}, { requireAuth:true, rateLimit:10, bodySchema:schemas.createJob, moderateFields:['title','description'], moderateAs:'listing' });
