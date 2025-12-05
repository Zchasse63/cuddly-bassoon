'use client';

/**
 * Enhanced Chat Interface
 *
 * Extends the base chat interface with AI Tool Discovery features:
 * - Lightning bolt button to open AI Tool Palette
 * - Onboarding modal for first-time users
 * - Empty state with quick actions
 * - Tool transparency showing which tools were used
 * - Slash command (/) inline tool palette
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { Send, Square, RotateCcw, Loader2, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useRagChat } from '@/hooks/use-rag-chat';
import { useOnboardingState } from '@/hooks/useInsertPrompt';
import { useViewContextSafe } from '@/contexts/ViewContext';
import { ChatMessage } from '@/components/rag/ChatMessage';
import { InlineQuickActions } from '@/components/ai/QuickActions';
import { OnboardingModal } from './OnboardingModal';
import { AIToolPalette, useAIToolPalette } from './AIToolPalette';
import { EmptyChatState } from './EmptyChatState';
import { ToolTransparency, useToolTransparency } from './ToolTransparency';

interface EnhancedChatInterfaceProps {
  className?: string;
  placeholder?: string;
  persistKey?: string;
  onError?: (error: Error) => void;
  /** Whether to show the onboarding modal on first visit */
  showOnboarding?: boolean;
}

export function EnhancedChatInterface({
  className,
  placeholder = 'Ask Scout anything...',
  persistKey,
  onError,
  showOnboarding = true,
}: EnhancedChatInterfaceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showSlashPalette, setShowSlashPalette] = useState(false);

  // Get view context for AI awareness
  const viewContext = useViewContextSafe();

  // Onboarding state
  const { shouldShowOnboarding, markOnboardingSeen } = useOnboardingState();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // Tool palette state
  const toolPalette = useAIToolPalette();

  // Tool transparency tracking
  const toolTransparency = useToolTransparency();

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
    systemContext: viewContext?.getAIContext(),
  });

  // Show onboarding on first visit
  useEffect(() => {
    if (showOnboarding && shouldShowOnboarding && messages.length === 0) {
      // Small delay to let the page load first
      const timer = setTimeout(() => {
        setShowOnboardingModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showOnboarding, shouldShowOnboarding, messages.length]);

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

  // Handle slash command trigger
  useEffect(() => {
    if (input === '/') {
      setShowSlashPalette(true);
      toolPalette.open();
      setInput('');
    }
  }, [input, setInput, toolPalette]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      // Open palette with Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        toolPalette.open();
      }
    },
    [handleSubmit, toolPalette]
  );

  const handleCopy = useCallback((content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const handleInsertPrompt = useCallback(
    (prompt: string) => {
      setInput(prompt);
      inputRef.current?.focus();
    },
    [setInput]
  );

  const handleSendPrompt = useCallback(
    (prompt: string) => {
      sendMessage(prompt);
    },
    [sendMessage]
  );

  const handleCloseOnboarding = useCallback(() => {
    setShowOnboardingModal(false);
    markOnboardingSeen();
  }, [markOnboardingSeen]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <EmptyChatState
            onActionClick={handleSendPrompt}
            variant="full"
          />
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message, idx) => (
              <div key={message.id}>
                <ChatMessage
                  message={message}
                  onCopy={(content) => handleCopy(content, message.id)}
                  isCopied={copiedId === message.id}
                />
                {/* Show tool transparency for assistant messages */}
                {message.role === 'assistant' && idx === messages.length - 1 && (
                  <ToolTransparency
                    toolCalls={toolTransparency.toolCalls}
                    isStreaming={isStreaming}
                    className="ml-11"
                  />
                )}
              </div>
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

      {/* Quick Actions */}
      <InlineQuickActions onActionClick={handleSendPrompt} />

      {/* Input area */}
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            {/* Lightning bolt button */}
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={() => toolPalette.open()}
              title="Browse AI tools (⌘K)"
            >
              <Zap className="h-4 w-4" />
            </Button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              rows={1}
              className={cn(
                'w-full resize-none rounded-lg border bg-background pl-11 pr-4 py-3',
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
        <p className="text-xs text-muted-foreground text-center mt-2">
          Type <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">/</kbd> to browse tools or{' '}
          <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">⌘K</kbd> anytime
        </p>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={handleCloseOnboarding}
        onTryExample={handleInsertPrompt}
        onOpenToolPalette={() => {
          handleCloseOnboarding();
          toolPalette.open();
        }}
      />

      {/* AI Tool Palette */}
      <AIToolPalette
        isOpen={toolPalette.isOpen}
        onClose={toolPalette.close}
        onInsertPrompt={handleInsertPrompt}
        initialQuery={toolPalette.initialQuery}
      />
    </div>
  );
}

/**
 * Export individual components for flexible usage
 */
export { OnboardingModal } from './OnboardingModal';
export { AIToolPalette, useAIToolPalette } from './AIToolPalette';
export { EmptyChatState, SuggestedPrompts } from './EmptyChatState';
export { ToolTransparency, useToolTransparency, createToolCallRecord } from './ToolTransparency';
