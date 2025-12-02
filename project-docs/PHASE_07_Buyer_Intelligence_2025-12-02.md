# Phase 7: Buyer Intelligence

---

**Phase Number:** 7 of 12  
**Duration:** 1 Week  
**Dependencies:** [Phase 2: Database Schema](./PHASE_02_Database_Schema_2025-12-02.md), [Phase 4: Property Search](./PHASE_04_Property_Search_2025-12-02.md), [Phase 6: Knowledge Base & RAG](./PHASE_06_Knowledge_Base_RAG_2025-12-02.md)  
**Status:** Not Started  
**Start Date:** TBD  
**Target Completion:** TBD  

---

## Overview

Build the buyer management system including profiles, preferences, qualification tracking, transaction history analysis, and intelligent deal-to-buyer matching algorithms. This phase creates the infrastructure for connecting deals with the right buyers.

---

## Objectives

1. Create buyer profile management system
2. Build preference and criteria tracking
3. Implement buyer qualification workflow
4. Develop transaction history import and analysis
5. Create buyer scoring and tiering algorithm
6. Build deal-to-buyer matching engine
7. Implement buyer communication preferences

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

## Success Criteria

- [ ] CRUD operations for buyers functional
- [ ] Preferences stored and editable
- [ ] Qualification workflow operational
- [ ] Transaction history trackable
- [ ] Scoring algorithm calculating correctly
- [ ] Matching algorithm returning relevant results
- [ ] UI responsive and intuitive

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Matching algorithm not accurate | Medium | High | Iterative tuning, user feedback |
| Transaction data incomplete | High | Medium | Manual entry fallback |
| Scoring too subjective | Medium | Low | Clear criteria, transparency |

---

## Related Phases

- **Previous Phase:** [Phase 6: Knowledge Base & RAG](./PHASE_06_Knowledge_Base_RAG_2025-12-02.md)
- **Next Phase:** [Phase 8: Deal Pipeline](./PHASE_08_Deal_Pipeline_2025-12-02.md)
- **Dependent Phases:** Phase 8 (deal assignment), Phase 9 (buyer outreach)

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

