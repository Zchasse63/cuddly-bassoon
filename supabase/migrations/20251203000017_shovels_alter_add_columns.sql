-- =============================================
-- Multi-Vertical Lead Generation: Add Missing Columns
-- Adds columns required for SQL functions and filter conditions
-- =============================================

-- =============================================
-- 1. Alter shovels_permits table
-- Add missing date and timing columns
-- =============================================
ALTER TABLE shovels_permits
ADD COLUMN IF NOT EXISTS file_date DATE,
ADD COLUMN IF NOT EXISTS approval_days INTEGER,
ADD COLUMN IF NOT EXISTS construction_days INTEGER;

-- Add comment for documentation
COMMENT ON COLUMN shovels_permits.file_date IS 'Date permit was filed with jurisdiction';
COMMENT ON COLUMN shovels_permits.approval_days IS 'Days from file_date to issue_date';
COMMENT ON COLUMN shovels_permits.construction_days IS 'Days from issue_date to final_date';

-- =============================================
-- 2. Alter shovels_address_metrics table
-- Add columns for filter conditions and SQL functions
-- =============================================
ALTER TABLE shovels_address_metrics
ADD COLUMN IF NOT EXISTS has_stalled_permit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS has_expired_permit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_roofing_date DATE,
ADD COLUMN IF NOT EXISTS last_hvac_date DATE,
ADD COLUMN IF NOT EXISTS last_water_heater_date DATE,
ADD COLUMN IF NOT EXISTS last_electrical_date DATE,
ADD COLUMN IF NOT EXISTS last_plumbing_date DATE,
ADD COLUMN IF NOT EXISTS last_solar_date DATE;

-- Add comments for documentation
COMMENT ON COLUMN shovels_address_metrics.has_stalled_permit IS 'True if address has active permit 180+ days without progress';
COMMENT ON COLUMN shovels_address_metrics.has_expired_permit IS 'True if address has expired permit without final inspection';
COMMENT ON COLUMN shovels_address_metrics.last_roofing_date IS 'Date of most recent roofing permit';
COMMENT ON COLUMN shovels_address_metrics.last_hvac_date IS 'Date of most recent HVAC permit';
COMMENT ON COLUMN shovels_address_metrics.last_water_heater_date IS 'Date of most recent water heater permit';
COMMENT ON COLUMN shovels_address_metrics.last_electrical_date IS 'Date of most recent electrical permit';
COMMENT ON COLUMN shovels_address_metrics.last_plumbing_date IS 'Date of most recent plumbing permit';
COMMENT ON COLUMN shovels_address_metrics.last_solar_date IS 'Date of most recent solar permit';

-- =============================================
-- 3. Alter geo_vitality_scores table
-- Add geo_type for SQL function compatibility
-- =============================================
ALTER TABLE geo_vitality_scores
ADD COLUMN IF NOT EXISTS geo_type TEXT DEFAULT 'zip';

-- Add constraint for valid geo_type values
ALTER TABLE geo_vitality_scores
DROP CONSTRAINT IF EXISTS valid_geo_type;

ALTER TABLE geo_vitality_scores
ADD CONSTRAINT valid_geo_type CHECK (
  geo_type IN ('zip', 'city', 'county', 'state')
);

COMMENT ON COLUMN geo_vitality_scores.geo_type IS 'Geographic level: zip, city, county, or state';

-- =============================================
-- 4. Create indexes for new columns
-- =============================================
CREATE INDEX IF NOT EXISTS idx_shovels_permits_file_date ON shovels_permits(file_date DESC);
CREATE INDEX IF NOT EXISTS idx_shovels_address_metrics_stalled ON shovels_address_metrics(has_stalled_permit) WHERE has_stalled_permit = true;
CREATE INDEX IF NOT EXISTS idx_shovels_address_metrics_expired ON shovels_address_metrics(has_expired_permit) WHERE has_expired_permit = true;
CREATE INDEX IF NOT EXISTS idx_geo_vitality_geo_type ON geo_vitality_scores(geo_type);

-- =============================================
-- 5. Update geo_key generation approach
-- Create function to generate geo_key from components
-- =============================================
CREATE OR REPLACE FUNCTION generate_geo_key()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate geo_key based on geo_type and available components
  IF NEW.geo_type = 'zip' AND NEW.zip_code IS NOT NULL THEN
    NEW.geo_key := 'zip:' || NEW.zip_code;
  ELSIF NEW.geo_type = 'city' AND NEW.city IS NOT NULL AND NEW.state IS NOT NULL THEN
    NEW.geo_key := 'city:' || LOWER(NEW.city) || ':' || UPPER(NEW.state);
  ELSIF NEW.geo_type = 'county' AND NEW.county IS NOT NULL AND NEW.state IS NOT NULL THEN
    NEW.geo_key := 'county:' || LOWER(NEW.county) || ':' || UPPER(NEW.state);
  ELSIF NEW.geo_type = 'state' AND NEW.state IS NOT NULL THEN
    NEW.geo_key := 'state:' || UPPER(NEW.state);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger for geo_key generation
DROP TRIGGER IF EXISTS generate_geo_vitality_key ON geo_vitality_scores;
CREATE TRIGGER generate_geo_vitality_key
  BEFORE INSERT OR UPDATE ON geo_vitality_scores
  FOR EACH ROW
  WHEN (NEW.geo_key IS NULL OR NEW.geo_key = '')
  EXECUTE FUNCTION generate_geo_key();

