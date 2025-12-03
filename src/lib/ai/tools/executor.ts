/**
 * AI Tool Executor
 * Handles tool execution with validation, permissions, and logging
 */

import { v4 as uuidv4 } from 'uuid';

import { toolRegistry } from './registry';
import {
  ToolExecutionContext,
  ToolExecutionResult,
  ToolExecutionLog,
  ToolExecutionStatus,
  PermissionLevel,
} from './types';

// In-memory log storage (replace with database in production)
const executionLogs: Map<string, ToolExecutionLog> = new Map();

/**
 * Check if user has required permission
 */
function hasPermission(userPermissions: PermissionLevel[], required: PermissionLevel): boolean {
  const permissionOrder: PermissionLevel[] = ['read', 'write', 'execute', 'admin'];
  const requiredLevel = permissionOrder.indexOf(required);
  return userPermissions.some((p) => permissionOrder.indexOf(p) >= requiredLevel);
}

/**
 * Execute a tool with full validation and logging
 */
export async function executeTool<TInput, TOutput>(
  toolId: string,
  input: TInput,
  context: ToolExecutionContext
): Promise<ToolExecutionResult<TOutput>> {
  const startTime = Date.now();
  const logId = uuidv4();

  // Create initial log entry
  const log: ToolExecutionLog = {
    id: logId,
    toolId,
    userId: context.userId,
    sessionId: context.sessionId,
    input,
    status: 'pending',
    startTime: new Date(),
  };
  executionLogs.set(logId, log);

  try {
    // Get tool from registry
    const tool = toolRegistry.get<TInput, TOutput>(toolId);
    if (!tool) {
      throw new ToolExecutionError('TOOL_NOT_FOUND', `Tool not found: ${toolId}`);
    }

    // Check permissions
    if (!hasPermission(context.permissions, tool.requiredPermission)) {
      throw new ToolExecutionError(
        'PERMISSION_DENIED',
        `Insufficient permissions for tool: ${toolId}`
      );
    }

    // Validate input
    const validationResult = tool.inputSchema.safeParse(input);
    if (!validationResult.success) {
      throw new ToolExecutionError(
        'INVALID_INPUT',
        'Input validation failed',
        validationResult.error.flatten()
      );
    }

    // Update log status
    log.status = 'running';

    // Execute handler
    const output = await tool.handler(validationResult.data, context);

    // Validate output
    const outputValidation = tool.outputSchema.safeParse(output);
    if (!outputValidation.success) {
      console.warn(`[Tool Executor] Output validation failed for ${toolId}:`, outputValidation.error);
    }

    // Update log
    const endTime = Date.now();
    log.status = 'completed';
    log.output = output;
    log.endTime = new Date();
    log.duration = endTime - startTime;

    return {
      success: true,
      data: output,
      executionTime: endTime - startTime,
      toolId,
      timestamp: new Date(),
    };
  } catch (error) {
    const endTime = Date.now();
    log.status = 'failed';
    log.endTime = new Date();
    log.duration = endTime - startTime;
    log.error = error instanceof Error ? error.message : 'Unknown error';

    if (error instanceof ToolExecutionError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        executionTime: endTime - startTime,
        toolId,
        timestamp: new Date(),
      };
    }

    return {
      success: false,
      error: {
        code: 'EXECUTION_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      executionTime: endTime - startTime,
      toolId,
      timestamp: new Date(),
    };
  }
}

/**
 * Get execution logs for a user
 */
export function getExecutionLogs(
  userId: string,
  options: { limit?: number; status?: ToolExecutionStatus } = {}
): ToolExecutionLog[] {
  const { limit = 100, status } = options;
  let logs = Array.from(executionLogs.values())
    .filter((log) => log.userId === userId)
    .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

  if (status) {
    logs = logs.filter((log) => log.status === status);
  }

  return logs.slice(0, limit);
}

/**
 * Get a specific execution log
 */
export function getExecutionLog(logId: string): ToolExecutionLog | undefined {
  return executionLogs.get(logId);
}

/**
 * Custom error class for tool execution
 */
export class ToolExecutionError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ToolExecutionError';
  }
}

