# Phase 7: Buyer Intelligence

---

**Phase Number:** 7 of 12
**Duration:** 2 Weeks
**Dependencies:** [Phase 2: Database Schema](./PHASE_02_Database_Schema_2025-12-02.md), [Phase 4: Property Search](./PHASE_04_Property_Search_2025-12-02.md), [Phase 5: AI/LLM Integration](./PHASE_05_AI_LLM_Integration_2025-12-02.md), [Phase 6: Knowledge Base & RAG](./PHASE_06_Knowledge_Base_RAG_2025-12-02.md)
**Status:** Not Started
**Start Date:** TBD
**Target Completion:** TBD
**AI Tools in Phase:** 46

---

## Overview

Build the buyer management system including profiles, preferences, qualification tracking, transaction history analysis, and intelligent deal-to-buyer matching algorithms. This phase creates the infrastructure for connecting deals with the right buyers.

**Additionally, this phase implements 46 AI tools** from the AI Interaction Map specification:
- **Search Tools** (10) - Natural language property search capabilities
- **Property Detail Tools** (13) - AI-powered property analysis and valuation
- **Filter System Tools** (11) - Intelligent filter recommendations and optimization
- **Buyer Database Tools** (12) - AI-enhanced buyer matching and analysis

---

## Objectives

1. Create buyer profile management system
2. Build preference and criteria tracking
3. Implement buyer qualification workflow
4. Develop transaction history import and analysis
5. Create buyer scoring and tiering algorithm
6. Build deal-to-buyer matching engine
7. Implement buyer communication preferences
8. **Implement 10 Search AI Tools**
9. **Implement 13 Property Detail AI Tools**
10. **Implement 11 Filter System AI Tools**
11. **Implement 12 Buyer Database AI Tools**

---

## Buyer Types Reference

| Type | Description | Typical Criteria |
|------|-------------|------------------|
| Flipper | Rehab and resell | Lower price, high discount, any condition |
| Buy & Hold | Long-term rental | Cash flow positive, decent areas |
| Turnkey | Minimal work needed | Market value, A/B areas |
| BRRRR | Buy, Rehab, Rent, Refinance, Repeat | Below market, high ARV potential |
| Wholesale | Re-wholesale to end buyer | Deep discount, any condition |
| Land | Vacant land | Location, entitlements |

---

## Task Hierarchy

### 1. Buyer Profile Management
- [ ] **1.1 Create Buyer Form**
  - [ ] Create components/buyers/BuyerForm.tsx
  - [ ] Input fields: name, company, email, phone
  - [ ] Buyer type selection
  - [ ] Status selection (active, inactive)
  - [ ] Notes field
  - [ ] Form validation with Zod

- [ ] **1.2 Buyer List View**
  - [ ] Create app/buyers/page.tsx
  - [ ] Display buyer cards/table
  - [ ] Filter by status, type, tier
  - [ ] Search by name/company
  - [ ] Sort options

- [ ] **1.3 Buyer Detail View**
  - [ ] Create app/buyers/[id]/page.tsx
  - [ ] Display full profile
  - [ ] Show preferences summary
  - [ ] Show transaction history
  - [ ] Show matched deals
  - [ ] Activity timeline

- [ ] **1.4 Buyer CRUD Operations**
  - [ ] Create buyer API routes
  - [ ] POST /api/buyers (create)
  - [ ] GET /api/buyers (list)
  - [ ] GET /api/buyers/[id] (detail)
  - [ ] PATCH /api/buyers/[id] (update)
  - [ ] DELETE /api/buyers/[id] (soft delete)

---

### 2. Buyer Preferences
- [ ] **2.1 Preference Form**
  - [ ] Create components/buyers/PreferencesForm.tsx
  - [ ] Property types (multi-select)
  - [ ] Price range (min/max sliders)
  - [ ] Bedroom/bathroom counts
  - [ ] Geographic markets (zip codes, cities)
  - [ ] Condition tolerance slider
  - [ ] Max rehab budget
  - [ ] Preferred ROI percentage

- [ ] **2.2 Preference Storage**
  - [ ] Store in buyer_preferences table
  - [ ] Support multiple preference sets per buyer
  - [ ] Priority ranking for preferences
  - [ ] Last updated tracking

- [ ] **2.3 Preference API**
  - [ ] POST /api/buyers/[id]/preferences
  - [ ] GET /api/buyers/[id]/preferences
  - [ ] PATCH /api/buyers/[id]/preferences
  - [ ] Validate preference combinations

---

### 3. Buyer Qualification
- [ ] **3.1 Qualification Workflow**
  - [ ] Create lib/buyers/qualification.ts
  - [ ] Define qualification stages:
    - [ ] New (unverified)
    - [ ] Contacted (initial conversation)
    - [ ] POF Received (proof of funds)
    - [ ] Verified (ready to transact)
    - [ ] Qualified (completed transaction)
  - [ ] Track stage transitions

- [ ] **3.2 Qualification UI**
  - [ ] Create QualificationTracker component
  - [ ] Display current stage
  - [ ] Show required actions
  - [ ] Log stage changes

- [ ] **3.3 Proof of Funds Management**
  - [ ] Upload POF document
  - [ ] Store securely (Supabase Storage)
  - [ ] Track expiration/validity
  - [ ] Request POF updates

- [ ] **3.4 Qualification Questions**
  - [ ] Store buyer responses
  - [ ] How many properties in last 12 months?
  - [ ] Cash or financing?
  - [ ] Average purchase timeline?
  - [ ] Typical deal size?
  - [ ] Display in buyer profile

---

### 4. Transaction History
- [ ] **4.1 Transaction Import**
  - [ ] Create lib/buyers/transaction-import.ts
  - [ ] Manual entry form
  - [ ] CSV import support
  - [ ] RentCast transaction lookup (if available)

- [ ] **4.2 Transaction Storage**
  - [ ] Store in buyer_transactions table
  - [ ] Property address, price, date
  - [ ] Transaction type (purchase, sale)
  - [ ] Calculate metrics from transactions

- [ ] **4.3 Transaction Analysis**
  - [ ] Calculate average purchase price
  - [ ] Identify property type preferences
  - [ ] Analyze geographic patterns
  - [ ] Calculate purchase frequency
  - [ ] Determine seasonal patterns

- [ ] **4.4 Transaction Display**
  - [ ] Create TransactionHistory component
  - [ ] Show transaction timeline
  - [ ] Display aggregate metrics
  - [ ] Chart purchase patterns

---

### 5. Buyer Scoring & Tiering
- [ ] **5.1 Scoring Algorithm**
  - [ ] Create lib/buyers/scoring.ts
  - [ ] Define scoring factors:
    - [ ] Transaction volume (30%)
    - [ ] Qualification status (20%)
    - [ ] Response time (15%)
    - [ ] Close rate (20%)
    - [ ] Communication quality (15%)
  - [ ] Calculate composite score (0-100)

- [ ] **5.2 Tier Assignment**
  - [ ] A-Tier: Score 80+ (priority buyers)
  - [ ] B-Tier: Score 50-79 (active buyers)
  - [ ] C-Tier: Score below 50 (developing)
  - [ ] Auto-assign tier based on score
  - [ ] Allow manual override

- [ ] **5.3 Score Updates**
  - [ ] Recalculate on new transactions
  - [ ] Recalculate on qualification changes
  - [ ] Track score history
  - [ ] Alert on tier changes

- [ ] **5.4 Scoring Display**
  - [ ] Show score in buyer profile
  - [ ] Display tier badge
  - [ ] Show score breakdown
  - [ ] Compare to average

---

### 6. Deal-to-Buyer Matching
- [ ] **6.1 Matching Algorithm**
  - [ ] Create lib/buyers/matcher.ts
  - [ ] Match criteria:
    - [ ] Geographic match (zip code, radius)
    - [ ] Property type match
    - [ ] Price range match
    - [ ] Bedroom/bathroom match
    - [ ] Condition tolerance match
    - [ ] ARV range match
  - [ ] Calculate match score (0-100)

- [ ] **6.2 Match Ranking**
  - [ ] Weight by buyer tier
  - [ ] Weight by recent activity
  - [ ] Weight by past purchases
  - [ ] Generate ranked list

- [ ] **6.3 Match API**
  - [ ] POST /api/matching/find-buyers
  - [ ] Accept property details
  - [ ] Return ranked buyer list
  - [ ] Include match scores and reasons

- [ ] **6.4 Match UI**
  - [ ] Create MatchResults component
  - [ ] Display matched buyers
  - [ ] Show match scores
  - [ ] Quick actions (send deal, call)
  - [ ] One-click deal blast

---

### 7. Buyer Communication
- [ ] **7.1 Communication Preferences**
  - [ ] Preferred contact method
  - [ ] Best times to contact
  - [ ] Email vs SMS preference
  - [ ] Deal alert frequency

- [ ] **7.2 Communication History**
  - [ ] Display messages with buyer
  - [ ] Link from buyer profile
  - [ ] Show all channels
  - [ ] Track response times

- [ ] **7.3 Quick Actions**
  - [ ] One-click call
  - [ ] One-click SMS
  - [ ] One-click email
  - [ ] Schedule follow-up

---

### 8. Buyer Analytics
- [ ] **8.1 Buyer Dashboard**
  - [ ] Create components/buyers/BuyerDashboard.tsx
  - [ ] Total buyers by tier
  - [ ] Qualification pipeline
  - [ ] Recent activity

- [ ] **8.2 Buyer Metrics**
  - [ ] Average response time
  - [ ] Deal acceptance rate
  - [ ] Average transaction value
  - [ ] Total closed volume

- [ ] **8.3 Reporting**
  - [ ] Export buyer list
  - [ ] Export transaction history
  - [ ] Buyer activity report

---

### 9. Search AI Tools (10 Tools)
- [ ] **9.1 searchPropertiesByDescription**
  - [ ] Implement in lib/ai/tools/search-tools.ts
  - [ ] Accept natural language property description
  - [ ] Convert to filter criteria using AI
  - [ ] Execute search and return results
  - [ ] Register in tool registry

- [ ] **9.2 executeFilter**
  - [ ] Accept filter name and parameters
  - [ ] Validate filter exists
  - [ ] Execute filter query
  - [ ] Return filtered property list

- [ ] **9.3 saveSearchAsFilter**
  - [ ] Accept current search criteria
  - [ ] Generate filter name suggestion
  - [ ] Save to user's saved filters
  - [ ] Return confirmation

- [ ] **9.4 getRecentSearches**
  - [ ] Retrieve user's search history
  - [ ] Include search criteria and result counts
  - [ ] Support pagination

- [ ] **9.5 refineSearch**
  - [ ] Accept current results and refinement request
  - [ ] Suggest additional filters
  - [ ] Apply refinements
  - [ ] Return updated results

- [ ] **9.6 compareSearchResults**
  - [ ] Accept two search result sets
  - [ ] Identify overlapping properties
  - [ ] Highlight differences
  - [ ] Return comparison summary

- [ ] **9.7 exportSearchResults**
  - [ ] Accept search results and format
  - [ ] Generate CSV/PDF export
  - [ ] Return download link

- [ ] **9.8 scheduleSearch**
  - [ ] Accept search criteria and schedule
  - [ ] Create scheduled search job
  - [ ] Configure notification preferences

- [ ] **9.9 getSearchSuggestions**
  - [ ] Analyze user's search patterns
  - [ ] Suggest new search criteria
  - [ ] Based on successful deals

- [ ] **9.10 analyzeSearchPerformance**
  - [ ] Calculate search-to-deal conversion
  - [ ] Identify most productive searches
  - [ ] Recommend search optimizations

---

### 10. Property Detail AI Tools (13 Tools)
- [ ] **10.1 analyzePropertyValue**
  - [ ] Implement in lib/ai/tools/property-tools.ts
  - [ ] Accept property ID
  - [ ] Calculate ARV using comps
  - [ ] Estimate repair costs
  - [ ] Return valuation breakdown

- [ ] **10.2 getComparables**
  - [ ] Find similar sold properties
  - [ ] Filter by distance, size, age
  - [ ] Calculate adjusted values
  - [ ] Return comp list with adjustments

- [ ] **10.3 calculateMotivationScore**
  - [ ] Analyze ownership indicators
  - [ ] Check for distress signals
  - [ ] Calculate 0-100 motivation score
  - [ ] Return score with reasoning

- [ ] **10.4 generatePropertySummary**
  - [ ] Create AI-written property description
  - [ ] Highlight investment potential
  - [ ] Include key metrics
  - [ ] Format for different audiences

- [ ] **10.5 analyzeDealPotential**
  - [ ] Calculate potential profit margins
  - [ ] Assess risk factors
  - [ ] Compare to user's typical deals
  - [ ] Return deal score

- [ ] **10.6 getOwnershipHistory**
  - [ ] Retrieve ownership timeline
  - [ ] Calculate ownership duration
  - [ ] Identify ownership patterns

- [ ] **10.7 estimateRepairCosts**
  - [ ] Analyze property condition
  - [ ] Generate repair estimate
  - [ ] Break down by category
  - [ ] Provide range (low/mid/high)

- [ ] **10.8 predictTimeOnMarket**
  - [ ] Analyze local market velocity
  - [ ] Consider property characteristics
  - [ ] Predict days to sell

- [ ] **10.9 getNeighborhoodInsights**
  - [ ] Analyze surrounding area
  - [ ] Crime, schools, amenities
  - [ ] Market trends
  - [ ] Investment outlook

- [ ] **10.10 compareToPortfolio**
  - [ ] Compare property to user's past deals
  - [ ] Identify similarities/differences
  - [ ] Predict success likelihood

- [ ] **10.11 generateOfferPrice**
  - [ ] Calculate optimal offer price
  - [ ] Consider ARV, repairs, profit margin
  - [ ] Return offer with justification

- [ ] **10.12 assessRentalPotential**
  - [ ] Estimate rental income
  - [ ] Calculate cap rate
  - [ ] Compare to market rents

- [ ] **10.13 flagPropertyIssues**
  - [ ] Identify potential red flags
  - [ ] Title issues, liens, violations
  - [ ] Environmental concerns
  - [ ] Return issue list with severity

---

### 11. Filter System AI Tools (11 Tools)
- [ ] **11.1 suggestFilters**
  - [ ] Implement in lib/ai/tools/filter-tools.ts
  - [ ] Analyze user's goals
  - [ ] Recommend filter combinations
  - [ ] Explain reasoning

- [ ] **11.2 explainFilter**
  - [ ] Accept filter name
  - [ ] Describe what filter does
  - [ ] Provide usage examples
  - [ ] Show typical results

- [ ] **11.3 optimizeFilterCombination**
  - [ ] Analyze current filter set
  - [ ] Identify redundancies
  - [ ] Suggest improvements
  - [ ] Predict result count

- [ ] **11.4 createCustomFilter**
  - [ ] Accept natural language criteria
  - [ ] Generate filter definition
  - [ ] Validate filter logic
  - [ ] Save to user's filters

- [ ] **11.5 compareFilters**
  - [ ] Accept two filter sets
  - [ ] Show overlap and differences
  - [ ] Recommend which to use

- [ ] **11.6 getFilterPerformance**
  - [ ] Track filter usage statistics
  - [ ] Calculate lead-to-deal conversion
  - [ ] Identify best-performing filters

- [ ] **11.7 suggestFilterRefinements**
  - [ ] Analyze current results
  - [ ] Suggest tightening/loosening
  - [ ] Predict impact on results

- [ ] **11.8 exportFilterDefinition**
  - [ ] Export filter as shareable format
  - [ ] Include all criteria
  - [ ] Support import by others

- [ ] **11.9 importFilter**
  - [ ] Accept filter definition
  - [ ] Validate and import
  - [ ] Add to user's filters

- [ ] **11.10 getFilterRecommendations**
  - [ ] Based on user's success patterns
  - [ ] Suggest new filter combinations
  - [ ] Explain expected outcomes

- [ ] **11.11 validateFilterCriteria**
  - [ ] Check filter for logical errors
  - [ ] Identify impossible combinations
  - [ ] Suggest corrections

---

### 12. Buyer Database AI Tools (12 Tools)
- [ ] **12.1 matchBuyersToProperty**
  - [ ] Implement in lib/ai/tools/buyer-tools.ts
  - [ ] Accept property details
  - [ ] Find matching buyers
  - [ ] Rank by match score
  - [ ] Return buyer list with scores

- [ ] **12.2 analyzeBuyerActivity**
  - [ ] Track buyer engagement
  - [ ] Identify active vs dormant
  - [ ] Predict purchase likelihood

- [ ] **12.3 suggestBuyerOutreach**
  - [ ] Identify buyers to contact
  - [ ] Prioritize by opportunity
  - [ ] Generate outreach suggestions

- [ ] **12.4 getBuyerInsights**
  - [ ] Analyze buyer's purchase history
  - [ ] Identify preferences
  - [ ] Predict future needs

- [ ] **12.5 compareBuyers**
  - [ ] Accept buyer IDs
  - [ ] Compare preferences and history
  - [ ] Recommend for specific deal

- [ ] **12.6 predictBuyerBehavior**
  - [ ] Analyze past patterns
  - [ ] Predict response to deal
  - [ ] Estimate close probability

- [ ] **12.7 segmentBuyers**
  - [ ] Group buyers by criteria
  - [ ] Create buyer segments
  - [ ] Enable targeted marketing

- [ ] **12.8 identifyBuyerGaps**
  - [ ] Analyze buyer network coverage
  - [ ] Identify missing buyer types
  - [ ] Suggest recruitment focus

- [ ] **12.9 generateBuyerReport**
  - [ ] Create buyer summary report
  - [ ] Include activity metrics
  - [ ] Export as PDF

- [ ] **12.10 scoreBuyerFit**
  - [ ] Accept buyer and property
  - [ ] Calculate fit score
  - [ ] Explain match factors

- [ ] **12.11 trackBuyerPreferenceChanges**
  - [ ] Monitor preference updates
  - [ ] Alert on significant changes
  - [ ] Suggest re-matching

- [ ] **12.12 recommendBuyerActions**
  - [ ] Analyze buyer status
  - [ ] Suggest next actions
  - [ ] Prioritize by impact

---

## Success Criteria

- [ ] CRUD operations for buyers functional
- [ ] Preferences stored and editable
- [ ] Qualification workflow operational
- [ ] Transaction history trackable
- [ ] Scoring algorithm calculating correctly
- [ ] Matching algorithm returning relevant results
- [ ] UI responsive and intuitive
- [ ] **All 10 Search AI Tools implemented and tested**
- [ ] **All 13 Property Detail AI Tools implemented and tested**
- [ ] **All 11 Filter System AI Tools implemented and tested**
- [ ] **All 12 Buyer Database AI Tools implemented and tested**
- [ ] **AI tools registered in tool registry**
- [ ] **AI tools accessible via chat interface**

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Matching algorithm not accurate | Medium | High | Iterative tuning, user feedback |
| Transaction data incomplete | High | Medium | Manual entry fallback |
| Scoring too subjective | Medium | Low | Clear criteria, transparency |
| AI tool response latency | Medium | Medium | Caching, async execution |
| Tool parameter validation failures | Medium | Low | Comprehensive Zod schemas |

---

## Related Phases

- **Previous Phase:** [Phase 6: Knowledge Base & RAG](./PHASE_06_Knowledge_Base_RAG_2025-12-02.md)
- **Next Phase:** [Phase 8: Deal Pipeline](./PHASE_08_Deal_Pipeline_2025-12-02.md)
- **Dependent Phases:** Phase 8 (deal assignment, 24 more AI tools), Phase 9 (buyer outreach, 20 more AI tools)
- **AI Framework:** Uses Tool Execution Framework from Phase 5

---

## AI Tool Summary

| Category | Tool Count | Key Capabilities |
|----------|------------|------------------|
| Search Tools | 10 | Natural language search, filter execution, search analytics |
| Property Detail Tools | 13 | Valuation, comps, motivation scoring, deal analysis |
| Filter System Tools | 11 | Filter suggestions, optimization, performance tracking |
| Buyer Database Tools | 12 | Buyer matching, activity analysis, segmentation |
| **Total** | **46** | |

---

## Phase Completion Summary

> **Template - Complete after phase is finished**

### Completed Successfully
- [ ] Item 1

### Deferred or Blocked
- [ ] Item (Reason: )

### Lessons Learned
-

### Recommendations for Next Phase
-

---

**Phase Document Version:** 2.0
**Last Updated:** 2025-12-02
**Major Updates:** Added 46 AI Tools (Search, Property Detail, Filter System, Buyer Database) from AI Interaction Map specification

