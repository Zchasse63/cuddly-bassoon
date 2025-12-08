'use client';

/**
 * RAG Chat Hook
 * Client-side hook for streaming AI chat interactions with RAG + Tools
 *
 * Uses the unified /api/ai/chat endpoint which includes:
 * - RAG integration for domain knowledge
 * - 212 AI tools for real estate operations
 * - xAI Grok model with auto-routing
 */

import { useState, useCallback, useRef, useEffect } from 'react';

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

export interface RAGMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: RAGSource[];
  classification?: RAGClassification;
  cached?: boolean;
  timestamp: Date;
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

function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function useRagChat(options: UseRagChatOptions = {}): UseRagChatReturn {
  const { onFinish, onError, persistKey, systemContext } = options;

  const [messages, setMessages] = useState<RAGMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastClassification, setLastClassification] = useState<RAGClassification | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Load persisted messages on mount
  useEffect(() => {
    if (persistKey && typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(persistKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          setMessages(
            parsed.map((m: RAGMessage) => ({
              ...m,
              timestamp: new Date(m.timestamp),
            }))
          );
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, [persistKey]);

  // Persist messages on change
  useEffect(() => {
    if (persistKey && typeof window !== 'undefined' && messages.length > 0) {
      localStorage.setItem(persistKey, JSON.stringify(messages));
    }
  }, [messages, persistKey]);

  const sendMessage = useCallback(
    async (content?: string) => {
      const messageContent = content ?? input.trim();
      if (!messageContent) return;

      setError(null);
      setIsLoading(true);
      setInput('');

      // Add user message
      const userMessage: RAGMessage = {
        id: generateId(),
        role: 'user',
        content: messageContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Create placeholder for assistant message
      const assistantId = generateId();
      const assistantMessage: RAGMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      try {
        // Build messages array for API (include history for context)
        const apiMessages = messages
          .filter((m) => m.content.trim())
          .map((m) => ({
            role: m.role,
            content: m.content,
          }));
        // Add current user message
        apiMessages.push({ role: 'user' as const, content: messageContent });

        // Call the unified /api/ai/chat endpoint (RAG + Tools)
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: apiMessages,
            systemPrompt: systemContext,
            enableTools: true,
            autoRoute: true,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Request failed: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        const decoder = new TextDecoder();
        let accumulatedContent = '';

        setIsStreaming(true);

        // The /api/ai/chat endpoint returns a plain text stream from streamText()
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          accumulatedContent += chunk;

          // Update the assistant message with accumulated content
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: accumulatedContent }
                : m
            )
          );
        }

        // Final update
        const finalMessage: RAGMessage = {
          id: assistantId,
          role: 'assistant',
          content: accumulatedContent,
          timestamp: new Date(),
        };
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? finalMessage : m)));
        onFinish?.(finalMessage);
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          // User cancelled - remove the empty assistant message
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
        } else {
          const error = err instanceof Error ? err : new Error('Unknown error');
          setError(error);
          onError?.(error);
          // Update assistant message with error
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: `Error: ${error.message}` } : m
            )
          );
        }
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [input, messages, onFinish, onError, systemContext]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      await sendMessage();
    },
    [sendMessage]
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    cancel();
    setMessages([]);
    setInput('');
    setError(null);
    setLastClassification(null);
    if (persistKey && typeof window !== 'undefined') {
      localStorage.removeItem(persistKey);
    }
  }, [cancel, persistKey]);

  return {
    messages,
    input,
    setInput,
    isLoading,
    isStreaming,
    error,
    sendMessage,
    handleSubmit,
    cancel,
    reset,
    lastClassification,
  };
}
