/**
 * Property Search Tools Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { toolRegistry } from '../../../registry';
import { registerPropertySearchTools } from '../../../categories/property-search';
import { createMockContext } from '@/test/utils/tool-test-utils';

describe('Property Search Tools', () => {
  beforeAll(() => {
    registerPropertySearchTools();
  });

  describe('Tool Registration', () => {
    it('should register property_search.search tool', () => {
      const tool = toolRegistry.get('property_search.search');
      expect(tool).toBeDefined();
      expect(tool?.category).toBe('property_search');
      expect(tool?.requiredPermission).toBe('read');
    });

    it('should register property_search.get_details tool', () => {
      const tool = toolRegistry.get('property_search.get_details');
      expect(tool).toBeDefined();
      expect(tool?.category).toBe('property_search');
    });
  });

  describe('property_search.search', () => {
    it('should accept valid search input', async () => {
      const tool = toolRegistry.get('property_search.search');
      expect(tool).toBeDefined();

      // Match actual schema: location, propertyType (array), priceRange (object)
      const validInput = {
        location: 'Miami, FL',
        priceRange: { min: 200000, max: 500000 },
        bedrooms: { min: 2 },
        propertyType: ['single_family'],
        limit: 25,
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should accept minimal input', () => {
      const tool = toolRegistry.get('property_search.search');

      // All fields are optional
      const minimalInput = {};
      const parseResult = tool?.inputSchema.safeParse(minimalInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should execute with mock context', async () => {
      const tool = toolRegistry.get('property_search.search');
      const context = createMockContext();

      const result = await tool?.handler(
        { location: 'Miami, FL', limit: 10 },
        context
      ) as { properties: unknown[] } | undefined;

      expect(result).toBeDefined();
      expect(result?.properties).toBeDefined();
      expect(Array.isArray(result?.properties)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const tool = toolRegistry.get('property_search.search');
      const context = createMockContext();

      const result = await tool?.handler(
        { location: 'Miami', limit: 5 },
        context
      ) as { properties: unknown[] } | undefined;

      expect(result?.properties.length).toBeLessThanOrEqual(5);
    });

    it('should filter by property type', async () => {
      const tool = toolRegistry.get('property_search.search');
      const context = createMockContext();

      const result = await tool?.handler(
        { location: 'Miami', propertyType: ['condo'] },
        context
      );

      expect(result).toBeDefined();
    });
  });

  describe('property_search.get_details', () => {
    it('should accept valid property ID', async () => {
      const tool = toolRegistry.get('property_search.get_details');
      expect(tool).toBeDefined();

      const validInput = { propertyId: 'prop-123' };
      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should require property ID', () => {
      const tool = toolRegistry.get('property_search.get_details');

      // Missing required propertyId
      const invalidInput = {};
      const parseResult = tool?.inputSchema.safeParse(invalidInput);
      expect(parseResult?.success).toBe(false);
    });

    it('should execute and return property details', async () => {
      const tool = toolRegistry.get('property_search.get_details');
      const context = createMockContext();

      const result = await tool?.handler(
        { propertyId: 'prop-123' },
        context
      ) as { property: { id: string } } | undefined;

      expect(result).toBeDefined();
      expect(result?.property).toBeDefined();
      expect(result?.property?.id).toBe('prop-123');
    });
  });

  describe('Input Validation Edge Cases', () => {
    it('should handle missing optional fields', () => {
      const tool = toolRegistry.get('property_search.search');

      const minimalInput = { location: 'Miami' };
      const parseResult = tool?.inputSchema.safeParse(minimalInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should handle empty input', async () => {
      const tool = toolRegistry.get('property_search.search');
      const context = createMockContext();

      const result = await tool?.handler({}, context);
      expect(result).toBeDefined();
    });

    it('should handle maximum values', () => {
      const tool = toolRegistry.get('property_search.search');

      const maxInput = {
        location: 'Miami',
        priceRange: { max: 100000000 }, // 100 million
        squareFootage: { max: 100000 },
        limit: 100,
      };

      const parseResult = tool?.inputSchema.safeParse(maxInput);
      expect(parseResult?.success).toBe(true);
    });
  });
});

