/**
 * AI Tool Discovery Module
 *
 * Exports for the tool discovery system including:
 * - Types for tool definitions and UI state
 * - Category definitions for organizing tools
 * - Tool registry with user-friendly metadata
 * - Search and filtering utilities
 */

// Types
export type {
  DiscoveryCategory,
  ContextType,
  ToolExample,
  DiscoveryToolDefinition,
  CategoryDefinition,
  ToolCallRecord,
  ChatMessageWithTools,
  OnboardingState,
  CommandPaletteState,
  InsertPromptOptions,
} from './types';

// Categories
export {
  categoryDefinitions,
  getCategory,
  getSortedCategories,
  getCategoryColor,
  getCategoryIcon,
} from './categories';

// Registry
export {
  toolRegistry,
  getToolBySlug,
  getToolsByCategory,
  getFeaturedTools,
  searchTools,
  getBeginnerTools,
  getToolDisplayName,
  getToolIcon,
} from './registry';
