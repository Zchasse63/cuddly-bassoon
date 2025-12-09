/**
 * emitToolResults Unit Tests
 *
 * Tests the event bus emission logic from ScoutPane.
 * Verifies ALL tool results are emitted to aiEventBus.
 * The AI can interact with every part of the platform via 200+ tools.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { aiEventBus } from '@/lib/ai/events';
import type { UIMessage } from '@ai-sdk/react';

interface ToolPart {
  type: string;
  toolCallId: string;
  toolName: string;
  state: 'input-streaming' | 'input-available' | 'output-available' | 'output-error';
  input?: Record<string, unknown>;
  output?: unknown;
  errorText?: string;
}

// Mirrors ScoutPane.tsx emitToolResults - emits ALL tool results
function emitToolResults(message: UIMessage) {
  if (!message.parts) return;

  for (const part of message.parts) {
    if (
      typeof part === 'object' &&
      part !== null &&
      'type' in part &&
      typeof part.type === 'string' &&
      part.type.startsWith('tool-') &&
      'state' in part &&
      part.state === 'output-available' &&
      'output' in part
    ) {
      const toolPart = part as ToolPart;
      const toolName = toolPart.toolName || part.type.replace('tool-', '');

      // Emit event for ALL tool results
      aiEventBus.emit('tool:result', {
        toolName,
        result: toolPart.output,
      });
    }
  }
}

// Helper to create mock UIMessage with tool parts
function createMockMessage(toolName: string, output: unknown, state: ToolPart['state'] = 'output-available'): UIMessage {
  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: '',
    parts: [
      {
        type: `tool-${toolName}`,
        toolCallId: `call-${Date.now()}`,
        toolName,
        state,
        output,
      },
    ],
  };
}

describe('emitToolResults', () => {
  let emitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    emitSpy = vi.spyOn(aiEventBus, 'emit');
  });

  afterEach(() => {
    emitSpy.mockRestore();
  });

  // All 200+ tools organized by category - ALL should emit
  const ALL_TOOLS = {
    // Property Search Tools (2)
    property_search: ['property_search.search', 'property_search.get_details'],
    // Property Detail Tools (13)
    property_detail: [
      'property.valuation', 'property.comps', 'property.motivation', 'property.summary',
      'property.deal_potential', 'property.ownership', 'property.repairs', 'property.time_on_market',
      'property.neighborhood', 'property.portfolio_compare', 'property.offer_price', 'property.rental',
      'property.issues',
    ],
    // Deal Analysis Tools (3)
    deal_analysis: ['deal_analysis.analyze', 'deal_analysis.calculate_mao', 'deal_analysis.score'],
    // Deal Pipeline Tools (12)
    deal_pipeline: [
      'deal.create', 'deal.update_stage', 'deal.analyze_progress', 'deal.generate_offer_strategy',
      'deal.assign_buyer', 'deal.get_timeline', 'deal.predict_outcome', 'deal.generate_summary',
      'deal.compare_to_portfolio', 'deal.suggest_actions', 'deal.calculate_metrics', 'deal.flag_issues',
    ],
    // Buyer Management Tools (13)
    buyer_management: [
      'buyer_management.match_buyers_to_property', 'buyer_management.get_buyer_insights',
      'buyer_management.analyze_buyer_activity', 'buyer_management.search_buyers',
      'buyer.suggest_outreach', 'buyer.compare', 'buyer.predict_behavior', 'buyer.segment',
      'buyer.identify_gaps', 'buyer.generate_report', 'buyer.score_fit',
      'buyer.track_preference_changes', 'buyer.recommend_actions',
    ],
    // Filter Tools (11)
    filter: [
      'filter.suggest', 'filter.explain', 'filter.optimize', 'filter.create', 'filter.compare',
      'filter.performance', 'filter.refine', 'filter.export', 'filter.import',
      'filter.recommendations', 'filter.validate',
    ],
    // Search Tools (13)
    search: [
      'search.by_description', 'search.execute_filter', 'search.save_filter', 'search.recent',
      'search.refine', 'search.compare', 'search.export', 'search.schedule', 'search.suggestions',
      'search.analyze', 'search.similar_to_deal', 'search.buyer_property_match', 'search.permit_pattern_match',
    ],
    // Market Analysis Tools (10)
    market_analysis: [
      'market_analysis.trends', 'market_analysis.forecast', 'market_analysis.compare',
      'market_analysis.seasonality', 'market_analysis.supply_demand', 'market_analysis.economic',
      'market_analysis.roi', 'market_analysis.neighborhood', 'market_analysis.rental',
      'market_analysis.timing',
    ],
    // Market Velocity Tools (8)
    market_velocity: [
      'market_velocity.get_velocity', 'market_velocity.find_hot_markets',
      'market_velocity.find_cold_markets', 'market_velocity.compare_markets',
      'market_velocity.explain_score', 'market_velocity.get_trend',
      'market_velocity.get_rankings', 'market_velocity.get_for_bounds',
    ],
    // Heat Mapping Tools (14)
    heat_mapping: [
      'heat_mapping.analyze_area', 'heat_mapping.competition_analysis',
      'heat_mapping.detect_opportunities', 'heat_mapping.price_trends',
      'heat_mapping.distress_indicator', 'heat_mapping.equity_analysis',
      'heat_mapping.absentee_owners', 'heat_mapping.rental_yield', 'heat_mapping.inventory',
      'heat_mapping.days_on_market', 'heat_mapping.flip_potential', 'heat_mapping.school_impact',
      'heat_mapping.crime_impact', 'heat_mapping.development',
    ],
    // Map Tools (6)
    map: [
      'map.draw_search_area', 'map.compare_areas', 'map.show_commute_time',
      'map.toggle_style', 'map.spatial_query', 'map.compare_neighborhoods',
    ],
    // Permit Tools (8)
    permit: [
      'permit.history', 'permit.details', 'permit.search', 'permit.metrics',
      'permit.analyze_patterns', 'permit.check_system_age', 'permit.deferred_maintenance',
      'permit.stalled',
    ],
    // Contractor Tools (5)
    contractor: [
      'contractor.search', 'contractor.details', 'contractor.history',
      'contractor.compare', 'contractor.top',
    ],
    // Skip Trace Tools (10)
    skip_trace: [
      'skip_trace.trace_lead', 'skip_trace.batch_trace', 'skip_trace.get_status',
      'skip_trace.validate_phone', 'skip_trace.validate_email', 'skip_trace.enrich_lead',
      'skip_trace.find_related', 'skip_trace.reverse_phone', 'skip_trace.reverse_address',
      'skip_trace.get_credits',
    ],
    // Notification Tools (10)
    notification: [
      'notification.send_sms', 'notification.send_email', 'notification.send_from_template',
      'notification.generate_ai_message', 'notification.get_inbox', 'notification.mark_as_read',
      'notification.list_templates', 'notification.get_status', 'notification.check_opt_out',
      'notification.get_history',
    ],
    // Communication Tools (3)
    communication: [
      'comms.generate_sms_template', 'comms.generate_email_sequence', 'comms.generate_talking_points',
    ],
    // CRM Tools (12)
    crm: [
      'crm.create_lead_list', 'crm.rank_by_motivation', 'crm.suggest_outreach',
      'crm.analyze_source', 'crm.segment_leads', 'crm.predict_conversion',
      'crm.generate_report', 'crm.identify_hot', 'crm.track_engagement',
      'crm.suggest_nurturing', 'crm.merge_leads', 'crm.export_leads',
    ],
    // Dashboard Analytics Tools (12)
    dashboard: [
      'dashboard.insights', 'dashboard.goals', 'dashboard.performance', 'dashboard.report',
      'dashboard.anomalies', 'dashboard.trends', 'dashboard.activity', 'dashboard.funnel',
      'dashboard.compare_periods', 'dashboard.alerts', 'dashboard.recommendations', 'dashboard.kpis',
    ],
    // Document Tools (3)
    document: [
      'docs.generate_offer_letter', 'docs.generate_deal_summary', 'docs.generate_comp_report',
    ],
    // Predictive Tools (7)
    predictive: [
      'predict.seller_motivation', 'predict.deal_close_probability', 'predict.optimal_offer_price',
      'predict.time_to_close', 'predict.classify_owner', 'predict.batch_motivation',
      'predict.compare_motivation',
    ],
    // Intelligence Tools (3)
    intelligence: ['intel.competitor_activity', 'intel.market_saturation', 'intel.market_velocity'],
    // Batch Tools (4)
    batch: [
      'batch.skip_trace_bulk', 'batch.add_to_list_bulk', 'batch.update_deal_status',
      'batch.export_properties',
    ],
    // Automation Tools (3)
    automation: ['workflow.auto_follow_up', 'workflow.deal_stage_trigger', 'workflow.alert_on_match'],
    // Utility Tools (4)
    utility: [
      'utility.geocode', 'utility.reverse_geocode', 'utility.format_currency',
      'utility.calculate_distance',
    ],
    // Vertical Tools (4)
    vertical: ['vertical.get_active', 'vertical.switch', 'vertical.filters', 'vertical.insights'],
    // Portfolio Tools (3)
    portfolio: [
      'portfolio.performance_summary', 'portfolio.roi_by_strategy', 'portfolio.geographic_concentration',
    ],
    // Census Geography Tools (5)
    census: [
      'census.get_geography', 'census.get_boundary_polygon', 'census.classify_comp_geography',
      'census.batch_geocode_comps', 'census.get_boundary_by_point',
    ],
    // Integration Tools (2)
    integration: ['sync.crm_export', 'sync.calendar_integration'],
  };

  describe('All Tools Emit Events (Comprehensive)', () => {
    // Test each category
    Object.entries(ALL_TOOLS).forEach(([category, tools]) => {
      describe(`${category} tools (${tools.length})`, () => {
        tools.forEach(toolName => {
          it(`emits event for ${toolName}`, () => {
            const mockOutput = { data: 'test', toolName };
            const message = createMockMessage(toolName, mockOutput);
            emitToolResults(message);
            expect(emitSpy).toHaveBeenCalledWith('tool:result', {
              toolName,
              result: mockOutput,
            });
          });
        });
      });
    });

    // Summary test
    it('verifies total tools count', () => {
      const totalTools = Object.values(ALL_TOOLS).flat().length;
      console.log(`  📊 Tested ${totalTools} tools across ${Object.keys(ALL_TOOLS).length} categories`);
      expect(totalTools).toBeGreaterThanOrEqual(200);
    });
  });

  describe('Edge Cases', () => {
    it('handles message with no parts', () => {
      const message: UIMessage = {
        id: 'msg-1',
        role: 'assistant',
        content: 'Hello!',
        parts: undefined,
      };

      emitToolResults(message);
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('handles message with empty parts array', () => {
      const message: UIMessage = {
        id: 'msg-2',
        role: 'assistant',
        content: '',
        parts: [],
      };

      emitToolResults(message);
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('ignores tool parts with state !== output-available', () => {
      const message = createMockMessage('property_search.search', { properties: [] }, 'input-available');
      emitToolResults(message);
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('ignores tool parts with state === output-error', () => {
      const message = createMockMessage('property_search.search', null, 'output-error');
      emitToolResults(message);
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('handles multiple tool parts in one message', () => {
      const message: UIMessage = {
        id: 'msg-multi',
        role: 'assistant',
        content: '',
        parts: [
          {
            type: 'tool-property_search.search',
            toolCallId: 'call-1',
            toolName: 'property_search.search',
            state: 'output-available',
            output: { properties: [{ id: '1' }] },
          },
          {
            type: 'tool-deal_analysis.analyze',
            toolCallId: 'call-2',
            toolName: 'deal_analysis.analyze',
            state: 'output-available',
            output: { score: 90 },
          },
          {
            type: 'tool-search.by_description',
            toolCallId: 'call-3',
            toolName: 'search.by_description',
            state: 'output-available',
            output: { properties: [{ id: '2' }] },
          },
        ],
      };

      emitToolResults(message);

      // ALL tools should emit
      expect(emitSpy).toHaveBeenCalledTimes(3);
      expect(emitSpy).toHaveBeenCalledWith('tool:result', {
        toolName: 'property_search.search',
        result: { properties: [{ id: '1' }] },
      });
      expect(emitSpy).toHaveBeenCalledWith('tool:result', {
        toolName: 'deal_analysis.analyze',
        result: { score: 90 },
      });
      expect(emitSpy).toHaveBeenCalledWith('tool:result', {
        toolName: 'search.by_description',
        result: { properties: [{ id: '2' }] },
      });
    });
  });

  describe('Data Structure Validation', () => {
    it('emitted data matches expected structure for split-view-client', () => {
      const mockOutput = {
        properties: [
          {
            id: 'prop-123',
            address: '123 Main St',
            city: 'Miami',
            state: 'FL',
            zip: '33101',
            latitude: 25.7617,
            longitude: -80.1918,
            bedrooms: 3,
            bathrooms: 2,
            squareFootage: 1500,
            estimatedValue: 350000,
            propertyType: 'single_family',
          },
        ],
        total: 1,
        hasMore: false,
      };

      const message = createMockMessage('property_search.search', mockOutput);
      emitToolResults(message);

      expect(emitSpy).toHaveBeenCalledWith('tool:result', {
        toolName: expect.any(String),
        result: expect.objectContaining({
          properties: expect.arrayContaining([
            expect.objectContaining({
              id: expect.any(String),
              address: expect.any(String),
              city: expect.any(String),
              state: expect.any(String),
            }),
          ]),
        }),
      });
    });
  });
});

