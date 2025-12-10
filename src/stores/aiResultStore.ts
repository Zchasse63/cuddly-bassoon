import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

/**
 * AI Result Store
 *
 * Source: ARCHITECTURE_SOURCE_OF_TRUTH.md Section 4 (AI-to-UI Bridge Fix)
 *
 * Replaces the event bus pattern with a reliable, replayable state store for AI tool results.
 *
 * Why Zustand over Event Bus:
 * - State Persistence: Full state tree available to all components
 * - Late Subscribers: Components get current state even if they mount after result
 * - DevTools: Full Zustand devtools integration for debugging
 * - Type Safety: Complete TypeScript support
 * - No Race Conditions: State updates are synchronous and predictable
 *
 * Features:
 * - Store all AI tool results with metadata
 * - Track acknowledgment status (whether UI has processed result)
 * - Fast lookups by tool name
 * - Selective subscriptions via subscribeWithSelector middleware
 */

export interface AIToolResult {
  /** Unique identifier for this result */
  id: string;

  /** Name of the tool that produced this result (e.g., 'search-properties', 'get-property-details') */
  toolName: string;

  /** The actual result data from the tool execution */
  result: unknown;

  /** Unix timestamp when the result was added */
  timestamp: number;

  /** Whether a UI component has acknowledged/processed this result */
  acknowledged: boolean;
}

interface AIResultStore {
  // State
  /** Map of all results by their ID for fast lookups */
  results: Map<string, AIToolResult>;

  /** Map of latest result for each tool name for quick access */
  latestByTool: Map<string, AIToolResult>;

  // Actions
  /** Add a new result to the store */
  addResult: (result: Omit<AIToolResult, 'timestamp' | 'acknowledged'>) => void;

  /** Mark a result as acknowledged/processed by the UI */
  acknowledgeResult: (id: string) => void;

  /** Get the most recent result for a specific tool */
  getLatestResult: (toolName: string) => AIToolResult | undefined;

  /** Clear all results from the store */
  clearResults: () => void;

  /** Get all unacknowledged results */
  getUnacknowledgedResults: () => AIToolResult[];

  /** Get all results for a specific tool (sorted by timestamp, newest first) */
  getResultsForTool: (toolName: string) => AIToolResult[];
}

/**
 * Zustand store for AI tool results
 *
 * Usage in ScoutPane.tsx (write results):
 * ```typescript
 * const addResult = useAIResultStore((state) => state.addResult);
 *
 * // When tool result arrives:
 * addResult({
 *   id: crypto.randomUUID(),
 *   toolName: 'search-properties',
 *   result: toolResult.result,
 * });
 * ```
 *
 * Usage in MapContainer.tsx (subscribe to specific results):
 * ```typescript
 * const searchResult = useAIResultStore(
 *   (state) => state.latestByTool.get('search-properties')
 * );
 *
 * useEffect(() => {
 *   if (searchResult && !searchResult.acknowledged) {
 *     updateMarkers(searchResult.result);
 *     useAIResultStore.getState().acknowledgeResult(searchResult.id);
 *   }
 * }, [searchResult]);
 * ```
 */
export const useAIResultStore = create<AIResultStore>()(
  subscribeWithSelector((set, get) => ({
    results: new Map(),
    latestByTool: new Map(),

    addResult: (input) => {
      const result: AIToolResult = {
        ...input,
        timestamp: Date.now(),
        acknowledged: false,
      };

      set((state) => {
        const newResults = new Map(state.results);
        newResults.set(result.id, result);

        const newLatest = new Map(state.latestByTool);
        const existing = newLatest.get(result.toolName);

        // Only update latest if this result is newer
        if (!existing || result.timestamp > existing.timestamp) {
          newLatest.set(result.toolName, result);
        }

        return { results: newResults, latestByTool: newLatest };
      });

      // Log for debugging (helps track tool execution flow)
      if (process.env.NODE_ENV === 'development') {
        console.log('[AI Result Store] Added result:', {
          id: result.id,
          toolName: result.toolName,
          timestamp: new Date(result.timestamp).toISOString(),
        });
      }
    },

    acknowledgeResult: (id) => {
      set((state) => {
        const newResults = new Map(state.results);
        const result = newResults.get(id);

        if (result) {
          newResults.set(id, { ...result, acknowledged: true });

          if (process.env.NODE_ENV === 'development') {
            console.log('[AI Result Store] Acknowledged result:', {
              id,
              toolName: result.toolName,
            });
          }
        }

        return { results: newResults };
      });
    },

    getLatestResult: (toolName) => {
      return get().latestByTool.get(toolName);
    },

    clearResults: () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AI Result Store] Clearing all results');
      }
      set({ results: new Map(), latestByTool: new Map() });
    },

    getUnacknowledgedResults: () => {
      const results = get().results;
      return Array.from(results.values())
        .filter((result) => !result.acknowledged)
        .sort((a, b) => b.timestamp - a.timestamp);
    },

    getResultsForTool: (toolName) => {
      const results = get().results;
      return Array.from(results.values())
        .filter((result) => result.toolName === toolName)
        .sort((a, b) => b.timestamp - a.timestamp);
    },
  }))
);

/**
 * Selector helper for subscribing to specific tool results
 *
 * Usage:
 * ```typescript
 * const searchResult = useAIResultStore(selectLatestResultForTool('search-properties'));
 * ```
 */
export const selectLatestResultForTool = (toolName: string) => (state: AIResultStore) =>
  state.latestByTool.get(toolName);

/**
 * Selector helper for subscribing to unacknowledged results
 *
 * Usage:
 * ```typescript
 * const unacknowledged = useAIResultStore(selectUnacknowledgedResults);
 * ```
 */
export const selectUnacknowledgedResults = (state: AIResultStore) =>
  Array.from(state.results.values()).filter((result) => !result.acknowledged);

/**
 * Hook for subscribing to a specific tool's results with automatic acknowledgment
 *
 * This is a convenience hook that:
 * 1. Subscribes to the latest result for a tool
 * 2. Provides an acknowledge callback
 * 3. Only re-renders when the result changes
 *
 * Usage:
 * ```typescript
 * const { result, acknowledge } = useToolResult('search-properties');
 *
 * useEffect(() => {
 *   if (result && !result.acknowledged) {
 *     updateUI(result.result);
 *     acknowledge();
 *   }
 * }, [result]);
 * ```
 */
export function useToolResult(toolName: string) {
  const result = useAIResultStore(selectLatestResultForTool(toolName));
  const acknowledgeResult = useAIResultStore((state) => state.acknowledgeResult);

  const acknowledge = () => {
    if (result) {
      acknowledgeResult(result.id);
    }
  };

  return { result, acknowledge };
}

/**
 * Hook for subscribing to multiple tools at once
 *
 * Usage:
 * ```typescript
 * const results = useMultipleToolResults(['search-properties', 'get-property-details']);
 * ```
 */
export function useMultipleToolResults(toolNames: string[]) {
  return useAIResultStore((state) => {
    const results: Record<string, AIToolResult | undefined> = {};
    toolNames.forEach((toolName) => {
      results[toolName] = state.latestByTool.get(toolName);
    });
    return results;
  });
}
