/**
 * AI Retry Logic
 * Implements exponential backoff and retry strategies for AI requests
 */

import { AIError, AIRateLimitError, isRetryableError, parseAnthropicError } from './errors';

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  onRetry?: (attempt: number, error: AIError, nextDelayMs: number) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, 'onRetry'>> = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: AIError | null = null;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = parseAnthropicError(error);

      // Don't retry non-retryable errors
      if (!isRetryableError(lastError)) {
        throw lastError;
      }

      // Don't retry if we've exhausted attempts
      if (attempt === config.maxRetries) {
        throw lastError;
      }

      // Calculate delay
      let delayMs: number;
      if (lastError instanceof AIRateLimitError) {
        // Use the retry-after header if available
        delayMs = Math.min(lastError.retryAfter * 1000, config.maxDelayMs);
      } else {
        // Exponential backoff
        delayMs = Math.min(
          config.baseDelayMs * Math.pow(config.backoffMultiplier, attempt),
          config.maxDelayMs
        );
      }

      // Add jitter (±10%)
      delayMs = delayMs * (0.9 + Math.random() * 0.2);

      // Callback
      if (options.onRetry) {
        options.onRetry(attempt + 1, lastError, delayMs);
      }

      console.log(`[AI Retry] Attempt ${attempt + 1}/${config.maxRetries + 1} failed, retrying in ${Math.round(delayMs)}ms`);
      await sleep(delayMs);
    }
  }

  throw lastError || new AIError('Max retries exceeded', 'MAX_RETRIES');
}

/**
 * Create a retryable version of a function
 */
export function makeRetryable<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  options: RetryOptions = {}
): T {
  return ((...args: Parameters<T>) => withRetry(() => fn(...args), options)) as T;
}

/**
 * Retry with fallback to a different strategy
 */
export async function withRetryAndFallback<T>(
  primaryFn: () => Promise<T>,
  fallbackFn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  try {
    return await withRetry(primaryFn, options);
  } catch (error) {
    console.log('[AI Retry] Primary failed, attempting fallback');
    try {
      return await fallbackFn();
    } catch (fallbackError) {
      // If fallback also fails, throw the original error
      throw parseAnthropicError(error);
    }
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Create a circuit breaker for AI requests
 */
export function createCircuitBreaker(
  thresholdFailures: number = 5,
  resetTimeMs: number = 60000
) {
  let failureCount = 0;
  let lastFailureTime = 0;
  let isOpen = false;

  return {
    execute: async <T>(fn: () => Promise<T>): Promise<T> => {
      // Check if circuit is open
      if (isOpen) {
        const timeSinceFailure = Date.now() - lastFailureTime;
        if (timeSinceFailure < resetTimeMs) {
          throw new AIError('Circuit breaker open', 'CIRCUIT_OPEN', true, 503);
        }
        // Reset circuit
        isOpen = false;
        failureCount = 0;
      }

      try {
        const result = await fn();
        // Reset on success
        failureCount = 0;
        return result;
      } catch (error) {
        failureCount++;
        lastFailureTime = Date.now();

        if (failureCount >= thresholdFailures) {
          isOpen = true;
          console.warn('[AI Circuit Breaker] Circuit opened after', failureCount, 'failures');
        }

        throw error;
      }
    },

    isOpen: () => isOpen,
    reset: () => {
      isOpen = false;
      failureCount = 0;
    },
  };
}

