/**
 * AI Tool Discovery Types
 *
 * Type definitions for the user-facing tool discovery system.
 * Maps internal tool slugs to user-friendly metadata for onboarding,
 * command palette, and transparency features.
 */

/**
 * User-facing tool categories organized by what users want to accomplish
 */
export type DiscoveryCategory =
  | 'property-search' // Finding properties
  | 'deal-analysis' // Analyzing deals and properties
  | 'buyer-intelligence' // Buyer discovery and matching
  | 'market-research' // Market data and trends
  | 'valuation' // ARV, comps, pricing
  | 'outreach' // Communication and follow-up
  | 'list-management' // Managing property lists
  | 'pipeline' // Deal pipeline operations
  | 'skip-tracing' // Contact information lookup
  | 'documents' // Document generation and management
  | 'automation' // Workflow automation
  | 'settings' // User preferences and configuration
  | 'help'; // Platform help and guidance

/**
 * Context types that tools may require
 */
export type ContextType =
  | 'property' // Requires a property in context
  | 'deal' // Requires a deal in context
  | 'buyer' // Requires a buyer in context
  | 'list' // Requires a list in context
  | 'none'; // No context required

/**
 * Example prompt for a tool
 */
export interface ToolExample {
  /** The example prompt text */
  prompt: string;
  /** Optional explanation of what this does */
  description?: string;
  /** Optional preview of expected result type */
  resultPreview?: string;
}

/**
 * User-friendly tool definition for discovery
 */
export interface DiscoveryToolDefinition {
  /** Internal tool identifier (e.g., "property_search.search") */
  slug: string;
  /** User-friendly name (e.g., "Natural Language Search") */
  displayName: string;
  /** One-line description (max 80 chars) */
  shortDescription: string;
  /** Detailed explanation for "Learn more" */
  fullDescription: string;
  /** Primary category */
  category: DiscoveryCategory;
  /** Optional subcategory for large categories */
  subcategory?: string;
  /** Lucide icon name (e.g., "Search", "Home", "TrendingUp") */
  icon: string;
  /** Example prompts (minimum 2, maximum 5) */
  examples: ToolExample[];
  /** Search keywords beyond the name */
  keywords: string[];
  /** Featured in onboarding/quick access */
  isPrimary: boolean;
  /** Hide from beginners, show in "All Tools" */
  isAdvanced: boolean;
  /** What context this tool needs */
  requiresContext: ContextType[];
}

/**
 * Category metadata for display
 */
export interface CategoryDefinition {
  /** Category identifier */
  id: DiscoveryCategory;
  /** Display name for UI */
  displayName: string;
  /** Short description of category */
  description: string;
  /** Lucide icon name */
  icon: string;
  /** Display order in palette (1 = first) */
  sortOrder: number;
  /** Tailwind color class for accents */
  color: string;
}

/**
 * Tool call record for transparency feature
 */
export interface ToolCallRecord {
  /** Unique call ID */
  id: string;
  /** Internal tool identifier */
  toolSlug: string;
  /** User-friendly name from registry */
  displayName: string;
  /** Lucide icon name */
  icon: string;
  /** Execution status */
  status: 'pending' | 'success' | 'error';
  /** When execution started */
  startedAt: string;
  /** When execution completed */
  completedAt?: string;
  /** Execution duration in ms */
  durationMs?: number;
  /** Brief description of what was requested */
  inputSummary?: string;
  /** Brief description of result */
  outputSummary?: string;
  /** For list-returning tools */
  resultCount?: number;
  /** If status is 'error' */
  errorMessage?: string;
}

/**
 * Chat message with tool transparency data
 */
export interface ChatMessageWithTools {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  /** Tool calls made during this message */
  toolCalls?: ToolCallRecord[];
}

/**
 * Onboarding state persistence
 */
export interface OnboardingState {
  /** Whether user has seen onboarding */
  hasSeenOnboarding: boolean;
  /** When onboarding was dismissed */
  onboardingDismissedAt: string | null;
  /** Version of onboarding seen (increment to re-show after major updates) */
  onboardingVersion: number;
}

/**
 * Command palette state
 */
export interface CommandPaletteState {
  /** Whether palette is open */
  isOpen: boolean;
  /** Current search query */
  searchQuery: string;
  /** Currently highlighted item index */
  selectedIndex: number;
  /** Tool slug if viewing details */
  expandedTool: string | null;
  /** Which categories are expanded in browse view */
  visibleCategories: DiscoveryCategory[];
}

/**
 * Insert prompt options for click-to-insert
 */
export interface InsertPromptOptions {
  /** The prompt text to insert */
  prompt: string;
  /** Whether to focus the input after insertion (default: true) */
  shouldFocus?: boolean;
  /** Whether to replace existing content (default: true) */
  shouldReplace?: boolean;
  /** Where to place cursor after insertion: 'end' or 'select-all' (default: 'end') */
  cursorPosition?: 'end' | 'select-all';
}
