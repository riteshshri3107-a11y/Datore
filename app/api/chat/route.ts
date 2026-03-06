export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withApiGuard, schemas } from '@/lib/apiGuard';
import { track, trackTiming } from '@/lib/observability';
import { getChatMessages, sendMessage } from '@/lib/supabase';

export const GET = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const url = new URL(req.url);
  const roomId = url.searchParams.get('roomId') || '';
  if (!roomId) return NextResponse.json({ error: 'roomId required' }, { status: 400 });
  const data = await getChatMessages(roomId);
  trackTiming('api_chat_latency', Date.now() - start, { method: 'GET' });
  return NextResponse.json({ data, roomId });
}, { requireAuth:true, rateLimit:60 });

export const POST = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const { body, userId } = ctx;
  const data = await sendMessage({ room_id: body.roomId, sender_id: userId, sender_name: body.senderName || 'User', content: body.text });
  track('message_sent', { userId, roomId:body.roomId });
  trackTiming('api_chat_latency', Date.now() - start);
  return NextResponse.json({ data }, { status:201 });
}, { requireAuth:true, rateLimit:30, bodySchema:schemas.sendMessage, moderateFields:['text'], moderateAs:'message' });
