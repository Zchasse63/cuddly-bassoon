# Phase 2: Database Schema

---

**Phase Number:** 2 of 12  
**Duration:** 1 Week  
**Dependencies:** [Phase 1: Foundation](./PHASE_01_Foundation_2025-12-02.md)  
**Status:** Not Started  
**Start Date:** TBD  
**Target Completion:** TBD  

---

## Overview

Design and deploy the complete database schema for the platform. This includes all core tables for properties, valuations, market data, buyers, deals, users, and the knowledge base. Establishes pgvector for RAG embeddings and implements Row Level Security (RLS) policies.

---

## Objectives

1. Deploy core property and valuation tables
2. Create user and authentication tables
3. Set up buyer and deal pipeline tables
4. Implement knowledge base and embedding tables
5. Configure pgvector extension for vector storage
6. Create database indexes for performance
7. Implement RLS policies for multi-tenant security
8. Build Supabase RPC functions for complex queries

---

## Technology Requirements

| Technology | Version | Purpose |
|------------|---------|---------|
| PostgreSQL | 15.x | Database engine (via Supabase) |
| pgvector | 0.5.x | Vector similarity search |
| pg_trgm | Built-in | Text search optimization |
| Supabase | Latest | Database hosting and management |

---

## Task Hierarchy

### 1. Database Extensions
- [ ] **1.1 Enable Required Extensions**
  - [ ] Enable pgvector extension for embeddings
  - [ ] Enable pg_trgm for text similarity
  - [ ] Enable uuid-ossp for UUID generation
  - [ ] Verify extensions are active

---

### 2. Core Property Tables
- [ ] **2.1 Create Properties Table**
  - [ ] id (UUID, primary key)
  - [ ] rentcast_id (VARCHAR, unique, indexed)
  - [ ] address, city, state, zip (VARCHAR)
  - [ ] county, latitude, longitude
  - [ ] property_type, bedrooms, bathrooms
  - [ ] square_footage, lot_size, year_built
  - [ ] owner_name, owner_type (absentee, etc.)
  - [ ] ownership_length_months
  - [ ] is_listed, listing_status
  - [ ] created_at, updated_at timestamps
  - [ ] Add GIN index on address for text search

- [ ] **2.2 Create Valuations Table**
  - [ ] id (UUID, primary key)
  - [ ] property_id (FK to properties)
  - [ ] estimated_value, price_range_low, price_range_high
  - [ ] rent_estimate, rent_range_low, rent_range_high
  - [ ] arv_estimate (After Repair Value)
  - [ ] equity_percent, equity_amount
  - [ ] valuation_date, data_source
  - [ ] created_at, updated_at

- [ ] **2.3 Create Market Data Table**
  - [ ] id (UUID, primary key)
  - [ ] zip_code (VARCHAR, indexed)
  - [ ] city, state, county
  - [ ] median_home_value, median_rent
  - [ ] price_per_sqft, rent_per_sqft
  - [ ] days_on_market_avg
  - [ ] inventory_count, absorption_rate
  - [ ] year_over_year_change
  - [ ] data_date, data_source
  - [ ] created_at, updated_at

- [ ] **2.4 Create Listings Table**
  - [ ] id (UUID, primary key)
  - [ ] property_id (FK to properties)
  - [ ] mls_number, listing_status
  - [ ] list_price, original_list_price
  - [ ] price_changes (JSONB array)
  - [ ] days_on_market
  - [ ] listing_date, expiration_date
  - [ ] listing_agent, listing_office
  - [ ] photos (JSONB array of URLs)
  - [ ] description
  - [ ] created_at, updated_at

---

### 3. User Tables
- [ ] **3.1 Create User Profiles Table**
  - [ ] id (UUID, FK to auth.users)
  - [ ] email, full_name
  - [ ] company_name, phone
  - [ ] subscription_tier (free, pro, enterprise)
  - [ ] subscription_status
  - [ ] api_calls_remaining, api_calls_reset_date
  - [ ] preferences (JSONB)
  - [ ] created_at, updated_at

- [ ] **3.2 Create User Preferences Table**
  - [ ] id (UUID, primary key)
  - [ ] user_id (FK to user_profiles)
  - [ ] default_markets (JSONB array)
  - [ ] default_filters (JSONB)
  - [ ] notification_settings (JSONB)
  - [ ] ui_preferences (JSONB)
  - [ ] created_at, updated_at

- [ ] **3.3 Create Saved Searches Table**
  - [ ] id (UUID, primary key)
  - [ ] user_id (FK to user_profiles)
  - [ ] name, description
  - [ ] filters (JSONB)
  - [ ] is_active, notify_on_new
  - [ ] last_run_at, results_count
  - [ ] created_at, updated_at

---

### 4. Buyer Tables
- [ ] **4.1 Create Buyers Table**
  - [ ] id (UUID, primary key)
  - [ ] user_id (FK to user_profiles)
  - [ ] name, company_name
  - [ ] email, phone
  - [ ] buyer_type (flipper, landlord, etc.)
  - [ ] status (active, inactive, qualified)
  - [ ] tier (A, B, C)
  - [ ] notes
  - [ ] created_at, updated_at

- [ ] **4.2 Create Buyer Preferences Table**
  - [ ] id (UUID, primary key)
  - [ ] buyer_id (FK to buyers)
  - [ ] property_types (JSONB array)
  - [ ] price_range_min, price_range_max
  - [ ] bedroom_min, bedroom_max
  - [ ] markets (JSONB array of zip/city)
  - [ ] condition_tolerance (turnkey to gut)
  - [ ] max_rehab_budget
  - [ ] preferred_roi_percent
  - [ ] created_at, updated_at

- [ ] **4.3 Create Buyer Transactions Table**
  - [ ] id (UUID, primary key)
  - [ ] buyer_id (FK to buyers)
  - [ ] property_address
  - [ ] purchase_price, sale_price
  - [ ] purchase_date, sale_date
  - [ ] transaction_type (purchase, sale)
  - [ ] data_source
  - [ ] created_at

---

### 5. Deal Pipeline Tables
- [ ] **5.1 Create Deals Table**
  - [ ] id (UUID, primary key)
  - [ ] user_id (FK to user_profiles)
  - [ ] property_id (FK to properties, nullable)
  - [ ] property_address (denormalized)
  - [ ] stage (lead, contacted, offer, contract, closing, closed, lost)
  - [ ] status (active, on_hold, cancelled, completed)
  - [ ] seller_name, seller_phone, seller_email
  - [ ] asking_price, offer_price, contract_price
  - [ ] assignment_fee, estimated_arv
  - [ ] estimated_repairs
  - [ ] assigned_buyer_id (FK to buyers)
  - [ ] notes
  - [ ] created_at, updated_at

- [ ] **5.2 Create Deal Activities Table**
  - [ ] id (UUID, primary key)
  - [ ] deal_id (FK to deals)
  - [ ] user_id (FK to user_profiles)
  - [ ] activity_type (call, email, sms, note, stage_change)
  - [ ] description
  - [ ] metadata (JSONB)
  - [ ] created_at

- [ ] **5.3 Create Offers Table**
  - [ ] id (UUID, primary key)
  - [ ] deal_id (FK to deals)
  - [ ] offer_amount
  - [ ] offer_date, expiration_date
  - [ ] status (pending, accepted, rejected, countered)
  - [ ] counter_amount
  - [ ] notes
  - [ ] created_at, updated_at

---

### 6. Knowledge Base Tables
- [ ] **6.1 Create Documents Table**
  - [ ] id (UUID, primary key)
  - [ ] slug (VARCHAR, unique)
  - [ ] title, category, subcategory
  - [ ] content (TEXT)
  - [ ] tags (JSONB array)
  - [ ] related_docs (JSONB array)
  - [ ] difficulty_level
  - [ ] version
  - [ ] is_active
  - [ ] created_at, updated_at

- [ ] **6.2 Create Document Chunks Table**
  - [ ] id (UUID, primary key)
  - [ ] document_id (FK to documents)
  - [ ] chunk_index (INTEGER)
  - [ ] content (TEXT)
  - [ ] token_count (INTEGER)
  - [ ] metadata (JSONB)
  - [ ] created_at

- [ ] **6.3 Create Embeddings Table**
  - [ ] id (UUID, primary key)
  - [ ] chunk_id (FK to document_chunks)
  - [ ] embedding (vector(1536))
  - [ ] model_version (VARCHAR)
  - [ ] created_at
  - [ ] Add HNSW index on embedding for similarity search

---

### 7. Communication Tables
- [ ] **7.1 Create Messages Table**
  - [ ] id (UUID, primary key)
  - [ ] user_id (FK to user_profiles)
  - [ ] deal_id (FK to deals, nullable)
  - [ ] buyer_id (FK to buyers, nullable)
  - [ ] channel (sms, email)
  - [ ] direction (inbound, outbound)
  - [ ] recipient, sender
  - [ ] subject (for email)
  - [ ] body
  - [ ] status (queued, sent, delivered, failed)
  - [ ] external_id (Twilio/SendGrid ID)
  - [ ] metadata (JSONB)
  - [ ] created_at

- [ ] **7.2 Create Templates Table**
  - [ ] id (UUID, primary key)
  - [ ] user_id (FK to user_profiles)
  - [ ] name, category
  - [ ] channel (sms, email)
  - [ ] subject_template
  - [ ] body_template
  - [ ] variables (JSONB array)
  - [ ] is_active
  - [ ] created_at, updated_at

---

### 8. Indexes and Performance
- [ ] **8.1 Create Strategic Indexes**
  - [ ] properties.rentcast_id (unique)
  - [ ] properties.zip (for market filtering)
  - [ ] properties.owner_type (for filter queries)
  - [ ] valuations.property_id
  - [ ] market_data.zip_code
  - [ ] deals.user_id, deals.stage
  - [ ] buyers.user_id, buyers.status
  - [ ] documents.slug (unique)
  - [ ] embeddings.embedding (HNSW)

- [ ] **8.2 Create Composite Indexes**
  - [ ] properties (zip, property_type)
  - [ ] deals (user_id, stage, status)
  - [ ] messages (user_id, channel, created_at)

---

### 9. Row Level Security
- [ ] **9.1 Enable RLS on All Tables**
  - [ ] Enable RLS for user_profiles
  - [ ] Enable RLS for buyers
  - [ ] Enable RLS for deals
  - [ ] Enable RLS for messages
  - [ ] Enable RLS for saved_searches

- [ ] **9.2 Create RLS Policies**
  - [ ] Users can only access their own profiles
  - [ ] Users can only access their own buyers
  - [ ] Users can only access their own deals
  - [ ] Users can only access their own messages
  - [ ] Documents and market_data are publicly readable
  - [ ] Properties are publicly readable (cached data)

---

### 10. RPC Functions
- [ ] **10.1 Create Semantic Search Function**
  - [ ] match_documents(query_embedding, match_count, threshold)
  - [ ] Returns documents ranked by similarity
  - [ ] Filters by category if specified

- [ ] **10.2 Create Property Search Function**
  - [ ] search_properties(filters, page, limit)
  - [ ] Handles complex filter combinations
  - [ ] Returns paginated results

- [ ] **10.3 Create Analytics Functions**
  - [ ] get_deal_statistics(user_id, date_range)
  - [ ] get_buyer_statistics(user_id)
  - [ ] get_communication_stats(user_id, date_range)

---

## Success Criteria

- [ ] All tables created successfully
- [ ] pgvector extension operational
- [ ] RLS policies protecting user data
- [ ] Indexes created and verified
- [ ] RPC functions tested and working
- [ ] TypeScript types generated from schema
- [ ] Sample data can be inserted/queried

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Schema changes later | High | Medium | Design for flexibility, use JSONB where appropriate |
| RLS too restrictive | Medium | Low | Test thoroughly, add service role bypasses |
| Index bloat | Low | Low | Monitor and adjust as needed |

---

## Related Phases

- **Previous Phase:** [Phase 1: Foundation](./PHASE_01_Foundation_2025-12-02.md)
- **Next Phase:** [Phase 3: RentCast Integration](./PHASE_03_RentCast_Integration_2025-12-02.md)
- **Dependent Phases:** Phases 3-12 all depend on schema from Phase 2

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

