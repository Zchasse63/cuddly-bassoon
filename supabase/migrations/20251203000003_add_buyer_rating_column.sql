-- Add rating column to buyers table for buyer scoring
ALTER TABLE buyers ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Add index for rating-based queries
CREATE INDEX IF NOT EXISTS idx_buyers_rating ON buyers(rating) WHERE rating IS NOT NULL;

-- Add column comment
COMMENT ON COLUMN buyers.rating IS 'Buyer rating from 1-5 stars';
