-- ============================================================================
-- Add Missing Columns Migration
-- Migration: 20251205000005
--
-- Adds columns that are referenced in code but missing from database schema
-- ============================================================================

-- ============================================================================
-- 1. Properties Table - Add distress and financial indicator columns
-- ============================================================================

ALTER TABLE properties
ADD COLUMN IF NOT EXISTS pre_foreclosure BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tax_delinquent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS vacant BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS code_liens BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mortgage_balance NUMERIC,
ADD COLUMN IF NOT EXISTS equity_percent NUMERIC,
ADD COLUMN IF NOT EXISTS rent_estimate NUMERIC,
ADD COLUMN IF NOT EXISTS tax_amount NUMERIC;

-- Add comments for documentation
COMMENT ON COLUMN properties.pre_foreclosure IS 'Whether property is in pre-foreclosure status';
COMMENT ON COLUMN properties.tax_delinquent IS 'Whether property has delinquent taxes';
COMMENT ON COLUMN properties.vacant IS 'Whether property appears to be vacant';
COMMENT ON COLUMN properties.code_liens IS 'Whether property has code violation liens';
COMMENT ON COLUMN properties.mortgage_balance IS 'Estimated current mortgage balance';
COMMENT ON COLUMN properties.equity_percent IS 'Estimated equity as percentage of value';
COMMENT ON COLUMN properties.rent_estimate IS 'Estimated monthly rent value';
COMMENT ON COLUMN properties.tax_amount IS 'Annual property tax amount';

-- Add indexes for commonly filtered columns
CREATE INDEX IF NOT EXISTS idx_properties_pre_foreclosure
  ON properties(pre_foreclosure) WHERE pre_foreclosure = TRUE;
CREATE INDEX IF NOT EXISTS idx_properties_tax_delinquent
  ON properties(tax_delinquent) WHERE tax_delinquent = TRUE;
CREATE INDEX IF NOT EXISTS idx_properties_vacant
  ON properties(vacant) WHERE vacant = TRUE;
CREATE INDEX IF NOT EXISTS idx_properties_equity_percent
  ON properties(equity_percent) WHERE equity_percent IS NOT NULL;

-- ============================================================================
-- 2. Deals Table - Add pipeline and financial tracking columns
-- ============================================================================

ALTER TABLE deals
ADD COLUMN IF NOT EXISTS close_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deal_type TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS profit NUMERIC,
ADD COLUMN IF NOT EXISTS roi NUMERIC,
ADD COLUMN IF NOT EXISTS days_in_pipeline INTEGER,
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC;

-- Add comments for documentation
COMMENT ON COLUMN deals.close_date IS 'Date when deal was closed/completed';
COMMENT ON COLUMN deals.deal_type IS 'Type of deal (wholesale, wholetail, fix_and_flip, etc.)';
COMMENT ON COLUMN deals.city IS 'City where property is located';
COMMENT ON COLUMN deals.state IS 'State where property is located';
COMMENT ON COLUMN deals.zip_code IS 'ZIP code where property is located';
COMMENT ON COLUMN deals.profit IS 'Net profit from the deal';
COMMENT ON COLUMN deals.roi IS 'Return on investment percentage';
COMMENT ON COLUMN deals.days_in_pipeline IS 'Number of days deal was in pipeline';
COMMENT ON COLUMN deals.purchase_price IS 'Purchase/acquisition price';

-- Add indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_deals_close_date ON deals(close_date DESC);
CREATE INDEX IF NOT EXISTS idx_deals_deal_type ON deals(deal_type);
CREATE INDEX IF NOT EXISTS idx_deals_city_state ON deals(city, state);
CREATE INDEX IF NOT EXISTS idx_deals_profit ON deals(profit) WHERE profit IS NOT NULL;

-- ============================================================================
-- 3. Create trigger to calculate days_in_pipeline automatically
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_days_in_pipeline()
RETURNS TRIGGER AS $$
BEGIN
  -- When a deal is closed, calculate days in pipeline
  IF NEW.close_date IS NOT NULL AND NEW.created_at IS NOT NULL THEN
    NEW.days_in_pipeline := EXTRACT(DAY FROM (NEW.close_date - NEW.created_at));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_days_in_pipeline ON deals;
CREATE TRIGGER trigger_calculate_days_in_pipeline
  BEFORE INSERT OR UPDATE ON deals
  FOR EACH ROW
  WHEN (NEW.close_date IS NOT NULL)
  EXECUTE FUNCTION calculate_days_in_pipeline();

-- ============================================================================
-- 4. Create trigger to calculate profit automatically
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_deal_profit()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate profit from assignment fee or sale vs purchase price
  IF NEW.assignment_fee IS NOT NULL THEN
    NEW.profit := NEW.assignment_fee;
  ELSIF NEW.contract_price IS NOT NULL AND NEW.purchase_price IS NOT NULL THEN
    NEW.profit := NEW.contract_price - NEW.purchase_price - COALESCE(NEW.estimated_repairs, 0);
  END IF;

  -- Calculate ROI if we have profit and purchase price
  IF NEW.profit IS NOT NULL AND NEW.purchase_price IS NOT NULL AND NEW.purchase_price > 0 THEN
    NEW.roi := (NEW.profit / NEW.purchase_price) * 100;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_deal_profit ON deals;
CREATE TRIGGER trigger_calculate_deal_profit
  BEFORE INSERT OR UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION calculate_deal_profit();

-- ============================================================================
-- 5. Backfill city/state/zip from property_address if possible
-- ============================================================================

-- Note: This is a best-effort parse for addresses in format "123 Main St, City, ST 12345"
-- Production systems should use a proper address parser or geocoding service

UPDATE deals d
SET
  city = COALESCE(d.city, p.city),
  state = COALESCE(d.state, p.state),
  zip_code = COALESCE(d.zip_code, p.zip)
FROM properties p
WHERE d.property_id = p.id
AND d.property_id IS NOT NULL
AND (d.city IS NULL OR d.state IS NULL OR d.zip_code IS NULL);
