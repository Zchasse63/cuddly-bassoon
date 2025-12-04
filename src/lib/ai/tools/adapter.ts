/**
 * AI SDK v5 Tool Adapter
 * Converts our custom tool registry format to Vercel AI SDK v5 ToolSet format
 */

import { tool } from 'ai';
import type { ToolSet } from 'ai';
import { toolRegistry } from './registry';
import { toolLogger } from './logger';
import type { RegisteredTool, ToolExecutionContext, ToolCategory } from './types';

// Track if tools have been initialized
let toolsInitialized = false;

/**
 * Ensure tools are registered (called once at module load)
 */
export async function ensureToolsInitialized(): Promise<void> {
  if (toolsInitialized) return;
  
  // Dynamically import to avoid circular dependencies
  const { registerAllTools } = await import('./categories');
  registerAllTools();
  toolsInitialized = true;

  toolLogger.adapter(`Initialized ${toolRegistry.count} tools`);
}

/**
 * Convert tool ID to valid JavaScript identifier
 * e.g., 'map.draw_search_area' → 'map_draw_search_area'
 */
function sanitizeToolId(toolId: string): string {
  return toolId.replace(/\./g, '_').replace(/-/g, '_');
}

/**
 * Convert a single registered tool to AI SDK format
 */
function convertTool(
  registeredTool: RegisteredTool,
  context: ToolExecutionContext
) {
  return tool({
    description: registeredTool.description,
    inputSchema: registeredTool.inputSchema,
    execute: async (input: unknown) => {
      const startTime = Date.now();

      try {
        // Check permissions before execution
        if (!context.permissions.includes(registeredTool.requiredPermission)) {
          throw new Error(`Permission denied: requires ${registeredTool.requiredPermission}`);
        }

        // Execute the tool handler with our context
        const result = await registeredTool.handler(input, context);

        toolLogger.toolExec(registeredTool.id, Date.now() - startTime);
        return result;
      } catch (error) {
        toolLogger.toolError(registeredTool.id, error);
        throw error;
      }
    },
  });
}

/**
 * Convert all registered tools to AI SDK v5 ToolSet format
 * Note: We use type assertion here because our dynamic tool creation
 * doesn't match the strict generic constraints of ToolSet
 */
export function convertToAISDKTools(context: ToolExecutionContext): ToolSet {
  const allTools = toolRegistry.getAll();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aiTools: Record<string, any> = {};

  for (const registeredTool of allTools) {
    const toolKey = sanitizeToolId(registeredTool.id);
    aiTools[toolKey] = convertTool(registeredTool, context);
  }

  return aiTools as ToolSet;
}

/**
 * Convert tools from specific categories to AI SDK format
 */
export function convertCategoryTools(
  categories: ToolCategory[],
  context: ToolExecutionContext
): ToolSet {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const aiTools: Record<string, any> = {};

  for (const category of categories) {
    const categoryTools = toolRegistry.getByCategory(category);
    for (const registeredTool of categoryTools) {
      const toolKey = sanitizeToolId(registeredTool.id);
      aiTools[toolKey] = convertTool(registeredTool, context);
    }
  }

  return aiTools as ToolSet;
}

/**
 * Get active tools based on context (for limiting available tools)
 * If categories are provided as first argument (array), uses default context
 */
export function getActiveToolKeys(
  categoriesOrContext?: ToolCategory[] | ToolExecutionContext,
  requestedCategories?: ToolCategory[]
): string[] {
  let tools = toolRegistry.getAll();

  // Handle overloaded signature
  let categories: ToolCategory[] | undefined;
  let context: ToolExecutionContext | undefined;

  if (Array.isArray(categoriesOrContext)) {
    categories = categoriesOrContext;
    context = createDefaultContext();
  } else {
    context = categoriesOrContext || createDefaultContext();
    categories = requestedCategories;
  }

  // Filter by requested categories
  if (categories && categories.length > 0) {
    tools = tools.filter((t) => categories!.includes(t.category));
  }

  // Filter by user permissions
  const permissionOrder = ['read', 'write', 'execute', 'admin'];
  const maxPermissionLevel = Math.max(
    ...context.permissions.map((p) => permissionOrder.indexOf(p))
  );
  tools = tools.filter(
    (t) => permissionOrder.indexOf(t.requiredPermission) <= maxPermissionLevel
  );

  return tools.map((t) => sanitizeToolId(t.id));
}

/**
 * Create a default execution context
 */
export function createDefaultContext(
  overrides?: Partial<ToolExecutionContext>
): ToolExecutionContext {
  return {
    userId: 'anonymous',
    sessionId: `session_${Date.now()}`,
    permissions: ['read', 'write', 'execute'],
    ...overrides,
  };
}

/**
 * Get tool count for debugging
 */
export function getToolCount(): number {
  return toolRegistry.count;
}

/**
 * Get tools by category for debugging
 */
export function getToolsByCategory(): Record<string, number> {
  return toolRegistry.getCategoryCounts() as Record<string, number>;
}

