/**
 * AI Error Classes
 * Custom error types for AI-related failures
 */

/**
 * Base AI Error class
 */
export class AIError extends Error {
  public readonly code: string;
  public readonly retryable: boolean;
  public readonly statusCode: number;

  constructor(message: string, code: string, retryable: boolean = false, statusCode: number = 500) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.retryable = retryable;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AIError.prototype);
  }
}

/**
 * Rate limit exceeded error
 */
export class AIRateLimitError extends AIError {
  public readonly retryAfter: number;

  constructor(retryAfter: number = 60) {
    super(`Rate limit exceeded. Retry after ${retryAfter} seconds.`, 'RATE_LIMIT', true, 429);
    this.name = 'AIRateLimitError';
    this.retryAfter = retryAfter;
    Object.setPrototypeOf(this, AIRateLimitError.prototype);
  }
}

/**
 * Context length exceeded error
 */
export class AIContextLengthError extends AIError {
  public readonly tokenCount: number;
  public readonly maxTokens: number;

  constructor(tokenCount: number, maxTokens: number) {
    super(
      `Context length exceeded: ${tokenCount} tokens (max: ${maxTokens})`,
      'CONTEXT_LENGTH',
      false,
      400
    );
    this.name = 'AIContextLengthError';
    this.tokenCount = tokenCount;
    this.maxTokens = maxTokens;
    Object.setPrototypeOf(this, AIContextLengthError.prototype);
  }
}

/**
 * Content filter triggered error
 */
export class AIContentFilterError extends AIError {
  public readonly filterType: string;

  constructor(filterType: string = 'content_policy') {
    super(`Content blocked by ${filterType} filter`, 'CONTENT_FILTER', false, 400);
    this.name = 'AIContentFilterError';
    this.filterType = filterType;
    Object.setPrototypeOf(this, AIContentFilterError.prototype);
  }
}

/**
 * Connection or network error
 */
export class AIConnectionError extends AIError {
  constructor(message: string = 'Failed to connect to AI service') {
    super(message, 'CONNECTION', true, 503);
    this.name = 'AIConnectionError';
    Object.setPrototypeOf(this, AIConnectionError.prototype);
  }
}

/**
 * Authentication error
 */
export class AIAuthError extends AIError {
  constructor(message: string = 'AI service authentication failed') {
    super(message, 'AUTH', false, 401);
    this.name = 'AIAuthError';
    Object.setPrototypeOf(this, AIAuthError.prototype);
  }
}

/**
 * Invalid request error
 */
export class AIInvalidRequestError extends AIError {
  constructor(message: string) {
    super(message, 'INVALID_REQUEST', false, 400);
    this.name = 'AIInvalidRequestError';
    Object.setPrototypeOf(this, AIInvalidRequestError.prototype);
  }
}

/**
 * Parse an error from the Anthropic API
 */
export function parseAnthropicError(error: unknown): AIError {
  if (error instanceof AIError) return error;

  if (error && typeof error === 'object') {
    const err = error as { status?: number; message?: string; error?: { type?: string } };

    if (err.status === 429) {
      return new AIRateLimitError(60);
    }

    if (err.status === 401) {
      return new AIAuthError();
    }

    if (err.error?.type === 'invalid_request_error') {
      const message = err.message || 'Invalid request';
      if (message.includes('context_length') || message.includes('token')) {
        return new AIContextLengthError(0, 0);
      }
      return new AIInvalidRequestError(message);
    }

    if (err.status && err.status >= 500) {
      return new AIConnectionError(err.message);
    }
  }

  return new AIError(
    error instanceof Error ? error.message : 'Unknown AI error',
    'UNKNOWN',
    false,
    500
  );
}

/**
 * Check if an error is retryable
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AIError) return error.retryable;
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    return status === 429 || status >= 500;
  }
  return false;
}

/**
 * Get a user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof AIRateLimitError) {
    return 'The AI service is busy. Please try again in a moment.';
  }
  if (error instanceof AIContextLengthError) {
    return 'The conversation is too long. Please start a new conversation or remove some messages.';
  }
  if (error instanceof AIContentFilterError) {
    return 'The content could not be processed due to safety filters.';
  }
  if (error instanceof AIConnectionError) {
    return 'Unable to connect to the AI service. Please check your connection and try again.';
  }
  if (error instanceof AIAuthError) {
    return 'AI service authentication failed. Please contact support.';
  }
  if (error instanceof AIError) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}

