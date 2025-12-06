-- =============================================
-- Market Velocity Index Tables
-- Composite heat map layer for buyer demand intensity analysis
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. Market Velocity Index Table
-- Store calculated velocity indexes by zip code
-- =============================================
CREATE TABLE IF NOT EXISTS market_velocity_index (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zip_code TEXT NOT NULL,
  geo_id TEXT,  -- Shovels geo_id for the area

  -- Geographic info (denormalized for queries)
  city TEXT,
  state TEXT,
  county TEXT,

  -- Component Scores (0-100)
  days_on_market_score DECIMAL(5,2),
  absorption_score DECIMAL(5,2),
  inventory_score DECIMAL(5,2),
  permit_activity_score DECIMAL(5,2),
  investment_conviction_score DECIMAL(5,2),

  -- Raw Metrics
  avg_days_on_market DECIMAL(6,2),
  median_days_on_market DECIMAL(6,2),
  absorption_rate DECIMAL(5,4),
  months_of_inventory DECIMAL(5,2),
  total_listings INTEGER,
  permit_volume INTEGER,
  permit_value_total BIGINT,

  -- Composite
  velocity_index INTEGER NOT NULL,  -- 0-100
  classification TEXT NOT NULL,  -- 'Cold', 'Cool', 'Balanced', 'Warm', 'Hot', 'On Fire'

  -- Trend (compared to previous calculation)
  velocity_trend TEXT,  -- 'Rising', 'Stable', 'Falling'
  velocity_change INTEGER,  -- +/- from last calculation

  -- Geo coordinates for map rendering
  center_lat DECIMAL(10,7),
  center_lng DECIMAL(10,7),

  -- Metadata
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  rentcast_data_date TIMESTAMPTZ,
  shovels_data_date TIMESTAMPTZ,

  -- Cache management
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT market_velocity_index_zip_unique UNIQUE(zip_code),
  CONSTRAINT valid_classification CHECK (
    classification IN ('Cold', 'Cool', 'Balanced', 'Warm', 'Hot', 'On Fire')
  ),
  CONSTRAINT valid_trend CHECK (
    velocity_trend IS NULL OR velocity_trend IN ('Rising', 'Stable', 'Falling')
  )
);

-- =============================================
-- 2. Market Velocity History Table
-- Historical tracking for trends
-- =============================================
CREATE TABLE IF NOT EXISTS market_velocity_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zip_code TEXT NOT NULL,
  velocity_index INTEGER NOT NULL,
  classification TEXT NOT NULL,
  calculated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Store full snapshot for historical analysis
  component_scores JSONB,
  raw_metrics JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 3. Market Velocity Aggregates Table
-- Pre-aggregated data for larger geographic areas
-- =============================================
CREATE TABLE IF NOT EXISTS market_velocity_aggregates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  geo_type TEXT NOT NULL,  -- 'city', 'county', 'metro', 'state'
  geo_name TEXT NOT NULL,
  geo_id TEXT,  -- Shovels geo_id if applicable
  state TEXT NOT NULL,

  -- Aggregated from child zip codes
  avg_velocity_index DECIMAL(5,2),
  min_velocity_index INTEGER,
  max_velocity_index INTEGER,
  median_velocity_index INTEGER,

  -- Counts
  zip_count INTEGER,
  hot_zip_count INTEGER,  -- velocity >= 70
  cold_zip_count INTEGER,  -- velocity < 25

  -- Dominant classification
  dominant_classification TEXT,

  -- Trend
  velocity_trend TEXT,

  -- Bounds for map rendering
  bounds_north DECIMAL(10,7),
  bounds_south DECIMAL(10,7),
  bounds_east DECIMAL(10,7),
  bounds_west DECIMAL(10,7),
  center_lat DECIMAL(10,7),
  center_lng DECIMAL(10,7),

  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT market_velocity_aggregates_unique UNIQUE(geo_type, geo_name, state)
);

-- =============================================
-- 4. Tracked Zip Codes Table
-- Zip codes we actively track for velocity calculations
-- =============================================
CREATE TABLE IF NOT EXISTS tracked_zip_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zip_code TEXT UNIQUE NOT NULL,
  geo_id TEXT,  -- Shovels geo_id
  city TEXT,
  state TEXT NOT NULL,
  county TEXT,

  -- Coordinates for the zip code centroid
  center_lat DECIMAL(10,7),
  center_lng DECIMAL(10,7),

  -- Tracking status
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 5,  -- 1-10, higher = more important

  -- When we last calculated velocity for this zip
  last_calculated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- 5. Create Indexes
-- =============================================

-- Market Velocity Index indexes
CREATE INDEX IF NOT EXISTS idx_mvi_zip ON market_velocity_index (zip_code);
CREATE INDEX IF NOT EXISTS idx_mvi_velocity ON market_velocity_index (velocity_index DESC);
CREATE INDEX IF NOT EXISTS idx_mvi_classification ON market_velocity_index (classification);
CREATE INDEX IF NOT EXISTS idx_mvi_expires ON market_velocity_index (expires_at);
CREATE INDEX IF NOT EXISTS idx_mvi_state ON market_velocity_index (state);
CREATE INDEX IF NOT EXISTS idx_mvi_city_state ON market_velocity_index (city, state);

-- Market Velocity History indexes
CREATE INDEX IF NOT EXISTS idx_mvh_zip_date ON market_velocity_history (zip_code, calculated_at DESC);
CREATE INDEX IF NOT EXISTS idx_mvh_calculated_at ON market_velocity_history (calculated_at DESC);

-- Market Velocity Aggregates indexes
CREATE INDEX IF NOT EXISTS idx_mva_type ON market_velocity_aggregates (geo_type);
CREATE INDEX IF NOT EXISTS idx_mva_state ON market_velocity_aggregates (state);
CREATE INDEX IF NOT EXISTS idx_mva_velocity ON market_velocity_aggregates (avg_velocity_index DESC);
CREATE INDEX IF NOT EXISTS idx_mva_type_state ON market_velocity_aggregates (geo_type, state);

-- Tracked Zip Codes indexes
CREATE INDEX IF NOT EXISTS idx_tzc_state ON tracked_zip_codes (state);
CREATE INDEX IF NOT EXISTS idx_tzc_active ON tracked_zip_codes (is_active);
CREATE INDEX IF NOT EXISTS idx_tzc_priority ON tracked_zip_codes (priority DESC);
CREATE INDEX IF NOT EXISTS idx_tzc_last_calculated ON tracked_zip_codes (last_calculated_at);

-- =============================================
-- 6. Create updated_at triggers
-- =============================================

-- Apply triggers (reuse existing function from earlier migrations)
DROP TRIGGER IF EXISTS update_market_velocity_index_updated_at ON market_velocity_index;
CREATE TRIGGER update_market_velocity_index_updated_at
  BEFORE UPDATE ON market_velocity_index
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_market_velocity_aggregates_updated_at ON market_velocity_aggregates;
CREATE TRIGGER update_market_velocity_aggregates_updated_at
  BEFORE UPDATE ON market_velocity_aggregates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tracked_zip_codes_updated_at ON tracked_zip_codes;
CREATE TRIGGER update_tracked_zip_codes_updated_at
  BEFORE UPDATE ON tracked_zip_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7. Create RLS Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE market_velocity_index ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_velocity_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_velocity_aggregates ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracked_zip_codes ENABLE ROW LEVEL SECURITY;

-- Public read access for market velocity data (it's aggregated market data, not user-specific)
DROP POLICY IF EXISTS "Market velocity index is publicly readable" ON market_velocity_index;
CREATE POLICY "Market velocity index is publicly readable"
  ON market_velocity_index FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Market velocity history is publicly readable" ON market_velocity_history;
CREATE POLICY "Market velocity history is publicly readable"
  ON market_velocity_history FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Market velocity aggregates are publicly readable" ON market_velocity_aggregates;
CREATE POLICY "Market velocity aggregates are publicly readable"
  ON market_velocity_aggregates FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Tracked zip codes are publicly readable" ON tracked_zip_codes;
CREATE POLICY "Tracked zip codes are publicly readable"
  ON tracked_zip_codes FOR SELECT
  USING (true);

-- Only service role can insert/update/delete (these are system-managed tables)
DROP POLICY IF EXISTS "Service role can manage market velocity index" ON market_velocity_index;
CREATE POLICY "Service role can manage market velocity index"
  ON market_velocity_index FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role can manage market velocity history" ON market_velocity_history;
CREATE POLICY "Service role can manage market velocity history"
  ON market_velocity_history FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role can manage market velocity aggregates" ON market_velocity_aggregates;
CREATE POLICY "Service role can manage market velocity aggregates"
  ON market_velocity_aggregates FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

DROP POLICY IF EXISTS "Service role can manage tracked zip codes" ON tracked_zip_codes;
CREATE POLICY "Service role can manage tracked zip codes"
  ON tracked_zip_codes FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- =============================================
-- 8. SQL Functions for Aggregation
-- =============================================

-- Function to calculate city-level velocity aggregates
CREATE OR REPLACE FUNCTION calculate_city_velocity_aggregates()
RETURNS TABLE (
  geo_type TEXT,
  geo_name TEXT,
  state TEXT,
  avg_velocity_index DECIMAL(5,2),
  min_velocity_index INTEGER,
  max_velocity_index INTEGER,
  median_velocity_index INTEGER,
  zip_count INTEGER,
  hot_zip_count INTEGER,
  cold_zip_count INTEGER,
  dominant_classification TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    'city'::TEXT as geo_type,
    m.city as geo_name,
    m.state,
    AVG(m.velocity_index)::DECIMAL(5,2) as avg_velocity_index,
    MIN(m.velocity_index) as min_velocity_index,
    MAX(m.velocity_index) as max_velocity_index,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY m.velocity_index)::INTEGER as median_velocity_index,
    COUNT(*)::INTEGER as zip_count,
    COUNT(*) FILTER (WHERE m.velocity_index >= 70)::INTEGER as hot_zip_count,
    COUNT(*) FILTER (WHERE m.velocity_index < 25)::INTEGER as cold_zip_count,
    MODE() WITHIN GROUP (ORDER BY m.classification) as dominant_classification
  FROM market_velocity_index m
  WHERE m.city IS NOT NULL
  GROUP BY m.city, m.state;
END;
$$ LANGUAGE plpgsql;

-- Function to get velocity rankings
CREATE OR REPLACE FUNCTION get_velocity_rankings(
  p_type TEXT DEFAULT 'top',
  p_limit INTEGER DEFAULT 20,
  p_state TEXT DEFAULT NULL
)
RETURNS TABLE (
  zip_code TEXT,
  city TEXT,
  state TEXT,
  velocity_index INTEGER,
  classification TEXT,
  avg_days_on_market DECIMAL(6,2),
  months_of_inventory DECIMAL(5,2)
) AS $$
BEGIN
  IF p_type = 'top' THEN
    RETURN QUERY
    SELECT
      m.zip_code,
      m.city,
      m.state,
      m.velocity_index,
      m.classification,
      m.avg_days_on_market,
      m.months_of_inventory
    FROM market_velocity_index m
    WHERE (p_state IS NULL OR m.state = p_state)
    ORDER BY m.velocity_index DESC
    LIMIT p_limit;
  ELSE
    RETURN QUERY
    SELECT
      m.zip_code,
      m.city,
      m.state,
      m.velocity_index,
      m.classification,
      m.avg_days_on_market,
      m.months_of_inventory
    FROM market_velocity_index m
    WHERE (p_state IS NULL OR m.state = p_state)
    ORDER BY m.velocity_index ASC
    LIMIT p_limit;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to get velocity for a bounding box (for map heat layer)
CREATE OR REPLACE FUNCTION get_velocity_for_bounds(
  p_north DECIMAL,
  p_south DECIMAL,
  p_east DECIMAL,
  p_west DECIMAL
)
RETURNS TABLE (
  zip_code TEXT,
  velocity_index INTEGER,
  classification TEXT,
  center_lat DECIMAL(10,7),
  center_lng DECIMAL(10,7)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.zip_code,
    m.velocity_index,
    m.classification,
    m.center_lat,
    m.center_lng
  FROM market_velocity_index m
  WHERE m.center_lat IS NOT NULL
    AND m.center_lng IS NOT NULL
    AND m.center_lat BETWEEN p_south AND p_north
    AND m.center_lng BETWEEN p_west AND p_east;
END;
$$ LANGUAGE plpgsql;
