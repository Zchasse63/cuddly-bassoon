# Migration Guide: ChatMessage → ScoutMessage

This guide helps you migrate from the existing `ChatMessage` component to the new `ScoutMessage` component with Scout AI persona styling.

## Quick Comparison

| Feature | ChatMessage | ScoutMessage |
|---------|-------------|--------------|
| **Styling** | Basic muted background | Glass card with Fluid OS aesthetics |
| **Avatar** | Simple Bot icon | Animated ScoutOrb with states |
| **Animation** | None | Spring physics entrance animations |
| **Streaming** | Not supported | Visual "thinking" indicator |
| **Sources** | Basic cards | Glass cards with hover effects |
| **Markdown** | Basic prose | Enhanced with glass code blocks |

## Key Differences

### 1. Props Structure

**ChatMessage** uses a message object:
```tsx
interface ChatMessageProps {
  message: RAGMessage;  // Single message object
  onCopy?: (content: string) => void;
  isCopied?: boolean;
}
```

**ScoutMessage** uses individual props:
```tsx
interface ScoutMessageProps {
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ slug, title, category, relevance }>;
  isStreaming?: boolean;
  onCopy?: (content: string) => void;
  isCopied?: boolean;
  className?: string;
}
```

### 2. Visual Styling

**ChatMessage:**
- User: `bg-primary text-primary-foreground`
- Assistant: `bg-muted`
- No animations

**ScoutMessage:**
- User: `bg-primary text-primary-foreground` (same)
- Assistant: `glass-card` (translucent glass effect)
- Smooth entrance animations with spring physics

### 3. Avatar Component

**ChatMessage:**
- User: `<User />` icon in colored circle
- Assistant: `<Bot />` icon in muted circle

**ScoutMessage:**
- User: `<User />` icon in colored circle (same)
- Assistant: `<ScoutOrb />` animated orb with multiple states

## Migration Steps

### Step 1: Update Imports

**Before:**
```tsx
import { ChatMessage } from '@/components/rag/ChatMessage';
```

**After:**
```tsx
import { ScoutMessage } from '@/components/ai/ScoutMessage';
// or
import { ScoutMessage } from '@/components/ai';
```

### Step 2: Restructure Props

**Before:**
```tsx
<ChatMessage
  message={{
    role: 'assistant',
    content: 'Response text...',
    sources: [...],
    cached: true
  }}
  onCopy={handleCopy}
  isCopied={isCopied}
/>
```

**After:**
```tsx
<ScoutMessage
  role="assistant"
  content="Response text..."
  sources={[...]}
  onCopy={handleCopy}
  isCopied={isCopied}
/>
```

### Step 3: Handle Streaming State

**Before:**
```tsx
// No built-in streaming support
{isLoading && <LoadingSpinner />}
<ChatMessage message={message} />
```

**After:**
```tsx
<ScoutMessage
  role="assistant"
  content={partialContent}
  isStreaming={true}  // Shows "Scout is thinking..." indicator
/>
```

### Step 4: Update Type Definitions

**Before:**
```tsx
import type { RAGMessage } from '@/hooks/use-rag-chat';

const messages: RAGMessage[] = [...];
```

**After:**
```tsx
import type { ScoutMessageProps } from '@/components/ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: ScoutMessageProps['sources'];
  isStreaming?: boolean;
}

const messages: Message[] = [...];
```

## Code Examples

### Example 1: Simple Chat List

**Before:**
```tsx
function ChatList({ messages }: { messages: RAGMessage[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {messages.map((message, idx) => (
        <ChatMessage
          key={idx}
          message={message}
          onCopy={(content) => {
            navigator.clipboard.writeText(content);
            setCopiedId(idx.toString());
          }}
          isCopied={copiedId === idx.toString()}
        />
      ))}
    </div>
  );
}
```

**After:**
```tsx
function ChatList({ messages }: { messages: Message[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {messages.map((message, idx) => (
        <ScoutMessage
          key={idx}
          role={message.role}
          content={message.content}
          sources={message.sources}
          isStreaming={message.isStreaming}
          onCopy={(content) => {
            navigator.clipboard.writeText(content);
            setCopiedId(idx.toString());
          }}
          isCopied={copiedId === idx.toString()}
        />
      ))}
    </div>
  );
}
```

### Example 2: Streaming Response

**Before:**
```tsx
function StreamingChat() {
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <div>
      {/* Previous messages */}
      {isStreaming && (
        <div className="flex items-center gap-2">
          <Loader className="animate-spin" />
          <p>{streamingMessage}</p>
        </div>
      )}
    </div>
  );
}
```

**After:**
```tsx
function StreamingChat() {
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  return (
    <div className="space-y-4">
      {/* Previous messages */}
      {isStreaming && (
        <ScoutMessage
          role="assistant"
          content={streamingMessage}
          isStreaming={true}  // Shows thinking indicator + pulsing orb
        />
      )}
    </div>
  );
}
```

### Example 3: With RAG Sources

**Before:**
```tsx
const message: RAGMessage = {
  role: 'assistant',
  content: 'Market analysis...',
  sources: [
    {
      slug: 'market-report',
      title: 'Q4 Report',
      category: 'Analysis',
      relevance: 0.95
    }
  ]
};

<ChatMessage message={message} />
```

**After:**
```tsx
<ScoutMessage
  role="assistant"
  content="Market analysis..."
  sources={[
    {
      slug: 'market-report',
      title: 'Q4 Report',
      category: 'Analysis',
      relevance: 0.95
    }
  ]}
/>
```

## Adapter Pattern (Gradual Migration)

If you need to support both components during migration:

```tsx
type MessageComponentProps = {
  message: RAGMessage;
  onCopy?: (content: string) => void;
  isCopied?: boolean;
  useScoutStyling?: boolean;  // Feature flag
};

function AdaptiveMessage({
  message,
  onCopy,
  isCopied,
  useScoutStyling = false
}: MessageComponentProps) {
  if (useScoutStyling) {
    return (
      <ScoutMessage
        role={message.role}
        content={message.content}
        sources={message.sources}
        onCopy={onCopy}
        isCopied={isCopied}
      />
    );
  }

  return (
    <ChatMessage
      message={message}
      onCopy={onCopy}
      isCopied={isCopied}
    />
  );
}
```

## Feature Mapping

| ChatMessage Feature | ScoutMessage Equivalent |
|---------------------|------------------------|
| `message.role` | `role` prop |
| `message.content` | `content` prop |
| `message.sources` | `sources` prop |
| `message.cached` | Not supported (can add if needed) |
| Loading state | `isStreaming` prop |
| Copy button | `onCopy` + `isCopied` props |
| Markdown rendering | Built-in with enhanced styling |

## Styling Differences

### Glass Effect
ScoutMessage uses `glass-card` class which provides:
- Translucent background with backdrop blur
- Light border with shadow simulation
- Subtle elevation with box-shadow

### Animations
ScoutMessage includes:
- Entrance animations (slide + blur)
- Spring physics transitions
- Pulsing orb for streaming state
- Staggered source card reveals

### Code Blocks
ScoutMessage applies `glass-subtle` background to code blocks:
```tsx
// ChatMessage: standard prose styling
prose prose-sm

// ScoutMessage: glass-enhanced styling
prose prose-sm prose-code:glass-subtle prose-pre:glass-subtle
```

## Browser Compatibility

ScoutMessage requires:
- CSS `backdrop-filter` support (for glass effect)
- Modern browser with ES6+ support
- Framer Motion compatibility

Fallback: Glass effects gracefully degrade to solid backgrounds in older browsers.

## Performance Considerations

- ScoutMessage is memoized with `React.memo`
- Animations are optimized with Framer Motion
- Respects `prefers-reduced-motion` user preference
- Source cards limited to 3 by default (prevents render bloat)

## Testing Updates

Update your tests to match new prop structure:

**Before:**
```tsx
render(<ChatMessage message={mockMessage} />);
```

**After:**
```tsx
render(
  <ScoutMessage
    role={mockMessage.role}
    content={mockMessage.content}
  />
);
```

## Rollback Strategy

If you need to revert:
1. Keep ChatMessage component in codebase
2. Use adapter pattern during transition
3. Feature flag new component per route/feature
4. Monitor performance and user feedback

## Additional Resources

- Component Documentation: `ScoutMessage.README.md`
- Usage Examples: `ScoutMessage.example.tsx`
- Design System: `Fluid_Real_Estate_OS_Design_System.md`
- Animation System: `/src/lib/animations.ts`

## Need Help?

Common issues:
1. **Glass effect not showing**: Verify `fluid-glass.css` is imported
2. **Animations not working**: Check Framer Motion version compatibility
3. **Sources not rendering**: Ensure proper source array structure
4. **Orb not animating**: Verify ScoutOrb component is properly imported

## Checklist

- [ ] Update imports from ChatMessage to ScoutMessage
- [ ] Destructure message object to individual props
- [ ] Add `isStreaming` prop for loading states
- [ ] Test markdown rendering with code blocks
- [ ] Verify glass effects in target browsers
- [ ] Check animation performance
- [ ] Update TypeScript types
- [ ] Update unit tests
- [ ] Verify accessibility (keyboard nav, screen readers)
- [ ] Test with reduced motion preference
