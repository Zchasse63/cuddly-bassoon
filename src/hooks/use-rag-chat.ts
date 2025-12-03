'use client';

/**
 * RAG Chat Hook
 * Client-side hook for streaming RAG-powered chat interactions
 * Uses the /api/rag/ask endpoint with SSE streaming
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
  const { onFinish, onError, persistKey } = options;

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
          setMessages(parsed.map((m: RAGMessage) => ({
            ...m,
            timestamp: new Date(m.timestamp),
          })));
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

  const sendMessage = useCallback(async (content?: string) => {
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
    setMessages(prev => [...prev, userMessage]);

    // Create placeholder for assistant message
    const assistantId = generateId();
    const assistantMessage: RAGMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMessage]);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/rag/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: messageContent }),
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
      let sources: RAGSource[] = [];
      let classification: RAGClassification | undefined;
      let cached = false;

      setIsStreaming(true);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          try {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;
            
            const data = JSON.parse(jsonStr);

            switch (data.type) {
              case 'classification':
                classification = data.content as RAGClassification;
                setLastClassification(classification);
                break;
              
              case 'sources':
                sources = data.content as RAGSource[];
                break;
              
              case 'text':
                accumulatedContent += data.content;
                setMessages(prev => prev.map(m => 
                  m.id === assistantId 
                    ? { ...m, content: accumulatedContent, sources, classification }
                    : m
                ));
                break;
              
              case 'cached':
                cached = data.content === true;
                break;
              
              case 'done':
                // Final update with all metadata
                const finalMessage: RAGMessage = {
                  id: assistantId,
                  role: 'assistant',
                  content: accumulatedContent,
                  sources,
                  classification,
                  cached,
                  timestamp: new Date(),
                };
                setMessages(prev => prev.map(m => 
                  m.id === assistantId ? finalMessage : m
                ));
                onFinish?.(finalMessage);
                break;
              
              case 'error':
                throw new Error(data.content);
            }
          } catch (parseError) {
            // Skip invalid JSON lines
            console.warn('Failed to parse SSE data:', parseError);
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // User cancelled - remove the empty assistant message
        setMessages(prev => prev.filter(m => m.id !== assistantId));
      } else {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
        // Update assistant message with error
        setMessages(prev => prev.map(m => 
          m.id === assistantId 
            ? { ...m, content: `Error: ${error.message}` }
            : m
        ));
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [input, onFinish, onError]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    await sendMessage();
  }, [sendMessage]);

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

