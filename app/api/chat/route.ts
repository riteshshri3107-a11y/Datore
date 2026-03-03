export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withApiGuard, schemas } from '@/lib/apiGuard';
import { track, trackTiming } from '@/lib/observability';

export const GET = withApiGuard(async (req, ctx) => {
  const url = new URL(req.url);
  const roomId = url.searchParams.get('roomId') || '';
  const data: any[] = [];
  return NextResponse.json({ data, roomId });
}, { requireAuth:true, rateLimit:60 });

export const POST = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const { body, userId } = ctx;
  const msg = { id:Date.now().toString(), sender_id:userId, ...body, created_at:new Date().toISOString() };
  track('message_sent', { userId, roomId:body.roomId });
  trackTiming('api_chat_latency', Date.now() - start);
  return NextResponse.json({ data:msg }, { status:201 });
}, { requireAuth:true, rateLimit:30, bodySchema:schemas.sendMessage, moderateFields:['text'], moderateAs:'message' });
