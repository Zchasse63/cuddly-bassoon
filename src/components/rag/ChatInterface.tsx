'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Send, Square, RotateCcw, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useRagChat } from '@/hooks/use-rag-chat';
import { ChatMessage } from './ChatMessage';

interface ChatInterfaceProps {
  className?: string;
  placeholder?: string;
  suggestedQuestions?: string[];
  persistKey?: string;
  onError?: (error: Error) => void;
}

export function ChatInterface({
  className,
  placeholder = 'Ask anything about real estate wholesaling...',
  suggestedQuestions,
  persistKey,
  onError,
}: ChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    messages,
    input,
    setInput,
    isLoading,
    isStreaming,
    error,
    handleSubmit,
    sendMessage,
    cancel,
    reset,
  } = useRagChat({
    persistKey,
    onError,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  const handleCopy = useCallback((content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleSuggestedQuestion = useCallback(
    (question: string) => {
      sendMessage(question);
    },
    [sendMessage]
  );

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <EmptyState
            suggestedQuestions={suggestedQuestions}
            onSelectQuestion={handleSuggestedQuestion}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                onCopy={(content) => handleCopy(content, message.id)}
                isCopied={copiedId === message.id}
              />
            ))}
            {isStreaming && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm pl-11">
                <Loader2 className="size-4 animate-spin" />
                <span>Thinking...</span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Error display */}
      {error && (
        <div className="mx-4 mb-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error.message}
        </div>
      )}

      {/* Input area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              rows={1}
              className={cn(
                'w-full resize-none rounded-lg border bg-background px-4 py-3 pr-12',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          </div>
          <div className="flex flex-col gap-1">
            {isLoading ? (
              <Button type="button" size="icon" variant="destructive" onClick={cancel}>
                <Square className="size-4" />
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <Send className="size-4" />
              </Button>
            )}
            {messages.length > 0 && (
              <Button type="button" size="icon" variant="ghost" onClick={reset} title="Clear chat">
                <RotateCcw className="size-4" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function EmptyState({
  suggestedQuestions,
  onSelectQuestion,
}: {
  suggestedQuestions?: string[];
  onSelectQuestion: (q: string) => void;
}) {
  const defaultQuestions = [
    "What is the 70% rule in wholesaling?",
    "How do I calculate MAO?",
    "What makes a motivated seller?",
    "Explain the assignment fee structure",
  ];
  const questions = suggestedQuestions ?? defaultQuestions;

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[300px] gap-6 text-center">
      <div className="flex items-center justify-center size-16 rounded-full bg-primary/10">
        <Sparkles className="size-8 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-1">Ask about Real Estate Wholesaling</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          Get expert answers powered by our knowledge base of 96+ documents on wholesaling strategies, deal analysis, and more.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 max-w-lg">
        {questions.map((q, idx) => (
          <Button key={idx} variant="outline" size="sm" className="text-xs" onClick={() => onSelectQuestion(q)}>
            {q}
          </Button>
        ))}
      </div>
    </div>
  );
}

