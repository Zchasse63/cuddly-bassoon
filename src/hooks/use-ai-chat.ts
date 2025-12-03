'use client';

/**
 * AI Chat Hook
 * Client-side hook for streaming AI chat interactions
 * Compatible with AI SDK v5
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { useChat as useVercelChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

import { ClaudeModelId, CLAUDE_MODELS } from '@/lib/ai/models';

export interface AIChatOptions {
  model?: ClaudeModelId;
  systemPrompt?: string;
  autoRoute?: boolean;
  maxTokens?: number;
  temperature?: number;
  onFinish?: (content: string) => void;
  onError?: (error: Error) => void;
}

export interface AIChatState {
  messages: Array<{ role: 'user' | 'assistant'; content: string; id: string }>;
  isLoading: boolean;
  isStreaming: boolean;
  error: Error | null;
}

export function useAIChat(options: AIChatOptions = {}) {
  const {
    model = CLAUDE_MODELS.SONNET,
    systemPrompt,
    autoRoute = true,
    maxTokens = 4096,
    temperature = 0.7,
    onFinish,
    onError,
  } = options;

  const [input, setInput] = useState('');
  const [localError, setLocalError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Create transport with body params - memoized to prevent recreation
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/ai/chat',
        body: {
          model,
          systemPrompt,
          autoRoute,
          maxTokens,
          temperature,
        },
      }),
    [model, systemPrompt, autoRoute, maxTokens, temperature]
  );

  const {
    messages,
    sendMessage: vercelSendMessage,
    setMessages,
    stop,
    status,
    error: chatError,
  } = useVercelChat({
    transport,
    onFinish: ({ message }) => {
      const content = message.parts
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('');
      onFinish?.(content);
    },
    onError: (err) => {
      setLocalError(err);
      onError?.(err);
    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';
  const error = localError || chatError || null;

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim()) return;
      setLocalError(null);
      // AI SDK v5 uses 'text' property for user messages
      await vercelSendMessage({ text: input });
      setInput('');
    },
    [input, vercelSendMessage]
  );

  const sendMessage = useCallback(
    async (content: string) => {
      setLocalError(null);
      // AI SDK v5 uses 'text' property for user messages
      await vercelSendMessage({ text: content });
    },
    [vercelSendMessage]
  );

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    stop();
  }, [stop]);

  const reset = useCallback(() => {
    setMessages([]);
    setLocalError(null);
    setInput('');
  }, [setMessages]);

  // Convert messages to simpler format for easier consumption
  const formattedMessages = messages.map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.parts
      .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map((p) => p.text)
      .join(''),
  }));

  return {
    // State
    messages: formattedMessages,
    input,
    isLoading,
    isStreaming: status === 'streaming',
    error,

    // Actions
    setInput,
    handleSubmit,
    sendMessage,
    cancel,
    reset,
  };
}

/**
 * Simple hook for one-off AI completions (non-streaming)
 */
export function useAICompletion() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const complete = useCallback(
    async (
      prompt: string,
      options: { model?: ClaudeModelId; systemPrompt?: string } = {}
    ): Promise<string | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            model: options.model,
            systemPrompt: options.systemPrompt,
            autoRoute: false,
          }),
        });

        if (!response.ok) {
          throw new Error(`AI request failed: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error('No response body');

        let result = '';
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value);
        }

        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return { complete, isLoading, error };
}

