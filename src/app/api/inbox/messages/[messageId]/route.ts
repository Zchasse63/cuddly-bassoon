/**
 * Message Detail API Routes
 * PATCH /api/inbox/messages/[messageId] - Update message (mark as read)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CommunicationService } from '@/lib/communication';

interface RouteParams {
  params: Promise<{ messageId: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { messageId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { is_read } = body;

    if (is_read !== undefined) {
      const commService = new CommunicationService(supabase);
      if (is_read) {
        await commService.markAsRead(user.id, messageId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] Message update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
