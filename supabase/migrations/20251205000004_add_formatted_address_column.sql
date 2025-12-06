-- ============================================================================
-- Add formatted_address column to shovels_address_metrics
-- Migration: 20251205000004
--
-- Adds a computed formatted_address column to simplify address lookups
-- ============================================================================

-- Add formatted_address column
ALTER TABLE shovels_address_metrics
ADD COLUMN IF NOT EXISTS formatted_address TEXT;

-- Create index for formatted_address lookups
CREATE INDEX IF NOT EXISTS idx_shovels_address_metrics_formatted_address
ON shovels_address_metrics(formatted_address);

-- Comment
COMMENT ON COLUMN shovels_address_metrics.formatted_address IS 'Full formatted address combining street, city, state, zip';

-- ============================================================================
-- Backfill existing records with formatted addresses
-- ============================================================================
UPDATE shovels_address_metrics
SET formatted_address = CONCAT_WS(', ',
    NULLIF(street_address, ''),
    NULLIF(city, ''),
    CONCAT_WS(' ', NULLIF(state, ''), NULLIF(zip_code, ''))
)
WHERE formatted_address IS NULL
AND street_address IS NOT NULL;

-- ============================================================================
-- Create trigger to auto-populate formatted_address on insert/update
-- ============================================================================
CREATE OR REPLACE FUNCTION update_formatted_address()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if formatted_address is not explicitly set
    IF NEW.formatted_address IS NULL OR NEW.formatted_address = '' THEN
        NEW.formatted_address := CONCAT_WS(', ',
            NULLIF(NEW.street_address, ''),
            NULLIF(NEW.city, ''),
            CONCAT_WS(' ', NULLIF(NEW.state, ''), NULLIF(NEW.zip_code, ''))
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_formatted_address ON shovels_address_metrics;
CREATE TRIGGER trigger_update_formatted_address
    BEFORE INSERT OR UPDATE ON shovels_address_metrics
    FOR EACH ROW
    EXECUTE FUNCTION update_formatted_address();
