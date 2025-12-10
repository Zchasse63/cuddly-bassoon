'use client';

/**
 * ScoutPane - Unified AI Chat Sidebar
 *
 * This is the ONLY AI chat component needed for the sidebar.
 * Uses Vercel AI SDK's useChat hook directly for simplicity.
 *
 * Per Fluid_Real_Estate_OS_Design_System.md:
 * - Width: 400px (fixed, not resizable)
 * - Persistent right sidebar on all pages
 * - AI is the primary interaction method
 *
 * Features:
 * - Mobile: Sheet overlay with floating trigger button
 * - Desktop: Fixed glass-styled sidebar
 * - Lightning bolt button to open AI Tool Palette
 * - Onboarding modal for first-time users
 * - Empty state with quick actions
 * - Tool transparency showing which tools were used
 * - Slash command (/) inline tool palette
 * - ScoutOrb animated avatar
 * - ScoutMessage glass-styled bubbles
 * - Voice input support
 */

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import {
  Send,
  Square,
  RotateCcw,
  Sparkles,
  Zap,
  Mic,
  MicOff,
  Workflow,
  MessageSquare,
  PanelRightClose,
} from 'lucide-react';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useOnboardingState } from '@/hooks/useInsertPrompt';
import { useViewContextSafe } from '@/contexts/ViewContext';
import { useAIResultStore } from '@/stores/aiResultStore';
import { InlineQuickActions } from '@/components/ai/QuickActions';
import { OnboardingModal } from './OnboardingModal';
import { AIToolPalette, useAIToolPalette } from './AIToolPalette';
import { EmptyChatState } from './EmptyChatState';
import { ToolTransparency, useToolTransparency } from './ToolTransparency';
import { ToolWorkflows } from './ToolWorkflows';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import type { ToolWorkflow } from '@/types/tool-preferences';

// Fluid OS Scout Components
import { ScoutOrb } from './ScoutOrb';
import { ScoutMessage } from './ScoutMessage';

const SCOUT_PANE_STORAGE_KEY = 'scout-pane-state';

// Types for message parts (from AI SDK)
interface ToolPart {
  type: string;
  toolCallId: string;
  toolName: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
  input?: Record<string, unknown>;
  output?: unknown;
  errorText?: string;
}

// Helper to extract text content from message parts
function extractTextContent(message: UIMessage): string {
  if (!message.parts) return '';
  return message.parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join(' ');
}

// function emitToolResults removed - logic moved to useEffect

interface ScoutPaneProps {
  /** Default open state for the sidebar */
  defaultOpen?: boolean;
  /** Custom placeholder text */
  placeholder?: string;
  /** Storage key for message persistence */
  persistKey?: string;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Whether to show the onboarding modal on first visit */
  showOnboarding?: boolean;
}

export function ScoutPane({
  defaultOpen = true,
  placeholder = 'Ask Scout anything...',
  persistKey = 'ai-chat-sidebar',
  onError,
  showOnboarding = true,
}: ScoutPaneProps) {
  const isMobile = useIsMobile();

  // Sidebar open/close state with localStorage persistence
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SCOUT_PANE_STORAGE_KEY);
      return saved !== null ? saved === 'true' : defaultOpen;
    }
    return defaultOpen;
  });

  const toggleSidebar = useCallback(() => setIsOpen((prev) => !prev), []);

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(SCOUT_PANE_STORAGE_KEY, String(isOpen));
  }, [isOpen]);

  // Refs
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const inputValueRef = useRef<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Track processed tool calls to prevent duplicate events
  const processedToolCallIds = useRef(new Set<string>());

  // Context
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

  // Get system context for AI
  const systemContext = viewContext?.getAIContext();

  // Manage input state ourselves (useChat no longer provides this)
  const [input, setInput] = useState('');

  // Create transport with memoization to avoid recreation on every render
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/ai/chat',
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: {
            id,
            messages,
            systemPrompt: systemContext,
            enableTools: true,
            autoRoute: true,
          },
        }),
      }),
    [systemContext]
  );

  // Use Vercel AI SDK's useChat hook directly
  const {
    messages: chatMessages,
    sendMessage: chatSendMessage,
    status,
    error,
    stop,
    setMessages,
  } = useChat({
    id: persistKey,
    transport,
    /* onFinish removed - using useEffect for reliable tool emitting */
    onError: (err) => {
      onError?.(err);
    },
  });

  // Derive loading/streaming states from status
  const isLoading = status === 'submitted' || status === 'streaming';
  const isStreaming = status === 'streaming';

  // Transform messages to include extracted text content
  const messages = useMemo(
    () =>
      chatMessages.map((msg) => ({
        ...msg,
        content: extractTextContent(msg),
      })),
    [chatMessages]
  );

  // Voice input
  const voice = useVoiceInput({
    onTranscript: (text) => {
      const currentInput = inputValueRef.current;
      setInput(currentInput ? `${currentInput} ${text}` : text);
    },
    onError: (err) => console.error('Voice input error:', err),
  });

  // Wrapper for handleSubmit
  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim()) return;
      chatSendMessage({ parts: [{ type: 'text', text: input }] });
      setInput('');
    },
    [input, chatSendMessage]
  );

  // Send message programmatically
  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim()) return;
      chatSendMessage({ parts: [{ type: 'text', text: content }] });
    },
    [chatSendMessage]
  );

  // Cancel streaming
  const cancel = useCallback(() => {
    stop();
  }, [stop]);

  // Reset chat
  const reset = useCallback(() => {
    stop();
    setMessages([]);
    setInput('');
    if (persistKey && typeof window !== 'undefined') {
      localStorage.removeItem(persistKey);
    }
  }, [stop, setMessages, persistKey]);

  // Show onboarding on first visit
  useEffect(() => {
    if (showOnboarding && shouldShowOnboarding && messages.length === 0) {
      const timer = setTimeout(() => setShowOnboardingModal(true), 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showOnboarding, shouldShowOnboarding, messages.length]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea and keep inputValueRef in sync
  useEffect(() => {
    inputValueRef.current = input;
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  }, [input]);

  // Handle slash command trigger - use ref to avoid setState in effect
  const prevInputRef = useRef(input);
  useEffect(() => {
    const prevInput = prevInputRef.current;
    prevInputRef.current = input;

    // Only trigger when input changes to exactly '/'
    if (input === '/' && prevInput !== '/') {
      toolPalette.open();
      // Clear via timeout to avoid setState during render
      setTimeout(() => setInput(''), 0);
    }
  }, [input, setInput, toolPalette]);

  // Get Zustand store action for adding results
  const addAIResult = useAIResultStore((state) => state.addResult);

  // Effect: Watch for completed tool calls in messages and write to Zustand store (+ legacy EventBus)
  useEffect(() => {
    messages.forEach((message) => {
      // 1. Check standard message parts (Vercel AI SDK UI)
      if (message.parts) {
        message.parts.forEach((part) => {
          if (
            part.type.startsWith('tool-') &&
            (part as any).state === 'output-available' &&
            (part as any).output
          ) {
            const toolPart = part as ToolPart;
            const id = toolPart.toolCallId || `${message.id}-${toolPart.toolName}`; // Fallback ID

            if (!processedToolCallIds.current.has(id)) {
              const toolName = toolPart.toolName || part.type.replace('tool-', '');
              console.log('[ScoutPane] Processing tool result (parts):', toolName, id);

              // Write to Zustand store for reliable state management
              addAIResult({
                id,
                toolName,
                result: toolPart.output,
              });
              processedToolCallIds.current.add(id);
            }
          }
        });
      }

      // 2. Fallback: Check toolInvocations (Vercel AI SDK Core/Newer)
      // Sometimes results are attached here instead of parts
      if ((message as any).toolInvocations) {
        (message as any).toolInvocations.forEach((toolInv: any) => {
          if (toolInv.state === 'result') {
            const id = toolInv.toolCallId;
            if (!processedToolCallIds.current.has(id)) {
              console.log('[ScoutPane] Processing tool result (invocation):', toolInv.toolName, id);

              // Write to Zustand store for reliable state management
              addAIResult({
                id,
                toolName: toolInv.toolName,
                result: toolInv.result,
              });
              processedToolCallIds.current.add(id);
            }
          }
        });
      }
    });
  }, [messages, addAIResult]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
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

  const handleExecuteWorkflow = useCallback(
    async (workflow: ToolWorkflow) => {
      const stepPrompts = workflow.step_prompts as Record<string, string> | null;
      for (const toolSlug of workflow.tool_slugs) {
        const stepPrompt = stepPrompts?.[toolSlug];
        const prompt = stepPrompt || `Execute ${toolSlug}`;
        await sendMessage(prompt);
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    },
    [sendMessage]
  );

  // Shared chat content UI (used by both mobile and desktop)
  const ChatContent = (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <EmptyChatState onActionClick={handleSendPrompt} variant="full" />
        ) : (
          <div className="flex flex-col gap-4">
            {messages
              .filter((m) => m.role === 'user' || m.role === 'assistant')
              .map((message, idx, filtered) => (
                <div key={message.id}>
                  <ScoutMessage
                    role={message.role as 'user' | 'assistant'}
                    content={message.content}
                    parts={message.parts}
                    isStreaming={
                      isStreaming && idx === filtered.length - 1 && message.role === 'assistant'
                    }
                    onCopy={(content) => handleCopy(content, message.id)}
                    isCopied={copiedId === message.id}
                  />
                  {message.role === 'assistant' && idx === filtered.length - 1 && (
                    <ToolTransparency
                      toolCalls={toolTransparency.toolCalls}
                      isStreaming={isStreaming}
                      className="ml-11 mt-2"
                    />
                  )}
                </div>
              ))}
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

      {/* Input area - Fluid Glass */}
      <div className="flex-shrink-0 border-t border-white/10 p-3 glass-high backdrop-blur-md z-10">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          {/* Text input with inline icons */}
          <div className="relative flex-1 min-w-0">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              rows={1}
              className={cn(
                'w-full resize-none rounded-xl border border-white/20 bg-white/5',
                'pl-3 pr-12 py-3 text-sm' /* Increased pr and py for better spacing */,
                'placeholder:text-muted-foreground/60',
                'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'max-h-32 overflow-y-auto no-scrollbar'
              )}
              style={{ minHeight: '44px' }}
            />
            {/* Send button inside input */}
            <div className="absolute right-1.5 bottom-1.5">
              {isLoading ? (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={cancel}
                  className="h-7 w-7 rounded-lg bg-destructive/10 hover:bg-destructive/20 text-destructive"
                >
                  <Square className="size-3.5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  className="h-7 w-7 rounded-lg"
                >
                  <Send className="size-3.5" />
                </Button>
              )}
            </div>
          </div>
        </form>

        {/* Action row - compact */}
        <div className="flex items-center justify-between mt-2 px-0.5">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => toolPalette.open()}
              title="Browse AI tools (⌘K)"
            >
              <Zap className="h-3 w-3 mr-1" />
              Tools
            </Button>
            {voice.isSupported && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className={cn(
                  'h-7 px-2 text-xs',
                  voice.isListening
                    ? 'text-red-500 animate-pulse'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={handleVoiceToggle}
                disabled={isLoading}
              >
                {voice.isListening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
              </Button>
            )}
            {messages.length > 0 && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={reset}
                title="Clear chat"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowWorkflows(true)}
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
          >
            <Workflow className="h-3 w-3" />
          </Button>
        </div>

        {voice.isListening && (
          <div className="flex items-center justify-center gap-2 text-xs text-red-500 mt-1.5">
            <Mic className="h-3 w-3 animate-pulse" />
            <span>Listening...</span>
          </div>
        )}

        {voice.error && (
          <div className="text-xs text-destructive text-center mt-1.5">{voice.error}</div>
        )}
      </div>

      {/* Modals */}
      <OnboardingModal
        isOpen={showOnboardingModal}
        onClose={handleCloseOnboarding}
        onTryExample={handleInsertPrompt}
        onOpenToolPalette={() => {
          handleCloseOnboarding();
          toolPalette.open();
        }}
      />
      <AIToolPalette
        isOpen={toolPalette.isOpen}
        onClose={toolPalette.close}
        onInsertPrompt={handleInsertPrompt}
        initialQuery={toolPalette.initialQuery}
      />
      <ToolWorkflows
        isOpen={showWorkflows}
        onClose={() => setShowWorkflows(false)}
        onExecuteWorkflow={handleExecuteWorkflow}
      />
    </div>
  );

  // Mobile: Sheet overlay with floating trigger button
  if (isMobile) {
    return (
      <>
        <Button
          size="icon"
          className="fixed bottom-4 right-4 z-50 size-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
          onClick={toggleSidebar}
        >
          <MessageSquare className="size-6" />
        </Button>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
            <SheetHeader className="border-b px-4 py-3">
              <SheetTitle className="flex items-center gap-2">
                <Sparkles className="size-5 text-primary" />
                Scout AI
              </SheetTitle>
            </SheetHeader>
            {ChatContent}
          </SheetContent>
        </Sheet>
      </>
    );
  }

  // Desktop: Fixed glass-styled sidebar (400px for better message readability)
  return (
    <aside
      className={cn(
        'w-[400px] flex-shrink-0',
        'glass-high border-l border-white/10',
        'flex flex-col h-full overflow-hidden',
        'shadow-[-8px_0_32px_rgba(0,0,0,0.08)]'
      )}
    >
      {/* Header */}
      <div className="chat-header flex-shrink-0 glass-subtle border-b border-white/10">
        <div className="chat-header__title">
          <Sparkles className="size-5 text-primary" />
          <span className="font-semibold">Scout</span>
          {/* ContextBadge removed per feedback */}
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleSidebar}
          className="hover:bg-white/10 transition-colors"
        >
          <PanelRightClose className="size-5" />
        </Button>
      </div>

      {/* Context Bar - Removed per feedback to clean up UI */}
      {/* <AIContextBar className="border-b border-white/10" /> */}

      {/* Chat Content */}
      <div className="flex-1 min-h-0 overflow-hidden bg-transparent">{ChatContent}</div>
    </aside>
  );
}
