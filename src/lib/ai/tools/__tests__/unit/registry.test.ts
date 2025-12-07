/**
 * Tool Registry Tests
 */

import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { z } from 'zod';
import { toolRegistry } from '../../registry';
import { registerAllTools } from '../../categories';
import type { ToolDefinition, ToolHandler } from '../../types';

describe('Tool Registry', () => {
  beforeAll(() => {
    registerAllTools();
  });

  afterEach(() => {
    // Unregister any test tools created during tests
    const testTools = toolRegistry.getAll().filter(t => t.id.startsWith('test.'));
    testTools.forEach(t => toolRegistry.unregister(t.id));
  });

  describe('register', () => {
    it('should register a tool with valid definition and handler', () => {
      const definition: ToolDefinition<{ query: string }, { result: string }> = {
        id: 'test.register',
        name: 'Test Register Tool',
        description: 'A test tool for registration',
        category: 'property_search',
        requiredPermission: 'read',
        requiresConfirmation: false,
        tags: ['test', 'registration'],
        inputSchema: z.object({ query: z.string() }),
        outputSchema: z.object({ result: z.string() }),
      };

      const handler: ToolHandler<{ query: string }, { result: string }> = async (input) => {
        return { result: `Processed: ${input.query}` };
      };

      toolRegistry.register(definition, handler);
      expect(toolRegistry.has('test.register')).toBe(true);
    });

    it('should index tool by category', () => {
      const definition: ToolDefinition<{ id: string }, { data: unknown }> = {
        id: 'test.category_index',
        name: 'Test Category Index',
        description: 'Tests category indexing',
        category: 'property_search',
        requiredPermission: 'read',
        requiresConfirmation: false,
        tags: ['test'],
        inputSchema: z.object({ id: z.string() }),
        outputSchema: z.object({ data: z.unknown() }),
      };

      toolRegistry.register(definition, async () => ({ data: null }));

      const propertyTools = toolRegistry.getByCategory('property_search');
      expect(propertyTools.some(t => t.id === 'test.category_index')).toBe(true);
    });

    it('should index tool by tags', () => {
      const definition: ToolDefinition<Record<string, never>, { ok: boolean }> = {
        id: 'test.tag_index',
        name: 'Test Tag Index',
        description: 'Tests tag indexing',
        category: 'utility',
        requiredPermission: 'read',
        requiresConfirmation: false,
        tags: ['unique-test-tag', 'another-tag'],
        inputSchema: z.object({}),
        outputSchema: z.object({ ok: z.boolean() }),
      };

      toolRegistry.register(definition, async () => ({ ok: true }));

      const foundTools = toolRegistry.find({ tags: ['unique-test-tag'] });
      expect(foundTools.some(t => t.id === 'test.tag_index')).toBe(true);
    });
  });

  describe('get', () => {
    it('should return registered tool by ID', () => {
      const tool = toolRegistry.get('property_search.search');
      expect(tool).toBeDefined();
      if (tool) {
        expect(tool.id).toBe('property_search.search');
      }
    });

    it('should return undefined for non-existent tool', () => {
      const tool = toolRegistry.get('non.existent.tool');
      expect(tool).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for existing tool', () => {
      expect(toolRegistry.has('property_search.search')).toBe(true);
    });

    it('should return false for non-existent tool', () => {
      expect(toolRegistry.has('does.not.exist')).toBe(false);
    });
  });

  describe('getAll', () => {
    it('should return all registered tools', () => {
      const allTools = toolRegistry.getAll();
      expect(Array.isArray(allTools)).toBe(true);
      expect(allTools.length).toBeGreaterThan(100);
    });
  });

  describe('find', () => {
    it('should filter by category', () => {
      const searchTools = toolRegistry.find({ category: 'property_search' });
      expect(searchTools.every(t => t.category === 'property_search')).toBe(true);
    });

    it('should filter by permission level', () => {
      const readTools = toolRegistry.find({ permission: 'read' });
      expect(readTools.every(t => t.requiredPermission === 'read')).toBe(true);
    });

    it('should filter by search text', () => {
      const propertyTools = toolRegistry.find({ search: 'property' });
      expect(propertyTools.length).toBeGreaterThan(0);
    });
  });

  describe('getByCategory', () => {
    it('should return tools in specified category', () => {
      const mapTools = toolRegistry.getByCategory('map');
      expect(mapTools.length).toBeGreaterThan(0);
      expect(mapTools.every(t => t.category === 'map')).toBe(true);
    });
  });

  describe('unregister', () => {
    it('should remove a registered tool', () => {
      const definition: ToolDefinition<Record<string, never>, { ok: boolean }> = {
        id: 'test.unregister',
        name: 'Test Unregister',
        description: 'To be unregistered',
        category: 'utility',
        requiredPermission: 'read',
        requiresConfirmation: false,
        tags: ['test'],
        inputSchema: z.object({}),
        outputSchema: z.object({ ok: z.boolean() }),
      };

      toolRegistry.register(definition, async () => ({ ok: true }));
      expect(toolRegistry.has('test.unregister')).toBe(true);

      const result = toolRegistry.unregister('test.unregister');
      expect(result).toBe(true);
      expect(toolRegistry.has('test.unregister')).toBe(false);
    });

    it('should return false when unregistering non-existent tool', () => {
      const result = toolRegistry.unregister('non.existent');
      expect(result).toBe(false);
    });
  });

  describe('count', () => {
    it('should return total number of registered tools', () => {
      expect(toolRegistry.count).toBeGreaterThan(100);
    });
  });

  describe('getCategoryCounts', () => {
    it('should return counts per category', () => {
      const counts = toolRegistry.getCategoryCounts();
      expect(typeof counts).toBe('object');
      // Check for actual category names used in the codebase
      expect(Object.keys(counts).length).toBeGreaterThan(10);
    });
  });
});

