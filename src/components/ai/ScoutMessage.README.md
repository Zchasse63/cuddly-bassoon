# ScoutMessage Component

A chat message component designed specifically for the Scout AI persona with Fluid OS glass styling and smooth animations.

## Overview

The `ScoutMessage` component displays chat messages with two distinct visual styles:
- **User messages**: Solid primary background, right-aligned with User icon
- **Scout (assistant) messages**: Glass card styling, left-aligned with animated ScoutOrb avatar

## Features

- **Fluid OS Design**: Uses `glass-card` class for authentic Fluid OS aesthetic
- **Smooth Animations**: Entrance animations with spring physics from `@/lib/animations`
- **Markdown Support**: Full markdown rendering for assistant messages using `react-markdown` and `remark-gfm`
- **Source Citations**: Displays clickable source cards with relevance scores
- **Streaming States**: Visual feedback during AI response generation
- **Copy Functionality**: Built-in copy button with feedback state
- **Responsive**: Adapts to different screen sizes with max-width constraints

## Installation

The component is already integrated into the AI components library. Import it from:

```tsx
import { ScoutMessage } from '@/components/ai';
// or
import { ScoutMessage } from '@/components/ai/ScoutMessage';
```

## Props

```typescript
interface ScoutMessageProps {
  role: 'user' | 'assistant';          // Message sender role
  content: string;                      // Message text (markdown for assistant)
  sources?: Array<{                     // Optional source citations
    slug: string;
    title: string;
    category: string;
    relevance: number;                  // 0-1 score
  }>;
  isStreaming?: boolean;                // Show "thinking" indicator
  onCopy?: (content: string) => void;   // Copy button callback
  isCopied?: boolean;                   // Copy success state
  className?: string;                   // Additional CSS classes
}
```

## Usage Examples

### Basic User Message

```tsx
<ScoutMessage
  role="user"
  content="What are the current market trends?"
/>
```

### Scout Response with Sources

```tsx
<ScoutMessage
  role="assistant"
  content="Based on recent data, the market is showing strong growth..."
  sources={[
    {
      slug: 'market-report-q4',
      title: 'Q4 Market Report',
      category: 'Market Analysis',
      relevance: 0.95
    }
  ]}
  onCopy={handleCopy}
  isCopied={isCopied}
/>
```

### Streaming State

```tsx
<ScoutMessage
  role="assistant"
  content="Let me analyze that for you..."
  isStreaming={true}
/>
```

### Markdown Content

```tsx
<ScoutMessage
  role="assistant"
  content={`
# Analysis Results

Here are the key findings:

- **Median Price**: $875,000
- **Days on Market**: 45 days

\`\`\`javascript
const data = { growth: '8.5%' };
\`\`\`
  `}
/>
```

## Drop-in Replacement for ChatMessage

The component can replace the existing `ChatMessage` component with minimal changes:

**Before:**
```tsx
<ChatMessage
  message={message}
  onCopy={handleCopy}
  isCopied={isCopied}
/>
```

**After:**
```tsx
<ScoutMessage
  role={message.role}
  content={message.content}
  sources={message.sources}
  isStreaming={message.isStreaming}
  onCopy={handleCopy}
  isCopied={isCopied}
/>
```

## Visual Design Details

### User Messages
- **Background**: Solid `bg-primary` with `text-primary-foreground`
- **Border Radius**: `rounded-2xl` with `rounded-tr-sm` (chat bubble style)
- **Avatar**: Circular icon with primary background
- **Animation**: Slides in from right with blur effect

### Scout (Assistant) Messages
- **Background**: `glass-card` class (translucent with backdrop blur)
- **Border Radius**: `rounded-2xl` with `rounded-tl-sm` (chat bubble style)
- **Avatar**: Animated `ScoutOrb` component
  - `idle` state: Gentle pulsing glow
  - `thinking` state: Active pulsing with increased intensity
- **Animation**: Slides in from left with blur effect
- **Code Blocks**: Uses `glass-subtle` background for syntax highlighting areas

### Source Cards
- **Background**: `glass-subtle` with hover to `glass-base`
- **Layout**: Icon, title, category, relevance badge, and external link indicator
- **Animation**: Staggered entrance with spring physics
- **Interaction**: Hover reveals external link icon

## Animations

The component uses Fluid OS animation primitives:

- **Message Entrance**: `springPresets.standard` with directional blur
- **Sources**: Delayed entrance with `springPresets.standard`
- **Streaming Indicator**: Pulsing dots with staggered timing
- **Copy Button**: `springPresets.smooth` for state transitions

## Accessibility

- Proper semantic HTML structure
- Keyboard-accessible buttons
- Focus states via Fluid OS utilities
- Alternative text for icons
- ARIA labels where appropriate

## Dependencies

- `framer-motion`: Animation library
- `react-markdown`: Markdown rendering
- `remark-gfm`: GitHub Flavored Markdown support
- `lucide-react`: Icon library
- `@/lib/animations`: Fluid OS animation primitives
- `@/components/ui/button`: Button component
- `@/components/ui/badge`: Badge component
- `@/components/ai/ScoutOrb`: Scout avatar component

## Related Components

- **ScoutOrb**: Animated avatar for Scout AI
- **ChatMessage**: Original chat message component (RAG)
- **EnhancedChatInterface**: Chat interface container
- **AIToolPalette**: Tool discovery system

## Design System Reference

This component implements:
- Fluid OS Glass Material System (Section 2)
- Spring Animation Primitives (Section 17.2)
- Scout AI Visual Language (Section 16)

See: `Fluid_Real_Estate_OS_Design_System.md`

## Browser Support

- Modern browsers with CSS backdrop-filter support
- Graceful degradation for older browsers
- Reduced motion support via `prefers-reduced-motion`

## Performance Notes

- Component is memoized with `React.memo`
- Animations respect reduced motion preferences
- Source cards render up to 3 by default (configurable)
- Markdown parsing is optimized for chat-length content

## Future Enhancements

- [ ] Voice input indicator for dictated messages
- [ ] Reaction/feedback buttons (thumbs up/down)
- [ ] Message threading for context
- [ ] Rich media support (images, charts)
- [ ] Export conversation functionality
- [ ] Real-time collaboration indicators
