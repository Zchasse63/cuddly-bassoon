/**
 * CRM Tools Tests
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { toolRegistry } from '../../../registry';
import { registerCrmTools } from '../../../categories/crm-tools';

describe('CRM Tools', () => {
  beforeAll(() => {
    registerCrmTools();
  });

  describe('Tool Registration', () => {
    const expectedTools = [
      'crm.createLeadList',
      'crm.rankByMotivation',
      'crm.suggestOutreach',
      'crm.analyzeSource',
      'crm.segmentLeads',
      'crm.predictConversion',
      'crm.generateReport',
      'crm.identifyHot',
      'crm.trackEngagement',
      'crm.suggestNurturing',
      'crm.mergeLeads',
      'crm.exportLeads',
    ];

    expectedTools.forEach(toolId => {
      it(`should register ${toolId}`, () => {
        const tool = toolRegistry.get(toolId);
        expect(tool).toBeDefined();
        expect(tool?.category).toBe('crm');
      });
    });
  });

  describe('crm.createLeadList', () => {
    it('should accept valid list creation input', () => {
      const tool = toolRegistry.get('crm.createLeadList');

      // Match actual schema: name, description, listType, filterCriteria
      const validInput = {
        name: 'Hot Leads Q1',
        description: 'High motivation leads from Q1',
        listType: 'static',
        filterCriteria: { motivationScore: { min: 70 } },
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should require list name', () => {
      const tool = toolRegistry.get('crm.createLeadList');

      const invalidInput = {
        // Missing name
        description: 'Test list',
      };

      const parseResult = tool?.inputSchema.safeParse(invalidInput);
      expect(parseResult?.success).toBe(false);
    });

    it('should accept minimal input', () => {
      const tool = toolRegistry.get('crm.createLeadList');

      const minimalInput = { name: 'Test List' };
      const parseResult = tool?.inputSchema.safeParse(minimalInput);
      expect(parseResult?.success).toBe(true);
    });
  });

  describe('crm.rankByMotivation', () => {
    it('should accept list ID and limit', () => {
      const tool = toolRegistry.get('crm.rankByMotivation');

      // Match actual schema: listId (optional), limit
      const validInput = {
        listId: 'list-123',
        limit: 50,
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should accept empty input (uses defaults)', () => {
      const tool = toolRegistry.get('crm.rankByMotivation');

      const parseResult = tool?.inputSchema.safeParse({});
      expect(parseResult?.success).toBe(true);
    });
  });

  describe('crm.suggestOutreach', () => {
    it('should accept limit for outreach suggestions', () => {
      const tool = toolRegistry.get('crm.suggestOutreach');

      // Match actual schema: limit
      const validInput = { limit: 10 };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should accept empty input (uses defaults)', () => {
      const tool = toolRegistry.get('crm.suggestOutreach');

      const parseResult = tool?.inputSchema.safeParse({});
      expect(parseResult?.success).toBe(true);
    });
  });

  describe('crm.segmentLeads', () => {
    it('should accept segmentation criteria', () => {
      const tool = toolRegistry.get('crm.segmentLeads');

      // Actual schema requires criteria enum
      const validInput = { criteria: 'motivation' };
      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should require criteria field', () => {
      const tool = toolRegistry.get('crm.segmentLeads');

      const parseResult = tool?.inputSchema.safeParse({});
      expect(parseResult?.success).toBe(false);
    });
  });

  describe('crm.predictConversion', () => {
    it('should accept lead ID', () => {
      const tool = toolRegistry.get('crm.predictConversion');

      // Match actual schema: leadId
      const validInput = { leadId: 'lead-123' };
      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should require leadId', () => {
      const tool = toolRegistry.get('crm.predictConversion');

      const invalidInput = {};
      const parseResult = tool?.inputSchema.safeParse(invalidInput);
      expect(parseResult?.success).toBe(false);
    });
  });

  describe('crm.identifyHot', () => {
    it('should accept threshold and limit', () => {
      const tool = toolRegistry.get('crm.identifyHot');

      // Match actual schema: threshold, limit
      const validInput = {
        threshold: 70,
        limit: 25,
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should accept empty input (uses defaults)', () => {
      const tool = toolRegistry.get('crm.identifyHot');

      const parseResult = tool?.inputSchema.safeParse({});
      expect(parseResult?.success).toBe(true);
    });
  });

  describe('crm.mergeLeads', () => {
    it('should accept primary and duplicate lead IDs', () => {
      const tool = toolRegistry.get('crm.mergeLeads');

      // Actual schema: primaryLeadId, duplicateLeadIds (array)
      const validInput = {
        primaryLeadId: 'lead-main',
        duplicateLeadIds: ['lead-dup-1', 'lead-dup-2'],
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should require both fields', () => {
      const tool = toolRegistry.get('crm.mergeLeads');

      const invalidInput = {
        primaryLeadId: 'lead-main',
        // Missing duplicateLeadIds
      };

      const parseResult = tool?.inputSchema.safeParse(invalidInput);
      expect(parseResult?.success).toBe(false);
    });
  });

  describe('crm.exportLeads', () => {
    it('should accept export format', () => {
      const tool = toolRegistry.get('crm.exportLeads');

      const validInput = {
        format: 'csv',
        listId: 'list-123',
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });
  });
});

