# Phase 4: Property Search & Filters

---

**Phase Number:** 4 of 12  
**Duration:** 1 Week  
**Dependencies:** [Phase 2: Database Schema](./PHASE_02_Database_Schema_2025-12-02.md), [Phase 3: RentCast Integration](./PHASE_03_RentCast_Integration_2025-12-02.md)  
**Status:** Not Started  
**Start Date:** TBD  
**Target Completion:** TBD  

---

## Overview

Implement all 21 property filters (6 Standard, 5 Enhanced, 10 Contrarian) with a comprehensive search interface. This phase creates the core property discovery functionality that differentiates the platform.

---

## Objectives

1. Implement all 6 Standard filters
2. Implement all 5 Enhanced filters
3. Implement all 10 Contrarian filters
4. Build search interface with filter controls
5. Create filter combination and stacking logic
6. Implement saved searches functionality
7. Optimize search performance

---

## Filter Categories Reference

### Standard Filters (6)
| Filter | Description | Key Criteria |
|--------|-------------|--------------|
| Absentee Owner | Owner doesn't live at property | Mailing ≠ Property address |
| High Equity | Significant equity position | Equity > 40% |
| Free & Clear | No mortgage | LTV = 0% |
| Tired Landlord | Long-term rental owner | Owned 10+ years, rental |
| Out-of-State Owner | Owner in different state | Owner state ≠ Property state |
| Failed Listing | Expired or withdrawn | Status = expired/withdrawn |

### Enhanced Filters (5)
| Filter | Description | Key Criteria |
|--------|-------------|--------------|
| New Absentee | Recently became absentee | Absentee < 2 years |
| Distant Owner | Far from property | > 100 miles away |
| Multi-Property | Owns multiple properties | 2+ properties |
| Equity Sweet Spot | Ideal equity range | 40-70% equity |
| Accidental Landlord | Unintended landlord | Previous primary residence |

### Contrarian Filters (10)
| Filter | Description | Key Criteria |
|--------|-------------|--------------|
| Almost Sold | Deal fell through | Under contract then cancelled |
| Shrinking Landlord | Selling portfolio | Recent sales of rentals |
| Underwater Landlord | Negative cash flow | Rent < PITI |
| Tax Squeeze | Property taxes rising | Tax increase > 20% |
| Quiet Equity Builder | Long-term appreciation | 15+ years, no refinance |
| Negative Momentum | Declining value | Value down YoY |
| FSBO Fatigue | Failed FSBO attempt | FSBO > 90 days |
| Life Stage Transition | Life event indicators | Age, divorce, probate |
| Orphan Property | Neglected investment | No activity 5+ years |
| Competitor Exit | Other investors leaving | Investor sales in area |

---

## Task Hierarchy

### 1. Filter Implementation - Standard
- [ ] **1.1 Absentee Owner Filter**
  - [ ] Create lib/filters/absentee-owner.ts
  - [ ] Compare mailing address to property address
  - [ ] Handle address normalization
  - [ ] Account for PO boxes and variations
  - [ ] Add filter to search query builder
  - [ ] Test with sample data

- [ ] **1.2 High Equity Filter**
  - [ ] Create lib/filters/high-equity.ts
  - [ ] Calculate equity from valuation data
  - [ ] Support configurable threshold (default 40%)
  - [ ] Handle missing valuation gracefully
  - [ ] Add to search query builder

- [ ] **1.3 Free & Clear Filter**
  - [ ] Create lib/filters/free-clear.ts
  - [ ] Check for zero mortgage balance
  - [ ] Verify with multiple data points
  - [ ] Add to search query builder

- [ ] **1.4 Tired Landlord Filter**
  - [ ] Create lib/filters/tired-landlord.ts
  - [ ] Calculate ownership duration
  - [ ] Identify rental properties
  - [ ] Configurable duration threshold (default 10 years)
  - [ ] Add to search query builder

- [ ] **1.5 Out-of-State Owner Filter**
  - [ ] Create lib/filters/out-of-state.ts
  - [ ] Compare owner state to property state
  - [ ] Handle partial address data
  - [ ] Add to search query builder

- [ ] **1.6 Failed Listing Filter**
  - [ ] Create lib/filters/failed-listing.ts
  - [ ] Check listing status (expired, withdrawn)
  - [ ] Include time window (last 6-12 months)
  - [ ] Add to search query builder

---

### 2. Filter Implementation - Enhanced
- [ ] **2.1 New Absentee Filter**
  - [ ] Create lib/filters/new-absentee.ts
  - [ ] Track when absentee status began
  - [ ] Filter for recent changes (< 2 years)
  - [ ] Add to search query builder

- [ ] **2.2 Distant Owner Filter**
  - [ ] Create lib/filters/distant-owner.ts
  - [ ] Calculate distance between addresses
  - [ ] Use geocoding for accuracy
  - [ ] Configurable distance threshold (default 100 miles)
  - [ ] Add to search query builder

- [ ] **2.3 Multi-Property Owner Filter**
  - [ ] Create lib/filters/multi-property.ts
  - [ ] Query for owners with 2+ properties
  - [ ] Link properties by owner name/entity
  - [ ] Add to search query builder

- [ ] **2.4 Equity Sweet Spot Filter**
  - [ ] Create lib/filters/equity-sweet-spot.ts
  - [ ] Filter for 40-70% equity range
  - [ ] Configurable range parameters
  - [ ] Add to search query builder

- [ ] **2.5 Accidental Landlord Filter**
  - [ ] Create lib/filters/accidental-landlord.ts
  - [ ] Identify previous primary residence
  - [ ] Check for homestead exemption changes
  - [ ] Add to search query builder

---

### 3. Filter Implementation - Contrarian
- [ ] **3.1 Almost Sold Filter**
  - [ ] Create lib/filters/almost-sold.ts
  - [ ] Track pending → cancelled transitions
  - [ ] Include time window
  - [ ] Add to search query builder

- [ ] **3.2 Shrinking Landlord Filter**
  - [ ] Create lib/filters/shrinking-landlord.ts
  - [ ] Track owner's recent property sales
  - [ ] Identify portfolio reduction pattern
  - [ ] Add to search query builder

- [ ] **3.3 Underwater Landlord Filter**
  - [ ] Create lib/filters/underwater-landlord.ts
  - [ ] Compare rent estimate to PITI
  - [ ] Calculate cash flow (negative = underwater)
  - [ ] Add to search query builder

- [ ] **3.4 Tax Squeeze Filter**
  - [ ] Create lib/filters/tax-squeeze.ts
  - [ ] Compare year-over-year tax changes
  - [ ] Flag significant increases (> 20%)
  - [ ] Add to search query builder

- [ ] **3.5 Quiet Equity Builder Filter**
  - [ ] Create lib/filters/quiet-equity.ts
  - [ ] Long ownership (15+ years)
  - [ ] No recent refinance activity
  - [ ] Add to search query builder

- [ ] **3.6 Negative Momentum Filter**
  - [ ] Create lib/filters/negative-momentum.ts
  - [ ] Compare current vs prior year value
  - [ ] Identify declining values
  - [ ] Add to search query builder

- [ ] **3.7 FSBO Fatigue Filter**
  - [ ] Create lib/filters/fsbo-fatigue.ts
  - [ ] Track FSBO listing duration
  - [ ] Filter for extended attempts (> 90 days)
  - [ ] Add to search query builder

- [ ] **3.8 Life Stage Transition Filter**
  - [ ] Create lib/filters/life-stage.ts
  - [ ] Integrate probate indicators
  - [ ] Integrate divorce indicators
  - [ ] Age-based indicators (if available)
  - [ ] Add to search query builder

- [ ] **3.9 Orphan Property Filter**
  - [ ] Create lib/filters/orphan-property.ts
  - [ ] No transaction activity 5+ years
  - [ ] No refinance, no listing
  - [ ] Add to search query builder

- [ ] **3.10 Competitor Exit Filter**
  - [ ] Create lib/filters/competitor-exit.ts
  - [ ] Track investor sales in area
  - [ ] Identify market exit patterns
  - [ ] Add to search query builder

---

### 4. Search Query Builder
- [ ] **4.1 Create Query Builder Service**
  - [ ] Create lib/search/query-builder.ts
  - [ ] Accept multiple filter selections
  - [ ] Combine filters with AND logic
  - [ ] Support OR logic for filter groups
  - [ ] Generate optimized database queries

- [ ] **4.2 Filter Combination Logic**
  - [ ] Define valid filter combinations
  - [ ] Prevent conflicting filters
  - [ ] Suggest complementary filters
  - [ ] Calculate result estimates

- [ ] **4.3 Query Optimization**
  - [ ] Use database indexes effectively
  - [ ] Limit initial result sets
  - [ ] Implement query caching
  - [ ] Monitor query performance

---

### 5. Search Interface
- [ ] **5.1 Create Search Page**
  - [ ] Create app/properties/page.tsx
  - [ ] Implement responsive layout
  - [ ] Add filter sidebar component
  - [ ] Add results grid component
  - [ ] Add map view (optional)

- [ ] **5.2 Filter Controls**
  - [ ] Create FilterSidebar component
  - [ ] Group filters by category (Standard, Enhanced, Contrarian)
  - [ ] Add toggle/checkbox for each filter
  - [ ] Add configurable parameters (sliders, inputs)
  - [ ] Show active filter count
  - [ ] Add "Clear All" button

- [ ] **5.3 Results Display**
  - [ ] Create PropertyCard component
  - [ ] Display key property info
  - [ ] Show matched filters
  - [ ] Add quick actions (save, view, analyze)
  - [ ] Implement infinite scroll or pagination

- [ ] **5.4 Search State Management**
  - [ ] Create usePropertySearch hook
  - [ ] Manage filter state
  - [ ] Handle loading and error states
  - [ ] Sync with URL parameters
  - [ ] Support deep linking

---

### 6. Saved Searches
- [ ] **6.1 Create Saved Search Feature**
  - [ ] Save filter combinations to database
  - [ ] Allow naming saved searches
  - [ ] Support search descriptions
  - [ ] Track last run date

- [ ] **6.2 Saved Search Management**
  - [ ] List user's saved searches
  - [ ] Load saved search filters
  - [ ] Edit saved search
  - [ ] Delete saved search

- [ ] **6.3 Search Notifications (Placeholder)**
  - [ ] Schema for notification preferences
  - [ ] Mark searches for notifications
  - [ ] (Implementation in Phase 9)

---

### 7. Performance Optimization
- [ ] **7.1 Query Performance**
  - [ ] Analyze query execution plans
  - [ ] Add missing indexes
  - [ ] Optimize JOIN operations
  - [ ] Implement query result caching

- [ ] **7.2 UI Performance**
  - [ ] Implement virtual scrolling for large results
  - [ ] Lazy load property images
  - [ ] Debounce filter changes
  - [ ] Show skeleton loaders

- [ ] **7.3 Cache Strategy**
  - [ ] Cache search results by filter combination
  - [ ] Invalidate on data updates
  - [ ] Pre-warm popular searches

---

## Success Criteria

- [ ] All 21 filters implemented and functional
- [ ] Search returns results in < 2 seconds
- [ ] Filters can be combined without errors
- [ ] Saved searches persist across sessions
- [ ] UI is responsive on mobile and desktop
- [ ] Filter descriptions are clear to users

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Complex queries too slow | Medium | High | Query optimization, caching |
| Contrarian filters lack data | Medium | Medium | Graceful degradation, data enrichment |
| Filter logic errors | Medium | High | Comprehensive testing |
| UI complexity overwhelms users | Low | Medium | Clear grouping, presets |

---

## Related Phases

- **Previous Phase:** [Phase 3: RentCast Integration](./PHASE_03_RentCast_Integration_2025-12-02.md)
- **Next Phase:** [Phase 5: AI/LLM Integration](./PHASE_05_AI_LLM_Integration_2025-12-02.md)
- **Dependent Phases:** Phases 7 (Buyer Matching), 8 (Deal Pipeline), 11 (Analytics)

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

**Phase Document Version:** 1.0  
**Last Updated:** 2025-12-02

