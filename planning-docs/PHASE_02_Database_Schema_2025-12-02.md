# Phase 2: Database Schema

---

**Phase Number:** 2 of 12
**Duration:** 1 Week
**Dependencies:** [Phase 1: Foundation](./PHASE_01_Foundation_2025-12-02.md)
**Status:** ✅ Complete
**Start Date:** 2025-12-02
**Target Completion:** 2025-12-02

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
- [x] **1.1 Enable Required Extensions**
  - [x] Enable pgvector extension for embeddings
  - [x] Enable pg_trgm for text similarity
  - [x] Enable uuid-ossp for UUID generation
  - [x] Verify extensions are active

---

### 2. Core Property Tables
- [x] **2.1 Create Properties Table**
  - [x] id (UUID, primary key)
  - [x] rentcast_id (VARCHAR, unique, indexed)
  - [x] address, city, state, zip (VARCHAR)
  - [x] county, latitude, longitude
  - [x] property_type, bedrooms, bathrooms
  - [x] square_footage, lot_size, year_built
  - [x] owner_name, owner_type (absentee, etc.)
  - [x] ownership_length_months
  - [x] is_listed, listing_status
  - [x] created_at, updated_at timestamps
  - [x] Add GIN index on address for text search

- [x] **2.2 Create Valuations Table**
  - [x] id (UUID, primary key)
  - [x] property_id (FK to properties)
  - [x] estimated_value, price_range_low, price_range_high
  - [x] rent_estimate, rent_range_low, rent_range_high
  - [x] arv_estimate (After Repair Value)
  - [x] equity_percent, equity_amount
  - [x] valuation_date, data_source
  - [x] created_at, updated_at

- [x] **2.3 Create Market Data Table**
  - [x] id (UUID, primary key)
  - [x] zip_code (VARCHAR, indexed)
  - [x] city, state, county
  - [x] median_home_value, median_rent
  - [x] price_per_sqft, rent_per_sqft
  - [x] days_on_market_avg
  - [x] inventory_count, absorption_rate
  - [x] year_over_year_change
  - [x] data_date, data_source
  - [x] created_at, updated_at

- [x] **2.4 Create Listings Table**
  - [x] id (UUID, primary key)
  - [x] property_id (FK to properties)
  - [x] mls_number, listing_status
  - [x] list_price, original_list_price
  - [x] price_changes (JSONB array)
  - [x] days_on_market
  - [x] listing_date, expiration_date
  - [x] listing_agent, listing_office
  - [x] photos (JSONB array of URLs)
  - [x] description
  - [x] created_at, updated_at

---

### 3. User Tables
- [x] **3.1 Create User Profiles Table**
  - [x] id (UUID, FK to auth.users)
  - [x] email, full_name
  - [x] company_name, phone
  - [x] subscription_tier (free, pro, enterprise)
  - [x] subscription_status
  - [x] api_calls_remaining, api_calls_reset_date
  - [x] preferences (JSONB)
  - [x] created_at, updated_at

- [x] **3.2 Create User Preferences Table**
  - [x] id (UUID, primary key)
  - [x] user_id (FK to user_profiles)
  - [x] default_markets (JSONB array)
  - [x] default_filters (JSONB)
  - [x] notification_settings (JSONB)
  - [x] ui_preferences (JSONB)
  - [x] created_at, updated_at

- [x] **3.3 Create Saved Searches Table**
  - [x] id (UUID, primary key)
  - [x] user_id (FK to user_profiles)
  - [x] name, description
  - [x] filters (JSONB)
  - [x] is_active, notify_on_new
  - [x] last_run_at, results_count
  - [x] created_at, updated_at

---

### 4. Buyer Tables
- [x] **4.1 Create Buyers Table**
  - [x] id (UUID, primary key)
  - [x] user_id (FK to user_profiles)
  - [x] name, company_name
  - [x] email, phone
  - [x] buyer_type (flipper, landlord, etc.)
  - [x] status (active, inactive, qualified)
  - [x] tier (A, B, C)
  - [x] notes
  - [x] created_at, updated_at

- [x] **4.2 Create Buyer Preferences Table**
  - [x] id (UUID, primary key)
  - [x] buyer_id (FK to buyers)
  - [x] property_types (JSONB array)
  - [x] price_range_min, price_range_max
  - [x] bedroom_min, bedroom_max
  - [x] markets (JSONB array of zip/city)
  - [x] condition_tolerance (turnkey to gut)
  - [x] max_rehab_budget
  - [x] preferred_roi_percent
  - [x] created_at, updated_at

- [x] **4.3 Create Buyer Transactions Table**
  - [x] id (UUID, primary key)
  - [x] buyer_id (FK to buyers)
  - [x] property_address
  - [x] purchase_price, sale_price
  - [x] purchase_date, sale_date
  - [x] transaction_type (purchase, sale)
  - [x] data_source
  - [x] created_at

---

### 5. Deal Pipeline Tables
- [x] **5.1 Create Deals Table**
  - [x] id (UUID, primary key)
  - [x] user_id (FK to user_profiles)
  - [x] property_id (FK to properties, nullable)
  - [x] property_address (denormalized)
  - [x] stage (lead, contacted, offer, contract, closing, closed, lost)
  - [x] status (active, on_hold, cancelled, completed)
  - [x] seller_name, seller_phone, seller_email
  - [x] asking_price, offer_price, contract_price
  - [x] assignment_fee, estimated_arv
  - [x] estimated_repairs
  - [x] assigned_buyer_id (FK to buyers)
  - [x] notes
  - [x] created_at, updated_at

- [x] **5.2 Create Deal Activities Table**
  - [x] id (UUID, primary key)
  - [x] deal_id (FK to deals)
  - [x] user_id (FK to user_profiles)
  - [x] activity_type (call, email, sms, note, stage_change)
  - [x] description
  - [x] metadata (JSONB)
  - [x] created_at

- [x] **5.3 Create Offers Table**
  - [x] id (UUID, primary key)
  - [x] deal_id (FK to deals)
  - [x] offer_amount
  - [x] offer_date, expiration_date
  - [x] status (pending, accepted, rejected, countered)
  - [x] counter_amount
  - [x] notes
  - [x] created_at, updated_at

---

### 6. Knowledge Base Tables
- [x] **6.1 Create Documents Table**
  - [x] id (UUID, primary key)
  - [x] slug (VARCHAR, unique)
  - [x] title, category, subcategory
  - [x] content (TEXT)
  - [x] tags (JSONB array)
  - [x] related_docs (JSONB array)
  - [x] difficulty_level
  - [x] version
  - [x] is_active
  - [x] created_at, updated_at

- [x] **6.2 Create Document Chunks Table**
  - [x] id (UUID, primary key)
  - [x] document_id (FK to documents)
  - [x] chunk_index (INTEGER)
  - [x] content (TEXT)
  - [x] token_count (INTEGER)
  - [x] metadata (JSONB)
  - [x] created_at

- [x] **6.3 Create Embeddings Table**
  - [x] id (UUID, primary key)
  - [x] chunk_id (FK to document_chunks)
  - [x] embedding (vector(1536))
  - [x] model_version (VARCHAR)
  - [x] created_at
  - [x] Add HNSW index on embedding for similarity search

---

### 7. Communication Tables
- [x] **7.1 Create Messages Table**
  - [x] id (UUID, primary key)
  - [x] user_id (FK to user_profiles)
  - [x] deal_id (FK to deals, nullable)
  - [x] buyer_id (FK to buyers, nullable)
  - [x] channel (sms, email)
  - [x] direction (inbound, outbound)
  - [x] recipient, sender
  - [x] subject (for email)
  - [x] body
  - [x] status (queued, sent, delivered, failed)
  - [x] external_id (Twilio/SendGrid ID)
  - [x] metadata (JSONB)
  - [x] created_at

- [x] **7.2 Create Templates Table**
  - [x] id (UUID, primary key)
  - [x] user_id (FK to user_profiles)
  - [x] name, category
  - [x] channel (sms, email)
  - [x] subject_template
  - [x] body_template
  - [x] variables (JSONB array)
  - [x] is_active
  - [x] created_at, updated_at

---

### 8. Indexes and Performance
- [x] **8.1 Create Strategic Indexes**
  - [x] properties.rentcast_id (unique)
  - [x] properties.zip (for market filtering)
  - [x] properties.owner_type (for filter queries)
  - [x] valuations.property_id
  - [x] market_data.zip_code
  - [x] deals.user_id, deals.stage
  - [x] buyers.user_id, buyers.status
  - [x] documents.slug (unique)
  - [x] embeddings.embedding (HNSW)

- [x] **8.2 Create Composite Indexes**
  - [x] properties (zip, property_type)
  - [x] deals (user_id, stage, status)
  - [x] messages (user_id, channel, created_at)

---

### 9. Row Level Security
- [x] **9.1 Enable RLS on All Tables**
  - [x] Enable RLS for user_profiles
  - [x] Enable RLS for buyers
  - [x] Enable RLS for deals
  - [x] Enable RLS for messages
  - [x] Enable RLS for saved_searches

- [x] **9.2 Create RLS Policies**
  - [x] Users can only access their own profiles
  - [x] Users can only access their own buyers
  - [x] Users can only access their own deals
  - [x] Users can only access their own messages
  - [x] Documents and market_data are publicly readable
  - [x] Properties are publicly readable (cached data)

---

### 10. RPC Functions
- [x] **10.1 Create Semantic Search Function**
  - [x] match_documents(query_embedding, match_count, threshold)
  - [x] Returns documents ranked by similarity
  - [x] Filters by category if specified

- [x] **10.2 Create Property Search Function**
  - [x] search_properties(filters, page, limit)
  - [x] Handles complex filter combinations
  - [x] Returns paginated results

- [x] **10.3 Create Analytics Functions**
  - [x] get_deal_statistics(user_id, date_range)
  - [x] get_buyer_statistics(user_id)
  - [x] get_communication_stats(user_id, date_range)

---

## Success Criteria

- [x] All tables created successfully
- [x] pgvector extension operational
- [x] RLS policies protecting user data
- [x] Indexes created and verified
- [x] RPC functions tested and working
- [x] TypeScript types generated from schema
- [x] Sample data can be inserted/queried

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

> **Completed: 2025-12-02**

### Completed Successfully
- [x] All 17 database tables created and deployed
- [x] Extensions verified (pgvector 0.8.0, pg_trgm 1.6, uuid-ossp 1.1)
- [x] 30+ strategic and composite indexes created
- [x] HNSW vector index for semantic search
- [x] RLS enabled on all tables with appropriate policies
- [x] 3 RPC functions (match_documents, search_properties, analytics)
- [x] Auto-updating timestamps via triggers
- [x] Auto user profile creation on signup trigger
- [x] TypeScript types generated (src/types/database.ts)

### Deferred or Blocked
- None

### Lessons Learned
- Use `gen_random_uuid()` instead of `uuid_generate_v4()` for Supabase compatibility
- Extensions are installed in the `extensions` schema by default

### Recommendations for Next Phase
- Phase 3 (RentCast Integration) can proceed immediately
- Property and valuation tables are ready to receive RentCast data

---

**Phase Document Version:** 1.1
**Last Updated:** 2025-12-02

