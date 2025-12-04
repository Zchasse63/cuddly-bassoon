-- =============================================
-- Multi-Vertical Lead Generation: Shovels Integration Tables
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. Shovels Permits Table
-- Stores permit data from Shovels.ai API
-- =============================================
CREATE TABLE IF NOT EXISTS shovels_permits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Shovels identifiers
  shovels_permit_id TEXT UNIQUE NOT NULL,
  shovels_address_id TEXT NOT NULL,
  
  -- Permit details
  permit_number TEXT,
  permit_type TEXT,
  permit_status TEXT,
  permit_description TEXT,
  
  -- Shovels tags (array of permit type tags)
  tags TEXT[] DEFAULT '{}',
  
  -- Dates
  issue_date DATE,
  final_date DATE,
  expiration_date DATE,
  
  -- Valuation
  job_value DECIMAL(12, 2),
  fee_total DECIMAL(10, 2),
  
  -- Contractor info
  contractor_id TEXT,
  contractor_name TEXT,
  contractor_license TEXT,
  
  -- Inspection data
  inspection_pass_rate DECIMAL(5, 2),
  total_inspections INTEGER DEFAULT 0,
  passed_inspections INTEGER DEFAULT 0,
  failed_inspections INTEGER DEFAULT 0,
  
  -- Address components (denormalized for querying)
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  county TEXT,
  
  -- Geo coordinates
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  
  -- Metadata
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 2. Shovels Address Metrics Table
-- Aggregated metrics per address from Shovels
-- =============================================
CREATE TABLE IF NOT EXISTS shovels_address_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shovels_address_id TEXT UNIQUE NOT NULL,
  
  -- Address components
  street_address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  county TEXT,
  
  -- Permit counts by category
  total_permits INTEGER DEFAULT 0,
  active_permits INTEGER DEFAULT 0,
  completed_permits INTEGER DEFAULT 0,
  expired_permits INTEGER DEFAULT 0,
  
  -- Permit counts by tag
  permit_counts_by_tag JSONB DEFAULT '{}',
  
  -- Value metrics
  total_job_value DECIMAL(14, 2) DEFAULT 0,
  avg_job_value DECIMAL(12, 2) DEFAULT 0,
  max_job_value DECIMAL(12, 2) DEFAULT 0,
  
  -- Time-based metrics
  permits_last_12_months INTEGER DEFAULT 0,
  permits_prior_12_months INTEGER DEFAULT 0,
  yoy_permit_growth DECIMAL(5, 2),
  
  -- Quality metrics
  avg_inspection_pass_rate DECIMAL(5, 2),
  high_value_permit_ratio DECIMAL(5, 2),
  improvement_permit_ratio DECIMAL(5, 2),
  
  -- Last activity
  last_permit_date DATE,
  first_permit_date DATE,
  
  -- Metadata
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. Geo Vitality Scores Table
-- Geographic area vitality scores for heat mapping
-- =============================================
CREATE TABLE IF NOT EXISTS geo_vitality_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Geographic identifiers (one of these will be set)
  zip_code TEXT,
  county TEXT,
  city TEXT,
  state TEXT NOT NULL,
  
  -- Composite key for uniqueness
  geo_key TEXT UNIQUE NOT NULL,
  
  -- Vitality score components (0-100 scale)
  permit_volume_score DECIMAL(5, 2) DEFAULT 0,
  yoy_growth_score DECIMAL(5, 2) DEFAULT 0,
  high_value_ratio_score DECIMAL(5, 2) DEFAULT 0,
  improvement_ratio_score DECIMAL(5, 2) DEFAULT 0,
  inspection_pass_score DECIMAL(5, 2) DEFAULT 0,
  
  -- Weighted composite score
  vitality_score DECIMAL(5, 2) DEFAULT 0,
  
  -- Raw metrics used for scoring
  total_permits INTEGER DEFAULT 0,
  permits_last_12_months INTEGER DEFAULT 0,
  permits_prior_12_months INTEGER DEFAULT 0,
  yoy_growth_rate DECIMAL(5, 2),
  avg_job_value DECIMAL(12, 2),
  high_value_permit_count INTEGER DEFAULT 0,
  improvement_permit_count INTEGER DEFAULT 0,
  avg_inspection_pass_rate DECIMAL(5, 2),
  
  -- Vertical-specific scores
  vertical_scores JSONB DEFAULT '{}',
  
  -- Metadata
  property_count INTEGER DEFAULT 0,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 4. Shovels Contractors Table
-- Contractor data from Shovels.ai
-- =============================================
CREATE TABLE IF NOT EXISTS shovels_contractors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shovels_contractor_id TEXT UNIQUE NOT NULL,
  
  -- Basic info
  name TEXT NOT NULL,
  license_number TEXT,
  license_type TEXT,
  license_status TEXT,
  
  -- Contact info
  phone TEXT,
  email TEXT,
  website TEXT,
  
  -- Address
  street_address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  
  -- Metrics
  total_permits INTEGER DEFAULT 0,
  active_permits INTEGER DEFAULT 0,
  avg_job_value DECIMAL(12, 2),
  total_job_value DECIMAL(14, 2),
  
  -- Specializations (based on permit tags)
  specializations TEXT[] DEFAULT '{}',
  
  -- Quality metrics
  avg_inspection_pass_rate DECIMAL(5, 2),
  on_time_completion_rate DECIMAL(5, 2),
  
  -- Activity
  first_permit_date DATE,
  last_permit_date DATE,
  years_active INTEGER,
  
  -- Metadata
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. User Verticals Table
-- User business vertical preferences
-- =============================================
CREATE TABLE IF NOT EXISTS user_verticals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Primary vertical selection
  primary_vertical TEXT NOT NULL DEFAULT 'wholesaling',

  -- Additional enabled verticals
  enabled_verticals TEXT[] DEFAULT ARRAY['wholesaling'],

  -- Vertical-specific settings
  vertical_settings JSONB DEFAULT '{}',

  -- Filter presets per vertical
  filter_presets JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one record per user
  CONSTRAINT user_verticals_user_unique UNIQUE (user_id),

  -- Validate vertical values
  CONSTRAINT valid_primary_vertical CHECK (
    primary_vertical IN ('wholesaling', 'roofing', 'hvac', 'electrical', 'plumbing', 'solar')
  )
);

-- =============================================
-- 6. Add Shovels columns to properties table
-- =============================================
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS shovels_address_id TEXT,
ADD COLUMN IF NOT EXISTS shovels_matched_at TIMESTAMPTZ;

-- =============================================
-- 7. Create Indexes
-- =============================================

-- Shovels Permits indexes
CREATE INDEX IF NOT EXISTS idx_shovels_permits_address_id ON shovels_permits(shovels_address_id);
CREATE INDEX IF NOT EXISTS idx_shovels_permits_type ON shovels_permits(permit_type);
CREATE INDEX IF NOT EXISTS idx_shovels_permits_status ON shovels_permits(permit_status);
CREATE INDEX IF NOT EXISTS idx_shovels_permits_issue_date ON shovels_permits(issue_date DESC);
CREATE INDEX IF NOT EXISTS idx_shovels_permits_tags ON shovels_permits USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_shovels_permits_zip ON shovels_permits(zip_code);
CREATE INDEX IF NOT EXISTS idx_shovels_permits_city_state ON shovels_permits(city, state);
CREATE INDEX IF NOT EXISTS idx_shovels_permits_contractor ON shovels_permits(contractor_id);

-- Shovels Address Metrics indexes
CREATE INDEX IF NOT EXISTS idx_shovels_address_metrics_zip ON shovels_address_metrics(zip_code);
CREATE INDEX IF NOT EXISTS idx_shovels_address_metrics_city_state ON shovels_address_metrics(city, state);
CREATE INDEX IF NOT EXISTS idx_shovels_address_metrics_total_permits ON shovels_address_metrics(total_permits DESC);
CREATE INDEX IF NOT EXISTS idx_shovels_address_metrics_yoy_growth ON shovels_address_metrics(yoy_permit_growth DESC);

-- Geo Vitality Scores indexes
CREATE INDEX IF NOT EXISTS idx_geo_vitality_zip ON geo_vitality_scores(zip_code);
CREATE INDEX IF NOT EXISTS idx_geo_vitality_city_state ON geo_vitality_scores(city, state);
CREATE INDEX IF NOT EXISTS idx_geo_vitality_score ON geo_vitality_scores(vitality_score DESC);
CREATE INDEX IF NOT EXISTS idx_geo_vitality_state ON geo_vitality_scores(state);

-- Shovels Contractors indexes
CREATE INDEX IF NOT EXISTS idx_shovels_contractors_name ON shovels_contractors(name);
CREATE INDEX IF NOT EXISTS idx_shovels_contractors_license ON shovels_contractors(license_number);
CREATE INDEX IF NOT EXISTS idx_shovels_contractors_city_state ON shovels_contractors(city, state);
CREATE INDEX IF NOT EXISTS idx_shovels_contractors_specializations ON shovels_contractors USING GIN(specializations);

-- Properties Shovels columns index
CREATE INDEX IF NOT EXISTS idx_properties_shovels_address_id ON properties(shovels_address_id);

-- User Verticals indexes
CREATE INDEX IF NOT EXISTS idx_user_verticals_user_id ON user_verticals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verticals_primary ON user_verticals(primary_vertical);

-- =============================================
-- 8. Create updated_at triggers
-- =============================================

-- Trigger function (reuse if exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_shovels_permits_updated_at ON shovels_permits;
CREATE TRIGGER update_shovels_permits_updated_at
  BEFORE UPDATE ON shovels_permits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shovels_address_metrics_updated_at ON shovels_address_metrics;
CREATE TRIGGER update_shovels_address_metrics_updated_at
  BEFORE UPDATE ON shovels_address_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_geo_vitality_scores_updated_at ON geo_vitality_scores;
CREATE TRIGGER update_geo_vitality_scores_updated_at
  BEFORE UPDATE ON geo_vitality_scores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_shovels_contractors_updated_at ON shovels_contractors;
CREATE TRIGGER update_shovels_contractors_updated_at
  BEFORE UPDATE ON shovels_contractors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_verticals_updated_at ON user_verticals;
CREATE TRIGGER update_user_verticals_updated_at
  BEFORE UPDATE ON user_verticals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
