/**
 * AI Tool Testing Utilities
 * Helper functions for testing AI tools
 */

import { toolRegistry } from '@/lib/ai/tools/registry';
import type { RegisteredTool, ToolExecutionContext, ToolCategory, PermissionLevel } from '@/lib/ai/tools/types';

/**
 * Create a mock execution context for testing
 */
export function createMockContext(overrides?: Partial<ToolExecutionContext>): ToolExecutionContext {
  return {
    userId: 'test-user-123',
    sessionId: 'test-session-456',
    permissions: ['read', 'write', 'execute', 'admin'] as PermissionLevel[],
    ...overrides,
  };
}

/**
 * Create a restricted context with limited permissions
 */
export function createRestrictedContext(permissions: PermissionLevel[] = ['read']): ToolExecutionContext {
  return createMockContext({ permissions });
}

/**
 * Execute a tool by ID with given input and context
 */
export async function executeTool<TInput, TOutput>(
  toolId: string,
  input: TInput,
  context?: Partial<ToolExecutionContext>
): Promise<TOutput> {
  const tool = toolRegistry.get<TInput, TOutput>(toolId);
  if (!tool) {
    throw new Error(`Tool not found: ${toolId}`);
  }
  return tool.handler(input, createMockContext(context));
}

/**
 * Get all tools in a category
 */
export function getToolsByCategory(category: ToolCategory): RegisteredTool[] {
  return toolRegistry.getByCategory(category);
}

/**
 * Validate tool input against its schema
 */
export function validateToolInput<TInput>(
  toolId: string,
  input: unknown
): { success: boolean; data?: TInput; error?: string } {
  const tool = toolRegistry.get(toolId);
  if (!tool) {
    return { success: false, error: `Tool not found: ${toolId}` };
  }
  
  const result = tool.inputSchema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data as TInput };
  }
  return { success: false, error: result.error.message };
}

/**
 * Create sample property data for testing
 */
export function createSampleProperty(overrides?: Record<string, unknown>) {
  return {
    id: 'prop-123',
    address: '123 Main St',
    city: 'Miami',
    state: 'FL',
    zip: '33101',
    price: 350000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    yearBuilt: 1995,
    propertyType: 'single_family',
    listingStatus: 'active',
    daysOnMarket: 30,
    coordinates: { lat: 25.7617, lng: -80.1918 },
    ...overrides,
  };
}

/**
 * Create sample buyer data for testing
 */
export function createSampleBuyer(overrides?: Record<string, unknown>) {
  return {
    id: 'buyer-456',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-555-123-4567',
    preferences: {
      priceRange: { min: 200000, max: 500000 },
      propertyTypes: ['single_family', 'condo'],
      locations: ['Miami', 'Fort Lauderdale'],
      minBedrooms: 2,
      minBathrooms: 1,
    },
    status: 'active',
    ...overrides,
  };
}

/**
 * Create sample deal data for testing
 */
export function createSampleDeal(overrides?: Record<string, unknown>) {
  return {
    id: 'deal-789',
    propertyId: 'prop-123',
    buyerId: 'buyer-456',
    stage: 'negotiation',
    offerPrice: 320000,
    askingPrice: 350000,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Create sample lead data for testing
 */
export function createSampleLead(overrides?: Record<string, unknown>) {
  return {
    id: 'lead-101',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1-555-987-6543',
    address: '456 Oak Ave',
    city: 'Miami',
    state: 'FL',
    source: 'website',
    status: 'new',
    motivationScore: 7,
    ...overrides,
  };
}

/**
 * Assert that a tool exists and has expected properties
 */
export function assertToolExists(
  toolId: string,
  expectedCategory?: ToolCategory
): RegisteredTool {
  const tool = toolRegistry.get(toolId);
  if (!tool) {
    throw new Error(`Expected tool ${toolId} to exist but it was not found`);
  }
  if (expectedCategory && tool.category !== expectedCategory) {
    throw new Error(
      `Expected tool ${toolId} to be in category ${expectedCategory} but it is in ${tool.category}`
    );
  }
  return tool;
}

/**
 * Wait for a condition to be true (useful for async tests)
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await condition()) return;
    await new Promise(r => setTimeout(r, interval));
  }
  throw new Error('Condition not met within timeout');
}

