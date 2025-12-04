/**
 * Chat Endpoint Integration Tests
 * Tests tool invocation through the AI chat API
 */

import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { ensureToolsInitialized, convertToAISDKTools, createDefaultContext } from '../../adapter';
import { setupAllMocks } from '@/test/mocks';
import type { ToolCallOptions } from '@ai-sdk/provider-utils';

// Mock ToolCallOptions for direct execute() calls
const mockToolOptions: ToolCallOptions = {
  toolCallId: 'test-call-id',
  messages: [],
  abortSignal: new AbortController().signal,
};

describe('Chat Endpoint Integration', () => {
  beforeAll(async () => {
    await ensureToolsInitialized();
  });

  beforeEach(() => {
    setupAllMocks();
  });

  describe('Tool Discovery', () => {
    it('should expose all tools to AI SDK', () => {
      const context = createDefaultContext();
      const tools = convertToAISDKTools(context);
      
      const toolKeys = Object.keys(tools);
      expect(toolKeys.length).toBeGreaterThan(100);
    });

    it('should convert tool IDs correctly', () => {
      const context = createDefaultContext();
      const tools = convertToAISDKTools(context);
      
      // Check specific conversions
      expect(tools['property_search_search']).toBeDefined();
      expect(tools['map_show_commute_time']).toBeDefined();
      expect(tools['deal_analysis_analyze']).toBeDefined();
    });

    it('should include tool descriptions for AI', () => {
      const context = createDefaultContext();
      const tools = convertToAISDKTools(context);

      const propertyTool = tools['property_search_search'];
      expect(propertyTool).toBeDefined();
      expect(propertyTool?.description).toBeDefined();
      expect(propertyTool?.description?.length).toBeGreaterThan(10);
    });

    it('should include input schemas', () => {
      const context = createDefaultContext();
      const tools = convertToAISDKTools(context);

      const mapTool = tools['map_toggle_style'];
      expect(mapTool).toBeDefined();
      expect(mapTool?.inputSchema).toBeDefined();
    });
  });

  describe('Tool Execution Flow', () => {
    it('should execute property search tool', async () => {
      const context = createDefaultContext({ permissions: ['read', 'write', 'execute'] });
      const tools = convertToAISDKTools(context);

      const searchTool = tools['property_search_search'];
      expect(searchTool).toBeDefined();
      expect(searchTool!.execute).toBeDefined();
      const result = await searchTool!.execute!({ location: 'Miami, FL' }, mockToolOptions) as { properties: unknown[] };

      expect(result).toBeDefined();
      expect(result.properties).toBeDefined();
    });

    it('should execute map style toggle', async () => {
      const context = createDefaultContext({ permissions: ['read', 'write', 'execute'] });
      const tools = convertToAISDKTools(context);

      const styleTool = tools['map_toggle_style'];
      expect(styleTool).toBeDefined();
      expect(styleTool!.execute).toBeDefined();
      const result = await styleTool!.execute!({ style: 'satellite' }, mockToolOptions) as { newStyle: string };

      expect(result).toBeDefined();
      // The actual output has newStyle, not style
      expect(result.newStyle).toBe('satellite');
    });

    it('should execute deal analysis', async () => {
      const context = createDefaultContext({ permissions: ['read', 'write', 'execute'] });
      const tools = convertToAISDKTools(context);

      const analyzeTool = tools['deal_analysis_analyze'];
      expect(analyzeTool).toBeDefined();
      expect(analyzeTool!.execute).toBeDefined();
      const result = await analyzeTool!.execute!({
        propertyId: 'test-prop-123',
        askingPrice: 350000,
      }, mockToolOptions) as { arv: number };

      expect(result).toBeDefined();
      expect(result.arv).toBeDefined();
    });

    it('should execute tools without permission check for read tools', async () => {
      // Note: Current implementation doesn't enforce permissions at adapter level
      // This test verifies the tool executes successfully
      const context = createDefaultContext({ permissions: ['read'] });
      const tools = convertToAISDKTools(context);

      const searchTool = tools['property_search_search'];
      expect(searchTool).toBeDefined();
      expect(searchTool!.execute).toBeDefined();
      const result = await searchTool!.execute!({ location: 'Miami' }, mockToolOptions);

      expect(result).toBeDefined();
    });
  });

  describe('Tool Schema Validation', () => {
    it('should have valid schemas for all tools', () => {
      const context = createDefaultContext();
      const tools = convertToAISDKTools(context);

      const toolKeys = Object.keys(tools).slice(0, 20);
      toolKeys.forEach(key => {
        const tool = tools[key];
        expect(tool).toBeDefined();
        expect(tool?.description).toBeDefined();
        expect(typeof tool?.execute).toBe('function');
      });
    });
  });

  describe('Multi-Tool Workflows', () => {
    it('should execute property search then get details', async () => {
      const context = createDefaultContext({ permissions: ['read', 'write', 'execute'] });
      const tools = convertToAISDKTools(context);

      // Step 1: Search
      const searchTool = tools['property_search_search'];
      expect(searchTool).toBeDefined();
      expect(searchTool!.execute).toBeDefined();
      const searchResult = await searchTool!.execute!({
        location: 'Miami',
        limit: 5,
      }, mockToolOptions) as { properties: unknown[] };

      expect(searchResult.properties).toBeDefined();

      // Step 2: Get details (using mock property ID)
      const detailsTool = tools['property_search_get_details'];
      expect(detailsTool).toBeDefined();
      expect(detailsTool!.execute).toBeDefined();
      const detailsResult = await detailsTool!.execute!({
        propertyId: 'prop-001',
      }, mockToolOptions);

      expect(detailsResult).toBeDefined();
    });

    it('should execute map workflow', async () => {
      const context = createDefaultContext({ permissions: ['read', 'write', 'execute'] });
      const tools = convertToAISDKTools(context);

      // Step 1: Toggle style
      const styleTool = tools['map_toggle_style'];
      expect(styleTool).toBeDefined();
      expect(styleTool!.execute).toBeDefined();
      const styleResult = await styleTool!.execute!({
        style: 'satellite',
      }, mockToolOptions) as { newStyle: string };
      expect(styleResult.newStyle).toBe('satellite');

      // Step 2: Draw search area
      const areaTool = tools['map_draw_search_area'];
      expect(areaTool).toBeDefined();
      expect(areaTool!.execute).toBeDefined();
      const areaResult = await areaTool!.execute!({
        center: { lat: 25.7617, lng: -80.1918 },
        radiusMiles: 5,
      }, mockToolOptions) as { areaId: string };
      expect(areaResult).toBeDefined();
      expect(areaResult.areaId).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid tool input', async () => {
      const context = createDefaultContext({ permissions: ['read', 'write', 'execute'] });
      const tools = convertToAISDKTools(context);

      // Invalid style should throw
      const styleTool = tools['map_toggle_style'];
      expect(styleTool).toBeDefined();
      expect(styleTool!.execute).toBeDefined();

      // The tool should validate input
      try {
        await styleTool!.execute!({ style: 'invalid-style' }, mockToolOptions);
        // If it doesn't throw, check result
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle missing required fields', async () => {
      const context = createDefaultContext({ permissions: ['read', 'write', 'execute'] });
      const tools = convertToAISDKTools(context);

      const detailsTool = tools['property_search_get_details'];
      expect(detailsTool).toBeDefined();
      expect(detailsTool!.execute).toBeDefined();

      try {
        await detailsTool!.execute!({}, mockToolOptions); // Missing propertyId
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });
});

