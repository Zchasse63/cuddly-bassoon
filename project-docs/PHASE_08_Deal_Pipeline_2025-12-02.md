# Phase 8: Deal Pipeline

---

**Phase Number:** 8 of 12  
**Duration:** 1 Week  
**Dependencies:** [Phase 4: Property Search](./PHASE_04_Property_Search_2025-12-02.md), [Phase 7: Buyer Intelligence](./PHASE_07_Buyer_Intelligence_2025-12-02.md)  
**Status:** Not Started  
**Start Date:** TBD  
**Target Completion:** TBD  

---

## Overview

Build a complete deal pipeline from lead to close including stages, tasks, document management, offer tracking, and pipeline analytics. This phase creates the operational backbone for managing wholesale deals.

---

## Objectives

1. Implement deal stages and workflow
2. Create deal management interface
3. Build task and activity tracking
4. Develop offer creation and management
5. Implement document attachment system
6. Create pipeline visualization
7. Build pipeline analytics and reporting

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

## Success Criteria

- [ ] All deal stages implemented
- [ ] Kanban board functional with drag-drop
- [ ] Activity tracking logging all actions
- [ ] Offer management complete
- [ ] Document upload working
- [ ] Buyer assignment functional
- [ ] Pipeline analytics accurate

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Kanban performance with many deals | Medium | Medium | Pagination, virtualization |
| Document storage costs | Low | Low | File size limits, cleanup policies |
| Stage transition errors | Low | High | Validation, confirmation dialogs |

---

## Related Phases

- **Previous Phase:** [Phase 7: Buyer Intelligence](./PHASE_07_Buyer_Intelligence_2025-12-02.md)
- **Next Phase:** [Phase 9: Communication Automation](./PHASE_09_Communication_2025-12-02.md)
- **Dependent Phases:** Phase 9 (deal communications), Phase 11 (deal analytics)

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

