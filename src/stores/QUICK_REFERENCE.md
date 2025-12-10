# AI Result Store - Quick Reference Card

## Import

```typescript
import {
  useAIResultStore,
  useToolResult,
  useMultipleToolResults,
  selectLatestResultForTool,
  type AIToolResult
} from '@/stores/aiResultStore';
```

---

## Writing Results (Producer)

### In ScoutPane.tsx - Add Tool Results

```typescript
const addResult = useAIResultStore((state) => state.addResult);

addResult({
  id: toolCallId,
  toolName: 'search-properties',
  result: toolOutput,
});
```

---

## Reading Results (Consumer)

### Pattern 1: Simple Hook (Recommended)

```typescript
const { result, acknowledge } = useToolResult('search-properties');

useEffect(() => {
  if (result && !result.acknowledged) {
    handleResult(result.result);
    acknowledge();
  }
}, [result]);
```

### Pattern 2: Direct Store Access

```typescript
const result = useAIResultStore(selectLatestResultForTool('search-properties'));
const acknowledgeResult = useAIResultStore((state) => state.acknowledgeResult);

useEffect(() => {
  if (result && !result.acknowledged) {
    handleResult(result.result);
    acknowledgeResult(result.id);
  }
}, [result]);
```

### Pattern 3: Multiple Tools

```typescript
const results = useMultipleToolResults([
  'search-properties',
  'get-property-details',
  'get-comps'
]);

const searchResult = results['search-properties'];
```

---

## Common Actions

```typescript
// Clear all results
const clearResults = useAIResultStore((state) => state.clearResults);
clearResults();

// Get unacknowledged results
const unacknowledged = useAIResultStore((state) => state.getUnacknowledgedResults());

// Get all results for a tool
const history = useAIResultStore((state) => state.getResultsForTool('search-properties'));

// Get latest result for a tool
const latest = useAIResultStore((state) => state.getLatestResult('search-properties'));
```

---

## Outside React

```typescript
// Get state
const state = useAIResultStore.getState();

// Add result
useAIResultStore.getState().addResult({ id, toolName, result });

// Acknowledge result
useAIResultStore.getState().acknowledgeResult(id);

// Clear results
useAIResultStore.getState().clearResults();
```

---

## Type Definition

```typescript
interface AIToolResult {
  id: string;               // Unique identifier
  toolName: string;         // Tool that produced result
  result: unknown;          // The actual result data
  timestamp: number;        // When result was added
  acknowledged: boolean;    // Has UI processed this?
}
```

---

## Migration from Event Bus

### Before (Event Bus)
```typescript
aiEventBus.emit('tool:result', { toolName, result });
aiEventBus.on('tool:result', (event) => { ... });
```

### After (Zustand Store)
```typescript
addResult({ id, toolName, result });
const { result, acknowledge } = useToolResult(toolName);
```

---

## DevTools

1. Install Redux DevTools browser extension
2. Open DevTools → Redux tab
3. See all results and actions
4. Time-travel debugging

---

## Common Tool Names

- `search-properties` - Property search results
- `get-property-details` - Single property details
- `get-comps` - Comparable properties
- `get-owner-info` - Owner information
- `apply-filter` - Filter results
- `get-market-velocity` - Market velocity data
- `skip-trace-owner` - Skip trace results

---

## Performance Tips

```typescript
// ✅ GOOD - Selective subscription
const result = useAIResultStore(selectLatestResultForTool('search-properties'));

// ❌ BAD - Subscribes to entire store
const store = useAIResultStore();
const result = store.latestByTool.get('search-properties');
```

---

## Files to Update for Migration

1. ✅ **src/stores/aiResultStore.ts** (CREATED)
2. ⚠️ **src/components/ai/ScoutPane.tsx** - Replace emit with addResult
3. ⚠️ **src/app/(dashboard)/properties/split-view-client.tsx** - Replace on with useToolResult
4. ⚠️ **src/components/map/MapContainer.tsx** - Replace event listeners
5. ⚠️ **Test files** - Update to use store

---

## Documentation

- [README.md](./README.md) - Overview and architecture
- [AI_RESULT_STORE_MIGRATION_GUIDE.md](./AI_RESULT_STORE_MIGRATION_GUIDE.md) - Full migration guide
- [USAGE_EXAMPLES.md](./USAGE_EXAMPLES.md) - Code examples
- [aiResultStore.ts](./aiResultStore.ts) - Source code with JSDoc
