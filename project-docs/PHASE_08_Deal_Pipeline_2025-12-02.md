# Phase 8: Deal Pipeline

---

**Phase Number:** 8 of 12
**Duration:** 2.5 Weeks
**Dependencies:** [Phase 4: Property Search](./PHASE_04_Property_Search_2025-12-02.md), [Phase 5: AI/LLM Integration](./PHASE_05_AI_LLM_Integration_2025-12-02.md), [Phase 7: Buyer Intelligence](./PHASE_07_Buyer_Intelligence_2025-12-02.md)
**Status:** Not Started
**Start Date:** TBD
**Target Completion:** TBD
**AI Tools in Phase:** 24
**New Database Tables:** 7

---

## Overview

Build a complete deal pipeline from lead to close including stages, tasks, document management, offer tracking, and pipeline analytics. This phase creates the operational backbone for managing wholesale deals.

**Additionally, this phase implements:**
- **Schema Extension** - 7 new database tables for CRM and Sales Intelligence
- **CRM Lead Management** - Full lead lifecycle from the CRM Sales Intelligence Hub specification
- **Deal Pipeline AI Tools** (12) - AI-powered deal analysis and management
- **CRM AI Tools** (12) - Lead list management and scoring
- **Tiered Offer Strategy Engine** - Optimal, target, maximum, walk_away pricing
- **Sales Intelligence Reports** - Caller briefing documents

---

## Objectives

1. Implement deal stages and workflow
2. Create deal management interface
3. Build task and activity tracking
4. Develop offer creation and management
5. Implement document attachment system
6. Create pipeline visualization
7. Build pipeline analytics and reporting
8. **Create 7 new database tables (Schema Extension)**
9. **Implement CRM Lead Management system**
10. **Implement 12 Deal Pipeline AI Tools**
11. **Implement 12 CRM AI Tools**
12. **Build Tiered Offer Strategy Engine**
13. **Create Sales Intelligence Reports**

---

## Deal Stages Reference

| Stage | Description | Key Actions |
|-------|-------------|-------------|
| Lead | New potential deal | Initial research, contact info |
| Contacted | Seller conversation started | Call, qualify motivation |
| Appointment | Meeting scheduled | Property visit, evaluation |
| Offer Made | Offer submitted | Offer letter, negotiation |
| Under Contract | Contract signed | Due diligence, buyer search |
| Assigned | Buyer found | Assignment agreement |
| Closing | In escrow | Title work, closing coordination |
| Closed | Deal completed | Fee collected, celebration! |
| Lost | Deal fell through | Log reason, lessons learned |

---

## Task Hierarchy

### 1. Deal Management Core
- [ ] **1.1 Create Deal Form**
  - [ ] Create components/deals/DealForm.tsx
  - [ ] Property address (manual or from search)
  - [ ] Seller info (name, phone, email)
  - [ ] Stage selection
  - [ ] Financial fields (asking, offer, ARV, repairs)
  - [ ] Notes field
  - [ ] Form validation

- [ ] **1.2 Deal List View**
  - [ ] Create app/deals/page.tsx
  - [ ] Kanban board view (by stage)
  - [ ] Table/list view option
  - [ ] Filter by stage, status
  - [ ] Search by address, seller
  - [ ] Sort by date, value

- [ ] **1.3 Deal Detail View**
  - [ ] Create app/deals/[id]/page.tsx
  - [ ] Full deal information display
  - [ ] Stage progression indicator
  - [ ] Activity timeline
  - [ ] Linked property data
  - [ ] Matched buyers section
  - [ ] Documents section

- [ ] **1.4 Deal CRUD API**
  - [ ] POST /api/deals (create)
  - [ ] GET /api/deals (list with filters)
  - [ ] GET /api/deals/[id] (detail)
  - [ ] PATCH /api/deals/[id] (update)
  - [ ] DELETE /api/deals/[id] (soft delete)

---

### 2. Stage Management
- [ ] **2.1 Stage Transition Logic**
  - [ ] Create lib/deals/stages.ts
  - [ ] Define valid transitions
  - [ ] Validate transition requirements
  - [ ] Log all transitions
  - [ ] Trigger notifications on transitions

- [ ] **2.2 Stage Requirements**
  - [ ] Lead → Contacted: Contact made
  - [ ] Contacted → Appointment: Meeting scheduled
  - [ ] Appointment → Offer: Property evaluated
  - [ ] Offer → Contract: Offer accepted
  - [ ] Contract → Assigned: Buyer committed
  - [ ] Assigned → Closing: Title opened
  - [ ] Closing → Closed: Funds disbursed

- [ ] **2.3 Stage UI**
  - [ ] Create StagePipeline component
  - [ ] Visual stage indicator
  - [ ] Click to change stage
  - [ ] Confirmation for transitions
  - [ ] Reason required for "Lost"

---

### 3. Kanban Board
- [ ] **3.1 Kanban Implementation**
  - [ ] Create components/deals/KanbanBoard.tsx
  - [ ] Columns for each stage
  - [ ] Deal cards with key info
  - [ ] Drag-and-drop between stages
  - [ ] Use @dnd-kit/core for DnD

- [ ] **3.2 Kanban Cards**
  - [ ] Create DealCard component
  - [ ] Show address, seller name
  - [ ] Show offer/contract price
  - [ ] Show days in stage
  - [ ] Quick action buttons
  - [ ] Visual indicators (hot, stale)

- [ ] **3.3 Kanban Persistence**
  - [ ] Save stage on drop
  - [ ] Optimistic updates
  - [ ] Handle conflicts
  - [ ] Undo capability

---

### 4. Activity Tracking
- [ ] **4.1 Activity Logging**
  - [ ] Create lib/deals/activities.ts
  - [ ] Log all deal activities:
    - [ ] Calls made
    - [ ] Emails sent
    - [ ] SMS sent
    - [ ] Stage changes
    - [ ] Notes added
    - [ ] Documents uploaded
    - [ ] Offers made
  - [ ] Store in deal_activities table

- [ ] **4.2 Activity Timeline**
  - [ ] Create ActivityTimeline component
  - [ ] Chronological activity display
  - [ ] Filter by activity type
  - [ ] Show user who performed action
  - [ ] Relative timestamps

- [ ] **4.3 Quick Activity Logging**
  - [ ] Add Note button
  - [ ] Log Call button (with outcome)
  - [ ] Schedule Follow-up button
  - [ ] Activity logging modal

---

### 5. Offer Management
- [ ] **5.1 Offer Creation**
  - [ ] Create components/deals/OfferForm.tsx
  - [ ] Offer amount input
  - [ ] Expiration date
  - [ ] Contingencies selection
  - [ ] Earnest money amount
  - [ ] Notes/terms

- [ ] **5.2 Offer Tracking**
  - [ ] Store in offers table
  - [ ] Track offer status:
    - [ ] Draft
    - [ ] Sent
    - [ ] Pending
    - [ ] Countered
    - [ ] Accepted
    - [ ] Rejected
    - [ ] Expired
  - [ ] Log counter offers

- [ ] **5.3 Offer History**
  - [ ] Show all offers for deal
  - [ ] Show counters and responses
  - [ ] Calculate negotiation progress
  - [ ] Visualize offer timeline

- [ ] **5.4 Offer Letter Generation**
  - [ ] AI-powered offer letter (Phase 5 integration)
  - [ ] Template-based generation
  - [ ] PDF export
  - [ ] Email offer capability

---

### 6. Document Management
- [ ] **6.1 Document Upload**
  - [ ] Create DocumentUpload component
  - [ ] Support multiple file types (PDF, images)
  - [ ] Upload to Supabase Storage
  - [ ] Link to deal record

- [ ] **6.2 Document Categories**
  - [ ] Contract documents
  - [ ] Title documents
  - [ ] Property photos
  - [ ] Proof of funds
  - [ ] Closing documents
  - [ ] Other attachments

- [ ] **6.3 Document Display**
  - [ ] List documents by category
  - [ ] Preview capability
  - [ ] Download button
  - [ ] Delete with confirmation

- [ ] **6.4 Document API**
  - [ ] POST /api/deals/[id]/documents
  - [ ] GET /api/deals/[id]/documents
  - [ ] DELETE /api/deals/[id]/documents/[docId]
  - [ ] Secure access control

---

### 7. Buyer Assignment
- [ ] **7.1 Find Buyers Integration**
  - [ ] Connect to matching from Phase 7
  - [ ] Show matched buyers on deal
  - [ ] Display match scores
  - [ ] One-click assign buyer

- [ ] **7.2 Assignment Workflow**
  - [ ] Select buyer for deal
  - [ ] Record assignment fee
  - [ ] Track buyer commitment
  - [ ] Generate assignment agreement

- [ ] **7.3 Assignment Tracking**
  - [ ] Show assigned buyer on deal
  - [ ] Track assignment status
  - [ ] Log assignment communications
  - [ ] Handle buyer cancellation

---

### 8. Pipeline Analytics
- [ ] **8.1 Pipeline Dashboard**
  - [ ] Create components/deals/PipelineStats.tsx
  - [ ] Deals by stage count
  - [ ] Total pipeline value
  - [ ] Deals added this period
  - [ ] Deals closed this period

- [ ] **8.2 Conversion Metrics**
  - [ ] Stage-to-stage conversion rates
  - [ ] Average days in each stage
  - [ ] Lead to close ratio
  - [ ] Lost deal analysis

- [ ] **8.3 Financial Metrics**
  - [ ] Total closed revenue
  - [ ] Average assignment fee
  - [ ] Projected pipeline value
  - [ ] Fee by period chart

- [ ] **8.4 Performance Reports**
  - [ ] Weekly/monthly summaries
  - [ ] Export capabilities
  - [ ] Trend analysis

---

### 9. Notifications & Reminders
- [ ] **9.1 Deal Alerts**
  - [ ] Deals stale in stage
  - [ ] Expiring offers
  - [ ] Approaching deadlines
  - [ ] Buyer follow-ups needed

- [ ] **9.2 Reminder System**
  - [ ] Set follow-up reminders
  - [ ] Snooze reminders
  - [ ] Complete reminders
  - [ ] Email/in-app notifications

---

### 10. Schema Extension (7 New Tables)
- [ ] **10.1 Create leads table**
  - [ ] Create migration file
  - [ ] Fields: id, user_id, property_id, status, source, motivation_score
  - [ ] Status enum: new, contacted, engaged, qualified, offer_made, negotiating, under_contract, closed, lost
  - [ ] Source tracking: skip_trace, driving_for_dollars, referral, marketing
  - [ ] Enable RLS with user policies

- [ ] **10.2 Create lead_lists table**
  - [ ] Fields: id, user_id, name, description, filter_criteria, created_at
  - [ ] Support dynamic and static lists
  - [ ] Enable RLS

- [ ] **10.3 Create lead_list_items table**
  - [ ] Fields: id, list_id, lead_id, added_at, position
  - [ ] Junction table for list membership
  - [ ] Enable RLS

- [ ] **10.4 Create lead_contact_history table**
  - [ ] Fields: id, lead_id, contact_type, outcome, notes, contacted_at
  - [ ] Contact types: call, sms, email, voicemail, in_person
  - [ ] Outcome tracking: no_answer, left_message, spoke_with, scheduled, not_interested

- [ ] **10.5 Create activities table**
  - [ ] Fields: id, user_id, entity_type, entity_id, activity_type, metadata, created_at
  - [ ] Generic activity log for leads, deals, buyers
  - [ ] Enable RLS

- [ ] **10.6 Create offer_strategies table**
  - [ ] Fields: id, deal_id, optimal_price, target_price, maximum_price, walk_away_price
  - [ ] Calculated fields: arv, repair_estimate, profit_margin
  - [ ] Strategy reasoning (AI-generated)

- [ ] **10.7 Create sales_reports table**
  - [ ] Fields: id, lead_id, report_type, content, generated_at
  - [ ] Report types: caller_briefing, property_analysis, negotiation_guide
  - [ ] Store as JSON for flexibility

---

### 11. CRM Lead Management (from CRM Sales Intelligence Hub)
- [ ] **11.1 Lead Status Workflow**
  - [ ] Create lib/crm/lead-workflow.ts
  - [ ] Define status transitions:
    - new → contacted
    - contacted → engaged
    - engaged → qualified
    - qualified → offer_made
    - offer_made → negotiating
    - negotiating → under_contract
    - under_contract → closed
    - Any → lost (with reason)
  - [ ] Validate transitions
  - [ ] Log all status changes

- [ ] **11.2 Lead List Management**
  - [ ] Create components/crm/LeadListManager.tsx
  - [ ] Create new lists (static or dynamic)
  - [ ] Add/remove leads from lists
  - [ ] Bulk operations on lists
  - [ ] Export list to CSV

- [ ] **11.3 Lead Scoring System**
  - [ ] Create lib/crm/lead-scoring.ts
  - [ ] Score factors:
    - Motivation indicators (30%)
    - Property equity (25%)
    - Contact responsiveness (20%)
    - Market conditions (15%)
    - Time on market (10%)
  - [ ] Calculate composite score (0-100)
  - [ ] Auto-update on new data

- [ ] **11.4 Lead Contact Tracking**
  - [ ] Create ContactHistoryPanel component
  - [ ] Log all contact attempts
  - [ ] Track outcomes
  - [ ] Calculate contact frequency
  - [ ] Suggest optimal contact times

- [ ] **11.5 Lead API Routes**
  - [ ] POST /api/crm/leads (create)
  - [ ] GET /api/crm/leads (list with filters)
  - [ ] GET /api/crm/leads/[id] (detail)
  - [ ] PATCH /api/crm/leads/[id] (update)
  - [ ] POST /api/crm/leads/[id]/contact (log contact)
  - [ ] GET /api/crm/lead-lists (list all lists)
  - [ ] POST /api/crm/lead-lists (create list)

---

### 12. Deal Pipeline AI Tools (12 Tools)
- [ ] **12.1 createDeal**
  - [ ] Implement in lib/ai/tools/deal-tools.ts
  - [ ] Accept property and seller info
  - [ ] Create deal record
  - [ ] Set initial stage
  - [ ] Return deal ID

- [ ] **12.2 updateDealStage**
  - [ ] Accept deal ID and new stage
  - [ ] Validate transition
  - [ ] Update stage
  - [ ] Log activity

- [ ] **12.3 analyzeDealProgress**
  - [ ] Analyze deal timeline
  - [ ] Identify bottlenecks
  - [ ] Suggest next actions
  - [ ] Predict close probability

- [ ] **12.4 generateOfferStrategy**
  - [ ] Calculate optimal offer price
  - [ ] Generate tiered pricing
  - [ ] Provide negotiation guidance
  - [ ] Store in offer_strategies table

- [ ] **12.5 assignBuyerToDeal**
  - [ ] Accept deal and buyer IDs
  - [ ] Create assignment record
  - [ ] Calculate assignment fee
  - [ ] Notify buyer

- [ ] **12.6 getDealTimeline**
  - [ ] Retrieve all deal activities
  - [ ] Format as timeline
  - [ ] Include stage changes
  - [ ] Show communication history

- [ ] **12.7 predictDealOutcome**
  - [ ] Analyze deal characteristics
  - [ ] Compare to historical deals
  - [ ] Predict success probability
  - [ ] Identify risk factors

- [ ] **12.8 generateDealSummary**
  - [ ] Create AI-written deal summary
  - [ ] Include key metrics
  - [ ] Highlight opportunities/risks
  - [ ] Format for sharing

- [ ] **12.9 compareDealToPortfolio**
  - [ ] Compare to user's past deals
  - [ ] Identify similar deals
  - [ ] Show performance benchmarks

- [ ] **12.10 suggestDealActions**
  - [ ] Analyze current deal state
  - [ ] Suggest next steps
  - [ ] Prioritize by impact
  - [ ] Include timing recommendations

- [ ] **12.11 calculateDealMetrics**
  - [ ] Calculate ROI, profit margin
  - [ ] Estimate holding costs
  - [ ] Project timeline
  - [ ] Return comprehensive metrics

- [ ] **12.12 flagDealIssues**
  - [ ] Identify potential problems
  - [ ] Check for stale deals
  - [ ] Verify documentation
  - [ ] Alert on deadlines

---

### 13. CRM AI Tools (12 Tools)
- [ ] **13.1 createLeadList**
  - [ ] Implement in lib/ai/tools/crm-tools.ts
  - [ ] Accept list name and criteria
  - [ ] Create list record
  - [ ] Populate with matching leads

- [ ] **13.2 rankListByMotivation**
  - [ ] Accept list ID
  - [ ] Calculate motivation scores
  - [ ] Sort by score
  - [ ] Return ranked list

- [ ] **13.3 suggestLeadOutreach**
  - [ ] Analyze lead status
  - [ ] Recommend contact method
  - [ ] Suggest messaging
  - [ ] Prioritize by opportunity

- [ ] **13.4 analyzeLeadSource**
  - [ ] Track lead sources
  - [ ] Calculate conversion rates
  - [ ] Identify best sources
  - [ ] Recommend focus areas

- [ ] **13.5 segmentLeads**
  - [ ] Group leads by criteria
  - [ ] Create segments
  - [ ] Enable targeted campaigns

- [ ] **13.6 predictLeadConversion**
  - [ ] Analyze lead characteristics
  - [ ] Predict conversion probability
  - [ ] Identify key factors

- [ ] **13.7 generateLeadReport**
  - [ ] Create lead summary report
  - [ ] Include activity metrics
  - [ ] Export as PDF

- [ ] **13.8 identifyHotLeads**
  - [ ] Find high-potential leads
  - [ ] Based on recent activity
  - [ ] Prioritize for immediate action

- [ ] **13.9 trackLeadEngagement**
  - [ ] Monitor lead interactions
  - [ ] Calculate engagement score
  - [ ] Alert on changes

- [ ] **13.10 suggestLeadNurturing**
  - [ ] Analyze lead stage
  - [ ] Recommend nurturing actions
  - [ ] Schedule follow-ups

- [ ] **13.11 mergeLeadRecords**
  - [ ] Identify duplicate leads
  - [ ] Merge records
  - [ ] Preserve history

- [ ] **13.12 exportLeadData**
  - [ ] Export leads to CSV/Excel
  - [ ] Include all metadata
  - [ ] Support filtering

---

### 14. Tiered Offer Strategy Engine (from CRM Sales Intelligence Hub)
- [ ] **14.1 Create Strategy Calculator**
  - [ ] Create lib/crm/offer-strategy.ts
  - [ ] Calculate four price tiers:
    - **Optimal**: Best case scenario price
    - **Target**: Realistic target price
    - **Maximum**: Highest acceptable price
    - **Walk Away**: Do not exceed price
  - [ ] Factor in ARV, repairs, profit margin, market conditions

- [ ] **14.2 Strategy UI Component**
  - [ ] Create components/deals/OfferStrategyPanel.tsx
  - [ ] Display all four tiers
  - [ ] Show calculation breakdown
  - [ ] Allow manual adjustments
  - [ ] Save strategy to database

- [ ] **14.3 Negotiation Guidance**
  - [ ] Generate AI negotiation tips
  - [ ] Suggest counter-offer responses
  - [ ] Track negotiation progress
  - [ ] Recommend when to walk away

- [ ] **14.4 Strategy API**
  - [ ] POST /api/deals/[id]/strategy (generate)
  - [ ] GET /api/deals/[id]/strategy (retrieve)
  - [ ] PATCH /api/deals/[id]/strategy (update)

---

### 15. Sales Intelligence Reports (from CRM Sales Intelligence Hub)
- [ ] **15.1 Caller Briefing Report**
  - [ ] Create lib/crm/sales-reports.ts
  - [ ] Generate before outbound calls
  - [ ] Include:
    - Property summary
    - Owner information
    - Motivation indicators
    - Suggested talking points
    - Offer strategy summary
    - Previous contact history
  - [ ] Format as printable PDF

- [ ] **15.2 Property Analysis Report**
  - [ ] Comprehensive property analysis
  - [ ] Comparable sales
  - [ ] Market trends
  - [ ] Investment potential
  - [ ] Risk factors

- [ ] **15.3 Negotiation Guide Report**
  - [ ] Seller motivation analysis
  - [ ] Recommended approach
  - [ ] Objection handling scripts
  - [ ] Price justification points

- [ ] **15.4 Report Generation API**
  - [ ] POST /api/crm/reports/caller-briefing
  - [ ] POST /api/crm/reports/property-analysis
  - [ ] POST /api/crm/reports/negotiation-guide
  - [ ] Return PDF download link

- [ ] **15.5 Report UI**
  - [ ] Create ReportViewer component
  - [ ] Generate on-demand
  - [ ] Print/download options
  - [ ] Save to deal documents

---

## Success Criteria

- [ ] All deal stages implemented
- [ ] Kanban board functional with drag-drop
- [ ] Activity tracking logging all actions
- [ ] Offer management complete
- [ ] Document upload working
- [ ] Buyer assignment functional
- [ ] Pipeline analytics accurate
- [ ] **All 7 new database tables created with RLS**
- [ ] **CRM Lead Management fully operational**
- [ ] **All 12 Deal Pipeline AI Tools implemented**
- [ ] **All 12 CRM AI Tools implemented**
- [ ] **Tiered Offer Strategy generating accurate pricing**
- [ ] **Sales Intelligence Reports generating correctly**

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Kanban performance with many deals | Medium | Medium | Pagination, virtualization |
| Document storage costs | Low | Low | File size limits, cleanup policies |
| Stage transition errors | Low | High | Validation, confirmation dialogs |
| Lead scoring accuracy | Medium | Medium | Iterative tuning, user feedback |
| Offer strategy calculations | Medium | High | Conservative estimates, manual override |
| Report generation latency | Medium | Low | Background generation, caching |

---

## Related Phases

- **Previous Phase:** [Phase 7: Buyer Intelligence](./PHASE_07_Buyer_Intelligence_2025-12-02.md)
- **Next Phase:** [Phase 9: Communication Automation](./PHASE_09_Communication_2025-12-02.md)
- **Dependent Phases:** Phase 9 (deal communications, sensitivity filtering), Phase 11 (deal analytics, success engine)
- **AI Framework:** Uses Tool Execution Framework from Phase 5

---

## AI Tool Summary

| Category | Tool Count | Key Capabilities |
|----------|------------|------------------|
| Deal Pipeline Tools | 12 | Deal creation, stage management, offer strategy, predictions |
| CRM Tools | 12 | Lead lists, scoring, segmentation, reporting |
| **Total** | **24** | |

---

## Database Schema Extension Summary

| Table | Purpose | Key Fields |
|-------|---------|------------|
| leads | Lead tracking | status, source, motivation_score |
| lead_lists | List management | name, filter_criteria |
| lead_list_items | List membership | list_id, lead_id |
| lead_contact_history | Contact tracking | contact_type, outcome |
| activities | Activity log | entity_type, activity_type |
| offer_strategies | Tiered pricing | optimal, target, maximum, walk_away |
| sales_reports | Generated reports | report_type, content |

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
**Major Updates:** Added Schema Extension (7 tables), CRM Lead Management, 24 AI Tools, Tiered Offer Strategy, Sales Intelligence Reports from CRM Sales Intelligence Hub specification

