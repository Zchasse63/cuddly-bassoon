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
    // Tool IDs use snake_case: crm.create_lead_list
    const expectedTools = [
      'crm.create_lead_list',
      'crm.rank_by_motivation',
      'crm.suggest_outreach',
      'crm.analyze_source',
      'crm.segment_leads',
      'crm.predict_conversion',
      'crm.generate_report',
      'crm.identify_hot',
      'crm.track_engagement',
      'crm.suggest_nurturing',
      'crm.merge_leads',
      'crm.export_leads',
    ];

    expectedTools.forEach(toolId => {
      it(`should register ${toolId}`, () => {
        const tool = toolRegistry.get(toolId);
        expect(tool).toBeDefined();
        expect(tool?.category).toBe('crm');
      });
    });
  });

  describe('crm.create_lead_list', () => {
    it('should accept valid list creation input', () => {
      const tool = toolRegistry.get('crm.create_lead_list');

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
      const tool = toolRegistry.get('crm.create_lead_list');

      const invalidInput = {
        // Missing name
        description: 'Test list',
      };

      const parseResult = tool?.inputSchema.safeParse(invalidInput);
      expect(parseResult?.success).toBe(false);
    });

    it('should accept minimal input', () => {
      const tool = toolRegistry.get('crm.create_lead_list');

      const minimalInput = { name: 'Test List' };
      const parseResult = tool?.inputSchema.safeParse(minimalInput);
      expect(parseResult?.success).toBe(true);
    });
  });

  describe('crm.rank_by_motivation', () => {
    it('should accept list ID and limit', () => {
      const tool = toolRegistry.get('crm.rank_by_motivation');

      // Match actual schema: listId (optional), limit
      const validInput = {
        listId: 'list-123',
        limit: 50,
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should accept empty input (uses defaults)', () => {
      const tool = toolRegistry.get('crm.rank_by_motivation');

      const parseResult = tool?.inputSchema.safeParse({});
      expect(parseResult?.success).toBe(true);
    });
  });

  describe('crm.suggest_outreach', () => {
    it('should accept limit for outreach suggestions', () => {
      const tool = toolRegistry.get('crm.suggest_outreach');

      // Match actual schema: limit
      const validInput = { limit: 10 };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should accept empty input (uses defaults)', () => {
      const tool = toolRegistry.get('crm.suggest_outreach');

      const parseResult = tool?.inputSchema.safeParse({});
      expect(parseResult?.success).toBe(true);
    });
  });

  describe('crm.segment_leads', () => {
    it('should accept segmentation criteria', () => {
      const tool = toolRegistry.get('crm.segment_leads');

      // Actual schema requires criteria enum
      const validInput = { criteria: 'motivation' };
      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should require criteria field', () => {
      const tool = toolRegistry.get('crm.segment_leads');

      const parseResult = tool?.inputSchema.safeParse({});
      expect(parseResult?.success).toBe(false);
    });
  });

  describe('crm.predict_conversion', () => {
    it('should accept lead ID', () => {
      const tool = toolRegistry.get('crm.predict_conversion');

      // Match actual schema: leadId
      const validInput = { leadId: 'lead-123' };
      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should require leadId', () => {
      const tool = toolRegistry.get('crm.predict_conversion');

      const invalidInput = {};
      const parseResult = tool?.inputSchema.safeParse(invalidInput);
      expect(parseResult?.success).toBe(false);
    });
  });

  describe('crm.identify_hot', () => {
    it('should accept threshold and limit', () => {
      const tool = toolRegistry.get('crm.identify_hot');

      // Match actual schema: threshold, limit
      const validInput = {
        threshold: 70,
        limit: 25,
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should accept empty input (uses defaults)', () => {
      const tool = toolRegistry.get('crm.identify_hot');

      const parseResult = tool?.inputSchema.safeParse({});
      expect(parseResult?.success).toBe(true);
    });
  });

  describe('crm.merge_leads', () => {
    it('should accept primary and duplicate lead IDs', () => {
      const tool = toolRegistry.get('crm.merge_leads');

      // Actual schema: primaryLeadId, duplicateLeadIds (array)
      const validInput = {
        primaryLeadId: 'lead-main',
        duplicateLeadIds: ['lead-dup-1', 'lead-dup-2'],
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });

    it('should require both fields', () => {
      const tool = toolRegistry.get('crm.merge_leads');

      const invalidInput = {
        primaryLeadId: 'lead-main',
        // Missing duplicateLeadIds
      };

      const parseResult = tool?.inputSchema.safeParse(invalidInput);
      expect(parseResult?.success).toBe(false);
    });
  });

  describe('crm.export_leads', () => {
    it('should accept export format', () => {
      const tool = toolRegistry.get('crm.export_leads');

      const validInput = {
        format: 'csv',
        listId: 'list-123',
      };

      const parseResult = tool?.inputSchema.safeParse(validInput);
      expect(parseResult?.success).toBe(true);
    });
  });
});

