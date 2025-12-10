# AI Result Store Usage Examples

Quick reference for common usage patterns.

## Example 1: Writing Results (ScoutPane)

```typescript
// File: src/components/ai/ScoutPane.tsx
import { useAIResultStore } from '@/stores/aiResultStore';

export function ScoutPane() {
  const addResult = useAIResultStore((state) => state.addResult);

  useEffect(() => {
    messages.forEach((message) => {
      if (message.parts) {
        message.parts.forEach((part) => {
          if (part.type.startsWith('tool-') && (part as any).state === 'output-available') {
            const toolPart = part as ToolPart;

            addResult({
              id: toolPart.toolCallId || `${message.id}-${toolPart.toolName}`,
              toolName: toolPart.toolName,
              result: toolPart.output,
            });
          }
        });
      }
    });
  }, [messages, addResult]);
}
```

## Example 2: Simple Subscription (Property List)

```typescript
// File: src/app/(dashboard)/properties/split-view-client.tsx
import { useToolResult } from '@/stores/aiResultStore';

export function SplitViewClient() {
  const { result, acknowledge } = useToolResult('search-properties');

  useEffect(() => {
    if (result && !result.acknowledged) {
      console.log('Got search results:', result.result);
      // Update UI with results
      acknowledge();
    }
  }, [result]);
}
```

## Example 3: Map Marker Updates

```typescript
// File: src/components/map/MapContainer.tsx
import { useAIResultStore, selectLatestResultForTool } from '@/stores/aiResultStore';
import type { AIPropertySearchResult } from '@/lib/ai/events';

export function MapContainer() {
  const searchResult = useAIResultStore(selectLatestResultForTool('search-properties'));
  const acknowledgeResult = useAIResultStore((state) => state.acknowledgeResult);

  useEffect(() => {
    if (searchResult && !searchResult.acknowledged) {
      const properties = searchResult.result as AIPropertySearchResult;

      // Update map markers
      const markers = properties.properties.map(prop => ({
        lat: prop.latitude,
        lng: prop.longitude,
        data: prop,
      }));

      setMapMarkers(markers);
      acknowledgeResult(searchResult.id);
    }
  }, [searchResult, acknowledgeResult]);
}
```

## Example 4: Multiple Tools

```typescript
// File: src/components/properties/PropertyDetailPanel.tsx
import { useMultipleToolResults } from '@/stores/aiResultStore';

export function PropertyDetailPanel() {
  const results = useMultipleToolResults([
    'get-property-details',
    'get-comps',
    'get-owner-info',
  ]);

  const propertyDetails = results['get-property-details'];
  const comps = results['get-comps'];
  const ownerInfo = results['get-owner-info'];

  return (
    <div>
      {propertyDetails && <PropertyInfo data={propertyDetails.result} />}
      {comps && <CompsTable data={comps.result} />}
      {ownerInfo && <OwnerCard data={ownerInfo.result} />}
    </div>
  );
}
```

## Example 5: Debugging - Show All Results

```typescript
// File: src/components/debug/AIResultsDebugPanel.tsx
import { useAIResultStore } from '@/stores/aiResultStore';

export function AIResultsDebugPanel() {
  const results = useAIResultStore((state) => state.results);
  const unacknowledged = useAIResultStore((state) => state.getUnacknowledgedResults());

  return (
    <div className="p-4">
      <h3>AI Results Debug Panel</h3>
      <p>Total Results: {results.size}</p>
      <p>Unacknowledged: {unacknowledged.length}</p>

      <div className="space-y-2">
        {Array.from(results.values()).map((result) => (
          <div key={result.id} className="border p-2">
            <p><strong>{result.toolName}</strong></p>
            <p>Time: {new Date(result.timestamp).toLocaleTimeString()}</p>
            <p>Acknowledged: {result.acknowledged ? '✅' : '❌'}</p>
            <pre>{JSON.stringify(result.result, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Example 6: Clear Results on Logout

```typescript
// File: src/components/layout/AppShell.tsx
import { useAIResultStore } from '@/stores/aiResultStore';

export function AppShell() {
  const clearResults = useAIResultStore((state) => state.clearResults);

  const handleLogout = async () => {
    clearResults(); // Clear AI results
    await signOut(); // Sign out user
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

## Example 7: Tool Result History

```typescript
// File: src/components/ai/ToolResultHistory.tsx
import { useAIResultStore } from '@/stores/aiResultStore';

export function ToolResultHistory({ toolName }: { toolName: string }) {
  const getResultsForTool = useAIResultStore((state) => state.getResultsForTool);
  const history = getResultsForTool(toolName);

  return (
    <div>
      <h3>History for {toolName}</h3>
      <ul>
        {history.map((result) => (
          <li key={result.id}>
            {new Date(result.timestamp).toLocaleString()} -
            {result.acknowledged ? '✅' : '⏳'}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Example 8: Direct Store Access (Outside React)

```typescript
// File: src/lib/utils/aiResultUtils.ts
import { useAIResultStore } from '@/stores/aiResultStore';

// Get store state outside React component
export function getLatestSearchResult() {
  return useAIResultStore.getState().getLatestResult('search-properties');
}

// Add result from non-React context
export function addPropertySearchResult(properties: any[]) {
  useAIResultStore.getState().addResult({
    id: crypto.randomUUID(),
    toolName: 'search-properties',
    result: { properties, total: properties.length },
  });
}
```

## Performance Tips

### 1. Selective Subscriptions

```typescript
// ✅ GOOD - Only re-renders when this specific result changes
const searchResult = useAIResultStore(
  selectLatestResultForTool('search-properties')
);

// ❌ BAD - Re-renders on ANY store change
const store = useAIResultStore();
const searchResult = store.latestByTool.get('search-properties');
```

### 2. Shallow Comparison for Maps

```typescript
// ✅ GOOD - Using selector for specific value
const hasUnacknowledged = useAIResultStore(
  (state) => state.getUnacknowledgedResults().length > 0
);

// ❌ BAD - Map object changes on every update
const results = useAIResultStore((state) => state.results);
```

### 3. Memoize Selectors

```typescript
import { useMemo } from 'react';

const searchResult = useAIResultStore(
  useMemo(() => selectLatestResultForTool('search-properties'), [])
);
```
