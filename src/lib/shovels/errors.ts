/**
 * Shovels API Error Classes
 * Custom error types for Shovels.ai API failures
 */

// ============================================
// Base Error Class
// ============================================

/**
 * Base error class for all Shovels API errors.
 */
export class ShovelsApiError extends Error {
  public readonly statusCode: number;
  public readonly requestId?: string;
  public readonly timestamp: Date;
  public readonly isRetryable: boolean;

  constructor(
    message: string,
    statusCode: number = 0,
    requestId?: string,
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'ShovelsApiError';
    this.statusCode = statusCode;
    this.requestId = requestId;
    this.timestamp = new Date();
    this.isRetryable = isRetryable;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ShovelsApiError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      requestId: this.requestId,
      timestamp: this.timestamp.toISOString(),
      isRetryable: this.isRetryable,
    };
  }
}

// ============================================
// Specific Error Classes
// ============================================

/**
 * Error thrown when rate limit is exceeded (429).
 * This error is retryable after waiting for the rate limit window to reset.
 */
export class ShovelsRateLimitError extends ShovelsApiError {
  public readonly retryAfterMs: number;

  constructor(message: string, requestId?: string, retryAfterMs: number = 1000) {
    super(message, 429, requestId, true);
    this.name = 'ShovelsRateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

/**
 * Error thrown when authentication fails (401/403).
 * This error is NOT retryable - the API key needs to be fixed.
 */
export class ShovelsAuthenticationError extends ShovelsApiError {
  constructor(message: string, requestId?: string) {
    super(message, 401, requestId, false);
    this.name = 'ShovelsAuthenticationError';
  }
}

/**
 * Error thrown when a resource is not found (404).
 * This error is NOT retryable - the resource doesn't exist.
 */
export class ShovelsNotFoundError extends ShovelsApiError {
  public readonly resourceType?: string;
  public readonly resourceId?: string;

  constructor(message: string, requestId?: string, resourceType?: string, resourceId?: string) {
    super(message, 404, requestId, false);
    this.name = 'ShovelsNotFoundError';
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * Error thrown when request validation fails (400).
 * This error is NOT retryable - the request parameters need to be fixed.
 */
export class ShovelsValidationError extends ShovelsApiError {
  public readonly validationErrors?: Record<string, string[]>;

  constructor(message: string, requestId?: string, validationErrors?: Record<string, string[]>) {
    super(message, 400, requestId, false);
    this.name = 'ShovelsValidationError';
    this.validationErrors = validationErrors;
  }
}

/**
 * Error thrown when a network or timeout error occurs.
 * This error IS retryable - it may be a transient network issue.
 */
export class ShovelsNetworkError extends ShovelsApiError {
  constructor(message: string, requestId?: string) {
    super(message, 0, requestId, true);
    this.name = 'ShovelsNetworkError';
  }
}

/**
 * Error thrown when the monthly quota is exceeded.
 * This error is NOT retryable until the quota resets.
 */
export class ShovelsQuotaExceededError extends ShovelsApiError {
  public readonly quotaResetDate?: Date;

  constructor(message: string, requestId?: string, quotaResetDate?: Date) {
    super(message, 402, requestId, false);
    this.name = 'ShovelsQuotaExceededError';
    this.quotaResetDate = quotaResetDate;
  }
}

// ============================================
// Error Type Guards
// ============================================

export function isShovelsApiError(error: unknown): error is ShovelsApiError {
  return error instanceof ShovelsApiError;
}

export function isRateLimitError(error: unknown): error is ShovelsRateLimitError {
  return error instanceof ShovelsRateLimitError;
}

export function isAuthenticationError(error: unknown): error is ShovelsAuthenticationError {
  return error instanceof ShovelsAuthenticationError;
}

export function isNotFoundError(error: unknown): error is ShovelsNotFoundError {
  return error instanceof ShovelsNotFoundError;
}

export function isValidationError(error: unknown): error is ShovelsValidationError {
  return error instanceof ShovelsValidationError;
}

export function isQuotaExceededError(error: unknown): error is ShovelsQuotaExceededError {
  return error instanceof ShovelsQuotaExceededError;
}

export function isRetryableError(error: unknown): boolean {
  return error instanceof ShovelsApiError && error.isRetryable;
}

