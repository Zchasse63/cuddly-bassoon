/**
 * Skip Trace Tools Tests
 */

import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import { toolRegistry } from '../../../registry';
import { registerSkipTraceTools } from '../../../categories/skip-trace-tools';
import { createMockContext } from '@/test/utils/tool-test-utils';
import { mockSkipTraceApis } from '@/test/mocks/skip-trace';

describe('Skip Trace Tools', () => {
  beforeAll(() => {
    registerSkipTraceTools();
  });

  beforeEach(() => {
    vi.stubGlobal('fetch', mockSkipTraceApis());
  });

  describe('Tool Registration', () => {
    // Tool IDs use snake_case: skip_trace.trace_lead
    const expectedTools = [
      'skip_trace.trace_lead',
      'skip_trace.batch_trace',
      'skip_trace.get_status',
      'skip_trace.validate_phone',
      'skip_trace.validate_email',
      'skip_trace.enrich_lead',
      'skip_trace.find_related',
      'skip_trace.reverse_phone',
      'skip_trace.reverse_address',
      'skip_trace.get_credits',
    ];

    expectedTools.forEach(toolId => {
      it(`should register ${toolId}`, () => {
        const tool = toolRegistry.get(toolId);
        expect(tool).toBeDefined();
      });
    });
  });

  describe('skip_trace.trace_lead', () => {
    it('should accept valid trace input with leadId', () => {
      const tool = toolRegistry.get('skip_trace.trace_lead');

      // Match actual schema: leadId, includeRelatives, includeAssociates
      const validInput = {
        leadId: 'lead-123',
        includeRelatives: true,
        includeAssociates: false,
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should require leadId', () => {
      const tool = toolRegistry.get('skip_trace.trace_lead');

      const invalidInput = {
        // Missing leadId
        includeRelatives: true,
      };

      const parseResult = tool?.inputSchema.safeParse(invalidInput);
      expect(parseResult?.success).toBe(false);
    });

    it('should accept minimal input', () => {
      const tool = toolRegistry.get('skip_trace.trace_lead');

      const minimalInput = { leadId: 'lead-123' };
      const parseResult = tool?.inputSchema.safeParse(minimalInput);
      expect(parseResult?.success).toBe(true);
    });
  });

  describe('skip_trace.validate_phone', () => {
    it('should accept valid phone number', () => {
      const tool = toolRegistry.get('skip_trace.validate_phone');

      // Match actual schema: phoneNumber, checkCarrier
      const validInput = { phoneNumber: '+1-305-555-1234' };
      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should accept various phone formats', () => {
      const tool = toolRegistry.get('skip_trace.validate_phone');

      const formats = [
        '+1-305-555-1234',
        '3055551234',
        '(305) 555-1234',
        '+13055551234',
      ];

      formats.forEach(phoneNumber => {
        const parseResult = tool?.inputSchema.safeParse({ phoneNumber });
        expect(parseResult?.success).toBe(true);
      });
    });

    it('should execute and return validation result', async () => {
      const tool = toolRegistry.get('skip_trace.validate_phone');
      const context = createMockContext();

      const result = await tool?.handler(
        { phoneNumber: '+1-305-555-1234' },
        context
      ) as { valid: boolean } | undefined;

      expect(result).toBeDefined();
      expect(result?.valid).toBeDefined();
      expect(typeof result?.valid).toBe('boolean');
    });
  });

  describe('skip_trace.validate_email', () => {
    it('should accept valid email', () => {
      const tool = toolRegistry.get('skip_trace.validate_email');

      const validInput = { email: 'test@example.com' };
      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should accept any string for email (validation in handler)', () => {
      const tool = toolRegistry.get('skip_trace.validate_email');

      // Schema accepts any string, validation happens in handler
      const input = { email: 'not-an-email' };
      const parseResult = tool?.inputSchema.safeParse(input);
      expect(parseResult?.success).toBe(true);
    });

    it('should execute and return validation result', async () => {
      const tool = toolRegistry.get('skip_trace.validate_email');
      const context = createMockContext();

      const result = await tool?.handler(
        { email: 'john@example.com' },
        context
      ) as { valid: boolean; disposable: boolean } | undefined;

      expect(result).toBeDefined();
      expect(result?.valid).toBeDefined();
      expect(result?.disposable).toBeDefined();
    });
  });

  describe('skip_trace.batch_trace', () => {
    it('should accept array of lead IDs', () => {
      const tool = toolRegistry.get('skip_trace.batch_trace');

      // Match actual schema: leadIds (array of strings), priority
      const validInput = {
        leadIds: ['lead-1', 'lead-2', 'lead-3'],
        priority: 'normal',
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should limit batch size to 100', () => {
      const tool = toolRegistry.get('skip_trace.batch_trace');

      // Create 101 lead IDs (over limit)
      const leadIds = Array(101).fill(null).map((_, i) => `lead-${i}`);

      const parseResult = tool?.inputSchema.safeParse({ leadIds });
      expect(parseResult?.success).toBe(false);
    });
  });

  describe('skip_trace.get_credits', () => {
    it('should not require any input', () => {
      const tool = toolRegistry.get('skip_trace.get_credits');

      const parseResult = tool?.inputSchema.safeParse({});
      expect(parseResult?.success).toBe(true);
    });

    it('should execute and return credit balance', async () => {
      const tool = toolRegistry.get('skip_trace.get_credits');
      const context = createMockContext();

      const result = await tool?.handler({}, context) as { remaining: number } | undefined;

      expect(result).toBeDefined();
      // Actual output has 'remaining', not 'credits'
      expect(result?.remaining).toBeDefined();
      expect(typeof result?.remaining).toBe('number');
    });
  });

  describe('skip_trace.reverse_phone', () => {
    it('should accept phone number for reverse lookup', () => {
      const tool = toolRegistry.get('skip_trace.reverse_phone');

      // Match actual schema: phoneNumber
      const validInput = { phoneNumber: '+1-305-555-1234' };
      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should execute and return owner info', async () => {
      const tool = toolRegistry.get('skip_trace.reverse_phone');
      const context = createMockContext();

      const result = await tool?.handler(
        { phoneNumber: '+1-305-555-1234' },
        context
      );

      expect(result).toBeDefined();
    });
  });
});

