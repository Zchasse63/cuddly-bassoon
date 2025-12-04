/**
 * New API Integrations Test
 * Tests the 5 tool categories being fixed to use real APIs:
 * 1. Heat Mapping (14 tools) - RentCast + Shovels
 * 2. Dashboard Analytics (12 tools) - Supabase
 * 3. Property Detail Tools (13 tools) - Supabase + RentCast
 * 4. Filter Tools (11 tools) - Supabase
 * 5. Buyer Management (13 tools) - Supabase
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { toolRegistry } from '@/lib/ai/tools/registry';
import { registerHeatMappingTools } from '@/lib/ai/tools/categories/heat-mapping';
import { registerDashboardAnalyticsTools } from '@/lib/ai/tools/categories/dashboard-analytics';
import { registerPropertyDetailTools } from '@/lib/ai/tools/categories/property-detail-tools';
import { registerFilterTools } from '@/lib/ai/tools/categories/filter-tools';
import { registerBuyerManagementTools } from '@/lib/ai/tools/categories/buyer-management';
import type { ToolExecutionContext } from '@/lib/ai/tools/types';
import { TEST_USER_ID, TEST_SESSION_ID } from './setup';

// Test context using the seeded test user ID from the database
const testContext: ToolExecutionContext = {
  userId: TEST_USER_ID,  // Uses seeded test user: 827d4b30-542d-4943-9c28-a16977aab13b
  sessionId: TEST_SESSION_ID,
  permissions: ['read', 'write'],
};

// Register all tools before tests
beforeAll(() => {
  registerHeatMappingTools();
  registerDashboardAnalyticsTools();
  registerPropertyDetailTools();
  registerFilterTools();
  registerBuyerManagementTools();
});

describe('Heat Mapping Tools - Real API Integration', () => {
  const MIAMI_ZIP = '33101';

  it('analyze_area calls RentCast API', async () => {
    const tool = toolRegistry.get('heat_mapping.analyze_area');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ zipCode: MIAMI_ZIP }, testContext) as { zipCode: string; opportunityScore: number; avgPrice: number };
    console.log('[Heat Mapping] analyze_area result:', result);

    expect(result.zipCode).toBe(MIAMI_ZIP);
    expect(typeof result.opportunityScore).toBe('number');
    expect(typeof result.avgPrice).toBe('number');
  });

  it('price_trends calls RentCast API', async () => {
    const tool = toolRegistry.get('heat_mapping.price_trends');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ zipCode: MIAMI_ZIP, months: 12 }, testContext) as { trend: string; changePercent: number };
    console.log('[Heat Mapping] price_trends result:', result);

    expect(['up', 'stable', 'down']).toContain(result.trend);
    expect(typeof result.changePercent).toBe('number');
  });

  it('rental_yield calls RentCast API', async () => {
    const tool = toolRegistry.get('heat_mapping.rental_yield');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ zipCode: MIAMI_ZIP }, testContext) as { avgYield: number; avgRent: number };
    console.log('[Heat Mapping] rental_yield result:', result);

    expect(typeof result.avgYield).toBe('number');
    expect(typeof result.avgRent).toBe('number');
  });

  it('development calls Shovels API', async () => {
    const tool = toolRegistry.get('heat_mapping.development');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ zipCode: MIAMI_ZIP }, testContext) as { permits: number; growthScore: number };
    console.log('[Heat Mapping] development result:', result);

    expect(typeof result.permits).toBe('number');
    expect(typeof result.growthScore).toBe('number');
  });
});

describe('Dashboard Analytics Tools - Real Supabase Integration', () => {
  it('dashboard.insights returns data from Supabase', async () => {
    const tool = toolRegistry.get('dashboard.insights');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ period: 'week' }, testContext) as { insights: unknown[]; summary: string };
    console.log('[Dashboard] insights result:', result);

    expect(Array.isArray(result.insights)).toBe(true);
    expect(typeof result.summary).toBe('string');
  });

  it('dashboard.performance returns data from Supabase', async () => {
    const tool = toolRegistry.get('dashboard.performance');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ period: 'month' }, testContext) as { deals: unknown; revenue: unknown };
    console.log('[Dashboard] performance result:', result);

    expect(result.deals).toBeDefined();
    expect(result.revenue).toBeDefined();
  });

  it('dashboard.goals returns data from Supabase', async () => {
    const tool = toolRegistry.get('dashboard.goals');
    expect(tool).toBeDefined();

    const result = await tool!.handler({}, testContext) as { goals: unknown[]; overallProgress: number };
    console.log('[Dashboard] goals result:', result);

    expect(Array.isArray(result.goals)).toBe(true);
    expect(typeof result.overallProgress).toBe('number');
  });
});

describe('Filter Tools - Supabase Integration', () => {
  it('filter.suggest provides suggestions', async () => {
    const tool = toolRegistry.get('filter.suggest');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ goal: 'flip', budget: 200000 }, testContext) as { suggestions: unknown[] };
    console.log('[Filter] suggest result:', result);

    expect(Array.isArray(result.suggestions)).toBe(true);
  });

  it('filter.validate checks criteria', async () => {
    const tool = toolRegistry.get('filter.validate');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ criteria: { minPrice: 100000, maxPrice: 300000 } }, testContext) as { valid: boolean };
    console.log('[Filter] validate result:', result);

    expect(typeof result.valid).toBe('boolean');
  });
});

describe('Buyer Management Tools - Supabase Integration', () => {
  it('buyer.search_buyers queries Supabase', async () => {
    const tool = toolRegistry.get('buyer_management.search_buyers');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ limit: 5 }, testContext) as { buyers: unknown[]; total: number };
    console.log('[Buyer] search_buyers result:', result);

    expect(Array.isArray(result.buyers)).toBe(true);
    expect(typeof result.total).toBe('number');
  });

  it('buyer.analyze_activity queries Supabase', async () => {
    const tool = toolRegistry.get('buyer_management.analyze_buyer_activity');
    expect(tool).toBeDefined();

    const result = await tool!.handler({ timeframeDays: 30 }, testContext) as { summary: unknown; topBuyers: unknown[] };
    console.log('[Buyer] analyze_activity result:', result);

    expect(result.summary).toBeDefined();
    expect(Array.isArray(result.topBuyers)).toBe(true);
  });
});

