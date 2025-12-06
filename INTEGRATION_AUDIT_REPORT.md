# Full-Stack Integration & Communication Audit Report

**Generated:** December 5, 2025 (8:30pm)
**Project:** RE AI Wholesaling Platform (cuddly-bassoon)
**Purpose:** Foundation for comprehensive test suite creation

---

## Executive Summary

This audit provides a complete inventory of the full-stack integration points, communication patterns, and system architecture. The project is a Next.js 14+ application with Supabase backend, multiple external API integrations, and an AI-powered tool system.

### Key Metrics

| Category | Count | Status |
|----------|-------|--------|
| **AI Tools (Implementation)** | 203 | Verified |
| **AI Tools (Discovery/UI)** | 64 | Verified |
| **API Endpoints** | 87 | Verified |
| **Database Tables** | 50+ | Verified |
| **Database Migrations** | 32 | Verified |
| **External Integrations** | 9 | Verified |
| **Tool Categories** | 29 | Verified |

**Note:** The expected 253 tools was based on combined implementation (203) + discovery registry (64) = 267 total definitions, though discovery entries map to implementation tools.

---

## Section 1: AI Tool Repository

### 1.1 Implementation Tools (203 Total)

Located in: `src/lib/ai/tools/categories/`

| Category File | Tool Count | Primary Purpose |
|--------------|------------|-----------------|
| `heat-mapping.ts` | 14 | Vitality scoring, heat map rendering, opportunity zones |
| `buyer-management.ts` | 13 | Buyer matching, activity analysis, insights |
| `property-detail-tools.ts` | 13 | Detailed property analysis, valuation, comps |
| `crm-tools.ts` | 12 | Lead management, list operations, scoring |
| `dashboard-analytics.ts` | 12 | Funnel analysis, insights, reporting |
| `deal-pipeline.ts` | 12 | Deal creation, stage management, outcome prediction |
| `filter-tools.ts` | 11 | Filter suggestions, property targeting |
| `market-analysis.ts` | 10 | Market trends, price forecasting, velocity |
| `notification-tools.ts` | 10 | SMS, email, drip campaigns |
| `search-tools.ts` | 10 | Property search, filtering, suggestions |
| `skip-trace-tools.ts` | 10 | Contact lookup, bulk operations |
| `market-velocity-tools.ts` | 8 | Market speed analysis |
| `permit-tools.ts` | 8 | Permit history, pattern analysis |
| `predictive-tools.ts` | 7 | Deal success, offer suggestions, lead scoring |
| `map-tools.ts` | 6 | Geographic comparison, commute analysis |
| `census-geography-tools.ts` | 5 | Micro-territory analysis |
| `contractor-tools.ts` | 5 | Contractor search and comparison |
| `batch-tools.ts` | 4 | Bulk skip trace, list operations |
| `utility-tools.ts` | 4 | General utilities |
| `vertical-tools.ts` | 4 | Vertical specialization |
| `advanced-search-tools.ts` | 3 | Complex property search |
| `automation-tools.ts` | 3 | Workflow automation |
| `communication-tools.ts` | 3 | Outreach messaging |
| `deal-analysis.ts` | 3 | Deal evaluation |
| `document-tools.ts` | 3 | Document generation |
| `intelligence-tools.ts` | 3 | Competitor analysis |
| `portfolio-tools.ts` | 3 | Portfolio management |
| `integration-tools.ts` | 2 | CRM/system integration |
| `property-search.ts` | 2 | Basic property search |

### 1.2 Discovery Registry (64 Tools, 13 Categories)

Located in: `src/lib/ai/tool-discovery/registry.ts`

| Category | Count | Tools |
|----------|-------|-------|
| deal-analysis | 10 | Deal evaluation, MAO calculation, scoring |
| market-research | 10 | Market trends, valuation, neighborhood analysis |
| property-search | 7 | Search, filtering, similarity matching |
| buyer-intelligence | 6 | Buyer matching, insights, activity analysis |
| outreach | 5 | SMS, email, talking points generation |
| pipeline | 5 | Deal management, activity tracking |
| list-management | 5 | List creation, lead scoring, note management |
| documents | 4 | Offer letters, deal summaries |
| valuation | 3 | Comps, ARV, repair estimates |
| skip-tracing | 3 | Contact lookup, batch operations |
| automation | 3 | Workflows, alerts, drip campaigns |
| help | 2 | Filter explanations, platform guidance |
| settings | 1 | CRM export, integrations |

### 1.3 Tool Definition Structure

**Implementation Tools** (`ToolDefinition<I, O>`):
```typescript
{
  id: string;              // 'category.function_name'
  name: string;            // Display name
  description: string;     // What the tool does
  category: string;        // Functional category
  requiredPermission: 'read' | 'write' | 'execute';
  inputSchema: ZodSchema;  // Input validation
  outputSchema: ZodSchema; // Output validation
  requiresConfirmation: boolean;
  estimatedDuration?: number;
  rateLimit?: number;
  tags: string[];
}
```

**Discovery Tools** (`DiscoveryToolDefinition`):
```typescript
{
  slug: string;            // 'namespace.function'
  displayName: string;
  shortDescription: string;
  fullDescription: string;
  category: string;
  examples: { prompt: string; description: string }[];
  keywords: string[];
  isPrimary: boolean;
  isAdvanced: boolean;
  requiresContext: 'property' | 'deal' | 'buyer' | 'list' | 'none';
}
```

### 1.4 Known Issues

**CRITICAL - Duplicate Tool Definition:**
- File: `src/lib/ai/tool-discovery/registry.ts`
- Slug `market_velocity.get_velocity` appears twice (lines ~268 and ~978)
- Impact: Creates ambiguity in tool selection
- **Testing Implication:** Tests must verify unique slug enforcement

---

## Section 2: API Endpoints (87 Routes)

### 2.1 API Route Summary by Domain

| Domain | Endpoints | Auth Required | External Services |
|--------|-----------|---------------|-------------------|
| Buyers | 11 | Yes | SendGrid, Twilio |
| Deals | 9 | Yes | None |
| Leads | 6 | Yes | None |
| Properties | 2 | Yes | AI Models |
| RentCast | 6 | No | RentCast API |
| RAG | 5 | Rate Limited | AI/Embeddings |
| AI | 4 | Optional | xAI Grok |
| Campaigns | 6 | Yes | SendGrid, Twilio |
| Communication | 4 | Yes | SendGrid, Twilio |
| Inbox | 5 | Yes | None |
| Workflows | 6 | Yes | Various |
| Analytics | 12 | Yes | Shovels, RentCast |
| Market Velocity | 6 | No | Shovels API |
| Shovels | 3 | Yes | Shovels API |
| User/Teams | 5 | Yes | Email service |
| Search | 1 | Yes | None |
| Recommendations | 1 | Yes | AI engine |
| Templates | 4 | Yes | None |
| Lead Lists | 2 | Yes | None |
| Misc | 9 | Various | Census, AI |

### 2.2 Critical API Endpoints for Testing

#### High-Priority (Data Mutation + External)

| Endpoint | Method | Priority | Reason |
|----------|--------|----------|--------|
| `/api/deals` | POST | Critical | Creates deal records |
| `/api/deals/[id]/strategy` | POST | Critical | Financial calculations |
| `/api/leads` | POST | Critical | Creates lead records |
| `/api/buyers/[id]/messages` | POST | Critical | External messaging |
| `/api/email/send` | POST | Critical | SendGrid integration |
| `/api/sms/send` | POST | Critical | Twilio integration |
| `/api/campaigns/[id]/start` | POST | Critical | Campaign execution |
| `/api/workflows/[id]/execute` | POST | Critical | Workflow execution |
| `/api/ai/chat` | POST | Critical | AI tool execution |
| `/api/properties/[id]/motivation` | GET | Critical | AI scoring |

#### Medium-Priority (External API Integration)

| Endpoint | Method | Priority | Reason |
|----------|--------|----------|--------|
| `/api/rentcast/properties` | GET | High | External API + caching |
| `/api/rentcast/properties/[id]/valuation` | GET | High | AVM calculations |
| `/api/shovels/permits` | GET | High | External API |
| `/api/shovels/vitality` | GET | High | Vitality scoring |
| `/api/market-velocity/*` | GET | High | Market analytics |
| `/api/rag/ask` | POST | High | RAG streaming |

### 2.3 Webhook Endpoints

| Endpoint | Provider | Events |
|----------|----------|--------|
| `/api/webhooks/twilio` | Twilio | Inbound SMS, status callbacks |
| `/api/webhooks/sendgrid` | SendGrid | Delivery, opens, clicks, bounces |

**Testing Implications:**
- Must mock webhook signatures
- Test event type handling
- Verify database updates on events
- Test opt-out detection

---

## Section 3: External Service Integrations

### 3.1 Integration Matrix

| Service | Location | Auth Method | Rate Limiting | Caching |
|---------|----------|-------------|---------------|---------|
| **RentCast** | `src/lib/rentcast/` | API Key | Sliding window | Redis (15min-7day) |
| **Shovels** | `src/lib/shovels/` | API Key | 5 req/sec | Redis (1hr-30day) |
| **Supabase** | `src/lib/supabase/` | JWT + API Key | N/A | N/A |
| **Twilio** | `src/lib/communication/twilio.ts` | Account SID + Token | 1/sec | N/A |
| **SendGrid** | `src/lib/communication/sendgrid.ts` | API Key | N/A | N/A |
| **xAI Grok** | `src/lib/rag/generator.ts` | API Key | Exponential backoff | N/A |
| **OpenAI** | `src/lib/rag/embedder.ts` | API Key | Batch (20) | N/A |
| **Mapbox** | `src/lib/map/` | Token | N/A | N/A |
| **Census Bureau** | `src/lib/census/` | None | Batch (5) + delay | N/A |

### 3.2 RentCast Integration Details

**Client:** `src/lib/rentcast/client.ts`
**Base URL:** `https://api.rentcast.io/v1`

**Methods:**
- `searchProperties()` - Property search with filters
- `getProperty()` - Property details by ID
- `getValuation()` - AVM for address
- `getRentEstimate()` - Rent estimates
- `getMarketData()` - Market statistics by zip
- `getListings()` - Property listings search
- `getListing()` - Listing details

**Error Classes:**
- `RentCastApiError`
- `RentCastAuthenticationError`
- `RentCastRateLimitError`
- `RentCastNotFoundError`
- `RentCastValidationError`
- `RentCastNetworkError`

**Rate Limits:**
- `/properties`: 100/min
- `/avm`: 50/min
- `/markets`: 100/min
- `/listings`: 100/min

**Cache TTLs:**
- Property search: 15 minutes
- Property details: 24 hours
- Valuations: 7 days
- Rent estimates: 7 days
- Market data: 24 hours
- Listings: 1 hour (active), 7 days (sold)

### 3.3 Shovels Integration Details

**Client:** `src/lib/shovels/client.ts`
**Base URL:** `https://api.shovels.ai/v2`

**Methods:**
- `searchPermits()` - Search permits with filters
- `getPermitsByIds()` - Fetch permits by IDs
- `getPermitsForAddress()` - Get all permits for address
- `searchCities()` - Search cities
- `getCityMetrics()` - City-level metrics
- `getCountyMetrics()` - County-level metrics
- `searchAddresses()` - Search addresses
- `getAddressMetrics()` - Address metrics
- `searchContractors()` - Search contractors
- `getContractorById()` - Contractor details
- `getContractorPermits()` - Permits for contractor

**Error Classes:**
- `ShovelsApiError`
- `ShovelsAuthenticationError`
- `ShovelsRateLimitError`
- `ShovelsNotFoundError`
- `ShovelsValidationError`
- `ShovelsNetworkError`
- `ShovelsQuotaExceededError`

**Rate Limits:** 5 requests/second (configurable)

**Cache TTLs:**
- Permits: 30 days
- Permit search: 1 hour
- Address metrics: 1 day
- Geographic metrics: 1 day
- Vitality scores: 1 day
- Contractors: 7 days

### 3.4 Communication Services

#### Twilio
**Client:** `src/lib/communication/twilio.ts`

**Methods:**
- `sendSMS()` - Send SMS (max 1600 chars)
- `validateTwilioSignature()` - Webhook validation
- `parseInboundSMS()` - Parse webhooks
- `isOptOutMessage()` - Detect STOP keywords
- `isHelpMessage()` - Detect help requests

**Testing Requirements:**
- Mock SMS sending
- Test signature validation
- Test opt-out detection (STOP, UNSUBSCRIBE, etc.)
- Test TwiML response generation
- Verify E.164 phone formatting

#### SendGrid
**Client:** `src/lib/communication/sendgrid.ts`

**Methods:**
- `sendEmail()` - Send single email
- `sendBatchEmail()` - Send up to 1000 emails
- `validateSendGridSignature()` - Webhook validation
- `parseSendGridWebhook()` - Parse events

**Testing Requirements:**
- Mock email sending
- Test batch limits
- Test webhook event parsing
- Verify HTML/text formatting
- Test attachment handling

---

## Section 4: Database Schema (50+ Tables)

### 4.1 Core Tables

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `properties` | Main property data | valuations, listings, deals, leads |
| `valuations` | Property valuations | FK: property_id |
| `listings` | MLS listing data | FK: property_id |
| `market_data` | Market statistics | None |
| `user_profiles` | User accounts | FK: auth.users |
| `teams` | Team management | FK: owner_id → auth.users |
| `team_members` | Team membership | FK: team_id, user_id |

### 4.2 CRM Tables

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `leads` | Lead tracking | FK: user_id, property_id |
| `lead_lists` | Lead list management | FK: user_id |
| `lead_list_items` | List membership | FK: list_id, lead_id |
| `lead_contact_history` | Contact log | FK: lead_id, user_id |
| `buyers` | Buyer management | FK: user_id |
| `buyer_preferences` | Buyer criteria | FK: buyer_id |
| `buyer_transactions` | Transaction history | FK: buyer_id |

### 4.3 Deal Pipeline Tables

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `deals` | Deal tracking | FK: user_id, property_id, buyer_id |
| `deal_activities` | Activity log | FK: deal_id, user_id |
| `offers` | Offer tracking | FK: deal_id |
| `offer_strategies` | Pricing strategies | FK: deal_id, user_id |

### 4.4 Communication Tables

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `messages` | Message history | FK: user_id, deal_id, buyer_id |
| `templates` | Message templates | FK: user_id |

### 4.5 RAG & Knowledge Tables

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `documents` | Knowledge docs | None |
| `document_chunks` | Chunked content | FK: document_id |
| `embeddings` | Vector storage | FK: chunk_id |
| `historical_deals` | Deal history | None |
| `historical_deal_embeddings` | Deal vectors | FK: deal_id |

### 4.6 Seller Motivation Tables

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `owner_classifications` | Owner type cache | FK: property_id |
| `motivation_scores` | Scoring results | FK: property_id, owner_classification_id |
| `property_signals` | Raw signal cache | FK: property_id |
| `distress_indicators` | Distress signals | FK: property_id |

### 4.7 Market Velocity Tables

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `market_velocity_index` | Zip-level velocity | None (unique: zip_code) |
| `market_velocity_history` | Trend tracking | None |
| `market_velocity_aggregates` | City/county level | None |
| `tracked_zip_codes` | Active tracking | None |

### 4.8 Shovels Integration Tables

| Table | Purpose | Key Relationships |
|-------|---------|-------------------|
| `shovels_permits` | Permit data | None |
| `shovels_address_metrics` | Address aggregates | None |
| `shovels_contractors` | Contractor data | None |
| `geo_vitality_scores` | Geographic vitality | None |

---

## Section 5: Data Flow Patterns

### 5.1 Property Search Flow

```
User Query
    ↓
Frontend (FilterSidebar) → API (/api/search)
    ↓
Search Service
    ↓
┌────────────────┬─────────────────┐
│ RentCast API   │ Supabase        │
│ (properties)   │ (cached props)  │
└────────────────┴─────────────────┘
    ↓
Response Transformation
    ↓
Frontend (PropertyCard rendering)
```

### 5.2 Deal Creation Flow

```
User Action (Create Deal)
    ↓
API (/api/deals POST)
    ↓
DealService.createDeal()
    ↓
┌────────────────┬─────────────────┬─────────────────┐
│ Insert Deal    │ Log Activity    │ Fetch Property  │
│ (deals table)  │ (deal_activities)│ (if property_id)│
└────────────────┴─────────────────┴─────────────────┘
    ↓
Response (Created Deal)
```

### 5.3 Seller Motivation Scoring Flow

```
Request (property_id or address)
    ↓
API (/api/properties/[id]/motivation)
    ↓
calculateSellerMotivation()
    ↓
┌─────────────────────────────────────────────────┐
│ 1. Fetch Property Signals (parallel)            │
│    - RentCast (owner, valuation)                │
│    - Shovels (permits, address metrics)         │
│    - Supabase (cached data, distress indicators)│
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│ 2. Classify Owner                               │
│    - Pattern matching on owner name             │
│    - Determine primary/sub class                │
│    - Cache classification                       │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│ 3. Calculate Score (stratified by owner type)   │
│    - Individual: ownership length = HIGH motive │
│    - Investor: ownership length = LOW motive    │
│    - Institutional: process-focused scoring     │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│ 4. Optional: DealFlow IQ (AI enhancement)       │
│    - xAI Grok analysis                          │
│    - AI adjustments                             │
│    - Predictions                                │
└─────────────────────────────────────────────────┘
    ↓
Response (ScoringResult)
```

### 5.4 AI Chat with Tools Flow

```
User Message
    ↓
API (/api/ai/chat POST)
    ↓
xAI Grok (with tool definitions)
    ↓
┌─────────────────────────────────────────────────┐
│ Tool Execution Loop                             │
│ 1. Model requests tool call                     │
│ 2. ToolExecutor validates input                 │
│ 3. Handler executes tool                        │
│ 4. Result returned to model                     │
│ 5. Repeat until done                            │
└─────────────────────────────────────────────────┘
    ↓
Streaming Response
```

### 5.5 RAG Query Flow

```
User Query
    ↓
API (/api/rag/ask POST)
    ↓
┌─────────────────────────────────────────────────┐
│ 1. Query Classification (xAI Grok Fast)         │
│    - Determine intent                           │
│    - Extract category filters                   │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│ 2. Generate Query Embedding (OpenAI)            │
│    - text-embedding-3-small                     │
│    - 1536 dimensions                            │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│ 3. Vector Similarity Search (Supabase)          │
│    - Query embeddings table                     │
│    - Filter by category if applicable           │
│    - Return top-k chunks                        │
└─────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────┐
│ 4. Generate Response (xAI Grok)                 │
│    - Context from retrieved chunks              │
│    - Streaming response                         │
└─────────────────────────────────────────────────┘
    ↓
SSE Streaming Response
```

---

## Section 6: Authentication & Authorization

### 6.1 Authentication Pattern

All authenticated endpoints follow this pattern:

```typescript
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();

if (!user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

### 6.2 Data Isolation

All queries include user_id checks:

```typescript
.from('table_name')
.select('*')
.eq('user_id', user.id)  // Always scoped to user
```

### 6.3 RLS Policies

Row Level Security enabled on all tables with policies enforcing:
- Users can only access their own data
- Team members can access team data based on roles
- Admins can manage team members
- Service role has full access for system operations

### 6.4 Permission Levels (Tools)

| Permission | Description | Example Tools |
|------------|-------------|---------------|
| `read` | Read-only operations | Property search, market data |
| `write` | Create/update records | Create lead, update deal |
| `execute` | Trigger external actions | Send SMS, execute workflow |

---

## Section 7: Error Handling Patterns

### 7.1 API Error Response Format

```typescript
{
  error: string;           // Error message
  code?: string;           // Error code (optional)
  details?: unknown;       // Additional context (optional)
}
```

### 7.2 HTTP Status Codes Used

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | Success | Successful requests |
| 201 | Created | Resource creation |
| 400 | Bad Request | Validation errors |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected errors |

### 7.3 External API Error Handling

All external integrations have:
- Custom error classes extending `Error`
- HTTP status code mapping
- Request ID tracking
- `isRetryable` flag for retry logic
- Timeout handling via AbortController

### 7.4 Retry Strategy

```
Attempt 1 → Failure
    ↓
Wait 1 second
    ↓
Attempt 2 → Failure
    ↓
Wait 2 seconds (exponential backoff)
    ↓
Attempt 3 → Failure
    ↓
Throw final error
```

---

## Section 8: Caching Strategy

### 8.1 Redis Cache Configuration

**Provider:** Upstash Redis (REST API)

**Cache Prefixes:**
- `property:` - Property data
- `buyer:` - Buyer information
- `deal:` - Deal data
- `user:` - User data
- `search:` - Search results
- `api:` - API responses
- `session:` - Session data
- `rag:query:` - RAG query cache
- `rag:embed:` - Embedding cache
- `rag:rate:` - RAG rate limiting

**TTL Tiers:**
- SHORT: 15 minutes
- MEDIUM: 30 minutes
- LONG: 60 minutes
- EXTENDED: 24 hours

### 8.2 Cache Invalidation Points

| Event | Cache Keys Invalidated |
|-------|------------------------|
| Property update | `property:{id}`, `search:*` |
| Deal stage change | `deal:{id}`, `analytics:*` |
| New message sent | `inbox:{userId}` |
| Market data refresh | `api:rentcast:market:*` |

---

## Section 9: Testing Recommendations

### 9.1 Unit Tests Required

| Area | Priority | Count Estimate |
|------|----------|----------------|
| Tool Input Validation | Critical | 203 tests |
| Tool Output Validation | Critical | 203 tests |
| Service Layer Methods | High | ~150 tests |
| Utility Functions | Medium | ~50 tests |
| Error Class Behavior | Medium | ~30 tests |

### 9.2 Integration Tests Required

| Area | Priority | Count Estimate |
|------|----------|----------------|
| API Endpoint Handlers | Critical | 87 tests |
| Database Operations | Critical | ~100 tests |
| External API Mocking | High | ~50 tests |
| Webhook Handlers | High | ~10 tests |
| Cache Operations | Medium | ~20 tests |

### 9.3 E2E Tests Required

| Flow | Priority | Test Scenarios |
|------|----------|----------------|
| Deal Creation → Close | Critical | 5 |
| Lead → Contact → Qualify | Critical | 5 |
| Property Search → Save | High | 3 |
| Campaign Creation → Send | High | 4 |
| AI Chat with Tools | High | 10 |
| RAG Query → Response | High | 5 |

### 9.4 Mock Requirements

| Service | Mock Strategy |
|---------|---------------|
| RentCast | HTTP interceptor with fixture data |
| Shovels | HTTP interceptor with fixture data |
| Twilio | Mock client with success/failure states |
| SendGrid | Mock client with event simulation |
| xAI Grok | Mock responses for tool selection |
| OpenAI | Mock embedding responses |
| Supabase | Test database or mock client |

### 9.5 Test Data Fixtures Needed

| Entity | Fixture Count |
|--------|---------------|
| Properties | 50 (various types, conditions) |
| Buyers | 20 (different tiers, preferences) |
| Deals | 30 (all stages) |
| Leads | 40 (all statuses) |
| Market Data | 10 zip codes |
| Permits | 100 (various types) |
| Messages | 50 (SMS + Email) |

---

## Section 10: Critical Integration Points for Testing

### 10.1 High-Risk Integration Points

| Integration | Risk Level | Reason |
|-------------|------------|--------|
| Seller Motivation → Multiple APIs | Critical | Parallel API calls, complex scoring |
| AI Chat → Tool Execution | Critical | Dynamic tool selection, state management |
| Campaign → Messaging | Critical | External sends, rate limits |
| Market Velocity → Shovels | High | Data aggregation, caching |
| Deal Pipeline → Multiple Services | High | State transitions, notifications |
| RAG → Vector Search | High | Embedding generation, similarity |

### 10.2 Data Consistency Points

| Operation | Tables Affected | Consistency Requirement |
|-----------|-----------------|------------------------|
| Deal stage change | deals, deal_activities | Activity logged on every change |
| Lead status update | leads, lead_contact_history | History preserved |
| Message send | messages | External ID stored |
| Campaign start | campaigns, messages | Batch creation |

### 10.3 Rate Limit Testing

| Service | Limit | Test Scenario |
|---------|-------|---------------|
| RentCast | 100/min | Burst 100 requests |
| Shovels | 5/sec | Rapid sequential calls |
| Twilio | 1/sec | Message queue overflow |
| RAG | Per-IP | Multiple concurrent users |

---

## Section 11: Environment Variables

### 11.1 Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=

# Redis
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

### 11.2 Optional External APIs

```env
# Property Data
RENTCAST_API_KEY=
SHOVELS_API_KEY=
SHOVELS_API_BASE_URL=

# AI/LLM
XAI_API_KEY=
OPENAI_API_KEY=

# Communication
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
SENDGRID_FROM_NAME=

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN=

# Application
NEXT_PUBLIC_APP_URL=
NODE_ENV=
```

---

## Section 12: Summary & Next Steps

### 12.1 Audit Summary

This comprehensive audit has documented:

1. **203 AI tools** across 29 categories with full type definitions
2. **87 API endpoints** with authentication and integration details
3. **50+ database tables** with relationships and indexes
4. **9 external service integrations** with error handling and caching
5. **Complete data flow patterns** for all major operations
6. **Authentication and authorization** patterns
7. **Error handling** strategies across all layers
8. **Caching** implementation details

### 12.2 Testing Priorities

**Phase 1 (Critical):**
- Tool input/output validation tests
- API endpoint integration tests
- Database service layer tests
- External API mock infrastructure

**Phase 2 (High):**
- Data flow integration tests
- Webhook handler tests
- Cache operation tests
- Error scenario tests

**Phase 3 (Medium):**
- E2E user journey tests
- Performance/load tests
- Edge case coverage
- Regression suite

### 12.3 Files to Create

1. `__tests__/unit/tools/` - Tool validation tests
2. `__tests__/integration/api/` - API endpoint tests
3. `__tests__/integration/services/` - Service layer tests
4. `__tests__/e2e/flows/` - User journey tests
5. `__tests__/mocks/` - External service mocks
6. `__tests__/fixtures/` - Test data fixtures

---

*End of Audit Report*
