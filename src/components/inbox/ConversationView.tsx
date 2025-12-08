'use client';

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Message, Thread } from './types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Phone, Video, MoreHorizontal, Mic } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ConversationViewProps {
  thread: Thread;
  messages: Message[];
  onSendMessage: (content: string) => void;
  className?: string;
}

export function ConversationView({
  thread,
  messages,
  onSendMessage,
  className,
}: ConversationViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className={cn('flex flex-col h-full glass-card overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/10 backdrop-blur-md bg-white/5 z-10">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 border border-white/20">
            <AvatarImage src={thread.contact.avatar} />
            <AvatarFallback>{thread.contact.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-sm">{thread.contact.name}</h2>
            {thread.isLive ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Live Call
              </span>
            ) : (
              <span className="text-xs text-muted-foreground capitalize">
                {thread.contact.status}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 rounded-full">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 rounded-full">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 rounded-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn('flex w-full mb-2', message.isMe ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[75%] px-4 py-2.5 text-sm shadow-sm',
                message.isMe
                  ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
                  : 'glass-subtle bg-accent/5 backdrop-blur-sm rounded-2xl rounded-tl-sm border border-white/10'
              )}
            >
              {message.content}
            </div>
          </div>
        ))}
        {thread.isLive && (
          <div className="flex justify-center my-4">
            <span className="glass-subtle px-3 py-1 rounded-full text-xs text-muted-foreground flex items-center gap-2">
              <Mic className="h-3 w-3 animate-pulse text-red-500" />
              Transcribing real-time...
            </span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/10 bg-white/5 backdrop-blur-md">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.target as HTMLFormElement;
            const input = form.elements.namedItem('message') as HTMLInputElement;
            if (input.value.trim()) {
              onSendMessage(input.value);
              input.value = '';
            }
          }}
        >
          <Input
            name="message"
            placeholder={thread.isLive ? 'Type a note...' : 'Type a message...'}
            className="flex-1 glass-subtle bg-background/50 border-white/10 focus-visible:ring-primary/20"
            autoComplete="off"
          />
          <Button
            type="submit"
            size="icon"
            className="rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
