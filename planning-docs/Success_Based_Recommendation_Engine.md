# Success-Based Recommendation Engine Implementation
## AI-First Real Estate Wholesaling Platform

**Document Type:** Implementation Specification  
**Version:** 1.0  
**Date:** December 2, 2025  
**Status:** Ready for Development

---

## Table of Contents

1. [Overview](#1-overview)
2. [System Architecture](#2-system-architecture)
3. [Success Profile Data Model](#3-success-profile-data-model)
4. [Database Schema](#4-database-schema)
5. [Success Profile Builder](#5-success-profile-builder)
6. [Property Matching Algorithm](#6-property-matching-algorithm)
7. [Recommendation Triggers](#7-recommendation-triggers)
8. [Learning & Feedback Loop](#8-learning--feedback-loop)
9. [API Endpoints](#9-api-endpoints)
10. [UI Components](#10-ui-components)
11. [Implementation Checklist](#11-implementation-checklist)

---

## 1. Overview

### Purpose

The Success-Based Recommendation Engine analyzes each user's closed deals to identify patterns in what works for them, then proactively recommends new properties matching those patterns.

### Key Value Proposition

> "We don't just show you properties that match filters — we show you properties that match **what you've successfully closed before**."

### Core Concept

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   USER'S CLOSED DEALS                    INCOMING PROPERTIES        │
│   ───────────────────                    ──────────────────         │
│                                                                     │
│   ┌──────────────────────┐              ┌──────────────────────┐   │
│   │ Deal 1: 33602        │              │ New Property A       │   │
│   │ 3bd SFH, $145k       │              │ 33602, 3bd SFH       │   │
│   │ Tired landlord ✓     │   ────────►  │ Similar attributes   │   │
│   ├──────────────────────┤   PATTERN    │                      │   │
│   │ Deal 2: 33602        │   MATCHING   │ Match Score: 87%     │   │
│   │ 3bd SFH, $162k       │              │ "You've closed 2     │   │
│   │ Absentee owner ✓     │              │  similar deals"      │   │
│   ├──────────────────────┤              └──────────────────────┘   │
│   │ Deal 3: 33609        │                                         │
│   │ 4bd SFH, $195k       │              ┌──────────────────────┐   │
│   │ High equity ✓        │              │ New Property B       │   │
│   └──────────────────────┘              │ 33701, 2bd Condo     │   │
│                                         │ Different profile    │   │
│         │                               │                      │   │
│         ▼                               │ Match Score: 23%     │   │
│   ┌──────────────────────┐              │ Not recommended      │   │
│   │ SUCCESS PROFILE      │              └──────────────────────┘   │
│   │                      │                                         │
│   │ • Best in: 33602     │                                         │
│   │ • Type: 3bd SFH      │                                         │
│   │ • Price: $140-200k   │                                         │
│   │ • Filters: tired     │                                         │
│   │   landlord, absentee │                                         │
│   └──────────────────────┘                                         │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Differentiation from Standard Filters

| Standard Approach | Our Approach |
|-------------------|--------------|
| "Show me absentee owners" | "Show me properties like ones I've successfully closed" |
| Same results for every user | Personalized to each user's history |
| Filter-based | Pattern-based |
| Reactive (user searches) | Proactive (system recommends) |

---

## 2. System Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RECOMMENDATION ENGINE FLOW                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐           │
│  │ User Closes │────▶│   Analyze   │────▶│   Update    │           │
│  │    Deal     │     │   Patterns  │     │   Profile   │           │
│  └─────────────┘     └─────────────┘     └──────┬──────┘           │
│                                                  │                  │
│                                                  ▼                  │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐           │
│  │    Push     │◀────│    Match    │◀────│  New Props  │           │
│  │   Notif     │     │  Algorithm  │     │   Cached    │           │
│  └─────────────┘     └─────────────┘     └─────────────┘           │
│        │                                                            │
│        ▼                                                            │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐           │
│  │    User     │────▶│   Tracks    │────▶│  Improves   │           │
│  │   Action    │     │ Interaction │     │  Algorithm  │           │
│  └─────────────┘     └─────────────┘     └─────────────┘           │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Components

| Component | Responsibility |
|-----------|----------------|
| **Success Profile Builder** | Analyzes closed deals, extracts patterns, builds user profile |
| **Property Matcher** | Scores new properties against user's success profile |
| **Recommendation Triggers** | Fires recommendations on events (new property, deal close, daily digest) |
| **Interaction Tracker** | Records user actions on recommendations for learning |
| **Feedback Loop** | Uses interaction data to improve matching algorithm |

---

## 3. Success Profile Data Model

### Profile Structure

```typescript
interface UserSuccessProfile {
  userId: string;
  
  // =========================================
  // GEOGRAPHIC PATTERNS
  // =========================================
  successfulZipCodes: Array<{
    zipCode: string;
    closedCount: number;
    totalProfit: number;
    avgProfit: number;
    avgDaysToClose: number;
    lastCloseDate: Date;
  }>;
  
  successfulCities: Array<{
    city: string;
    state: string;
    closedCount: number;
    totalProfit: number;
  }>;
  
  // =========================================
  // PROPERTY CHARACTERISTIC PATTERNS
  // =========================================
  successfulPropertyTypes: Array<{
    type: string;                    // 'Single Family', 'Condo', etc.
    closedCount: number;
    avgProfit: number;
    avgDaysToClose: number;
  }>;
  
  priceRange: {
    min: number;
    max: number;
    median: number;
    sweetSpot: number;               // Price with highest success rate
    avgOfferToAskingRatio: number;   // How much below asking they typically get
  };
  
  bedroomPreference: {
    min: number;
    max: number;
    mostSuccessful: number;          // Bedroom count with most closes
  };
  
  sqftRange: {
    min: number;
    max: number;
    avg: number;
  };
  
  yearBuiltRange: {
    min: number;
    max: number;
    preferOlder: boolean;            // True if > 50% of deals on pre-1980 homes
  };
  
  // =========================================
  // FILTER/MOTIVATION PATTERNS
  // =========================================
  successfulFilters: Array<{
    filterSlug: string;
    usedCount: number;               // Times this filter was on a deal
    closedCount: number;             // Times deal closed with this filter
    successRate: number;             // closedCount / usedCount
    avgProfit: number;
  }>;
  
  // Top 3 filter combinations that led to closes
  successfulFilterCombos: Array<{
    filters: string[];
    closedCount: number;
    avgProfit: number;
  }>;
  
  // =========================================
  // BUYER NETWORK STRENGTH
  // =========================================
  buyerNetworkByZip: Array<{
    zipCode: string;
    activeBuyers: number;            // Buyers they've assigned to in this zip
    avgDaysToAssign: number;
    lastAssignment: Date;
  }>;
  
  // =========================================
  // TIMING PATTERNS
  // =========================================
  avgDaysToClose: number;
  avgDaysToAssign: number;           // From contract to assignment
  bestDayOfWeek: number;             // 0-6, day with most closes
  bestMonthOfYear: number;           // 1-12, month with most closes
  
  // =========================================
  // PERFORMANCE METRICS
  // =========================================
  totalClosedDeals: number;
  totalProfit: number;
  avgProfitPerDeal: number;
  closingRate: number;               // closedDeals / totalDeals
  
  // =========================================
  // EMBEDDING FOR SEMANTIC MATCHING
  // =========================================
  profileEmbedding: number[];        // Vector for similarity search
  
  // =========================================
  // METADATA
  // =========================================
  createdAt: Date;
  updatedAt: Date;
  lastDealClosedAt: Date;
}
```

### Pattern Weights

Different patterns have different predictive power:

| Pattern | Weight | Reasoning |
|---------|--------|-----------|
| Zip code match | 30% | Geographic expertise is highly localized |
| Property type match | 15% | Users develop type-specific skills |
| Price range match | 20% | Budget constraints and buyer network |
| Filter match | 20% | Indicates similar motivation signals |
| Bedroom match | 5% | Less predictive but still relevant |
| Buyer network | 10% | Having buyers = faster assignment |

---

## 4. Database Schema

### Success Profiles Table

```sql
CREATE TABLE user_success_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Geographic patterns (JSONB for flexibility)
  successful_zip_codes JSONB DEFAULT '[]',
  -- Format: [{zipCode, closedCount, totalProfit, avgProfit, avgDaysToClose, lastCloseDate}]
  
  successful_cities JSONB DEFAULT '[]',
  -- Format: [{city, state, closedCount, totalProfit}]
  
  -- Property characteristic patterns
  successful_property_types JSONB DEFAULT '[]',
  -- Format: [{type, closedCount, avgProfit, avgDaysToClose}]
  
  price_range JSONB,
  -- Format: {min, max, median, sweetSpot, avgOfferToAskingRatio}
  
  bedroom_preference JSONB,
  -- Format: {min, max, mostSuccessful}
  
  sqft_range JSONB,
  -- Format: {min, max, avg}
  
  year_built_range JSONB,
  -- Format: {min, max, preferOlder}
  
  -- Filter patterns
  successful_filters JSONB DEFAULT '[]',
  -- Format: [{filterSlug, usedCount, closedCount, successRate, avgProfit}]
  
  successful_filter_combos JSONB DEFAULT '[]',
  -- Format: [{filters: [], closedCount, avgProfit}]
  
  -- Buyer network
  buyer_network_by_zip JSONB DEFAULT '[]',
  -- Format: [{zipCode, activeBuyers, avgDaysToAssign, lastAssignment}]
  
  -- Timing patterns
  avg_days_to_close INTEGER,
  avg_days_to_assign INTEGER,
  best_day_of_week INTEGER,
  best_month_of_year INTEGER,
  
  -- Performance metrics
  total_closed_deals INTEGER DEFAULT 0,
  total_profit INTEGER DEFAULT 0,
  avg_profit_per_deal INTEGER DEFAULT 0,
  closing_rate NUMERIC(5,4) DEFAULT 0,
  
  -- Embedding for semantic matching
  profile_embedding vector(1536),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_deal_closed_at TIMESTAMPTZ,
  
  CONSTRAINT positive_metrics CHECK (
    total_closed_deals >= 0 
    AND total_profit >= 0 
    AND closing_rate >= 0 AND closing_rate <= 1
  )
);

-- Index for finding users by zip code interest
CREATE INDEX idx_success_profiles_zips ON user_success_profiles 
  USING GIN (successful_zip_codes jsonb_path_ops);

-- Index for embedding similarity search
CREATE INDEX idx_success_profiles_embedding ON user_success_profiles 
  USING ivfflat (profile_embedding vector_cosine_ops);
```

### Deals Table Updates

```sql
-- Add columns to track filter usage and outcomes
ALTER TABLE deals 
  ADD COLUMN IF NOT EXISTS filter_templates_used TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS days_to_close INTEGER,
  ADD COLUMN IF NOT EXISTS days_to_assign INTEGER,
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assigned_to_buyer_id UUID REFERENCES buyers(id);

-- Index for analyzing filter success
CREATE INDEX idx_deals_filters ON deals USING GIN (filter_templates_used);
```

### Recommendation Interactions Table

```sql
-- Track how users interact with recommendations (for learning)
CREATE TABLE recommendation_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE SET NULL,
  
  -- Recommendation context
  match_score INTEGER,
  match_reasons TEXT[],
  source TEXT CHECK (source IN ('new_property', 'daily_digest', 'deal_close', 'manual')),
  
  -- User action
  action TEXT NOT NULL CHECK (action IN (
    'viewed',           -- User clicked to view
    'dismissed',        -- User said "not interested"
    'saved',            -- User saved for later
    'created_deal',     -- User created a deal
    'closed_deal'       -- Deal was closed (ultimate success)
  )),
  
  -- For learning
  time_to_action INTEGER,  -- Seconds from recommendation to action
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE recommendation_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own interactions" ON recommendation_interactions
  FOR ALL USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_rec_interactions_user ON recommendation_interactions(user_id);
CREATE INDEX idx_rec_interactions_property ON recommendation_interactions(property_id);
CREATE INDEX idx_rec_interactions_action ON recommendation_interactions(action);
```

### Pending Recommendations Table (Optional)

```sql
-- Store pre-computed recommendations for fast retrieval
CREATE TABLE pending_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Match data
  match_score INTEGER NOT NULL,
  match_reasons TEXT[],
  similar_closed_deals UUID[],  -- IDs of similar deals user closed
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'dismissed', 'actioned')),
  
  -- Delivery
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '7 days',
  
  UNIQUE(user_id, property_id)
);

-- RLS
ALTER TABLE pending_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own recommendations" ON pending_recommendations
  FOR ALL USING (auth.uid() = user_id);

-- Index for fast retrieval
CREATE INDEX idx_pending_recs_user_status ON pending_recommendations(user_id, status);
CREATE INDEX idx_pending_recs_expires ON pending_recommendations(expires_at);
```

---

## 5. Success Profile Builder

### Profile Update Service

```typescript
// lib/recommendations/profile-builder.ts

import { createClient } from '@/lib/supabase/server';
import { generateEmbedding } from '@/lib/rag/embedding-service';

/**
 * Rebuild user's success profile from all closed deals
 */
export async function rebuildSuccessProfile(userId: string): Promise<void> {
  const supabase = createClient();
  
  // Fetch all closed deals with property data
  const { data: closedDeals, error } = await supabase
    .from('deals')
    .select(`
      id,
      status,
      offer_price,
      assignment_fee,
      filter_templates_used,
      days_to_close,
      days_to_assign,
      closed_at,
      created_at,
      assigned_to_buyer_id,
      properties (
        id,
        formatted_address,
        city,
        state,
        zip_code,
        property_type,
        bedrooms,
        bathrooms,
        square_footage,
        year_built,
        last_sale_price
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'closed')
    .order('closed_at', { ascending: false });
  
  if (error || !closedDeals?.length) {
    // No closed deals - create empty profile or skip
    return;
  }
  
  // Analyze patterns
  const profile = analyzePatterns(closedDeals);
  
  // Generate profile embedding for similarity matching
  const profileDescription = generateProfileDescription(profile);
  const embedding = await generateEmbedding(profileDescription);
  
  // Calculate totals
  const totalProfit = closedDeals.reduce((sum, d) => sum + (d.assignment_fee || 0), 0);
  
  // Get total deals (including non-closed) for closing rate
  const { count: totalDeals } = await supabase
    .from('deals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);
  
  // Upsert profile
  await supabase.from('user_success_profiles').upsert({
    user_id: userId,
    successful_zip_codes: profile.successfulZipCodes,
    successful_cities: profile.successfulCities,
    successful_property_types: profile.successfulPropertyTypes,
    price_range: profile.priceRange,
    bedroom_preference: profile.bedroomPreference,
    sqft_range: profile.sqftRange,
    year_built_range: profile.yearBuiltRange,
    successful_filters: profile.successfulFilters,
    successful_filter_combos: profile.successfulFilterCombos,
    buyer_network_by_zip: profile.buyerNetworkByZip,
    avg_days_to_close: profile.avgDaysToClose,
    avg_days_to_assign: profile.avgDaysToAssign,
    best_day_of_week: profile.bestDayOfWeek,
    best_month_of_year: profile.bestMonthOfYear,
    total_closed_deals: closedDeals.length,
    total_profit: totalProfit,
    avg_profit_per_deal: Math.round(totalProfit / closedDeals.length),
    closing_rate: totalDeals ? closedDeals.length / totalDeals : 0,
    profile_embedding: embedding,
    last_deal_closed_at: closedDeals[0]?.closed_at,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' });
}

/**
 * Analyze closed deals to extract patterns
 */
function analyzePatterns(deals: ClosedDeal[]): SuccessPatterns {
  // =========================================
  // ZIP CODE ANALYSIS
  // =========================================
  const zipStats = new Map<string, {
    count: number;
    profit: number;
    daysToClose: number[];
    lastDate: Date;
  }>();
  
  for (const deal of deals) {
    const zip = deal.properties.zip_code;
    const existing = zipStats.get(zip) || { count: 0, profit: 0, daysToClose: [], lastDate: new Date(0) };
    
    zipStats.set(zip, {
      count: existing.count + 1,
      profit: existing.profit + (deal.assignment_fee || 0),
      daysToClose: [...existing.daysToClose, deal.days_to_close || 0],
      lastDate: new Date(deal.closed_at) > existing.lastDate 
        ? new Date(deal.closed_at) 
        : existing.lastDate
    });
  }
  
  const successfulZipCodes = Array.from(zipStats.entries())
    .map(([zipCode, stats]) => ({
      zipCode,
      closedCount: stats.count,
      totalProfit: stats.profit,
      avgProfit: Math.round(stats.profit / stats.count),
      avgDaysToClose: Math.round(
        stats.daysToClose.reduce((a, b) => a + b, 0) / stats.daysToClose.length
      ),
      lastCloseDate: stats.lastDate.toISOString()
    }))
    .sort((a, b) => b.closedCount - a.closedCount);
  
  // =========================================
  // CITY ANALYSIS
  // =========================================
  const cityStats = new Map<string, { count: number; profit: number }>();
  
  for (const deal of deals) {
    const key = `${deal.properties.city}|${deal.properties.state}`;
    const existing = cityStats.get(key) || { count: 0, profit: 0 };
    
    cityStats.set(key, {
      count: existing.count + 1,
      profit: existing.profit + (deal.assignment_fee || 0)
    });
  }
  
  const successfulCities = Array.from(cityStats.entries())
    .map(([key, stats]) => {
      const [city, state] = key.split('|');
      return { city, state, closedCount: stats.count, totalProfit: stats.profit };
    })
    .sort((a, b) => b.closedCount - a.closedCount);
  
  // =========================================
  // PROPERTY TYPE ANALYSIS
  // =========================================
  const typeStats = new Map<string, { count: number; profit: number; daysToClose: number[] }>();
  
  for (const deal of deals) {
    const type = deal.properties.property_type || 'Unknown';
    const existing = typeStats.get(type) || { count: 0, profit: 0, daysToClose: [] };
    
    typeStats.set(type, {
      count: existing.count + 1,
      profit: existing.profit + (deal.assignment_fee || 0),
      daysToClose: [...existing.daysToClose, deal.days_to_close || 0]
    });
  }
  
  const successfulPropertyTypes = Array.from(typeStats.entries())
    .map(([type, stats]) => ({
      type,
      closedCount: stats.count,
      avgProfit: Math.round(stats.profit / stats.count),
      avgDaysToClose: Math.round(
        stats.daysToClose.reduce((a, b) => a + b, 0) / stats.daysToClose.length
      )
    }))
    .sort((a, b) => b.closedCount - a.closedCount);
  
  // =========================================
  // PRICE RANGE ANALYSIS
  // =========================================
  const prices = deals
    .map(d => d.offer_price || d.properties.last_sale_price)
    .filter(Boolean) as number[];
  
  const sortedPrices = [...prices].sort((a, b) => a - b);
  const median = sortedPrices[Math.floor(sortedPrices.length / 2)];
  
  // Find sweet spot (price bucket with most closes)
  const priceBuckets = new Map<number, number>();
  const bucketSize = 25000; // $25k buckets
  for (const price of prices) {
    const bucket = Math.floor(price / bucketSize) * bucketSize;
    priceBuckets.set(bucket, (priceBuckets.get(bucket) || 0) + 1);
  }
  const sweetSpotBucket = Array.from(priceBuckets.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || median;
  
  const priceRange = {
    min: Math.min(...prices),
    max: Math.max(...prices),
    median,
    sweetSpot: sweetSpotBucket + bucketSize / 2,
    avgOfferToAskingRatio: calculateOfferToAskingRatio(deals)
  };
  
  // =========================================
  // BEDROOM ANALYSIS
  // =========================================
  const bedroomCounts = new Map<number, number>();
  for (const deal of deals) {
    const beds = deal.properties.bedrooms || 0;
    bedroomCounts.set(beds, (bedroomCounts.get(beds) || 0) + 1);
  }
  
  const allBeds = deals.map(d => d.properties.bedrooms).filter(Boolean) as number[];
  const mostSuccessfulBeds = Array.from(bedroomCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 3;
  
  const bedroomPreference = {
    min: Math.min(...allBeds),
    max: Math.max(...allBeds),
    mostSuccessful: mostSuccessfulBeds
  };
  
  // =========================================
  // SQFT ANALYSIS
  // =========================================
  const sqfts = deals
    .map(d => d.properties.square_footage)
    .filter(Boolean) as number[];
  
  const sqftRange = sqfts.length > 0 ? {
    min: Math.min(...sqfts),
    max: Math.max(...sqfts),
    avg: Math.round(sqfts.reduce((a, b) => a + b, 0) / sqfts.length)
  } : null;
  
  // =========================================
  // YEAR BUILT ANALYSIS
  // =========================================
  const yearBuilts = deals
    .map(d => d.properties.year_built)
    .filter(Boolean) as number[];
  
  const olderHomeCount = yearBuilts.filter(y => y < 1980).length;
  
  const yearBuiltRange = yearBuilts.length > 0 ? {
    min: Math.min(...yearBuilts),
    max: Math.max(...yearBuilts),
    preferOlder: olderHomeCount / yearBuilts.length > 0.5
  } : null;
  
  // =========================================
  // FILTER ANALYSIS
  // =========================================
  const filterStats = new Map<string, { used: number; closed: number; profit: number }>();
  
  for (const deal of deals) {
    const filters = deal.filter_templates_used || [];
    for (const filter of filters) {
      const existing = filterStats.get(filter) || { used: 0, closed: 0, profit: 0 };
      filterStats.set(filter, {
        used: existing.used + 1,
        closed: existing.closed + 1, // All deals in this loop are closed
        profit: existing.profit + (deal.assignment_fee || 0)
      });
    }
  }
  
  const successfulFilters = Array.from(filterStats.entries())
    .map(([filterSlug, stats]) => ({
      filterSlug,
      usedCount: stats.used,
      closedCount: stats.closed,
      successRate: stats.closed / stats.used,
      avgProfit: Math.round(stats.profit / stats.closed)
    }))
    .sort((a, b) => b.closedCount - a.closedCount);
  
  // Filter combinations
  const comboStats = new Map<string, { count: number; profit: number }>();
  for (const deal of deals) {
    const filters = (deal.filter_templates_used || []).sort();
    if (filters.length >= 2) {
      const key = filters.join('|');
      const existing = comboStats.get(key) || { count: 0, profit: 0 };
      comboStats.set(key, {
        count: existing.count + 1,
        profit: existing.profit + (deal.assignment_fee || 0)
      });
    }
  }
  
  const successfulFilterCombos = Array.from(comboStats.entries())
    .map(([key, stats]) => ({
      filters: key.split('|'),
      closedCount: stats.count,
      avgProfit: Math.round(stats.profit / stats.count)
    }))
    .sort((a, b) => b.closedCount - a.closedCount)
    .slice(0, 5);
  
  // =========================================
  // BUYER NETWORK ANALYSIS
  // =========================================
  const buyerStats = new Map<string, { 
    buyers: Set<string>; 
    daysToAssign: number[];
    lastAssignment: Date;
  }>();
  
  for (const deal of deals) {
    if (deal.assigned_to_buyer_id) {
      const zip = deal.properties.zip_code;
      const existing = buyerStats.get(zip) || { 
        buyers: new Set(), 
        daysToAssign: [],
        lastAssignment: new Date(0)
      };
      
      existing.buyers.add(deal.assigned_to_buyer_id);
      if (deal.days_to_assign) {
        existing.daysToAssign.push(deal.days_to_assign);
      }
      if (new Date(deal.closed_at) > existing.lastAssignment) {
        existing.lastAssignment = new Date(deal.closed_at);
      }
      
      buyerStats.set(zip, existing);
    }
  }
  
  const buyerNetworkByZip = Array.from(buyerStats.entries())
    .map(([zipCode, stats]) => ({
      zipCode,
      activeBuyers: stats.buyers.size,
      avgDaysToAssign: stats.daysToAssign.length > 0
        ? Math.round(stats.daysToAssign.reduce((a, b) => a + b, 0) / stats.daysToAssign.length)
        : null,
      lastAssignment: stats.lastAssignment.toISOString()
    }))
    .sort((a, b) => b.activeBuyers - a.activeBuyers);
  
  // =========================================
  // TIMING ANALYSIS
  // =========================================
  const daysToCloseArr = deals.map(d => d.days_to_close).filter(Boolean) as number[];
  const avgDaysToClose = daysToCloseArr.length > 0
    ? Math.round(daysToCloseArr.reduce((a, b) => a + b, 0) / daysToCloseArr.length)
    : null;
  
  const daysToAssignArr = deals.map(d => d.days_to_assign).filter(Boolean) as number[];
  const avgDaysToAssign = daysToAssignArr.length > 0
    ? Math.round(daysToAssignArr.reduce((a, b) => a + b, 0) / daysToAssignArr.length)
    : null;
  
  // Day of week analysis
  const dayOfWeekCounts = new Map<number, number>();
  for (const deal of deals) {
    const day = new Date(deal.closed_at).getDay();
    dayOfWeekCounts.set(day, (dayOfWeekCounts.get(day) || 0) + 1);
  }
  const bestDayOfWeek = Array.from(dayOfWeekCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  
  // Month analysis
  const monthCounts = new Map<number, number>();
  for (const deal of deals) {
    const month = new Date(deal.closed_at).getMonth() + 1;
    monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
  }
  const bestMonthOfYear = Array.from(monthCounts.entries())
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  
  return {
    successfulZipCodes,
    successfulCities,
    successfulPropertyTypes,
    priceRange,
    bedroomPreference,
    sqftRange,
    yearBuiltRange,
    successfulFilters,
    successfulFilterCombos,
    buyerNetworkByZip,
    avgDaysToClose,
    avgDaysToAssign,
    bestDayOfWeek,
    bestMonthOfYear
  };
}

/**
 * Generate natural language description of profile for embedding
 */
function generateProfileDescription(profile: SuccessPatterns): string {
  const parts: string[] = [];
  
  if (profile.successfulZipCodes.length > 0) {
    const topZips = profile.successfulZipCodes.slice(0, 5);
    parts.push(`Most successful in zip codes: ${topZips.map(z => z.zipCode).join(', ')}`);
  }
  
  if (profile.successfulPropertyTypes.length > 0) {
    parts.push(`Prefers ${profile.successfulPropertyTypes[0].type} properties`);
  }
  
  if (profile.priceRange) {
    parts.push(`Price range $${profile.priceRange.min.toLocaleString()} to $${profile.priceRange.max.toLocaleString()}`);
    parts.push(`Sweet spot around $${profile.priceRange.sweetSpot.toLocaleString()}`);
  }
  
  if (profile.bedroomPreference) {
    parts.push(`${profile.bedroomPreference.mostSuccessful} bedroom properties most successful`);
  }
  
  if (profile.successfulFilters.length > 0) {
    const topFilters = profile.successfulFilters.slice(0, 3);
    parts.push(`Best results with: ${topFilters.map(f => f.filterSlug).join(', ')} filters`);
  }
  
  if (profile.yearBuiltRange?.preferOlder) {
    parts.push('Prefers older homes built before 1980');
  }
  
  return parts.join('. ');
}

function calculateOfferToAskingRatio(deals: ClosedDeal[]): number {
  const ratios: number[] = [];
  
  for (const deal of deals) {
    const offer = deal.offer_price;
    const asking = deal.properties.last_sale_price;
    
    if (offer && asking && asking > 0) {
      ratios.push(offer / asking);
    }
  }
  
  if (ratios.length === 0) return 1;
  
  return ratios.reduce((a, b) => a + b, 0) / ratios.length;
}
```

---

## 6. Property Matching Algorithm

### Match Score Calculator

```typescript
// lib/recommendations/property-matcher.ts

import { createClient } from '@/lib/supabase/server';

export interface PropertyMatch {
  propertyId: string;
  property: Property;
  matchScore: number;
  matchReasons: string[];
  matchBreakdown: {
    zipScore: number;
    typeScore: number;
    priceScore: number;
    bedroomScore: number;
    filterScore: number;
    buyerNetworkScore: number;
  };
  similarClosedDeals: Array<{
    id: string;
    address: string;
    profit: number;
  }>;
  estimatedSuccessProbability: number;
}

/**
 * Calculate match score for a property against user's success profile
 */
export function calculateMatchScore(
  property: Property,
  profile: UserSuccessProfile
): { score: number; reasons: string[]; breakdown: PropertyMatch['matchBreakdown'] } {
  const reasons: string[] = [];
  const breakdown = {
    zipScore: 0,
    typeScore: 0,
    priceScore: 0,
    bedroomScore: 0,
    filterScore: 0,
    buyerNetworkScore: 0
  };
  
  // =========================================
  // ZIP CODE MATCH (0-30 points)
  // =========================================
  const zipMatch = profile.successful_zip_codes.find(z => z.zipCode === property.zip_code);
  
  if (zipMatch) {
    // Base score: 15 points just for matching
    breakdown.zipScore = 15;
    
    // Bonus: up to 15 more based on volume
    const volumeBonus = Math.min(15, zipMatch.closedCount * 3);
    breakdown.zipScore += volumeBonus;
    
    reasons.push(`You've closed ${zipMatch.closedCount} deal(s) in ${property.zip_code} (avg $${zipMatch.avgProfit.toLocaleString()} profit)`);
  } else {
    // Check if nearby zip (same first 3 digits = same region)
    const nearbyMatch = profile.successful_zip_codes.find(z => 
      z.zipCode.substring(0, 3) === property.zip_code.substring(0, 3)
    );
    
    if (nearbyMatch) {
      breakdown.zipScore = 10;
      reasons.push(`Near your successful area (${nearbyMatch.zipCode})`);
    }
  }
  
  // =========================================
  // PROPERTY TYPE MATCH (0-15 points)
  // =========================================
  const typeMatch = profile.successful_property_types.find(t => 
    t.type.toLowerCase() === property.property_type?.toLowerCase()
  );
  
  if (typeMatch) {
    breakdown.typeScore = 15;
    reasons.push(`${property.property_type} matches your specialty (${typeMatch.closedCount} closed)`);
  } else if (profile.successful_property_types.length === 0) {
    // No preference established, give partial credit
    breakdown.typeScore = 7;
  }
  
  // =========================================
  // PRICE RANGE MATCH (0-20 points)
  // =========================================
  const price = property.last_sale_price || property.estimated_value;
  
  if (price && profile.price_range) {
    const { min, max, sweetSpot } = profile.price_range;
    const buffer = 0.15; // 15% buffer outside range
    
    if (price >= min * (1 - buffer) && price <= max * (1 + buffer)) {
      breakdown.priceScore = 12;
      reasons.push(`Price $${price.toLocaleString()} fits your range ($${min.toLocaleString()}-$${max.toLocaleString()})`);
      
      // Bonus for being near sweet spot
      const distanceFromSweetSpot = Math.abs(price - sweetSpot);
      const sweetSpotBonus = Math.max(0, 8 - (distanceFromSweetSpot / sweetSpot) * 16);
      breakdown.priceScore += Math.round(sweetSpotBonus);
      
      if (sweetSpotBonus > 4) {
        reasons.push(`Near your sweet spot of $${sweetSpot.toLocaleString()}`);
      }
    }
  }
  
  // =========================================
  // BEDROOM MATCH (0-10 points)
  // =========================================
  const beds = property.bedrooms;
  
  if (beds && profile.bedroom_preference) {
    if (beds === profile.bedroom_preference.mostSuccessful) {
      breakdown.bedroomScore = 10;
      reasons.push(`${beds}BR matches your most successful bedroom count`);
    } else if (beds >= profile.bedroom_preference.min && beds <= profile.bedroom_preference.max) {
      breakdown.bedroomScore = 5;
    }
  }
  
  // =========================================
  // FILTER MATCH (0-15 points)
  // =========================================
  const propertyFilters = detectApplicableFilters(property);
  
  const matchingFilters = propertyFilters.filter(f => 
    profile.successful_filters.some(sf => sf.filterSlug === f)
  );
  
  if (matchingFilters.length > 0) {
    // 5 points per matching filter, max 15
    breakdown.filterScore = Math.min(15, matchingFilters.length * 5);
    
    const filterNames = matchingFilters.join(', ');
    const bestFilter = profile.successful_filters.find(f => matchingFilters.includes(f.filterSlug));
    
    if (bestFilter) {
      reasons.push(`Matches ${filterNames} filter(s) (${Math.round(bestFilter.successRate * 100)}% success rate)`);
    } else {
      reasons.push(`Matches successful filter(s): ${filterNames}`);
    }
  }
  
  // =========================================
  // BUYER NETWORK SCORE (0-10 points)
  // =========================================
  const buyerNetwork = profile.buyer_network_by_zip.find(b => b.zipCode === property.zip_code);
  
  if (buyerNetwork && buyerNetwork.activeBuyers >= 1) {
    breakdown.buyerNetworkScore = Math.min(10, buyerNetwork.activeBuyers * 3);
    reasons.push(`You have ${buyerNetwork.activeBuyers} active buyer(s) in this zip`);
  }
  
  // =========================================
  // CALCULATE TOTAL
  // =========================================
  const totalScore = 
    breakdown.zipScore + 
    breakdown.typeScore + 
    breakdown.priceScore + 
    breakdown.bedroomScore + 
    breakdown.filterScore + 
    breakdown.buyerNetworkScore;
  
  return {
    score: Math.min(100, totalScore),
    reasons,
    breakdown
  };
}

/**
 * Detect which filters apply to a property
 */
function detectApplicableFilters(property: Property): string[] {
  const filters: string[] = [];
  
  // Absentee owner
  if (property.owner_occupied === false) {
    filters.push('absentee-owner');
  }
  
  // Tired landlord (10+ years ownership, absentee)
  const ownershipYears = calculateOwnershipYears(property.last_sale_date);
  if (ownershipYears >= 10 && property.owner_occupied === false) {
    filters.push('tired-landlord');
  }
  
  // Out of state
  if (property.owner_data?.mailingAddress?.state && 
      property.owner_data.mailingAddress.state !== property.state) {
    filters.push('out-of-state');
  }
  
  // Free and clear (estimate based on ownership duration)
  if (ownershipYears >= 30) {
    filters.push('free-and-clear');
  }
  
  // High equity (estimate)
  const equityPercent = estimateEquityPercent(property);
  if (equityPercent >= 50) {
    filters.push('high-equity');
  }
  
  // Add more filter detection as data allows...
  
  return filters;
}

function calculateOwnershipYears(lastSaleDate?: string): number {
  if (!lastSaleDate) return 0;
  const years = (Date.now() - new Date(lastSaleDate).getTime()) / (365 * 24 * 60 * 60 * 1000);
  return Math.floor(years);
}

function estimateEquityPercent(property: Property): number {
  // Simple estimation based on ownership duration and appreciation
  const lastSalePrice = property.last_sale_price || 0;
  const currentValue = property.estimated_value || lastSalePrice;
  const ownershipYears = calculateOwnershipYears(property.last_sale_date);
  
  if (lastSalePrice === 0 || currentValue === 0) return 0;
  
  // Estimate remaining mortgage (30-year amortization, 7% rate)
  const loanAmount = lastSalePrice * 0.8; // Assume 80% LTV
  const yearsOfPayments = Math.min(ownershipYears, 30);
  
  // Rough estimate: after 15 years, ~50% paid off; after 30, 100%
  const percentPaidOff = Math.min(1, yearsOfPayments / 20);
  const estimatedBalance = loanAmount * (1 - percentPaidOff);
  
  const equity = currentValue - estimatedBalance;
  return Math.round((equity / currentValue) * 100);
}

/**
 * Find properties matching user's success profile
 */
export async function findMatchingProperties(
  userId: string,
  options: {
    limit?: number;
    minScore?: number;
    onlyNewProperties?: boolean;
    excludePropertyIds?: string[];
  } = {}
): Promise<PropertyMatch[]> {
  const { limit = 20, minScore = 50, onlyNewProperties = false, excludePropertyIds = [] } = options;
  
  const supabase = createClient();
  
  // Get user's success profile
  const { data: profile } = await supabase
    .from('user_success_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (!profile || profile.total_closed_deals === 0) {
    return []; // No history to base recommendations on
  }
  
  // Get user's existing deals to exclude
  const { data: existingDeals } = await supabase
    .from('deals')
    .select('property_id')
    .eq('user_id', userId);
  
  const existingPropertyIds = new Set([
    ...excludePropertyIds,
    ...(existingDeals?.map(d => d.property_id) || [])
  ]);
  
  // Get candidate properties from successful zip codes
  const successZips = profile.successful_zip_codes.map((z: any) => z.zipCode);
  
  let propertyQuery = supabase
    .from('properties')
    .select('*')
    .in('zip_code', successZips)
    .limit(200); // Get more than needed, will filter by score
  
  if (onlyNewProperties) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    propertyQuery = propertyQuery.gte('cached_at', yesterday.toISOString());
  }
  
  const { data: candidates } = await propertyQuery;
  
  if (!candidates?.length) return [];
  
  // Score each property
  const matches: PropertyMatch[] = [];
  
  for (const property of candidates) {
    if (existingPropertyIds.has(property.id)) continue;
    
    const { score, reasons, breakdown } = calculateMatchScore(property, profile);
    
    if (score >= minScore) {
      // Find similar closed deals
      const similarDeals = await findSimilarClosedDeals(userId, property, profile);
      
      matches.push({
        propertyId: property.id,
        property,
        matchScore: score,
        matchReasons: reasons,
        matchBreakdown: breakdown,
        similarClosedDeals: similarDeals,
        estimatedSuccessProbability: estimateSuccessProbability(score, profile)
      });
    }
  }
  
  // Sort by score and return top matches
  return matches
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
}

async function findSimilarClosedDeals(
  userId: string,
  property: Property,
  profile: UserSuccessProfile
): Promise<PropertyMatch['similarClosedDeals']> {
  const supabase = createClient();
  
  // Find closed deals in same zip with similar characteristics
  const { data: deals } = await supabase
    .from('deals')
    .select(`
      id,
      assignment_fee,
      properties (formatted_address)
    `)
    .eq('user_id', userId)
    .eq('status', 'closed')
    .eq('properties.zip_code', property.zip_code)
    .limit(3);
  
  return (deals || []).map(d => ({
    id: d.id,
    address: d.properties?.formatted_address || 'Unknown',
    profit: d.assignment_fee || 0
  }));
}

function estimateSuccessProbability(score: number, profile: UserSuccessProfile): number {
  // Base probability from profile's overall closing rate
  const baseRate = profile.closing_rate || 0.2;
  
  // Adjust based on match score
  // Score 100 = 1.5x base rate
  // Score 50 = 1.0x base rate
  // Score 0 = 0.5x base rate
  const multiplier = 0.5 + (score / 100);
  
  return Math.min(0.95, baseRate * multiplier);
}
```

---

## 7. Recommendation Triggers

### Trigger Events

```typescript
// lib/recommendations/triggers.ts

import { createClient } from '@/lib/supabase/server';
import { rebuildSuccessProfile } from './profile-builder';
import { findMatchingProperties } from './property-matcher';
import { createNotification } from '@/lib/notifications/notification-service';

/**
 * TRIGGER 1: When user closes a deal
 */
export async function onDealClosed(userId: string, dealId: string): Promise<void> {
  // 1. Update success profile
  await rebuildSuccessProfile(userId);
  
  // 2. Find new recommendations based on updated profile
  const recommendations = await findMatchingProperties(userId, {
    limit: 5,
    minScore: 65,
    onlyNewProperties: false
  });
  
  // 3. Store recommendations
  await storePendingRecommendations(userId, recommendations);
  
  // 4. Notify user
  if (recommendations.length > 0) {
    await createNotification({
      userId,
      type: 'recommendation',
      title: '🎯 Properties matching your success pattern',
      message: `Based on your recent close, we found ${recommendations.length} similar opportunities`,
      data: { 
        source: 'deal_close',
        count: recommendations.length,
        topScore: recommendations[0].matchScore
      }
    });
  }
}

/**
 * TRIGGER 2: When new property is cached (from RentCast)
 */
export async function onPropertyCached(property: Property): Promise<void> {
  const supabase = createClient();
  
  // Find users with successful history in this zip code
  const { data: profiles } = await supabase
    .from('user_success_profiles')
    .select('user_id, successful_zip_codes, total_closed_deals')
    .gt('total_closed_deals', 0);
  
  if (!profiles?.length) return;
  
  // Filter to users with success in this zip
  const relevantUsers = profiles.filter(p => 
    p.successful_zip_codes.some((z: any) => z.zipCode === property.zip_code)
  );
  
  // Score property for each relevant user
  for (const profile of relevantUsers) {
    const fullProfile = await getFullProfile(profile.user_id);
    if (!fullProfile) continue;
    
    const { score, reasons, breakdown } = calculateMatchScore(property, fullProfile);
    
    // Only notify for high-confidence matches
    if (score >= 70) {
      await storePendingRecommendation(profile.user_id, {
        propertyId: property.id,
        property,
        matchScore: score,
        matchReasons: reasons,
        matchBreakdown: breakdown,
        similarClosedDeals: [],
        estimatedSuccessProbability: 0
      });
      
      await createNotification({
        userId: profile.user_id,
        type: 'recommendation',
        title: '🏠 New property matches your success pattern',
        message: `${property.formatted_address} - ${score}% match`,
        propertyId: property.id,
        data: { 
          source: 'new_property',
          score,
          reasons
        }
      });
    }
  }
}

/**
 * TRIGGER 3: Daily digest (cron job)
 */
export async function generateDailyDigests(): Promise<void> {
  const supabase = createClient();
  
  // Get all users with success profiles updated in last 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const { data: activeUsers } = await supabase
    .from('user_success_profiles')
    .select('user_id')
    .gte('updated_at', ninetyDaysAgo.toISOString())
    .gt('total_closed_deals', 0);
  
  if (!activeUsers?.length) return;
  
  for (const { user_id } of activeUsers) {
    // Check user's notification preferences
    const { data: prefs } = await supabase
      .from('user_preferences')
      .select('notify_new_leads, notification_frequency')
      .eq('user_id', user_id)
      .single();
    
    if (!prefs?.notify_new_leads) continue;
    if (prefs.notification_frequency !== 'daily') continue;
    
    // Find recommendations from last 24 hours
    const recommendations = await findMatchingProperties(user_id, {
      limit: 10,
      minScore: 55,
      onlyNewProperties: true
    });
    
    if (recommendations.length > 0) {
      await sendDailyDigestEmail(user_id, recommendations);
    }
  }
}

/**
 * Store pending recommendations for retrieval
 */
async function storePendingRecommendations(
  userId: string, 
  recommendations: PropertyMatch[]
): Promise<void> {
  const supabase = createClient();
  
  const records = recommendations.map(rec => ({
    user_id: userId,
    property_id: rec.propertyId,
    match_score: rec.matchScore,
    match_reasons: rec.matchReasons,
    similar_closed_deals: rec.similarClosedDeals.map(d => d.id),
    status: 'pending'
  }));
  
  await supabase
    .from('pending_recommendations')
    .upsert(records, { onConflict: 'user_id,property_id' });
}

async function storePendingRecommendation(
  userId: string, 
  recommendation: PropertyMatch
): Promise<void> {
  await storePendingRecommendations(userId, [recommendation]);
}

async function getFullProfile(userId: string): Promise<UserSuccessProfile | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from('user_success_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  return data;
}

async function sendDailyDigestEmail(
  userId: string, 
  recommendations: PropertyMatch[]
): Promise<void> {
  // TODO: Integrate with email service (Resend, SendGrid)
  console.log(`Would send digest to ${userId} with ${recommendations.length} recommendations`);
}
```

### Cron Job Setup

```typescript
// app/api/cron/daily-recommendations/route.ts

import { generateDailyDigests } from '@/lib/recommendations/triggers';

export async function GET() {
  await generateDailyDigests();
  
  return Response.json({
    message: 'Daily digests generated',
    timestamp: new Date().toISOString()
  });
}

// vercel.json
/*
{
  "crons": [
    {
      "path": "/api/cron/daily-recommendations",
      "schedule": "0 8 * * *"  // 8 AM daily
    }
  ]
}
*/
```

---

## 8. Learning & Feedback Loop

### Interaction Tracking

```typescript
// lib/recommendations/interaction-tracker.ts

import { createClient } from '@/lib/supabase/server';

type InteractionAction = 'viewed' | 'dismissed' | 'saved' | 'created_deal' | 'closed_deal';

export async function trackInteraction(
  userId: string,
  propertyId: string,
  action: InteractionAction,
  metadata?: {
    matchScore?: number;
    matchReasons?: string[];
    source?: string;
  }
): Promise<void> {
  const supabase = createClient();
  
  await supabase.from('recommendation_interactions').insert({
    user_id: userId,
    property_id: propertyId,
    action,
    match_score: metadata?.matchScore,
    match_reasons: metadata?.matchReasons,
    source: metadata?.source || 'unknown'
  });
  
  // Update pending recommendation status if exists
  if (action === 'viewed' || action === 'dismissed' || action === 'created_deal') {
    const newStatus = action === 'dismissed' ? 'dismissed' : 
                      action === 'created_deal' ? 'actioned' : 'viewed';
    
    await supabase
      .from('pending_recommendations')
      .update({ status: newStatus })
      .eq('user_id', userId)
      .eq('property_id', propertyId);
  }
}

/**
 * Analyze interaction patterns to improve recommendations
 */
export async function analyzeInteractionPatterns(userId: string): Promise<{
  viewToActionRate: number;
  avgScoreActioned: number;
  avgScoreDismissed: number;
  preferredSources: string[];
}> {
  const supabase = createClient();
  
  const { data: interactions } = await supabase
    .from('recommendation_interactions')
    .select('*')
    .eq('user_id', userId);
  
  if (!interactions?.length) {
    return {
      viewToActionRate: 0,
      avgScoreActioned: 0,
      avgScoreDismissed: 0,
      preferredSources: []
    };
  }
  
  const viewed = interactions.filter(i => i.action === 'viewed');
  const actioned = interactions.filter(i => 
    i.action === 'created_deal' || i.action === 'closed_deal'
  );
  const dismissed = interactions.filter(i => i.action === 'dismissed');
  
  const viewToActionRate = viewed.length > 0 
    ? actioned.length / viewed.length 
    : 0;
  
  const avgScoreActioned = actioned.length > 0
    ? actioned.reduce((sum, i) => sum + (i.match_score || 0), 0) / actioned.length
    : 0;
  
  const avgScoreDismissed = dismissed.length > 0
    ? dismissed.reduce((sum, i) => sum + (i.match_score || 0), 0) / dismissed.length
    : 0;
  
  // Find sources that lead to actions
  const sourceSuccess = new Map<string, { actions: number; views: number }>();
  for (const i of interactions) {
    const source = i.source || 'unknown';
    const existing = sourceSuccess.get(source) || { actions: 0, views: 0 };
    
    if (i.action === 'created_deal' || i.action === 'closed_deal') {
      existing.actions++;
    }
    if (i.action === 'viewed') {
      existing.views++;
    }
    
    sourceSuccess.set(source, existing);
  }
  
  const preferredSources = Array.from(sourceSuccess.entries())
    .filter(([, stats]) => stats.views > 0 && stats.actions / stats.views > 0.1)
    .map(([source]) => source);
  
  return {
    viewToActionRate,
    avgScoreActioned,
    avgScoreDismissed,
    preferredSources
  };
}
```

### Adaptive Threshold

```typescript
// lib/recommendations/adaptive-threshold.ts

/**
 * Adjust minimum score threshold based on user's interaction patterns
 */
export async function getAdaptiveThreshold(userId: string): Promise<number> {
  const patterns = await analyzeInteractionPatterns(userId);
  
  // Default threshold
  let threshold = 55;
  
  // If user actions on high-score items, increase threshold
  if (patterns.avgScoreActioned > 70) {
    threshold = Math.round(patterns.avgScoreActioned - 10);
  }
  
  // If user dismisses low-score items, increase threshold
  if (patterns.avgScoreDismissed > 0 && patterns.avgScoreDismissed < 60) {
    threshold = Math.max(threshold, Math.round(patterns.avgScoreDismissed + 10));
  }
  
  // If user has high action rate, can lower threshold slightly
  if (patterns.viewToActionRate > 0.2) {
    threshold = Math.max(50, threshold - 5);
  }
  
  return Math.min(80, Math.max(50, threshold));
}
```

---

## 9. API Endpoints

### Get Recommendations

```typescript
// app/api/recommendations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { findMatchingProperties } from '@/lib/recommendations/property-matcher';
import { getAdaptiveThreshold } from '@/lib/recommendations/adaptive-threshold';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '10');
  const onlyNew = searchParams.get('onlyNew') === 'true';
  
  // Get adaptive threshold for this user
  const minScore = await getAdaptiveThreshold(user.id);
  
  const recommendations = await findMatchingProperties(user.id, {
    limit,
    minScore,
    onlyNewProperties: onlyNew
  });
  
  return NextResponse.json({
    recommendations,
    meta: {
      minScoreUsed: minScore,
      count: recommendations.length
    }
  });
}
```

### Track Interaction

```typescript
// app/api/recommendations/[propertyId]/interaction/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { trackInteraction } from '@/lib/recommendations/interaction-tracker';

export async function POST(
  request: NextRequest,
  { params }: { params: { propertyId: string } }
) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { action, matchScore, matchReasons, source } = await request.json();
  
  if (!['viewed', 'dismissed', 'saved', 'created_deal', 'closed_deal'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }
  
  await trackInteraction(user.id, params.propertyId, action, {
    matchScore,
    matchReasons,
    source
  });
  
  return NextResponse.json({ success: true });
}
```

### Get User's Success Profile

```typescript
// app/api/profile/success/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { data: profile, error } = await supabase
    .from('user_success_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  
  if (error || !profile) {
    return NextResponse.json({ 
      hasProfile: false,
      message: 'Close your first deal to build your success profile'
    });
  }
  
  return NextResponse.json({
    hasProfile: true,
    profile: {
      totalClosedDeals: profile.total_closed_deals,
      totalProfit: profile.total_profit,
      avgProfitPerDeal: profile.avg_profit_per_deal,
      closingRate: profile.closing_rate,
      topZipCodes: profile.successful_zip_codes.slice(0, 5),
      topPropertyTypes: profile.successful_property_types.slice(0, 3),
      topFilters: profile.successful_filters.slice(0, 5),
      priceRange: profile.price_range,
      lastDealClosed: profile.last_deal_closed_at,
      updatedAt: profile.updated_at
    }
  });
}
```

---

## 10. UI Components

### Recommendation Card

```typescript
// components/recommendations/RecommendationCard.tsx

'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PropertyMatch } from '@/lib/recommendations/property-matcher';

interface RecommendationCardProps {
  recommendation: PropertyMatch;
  onView: (propertyId: string) => void;
  onDismiss: (propertyId: string) => void;
  onCreateDeal: (propertyId: string) => void;
}

export function RecommendationCard({
  recommendation,
  onView,
  onDismiss,
  onCreateDeal
}: RecommendationCardProps) {
  const { property, matchScore, matchReasons, similarClosedDeals, matchBreakdown } = recommendation;
  const [isExpanded, setIsExpanded] = useState(false);
  
  const matchLevel = matchScore >= 75 ? 'Hot' : matchScore >= 60 ? 'Good' : 'Possible';
  const matchColor = matchScore >= 75 ? 'bg-red-500' : matchScore >= 60 ? 'bg-orange-500' : 'bg-blue-500';
  
  return (
    <Card className="relative overflow-hidden border-l-4 border-l-primary-500 hover:shadow-lg transition-shadow">
      {/* Match Score Badge */}
      <div className="absolute top-3 right-3 flex items-center gap-2">
        <Badge className={matchColor}>{matchLevel}</Badge>
        <span className="text-lg font-bold">{matchScore}%</span>
      </div>
      
      <CardHeader className="pb-2">
        <h3 className="font-semibold text-lg pr-24">
          {property.formatted_address}
        </h3>
        <p className="text-sm text-gray-500">
          {property.city}, {property.state} {property.zip_code}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Property Details */}
        <div className="flex gap-4 text-sm">
          <span>{property.bedrooms} bed</span>
          <span>{property.bathrooms} bath</span>
          <span>{property.square_footage?.toLocaleString()} sqft</span>
          <span>{property.property_type}</span>
        </div>
        
        {/* Match Reasons */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Why we're recommending this:
          </h4>
          <ul className="space-y-1">
            {matchReasons.slice(0, isExpanded ? undefined : 3).map((reason, i) => (
              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
          {matchReasons.length > 3 && !isExpanded && (
            <button 
              onClick={() => setIsExpanded(true)}
              className="text-sm text-primary-600 mt-1"
            >
              +{matchReasons.length - 3} more reasons
            </button>
          )}
        </div>
        
        {/* Similar Closed Deals */}
        {similarClosedDeals.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Your similar closed deals:
            </h4>
            <div className="space-y-1">
              {similarClosedDeals.map(deal => (
                <div key={deal.id} className="text-sm flex justify-between">
                  <span className="text-gray-600">{deal.address}</span>
                  <span className="font-medium text-green-600">
                    ${deal.profit.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Score Breakdown (Expanded) */}
        {isExpanded && (
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              Score Breakdown:
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex justify-between">
                <span>Location</span>
                <span className="font-medium">{matchBreakdown.zipScore}/30</span>
              </div>
              <div className="flex justify-between">
                <span>Property Type</span>
                <span className="font-medium">{matchBreakdown.typeScore}/15</span>
              </div>
              <div className="flex justify-between">
                <span>Price</span>
                <span className="font-medium">{matchBreakdown.priceScore}/20</span>
              </div>
              <div className="flex justify-between">
                <span>Bedrooms</span>
                <span className="font-medium">{matchBreakdown.bedroomScore}/10</span>
              </div>
              <div className="flex justify-between">
                <span>Filters</span>
                <span className="font-medium">{matchBreakdown.filterScore}/15</span>
              </div>
              <div className="flex justify-between">
                <span>Buyer Network</span>
                <span className="font-medium">{matchBreakdown.buyerNetworkScore}/10</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex gap-2 pt-4 border-t">
        <Button 
          onClick={() => onView(property.id)} 
          className="flex-1"
        >
          View Property
        </Button>
        <Button 
          onClick={() => onCreateDeal(property.id)} 
          variant="secondary"
        >
          Create Deal
        </Button>
        <Button 
          onClick={() => onDismiss(property.id)} 
          variant="ghost"
          size="sm"
        >
          ✕
        </Button>
      </CardFooter>
    </Card>
  );
}
```

### Success Profile Card

```typescript
// components/profile/SuccessProfileCard.tsx

'use client';

import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface SuccessProfileCardProps {
  profile: {
    totalClosedDeals: number;
    totalProfit: number;
    avgProfitPerDeal: number;
    closingRate: number;
    topZipCodes: Array<{ zipCode: string; closedCount: number }>;
    topFilters: Array<{ filterSlug: string; successRate: number }>;
    priceRange: { min: number; max: number; sweetSpot: number };
  };
}

export function SuccessProfileCard({ profile }: SuccessProfileCardProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold">Your Success Profile</h3>
        <p className="text-sm text-gray-500">
          Based on {profile.totalClosedDeals} closed deals
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-700">
              ${profile.totalProfit.toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Total Profit</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-blue-700">
              {Math.round(profile.closingRate * 100)}%
            </div>
            <div className="text-sm text-blue-600">Close Rate</div>
          </div>
        </div>
        
        {/* Top Zip Codes */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Best Areas</h4>
          <div className="space-y-2">
            {profile.topZipCodes.slice(0, 3).map(zip => (
              <div key={zip.zipCode} className="flex items-center gap-2">
                <span className="text-sm font-medium w-16">{zip.zipCode}</span>
                <Progress value={(zip.closedCount / profile.totalClosedDeals) * 100} />
                <span className="text-sm text-gray-500">{zip.closedCount} deals</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Top Filters */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Best Filters</h4>
          <div className="flex flex-wrap gap-2">
            {profile.topFilters.slice(0, 4).map(filter => (
              <span 
                key={filter.filterSlug}
                className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-sm"
              >
                {filter.filterSlug.replace('-', ' ')}
                <span className="ml-1 text-primary-500">
                  ({Math.round(filter.successRate * 100)}%)
                </span>
              </span>
            ))}
          </div>
        </div>
        
        {/* Price Range */}
        <div>
          <h4 className="text-sm font-semibold mb-2">Price Sweet Spot</h4>
          <div className="flex items-center justify-between text-sm">
            <span>${profile.priceRange.min.toLocaleString()}</span>
            <div className="flex-1 mx-4 relative h-2 bg-gray-200 rounded">
              <div 
                className="absolute top-0 left-0 h-full bg-primary-500 rounded"
                style={{ 
                  left: '0%',
                  width: '100%'
                }}
              />
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary-600 rounded-full border-2 border-white shadow"
                style={{ 
                  left: `${((profile.priceRange.sweetSpot - profile.priceRange.min) / (profile.priceRange.max - profile.priceRange.min)) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            </div>
            <span>${profile.priceRange.max.toLocaleString()}</span>
          </div>
          <div className="text-center text-sm text-gray-500 mt-1">
            Sweet spot: ${profile.priceRange.sweetSpot.toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 11. Implementation Checklist

### Phase 1: Database & Schema (Week 1)

- [ ] Create `user_success_profiles` table
- [ ] Create `recommendation_interactions` table
- [ ] Create `pending_recommendations` table
- [ ] Add `filter_templates_used` column to `deals` table
- [ ] Add timing columns to `deals` table (`days_to_close`, `closed_at`)
- [ ] Set up RLS policies

### Phase 2: Profile Builder (Week 1-2)

- [ ] Implement `analyzePatterns()` function
- [ ] Implement `generateProfileDescription()` for embedding
- [ ] Implement `rebuildSuccessProfile()` 
- [ ] Add trigger to rebuild profile on deal close
- [ ] Test with sample closed deals

### Phase 3: Property Matcher (Week 2)

- [ ] Implement `calculateMatchScore()` with all pattern types
- [ ] Implement `detectApplicableFilters()`
- [ ] Implement `findMatchingProperties()`
- [ ] Implement `findSimilarClosedDeals()`
- [ ] Test scoring accuracy

### Phase 4: Recommendation Triggers (Week 3)

- [ ] Implement `onDealClosed()` trigger
- [ ] Implement `onPropertyCached()` trigger
- [ ] Implement `generateDailyDigests()` cron job
- [ ] Set up Vercel cron configuration
- [ ] Test notification delivery

### Phase 5: Learning & Feedback (Week 3)

- [ ] Implement `trackInteraction()`
- [ ] Implement `analyzeInteractionPatterns()`
- [ ] Implement `getAdaptiveThreshold()`
- [ ] Wire up interaction tracking in UI

### Phase 6: API & UI (Week 4)

- [ ] Create GET `/api/recommendations` endpoint
- [ ] Create POST `/api/recommendations/[id]/interaction` endpoint
- [ ] Create GET `/api/profile/success` endpoint
- [ ] Build `RecommendationCard` component
- [ ] Build `SuccessProfileCard` component
- [ ] Add recommendations section to dashboard
- [ ] Add success profile to user settings

### Phase 7: Testing & Optimization

- [ ] Test with users who have varying numbers of closed deals
- [ ] Test recommendation quality (manual review)
- [ ] Monitor interaction patterns
- [ ] Tune scoring weights based on feedback
- [ ] Performance testing with large datasets

---

## Appendix: Scoring Weight Tuning

The initial weights are educated guesses. After gathering interaction data, tune weights using:

```typescript
// Analysis query to find optimal weights
SELECT 
  action,
  AVG(match_score) as avg_score,
  AVG((match_breakdown->>'zipScore')::int) as avg_zip,
  AVG((match_breakdown->>'typeScore')::int) as avg_type,
  AVG((match_breakdown->>'priceScore')::int) as avg_price,
  AVG((match_breakdown->>'filterScore')::int) as avg_filter
FROM recommendation_interactions
WHERE action IN ('created_deal', 'closed_deal', 'dismissed')
GROUP BY action;
```

If `created_deal` actions correlate more with `filterScore` than `zipScore`, increase filter weight.

---

**End of Document**
