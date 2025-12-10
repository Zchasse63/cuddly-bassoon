# Stores Directory

This directory contains Zustand state management stores for the Fluid Real Estate OS application.

## Available Stores

### 1. Property Filter Store
**File:** `propertyFilterStore.ts`

Manages property search filters, sort order, and map bounds with localStorage persistence.

**Features:**
- Active filters (bed/bath/price/equity/etc.)
- Search query and sort order
- Map bounds and center
- URL param synchronization
- Persists to localStorage

**Usage:**
```typescript
import { usePropertyFilterStore } from '@/stores/propertyFilterStore';

const { activeFilters, addFilter, removeFilter } = usePropertyFilterStore();
```

---

### 2. AI Result Store
**File:** `aiResultStore.ts`

Manages AI tool execution results, replacing the event bus pattern for reliable state management.

**Features:**
- Store all AI tool results with metadata
- Track acknowledgment status
- Fast lookups by tool name
- Selective subscriptions via subscribeWithSelector
- Full DevTools integration

**Usage:**
```typescript
import { useAIResultStore, useToolResult } from '@/stores/aiResultStore';

// Simple hook for single tool
const { result, acknowledge } = useToolResult('search-properties');

// Direct store access
const addResult = useAIResultStore((state) => state.addResult);
```

**Documentation:**
- [Migration Guide](./AI_RESULT_STORE_MIGRATION_GUIDE.md) - How to migrate from event bus
- [Usage Examples](./USAGE_EXAMPLES.md) - Common patterns and examples

---

## Architecture

### Why Zustand?

We use Zustand for client state management because:

1. **Simple API**: Less boilerplate than Redux
2. **TypeScript Support**: Full type inference
3. **DevTools**: Redux DevTools integration
4. **Middleware**: Persist, subscribeWithSelector, etc.
5. **Performance**: Selective re-renders via selectors
6. **No Context**: No provider wrapper needed

### Store Pattern

All stores follow this pattern:

```typescript
import { create } from 'zustand';
import { middleware } from 'zustand/middleware';

interface StoreState {
  // State
  data: SomeType;

  // Actions
  setData: (data: SomeType) => void;
  clearData: () => void;
}

export const useStore = create<StoreState>()(
  middleware((set, get) => ({
    data: initialValue,

    setData: (data) => set({ data }),
    clearData: () => set({ data: initialValue }),
  }))
);
```

### Middleware Usage

#### 1. Persist Middleware
For localStorage/sessionStorage persistence:

```typescript
import { persist } from 'zustand/middleware';

export const useStore = create<State>()(
  persist(
    (set, get) => ({ ... }),
    {
      name: 'store-name',
      partialize: (state) => ({ ... }), // Select what to persist
    }
  )
);
```

#### 2. SubscribeWithSelector Middleware
For granular subscriptions:

```typescript
import { subscribeWithSelector } from 'zustand/middleware';

export const useStore = create<State>()(
  subscribeWithSelector((set, get) => ({ ... }))
);

// Subscribe to specific value
useStore.subscribe(
  (state) => state.specificValue,
  (value) => console.log('Value changed:', value)
);
```

---

## Best Practices

### 1. Selective Subscriptions

```typescript
// ✅ GOOD - Only re-renders when specificValue changes
const value = useStore((state) => state.specificValue);

// ❌ BAD - Re-renders on any store change
const store = useStore();
const value = store.specificValue;
```

### 2. Memoize Selectors

```typescript
const selector = useMemo(
  () => (state: StoreState) => state.derivedValue,
  []
);
const value = useStore(selector);
```

### 3. Actions at Component Level

```typescript
// ✅ GOOD - Extract actions once
const { addItem, removeItem } = useStore();

// ❌ BAD - Re-subscribes on every render
onClick={() => useStore.getState().addItem(item)}
```

### 4. Access Outside React

```typescript
// Get state
const state = useStore.getState();

// Call actions
useStore.getState().setData(newData);

// Subscribe manually
const unsubscribe = useStore.subscribe(
  (state) => state.value,
  (value) => console.log(value)
);
```

---

## Server State vs Client State

### Use Zustand For (Client State):
- UI state (modals, panels, filters)
- Form state (temporary)
- Real-time updates (AI results, notifications)
- User preferences (theme, layout)

### Use TanStack Query For (Server State):
- API data (properties, deals, leads)
- Cached server responses
- Background refetching
- Optimistic updates with rollback

Example:
```typescript
// ✅ Client state - Zustand
const { isOpen, toggle } = useModalStore();

// ✅ Server state - TanStack Query
const { data: properties } = useQuery({
  queryKey: ['properties', filters],
  queryFn: () => fetchProperties(filters),
});
```

---

## Debugging

### 1. Redux DevTools

All Zustand stores work with Redux DevTools extension:

1. Install Redux DevTools browser extension
2. Open DevTools > Redux tab
3. See all actions and state changes
4. Time-travel debugging

### 2. Logging Middleware

For development logging:

```typescript
import { devtools } from 'zustand/middleware';

export const useStore = create<State>()(
  devtools(
    (set, get) => ({ ... }),
    { name: 'StoreName' }
  )
);
```

### 3. Manual Inspection

```typescript
// Log current state
console.log(useStore.getState());

// Log specific value
console.log(useStore.getState().specificValue);

// Subscribe and log changes
useStore.subscribe(
  (state) => state,
  (state) => console.log('State changed:', state)
);
```

---

## Testing

### Unit Testing Stores

```typescript
import { renderHook, act } from '@testing-library/react';
import { useStore } from '@/stores/store';

describe('Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useStore.getState().reset();
  });

  it('should update value', () => {
    const { result } = renderHook(() => useStore());

    act(() => {
      result.current.setValue('new value');
    });

    expect(result.current.value).toBe('new value');
  });
});
```

### Integration Testing

```typescript
import { render, screen } from '@testing-library/react';
import { useStore } from '@/stores/store';

// Mock store for testing
jest.mock('@/stores/store', () => ({
  useStore: jest.fn(),
}));

test('component uses store', () => {
  (useStore as jest.Mock).mockReturnValue({
    value: 'test value',
    setValue: jest.fn(),
  });

  render(<Component />);
  expect(screen.getByText('test value')).toBeInTheDocument();
});
```

---

## Future Stores

Potential stores to add:

1. **User Preferences Store** - Theme, layout, notifications
2. **Modal/Dialog Store** - Centralized modal management
3. **Notification Store** - Toast notifications, alerts
4. **Navigation Store** - Active panel, sidebar state
5. **Selection Store** - Multi-select state for properties/deals

---

## References

- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [ARCHITECTURE_SOURCE_OF_TRUTH.md](../../ARCHITECTURE_SOURCE_OF_TRUTH.md) - Section 4 (AI-to-UI Bridge)
- [propertyFilterStore.ts](./propertyFilterStore.ts) - Example store implementation
- [AI_RESULT_STORE_MIGRATION_GUIDE.md](./AI_RESULT_STORE_MIGRATION_GUIDE.md) - Event bus to Zustand migration
