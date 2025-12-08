'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Send, Square, RotateCcw, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { cn } from '@/lib/utils';
import { useRagChat } from '@/hooks/use-rag-chat';
import { ChatMessage } from './ChatMessage';
import { InlineQuickActions } from '@/components/ai/QuickActions';
import { useViewContextSafe } from '@/contexts/ViewContext';

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

  // Get view context for AI awareness
  const viewContext = useViewContextSafe();

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
    // Pass context to the RAG system
    systemContext: viewContext?.getAIContext(),
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
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      {/* Messages area - scrollable */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/40"
      >
        <div className="p-4">
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
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="mx-4 mb-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error.message}
        </div>
      )}

      {/* Quick Actions */}
      <InlineQuickActions onActionClick={sendMessage} />

      {/* Input area - ChatGPT-style */}
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="relative">
          <div className={cn(
            'flex items-end gap-2 rounded-2xl border bg-muted/50 px-4 py-3',
            'focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50',
            'transition-all duration-200'
          )}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              rows={1}
              className={cn(
                'flex-1 resize-none bg-transparent text-sm',
                'placeholder:text-muted-foreground',
                'focus:outline-none',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'max-h-[150px] min-h-[24px]'
              )}
            />
            <div className="flex items-center gap-1 flex-shrink-0">
              {messages.length > 0 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={reset}
                  title="Clear chat"
                  className="size-8 text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="size-4" />
                </Button>
              )}
              {isLoading ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={cancel}
                  className="size-8 bg-destructive/10 text-destructive hover:bg-destructive/20"
                >
                  <Square className="size-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  className={cn(
                    'size-8 rounded-lg',
                    input.trim()
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  <Send className="size-4" />
                </Button>
              )}
            </div>
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
    'What is the 70% rule in wholesaling?',
    'How do I calculate MAO?',
    'What makes a motivated seller?',
    'Explain the assignment fee structure',
  ];
  const questions = suggestedQuestions ?? defaultQuestions;

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] gap-4 text-center px-4">
      {/* ChatGPT-style minimal greeting */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center size-10 rounded-full bg-gradient-to-br from-primary to-primary/70">
          <Sparkles className="size-5 text-white" />
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-semibold text-foreground">How can I help you today?</h3>
        <p className="text-muted-foreground text-sm">
          Ask about properties, deals, or real estate wholesaling strategies.
        </p>
      </div>
      {/* Suggested prompts - ChatGPT style grid */}
      <div className="grid grid-cols-1 gap-2 w-full max-w-sm mt-2">
        {questions.slice(0, 4).map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelectQuestion(q)}
            className={cn(
              'text-left text-sm px-4 py-3 rounded-xl',
              'bg-muted/50 hover:bg-muted',
              'border border-transparent hover:border-border',
              'transition-all duration-200',
              'text-foreground/80 hover:text-foreground'
            )}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
