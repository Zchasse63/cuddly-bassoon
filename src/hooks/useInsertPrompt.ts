'use client';

/**
 * Click-to-Insert Hook
 *
 * Provides functionality to insert example prompts into the chat input.
 * Used by onboarding, command palette, and quick action components.
 */

import { useCallback, useRef, useState } from 'react';
import type { InsertPromptOptions } from '@/lib/ai/tool-discovery/types';

interface InsertPromptState {
  /** Whether a prompt was just inserted (for animation) */
  justInserted: boolean;
  /** The last inserted prompt */
  lastPrompt: string | null;
}

interface UseInsertPromptOptions {
  /** Callback when prompt is inserted */
  onInsert?: (prompt: string) => void;
  /** Reference to the input element (optional, for focus management) */
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
}

interface UseInsertPromptReturn {
  /** Insert a prompt into the chat input */
  insertPrompt: (options: InsertPromptOptions) => void;
  /** Current state */
  state: InsertPromptState;
  /** Reset the inserted state (after animation completes) */
  resetInsertedState: () => void;
}

/**
 * Hook for inserting prompts into chat input
 */
export function useInsertPrompt(options: UseInsertPromptOptions = {}): UseInsertPromptReturn {
  const { onInsert, inputRef } = options;
  const [state, setState] = useState<InsertPromptState>({
    justInserted: false,
    lastPrompt: null,
  });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const insertPrompt = useCallback(
    (insertOptions: InsertPromptOptions) => {
      const { prompt, shouldFocus = true } = insertOptions;

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Update state to show insertion animation
      setState({
        justInserted: true,
        lastPrompt: prompt,
      });

      // Call the onInsert callback with the prompt
      onInsert?.(prompt);

      // Focus the input if requested
      if (shouldFocus && inputRef?.current) {
        inputRef.current.focus();
      }

      // Reset the inserted state after animation completes
      timeoutRef.current = setTimeout(() => {
        setState((prev) => ({ ...prev, justInserted: false }));
      }, 300);
    },
    [onInsert, inputRef]
  );

  const resetInsertedState = useCallback(() => {
    setState((prev) => ({ ...prev, justInserted: false }));
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    insertPrompt,
    state,
    resetInsertedState,
  };
}

/**
 * Hook for managing onboarding state
 */
export function useOnboardingState() {
  const STORAGE_KEY = 'scout-onboarding';
  const CURRENT_VERSION = 1;

  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Check version - if version changed, show onboarding again
        if (parsed.version !== CURRENT_VERSION) {
          return false;
        }
        return parsed.hasSeenOnboarding ?? false;
      }
    } catch {
      // Ignore parse errors
    }
    return false;
  });

  const markOnboardingSeen = useCallback(() => {
    setHasSeenOnboarding(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          hasSeenOnboarding: true,
          dismissedAt: new Date().toISOString(),
          version: CURRENT_VERSION,
        })
      );
    }
  }, []);

  const resetOnboarding = useCallback(() => {
    setHasSeenOnboarding(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    hasSeenOnboarding,
    markOnboardingSeen,
    resetOnboarding,
    shouldShowOnboarding: !hasSeenOnboarding,
  };
}
