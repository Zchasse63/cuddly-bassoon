/**
 * AI-UI Event Bridge
 * Enables AI tool results to update UI components
 *
 * Pattern: Tool executes → emits event → UI component subscribes and updates state
 */

export type AIPropertySearchResult = {
  properties: Array<{
    id: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    propertyType: string;
    estimatedValue: number;
    motivationScore?: number;
    latitude?: number;
    longitude?: number;
  }>;
  total: number;
  hasMore: boolean;
  searchLocation?: {
    city?: string;
    state?: string;
    zipCode?: string;
  };
};

export type AIToolResult = {
  toolName: string;
  result: unknown;
};

export type AIEventMap = {
  'ai:property-search-results': AIPropertySearchResult;
  'ai:location-change': { city?: string; state?: string; zipCode?: string };
  'tool:result': AIToolResult;
};

type EventCallback<T> = (data: T) => void;

class AIEventBus {
  private listeners: Map<string, Set<EventCallback<unknown>>> = new Map();

  on<K extends keyof AIEventMap>(event: K, callback: EventCallback<AIEventMap[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback<unknown>);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback as EventCallback<unknown>);
    };
  }

  emit<K extends keyof AIEventMap>(event: K, data: AIEventMap[K]): void {
    console.log(`[AI Events] Emitting ${event}:`, data);
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[AI Events] Error in listener for ${event}:`, error);
      }
    });
  }

  off<K extends keyof AIEventMap>(event: K, callback?: EventCallback<AIEventMap[K]>): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback as EventCallback<unknown>);
    } else {
      this.listeners.delete(event);
    }
  }
}

// Singleton instance
export const aiEventBus = new AIEventBus();
