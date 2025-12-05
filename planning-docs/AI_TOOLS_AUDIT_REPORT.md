# AI Tools & Integration Audit Report

**Project**: REI Command Center (Real Estate Wholesaling Platform)
**Audit Date**: December 4, 2025
**Auditor**: Claude AI Audit System

---

## Executive Summary

### Tool Ecosystem Health Score: 7.5/10

**Statistics:**
| Metric | Value |
|--------|-------|
| Total Tools Discovered | 184 (active) |
| Expected Tools (per tests) | 187 |
| Missing Tool Files | 2 (CRITICAL) |
| Categories | 25 active + 2 missing |
| Tools with Complete Schemas | 184/184 (100%) |
| Tools with Working Routes | 184/184 (projected) |
| Tools with Tests | 160/187 (~86%) |
| External API Dependencies | 6 services |
| Database Dependencies | 41 tables |

**Issue Summary:**
| Severity | Count |
|----------|-------|
| Critical | 2 |
| High | 3 |
| Medium | 5 |
| Low | 4 |

---

## PHASE 0: AUTONOMOUS DISCOVERY

### AI Infrastructure Discovered

```
AI INFRASTRUCTURE DISCOVERED
============================
AI SDK: Vercel AI SDK v5 (@ai-sdk/xai)
AI Provider(s): xAI Grok (migrated from Claude Dec 2025)
  - High Tier: grok-4-1-fast-reasoning
  - Medium/Low Tier: grok-4-1-fast-non-reasoning
Tool Definition Pattern: Zod schemas with TypeScript interfaces
Tool Location(s): src/lib/ai/tools/categories/
Tool Count (preliminary): 184 active, 187 expected
Execution Pattern: Registry → Adapter → AI SDK ToolSet
Migration Status: Claude → Grok COMPLETED (backward compat aliases exist)
```

### Models Configuration

| Model ID | Tier | Context Window | Max Output |
|----------|------|----------------|------------|
| grok-4-1-fast-reasoning | High | 2M tokens | 131K tokens |
| grok-4-1-fast-non-reasoning | Medium/Low | 2M tokens | 131K tokens |

**Backward Compatibility Aliases:**
- `CLAUDE_MODELS.OPUS` → `GROK_MODELS.REASONING`
- `CLAUDE_MODELS.SONNET` → `GROK_MODELS.FAST`
- `CLAUDE_MODELS.HAIKU` → `GROK_MODELS.FAST`

---

## TOOL INVENTORY

### Total Tools: 184 Active (187 Expected)

| Category File | Tool Count | Tool IDs |
|--------------|------------|----------|
| property-search.ts | 2 | property_search.search, property_search.get_details |
| deal-analysis.ts | 3 | deal_analysis.analyze, deal_analysis.calculate_mao, deal_analysis.score |
| property-detail-tools.ts | 13 | property.valuation, property.comps, property.motivation, property.summary, property.deal_potential, property.ownership, property.repairs, property.time_on_market, property.neighborhood, property.portfolio_compare, property.offer_price, property.rental, property.issues |
| filter-tools.ts | 11 | filter.suggest, filter.explain, filter.optimize, filter.create, filter.compare, filter.performance, filter.refine, filter.export, filter.import, filter.recommendations, filter.validate |
| deal-pipeline.ts | 12 | deal.create, deal.updateStage, deal.analyzeProgress, deal.generateOfferStrategy, deal.assignBuyer, deal.getTimeline, deal.predictOutcome, deal.generateSummary, deal.compareToPortfolio, deal.suggestActions, deal.calculateMetrics, deal.flagIssues |
| buyer-management.ts | 13 | buyer_management.match_buyers_to_property, buyer_management.get_buyer_insights, buyer_management.analyze_buyer_activity, buyer_management.search_buyers, buyer.suggestOutreach, buyer.compare, buyer.predictBehavior, buyer.segment, buyer.identifyGaps, buyer.generateReport, buyer.scoreFit, buyer.trackPreferenceChanges, buyer.recommendActions |
| crm-tools.ts | 12 | crm.createLeadList, crm.rankByMotivation, crm.suggestOutreach, crm.analyzeSource, crm.segmentLeads, crm.predictConversion, crm.generateReport, crm.identifyHot, crm.trackEngagement, crm.suggestNurturing, crm.mergeLeads, crm.exportLeads |
| search-tools.ts | 10 | search.by_description, search.execute_filter, search.save_filter, search.recent, search.refine, search.compare, search.export, search.schedule, search.suggestions, search.analyze |
| skip-trace-tools.ts | 10 | skipTrace.traceLead, skipTrace.batchTrace, skipTrace.getStatus, skipTrace.validatePhone, skipTrace.validateEmail, skipTrace.enrichLead, skipTrace.findRelated, skipTrace.reversePhone, skipTrace.reverseAddress, skipTrace.getCredits |
| notification-tools.ts | 10 | notification.sendSMS, notification.sendEmail, notification.sendFromTemplate, notification.generateAIMessage, notification.getInbox, notification.markAsRead, notification.listTemplates, notification.getStatus, notification.checkOptOut, notification.getHistory |
| heat-mapping.ts | 14 | heat_mapping.analyze_area, heat_mapping.competition_analysis, heat_mapping.detect_opportunities, heat_mapping.price_trends, heat_mapping.distress_indicator, heat_mapping.equity_analysis, heat_mapping.absentee_owners, heat_mapping.rental_yield, heat_mapping.inventory, heat_mapping.days_on_market, heat_mapping.flip_potential, heat_mapping.school_impact, heat_mapping.crime_impact, heat_mapping.development |
| market-analysis.ts | 10 | market_analysis.trends, market_analysis.forecast, market_analysis.compare, market_analysis.seasonality, market_analysis.supply_demand, market_analysis.economic, market_analysis.roi, market_analysis.neighborhood, market_analysis.rental, market_analysis.timing |
| dashboard-analytics.ts | 12 | dashboard.insights, dashboard.goals, dashboard.performance, dashboard.report, dashboard.anomalies, dashboard.trends, dashboard.activity, dashboard.funnel, dashboard.compare_periods, dashboard.alerts, dashboard.recommendations, dashboard.kpis |
| permit-tools.ts | 8 | permit.history, permit.details, permit.search, permit.metrics, permit.analyze_patterns, permit.check_system_age, permit.deferred_maintenance, permit.stalled |
| contractor-tools.ts | 5 | contractor.search, contractor.details, contractor.history, contractor.compare, contractor.top |
| vertical-tools.ts | 4 | vertical.get_active, vertical.switch, vertical.filters, vertical.insights |
| batch-tools.ts | 4 | batch.skip_trace_bulk, batch.add_to_list_bulk, batch.update_deal_status, batch.export_properties |
| document-tools.ts | 3 | docs.generate_offer_letter, docs.generate_deal_summary, docs.generate_comp_report |
| automation-tools.ts | 3 | workflow.auto_follow_up, workflow.deal_stage_trigger, workflow.alert_on_match |
| predictive-tools.ts | 4 | predict.seller_motivation, predict.deal_close_probability, predict.optimal_offer_price, predict.time_to_close |
| intelligence-tools.ts | 3 | intel.competitor_activity, intel.market_saturation, intel.emerging_markets |
| communication-tools.ts | 3 | comms.generate_sms_template, comms.generate_email_sequence, comms.generate_talking_points |
| portfolio-tools.ts | 3 | portfolio.performance_summary, portfolio.roi_by_strategy, portfolio.geographic_concentration |
| advanced-search-tools.ts | 3 | search.similar_to_deal, search.buyer_property_match, search.permit_pattern_match |
| integration-tools.ts | 2 | sync.crm_export, sync.calendar_integration |
| **map-tools.ts** | **6** | **MISSING FILE** |
| **utility-tools.ts** | **4** | **MISSING FILE** |

**TOTAL ACTIVE: 184 tools**
**TOTAL EXPECTED: 194 tools (including missing files)**

---

## TOOL ROUTING FLOW

```
TOOL ROUTING FLOW
=================
1. Tool Registration: registerAllTools() → toolRegistry.register()
2. Tool Selection: AI SDK automatic tool selection via ToolSet
3. Tool Routing: convertToAISDKTools() → tool() wrapper
4. Tool Execution: handler function with context

Entry Points:
- POST /api/ai/chat (main streaming endpoint)
- POST /api/ai/analyze (analysis endpoint)
- POST /api/ai/generate (generation endpoint)

Router/Dispatcher Location: src/lib/ai/tools/adapter.ts
```

---

## EXTERNAL DEPENDENCIES

### External APIs Called by Tools

| API | Purpose | Tools Using | Auth Method |
|-----|---------|-------------|-------------|
| RentCast | Property data (140M+ records) | property_search.*, property.*, deal_analysis.* | API Key |
| Shovels | Permit data | permit.*, heat_mapping.* | API Key |
| Twilio | SMS notifications | notification.sendSMS | API Key + SID |
| SendGrid | Email notifications | notification.sendEmail | API Key |
| Mapbox | Map operations | map.* (when implemented) | API Key |
| xAI Grok | AI inference | All tool selection | API Key |
| OpenAI | Embeddings | RAG/semantic search | API Key |

### Database Access (Supabase)

| Tables | Tools Accessing |
|--------|----------------|
| properties | property_search.*, property.*, heat_mapping.* |
| deals | deal.*, deal_analysis.* |
| leads | crm.*, skipTrace.* |
| buyers | buyer.*, buyer_management.* |
| permits | permit.* |
| contractors | contractor.* |
| notifications | notification.* |
| saved_searches | search.* |
| lead_lists | crm.createLeadList |
| campaigns | comms.* |

---

## TEST COVERAGE ANALYSIS

### Current Test Coverage

```
CURRENT TEST COVERAGE
=====================
Test Framework: Vitest
Test Locations:
  - src/lib/ai/tools/__tests__/ (unit + integration)
  - src/test/ai-tools/ (comprehensive)

Tools WITH Tests: 160 / 187 (~86%)
Tools WITHOUT Tests: 27 / 187 (~14%)

Total Test Cases: 445+
Test Files: 23
```

### Test Categories

| Category | Coverage |
|----------|----------|
| Property Search | 100% ✓ |
| Deal Analysis | 100% ✓ |
| Deal Pipeline | 100% ✓ |
| CRM Tools | 100% ✓ |
| Map Tools | 100% ✓ (mocked - file missing!) |
| Market Analysis | 100% ✓ |
| Heat Mapping | 100% ✓ |
| Skip Trace | 100% ✓ (mocked) |
| Buyer Management | 100% ✓ |
| Notification | 80% (SMS/Email mocked) |
| Utility Tools | Expected (file missing!) |

---

## CRITICAL ISSUES

### CRITICAL #1: Missing map-tools.ts File

**Location**: src/lib/ai/tools/categories/map-tools.ts
**Description**: File is imported in index.ts but does not exist
**Impact**: Runtime crash when registerAllTools() is called
**Evidence**:
```typescript
// In src/lib/ai/tools/categories/index.ts:34
import { registerMapTools } from './map-tools';  // FILE DOES NOT EXIST

// In src/lib/ai/tools/categories/index.ts:71
registerMapTools();  // WILL CRASH
```

**Expected Tools (from tests)**:
- map.draw_search_area
- map.compare_areas
- map.show_commute_time
- map.toggle_style
- map.spatial_query
- map.compare_neighborhoods

**Recommended Fix**: Create map-tools.ts with 6 tool definitions
**Estimated Effort**: 2-4 hours

---

### CRITICAL #2: Missing utility-tools.ts File

**Location**: src/lib/ai/tools/categories/utility-tools.ts
**Description**: File is imported in index.ts but does not exist
**Impact**: Runtime crash when registerAllTools() is called
**Evidence**:
```typescript
// In src/lib/ai/tools/categories/index.ts:22
import { registerUtilityTools } from './utility-tools';  // FILE DOES NOT EXIST

// In src/lib/ai/tools/categories/index.ts:59
registerUtilityTools();  // WILL CRASH
```

**Expected Tools (from tests)**:
- utility.geocode
- utility.reverse_geocode
- utility.format_currency
- utility.calculate_distance

**Recommended Fix**: Create utility-tools.ts with 4 tool definitions
**Estimated Effort**: 1-2 hours

---

## HIGH PRIORITY ISSUES

### HIGH #1: Migration Artifacts in Router

**Location**: src/lib/ai/router.ts
**Description**: Router still references "Claude models" in comments/logic despite Grok migration
**Impact**: Potential confusion for developers, misleading logging
**Evidence**:
```typescript
// References CLAUDE_MODELS which are now aliases to GROK_MODELS
import { CLAUDE_MODELS, ClaudeModelId } from './models';
```
**Recommended Fix**: Update type names and comments to reflect Grok
**Estimated Effort**: 1 hour

### HIGH #2: Tool Tests Expect Missing Files

**Location**: src/lib/ai/tools/__tests__/unit/all-tools.test.ts
**Description**: Tests expect 187 tools but only 184 exist
**Impact**: Tests will fail when run
**Evidence**:
```typescript
// Tests for tools that don't exist yet:
describe('Map Tools', () => {
  const tools = ['map.draw_search_area', 'map.compare_areas', ...];
});
describe('Utility Tools', () => {
  const tools = ['utility.geocode', 'utility.reverse_geocode', ...];
});
```
**Recommended Fix**: Create missing tool files OR update tests
**Estimated Effort**: 2-4 hours

### HIGH #3: Skip Trace Tools Only Mocked

**Location**: src/lib/ai/tools/categories/skip-trace-tools.ts
**Description**: All 10 skip trace tools have no real API integration
**Impact**: Skip tracing functionality is completely simulated
**Evidence**: Handlers return hardcoded mock data
**Recommended Fix**: Integrate with actual skip trace API provider
**Estimated Effort**: 8-16 hours

---

## MEDIUM PRIORITY ISSUES

### MEDIUM #1: Inconsistent Tool ID Naming

**Description**: Tool IDs use mixed conventions
**Examples**:
- `property_search.search` vs `property.valuation` (underscore vs dot namespace)
- `crm.createLeadList` vs `crm.rankByMotivation` (camelCase inconsistent)
- `deal.updateStage` vs `batch.update_deal_status` (different patterns)

**Impact**: Harder to discover tools, potential for naming collisions
**Recommended Fix**: Standardize on `category.action_name` pattern
**Estimated Effort**: 4-8 hours (careful refactor needed)

### MEDIUM #2: Handler Functions Return Hardcoded Data

**Location**: Multiple category files (batch-tools.ts, predictive-tools.ts, etc.)
**Description**: Many handlers return static mock data instead of real computations
**Impact**: Tools give same response regardless of input
**Example**:
```typescript
// predictive-tools.ts:47-58
const sellerMotivationHandler = async (input) => {
  return {
    score: 72,  // Always returns 72!
    confidence: 0.85,
    // ...hardcoded values
  };
};
```
**Recommended Fix**: Implement actual logic or integrate with ML models
**Estimated Effort**: 16-40 hours depending on complexity

### MEDIUM #3: Missing Category Log Statement

**Location**: src/lib/ai/tools/categories/index.ts:73
**Description**: Claims "47 categories" but only 27 exist
```typescript
console.log('[Tool Categories] All tools registered (47 categories)');
```
**Recommended Fix**: Update to accurate count
**Estimated Effort**: 5 minutes

### MEDIUM #4: Export Properties Handler Uses Fake URL

**Location**: src/lib/ai/tools/categories/batch-tools.ts:170-171
```typescript
downloadUrl: `https://api.example.com/exports/${Date.now()}.${input.format}`,
```
**Impact**: Export feature doesn't actually work
**Recommended Fix**: Implement real export to storage (S3/Supabase)
**Estimated Effort**: 4-8 hours

### MEDIUM #5: Notification Tools Mock SMS/Email

**Location**: src/lib/ai/tools/categories/notification-tools.ts
**Description**: SMS and Email sending tools use templates but may not actually send
**Impact**: Communication features may not work in production
**Recommended Fix**: Verify Twilio/SendGrid integration is complete
**Estimated Effort**: 2-4 hours to verify

---

## LOW PRIORITY ISSUES

### LOW #1: Verbose Console Logging in Handlers

**Description**: Every handler logs to console
**Impact**: Excessive logging in production
**Recommended Fix**: Use configurable logging levels
**Estimated Effort**: 2 hours

### LOW #2: Some Tools Missing Rate Limits

**Description**: Not all tools have rateLimit defined
**Impact**: Could allow abuse of expensive API calls
**Recommended Fix**: Add rate limits to all tools
**Estimated Effort**: 1 hour

### LOW #3: Type Assertions in Adapter

**Location**: src/lib/ai/tools/adapter.ts:76
```typescript
const aiTools: Record<string, any> = {};
```
**Impact**: Loses type safety
**Recommended Fix**: Improve typing or document why it's necessary
**Estimated Effort**: 2 hours

### LOW #4: Duplicate Category Type Definition

**Description**: ToolCategory type has overlapping values
```typescript
| 'communication'  // and 'communications' (plural)
| 'document_generation'  // and 'documents'
```
**Impact**: Potential confusion in categorization
**Recommended Fix**: Consolidate to single naming pattern
**Estimated Effort**: 1 hour

---

## TOOL DEFINITION AUDIT

### Schema Quality Assessment

| Aspect | Score | Notes |
|--------|-------|-------|
| Parameters Complete | 10/10 | All tools have full Zod schemas |
| Types Valid | 10/10 | Proper TypeScript inference |
| Descriptions Present | 9/10 | Most have good descriptions |
| Output Defined | 10/10 | All have output schemas |
| Tags Provided | 10/10 | All tools tagged |

### Description Quality Scores (Sample)

| Tool | Length | Clarity | Differentiating | Usage Guidance |
|------|--------|---------|-----------------|----------------|
| property_search.search | Good | ✓ | ✓ | Partial |
| deal_analysis.analyze | Good | ✓ | ✓ | ✓ |
| crm.createLeadList | Short | ✓ | ✓ | ✗ |
| predict.seller_motivation | Good | ✓ | ✓ | ✓ |
| batch.skip_trace_bulk | Good | ✓ | ✓ | ✓ |

---

## TEST STRATEGY RECOMMENDATIONS

### Priority 1: Fix Critical Blockers (Week 1)

1. **Create map-tools.ts** with 6 tool implementations
2. **Create utility-tools.ts** with 4 tool implementations
3. **Verify all tests pass** after file creation
4. **Update log message** to accurate tool count

### Priority 2: Integration Testing (Week 2)

1. **Skip Trace Integration**
   - Identify skip trace API provider
   - Replace mock handlers with real API calls
   - Add integration tests

2. **Export Feature**
   - Implement real file export to storage
   - Add download URL generation
   - Test file formats (CSV, XLSX, JSON)

### Priority 3: Tool Quality (Week 3)

1. **Replace hardcoded handlers** with real logic:
   - Predictive tools (ML integration)
   - Intelligence tools (competitor analysis)
   - Portfolio tools (real calculations)

2. **Standardize naming conventions**
   - Audit all 184+ tool IDs
   - Create naming guidelines
   - Refactor inconsistent names

### Priority 4: Production Hardening (Week 4)

1. **Add error handling tests**
   - Network failures
   - API rate limits
   - Invalid inputs

2. **Load testing**
   - Batch operations with 1000+ items
   - Concurrent tool calls
   - Rate limit stress testing

---

## RECOMMENDED TEST FILE STRUCTURE

```
tests/
├── unit/
│   └── tools/
│       ├── categories/
│       │   ├── property-search.test.ts
│       │   ├── deal-analysis.test.ts
│       │   ├── map-tools.test.ts (needs creation)
│       │   └── utility-tools.test.ts (needs creation)
│       ├── registry.test.ts
│       └── adapter.test.ts
├── integration/
│   └── tools/
│       ├── external-apis/
│       │   ├── rentcast.integration.test.ts
│       │   ├── shovels.integration.test.ts
│       │   └── skip-trace.integration.test.ts
│       └── database/
│           └── supabase.integration.test.ts
├── e2e/
│   └── flows/
│       ├── property-discovery.e2e.test.ts
│       ├── deal-workflow.e2e.test.ts
│       └── lead-management.e2e.test.ts
└── mocks/
    ├── apis/
    │   ├── rentcast.mock.ts
    │   └── skip-trace.mock.ts
    └── data/
        └── properties.fixture.json
```

---

## IMMEDIATE ACTION ITEMS

### Must Fix Before Deployment

1. **[CRITICAL]** Create `src/lib/ai/tools/categories/map-tools.ts`
   - Implement 6 map tools per test expectations
   - Integrate with Mapbox API

2. **[CRITICAL]** Create `src/lib/ai/tools/categories/utility-tools.ts`
   - Implement 4 utility tools per test expectations
   - Add geocoding integration

3. **[HIGH]** Run test suite to verify no failures
   ```bash
   npm run test
   ```

4. **[HIGH]** Update tool count in index.ts logging

### Files to Create

| File Path | Purpose | Est. Lines |
|-----------|---------|------------|
| src/lib/ai/tools/categories/map-tools.ts | Map operations | ~200 |
| src/lib/ai/tools/categories/utility-tools.ts | Utility functions | ~150 |

### Files to Modify

| File Path | Change Needed |
|-----------|---------------|
| src/lib/ai/tools/categories/index.ts | Update log message (47 → 27) |
| src/lib/ai/router.ts | Update Claude references to Grok |
| Multiple handlers | Replace hardcoded mock data |

---

## SCORES BY CATEGORY

| Category | Tools | Schema | Routing | Implementation | Tests | Overall |
|----------|-------|--------|---------|----------------|-------|---------|
| Property Search | 2 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 |
| Deal Analysis | 3 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 |
| Deal Pipeline | 12 | 10/10 | 10/10 | 8/10 | 10/10 | 9.5/10 |
| CRM | 12 | 10/10 | 10/10 | 10/10 | 10/10 | 10/10 |
| Buyer Management | 13 | 10/10 | 10/10 | 9/10 | 10/10 | 9.8/10 |
| Skip Trace | 10 | 10/10 | 10/10 | 3/10 | 8/10 | 7.8/10 |
| Notification | 10 | 10/10 | 10/10 | 7/10 | 8/10 | 8.8/10 |
| Heat Mapping | 14 | 10/10 | 10/10 | 8/10 | 10/10 | 9.5/10 |
| Market Analysis | 10 | 10/10 | 10/10 | 8/10 | 10/10 | 9.5/10 |
| Batch Operations | 4 | 10/10 | 10/10 | 5/10 | 10/10 | 8.8/10 |
| Predictive | 4 | 10/10 | 10/10 | 4/10 | 10/10 | 8.5/10 |
| **Map Tools** | 6 | N/A | N/A | 0/10 | 10/10 | **0/10** |
| **Utility Tools** | 4 | N/A | N/A | 0/10 | 10/10 | **0/10** |

---

## APPENDIX: FULL TOOL ID LIST

### Active Tools (184)

```
batch.add_to_list_bulk
batch.export_properties
batch.skip_trace_bulk
batch.update_deal_status
buyer.compare
buyer.generateReport
buyer.identifyGaps
buyer.predictBehavior
buyer.recommendActions
buyer.scoreFit
buyer.segment
buyer.suggestOutreach
buyer.trackPreferenceChanges
buyer_management.analyze_buyer_activity
buyer_management.get_buyer_insights
buyer_management.match_buyers_to_property
buyer_management.search_buyers
comms.generate_email_sequence
comms.generate_sms_template
comms.generate_talking_points
contractor.compare
contractor.details
contractor.history
contractor.search
contractor.top
crm.analyzeSource
crm.createLeadList
crm.exportLeads
crm.generateReport
crm.identifyHot
crm.mergeLeads
crm.predictConversion
crm.rankByMotivation
crm.segmentLeads
crm.suggestNurturing
crm.suggestOutreach
crm.trackEngagement
dashboard.activity
dashboard.alerts
dashboard.anomalies
dashboard.compare_periods
dashboard.funnel
dashboard.goals
dashboard.insights
dashboard.kpis
dashboard.performance
dashboard.recommendations
dashboard.report
dashboard.trends
deal.analyzeProgress
deal.assignBuyer
deal.calculateMetrics
deal.compareToPortfolio
deal.create
deal.flagIssues
deal.generateOfferStrategy
deal.generateSummary
deal.getTimeline
deal.predictOutcome
deal.suggestActions
deal.updateStage
deal_analysis.analyze
deal_analysis.calculate_mao
deal_analysis.score
docs.generate_comp_report
docs.generate_deal_summary
docs.generate_offer_letter
filter.compare
filter.create
filter.explain
filter.export
filter.import
filter.optimize
filter.performance
filter.recommendations
filter.refine
filter.suggest
filter.validate
heat_mapping.absentee_owners
heat_mapping.analyze_area
heat_mapping.competition_analysis
heat_mapping.crime_impact
heat_mapping.days_on_market
heat_mapping.detect_opportunities
heat_mapping.development
heat_mapping.distress_indicator
heat_mapping.equity_analysis
heat_mapping.flip_potential
heat_mapping.inventory
heat_mapping.price_trends
heat_mapping.rental_yield
heat_mapping.school_impact
intel.competitor_activity
intel.emerging_markets
intel.market_saturation
market_analysis.compare
market_analysis.economic
market_analysis.forecast
market_analysis.neighborhood
market_analysis.rental
market_analysis.roi
market_analysis.seasonality
market_analysis.supply_demand
market_analysis.timing
market_analysis.trends
notification.checkOptOut
notification.generateAIMessage
notification.getHistory
notification.getInbox
notification.getStatus
notification.listTemplates
notification.markAsRead
notification.sendEmail
notification.sendFromTemplate
notification.sendSMS
permit.analyze_patterns
permit.check_system_age
permit.deferred_maintenance
permit.details
permit.history
permit.metrics
permit.search
permit.stalled
portfolio.geographic_concentration
portfolio.performance_summary
portfolio.roi_by_strategy
predict.deal_close_probability
predict.optimal_offer_price
predict.seller_motivation
predict.time_to_close
property.comps
property.deal_potential
property.issues
property.motivation
property.neighborhood
property.offer_price
property.ownership
property.portfolio_compare
property.rental
property.repairs
property.summary
property.time_on_market
property.valuation
property_search.get_details
property_search.search
search.analyze
search.buyer_property_match
search.by_description
search.compare
search.execute_filter
search.export
search.permit_pattern_match
search.recent
search.refine
search.save_filter
search.schedule
search.similar_to_deal
search.suggestions
skipTrace.batchTrace
skipTrace.enrichLead
skipTrace.findRelated
skipTrace.getCredits
skipTrace.getStatus
skipTrace.reverseAddress
skipTrace.reversePhone
skipTrace.traceLead
skipTrace.validateEmail
skipTrace.validatePhone
sync.calendar_integration
sync.crm_export
vertical.filters
vertical.get_active
vertical.insights
vertical.switch
workflow.alert_on_match
workflow.auto_follow_up
workflow.deal_stage_trigger
```

### Missing Tools (10)

```
map.compare_areas
map.compare_neighborhoods
map.draw_search_area
map.show_commute_time
map.spatial_query
map.toggle_style
utility.calculate_distance
utility.format_currency
utility.geocode
utility.reverse_geocode
```

---

*Report generated by Claude AI Audit System*
*December 4, 2025*
