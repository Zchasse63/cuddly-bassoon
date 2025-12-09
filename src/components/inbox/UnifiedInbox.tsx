'use client';

/**
 * Unified Inbox Component
 * Displays all communication channels (SMS, Email) in a single view
 * with conversation threading and channel filtering
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  MessageSquare,
  Mail,
  Phone,
  Search,
  RefreshCw,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ConversationThread, Message, MessageChannel } from '@/lib/communication/types';

interface UnifiedInboxProps {
  className?: string;
  onThreadSelect?: (thread: ConversationThread) => void;
  onReply?: (threadId: string, message: string) => void;
}

export function UnifiedInbox({ className, onThreadSelect, onReply }: UnifiedInboxProps) {
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<ConversationThread | null>(null);
  const [activeChannel, setActiveChannel] = useState<'all' | MessageChannel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchThreads = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeChannel !== 'all') params.set('channel', activeChannel);

      const response = await fetch(`/api/inbox/threads?${params}`);
      const data = await response.json();

      if (data.threads) {
        setThreads(data.threads);
        const totalUnread = data.threads.reduce(
          (sum: number, t: ConversationThread) => sum + t.unread_count,
          0
        );
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('Failed to fetch threads:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeChannel]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const handleThreadClick = async (thread: ConversationThread) => {
    setSelectedThread(thread);
    onThreadSelect?.(thread);

    // Mark as read
    if (thread.unread_count > 0) {
      await fetch(`/api/inbox/threads/${thread.thread_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mark_read: true }),
      });
      fetchThreads();
    }
  };

  const filteredThreads = threads.filter((thread) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      thread.contact_identifier.toLowerCase().includes(query) ||
      thread.last_message.body.toLowerCase().includes(query)
    );
  });

  const getChannelIcon = (channel: MessageChannel) => {
    switch (channel) {
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'voicemail':
        return <Phone className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: Message['status']) => {
    switch (status) {
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-green-500" />;
      case 'sent':
        return <Check className="h-3 w-3 text-muted-foreground" />;
      case 'queued':
      case 'sending':
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case 'failed':
      case 'bounced':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className={cn('flex h-full', className)}>
      {/* Thread List */}
      <div className="w-80 border-r flex flex-col">
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Inbox</h2>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && <Badge variant="secondary">{unreadCount} unread</Badge>}
              <Button variant="ghost" size="icon-sm" onClick={fetchThreads}>
                <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
              </Button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Tabs
          value={activeChannel}
          onValueChange={(v) => setActiveChannel(v as typeof activeChannel)}
        >
          <TabsList className="w-full justify-start px-4 py-2 h-auto">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            <TabsTrigger value="sms" className="text-xs">
              <MessageSquare className="h-3 w-3 mr-1" /> SMS
            </TabsTrigger>
            <TabsTrigger value="email" className="text-xs">
              <Mail className="h-3 w-3 mr-1" /> Email
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="flex-1">
          <div className="divide-y">
            {filteredThreads.map((thread) => (
              <button
                key={thread.thread_id}
                onClick={() => handleThreadClick(thread)}
                className={cn(
                  'w-full p-4 text-left hover:bg-muted/50 transition-colors',
                  selectedThread?.thread_id === thread.thread_id && 'bg-muted',
                  thread.unread_count > 0 && 'bg-brand-50/50'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          'font-medium truncate',
                          thread.unread_count > 0 && 'font-semibold'
                        )}
                      >
                        {thread.contact_identifier}
                      </span>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatTime(thread.last_message.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {getChannelIcon(thread.last_message.channel)}
                      <p
                        className={cn(
                          'text-sm truncate',
                          thread.unread_count > 0 ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {thread.last_message.body}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {thread.last_message.direction === 'outbound' &&
                        getStatusIcon(thread.last_message.status)}
                      {thread.unread_count > 0 && (
                        <Badge variant="default" className="text-xs px-1.5 py-0">
                          {thread.unread_count}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {filteredThreads.length === 0 && !isLoading && (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No conversations found</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Conversation View */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <ConversationView
            thread={selectedThread}
            onReply={onReply}
            getChannelIcon={getChannelIcon}
            getStatusIcon={getStatusIcon}
            formatTime={formatTime}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm">Choose a thread from the list to view messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Conversation View Component
interface ConversationViewProps {
  thread: ConversationThread;
  onReply?: (threadId: string, message: string) => void;
  getChannelIcon: (channel: MessageChannel) => React.ReactNode;
  getStatusIcon: (status: Message['status']) => React.ReactNode;
  formatTime: (dateString: string) => string;
}

function ConversationView({
  thread,
  onReply,
  getChannelIcon,
  getStatusIcon,
  formatTime,
}: ConversationViewProps) {
  const [replyMessage, setReplyMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendReply = async () => {
    if (!replyMessage.trim()) return;
    setIsSending(true);
    try {
      onReply?.(thread.thread_id, replyMessage);
      setReplyMessage('');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">{thread.contact_identifier}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {thread.channels.map((ch) => (
                <span key={ch} className="flex items-center gap-1">
                  {getChannelIcon(ch)} {ch.toUpperCase()}
                </span>
              ))}
              <span>• {thread.message_count} messages</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {thread.messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.direction === 'outbound' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[70%] rounded-lg p-3',
                  message.direction === 'outbound' ? 'bg-brand-500 text-white' : 'bg-muted'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {getChannelIcon(message.channel)}
                  <span className="text-xs opacity-75">{formatTime(message.created_at)}</span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                {message.direction === 'outbound' && (
                  <div className="flex justify-end mt-1">{getStatusIcon(message.status)}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Reply Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendReply()}
            disabled={isSending}
          />
          <Button onClick={handleSendReply} disabled={isSending || !replyMessage.trim()}>
            Send
          </Button>
        </div>
      </div>
    </>
  );
}

export default UnifiedInbox;
