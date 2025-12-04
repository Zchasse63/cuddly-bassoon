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
    const expectedTools = [
      'skipTrace.traceLead',
      'skipTrace.batchTrace',
      'skipTrace.getStatus',
      'skipTrace.validatePhone',
      'skipTrace.validateEmail',
      'skipTrace.enrichLead',
      'skipTrace.findRelated',
      'skipTrace.reversePhone',
      'skipTrace.reverseAddress',
      'skipTrace.getCredits',
    ];

    expectedTools.forEach(toolId => {
      it(`should register ${toolId}`, () => {
        const tool = toolRegistry.get(toolId);
        expect(tool).toBeDefined();
      });
    });
  });

  describe('skipTrace.traceLead', () => {
    it('should accept valid trace input with leadId', () => {
      const tool = toolRegistry.get('skipTrace.traceLead');

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
      const tool = toolRegistry.get('skipTrace.traceLead');

      const invalidInput = {
        // Missing leadId
        includeRelatives: true,
      };

      const parseResult = tool?.inputSchema.safeParse(invalidInput);
      expect(parseResult?.success).toBe(false);
    });

    it('should accept minimal input', () => {
      const tool = toolRegistry.get('skipTrace.traceLead');

      const minimalInput = { leadId: 'lead-123' };
      const parseResult = tool?.inputSchema.safeParse(minimalInput);
      expect(parseResult?.success).toBe(true);
    });
  });

  describe('skipTrace.validatePhone', () => {
    it('should accept valid phone number', () => {
      const tool = toolRegistry.get('skipTrace.validatePhone');

      // Match actual schema: phoneNumber, checkCarrier
      const validInput = { phoneNumber: '+1-305-555-1234' };
      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should accept various phone formats', () => {
      const tool = toolRegistry.get('skipTrace.validatePhone');

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
      const tool = toolRegistry.get('skipTrace.validatePhone');
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

  describe('skipTrace.validateEmail', () => {
    it('should accept valid email', () => {
      const tool = toolRegistry.get('skipTrace.validateEmail');

      const validInput = { email: 'test@example.com' };
      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should accept any string for email (validation in handler)', () => {
      const tool = toolRegistry.get('skipTrace.validateEmail');

      // Schema accepts any string, validation happens in handler
      const input = { email: 'not-an-email' };
      const parseResult = tool?.inputSchema.safeParse(input);
      expect(parseResult?.success).toBe(true);
    });

    it('should execute and return validation result', async () => {
      const tool = toolRegistry.get('skipTrace.validateEmail');
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

  describe('skipTrace.batchTrace', () => {
    it('should accept array of lead IDs', () => {
      const tool = toolRegistry.get('skipTrace.batchTrace');

      // Match actual schema: leadIds (array of strings), priority
      const validInput = {
        leadIds: ['lead-1', 'lead-2', 'lead-3'],
        priority: 'normal',
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should limit batch size to 100', () => {
      const tool = toolRegistry.get('skipTrace.batchTrace');

      // Create 101 lead IDs (over limit)
      const leadIds = Array(101).fill(null).map((_, i) => `lead-${i}`);

      const parseResult = tool?.inputSchema.safeParse({ leadIds });
      expect(parseResult?.success).toBe(false);
    });
  });

  describe('skipTrace.getCredits', () => {
    it('should not require any input', () => {
      const tool = toolRegistry.get('skipTrace.getCredits');

      const parseResult = tool?.inputSchema.safeParse({});
      expect(parseResult?.success).toBe(true);
    });

    it('should execute and return credit balance', async () => {
      const tool = toolRegistry.get('skipTrace.getCredits');
      const context = createMockContext();

      const result = await tool?.handler({}, context) as { remaining: number } | undefined;

      expect(result).toBeDefined();
      // Actual output has 'remaining', not 'credits'
      expect(result?.remaining).toBeDefined();
      expect(typeof result?.remaining).toBe('number');
    });
  });

  describe('skipTrace.reversePhone', () => {
    it('should accept phone number for reverse lookup', () => {
      const tool = toolRegistry.get('skipTrace.reversePhone');

      // Match actual schema: phoneNumber
      const validInput = { phoneNumber: '+1-305-555-1234' };
      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should execute and return owner info', async () => {
      const tool = toolRegistry.get('skipTrace.reversePhone');
      const context = createMockContext();

      const result = await tool?.handler(
        { phoneNumber: '+1-305-555-1234' },
        context
      );

      expect(result).toBeDefined();
    });
  });
});

