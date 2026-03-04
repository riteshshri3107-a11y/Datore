export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server';
import { withApiGuard, schemas } from '@/lib/apiGuard';
import { supabaseAdmin } from '@/lib/supabaseServer';
import { track, trackTiming } from '@/lib/observability';

export const GET = withApiGuard(async (req, ctx) => {
  const url = new URL(req.url);
  const roomId = url.searchParams.get('roomId') || '';
  const { userId } = ctx;

  if (!roomId) {
    // Return all chat rooms for the current user
    const { data: rooms, error } = await supabaseAdmin
      .from('chat_rooms')
      .select('*')
      .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('[Chat GET] Supabase error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch chat rooms' }, { status: 500 });
    }

    return NextResponse.json({ data: rooms || [] });
  }

  // Verify user is a participant in this room
  const { data: room, error: roomError } = await supabaseAdmin
    .from('chat_rooms')
    .select('id, participant_1, participant_2')
    .eq('id', roomId)
    .single();

  if (roomError || !room) {
    return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
  }

  if (room.participant_1 !== userId && room.participant_2 !== userId) {
    return NextResponse.json({ error: 'Not authorized to view this chat' }, { status: 403 });
  }

  // Fetch messages for the room
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
  const offset = (page - 1) * limit;

  const { data: messages, error: msgError, count } = await supabaseAdmin
    .from('messages')
    .select('*', { count: 'exact' })
    .eq('chat_room_id', roomId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (msgError) {
    console.error('[Chat GET] Messages error:', msgError.message);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }

  // Mark unread messages as read
  await supabaseAdmin
    .from('messages')
    .update({ is_read: true })
    .eq('chat_room_id', roomId)
    .neq('sender_id', userId)
    .eq('is_read', false);

  return NextResponse.json({ data: messages || [], roomId, total: count || 0 });
}, { requireAuth: true, rateLimit: 60 });

export const POST = withApiGuard(async (req, ctx) => {
  const start = Date.now();
  const { body, userId } = ctx;

  // Look up sender name
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('name')
    .eq('id', userId)
    .single();

  // Verify user is a participant in the room
  const { data: room, error: roomError } = await supabaseAdmin
    .from('chat_rooms')
    .select('id, participant_1, participant_2')
    .eq('id', body.roomId)
    .single();

  if (roomError || !room) {
    return NextResponse.json({ error: 'Chat room not found' }, { status: 404 });
  }

  if (room.participant_1 !== userId && room.participant_2 !== userId) {
    return NextResponse.json({ error: 'Not authorized to send messages in this chat' }, { status: 403 });
  }

  // Insert the message
  const { data: message, error: msgError } = await supabaseAdmin
    .from('messages')
    .insert({
      chat_room_id: body.roomId,
      sender_id: userId,
      sender_name: profile?.name || '',
      msg_type: body.msg_type || 'text',
      content: body.text,
      media_url: body.media_url || null,
      is_read: false,
    })
    .select()
    .single();

  if (msgError) {
    console.error('[Chat POST] Supabase error:', msgError.message);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }

  // Update the chat room's last message
  await supabaseAdmin
    .from('chat_rooms')
    .update({
      last_message: body.text,
      last_message_at: new Date().toISOString(),
    })
    .eq('id', body.roomId);

  track('message_sent', { userId, roomId: body.roomId });
  trackTiming('api_chat_latency', Date.now() - start);
  return NextResponse.json({ data: message }, { status: 201 });
}, { requireAuth: true, rateLimit: 30, bodySchema: schemas.sendMessage, moderateFields: ['text'], moderateAs: 'message' });
