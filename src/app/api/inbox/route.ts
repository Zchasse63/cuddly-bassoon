/**
 * Inbox API Routes
 * GET /api/inbox - Get inbox messages with filtering
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CommunicationService } from '@/lib/communication';
import { MessageChannel } from '@/lib/communication/types';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') as MessageChannel | null;
    const is_read = searchParams.get('is_read');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const commService = new CommunicationService(supabase);

    const messages = await commService.getInboxMessages(user.id, {
      channel: channel || undefined,
      is_read: is_read ? is_read === 'true' : undefined,
      limit,
      offset,
    });

    // Get unread count
    const unreadCount = await commService.getUnreadCount(user.id);

    return NextResponse.json({
      messages,
      unread_count: unreadCount,
      pagination: {
        limit,
        offset,
        has_more: messages.length === limit,
      },
    });
  } catch (error) {
    console.error('[API] Inbox error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
