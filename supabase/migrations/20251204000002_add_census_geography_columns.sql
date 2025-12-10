-- Migration: Add Census Geography Columns to Properties Table
-- Purpose: Cache Census Block Group and Tract identifiers for micro-territory comp selection

-- ============================================================================
-- 1. ADD CENSUS GEOGRAPHY COLUMNS TO PROPERTIES TABLE
-- ============================================================================

-- Census Block Group GEOID (12-digit unique identifier)
-- Example: 481410101001 (State 48 + County 141 + Tract 010100 + Block Group 1)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS census_block_group_geoid VARCHAR(12);

-- Census Tract GEOID (11-digit unique identifier)
-- Example: 48141010100 (State 48 + County 141 + Tract 010100)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS census_tract_geoid VARCHAR(11);

-- County FIPS code (5-digit: state + county)
-- Example: 48141 (Texas, El Paso County)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS census_county_fips VARCHAR(5);

-- State FIPS code (2-digit)
-- Example: 48 (Texas)
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS census_state_fips VARCHAR(2);

-- Timestamp when Census geocoding was last performed
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS census_geocoded_at TIMESTAMPTZ;

-- ============================================================================
-- 2. CREATE INDEXES FOR EFFICIENT GEOGRAPHIC QUERIES
-- ============================================================================

-- Index for block group lookups (most common for comp selection)
CREATE INDEX IF NOT EXISTS idx_properties_census_block_group
ON properties(census_block_group_geoid)
WHERE census_block_group_geoid IS NOT NULL;

-- Index for tract lookups (fallback for comp selection)
CREATE INDEX IF NOT EXISTS idx_properties_census_tract
ON properties(census_tract_geoid)
WHERE census_tract_geoid IS NOT NULL;

-- Composite index for hierarchical geographic queries
-- Useful for queries like "find all properties in same tract but different block group"
CREATE INDEX IF NOT EXISTS idx_properties_census_geo_hierarchy
ON properties(census_state_fips, census_county_fips, census_tract_geoid, census_block_group_geoid)
WHERE census_tract_geoid IS NOT NULL;

-- ============================================================================
-- 3. ADD SUBDIVISION COLUMN IF NOT EXISTS
-- ============================================================================

-- Subdivision name from RentCast (important for comp matching)
-- This may already exist from RentCast data, but ensure it exists
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS subdivision VARCHAR(255);

-- Index for subdivision matching
CREATE INDEX IF NOT EXISTS idx_properties_subdivision
ON properties(subdivision)
WHERE subdivision IS NOT NULL;

-- Enable pg_trgm extension for fuzzy matching (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- Trigram index for fuzzy subdivision matching
-- Note: Using gin_trgm_ops from the extensions schema
CREATE INDEX IF NOT EXISTS idx_properties_subdivision_trgm
ON properties USING gin(subdivision gin_trgm_ops)
WHERE subdivision IS NOT NULL;

-- ============================================================================
-- 4. ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN properties.census_block_group_geoid IS
'Census Bureau Block Group GEOID (12 digits). Smallest geographic unit for comp selection. Format: STATE(2) + COUNTY(3) + TRACT(6) + BLKGRP(1)';

COMMENT ON COLUMN properties.census_tract_geoid IS
'Census Bureau Tract GEOID (11 digits). Secondary geographic unit for comp selection. Format: STATE(2) + COUNTY(3) + TRACT(6)';

COMMENT ON COLUMN properties.census_county_fips IS
'FIPS county code (5 digits: state + county). Used for broader geographic grouping.';

COMMENT ON COLUMN properties.census_state_fips IS
'FIPS state code (2 digits). Used for state-level filtering.';

COMMENT ON COLUMN properties.census_geocoded_at IS
'Timestamp when Census geocoding was last performed. Used for cache invalidation.';

COMMENT ON COLUMN properties.subdivision IS
'Property subdivision/neighborhood name from RentCast. Key signal for comp matching.';
