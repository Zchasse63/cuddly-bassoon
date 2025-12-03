'use client';

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Bot, FileText, ExternalLink, Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { RAGMessage, RAGSource } from '@/hooks/use-rag-chat';

interface ChatMessageProps {
  message: RAGMessage;
  onCopy?: (content: string) => void;
  isCopied?: boolean;
}

function SourceCard({ source }: { source: RAGSource }) {
  return (
    <a
      href={`/docs/${source.slug}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-muted/50 hover:bg-muted transition-colors text-sm group"
    >
      <FileText className="size-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate text-foreground">{source.title}</p>
        <p className="text-xs text-muted-foreground truncate">{source.category}</p>
      </div>
      <Badge variant="secondary" className="shrink-0 text-xs">
        {Math.round(source.relevance * 100)}%
      </Badge>
      <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
    </a>
  );
}

export const ChatMessage = memo(function ChatMessage({
  message,
  onCopy,
  isCopied,
}: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div
        className={cn(
          'flex items-center justify-center size-8 rounded-full shrink-0',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        {isUser ? <User className="size-4" /> : <Bot className="size-4" />}
      </div>

      {/* Message content */}
      <div className={cn('flex flex-col gap-2 max-w-[80%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-muted rounded-tl-sm'
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources for assistant messages */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="flex flex-col gap-1.5 w-full">
            <p className="text-xs text-muted-foreground font-medium px-1">Sources:</p>
            <div className="grid gap-1.5">
              {message.sources.slice(0, 3).map((source, idx) => (
                <SourceCard key={`${source.slug}-${idx}`} source={source} />
              ))}
            </div>
          </div>
        )}

        {/* Action buttons for assistant messages */}
        {!isUser && message.content && (
          <div className="flex items-center gap-2 px-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => onCopy?.(message.content)}
            >
              {isCopied ? <Check className="size-3" /> : <Copy className="size-3" />}
              <span>{isCopied ? 'Copied' : 'Copy'}</span>
            </Button>
            {message.cached && (
              <Badge variant="outline" className="text-xs">
                Cached
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

