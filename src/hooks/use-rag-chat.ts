'use client';

/**
 * RAG Chat Hook
 * Client-side hook for streaming AI chat interactions with RAG + Tools
 *
 * Uses the official @ai-sdk/react useChat hook with:
 * - RAG integration for domain knowledge
 * - 200 AI tools for real estate operations
 * - xAI Grok model with auto-routing
 * - Generative UI pattern for tool result rendering
 *
 * Updated December 2025 - Migrated to useChat for proper tool parts handling
 */

import { useCallback, useEffect, useState } from 'react';
import { useChat, type UIMessage } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { aiEventBus } from '@/lib/ai/events';

export interface RAGSource {
  title: string;
  slug: string;
  category: string;
  relevance: number;
}

export interface RAGClassification {
  intent: 'question' | 'how-to' | 'calculation' | 'comparison' | 'general';
  topics: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  categories: string[];
}

// Extended message type that includes tool parts from AI SDK
export interface RAGMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  parts?: Array<MessagePart>; // Tool parts from AI SDK
  sources?: RAGSource[];
  classification?: RAGClassification;
  cached?: boolean;
  timestamp: Date;
}

// Message part types from AI SDK
export type MessagePart = { type: 'text'; text: string } | { type: 'step-start' } | ToolPart;

// Tool part with typed output
export interface ToolPart {
  type: string; // 'tool-{toolName}'
  toolCallId: string;
  toolName: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
  input?: Record<string, unknown>;
  output?: unknown;
  errorText?: string;
}

export interface UseRagChatOptions {
  onFinish?: (message: RAGMessage) => void;
  onError?: (error: Error) => void;
  persistKey?: string; // localStorage key for persistence
  systemContext?: string; // Context from ViewContext for AI awareness
}

export interface UseRagChatReturn {
  messages: RAGMessage[];
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  isStreaming: boolean;
  error: Error | null;
  sendMessage: (content?: string) => Promise<void>;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  cancel: () => void;
  reset: () => void;
  lastClassification: RAGClassification | null;
}

export function useRagChat(options: UseRagChatOptions = {}): UseRagChatReturn {
  const { onFinish, onError, persistKey, systemContext } = options;

  const [localInput, setLocalInput] = useState('');
  const [lastClassification, setLastClassification] = useState<RAGClassification | null>(null);

  // Use the official useChat hook from @ai-sdk/react
  // This properly handles UIMessage format with parts array for tool results
  const {
    messages: chatMessages,
    sendMessage: chatSendMessage,
    status,
    error: chatError,
    stop,
    setMessages: setChatMessages,
  } = useChat({
    id: persistKey || 'rag-chat',
    transport: new DefaultChatTransport({
      api: '/api/ai/chat',
      // Include system context and tool options in every request
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
    onFinish: ({ message }) => {
      // Convert to RAGMessage format for callback
      const ragMessage: RAGMessage = {
        id: message.id,
        role: message.role as 'user' | 'assistant',
        content: extractTextContent(message),
        parts: message.parts as MessagePart[],
        timestamp: new Date(),
      };
      onFinish?.(ragMessage);

      // Emit tool results via event bus for external UI updates
      emitToolResults(message);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  // Helper to extract text content from message parts
  const extractTextContent = (message: UIMessage): string => {
    if (!message.parts) return '';
    return message.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join(' ');
  };

  // Emit tool results via event bus for external UI components
  const emitToolResults = (message: UIMessage) => {
    if (!message.parts) return;

    for (const part of message.parts) {
      // Check if this is a tool part with output
      if (
        typeof part === 'object' &&
        part !== null &&
        'type' in part &&
        typeof part.type === 'string' &&
        part.type.startsWith('tool-') &&
        'state' in part &&
        part.state === 'output-available' &&
        'output' in part
      ) {
        const toolPart = part as ToolPart;
        const toolName = toolPart.toolName || part.type.replace('tool-', '');

        // Emit event for property search results
        if (toolName.includes('property_search') || toolName.includes('search')) {
          aiEventBus.emit('tool:result', {
            toolName,
            result: toolPart.output,
          });
        }
      }
    }
  };

  // Convert chat messages to RAGMessage format
  const messages: RAGMessage[] = chatMessages.map((msg) => ({
    id: msg.id,
    role: msg.role as 'user' | 'assistant',
    content: extractTextContent(msg),
    parts: msg.parts as MessagePart[],
    timestamp: new Date(),
  }));

  // Persist messages to localStorage
  useEffect(() => {
    if (persistKey && typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem(persistKey, JSON.stringify(messages));
    }
  }, [messages, persistKey]);

  // Load persisted messages on mount
  useEffect(() => {
    if (persistKey && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(persistKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Convert to Message format for useChat
          const restoredMessages = parsed.map((m: RAGMessage) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            parts: m.parts || [{ type: 'text', text: m.content }],
          }));
          setChatMessages(restoredMessages);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, [persistKey, setChatMessages]);

  // Wrapper for sendMessage to match our interface
  const sendMessage = useCallback(
    async (content?: string) => {
      const messageContent = content ?? localInput.trim();
      if (!messageContent) return;

      setLocalInput('');

      // Use the AI SDK's sendMessage with proper parts format
      chatSendMessage({
        parts: [{ type: 'text', text: messageContent }],
      });
    },
    [localInput, chatSendMessage, setLocalInput]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      await sendMessage();
    },
    [sendMessage]
  );

  const cancel = useCallback(() => {
    stop();
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setChatMessages([]);
    setLocalInput('');
    setLastClassification(null);
    if (persistKey && typeof window !== 'undefined') {
      localStorage.removeItem(persistKey);
    }
  }, [stop, setChatMessages, persistKey, setLocalInput, setLastClassification]);

  // Derive loading/streaming states from status
  const isLoading = status === 'submitted' || status === 'streaming';
  const isStreaming = status === 'streaming';

  return {
    messages,
    input: localInput,
    setInput: setLocalInput,
    isLoading,
    isStreaming,
    error: chatError ?? null,
    sendMessage,
    handleSubmit,
    cancel,
    reset,
    lastClassification,
  };
}
