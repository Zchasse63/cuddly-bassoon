/**
 * AI Tool Registry
 * Central registry for all AI tools
 */

import {
  RegisteredTool,
  ToolCategory,
  ToolFilter,
  ToolDefinition,
  ToolHandler,
} from './types';

class ToolRegistry {
  private tools: Map<string, RegisteredTool> = new Map();
  private categoryIndex: Map<ToolCategory, Set<string>> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();

  /**
   * Register a new tool
   */
  register<TInput, TOutput>(
    definition: ToolDefinition<TInput, TOutput>,
    handler: ToolHandler<TInput, TOutput>
  ): void {
    const tool: RegisteredTool<TInput, TOutput> = {
      ...definition,
      handler,
    };

    this.tools.set(definition.id, tool as RegisteredTool);

    // Update category index
    if (!this.categoryIndex.has(definition.category)) {
      this.categoryIndex.set(definition.category, new Set());
    }
    this.categoryIndex.get(definition.category)!.add(definition.id);

    // Update tag index
    for (const tag of definition.tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(definition.id);
    }

    console.log(`[Tool Registry] Registered tool: ${definition.id}`);
  }

  /**
   * Unregister a tool
   */
  unregister(toolId: string): boolean {
    const tool = this.tools.get(toolId);
    if (!tool) return false;

    // Remove from category index
    this.categoryIndex.get(tool.category)?.delete(toolId);

    // Remove from tag index
    for (const tag of tool.tags) {
      this.tagIndex.get(tag)?.delete(toolId);
    }

    this.tools.delete(toolId);
    return true;
  }

  /**
   * Get a tool by ID
   */
  get<TInput = unknown, TOutput = unknown>(toolId: string): RegisteredTool<TInput, TOutput> | undefined {
    return this.tools.get(toolId) as RegisteredTool<TInput, TOutput> | undefined;
  }

  /**
   * Check if a tool exists
   */
  has(toolId: string): boolean {
    return this.tools.has(toolId);
  }

  /**
   * Get all tools
   */
  getAll(): RegisteredTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Find tools matching filter criteria
   */
  find(filter: ToolFilter): RegisteredTool[] {
    let toolIds: Set<string> | null = null;

    // Filter by category
    if (filter.category) {
      toolIds = new Set(this.categoryIndex.get(filter.category) || []);
    }

    // Filter by tags (intersection)
    if (filter.tags && filter.tags.length > 0) {
      for (const tag of filter.tags) {
        const tagTools = this.tagIndex.get(tag) || new Set();
        if (toolIds === null) {
          toolIds = new Set(tagTools);
        } else {
          toolIds = new Set([...toolIds].filter((id) => tagTools.has(id)));
        }
      }
    }

    // Get tools from IDs or all tools
    let tools = toolIds !== null
      ? Array.from(toolIds).map((id) => this.tools.get(id)!).filter(Boolean)
      : this.getAll();

    // Filter by permission
    if (filter.permission) {
      const permissionOrder = ['read', 'write', 'execute', 'admin'];
      const maxLevel = permissionOrder.indexOf(filter.permission);
      tools = tools.filter((t) => permissionOrder.indexOf(t.requiredPermission) <= maxLevel);
    }

    // Filter by search
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      tools = tools.filter(
        (t) =>
          t.name.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower) ||
          t.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    return tools;
  }

  /**
   * Get tools by category
   */
  getByCategory(category: ToolCategory): RegisteredTool[] {
    return this.find({ category });
  }

  /**
   * Get tool count
   */
  get count(): number {
    return this.tools.size;
  }

  /**
   * Get category counts
   */
  getCategoryCounts(): Record<ToolCategory, number> {
    const counts: Partial<Record<ToolCategory, number>> = {};
    for (const [category, ids] of this.categoryIndex) {
      counts[category] = ids.size;
    }
    return counts as Record<ToolCategory, number>;
  }

  /**
   * Get tool definitions for AI (without handlers)
   */
  getDefinitionsForAI(): Omit<ToolDefinition, 'inputSchema' | 'outputSchema'>[] {
    return this.getAll().map(({ handler, inputSchema, outputSchema, ...def }) => def);
  }
}

// Singleton instance
export const toolRegistry = new ToolRegistry();

