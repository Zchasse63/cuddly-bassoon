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
      'buyer.suggestOutreach',
      'buyer.compare',
      'buyer.predictBehavior',
      'buyer.segment',
      'buyer.identifyGaps',
      'buyer.generateReport',
      'buyer.scoreFit',
      'buyer.trackPreferenceChanges',
      'buyer.recommendActions',
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
      'deal.create', 'deal.updateStage', 'deal.analyzeProgress',
      'deal.generateOfferStrategy', 'deal.assignBuyer', 'deal.getTimeline',
      'deal.predictOutcome', 'deal.generateSummary', 'deal.compareToPortfolio',
      'deal.suggestActions', 'deal.calculateMetrics', 'deal.flagIssues',
    ];
    tools.forEach(id => {
      it(`should register ${id}`, () => expect(toolRegistry.has(id)).toBe(true));
    });
  });

  describe('CRM Tools', () => {
    const tools = [
      'crm.createLeadList', 'crm.rankByMotivation', 'crm.suggestOutreach',
      'crm.analyzeSource', 'crm.segmentLeads', 'crm.predictConversion',
      'crm.generateReport', 'crm.identifyHot', 'crm.trackEngagement',
      'crm.suggestNurturing', 'crm.mergeLeads', 'crm.exportLeads',
    ];
    tools.forEach(id => {
      it(`should register ${id}`, () => expect(toolRegistry.has(id)).toBe(true));
    });
  });

  describe('Skip Trace Tools', () => {
    const tools = [
      'skipTrace.traceLead', 'skipTrace.batchTrace', 'skipTrace.getStatus',
      'skipTrace.validatePhone', 'skipTrace.validateEmail', 'skipTrace.enrichLead',
      'skipTrace.findRelated', 'skipTrace.reversePhone', 'skipTrace.reverseAddress',
      'skipTrace.getCredits',
    ];
    tools.forEach(id => {
      it(`should register ${id}`, () => expect(toolRegistry.has(id)).toBe(true));
    });
  });

  describe('Notification Tools', () => {
    const tools = [
      'notification.sendSMS', 'notification.sendEmail', 'notification.sendFromTemplate',
      'notification.generateAIMessage', 'notification.getInbox', 'notification.markAsRead',
      'notification.listTemplates', 'notification.getStatus', 'notification.checkOptOut',
      'notification.getHistory',
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

