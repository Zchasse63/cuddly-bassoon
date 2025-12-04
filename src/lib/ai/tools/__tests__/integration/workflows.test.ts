/**
 * Workflow Integration Tests
 *
 * Tests complete end-to-end real estate workflows.
 * Each workflow represents a common user journey through the application.
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
  userId: 'workflow-test',
  sessionId: `workflow-${Date.now()}`,
  permissions: ['read', 'write', 'execute'],
};

describe('End-to-End Workflow Tests', () => {
  let aiTools: ReturnType<typeof convertToAISDKTools>;

  beforeAll(async () => {
    registerAllTools();
    aiTools = convertToAISDKTools(testContext);
  });

  describe('Workflow: Property Discovery to Deal Analysis', () => {
    it('should complete full property discovery workflow', async () => {
      if (skipIfNoApi('grok')) return;

      const toolsUsed: string[] = [];

      // Simulate a realistic user workflow
      const workflow = [
        'Find me distressed properties in Miami under $300,000',
        'Show me a heat map of prices in that area',
        'Analyze the most promising property as a flip deal',
      ];

      const messages: CoreMessage[] = [];

      for (const prompt of workflow) {
        messages.push({ role: 'user', content: prompt });

        trackApiCall('grok');
        const result = await withRetry(async () => {
          return streamText({
            model: xai('grok-4-1-fast-non-reasoning'),
            messages,
            tools: aiTools,
            stopWhen: stepCountIs(3),
            onStepFinish: ({ toolCalls }) => {
              if (toolCalls) {
                toolCalls.forEach((call) => toolsUsed.push(call.toolName));
              }
            },
          });
        });

        const response = await result.text;
        messages.push({ role: 'assistant', content: response });
      }

      // Verify workflow used at least one tool (Grok decides which are appropriate)
      expect(toolsUsed.length).toBeGreaterThan(0);
      // Search is the most likely tool for property discovery
      const hasSearchTool = toolsUsed.some((t) =>
        t.includes('search') || t.includes('property') || t.includes('map')
      );
      expect(hasSearchTool).toBe(true);

      console.log(`  ✅ Property Discovery Workflow: ${toolsUsed.join(' → ')}`);
    });
  });

  describe('Workflow: Lead Management', () => {
    it('should complete lead qualification workflow', async () => {
      if (skipIfNoApi('grok')) return;

      const toolsUsed: string[] = [];
      const messages: CoreMessage[] = [];

      const workflow = [
        'Show me a summary of all my leads',
        'Segment the leads by motivation level',
        'Which leads should I prioritize today?',
      ];

      for (const prompt of workflow) {
        messages.push({ role: 'user', content: prompt });

        trackApiCall('grok');
        const result = await withRetry(async () => {
          return streamText({
            model: xai('grok-4-1-fast-non-reasoning'),
            messages,
            tools: aiTools,
            stopWhen: stepCountIs(3),
            onStepFinish: ({ toolCalls }) => {
              if (toolCalls) {
                toolCalls.forEach((call) => toolsUsed.push(call.toolName));
              }
            },
          });
        });

        const response = await result.text;
        messages.push({ role: 'assistant', content: response });
      }

      // Verify CRM tools were used
      expect(toolsUsed.some((t) => t.startsWith('crm_'))).toBe(true);
      console.log(`  ✅ Lead Management Workflow: ${toolsUsed.join(' → ')}`);
    });
  });

  describe('Workflow: Market Research', () => {
    it('should complete market analysis workflow', async () => {
      if (skipIfNoApi('grok')) return;

      const toolsUsed: string[] = [];
      const messages: CoreMessage[] = [];

      const workflow = [
        'Analyze the real estate market trends in Houston, TX',
        'Compare Houston to Dallas for investment opportunities',
        'What are my KPIs for the last 30 days?',
      ];

      for (const prompt of workflow) {
        messages.push({ role: 'user', content: prompt });

        trackApiCall('grok');
        const result = await withRetry(async () => {
          return streamText({
            model: xai('grok-4-1-fast-non-reasoning'),
            messages,
            tools: aiTools,
            stopWhen: stepCountIs(3),
            onStepFinish: ({ toolCalls }) => {
              if (toolCalls) {
                toolCalls.forEach((call) => toolsUsed.push(call.toolName));
              }
            },
          });
        });

        const response = await result.text;
        messages.push({ role: 'assistant', content: response });
      }

      console.log(`  ✅ Market Research Workflow: ${toolsUsed.join(' → ')}`);
    });
  });
});

