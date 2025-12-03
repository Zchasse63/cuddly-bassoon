'use client';

/**
 * Inbox Page Client Component
 * Handles client-side inbox functionality
 */

import { useState, useCallback } from 'react';
import { UnifiedInbox } from '@/components/inbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';
import { ConversationThread } from '@/lib/communication/types';

interface InboxPageClientProps {
  initialUnreadCount: number;
}

export function InboxPageClient({ initialUnreadCount }: InboxPageClientProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);

  const handleThreadSelect = useCallback((thread: ConversationThread) => {
    // Update unread count when thread is selected
    if (thread.unread_count > 0) {
      setUnreadCount((prev) => Math.max(0, prev - thread.unread_count));
    }
  }, []);

  const handleReply = useCallback(async (threadId: string, message: string) => {
    try {
      // Get thread info to determine channel and recipient
      const response = await fetch(`/api/inbox/threads/${threadId}`);
      const thread = await response.json();

      if (!thread) {
        toast.error('Thread not found');
        return;
      }

      // Send reply based on channel
      const endpoint =
        thread.last_message.channel === 'email' ? '/api/email/send' : '/api/sms/send';
      const payload =
        thread.last_message.channel === 'email'
          ? {
              to: thread.contact_identifier,
              subject: `Re: ${thread.last_message.subject || 'No Subject'}`,
              body: message,
            }
          : {
              to: thread.contact_identifier,
              body: message,
            };

      const sendResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await sendResponse.json();

      if (result.success) {
        toast.success('Reply sent successfully');
      } else {
        toast.error(result.error || 'Failed to send reply');
      }
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('Failed to send reply');
    }
  }, []);

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Inbox</h1>
          {unreadCount > 0 && <Badge variant="default">{unreadCount} unread</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Inbox Content */}
      <div className="flex-1 overflow-hidden">
        <UnifiedInbox
          className="h-full"
          onThreadSelect={handleThreadSelect}
          onReply={handleReply}
        />
      </div>
    </div>
  );
}

export default InboxPageClient;
