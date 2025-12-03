/**
 * Thread Detail API Routes
 * GET /api/inbox/threads/[threadId] - Get thread messages
 * PATCH /api/inbox/threads/[threadId] - Mark thread as read
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CommunicationService } from '@/lib/communication';

interface RouteParams {
  params: Promise<{ threadId: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { threadId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const commService = new CommunicationService(supabase);
    const messages = await commService.getThread(user.id, threadId);

    if (messages.length === 0) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('[API] Thread get error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { threadId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mark_read } = body;

    if (mark_read) {
      const commService = new CommunicationService(supabase);
      await commService.markThreadAsRead(user.id, threadId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Thread update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
