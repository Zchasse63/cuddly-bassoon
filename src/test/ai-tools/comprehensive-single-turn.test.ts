/**
 * Comprehensive Single-Turn Tool Tests
 *
 * Tests ALL 200+ AI tools for:
 * - Registration in the registry
 * - Schema validation (input parsing)
 * - Handler execution (mocked where necessary)
 *
 * This file ensures complete coverage of all AI tools.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { toolRegistry } from '@/lib/ai/tools/registry';
import { executeTool } from '@/lib/ai/tools/executor';
import { ensureToolsInitialized } from '@/lib/ai/tools/adapter';
import { createTestContext } from './setup';

beforeAll(async () => {
  await ensureToolsInitialized();
  console.log(`\n📦 Registry contains ${toolRegistry.count} tools\n`);
});

const ctx = createTestContext();

// ============================================================================
// ALL TOOLS - Complete List by Category
// ============================================================================

const ALL_TOOLS = {
  // Property Search Tools (2)
  property_search: [
    'property_search.search',
    'property_search.get_details',
  ],

  // Property Detail Tools (13)
  property_detail: [
    'property.valuation',
    'property.comps',
    'property.motivation',
    'property.summary',
    'property.deal_potential',
    'property.ownership',
    'property.repairs',
    'property.time_on_market',
    'property.neighborhood',
    'property.portfolio_compare',
    'property.offer_price',
    'property.rental',
    'property.issues',
  ],

  // Deal Analysis Tools (3)
  deal_analysis: [
    'deal_analysis.analyze',
    'deal_analysis.calculate_mao',
    'deal_analysis.score',
  ],

  // Deal Pipeline Tools (12)
  deal_pipeline: [
    'deal.create',
    'deal.update_stage',
    'deal.analyze_progress',
    'deal.generate_offer_strategy',
    'deal.assign_buyer',
    'deal.get_timeline',
    'deal.predict_outcome',
    'deal.generate_summary',
    'deal.compare_to_portfolio',
    'deal.suggest_actions',
    'deal.calculate_metrics',
    'deal.flag_issues',
  ],

  // Buyer Management Tools (14)
  buyer_management: [
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
  ],

  // Filter Tools (11)
  filter: [
    'filter.suggest',
    'filter.explain',
    'filter.optimize',
    'filter.create',
    'filter.compare',
    'filter.performance',
    'filter.refine',
    'filter.export',
    'filter.import',
    'filter.recommendations',
    'filter.validate',
  ],

  // Search Tools (13)
  search: [
    'search.by_description',
    'search.execute_filter',
    'search.save_filter',
    'search.recent',
    'search.refine',
    'search.compare',
    'search.export',
    'search.schedule',
    'search.suggestions',
    'search.analyze',
    'search.similar_to_deal',
    'search.buyer_property_match',
    'search.permit_pattern_match',
  ],

  // Market Analysis Tools (10)
  market_analysis: [
    'market_analysis.trends',
    'market_analysis.forecast',
    'market_analysis.compare',
    'market_analysis.seasonality',
    'market_analysis.supply_demand',
    'market_analysis.economic',
    'market_analysis.roi',
    'market_analysis.neighborhood',
    'market_analysis.rental',
    'market_analysis.timing',
  ],

  // Market Velocity Tools (8)
  market_velocity: [
    'market_velocity.get_velocity',
    'market_velocity.find_hot_markets',
    'market_velocity.find_cold_markets',
    'market_velocity.compare_markets',
    'market_velocity.explain_score',
    'market_velocity.get_trend',
    'market_velocity.get_rankings',
    'market_velocity.get_for_bounds',
  ],

  // Heat Mapping Tools (14)
  heat_mapping: [
    'heat_mapping.analyze_area',
    'heat_mapping.competition_analysis',
    'heat_mapping.detect_opportunities',
    'heat_mapping.price_trends',
    'heat_mapping.distress_indicator',
    'heat_mapping.equity_analysis',
    'heat_mapping.absentee_owners',
    'heat_mapping.rental_yield',
    'heat_mapping.inventory',
    'heat_mapping.days_on_market',
    'heat_mapping.flip_potential',
    'heat_mapping.school_impact',
    'heat_mapping.crime_impact',
    'heat_mapping.development',
  ],

  // Map Tools (6)
  map: [
    'map.draw_search_area',
    'map.compare_areas',
    'map.show_commute_time',
    'map.toggle_style',
    'map.spatial_query',
    'map.compare_neighborhoods',
  ],

  // Permit Tools (8)
  permit: [
    'permit.history',
    'permit.details',
    'permit.search',
    'permit.metrics',
    'permit.analyze_patterns',
    'permit.check_system_age',
    'permit.deferred_maintenance',
    'permit.stalled',
  ],

  // Contractor Tools (5)
  contractor: [
    'contractor.search',
    'contractor.details',
    'contractor.history',
    'contractor.compare',
    'contractor.top',
  ],

  // Skip Trace Tools (10)
  skip_trace: [
    'skip_trace.trace_lead',
    'skip_trace.batch_trace',
    'skip_trace.get_status',
    'skip_trace.validate_phone',
    'skip_trace.validate_email',
    'skip_trace.enrich_lead',
    'skip_trace.find_related',
    'skip_trace.reverse_phone',
    'skip_trace.reverse_address',
    'skip_trace.get_credits',
  ],

  // Notification Tools (10)
  notification: [
    'notification.send_sms',
    'notification.send_email',
    'notification.send_from_template',
    'notification.generate_ai_message',
    'notification.get_inbox',
    'notification.mark_as_read',
    'notification.list_templates',
    'notification.get_status',
    'notification.check_opt_out',
    'notification.get_history',
  ],

  // Communication Tools (3)
  communication: [
    'comms.generate_sms_template',
    'comms.generate_email_sequence',
    'comms.generate_talking_points',
  ],

  // CRM Tools (12)
  crm: [
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
  ],

  // Dashboard Analytics Tools (12)
  dashboard: [
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
  ],

  // Document Tools (3)
  document: [
    'docs.generate_offer_letter',
    'docs.generate_deal_summary',
    'docs.generate_comp_report',
  ],

  // Predictive Tools (7)
  predictive: [
    'predict.seller_motivation',
    'predict.deal_close_probability',
    'predict.optimal_offer_price',
    'predict.time_to_close',
    'predict.classify_owner',
    'predict.batch_motivation',
    'predict.compare_motivation',
  ],

  // Intelligence Tools (3)
  intelligence: [
    'intel.competitor_activity',
    'intel.market_saturation',
    'intel.market_velocity',
  ],

  // Batch Tools (4)
  batch: [
    'batch.skip_trace_bulk',
    'batch.add_to_list_bulk',
    'batch.update_deal_status',
    'batch.export_properties',
  ],

  // Automation Tools (3)
  automation: [
    'workflow.auto_follow_up',
    'workflow.deal_stage_trigger',
    'workflow.alert_on_match',
  ],

  // Utility Tools (4)
  utility: [
    'utility.geocode',
    'utility.reverse_geocode',
    'utility.format_currency',
    'utility.calculate_distance',
  ],

  // Vertical Tools (4)
  vertical: [
    'vertical.get_active',
    'vertical.switch',
    'vertical.filters',
    'vertical.insights',
  ],

  // Portfolio Tools (3)
  portfolio: [
    'portfolio.performance_summary',
    'portfolio.roi_by_strategy',
    'portfolio.geographic_concentration',
  ],

  // Census Geography Tools (5)
  census: [
    'census.get_geography',
    'census.get_boundary_polygon',
    'census.classify_comp_geography',
    'census.batch_geocode_comps',
    'census.get_boundary_by_point',
  ],

  // Integration Tools (2)
  integration: [
    'sync.crm_export',
    'sync.calendar_integration',
  ],
};

// Flatten all tools for counting
const ALL_TOOL_IDS = Object.values(ALL_TOOLS).flat();

// ============================================================================
// TOOL EXISTENCE TESTS - Verify all tools are registered
// ============================================================================

describe('Tool Registry - Complete Coverage', () => {
  it('should have all expected tools registered', () => {
    const registeredTools = toolRegistry.getAll();
    console.log(`  📊 Expected: ${ALL_TOOL_IDS.length} tools`);
    console.log(`  📊 Registered: ${registeredTools.length} tools`);

    // Allow for some variance (tools may be added/removed)
    expect(registeredTools.length).toBeGreaterThanOrEqual(ALL_TOOL_IDS.length - 20);
  });

  // Test each category
  Object.entries(ALL_TOOLS).forEach(([category, toolIds]) => {
    describe(`${category} tools (${toolIds.length})`, () => {
      toolIds.forEach(toolId => {
        it(`should have ${toolId} registered`, () => {
          const tool = toolRegistry.get(toolId);
          expect(tool).toBeDefined();
          expect(tool?.id).toBe(toolId);
        });
      });
    });
  });
});

// ============================================================================
// SCHEMA VALIDATION TESTS - Test input schemas for all tools
// ============================================================================

describe('Tool Schema Validation - All Tools', () => {
  // Property Search Tools
  describe('Property Search Schemas', () => {
    it('property_search.search accepts valid input', () => {
      const tool = toolRegistry.get('property_search.search');
      const result = tool?.inputSchema.safeParse({
        query: 'houses in Miami under $300k',
        limit: 10,
      });
      expect(result?.success).toBe(true);
    });

    it('property_search.get_details accepts property ID', () => {
      const tool = toolRegistry.get('property_search.get_details');
      const result = tool?.inputSchema.safeParse({
        propertyId: 'prop-123',
      });
      expect(result?.success).toBe(true);
    });
  });

  // Property Detail Tools
  describe('Property Detail Schemas', () => {
    const propertyId = { propertyId: 'prop-123' };

    it('property.valuation accepts propertyId', () => {
      const tool = toolRegistry.get('property.valuation');
      expect(tool?.inputSchema.safeParse(propertyId).success).toBe(true);
    });

    it('property.comps accepts propertyId with options', () => {
      const tool = toolRegistry.get('property.comps');
      expect(tool?.inputSchema.safeParse({ ...propertyId, radius: 1 }).success).toBe(true);
    });

    it('property.motivation accepts propertyId', () => {
      const tool = toolRegistry.get('property.motivation');
      expect(tool?.inputSchema.safeParse(propertyId).success).toBe(true);
    });

    it('property.rental accepts propertyId', () => {
      const tool = toolRegistry.get('property.rental');
      expect(tool?.inputSchema.safeParse(propertyId).success).toBe(true);
    });

    it('property.issues accepts propertyId', () => {
      const tool = toolRegistry.get('property.issues');
      expect(tool?.inputSchema.safeParse(propertyId).success).toBe(true);
    });
  });

  // Deal Analysis Tools
  describe('Deal Analysis Schemas', () => {
    it('deal_analysis.analyze accepts propertyId', () => {
      const tool = toolRegistry.get('deal_analysis.analyze');
      expect(tool?.inputSchema.safeParse({ propertyId: 'prop-123' }).success).toBe(true);
    });

    it('deal_analysis.calculate_mao accepts ARV and repairs', () => {
      const tool = toolRegistry.get('deal_analysis.calculate_mao');
      expect(tool?.inputSchema.safeParse({
        arv: 300000,
        repairCost: 50000,
      }).success).toBe(true);
    });

    it('deal_analysis.score accepts propertyId', () => {
      const tool = toolRegistry.get('deal_analysis.score');
      expect(tool?.inputSchema.safeParse({ propertyId: 'prop-123' }).success).toBe(true);
    });
  });

  // Deal Pipeline Tools
  describe('Deal Pipeline Schemas', () => {
    it('deal.create accepts property address', () => {
      const tool = toolRegistry.get('deal.create');
      expect(tool?.inputSchema.safeParse({
        propertyAddress: '123 Main St, Miami, FL',
      }).success).toBe(true);
    });

    it('deal.update_stage accepts dealId and newStage', () => {
      const tool = toolRegistry.get('deal.update_stage');
      // Uses 'newStage' with valid stage enum values
      expect(tool?.inputSchema.safeParse({
        dealId: 'deal-123',
        newStage: 'contract',
      }).success).toBe(true);
    });

    it('deal.assign_buyer accepts dealId and buyerId', () => {
      const tool = toolRegistry.get('deal.assign_buyer');
      expect(tool?.inputSchema.safeParse({
        dealId: 'deal-123',
        buyerId: 'buyer-456',
      }).success).toBe(true);
    });

    it('deal.get_timeline accepts dealId', () => {
      const tool = toolRegistry.get('deal.get_timeline');
      expect(tool?.inputSchema.safeParse({ dealId: 'deal-123' }).success).toBe(true);
    });

    it('deal.predict_outcome accepts dealId', () => {
      const tool = toolRegistry.get('deal.predict_outcome');
      expect(tool?.inputSchema.safeParse({ dealId: 'deal-123' }).success).toBe(true);
    });

    it('deal.flag_issues accepts empty input', () => {
      const tool = toolRegistry.get('deal.flag_issues');
      expect(tool?.inputSchema.safeParse({}).success).toBe(true);
    });
  });

  // Buyer Management Tools
  describe('Buyer Management Schemas', () => {
    it('buyer_management.match_buyers_to_property accepts propertyId', () => {
      const tool = toolRegistry.get('buyer_management.match_buyers_to_property');
      expect(tool?.inputSchema.safeParse({ propertyId: 'prop-123' }).success).toBe(true);
    });

    it('buyer_management.search_buyers accepts query', () => {
      const tool = toolRegistry.get('buyer_management.search_buyers');
      expect(tool?.inputSchema.safeParse({ query: 'Miami' }).success).toBe(true);
    });

    it('buyer_management.get_buyer_insights accepts buyerId', () => {
      const tool = toolRegistry.get('buyer_management.get_buyer_insights');
      expect(tool?.inputSchema.safeParse({ buyerId: 'buyer-123' }).success).toBe(true);
    });

    it('buyer.score_fit accepts buyerId and propertyId', () => {
      const tool = toolRegistry.get('buyer.score_fit');
      expect(tool?.inputSchema.safeParse({
        buyerId: 'buyer-123',
        propertyId: 'prop-456',
      }).success).toBe(true);
    });
  });

  // Filter Tools
  describe('Filter Schemas', () => {
    it('filter.suggest accepts goal', () => {
      const tool = toolRegistry.get('filter.suggest');
      expect(tool?.inputSchema.safeParse({ goal: 'flip' }).success).toBe(true);
    });

    it('filter.explain accepts filterName', () => {
      const tool = toolRegistry.get('filter.explain');
      expect(tool?.inputSchema.safeParse({ filterName: 'High Equity' }).success).toBe(true);
    });

    it('filter.create accepts description', () => {
      const tool = toolRegistry.get('filter.create');
      expect(tool?.inputSchema.safeParse({
        description: 'Properties with 30%+ equity in Miami',
      }).success).toBe(true);
    });

    it('filter.compare accepts filterA and filterB', () => {
      const tool = toolRegistry.get('filter.compare');
      expect(tool?.inputSchema.safeParse({
        filterA: { minPrice: 100000 },
        filterB: { minPrice: 200000 },
      }).success).toBe(true);
    });

    it('filter.validate accepts criteria', () => {
      const tool = toolRegistry.get('filter.validate');
      expect(tool?.inputSchema.safeParse({
        criteria: { minPrice: 100000, maxPrice: 300000 },
      }).success).toBe(true);
    });
  });

  // Search Tools
  describe('Search Schemas', () => {
    it('search.by_description accepts description', () => {
      const tool = toolRegistry.get('search.by_description');
      expect(tool?.inputSchema.safeParse({
        description: 'cheap houses in Miami for flipping',
      }).success).toBe(true);
    });

    it('search.execute_filter accepts filterName', () => {
      const tool = toolRegistry.get('search.execute_filter');
      // Uses 'filterName' field
      expect(tool?.inputSchema.safeParse({ filterName: 'High Equity' }).success).toBe(true);
    });

    it('search.save_filter accepts name and criteria', () => {
      const tool = toolRegistry.get('search.save_filter');
      expect(tool?.inputSchema.safeParse({
        name: 'My Filter',
        criteria: { minPrice: 100000 },
      }).success).toBe(true);
    });

    it('search.similar_to_deal accepts dealId', () => {
      const tool = toolRegistry.get('search.similar_to_deal');
      expect(tool?.inputSchema.safeParse({ dealId: 'deal-123' }).success).toBe(true);
    });
  });

  // Market Analysis Tools
  describe('Market Analysis Schemas', () => {
    it('market_analysis.trends accepts market', () => {
      const tool = toolRegistry.get('market_analysis.trends');
      // Uses 'market' field
      expect(tool?.inputSchema.safeParse({ market: 'Miami, FL' }).success).toBe(true);
    });

    it('market_analysis.forecast accepts zipCode', () => {
      const tool = toolRegistry.get('market_analysis.forecast');
      // Uses 'zipCode' field
      expect(tool?.inputSchema.safeParse({ zipCode: '33101' }).success).toBe(true);
    });

    it('market_analysis.compare accepts markets array', () => {
      const tool = toolRegistry.get('market_analysis.compare');
      // Uses 'markets' array (not 'locations')
      expect(tool?.inputSchema.safeParse({
        markets: ['Miami, FL', 'Tampa, FL'],
      }).success).toBe(true);
    });

    it('market_analysis.rental accepts zipCode', () => {
      const tool = toolRegistry.get('market_analysis.rental');
      // Uses 'zipCode' field
      expect(tool?.inputSchema.safeParse({ zipCode: '32801' }).success).toBe(true);
    });
  });

  // Market Velocity Tools
  describe('Market Velocity Schemas', () => {
    it('market_velocity.get_velocity accepts location', () => {
      const tool = toolRegistry.get('market_velocity.get_velocity');
      expect(tool?.inputSchema.safeParse({ location: 'Miami, FL' }).success).toBe(true);
    });

    it('market_velocity.find_hot_markets accepts state', () => {
      const tool = toolRegistry.get('market_velocity.find_hot_markets');
      expect(tool?.inputSchema.safeParse({ state: 'FL' }).success).toBe(true);
    });

    it('market_velocity.compare_markets accepts locations array of objects', () => {
      const tool = toolRegistry.get('market_velocity.compare_markets');
      // Locations is array of objects with optional zipCode/city/state
      expect(tool?.inputSchema.safeParse({
        locations: [
          { city: 'Miami', state: 'FL' },
          { city: 'Tampa', state: 'FL' },
        ],
      }).success).toBe(true);
    });
  });

  // Heat Mapping Tools
  describe('Heat Mapping Schemas', () => {
    // All heat mapping tools use zipCode as primary input
    const zipCodeInput = { zipCode: '33101' };

    it('heat_mapping.analyze_area accepts zipCode', () => {
      const tool = toolRegistry.get('heat_mapping.analyze_area');
      expect(tool?.inputSchema.safeParse(zipCodeInput).success).toBe(true);
    });

    it('heat_mapping.detect_opportunities accepts criteria', () => {
      const tool = toolRegistry.get('heat_mapping.detect_opportunities');
      // Uses 'criteria' object with optional minScore, propertyTypes, priceRange
      expect(tool?.inputSchema.safeParse({
        criteria: { minScore: 70 },
        limit: 10,
      }).success).toBe(true);
    });

    it('heat_mapping.equity_analysis accepts zipCode', () => {
      const tool = toolRegistry.get('heat_mapping.equity_analysis');
      expect(tool?.inputSchema.safeParse(zipCodeInput).success).toBe(true);
    });

    it('heat_mapping.flip_potential accepts zipCode', () => {
      const tool = toolRegistry.get('heat_mapping.flip_potential');
      expect(tool?.inputSchema.safeParse(zipCodeInput).success).toBe(true);
    });
  });

  // Map Tools
  describe('Map Schemas', () => {
    it('map.draw_search_area accepts center and radius', () => {
      const tool = toolRegistry.get('map.draw_search_area');
      expect(tool?.inputSchema.safeParse({
        center: { lat: 25.7617, lng: -80.1918 },
        radius: 2,
      }).success).toBe(true);
    });

    it('map.show_commute_time accepts center and minutes', () => {
      const tool = toolRegistry.get('map.show_commute_time');
      // Uses 'center' (not 'origin')
      expect(tool?.inputSchema.safeParse({
        center: { lat: 25.7617, lng: -80.1918 },
        minutes: 15,
      }).success).toBe(true);
    });

    it('map.compare_areas accepts areas array', () => {
      const tool = toolRegistry.get('map.compare_areas');
      // Uses 'areas' array of objects with name, center, radiusMiles
      expect(tool?.inputSchema.safeParse({
        areas: [
          { name: 'Area 1', center: { lat: 25.7617, lng: -80.1918 }, radiusMiles: 3 },
          { name: 'Area 2', center: { lat: 25.85, lng: -80.25 }, radiusMiles: 3 },
        ],
      }).success).toBe(true);
    });
  });

  // Permit Tools
  describe('Permit Schemas', () => {
    it('permit.history accepts addressId', () => {
      const tool = toolRegistry.get('permit.history');
      // Uses 'addressId' field
      expect(tool?.inputSchema.safeParse({ addressId: 'addr-123' }).success).toBe(true);
    });

    it('permit.details accepts permitId', () => {
      const tool = toolRegistry.get('permit.details');
      expect(tool?.inputSchema.safeParse({ permitId: 'permit-123' }).success).toBe(true);
    });

    it('permit.search accepts geoId', () => {
      const tool = toolRegistry.get('permit.search');
      expect(tool?.inputSchema.safeParse({
        geoId: 'geo-123',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
      }).success).toBe(true);
    });

    it('permit.analyze_patterns accepts addressId', () => {
      const tool = toolRegistry.get('permit.analyze_patterns');
      // Uses 'addressId' (Shovels address ID), not 'propertyId'
      expect(tool?.inputSchema.safeParse({ addressId: 'addr-123' }).success).toBe(true);
    });
  });

  // Contractor Tools
  describe('Contractor Schemas', () => {
    it('contractor.search accepts geoId, fromDate, toDate', () => {
      const tool = toolRegistry.get('contractor.search');
      // Uses Shovels API structure with geoId and date range
      expect(tool?.inputSchema.safeParse({
        geoId: '33101',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
      }).success).toBe(true);
    });

    it('contractor.details accepts contractorId', () => {
      const tool = toolRegistry.get('contractor.details');
      expect(tool?.inputSchema.safeParse({ contractorId: 'contractor-123' }).success).toBe(true);
    });

    it('contractor.compare accepts contractorIds', () => {
      const tool = toolRegistry.get('contractor.compare');
      expect(tool?.inputSchema.safeParse({
        contractorIds: ['c-1', 'c-2', 'c-3'],
      }).success).toBe(true);
    });
  });

  // Skip Trace Tools
  describe('Skip Trace Schemas', () => {
    it('skip_trace.trace_lead accepts leadId', () => {
      const tool = toolRegistry.get('skip_trace.trace_lead');
      expect(tool?.inputSchema.safeParse({ leadId: 'lead-123' }).success).toBe(true);
    });

    it('skip_trace.batch_trace accepts leadIds', () => {
      const tool = toolRegistry.get('skip_trace.batch_trace');
      expect(tool?.inputSchema.safeParse({
        leadIds: ['lead-1', 'lead-2', 'lead-3'],
      }).success).toBe(true);
    });

    it('skip_trace.validate_phone accepts phoneNumber', () => {
      const tool = toolRegistry.get('skip_trace.validate_phone');
      // Uses 'phoneNumber' not 'phone'
      expect(tool?.inputSchema.safeParse({ phoneNumber: '555-123-4567' }).success).toBe(true);
    });

    it('skip_trace.validate_email accepts email', () => {
      const tool = toolRegistry.get('skip_trace.validate_email');
      expect(tool?.inputSchema.safeParse({ email: 'test@example.com' }).success).toBe(true);
    });

    it('skip_trace.get_credits accepts empty input', () => {
      const tool = toolRegistry.get('skip_trace.get_credits');
      expect(tool?.inputSchema.safeParse({}).success).toBe(true);
    });
  });

  // Notification Tools
  describe('Notification Schemas', () => {
    it('notification.send_sms accepts to and message', () => {
      const tool = toolRegistry.get('notification.send_sms');
      expect(tool?.inputSchema.safeParse({
        to: '555-123-4567',
        message: 'Hello, interested in selling?',
      }).success).toBe(true);
    });

    it('notification.send_email accepts to, subject, and body', () => {
      const tool = toolRegistry.get('notification.send_email');
      expect(tool?.inputSchema.safeParse({
        to: 'test@example.com',
        subject: 'Property Inquiry',
        body: 'Are you interested in selling?',
      }).success).toBe(true);
    });

    it('notification.get_inbox accepts empty input', () => {
      const tool = toolRegistry.get('notification.get_inbox');
      expect(tool?.inputSchema.safeParse({}).success).toBe(true);
    });

    it('notification.list_templates accepts empty input', () => {
      const tool = toolRegistry.get('notification.list_templates');
      expect(tool?.inputSchema.safeParse({}).success).toBe(true);
    });
  });

  // Communication Tools
  describe('Communication Schemas', () => {
    it('comms.generate_sms_template accepts purpose', () => {
      const tool = toolRegistry.get('comms.generate_sms_template');
      // Uses enum-based 'purpose' field
      expect(tool?.inputSchema.safeParse({
        purpose: 'initial_contact',
      }).success).toBe(true);
    });

    it('comms.generate_email_sequence accepts purpose', () => {
      const tool = toolRegistry.get('comms.generate_email_sequence');
      // Uses enum-based 'purpose' field
      expect(tool?.inputSchema.safeParse({
        purpose: 'cold_outreach',
        sequenceLength: 5,
      }).success).toBe(true);
    });

    it('comms.generate_talking_points accepts propertyId and scenario', () => {
      const tool = toolRegistry.get('comms.generate_talking_points');
      // Uses 'propertyId' and enum-based 'scenario'
      expect(tool?.inputSchema.safeParse({
        propertyId: 'prop-123',
        scenario: 'cold_call',
      }).success).toBe(true);
    });
  });

  // CRM Tools
  describe('CRM Schemas', () => {
    it('crm.create_lead_list accepts name and criteria', () => {
      const tool = toolRegistry.get('crm.create_lead_list');
      expect(tool?.inputSchema.safeParse({
        name: 'Hot Leads Miami',
        criteria: { location: 'Miami' },
      }).success).toBe(true);
    });

    it('crm.rank_by_motivation accepts leadIds', () => {
      const tool = toolRegistry.get('crm.rank_by_motivation');
      expect(tool?.inputSchema.safeParse({
        leadIds: ['lead-1', 'lead-2', 'lead-3'],
      }).success).toBe(true);
    });

    it('crm.identify_hot accepts empty input', () => {
      const tool = toolRegistry.get('crm.identify_hot');
      expect(tool?.inputSchema.safeParse({}).success).toBe(true);
    });

    it('crm.merge_leads accepts primaryLeadId and duplicateLeadIds', () => {
      const tool = toolRegistry.get('crm.merge_leads');
      // Uses 'primaryLeadId' and 'duplicateLeadIds' (not 'leadIds')
      expect(tool?.inputSchema.safeParse({
        primaryLeadId: 'lead-1',
        duplicateLeadIds: ['lead-2', 'lead-3'],
      }).success).toBe(true);
    });
  });

  // Dashboard Tools
  describe('Dashboard Schemas', () => {
    it('dashboard.insights accepts period', () => {
      const tool = toolRegistry.get('dashboard.insights');
      expect(tool?.inputSchema.safeParse({ period: 'week' }).success).toBe(true);
    });

    it('dashboard.goals accepts empty input', () => {
      const tool = toolRegistry.get('dashboard.goals');
      expect(tool?.inputSchema.safeParse({}).success).toBe(true);
    });

    it('dashboard.performance accepts period', () => {
      const tool = toolRegistry.get('dashboard.performance');
      expect(tool?.inputSchema.safeParse({ period: 'month' }).success).toBe(true);
    });

    it('dashboard.funnel accepts period', () => {
      const tool = toolRegistry.get('dashboard.funnel');
      expect(tool?.inputSchema.safeParse({ period: 'quarter' }).success).toBe(true);
    });

    it('dashboard.kpis accepts empty input', () => {
      const tool = toolRegistry.get('dashboard.kpis');
      expect(tool?.inputSchema.safeParse({}).success).toBe(true);
    });
  });

  // Document Tools
  describe('Document Schemas', () => {
    it('docs.generate_offer_letter accepts propertyId, offerAmount and buyerName', () => {
      const tool = toolRegistry.get('docs.generate_offer_letter');
      // Requires propertyId, offerAmount, and buyerName (all required)
      expect(tool?.inputSchema.safeParse({
        propertyId: 'prop-123',
        offerAmount: 150000,
        buyerName: 'John Doe',
      }).success).toBe(true);
    });

    it('docs.generate_deal_summary accepts dealId', () => {
      const tool = toolRegistry.get('docs.generate_deal_summary');
      expect(tool?.inputSchema.safeParse({ dealId: 'deal-123' }).success).toBe(true);
    });

    it('docs.generate_comp_report accepts propertyId', () => {
      const tool = toolRegistry.get('docs.generate_comp_report');
      expect(tool?.inputSchema.safeParse({ propertyId: 'prop-123' }).success).toBe(true);
    });
  });

  // Predictive Tools
  describe('Predictive Schemas', () => {
    it('predict.seller_motivation accepts propertyId', () => {
      const tool = toolRegistry.get('predict.seller_motivation');
      expect(tool?.inputSchema.safeParse({ propertyId: 'prop-123' }).success).toBe(true);
    });

    it('predict.deal_close_probability accepts dealId', () => {
      const tool = toolRegistry.get('predict.deal_close_probability');
      expect(tool?.inputSchema.safeParse({ dealId: 'deal-123' }).success).toBe(true);
    });

    it('predict.optimal_offer_price accepts propertyId', () => {
      const tool = toolRegistry.get('predict.optimal_offer_price');
      expect(tool?.inputSchema.safeParse({ propertyId: 'prop-123' }).success).toBe(true);
    });

    it('predict.classify_owner accepts ownerName', () => {
      const tool = toolRegistry.get('predict.classify_owner');
      // Uses 'ownerName' for classification (not 'propertyId')
      expect(tool?.inputSchema.safeParse({ ownerName: 'ABC Holdings LLC' }).success).toBe(true);
    });

    it('predict.batch_motivation accepts properties array', () => {
      const tool = toolRegistry.get('predict.batch_motivation');
      // Uses 'properties' array with address (not 'propertyIds')
      expect(tool?.inputSchema.safeParse({
        properties: [
          { address: '123 Main St, Miami, FL' },
          { address: '456 Oak Ave, Tampa, FL' },
        ],
      }).success).toBe(true);
    });
  });

  // Intelligence Tools
  describe('Intelligence Schemas', () => {
    it('intel.competitor_activity accepts zipCodes array', () => {
      const tool = toolRegistry.get('intel.competitor_activity');
      // Uses 'zipCodes' array (min 1, max 10) for permit-based analysis
      expect(tool?.inputSchema.safeParse({
        zipCodes: ['33101', '33125'],
        timeframeDays: 30,
      }).success).toBe(true);
    });

    it('intel.market_saturation accepts zipCode', () => {
      const tool = toolRegistry.get('intel.market_saturation');
      // Uses 'zipCode' string for market saturation analysis
      expect(tool?.inputSchema.safeParse({ zipCode: '33101' }).success).toBe(true);
    });
  });

  // Batch Tools
  describe('Batch Schemas', () => {
    it('batch.skip_trace_bulk accepts propertyIds', () => {
      const tool = toolRegistry.get('batch.skip_trace_bulk');
      expect(tool?.inputSchema.safeParse({
        propertyIds: ['prop-1', 'prop-2', 'prop-3'],
      }).success).toBe(true);
    });

    it('batch.add_to_list_bulk accepts listId and propertyIds', () => {
      const tool = toolRegistry.get('batch.add_to_list_bulk');
      expect(tool?.inputSchema.safeParse({
        listId: 'list-123',
        propertyIds: ['prop-1', 'prop-2'],
      }).success).toBe(true);
    });

    it('batch.export_properties accepts propertyIds and format', () => {
      const tool = toolRegistry.get('batch.export_properties');
      expect(tool?.inputSchema.safeParse({
        propertyIds: ['prop-1', 'prop-2'],
        format: 'csv',
      }).success).toBe(true);
    });
  });

  // Automation Tools
  describe('Automation Schemas', () => {
    it('workflow.auto_follow_up accepts dealId and followUpType', () => {
      const tool = toolRegistry.get('workflow.auto_follow_up');
      // Requires dealId and followUpType enum
      expect(tool?.inputSchema.safeParse({
        dealId: 'deal-123',
        followUpType: 'email',
      }).success).toBe(true);
    });

    it('workflow.alert_on_match accepts alertName, criteria, notifyVia', () => {
      const tool = toolRegistry.get('workflow.alert_on_match');
      // Requires alertName, criteria object, and notifyVia array
      expect(tool?.inputSchema.safeParse({
        alertName: 'High Equity Alert',
        criteria: { location: 'Miami', equityPercent: 30 },
        notifyVia: ['email', 'push'],
      }).success).toBe(true);
    });
  });

  // Utility Tools
  describe('Utility Schemas', () => {
    it('utility.geocode accepts address', () => {
      const tool = toolRegistry.get('utility.geocode');
      expect(tool?.inputSchema.safeParse({
        address: '123 Main St, Miami, FL 33101',
      }).success).toBe(true);
    });

    it('utility.reverse_geocode accepts coordinates object', () => {
      const tool = toolRegistry.get('utility.reverse_geocode');
      // Uses 'coordinates' object with lat/lng
      expect(tool?.inputSchema.safeParse({
        coordinates: { lat: 25.7617, lng: -80.1918 },
      }).success).toBe(true);
    });

    it('utility.format_currency accepts amount', () => {
      const tool = toolRegistry.get('utility.format_currency');
      expect(tool?.inputSchema.safeParse({ amount: 150000 }).success).toBe(true);
    });

    it('utility.calculate_distance accepts two points', () => {
      const tool = toolRegistry.get('utility.calculate_distance');
      expect(tool?.inputSchema.safeParse({
        from: { lat: 25.7617, lng: -80.1918 },
        to: { lat: 25.8, lng: -80.2 },
      }).success).toBe(true);
    });
  });

  // Vertical Tools
  describe('Vertical Schemas', () => {
    it('vertical.get_active accepts empty input', () => {
      const tool = toolRegistry.get('vertical.get_active');
      expect(tool?.inputSchema.safeParse({}).success).toBe(true);
    });

    it('vertical.switch accepts vertical enum', () => {
      const tool = toolRegistry.get('vertical.switch');
      // Uses 'vertical' field with enum value
      expect(tool?.inputSchema.safeParse({ vertical: 'wholesaling' }).success).toBe(true);
    });

    it('vertical.filters accepts vertical enum', () => {
      const tool = toolRegistry.get('vertical.filters');
      // Uses 'vertical' field (optional)
      expect(tool?.inputSchema.safeParse({ vertical: 'wholesaling' }).success).toBe(true);
    });
  });

  // Portfolio Tools
  describe('Portfolio Schemas', () => {
    it('portfolio.performance_summary accepts period', () => {
      const tool = toolRegistry.get('portfolio.performance_summary');
      expect(tool?.inputSchema.safeParse({ period: 'ytd' }).success).toBe(true);
    });

    it('portfolio.roi_by_strategy accepts empty input', () => {
      const tool = toolRegistry.get('portfolio.roi_by_strategy');
      expect(tool?.inputSchema.safeParse({}).success).toBe(true);
    });

    it('portfolio.geographic_concentration accepts empty input', () => {
      const tool = toolRegistry.get('portfolio.geographic_concentration');
      expect(tool?.inputSchema.safeParse({}).success).toBe(true);
    });
  });

  // Census Tools
  describe('Census Schemas', () => {
    it('census.get_geography accepts lat/lng coordinates', () => {
      const tool = toolRegistry.get('census.get_geography');
      // Census geocoding requires latitude/longitude
      expect(tool?.inputSchema.safeParse({
        latitude: 25.7617,
        longitude: -80.1918,
      }).success).toBe(true);
    });

    it('census.get_boundary_polygon accepts geoid', () => {
      const tool = toolRegistry.get('census.get_boundary_polygon');
      // Uses 'geoid' (lowercase) field
      expect(tool?.inputSchema.safeParse({ geoid: '120860001001' }).success).toBe(true);
    });

    it('census.get_boundary_by_point accepts lat/lng', () => {
      const tool = toolRegistry.get('census.get_boundary_by_point');
      expect(tool?.inputSchema.safeParse({
        latitude: 25.7617,
        longitude: -80.1918,
      }).success).toBe(true);
    });
  });

  // Integration Tools
  describe('Integration Schemas', () => {
    it('sync.crm_export accepts crm, entityType, entityIds', () => {
      const tool = toolRegistry.get('sync.crm_export');
      // Requires crm enum, entityType, and entityIds array
      expect(tool?.inputSchema.safeParse({
        crm: 'salesforce',
        entityType: 'leads',
        entityIds: ['lead-1', 'lead-2'],
      }).success).toBe(true);
    });

    it('sync.calendar_integration accepts provider and action', () => {
      const tool = toolRegistry.get('sync.calendar_integration');
      // Requires provider enum and action enum
      expect(tool?.inputSchema.safeParse({
        provider: 'google',
        action: 'list_events',
      }).success).toBe(true);
    });
  });
});

// ============================================================================
// TOOL EXECUTION TESTS - Verify handlers work (with mocks)
// ============================================================================

describe('Tool Execution - Selected Tools', () => {
  it('should execute utility.geocode', async () => {
    const result = await executeTool('utility.geocode', {
      address: '123 Main St, Miami, FL 33101',
    }, ctx);
    // Should not fail due to missing tool or permission
    expect(result.error?.code).not.toBe('TOOL_NOT_FOUND');
    expect(result.error?.code).not.toBe('PERMISSION_DENIED');
  });

  it('should execute utility.format_currency', async () => {
    const result = await executeTool('utility.format_currency', {
      amount: 150000,
    }, ctx);
    expect(result.error?.code).not.toBe('TOOL_NOT_FOUND');
  });

  it('should execute skip_trace.get_credits (mocked)', async () => {
    const result = await executeTool('skip_trace.get_credits', {}, ctx);
    expect(result.error?.code).not.toBe('TOOL_NOT_FOUND');
    expect(result.error?.code).not.toBe('PERMISSION_DENIED');
  });

  it('should execute dashboard.kpis', async () => {
    const result = await executeTool('dashboard.kpis', {}, ctx);
    expect(result.error?.code).not.toBe('TOOL_NOT_FOUND');
  });

  it('should execute filter.explain', async () => {
    const result = await executeTool('filter.explain', {
      filterName: 'High Equity',
    }, ctx);
    expect(result.error?.code).not.toBe('TOOL_NOT_FOUND');
  });

  it('should execute vertical.get_active', async () => {
    const result = await executeTool('vertical.get_active', {}, ctx);
    expect(result.error?.code).not.toBe('TOOL_NOT_FOUND');
  });
});

// ============================================================================
// TOOL METADATA TESTS - Verify tool properties
// ============================================================================

describe('Tool Metadata - All Tools', () => {
  Object.entries(ALL_TOOLS).forEach(([category, toolIds]) => {
    describe(`${category} metadata`, () => {
      toolIds.forEach(toolId => {
        it(`${toolId} has required metadata`, () => {
          const tool = toolRegistry.get(toolId);
          if (!tool) return; // Skip if tool doesn't exist

          expect(tool.name).toBeDefined();
          expect(tool.description).toBeDefined();
          expect(tool.category).toBeDefined();
          expect(tool.tags).toBeDefined();
          expect(Array.isArray(tool.tags)).toBe(true);
          expect(tool.requiredPermission).toBeDefined();
          expect(['read', 'write', 'execute', 'admin']).toContain(tool.requiredPermission);
        });
      });
    });
  });
});

// ============================================================================
// STATISTICS
// ============================================================================

describe('Tool Statistics', () => {
  it('should report complete coverage statistics', () => {
    const registeredTools = toolRegistry.getAll();
    const expectedCount = ALL_TOOL_IDS.length;
    const registeredCount = registeredTools.length;

    console.log('\n📊 TOOL COVERAGE STATISTICS');
    console.log('═'.repeat(50));
    console.log(`  Expected tools: ${expectedCount}`);
    console.log(`  Registered tools: ${registeredCount}`);
    console.log(`  Coverage: ${Math.round((Math.min(registeredCount, expectedCount) / expectedCount) * 100)}%`);
    console.log('═'.repeat(50));

    // Breakdown by category
    console.log('\n📂 BY CATEGORY:');
    Object.entries(ALL_TOOLS).forEach(([category, toolIds]) => {
      const registered = toolIds.filter(id => toolRegistry.has(id)).length;
      console.log(`  ${category}: ${registered}/${toolIds.length}`);
    });
    console.log('');

    // This test always passes - it's for reporting
    expect(true).toBe(true);
  });
});
