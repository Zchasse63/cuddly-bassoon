/**
 * ScoutMessage Component - Usage Examples
 *
 * This file demonstrates how to use the ScoutMessage component
 * as a drop-in replacement for the existing ChatMessage component.
 */

'use client';

import { useState } from 'react';
import { ScoutMessage } from './ScoutMessage';

export function ScoutMessageExamples() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">ScoutMessage Component Examples</h1>

      {/* Example 1: User Message */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Example 1: User Message</h2>
        <ScoutMessage
          role="user"
          content="What are the current market trends in downtown Seattle?"
        />
      </div>

      {/* Example 2: Assistant Message (Simple) */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Example 2: Scout Response</h2>
        <ScoutMessage
          role="assistant"
          content="Based on recent data, downtown Seattle's real estate market is showing strong growth with median prices up 8.5% year-over-year. The inventory is relatively tight with an average of 45 days on market."
          onCopy={(content) => handleCopy(content, 'msg-1')}
          isCopied={copiedId === 'msg-1'}
        />
      </div>

      {/* Example 3: Assistant Message with Sources */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Example 3: Scout Response with Sources</h2>
        <ScoutMessage
          role="assistant"
          content="# Market Analysis

The downtown Seattle market is experiencing robust growth across multiple metrics:

- **Median Sale Price**: $875,000 (+8.5% YoY)
- **Average Days on Market**: 45 days
- **Inventory Level**: 2.1 months (tight market)
- **Price per Square Foot**: $685

## Key Insights

1. Strong demand from tech workers
2. Limited new construction due to zoning
3. Increased investor activity in condos"
          sources={[
            {
              slug: 'seattle-market-report-q4-2024',
              title: 'Seattle Market Report Q4 2024',
              category: 'Market Analysis',
              relevance: 0.95,
            },
            {
              slug: 'downtown-seattle-trends',
              title: 'Downtown Seattle Real Estate Trends',
              category: 'Local Markets',
              relevance: 0.89,
            },
            {
              slug: 'pacific-northwest-overview',
              title: 'Pacific Northwest Market Overview',
              category: 'Regional Analysis',
              relevance: 0.76,
            },
          ]}
          onCopy={(content) => handleCopy(content, 'msg-2')}
          isCopied={copiedId === 'msg-2'}
        />
      </div>

      {/* Example 4: Streaming Message */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Example 4: Scout Thinking (Streaming)</h2>
        <ScoutMessage
          role="assistant"
          content="Let me analyze the market data for you..."
          isStreaming={true}
        />
      </div>

      {/* Example 5: Conversation Flow */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Example 5: Conversation Flow</h2>
        <div className="space-y-4">
          <ScoutMessage
            role="user"
            content="Show me properties with high equity potential in Queen Anne"
          />
          <ScoutMessage
            role="assistant"
            content="I've found **15 properties** in Queen Anne with high equity potential. Here's what I'm analyzing:

```javascript
// Property Analysis Criteria
const criteria = {
  location: 'Queen Anne',
  equityPotential: 'high',
  priceRange: [500000, 1500000],
  daysOnMarket: { max: 60 }
};
```

The top 3 properties show appreciation potential of 12-18% over the next 2 years based on neighborhood trends and planned developments."
            sources={[
              {
                slug: 'queen-anne-market-analysis',
                title: 'Queen Anne Market Analysis',
                category: 'Neighborhood Reports',
                relevance: 0.92,
              },
            ]}
            onCopy={(content) => handleCopy(content, 'msg-3')}
            isCopied={copiedId === 'msg-3'}
          />
          <ScoutMessage
            role="user"
            content="Can you show me the top 3?"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Drop-in Replacement Usage:
 *
 * Before (with ChatMessage):
 * ```tsx
 * <ChatMessage
 *   message={message}
 *   onCopy={handleCopy}
 *   isCopied={isCopied}
 * />
 * ```
 *
 * After (with ScoutMessage):
 * ```tsx
 * <ScoutMessage
 *   role={message.role}
 *   content={message.content}
 *   sources={message.sources}
 *   isStreaming={message.isStreaming}
 *   onCopy={handleCopy}
 *   isCopied={isCopied}
 * />
 * ```
 */
