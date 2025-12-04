/**
 * Map Tools Tests
 */

import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';
import { toolRegistry } from '../../../registry';
import { registerMapTools } from '../../../categories/map-tools';
import { createMockContext } from '@/test/utils/tool-test-utils';
import { mockMapboxApis } from '@/test/mocks/mapbox';

describe('Map Tools', () => {
  beforeAll(() => {
    registerMapTools();
  });

  beforeEach(() => {
    vi.stubGlobal('fetch', mockMapboxApis());
  });

  describe('Tool Registration', () => {
    const expectedTools = [
      'map.draw_search_area',
      'map.compare_areas',
      'map.show_commute_time',
      'map.toggle_style',
      'map.spatial_query',
    ];

    expectedTools.forEach(toolId => {
      it(`should register ${toolId}`, () => {
        const tool = toolRegistry.get(toolId);
        expect(tool).toBeDefined();
        expect(tool?.category).toBe('map');
      });
    });
  });

  describe('map.draw_search_area', () => {
    it('should accept valid center and radius', () => {
      const tool = toolRegistry.get('map.draw_search_area');

      // Match actual schema: center, radiusMiles, shape, polygonPoints, filters
      const validInput = {
        center: { lat: 25.75, lng: -80.20 },
        radiusMiles: 5,
        shape: 'circle',
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should accept polygon points', () => {
      const tool = toolRegistry.get('map.draw_search_area');

      const validInput = {
        center: { lat: 25.75, lng: -80.20 },
        shape: 'polygon',
        polygonPoints: [
          { lat: 25.75, lng: -80.20 },
          { lat: 25.78, lng: -80.20 },
          { lat: 25.78, lng: -80.17 },
        ],
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should execute and return area data', async () => {
      const tool = toolRegistry.get('map.draw_search_area');
      const context = createMockContext();

      const result = await tool?.handler(
        {
          center: { lat: 25.75, lng: -80.20 },
          radiusMiles: 5,
        },
        context
      ) as { areaId: string; bounds: unknown } | undefined;

      expect(result).toBeDefined();
      expect(result?.areaId).toBeDefined();
      expect(result?.bounds).toBeDefined();
    });
  });

  describe('map.show_commute_time', () => {
    it('should accept valid commute parameters', () => {
      const tool = toolRegistry.get('map.show_commute_time');

      // Match actual schema: center, minutes, profile
      const validInput = {
        center: { lat: 25.7617, lng: -80.1918 },
        minutes: 30,
        profile: 'driving',
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should validate travel profile options', () => {
      const tool = toolRegistry.get('map.show_commute_time');

      const invalidProfile = {
        center: { lat: 25.7617, lng: -80.1918 },
        profile: 'flying', // Invalid mode
      };

      const parseResult = tool?.inputSchema.safeParse(invalidProfile);
      expect(parseResult?.success).toBe(false);
    });

    it('should execute and return isochrone data', async () => {
      const tool = toolRegistry.get('map.show_commute_time');
      const context = createMockContext();

      const result = await tool?.handler(
        {
          center: { lat: 25.7617, lng: -80.1918 },
          minutes: 15,
          profile: 'driving',
        },
        context
      ) as { geometry: unknown } | undefined;

      expect(result).toBeDefined();
      expect(result?.geometry).toBeDefined();
    });
  });

  describe('map.toggle_style', () => {
    it('should accept valid style options', () => {
      const tool = toolRegistry.get('map.toggle_style');

      // Match actual schema: streets, satellite, satellite-streets, light, dark
      const styles = ['streets', 'satellite', 'satellite-streets', 'light', 'dark'];
      styles.forEach(style => {
        const parseResult = tool?.inputSchema.safeParse({ style });
        expect(parseResult?.success).toBe(true);
      });
    });

    it('should reject invalid style', () => {
      const tool = toolRegistry.get('map.toggle_style');

      const parseResult = tool?.inputSchema.safeParse({ style: 'rainbow' });
      expect(parseResult?.success).toBe(false);
    });

    it('should execute and return confirmation', async () => {
      const tool = toolRegistry.get('map.toggle_style');
      const context = createMockContext();

      const result = await tool?.handler({ style: 'satellite' }, context) as { newStyle: string } | undefined;

      expect(result).toBeDefined();
      expect(result?.newStyle).toBe('satellite');
    });
  });

  describe('map.spatial_query', () => {
    it('should accept valid spatial query parameters', () => {
      const tool = toolRegistry.get('map.spatial_query');

      const validInput = {
        center: { lat: 25.7617, lng: -80.1918 },
        radiusMeters: 1000,
        poiTypes: ['restaurant', 'school'],
        limit: 20,
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should execute and return POI results', async () => {
      const tool = toolRegistry.get('map.spatial_query');
      const context = createMockContext();

      const result = await tool?.handler(
        {
          center: { lat: 25.7617, lng: -80.1918 },
          radiusMeters: 1000,
        },
        context
      ) as { features: unknown[] } | undefined;

      expect(result).toBeDefined();
      expect(result?.features).toBeDefined();
      expect(Array.isArray(result?.features)).toBe(true);
    });
  });

  describe('map.compare_areas', () => {
    it('should accept multiple areas for comparison', () => {
      const tool = toolRegistry.get('map.compare_areas');

      // Match actual schema: areas (array), metrics
      const validInput = {
        areas: [
          { name: 'Downtown Miami', center: { lat: 25.7617, lng: -80.1918 }, radiusMiles: 3 },
          { name: 'Coral Gables', center: { lat: 25.7215, lng: -80.2684 }, radiusMiles: 3 },
        ],
        metrics: ['avg_price', 'price_growth', 'days_on_market'],
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });
  });
});

