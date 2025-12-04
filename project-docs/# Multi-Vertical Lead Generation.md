# Multi-Vertical Lead Generation Platform Extension

**Version:** 1.0  
**Last Updated:** December 2025  
**Status:** Ready for Implementation - No Interpretation Required

---

## Document Purpose

This document extends the AI-First Real Estate Wholesaling Platform to integrate Shovels.ai permit and contractor data. It adds:

1. **Shovels.ai as a complementary data layer** to RentCast
2. **Permit-based contrarian filters** for wholesaling
3. **Tier 1 home services vertical filters** (Roofing, HVAC, Electrical, Plumbing, Solar)
4. **Calculated heat mapping** using permit activity data
5. **Vertical selection system** for multi-business support

All technology choices are final. There are no "or" options.

---

## Table of Contents

1. [Data Architecture Overview](#1-data-architecture-overview)
2. [Environment Variables](#2-environment-variables)
3. [Database Schema](#3-database-schema)
4. [Shovels API Service](#4-shovels-api-service)
5. [Address Matching Service](#5-address-matching-service)
6. [Heat Mapping System](#6-heat-mapping-system)
7. [Wholesaling Contrarian Filters](#7-wholesaling-contrarian-filters)
8. [Home Services Filters](#8-home-services-filters)
9. [Vertical Selection System](#9-vertical-selection-system)
10. [API Routes](#10-api-routes)
11. [UI Components](#11-ui-components)
12. [Implementation Order](#12-implementation-order)

---

## 1. Data Architecture Overview

### Data Source Responsibilities

| Source | Primary Data | Update Frequency |
|--------|-------------|------------------|
| RentCast | Properties, ownership, valuations, transactions, market data | Daily |
| Shovels.ai | Permits, contractors, construction activity, inspection metrics | Bi-weekly |

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA INTEGRATION                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   RentCast API                      Shovels.ai API                  │
│   ────────────                      ──────────────                  │
│   • Property records                • Permit records                │
│   • Owner information               • Contractor data               │
│   • Valuations (AVM)                • Inspection metrics            │
│   • Transaction history             • Construction timelines        │
│   • Market statistics               • Geographic metrics            │
│                                                                     │
│                    ↓                           ↓                    │
│                                                                     │
│              ┌─────────────────────────────────────┐                │
│              │     ADDRESS MATCHING SERVICE        │                │
│              │  (Links RentCast IDs to Shovels IDs)│                │
│              └─────────────────────────────────────┘                │
│                                                                     │
│                              ↓                                      │
│                                                                     │
│              ┌─────────────────────────────────────┐                │
│              │         SUPABASE POSTGRES           │                │
│              │  • properties (RentCast)            │                │
│              │  • shovels_permits                  │                │
│              │  • shovels_address_metrics          │                │
│              │  • geo_vitality_scores              │                │
│              └─────────────────────────────────────┘                │
│                                                                     │
│                              ↓                                      │
│                                                                     │
│              ┌─────────────────────────────────────┐                │
│              │         FILTER ENGINE               │                │
│              │  • Standard filters (RentCast)      │                │
│              │  • Permit filters (Shovels)         │                │
│              │  • Combined filters (Both)          │                │
│              └─────────────────────────────────────┘                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Shovels.ai Permit Tags (22 Standardized)

```typescript
// lib/shovels/types.ts

export const SHOVELS_PERMIT_TAGS = [
  'addition',
  'adu',
  'bathroom',
  'battery',
  'demolition',
  'electric_meter',
  'electrical',
  'ev_charger',
  'fire_sprinkler',
  'gas',
  'generator',
  'grading',
  'heat_pump',
  'hvac',
  'kitchen',
  'new_construction',
  'plumbing',
  'pool_and_hot_tub',
  'remodel',
  'roofing',
  'solar',
  'water_heater'
] as const;

export type ShovelsPermitTag = typeof SHOVELS_PERMIT_TAGS[number];

export const SHOVELS_PERMIT_STATUS = [
  'active',
  'final',
  'in_review',
  'inactive'
] as const;

export type ShovelsPermitStatus = typeof SHOVELS_PERMIT_STATUS[number];
```

---

## 2. Environment Variables

Add to `.env.local`:

```bash
# ===========================================
# SHOVELS.AI
# ===========================================
SHOVELS_API_KEY=your-shovels-api-key
SHOVELS_API_BASE_URL=https://api.shovels.ai/v2
SHOVELS_RATE_LIMIT_PER_SECOND=10
SHOVELS_CACHE_TTL_PERMITS=2592000
SHOVELS_CACHE_TTL_METRICS=86400

# ===========================================
# FEATURE FLAGS
# ===========================================
ENABLE_SHOVELS_INTEGRATION=true
SHOW_DATA_SOURCE_LABELS=true
ENABLE_HOME_SERVICES_VERTICALS=true
```

---

## 3. Database Schema

### New Tables

```sql
-- ============================================
-- SHOVELS PERMIT DATA
-- ============================================

CREATE TABLE shovels_permits (
  id TEXT PRIMARY KEY,                              -- Shovels permit ID
  address_id TEXT NOT NULL,                         -- Shovels address_id
  property_id TEXT REFERENCES properties(id),       -- Link to RentCast property
  
  -- Permit details
  description TEXT,
  permit_number TEXT,
  jurisdiction TEXT,
  status TEXT CHECK (status IN ('active', 'final', 'in_review', 'inactive')),
  tags TEXT[],                                      -- Array of permit tags
  property_type TEXT,                               -- residential, commercial
  
  -- Financial
  job_value INTEGER,                                -- Estimated job value
  fees INTEGER,                                     -- Permit fees paid
  
  -- Dates
  file_date DATE,                                   -- Date permit filed
  issue_date DATE,                                  -- Date permit issued
  final_date DATE,                                  -- Date of final inspection
  
  -- Metrics
  inspection_pass_rate NUMERIC(5,2),                -- 0-100
  approval_days INTEGER,                            -- Days from file to issue
  construction_days INTEGER,                        -- Days from issue to final
  
  -- Contractor
  contractor_id TEXT,                               -- Shovels contractor ID
  contractor_name TEXT,
  
  -- Address components
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Raw data
  raw_data JSONB,                                   -- Full API response
  
  -- Cache management
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  cache_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SHOVELS ADDRESS METRICS (Aggregated)
-- ============================================

CREATE TABLE shovels_address_metrics (
  address_id TEXT PRIMARY KEY,                      -- Shovels address_id
  property_id TEXT REFERENCES properties(id),       -- Link to RentCast property
  
  -- Permit counts
  total_permits INTEGER DEFAULT 0,
  total_permit_value BIGINT DEFAULT 0,
  permits_last_3_years INTEGER DEFAULT 0,
  permits_last_5_years INTEGER DEFAULT 0,
  
  -- Last permit dates by type
  last_permit_date DATE,
  last_roofing_date DATE,
  last_hvac_date DATE,
  last_electrical_date DATE,
  last_plumbing_date DATE,
  last_solar_date DATE,
  last_water_heater_date DATE,
  last_remodel_date DATE,
  
  -- Distress indicators
  has_stalled_permit BOOLEAN DEFAULT false,         -- in_review > 90 days
  has_failed_inspection BOOLEAN DEFAULT false,      -- pass rate < 50%
  has_expired_permit BOOLEAN DEFAULT false,         -- No final after expected duration
  stalled_permit_count INTEGER DEFAULT 0,
  failed_inspection_count INTEGER DEFAULT 0,
  
  -- Quality metrics
  avg_inspection_pass_rate NUMERIC(5,2),
  avg_construction_days INTEGER,
  
  -- Tag presence flags (for fast filtering)
  has_roofing_permit BOOLEAN DEFAULT false,
  has_hvac_permit BOOLEAN DEFAULT false,
  has_electrical_permit BOOLEAN DEFAULT false,
  has_plumbing_permit BOOLEAN DEFAULT false,
  has_solar_permit BOOLEAN DEFAULT false,
  has_ev_charger_permit BOOLEAN DEFAULT false,
  has_heat_pump_permit BOOLEAN DEFAULT false,
  has_battery_permit BOOLEAN DEFAULT false,
  has_addition_permit BOOLEAN DEFAULT false,
  has_remodel_permit BOOLEAN DEFAULT false,
  
  -- All tags for property
  all_permit_tags TEXT[],
  
  -- Timestamps
  metrics_calculated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- GEOGRAPHIC VITALITY SCORES
-- ============================================

CREATE TABLE geo_vitality_scores (
  geo_id TEXT PRIMARY KEY,                          -- Shovels geo_id
  geo_type TEXT NOT NULL CHECK (geo_type IN ('zip', 'city', 'county', 'jurisdiction')),
  geo_name TEXT,                                    -- Human readable name
  state TEXT,
  
  -- Calculated vitality score (0-100)
  vitality_score NUMERIC(5,2),
  
  -- Component scores (0-100 each)
  permit_volume_score NUMERIC(5,2),                 -- 30% weight
  yoy_growth_score NUMERIC(5,2),                    -- 25% weight
  high_value_ratio_score NUMERIC(5,2),              -- 20% weight
  improvement_ratio_score NUMERIC(5,2),             -- 15% weight
  inspection_pass_score NUMERIC(5,2),               -- 10% weight
  
  -- Raw metrics
  total_permits INTEGER,
  permits_current_year INTEGER,
  permits_prior_year INTEGER,
  yoy_growth_percent NUMERIC(7,2),
  high_value_permit_count INTEGER,                  -- > $50K
  improvement_permit_count INTEGER,                 -- remodel, kitchen, bath, addition
  avg_inspection_pass_rate NUMERIC(5,2),
  avg_permit_value INTEGER,
  active_contractor_count INTEGER,
  
  -- Comparison metrics
  metro_avg_permits INTEGER,                        -- For relative scoring
  
  -- Timestamps
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  data_from_date DATE,
  data_to_date DATE
);

-- ============================================
-- SHOVELS CONTRACTORS
-- ============================================

CREATE TABLE shovels_contractors (
  id TEXT PRIMARY KEY,                              -- Shovels contractor ID
  
  -- Business info
  name TEXT,
  business_name TEXT,
  license_number TEXT,
  license_state TEXT,
  website TEXT,
  
  -- Performance metrics
  total_permits INTEGER,
  lifetime_job_value BIGINT,
  avg_inspection_pass_rate NUMERIC(5,2),
  avg_construction_days INTEGER,
  
  -- Specialties
  permit_tags TEXT[],                               -- Types of work performed
  property_types TEXT[],                            -- residential, commercial
  
  -- Contact (from employees endpoint if available)
  contact_data JSONB,
  
  -- Service area
  service_zip_codes TEXT[],
  service_cities TEXT[],
  service_states TEXT[],
  
  -- Raw data
  raw_data JSONB,
  
  -- Cache
  cached_at TIMESTAMPTZ DEFAULT NOW(),
  cache_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- ============================================
-- USER VERTICALS
-- ============================================

CREATE TABLE user_verticals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- Current selection
  active_vertical TEXT DEFAULT 'wholesaling' CHECK (active_vertical IN (
    'wholesaling', 'roofing', 'hvac', 'electrical', 'plumbing', 'solar'
  )),
  
  -- Available verticals for user
  enabled_verticals TEXT[] DEFAULT ARRAY['wholesaling'],
  
  -- Per-vertical settings
  vertical_settings JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Shovels permits
CREATE INDEX idx_shovels_permits_address_id ON shovels_permits (address_id);
CREATE INDEX idx_shovels_permits_property_id ON shovels_permits (property_id);
CREATE INDEX idx_shovels_permits_status ON shovels_permits (status);
CREATE INDEX idx_shovels_permits_tags ON shovels_permits USING GIN (tags);
CREATE INDEX idx_shovels_permits_file_date ON shovels_permits (file_date);
CREATE INDEX idx_shovels_permits_jurisdiction ON shovels_permits (jurisdiction);
CREATE INDEX idx_shovels_permits_zip_code ON shovels_permits (zip_code);
CREATE INDEX idx_shovels_permits_cache_expires ON shovels_permits (cache_expires_at);

-- Shovels address metrics
CREATE INDEX idx_shovels_metrics_property_id ON shovels_address_metrics (property_id);
CREATE INDEX idx_shovels_metrics_stalled ON shovels_address_metrics (has_stalled_permit) WHERE has_stalled_permit = true;
CREATE INDEX idx_shovels_metrics_failed ON shovels_address_metrics (has_failed_inspection) WHERE has_failed_inspection = true;
CREATE INDEX idx_shovels_metrics_last_roofing ON shovels_address_metrics (last_roofing_date);
CREATE INDEX idx_shovels_metrics_last_hvac ON shovels_address_metrics (last_hvac_date);

-- Geo vitality scores
CREATE INDEX idx_geo_vitality_type ON geo_vitality_scores (geo_type);
CREATE INDEX idx_geo_vitality_score ON geo_vitality_scores (vitality_score DESC);
CREATE INDEX idx_geo_vitality_state ON geo_vitality_scores (state);

-- User verticals
CREATE INDEX idx_user_verticals_user ON user_verticals (user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE user_verticals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own verticals" ON user_verticals
  FOR ALL USING (auth.uid() = user_id);
```

### Update Properties Table

```sql
-- Add Shovels reference to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS shovels_address_id TEXT;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS shovels_matched_at TIMESTAMPTZ;

CREATE INDEX idx_properties_shovels_address_id ON properties (shovels_address_id);
```

---

## 4. Shovels API Service

### Types

```typescript
// lib/shovels/types.ts

export interface ShovelsPermit {
  id: string;
  description: string;
  number: string;
  jurisdiction: string;
  status: ShovelsPermitStatus;
  tags: ShovelsPermitTag[];
  property_type: 'residential' | 'commercial';
  job_value?: number;
  fees?: number;
  file_date?: string;
  issue_date?: string;
  final_date?: string;
  inspection_pass_rate?: number;
  approval_duration?: number;
  construction_duration?: number;
  contractor_id?: string;
  contractor_name?: string;
  geo_ids: {
    address_id: string;
    zip_code: string;
    city_id?: string;
    county_id?: string;
    jurisdiction_id?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
  };
}

export interface ShovelsContractor {
  id: string;
  name: string;
  business_name?: string;
  license_number?: string;
  license_state?: string;
  website?: string;
  total_permits: number;
  lifetime_job_value?: number;
  avg_inspection_pass_rate?: number;
  avg_construction_duration?: number;
  permit_tags: ShovelsPermitTag[];
  property_types: string[];
}

export interface ShovelsGeoMetrics {
  geo_id: string;
  geo_type: 'zip' | 'city' | 'county' | 'jurisdiction';
  name: string;
  state?: string;
  metrics: {
    total_permits: number;
    permits_by_month: Array<{ month: string; count: number }>;
    avg_approval_duration: number;
    avg_construction_duration: number;
    avg_inspection_pass_rate: number;
    permit_value_total: number;
    active_contractors: number;
  };
}

export interface ShovelsAddressResident {
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
}

export interface ShovelsSearchParams {
  geo_id: string;
  permit_from: string;                              // YYYY-MM-DD
  permit_to: string;                                // YYYY-MM-DD
  status?: ShovelsPermitStatus | ShovelsPermitStatus[];
  permit_tags?: ShovelsPermitTag | ShovelsPermitTag[];
  property_type?: 'residential' | 'commercial';
  keyword?: string;
  min_job_value?: number;
  min_fees?: number;
  min_inspection_pass_rate?: number;
  has_contractor?: boolean;
  page?: number;
  size?: number;
  cursor?: string;
}

export interface ShovelsPaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  next_page?: number;
  cursor?: string;
}
```

### API Service

```typescript
// lib/shovels/shovels-service.ts

import { redis } from '@/lib/redis';
import { createClient } from '@/lib/supabase/server';
import type {
  ShovelsPermit,
  ShovelsContractor,
  ShovelsGeoMetrics,
  ShovelsAddressResident,
  ShovelsSearchParams,
  ShovelsPaginatedResponse,
  ShovelsPermitTag
} from './types';

const SHOVELS_API_KEY = process.env.SHOVELS_API_KEY!;
const SHOVELS_BASE_URL = process.env.SHOVELS_API_BASE_URL || 'https://api.shovels.ai/v2';
const RATE_LIMIT_PER_SECOND = parseInt(process.env.SHOVELS_RATE_LIMIT_PER_SECOND || '10');

// ===========================================
// RATE LIMITER
// ===========================================

class ShovelsRateLimiter {
  private windowMs = 1000;
  private maxRequests = RATE_LIMIT_PER_SECOND;
  private key = 'shovels:rate_limit';

  async acquire(): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    await redis.zremrangebyscore(this.key, 0, windowStart);
    const count = await redis.zcard(this.key);

    if (count >= this.maxRequests) {
      const oldestTimestamp = await redis.zrange(this.key, 0, 0, { withScores: true });
      if (oldestTimestamp.length > 0) {
        const waitTime = this.windowMs - (now - Number(oldestTimestamp[0].score));
        if (waitTime > 0) {
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    await redis.zadd(this.key, { score: now, member: `${now}-${Math.random()}` });
  }
}

const rateLimiter = new ShovelsRateLimiter();

// ===========================================
// GENERIC API CALL
// ===========================================

async function shovelsFetch<T>(
  endpoint: string,
  params?: Record<string, string | number | boolean | string[]>
): Promise<T> {
  await rateLimiter.acquire();

  const url = new URL(`${SHOVELS_BASE_URL}${endpoint}`);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => url.searchParams.append(key, String(v)));
        } else {
          url.searchParams.set(key, String(value));
        }
      }
    });
  }

  const response = await fetch(url.toString(), {
    headers: {
      'X-API-Key': SHOVELS_API_KEY,
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Shovels API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// ===========================================
// PERMIT OPERATIONS
// ===========================================

export async function searchPermits(
  params: ShovelsSearchParams
): Promise<ShovelsPaginatedResponse<ShovelsPermit>> {
  const cacheKey = `shovels:permits:search:${JSON.stringify(params)}`;
  
  // Check cache (1 hour for searches)
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached as string);
  }

  const apiParams: Record<string, any> = {
    geo_id: params.geo_id,
    permit_from: params.permit_from,
    permit_to: params.permit_to,
    size: params.size || 50
  };

  if (params.status) apiParams.status = params.status;
  if (params.permit_tags) apiParams.permit_tags = params.permit_tags;
  if (params.property_type) apiParams.property_type = params.property_type;
  if (params.keyword) apiParams.keyword = params.keyword;
  if (params.min_job_value) apiParams.min_job_value = params.min_job_value;
  if (params.min_inspection_pass_rate) apiParams.min_inspection_pass_rate = params.min_inspection_pass_rate;
  if (params.has_contractor !== undefined) apiParams.has_contractor = params.has_contractor;
  if (params.cursor) apiParams.cursor = params.cursor;
  if (params.page) apiParams.page = params.page;

  const data = await shovelsFetch<ShovelsPaginatedResponse<ShovelsPermit>>(
    '/permits/search',
    apiParams
  );

  // Cache for 1 hour
  await redis.setex(cacheKey, 3600, JSON.stringify(data));

  return data;
}

export async function getPermitsByIds(ids: string[]): Promise<ShovelsPermit[]> {
  const data = await shovelsFetch<{ items: ShovelsPermit[] }>(
    '/permits',
    { id: ids }
  );
  return data.items;
}

export async function getPermitsForAddress(
  addressId: string,
  options?: { from?: string; to?: string }
): Promise<ShovelsPermit[]> {
  const supabase = createClient();
  
  // Check database cache first
  const { data: cached } = await supabase
    .from('shovels_permits')
    .select('*')
    .eq('address_id', addressId)
    .gt('cache_expires_at', new Date().toISOString());

  if (cached && cached.length > 0) {
    return cached.map(p => p.raw_data as ShovelsPermit);
  }

  // Fetch from API
  const params: ShovelsSearchParams = {
    geo_id: addressId,
    permit_from: options?.from || '2000-01-01',
    permit_to: options?.to || new Date().toISOString().split('T')[0],
    size: 100
  };

  const allPermits: ShovelsPermit[] = [];
  let cursor: string | undefined;

  do {
    if (cursor) params.cursor = cursor;
    const response = await searchPermits(params);
    allPermits.push(...response.items);
    cursor = response.cursor;
  } while (cursor);

  // Cache in database
  for (const permit of allPermits) {
    await upsertPermit(permit);
  }

  return allPermits;
}

async function upsertPermit(permit: ShovelsPermit): Promise<void> {
  const supabase = createClient();
  
  const cacheExpires = new Date();
  cacheExpires.setDate(cacheExpires.getDate() + 30);

  await supabase.from('shovels_permits').upsert({
    id: permit.id,
    address_id: permit.geo_ids.address_id,
    description: permit.description,
    permit_number: permit.number,
    jurisdiction: permit.jurisdiction,
    status: permit.status,
    tags: permit.tags,
    property_type: permit.property_type,
    job_value: permit.job_value,
    fees: permit.fees,
    file_date: permit.file_date,
    issue_date: permit.issue_date,
    final_date: permit.final_date,
    inspection_pass_rate: permit.inspection_pass_rate,
    approval_days: permit.approval_duration,
    construction_days: permit.construction_duration,
    contractor_id: permit.contractor_id,
    contractor_name: permit.contractor_name,
    street_address: permit.address.street,
    city: permit.address.city,
    state: permit.address.state,
    zip_code: permit.address.zip_code,
    raw_data: permit,
    cached_at: new Date().toISOString(),
    cache_expires_at: cacheExpires.toISOString()
  }, {
    onConflict: 'id'
  });
}

// ===========================================
// GEOGRAPHIC OPERATIONS
// ===========================================

export async function searchCities(query: string): Promise<Array<{ geo_id: string; name: string; state: string }>> {
  const data = await shovelsFetch<{ items: Array<{ geo_id: string; name: string; state: string }> }>(
    '/cities/search',
    { q: query }
  );
  return data.items;
}

export async function getCityMetrics(geoId: string): Promise<ShovelsGeoMetrics> {
  const cacheKey = `shovels:city:metrics:${geoId}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached as string);
  }

  const data = await shovelsFetch<ShovelsGeoMetrics>(`/cities/${geoId}/metrics`);
  
  // Cache for 24 hours
  await redis.setex(cacheKey, 86400, JSON.stringify(data));
  
  return data;
}

export async function getCountyMetrics(geoId: string): Promise<ShovelsGeoMetrics> {
  const cacheKey = `shovels:county:metrics:${geoId}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached as string);
  }

  const data = await shovelsFetch<ShovelsGeoMetrics>(`/counties/${geoId}/metrics`);
  
  await redis.setex(cacheKey, 86400, JSON.stringify(data));
  
  return data;
}

export async function getJurisdictionMetrics(geoId: string): Promise<ShovelsGeoMetrics> {
  const cacheKey = `shovels:jurisdiction:metrics:${geoId}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached as string);
  }

  const data = await shovelsFetch<ShovelsGeoMetrics>(`/jurisdictions/${geoId}/metrics`);
  
  await redis.setex(cacheKey, 86400, JSON.stringify(data));
  
  return data;
}

// ===========================================
// ADDRESS OPERATIONS
// ===========================================

export async function searchAddresses(
  query: string
): Promise<Array<{ address_id: string; formatted_address: string }>> {
  const data = await shovelsFetch<{ items: Array<{ geo_id: string; formatted_address: string }> }>(
    '/addresses/search',
    { q: query }
  );
  return data.items.map(item => ({
    address_id: item.geo_id,
    formatted_address: item.formatted_address
  }));
}

export async function getAddressMetrics(addressId: string): Promise<any> {
  const cacheKey = `shovels:address:metrics:${addressId}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached as string);
  }

  const data = await shovelsFetch<any>(`/addresses/${addressId}/metrics`);
  
  await redis.setex(cacheKey, 86400, JSON.stringify(data));
  
  return data;
}

export async function getAddressResidents(addressId: string): Promise<ShovelsAddressResident[]> {
  const cacheKey = `shovels:address:residents:${addressId}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached as string);
  }

  const data = await shovelsFetch<{ items: ShovelsAddressResident[] }>(
    `/addresses/${addressId}/residents`
  );
  
  // Cache for 7 days
  await redis.setex(cacheKey, 604800, JSON.stringify(data.items));
  
  return data.items;
}

// ===========================================
// CONTRACTOR OPERATIONS
// ===========================================

export async function searchContractors(params: {
  geo_id: string;
  permit_from: string;
  permit_to: string;
  permit_tags?: ShovelsPermitTag[];
  property_type?: 'residential' | 'commercial';
}): Promise<ShovelsPaginatedResponse<ShovelsContractor>> {
  return shovelsFetch<ShovelsPaginatedResponse<ShovelsContractor>>(
    '/contractors/search',
    params as any
  );
}

export async function getContractorById(id: string): Promise<ShovelsContractor> {
  return shovelsFetch<ShovelsContractor>(`/contractors/${id}`);
}

export async function getContractorPermits(
  contractorId: string,
  params: { permit_from: string; permit_to: string }
): Promise<ShovelsPermit[]> {
  const data = await shovelsFetch<ShovelsPaginatedResponse<ShovelsPermit>>(
    `/contractors/${contractorId}/permits`,
    params
  );
  return data.items;
}
```

---

## 5. Address Matching Service

```typescript
// lib/shovels/address-matcher.ts

import { createClient } from '@/lib/supabase/server';
import { searchAddresses, getPermitsForAddress } from './shovels-service';

interface MatchResult {
  propertyId: string;
  shovelsAddressId: string | null;
  matchConfidence: 'high' | 'medium' | 'low' | 'none';
  matchMethod: 'exact' | 'normalized' | 'fuzzy' | 'none';
}

// Normalize address for matching
function normalizeAddress(address: string): string {
  return address
    .toLowerCase()
    .replace(/\bstreet\b/g, 'st')
    .replace(/\bavenue\b/g, 'ave')
    .replace(/\bboulevard\b/g, 'blvd')
    .replace(/\bdrive\b/g, 'dr')
    .replace(/\broad\b/g, 'rd')
    .replace(/\blane\b/g, 'ln')
    .replace(/\bcourt\b/g, 'ct')
    .replace(/\bapartment\b/g, 'apt')
    .replace(/\bsuite\b/g, 'ste')
    .replace(/\bnorth\b/g, 'n')
    .replace(/\bsouth\b/g, 's')
    .replace(/\beast\b/g, 'e')
    .replace(/\bwest\b/g, 'w')
    .replace(/[.,#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function matchPropertyToShovels(
  propertyId: string,
  address: string,
  city: string,
  state: string,
  zipCode: string
): Promise<MatchResult> {
  const supabase = createClient();
  
  // Check if already matched
  const { data: existing } = await supabase
    .from('properties')
    .select('shovels_address_id')
    .eq('id', propertyId)
    .single();

  if (existing?.shovels_address_id) {
    return {
      propertyId,
      shovelsAddressId: existing.shovels_address_id,
      matchConfidence: 'high',
      matchMethod: 'exact'
    };
  }

  // Search Shovels for address
  const fullAddress = `${address}, ${city}, ${state} ${zipCode}`;
  const results = await searchAddresses(fullAddress);

  if (results.length === 0) {
    return {
      propertyId,
      shovelsAddressId: null,
      matchConfidence: 'none',
      matchMethod: 'none'
    };
  }

  // Try exact match first
  const normalizedInput = normalizeAddress(fullAddress);
  
  for (const result of results) {
    const normalizedResult = normalizeAddress(result.formatted_address);
    
    if (normalizedResult === normalizedInput) {
      // Update property with Shovels ID
      await supabase
        .from('properties')
        .update({
          shovels_address_id: result.address_id,
          shovels_matched_at: new Date().toISOString()
        })
        .eq('id', propertyId);

      return {
        propertyId,
        shovelsAddressId: result.address_id,
        matchConfidence: 'high',
        matchMethod: 'exact'
      };
    }
  }

  // Use first result as best match if no exact match
  const bestMatch = results[0];
  
  await supabase
    .from('properties')
    .update({
      shovels_address_id: bestMatch.address_id,
      shovels_matched_at: new Date().toISOString()
    })
    .eq('id', propertyId);

  return {
    propertyId,
    shovelsAddressId: bestMatch.address_id,
    matchConfidence: 'medium',
    matchMethod: 'normalized'
  };
}

export async function batchMatchProperties(
  properties: Array<{
    id: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }>
): Promise<MatchResult[]> {
  const results: MatchResult[] = [];
  
  // Process in batches of 10 to respect rate limits
  for (let i = 0; i < properties.length; i += 10) {
    const batch = properties.slice(i, i + 10);
    
    const batchResults = await Promise.all(
      batch.map(p => matchPropertyToShovels(p.id, p.address, p.city, p.state, p.zipCode))
    );
    
    results.push(...batchResults);
    
    // Small delay between batches
    if (i + 10 < properties.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return results;
}

// Calculate and store address metrics after matching
export async function calculateAddressMetrics(addressId: string, propertyId?: string): Promise<void> {
  const supabase = createClient();
  
  // Get all permits for address
  const permits = await getPermitsForAddress(addressId);
  
  if (permits.length === 0) {
    return;
  }

  const now = new Date();
  const threeYearsAgo = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
  const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());

  // Calculate metrics
  const metrics = {
    address_id: addressId,
    property_id: propertyId || null,
    total_permits: permits.length,
    total_permit_value: permits.reduce((sum, p) => sum + (p.job_value || 0), 0),
    permits_last_3_years: permits.filter(p => new Date(p.file_date || '') >= threeYearsAgo).length,
    permits_last_5_years: permits.filter(p => new Date(p.file_date || '') >= fiveYearsAgo).length,
    
    // Last dates by type
    last_permit_date: permits.reduce((max, p) => {
      const d = p.file_date || '';
      return d > max ? d : max;
    }, ''),
    last_roofing_date: getLastDateForTag(permits, 'roofing'),
    last_hvac_date: getLastDateForTag(permits, 'hvac'),
    last_electrical_date: getLastDateForTag(permits, 'electrical'),
    last_plumbing_date: getLastDateForTag(permits, 'plumbing'),
    last_solar_date: getLastDateForTag(permits, 'solar'),
    last_water_heater_date: getLastDateForTag(permits, 'water_heater'),
    last_remodel_date: getLastDateForTag(permits, 'remodel'),
    
    // Distress indicators
    has_stalled_permit: permits.some(p => 
      p.status === 'in_review' && 
      p.file_date && 
      daysSince(p.file_date) > 90
    ),
    has_failed_inspection: permits.some(p => 
      (p.inspection_pass_rate || 100) < 50
    ),
    has_expired_permit: permits.some(p =>
      p.status !== 'final' &&
      p.issue_date &&
      daysSince(p.issue_date) > 365
    ),
    stalled_permit_count: permits.filter(p =>
      p.status === 'in_review' &&
      p.file_date &&
      daysSince(p.file_date) > 90
    ).length,
    failed_inspection_count: permits.filter(p =>
      (p.inspection_pass_rate || 100) < 50
    ).length,
    
    // Quality metrics
    avg_inspection_pass_rate: calculateAverage(
      permits.filter(p => p.inspection_pass_rate).map(p => p.inspection_pass_rate!)
    ),
    avg_construction_days: calculateAverage(
      permits.filter(p => p.construction_duration).map(p => p.construction_duration!)
    ),
    
    // Tag presence flags
    has_roofing_permit: permits.some(p => p.tags.includes('roofing')),
    has_hvac_permit: permits.some(p => p.tags.includes('hvac')),
    has_electrical_permit: permits.some(p => p.tags.includes('electrical')),
    has_plumbing_permit: permits.some(p => p.tags.includes('plumbing')),
    has_solar_permit: permits.some(p => p.tags.includes('solar')),
    has_ev_charger_permit: permits.some(p => p.tags.includes('ev_charger')),
    has_heat_pump_permit: permits.some(p => p.tags.includes('heat_pump')),
    has_battery_permit: permits.some(p => p.tags.includes('battery')),
    has_addition_permit: permits.some(p => p.tags.includes('addition')),
    has_remodel_permit: permits.some(p => p.tags.includes('remodel')),
    
    // All tags
    all_permit_tags: [...new Set(permits.flatMap(p => p.tags))],
    
    metrics_calculated_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  await supabase
    .from('shovels_address_metrics')
    .upsert(metrics, { onConflict: 'address_id' });
}

// Helper functions
function getLastDateForTag(permits: ShovelsPermit[], tag: string): string | null {
  const filtered = permits.filter(p => p.tags.includes(tag as any));
  if (filtered.length === 0) return null;
  
  return filtered.reduce((max, p) => {
    const d = p.file_date || '';
    return d > max ? d : max;
  }, '');
}

function daysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateAverage(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
```

---

## 6. Heat Mapping System

### Vitality Score Calculation

```typescript
// lib/shovels/vitality-score.ts

import { createClient } from '@/lib/supabase/server';
import { getCityMetrics, getCountyMetrics } from './shovels-service';
import type { ShovelsGeoMetrics } from './types';

interface VitalityScoreComponents {
  permitVolumeScore: number;      // 30% weight
  yoyGrowthScore: number;         // 25% weight
  highValueRatioScore: number;    // 20% weight
  improvementRatioScore: number;  // 15% weight
  inspectionPassScore: number;    // 10% weight
}

interface VitalityScoreResult {
  geoId: string;
  geoType: 'zip' | 'city' | 'county';
  vitalityScore: number;
  components: VitalityScoreComponents;
  rawMetrics: {
    totalPermits: number;
    permitsCurrentYear: number;
    permitsPriorYear: number;
    yoyGrowthPercent: number;
    highValuePermitCount: number;
    improvementPermitCount: number;
    avgInspectionPassRate: number;
    avgPermitValue: number;
  };
}

// Normalize a value to 0-100 scale
function normalizeScore(value: number, min: number, max: number): number {
  if (max === min) return 50;
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized));
}

export async function calculateVitalityScore(
  geoId: string,
  geoType: 'city' | 'county',
  metroAvgPermits?: number
): Promise<VitalityScoreResult> {
  // Fetch metrics from Shovels
  const metrics = geoType === 'city' 
    ? await getCityMetrics(geoId)
    : await getCountyMetrics(geoId);

  const currentYear = new Date().getFullYear();
  const monthlyData = metrics.metrics.permits_by_month || [];
  
  // Calculate current year permits
  const permitsCurrentYear = monthlyData
    .filter(m => m.month.startsWith(String(currentYear)))
    .reduce((sum, m) => sum + m.count, 0);
  
  // Calculate prior year permits
  const permitsPriorYear = monthlyData
    .filter(m => m.month.startsWith(String(currentYear - 1)))
    .reduce((sum, m) => sum + m.count, 0);

  // Calculate YoY growth
  const yoyGrowthPercent = permitsPriorYear > 0
    ? ((permitsCurrentYear - permitsPriorYear) / permitsPriorYear) * 100
    : 0;

  // Use metro average or default
  const metroAvg = metroAvgPermits || metrics.metrics.total_permits;

  // Component calculations
  // 1. Permit Volume Score (relative to metro average)
  const permitVolumeRatio = metroAvg > 0 
    ? (metrics.metrics.total_permits / metroAvg) * 100
    : 50;
  const permitVolumeScore = Math.min(100, permitVolumeRatio);

  // 2. YoY Growth Score (-50% to +50% mapped to 0-100)
  const yoyGrowthScore = normalizeScore(yoyGrowthPercent, -50, 50);

  // 3. High Value Ratio Score (permits > $50K)
  // This needs to be calculated from permit data - using avg value as proxy
  const avgValue = metrics.metrics.permit_value_total / Math.max(1, metrics.metrics.total_permits);
  const highValueRatioScore = normalizeScore(avgValue, 10000, 100000);

  // 4. Improvement Ratio Score (remodel, kitchen, bath, addition permits)
  // Estimate based on typical distribution - 30-50% are improvements
  const improvementRatioScore = 50; // Default - would need tag breakdown

  // 5. Inspection Pass Rate Score
  const inspectionPassScore = metrics.metrics.avg_inspection_pass_rate || 80;

  // Calculate weighted final score
  const vitalityScore = 
    (permitVolumeScore * 0.30) +
    (yoyGrowthScore * 0.25) +
    (highValueRatioScore * 0.20) +
    (improvementRatioScore * 0.15) +
    (inspectionPassScore * 0.10);

  return {
    geoId,
    geoType,
    vitalityScore: Math.round(vitalityScore * 100) / 100,
    components: {
      permitVolumeScore: Math.round(permitVolumeScore * 100) / 100,
      yoyGrowthScore: Math.round(yoyGrowthScore * 100) / 100,
      highValueRatioScore: Math.round(highValueRatioScore * 100) / 100,
      improvementRatioScore: Math.round(improvementRatioScore * 100) / 100,
      inspectionPassScore: Math.round(inspectionPassScore * 100) / 100
    },
    rawMetrics: {
      totalPermits: metrics.metrics.total_permits,
      permitsCurrentYear,
      permitsPriorYear,
      yoyGrowthPercent: Math.round(yoyGrowthPercent * 100) / 100,
      highValuePermitCount: 0, // Would need permit-level data
      improvementPermitCount: 0, // Would need permit-level data
      avgInspectionPassRate: metrics.metrics.avg_inspection_pass_rate || 0,
      avgPermitValue: Math.round(avgValue)
    }
  };
}

export async function batchCalculateVitalityScores(
  geoIds: Array<{ geoId: string; geoType: 'city' | 'county' }>,
  metroAvgPermits?: number
): Promise<VitalityScoreResult[]> {
  const results: VitalityScoreResult[] = [];
  
  for (const geo of geoIds) {
    try {
      const score = await calculateVitalityScore(geo.geoId, geo.geoType, metroAvgPermits);
      results.push(score);
    } catch (error) {
      console.error(`Failed to calculate vitality for ${geo.geoId}:`, error);
    }
  }
  
  return results;
}

export async function storeVitalityScore(score: VitalityScoreResult): Promise<void> {
  const supabase = createClient();
  
  await supabase.from('geo_vitality_scores').upsert({
    geo_id: score.geoId,
    geo_type: score.geoType,
    vitality_score: score.vitalityScore,
    permit_volume_score: score.components.permitVolumeScore,
    yoy_growth_score: score.components.yoyGrowthScore,
    high_value_ratio_score: score.components.highValueRatioScore,
    improvement_ratio_score: score.components.improvementRatioScore,
    inspection_pass_score: score.components.inspectionPassScore,
    total_permits: score.rawMetrics.totalPermits,
    permits_current_year: score.rawMetrics.permitsCurrentYear,
    permits_prior_year: score.rawMetrics.permitsPriorYear,
    calculated_at: new Date().toISOString()
  }, {
    onConflict: 'geo_id'
  });
}
```

### Heat Map Data Provider

```typescript
// lib/shovels/heat-map-data.ts

import { createClient } from '@/lib/supabase/server';

export type HeatMapLayer = 
  | 'vitality'
  | 'permit_activity'
  | 'property_values'
  | 'rent_growth'
  | 'renovation_wave'
  | 'electrification'
  | 'contractor_saturation';

interface HeatMapDataPoint {
  geoId: string;
  geoType: 'zip' | 'city' | 'county';
  name: string;
  center: [number, number]; // [lng, lat]
  value: number;
  normalizedValue: number; // 0-100 for color scaling
}

export async function getHeatMapData(
  layer: HeatMapLayer,
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  },
  geoType: 'zip' | 'city' | 'county' = 'zip'
): Promise<HeatMapDataPoint[]> {
  const supabase = createClient();
  
  switch (layer) {
    case 'vitality':
      return getVitalityHeatMap(supabase, bounds, geoType);
    case 'permit_activity':
      return getPermitActivityHeatMap(supabase, bounds, geoType);
    case 'renovation_wave':
      return getRenovationWaveHeatMap(supabase, bounds, geoType);
    case 'electrification':
      return getElectrificationHeatMap(supabase, bounds, geoType);
    default:
      return [];
  }
}

async function getVitalityHeatMap(
  supabase: any,
  bounds: any,
  geoType: string
): Promise<HeatMapDataPoint[]> {
  const { data } = await supabase
    .from('geo_vitality_scores')
    .select('*')
    .eq('geo_type', geoType);

  if (!data) return [];

  const maxScore = Math.max(...data.map((d: any) => d.vitality_score));
  const minScore = Math.min(...data.map((d: any) => d.vitality_score));

  return data.map((d: any) => ({
    geoId: d.geo_id,
    geoType: d.geo_type,
    name: d.geo_name || d.geo_id,
    center: [0, 0], // Would need geocoding
    value: d.vitality_score,
    normalizedValue: maxScore > minScore 
      ? ((d.vitality_score - minScore) / (maxScore - minScore)) * 100
      : 50
  }));
}

async function getPermitActivityHeatMap(
  supabase: any,
  bounds: any,
  geoType: string
): Promise<HeatMapDataPoint[]> {
  const { data } = await supabase
    .from('geo_vitality_scores')
    .select('geo_id, geo_type, geo_name, total_permits')
    .eq('geo_type', geoType);

  if (!data) return [];

  const maxPermits = Math.max(...data.map((d: any) => d.total_permits));
  const minPermits = Math.min(...data.map((d: any) => d.total_permits));

  return data.map((d: any) => ({
    geoId: d.geo_id,
    geoType: d.geo_type,
    name: d.geo_name || d.geo_id,
    center: [0, 0],
    value: d.total_permits,
    normalizedValue: maxPermits > minPermits
      ? ((d.total_permits - minPermits) / (maxPermits - minPermits)) * 100
      : 50
  }));
}

async function getRenovationWaveHeatMap(
  supabase: any,
  bounds: any,
  geoType: string
): Promise<HeatMapDataPoint[]> {
  // Count improvement permits by zip from shovels_permits
  const { data } = await supabase
    .from('shovels_permits')
    .select('zip_code')
    .overlaps('tags', ['remodel', 'kitchen', 'bathroom', 'addition'])
    .gte('file_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

  if (!data) return [];

  // Group by zip
  const zipCounts: Record<string, number> = {};
  data.forEach((d: any) => {
    zipCounts[d.zip_code] = (zipCounts[d.zip_code] || 0) + 1;
  });

  const counts = Object.values(zipCounts);
  const maxCount = Math.max(...counts, 1);
  const minCount = Math.min(...counts, 0);

  return Object.entries(zipCounts).map(([zip, count]) => ({
    geoId: zip,
    geoType: 'zip' as const,
    name: zip,
    center: [0, 0],
    value: count,
    normalizedValue: maxCount > minCount
      ? ((count - minCount) / (maxCount - minCount)) * 100
      : 50
  }));
}

async function getElectrificationHeatMap(
  supabase: any,
  bounds: any,
  geoType: string
): Promise<HeatMapDataPoint[]> {
  // Count electrification permits by zip
  const { data } = await supabase
    .from('shovels_permits')
    .select('zip_code')
    .overlaps('tags', ['solar', 'ev_charger', 'heat_pump', 'battery'])
    .gte('file_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

  if (!data) return [];

  const zipCounts: Record<string, number> = {};
  data.forEach((d: any) => {
    zipCounts[d.zip_code] = (zipCounts[d.zip_code] || 0) + 1;
  });

  const counts = Object.values(zipCounts);
  const maxCount = Math.max(...counts, 1);
  const minCount = Math.min(...counts, 0);

  return Object.entries(zipCounts).map(([zip, count]) => ({
    geoId: zip,
    geoType: 'zip' as const,
    name: zip,
    center: [0, 0],
    value: count,
    normalizedValue: maxCount > minCount
      ? ((count - minCount) / (maxCount - minCount)) * 100
      : 50
  }));
}
```

---

## 7. Wholesaling Contrarian Filters

### Filter Definitions

```typescript
// lib/filters/shovels-filter-definitions.ts

import { FilterDefinition } from './filter-definitions';

// ===========================================
// PERMIT-BASED CONTRARIAN FILTERS (Shovels Only)
// ===========================================

export const SHOVELS_CONTRARIAN_FILTERS: FilterDefinition[] = [
  {
    slug: 'stalled-permit',
    name: 'Stalled Permit',
    description: 'Permit in review for 90+ days - owner started project they couldn\'t complete',
    category: 'contrarian',
    tier: 'pro',
    icon: '🚧',
    competitionLevel: 'very_low',
    dataSource: 'shovels',
    criteria: {
      type: 'compound',
      conditions: [
        { field: 'shovels_address_metrics.has_stalled_permit', operator: 'eq', value: true }
      ],
      requiredDataPoints: ['shovels_address_metrics']
    },
    motivationFormula: {
      baseScore: 70,
      modifiers: [
        { condition: 'permitValueOver25K', bonus: 15 },
        { condition: 'multipleStalled', bonus: 10 }
      ]
    }
  },
  {
    slug: 'failed-inspection-fatigue',
    name: 'Failed Inspection Fatigue',
    description: 'Property with low inspection pass rate - construction problems or contractor abandonment',
    category: 'contrarian',
    tier: 'pro',
    icon: '❌',
    competitionLevel: 'very_low',
    dataSource: 'shovels',
    criteria: {
      type: 'compound',
      conditions: [
        { field: 'shovels_address_metrics.has_failed_inspection', operator: 'eq', value: true },
        { field: 'shovels_address_metrics.avg_inspection_pass_rate', operator: 'lt', value: 50 }
      ],
      requiredDataPoints: ['shovels_address_metrics']
    },
    motivationFormula: {
      baseScore: 75,
      modifiers: [
        { condition: 'passRateUnder30', bonus: 15 },
        { condition: 'permitOver6MonthsOld', bonus: 10 }
      ]
    }
  },
  {
    slug: 'expired-without-final',
    name: 'Expired Without Final',
    description: 'Permit issued but never finalized - incomplete work, legal occupancy uncertain',
    category: 'contrarian',
    tier: 'pro',
    icon: '⏰',
    competitionLevel: 'very_low',
    dataSource: 'shovels',
    criteria: {
      type: 'compound',
      conditions: [
        { field: 'shovels_address_metrics.has_expired_permit', operator: 'eq', value: true }
      ],
      requiredDataPoints: ['shovels_address_metrics']
    },
    motivationFormula: {
      baseScore: 65,
      modifiers: [
        { condition: 'remodelOrAddition', bonus: 20 },
        { condition: 'multipleExpired', bonus: 10 }
      ]
    }
  }
];

// ===========================================
// COMBINED DATA CONTRARIAN FILTERS (RentCast + Shovels)
// ===========================================

export const COMBINED_CONTRARIAN_FILTERS: FilterDefinition[] = [
  {
    slug: 'over-improved-for-area',
    name: 'Over-Improved for Area',
    description: 'Multiple permits but value didn\'t increase - can\'t recoup investment',
    category: 'contrarian',
    tier: 'pro',
    icon: '📉',
    competitionLevel: 'very_low',
    dataSource: 'combined',
    criteria: {
      type: 'calculated',
      conditions: [
        { 
          field: 'totalPermitValue3Year', 
          operator: 'gte', 
          value: 50000,
          customLogic: 'shovels_address_metrics.total_permit_value WHERE file_date > NOW() - 3 years'
        },
        {
          field: 'valueAppreciation',
          operator: 'lt',
          value: 'zipMedianAppreciation',
          customLogic: 'property.current_value / property.last_sale_price < zip_median_appreciation'
        }
      ],
      requiredDataPoints: ['shovels_address_metrics.total_permit_value', 'estimatedValue', 'lastSalePrice', 'marketData']
    },
    motivationFormula: {
      baseScore: 70,
      modifiers: [
        { condition: 'permitInvestmentOver100K', bonus: 15 },
        { condition: 'absenteeOwner', bonus: 10 }
      ]
    }
  },
  {
    slug: 'sunk-cost-abandonment',
    name: 'Sunk Cost Abandonment',
    description: 'High equity owner with stalled/abandoned project - has resources but gave up',
    category: 'contrarian',
    tier: 'enterprise',
    icon: '💰',
    competitionLevel: 'extremely_low',
    dataSource: 'combined',
    criteria: {
      type: 'compound',
      conditions: [
        { field: 'equityPercent', operator: 'gte', value: 50 },
        { 
          field: 'hasAbandonedProject', 
          operator: 'eq', 
          value: true,
          customLogic: 'shovels_address_metrics.has_stalled_permit OR shovels_address_metrics.has_expired_permit'
        }
      ],
      requiredDataPoints: ['equityPercent', 'shovels_address_metrics']
    },
    motivationFormula: {
      baseScore: 80,
      modifiers: [
        { condition: 'equityOver70', bonus: 10 },
        { condition: 'permitValueOver30K', bonus: 10 }
      ]
    }
  },
  {
    slug: 'deferred-maintenance-landlord',
    name: 'Deferred Maintenance Landlord',
    description: 'Long-term absentee owner with no permits in 5+ years - tired landlord not investing',
    category: 'contrarian',
    tier: 'pro',
    icon: '🔧',
    competitionLevel: 'low',
    dataSource: 'combined',
    criteria: {
      type: 'compound',
      conditions: [
        { field: 'ownerOccupied', operator: 'eq', value: false },
        { field: 'ownershipYears', operator: 'gte', value: 10 },
        { 
          field: 'noRecentPermits', 
          operator: 'eq', 
          value: true,
          customLogic: 'shovels_address_metrics.last_permit_date < NOW() - 5 years OR shovels_address_metrics.last_permit_date IS NULL'
        }
      ],
      requiredDataPoints: ['ownerOccupied', 'lastSaleDate', 'shovels_address_metrics']
    },
    motivationFormula: {
      baseScore: 65,
      modifiers: [
        { condition: 'ownershipOver15Years', bonus: 15 },
        { condition: 'outOfStateOwner', bonus: 10 }
      ]
    }
  },
  {
    slug: 'falling-behind-neighbors',
    name: 'Falling Behind Neighbors',
    description: 'High neighborhood permit activity but target property has none - falling behind market',
    category: 'contrarian',
    tier: 'pro',
    icon: '🏘️',
    competitionLevel: 'low',
    dataSource: 'combined',
    criteria: {
      type: 'calculated',
      conditions: [
        {
          field: 'neighborhoodPermitDensity',
          operator: 'gte',
          value: 75, // percentile
          customLogic: 'zip_permit_count > 75th_percentile'
        },
        { 
          field: 'propertyPermits3Year', 
          operator: 'eq', 
          value: 0,
          customLogic: 'shovels_address_metrics.permits_last_3_years = 0'
        }
      ],
      requiredDataPoints: ['zipCode', 'shovels_address_metrics', 'geo_vitality_scores']
    },
    motivationFormula: {
      baseScore: 55,
      modifiers: [
        { condition: 'belowMedianValue', bonus: 15 },
        { condition: 'propertyOver30Years', bonus: 10 }
      ]
    }
  },
  {
    slug: 'major-system-due',
    name: 'Major System Due',
    description: 'Property age indicates major system replacement needed but no permit history',
    category: 'contrarian',
    tier: 'pro',
    icon: '⚠️',
    competitionLevel: 'low',
    dataSource: 'combined',
    criteria: {
      type: 'calculated',
      conditions: [
        {
          field: 'systemDue',
          operator: 'eq',
          value: true,
          customLogic: `
            (year_built + 20 < CURRENT_YEAR AND shovels_address_metrics.last_roofing_date IS NULL)
            OR (year_built + 25 < CURRENT_YEAR AND shovels_address_metrics.last_hvac_date IS NULL)
            OR (year_built + 15 < CURRENT_YEAR AND shovels_address_metrics.last_water_heater_date IS NULL)
          `
        }
      ],
      requiredDataPoints: ['yearBuilt', 'shovels_address_metrics']
    },
    motivationFormula: {
      baseScore: 60,
      modifiers: [
        { condition: 'multipleSystemsDue', bonus: 15 },
        { condition: 'absenteeOwner', bonus: 15 }
      ]
    }
  }
];

// Export all new filters
export const ALL_SHOVELS_FILTERS: FilterDefinition[] = [
  ...SHOVELS_CONTRARIAN_FILTERS,
  ...COMBINED_CONTRARIAN_FILTERS
];
```

### Updated Filter Engine

```typescript
// lib/filters/filter-engine.ts - ADDITIONS

import { ALL_SHOVELS_FILTERS } from './shovels-filter-definitions';

// Add to existing ALL_FILTERS
export const ALL_FILTERS: FilterDefinition[] = [
  ...STANDARD_FILTERS,
  ...ENHANCED_FILTERS,
  ...CONTRARIAN_FILTERS,
  ...ALL_SHOVELS_FILTERS  // Add new Shovels filters
];

// New function to apply Shovels-specific conditions
function applyShovelsFilterConditions(query: any, filter: FilterDefinition) {
  if (filter.dataSource === 'shovels' || filter.dataSource === 'combined') {
    // Join with shovels_address_metrics
    query = query.not('shovels_address_id', 'is', null);
  }
  
  for (const condition of filter.criteria.conditions) {
    // Handle Shovels-specific fields
    if (condition.field.startsWith('shovels_address_metrics.')) {
      const field = condition.field.replace('shovels_address_metrics.', '');
      // This requires a join or subquery
      // Implementation depends on Supabase query capabilities
    }
    
    // Handle combined logic
    if (condition.customLogic) {
      // These require stored procedures or complex queries
      // See SQL functions below
    }
  }
  
  return query;
}
```

### SQL Functions for Complex Filters

```sql
-- Function to check if property has abandoned project
CREATE OR REPLACE FUNCTION has_abandoned_project(property_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM shovels_address_metrics sam
    JOIN properties p ON p.shovels_address_id = sam.address_id
    WHERE p.id = property_id
    AND (sam.has_stalled_permit = true OR sam.has_expired_permit = true)
  );
END;
$$ LANGUAGE plpgsql;

-- Function to check if major system is due
CREATE OR REPLACE FUNCTION major_system_due(property_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  prop RECORD;
  metrics RECORD;
  current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
  SELECT * INTO prop FROM properties WHERE id = property_id;
  SELECT * INTO metrics FROM shovels_address_metrics sam
    JOIN properties p ON p.shovels_address_id = sam.address_id
    WHERE p.id = property_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Roof due (20+ years, no roofing permit)
  IF prop.year_built + 20 < current_year AND metrics.last_roofing_date IS NULL THEN
    RETURN true;
  END IF;
  
  -- HVAC due (25+ years, no HVAC permit)
  IF prop.year_built + 25 < current_year AND metrics.last_hvac_date IS NULL THEN
    RETURN true;
  END IF;
  
  -- Water heater due (15+ years, no water heater permit)
  IF prop.year_built + 15 < current_year AND metrics.last_water_heater_date IS NULL THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Function to get neighborhood permit density percentile
CREATE OR REPLACE FUNCTION neighborhood_permit_percentile(zip TEXT)
RETURNS NUMERIC AS $$
DECLARE
  zip_permits INTEGER;
  percentile NUMERIC;
BEGIN
  SELECT total_permits INTO zip_permits
  FROM geo_vitality_scores
  WHERE geo_id = zip AND geo_type = 'zip';
  
  IF zip_permits IS NULL THEN
    RETURN 0;
  END IF;
  
  SELECT (COUNT(*) FILTER (WHERE total_permits < zip_permits)::NUMERIC / COUNT(*)::NUMERIC) * 100
  INTO percentile
  FROM geo_vitality_scores
  WHERE geo_type = 'zip';
  
  RETURN COALESCE(percentile, 0);
END;
$$ LANGUAGE plpgsql;
```

---

## 8. Home Services Filters

### Filter Definitions by Vertical

```typescript
// lib/filters/home-services-filters.ts

import { FilterDefinition } from './filter-definitions';

// ===========================================
// ROOFING FILTERS
// ===========================================

export const ROOFING_FILTERS: FilterDefinition[] = [
  {
    slug: 'roof-replacement-due',
    name: 'Roof Replacement Due',
    description: 'Last roofing permit 15-25 years ago or no permit with old home',
    category: 'home_services',
    vertical: 'roofing',
    tier: 'pro',
    icon: '🏠',
    dataSource: 'combined',
    criteria: {
      type: 'calculated',
      conditions: [
        {
          field: 'roofAge',
          operator: 'custom',
          customLogic: `
            (shovels_address_metrics.last_roofing_date IS NOT NULL 
              AND shovels_address_metrics.last_roofing_date < NOW() - INTERVAL '15 years')
            OR (shovels_address_metrics.last_roofing_date IS NULL 
              AND year_built + 20 < EXTRACT(YEAR FROM NOW()))
          `
        }
      ],
      requiredDataPoints: ['shovels_address_metrics.last_roofing_date', 'yearBuilt']
    }
  },
  {
    slug: 'solar-ready-new-roof',
    name: 'Solar-Ready (New Roof)',
    description: 'Recent roofing permit without solar - prime solar candidate',
    category: 'home_services',
    vertical: 'roofing',
    tier: 'pro',
    icon: '☀️',
    dataSource: 'shovels',
    criteria: {
      type: 'compound',
      conditions: [
        {
          field: 'recentRoofing',
          operator: 'custom',
          customLogic: 'shovels_address_metrics.last_roofing_date > NOW() - INTERVAL \'2 years\''
        },
        { field: 'shovels_address_metrics.has_solar_permit', operator: 'eq', value: false }
      ],
      requiredDataPoints: ['shovels_address_metrics']
    }
  },
  {
    slug: 'neighbor-just-roofed',
    name: 'Neighbor Just Roofed',
    description: 'Neighbors had roofing permits recently, target property has old roof',
    category: 'home_services',
    vertical: 'roofing',
    tier: 'pro',
    icon: '🏘️',
    dataSource: 'combined',
    criteria: {
      type: 'calculated',
      conditions: [
        {
          field: 'neighborRoofActivity',
          operator: 'custom',
          customLogic: `
            EXISTS (
              SELECT 1 FROM shovels_permits sp
              WHERE sp.zip_code = properties.zip_code
              AND 'roofing' = ANY(sp.tags)
              AND sp.file_date > NOW() - INTERVAL '90 days'
            )
          `
        },
        {
          field: 'roofAge',
          operator: 'custom',
          customLogic: `
            shovels_address_metrics.last_roofing_date < NOW() - INTERVAL '15 years'
            OR shovels_address_metrics.last_roofing_date IS NULL
          `
        }
      ],
      requiredDataPoints: ['zipCode', 'shovels_address_metrics']
    }
  }
];

// ===========================================
// HVAC FILTERS
// ===========================================

export const HVAC_FILTERS: FilterDefinition[] = [
  {
    slug: 'hvac-replacement-due',
    name: 'HVAC Replacement Due',
    description: 'Last HVAC permit 15+ years ago or original equipment on older home',
    category: 'home_services',
    vertical: 'hvac',
    tier: 'pro',
    icon: '❄️',
    dataSource: 'combined',
    criteria: {
      type: 'calculated',
      conditions: [
        {
          field: 'hvacAge',
          operator: 'custom',
          customLogic: `
            (shovels_address_metrics.last_hvac_date IS NOT NULL 
              AND shovels_address_metrics.last_hvac_date < NOW() - INTERVAL '15 years')
            OR (shovels_address_metrics.last_hvac_date IS NULL 
              AND year_built + 20 < EXTRACT(YEAR FROM NOW()))
          `
        }
      ],
      requiredDataPoints: ['shovels_address_metrics.last_hvac_date', 'yearBuilt']
    }
  },
  {
    slug: 'heat-pump-candidate',
    name: 'Heat Pump Candidate',
    description: 'Has solar, no heat pump - likely environmentally conscious with capital',
    category: 'home_services',
    vertical: 'hvac',
    tier: 'pro',
    icon: '🌡️',
    dataSource: 'shovels',
    criteria: {
      type: 'compound',
      conditions: [
        { field: 'shovels_address_metrics.has_solar_permit', operator: 'eq', value: true },
        { field: 'shovels_address_metrics.has_heat_pump_permit', operator: 'eq', value: false }
      ],
      requiredDataPoints: ['shovels_address_metrics']
    }
  },
  {
    slug: 'recent-purchase-old-hvac',
    name: 'Recent Purchase - Old HVAC',
    description: 'Bought within 12 months, older home, no recent HVAC permit',
    category: 'home_services',
    vertical: 'hvac',
    tier: 'pro',
    icon: '🏡',
    dataSource: 'combined',
    criteria: {
      type: 'compound',
      conditions: [
        { field: 'lastSaleDate', operator: 'gte', value: 'NOW() - INTERVAL \'12 months\'' },
        { field: 'yearBuilt', operator: 'lt', value: new Date().getFullYear() - 15 },
        { field: 'shovels_address_metrics.has_hvac_permit', operator: 'eq', value: false }
      ],
      requiredDataPoints: ['lastSaleDate', 'yearBuilt', 'shovels_address_metrics']
    }
  }
];

// ===========================================
// ELECTRICAL FILTERS
// ===========================================

export const ELECTRICAL_FILTERS: FilterDefinition[] = [
  {
    slug: 'panel-upgrade-candidate',
    name: 'Panel Upgrade Candidate',
    description: 'Older home with high-draw additions (EV, solar, heat pump)',
    category: 'home_services',
    vertical: 'electrical',
    tier: 'pro',
    icon: '⚡',
    dataSource: 'combined',
    criteria: {
      type: 'compound',
      conditions: [
        { field: 'yearBuilt', operator: 'lt', value: 1990 },
        {
          field: 'hasHighDrawAddition',
          operator: 'custom',
          customLogic: `
            shovels_address_metrics.has_ev_charger_permit = true
            OR shovels_address_metrics.has_solar_permit = true
            OR shovels_address_metrics.has_heat_pump_permit = true
          `
        }
      ],
      requiredDataPoints: ['yearBuilt', 'shovels_address_metrics']
    }
  },
  {
    slug: 'ev-charger-ready',
    name: 'EV Charger Ready',
    description: 'No EV charger, newer electrical or recent panel work, owner-occupied',
    category: 'home_services',
    vertical: 'electrical',
    tier: 'pro',
    icon: '🔌',
    dataSource: 'combined',
    criteria: {
      type: 'compound',
      conditions: [
        { field: 'shovels_address_metrics.has_ev_charger_permit', operator: 'eq', value: false },
        { field: 'ownerOccupied', operator: 'eq', value: true },
        {
          field: 'electricalReady',
          operator: 'custom',
          customLogic: `
            shovels_address_metrics.last_electrical_date > NOW() - INTERVAL '5 years'
            OR year_built > 2010
          `
        }
      ],
      requiredDataPoints: ['shovels_address_metrics', 'ownerOccupied', 'yearBuilt']
    }
  },
  {
    slug: 'aging-electrical',
    name: 'Aging Electrical System',
    description: 'Pre-1970 home with no electrical permits in 30+ years',
    category: 'home_services',
    vertical: 'electrical',
    tier: 'pro',
    icon: '🔧',
    dataSource: 'combined',
    criteria: {
      type: 'compound',
      conditions: [
        { field: 'yearBuilt', operator: 'lt', value: 1970 },
        {
          field: 'noRecentElectrical',
          operator: 'custom',
          customLogic: `
            shovels_address_metrics.last_electrical_date < NOW() - INTERVAL '30 years'
            OR shovels_address_metrics.last_electrical_date IS NULL
          `
        }
      ],
      requiredDataPoints: ['yearBuilt', 'shovels_address_metrics']
    }
  }
];

// ===========================================
// PLUMBING FILTERS
// ===========================================

export const PLUMBING_FILTERS: FilterDefinition[] = [
  {
    slug: 'water-heater-replacement',
    name: 'Water Heater Replacement Due',
    description: 'Last water heater permit 10-15 years ago',
    category: 'home_services',
    vertical: 'plumbing',
    tier: 'pro',
    icon: '🚿',
    dataSource: 'combined',
    criteria: {
      type: 'calculated',
      conditions: [
        {
          field: 'waterHeaterAge',
          operator: 'custom',
          customLogic: `
            (shovels_address_metrics.last_water_heater_date IS NOT NULL 
              AND shovels_address_metrics.last_water_heater_date < NOW() - INTERVAL '10 years')
            OR (shovels_address_metrics.last_water_heater_date IS NULL 
              AND year_built + 12 < EXTRACT(YEAR FROM NOW()))
          `
        }
      ],
      requiredDataPoints: ['shovels_address_metrics.last_water_heater_date', 'yearBuilt']
    }
  },
  {
    slug: 'repiping-candidate',
    name: 'Repiping Candidate',
    description: 'Built 1950-1990 (galvanized/polybutylene era), no major plumbing permit',
    category: 'home_services',
    vertical: 'plumbing',
    tier: 'pro',
    icon: '🔧',
    dataSource: 'combined',
    criteria: {
      type: 'compound',
      conditions: [
        { field: 'yearBuilt', operator: 'gte', value: 1950 },
        { field: 'yearBuilt', operator: 'lte', value: 1990 },
        { field: 'shovels_address_metrics.has_plumbing_permit', operator: 'eq', value: false }
      ],
      requiredDataPoints: ['yearBuilt', 'shovels_address_metrics']
    }
  },
  {
    slug: 'bathroom-upgrade-momentum',
    name: 'Bathroom Upgrade Momentum',
    description: 'Recent bathroom permit, additional bathrooms likely need updates',
    category: 'home_services',
    vertical: 'plumbing',
    tier: 'pro',
    icon: '🛁',
    dataSource: 'combined',
    criteria: {
      type: 'compound',
      conditions: [
        {
          field: 'recentBathroomPermit',
          operator: 'custom',
          customLogic: 'shovels_address_metrics.all_permit_tags @> ARRAY[\'bathroom\']'
        },
        { field: 'bathrooms', operator: 'gte', value: 2 }
      ],
      requiredDataPoints: ['shovels_address_metrics', 'bathrooms']
    }
  }
];

// ===========================================
// SOLAR FILTERS
// ===========================================

export const SOLAR_FILTERS: FilterDefinition[] = [
  {
    slug: 'prime-solar-candidate',
    name: 'Prime Solar Candidate',
    description: 'New roof within 3 years, no solar, owner-occupied, above-median value',
    category: 'home_services',
    vertical: 'solar',
    tier: 'pro',
    icon: '☀️',
    dataSource: 'combined',
    criteria: {
      type: 'compound',
      conditions: [
        {
          field: 'recentRoof',
          operator: 'custom',
          customLogic: 'shovels_address_metrics.last_roofing_date > NOW() - INTERVAL \'3 years\''
        },
        { field: 'shovels_address_metrics.has_solar_permit', operator: 'eq', value: false },
        { field: 'ownerOccupied', operator: 'eq', value: true }
      ],
      requiredDataPoints: ['shovels_address_metrics', 'ownerOccupied']
    }
  },
  {
    slug: 'electrification-journey',
    name: 'Electrification Journey',
    description: 'Has EV charger or heat pump, no solar - natural next step',
    category: 'home_services',
    vertical: 'solar',
    tier: 'pro',
    icon: '🔋',
    dataSource: 'shovels',
    criteria: {
      type: 'compound',
      conditions: [
        {
          field: 'hasElectrification',
          operator: 'custom',
          customLogic: `
            shovels_address_metrics.has_ev_charger_permit = true
            OR shovels_address_metrics.has_heat_pump_permit = true
          `
        },
        { field: 'shovels_address_metrics.has_solar_permit', operator: 'eq', value: false }
      ],
      requiredDataPoints: ['shovels_address_metrics']
    }
  },
  {
    slug: 'battery-storage-upsell',
    name: 'Battery Storage Upsell',
    description: 'Has solar, no battery - backup power opportunity',
    category: 'home_services',
    vertical: 'solar',
    tier: 'pro',
    icon: '🔋',
    dataSource: 'shovels',
    criteria: {
      type: 'compound',
      conditions: [
        { field: 'shovels_address_metrics.has_solar_permit', operator: 'eq', value: true },
        { field: 'shovels_address_metrics.has_battery_permit', operator: 'eq', value: false }
      ],
      requiredDataPoints: ['shovels_address_metrics']
    }
  }
];

// ===========================================
// EXPORT ALL HOME SERVICES FILTERS
// ===========================================

export const ALL_HOME_SERVICES_FILTERS: FilterDefinition[] = [
  ...ROOFING_FILTERS,
  ...HVAC_FILTERS,
  ...ELECTRICAL_FILTERS,
  ...PLUMBING_FILTERS,
  ...SOLAR_FILTERS
];

// Filter lookup by vertical
export const FILTERS_BY_VERTICAL: Record<string, FilterDefinition[]> = {
  wholesaling: [], // Uses existing contrarian filters + new Shovels filters
  roofing: ROOFING_FILTERS,
  hvac: HVAC_FILTERS,
  electrical: ELECTRICAL_FILTERS,
  plumbing: PLUMBING_FILTERS,
  solar: SOLAR_FILTERS
};
```

---

## 9. Vertical Selection System

### Types

```typescript
// lib/verticals/types.ts

export type BusinessVertical = 
  | 'wholesaling' 
  | 'roofing' 
  | 'hvac' 
  | 'electrical' 
  | 'plumbing' 
  | 'solar';

export interface VerticalConfig {
  id: BusinessVertical;
  name: string;
  description: string;
  icon: string;
  color: string;
  defaultFilters: string[];
  primaryColumns: string[];
  heatMapLayers: string[];
  aiSystemPromptAddition: string;
}

export const VERTICAL_CONFIGS: Record<BusinessVertical, VerticalConfig> = {
  wholesaling: {
    id: 'wholesaling',
    name: 'Real Estate Wholesaling',
    description: 'Find motivated sellers and wholesale deals',
    icon: '🏠',
    color: '#3B82F6',
    defaultFilters: ['absentee-owner', 'high-equity', 'tired-landlord'],
    primaryColumns: ['equity_percent', 'owner_type', 'motivation_score', 'last_sale_date'],
    heatMapLayers: ['vitality', 'property_values', 'rent_growth'],
    aiSystemPromptAddition: 'Focus on deal analysis, seller motivation indicators, ARV calculations, and exit strategies (wholesale, flip, or hold).'
  },
  roofing: {
    id: 'roofing',
    name: 'Roofing',
    description: 'Find homeowners needing roof replacement',
    icon: '🏗️',
    color: '#EF4444',
    defaultFilters: ['roof-replacement-due', 'solar-ready-new-roof'],
    primaryColumns: ['last_roofing_permit', 'year_built', 'property_value', 'owner_occupied'],
    heatMapLayers: ['renovation_wave', 'property_values'],
    aiSystemPromptAddition: 'Focus on roof age estimation, replacement timing, insurance claim opportunities, and solar upsell potential.'
  },
  hvac: {
    id: 'hvac',
    name: 'HVAC',
    description: 'Find homeowners needing HVAC services',
    icon: '❄️',
    color: '#06B6D4',
    defaultFilters: ['hvac-replacement-due', 'heat-pump-candidate'],
    primaryColumns: ['last_hvac_permit', 'year_built', 'square_footage', 'owner_occupied'],
    heatMapLayers: ['electrification', 'renovation_wave'],
    aiSystemPromptAddition: 'Focus on system age assessment, sizing requirements, efficiency upgrade opportunities, and heat pump conversion potential.'
  },
  electrical: {
    id: 'electrical',
    name: 'Electrical',
    description: 'Find homeowners needing electrical work',
    icon: '⚡',
    color: '#F59E0B',
    defaultFilters: ['panel-upgrade-candidate', 'ev-charger-ready', 'aging-electrical'],
    primaryColumns: ['last_electrical_permit', 'year_built', 'property_value', 'has_solar'],
    heatMapLayers: ['electrification', 'property_values'],
    aiSystemPromptAddition: 'Focus on panel capacity assessment, EV charger installation requirements, code compliance, and safety upgrades.'
  },
  plumbing: {
    id: 'plumbing',
    name: 'Plumbing',
    description: 'Find homeowners needing plumbing services',
    icon: '🔧',
    color: '#10B981',
    defaultFilters: ['water-heater-replacement', 'repiping-candidate'],
    primaryColumns: ['last_plumbing_permit', 'year_built', 'bathrooms', 'owner_occupied'],
    heatMapLayers: ['renovation_wave', 'property_values'],
    aiSystemPromptAddition: 'Focus on pipe material assessment, water heater age, repiping needs, and bathroom renovation opportunities.'
  },
  solar: {
    id: 'solar',
    name: 'Solar',
    description: 'Find homeowners ready for solar installation',
    icon: '☀️',
    color: '#8B5CF6',
    defaultFilters: ['prime-solar-candidate', 'electrification-journey'],
    primaryColumns: ['last_roofing_permit', 'has_ev_charger', 'has_heat_pump', 'square_footage'],
    heatMapLayers: ['electrification', 'property_values'],
    aiSystemPromptAddition: 'Focus on roof suitability, energy usage estimation, ROI calculations, and battery storage opportunities.'
  }
};
```

### Vertical Service

```typescript
// lib/verticals/vertical-service.ts

import { createClient } from '@/lib/supabase/server';
import { BusinessVertical, VERTICAL_CONFIGS } from './types';
import { ALL_FILTERS } from '../filters/filter-definitions';
import { ALL_SHOVELS_FILTERS } from '../filters/shovels-filter-definitions';
import { FILTERS_BY_VERTICAL } from '../filters/home-services-filters';

export async function getUserVertical(userId: string): Promise<BusinessVertical> {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('user_verticals')
    .select('active_vertical')
    .eq('user_id', userId)
    .single();

  return data?.active_vertical || 'wholesaling';
}

export async function setUserVertical(userId: string, vertical: BusinessVertical): Promise<void> {
  const supabase = createClient();
  
  await supabase
    .from('user_verticals')
    .upsert({
      user_id: userId,
      active_vertical: vertical,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id'
    });
}

export async function getUserEnabledVerticals(userId: string): Promise<BusinessVertical[]> {
  const supabase = createClient();
  
  const { data } = await supabase
    .from('user_verticals')
    .select('enabled_verticals')
    .eq('user_id', userId)
    .single();

  return data?.enabled_verticals || ['wholesaling'];
}

export function getFiltersForVertical(vertical: BusinessVertical) {
  if (vertical === 'wholesaling') {
    // Wholesaling gets all standard + enhanced + contrarian + shovels filters
    return [...ALL_FILTERS, ...ALL_SHOVELS_FILTERS];
  }
  
  // Home services verticals get their specific filters
  return FILTERS_BY_VERTICAL[vertical] || [];
}

export function getVerticalConfig(vertical: BusinessVertical) {
  return VERTICAL_CONFIGS[vertical];
}

export function getAllVerticals() {
  return Object.values(VERTICAL_CONFIGS);
}
```

---

## 10. API Routes

### Shovels API Routes

```typescript
// app/api/shovels/permits/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { searchPermits, getPermitsForAddress } from '@/lib/shovels/shovels-service';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const addressId = searchParams.get('addressId');
  const geoId = searchParams.get('geoId');
  const permitFrom = searchParams.get('permitFrom');
  const permitTo = searchParams.get('permitTo');
  const tags = searchParams.getAll('tags');
  const status = searchParams.get('status');

  try {
    if (addressId) {
      // Get permits for specific address
      const permits = await getPermitsForAddress(addressId);
      return NextResponse.json({ permits });
    }

    if (geoId && permitFrom && permitTo) {
      // Search permits
      const result = await searchPermits({
        geo_id: geoId,
        permit_from: permitFrom,
        permit_to: permitTo,
        permit_tags: tags.length > 0 ? tags as any : undefined,
        status: status as any
      });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  } catch (error) {
    console.error('Shovels permits error:', error);
    return NextResponse.json({ error: 'Failed to fetch permits' }, { status: 500 });
  }
}
```

```typescript
// app/api/shovels/metrics/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getCityMetrics, getCountyMetrics, getAddressMetrics } from '@/lib/shovels/shovels-service';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const geoId = searchParams.get('geoId');
  const geoType = searchParams.get('geoType') as 'city' | 'county' | 'address';

  if (!geoId || !geoType) {
    return NextResponse.json({ error: 'Missing geoId or geoType' }, { status: 400 });
  }

  try {
    let metrics;
    
    switch (geoType) {
      case 'city':
        metrics = await getCityMetrics(geoId);
        break;
      case 'county':
        metrics = await getCountyMetrics(geoId);
        break;
      case 'address':
        metrics = await getAddressMetrics(geoId);
        break;
      default:
        return NextResponse.json({ error: 'Invalid geoType' }, { status: 400 });
    }

    return NextResponse.json({ metrics });
  } catch (error) {
    console.error('Shovels metrics error:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
```

```typescript
// app/api/shovels/vitality/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { calculateVitalityScore, storeVitalityScore } from '@/lib/shovels/vitality-score';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const geoId = searchParams.get('geoId');
  const geoType = searchParams.get('geoType') as 'city' | 'county';

  if (!geoId || !geoType) {
    return NextResponse.json({ error: 'Missing geoId or geoType' }, { status: 400 });
  }

  try {
    const score = await calculateVitalityScore(geoId, geoType);
    await storeVitalityScore(score);
    return NextResponse.json({ score });
  } catch (error) {
    console.error('Vitality score error:', error);
    return NextResponse.json({ error: 'Failed to calculate vitality score' }, { status: 500 });
  }
}
```

```typescript
// app/api/verticals/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { getUserVertical, setUserVertical, getUserEnabledVerticals } from '@/lib/verticals/vertical-service';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const activeVertical = await getUserVertical(user.id);
    const enabledVerticals = await getUserEnabledVerticals(user.id);
    
    return NextResponse.json({ 
      activeVertical, 
      enabledVerticals 
    });
  } catch (error) {
    console.error('Get verticals error:', error);
    return NextResponse.json({ error: 'Failed to get verticals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { vertical } = await request.json();
    
    if (!vertical) {
      return NextResponse.json({ error: 'Missing vertical' }, { status: 400 });
    }

    await setUserVertical(user.id, vertical);
    
    return NextResponse.json({ success: true, vertical });
  } catch (error) {
    console.error('Set vertical error:', error);
    return NextResponse.json({ error: 'Failed to set vertical' }, { status: 500 });
  }
}
```

---

## 11. UI Components

### Vertical Selector

```typescript
// components/verticals/VerticalSelector.tsx

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BusinessVertical, VERTICAL_CONFIGS } from '@/lib/verticals/types';

export function VerticalSelector() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data: verticalData } = useQuery({
    queryKey: ['user-vertical'],
    queryFn: async () => {
      const res = await fetch('/api/verticals');
      return res.json();
    }
  });

  const mutation = useMutation({
    mutationFn: async (vertical: BusinessVertical) => {
      const res = await fetch('/api/verticals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vertical })
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-vertical'] });
      queryClient.invalidateQueries({ queryKey: ['filters'] });
      setIsOpen(false);
    }
  });

  const activeVertical = verticalData?.activeVertical || 'wholesaling';
  const enabledVerticals = verticalData?.enabledVerticals || ['wholesaling'];
  const activeConfig = VERTICAL_CONFIGS[activeVertical as BusinessVertical];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-50"
        style={{ borderColor: activeConfig.color }}
      >
        <span>{activeConfig.icon}</span>
        <span className="font-medium">{activeConfig.name}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-2">
            <p className="text-xs text-gray-500 px-3 py-2">Select Business Vertical</p>
            {enabledVerticals.map((verticalId: BusinessVertical) => {
              const config = VERTICAL_CONFIGS[verticalId];
              const isActive = verticalId === activeVertical;
              
              return (
                <button
                  key={verticalId}
                  onClick={() => mutation.mutate(verticalId)}
                  disabled={mutation.isPending}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left ${
                    isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{config.icon}</span>
                  <div>
                    <p className="font-medium">{config.name}</p>
                    <p className="text-xs text-gray-500">{config.description}</p>
                  </div>
                  {isActive && (
                    <svg className="w-5 h-5 ml-auto text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Data Source Badge

```typescript
// components/ui/DataSourceBadge.tsx

'use client';

type DataSource = 'rentcast' | 'shovels' | 'combined';

interface DataSourceBadgeProps {
  source: DataSource;
  showLabel?: boolean;
}

const SOURCE_CONFIG = {
  rentcast: {
    label: 'RentCast',
    color: 'bg-blue-100 text-blue-800',
    icon: '🏠'
  },
  shovels: {
    label: 'Shovels',
    color: 'bg-orange-100 text-orange-800',
    icon: '🔨'
  },
  combined: {
    label: 'Combined',
    color: 'bg-purple-100 text-purple-800',
    icon: '🔗'
  }
};

export function DataSourceBadge({ source, showLabel = true }: DataSourceBadgeProps) {
  // Only show in development/testing
  if (process.env.NEXT_PUBLIC_SHOW_DATA_SOURCE_LABELS !== 'true') {
    return null;
  }

  const config = SOURCE_CONFIG[source];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
      <span>{config.icon}</span>
      {showLabel && <span>{config.label}</span>}
    </span>
  );
}
```

### Permit History Panel

```typescript
// components/property/PermitHistoryPanel.tsx

'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { DataSourceBadge } from '@/components/ui/DataSourceBadge';

interface PermitHistoryPanelProps {
  addressId: string;
}

export function PermitHistoryPanel({ addressId }: PermitHistoryPanelProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['permits', addressId],
    queryFn: async () => {
      const res = await fetch(`/api/shovels/permits?addressId=${addressId}`);
      return res.json();
    },
    enabled: !!addressId
  });

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-gray-100 rounded-lg" />;
  }

  if (!data?.permits || data.permits.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
        No permit history found for this property
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Permit History</h3>
        <DataSourceBadge source="shovels" />
      </div>
      
      <div className="space-y-3">
        {data.permits.map((permit: any) => (
          <div key={permit.id} className="p-3 bg-white border rounded-lg">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    permit.status === 'final' ? 'bg-green-100 text-green-800' :
                    permit.status === 'active' ? 'bg-blue-100 text-blue-800' :
                    permit.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {permit.status}
                  </span>
                  {permit.tags?.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-sm">{permit.description}</p>
              </div>
              {permit.job_value && (
                <span className="font-medium">
                  ${permit.job_value.toLocaleString()}
                </span>
              )}
            </div>
            
            <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
              {permit.file_date && (
                <span>Filed: {format(new Date(permit.file_date), 'MMM d, yyyy')}</span>
              )}
              {permit.issue_date && (
                <span>Issued: {format(new Date(permit.issue_date), 'MMM d, yyyy')}</span>
              )}
              {permit.inspection_pass_rate && (
                <span>Pass Rate: {permit.inspection_pass_rate}%</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 12. Implementation Order

### Phase 1: Foundation (Week 1-2)

1. **Environment Setup**
   - Add Shovels environment variables
   - Create Shovels account and get API key

2. **Database Schema**
   - Create all new tables (shovels_permits, shovels_address_metrics, geo_vitality_scores, user_verticals)
   - Add shovels_address_id column to properties
   - Create indexes
   - Create SQL functions

3. **Shovels API Service**
   - Implement shovels-service.ts with rate limiting
   - Implement address-matcher.ts
   - Test with free tier (250 calls)

### Phase 2: Wholesaling Enhancement (Week 3-4)

4. **Permit Filters**
   - Implement shovels-filter-definitions.ts
   - Update filter engine to handle Shovels conditions
   - Add DataSourceBadge component

5. **Combined Filters**
   - Implement address matching for existing properties
   - Calculate and store address metrics
   - Test combined filters

### Phase 3: Heat Mapping (Week 5-6)

6. **Vitality Score**
   - Implement vitality-score.ts
   - Create background job to calculate scores
   - Store in geo_vitality_scores

7. **Heat Map UI**
   - Implement heat-map-data.ts
   - Add layer toggles to map
   - Connect to Mapbox GL

### Phase 4: Home Services Verticals (Week 7-8)

8. **Vertical System**
   - Implement vertical types and configs
   - Implement vertical-service.ts
   - Create VerticalSelector component

9. **Home Services Filters**
   - Implement all filters by vertical
   - Add PermitHistoryPanel
   - Test each vertical end-to-end

10. **Polish**
    - Remove data source labels for production
    - Performance optimization
    - Documentation

---

## Summary

This specification adds:

| Component | Count |
|-----------|-------|
| New Database Tables | 4 |
| Shovels API Endpoints Used | 8 |
| New Wholesaling Filters | 8 |
| Home Services Filters | 15 |
| Heat Map Layers | 7 |
| Business Verticals | 6 |
| New UI Components | 4 |

**Key Technical Decisions:**
- RentCast for property/ownership + Shovels for permits/contractors
- Calculated vitality score (skip Census/BLS for V1)
- 30-day permit cache, 1-day metrics cache
- Free tier for testing → $599/month for production
- Data source labels visible during testing only

**This document is ready for implementation.**