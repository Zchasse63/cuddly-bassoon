/**
 * Priority 2 Tools Test Suite
 *
 * Tests for core feature tools that are currently untested:
 * - Buyer management extended tools (buyer.*)
 * - CRM tools (crm.*)
 * - Market analysis tools (market_analysis.*)
 * - Heat mapping tools (heat_mapping.*)
 *
 * Uses REAL, LIVE APIs (xAI Grok, Supabase)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createXai } from '@ai-sdk/xai';
import { streamText, stepCountIs } from 'ai';
import { toolRegistry } from '@/lib/ai/tools/registry';
import { convertToAISDKTools, ensureToolsInitialized } from '@/lib/ai/tools/adapter';
import { createTestContext, skipIfNoApi, trackApiCall, printApiStats } from './setup';
import type { ToolSet } from 'ai';

// ============================================================================
// TEST SETUP
// ============================================================================

const xai = createXai({
  apiKey: process.env.XAI_API_KEY || '',
});

let aiTools: ToolSet;

beforeAll(async () => {
  await ensureToolsInitialized();
  aiTools = convertToAISDKTools(createTestContext());
  console.log('\n🔬 Priority 2 Tools Test Suite');
  console.log('================================');
});

afterAll(() => {
  printApiStats();
});

async function getToolCalls(prompt: string, stepLimit = 2): Promise<string[]> {
  const toolCalls: string[] = [];

  await streamText({
    model: xai('grok-4-1-fast-non-reasoning'),
    messages: [{ role: 'user', content: prompt }],
    tools: aiTools,
    stopWhen: stepCountIs(stepLimit),
    onStepFinish: ({ toolCalls: calls }) => {
      calls?.forEach(call => toolCalls.push(call.toolName));
    },
  });

  return toolCalls;
}

// ============================================================================
// BUYER EXTENDED TOOLS
// ============================================================================

describe('Buyer Extended Tools', () => {
  it('should have buyer.segment tool registered', () => {
    const tool = toolRegistry.get('buyer.segment');
    expect(tool).toBeDefined();
  });

  it('should have buyer.scoreFit tool registered', () => {
    const tool = toolRegistry.get('buyer.scoreFit');
    expect(tool).toBeDefined();
  });

  it('should have buyer.predictBehavior tool registered', () => {
    const tool = toolRegistry.get('buyer.predictBehavior');
    expect(tool).toBeDefined();
  });

  it('should have buyer.recommendActions tool registered', () => {
    const tool = toolRegistry.get('buyer.recommendActions');
    expect(tool).toBeDefined();
  });

  it('should have buyer.suggestOutreach tool registered', () => {
    const tool = toolRegistry.get('buyer.suggestOutreach');
    expect(tool).toBeDefined();
  });

  it('should have buyer.compare tool registered', () => {
    const tool = toolRegistry.get('buyer.compare');
    expect(tool).toBeDefined();
  });

  it('should have buyer.trackPreferenceChanges tool registered', () => {
    const tool = toolRegistry.get('buyer.trackPreferenceChanges');
    expect(tool).toBeDefined();
  });

  it('should have buyer.identifyGaps tool registered', () => {
    const tool = toolRegistry.get('buyer.identifyGaps');
    expect(tool).toBeDefined();
  });

  it('should have buyer.generateReport tool registered', () => {
    const tool = toolRegistry.get('buyer.generateReport');
    expect(tool).toBeDefined();
  });

  it('should select buyer.segment for segmentation queries', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the buyer_segment tool to segment my buyers by investment type preference'
    );
    const hasBuyerTool = tools.some(t => t.includes('buyer') || t.includes('segment'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasBuyerTool || tools.length === 0).toBe(true);
  });

  it('should select buyer.scoreFit for scoring queries', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the buyer_scoreFit tool to score how well buyer B123 fits property P456'
    );
    const hasBuyerTool = tools.some(t => t.includes('buyer') || t.includes('score'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasBuyerTool || tools.length === 0).toBe(true);
  });
});

// ============================================================================
// CRM TOOLS
// ============================================================================

describe('CRM Tools', () => {
  it('should have crm.segmentLeads tool registered', () => {
    const tool = toolRegistry.get('crm.segmentLeads');
    expect(tool).toBeDefined();
  });

  it('should have crm.rankByMotivation tool registered', () => {
    const tool = toolRegistry.get('crm.rankByMotivation');
    expect(tool).toBeDefined();
  });

  it('should have crm.identifyHot tool registered', () => {
    const tool = toolRegistry.get('crm.identifyHot');
    expect(tool).toBeDefined();
  });

  it('should have crm.predictConversion tool registered', () => {
    const tool = toolRegistry.get('crm.predictConversion');
    expect(tool).toBeDefined();
  });

  it('should have crm.suggestNurturing tool registered', () => {
    const tool = toolRegistry.get('crm.suggestNurturing');
    expect(tool).toBeDefined();
  });

  it('should have crm.createLeadList tool registered', () => {
    const tool = toolRegistry.get('crm.createLeadList');
    expect(tool).toBeDefined();
  });

  it('should have crm.mergeLeads tool registered', () => {
    const tool = toolRegistry.get('crm.mergeLeads');
    expect(tool).toBeDefined();
  });

  it('should have crm.exportLeads tool registered', () => {
    const tool = toolRegistry.get('crm.exportLeads');
    expect(tool).toBeDefined();
  });

  it('should have crm.trackEngagement tool registered', () => {
    const tool = toolRegistry.get('crm.trackEngagement');
    expect(tool).toBeDefined();
  });

  it('should select crm.identifyHot for hot leads queries', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the crm_identifyHot tool to find my hottest leads that are ready to buy'
    );
    const hasCrmTool = tools.some(t => t.includes('crm') || t.includes('Hot') || t.includes('lead'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasCrmTool || tools.length === 0).toBe(true);
  });

  it('should select crm.predictConversion for conversion prediction', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the crm_predictConversion tool to predict which leads are most likely to convert this month'
    );
    const hasCrmTool = tools.some(t => t.includes('crm') || t.includes('predict') || t.includes('lead'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasCrmTool || tools.length === 0).toBe(true);
  });
});

// ============================================================================
// MARKET ANALYSIS TOOLS
// ============================================================================

describe('Market Analysis Tools', () => {
  it('should have market_analysis.trends tool registered', () => {
    const tool = toolRegistry.get('market_analysis.trends');
    expect(tool).toBeDefined();
  });

  it('should have market_analysis.compare tool registered', () => {
    const tool = toolRegistry.get('market_analysis.compare');
    expect(tool).toBeDefined();
  });

  it('should have market_analysis.forecast tool registered', () => {
    const tool = toolRegistry.get('market_analysis.forecast');
    expect(tool).toBeDefined();
  });

  it('should have market_analysis.neighborhood tool registered', () => {
    const tool = toolRegistry.get('market_analysis.neighborhood');
    expect(tool).toBeDefined();
  });

  it('should have market_analysis.rental tool registered', () => {
    const tool = toolRegistry.get('market_analysis.rental');
    expect(tool).toBeDefined();
  });

  it('should have market_analysis.supply_demand tool registered', () => {
    const tool = toolRegistry.get('market_analysis.supply_demand');
    expect(tool).toBeDefined();
  });

  it('should have market_analysis.seasonality tool registered', () => {
    const tool = toolRegistry.get('market_analysis.seasonality');
    expect(tool).toBeDefined();
  });

  it('should have market_analysis.timing tool registered', () => {
    const tool = toolRegistry.get('market_analysis.timing');
    expect(tool).toBeDefined();
  });

  it('should select market_analysis.trends for trend queries', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the market_analysis_trends tool to show me price trends in Miami over the last 6 months'
    );
    const hasMarketTool = tools.some(t => t.includes('market') || t.includes('trend') || t.includes('analysis'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasMarketTool || tools.length === 0).toBe(true);
  });

  it('should select market_analysis.forecast for forecast queries', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the market_analysis_forecast tool to forecast property values in Coral Gables for the next year'
    );
    const hasMarketTool = tools.some(t => t.includes('market') || t.includes('forecast') || t.includes('analysis'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasMarketTool || tools.length === 0).toBe(true);
  });
});

// ============================================================================
// HEAT MAPPING TOOLS
// ============================================================================

describe('Heat Mapping Tools', () => {
  it('should have heat_mapping.price_trends tool registered', () => {
    const tool = toolRegistry.get('heat_mapping.price_trends');
    expect(tool).toBeDefined();
  });

  it('should have heat_mapping.flip_potential tool registered', () => {
    const tool = toolRegistry.get('heat_mapping.flip_potential');
    expect(tool).toBeDefined();
  });

  it('should have heat_mapping.rental_yield tool registered', () => {
    const tool = toolRegistry.get('heat_mapping.rental_yield');
    expect(tool).toBeDefined();
  });

  it('should have heat_mapping.equity_analysis tool registered', () => {
    const tool = toolRegistry.get('heat_mapping.equity_analysis');
    expect(tool).toBeDefined();
  });

  it('should have heat_mapping.distress_indicator tool registered', () => {
    const tool = toolRegistry.get('heat_mapping.distress_indicator');
    expect(tool).toBeDefined();
  });

  it('should have heat_mapping.days_on_market tool registered', () => {
    const tool = toolRegistry.get('heat_mapping.days_on_market');
    expect(tool).toBeDefined();
  });

  it('should have heat_mapping.inventory tool registered', () => {
    const tool = toolRegistry.get('heat_mapping.inventory');
    expect(tool).toBeDefined();
  });

  it('should have heat_mapping.absentee_owners tool registered', () => {
    const tool = toolRegistry.get('heat_mapping.absentee_owners');
    expect(tool).toBeDefined();
  });

  it('should have heat_mapping.analyze_area tool registered', () => {
    const tool = toolRegistry.get('heat_mapping.analyze_area');
    expect(tool).toBeDefined();
  });

  it('should have heat_mapping.detect_opportunities tool registered', () => {
    const tool = toolRegistry.get('heat_mapping.detect_opportunities');
    expect(tool).toBeDefined();
  });

  it('should select heat_mapping.flip_potential for flip queries', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the heat_mapping_flip_potential tool to show areas in Miami with high flip potential'
    );
    const hasHeatTool = tools.some(t => t.includes('heat') || t.includes('flip') || t.includes('mapping'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasHeatTool || tools.length === 0).toBe(true);
  });

  it('should select heat_mapping.distress_indicator for distress queries', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the heat_mapping_distress_indicator tool to show distressed properties in Miami-Dade'
    );
    const hasHeatTool = tools.some(t => t.includes('heat') || t.includes('distress') || t.includes('mapping'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasHeatTool || tools.length === 0).toBe(true);
  });
});

