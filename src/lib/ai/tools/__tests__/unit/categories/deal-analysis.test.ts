/**
 * Deal Analysis Tools Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { toolRegistry } from '../../../registry';
import { registerDealAnalysisTools } from '../../../categories/deal-analysis';
import { createMockContext } from '@/test/utils/tool-test-utils';

describe('Deal Analysis Tools', () => {
  beforeAll(() => {
    registerDealAnalysisTools();
  });

  describe('Tool Registration', () => {
    it('should register deal_analysis.analyze tool', () => {
      const tool = toolRegistry.get('deal_analysis.analyze');
      expect(tool).toBeDefined();
      expect(tool?.category).toBe('deal_analysis');
    });

    it('should register deal_analysis.calculate_mao tool', () => {
      const tool = toolRegistry.get('deal_analysis.calculate_mao');
      expect(tool).toBeDefined();
    });

    it('should register deal_analysis.score tool', () => {
      const tool = toolRegistry.get('deal_analysis.score');
      expect(tool).toBeDefined();
    });
  });

  describe('deal_analysis.analyze', () => {
    it('should accept valid analysis input', () => {
      const tool = toolRegistry.get('deal_analysis.analyze');

      // Match actual schema: propertyId, askingPrice, estimatedRepairs, targetAssignmentFee
      const validInput = {
        propertyId: 'prop-123',
        askingPrice: 350000,
        estimatedRepairs: 25000,
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should require propertyId', () => {
      const tool = toolRegistry.get('deal_analysis.analyze');

      const invalidInput = {
        askingPrice: 350000,
        // Missing propertyId
      };

      const parseResult = tool?.inputSchema.safeParse(invalidInput);
      expect(parseResult?.success).toBe(false);
    });

    it('should execute and return comprehensive analysis', async () => {
      const tool = toolRegistry.get('deal_analysis.analyze');
      const context = createMockContext();

      const result = await tool?.handler(
        {
          propertyId: 'prop-123',
          askingPrice: 350000,
          estimatedRepairs: 25000,
        },
        context
      ) as { arv: number; mao: number; recommendation: string } | undefined;

      expect(result).toBeDefined();
      expect(result?.arv).toBeDefined();
      expect(result?.mao).toBeDefined();
      expect(result?.recommendation).toBeDefined();
    });
  });

  describe('deal_analysis.calculate_mao', () => {
    it('should accept ARV and repair cost', () => {
      const tool = toolRegistry.get('deal_analysis.calculate_mao');

      // Match actual schema: arv, repairCost, assignmentFee, investorMargin
      const validInput = {
        arv: 450000,
        repairCost: 35000,
        assignmentFee: 10000,
        investorMargin: 0.7,
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should require arv and repairCost', () => {
      const tool = toolRegistry.get('deal_analysis.calculate_mao');

      const invalidInput = {
        arv: 450000,
        // Missing repairCost
      };

      const parseResult = tool?.inputSchema.safeParse(invalidInput);
      expect(parseResult?.success).toBe(false);
    });

    it('should execute and return MAO calculation', async () => {
      const tool = toolRegistry.get('deal_analysis.calculate_mao');
      const context = createMockContext();

      const result = await tool?.handler(
        {
          arv: 450000,
          repairCost: 35000,
        },
        context
      ) as { mao: number } | undefined;

      expect(result).toBeDefined();
      expect(result?.mao).toBeDefined();
      expect(typeof result?.mao).toBe('number');
    });

    it('should calculate correct MAO using 70% rule', async () => {
      const tool = toolRegistry.get('deal_analysis.calculate_mao');
      const context = createMockContext();

      // MAO = ARV * 0.7 - repairs - assignmentFee
      // 400000 * 0.7 - 40000 - 10000 = 230000
      // Note: Must pass defaults explicitly since handler doesn't parse through schema
      const result = await tool?.handler(
        {
          arv: 400000,
          repairCost: 40000,
          assignmentFee: 10000,
          investorMargin: 0.7,
        },
        context
      ) as { mao: number } | undefined;

      expect(result?.mao).toBe(230000);
    });
  });

  describe('deal_analysis.score', () => {
    it('should accept property ID for scoring', () => {
      const tool = toolRegistry.get('deal_analysis.score');

      // Match actual schema: propertyId, factors (optional)
      const validInput = {
        propertyId: 'prop-123',
        factors: {
          motivationScore: 8,
          equityPercent: 45,
        },
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should execute and return deal score', async () => {
      const tool = toolRegistry.get('deal_analysis.score');
      const context = createMockContext();

      const result = await tool?.handler(
        { propertyId: 'prop-123' },
        context
      ) as { overallScore: number; confidence: number } | undefined;

      expect(result).toBeDefined();
      expect(result?.overallScore).toBeDefined();
      expect(result?.confidence).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large property values', async () => {
      const tool = toolRegistry.get('deal_analysis.calculate_mao');
      const context = createMockContext();

      const result = await tool?.handler(
        {
          arv: 50000000, // 50 million
          repairCost: 2000000,
          assignmentFee: 10000,
          investorMargin: 0.7,
        },
        context
      ) as { mao: number } | undefined;

      expect(result).toBeDefined();
      // 50000000 * 0.7 - 2000000 - 10000 = 32990000
      expect(result?.mao).toBeGreaterThan(0);
    });

    it('should handle zero repair cost', async () => {
      const tool = toolRegistry.get('deal_analysis.calculate_mao');
      const context = createMockContext();

      const result = await tool?.handler(
        {
          arv: 300000,
          repairCost: 0,
          assignmentFee: 10000,
          investorMargin: 0.7,
        },
        context
      ) as { mao: number } | undefined;

      // 300000 * 0.7 - 0 - 10000 = 200000
      expect(result?.mao).toBe(200000);
    });
  });
});

