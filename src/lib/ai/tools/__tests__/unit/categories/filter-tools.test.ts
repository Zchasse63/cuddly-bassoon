/**
 * Filter Tools Tests
 * Tests for property filter and search AI tools
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { toolRegistry } from '../../../registry';
import { registerFilterTools } from '../../../categories/filter-tools';

describe('Filter Tools', () => {
  beforeAll(() => {
    registerFilterTools();
  });

  const filterTools = [
    'filter.suggest',
    'filter.explain',
    'filter.optimize',
    'filter.create',
    'filter.compare',
    'filter.performance',
    'filter.refine',
    'filter.export',
    'filter.import',
    'filter.recommendations',
    'filter.validate',
  ];

  describe('Tool Registration', () => {
    filterTools.forEach(toolId => {
      it(`should register ${toolId}`, () => {
        const tool = toolRegistry.get(toolId);
        expect(tool).toBeDefined();
        // These tools are registered under property_search category
        expect(tool?.category).toBe('property_search');
      });
    });
  });

  describe('filter.suggest', () => {
    it('should accept suggestion input with goal', () => {
      const tool = toolRegistry.get('filter.suggest');
      const validInput = {
        goal: 'flip',
        budget: 200000,
        location: 'Miami',
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });

    it('should require goal field', () => {
      const tool = toolRegistry.get('filter.suggest');
      const invalidInput = { budget: 200000 };
      const result = tool?.inputSchema.safeParse(invalidInput);
      expect(result?.success).toBe(false);
    });
  });

  describe('filter.create', () => {
    it('should accept filter creation input', () => {
      const tool = toolRegistry.get('filter.create');
      const validInput = {
        description: 'Properties with 30%+ equity, absentee owner, in Miami-Dade',
        name: 'High Equity Absentee',
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });

    it('should require description', () => {
      const tool = toolRegistry.get('filter.create');
      const invalidInput = { name: 'Test Filter' };
      const result = tool?.inputSchema.safeParse(invalidInput);
      expect(result?.success).toBe(false);
    });
  });

  describe('filter.explain', () => {
    it('should accept filter name input', () => {
      const tool = toolRegistry.get('filter.explain');
      const validInput = { filterName: 'High Equity Properties' };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });

    it('should require filterName', () => {
      const tool = toolRegistry.get('filter.explain');
      const invalidInput = {};
      const result = tool?.inputSchema.safeParse(invalidInput);
      expect(result?.success).toBe(false);
    });
  });

  describe('filter.optimize', () => {
    it('should accept criteria object', () => {
      const tool = toolRegistry.get('filter.optimize');
      const validInput = {
        criteria: {
          minPrice: 100000,
          maxPrice: 300000,
          propertyType: ['single_family'],
        },
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });
  });

  describe('filter.compare', () => {
    it('should accept two filter objects to compare', () => {
      const tool = toolRegistry.get('filter.compare');
      const validInput = {
        filterA: { minPrice: 100000, propertyType: 'single_family' },
        filterB: { minPrice: 150000, propertyType: 'single_family' },
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });
  });

  describe('filter.performance', () => {
    it('should accept filter name input', () => {
      const tool = toolRegistry.get('filter.performance');
      const validInput = {
        filterName: 'High Equity Properties',
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });
  });

  describe('filter.refine', () => {
    it('should accept criteria and result count', () => {
      const tool = toolRegistry.get('filter.refine');
      const validInput = {
        criteria: { minPrice: 100000, maxPrice: 300000 },
        currentResultCount: 50,
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });
  });

  describe('filter.validate', () => {
    it('should accept criteria object', () => {
      const tool = toolRegistry.get('filter.validate');
      const validInput = {
        criteria: {
          location: 'Miami',
          minPrice: 100000,
          maxPrice: 300000,
        },
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });
  });

  describe('Tool Permissions', () => {
    it('should have appropriate permissions', () => {
      filterTools.forEach(toolId => {
        const tool = toolRegistry.get(toolId);
        // All filter tools are registered with read permission
        expect(['read', 'write']).toContain(tool?.requiredPermission);
      });
    });
  });

  describe('Tool Tags', () => {
    it('should have filter tag', () => {
      filterTools.forEach(toolId => {
        const tool = toolRegistry.get(toolId);
        expect(tool?.tags).toBeDefined();
        expect(tool?.tags.some(t => t.includes('filter'))).toBe(true);
      });
    });
  });
});
