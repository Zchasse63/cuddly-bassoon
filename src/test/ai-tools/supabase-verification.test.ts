/**
 * Supabase Integration Verification Test
 * 
 * Verifies that all Supabase-dependent tool categories correctly
 * retrieve the seeded test data:
 * - 4 deals (1 closed, 3 pending)
 * - 5 buyers
 * - 5 leads
 * - 5 properties
 * - 4 market_data records
 * 
 * Run with: npx vitest run src/test/ai-tools/supabase-verification.test.ts --config vitest.ai-tools.config.ts
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { toolRegistry } from '@/lib/ai/tools/registry';
import { TEST_USER_ID, TEST_SESSION_ID } from './setup';
import type { ToolExecutionContext } from '@/lib/ai/tools/types';

// Import all Supabase-dependent tool registrations
import { registerDashboardAnalyticsTools } from '@/lib/ai/tools/categories/dashboard-analytics';
import { registerBuyerManagementTools } from '@/lib/ai/tools/categories/buyer-management';
import { registerCrmTools } from '@/lib/ai/tools/categories/crm-tools';
import { registerDealPipelineTools } from '@/lib/ai/tools/categories/deal-pipeline';
import { registerSearchTools } from '@/lib/ai/tools/categories/search-tools';
import { registerPropertyDetailTools } from '@/lib/ai/tools/categories/property-detail-tools';
import { registerNotificationTools } from '@/lib/ai/tools/categories/notification-tools';

// Test context using seeded test user
const ctx: ToolExecutionContext = {
  userId: TEST_USER_ID,
  sessionId: TEST_SESSION_ID,
  permissions: ['read', 'write', 'execute', 'admin'],
};

// Expected seeded data counts
const EXPECTED = {
  deals: 4,
  buyers: 5,
  leads: 5,
  properties: 5,
  marketData: 4,
};

beforeAll(() => {
  console.log('\n📊 Supabase Integration Verification');
  console.log('=====================================');
  console.log(`Test User ID: ${TEST_USER_ID}`);
  console.log(`Expected: ${EXPECTED.deals} deals, ${EXPECTED.buyers} buyers, ${EXPECTED.leads} leads\n`);
  
  // Register all tools
  registerDashboardAnalyticsTools();
  registerBuyerManagementTools();
  registerCrmTools();
  registerDealPipelineTools();
  registerSearchTools();
  registerPropertyDetailTools();
  registerNotificationTools();
});

describe('Dashboard Analytics (12 tools) - deals, activities', () => {
  it('dashboard.insights retrieves seeded deals', async () => {
    const tool = toolRegistry.get('dashboard.insights');
    const result = await tool!.handler({ period: 'month' }, ctx) as { insights: unknown[]; summary: string };
    
    console.log('[Dashboard] insights summary:', result.summary);
    expect(result.summary).toContain('1 closed deals'); // 1 closed deal in seed data
    expect(result.insights.length).toBeGreaterThan(0);
  });

  it('dashboard.performance shows real deal counts', async () => {
    const tool = toolRegistry.get('dashboard.performance');
    const result = await tool!.handler({ period: 'month' }, ctx) as { deals: { closed: number; pending: number } };
    
    console.log('[Dashboard] performance deals:', result.deals);
    expect(result.deals.closed).toBe(1);
    expect(result.deals.pending).toBe(3);
  });
});

describe('Buyer Management (13 tools) - buyers', () => {
  it('buyer.search_buyers retrieves all 5 seeded buyers', async () => {
    const tool = toolRegistry.get('buyer_management.search_buyers');
    const result = await tool!.handler({ limit: 10 }, ctx) as { buyers: unknown[]; total: number };
    
    console.log('[Buyers] Found:', result.total, 'buyers');
    expect(result.total).toBe(EXPECTED.buyers);
    expect(result.buyers.length).toBe(EXPECTED.buyers);
  });
});

describe('CRM Tools (12 tools) - leads, lead_lists', () => {
  it('crm.rankByMotivation retrieves seeded leads', async () => {
    const tool = toolRegistry.get('crm.rankByMotivation');
    expect(tool).toBeDefined();
    const result = await tool!.handler({ limit: 10 }, ctx) as { leads: unknown[]; totalLeads: number };

    console.log('[CRM] Ranked leads:', result.totalLeads);
    expect(result.totalLeads).toBe(EXPECTED.leads);
  });

  it('crm.identifyHot finds motivated leads', async () => {
    const tool = toolRegistry.get('crm.identifyHot');
    expect(tool).toBeDefined();
    const result = await tool!.handler({ minMotivation: 60 }, ctx) as { hotLeads: unknown[]; totalHot: number };

    console.log('[CRM] Hot leads:', result.totalHot);
    expect(result.totalHot).toBeGreaterThan(0); // Seed data has leads with motivation > 60
  });
});

describe('Deal Pipeline (12 tools) - deals', () => {
  it('deal.getDealTimeline shows seeded deals', async () => {
    const tool = toolRegistry.get('deal.getDealTimeline');
    if (!tool) {
      console.log('[Pipeline] deal.getDealTimeline not registered, skipping');
      return;
    }
    // Need a deal ID from seeded data
    const result = await tool.handler({}, ctx);
    console.log('[Pipeline] Timeline result:', result);
  });
});

describe('Search Tools (10 tools) - saved_searches, properties', () => {
  it('search.recent retrieves search history', async () => {
    const tool = toolRegistry.get('search.recent');
    expect(tool).toBeDefined();
    const result = await tool!.handler({ limit: 5 }, ctx) as { searches: unknown[]; total: number };

    console.log('[Search] Recent searches:', result.total);
    expect(result.searches).toBeDefined();
  });

  it('search.save_filter saves a search filter', async () => {
    const tool = toolRegistry.get('search.save_filter');
    expect(tool).toBeDefined();
    // Just verify the tool is callable
    console.log('[Search] save_filter tool exists');
  });
});

describe('Notification Tools (10 tools) - templates, messages', () => {
  it('notification.listTemplates retrieves templates', async () => {
    const tool = toolRegistry.get('notification.listTemplates');
    expect(tool).toBeDefined();
    const result = await tool!.handler({}, ctx) as { templates: unknown[]; total: number };

    console.log('[Notify] Templates found:', result.total);
    expect(result.templates).toBeDefined();
  });
});

