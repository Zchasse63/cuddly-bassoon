'use client';

import { cn } from '@/lib/utils';
import { Thread, Sentiment } from './types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Phone, Mail } from 'lucide-react';

interface ThreadListProps {
  threads: Thread[];
  selectedId?: string;
  onSelect: (id: string) => void;
  className?: string;
}

const getSentimentColor = (sentiment: Sentiment) => {
  switch (sentiment) {
    case 'positive':
      return 'ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    case 'negative':
      return 'ring-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.3)]';
    case 'neutral':
      return 'ring-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
    default:
      return 'ring-transparent';
  }
};

const getTypeIcon = (type: Thread['type']) => {
  switch (type) {
    case 'call':
      return <Phone className="h-3 w-3" />;
    case 'email':
      return <Mail className="h-3 w-3" />;
    default:
      return <MessageSquare className="h-3 w-3" />;
  }
};

export function ThreadList({ threads, selectedId, onSelect, className }: ThreadListProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {threads.map((thread) => (
        <button
          key={thread.id}
          onClick={() => onSelect(thread.id)}
          className={cn(
            'flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left w-full group',
            selectedId === thread.id
              ? 'glass-card border-brand-500/20 bg-brand-500/5'
              : 'hover:bg-accent/5 hover:glass-subtle border border-transparent'
          )}
        >
          <div className="relative flex-shrink-0">
            <Avatar
              className={cn(
                'h-10 w-10 border-2 border-background transition-all',
                getSentimentColor(thread.contact.sentiment)
              )}
            >
              <AvatarImage src={thread.contact.avatar} />
              <AvatarFallback>{thread.contact.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            {thread.contact.status === 'online' && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-background" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-0.5">
              <span
                className={cn(
                  'font-medium text-sm truncate',
                  thread.unreadCount > 0 && 'font-bold text-foreground'
                )}
              >
                {thread.contact.name}
              </span>
              <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                {thread.timestamp}
              </span>
            </div>

            <p
              className={cn(
                'text-xs truncate flex items-center gap-1.5',
                thread.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
              )}
            >
              <span className="opacity-70">{getTypeIcon(thread.type)}</span>
              <span className="truncate">{thread.lastMessage}</span>
            </p>
          </div>

          {thread.unreadCount > 0 && (
            <div className="flex-shrink-0 self-center">
              <Badge
                variant="default"
                className="h-5 min-w-5 px-1.5 rounded-full flex items-center justify-center text-[10px]"
              >
                {thread.unreadCount}
              </Badge>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
