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
 *
 * Phase 3.5 Updates (Fluid OS):
 * - ScoutOrb replaces Loader2 for streaming state
 * - ScoutMessage replaces ChatMessage for glass-styled bubbles
 * - AIContextBar shows current page/entity context
 * - GenUI widgets render rich content inline
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Send,
  Square,
  RotateCcw,
  Loader2,
  Sparkles,
  Zap,
  Mic,
  MicOff,
  Workflow,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRagChat } from '@/hooks/use-rag-chat';
import { useOnboardingState } from '@/hooks/useInsertPrompt';
import { useViewContextSafe } from '@/contexts/ViewContext';
import { InlineQuickActions } from '@/components/ai/QuickActions';
import { OnboardingModal } from './OnboardingModal';
import { AIToolPalette, useAIToolPalette } from './AIToolPalette';
import { EmptyChatState } from './EmptyChatState';
import { ToolTransparency, useToolTransparency } from './ToolTransparency';
import { ToolWorkflows } from './ToolWorkflows';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { usePromptEnhancement } from '@/hooks/usePromptEnhancement';
import type { ToolWorkflow } from '@/types/tool-preferences';

// Fluid OS Scout Components (Phase 3.5)
import { ScoutOrb } from './ScoutOrb';
import { ScoutMessage } from './ScoutMessage';
import { AIContextBar } from './AIContextBar';

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
  const inputValueRef = useRef<string>(''); // Track current input for voice callback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Get view context for AI awareness
  const viewContext = useViewContextSafe();

  // Onboarding state
  const { shouldShowOnboarding, markOnboardingSeen } = useOnboardingState();
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);

  // Tool palette state
  const toolPalette = useAIToolPalette();

  // Workflows state
  const [showWorkflows, setShowWorkflows] = useState(false);

  // Tool transparency tracking
  const toolTransparency = useToolTransparency();

  // Voice input
  const voice = useVoiceInput({
    onTranscript: (text) => {
      // Use ref to get current input value since setInput only accepts string
      const currentInput = inputValueRef.current;
      setInput(currentInput ? `${currentInput} ${text}` : text);
    },
    onError: (error) => {
      console.error('Voice input error:', error);
    },
  });

  // Prompt enhancement
  const enhancement = usePromptEnhancement();

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
    return undefined; // Explicit return for all code paths
  }, [showOnboarding, shouldShowOnboarding, messages.length]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea and keep inputValueRef in sync
  useEffect(() => {
    inputValueRef.current = input; // Keep ref in sync for voice callback
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  // Handle slash command trigger
  useEffect(() => {
    if (input === '/') {
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

  const handleVoiceToggle = useCallback(() => {
    if (voice.isListening) {
      voice.stopListening();
    } else {
      voice.startListening();
    }
  }, [voice]);

  const handleEnhance = useCallback(async () => {
    if (input.trim()) {
      const result = await enhancement.enhancePrompt(input);
      if (result) {
        setInput(result); // enhancePrompt returns the enhanced string directly
      }
    }
  }, [input, enhancement, setInput]);

  const handleRevert = useCallback(() => {
    if (enhancement.originalPrompt) {
      setInput(enhancement.originalPrompt);
      enhancement.revertToOriginal();
    }
  }, [enhancement, setInput]);

  const handleExecuteWorkflow = useCallback(
    async (workflow: ToolWorkflow) => {
      // Execute workflow by sending messages for each step
      const stepPrompts = workflow.step_prompts as Record<string, string> | null;
      for (const toolSlug of workflow.tool_slugs) {
        const stepPrompt = stepPrompts?.[toolSlug];

        // Use custom step prompt if provided, otherwise use a default
        const prompt = stepPrompt || `Execute ${toolSlug}`;

        // Send message and wait for completion
        await sendMessage(prompt);

        // Small delay between steps to ensure proper sequencing
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    },
    [sendMessage]
  );

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* AI Context Bar - Shows current page/entity context (Phase 3.5) */}
      <AIContextBar
        className="mx-4 mt-4"
        isProcessing={isLoading || isStreaming}
        activeTools={toolTransparency.toolCalls.map((t) => t.displayName)}
      />

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <EmptyChatState onActionClick={handleSendPrompt} variant="full" />
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((message, idx) => (
              <div key={message.id}>
                {/* Use ScoutMessage for glass-styled bubbles (Phase 3.5) */}
                <ScoutMessage
                  role={message.role}
                  content={message.content}
                  sources={message.sources}
                  isStreaming={isStreaming && idx === messages.length - 1 && message.role === 'assistant'}
                  onCopy={(content) => handleCopy(content, message.id)}
                  isCopied={copiedId === message.id}
                />
                {/* Show tool transparency for assistant messages */}
                {message.role === 'assistant' && idx === messages.length - 1 && (
                  <ToolTransparency
                    toolCalls={toolTransparency.toolCalls}
                    isStreaming={isStreaming}
                    className="ml-11 mt-2"
                  />
                )}
              </div>
            ))}
            {/* Scout thinking indicator with ScoutOrb (Phase 3.5) */}
            {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <ScoutOrb state="thinking" size="md" />
                <span className="text-[var(--fluid-text-secondary)]">Scout is thinking...</span>
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
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary z-10"
              onClick={() => toolPalette.open()}
              title="Browse AI tools (⌘K)"
            >
              <Zap className="h-4 w-4" />
            </Button>

            {/* Microphone button */}
            {voice.isSupported && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className={cn(
                  'absolute left-11 top-1/2 -translate-y-1/2 h-8 w-8 z-10',
                  voice.isListening
                    ? 'text-red-500 animate-pulse'
                    : 'text-muted-foreground hover:text-primary'
                )}
                onClick={handleVoiceToggle}
                disabled={isLoading}
                title={voice.isListening ? 'Stop listening' : 'Voice input'}
              >
                {voice.isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}

            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              rows={1}
              className={cn(
                'w-full resize-none rounded-lg border bg-background pr-4 py-3',
                voice.isSupported ? 'pl-20' : 'pl-11',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />

            {/* Enhanced indicator */}
            {enhancement.enhancedPrompt && input === enhancement.enhancedPrompt && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                  Enhanced
                </Badge>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-6 text-[10px] px-2"
                  onClick={handleRevert}
                >
                  Revert
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1">
            {/* Enhance button */}
            {!isLoading && input.trim() && !enhancement.enhancedPrompt && (
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleEnhance}
                disabled={enhancement.isEnhancing}
                title="Enhance prompt with AI"
              >
                {enhancement.isEnhancing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Sparkles className="size-4" />
                )}
              </Button>
            )}

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

        {/* Voice listening indicator */}
        {voice.isListening && (
          <div className="flex items-center justify-center gap-2 text-sm text-red-500 mt-2">
            <Mic className="h-4 w-4 animate-pulse" />
            <span>Listening...</span>
          </div>
        )}

        {/* Voice error display */}
        {voice.error && (
          <div className="text-xs text-destructive text-center mt-2">{voice.error}</div>
        )}

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            Type <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">/</kbd> to browse tools
            or <kbd className="px-1 py-0.5 bg-muted rounded text-[10px]">⌘K</kbd> anytime
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowWorkflows(true)}
            className="h-6 text-xs gap-1"
          >
            <Workflow className="h-3 w-3" />
            Workflows
          </Button>
        </div>
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

      {/* Tool Workflows */}
      <ToolWorkflows
        isOpen={showWorkflows}
        onClose={() => setShowWorkflows(false)}
        onExecuteWorkflow={handleExecuteWorkflow}
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
