/**
 * Permit Tools Tests
 * Tests for Shovels permit AI tools
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { toolRegistry } from '../../../registry';
import { registerPermitTools } from '../../../categories/permit-tools';

describe('Permit Tools', () => {
  beforeAll(() => {
    registerPermitTools();
  });

  const permitTools = [
    'permit.history',
    'permit.details',
    'permit.search',
    'permit.metrics',
    'permit.analyze_patterns',
    'permit.check_system_age',
    'permit.deferred_maintenance',
    'permit.stalled',
  ];

  describe('Tool Registration', () => {
    permitTools.forEach(toolId => {
      it(`should register ${toolId}`, () => {
        const tool = toolRegistry.get(toolId);
        expect(tool).toBeDefined();
        expect(tool?.category).toBe('permits');
      });
    });
  });

  describe('permit.history', () => {
    it('should accept valid history input', () => {
      const tool = toolRegistry.get('permit.history');
      const validInput = {
        addressId: 'addr-12345',
        fromDate: '2020-01-01',
        toDate: '2024-01-01',
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });

    it('should require addressId', () => {
      const tool = toolRegistry.get('permit.history');
      const invalidInput = { fromDate: '2020-01-01' };
      const result = tool?.inputSchema.safeParse(invalidInput);
      expect(result?.success).toBe(false);
    });
  });

  describe('permit.details', () => {
    it('should accept permit ID', () => {
      const tool = toolRegistry.get('permit.details');
      const validInput = { permitId: 'permit-12345' };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });
  });

  describe('permit.search', () => {
    it('should accept search criteria', () => {
      const tool = toolRegistry.get('permit.search');
      const validInput = {
        geoId: '33101',
        fromDate: '2023-01-01',
        toDate: '2024-01-01',
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });

    it('should require geoId and dates', () => {
      const tool = toolRegistry.get('permit.search');
      const invalidInput = { geoId: '33101' }; // Missing required dates
      const result = tool?.inputSchema.safeParse(invalidInput);
      expect(result?.success).toBe(false);
    });
  });

  describe('permit.metrics', () => {
    it('should accept address ID', () => {
      const tool = toolRegistry.get('permit.metrics');
      const validInput = { addressId: 'addr-12345' };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });
  });

  describe('permit.analyze_patterns', () => {
    it('should accept pattern analysis input', () => {
      const tool = toolRegistry.get('permit.analyze_patterns');
      const validInput = { addressId: 'addr-12345' };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });
  });

  describe('permit.check_system_age', () => {
    it('should accept system age input', () => {
      const tool = toolRegistry.get('permit.check_system_age');
      const validInput = {
        addressId: 'addr-12345',
        systems: ['roof', 'hvac', 'electrical'],
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });
  });

  describe('permit.deferred_maintenance', () => {
    it('should accept deferred maintenance input', () => {
      const tool = toolRegistry.get('permit.deferred_maintenance');
      const validInput = { geoId: '33101', minYearsWithoutPermit: 5 };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });

    it('should require geoId', () => {
      const tool = toolRegistry.get('permit.deferred_maintenance');
      const invalidInput = { minYearsWithoutPermit: 5 };
      const result = tool?.inputSchema.safeParse(invalidInput);
      expect(result?.success).toBe(false);
    });
  });

  describe('permit.stalled', () => {
    it('should accept stalled permit search input', () => {
      const tool = toolRegistry.get('permit.stalled');
      const validInput = {
        geoId: '33101',
        minStallDays: 90,
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });

    it('should require geoId', () => {
      const tool = toolRegistry.get('permit.stalled');
      const invalidInput = { minStallDays: 90 };
      const result = tool?.inputSchema.safeParse(invalidInput);
      expect(result?.success).toBe(false);
    });
  });

  describe('Tool Metadata', () => {
    it('should all have read permission', () => {
      permitTools.forEach(toolId => {
        const tool = toolRegistry.get(toolId);
        expect(tool?.requiredPermission).toBe('read');
      });
    });

    it('should have permit-related tags', () => {
      permitTools.forEach(toolId => {
        const tool = toolRegistry.get(toolId);
        expect(tool?.tags).toBeDefined();
        expect(tool?.tags.some(t => ['permit', 'shovels', 'renovation', 'history'].includes(t))).toBe(true);
      });
    });
  });
});
