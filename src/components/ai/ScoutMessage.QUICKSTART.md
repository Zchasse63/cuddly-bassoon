# ScoutMessage - Quick Start Guide

Get started with the ScoutMessage component in 5 minutes.

## Installation

The component is already installed and ready to use.

## Import

```tsx
import { ScoutMessage } from '@/components/ai';
```

## Basic Usage

### 1. User Message
```tsx
<ScoutMessage
  role="user"
  content="What are the current market trends?"
/>
```

### 2. Scout Response
```tsx
<ScoutMessage
  role="assistant"
  content="Based on recent data, the market is showing strong growth with median prices up 8.5% year-over-year."
/>
```

### 3. With Sources
```tsx
<ScoutMessage
  role="assistant"
  content="The downtown Seattle market is experiencing robust growth..."
  sources={[
    {
      slug: 'market-report-q4',
      title: 'Q4 Market Report',
      category: 'Market Analysis',
      relevance: 0.95
    }
  ]}
/>
```

### 4. Streaming State
```tsx
<ScoutMessage
  role="assistant"
  content="Let me analyze that..."
  isStreaming={true}
/>
```

### 5. With Copy Functionality
```tsx
const [copiedId, setCopiedId] = useState<string | null>(null);

<ScoutMessage
  role="assistant"
  content="Your response here..."
  onCopy={(content) => {
    navigator.clipboard.writeText(content);
    setCopiedId('msg-1');
    setTimeout(() => setCopiedId(null), 2000);
  }}
  isCopied={copiedId === 'msg-1'}
/>
```

## Complete Chat Example

```tsx
'use client';

import { useState } from 'react';
import { ScoutMessage } from '@/components/ai';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    slug: string;
    title: string;
    category: string;
    relevance: number;
  }>;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'user',
      content: 'Show me properties in downtown Seattle'
    },
    {
      id: '2',
      role: 'assistant',
      content: 'I found 15 properties in downtown Seattle. Here are the top listings...',
      sources: [
        {
          slug: 'seattle-listings',
          title: 'Seattle Property Listings',
          category: 'Real Estate',
          relevance: 0.95
        }
      ]
    }
  ]);

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {messages.map((message) => (
        <ScoutMessage
          key={message.id}
          role={message.role}
          content={message.content}
          sources={message.sources}
          onCopy={(content) => handleCopy(content, message.id)}
          isCopied={copiedId === message.id}
        />
      ))}
    </div>
  );
}
```

## Markdown Support

ScoutMessage automatically renders markdown for assistant messages:

```tsx
<ScoutMessage
  role="assistant"
  content={`
# Market Analysis

Key findings:
- **Median Price**: $875,000 (+8.5% YoY)
- **Days on Market**: 45 days
- **Price per Sq Ft**: $685

## Code Example

\`\`\`javascript
const analysis = {
  growth: '8.5%',
  inventory: '2.1 months'
};
\`\`\`

This indicates a *tight market* with strong demand.
  `}
/>
```

## Props Reference

```typescript
interface ScoutMessageProps {
  // Required
  role: 'user' | 'assistant';
  content: string;

  // Optional
  sources?: Array<{
    slug: string;        // URL slug for the document
    title: string;       // Display title
    category: string;    // Document category
    relevance: number;   // 0-1 relevance score
  }>;
  isStreaming?: boolean;  // Show "thinking" indicator
  onCopy?: (content: string) => void;
  isCopied?: boolean;
  className?: string;
}
```

## Visual Features

### User Messages
- Solid primary background (blue)
- Right-aligned
- User icon avatar
- Slides in from right

### Scout Messages
- Glass card effect (translucent)
- Left-aligned
- Animated ScoutOrb avatar
- Slides in from left
- Markdown rendering
- Source citations
- Copy button

## Common Patterns

### Loading State
```tsx
const [isLoading, setIsLoading] = useState(false);

{isLoading && (
  <ScoutMessage
    role="assistant"
    content="Analyzing your request..."
    isStreaming={true}
  />
)}
```

### Error Handling
```tsx
{error && (
  <ScoutMessage
    role="assistant"
    content={`I encountered an error: ${error.message}`}
  />
)}
```

### Dynamic Updates
```tsx
const [response, setResponse] = useState('');
const [streaming, setStreaming] = useState(true);

// During streaming
<ScoutMessage
  role="assistant"
  content={response}
  isStreaming={streaming}
/>

// After complete
useEffect(() => {
  if (responseComplete) {
    setStreaming(false);
  }
}, [responseComplete]);
```

## Styling Tips

### Custom Styling
```tsx
<ScoutMessage
  role="assistant"
  content="Custom styled message"
  className="my-custom-class"
/>
```

### Layout Container
```tsx
<div className="flex flex-col gap-4 max-w-4xl mx-auto p-6">
  {messages.map((msg) => (
    <ScoutMessage key={msg.id} {...msg} />
  ))}
</div>
```

### Scrollable Chat
```tsx
<div className="flex flex-col gap-4 h-[600px] overflow-y-auto p-4">
  {messages.map((msg) => (
    <ScoutMessage key={msg.id} {...msg} />
  ))}
  <div ref={scrollRef} /> {/* Auto-scroll anchor */}
</div>
```

## Performance Tips

1. **Memoization**: Component is already memoized
2. **Key Props**: Use stable IDs for message keys
3. **Source Limit**: Only first 3 sources are displayed
4. **Lazy Loading**: Load messages in batches for long conversations

## Next Steps

- See `ScoutMessage.README.md` for full documentation
- Check `ScoutMessage.example.tsx` for more examples
- Read `MIGRATION_ChatMessage_to_ScoutMessage.md` to replace existing components

## Need Help?

Common issues:
- **No glass effect**: Ensure `fluid-glass.css` is imported
- **No animation**: Check Framer Motion is installed
- **Markdown not rendering**: Verify `react-markdown` and `remark-gfm` are installed
- **ScoutOrb not found**: Component should be at `@/components/ai/ScoutOrb`

---

**That's it!** You're ready to use ScoutMessage in your application.
