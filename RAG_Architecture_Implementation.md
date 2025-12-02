# RAG Architecture & Knowledge Base Implementation
## AI-First Real Estate Wholesaling Platform

**Document Type:** Implementation Specification  
**Version:** 1.0  
**Date:** December 2, 2025  
**Status:** Ready for Development

---

## Table of Contents

1. [Overview](#1-overview)
2. [Knowledge Types & Scoping](#2-knowledge-types--scoping)
3. [Knowledge Base Documents](#3-knowledge-base-documents)
4. [Database Schema](#4-database-schema)
5. [Embedding Pipeline](#5-embedding-pipeline)
6. [Multi-Scope Search Architecture](#6-multi-scope-search-architecture)
7. [Query Routing](#7-query-routing)
8. [Integration with AI Layer](#8-integration-with-ai-layer)
9. [Seeding & Maintenance](#9-seeding--maintenance)
10. [API Endpoints](#10-api-endpoints)
11. [Implementation Checklist](#11-implementation-checklist)

---

## 1. Overview

### Purpose

The RAG (Retrieval-Augmented Generation) system provides Claude with contextual knowledge beyond its training data. This includes:

1. **Domain Expertise** - Wholesaling-specific knowledge seeded at launch
2. **Platform Data** - Properties, buyers, market data cached from RentCast
3. **User Context** - Individual user's deals, notes, and conversation history

### Core Principle

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   User Query ──▶ Embed Query ──▶ Search Relevant Context ──▶       │
│                                                                     │
│   ──▶ Inject into Prompt ──▶ Claude Generates Response             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Vector Database | Supabase pgvector | Store and search embeddings |
| Embedding Model | OpenAI text-embedding-3-small | Generate 1536-dimension vectors |
| LLM | Claude (Opus/Sonnet/Haiku) | Generate responses with context |
| Framework | Vercel AI SDK | Orchestrate AI interactions |

---

## 2. Knowledge Types & Scoping

### Two-Layer Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                       KNOWLEDGE SCOPING                             │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  GLOBAL SCOPE                                                       │
│  ════════════                                                       │
│  Visible to ALL users. No user_id filtering.                       │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   Knowledge     │  │    Filter       │  │   Properties    │     │
│  │   Documents     │  │   Templates     │  │  (from RentCast)│     │
│  │                 │  │                 │  │                 │     │
│  │ • How to        │  │ • 21 filter     │  │ • Cached        │     │
│  │   analyze deals │  │   definitions   │  │   property data │     │
│  │ • Filter        │  │ • Criteria      │  │ • Shared across │     │
│  │   explanations  │  │ • Competition   │  │   all users     │     │
│  │ • Examples      │  │   levels        │  │                 │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐                          │
│  │     Buyers      │  │   Market Data   │                          │
│  │                 │  │                 │                          │
│  │ • Discovered    │  │ • Zip-level     │                          │
│  │   from public   │  │   statistics    │                          │
│  │   records       │  │ • Trends        │                          │
│  │ • Shared        │  │ • Narratives    │                          │
│  └─────────────────┘  └─────────────────┘                          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  USER SCOPE                                                         │
│  ══════════                                                         │
│  Filtered by user_id. Enforced via Row Level Security (RLS).       │
│                                                                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │   User Deals    │  │   User Notes    │  │  Chat History   │     │
│  │                 │  │                 │  │                 │     │
│  │ • Pipeline      │  │ • Notes on      │  │ • Past          │     │
│  │   deals         │  │   properties    │  │   conversations │     │
│  │ • AI analyses   │  │ • Notes on      │  │ • Context for   │     │
│  │ • Custom values │  │   buyers        │  │   continuity    │     │
│  │ • Outcomes      │  │ • Notes on      │  │                 │     │
│  │                 │  │   deals         │  │                 │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘     │
│                                                                     │
│  User A's data is INVISIBLE to User B (and vice versa)             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Ownership Matrix

| Data Type | Scope | Who Can Search | RLS Required |
|-----------|-------|----------------|--------------|
| Knowledge Documents | Global | All users | No |
| Filter Templates | Global | All users | No |
| Properties | Global | All users | No |
| Buyers | Global | All users | No |
| Market Data | Global | All users | No |
| User Deals | User | Only owner | Yes |
| User Notes | User | Only owner | Yes |
| Chat Messages | User | Only owner | Yes |
| Saved Filters | User | Only owner | Yes |

---

## 3. Knowledge Base Documents

### Directory Structure

```
/knowledge-base
├── /fundamentals
│   ├── wholesaling-101.md
│   ├── deal-analysis-framework.md
│   ├── 70-percent-rule-explained.md
│   ├── arv-calculation-methods.md
│   ├── repair-estimation-guide.md
│   ├── exit-strategies-comparison.md
│   ├── assignment-contracts-basics.md
│   └── due-diligence-checklist.md
│
├── /filters
│   ├── standard-filters-overview.md
│   ├── enhanced-filters-overview.md
│   ├── contrarian-filters-overview.md
│   ├── filter-absentee-owner.md
│   ├── filter-high-equity.md
│   ├── filter-free-and-clear.md
│   ├── filter-tired-landlord.md
│   ├── filter-out-of-state.md
│   ├── filter-failed-listing.md
│   ├── filter-almost-sold.md
│   ├── filter-shrinking-landlord.md
│   ├── filter-underwater-landlord.md
│   ├── filter-tax-squeeze.md
│   ├── filter-quiet-equity-builder.md
│   ├── filter-negative-momentum.md
│   ├── filter-fsbo-fatigue.md
│   ├── filter-life-stage-transition.md
│   ├── filter-orphan-property.md
│   ├── filter-competitor-exit.md
│   └── combining-filters-strategy.md
│
├── /buyer-intelligence
│   ├── buyer-classification-criteria.md
│   ├── flipper-identification.md
│   ├── buy-and-hold-identification.md
│   ├── brrrr-investor-identification.md
│   ├── reading-transaction-history.md
│   ├── buyer-matching-logic.md
│   └── building-buyer-relationships.md
│
├── /market-analysis
│   ├── interpreting-market-trends.md
│   ├── supply-demand-indicators.md
│   ├── price-per-sqft-analysis.md
│   ├── days-on-market-signals.md
│   ├── declining-market-opportunities.md
│   ├── institutional-investor-signals.md
│   └── seasonal-patterns.md
│
├── /deal-examples
│   ├── example-deal-good-flip.md
│   ├── example-deal-good-wholesale.md
│   ├── example-deal-good-rental.md
│   ├── example-deal-pass-low-equity.md
│   ├── example-deal-pass-bad-location.md
│   ├── example-deal-pass-title-issues.md
│   └── example-buyer-match.md
│
├── /risk-factors
│   ├── title-issues-red-flags.md
│   ├── structural-concerns.md
│   ├── environmental-hazards.md
│   ├── market-timing-risks.md
│   ├── over-leveraged-deals.md
│   ├── deal-killer-checklist.md
│   └── when-to-walk-away.md
│
└── /negotiations
    ├── motivated-seller-psychology.md
    ├── initial-offer-strategies.md
    ├── handling-objections.md
    ├── building-rapport.md
    └── closing-techniques.md
```

### Document Format Standard

Each knowledge document should follow this structure:

```markdown
# [Document Title]

## Overview
[2-3 sentence summary of what this document covers]

## Key Concepts
[Main ideas, definitions, frameworks]

## Detailed Explanation
[In-depth content with examples]

## Practical Application
[How to use this knowledge in the platform]

## Common Mistakes
[What to avoid]

## Related Topics
[Links to other relevant documents]

---
Metadata:
- Category: [fundamentals|filters|buyer-intelligence|market-analysis|examples|risk-factors|negotiations]
- Tags: [comma-separated keywords for improved search]
- Last Updated: [date]
```

### Example Document: `filter-underwater-landlord.md`

```markdown
# Underwater Landlord Filter

## Overview
The Underwater Landlord filter identifies rental properties with negative 
monthly cash flow. These properties cost the owner more to hold than they 
generate in rent, creating ongoing financial pressure and motivation to sell.

## Key Concepts

### What "Underwater" Means
A property is underwater when:
- Monthly rent < Monthly carrying costs
- The owner loses money every month they hold the property
- The bleeding continues indefinitely until they sell or raise rent significantly

### The Math
```
Monthly Cash Flow = Rent - (PITI + HOA + Maintenance)

Where:
- P = Principal payment
- I = Interest payment  
- T = Property taxes (monthly)
- I = Insurance (monthly)
- HOA = Homeowners association fees
- Maintenance = Typically 1% of property value / 12
```

### Example Calculation
```
Monthly Rent:              $1,400
─────────────────────────────────
Mortgage (P&I):           -$1,200
Property Taxes:             -$250
Insurance:                  -$100
Maintenance Reserve:        -$150
HOA:                        -$200
─────────────────────────────────
Monthly Cash Flow:          -$500
Annual Loss:              -$6,000
```

## Why They're Motivated

### Financial Pressure
1. Losing $500/month = $6,000/year in real losses
2. Tax benefits rarely offset actual cash losses
3. Opportunity cost of capital tied up in losing asset
4. Can't refinance if property has declined in value

### Psychological Factors
1. Embarrassment about "bad investment"
2. Frustration from failed attempts to raise rent
3. Overwhelm from managing from distance
4. Desire to "stop the bleeding"
5. Often didn't plan to be landlords (accidental landlords)

### Common Scenarios That Create Underwater Landlords
- Bought at market peak, now values are down
- Interest rates rose, refinanced at higher rate
- Property taxes increased significantly
- HOA raised fees
- Major repair depleted reserves
- Tenant vacancy periods
- Rent control areas preventing increases

## How to Calculate in the Platform

### Required Data Points
- `estimatedRent` - From RentCast rent estimate
- `propertyTaxes` - From RentCast tax data
- `lastSalePrice` + `lastSaleDate` - To estimate mortgage balance
- `hoaFee` - From RentCast property data

### Estimation Logic
```typescript
function calculateMonthlyCashFlow(property: Property): number {
  const rent = property.estimatedRent || 0;
  
  // Estimate mortgage payment (if not free and clear)
  const mortgagePayment = estimateMortgagePayment(
    property.lastSalePrice,
    property.lastSaleDate
  );
  
  // Get actual taxes or estimate at 1.2% of value
  const monthlyTaxes = (property.propertyTaxes?.annual || 
    (property.estimatedValue * 0.012)) / 12;
  
  // Estimate insurance at 0.5% of value
  const monthlyInsurance = (property.estimatedValue * 0.005) / 12;
  
  // Maintenance at 1% of value
  const monthlyMaintenance = (property.estimatedValue * 0.01) / 12;
  
  // HOA if applicable
  const monthlyHOA = property.hoaFee || 0;
  
  return rent - mortgagePayment - monthlyTaxes - 
         monthlyInsurance - monthlyMaintenance - monthlyHOA;
}
```

## Competition Level: LOW

### Why This Filter Is Overlooked
1. Requires calculation from multiple data points
2. Not a simple checkbox in list services
3. Most wholesalers use simpler filters (absentee, high equity)
4. Data for accurate calculation not always available

### Your Advantage
- Platform automatically calculates cash flow for every property
- Can identify negative cash flow before contacting owner
- Speak directly to their pain point in marketing

## Approaching Underwater Landlords

### Messaging Strategy
- Don't lead with "I know you're losing money" (embarrassing)
- Frame as: "I help landlords who are ready to move on"
- Emphasize speed and certainty vs. continued losses
- Calculate their ongoing losses: "Every month costs you $X"

### Negotiation Leverage
- They may accept below-market offers to stop bleeding
- Time is literally costing them money
- Can show math: "Selling now vs. waiting 6 months costs you $X"

## Combining with Other Filters

### High-Synergy Combinations
- Underwater + Absentee = Extra motivation (remote management burden)
- Underwater + Tired Landlord = Double motivation
- Underwater + Out of State = Triple motivation

### Filter SQL Logic
```sql
WHERE 
  owner_occupied = false
  AND calculated_monthly_cash_flow < 0
  AND calculated_monthly_cash_flow > -1000 -- Exclude extreme outliers
```

## Common Mistakes

1. **Assuming all negative cash flow is equal** - Someone losing $100/month is different from $800/month
2. **Ignoring appreciation** - Some owners accept negative cash flow for appreciation
3. **Not verifying rent estimate** - RentCast estimate may differ from actual rent
4. **Forgetting vacancy** - Actual cash flow is worse with vacancies

## Related Topics
- [Accidental Landlord Filter](filter-accidental-landlord.md)
- [Tired Landlord Filter](filter-tired-landlord.md)
- [Cash Flow Calculation Methods](cash-flow-calculations.md)
- [Motivated Seller Psychology](motivated-seller-psychology.md)

---
Metadata:
- Category: filters
- Tags: underwater, negative cash flow, rental, motivation, contrarian, cash flow, landlord
- Last Updated: 2025-12-02
```

### Documents to Create (Priority Order)

**Phase 1: Core (Required for MVP)**
1. `deal-analysis-framework.md` - How the platform analyzes deals
2. `70-percent-rule-explained.md` - Fundamental calculation
3. All 21 filter documents - One per filter
4. `example-deal-good-wholesale.md` - Template for analysis output
5. `example-deal-pass-low-equity.md` - When to recommend passing
6. `buyer-classification-criteria.md` - How buyers are categorized
7. `deal-killer-checklist.md` - Critical risk factors

**Phase 2: Enhanced (Post-MVP)**
- Remaining example documents
- Market analysis documents
- Negotiation guides
- Advanced strategies

---

## 4. Database Schema

### Knowledge Documents Table

```sql
-- Global knowledge base documents
CREATE TABLE knowledge_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Document identification
  slug TEXT UNIQUE NOT NULL,           -- e.g., 'filter-underwater-landlord'
  title TEXT NOT NULL,
  
  -- Classification
  category TEXT NOT NULL CHECK (category IN (
    'fundamentals', 'filters', 'buyer-intelligence', 
    'market-analysis', 'examples', 'risk-factors', 'negotiations'
  )),
  tags TEXT[] DEFAULT '{}',
  
  -- Content
  content TEXT NOT NULL,               -- Full markdown content
  summary TEXT,                        -- 2-3 sentence summary for quick retrieval
  
  -- Vector embedding
  embedding vector(1536),
  
  -- Metadata
  priority INTEGER DEFAULT 50,         -- Higher = retrieved first on ties
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_knowledge_docs_category ON knowledge_documents(category);
CREATE INDEX idx_knowledge_docs_tags ON knowledge_documents USING GIN(tags);
CREATE INDEX idx_knowledge_docs_embedding ON knowledge_documents 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### User Notes Table (Layered on Global Entities)

```sql
-- User-specific notes that overlay global entities
CREATE TABLE user_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- What entity is this note attached to?
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'property', 'deal', 'buyer', 'filter', 'market'
  )),
  entity_id TEXT NOT NULL,
  
  -- Note content
  title TEXT,
  content TEXT NOT NULL,
  
  -- Vector embedding for semantic search
  embedding vector(1536),
  
  -- Metadata
  is_pinned BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access own notes" ON user_notes
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_notes_user ON user_notes(user_id);
CREATE INDEX idx_user_notes_entity ON user_notes(entity_type, entity_id);
CREATE INDEX idx_user_notes_embedding ON user_notes 
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

### Add Embeddings to Existing Tables

```sql
-- Properties (already in main schema, ensure embedding column exists)
ALTER TABLE properties 
  ADD COLUMN IF NOT EXISTS description_embedding vector(1536),
  ADD COLUMN IF NOT EXISTS embedding_updated_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_properties_embedding ON properties 
  USING ivfflat (description_embedding vector_cosine_ops) WITH (lists = 100);

-- Filter Templates
ALTER TABLE filter_templates
  ADD COLUMN IF NOT EXISTS search_embedding vector(1536);

CREATE INDEX IF NOT EXISTS idx_filter_templates_embedding ON filter_templates
  USING ivfflat (search_embedding vector_cosine_ops) WITH (lists = 100);

-- Deals (user-scoped)
ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS search_embedding vector(1536),
  ADD COLUMN IF NOT EXISTS filter_templates_used TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_deals_embedding ON deals
  USING ivfflat (search_embedding vector_cosine_ops) WITH (lists = 100);

-- Buyers
ALTER TABLE buyers
  ADD COLUMN IF NOT EXISTS profile_embedding vector(1536);

CREATE INDEX IF NOT EXISTS idx_buyers_embedding ON buyers
  USING ivfflat (profile_embedding vector_cosine_ops) WITH (lists = 100);

-- Market Data
ALTER TABLE market_data
  ADD COLUMN IF NOT EXISTS narrative TEXT,
  ADD COLUMN IF NOT EXISTS narrative_embedding vector(1536);

CREATE INDEX IF NOT EXISTS idx_market_data_embedding ON market_data
  USING ivfflat (narrative_embedding vector_cosine_ops) WITH (lists = 100);

-- Chat Messages (for conversation continuity)
ALTER TABLE chat_messages
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

CREATE INDEX IF NOT EXISTS idx_chat_messages_embedding ON chat_messages
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

---

## 5. Embedding Pipeline

### Embedding Service

```typescript
// lib/rag/embedding-service.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

/**
 * Generate embedding for a single text
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Truncate if too long (max ~8000 tokens for this model)
  const truncatedText = text.slice(0, 30000);
  
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: truncatedText,
    dimensions: EMBEDDING_DIMENSIONS
  });
  
  return response.data[0].embedding;
}

/**
 * Batch generate embeddings (more efficient for bulk operations)
 * OpenAI allows up to 2048 inputs per request
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  batchSize: number = 100
): Promise<number[][]> {
  const allEmbeddings: number[][] = [];
  
  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize).map(t => t.slice(0, 30000));
    
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
      dimensions: EMBEDDING_DIMENSIONS
    });
    
    allEmbeddings.push(...response.data.map(d => d.embedding));
    
    // Rate limiting: small delay between batches
    if (i + batchSize < texts.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return allEmbeddings;
}
```

### Text Builders

```typescript
// lib/rag/text-builders.ts

/**
 * Build searchable text from property data
 */
export function buildPropertySearchText(property: {
  formattedAddress: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  yearBuilt?: number;
  ownerOccupied?: boolean;
  ownerData?: {
    type?: string;
    names?: string[];
    mailingAddress?: { state?: string };
  };
  features?: Record<string, any>;
  lastSaleDate?: string;
}): string {
  const ownershipYears = property.lastSaleDate 
    ? Math.floor((Date.now() - new Date(property.lastSaleDate).getTime()) / (365 * 24 * 60 * 60 * 1000))
    : null;
  
  const parts = [
    `${property.propertyType || 'Property'} at ${property.formattedAddress}`,
    `Located in ${property.city}, ${property.state} ${property.zipCode}`,
    property.bedrooms ? `${property.bedrooms} bedroom` : '',
    property.bathrooms ? `${property.bathrooms} bathroom` : '',
    property.squareFootage ? `${property.squareFootage} square feet` : '',
    property.yearBuilt ? `Built in ${property.yearBuilt}` : '',
    property.ownerOccupied === false ? 'Absentee owner, investment property, non-owner occupied' : '',
    property.ownerOccupied === true ? 'Owner occupied, primary residence' : '',
    property.ownerData?.type === 'Organization' ? 'Corporate owned, LLC, investor owned' : '',
    property.ownerData?.mailingAddress?.state !== property.state ? 'Out of state owner' : '',
    ownershipYears && ownershipYears >= 10 ? `Long-term owner, ${ownershipYears} years owned` : '',
    property.features?.pool ? 'Has swimming pool' : '',
    property.features?.garage ? 'Has garage' : '',
    property.yearBuilt && property.yearBuilt < 1970 ? 'Older home, may need updates' : '',
    property.yearBuilt && property.yearBuilt > 2015 ? 'Newer construction' : '',
  ];
  
  return parts.filter(Boolean).join('. ');
}

/**
 * Build searchable text from filter template
 */
export function buildFilterSearchText(filter: {
  slug: string;
  name: string;
  description: string;
  category: string;
  competitionLevel?: string;
}): string {
  const synonyms = getFilterSynonyms(filter.slug);
  
  return [
    filter.name,
    filter.description,
    ...synonyms,
    `${filter.category} filter`,
    filter.competitionLevel === 'low' ? 'less competition, overlooked, contrarian, hidden opportunity' : '',
    filter.competitionLevel === 'high' ? 'common filter, popular, standard approach' : '',
  ].filter(Boolean).join('. ');
}

/**
 * Synonyms for natural language matching
 */
function getFilterSynonyms(slug: string): string[] {
  const synonymMap: Record<string, string[]> = {
    'absentee-owner': [
      'non-owner occupied', 'investor owned', 'rental property', 
      'landlord', 'not living there', 'investment property'
    ],
    'high-equity': [
      'lots of equity', 'paid down mortgage', 'low loan balance',
      'significant equity', 'equity rich'
    ],
    'free-and-clear': [
      'no mortgage', 'paid off', 'owns outright', 'no debt',
      'fully paid', 'no loan'
    ],
    'tired-landlord': [
      'burned out landlord', 'exhausted owner', 'long time owner',
      'ready to sell', 'done with rentals', 'landlord fatigue'
    ],
    'out-of-state': [
      'distant owner', 'remote owner', 'different state',
      'far away owner', 'absentee out of state'
    ],
    'failed-listing': [
      'expired listing', 'didnt sell', 'couldnt sell',
      'taken off market', 'listing expired'
    ],
    'almost-sold': [
      'failed to sell', 'listing expired', 'tried to sell',
      'couldnt sell', 'came off market'
    ],
    'shrinking-landlord': [
      'selling portfolio', 'reducing holdings', 'exiting rentals',
      'downsizing portfolio', 'getting out'
    ],
    'underwater-landlord': [
      'negative cash flow', 'losing money', 'bleeding money',
      'cash flow negative', 'upside down rental'
    ],
    'tax-squeeze': [
      'rising taxes', 'tax burden', 'property tax increase',
      'taxes going up', 'assessment increase'
    ],
    'quiet-equity-builder': [
      'recently paid off', 'just paid off mortgage', 
      'new free and clear', 'mortgage payoff'
    ],
    'negative-momentum': [
      'declining market', 'falling prices', 'market downturn',
      'prices dropping', 'weak market'
    ],
    'fsbo-fatigue': [
      'for sale by owner failed', 'fsbo expired', 'tried selling themselves',
      'couldnt sell fsbo', 'gave up fsbo'
    ],
    'life-stage-transition': [
      'empty nester', 'retirement', 'downsizing',
      'kids moved out', 'life change'
    ],
    'orphan-property': [
      'data issues', 'incomplete records', 'hard to find',
      'overlooked', 'data gaps'
    ],
    'competitor-exit': [
      'institutional selling', 'hedge funds leaving', 'reit selling',
      'ibuyer exit', 'big investors leaving'
    ]
  };
  
  return synonymMap[slug] || [];
}

/**
 * Build searchable text from deal
 */
export function buildDealSearchText(deal: {
  status: string;
  notes?: string;
  aiAnalysis?: {
    summary?: string;
    recommendedStrategy?: string;
  };
  property?: {
    formattedAddress?: string;
    city?: string;
    propertyType?: string;
  };
  filterTemplatesUsed?: string[];
}): string {
  return [
    deal.property?.formattedAddress || '',
    deal.property?.city || '',
    deal.property?.propertyType || '',
    `Deal status: ${deal.status}`,
    deal.notes || '',
    deal.aiAnalysis?.summary || '',
    deal.aiAnalysis?.recommendedStrategy ? `Strategy: ${deal.aiAnalysis.recommendedStrategy}` : '',
    deal.filterTemplatesUsed?.length ? `Filters used: ${deal.filterTemplatesUsed.join(', ')}` : '',
  ].filter(Boolean).join('. ');
}

/**
 * Build searchable text from buyer profile
 */
export function buildBuyerSearchText(buyer: {
  name: string;
  buyerType?: string;
  buyingPatterns?: {
    markets?: Array<{ zipCode: string }>;
    propertyTypes?: Array<{ type: string }>;
    priceRange?: { min: number; max: number };
  };
}): string {
  return [
    buyer.name,
    buyer.buyerType ? `${buyer.buyerType} investor` : '',
    buyer.buyingPatterns?.markets?.length 
      ? `Active in: ${buyer.buyingPatterns.markets.map(m => m.zipCode).join(', ')}` 
      : '',
    buyer.buyingPatterns?.propertyTypes?.length
      ? `Buys: ${buyer.buyingPatterns.propertyTypes.map(t => t.type).join(', ')}`
      : '',
    buyer.buyingPatterns?.priceRange
      ? `Budget: $${buyer.buyingPatterns.priceRange.min.toLocaleString()} - $${buyer.buyingPatterns.priceRange.max.toLocaleString()}`
      : '',
  ].filter(Boolean).join('. ');
}
```

### Embedding Triggers

```typescript
// lib/rag/embedding-triggers.ts

import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from './embedding-service';
import { 
  buildPropertySearchText, 
  buildDealSearchText,
  buildBuyerSearchText 
} from './text-builders';

/**
 * Embed property when cached from RentCast
 */
export async function embedProperty(propertyId: string): Promise<void> {
  const supabase = createClient();
  
  const { data: property } = await supabase
    .from('properties')
    .select('*')
    .eq('id', propertyId)
    .single();
  
  if (!property) return;
  
  const searchText = buildPropertySearchText(property);
  const embedding = await generateEmbedding(searchText);
  
  await supabase
    .from('properties')
    .update({ 
      description_embedding: embedding,
      embedding_updated_at: new Date().toISOString()
    })
    .eq('id', propertyId);
}

/**
 * Embed deal when created or updated
 */
export async function embedDeal(dealId: string): Promise<void> {
  const supabase = createClient();
  
  const { data: deal } = await supabase
    .from('deals')
    .select(`
      *,
      properties (formatted_address, city, property_type)
    `)
    .eq('id', dealId)
    .single();
  
  if (!deal) return;
  
  const searchText = buildDealSearchText({
    ...deal,
    property: deal.properties
  });
  const embedding = await generateEmbedding(searchText);
  
  await supabase
    .from('deals')
    .update({ search_embedding: embedding })
    .eq('id', dealId);
}

/**
 * Embed user note when created
 */
export async function embedUserNote(noteId: string): Promise<void> {
  const supabase = createClient();
  
  const { data: note } = await supabase
    .from('user_notes')
    .select('*')
    .eq('id', noteId)
    .single();
  
  if (!note) return;
  
  const embedding = await generateEmbedding(note.content);
  
  await supabase
    .from('user_notes')
    .update({ embedding })
    .eq('id', noteId);
}

/**
 * Embed buyer profile when discovered or updated
 */
export async function embedBuyer(buyerId: string): Promise<void> {
  const supabase = createClient();
  
  const { data: buyer } = await supabase
    .from('buyers')
    .select('*')
    .eq('id', buyerId)
    .single();
  
  if (!buyer) return;
  
  const searchText = buildBuyerSearchText(buyer);
  const embedding = await generateEmbedding(searchText);
  
  await supabase
    .from('buyers')
    .update({ profile_embedding: embedding })
    .eq('id', buyerId);
}

/**
 * Batch embed properties without embeddings (background job)
 */
export async function batchEmbedProperties(limit: number = 100): Promise<number> {
  const supabase = createClient();
  
  const { data: properties } = await supabase
    .from('properties')
    .select('id, formatted_address, city, state, zip_code, property_type, bedrooms, bathrooms, square_footage, year_built, owner_occupied, owner_data, features, last_sale_date')
    .is('description_embedding', null)
    .limit(limit);
  
  if (!properties?.length) return 0;
  
  // Build all search texts
  const searchTexts = properties.map(buildPropertySearchText);
  
  // Batch generate embeddings
  const embeddings = await generateEmbeddingsBatch(searchTexts);
  
  // Update database
  await Promise.all(
    properties.map((property, i) =>
      supabase
        .from('properties')
        .update({
          description_embedding: embeddings[i],
          embedding_updated_at: new Date().toISOString()
        })
        .eq('id', property.id)
    )
  );
  
  return properties.length;
}
```

---

## 6. Multi-Scope Search Architecture

### Supabase RPC Functions

```sql
-- Search global knowledge documents
CREATE OR REPLACE FUNCTION search_knowledge_semantic(
  query_embedding vector(1536),
  category_filter text DEFAULT NULL,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  slug text,
  title text,
  category text,
  content text,
  summary text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kd.id,
    kd.slug,
    kd.title,
    kd.category,
    kd.content,
    kd.summary,
    1 - (kd.embedding <=> query_embedding) as similarity
  FROM knowledge_documents kd
  WHERE 
    kd.embedding IS NOT NULL
    AND kd.is_active = true
    AND 1 - (kd.embedding <=> query_embedding) > match_threshold
    AND (category_filter IS NULL OR kd.category = category_filter)
  ORDER BY kd.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Search filter templates
CREATE OR REPLACE FUNCTION search_filters_semantic(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.6,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  slug text,
  name text,
  description text,
  category text,
  criteria jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ft.slug,
    ft.name,
    ft.description,
    ft.category,
    ft.criteria,
    1 - (ft.search_embedding <=> query_embedding) as similarity
  FROM filter_templates ft
  WHERE 
    ft.search_embedding IS NOT NULL
    AND 1 - (ft.search_embedding <=> query_embedding) > match_threshold
  ORDER BY ft.search_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Search properties (global)
CREATE OR REPLACE FUNCTION search_properties_semantic(
  query_embedding vector(1536),
  city_filter text DEFAULT NULL,
  state_filter text DEFAULT NULL,
  zip_filter text DEFAULT NULL,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id text,
  formatted_address text,
  city text,
  state text,
  zip_code text,
  property_type text,
  bedrooms int,
  bathrooms numeric,
  square_footage int,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.formatted_address,
    p.city,
    p.state,
    p.zip_code,
    p.property_type,
    p.bedrooms,
    p.bathrooms,
    p.square_footage,
    1 - (p.description_embedding <=> query_embedding) as similarity
  FROM properties p
  WHERE 
    p.description_embedding IS NOT NULL
    AND 1 - (p.description_embedding <=> query_embedding) > match_threshold
    AND (city_filter IS NULL OR p.city = city_filter)
    AND (state_filter IS NULL OR p.state = state_filter)
    AND (zip_filter IS NULL OR p.zip_code = zip_filter)
  ORDER BY p.description_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Search user's deals (user-scoped via RLS)
CREATE OR REPLACE FUNCTION search_user_deals_semantic(
  query_embedding vector(1536),
  status_filter text DEFAULT NULL,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  property_id text,
  status text,
  notes text,
  ai_analysis jsonb,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.property_id,
    d.status,
    d.notes,
    d.ai_analysis,
    1 - (d.search_embedding <=> query_embedding) as similarity
  FROM deals d
  WHERE 
    d.user_id = auth.uid()
    AND d.search_embedding IS NOT NULL
    AND 1 - (d.search_embedding <=> query_embedding) > match_threshold
    AND (status_filter IS NULL OR d.status = status_filter)
  ORDER BY d.search_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Search user's notes (user-scoped via RLS)
CREATE OR REPLACE FUNCTION search_user_notes_semantic(
  query_embedding vector(1536),
  entity_type_filter text DEFAULT NULL,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  entity_type text,
  entity_id text,
  title text,
  content text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    n.id,
    n.entity_type,
    n.entity_id,
    n.title,
    n.content,
    1 - (n.embedding <=> query_embedding) as similarity
  FROM user_notes n
  WHERE 
    n.user_id = auth.uid()
    AND n.embedding IS NOT NULL
    AND 1 - (n.embedding <=> query_embedding) > match_threshold
    AND (entity_type_filter IS NULL OR n.entity_type = entity_type_filter)
  ORDER BY n.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Search buyers (global)
CREATE OR REPLACE FUNCTION search_buyers_semantic(
  query_embedding vector(1536),
  buyer_type_filter text DEFAULT NULL,
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  name text,
  buyer_type text,
  buying_patterns jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    b.buyer_type,
    b.buying_patterns,
    1 - (b.profile_embedding <=> query_embedding) as similarity
  FROM buyers b
  WHERE 
    b.profile_embedding IS NOT NULL
    AND 1 - (b.profile_embedding <=> query_embedding) > match_threshold
    AND (buyer_type_filter IS NULL OR b.buyer_type = buyer_type_filter)
  ORDER BY b.profile_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Multi-Scope Search Service

```typescript
// lib/rag/multi-scope-search.ts

import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from './embedding-service';

export interface SearchResult {
  source: 'knowledge' | 'filters' | 'properties' | 'buyers' | 'market' | 'deals' | 'notes' | 'chat';
  scope: 'global' | 'user';
  id: string;
  content: string;
  similarity: number;
  metadata: Record<string, any>;
}

export interface SearchOptions {
  includeGlobal?: {
    knowledge?: boolean;
    filters?: boolean;
    properties?: boolean;
    buyers?: boolean;
    market?: boolean;
  };
  includeUser?: {
    deals?: boolean;
    notes?: boolean;
    chat?: boolean;
  };
  maxResultsPerSource?: number;
  minSimilarity?: number;
}

const DEFAULT_OPTIONS: SearchOptions = {
  includeGlobal: {
    knowledge: true,
    filters: true,
    properties: true,
    buyers: true,
    market: true
  },
  includeUser: {
    deals: true,
    notes: true,
    chat: false  // Usually not needed unless asking about past conversations
  },
  maxResultsPerSource: 3,
  minSimilarity: 0.65
};

/**
 * Search across all knowledge scopes
 */
export async function searchAllScopes(
  userId: string,
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const supabase = createClient();
  
  // Generate embedding for search query
  const queryEmbedding = await generateEmbedding(query);
  
  const results: SearchResult[] = [];
  const searches: Promise<void>[] = [];
  
  // GLOBAL SCOPE SEARCHES
  if (opts.includeGlobal?.knowledge) {
    searches.push(
      supabase.rpc('search_knowledge_semantic', {
        query_embedding: queryEmbedding,
        match_threshold: opts.minSimilarity,
        match_count: opts.maxResultsPerSource
      }).then(({ data }) => {
        if (data) {
          results.push(...data.map((d: any) => ({
            source: 'knowledge' as const,
            scope: 'global' as const,
            id: d.id,
            content: d.summary || d.content.slice(0, 500),
            similarity: d.similarity,
            metadata: { title: d.title, category: d.category, slug: d.slug }
          })));
        }
      })
    );
  }
  
  if (opts.includeGlobal?.filters) {
    searches.push(
      supabase.rpc('search_filters_semantic', {
        query_embedding: queryEmbedding,
        match_threshold: opts.minSimilarity,
        match_count: opts.maxResultsPerSource
      }).then(({ data }) => {
        if (data) {
          results.push(...data.map((d: any) => ({
            source: 'filters' as const,
            scope: 'global' as const,
            id: d.slug,
            content: `${d.name}: ${d.description}`,
            similarity: d.similarity,
            metadata: { slug: d.slug, category: d.category, criteria: d.criteria }
          })));
        }
      })
    );
  }
  
  if (opts.includeGlobal?.properties) {
    searches.push(
      supabase.rpc('search_properties_semantic', {
        query_embedding: queryEmbedding,
        match_threshold: opts.minSimilarity,
        match_count: opts.maxResultsPerSource
      }).then(({ data }) => {
        if (data) {
          results.push(...data.map((d: any) => ({
            source: 'properties' as const,
            scope: 'global' as const,
            id: d.id,
            content: `${d.formatted_address} - ${d.bedrooms}bd/${d.bathrooms}ba ${d.property_type}`,
            similarity: d.similarity,
            metadata: d
          })));
        }
      })
    );
  }
  
  if (opts.includeGlobal?.buyers) {
    searches.push(
      supabase.rpc('search_buyers_semantic', {
        query_embedding: queryEmbedding,
        match_threshold: opts.minSimilarity,
        match_count: opts.maxResultsPerSource
      }).then(({ data }) => {
        if (data) {
          results.push(...data.map((d: any) => ({
            source: 'buyers' as const,
            scope: 'global' as const,
            id: d.id,
            content: `${d.name} - ${d.buyer_type} investor`,
            similarity: d.similarity,
            metadata: { name: d.name, buyerType: d.buyer_type, patterns: d.buying_patterns }
          })));
        }
      })
    );
  }
  
  // USER SCOPE SEARCHES
  if (opts.includeUser?.deals) {
    searches.push(
      supabase.rpc('search_user_deals_semantic', {
        query_embedding: queryEmbedding,
        match_threshold: opts.minSimilarity,
        match_count: opts.maxResultsPerSource
      }).then(({ data }) => {
        if (data) {
          results.push(...data.map((d: any) => ({
            source: 'deals' as const,
            scope: 'user' as const,
            id: d.id,
            content: `Deal: ${d.status} - ${d.notes || d.ai_analysis?.summary || ''}`.slice(0, 500),
            similarity: d.similarity,
            metadata: d
          })));
        }
      })
    );
  }
  
  if (opts.includeUser?.notes) {
    searches.push(
      supabase.rpc('search_user_notes_semantic', {
        query_embedding: queryEmbedding,
        match_threshold: opts.minSimilarity,
        match_count: opts.maxResultsPerSource
      }).then(({ data }) => {
        if (data) {
          results.push(...data.map((d: any) => ({
            source: 'notes' as const,
            scope: 'user' as const,
            id: d.id,
            content: d.content.slice(0, 500),
            similarity: d.similarity,
            metadata: { entityType: d.entity_type, entityId: d.entity_id, title: d.title }
          })));
        }
      })
    );
  }
  
  // Execute all searches in parallel
  await Promise.all(searches);
  
  // Sort by similarity and return
  return results.sort((a, b) => b.similarity - a.similarity);
}

/**
 * Get relevant context for a specific use case
 */
export async function getContextForUseCase(
  userId: string,
  query: string,
  useCase: 'deal_analysis' | 'property_search' | 'buyer_matching' | 'filter_explanation' | 'general_chat'
): Promise<SearchResult[]> {
  const useCaseOptions: Record<string, SearchOptions> = {
    deal_analysis: {
      includeGlobal: { knowledge: true, filters: true, properties: true, buyers: true, market: true },
      includeUser: { deals: true, notes: true },
      maxResultsPerSource: 3
    },
    property_search: {
      includeGlobal: { knowledge: true, filters: true, properties: true },
      includeUser: { notes: true },
      maxResultsPerSource: 5
    },
    buyer_matching: {
      includeGlobal: { knowledge: true, buyers: true },
      includeUser: { deals: true, notes: true },
      maxResultsPerSource: 5
    },
    filter_explanation: {
      includeGlobal: { knowledge: true, filters: true },
      includeUser: { deals: true },
      maxResultsPerSource: 3
    },
    general_chat: {
      includeGlobal: { knowledge: true, filters: true },
      includeUser: { deals: true, notes: true },
      maxResultsPerSource: 2
    }
  };
  
  return searchAllScopes(userId, query, useCaseOptions[useCase] || useCaseOptions.general_chat);
}
```

---

## 7. Query Routing

### Intent Classification

```typescript
// lib/rag/query-router.ts

import { classifyIntent } from '@/lib/ai/ai-service';

export type QueryIntent = 
  | 'domain_question'       // "What is the 70% rule?"
  | 'filter_lookup'         // "Tell me about tired landlord filter"
  | 'property_search'       // "Find houses in Tampa"
  | 'deal_analysis'         // "Analyze 123 Main St"
  | 'personal_history'      // "What's my success rate?"
  | 'buyer_lookup'          // "Who buys flips in 33602?"
  | 'market_question'       // "How's the Tampa market?"
  | 'comparison'            // "Compare this to my past deals"
  | 'recommendation'        // "What should I look at next?"
  | 'past_conversation'     // "What did we discuss about that property?"
  | 'general_chat';         // Everything else

export interface RouteDecision {
  intent: QueryIntent;
  globalScopes: Array<'knowledge' | 'filters' | 'properties' | 'buyers' | 'market'>;
  userScopes: Array<'deals' | 'notes' | 'chat'>;
  requiresUserContext: boolean;
  suggestedMaxResults: number;
}

/**
 * Determine which scopes to search based on query intent
 */
export function routeQuery(intent: QueryIntent): RouteDecision {
  const routes: Record<QueryIntent, RouteDecision> = {
    domain_question: {
      intent: 'domain_question',
      globalScopes: ['knowledge'],
      userScopes: [],
      requiresUserContext: false,
      suggestedMaxResults: 5
    },
    filter_lookup: {
      intent: 'filter_lookup',
      globalScopes: ['knowledge', 'filters'],
      userScopes: ['deals'], // Show their success with this filter
      requiresUserContext: false,
      suggestedMaxResults: 3
    },
    property_search: {
      intent: 'property_search',
      globalScopes: ['properties', 'filters'],
      userScopes: ['notes'],
      requiresUserContext: false,
      suggestedMaxResults: 10
    },
    deal_analysis: {
      intent: 'deal_analysis',
      globalScopes: ['knowledge', 'properties', 'buyers', 'market'],
      userScopes: ['deals', 'notes'],
      requiresUserContext: true,
      suggestedMaxResults: 5
    },
    personal_history: {
      intent: 'personal_history',
      globalScopes: [],
      userScopes: ['deals', 'notes', 'chat'],
      requiresUserContext: true,
      suggestedMaxResults: 10
    },
    buyer_lookup: {
      intent: 'buyer_lookup',
      globalScopes: ['buyers', 'knowledge'],
      userScopes: ['notes'],
      requiresUserContext: false,
      suggestedMaxResults: 5
    },
    market_question: {
      intent: 'market_question',
      globalScopes: ['market', 'knowledge'],
      userScopes: [],
      requiresUserContext: false,
      suggestedMaxResults: 3
    },
    comparison: {
      intent: 'comparison',
      globalScopes: ['properties', 'knowledge'],
      userScopes: ['deals', 'notes'],
      requiresUserContext: true,
      suggestedMaxResults: 5
    },
    recommendation: {
      intent: 'recommendation',
      globalScopes: ['properties', 'filters'],
      userScopes: ['deals', 'notes'],
      requiresUserContext: true,
      suggestedMaxResults: 5
    },
    past_conversation: {
      intent: 'past_conversation',
      globalScopes: [],
      userScopes: ['chat'],
      requiresUserContext: true,
      suggestedMaxResults: 10
    },
    general_chat: {
      intent: 'general_chat',
      globalScopes: ['knowledge', 'filters'],
      userScopes: ['deals'],
      requiresUserContext: false,
      suggestedMaxResults: 3
    }
  };
  
  return routes[intent] || routes.general_chat;
}

/**
 * Full query routing pipeline
 */
export async function routeAndSearch(
  userId: string,
  query: string
): Promise<{ route: RouteDecision; results: SearchResult[] }> {
  // 1. Classify intent using Haiku (fast)
  const { intent } = await classifyIntent(query);
  
  // 2. Get routing decision
  const route = routeQuery(intent as QueryIntent);
  
  // 3. Execute search with appropriate scopes
  const results = await searchAllScopes(userId, query, {
    includeGlobal: {
      knowledge: route.globalScopes.includes('knowledge'),
      filters: route.globalScopes.includes('filters'),
      properties: route.globalScopes.includes('properties'),
      buyers: route.globalScopes.includes('buyers'),
      market: route.globalScopes.includes('market')
    },
    includeUser: {
      deals: route.userScopes.includes('deals'),
      notes: route.userScopes.includes('notes'),
      chat: route.userScopes.includes('chat')
    },
    maxResultsPerSource: Math.ceil(route.suggestedMaxResults / 
      (route.globalScopes.length + route.userScopes.length))
  });
  
  return { route, results };
}
```

---

## 8. Integration with AI Layer

### Enhanced Prompt Builder

```typescript
// lib/ai/prompt-builder.ts

import { SearchResult } from '@/lib/rag/multi-scope-search';
import { RouteDecision } from '@/lib/rag/query-router';

/**
 * Build enhanced prompt with RAG context
 */
export function buildEnhancedPrompt(
  basePrompt: string,
  userQuery: string,
  route: RouteDecision,
  searchResults: SearchResult[]
): string {
  const sections: string[] = [basePrompt];
  
  // Group results by source
  const grouped = groupResultsBySource(searchResults);
  
  // Add relevant knowledge
  if (grouped.knowledge?.length) {
    sections.push(`
## Relevant Domain Knowledge

${grouped.knowledge.map(r => r.content).join('\n\n---\n\n')}
`);
  }
  
  // Add filter information
  if (grouped.filters?.length) {
    sections.push(`
## Relevant Filters

${grouped.filters.map(r => 
  `**${r.metadata.slug}**: ${r.content}`
).join('\n\n')}
`);
  }
  
  // Add property context
  if (grouped.properties?.length) {
    sections.push(`
## Related Properties

${grouped.properties.map(r => 
  `- ${r.content}`
).join('\n')}
`);
  }
  
  // Add buyer context
  if (grouped.buyers?.length) {
    sections.push(`
## Relevant Buyers

${grouped.buyers.map(r => 
  `- ${r.content}`
).join('\n')}
`);
  }
  
  // Add user's historical context (if applicable)
  const userResults = [...(grouped.deals || []), ...(grouped.notes || [])];
  if (userResults.length && route.requiresUserContext) {
    sections.push(`
## User's Historical Context

${userResults.map(r => 
  `[${r.source.toUpperCase()}] ${r.content}`
).join('\n\n')}
`);
  }
  
  // Add the user's actual query
  sections.push(`
## Current Query

${userQuery}
`);
  
  return sections.join('\n\n');
}

function groupResultsBySource(results: SearchResult[]): Record<string, SearchResult[]> {
  return results.reduce((acc, result) => {
    if (!acc[result.source]) {
      acc[result.source] = [];
    }
    acc[result.source].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);
}
```

### AI Chat with RAG

```typescript
// lib/ai/chat-with-rag.ts

import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { routeAndSearch } from '@/lib/rag/query-router';
import { buildEnhancedPrompt } from './prompt-builder';
import { CHAT_SYSTEM_PROMPT } from './system-prompts';
import { aiTools } from './ai-service';

export async function* chatWithRAG(
  userId: string,
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  latestMessage: string
) {
  // 1. Route query and search for context
  const { route, results } = await routeAndSearch(userId, latestMessage);
  
  // 2. Build enhanced system prompt with context
  const enhancedPrompt = buildEnhancedPrompt(
    CHAT_SYSTEM_PROMPT,
    latestMessage,
    route,
    results
  );
  
  // 3. Stream response with context
  const response = await streamText({
    model: anthropic('claude-sonnet-4-5-20250514'),
    system: enhancedPrompt,
    messages,
    tools: aiTools,
    maxTokens: 4096
  });
  
  // 4. Yield chunks
  for await (const chunk of response.textStream) {
    yield chunk;
  }
}
```

---

## 9. Seeding & Maintenance

### Knowledge Base Seed Script

```typescript
// scripts/seed-knowledge-base.ts

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { generateEmbedding } from '../lib/rag/embedding-service';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const KNOWLEDGE_BASE_PATH = './knowledge-base';

interface DocumentMetadata {
  category: string;
  tags: string[];
}

async function seedKnowledgeBase() {
  console.log('🌱 Seeding knowledge base...\n');
  
  const categories = readdirSync(KNOWLEDGE_BASE_PATH, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);
  
  let totalDocs = 0;
  
  for (const category of categories) {
    const categoryPath = join(KNOWLEDGE_BASE_PATH, category);
    const files = readdirSync(categoryPath).filter(f => f.endsWith('.md'));
    
    console.log(`📁 Processing ${category}/ (${files.length} files)`);
    
    for (const file of files) {
      const filePath = join(categoryPath, file);
      const content = readFileSync(filePath, 'utf-8');
      
      // Parse document
      const { title, summary, metadata, body } = parseDocument(content);
      const slug = file.replace('.md', '');
      
      // Generate embedding
      console.log(`  📄 Embedding: ${slug}`);
      const embedding = await generateEmbedding(content);
      
      // Upsert to database
      const { error } = await supabase
        .from('knowledge_documents')
        .upsert({
          slug,
          title,
          category,
          tags: metadata.tags || [],
          content: body,
          summary,
          embedding,
          is_active: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'slug' });
      
      if (error) {
        console.error(`  ❌ Error: ${error.message}`);
      } else {
        totalDocs++;
      }
      
      // Rate limiting
      await new Promise(r => setTimeout(r, 100));
    }
  }
  
  console.log(`\n✅ Seeded ${totalDocs} documents`);
}

function parseDocument(content: string): {
  title: string;
  summary: string;
  metadata: DocumentMetadata;
  body: string;
} {
  const lines = content.split('\n');
  
  // Extract title (first H1)
  const titleLine = lines.find(l => l.startsWith('# '));
  const title = titleLine?.replace('# ', '') || 'Untitled';
  
  // Extract summary (content under ## Overview)
  const overviewIndex = lines.findIndex(l => l.startsWith('## Overview'));
  let summary = '';
  if (overviewIndex !== -1) {
    for (let i = overviewIndex + 1; i < lines.length; i++) {
      if (lines[i].startsWith('##')) break;
      summary += lines[i] + ' ';
    }
  }
  summary = summary.trim().slice(0, 500);
  
  // Extract metadata (at bottom of document)
  const metadataIndex = lines.findIndex(l => l.includes('Metadata:'));
  let metadata: DocumentMetadata = { category: '', tags: [] };
  if (metadataIndex !== -1) {
    const tagsLine = lines.find(l => l.includes('- Tags:'));
    if (tagsLine) {
      const tagsStr = tagsLine.split('Tags:')[1]?.trim() || '';
      metadata.tags = tagsStr.split(',').map(t => t.trim().toLowerCase());
    }
  }
  
  // Body is everything except metadata section
  const body = metadataIndex !== -1 
    ? lines.slice(0, metadataIndex).join('\n')
    : content;
  
  return { title, summary, metadata, body };
}

// Run
seedKnowledgeBase().catch(console.error);
```

### Filter Templates Seed Script

```typescript
// scripts/seed-filter-embeddings.ts

import { createClient } from '@supabase/supabase-js';
import { generateEmbedding } from '../lib/rag/embedding-service';
import { buildFilterSearchText } from '../lib/rag/text-builders';
import { ALL_FILTERS } from '../lib/filters/filter-definitions';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function seedFilterEmbeddings() {
  console.log('🌱 Seeding filter embeddings...\n');
  
  for (const filter of ALL_FILTERS) {
    console.log(`  🏷️ ${filter.slug}`);
    
    // Build search text
    const searchText = buildFilterSearchText(filter);
    
    // Generate embedding
    const embedding = await generateEmbedding(searchText);
    
    // Upsert filter
    const { error } = await supabase
      .from('filter_templates')
      .upsert({
        slug: filter.slug,
        name: filter.name,
        description: filter.description,
        category: filter.category,
        tier: filter.tier,
        icon: filter.icon,
        criteria: filter.criteria,
        motivation_score_formula: filter.motivationFormula,
        competition_level: filter.competitionLevel,
        search_embedding: embedding,
        is_active: true,
        updated_at: new Date().toISOString()
      }, { onConflict: 'slug' });
    
    if (error) {
      console.error(`  ❌ Error: ${error.message}`);
    }
    
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log(`\n✅ Seeded ${ALL_FILTERS.length} filters`);
}

seedFilterEmbeddings().catch(console.error);
```

### Cron Jobs for Maintenance

```typescript
// app/api/cron/embed-pending/route.ts

import { batchEmbedProperties } from '@/lib/rag/embedding-triggers';

export async function GET() {
  const count = await batchEmbedProperties(100);
  
  return Response.json({
    message: `Embedded ${count} properties`,
    timestamp: new Date().toISOString()
  });
}

// Vercel cron config (vercel.json)
/*
{
  "crons": [
    {
      "path": "/api/cron/embed-pending",
      "schedule": "0 * * * *"  // Every hour
    }
  ]
}
*/
```

---

## 10. API Endpoints

### RAG Search Endpoint

```typescript
// app/api/rag/search/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { routeAndSearch } from '@/lib/rag/query-router';

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { query, options } = await request.json();
  
  if (!query) {
    return NextResponse.json({ error: 'Query required' }, { status: 400 });
  }
  
  try {
    const { route, results } = await routeAndSearch(user.id, query);
    
    return NextResponse.json({
      intent: route.intent,
      results,
      meta: {
        globalScopes: route.globalScopes,
        userScopes: route.userScopes,
        resultCount: results.length
      }
    });
  } catch (error) {
    console.error('RAG search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
```

### User Notes Endpoints

```typescript
// app/api/notes/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { embedUserNote } from '@/lib/rag/embedding-triggers';

// Create note
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { entityType, entityId, title, content } = await request.json();
  
  const { data: note, error } = await supabase
    .from('user_notes')
    .insert({
      user_id: user.id,
      entity_type: entityType,
      entity_id: entityId,
      title,
      content
    })
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Embed async (don't block response)
  embedUserNote(note.id).catch(console.error);
  
  return NextResponse.json(note);
}

// Get notes for entity
export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const entityType = searchParams.get('entityType');
  const entityId = searchParams.get('entityId');
  
  let query = supabase
    .from('user_notes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
  
  if (entityType) query = query.eq('entity_type', entityType);
  if (entityId) query = query.eq('entity_id', entityId);
  
  const { data, error } = await query;
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}
```

---

## 11. Implementation Checklist

### Phase 1: Foundation (Week 1)

- [ ] Create `knowledge_documents` table with pgvector
- [ ] Create `user_notes` table with RLS
- [ ] Add embedding columns to existing tables (properties, deals, buyers, filter_templates)
- [ ] Implement embedding service (`generateEmbedding`, `generateEmbeddingsBatch`)
- [ ] Implement text builders for all entity types
- [ ] Create Supabase RPC functions for semantic search

### Phase 2: Knowledge Base (Week 2)

- [ ] Write core knowledge documents (minimum 15 for MVP):
  - [ ] deal-analysis-framework.md
  - [ ] 70-percent-rule-explained.md
  - [ ] 6 standard filter docs
  - [ ] 5 enhanced filter docs
  - [ ] 3 contrarian filter docs (most important ones)
- [ ] Create seed script for knowledge base
- [ ] Create seed script for filter embeddings
- [ ] Run initial seeding

### Phase 3: Search Implementation (Week 3)

- [ ] Implement multi-scope search service
- [ ] Implement query routing (intent classification)
- [ ] Create RAG search API endpoint
- [ ] Implement user notes API endpoints
- [ ] Test search across all scopes

### Phase 4: AI Integration (Week 4)

- [ ] Implement enhanced prompt builder
- [ ] Integrate RAG into chat endpoint
- [ ] Integrate RAG into deal analysis
- [ ] Add embedding triggers to data pipeline
- [ ] Set up cron job for pending embeddings

### Phase 5: Testing & Optimization

- [ ] Test global vs user scope isolation
- [ ] Test RLS enforcement on user data
- [ ] Optimize similarity thresholds
- [ ] Monitor embedding costs
- [ ] Performance testing with realistic data volume

---

## Appendix: Cost Estimates

### Embedding Costs (OpenAI text-embedding-3-small)

| Item | Token Estimate | Cost |
|------|----------------|------|
| 30 knowledge docs | ~60,000 tokens | ~$0.001 |
| 21 filter templates | ~10,000 tokens | ~$0.0002 |
| 10,000 properties | ~2M tokens | ~$0.04 |
| 1,000 deals | ~300,000 tokens | ~$0.006 |
| **Monthly estimate** | ~5M tokens | ~$0.10 |

### Query Costs

| Action | Tokens | Cost |
|--------|--------|------|
| Embed query | ~50 | ~$0.000001 |
| Avg session (10 queries) | ~500 | ~$0.00001 |
| 1,000 users × 10 queries/day | ~5M/day | ~$0.10/day |

**Bottom line:** Embedding costs are negligible. Budget $5-10/month for a busy platform.

---

**End of Document**
