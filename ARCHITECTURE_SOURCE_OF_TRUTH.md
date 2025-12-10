# Fluid Real Estate OS: Architecture Source of Truth

**Version:** 1.0.0
**Last Updated:** December 10, 2025
**Purpose:** Comprehensive documentation of architecture decisions, AI-to-UI patterns, filter system, and implementation roadmap

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Overview](#2-architecture-overview)
3. [AI Tool Ecosystem](#3-ai-tool-ecosystem)
4. [AI-to-UI Bridge Fix](#4-ai-to-ui-bridge-fix)
5. [Property Lifecycle Management](#5-property-lifecycle-management)
6. [Property Card Design Specs](#6-property-card-design-specs)
7. [Filter System Reference](#7-filter-system-reference)
8. [Data Flow Architecture](#8-data-flow-architecture)
9. [Implementation Roadmap](#9-implementation-roadmap)

---

## 1. Executive Summary

### What This Document Covers

This document serves as the **source of truth** for the Fluid Real Estate OS platform architecture. It documents:

- **Why** we are making specific architectural decisions
- **What** the current state of the system is
- **How** to implement improvements following the FluidOS design system

### Key Findings from Architecture Audit

| Area | Current State | Action Required |
|------|---------------|-----------------|
| AI Tools | 212 tools across 29 categories | Split into AI-mediated, direct, and hybrid |
| AI-to-UI Bridge | Event bus with race conditions | Replace with Zustand store |
| Property Cards | Missing actionable data | Redesign following FluidOS |
| Property Lifecycle | No sold/loss tracking | Add status schema and analytics |
| Caching | Multi-tier (Redis, Supabase, memory) | Working well, document patterns |

### Design System Compliance

All implementations MUST follow the **FluidOS Design System** documented in `/New-UI-Docs/Fluid_Real_Estate_OS_Design_System.md`. Key principles:

1. **Law of Continuity** - No hard cuts; use blur and depth
2. **Law of Context Preservation** - User always sees the map
3. **Law of Agentic Presence** - Scout is a co-pilot, not a hidden tool

---

## 2. Architecture Overview

### Tech Stack

```
Frontend:       Next.js 14+ (App Router)
UI Framework:   React 18+, Tailwind CSS, Framer Motion
State:          TanStack Query (server state), Zustand (client state)
AI:             Vercel AI SDK 5.0, xAI Grok models
Database:       Supabase (PostgreSQL + pgvector)
Caching:        Upstash Redis, in-memory
Maps:           Mapbox GL JS
```

### Directory Structure (Key Files)

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── properties/      # Property discovery
│   └── api/
│       └── ai/chat/route.ts # Main AI endpoint
├── components/
│   ├── ai/
│   │   ├── ScoutPane.tsx    # AI chat interface
│   │   └── ScoutMessage.tsx # Chat message component
│   ├── map/
│   │   └── PropertyMarker.tsx
│   └── properties/
│       └── PropertyCardCompact.tsx
├── lib/
│   ├── ai/
│   │   ├── tools/           # 212 AI tools
│   │   └── events.ts        # Event bus (TO BE REPLACED)
│   └── filters/             # 44 property filters
└── stores/
    └── propertyFilterStore.ts # Zustand store example
```

### Data Sources

| Source | Purpose | Integration Method |
|--------|---------|-------------------|
| RentCast | Property data, valuations, owner info | REST API (real-time queries) |
| Shovels.ai | Permit data, contractor info | REST API (batch import) |
| Supabase | Persistent storage, CRM data | Direct client + RPC functions |

---

## 3. AI Tool Ecosystem

### Tool Inventory: 212 Tools Across 29 Categories

The AI has access to 212 tools, organized into these categories:

| Category | Tool Count | Examples |
|----------|-----------|----------|
| Property Search | 18 | `search-properties`, `get-property-details` |
| Advanced Search | 12 | `search-by-filter`, `semantic-search` |
| Deal Pipeline | 15 | `create-deal`, `update-deal-stage` |
| Skip Trace | 8 | `skip-trace-owner`, `get-contact-info` |
| Market Analysis | 14 | `get-comps`, `analyze-market-velocity` |
| Document Generation | 10 | `generate-offer-letter`, `create-contract` |
| CRM Operations | 16 | `add-to-list`, `log-activity` |
| ... (22 more categories) | ... | ... |

### Tool Classification Strategy

We recommend splitting tools into three categories for optimization:

#### Category 1: AI-Mediated (~32 tools)
Tools that **require AI reasoning**:
- Analysis tools (analyze-deal, evaluate-arv)
- Interpretation tools (explain-title-issues)
- Decision tools (recommend-offer-price)

**Keep in AI chat flow.**

#### Category 2: Direct Application Logic (~130 tools)
Tools that are **deterministic API calls**:
- CRUD operations (create-deal, update-lead)
- Data fetching (get-property-by-id)
- Skip trace execution

**Move to direct app functions; AI can suggest but app executes.**

#### Category 3: Hybrid (~50 tools)
Tools where **app fetches data, AI analyzes**:
- Filter application (apply-filter + interpret results)
- Search (search-properties + explain why)

**Two-step: app handles data, AI adds insight.**

---

## 4. AI-to-UI Bridge Fix

### Current Problem

The current implementation uses an event bus pattern (`src/lib/ai/events.ts`) that has race conditions:

```typescript
// CURRENT (PROBLEMATIC)
// File: src/components/ai/ScoutPane.tsx:289-335

useEffect(() => {
  const lastMessage = messages[messages.length - 1];
  // Processing happens after render, can miss rapid updates
  lastMessage?.parts?.forEach((part) => {
    if (part.type === 'tool-result') {
      aiEventBus.emit('tool:result', { ... });  // Fire-and-forget
    }
  });
}, [messages]);
```

**Failure Modes:**
1. Race conditions - useEffect processes after render cycle
2. Fire-and-forget - Events not replayed if component mounts late
3. Inconsistent format - `message.parts` vs `toolInvocations`

### Recommended Solution: Zustand Store

Replace event bus with Zustand store for **reliable, replayable state**:

```typescript
// File: src/stores/aiResultStore.ts (NEW)

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export interface AIToolResult {
  id: string;
  toolName: string;
  result: unknown;
  timestamp: number;
  acknowledged: boolean;
}

interface AIResultStore {
  // State
  results: Map<string, AIToolResult>;
  latestByTool: Map<string, AIToolResult>;

  // Actions
  addResult: (result: AIToolResult) => void;
  acknowledgeResult: (id: string) => void;
  getLatestResult: (toolName: string) => AIToolResult | undefined;
  clearResults: () => void;
}

export const useAIResultStore = create<AIResultStore>()(
  subscribeWithSelector((set, get) => ({
    results: new Map(),
    latestByTool: new Map(),

    addResult: (result) => set((state) => {
      const newResults = new Map(state.results);
      newResults.set(result.id, result);

      const newLatest = new Map(state.latestByTool);
      newLatest.set(result.toolName, result);

      return { results: newResults, latestByTool: newLatest };
    }),

    acknowledgeResult: (id) => set((state) => {
      const newResults = new Map(state.results);
      const result = newResults.get(id);
      if (result) {
        newResults.set(id, { ...result, acknowledged: true });
      }
      return { results: newResults };
    }),

    getLatestResult: (toolName) => get().latestByTool.get(toolName),

    clearResults: () => set({ results: new Map(), latestByTool: new Map() }),
  }))
);
```

### Usage Pattern

```typescript
// In ScoutPane.tsx - write results to store
const { addResult } = useAIResultStore();

// When tool result arrives:
addResult({
  id: crypto.randomUUID(),
  toolName: 'search-properties',
  result: toolResult.result,
  timestamp: Date.now(),
  acknowledged: false,
});

// In MapContainer.tsx - subscribe to specific results
const searchResults = useAIResultStore(
  (state) => state.latestByTool.get('search-properties')
);

useEffect(() => {
  if (searchResults && !searchResults.acknowledged) {
    // Update map markers
    updateMarkers(searchResults.result);
    // Mark as handled
    useAIResultStore.getState().acknowledgeResult(searchResults.id);
  }
}, [searchResults]);
```

### Why This Works

| Aspect | Event Bus | Zustand Store |
|--------|-----------|---------------|
| State Persistence | None | Full state tree |
| Late Subscribers | Miss events | Get current state |
| DevTools | None | Zustand devtools |
| Debugging | Difficult | Easy inspection |
| Type Safety | Weak | Full TypeScript |

---

## 5. Property Lifecycle Management

### Property Status Schema

Add status tracking to the `properties` table:

```sql
-- Migration: Add property lifecycle columns
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'
  CHECK (status IN ('active', 'in_pipeline', 'sold', 'off_market', 'excluded')),
ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status_changed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS status_reason TEXT;
```

### Sale Tracking Schema

Track when properties sell to analyze missed opportunities:

```sql
-- Table: property_sales
CREATE TABLE IF NOT EXISTS property_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- Sale details
  sale_date DATE NOT NULL,
  sale_price DECIMAL(15, 2),
  buyer_name VARCHAR(255),
  buyer_type VARCHAR(50) CHECK (buyer_type IN (
    'investor', 'owner_occupant', 'flipper', 'wholesaler', 'unknown'
  )),

  -- Source of information
  source VARCHAR(50) CHECK (source IN (
    'manual', 'mls', 'county_records', 'skip_trace', 'ai_detected'
  )),

  -- Our involvement
  was_in_pipeline BOOLEAN DEFAULT false,
  pipeline_stage_when_sold VARCHAR(50),
  our_offer_amount DECIMAL(15, 2),

  -- Loss analysis
  days_from_first_contact INTEGER,
  lost_reason VARCHAR(100),
  lost_reason_details TEXT,
  competitor_who_won VARCHAR(255),

  -- Calculated fields
  price_delta DECIMAL(15, 2),  -- Their price vs our offer

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for analytics queries
CREATE INDEX idx_property_sales_date ON property_sales(sale_date DESC);
CREATE INDEX idx_property_sales_user ON property_sales(user_id);
CREATE INDEX idx_property_sales_pipeline ON property_sales(was_in_pipeline);
```

### Loss Pipeline Analytics

Track why deals were lost:

```sql
-- View: loss_pipeline_analytics
CREATE OR REPLACE VIEW loss_pipeline_analytics AS
SELECT
  user_id,
  DATE_TRUNC('month', sale_date) as month,
  COUNT(*) as total_lost,
  COUNT(*) FILTER (WHERE was_in_pipeline) as lost_from_pipeline,
  COUNT(*) FILTER (WHERE NOT was_in_pipeline) as missed_entirely,
  AVG(sale_price) as avg_sale_price,
  AVG(our_offer_amount) FILTER (WHERE our_offer_amount IS NOT NULL) as avg_our_offer,
  AVG(price_delta) FILTER (WHERE price_delta IS NOT NULL) as avg_price_gap,
  MODE() WITHIN GROUP (ORDER BY lost_reason) as most_common_reason,
  SUM(sale_price * 0.10) as potential_assignment_fees_lost  -- Estimated 10% fee
FROM property_sales
WHERE sale_date >= CURRENT_DATE - INTERVAL '12 months'
GROUP BY user_id, DATE_TRUNC('month', sale_date);
```

### AI Tool: Mark Property as Sold

```typescript
// File: src/lib/ai/tools/categories/property-lifecycle-tools.ts

export const markPropertySoldTool = {
  name: 'mark-property-sold',
  description: 'Mark a property as sold. Use when user mentions a property sold or was purchased by someone else.',
  parameters: z.object({
    propertyId: z.string().describe('The property ID to mark as sold'),
    salePrice: z.number().optional().describe('Sale price if known'),
    saleDate: z.string().optional().describe('Sale date if known (YYYY-MM-DD)'),
    buyerType: z.enum(['investor', 'owner_occupant', 'flipper', 'wholesaler', 'unknown']).optional(),
    lostReason: z.string().optional().describe('Why we lost the deal'),
    competitorWhoWon: z.string().optional(),
  }),
  execute: async (params, context) => {
    const { propertyId, salePrice, saleDate, buyerType, lostReason, competitorWhoWon } = params;

    // Check if property was in our pipeline
    const deal = await getDealByPropertyId(propertyId, context.userId);

    // Record the sale
    const sale = await supabase.from('property_sales').insert({
      property_id: propertyId,
      user_id: context.userId,
      sale_date: saleDate || new Date().toISOString().split('T')[0],
      sale_price: salePrice,
      buyer_type: buyerType || 'unknown',
      was_in_pipeline: !!deal,
      pipeline_stage_when_sold: deal?.stage,
      our_offer_amount: deal?.offer_price,
      lost_reason: lostReason,
      competitor_who_won: competitorWhoWon,
      price_delta: deal?.offer_price && salePrice ? salePrice - deal.offer_price : null,
      source: 'manual',
    });

    // Update property status
    await supabase.from('properties').update({
      status: 'sold',
      status_changed_at: new Date().toISOString(),
      status_changed_by: context.userId,
      status_reason: `Sold for ${salePrice ? formatCurrency(salePrice) : 'unknown amount'}`,
    }).eq('id', propertyId);

    // Update deal if exists
    if (deal) {
      await supabase.from('deals').update({
        stage: 'lost',
        status: 'completed',
        notes: `Property sold to ${buyerType || 'unknown'} for ${salePrice || 'unknown'}`,
      }).eq('id', deal.id);
    }

    return {
      success: true,
      message: `Marked property as sold${deal ? ' and moved deal to lost' : ''}`,
      wasInPipeline: !!deal,
    };
  },
};
```

---

## 6. Property Card Design Specs

### Design Principles (FluidOS)

Following `/New-UI-Docs/Fluid_Real_Estate_OS_Design_System.md`:

- **Glass Material**: Use `surface-glass-base` background
- **No Borders**: Separation via shadow and margin
- **Data Density**: Show actionable info, not everything
- **Bidirectional Sync**: Hover triggers map marker highlight

### PropertyCardCompact Redesign

**Current Issues:**
- Missing owner information
- Missing distress indicators
- Missing days on market
- Missing condition/year built
- Contact/Save buttons not functional

**New Layout:**

```
┌─────────────────────────────────────────────────────────────┐
│ ┌────────┐  123 Main Street                    #1  ┌───┐   │
│ │        │  Miami, FL 33130                       │ 87 │   │
│ │ PHOTO  │                                        └───┘   │
│ │        │  👤 John Smith • Absentee • 12yr      Score    │
│ └────────┘                                                 │
│                                                            │
│  🛏 3  │  🛁 2  │  📐 1,850 sqft  │  🏠 1978              │
│                                                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ $425,000                          $178,000 (42%)     │  │
│  │ Estimated Value                   Equity             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Pre-Foreclose│ │ Tired Land  │ │ High Equity │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│                                                            │
│  ──────────────────────────────────────────────────────    │
│  │📞 Contact │  │⭐ Save │  │📋 Add to Deal │             │
└─────────────────────────────────────────────────────────────┘
```

**Required Data Fields:**

| Field | Source | Priority |
|-------|--------|----------|
| Address | `property.address` | P0 - Always show |
| Owner Name | `property.owner_name` | P0 - Critical for action |
| Owner Type | `property.owner_type` | P0 - Context for approach |
| Ownership Length | `property.ownership_length_months` | P0 - Motivation indicator |
| Beds/Baths/SqFt | Standard fields | P0 |
| Year Built | `property.year_built` | P1 |
| Estimated Value | `property.estimated_value` | P0 |
| Equity % | `property.equity_percent` | P0 |
| Equity $ | Calculated | P1 |
| Distress Flags | `distress_indicators.*` | P0 - High motivation |
| Matched Filters | `filterResults.matchedFilters` | P0 |
| Days on Market | `property.days_on_market` | P1 |
| ARV | `property.arv` | P2 |
| Rent Estimate | `valuations.rent_estimate` | P2 |

### PropertyCardExpanded (New Component)

For the expanded detail view in the list panel (not the full bento page):

```
┌─────────────────────────────────────────────────────────────────────┐
│  ┌──────────────┐                                                   │
│  │              │  123 Main Street                    #1  ┌─────┐   │
│  │    PHOTO     │  Miami, FL 33130                       │  87  │   │
│  │   CAROUSEL   │                                        │Score │   │
│  │              │  👤 John Smith                         └─────┘   │
│  └──────────────┘  📍 Absentee Owner (lives in NY)                 │
│                    ⏱️ Owned 12 years                                │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  THE NUMBERS                                                        │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│  │ Est. Value      │ │ ARV             │ │ Equity          │        │
│  │ $425,000        │ │ $485,000        │ │ $178,000 (42%)  │        │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘        │
│                                                                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│  │ Mortgage        │ │ Last Sale       │ │ Rent Estimate   │        │
│  │ $247,000        │ │ $285,000 (2015) │ │ $2,450/mo       │        │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘        │
│                                                                     │
│  PROPERTY DETAILS                                                   │
│  🛏 3 bed  │  🛁 2 bath  │  📐 1,850 sqft  │  🏠 Built 1978        │
│  🅿️ 2-car garage  │  🏊 Pool  │  Lot: 0.25 acres                   │
│                                                                     │
│  MOTIVATION SIGNALS                                                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │🔥 Pre-Forecl│ │⏰ Tired Land│ │💰 High Equity│ │📍 Absentee │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐    │
│  │   📞 Contact     │ │   ⭐ Save        │ │   📋 Add Deal    │    │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘    │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ 🤖 Scout: This owner is likely motivated - they've owned for │  │
│  │    12 years, live out of state, and just got hit with a      │  │
│  │    25% property tax increase.                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Implementation Guidance

```typescript
// File: src/components/properties/PropertyCardCompact.tsx

interface PropertyCardCompactProps {
  result: PropertySearchResultItem;
  onClick?: () => void;
  onExpand?: () => void;  // New: expand to PropertyCardExpanded
  isHighlighted?: boolean;
  isSelected?: boolean;
}

// Key additions needed:
// 1. Owner info section
// 2. Distress indicator badges
// 3. Working action buttons (Contact, Save, Add to Deal)
// 4. Bidirectional map sync (isHighlightedFromList)
```

---

## 7. Filter System Reference

### Filter Categories Overview

The platform has **44 filters** across **6 categories**:

| Category | Count | Purpose |
|----------|-------|---------|
| Standard | 6 | Basic property identification filters |
| Enhanced | 5 | Advanced ownership and equity patterns |
| Contrarian | 10 | Counter-intuitive opportunity signals |
| Shovels | 3 | Permit-based filters |
| Combined | 5 | Multi-source data filters |
| Home Services | 15 | Vertical-specific lead generation |

---

### Standard Filters (6)

These are the foundational filters for wholesaling property identification.

#### Absentee Owner
**ID:** `absentee_owner`
**Description:** Owner does not live at the property (mailing address differs from property address)
**Why It Matters:** Absentee owners are often more motivated to sell as they're managing property remotely
**Best For:** Wholesaling, finding landlords who may be tired of management

---

#### High Equity
**ID:** `high_equity`
**Description:** Property has significant equity position (typically >40%)
**Parameters:**
- `minEquityPercent` (default: 40, range: 0-100)

**Why It Matters:** High equity owners can accept lower cash offers while still walking away with money
**Best For:** Cash offers, quick closes

---

#### Free & Clear
**ID:** `free_clear`
**Description:** Property has no mortgage (100% equity)
**Why It Matters:** No lender approval needed, fastest closes, most flexibility on price
**Best For:** Creative deals, owner financing, quick cash offers

---

#### Tired Landlord
**ID:** `tired_landlord`
**Description:** Long-term rental property owner (10+ years ownership)
**Parameters:**
- `minOwnershipYears` (default: 10, range: 1-50)

**Why It Matters:** Long-term landlords often experience burnout and want out of property management
**Best For:** Wholesaling to other investors, finding owners ready to exit

---

#### Out-of-State Owner
**ID:** `out_of_state`
**Description:** Owner lives in a different state than the property
**Why It Matters:** Distance makes management difficult; owners often prefer selling over dealing with remote issues
**Best For:** Finding motivated sellers who can't easily manage repairs

---

#### Failed Listing
**ID:** `failed_listing`
**Description:** Property listing expired or was withdrawn
**Parameters:**
- `lookbackMonths` (default: 12, range: 1-24)

**Why It Matters:** Sellers who couldn't sell through traditional channels may accept off-market offers
**Best For:** Properties with pricing issues, sellers who need creative solutions

---

### Enhanced Filters (5)

Advanced patterns that indicate higher motivation or opportunity.

#### New Absentee
**ID:** `new_absentee`
**Description:** Recently became an absentee owner (within last 2 years)
**Parameters:**
- `maxYearsSinceAbsentee` (default: 2, range: 1-5)

**Why It Matters:** New absentee owners are adjusting to remote management and may realize it's harder than expected
**Best For:** Catching owners before they fully adapt to landlording

---

#### Distant Owner
**ID:** `distant_owner`
**Description:** Owner lives far from property (100+ miles)
**Parameters:**
- `minDistanceMiles` (default: 100, range: 25-500)

**Why It Matters:** Greater distance = greater management burden
**Best For:** Finding owners who face significant travel costs for any property issues

---

#### Multi-Property Owner
**ID:** `multi_property`
**Description:** Owner has multiple properties (2+)
**Parameters:**
- `minPropertyCount` (default: 2, range: 2-20)

**Why It Matters:** Portfolio owners may want to liquidate underperforming assets
**Best For:** Finding landlords trimming portfolios, estate situations

---

#### Equity Sweet Spot
**ID:** `equity_sweet_spot`
**Description:** Property has ideal equity range (40-70%)
**Parameters:**
- `equityRange` (default: [40, 70], range: 0-100)

**Why It Matters:** Not too little equity (won't accept low offer) or too much (not motivated)
**Best For:** Optimal wholesale deal structuring

---

#### Accidental Landlord
**ID:** `accidental_landlord`
**Description:** Property was previously owner-occupied, now rented
**Why It Matters:** These owners didn't plan to be landlords and may not enjoy it
**Best For:** Finding reluctant landlords who inherited the role

---

### Contrarian Filters (10)

These filters find opportunities others miss by looking at counter-intuitive signals.

#### Almost Sold
**ID:** `almost_sold`
**Description:** Deal fell through (was under contract, then cancelled)
**Parameters:**
- `lookbackMonths` (default: 6, range: 1-12)

**Why It Matters:** Seller is already committed to selling, experienced disappointment, and wants to close quickly
**Best For:** Hot leads, sellers who are primed and motivated

---

#### Shrinking Landlord
**ID:** `shrinking_landlord`
**Description:** Owner has been selling off rental portfolio
**Why It Matters:** Pattern of selling indicates they may want to exit entirely
**Best For:** Catching owners mid-portfolio liquidation

---

#### Underwater Landlord
**ID:** `underwater_landlord`
**Description:** Rent does not cover mortgage payment (negative cash flow)
**Why It Matters:** Owner is losing money every month and may need to sell
**Best For:** Finding financially stressed owners

---

#### Tax Squeeze
**ID:** `tax_squeeze`
**Description:** Property taxes increased significantly (>20% YoY)
**Parameters:**
- `minTaxIncreasePercent` (default: 20, range: 10-100)

**Why It Matters:** Unexpected tax increases strain budgets and may force sale
**Best For:** Finding owners hit by reassessment or tax rate increases

---

#### Quiet Equity Builder
**ID:** `quiet_equity`
**Description:** Long-term owner (15+ years) with no recent refinance
**Parameters:**
- `minOwnershipYears` (default: 15, range: 10-30)

**Why It Matters:** These owners have substantial equity and haven't tapped it - may be ready to cash out
**Best For:** Estate planning situations, owners ready to unlock wealth

---

#### Negative Momentum
**ID:** `negative_momentum`
**Description:** Property value declining year over year
**Why It Matters:** Owners may want to sell before values drop further
**Best For:** Finding motivated sellers in declining markets

---

#### FSBO Fatigue
**ID:** `fsbo_fatigue`
**Description:** For Sale By Owner listing active for 90+ days
**Parameters:**
- `minDaysOnMarket` (default: 90, range: 30-180)

**Why It Matters:** FSBO sellers who can't sell themselves often welcome investor offers
**Best For:** Sellers who've tried and failed, open to alternatives

---

#### Life Stage Transition
**ID:** `life_stage`
**Description:** Indicators of life events (probate, divorce, senior)
**Why It Matters:** Major life events often require property disposition
**Best For:** Sensitive outreach, finding genuine motivation

---

#### Orphan Property
**ID:** `orphan_property`
**Description:** No transaction activity for 5+ years
**Parameters:**
- `minYearsInactive` (default: 5, range: 3-15)

**Why It Matters:** Properties with no activity may have absent or disconnected owners
**Best For:** Finding inherited properties, owners who've forgotten about assets

---

#### Competitor Exit
**ID:** `competitor_exit`
**Description:** Other investors selling properties in the area
**Why It Matters:** When investors exit an area, there may be knowledge worth understanding
**Best For:** Counter-cyclical investing, buying when others sell

---

### Shovels Filters (3)

Permit-based filters using Shovels.ai construction data.

#### Stalled Permit
**ID:** `stalled_permit`
**Description:** Active permit 180+ days without progress - indicates construction problems
**Parameters:**
- `minDaysStalled` (default: 180, range: 90-365)

**Why It Matters:** Stalled construction = owner who may be stuck and want out
**Best For:** Finding renovation projects gone wrong

---

#### Failed Inspection
**ID:** `failed_inspection`
**Description:** Inspection pass rate below 50% - indicates construction quality issues
**Parameters:**
- `maxPassRate` (default: 50, range: 20-80)

**Why It Matters:** Multiple failed inspections indicate serious problems owner may not want to fix
**Best For:** Finding distressed renovation projects

---

#### Expired Permit
**ID:** `expired_permit`
**Description:** Permit expired without final inspection - incomplete work
**Why It Matters:** Expired permits mean unfinished work that may complicate sale
**Best For:** Finding owners with compliance issues who need quick sale

---

### Combined Filters (5)

Filters that combine RentCast property data with Shovels permit data.

#### Over-Improved
**ID:** `over_improved`
**Description:** High permit investment with low appreciation - owner can't recoup investment
**Parameters:**
- `minPermitValue` (default: $50,000, range: $20k-$200k)

**Why It Matters:** Owner who spent $100k on renovations but value only increased $50k may want to cut losses
**Best For:** Finding owners who over-invested

---

#### Sunk Cost
**ID:** `sunk_cost`
**Description:** High equity owner with abandoned project - gave up on renovation
**Parameters:**
- `minEquityPercent` (default: 50, range: 30-80)

**Why It Matters:** Abandoned renovation + high equity = motivated seller who just wants out
**Best For:** Finding owners who gave up mid-project

---

#### Deferred Maintenance
**ID:** `deferred_maintenance`
**Description:** Long-term absentee owner with no permits in 5+ years
**Parameters:**
- `minOwnershipYears` (default: 10, range: 5-20)

**Why It Matters:** No maintenance for 5+ years means property needs significant work
**Best For:** Finding properties that will need rehab (discount opportunities)

---

#### Falling Behind
**ID:** `falling_behind`
**Description:** No permits while neighbors are improving - falling behind market
**Why It Matters:** Owner may feel pressure as neighborhood improves around them
**Best For:** Finding owners in appreciating areas who aren't keeping up

---

#### Major System Due
**ID:** `major_system_due`
**Description:** Roof, HVAC, or water heater past expected lifespan
**Parameters:**
- `roofLifespanYears` (default: 20, range: 15-30)

**Why It Matters:** Major system replacement costs $10-30k+ and owner may prefer selling
**Best For:** Finding properties with imminent large expenses

---

### Home Services Filters (15)

Vertical-specific filters for home service businesses (roofing, HVAC, electrical, plumbing, solar).

#### Roofing Filters (3)

**Aging Roof** (`aging_roof`)
- Roof 15+ years old based on permit history or year built
- Parameters: `minRoofAgeYears` (default: 15)

**Storm Damage Potential** (`storm_damage`)
- Old roof in area with recent roofing activity - potential storm damage

**No Reroof History** (`no_reroof_history`)
- Property 20+ years old with no roofing permit history
- Parameters: `minPropertyAgeYears` (default: 20)

---

#### HVAC Filters (3)

**HVAC Replacement Due** (`hvac_replacement_due`)
- HVAC system 15+ years old based on permit history
- Parameters: `minHvacAgeYears` (default: 15)

**Heat Pump Candidate** (`heat_pump_candidate`)
- Has solar but no heat pump - eco-conscious homeowner

**No HVAC History** (`no_hvac_history`)
- Property 20+ years old with no HVAC permit history
- Parameters: `minPropertyAgeYears` (default: 20)

---

#### Electrical Filters (3)

**Panel Upgrade Candidate** (`panel_upgrade_candidate`)
- Older home with high-draw additions (solar, EV, heat pump)
- Parameters: `maxYearBuilt` (default: 1990)

**EV Charger Ready** (`ev_charger_ready`)
- High-value home without EV charger installation
- Parameters: `minPropertyValue` (default: $400,000)

**No Electrical Upgrades** (`no_electrical_upgrades`)
- Property 30+ years old with no electrical permit history
- Parameters: `minPropertyAgeYears` (default: 30)

---

#### Plumbing Filters (3)

**Repiping Candidate** (`repiping_candidate`)
- Property 40+ years old with no plumbing permit history
- Parameters: `minPropertyAgeYears` (default: 40)

**Water Heater Due** (`water_heater_due`)
- Water heater 12+ years old based on permit history
- Parameters: `minWaterHeaterAgeYears` (default: 12)

**No Plumbing Permits** (`no_plumbing_permits`)
- Property 25+ years old with no plumbing permit history
- Parameters: `minPropertyAgeYears` (default: 25)

---

#### Solar Filters (3)

**Solar Ready** (`solar_ready`)
- Recent roof or high-value home without solar installation
- Parameters: `minPropertyValue` (default: $300,000)

**Battery Upgrade** (`battery_upgrade`)
- Has solar installation - battery storage upsell opportunity

**High Consumption Area** (`high_consumption_area`)
- Large home (2500+ sq ft) without solar - high energy consumption
- Parameters: `minSquareFootage` (default: 2,500)

---

### Filter UI Implementation

The filter bar should use **glass pill buttons** per FluidOS design:

```tsx
// Filter pill component
<div className="flex gap-2 overflow-x-auto py-2 px-4 hide-scrollbar">
  {filters.map((filter) => (
    <button
      key={filter.id}
      onClick={() => toggleFilter(filter.id)}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-full',
        'bg-white/65 backdrop-blur-md',
        'border border-white/40',
        'text-sm font-medium whitespace-nowrap',
        'transition-all duration-200',
        'hover:bg-white/80 hover:scale-105',
        isActive(filter.id) && 'bg-primary text-white border-primary'
      )}
    >
      <span>{filter.name}</span>
      {isActive(filter.id) && (
        <X className="size-3" onClick={(e) => { e.stopPropagation(); removeFilter(filter.id); }} />
      )}
    </button>
  ))}
</div>
```

---

## 8. Data Flow Architecture

### Discovery Flow (Primary User Journey)

```
User Opens App
      │
      ▼
┌─────────────────┐
│  Load Map View  │
│  (Mapbox GL)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│  User Selects   │────▶│  Call RentCast  │
│  Filters        │     │  API (real-time)│
└────────┬────────┘     └────────┬────────┘
         │                       │
         │              ┌────────▼────────┐
         │              │  Transform to   │
         │              │  Smart Markers  │
         │              └────────┬────────┘
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────┐
│           Display Results                │
│  ┌────────────┐  ┌────────────────────┐ │
│  │    Map     │  │   Property List    │ │
│  │  Markers   │◀─▶│   (Cards)          │ │
│  └────────────┘  └────────────────────┘ │
└─────────────────────────────────────────┘
         │
         │  User clicks property
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Show Expanded  │────▶│  Cache Property │
│  Card / Bento   │     │  in Supabase    │
└─────────────────┘     └─────────────────┘
         │
         │  User takes action
         ▼
┌─────────────────┐
│  Add to Deal /  │
│  Skip Trace /   │
│  Contact        │
└─────────────────┘
```

### AI Interaction Flow (New)

```
User Types to Scout
        │
        ▼
┌─────────────────┐
│  Chat API       │
│  (/api/ai/chat) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Vercel AI SDK  │
│  streamText()   │
└────────┬────────┘
         │
         │  Tool call detected
         ▼
┌─────────────────┐     ┌─────────────────┐
│  Execute Tool   │────▶│  Write Result   │
│  (212 tools)    │     │  to Zustand     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │              ┌────────▼────────┐
         │              │  Subscribed     │
         │              │  Components     │
         │              │  Auto-Update    │
         │              └─────────────────┘
         ▼
┌─────────────────┐
│  Stream Text    │
│  Response Back  │
└─────────────────┘
```

### Caching Strategy

```
Request Type        │ Cache Layer          │ TTL
────────────────────┼──────────────────────┼──────────
Property Search     │ Redis (Upstash)      │ 5 min
Property Details    │ Supabase + Redis     │ 1 hour
Comps/Valuations    │ Redis                │ 15 min
Filter Results      │ In-memory            │ Session
AI Context          │ Supabase (vector)    │ Permanent
User Preferences    │ Supabase             │ Permanent
```

---

## 9. Implementation Roadmap

### Phase 1: AI-to-UI Bridge Fix (Priority: CRITICAL)

**Files to Modify:**
- Create: `src/stores/aiResultStore.ts`
- Update: `src/components/ai/ScoutPane.tsx`
- Update: `src/components/map/MapContainer.tsx`
- Remove: `src/lib/ai/events.ts` (after migration)

**Tasks:**
1. Create Zustand store for AI results
2. Update ScoutPane to write to store
3. Update all components that listen for AI events
4. Add DevTools for debugging
5. Remove event bus after full migration

---

### Phase 2: Property Lifecycle (Priority: HIGH)

**Files to Create/Modify:**
- Create: `supabase/migrations/XXXXXX_add_property_lifecycle.sql`
- Create: `src/lib/ai/tools/categories/property-lifecycle-tools.ts`
- Update: `src/components/properties/PropertyCardCompact.tsx` (add status badge)

**Tasks:**
1. Add status columns to properties table
2. Create property_sales table
3. Create loss_pipeline_analytics view
4. Add mark-property-sold AI tool
5. Add manual "Mark as Sold" UI button

---

### Phase 3: Property Card Redesign (Priority: HIGH)

**Files to Modify:**
- Update: `src/components/properties/PropertyCardCompact.tsx`
- Create: `src/components/properties/PropertyCardExpanded.tsx`
- Update: `src/lib/filters/types.ts` (ensure all needed data exposed)

**Tasks:**
1. Add owner info section to compact card
2. Add distress indicator badges
3. Implement working action buttons
4. Create expanded card component
5. Add bidirectional map hover sync

---

### Phase 4: Loss Pipeline Dashboard (Priority: MEDIUM)

**Files to Create:**
- Create: `src/app/(dashboard)/analytics/loss-pipeline/page.tsx`
- Create: `src/components/analytics/LossPipelineCharts.tsx`

**Tasks:**
1. Create loss pipeline page
2. Add charts: losses by month, by reason, by stage
3. Add "potential revenue lost" calculation
4. Add drill-down to individual lost deals
5. Add AI insights on loss patterns

---

### Phase 5: Filter Bar Enhancement (Priority: MEDIUM)

**Files to Modify:**
- Update: `src/components/filters/HorizontalFilterBar.tsx`
- Create: `src/components/filters/FilterPill.tsx`
- Create: `src/components/filters/FilterTooltip.tsx`

**Tasks:**
1. Redesign filter pills following FluidOS
2. Add tooltip with full description on hover
3. Add parameter adjustment popover
4. Group filters by category
5. Add "suggested filters" based on context

---

## Appendix A: Database Schema Reference

### Core Tables

```sql
-- Properties (main)
properties (
  id UUID PRIMARY KEY,
  address VARCHAR(500),
  city, state, zip,
  beds, baths, sqft,
  year_built INTEGER,
  owner_name, owner_type,
  ownership_length_months INTEGER,
  estimated_value, equity_percent,
  arv DECIMAL,
  condition VARCHAR(50),
  status VARCHAR(20),  -- NEW: active, in_pipeline, sold, off_market
  ...
)

-- Distress Indicators
distress_indicators (
  property_id UUID REFERENCES properties,
  pre_foreclosure BOOLEAN,
  tax_delinquent BOOLEAN,
  vacant BOOLEAN,
  code_violations INTEGER,
  ...
)

-- CRM: Leads & Deals
leads (id, user_id, property_id, status, motivation_score, ...)
deals (id, user_id, property_id, stage, asking_price, offer_price, ...)

-- NEW: Sale Tracking
property_sales (
  id UUID,
  property_id, user_id,
  sale_date, sale_price,
  was_in_pipeline, lost_reason,
  ...
)
```

---

## Appendix B: Design System Quick Reference

### Glass Materials

```css
--surface-glass-base: rgba(255, 255, 255, 0.65);
--surface-glass-high: rgba(255, 255, 255, 0.85);
--glass-blur-md: blur(20px) saturate(180%);
```

### Spring Animation Presets

```typescript
const springPresets = {
  snappy: { mass: 0.5, stiffness: 400, damping: 25 },
  standard: { mass: 1, stiffness: 300, damping: 30 },
  bouncy: { mass: 0.8, stiffness: 350, damping: 15 },
};
```

### Color Tokens

```css
--color-primary: #0071E3;       /* Apple Blue */
--color-success: #34C759;       /* High Equity, Positive */
--color-warning: #FF9F0A;       /* Distress, Caution */
--color-danger: #FF3B30;        /* Negative, Error */
```

---

**Document End**

*This document should be updated as architecture decisions evolve. All implementations must reference this document to ensure consistency.*
