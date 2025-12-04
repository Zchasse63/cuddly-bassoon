/**
 * AI Tools Logger
 * Configurable logging for AI tool operations
 *
 * Configure via environment variables:
 * - AI_TOOLS_LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error' | 'silent' (default: 'info')
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
};

function getConfiguredLevel(): LogLevel {
  const envLevel = process.env.AI_TOOLS_LOG_LEVEL?.toLowerCase() as LogLevel | undefined;
  if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
    return envLevel;
  }
  // Default to 'info' in production, 'debug' in development
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug';
}

class ToolLogger {
  private level: LogLevel;

  constructor() {
    this.level = getConfiguredLevel();
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  getLevel(): LogLevel {
    return this.level;
  }

  debug(category: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.log(`[${category}] ${message}`, ...args);
    }
  }

  info(category: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.log(`[${category}] ${message}`, ...args);
    }
  }

  warn(category: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`[${category}] ${message}`, ...args);
    }
  }

  error(category: string, message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(`[${category}] ${message}`, ...args);
    }
  }

  // Convenience methods for common categories
  tool(toolId: string, message: string, ...args: unknown[]): void {
    this.info('Tool', `${toolId}: ${message}`, ...args);
  }

  toolExec(toolId: string, durationMs: number): void {
    this.info('Tool Executed', `${toolId} in ${durationMs}ms`);
  }

  toolError(toolId: string, error: unknown): void {
    this.error('Tool Error', `${toolId}:`, error);
  }

  registry(message: string, ...args: unknown[]): void {
    this.debug('Registry', message, ...args);
  }

  adapter(message: string, ...args: unknown[]): void {
    this.debug('AI SDK Adapter', message, ...args);
  }
}

// Export a singleton instance
export const toolLogger = new ToolLogger();

// Export the class for testing or custom instances
export { ToolLogger };
