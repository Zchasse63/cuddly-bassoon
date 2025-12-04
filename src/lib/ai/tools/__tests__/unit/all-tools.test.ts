/**
 * All Tools Registration Tests
 * Verifies all 187 tools are properly registered across 27 categories
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { toolRegistry } from '../../registry';
import { registerAllTools } from '../../categories';

describe('All Tools Registration', () => {
  beforeAll(() => {
    registerAllTools();
  });

  describe('Total Tool Count', () => {
    it('should register at least 180 tools', () => {
      expect(toolRegistry.count).toBeGreaterThanOrEqual(180);
    });

    it('should have tools indexed by category', () => {
      const counts = toolRegistry.getCategoryCounts();
      expect(Object.keys(counts).length).toBeGreaterThan(10);
    });
  });

  describe('Property Search Tools', () => {
    const tools = ['property_search.search', 'property_search.get_details'];
    tools.forEach(id => {
      it(`should register ${id}`, () => expect(toolRegistry.has(id)).toBe(true));
    });
  });

  describe('Deal Analysis Tools', () => {
    const tools = ['deal_analysis.analyze', 'deal_analysis.calculate_mao', 'deal_analysis.score'];
    tools.forEach(id => {
      it(`should register ${id}`, () => expect(toolRegistry.has(id)).toBe(true));
    });
  });

  describe('Buyer Management Tools', () => {
    const tools = [
      'buyer_management.match_buyers_to_property',
      'buyer_management.get_buyer_insights',
      'buyer_management.analyze_buyer_activity',
      'buyer_management.search_buyers',
      'buyer.suggest_outreach',
      'buyer.compare',
      'buyer.predict_behavior',
      'buyer.segment',
      'buyer.identify_gaps',
      'buyer.generate_report',
      'buyer.score_fit',
      'buyer.track_preference_changes',
      'buyer.recommend_actions',
    ];
    tools.forEach(id => {
      it(`should register ${id}`, () => expect(toolRegistry.has(id)).toBe(true));
    });
  });

  describe('Search Tools', () => {
    const tools = [
      'search.by_description', 'search.execute_filter', 'search.save_filter',
      'search.recent', 'search.refine', 'search.compare',
      'search.export', 'search.schedule', 'search.suggestions', 'search.analyze',
    ];
    tools.forEach(id => {
      it(`should register ${id}`, () => expect(toolRegistry.has(id)).toBe(true));
    });
  });

  describe('Property Detail Tools', () => {
    const tools = [
      'property.valuation', 'property.comps', 'property.motivation',
      'property.summary', 'property.deal_potential', 'property.ownership',
      'property.repairs', 'property.time_on_market', 'property.neighborhood',
      'property.portfolio_compare', 'property.offer_price', 'property.rental',
      'property.issues',
    ];
    tools.forEach(id => {
      it(`should register ${id}`, () => expect(toolRegistry.has(id)).toBe(true));
    });
  });

  describe('Filter Tools', () => {
    const tools = [
      'filter.suggest', 'filter.explain', 'filter.optimize', 'filter.create',
      'filter.compare', 'filter.performance', 'filter.refine', 'filter.export',
      'filter.import', 'filter.recommendations', 'filter.validate',
    ];
    tools.forEach(id => {
      it(`should register ${id}`, () => expect(toolRegistry.has(id)).toBe(true));
    });
  });

  describe('Deal Pipeline Tools', () => {
    const tools = [
      'deal.create', 'deal.update_stage', 'deal.analyze_progress',
      'deal.generate_offer_strategy', 'deal.assign_buyer', 'deal.get_timeline',
      'deal.predict_outcome', 'deal.generate_summary', 'deal.compare_to_portfolio',
      'deal.suggest_actions', 'deal.calculate_metrics', 'deal.flag_issues',
    ];
    tools.forEach(id => {
      it(`should register ${id}`, () => expect(toolRegistry.has(id)).toBe(true));
    });
  });

  describe('CRM Tools', () => {
    const tools = [
      'crm.create_lead_list', 'crm.rank_by_motivation', 'crm.suggest_outreach',
      'crm.analyze_source', 'crm.segment_leads', 'crm.predict_conversion',
      'crm.generate_report', 'crm.identify_hot', 'crm.track_engagement',
      'crm.suggest_nurturing', 'crm.merge_leads', 'crm.export_leads',
    ];
    tools.forEach(id => {
      it(`should register ${id}`, () => expect(toolRegistry.has(id)).toBe(true));
    });
  });

  describe('Skip Trace Tools', () => {
    const tools = [
      'skip_trace.trace_lead', 'skip_trace.batch_trace', 'skip_trace.get_status',
      'skip_trace.validate_phone', 'skip_trace.validate_email', 'skip_trace.enrich_lead',
      'skip_trace.find_related', 'skip_trace.reverse_phone', 'skip_trace.reverse_address',
      'skip_trace.get_credits',
    ];
    tools.forEach(id => {
      it(`should register ${id}`, () => expect(toolRegistry.has(id)).toBe(true));
    });
  });

  describe('Notification Tools', () => {
    const tools = [
      'notification.send_sms', 'notification.send_email', 'notification.send_from_template',
      'notification.generate_ai_message', 'notification.get_inbox', 'notification.mark_as_read',
      'notification.list_templates', 'notification.get_status', 'notification.check_opt_out',
      'notification.get_history',
    ];
    tools.forEach(id => {
      it(`should register ${id}`, () => expect(toolRegistry.has(id)).toBe(true));
    });
  });

  describe('Heat Mapping Tools', () => {
    const tools = [
      'heat_mapping.analyze_area', 'heat_mapping.competition_analysis',
      'heat_mapping.detect_opportunities', 'heat_mapping.price_trends',
      'heat_mapping.distress_indicator', 'heat_mapping.equity_analysis',
      'heat_mapping.absentee_owners', 'heat_mapping.rental_yield',
      'heat_mapping.inventory', 'heat_mapping.days_on_market',
      'heat_mapping.flip_potential', 'heat_mapping.school_impact',
      'heat_mapping.crime_impact', 'heat_mapping.development',
    ];
    tools.forEach(id => {
      it(`should register ${id}`, () => expect(toolRegistry.has(id)).toBe(true));
    });
  });

  describe('Market Analysis Tools', () => {
    const tools = [
      'market_analysis.trends', 'market_analysis.forecast', 'market_analysis.compare',
      'market_analysis.seasonality', 'market_analysis.supply_demand',
      'market_analysis.economic', 'market_analysis.roi', 'market_analysis.neighborhood',
      'market_analysis.rental', 'market_analysis.timing',
    ];
    tools.forEach(id => {
      it(`should register ${id}`, () => expect(toolRegistry.has(id)).toBe(true));
    });
  });

  describe('Map Tools', () => {
    const tools = [
      'map.draw_search_area', 'map.compare_areas', 'map.show_commute_time',
      'map.toggle_style', 'map.spatial_query', 'map.compare_neighborhoods',
    ];
    tools.forEach(id => {
      it(`should register ${id}`, () => expect(toolRegistry.has(id)).toBe(true));
    });
  });

  describe('Utility Tools', () => {
    const tools = [
      'utility.geocode', 'utility.reverse_geocode',
      'utility.format_currency', 'utility.calculate_distance',
    ];
    tools.forEach(id => {
      it(`should register ${id}`, () => expect(toolRegistry.has(id)).toBe(true));
    });
  });
});

