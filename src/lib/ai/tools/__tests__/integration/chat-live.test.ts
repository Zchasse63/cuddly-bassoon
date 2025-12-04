/**
 * Live Chat Endpoint Tests
 *
 * Tests real xAI Grok AI making tool decisions through the /api/ai/chat endpoint.
 * Verifies that Grok correctly interprets natural language and selects appropriate tools.
 *
 * Run with: npm run test:live
 * Updated December 2025 - Migrated from Claude to xAI Grok
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { streamText, stepCountIs } from 'ai';
import { createXai } from '@ai-sdk/xai';
import { registerAllTools } from '../../categories';
import { convertToAISDKTools } from '../../adapter';
import {
  skipIfNoApi,
  trackApiCall,
  withRetry,
} from '@/test/utils/live-api-utils';
import type { ToolExecutionContext } from '../../types';

const xai = createXai({
  apiKey: process.env.XAI_API_KEY || '',
});

const testContext: ToolExecutionContext = {
  userId: 'chat-integration-test',
  sessionId: `chat-${Date.now()}`,
  permissions: ['read', 'write', 'execute'],
};

describe('Live Chat Endpoint Tests', () => {
  let aiTools: ReturnType<typeof convertToAISDKTools>;

  beforeAll(async () => {
    registerAllTools();
    aiTools = convertToAISDKTools(testContext);
    console.log(`\n🤖 Testing xAI Grok with ${Object.keys(aiTools).length} tools\n`);
  });

  describe('Grok Tool Selection', () => {
    it('should select property_search tool for search queries', async () => {
      if (skipIfNoApi('grok')) return;

      trackApiCall('grok');

      const toolCalls: string[] = [];

      const result = await withRetry(async () => {
        return streamText({
          model: xai('grok-4-1-fast-non-reasoning'),
          messages: [
            { role: 'user', content: 'Search for properties in Miami, FL under $500,000' },
          ],
          tools: aiTools,
          stopWhen: stepCountIs(3),
          onStepFinish: ({ toolCalls: calls }) => {
            if (calls) {
              calls.forEach((call) => toolCalls.push(call.toolName));
            }
          },
        });
      });

      // Consume the stream
      await result.text;

      expect(toolCalls).toContain('property_search_search');
      console.log(`  ✅ Grok selected: ${toolCalls.join(', ')}`);
    });

    it('should select deal_analysis tool for deal evaluation', async () => {
      if (skipIfNoApi('grok')) return;

      trackApiCall('grok');

      const toolCalls: string[] = [];

      await withRetry(async () => {
        const result = await streamText({
          model: xai('grok-4-1-fast-non-reasoning'),
          messages: [
            {
              role: 'user',
              content:
                'Analyze this deal: property asking $350,000, ARV is $450,000, needs $50,000 in repairs',
            },
          ],
          tools: aiTools,
          stopWhen: stepCountIs(3),
          onStepFinish: ({ toolCalls: calls }) => {
            if (calls) {
              calls.forEach((call) => toolCalls.push(call.toolName));
            }
          },
        });
        await result.text;
        return result;
      });

      // Grok may choose any deal analysis tool (analyze, calculate_mao, score, etc.)
      const hasDealTool = toolCalls.some(t => t.includes('deal_analysis'));
      expect(hasDealTool).toBe(true);
      console.log(`  ✅ Grok selected: ${toolCalls.join(', ')}`);
    });

    it('should select map tools for map-related queries', async () => {
      if (skipIfNoApi('grok')) return;

      trackApiCall('grok');

      const toolCalls: string[] = [];

      await withRetry(async () => {
        const result = await streamText({
          model: xai('grok-4-1-fast-non-reasoning'),
          messages: [
            {
              role: 'user',
              content: 'Use the map tool to show me a 15-minute commute time radius from downtown Miami. Call map.show_commute_time with coordinates for downtown Miami.',
            },
          ],
          tools: aiTools,
          stopWhen: stepCountIs(3),
          onStepFinish: ({ toolCalls: calls }) => {
            if (calls) {
              calls.forEach((call) => toolCalls.push(call.toolName));
            }
          },
        });
        await result.text;
        return result;
      });

      // Should use some map or location-related tool
      const hasRelevantTool = toolCalls.some((t) =>
        t.includes('map') || t.includes('commute') || t.includes('geocode')
      );
      expect(hasRelevantTool).toBe(true);
      console.log(`  ✅ Grok selected: ${toolCalls.join(', ')}`);
    });

    it('should select CRM tools for lead management queries', async () => {
      if (skipIfNoApi('grok')) return;

      trackApiCall('grok');

      const toolCalls: string[] = [];

      await withRetry(async () => {
        const result = await streamText({
          model: xai('grok-4-1-fast-non-reasoning'),
          messages: [
            { role: 'user', content: 'Show me a summary of all my leads' },
          ],
          tools: aiTools,
          stopWhen: stepCountIs(3),
          onStepFinish: ({ toolCalls: calls }) => {
            if (calls) {
              calls.forEach((call) => toolCalls.push(call.toolName));
            }
          },
        });
        await result.text;
        return result;
      });

      expect(toolCalls.some((t) => t.startsWith('crm_'))).toBe(true);
      console.log(`  ✅ Grok selected: ${toolCalls.join(', ')}`);
    });
  });
});

