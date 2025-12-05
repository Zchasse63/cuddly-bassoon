# Phase 3: RentCast Integration

---

**Phase Number:** 3 of 12  
**Duration:** 2 Weeks  
**Dependencies:** [Phase 1: Foundation](./PHASE_01_Foundation_2025-12-02.md), [Phase 2: Database Schema](./PHASE_02_Database_Schema_2025-12-02.md)  
**Status:** Not Started  
**Start Date:** TBD  
**Target Completion:** TBD  

---

## Overview

Complete integration with the RentCast API to access 140M+ property records. This phase implements all API endpoints, rate limiting, error handling, data transformation, caching strategies, and establishes the property data pipeline that powers the entire platform.

---

## Objectives

1. Build RentCast API client service with full endpoint coverage
2. Implement rate limiting and quota management
3. Create comprehensive error handling and retry logic
4. Develop data transformation layer for consistent schemas
5. Establish multi-tier caching strategy (Redis + database)
6. Build property data enrichment pipeline
7. Create monitoring and usage tracking

---

## Technology Requirements

| Technology | Version | Purpose |
|------------|---------|---------|
| RentCast API | v1 | Property data source (140M+ records) |
| Axios/Fetch | Latest | HTTP client for API calls |
| Upstash Redis | Latest | Response caching |
| Zod | Latest | Response validation |

---

## RentCast API Endpoints Reference

| Endpoint | Purpose | Rate Limit |
|----------|---------|------------|
| /properties | Property search | 100/min |
| /properties/{id} | Property details | 100/min |
| /avm | Automated valuation | 50/min |
| /rent-estimate | Rent estimates | 50/min |
| /markets | Market statistics | 100/min |
| /listings | MLS listings | 100/min |

---

## Task Hierarchy

### 1. API Client Foundation
- [ ] **1.1 Create RentCast Client Class**
  - [ ] Create lib/rentcast/client.ts
  - [ ] Configure base URL and authentication
  - [ ] Implement request/response interceptors
  - [ ] Add request ID tracking for debugging
  - [ ] Set up timeout configuration (30s default)

- [ ] **1.2 Implement Authentication**
  - [ ] Load API key from environment
  - [ ] Add API key to request headers
  - [ ] Create key rotation support (future)
  - [ ] Validate key on startup

- [ ] **1.3 Create Type Definitions**
  - [ ] Define RentCastProperty interface
  - [ ] Define RentCastValuation interface
  - [ ] Define RentCastMarketData interface
  - [ ] Define RentCastListing interface
  - [ ] Create Zod schemas for validation
  - [ ] Export all types from lib/rentcast/types.ts

---

### 2. Rate Limiting and Quotas
- [ ] **2.1 Implement Rate Limiter**
  - [ ] Create lib/rentcast/rate-limiter.ts
  - [ ] Track requests per minute by endpoint
  - [ ] Implement sliding window algorithm
  - [ ] Queue requests when limit approaching
  - [ ] Add delay between requests when throttled

- [ ] **2.2 Quota Management**
  - [ ] Track monthly API quota usage
  - [ ] Store usage in Redis with daily/monthly keys
  - [ ] Create usage alerts at 75%, 90%, 95%
  - [ ] Implement soft and hard limits
  - [ ] Expose usage stats via internal API

- [ ] **2.3 Request Prioritization**
  - [ ] Define priority levels (high, normal, low)
  - [ ] High: User-initiated searches
  - [ ] Normal: Background enrichment
  - [ ] Low: Prefetching and caching
  - [ ] Implement priority queue for requests

---

### 3. Core API Endpoints
- [ ] **3.1 Property Search Endpoint**
  - [ ] Implement searchProperties(params)
  - [ ] Support filters: address, city, state, zip
  - [ ] Support filters: property_type, beds, baths
  - [ ] Support filters: owner_type, equity_percent
  - [ ] Handle pagination (offset, limit)
  - [ ] Return normalized PropertyResult[]

- [ ] **3.2 Property Details Endpoint**
  - [ ] Implement getProperty(id)
  - [ ] Fetch full property record
  - [ ] Include owner information
  - [ ] Include tax history
  - [ ] Include transaction history
  - [ ] Cache for 24 hours

- [ ] **3.3 Valuation Endpoint**
  - [ ] Implement getValuation(propertyId)
  - [ ] Fetch AVM (Automated Valuation Model)
  - [ ] Include price range (low, high, estimate)
  - [ ] Include confidence score
  - [ ] Include comparable properties
  - [ ] Cache for 7 days

- [ ] **3.4 Rent Estimate Endpoint**
  - [ ] Implement getRentEstimate(propertyId)
  - [ ] Fetch rental valuation
  - [ ] Include rent range (low, high, estimate)
  - [ ] Include comparable rentals
  - [ ] Cache for 7 days

- [ ] **3.5 Market Data Endpoint**
  - [ ] Implement getMarketData(zipCode)
  - [ ] Fetch market statistics
  - [ ] Include median values, trends
  - [ ] Include inventory metrics
  - [ ] Cache for 24 hours

- [ ] **3.6 Listings Endpoint**
  - [ ] Implement getListings(params)
  - [ ] Support active/pending/sold filters
  - [ ] Include listing details and photos
  - [ ] Handle MLS data restrictions
  - [ ] Cache for 1 hour (active), 24 hours (sold)

---

### 4. Error Handling
- [ ] **4.1 Create Error Classes**
  - [ ] RentCastApiError (base class)
  - [ ] RentCastRateLimitError
  - [ ] RentCastAuthenticationError
  - [ ] RentCastNotFoundError
  - [ ] RentCastValidationError

- [ ] **4.2 Implement Retry Logic**
  - [ ] Create retry wrapper function
  - [ ] Exponential backoff (1s, 2s, 4s, 8s)
  - [ ] Max 3 retries for transient errors
  - [ ] No retry for 4xx errors (except 429)
  - [ ] Special handling for rate limit (wait and retry)

- [ ] **4.3 Error Logging and Monitoring**
  - [ ] Log all API errors with context
  - [ ] Track error rates by endpoint
  - [ ] Alert on elevated error rates
  - [ ] Create error dashboard (Phase 11)

---

### 5. Caching Strategy
- [ ] **5.1 Implement Redis Cache Layer**
  - [ ] Create lib/rentcast/cache.ts
  - [ ] Generate cache keys by endpoint + params
  - [ ] Implement cache get/set with TTL
  - [ ] Support cache invalidation
  - [ ] Track cache hit/miss rates

- [ ] **5.2 Define TTL Strategy**
  - [ ] Property search: 15 minutes
  - [ ] Property details: 24 hours
  - [ ] Valuations: 7 days
  - [ ] Market data: 24 hours
  - [ ] Active listings: 1 hour
  - [ ] Sold listings: 7 days

- [ ] **5.3 Implement Database Caching**
  - [ ] Store enriched properties in Supabase
  - [ ] Check database before API call
  - [ ] Update stale records in background
  - [ ] Track data freshness

- [ ] **5.4 Cache Warming**
  - [ ] Identify high-traffic markets
  - [ ] Pre-cache market data for top zips
  - [ ] Schedule off-peak cache warming
  - [ ] Monitor cache effectiveness

---

### 6. Data Transformation
- [ ] **6.1 Create Transformation Pipeline**
  - [ ] Create lib/rentcast/transform.ts
  - [ ] Map RentCast fields to internal schema
  - [ ] Handle null/missing values
  - [ ] Normalize data formats (dates, numbers)
  - [ ] Calculate derived fields (equity %)

- [ ] **6.2 Property Transformation**
  - [ ] Transform address components
  - [ ] Normalize property types
  - [ ] Calculate ownership duration
  - [ ] Determine absentee status
  - [ ] Validate required fields

- [ ] **6.3 Valuation Transformation**
  - [ ] Extract price estimates
  - [ ] Calculate equity percentage
  - [ ] Normalize confidence scores
  - [ ] Handle missing valuations

- [ ] **6.4 Market Data Transformation**
  - [ ] Aggregate market metrics
  - [ ] Calculate trend indicators
  - [ ] Normalize statistical data
  - [ ] Handle incomplete market data

---

### 7. Property Enrichment Pipeline
- [ ] **7.1 Create Enrichment Service**
  - [ ] Create lib/rentcast/enrichment.ts
  - [ ] Define enrichment stages
  - [ ] Handle partial enrichment
  - [ ] Track enrichment status

- [ ] **7.2 Enrichment Workflow**
  - [ ] Stage 1: Basic property data
  - [ ] Stage 2: Valuation data
  - [ ] Stage 3: Market context
  - [ ] Stage 4: Listing history
  - [ ] Stage 5: Owner insights
  - [ ] Mark fully enriched properties

- [ ] **7.3 Background Enrichment**
  - [ ] Queue properties for enrichment
  - [ ] Process in batches (respect rate limits)
  - [ ] Prioritize user-viewed properties
  - [ ] Log enrichment progress

---

### 8. Usage Tracking and Monitoring
- [ ] **8.1 Create Usage Tracker**
  - [ ] Track API calls by endpoint
  - [ ] Track API calls by user
  - [ ] Calculate costs per request
  - [ ] Store daily usage summaries

- [ ] **8.2 Create Monitoring Endpoints**
  - [ ] GET /api/internal/rentcast/usage
  - [ ] GET /api/internal/rentcast/health
  - [ ] GET /api/internal/rentcast/cache-stats
  - [ ] Secure with admin authentication

- [ ] **8.3 Alerting**
  - [ ] Alert on quota approaching limits
  - [ ] Alert on elevated error rates
  - [ ] Alert on response time degradation
  - [ ] Configure notification channels

---

### 9. API Routes
- [ ] **9.1 Create Property API Routes**
  - [ ] GET /api/properties/search
  - [ ] GET /api/properties/[id]
  - [ ] GET /api/properties/[id]/valuation
  - [ ] GET /api/properties/[id]/rent-estimate
  - [ ] Implement request validation
  - [ ] Add response caching headers

- [ ] **9.2 Create Market API Routes**
  - [ ] GET /api/markets/[zipCode]
  - [ ] GET /api/markets/[zipCode]/trends
  - [ ] GET /api/markets/[zipCode]/comparables
  - [ ] Implement request validation

- [ ] **9.3 Create Listings API Routes**
  - [ ] GET /api/listings/search
  - [ ] GET /api/listings/[id]
  - [ ] Support filtering by status
  - [ ] Implement request validation

---

## Success Criteria

- [ ] All RentCast endpoints integrated
- [ ] Rate limiting prevents quota exhaustion
- [ ] Cache hit rate > 60% for repeat queries
- [ ] Error retry logic functioning correctly
- [ ] Property search returns results < 2 seconds
- [ ] Usage tracking accurate and accessible
- [ ] Zero unhandled API errors in production

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Rate limit exceeded | Medium | High | Aggressive caching, request prioritization |
| API schema changes | Low | High | Zod validation catches changes early |
| Quota exhaustion | Medium | Critical | Usage alerts, hard limits, caching |
| Slow API responses | Medium | Medium | Timeouts, parallel requests where possible |

---

## Related Phases

- **Previous Phase:** [Phase 2: Database Schema](./PHASE_02_Database_Schema_2025-12-02.md)
- **Next Phase:** [Phase 4: Property Search & Filters](./PHASE_04_Property_Search_2025-12-02.md)
- **Dependent Phases:** Phases 4, 7, 8, 11 use property data from this phase

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

