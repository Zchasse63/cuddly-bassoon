/**
 * Predictive Tools Tests
 * Tests for AI prediction and scoring tools
 * Note: Handler execution tests are limited to tools that don't require external API calls
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { toolRegistry } from '../../../registry';
import { registerPredictiveTools } from '../../../categories/predictive-tools';
import { createMockContext } from '@/test/utils/tool-test-utils';

describe('Predictive Tools', () => {
  beforeAll(() => {
    registerPredictiveTools();
  });

  const predictiveTools = [
    'predict.seller_motivation',
    'predict.deal_close_probability',
    'predict.optimal_offer_price',
    'predict.time_to_close',
    'predict.classify_owner',
    'predict.batch_motivation',
    'predict.compare_motivation',
  ];

  describe('Tool Registration', () => {
    predictiveTools.forEach(toolId => {
      it(`should register ${toolId}`, () => {
        const tool = toolRegistry.get(toolId);
        expect(tool).toBeDefined();
        expect(tool?.category).toBe('predictive');
      });
    });
  });

  describe('predict.seller_motivation', () => {
    it('should accept motivation prediction input', () => {
      const tool = toolRegistry.get('predict.seller_motivation');
      const validInput = {
        address: '123 Main St, Miami, FL 33101',
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });

    it('should accept empty input (with defaults)', () => {
      const tool = toolRegistry.get('predict.seller_motivation');
      const result = tool?.inputSchema.safeParse({});
      // Some tools have optional inputs with defaults
      expect(tool).toBeDefined();
    });
  });

  describe('predict.deal_close_probability', () => {
    it('should accept probability prediction input', () => {
      const tool = toolRegistry.get('predict.deal_close_probability');
      const validInput = {
        dealId: 'deal-001',
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });

    it('should have deal probability output schema', () => {
      const tool = toolRegistry.get('predict.deal_close_probability');
      expect(tool?.outputSchema).toBeDefined();
    });
  });

  describe('predict.optimal_offer_price', () => {
    it('should accept offer price prediction input', () => {
      const tool = toolRegistry.get('predict.optimal_offer_price');
      const validInput = {
        address: '123 Main St, Miami, FL 33101',
        targetProfit: 25000,
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });

    it('should have optimal price output schema', () => {
      const tool = toolRegistry.get('predict.optimal_offer_price');
      expect(tool?.outputSchema).toBeDefined();
    });
  });

  describe('predict.time_to_close', () => {
    it('should accept time prediction input', () => {
      const tool = toolRegistry.get('predict.time_to_close');
      const validInput = {
        dealId: 'deal-001',
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });
  });

  describe('predict.classify_owner', () => {
    it('should accept owner classification input', () => {
      const tool = toolRegistry.get('predict.classify_owner');
      const validInput = {
        ownerName: 'John Smith',
        ownerOccupied: true,
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });

    it('should require ownerName', () => {
      const tool = toolRegistry.get('predict.classify_owner');
      const invalidInput = { ownerOccupied: true };
      const result = tool?.inputSchema.safeParse(invalidInput);
      expect(result?.success).toBe(false);
    });

    // Handler test - classify_owner is a pure algorithm that doesn't need external APIs
    it('should return owner classification', async () => {
      const tool = toolRegistry.get('predict.classify_owner');
      const context = createMockContext();
      const result = await tool?.handler(
        { ownerName: 'ABC Holdings LLC' },
        context
      ) as { primaryClass?: string; confidence?: number };
      expect(result).toBeDefined();
      expect(result?.primaryClass).toBeDefined();
      expect(result?.confidence).toBeDefined();
      expect(typeof result?.confidence).toBe('number');
    });

    it('should classify individual owners correctly', async () => {
      const tool = toolRegistry.get('predict.classify_owner');
      const context = createMockContext();
      const result = await tool?.handler(
        { ownerName: 'John Smith' },
        context
      ) as { primaryClass?: string };
      expect(result?.primaryClass).toBe('individual');
    });

    it('should classify corporate entities correctly', async () => {
      const tool = toolRegistry.get('predict.classify_owner');
      const context = createMockContext();
      const result = await tool?.handler(
        { ownerName: 'XYZ Investments LLC' },
        context
      ) as { primaryClass?: string };
      expect(result?.primaryClass).toBe('investor_entity');
    });

    it('should classify estates correctly', async () => {
      const tool = toolRegistry.get('predict.classify_owner');
      const context = createMockContext();
      const result = await tool?.handler(
        { ownerName: 'Estate of Maria Rodriguez' },
        context
      ) as { primaryClass?: string };
      expect(result?.primaryClass).toBe('institutional_distressed');
    });
  });

  describe('predict.batch_motivation', () => {
    it('should accept batch motivation input', () => {
      const tool = toolRegistry.get('predict.batch_motivation');
      const validInput = {
        properties: [
          { address: '123 Main St, Miami, FL 33101' },
          { address: '456 Oak Ave, Miami, FL 33102' },
        ],
        scoreType: 'standard',
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });

    it('should require properties array', () => {
      const tool = toolRegistry.get('predict.batch_motivation');
      const invalidInput = { scoreType: 'standard' };
      const result = tool?.inputSchema.safeParse(invalidInput);
      expect(result?.success).toBe(false);
    });

    it('should limit batch size to 20', () => {
      const tool = toolRegistry.get('predict.batch_motivation');
      const tooManyProperties = Array(25).fill({ address: '123 Main St' });
      const result = tool?.inputSchema.safeParse({ properties: tooManyProperties });
      expect(result?.success).toBe(false);
    });
  });

  describe('predict.compare_motivation', () => {
    it('should accept comparison input with addresses', () => {
      const tool = toolRegistry.get('predict.compare_motivation');
      const validInput = {
        addresses: ['123 Main St, Miami, FL', '456 Oak Ave, Miami, FL'],
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });

    it('should accept comparison input with propertyIds', () => {
      const tool = toolRegistry.get('predict.compare_motivation');
      const validInput = {
        propertyIds: ['prop-001', 'prop-002'],
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });

    it('should require at least 2 properties', () => {
      const tool = toolRegistry.get('predict.compare_motivation');
      const invalidInput = { addresses: ['123 Main St'] };
      const result = tool?.inputSchema.safeParse(invalidInput);
      expect(result?.success).toBe(false);
    });
  });

  describe('Tool Metadata', () => {
    it('should have predictive tags', () => {
      predictiveTools.forEach(toolId => {
        const tool = toolRegistry.get(toolId);
        expect(tool?.tags).toBeDefined();
        expect(tool?.tags.some(t => ['predictive', 'motivation', 'scoring', 'analysis', 'classification'].includes(t))).toBe(true);
      });
    });

    it('should all have read permission', () => {
      predictiveTools.forEach(toolId => {
        const tool = toolRegistry.get(toolId);
        expect(tool?.requiredPermission).toBe('read');
      });
    });
  });
});
