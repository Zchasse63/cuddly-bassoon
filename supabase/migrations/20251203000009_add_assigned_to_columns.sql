-- ============================================================================
-- Add assigned_to columns to leads and deals tables
-- Supports workflow assignment automation
-- ============================================================================

-- Add assigned_to to leads
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL;

-- Add index for assigned_to lookups
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);

-- Add assigned_to to deals if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'deals' AND column_name = 'assigned_to'
  ) THEN
    ALTER TABLE deals ADD COLUMN assigned_to UUID REFERENCES user_profiles(id) ON DELETE SET NULL;
    CREATE INDEX idx_deals_assigned_to ON deals(assigned_to);
  END IF;
END $$;

