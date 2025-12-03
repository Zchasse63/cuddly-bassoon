/**
 * Inbox Threads API Routes
 * GET /api/inbox/threads - Get conversation threads
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MessageChannel, ConversationThread, Message } from '@/lib/communication/types';

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
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    // Get distinct threads with latest message
    let query = supabase
      .from('messages')
      .select('*')
      .eq('user_id', user.id)
      .not('thread_id', 'is', null)
      .order('created_at', { ascending: false });

    if (channel) {
      query = query.eq('channel', channel);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('[API] Threads error:', error);
      return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 });
    }

    // Group messages by thread
    // Cast to Message type since DB schema includes thread_id from Phase 9 migration
    const threadMap = new Map<string, Message[]>();
    for (const msg of messages || []) {
      const msgWithThread = msg as unknown as Message;
      const threadId = msgWithThread.thread_id;
      if (!threadId) continue;

      if (!threadMap.has(threadId)) {
        threadMap.set(threadId, []);
      }
      threadMap.get(threadId)!.push(msgWithThread);
    }

    // Build thread summaries
    const threads: ConversationThread[] = [];
    for (const [threadId, threadMessages] of threadMap) {
      if (threadMessages.length === 0) continue;

      const sortedMessages = threadMessages.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      const lastMessage = sortedMessages[sortedMessages.length - 1]!;
      const unreadCount = threadMessages.filter(
        (m) => !m.is_read && m.direction === 'inbound'
      ).length;
      const channels = [...new Set(threadMessages.map((m) => m.channel))];

      // Determine contact identifier
      const contactIdentifier =
        lastMessage.direction === 'inbound' ? lastMessage.sender : lastMessage.recipient;

      threads.push({
        thread_id: threadId,
        contact_identifier: contactIdentifier || 'Unknown',
        channels: channels as MessageChannel[],
        message_count: threadMessages.length,
        unread_count: unreadCount,
        last_message: lastMessage,
        messages: sortedMessages,
        deal_id: lastMessage.deal_id || undefined,
        lead_id: lastMessage.lead_id || undefined,
        buyer_id: lastMessage.buyer_id || undefined,
      });
    }

    // Sort by last message date
    threads.sort(
      (a, b) =>
        new Date(b.last_message.created_at).getTime() -
        new Date(a.last_message.created_at).getTime()
    );

    return NextResponse.json({
      threads: threads.slice(0, limit),
      total: threads.length,
    });
  } catch (error) {
    console.error('[API] Threads error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
