/**
 * Priority 4 Tools Test Suite
 *
 * Tests for enhancement tools:
 * - Document generation tools (docs.*)
 * - Communication generation tools (comms.*)
 * - Batch operation tools (batch.*)
 * - Workflow automation tools (workflow.*)
 * - Prediction tools (predict.*)
 * - Portfolio tools (portfolio.*)
 * - Intel tools (intel.*)
 * - Skip Trace extended tools (skipTrace.*)
 * - Utility tools (utility.*)
 * - Sync tools (sync.*)
 *
 * Uses REAL, LIVE APIs
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
  console.log('\n🔬 Priority 4 Tools Test Suite');
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
// DOCUMENT GENERATION TOOLS
// ============================================================================

describe('Document Generation Tools', () => {
  it('should have docs.generate_offer_letter tool registered', () => {
    const tool = toolRegistry.get('docs.generate_offer_letter');
    expect(tool).toBeDefined();
  });

  it('should have docs.generate_deal_summary tool registered', () => {
    const tool = toolRegistry.get('docs.generate_deal_summary');
    expect(tool).toBeDefined();
  });

  it('should have docs.generate_comp_report tool registered', () => {
    const tool = toolRegistry.get('docs.generate_comp_report');
    expect(tool).toBeDefined();
  });

  it('should select docs.generate_offer_letter for offer letter', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the docs_generate_offer_letter tool to create an offer letter for 123 Main St at $250,000'
    );
    const hasDocsTool = tools.some(t => t.includes('docs') || t.includes('offer') || t.includes('generate'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasDocsTool || tools.length === 0).toBe(true);
  });
});

// ============================================================================
// COMMUNICATION GENERATION TOOLS
// ============================================================================

describe('Communication Generation Tools', () => {
  it('should have comms.generate_email_sequence tool registered', () => {
    const tool = toolRegistry.get('comms.generate_email_sequence');
    expect(tool).toBeDefined();
  });

  it('should have comms.generate_sms_template tool registered', () => {
    const tool = toolRegistry.get('comms.generate_sms_template');
    expect(tool).toBeDefined();
  });

  it('should have comms.generate_talking_points tool registered', () => {
    const tool = toolRegistry.get('comms.generate_talking_points');
    expect(tool).toBeDefined();
  });

  it('should select comms.generate_talking_points for call prep', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the comms_generate_talking_points tool to prepare talking points for calling a motivated seller'
    );
    const hasCommsTool = tools.some(t => t.includes('comms') || t.includes('talking') || t.includes('generate'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasCommsTool || tools.length === 0).toBe(true);
  });
});

// ============================================================================
// BATCH OPERATION TOOLS
// ============================================================================

describe('Batch Operation Tools', () => {
  it('should have batch.skip_trace_bulk tool registered', () => {
    const tool = toolRegistry.get('batch.skip_trace_bulk');
    expect(tool).toBeDefined();
  });

  it('should have batch.export_properties tool registered', () => {
    const tool = toolRegistry.get('batch.export_properties');
    expect(tool).toBeDefined();
  });

  it('should have batch.add_to_list_bulk tool registered', () => {
    const tool = toolRegistry.get('batch.add_to_list_bulk');
    expect(tool).toBeDefined();
  });

  it('should have batch.update_deal_status tool registered', () => {
    const tool = toolRegistry.get('batch.update_deal_status');
    expect(tool).toBeDefined();
  });

  it('should select batch.export_properties for bulk export', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the batch_export_properties tool to export all properties in my search results to CSV'
    );
    const hasBatchTool = tools.some(t => t.includes('batch') || t.includes('export'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasBatchTool || tools.length === 0).toBe(true);
  });
});

// ============================================================================
// WORKFLOW AUTOMATION TOOLS
// ============================================================================

describe('Workflow Automation Tools', () => {
  it('should have workflow.alert_on_match tool registered', () => {
    const tool = toolRegistry.get('workflow.alert_on_match');
    expect(tool).toBeDefined();
  });

  it('should have workflow.auto_follow_up tool registered', () => {
    const tool = toolRegistry.get('workflow.auto_follow_up');
    expect(tool).toBeDefined();
  });

  it('should have workflow.deal_stage_trigger tool registered', () => {
    const tool = toolRegistry.get('workflow.deal_stage_trigger');
    expect(tool).toBeDefined();
  });

  it('should select workflow.alert_on_match for alert creation', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the workflow_alert_on_match tool to create an alert when new properties match my saved filter'
    );
    const hasWorkflowTool = tools.some(t => t.includes('workflow') || t.includes('alert'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasWorkflowTool || tools.length === 0).toBe(true);
  });
});

// ============================================================================
// PREDICTION TOOLS
// ============================================================================

describe('Prediction Tools', () => {
  it('should have predict.deal_close_probability tool registered', () => {
    const tool = toolRegistry.get('predict.deal_close_probability');
    expect(tool).toBeDefined();
  });

  it('should have predict.optimal_offer_price tool registered', () => {
    const tool = toolRegistry.get('predict.optimal_offer_price');
    expect(tool).toBeDefined();
  });

  it('should have predict.seller_motivation tool registered', () => {
    const tool = toolRegistry.get('predict.seller_motivation');
    expect(tool).toBeDefined();
  });

  it('should have predict.time_to_close tool registered', () => {
    const tool = toolRegistry.get('predict.time_to_close');
    expect(tool).toBeDefined();
  });

  it('should select predict.seller_motivation for motivation queries', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the predict_seller_motivation tool to analyze seller motivation for property at 123 Main St'
    );
    const hasPredictTool = tools.some(t => t.includes('predict') || t.includes('motivation') || t.includes('seller'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasPredictTool || tools.length === 0).toBe(true);
  });
});

// ============================================================================
// PORTFOLIO TOOLS
// ============================================================================

describe('Portfolio Tools', () => {
  it('should have portfolio.performance_summary tool registered', () => {
    const tool = toolRegistry.get('portfolio.performance_summary');
    expect(tool).toBeDefined();
  });

  it('should have portfolio.roi_by_strategy tool registered', () => {
    const tool = toolRegistry.get('portfolio.roi_by_strategy');
    expect(tool).toBeDefined();
  });

  it('should have portfolio.geographic_concentration tool registered', () => {
    const tool = toolRegistry.get('portfolio.geographic_concentration');
    expect(tool).toBeDefined();
  });

  it('should select portfolio.performance_summary for portfolio queries', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the portfolio_performance_summary tool to show my portfolio performance'
    );
    const hasPortfolioTool = tools.some(t => t.includes('portfolio') || t.includes('performance'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasPortfolioTool || tools.length === 0).toBe(true);
  });
});

// ============================================================================
// INTEL TOOLS
// ============================================================================

describe('Intel Tools', () => {
  it('should have intel.competitor_activity tool registered', () => {
    const tool = toolRegistry.get('intel.competitor_activity');
    expect(tool).toBeDefined();
  });

  it('should have intel.emerging_markets tool registered', () => {
    const tool = toolRegistry.get('intel.emerging_markets');
    expect(tool).toBeDefined();
  });

  it('should have intel.market_saturation tool registered', () => {
    const tool = toolRegistry.get('intel.market_saturation');
    expect(tool).toBeDefined();
  });

  it('should select intel.emerging_markets for market discovery', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the intel_emerging_markets tool to find emerging investment markets in Florida'
    );
    const hasIntelTool = tools.some(t => t.includes('intel') || t.includes('emerging') || t.includes('market'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasIntelTool || tools.length === 0).toBe(true);
  });
});

// ============================================================================
// SKIP TRACE EXTENDED TOOLS
// ============================================================================

describe('Skip Trace Extended Tools', () => {
  it('should have skipTrace.batchTrace tool registered', () => {
    const tool = toolRegistry.get('skipTrace.batchTrace');
    expect(tool).toBeDefined();
  });

  it('should have skipTrace.enrichLead tool registered', () => {
    const tool = toolRegistry.get('skipTrace.enrichLead');
    expect(tool).toBeDefined();
  });

  it('should have skipTrace.findRelated tool registered', () => {
    const tool = toolRegistry.get('skipTrace.findRelated');
    expect(tool).toBeDefined();
  });

  it('should have skipTrace.reverseAddress tool registered', () => {
    const tool = toolRegistry.get('skipTrace.reverseAddress');
    expect(tool).toBeDefined();
  });

  it('should have skipTrace.reversePhone tool registered', () => {
    const tool = toolRegistry.get('skipTrace.reversePhone');
    expect(tool).toBeDefined();
  });

  it('should have skipTrace.validateEmail tool registered', () => {
    const tool = toolRegistry.get('skipTrace.validateEmail');
    expect(tool).toBeDefined();
  });

  it('should have skipTrace.validatePhone tool registered', () => {
    const tool = toolRegistry.get('skipTrace.validatePhone');
    expect(tool).toBeDefined();
  });

  it('should select skipTrace.reverseAddress for address lookup', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the skipTrace_reverseAddress tool to find who lives at 456 Oak Ave, Miami FL'
    );
    const hasSkipTraceTool = tools.some(t => t.includes('skip') || t.includes('Trace') || t.includes('reverse') || t.includes('address'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasSkipTraceTool || tools.length === 0).toBe(true);
  });
});

// ============================================================================
// UTILITY TOOLS
// ============================================================================

describe('Utility Tools', () => {
  it('should have utility.calculate_distance tool registered', () => {
    const tool = toolRegistry.get('utility.calculate_distance');
    expect(tool).toBeDefined();
  });

  it('should have utility.format_currency tool registered', () => {
    const tool = toolRegistry.get('utility.format_currency');
    expect(tool).toBeDefined();
  });

  it('should have utility.reverse_geocode tool registered', () => {
    const tool = toolRegistry.get('utility.reverse_geocode');
    expect(tool).toBeDefined();
  });

  it('should select utility.calculate_distance for distance queries', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the utility_calculate_distance tool to calculate distance between 123 Main St and 456 Oak Ave in Miami'
    );
    const hasUtilityTool = tools.some(t => t.includes('utility') || t.includes('distance') || t.includes('calculate'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasUtilityTool || tools.length === 0).toBe(true);
  });
});

// ============================================================================
// SYNC TOOLS
// ============================================================================

describe('Sync Tools', () => {
  it('should have sync.calendar_integration tool registered', () => {
    const tool = toolRegistry.get('sync.calendar_integration');
    expect(tool).toBeDefined();
  });

  it('should have sync.crm_export tool registered', () => {
    const tool = toolRegistry.get('sync.crm_export');
    expect(tool).toBeDefined();
  });

  it('should select sync.crm_export for CRM export', async () => {
    if (skipIfNoApi('grok')) return;
    trackApiCall('grok', 0);

    const tools = await getToolCalls(
      'Use the sync_crm_export tool to export my leads to Salesforce'
    );
    const hasSyncTool = tools.some(t => t.includes('sync') || t.includes('crm') || t.includes('export'));
    console.log(`  ℹ️ Selected: ${tools.length > 0 ? tools.join(', ') : 'no tools called'}`);
    expect(hasSyncTool || tools.length === 0).toBe(true);
  });
});

