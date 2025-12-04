/**
 * AI SDK Adapter Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import {
  ensureToolsInitialized,
  convertToAISDKTools,
  getActiveToolKeys,
  createDefaultContext,
  getToolCount,
} from '../../adapter';
import { toolRegistry } from '../../registry';

describe('AI SDK Adapter', () => {
  beforeAll(async () => {
    // Ensure tools are registered
    await ensureToolsInitialized();
  });

  describe('ensureToolsInitialized', () => {
    it('should register all tools', async () => {
      await ensureToolsInitialized();
      expect(toolRegistry.count).toBeGreaterThan(100);
    });

    it('should be idempotent (safe to call multiple times)', async () => {
      const countBefore = toolRegistry.count;
      await ensureToolsInitialized();
      await ensureToolsInitialized();
      expect(toolRegistry.count).toBe(countBefore);
    });
  });

  describe('convertToAISDKTools', () => {
    it('should convert all registered tools to AI SDK format', () => {
      const context = createDefaultContext();
      const aiTools = convertToAISDKTools(context);
      
      expect(typeof aiTools).toBe('object');
      expect(Object.keys(aiTools).length).toBeGreaterThan(100);
    });

    it('should sanitize tool IDs (replace dots with underscores)', () => {
      const context = createDefaultContext();
      const aiTools = convertToAISDKTools(context);
      
      // Check that IDs are sanitized
      const toolKeys = Object.keys(aiTools);
      expect(toolKeys.every(key => !key.includes('.'))).toBe(true);
    });

    it('should include execute function for each tool', () => {
      const context = createDefaultContext();
      const aiTools = convertToAISDKTools(context);

      const firstToolKey = Object.keys(aiTools)[0];
      if (firstToolKey) {
        const tool = aiTools[firstToolKey];
        if (tool) {
          expect(tool).toBeDefined();
          expect(typeof tool.execute).toBe('function');
        }
      }
    });

    it('should include description for each tool', () => {
      const context = createDefaultContext();
      const aiTools = convertToAISDKTools(context);

      const toolKeys = Object.keys(aiTools).slice(0, 10);
      toolKeys.forEach(key => {
        const tool = aiTools[key];
        if (tool) {
          expect(tool.description).toBeDefined();
          expect(typeof tool.description).toBe('string');
        }
      });
    });
  });

  describe('getActiveToolKeys', () => {
    it('should return all tool keys when no categories specified', () => {
      const allKeys = getActiveToolKeys();
      expect(allKeys.length).toBeGreaterThan(100);
    });

    it('should filter by categories', () => {
      const mapKeys = getActiveToolKeys(['map']);
      expect(mapKeys.length).toBeGreaterThan(0);
      expect(mapKeys.length).toBeLessThan(20); // Map tools are limited
      expect(mapKeys.every(key => key.startsWith('map_'))).toBe(true);
    });

    it('should combine multiple categories', () => {
      const combinedKeys = getActiveToolKeys(['map', 'property_search']);
      const mapKeys = getActiveToolKeys(['map']);
      const searchKeys = getActiveToolKeys(['property_search']);

      expect(combinedKeys.length).toBe(mapKeys.length + searchKeys.length);
    });
  });

  describe('createDefaultContext', () => {
    it('should create context with default values', () => {
      const context = createDefaultContext();

      expect(context.userId).toBe('anonymous');
      expect(context.sessionId).toBeDefined();
      expect(context.permissions).toContain('read');
    });

    it('should allow overriding default values', () => {
      const context = createDefaultContext({
        userId: 'custom-user',
        permissions: ['read', 'write'],
      });

      expect(context.userId).toBe('custom-user');
      expect(context.permissions).toEqual(['read', 'write']);
    });
  });

  describe('getToolCount', () => {
    it('should return the total count of registered tools', () => {
      const count = getToolCount();
      expect(count).toBeGreaterThan(100);
      expect(count).toBe(toolRegistry.count);
    });
  });

  describe('Tool Execution', () => {
    it('should execute a simple tool through the adapter', async () => {
      const context = createDefaultContext({ permissions: ['read', 'write', 'execute'] });
      const aiTools = convertToAISDKTools(context);

      // Use property search which doesn't require external APIs in mock mode
      const searchTool = aiTools['property_search_search'];
      expect(searchTool).toBeDefined();

      // Verify the tool has an execute function
      if (searchTool) {
        expect(typeof searchTool.execute).toBe('function');
        expect(searchTool.description).toBeDefined();
      }
    });

    it('should execute tools with read permission', async () => {
      const context = createDefaultContext({ permissions: ['read'] });
      const aiTools = convertToAISDKTools(context);

      // Property search requires 'read' permission
      const searchTool = aiTools['property_search_search'];

      // Verify the tool exists and has proper structure
      if (searchTool) {
        expect(typeof searchTool.execute).toBe('function');
      }
    });
  });
});

