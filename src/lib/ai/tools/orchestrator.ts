/**
 * AI Tool Orchestrator
 * Manages multi-step tool execution and dependencies
 */

import { v4 as uuidv4 } from 'uuid';

import { toolRegistry } from './registry';
import { executeTool } from './executor';
import {
  ToolExecutionContext,
  ToolExecutionResult,
  ToolOrchestrationPlan,
  ToolOrchestrationStep,
} from './types';

export interface OrchestrationResult {
  planId: string;
  success: boolean;
  results: Map<string, ToolExecutionResult>;
  totalDuration: number;
  completedSteps: number;
  failedStep?: string;
  error?: string;
}

/**
 * Execute an orchestration plan
 */
export async function executeOrchestrationPlan(
  plan: ToolOrchestrationPlan,
  context: ToolExecutionContext
): Promise<OrchestrationResult> {
  const planId = uuidv4();
  const startTime = Date.now();
  const results = new Map<string, ToolExecutionResult>();
  let completedSteps = 0;

  console.log(`[Orchestrator] Starting plan ${planId} with ${plan.steps.length} steps`);

  try {
    // Build dependency graph
    const stepMap = new Map<string, ToolOrchestrationStep>();
    const stepResults = new Map<string, unknown>();

    for (const step of plan.steps) {
      stepMap.set(step.toolId, step);
    }

    // Execute steps in order, respecting dependencies
    for (const step of plan.steps) {
      // Check dependencies
      if (step.dependsOn) {
        for (const depId of step.dependsOn) {
          if (!stepResults.has(depId)) {
            throw new Error(`Dependency not met: ${depId} for ${step.toolId}`);
          }
        }
      }

      // Evaluate condition if present
      if (step.condition) {
        const conditionMet = evaluateCondition(step.condition, stepResults);
        if (!conditionMet) {
          console.log(`[Orchestrator] Skipping ${step.toolId}: condition not met`);
          continue;
        }
      }

      // Resolve input references
      const resolvedInput = resolveInputReferences(step.input, stepResults);

      // Execute the tool
      const result = await executeTool(step.toolId, resolvedInput, context);
      results.set(step.toolId, result);

      if (!result.success) {
        return {
          planId,
          success: false,
          results,
          totalDuration: Date.now() - startTime,
          completedSteps,
          failedStep: step.toolId,
          error: result.error?.message,
        };
      }

      stepResults.set(step.toolId, result.data);
      completedSteps++;
    }

    return {
      planId,
      success: true,
      results,
      totalDuration: Date.now() - startTime,
      completedSteps,
    };
  } catch (error) {
    return {
      planId,
      success: false,
      results,
      totalDuration: Date.now() - startTime,
      completedSteps,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Create an orchestration plan from tool IDs
 */
export function createSimplePlan(
  toolIds: string[],
  inputs: Record<string, unknown>
): ToolOrchestrationPlan {
  const steps: ToolOrchestrationStep[] = toolIds.map((toolId, index) => {
    const prevToolId = index > 0 ? toolIds[index - 1] : undefined;
    return {
      toolId,
      input: inputs[toolId] || {},
      dependsOn: prevToolId ? [prevToolId] : undefined,
    };
  });

  const estimatedDuration = steps.reduce((total, step) => {
    const tool = toolRegistry.get(step.toolId);
    return total + (tool?.estimatedDuration || 1000);
  }, 0);

  const requiresConfirmation = steps.some((step) => {
    const tool = toolRegistry.get(step.toolId);
    return tool?.requiresConfirmation || false;
  });

  return {
    steps,
    estimatedDuration,
    requiresConfirmation,
  };
}

/**
 * Evaluate a simple condition expression
 */
function evaluateCondition(condition: string, results: Map<string, unknown>): boolean {
  // Simple condition evaluation (expand as needed)
  // Format: "toolId.field == value" or "toolId.field != value"
  const match = condition.match(/^(\w+)\.(\w+)\s*(==|!=)\s*(.+)$/);
  if (!match) return true;

  const [, toolId, field, operator, value] = match;
  if (!toolId || !field || !operator || !value) return true;

  const result = results.get(toolId) as Record<string, unknown> | undefined;
  if (!result) return false;

  const actualValue = result[field];
  const expectedValue = value === 'true' ? true : value === 'false' ? false : value;

  return operator === '==' ? actualValue === expectedValue : actualValue !== expectedValue;
}

/**
 * Resolve references to previous step outputs in input
 */
function resolveInputReferences(input: unknown, results: Map<string, unknown>): unknown {
  if (typeof input === 'string') {
    // Replace {{toolId.field}} with actual values
    return input.replace(/\{\{(\w+)\.(\w+)\}\}/g, (_, toolId, field) => {
      const result = results.get(toolId) as Record<string, unknown> | undefined;
      return result?.[field]?.toString() || '';
    });
  }

  if (Array.isArray(input)) {
    return input.map((item) => resolveInputReferences(item, results));
  }

  if (input && typeof input === 'object') {
    const resolved: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      resolved[key] = resolveInputReferences(value, results);
    }
    return resolved;
  }

  return input;
}

