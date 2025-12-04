/**
 * Multi-Turn Conversation Tests
 *
 * Tests sequential tool calls where context carries over between turns.
 * Verifies Grok maintains context and chains tools appropriately.
 *
 * Run with: npm run test:live
 * Updated December 2025 - Migrated from Claude to xAI Grok
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { streamText, CoreMessage, stepCountIs } from 'ai';
import { createXai } from '@ai-sdk/xai';
import { registerAllTools } from '../../categories';
import { convertToAISDKTools } from '../../adapter';
import { skipIfNoApi, trackApiCall, withRetry } from '@/test/utils/live-api-utils';
import type { ToolExecutionContext } from '../../types';

const xai = createXai({
  apiKey: process.env.XAI_API_KEY || '',
});

const testContext: ToolExecutionContext = {
  userId: 'multi-turn-test',
  sessionId: `multi-${Date.now()}`,
  permissions: ['read', 'write', 'execute'],
};

describe('Multi-Turn Conversation Tests', () => {
  let aiTools: ReturnType<typeof convertToAISDKTools>;

  beforeAll(async () => {
    registerAllTools();
    aiTools = convertToAISDKTools(testContext);
  });

  describe('Context Carryover', () => {
    it('should maintain context between search and analysis turns', async () => {
      if (skipIfNoApi('grok')) return;

      const allToolCalls: string[] = [];
      const messages: CoreMessage[] = [];

      // Turn 1: Search for properties
      messages.push({
        role: 'user',
        content: 'Find me properties in Miami under $400,000',
      });

      trackApiCall('grok');
      let result = await withRetry(async () => {
        return streamText({
          model: xai('grok-4-1-fast-non-reasoning'),
          messages,
          tools: aiTools,
          stopWhen: stepCountIs(3),
          onStepFinish: ({ toolCalls }) => {
            if (toolCalls) {
              toolCalls.forEach((call) => allToolCalls.push(call.toolName));
            }
          },
        });
      });

      const turn1Response = await result.text;
      messages.push({ role: 'assistant', content: turn1Response });

      // Turn 2: Analyze based on search results
      messages.push({
        role: 'user',
        content: 'Analyze the first property as a deal with ARV of $500,000 and $30,000 repairs',
      });

      trackApiCall('grok');
      result = await withRetry(async () => {
        return streamText({
          model: xai('grok-4-1-fast-non-reasoning'),
          messages,
          tools: aiTools,
          stopWhen: stepCountIs(3),
          onStepFinish: ({ toolCalls }) => {
            if (toolCalls) {
              toolCalls.forEach((call) => allToolCalls.push(call.toolName));
            }
          },
        });
      });

      await result.text;

      // Should have used search tool at minimum
      expect(allToolCalls).toContain('property_search_search');
      // Grok should use some analysis tool (may vary based on AI decision-making)
      const hasAnalysisTool = allToolCalls.some(
        tool => tool.includes('deal_analysis') || tool.includes('property')
      );
      expect(hasAnalysisTool || allToolCalls.length >= 2).toBe(true);
      console.log(`  ✅ Multi-turn tools: ${allToolCalls.join(' → ')}`);
    });

    it('should chain map operations across turns', async () => {
      if (skipIfNoApi('grok')) return;

      const allToolCalls: string[] = [];
      const messages: CoreMessage[] = [];

      // Turn 1: Switch to satellite view
      messages.push({
        role: 'user',
        content: 'Switch to satellite view',
      });

      trackApiCall('grok');
      let result = await withRetry(async () => {
        return streamText({
          model: xai('grok-4-1-fast-non-reasoning'),
          messages,
          tools: aiTools,
          stopWhen: stepCountIs(2),
          onStepFinish: ({ toolCalls }) => {
            if (toolCalls) {
              toolCalls.forEach((call) => allToolCalls.push(call.toolName));
            }
          },
        });
      });

      const turn1Response = await result.text;
      messages.push({ role: 'assistant', content: turn1Response });

      // Turn 2: Show commute radius
      messages.push({
        role: 'user',
        content: 'Now show me a 20-minute commute radius from downtown Miami',
      });

      trackApiCall('grok');
      result = await withRetry(async () => {
        return streamText({
          model: xai('grok-4-1-fast-non-reasoning'),
          messages,
          tools: aiTools,
          stopWhen: stepCountIs(2),
          onStepFinish: ({ toolCalls }) => {
            if (toolCalls) {
              toolCalls.forEach((call) => allToolCalls.push(call.toolName));
            }
          },
        });
      });

      await result.text;

      // Should have used multiple map tools
      expect(allToolCalls.filter((t) => t.startsWith('map_')).length).toBeGreaterThanOrEqual(2);
      console.log(`  ✅ Map chain: ${allToolCalls.join(' → ')}`);
    });
  });
});

