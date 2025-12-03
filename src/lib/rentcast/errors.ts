/**
 * RentCast API Error Classes
 * Comprehensive error handling for the RentCast integration.
 */

// ============================================
// Base Error Class
// ============================================

/**
 * Base error class for all RentCast API errors.
 */
export class RentCastApiError extends Error {
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
    this.name = 'RentCastApiError';
    this.statusCode = statusCode;
    this.requestId = requestId;
    this.timestamp = new Date();
    this.isRetryable = isRetryable;

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, RentCastApiError);
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
export class RentCastRateLimitError extends RentCastApiError {
  public readonly retryAfterMs: number;

  constructor(message: string, requestId?: string, retryAfterMs: number = 60000) {
    super(message, 429, requestId, true);
    this.name = 'RentCastRateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

/**
 * Error thrown when authentication fails (401/403).
 * This error is NOT retryable - the API key needs to be fixed.
 */
export class RentCastAuthenticationError extends RentCastApiError {
  constructor(message: string, requestId?: string) {
    super(message, 401, requestId, false);
    this.name = 'RentCastAuthenticationError';
  }
}

/**
 * Error thrown when a resource is not found (404).
 * This error is NOT retryable - the resource doesn't exist.
 */
export class RentCastNotFoundError extends RentCastApiError {
  public readonly resourceType?: string;
  public readonly resourceId?: string;

  constructor(message: string, requestId?: string, resourceType?: string, resourceId?: string) {
    super(message, 404, requestId, false);
    this.name = 'RentCastNotFoundError';
    this.resourceType = resourceType;
    this.resourceId = resourceId;
  }
}

/**
 * Error thrown when request validation fails (400).
 * This error is NOT retryable - the request parameters need to be fixed.
 */
export class RentCastValidationError extends RentCastApiError {
  public readonly validationErrors?: Record<string, string[]>;

  constructor(message: string, requestId?: string, validationErrors?: Record<string, string[]>) {
    super(message, 400, requestId, false);
    this.name = 'RentCastValidationError';
    this.validationErrors = validationErrors;
  }
}

/**
 * Error thrown when a network or timeout error occurs.
 * This error IS retryable - it may be a transient network issue.
 */
export class RentCastNetworkError extends RentCastApiError {
  constructor(message: string, requestId?: string) {
    super(message, 0, requestId, true);
    this.name = 'RentCastNetworkError';
  }
}

/**
 * Error thrown when response validation fails.
 * The API returned data that doesn't match expected schema.
 */
export class RentCastSchemaError extends RentCastApiError {
  public readonly schemaErrors?: unknown;

  constructor(message: string, requestId?: string, schemaErrors?: unknown) {
    super(message, 0, requestId, false);
    this.name = 'RentCastSchemaError';
    this.schemaErrors = schemaErrors;
  }
}

// ============================================
// Error Type Guards
// ============================================

export function isRentCastApiError(error: unknown): error is RentCastApiError {
  return error instanceof RentCastApiError;
}

export function isRateLimitError(error: unknown): error is RentCastRateLimitError {
  return error instanceof RentCastRateLimitError;
}

export function isAuthenticationError(error: unknown): error is RentCastAuthenticationError {
  return error instanceof RentCastAuthenticationError;
}

export function isNotFoundError(error: unknown): error is RentCastNotFoundError {
  return error instanceof RentCastNotFoundError;
}

export function isValidationError(error: unknown): error is RentCastValidationError {
  return error instanceof RentCastValidationError;
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof RentCastApiError) {
    return error.isRetryable;
  }
  return false;
}

