/**
 * Dashboard Analytics Tools Tests
 * Tests for dashboard and analytics AI tools
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { toolRegistry } from '../../../registry';
import { registerDashboardAnalyticsTools } from '../../../categories/dashboard-analytics';

describe('Dashboard Analytics Tools', () => {
  beforeAll(() => {
    registerDashboardAnalyticsTools();
  });

  const dashboardTools = [
    'dashboard.insights',
    'dashboard.goals',
    'dashboard.performance',
    'dashboard.report',
    'dashboard.anomalies',
    'dashboard.trends',
    'dashboard.activity',
    'dashboard.funnel',
    'dashboard.compare_periods',
    'dashboard.alerts',
    'dashboard.recommendations',
    'dashboard.kpis',
  ];

  describe('Tool Registration', () => {
    dashboardTools.forEach(toolId => {
      it(`should register ${toolId}`, () => {
        const tool = toolRegistry.get(toolId);
        expect(tool).toBeDefined();
        // Dashboard tools are registered under 'reporting' category
        expect(tool?.category).toBe('reporting');
      });
    });
  });

  describe('dashboard.insights', () => {
    it('should accept insights input', () => {
      const tool = toolRegistry.get('dashboard.insights');
      const validInput = {
        period: 'week',
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });

    it('should accept empty input (uses defaults)', () => {
      const tool = toolRegistry.get('dashboard.insights');
      const result = tool?.inputSchema.safeParse({});
      expect(result?.success).toBe(true);
    });
  });

  describe('dashboard.goals', () => {
    it('should accept empty input', () => {
      const tool = toolRegistry.get('dashboard.goals');
      const result = tool?.inputSchema.safeParse({});
      expect(result?.success).toBe(true);
    });
  });

  describe('dashboard.performance', () => {
    it('should accept period input', () => {
      const tool = toolRegistry.get('dashboard.performance');
      const validInput = {
        period: 'month',
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });
  });

  describe('dashboard.anomalies', () => {
    it('should accept metric input', () => {
      const tool = toolRegistry.get('dashboard.anomalies');
      const validInput = {
        metric: 'deals',
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });
  });

  describe('dashboard.funnel', () => {
    it('should accept period input', () => {
      const tool = toolRegistry.get('dashboard.funnel');
      const validInput = {
        period: 'month',
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });
  });

  describe('dashboard.compare_periods', () => {
    it('should accept period comparison input', () => {
      const tool = toolRegistry.get('dashboard.compare_periods');
      const validInput = {
        period1: 'last_week',
        period2: 'this_week',
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });
  });

  describe('dashboard.recommendations', () => {
    it('should accept focus input', () => {
      const tool = toolRegistry.get('dashboard.recommendations');
      const validInput = {
        focus: 'growth',
      };
      const result = tool?.inputSchema.safeParse(validInput);
      expect(result?.success).toBe(true);
    });
  });

  describe('dashboard.kpis', () => {
    it('should accept empty input', () => {
      const tool = toolRegistry.get('dashboard.kpis');
      const result = tool?.inputSchema.safeParse({});
      expect(result?.success).toBe(true);
    });
  });

  describe('Tool Metadata', () => {
    it('should all have read permission', () => {
      dashboardTools.forEach(toolId => {
        const tool = toolRegistry.get(toolId);
        expect(tool?.requiredPermission).toBe('read');
      });
    });

    it('should have dashboard/analytics tags', () => {
      dashboardTools.forEach(toolId => {
        const tool = toolRegistry.get(toolId);
        expect(tool?.tags).toBeDefined();
        expect(tool?.tags.some(t => ['dashboard', 'analytics', 'reporting', 'insights'].includes(t))).toBe(true);
      });
    });
  });
});
