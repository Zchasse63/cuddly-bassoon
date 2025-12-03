-- Add property analysis columns for AI tools
-- Part of Phase 7: Buyer Intelligence

-- Add missing columns to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS condition text CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'distressed')),
ADD COLUMN IF NOT EXISTS asking_price numeric,
ADD COLUMN IF NOT EXISTS days_on_market integer,
ADD COLUMN IF NOT EXISTS estimated_value numeric,
ADD COLUMN IF NOT EXISTS arv numeric,
ADD COLUMN IF NOT EXISTS last_sale_date date,
ADD COLUMN IF NOT EXISTS last_sale_price numeric;

-- Add index for common queries
CREATE INDEX IF NOT EXISTS idx_properties_condition ON properties(condition);
CREATE INDEX IF NOT EXISTS idx_properties_asking_price ON properties(asking_price);
CREATE INDEX IF NOT EXISTS idx_properties_days_on_market ON properties(days_on_market);

COMMENT ON COLUMN properties.condition IS 'Property condition: excellent, good, fair, poor, distressed';
COMMENT ON COLUMN properties.asking_price IS 'Current asking price if listed';
COMMENT ON COLUMN properties.days_on_market IS 'Number of days property has been on market';
COMMENT ON COLUMN properties.estimated_value IS 'AI-estimated current market value';
COMMENT ON COLUMN properties.arv IS 'After Repair Value estimate';
COMMENT ON COLUMN properties.last_sale_date IS 'Date of last property sale';
COMMENT ON COLUMN properties.last_sale_price IS 'Price of last property sale';
