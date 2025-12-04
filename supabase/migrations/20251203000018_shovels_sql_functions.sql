-- =============================================
-- Multi-Vertical Lead Generation: SQL Functions
-- Helper functions for filter conditions and analytics
-- =============================================

-- =============================================
-- 1. Function to check if property has abandoned project
-- Used by: stalled-permit filter, sunk-cost filter
-- =============================================
CREATE OR REPLACE FUNCTION has_abandoned_project(property_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM shovels_address_metrics sam
    JOIN properties p ON p.shovels_address_id = sam.shovels_address_id
    WHERE p.id = property_id
    AND (sam.has_stalled_permit = true OR sam.has_expired_permit = true)
  );
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION has_abandoned_project(UUID) IS 
'Returns true if property has a stalled or expired permit indicating abandoned project';

-- =============================================
-- 2. Function to check if major system is due for replacement
-- Used by: major-system-due filter, home services verticals
-- =============================================
CREATE OR REPLACE FUNCTION major_system_due(property_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  prop RECORD;
  metrics RECORD;
  current_year INTEGER := EXTRACT(YEAR FROM CURRENT_DATE);
BEGIN
  SELECT * INTO prop FROM properties WHERE id = property_id;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  SELECT sam.* INTO metrics FROM shovels_address_metrics sam
    JOIN properties p ON p.shovels_address_id = sam.shovels_address_id
    WHERE p.id = property_id;
  
  IF NOT FOUND THEN
    -- No Shovels data, check based on year_built only
    IF prop.year_built IS NOT NULL AND prop.year_built + 20 < current_year THEN
      RETURN true; -- Likely needs major system work
    END IF;
    RETURN false;
  END IF;
  
  -- Roof due (20+ years since build, no roofing permit in last 20 years)
  IF prop.year_built IS NOT NULL 
     AND prop.year_built + 20 < current_year 
     AND (metrics.last_roofing_date IS NULL OR metrics.last_roofing_date < CURRENT_DATE - INTERVAL '20 years') THEN
    RETURN true;
  END IF;
  
  -- HVAC due (15+ years expected lifespan for most units)
  IF prop.year_built IS NOT NULL 
     AND prop.year_built + 15 < current_year 
     AND (metrics.last_hvac_date IS NULL OR metrics.last_hvac_date < CURRENT_DATE - INTERVAL '15 years') THEN
    RETURN true;
  END IF;
  
  -- Water heater due (10-15 years lifespan)
  IF prop.year_built IS NOT NULL 
     AND prop.year_built + 12 < current_year 
     AND (metrics.last_water_heater_date IS NULL OR metrics.last_water_heater_date < CURRENT_DATE - INTERVAL '12 years') THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION major_system_due(UUID) IS 
'Returns true if property likely needs major system replacement (roof, HVAC, or water heater)';

-- =============================================
-- 3. Function to get neighborhood permit density percentile
-- Used by: falling-behind filter, heat map visualization
-- =============================================
CREATE OR REPLACE FUNCTION neighborhood_permit_percentile(zip_code TEXT)
RETURNS NUMERIC AS $$
DECLARE
  zip_permits INTEGER;
  percentile NUMERIC;
BEGIN
  SELECT total_permits INTO zip_permits
  FROM geo_vitality_scores
  WHERE geo_id = zip_code AND geo_type = 'zip';
  
  IF zip_permits IS NULL THEN
    RETURN 0;
  END IF;
  
  SELECT (COUNT(*) FILTER (WHERE total_permits < zip_permits)::NUMERIC / NULLIF(COUNT(*)::NUMERIC, 0)) * 100
  INTO percentile
  FROM geo_vitality_scores
  WHERE geo_type = 'zip';
  
  RETURN COALESCE(percentile, 0);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION neighborhood_permit_percentile(TEXT) IS 
'Returns the percentile rank (0-100) of a ZIP code based on permit activity';

-- =============================================
-- 4. Function to get property permit count
-- Helper for various filters
-- =============================================
CREATE OR REPLACE FUNCTION property_permit_count(property_id UUID, since_date DATE DEFAULT NULL)
RETURNS INTEGER AS $$
DECLARE
  permit_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO permit_count
  FROM shovels_permits sp
  JOIN properties p ON p.shovels_address_id = sp.shovels_address_id
  WHERE p.id = property_id
  AND (since_date IS NULL OR sp.issue_date >= since_date);
  
  RETURN COALESCE(permit_count, 0);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION property_permit_count(UUID, DATE) IS 
'Returns the number of permits for a property, optionally filtered by date';

-- =============================================
-- 5. Function to check inspection pass rate
-- Used by: failed-inspection filter
-- =============================================
CREATE OR REPLACE FUNCTION property_inspection_pass_rate(property_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  pass_rate NUMERIC;
BEGIN
  SELECT sam.inspection_pass_rate INTO pass_rate
  FROM shovels_address_metrics sam
  JOIN properties p ON p.shovels_address_id = sam.shovels_address_id
  WHERE p.id = property_id;
  
  RETURN COALESCE(pass_rate, 1.0); -- Default to 100% if no data
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION property_inspection_pass_rate(UUID) IS 
'Returns the inspection pass rate (0-1) for a property based on permit history';

-- =============================================
-- 6. Create indexes to optimize function performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_properties_shovels_address_id ON properties(shovels_address_id) WHERE shovels_address_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_geo_vitality_scores_geo_id_type ON geo_vitality_scores(geo_id, geo_type);

