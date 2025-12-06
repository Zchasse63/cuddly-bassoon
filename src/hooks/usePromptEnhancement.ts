'use client';

/**
 * Prompt Enhancement Hook
 *
 * Uses AI to improve/clarify user prompts for better results
 */

import { useState, useCallback } from 'react';

interface UsePromptEnhancementOptions {
  /** API endpoint for enhancement (defaults to /api/enhance-prompt) */
  endpoint?: string;
}

interface EnhancementResult {
  original: string;
  enhanced: string;
  improvements: string[];
}

interface UsePromptEnhancementReturn {
  enhancedPrompt: string | null;
  originalPrompt: string | null;
  improvements: string[];
  isEnhancing: boolean;
  error: string | null;
  enhancePrompt: (prompt: string) => Promise<string | null>;
  clearEnhancement: () => void;
  revertToOriginal: () => string | null;
}

export function usePromptEnhancement(
  options: UsePromptEnhancementOptions = {}
): UsePromptEnhancementReturn {
  const { endpoint = '/api/enhance-prompt' } = options;

  const [enhancedPrompt, setEnhancedPrompt] = useState<string | null>(null);
  const [originalPrompt, setOriginalPrompt] = useState<string | null>(null);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enhancePrompt = useCallback(
    async (prompt: string): Promise<string | null> => {
      if (!prompt.trim()) {
        return null;
      }

      setIsEnhancing(true);
      setError(null);
      setOriginalPrompt(prompt);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
          throw new Error('Failed to enhance prompt');
        }

        const data: EnhancementResult = await response.json();

        setEnhancedPrompt(data.enhanced);
        setImprovements(data.improvements || []);

        return data.enhanced;
      } catch (err) {
        console.error('Error enhancing prompt:', err);
        const errorMsg = err instanceof Error ? err.message : 'Failed to enhance prompt';
        setError(errorMsg);
        return null;
      } finally {
        setIsEnhancing(false);
      }
    },
    [endpoint]
  );

  const clearEnhancement = useCallback(() => {
    setEnhancedPrompt(null);
    setOriginalPrompt(null);
    setImprovements([]);
    setError(null);
  }, []);

  const revertToOriginal = useCallback(() => {
    return originalPrompt;
  }, [originalPrompt]);

  return {
    enhancedPrompt,
    originalPrompt,
    improvements,
    isEnhancing,
    error,
    enhancePrompt,
    clearEnhancement,
    revertToOriginal,
  };
}
