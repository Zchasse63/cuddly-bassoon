/**
 * AI Tool Types
 * Core type definitions for the AI tool execution framework
 */

import { z } from 'zod';

/**
 * Tool categories matching the 11 categories from the spec
 */
export type ToolCategory =
  | 'property_search'
  | 'deal_analysis'
  | 'buyer_management'
  | 'communication'
  | 'document_generation'
  | 'market_analysis'
  | 'campaign_management'
  | 'data_enrichment'
  | 'workflow_automation'
  | 'reporting'
  | 'system';

/**
 * Permission levels for tool execution
 */
export type PermissionLevel = 'read' | 'write' | 'execute' | 'admin';

/**
 * Tool execution status
 */
export type ToolExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/**
 * Base tool definition interface
 */
export interface ToolDefinition<TInput = unknown, TOutput = unknown> {
  /** Unique tool identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Description for AI to understand when to use */
  description: string;
  /** Tool category */
  category: ToolCategory;
  /** Required permission level */
  requiredPermission: PermissionLevel;
  /** Zod schema for input validation */
  inputSchema: z.ZodType<TInput>;
  /** Zod schema for output validation */
  outputSchema: z.ZodType<TOutput>;
  /** Whether tool requires user confirmation */
  requiresConfirmation: boolean;
  /** Estimated execution time in ms */
  estimatedDuration?: number;
  /** Rate limit (calls per minute) */
  rateLimit?: number;
  /** Tags for discovery */
  tags: string[];
}

/**
 * Tool execution context
 */
export interface ToolExecutionContext {
  userId: string;
  sessionId: string;
  permissions: PermissionLevel[];
  viewContext?: unknown;
  metadata?: Record<string, unknown>;
}

/**
 * Tool execution result
 */
export interface ToolExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  executionTime: number;
  toolId: string;
  timestamp: Date;
}

/**
 * Tool execution log entry
 */
export interface ToolExecutionLog {
  id: string;
  toolId: string;
  userId: string;
  sessionId: string;
  input: unknown;
  output?: unknown;
  status: ToolExecutionStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  error?: string;
}

/**
 * Tool handler function type
 */
export type ToolHandler<TInput, TOutput> = (
  input: TInput,
  context: ToolExecutionContext
) => Promise<TOutput>;

/**
 * Registered tool with handler
 */
export interface RegisteredTool<TInput = unknown, TOutput = unknown>
  extends ToolDefinition<TInput, TOutput> {
  handler: ToolHandler<TInput, TOutput>;
}

/**
 * Tool discovery filter
 */
export interface ToolFilter {
  category?: ToolCategory;
  permission?: PermissionLevel;
  tags?: string[];
  search?: string;
}

/**
 * Tool orchestration plan
 */
export interface ToolOrchestrationPlan {
  steps: ToolOrchestrationStep[];
  estimatedDuration: number;
  requiresConfirmation: boolean;
}

/**
 * Single step in an orchestration plan
 */
export interface ToolOrchestrationStep {
  toolId: string;
  input: unknown;
  dependsOn?: string[];
  condition?: string;
}

