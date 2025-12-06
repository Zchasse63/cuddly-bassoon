import {
  RentCastApiError,
  RentCastRateLimitError,
  isRetryableError,
  isRateLimitError,
} from './errors';

// ============================================
// Retry Configuration
// ============================================

export interface RetryConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 8000,
  backoffMultiplier: 2,
};

// ============================================
// Retry Logic
// ============================================

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
  totalDelayMs: number;
}

/**
 * Execute a function with exponential backoff retry logic.
 *
 * Retry behavior:
 * - Retries transient errors (network issues, 5xx errors)
 * - Special handling for rate limit (429) - waits for reset
 * - Does NOT retry 4xx errors (except 429)
 * - Max 3 retries with exponential backoff (1s, 2s, 4s, 8s)
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxRetries, baseDelayMs, maxDelayMs, backoffMultiplier } = {
    ...DEFAULT_CONFIG,
    ...config,
  };

  let lastError: Error | undefined;
  let attempts = 0;
  let _totalDelay = 0;

  while (attempts <= maxRetries) {
    try {
      return await fn();
    } catch (error) {
      attempts++;
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (!shouldRetry(lastError, attempts, maxRetries)) {
        throw lastError;
      }

      // Calculate delay
      const delay = calculateDelay(lastError, attempts, baseDelayMs, maxDelayMs, backoffMultiplier);

      _totalDelay += delay;

      // Log retry attempt
      console.warn(
        `RentCast API retry attempt ${attempts}/${maxRetries} after ${delay}ms delay. ` +
          `Error: ${lastError.message}`
      );

      // Wait before retrying
      await sleep(delay);
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error('Retry failed');
}

/**
 * Determine if an error should trigger a retry.
 */
function shouldRetry(error: Error, attempt: number, maxRetries: number): boolean {
  // No more retries available
  if (attempt > maxRetries) {
    return false;
  }

  // Rate limit errors - always retry after waiting
  if (isRateLimitError(error)) {
    return true;
  }

  // Check if error is marked as retryable
  if (isRetryableError(error)) {
    return true;
  }

  // For non-RentCast errors, check for network errors
  if (!(error instanceof RentCastApiError)) {
    // Retry network errors
    const networkErrors = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND'];
    return networkErrors.some((code) => error.message.includes(code));
  }

  // Check HTTP status codes
  if (error instanceof RentCastApiError) {
    const status = error.statusCode;

    // Retry 5xx errors (server errors)
    if (status >= 500 && status < 600) {
      return true;
    }

    // Don't retry 4xx errors (except 429 which is handled above)
    if (status >= 400 && status < 500) {
      return false;
    }

    // Retry timeouts and network errors
    if (status === 0 || status === 408) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate delay before next retry using exponential backoff.
 */
function calculateDelay(
  error: Error,
  attempt: number,
  baseDelayMs: number,
  maxDelayMs: number,
  multiplier: number
): number {
  // For rate limit errors, use the retry-after time if available
  if (isRateLimitError(error)) {
    const rateLimitError = error as RentCastRateLimitError;
    return Math.min(rateLimitError.retryAfterMs, maxDelayMs);
  }

  // Exponential backoff: base * multiplier^(attempt-1)
  const exponentialDelay = baseDelayMs * Math.pow(multiplier, attempt - 1);

  // Add jitter (±10%) to prevent thundering herd
  const jitter = exponentialDelay * 0.1 * (Math.random() * 2 - 1);

  return Math.min(exponentialDelay + jitter, maxDelayMs);
}

/**
 * Promise-based sleep function.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================
// Convenience Wrappers
// ============================================

/**
 * Execute with retry and return a result object instead of throwing.
 */
export async function tryWithRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const startTime = Date.now();
  let attempts = 0;

  try {
    const data = await withRetry(async () => {
      attempts++;
      return fn();
    }, config);

    return {
      success: true,
      data,
      attempts,
      totalDelayMs: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error : new Error(String(error)),
      attempts,
      totalDelayMs: Date.now() - startTime,
    };
  }
}
