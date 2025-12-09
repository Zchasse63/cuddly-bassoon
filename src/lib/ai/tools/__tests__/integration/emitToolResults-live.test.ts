/**
 * Live Integration Tests for Tool Result Event Emission
 *
 * Tests the FULL flow with real xAI Grok API:
 * User query → Grok AI → Tool selection → Tool execution → Event emission
 *
 * Run with: npm run test:live
 */

import { describe, it, expect, beforeAll, vi, afterEach } from 'vitest';
import { streamText, stepCountIs } from 'ai';
import { createXai } from '@ai-sdk/xai';
import { registerAllTools } from '@/lib/ai/tools/categories';
import { convertToAISDKTools } from '@/lib/ai/tools/adapter';
import { aiEventBus } from '@/lib/ai/events';
import {
  skipIfNoApi,
  trackApiCall,
  withRetry,
} from '@/test/utils/live-api-utils';
import type { ToolExecutionContext } from '@/lib/ai/tools/types';

const xai = createXai({
  apiKey: process.env.XAI_API_KEY || '',
});

const testContext: ToolExecutionContext = {
  userId: 'emit-tool-results-live-test',
  sessionId: `emit-live-${Date.now()}`,
  permissions: ['read', 'write', 'execute'],
};

describe('Live Tool Result Event Emission Tests', () => {
  let aiTools: ReturnType<typeof convertToAISDKTools>;
  const emittedEvents: Array<{ toolName: string; result: unknown }> = [];

  beforeAll(async () => {
    registerAllTools();
    aiTools = convertToAISDKTools(testContext);
    console.log(`\n🔥 Live Event Emission Tests with ${Object.keys(aiTools).length} tools\n`);

    // Subscribe to ALL tool results
    aiEventBus.on('tool:result', (event) => {
      console.log(`  📡 Event received: ${event.toolName}`);
      emittedEvents.push(event);
    });
  });

  afterEach(() => {
    // Clear events between tests
    emittedEvents.length = 0;
  });

  /**
   * Helper to simulate what ScoutPane does after receiving tool results
   */
  function emitToolResultsFromStream(toolCalls: Array<{ toolName: string; result: unknown }>) {
    for (const call of toolCalls) {
      aiEventBus.emit('tool:result', {
        toolName: call.toolName,
        result: call.result,
      });
    }
  }

  describe('Real API → Tool Execution → Event Emission', () => {
    it('should emit event when Grok calls property_search tool', async () => {
      if (skipIfNoApi('grok')) return;

      trackApiCall('grok');

      const toolResults: Array<{ toolName: string; result: unknown }> = [];

      const result = await withRetry(async () => {
        return streamText({
          model: xai('grok-4-1-fast-non-reasoning'),
          messages: [
            { role: 'user', content: 'Search for properties in Miami, FL under $500,000' },
          ],
          tools: aiTools,
          stopWhen: stepCountIs(3),
          onStepFinish: ({ toolResults: results }) => {
            if (results) {
              results.forEach((r) => {
                toolResults.push({ toolName: r.toolName, result: r.result });
              });
            }
          },
        });
      });

      // Consume the stream
      await result.text;

      // Now emit the events like ScoutPane would
      emitToolResultsFromStream(toolResults);

      // Verify events were emitted
      expect(emittedEvents.length).toBeGreaterThan(0);
      expect(emittedEvents.some((e) => e.toolName.includes('property_search'))).toBe(true);

      console.log(`  ✅ ${emittedEvents.length} events emitted`);
      emittedEvents.forEach((e) => console.log(`     - ${e.toolName}`));
    }, 60000);

    it('should emit event when Grok calls deal_analysis tool', async () => {
      if (skipIfNoApi('grok')) return;

      trackApiCall('grok');

      const toolResults: Array<{ toolName: string; result: unknown }> = [];

      await withRetry(async () => {
        const result = await streamText({
          model: xai('grok-4-1-fast-non-reasoning'),
          messages: [
            {
              role: 'user',
              content: 'Analyze this deal: property asking $350,000, ARV is $450,000, needs $50,000 in repairs',
            },
          ],
          tools: aiTools,
          stopWhen: stepCountIs(3),
          onStepFinish: ({ toolResults: results }) => {
            if (results) {
              results.forEach((r) => {
                toolResults.push({ toolName: r.toolName, result: r.result });
              });
            }
          },
        });
        await result.text;
        return result;
      });

      // Emit events like ScoutPane would
      emitToolResultsFromStream(toolResults);

      // Verify events were emitted
      expect(emittedEvents.length).toBeGreaterThan(0);
      expect(emittedEvents.some((e) => e.toolName.includes('deal_analysis'))).toBe(true);

      console.log(`  ✅ ${emittedEvents.length} events emitted`);
      emittedEvents.forEach((e) => console.log(`     - ${e.toolName}`));
    }, 60000);

    it('should emit event when Grok calls CRM tool', async () => {
      if (skipIfNoApi('grok')) return;

      trackApiCall('grok');

      const toolResults: Array<{ toolName: string; result: unknown }> = [];

      await withRetry(async () => {
        const result = await streamText({
          model: xai('grok-4-1-fast-non-reasoning'),
          messages: [
            { role: 'user', content: 'Show me a summary of all my leads' },
          ],
          tools: aiTools,
          stopWhen: stepCountIs(3),
          onStepFinish: ({ toolResults: results }) => {
            if (results) {
              results.forEach((r) => {
                toolResults.push({ toolName: r.toolName, result: r.result });
              });
            }
          },
        });
        await result.text;
        return result;
      });

      // Emit events like ScoutPane would
      emitToolResultsFromStream(toolResults);

      // Verify CRM-related event was emitted
      expect(emittedEvents.length).toBeGreaterThan(0);
      expect(emittedEvents.some((e) => e.toolName.startsWith('crm_'))).toBe(true);

      console.log(`  ✅ ${emittedEvents.length} events emitted`);
      emittedEvents.forEach((e) => console.log(`     - ${e.toolName}`));
    }, 60000);
  });
});

