# RE AI Database Schema Documentation

> **Generated from Live Database**: December 4, 2025  
> **Project**: RE AI (qhqztlvxudvsmxeqdyfp)  
> **Region**: us-east-1  
> **Source**: Live Supabase Database (Authoritative)

---

## Table of Contents

1. [Database Overview](#database-overview)
2. [Extensions](#extensions)
3. [Entity Relationship Diagram](#entity-relationship-diagram)
4. [Table Documentation](#table-documentation)
5. [Foreign Key Relationships](#foreign-key-relationships)
6. [Indexes](#indexes)
7. [Row Level Security Policies](#row-level-security-policies)
8. [Functions](#functions)
9. [Triggers](#triggers)
10. [Check Constraints](#check-constraints)
11. [Migration Discrepancies](#migration-discrepancies)
12. [Schema Recommendations](#schema-recommendations)

---

## Database Overview

### Statistics Summary

| Metric | Count |
|--------|-------|
| **Total Tables** | 41 |
| **Total Columns** | ~450 |
| **Foreign Key Relationships** | 64 |
| **Indexes** | 165 |
| **RLS Policies** | 103 |
| **Custom Functions** | 15 (business logic) |
| **Triggers** | 21 |
| **Extensions** | 8 |

### Tables by Domain

| Domain | Tables | Description |
|--------|--------|-------------|
| **Core/Property** | 4 | properties, valuations, market_data, listings |
| **User Management** | 2 | user_profiles, user_preferences |
| **Buyer Management** | 3 | buyers, buyer_preferences, buyer_transactions |
| **Deal Pipeline** | 5 | deals, deal_activities, offers, offer_strategies, sales_reports |
| **Lead Management** | 5 | leads, lead_lists, lead_list_items, lead_list_members, lead_contact_history |
| **Communication** | 4 | messages, templates, campaigns, notifications |
| **Knowledge Base** | 3 | documents, document_chunks, embeddings |
| **Search & Analytics** | 6 | search_history, search_performance, saved_searches, scheduled_searches, analytics_daily, analytics_events |
| **Team Management** | 4 | teams, team_members, team_invitations, analytics_team_daily |
| **Automation** | 4 | workflows, workflow_executions, tasks, activities |
| **Compliance** | 1 | opt_outs |

---

## Extensions

| Extension | Version | Description |
|-----------|---------|-------------|
| `pg_graphql` | - | GraphQL support for PostgreSQL |
| `pg_stat_statements` | - | Query performance statistics |
| `pg_trgm` | - | Trigram text similarity (fuzzy search) |
| `pgcrypto` | - | Cryptographic functions |
| `plpgsql` | - | PL/pgSQL procedural language |
| `supabase_vault` | - | Secrets management |
| `uuid-ossp` | - | UUID generation functions |
| `vector` | - | pgvector for AI embeddings (1536 dimensions) |

---

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              USER & TEAM DOMAIN                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐         │
│  │   user_profiles  │────<│   team_members   │>────│      teams       │         │
│  │   (auth.users)   │     └──────────────────┘     └──────────────────┘         │
│  └────────┬─────────┘              │                        │                   │
│           │                        │                        │                   │
│           │              ┌─────────┴────────┐    ┌──────────┴─────────┐         │
│           │              │ team_invitations │    │ analytics_team_daily│         │
│           │              └──────────────────┘    └────────────────────┘         │
│           │                                                                      │
│  ┌────────┴─────────┐                                                           │
│  │ user_preferences │                                                           │
│  └──────────────────┘                                                           │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PROPERTY DOMAIN                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐         │
│  │    properties    │────<│    valuations    │     │   market_data    │         │
│  │  (rentcast_id)   │     └──────────────────┘     │   (by zip_code)  │         │
│  └────────┬─────────┘                              └──────────────────┘         │
│           │                                                                      │
│           ├──────────────────────────────────────────────────────────┐          │
│           │                                                          │          │
│  ┌────────┴─────────┐     ┌──────────────────┐              ┌────────┴────────┐ │
│  │     listings     │     │      leads       │──────────────│      deals      │ │
│  └──────────────────┘     └────────┬─────────┘              └────────┬────────┘ │
│                                    │                                  │          │
│                           ┌────────┴─────────┐              ┌────────┴────────┐ │
│                           │lead_contact_hist │              │  deal_activities │ │
│                           └──────────────────┘              └─────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                              BUYER & DEAL DOMAIN                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐         │
│  │      buyers      │────<│buyer_preferences │     │buyer_transactions│         │
│  │  (user_id FK)    │     │   (1:1 unique)   │     │   (history)      │         │
│  └────────┬─────────┘     └──────────────────┘     └──────────────────┘         │
│           │                                                                      │
│           │              ┌──────────────────┐     ┌──────────────────┐          │
│           └─────────────>│      deals       │────<│      offers      │          │
│                          │ (assigned_buyer) │     └──────────────────┘          │
│                          └────────┬─────────┘                                   │
│                                   │                                              │
│                          ┌────────┴─────────┐     ┌──────────────────┐          │
│                          │ offer_strategies │     │   sales_reports  │          │
│                          └──────────────────┘     └──────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           COMMUNICATION DOMAIN                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐         │
│  │    templates     │────<│    campaigns     │     │    messages      │         │
│  │ (sms/email)      │     │ (bulk outreach)  │     │ (all channels)   │         │
│  └──────────────────┘     └──────────────────┘     └──────────────────┘         │
│                                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐                                  │
│  │  notifications   │     │    opt_outs      │                                  │
│  │ (in-app alerts)  │     │ (compliance)     │                                  │
│  └──────────────────┘     └──────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────┐
│                           KNOWLEDGE BASE DOMAIN                                  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐         │
│  │    documents     │────<│ document_chunks  │────<│    embeddings    │         │
│  │  (slug unique)   │     │ (doc_id, index)  │     │ (vector 1536)    │         │
│  └──────────────────┘     └──────────────────┘     └──────────────────┘         │
│                                                                                  │
│  Note: HNSW index on embeddings.embedding for cosine similarity search          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Table Documentation

### Core Tables

#### `user_profiles`
Central user table linked to Supabase Auth (`auth.users`).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | - | PK, references auth.users.id |
| `email` | varchar(255) | NO | - | User email address |
| `full_name` | varchar(255) | YES | - | Display name |
| `company_name` | varchar(255) | YES | - | Company/business name |
| `phone` | varchar(50) | YES | - | Phone number |
| `subscription_tier` | varchar(50) | YES | 'free' | free, starter, pro, enterprise |
| `subscription_status` | varchar(50) | YES | 'active' | active, cancelled, past_due |
| `api_calls_remaining` | integer | YES | 1000 | API quota remaining |
| `api_calls_reset_date` | date | YES | - | Next quota reset date |
| `preferences` | jsonb | YES | '{}' | User preferences JSON |
| `current_team_id` | uuid | YES | - | FK to teams.id |
| `created_at` | timestamptz | YES | now() | Record creation |
| `updated_at` | timestamptz | YES | now() | Last update |

#### `properties`
Real estate property records with comprehensive data.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `rentcast_id` | varchar(100) | YES | - | External Rentcast ID |
| `address` | varchar(500) | NO | - | Full street address |
| `city` | varchar(100) | YES | - | City name |
| `state` | varchar(50) | YES | - | State code |
| `zip_code` | varchar(20) | YES | - | ZIP/postal code |
| `county` | varchar(100) | YES | - | County name |
| `latitude` | numeric | YES | - | GPS latitude |
| `longitude` | numeric | YES | - | GPS longitude |
| `property_type` | varchar(50) | YES | - | single_family, multi_family, etc. |
| `bedrooms` | integer | YES | - | Number of bedrooms |
| `bathrooms` | numeric | YES | - | Number of bathrooms |
| `square_feet` | integer | YES | - | Living area sq ft |
| `lot_size` | integer | YES | - | Lot size sq ft |
| `year_built` | integer | YES | - | Construction year |
| `assessed_value` | numeric | YES | - | Tax assessed value |
| `last_sale_price` | numeric | YES | - | Most recent sale price |
| `last_sale_date` | date | YES | - | Most recent sale date |
| `owner_name` | varchar(255) | YES | - | Current owner name |
| `owner_type` | varchar(50) | YES | - | individual, corporate, trust |
| `mailing_address` | varchar(500) | YES | - | Owner mailing address |
| `is_owner_occupied` | boolean | YES | - | Owner occupancy status |
| `mortgage_balance` | numeric | YES | - | Outstanding mortgage |
| `mortgage_lender` | varchar(255) | YES | - | Lender name |
| `tax_amount` | numeric | YES | - | Annual property tax |
| `hoa_amount` | numeric | YES | - | Monthly HOA fee |
| `zoning` | varchar(50) | YES | - | Zoning classification |
| `legal_description` | text | YES | - | Legal property description |
| `parcel_number` | varchar(100) | YES | - | APN/parcel number |
| `data_source` | varchar(100) | YES | - | Data provider source |
| `raw_data` | jsonb | YES | '{}' | Original API response |
| `created_at` | timestamptz | YES | now() | Record creation |
| `updated_at` | timestamptz | YES | now() | Last update |

#### `deals`
Deal pipeline tracking from lead to close.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | FK to user_profiles.id |
| `property_id` | uuid | YES | - | FK to properties.id |
| `property_address` | varchar(500) | NO | - | Denormalized address |
| `stage` | varchar(50) | YES | 'lead' | lead, contacted, negotiating, under_contract, closed, lost |
| `status` | varchar(50) | YES | 'active' | active, on_hold, closed, cancelled |
| `seller_name` | varchar(255) | YES | - | Seller contact name |
| `seller_phone` | varchar(50) | YES | - | Seller phone |
| `seller_email` | varchar(255) | YES | - | Seller email |
| `asking_price` | numeric | YES | - | Seller asking price |
| `offer_price` | numeric | YES | - | Current offer amount |
| `arv` | numeric | YES | - | After repair value |
| `repair_estimate` | numeric | YES | - | Estimated repair cost |
| `max_allowable_offer` | numeric | YES | - | MAO calculation |
| `expected_profit` | numeric | YES | - | Projected profit |
| `assigned_buyer_id` | uuid | YES | - | FK to buyers.id |
| `assignment_fee` | numeric | YES | - | Wholesale fee |
| `closing_date` | date | YES | - | Expected/actual close |
| `notes` | text | YES | - | Deal notes |
| `metadata` | jsonb | YES | '{}' | Additional data |
| `assigned_to` | uuid | YES | - | FK to user_profiles.id |
| `created_at` | timestamptz | YES | now() | Record creation |
| `updated_at` | timestamptz | YES | now() | Last update |

#### `buyers`
Cash buyer database for wholesaling.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | FK to user_profiles.id |
| `name` | varchar(255) | NO | - | Buyer name |
| `company_name` | varchar(255) | YES | - | Company name |
| `email` | varchar(255) | YES | - | Email address |
| `phone` | varchar(50) | YES | - | Phone number |
| `buyer_type` | varchar(50) | YES | - | investor, flipper, landlord, developer |
| `status` | varchar(50) | YES | 'active' | active, inactive, blacklisted |
| `tier` | varchar(1) | YES | - | A, B, C, D rating |
| `rating` | integer | YES | - | 1-5 star rating |
| `notes` | text | YES | - | Buyer notes |
| `created_at` | timestamptz | YES | now() | Record creation |
| `updated_at` | timestamptz | YES | now() | Last update |

#### `leads`
Lead management for property acquisition.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | FK to user_profiles.id |
| `property_id` | uuid | YES | - | FK to properties.id |
| `property_address` | text | NO | - | Property address |
| `owner_name` | text | YES | - | Property owner |
| `owner_phone` | text | YES | - | Owner phone |
| `owner_email` | text | YES | - | Owner email |
| `source` | text | YES | - | Lead source |
| `status` | text | NO | 'new' | new, contacted, qualified, negotiating, converted, dead |
| `priority` | text | NO | 'medium' | low, medium, high, urgent |
| `motivation_level` | integer | YES | - | 1-10 motivation score |
| `notes` | text | YES | - | Lead notes |
| `last_contact_date` | timestamptz | YES | - | Last contact timestamp |
| `next_follow_up` | timestamptz | YES | - | Scheduled follow-up |
| `assigned_to` | uuid | YES | - | FK to user_profiles.id |
| `metadata` | jsonb | YES | '{}' | Additional data |
| `created_at` | timestamptz | YES | now() | Record creation |
| `updated_at` | timestamptz | YES | now() | Last update |

### Communication Tables

#### `messages`
All communication records (SMS, email, calls).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | FK to user_profiles.id |
| `deal_id` | uuid | YES | - | FK to deals.id |
| `buyer_id` | uuid | YES | - | FK to buyers.id |
| `lead_id` | uuid | YES | - | FK to leads.id |
| `channel` | varchar(20) | NO | - | sms, email, call, mail |
| `direction` | varchar(10) | NO | - | inbound, outbound |
| `from_address` | varchar(255) | YES | - | Sender address/number |
| `to_address` | varchar(255) | YES | - | Recipient address/number |
| `subject` | varchar(500) | YES | - | Email subject |
| `body` | text | YES | - | Message content |
| `status` | varchar(50) | YES | 'pending' | pending, sent, delivered, failed, opened |
| `external_id` | varchar(255) | YES | - | External service ID |
| `metadata` | jsonb | YES | '{}' | Additional data |
| `created_at` | timestamptz | YES | now() | Record creation |

#### `templates`
Message templates for outreach.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | FK to user_profiles.id |
| `name` | varchar(255) | NO | - | Template name |
| `category` | varchar(100) | YES | - | Template category |
| `channel` | varchar(20) | NO | - | sms, email |
| `template_type` | varchar(50) | YES | 'outreach' | outreach, follow_up, closing |
| `subject_template` | varchar(500) | YES | - | Email subject template |
| `body_template` | text | NO | - | Message body with variables |
| `variables` | jsonb | YES | '[]' | Available merge variables |
| `sensitivity_level` | varchar(20) | YES | 'safe' | safe, moderate, aggressive |
| `forbidden_topics` | jsonb | YES | '[]' | Topics to avoid |
| `approval_required` | boolean | YES | false | Requires approval before send |
| `is_active` | boolean | YES | true | Template active status |
| `created_at` | timestamptz | YES | now() | Record creation |
| `updated_at` | timestamptz | YES | now() | Last update |

#### `campaigns`
Bulk outreach campaigns.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | FK to user_profiles.id |
| `name` | varchar(255) | NO | - | Campaign name |
| `description` | text | YES | - | Campaign description |
| `deal_id` | uuid | YES | - | FK to deals.id |
| `template_id` | uuid | YES | - | FK to templates.id |
| `channel` | varchar(20) | NO | 'email' | email, sms |
| `recipient_criteria` | jsonb | YES | '{}' | Recipient filter criteria |
| `status` | varchar(20) | NO | 'draft' | draft, scheduled, running, completed, paused |
| `scheduled_at` | timestamptz | YES | - | Scheduled start time |
| `started_at` | timestamptz | YES | - | Actual start time |
| `completed_at` | timestamptz | YES | - | Completion time |
| `messages_total` | integer | YES | 0 | Total recipients |
| `messages_sent` | integer | YES | 0 | Messages sent |
| `messages_delivered` | integer | YES | 0 | Messages delivered |
| `messages_opened` | integer | YES | 0 | Messages opened |
| `messages_clicked` | integer | YES | 0 | Links clicked |
| `messages_failed` | integer | YES | 0 | Failed messages |
| `created_at` | timestamptz | YES | now() | Record creation |
| `updated_at` | timestamptz | YES | now() | Last update |

#### `notifications`
In-app notification system.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | FK to user_profiles.id |
| `type` | varchar(50) | NO | - | Notification type |
| `title` | varchar(255) | NO | - | Notification title |
| `message` | text | YES | - | Notification body |
| `data` | jsonb | YES | '{}' | Additional data |
| `is_read` | boolean | YES | false | Read status |
| `read_at` | timestamptz | YES | - | When read |
| `created_at` | timestamptz | YES | now() | Record creation |

### Knowledge Base Tables

#### `documents`
Document storage for RAG system.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `title` | varchar(500) | NO | - | Document title |
| `slug` | varchar(255) | NO | - | URL-safe identifier (UNIQUE) |
| `content` | text | YES | - | Full document content |
| `category` | varchar(100) | YES | - | Document category |
| `source_url` | varchar(1000) | YES | - | Original source URL |
| `metadata` | jsonb | YES | '{}' | Additional metadata |
| `is_active` | boolean | YES | true | Active status |
| `created_at` | timestamptz | YES | now() | Record creation |
| `updated_at` | timestamptz | YES | now() | Last update |

#### `document_chunks`
Chunked document content for embeddings.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `document_id` | uuid | NO | - | FK to documents.id |
| `chunk_index` | integer | NO | - | Chunk sequence number |
| `content` | text | NO | - | Chunk text content |
| `token_count` | integer | YES | - | Token count |
| `metadata` | jsonb | YES | '{}' | Chunk metadata |
| `created_at` | timestamptz | YES | now() | Record creation |

**Unique Constraint**: `(document_id, chunk_index)`

#### `embeddings`
Vector embeddings for semantic search.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `chunk_id` | uuid | NO | - | FK to document_chunks.id |
| `embedding` | vector(1536) | NO | - | OpenAI embedding vector |
| `model` | varchar(100) | YES | - | Embedding model used |
| `created_at` | timestamptz | YES | now() | Record creation |

**Index**: HNSW index on `embedding` using `vector_cosine_ops` for fast similarity search.

### Team Management Tables

#### `teams`
Team/organization management.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `name` | varchar(255) | NO | - | Team name |
| `owner_id` | uuid | NO | - | FK to user_profiles.id |
| `settings` | jsonb | YES | '{}' | Team settings |
| `lead_assignment_mode` | varchar(20) | YES | 'round_robin' | round_robin, territory, manual |
| `territory_mode` | varchar(20) | YES | 'zip_code' | zip_code, county, state |
| `weekly_report_recipients` | jsonb | YES | '[]' | Report email list |
| `monthly_report_day` | integer | YES | 1 | Day of month for reports |
| `is_active` | boolean | YES | true | Team active status |
| `created_at` | timestamptz | YES | now() | Record creation |
| `updated_at` | timestamptz | YES | now() | Last update |

#### `team_members`
Team membership and roles.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `team_id` | uuid | NO | - | FK to teams.id |
| `user_id` | uuid | NO | - | FK to user_profiles.id |
| `role` | varchar(20) | NO | 'member' | owner, admin, member |
| `status` | varchar(20) | YES | 'active' | active, inactive |
| `invited_by` | uuid | YES | - | FK to user_profiles.id |
| `invited_at` | timestamptz | YES | - | Invitation timestamp |
| `joined_at` | timestamptz | YES | - | Join timestamp |
| `territories` | jsonb | YES | '[]' | Assigned territories |
| `permissions` | jsonb | YES | '{}' | Custom permissions |
| `created_at` | timestamptz | YES | now() | Record creation |
| `updated_at` | timestamptz | YES | now() | Last update |

**Unique Constraint**: `(team_id, user_id)`

#### `team_invitations`
Pending team invitations.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `team_id` | uuid | NO | - | FK to teams.id |
| `email` | varchar(255) | NO | - | Invitee email |
| `role` | varchar(50) | NO | 'member' | Invited role |
| `invited_by` | uuid | NO | - | Inviter user ID |
| `token` | varchar(255) | NO | - | Invitation token (UNIQUE) |
| `expires_at` | timestamptz | NO | now() + 7 days | Expiration time |
| `accepted_at` | timestamptz | YES | - | Acceptance time |
| `created_at` | timestamptz | YES | now() | Record creation |

### Analytics Tables

#### `analytics_daily`
Daily user activity metrics.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | FK to user_profiles.id |
| `date` | date | NO | - | Metric date |
| `searches` | integer | YES | 0 | Search count |
| `property_views` | integer | YES | 0 | Property views |
| `property_saves` | integer | YES | 0 | Properties saved |
| `property_analyses` | integer | YES | 0 | Analyses run |
| `skip_traces` | integer | YES | 0 | Skip traces performed |
| `calls_made` | integer | YES | 0 | Outbound calls |
| `calls_connected` | integer | YES | 0 | Connected calls |
| `call_duration_seconds` | integer | YES | 0 | Total call time |
| `texts_sent` | integer | YES | 0 | SMS sent |
| `texts_received` | integer | YES | 0 | SMS received |
| `emails_sent` | integer | YES | 0 | Emails sent |
| `emails_opened` | integer | YES | 0 | Emails opened |
| `emails_replied` | integer | YES | 0 | Email replies |
| `mail_sent` | integer | YES | 0 | Direct mail sent |
| `mail_responses` | integer | YES | 0 | Mail responses |
| `leads_created` | integer | YES | 0 | New leads |
| `leads_contacted` | integer | YES | 0 | Leads contacted |
| `appointments_set` | integer | YES | 0 | Appointments |
| `offers_made` | integer | YES | 0 | Offers submitted |
| `contracts_signed` | integer | YES | 0 | Contracts signed |
| `deals_closed` | integer | YES | 0 | Deals closed |
| `deals_lost` | integer | YES | 0 | Deals lost |
| `revenue` | numeric | YES | 0 | Revenue earned |
| `expenses` | numeric | YES | 0 | Expenses incurred |
| `created_at` | timestamptz | YES | now() | Record creation |
| `updated_at` | timestamptz | YES | now() | Last update |

**Unique Constraint**: `(user_id, date)`

#### `analytics_events`
Granular event tracking.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | FK to user_profiles.id |
| `team_id` | uuid | YES | - | Team context |
| `event_type` | varchar(50) | NO | - | Event type identifier |
| `event_data` | jsonb | YES | '{}' | Event payload |
| `session_id` | uuid | YES | - | Session identifier |
| `created_at` | timestamptz | YES | now() | Event timestamp |

#### `analytics_team_daily`
Daily team-level metrics (aggregated).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `team_id` | uuid | NO | - | FK to teams.id |
| `date` | date | NO | - | Metric date |
| *(same metrics as analytics_daily)* | | | | |
| `created_at` | timestamptz | YES | now() | Record creation |
| `updated_at` | timestamptz | YES | now() | Last update |

**Unique Constraint**: `(team_id, date)`

### Automation Tables

#### `workflows`
Automated workflow definitions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | FK to user_profiles.id |
| `name` | varchar(255) | NO | - | Workflow name |
| `description` | text | YES | - | Workflow description |
| `trigger_type` | varchar(50) | NO | - | new_lead, stage_change, schedule, etc. |
| `trigger_config` | jsonb | NO | '{}' | Trigger configuration |
| `conditions` | jsonb | YES | '[]' | Condition rules |
| `actions` | jsonb | NO | '[]' | Action definitions |
| `is_active` | boolean | YES | true | Workflow enabled |
| `execution_count` | integer | YES | 0 | Times executed |
| `last_executed_at` | timestamptz | YES | - | Last execution time |
| `created_at` | timestamptz | YES | now() | Record creation |
| `updated_at` | timestamptz | YES | now() | Last update |

#### `workflow_executions`
Workflow execution history.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `workflow_id` | uuid | NO | - | FK to workflows.id |
| `trigger_data` | jsonb | NO | '{}' | Trigger event data |
| `status` | varchar(20) | NO | 'pending' | pending, running, completed, failed |
| `actions_completed` | integer | YES | 0 | Actions completed |
| `actions_total` | integer | YES | 0 | Total actions |
| `started_at` | timestamptz | YES | now() | Start time |
| `completed_at` | timestamptz | YES | - | Completion time |
| `error_message` | text | YES | - | Error details |
| `execution_log` | jsonb | YES | '[]' | Execution log |
| `created_at` | timestamptz | YES | now() | Record creation |

#### `tasks`
Task management system.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | FK to user_profiles.id |
| `title` | text | NO | - | Task title |
| `description` | text | YES | - | Task description |
| `status` | text | NO | 'pending' | pending, in_progress, completed, cancelled |
| `priority` | text | NO | 'medium' | low, medium, high, urgent |
| `due_date` | timestamptz | YES | - | Due date |
| `completed_at` | timestamptz | YES | - | Completion time |
| `lead_id` | uuid | YES | - | FK to leads.id |
| `deal_id` | uuid | YES | - | FK to deals.id |
| `property_id` | uuid | YES | - | FK to properties.id |
| `workflow_id` | uuid | YES | - | FK to workflows.id |
| `workflow_execution_id` | uuid | YES | - | FK to workflow_executions.id |
| `assigned_to` | uuid | YES | - | FK to user_profiles.id |
| `metadata` | jsonb | YES | '{}' | Additional data |
| `created_at` | timestamptz | YES | now() | Record creation |
| `updated_at` | timestamptz | YES | now() | Last update |

#### `activities`
Activity log/audit trail.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | FK to user_profiles.id |
| `entity_type` | varchar(50) | NO | - | deal, lead, property, etc. |
| `entity_id` | uuid | NO | - | Entity ID |
| `activity_type` | varchar(50) | NO | - | created, updated, deleted, etc. |
| `description` | text | YES | - | Activity description |
| `old_value` | jsonb | YES | - | Previous value |
| `new_value` | jsonb | YES | - | New value |
| `metadata` | jsonb | YES | '{}' | Additional data |
| `created_at` | timestamptz | YES | now() | Activity timestamp |

### Additional Tables

#### `valuations`
Property valuation records.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `property_id` | uuid | NO | - | FK to properties.id |
| `estimated_value` | numeric | YES | - | Estimated market value |
| `price_range_low` | numeric | YES | - | Low estimate |
| `price_range_high` | numeric | YES | - | High estimate |
| `rent_estimate` | numeric | YES | - | Monthly rent estimate |
| `rent_range_low` | numeric | YES | - | Low rent estimate |
| `rent_range_high` | numeric | YES | - | High rent estimate |
| `arv_estimate` | numeric | YES | - | After repair value |
| `equity_percent` | numeric | YES | - | Equity percentage |
| `equity_amount` | numeric | YES | - | Equity dollar amount |
| `valuation_date` | date | YES | - | Valuation date |
| `data_source` | varchar(100) | YES | - | Data provider |
| `created_at` | timestamptz | YES | now() | Record creation |
| `updated_at` | timestamptz | YES | now() | Last update |

#### `market_data`
Market statistics by geography.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `zip_code` | varchar(20) | NO | - | ZIP code |
| `city` | varchar(100) | YES | - | City name |
| `state` | varchar(50) | YES | - | State code |
| `county` | varchar(100) | YES | - | County name |
| `median_home_value` | numeric | YES | - | Median home value |
| `median_rent` | numeric | YES | - | Median rent |
| `price_per_sqft` | numeric | YES | - | Price per sq ft |
| `days_on_market` | integer | YES | - | Average DOM |
| `inventory_count` | integer | YES | - | Active listings |
| `sale_to_list_ratio` | numeric | YES | - | Sale/list ratio |
| `year_over_year_change` | numeric | YES | - | YoY price change |
| `data_date` | date | YES | - | Data as of date |
| `data_source` | varchar(100) | YES | - | Data provider |
| `created_at` | timestamptz | YES | now() | Record creation |
| `updated_at` | timestamptz | YES | now() | Last update |

#### `opt_outs`
Communication opt-out compliance.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | uuid | NO | gen_random_uuid() | Primary key |
| `user_id` | uuid | NO | - | FK to user_profiles.id |
| `phone` | varchar(50) | YES | - | Opted-out phone |
| `email` | varchar(255) | YES | - | Opted-out email |
| `channel` | varchar(20) | NO | - | sms, email, call, all |
| `reason` | text | YES | - | Opt-out reason |
| `source` | varchar(100) | YES | - | How opt-out received |
| `created_at` | timestamptz | YES | now() | Opt-out timestamp |

---

## Foreign Key Relationships

### Complete Foreign Key Map (64 Relationships)

| Table | Column | References | On Delete |
|-------|--------|------------|-----------|
| `activities` | user_id | user_profiles.id | CASCADE |
| `analytics_daily` | user_id | user_profiles.id | CASCADE |
| `analytics_events` | user_id | user_profiles.id | CASCADE |
| `analytics_team_daily` | team_id | teams.id | CASCADE |
| `buyer_preferences` | buyer_id | buyers.id | CASCADE |
| `buyer_transactions` | buyer_id | buyers.id | CASCADE |
| `buyers` | user_id | user_profiles.id | CASCADE |
| `campaigns` | deal_id | deals.id | SET NULL |
| `campaigns` | template_id | templates.id | SET NULL |
| `campaigns` | user_id | user_profiles.id | CASCADE |
| `deal_activities` | deal_id | deals.id | CASCADE |
| `deal_activities` | user_id | user_profiles.id | CASCADE |
| `deals` | assigned_buyer_id | buyers.id | SET NULL |
| `deals` | assigned_to | user_profiles.id | SET NULL |
| `deals` | property_id | properties.id | SET NULL |
| `deals` | user_id | user_profiles.id | CASCADE |
| `document_chunks` | document_id | documents.id | CASCADE |
| `embeddings` | chunk_id | document_chunks.id | CASCADE |
| `lead_contact_history` | lead_id | leads.id | CASCADE |
| `lead_contact_history` | user_id | user_profiles.id | CASCADE |
| `lead_list_items` | lead_id | leads.id | CASCADE |
| `lead_list_items` | list_id | lead_lists.id | CASCADE |
| `lead_list_members` | added_by | user_profiles.id | SET NULL |
| `lead_list_members` | lead_id | leads.id | CASCADE |
| `lead_list_members` | lead_list_id | lead_lists.id | CASCADE |
| `lead_lists` | user_id | user_profiles.id | CASCADE |
| `leads` | assigned_to | user_profiles.id | SET NULL |
| `leads` | property_id | properties.id | SET NULL |
| `leads` | user_id | user_profiles.id | CASCADE |
| `listings` | property_id | properties.id | CASCADE |
| `messages` | buyer_id | buyers.id | SET NULL |
| `messages` | deal_id | deals.id | SET NULL |
| `messages` | lead_id | leads.id | SET NULL |
| `messages` | user_id | user_profiles.id | CASCADE |
| `notifications` | user_id | user_profiles.id | CASCADE |
| `offer_strategies` | deal_id | deals.id | CASCADE |
| `offer_strategies` | user_id | user_profiles.id | CASCADE |
| `offers` | deal_id | deals.id | CASCADE |
| `opt_outs` | user_id | user_profiles.id | CASCADE |
| `sales_reports` | deal_id | deals.id | SET NULL |
| `sales_reports` | lead_id | leads.id | SET NULL |
| `sales_reports` | user_id | user_profiles.id | CASCADE |
| `saved_searches` | user_id | user_profiles.id | CASCADE |
| `scheduled_searches` | user_id | user_profiles.id | CASCADE |
| `search_history` | user_id | user_profiles.id | CASCADE |
| `search_performance` | user_id | user_profiles.id | CASCADE |
| `tasks` | assigned_to | user_profiles.id | SET NULL |
| `tasks` | deal_id | deals.id | SET NULL |
| `tasks` | lead_id | leads.id | SET NULL |
| `tasks` | property_id | properties.id | SET NULL |
| `tasks` | user_id | user_profiles.id | CASCADE |
| `tasks` | workflow_execution_id | workflow_executions.id | SET NULL |
| `tasks` | workflow_id | workflows.id | SET NULL |
| `team_invitations` | team_id | teams.id | CASCADE |
| `team_members` | invited_by | user_profiles.id | SET NULL |
| `team_members` | team_id | teams.id | CASCADE |
| `team_members` | user_id | user_profiles.id | CASCADE |
| `teams` | owner_id | user_profiles.id | CASCADE |
| `templates` | user_id | user_profiles.id | CASCADE |
| `user_preferences` | user_id | user_profiles.id | CASCADE |
| `user_profiles` | current_team_id | teams.id | SET NULL |
| `valuations` | property_id | properties.id | CASCADE |
| `workflow_executions` | workflow_id | workflows.id | CASCADE |
| `workflows` | user_id | user_profiles.id | CASCADE |

---

## Indexes

### Index Summary by Type

| Index Type | Count | Description |
|------------|-------|-------------|
| Primary Key (btree) | 41 | UUID primary keys on all tables |
| Foreign Key (btree) | ~60 | Indexes on FK columns |
| Composite (btree) | ~30 | Multi-column indexes |
| GIN (jsonb) | 5 | JSONB containment queries |
| GIN (trigram) | 1 | Fuzzy text search |
| HNSW (vector) | 1 | Vector similarity search |

### Notable Indexes

#### Vector Search Index
```sql
CREATE INDEX idx_embeddings_vector ON embeddings
USING hnsw (embedding vector_cosine_ops);
```
- **Purpose**: Fast cosine similarity search for RAG
- **Type**: HNSW (Hierarchical Navigable Small World)
- **Dimensions**: 1536 (OpenAI embeddings)

#### Trigram Text Search
```sql
CREATE INDEX idx_properties_address_gin ON properties
USING gin (address gin_trgm_ops);
```
- **Purpose**: Fuzzy address matching
- **Type**: GIN with pg_trgm

#### Composite Indexes (Performance Critical)

| Table | Index | Columns |
|-------|-------|---------|
| `analytics_daily` | idx_analytics_daily_user_date | (user_id, date) |
| `analytics_team_daily` | idx_analytics_team_daily_team_date | (team_id, date) |
| `deals` | idx_deals_user_stage | (user_id, stage) |
| `deals` | idx_deals_user_status | (user_id, status) |
| `leads` | idx_leads_user_status | (user_id, status) |
| `messages` | idx_messages_user_created | (user_id, created_at) |
| `search_history` | idx_search_history_user_created | (user_id, created_at) |
| `tasks` | idx_tasks_user_status | (user_id, status) |
| `tasks` | idx_tasks_user_due | (user_id, due_date) |

---

## Row Level Security Policies

### RLS Status
**All 41 tables have RLS enabled.**

### Policy Patterns

#### Pattern 1: User Ownership
Most tables use this pattern - users can only access their own data:

```sql
-- SELECT policy
CREATE POLICY "Users can view own records" ON table_name
FOR SELECT USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "Users can insert own records" ON table_name
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "Users can update own records" ON table_name
FOR UPDATE USING (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY "Users can delete own records" ON table_name
FOR DELETE USING (auth.uid() = user_id);
```

**Tables using this pattern**: activities, analytics_daily, analytics_events, buyers, buyer_preferences, buyer_transactions, campaigns, deals, deal_activities, leads, lead_lists, messages, notifications, offers, offer_strategies, opt_outs, sales_reports, saved_searches, scheduled_searches, search_history, search_performance, tasks, templates, user_preferences, valuations, workflows, workflow_executions

#### Pattern 2: Team Membership
Team-related tables check team membership:

```sql
CREATE POLICY "Team members can view team data" ON team_members
FOR SELECT USING (
  auth.uid() IN (
    SELECT user_id FROM team_members
    WHERE team_id = team_members.team_id
  )
);
```

**Tables using this pattern**: teams, team_members, team_invitations, analytics_team_daily

#### Pattern 3: Public Read Access
Some reference tables allow public read:

```sql
CREATE POLICY "Anyone can view documents" ON documents
FOR SELECT USING (is_active = true);
```

**Tables using this pattern**: documents, document_chunks, embeddings, market_data, properties

#### Pattern 4: Cascading Access
Child tables inherit access from parent:

```sql
CREATE POLICY "Users can view buyer preferences" ON buyer_preferences
FOR SELECT USING (
  buyer_id IN (SELECT id FROM buyers WHERE user_id = auth.uid())
);
```

### Policy Count by Table

| Table | SELECT | INSERT | UPDATE | DELETE | Total |
|-------|--------|--------|--------|--------|-------|
| Most user tables | 1 | 1 | 1 | 1 | 4 |
| Team tables | 2-3 | 1 | 1 | 1 | 5-6 |
| Public tables | 1 | 0 | 0 | 0 | 1 |

**Total RLS Policies**: 103

---

## Functions

### Custom Application Functions

#### Analytics Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `get_activity_kpis` | user_id, start_date, end_date | TABLE | Search, view, save metrics |
| `get_buyer_statistics` | user_id | TABLE | Buyer counts by tier/type |
| `get_communication_stats` | user_id, start_date, end_date | TABLE | Message stats by channel |
| `get_dashboard_summary` | user_id, days | TABLE | Dashboard with trends |
| `get_deal_statistics` | user_id, start_date, end_date | TABLE | Deal counts and revenue |
| `get_financial_kpis` | user_id, start_date, end_date | TABLE | Revenue, expenses, ROI |
| `get_outreach_kpis` | user_id, start_date, end_date | TABLE | Calls, texts, emails |
| `get_pipeline_kpis` | user_id, start_date, end_date | TABLE | Lead-to-close funnel |
| `get_search_statistics` | user_id, days | TABLE | Search analytics |

#### Utility Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `update_updated_at_column` | - | TRIGGER | Auto-update timestamps |
| `upsert_daily_analytics` | user_id, date, field, increment | void | Upsert analytics data |
| `match_documents` | query_embedding, match_count | TABLE | Vector similarity search |
| `search_properties` | criteria | TABLE | Property search |

### Function Example: Dashboard Summary

```sql
CREATE OR REPLACE FUNCTION get_dashboard_summary(
  p_user_id UUID,
  p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_leads BIGINT,
  total_deals BIGINT,
  total_revenue NUMERIC,
  leads_trend NUMERIC,
  deals_trend NUMERIC,
  revenue_trend NUMERIC
) AS $$
BEGIN
  -- Returns current period metrics with comparison to previous period
  ...
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## Triggers

### Automatic Timestamp Updates

All tables with `updated_at` columns have triggers to auto-update on modification:

```sql
CREATE TRIGGER update_[table]_updated_at
  BEFORE UPDATE ON [table]
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### Tables with `updated_at` Triggers (21)

| Table | Trigger Name |
|-------|--------------|
| analytics_daily | update_analytics_daily_updated_at |
| analytics_team_daily | update_analytics_team_daily_updated_at |
| buyer_preferences | update_buyer_preferences_updated_at |
| buyers | update_buyers_updated_at |
| campaigns | update_campaigns_updated_at |
| deals | update_deals_updated_at |
| documents | update_documents_updated_at |
| lead_lists | update_lead_lists_updated_at |
| leads | update_leads_updated_at |
| market_data | update_market_data_updated_at |
| properties | update_properties_updated_at |
| saved_searches | update_saved_searches_updated_at |
| scheduled_searches | update_scheduled_searches_updated_at |
| tasks | update_tasks_updated_at |
| team_members | update_team_members_updated_at |
| teams | update_teams_updated_at |
| templates | update_templates_updated_at |
| user_preferences | update_user_preferences_updated_at |
| user_profiles | update_user_profiles_updated_at |
| valuations | update_valuations_updated_at |
| workflows | update_workflows_updated_at |

---

## Check Constraints

### Status/Stage Validation

The schema uses CHECK constraints instead of ENUMs for flexibility:

#### Deal Stages
```sql
CHECK (stage IN ('lead', 'contacted', 'negotiating', 'under_contract', 'closed', 'lost'))
```

#### Deal Status
```sql
CHECK (status IN ('active', 'on_hold', 'closed', 'cancelled'))
```

#### Lead Status
```sql
CHECK (status IN ('new', 'contacted', 'qualified', 'negotiating', 'converted', 'dead'))
```

#### Task Priority
```sql
CHECK (priority IN ('low', 'medium', 'high', 'urgent'))
```

#### Message Channel
```sql
CHECK (channel IN ('sms', 'email', 'call', 'mail'))
```

#### Team Member Role
```sql
CHECK (role IN ('owner', 'admin', 'member'))
```

---

## Migration Discrepancies

### Migrations Not Applied to Live Database

The following migration files exist but their tables are **NOT present** in the live database:

| Migration File | Tables Defined | Status |
|----------------|----------------|--------|
| 20251203000013_analytics_phase11_heat_maps.sql | heat_map_cache, user_heat_map_data | ❌ Not Applied |
| 20251203000014_analytics_phase11_success_profiles.sql | user_success_profiles | ❌ Not Applied |
| 20251203000015_analytics_phase11_recommendations.sql | recommendation_interactions, pending_recommendations | ❌ Not Applied |
| 20251203000016_analytics_phase11_user_tasks.sql | user_tasks | ❌ Not Applied |
| 20251203000017_shovels_integration.sql | shovels_permits, shovels_address_metrics | ❌ Not Applied |
| 20251203000018_shovels_geo_vitality.sql | geo_vitality_scores, shovels_contractors, user_verticals | ❌ Not Applied |

### Missing Tables (11 total)
- heat_map_cache
- user_heat_map_data
- user_success_profiles
- recommendation_interactions
- pending_recommendations
- user_tasks
- shovels_permits
- shovels_address_metrics
- geo_vitality_scores
- shovels_contractors
- user_verticals

### Recommendation
Run pending migrations to sync the database with the migration files:
```bash
supabase db push
# or
supabase migration up
```

---

## Schema Recommendations

### Strengths ✅

1. **Consistent UUID Primary Keys**: All tables use `gen_random_uuid()` for PKs
2. **Comprehensive RLS**: All 41 tables have Row Level Security enabled
3. **Automatic Timestamps**: 21 tables have `updated_at` triggers
4. **Vector Search Ready**: HNSW index on embeddings for AI/RAG features
5. **Flexible JSONB Usage**: Metadata, preferences, and criteria stored as JSONB
6. **Good Indexing Strategy**: Composite indexes on frequently queried columns
7. **Proper Foreign Keys**: 64 FK relationships with appropriate ON DELETE actions
8. **Trigram Search**: GIN index on properties.address for fuzzy matching

### Potential Improvements 🔧

1. **Missing `updated_at` on Some Tables**
   - Tables without `updated_at`: activities, analytics_events, deal_activities, document_chunks, embeddings, lead_contact_history, lead_list_items, lead_list_members, listings, messages, notifications, offers, opt_outs, search_history, team_invitations, workflow_executions
   - **Recommendation**: Add `updated_at` columns and triggers for audit trail

2. **No Soft Delete Capability**
   - No `deleted_at` or `is_deleted` columns
   - **Recommendation**: Add soft delete for compliance and data recovery

3. **Missing Audit Logging**
   - The `activities` table exists but isn't automatically populated
   - **Recommendation**: Add triggers to auto-log changes to sensitive tables

4. **Circular FK Reference**
   - `user_profiles.current_team_id` → `teams.id`
   - `teams.owner_id` → `user_profiles.id`
   - **Note**: This is intentional but requires careful handling during inserts

5. **Consider Partitioning**
   - High-volume tables (analytics_events, messages, search_history) could benefit from time-based partitioning
   - **Recommendation**: Partition by month for tables with >1M rows

6. **Index Optimization**
   - Some JSONB columns lack GIN indexes
   - **Recommendation**: Add GIN indexes on frequently queried JSONB columns

### Missing Standard Features Checklist

- [x] Created timestamps on all tables
- [ ] Updated timestamps on all tables (partial - 21/41)
- [ ] Soft delete capability
- [ ] Automatic audit logging
- [x] Full-text search indexes (trigram on address)
- [x] Vector search indexes (HNSW on embeddings)
- [ ] Table partitioning for high-volume tables
- [x] Row Level Security on all tables

---

## Table Dependency Order

For migrations, seeding, or data imports, use this order:

### Level 0 (No Dependencies)
- documents
- market_data
- properties

### Level 1 (Depends on Level 0)
- user_profiles (references auth.users)
- document_chunks → documents
- listings → properties
- valuations → properties

### Level 2 (Depends on Level 1)
- teams → user_profiles
- user_preferences → user_profiles
- buyers → user_profiles
- templates → user_profiles
- embeddings → document_chunks

### Level 3 (Depends on Level 2)
- team_members → teams, user_profiles
- team_invitations → teams
- analytics_team_daily → teams
- buyer_preferences → buyers
- buyer_transactions → buyers
- leads → user_profiles, properties
- deals → user_profiles, properties, buyers
- workflows → user_profiles

### Level 4 (Depends on Level 3)
- lead_lists → user_profiles
- lead_contact_history → leads, user_profiles
- deal_activities → deals, user_profiles
- offers → deals
- offer_strategies → deals, user_profiles
- messages → user_profiles, deals, buyers, leads
- campaigns → user_profiles, deals, templates
- tasks → user_profiles, leads, deals, properties, workflows
- workflow_executions → workflows

### Level 5 (Depends on Level 4)
- lead_list_items → lead_lists, leads
- lead_list_members → lead_lists, leads, user_profiles
- sales_reports → user_profiles, deals, leads

### Independent Tables (User-scoped, no cross-table FKs)
- activities
- analytics_daily
- analytics_events
- notifications
- opt_outs
- saved_searches
- scheduled_searches
- search_history
- search_performance

---

*Document generated from live Supabase database on December 4, 2025*


