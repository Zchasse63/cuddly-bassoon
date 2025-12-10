# AI Result Store Migration Guide

## Overview

This guide explains how to migrate from the event bus pattern (`src/lib/ai/events.ts`) to the new Zustand store pattern (`src/stores/aiResultStore.ts`).

**Source:** `ARCHITECTURE_SOURCE_OF_TRUTH.md` Section 4 (AI-to-UI Bridge Fix)

## Why Migrate?

| Aspect | Event Bus (OLD) | Zustand Store (NEW) |
|--------|----------------|---------------------|
| State Persistence | None - events are fire-and-forget | Full state tree available |
| Late Subscribers | Miss events if they mount after emission | Get current state immediately |
| DevTools | None | Full Zustand devtools support |
| Debugging | Difficult to inspect state | Easy inspection of all results |
| Type Safety | Weak typing | Full TypeScript support |
| Race Conditions | useEffect processes after render cycle | Synchronous state updates |

## Migration Steps

### Step 1: Import the New Store

**Before (Event Bus):**
```typescript
import { aiEventBus } from '@/lib/ai/events';
```

**After (Zustand Store):**
```typescript
import { useAIResultStore, useToolResult } from '@/stores/aiResultStore';
```

---

### Step 2: Writing Results (Producer Pattern)

#### In ScoutPane.tsx

**Before (Event Bus):**
```typescript
// File: src/components/ai/ScoutPane.tsx:307-310
aiEventBus.emit('tool:result', {
  toolName,
  result: toolPart.output,
});
```

**After (Zustand Store):**
```typescript
// Add at top of component
const addResult = useAIResultStore((state) => state.addResult);

// Replace emit with:
addResult({
  id: toolPart.toolCallId || `${message.id}-${toolName}`,
  toolName,
  result: toolPart.output,
});
```

**Complete Implementation Example:**
```typescript
// File: src/components/ai/ScoutPane.tsx

import { useAIResultStore } from '@/stores/aiResultStore';

export function ScoutPane() {
  const addResult = useAIResultStore((state) => state.addResult);
  const processedToolCallIds = useRef(new Set<string>());

  useEffect(() => {
    messages.forEach((message) => {
      // 1. Check standard message parts (Vercel AI SDK UI)
      if (message.parts) {
        message.parts.forEach((part) => {
          if (
            part.type.startsWith('tool-') &&
            (part as any).state === 'output-available' &&
            (part as any).output
          ) {
            const toolPart = part as ToolPart;
            const id = toolPart.toolCallId || `${message.id}-${toolPart.toolName}`;

            if (!processedToolCallIds.current.has(id)) {
              const toolName = toolPart.toolName || part.type.replace('tool-', '');

              // NEW: Add to store instead of emit
              addResult({
                id,
                toolName,
                result: toolPart.output,
              });

              processedToolCallIds.current.add(id);
            }
          }
        });
      }

      // 2. Fallback: Check toolInvocations
      if ((message as any).toolInvocations) {
        (message as any).toolInvocations.forEach((toolInv: any) => {
          if (toolInv.state === 'result') {
            const id = toolInv.toolCallId;
            if (!processedToolCallIds.current.has(id)) {

              // NEW: Add to store instead of emit
              addResult({
                id,
                toolName: toolInv.toolName,
                result: toolInv.result,
              });

              processedToolCallIds.current.add(id);
            }
          }
        });
      }
    });
  }, [messages, addResult]);

  // ... rest of component
}
```

---

### Step 3: Reading Results (Consumer Pattern)

#### Pattern A: Simple Tool Result Subscription

**Before (Event Bus):**
```typescript
// File: src/app/(dashboard)/properties/split-view-client.tsx:153
useEffect(() => {
  const unsubscribe = aiEventBus.on('tool:result', (event) => {
    if (event.toolName === 'search-properties') {
      handleSearchResults(event.result);
    }
  });

  return unsubscribe;
}, []);
```

**After (Zustand Store) - Option 1: Using useToolResult hook:**
```typescript
import { useToolResult } from '@/stores/aiResultStore';

// Inside component
const { result, acknowledge } = useToolResult('search-properties');

useEffect(() => {
  if (result && !result.acknowledged) {
    handleSearchResults(result.result);
    acknowledge();
  }
}, [result]);
```

**After (Zustand Store) - Option 2: Direct store access:**
```typescript
import { useAIResultStore, selectLatestResultForTool } from '@/stores/aiResultStore';

// Inside component
const searchResult = useAIResultStore(selectLatestResultForTool('search-properties'));
const acknowledgeResult = useAIResultStore((state) => state.acknowledgeResult);

useEffect(() => {
  if (searchResult && !searchResult.acknowledged) {
    handleSearchResults(searchResult.result);
    acknowledgeResult(searchResult.id);
  }
}, [searchResult]);
```

#### Pattern B: Multiple Tool Subscriptions

**Before (Event Bus):**
```typescript
useEffect(() => {
  const unsubscribe = aiEventBus.on('tool:result', (event) => {
    switch (event.toolName) {
      case 'search-properties':
        handleSearchResults(event.result);
        break;
      case 'get-property-details':
        handlePropertyDetails(event.result);
        break;
      case 'apply-filter':
        handleFilterResults(event.result);
        break;
    }
  });

  return unsubscribe;
}, []);
```

**After (Zustand Store):**
```typescript
import { useMultipleToolResults } from '@/stores/aiResultStore';

// Inside component
const results = useMultipleToolResults([
  'search-properties',
  'get-property-details',
  'apply-filter'
]);

useEffect(() => {
  const searchResult = results['search-properties'];
  if (searchResult && !searchResult.acknowledged) {
    handleSearchResults(searchResult.result);
    useAIResultStore.getState().acknowledgeResult(searchResult.id);
  }
}, [results['search-properties']]);

useEffect(() => {
  const detailsResult = results['get-property-details'];
  if (detailsResult && !detailsResult.acknowledged) {
    handlePropertyDetails(detailsResult.result);
    useAIResultStore.getState().acknowledgeResult(detailsResult.id);
  }
}, [results['get-property-details']]);

useEffect(() => {
  const filterResult = results['apply-filter'];
  if (filterResult && !filterResult.acknowledged) {
    handleFilterResults(filterResult.result);
    useAIResultStore.getState().acknowledgeResult(filterResult.id);
  }
}, [results['apply-filter']]);
```

#### Pattern C: MapContainer - Update Markers

**Before (Event Bus):**
```typescript
// File: src/components/map/MapContainer.tsx
useEffect(() => {
  const unsubscribe = aiEventBus.on('tool:result', (event) => {
    if (event.toolName === 'search-properties') {
      const properties = event.result as AIPropertySearchResult;
      updateMapMarkers(properties.properties);
    }
  });

  return unsubscribe;
}, []);
```

**After (Zustand Store):**
```typescript
import { useAIResultStore, selectLatestResultForTool } from '@/stores/aiResultStore';
import type { AIPropertySearchResult } from '@/lib/ai/events'; // Keep type

// Inside component
const searchResult = useAIResultStore(selectLatestResultForTool('search-properties'));
const acknowledgeResult = useAIResultStore((state) => state.acknowledgeResult);

useEffect(() => {
  if (searchResult && !searchResult.acknowledged) {
    const properties = searchResult.result as AIPropertySearchResult;
    updateMapMarkers(properties.properties);
    acknowledgeResult(searchResult.id);
  }
}, [searchResult]);
```

---

### Step 4: Testing

#### Update Test Files

**Before (Event Bus):**
```typescript
// File: src/lib/ai/tools/__tests__/integration/emitToolResults-live.test.ts:59
aiEventBus.emit('tool:result', {
  toolName: call.toolName,
  result: call.result,
});
```

**After (Zustand Store):**
```typescript
import { useAIResultStore } from '@/stores/aiResultStore';

// In test setup
const addResult = useAIResultStore.getState().addResult;

// When emitting results
addResult({
  id: crypto.randomUUID(),
  toolName: call.toolName,
  result: call.result,
});
```

**Listening in Tests:**
```typescript
// Before
const emittedEvents: any[] = [];
aiEventBus.on('tool:result', (event) => {
  emittedEvents.push(event);
});

// After
const { getUnacknowledgedResults } = useAIResultStore.getState();

// Check results
const unacknowledged = getUnacknowledgedResults();
expect(unacknowledged).toHaveLength(expectedCount);
```

---

## Advanced Usage

### DevTools Integration

The Zustand store automatically integrates with Redux DevTools. To enable:

1. Install Redux DevTools extension in your browser
2. Results will appear in the DevTools as actions
3. You can inspect the full state tree and time-travel debug

### Clearing Results

Clear all results when:
- User logs out
- Chat session ends
- User manually clears history

```typescript
const clearResults = useAIResultStore((state) => state.clearResults);

// On logout
const handleLogout = () => {
  clearResults();
  // ... other logout logic
};
```

### Getting All Results for a Tool

Useful for debugging or showing history:

```typescript
const getAllSearchResults = () => {
  const results = useAIResultStore.getState().getResultsForTool('search-properties');
  console.log('Search history:', results);
};
```

---

## Files to Update

### High Priority (Blocking)

1. **src/components/ai/ScoutPane.tsx** (Lines 289-335)
   - Replace `aiEventBus.emit()` with `addResult()`

2. **src/app/(dashboard)/properties/split-view-client.tsx** (Line 153)
   - Replace `aiEventBus.on()` with `useToolResult()` or `useAIResultStore()`

3. **src/components/map/MapContainer.tsx**
   - Replace event listeners with store subscriptions

### Medium Priority (Tests)

4. **src/lib/ai/tools/__tests__/integration/emitToolResults-live.test.ts**
   - Update to use store instead of event bus

5. **src/lib/ai/tools/__tests__/integration/all-tools-live.test.ts**
   - Update to use store instead of event bus

6. **src/test/components/ai/emitToolResults.test.tsx**
   - Update to use store instead of event bus

### Low Priority (Cleanup)

7. **src/lib/ai/events.ts**
   - Can be removed after migration is complete
   - Keep `AIPropertySearchResult` type for now (re-export from store if needed)

---

## Type Compatibility

The store maintains compatibility with existing event types:

```typescript
// OLD types from events.ts
export type AIPropertySearchResult = { ... };
export type AIToolResult = { ... };

// NEW store uses compatible interface
export interface AIToolResult {
  id: string;
  toolName: string;
  result: unknown;  // Same as old AIToolResult.result
  timestamp: number;
  acknowledged: boolean;
}
```

You can continue using `AIPropertySearchResult` from `events.ts` for now. Consider moving it to a shared types file later.

---

## Rollback Plan

If issues occur during migration:

1. The event bus (`src/lib/ai/events.ts`) can remain alongside the store temporarily
2. Components can be migrated one at a time
3. Both systems can coexist during transition period
4. To dual-write: emit to both event bus AND store during transition

```typescript
// Dual-write pattern (temporary during migration)
const addResult = useAIResultStore((state) => state.addResult);

// Write to both
addResult({ id, toolName, result });
aiEventBus.emit('tool:result', { toolName, result });
```

---

## Benefits After Migration

1. **No More Race Conditions**: Components that mount late get current state
2. **Better Debugging**: Redux DevTools show full history
3. **Cleaner Code**: No manual subscribe/unsubscribe lifecycle
4. **Type Safety**: Full TypeScript inference
5. **Performance**: Selective re-renders with `subscribeWithSelector`

---

## Questions?

Refer to:
- `ARCHITECTURE_SOURCE_OF_TRUTH.md` Section 4
- `src/stores/aiResultStore.ts` JSDoc comments
- `src/stores/propertyFilterStore.ts` for another Zustand example
