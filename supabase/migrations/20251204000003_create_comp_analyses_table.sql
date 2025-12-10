-- Migration: Create Comp Analyses Table
-- Purpose: Store comp selection analyses for audit trail, caching, and historical tracking

-- ============================================================================
-- 1. CREATE COMP ANALYSES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS comp_analyses (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Reference to subject property (optional - analysis can be run without stored property)
  subject_property_id UUID REFERENCES properties(id) ON DELETE SET NULL,

  -- User who ran the analysis
  user_id UUID REFERENCES user_profiles(id) ON DELETE SET NULL,

  -- Analysis timestamp
  analysis_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Subject property Census geography (cached at time of analysis)
  subject_block_group_geoid VARCHAR(12),
  subject_tract_geoid VARCHAR(11),
  subject_subdivision VARCHAR(255),

  -- Subject property coordinates (for analyses without stored property)
  subject_latitude DECIMAL(10, 8),
  subject_longitude DECIMAL(11, 8),
  subject_address VARCHAR(500),

  -- Scoring configuration used for this analysis
  scoring_config JSONB NOT NULL DEFAULT '{
    "weights": {
      "sameBlockGroup": 0.30,
      "sameTract": 0.15,
      "sameSubdivision": 0.25,
      "rentCastCorrelation": 0.20,
      "distance": 0.10
    },
    "thresholds": {
      "maxDistanceMiles": 3,
      "minCorrelation": 0.6,
      "maxCompCount": 10
    }
  }'::JSONB,

  -- Scored comparables (full details for each comp)
  -- Structure: Array of ScoredComparable objects
  comps JSONB NOT NULL DEFAULT '[]'::JSONB,

  -- Analysis summary statistics
  summary JSONB NOT NULL DEFAULT '{
    "totalCompsAnalyzed": 0,
    "excellentCount": 0,
    "goodCount": 0,
    "acceptableCount": 0,
    "marginalCount": 0,
    "averageScore": 0,
    "averageDistance": 0
  }'::JSONB,

  -- ARV estimate from this analysis
  estimated_arv DECIMAL(15, 2),
  arv_confidence DECIMAL(3, 2),

  -- Boundary polygon GeoJSON (optional, for visualization caching)
  block_group_polygon JSONB,
  tract_polygon JSONB,

  -- Metadata
  data_source VARCHAR(50) DEFAULT 'rentcast',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. CREATE INDEXES
-- ============================================================================

-- Index for property lookups (find analyses for a property)
CREATE INDEX IF NOT EXISTS idx_comp_analyses_subject_property
ON comp_analyses(subject_property_id, analysis_date DESC)
WHERE subject_property_id IS NOT NULL;

-- Index for user lookups (find analyses by user)
CREATE INDEX IF NOT EXISTS idx_comp_analyses_user
ON comp_analyses(user_id, analysis_date DESC)
WHERE user_id IS NOT NULL;

-- Index for Census geography lookups (find analyses for same block group)
CREATE INDEX IF NOT EXISTS idx_comp_analyses_block_group
ON comp_analyses(subject_block_group_geoid)
WHERE subject_block_group_geoid IS NOT NULL;

-- Index for tract lookups
CREATE INDEX IF NOT EXISTS idx_comp_analyses_tract
ON comp_analyses(subject_tract_geoid)
WHERE subject_tract_geoid IS NOT NULL;

-- Index for recent analyses
CREATE INDEX IF NOT EXISTS idx_comp_analyses_date
ON comp_analyses(analysis_date DESC);

-- GIN index for searching within comps JSONB
CREATE INDEX IF NOT EXISTS idx_comp_analyses_comps_gin
ON comp_analyses USING gin(comps);

-- ============================================================================
-- 3. CREATE RLS POLICIES
-- ============================================================================

-- Enable RLS
ALTER TABLE comp_analyses ENABLE ROW LEVEL SECURITY;

-- Users can view their own analyses
DROP POLICY IF EXISTS comp_analyses_select_own ON comp_analyses;
CREATE POLICY comp_analyses_select_own
ON comp_analyses FOR SELECT
USING (
  auth.uid() = user_id
  OR user_id IS NULL  -- Allow viewing analyses without user (system-generated)
);

-- Users can insert their own analyses
DROP POLICY IF EXISTS comp_analyses_insert_own ON comp_analyses;
CREATE POLICY comp_analyses_insert_own
ON comp_analyses FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  OR user_id IS NULL
);

-- Users can update their own analyses
DROP POLICY IF EXISTS comp_analyses_update_own ON comp_analyses;
CREATE POLICY comp_analyses_update_own
ON comp_analyses FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own analyses
DROP POLICY IF EXISTS comp_analyses_delete_own ON comp_analyses;
CREATE POLICY comp_analyses_delete_own
ON comp_analyses FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- 4. CREATE TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_comp_analyses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_comp_analyses_updated_at ON comp_analyses;
CREATE TRIGGER trigger_comp_analyses_updated_at
  BEFORE UPDATE ON comp_analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_comp_analyses_updated_at();

-- ============================================================================
-- 5. CREATE HELPER FUNCTIONS
-- ============================================================================

-- Function to get latest analysis for a property
CREATE OR REPLACE FUNCTION get_latest_comp_analysis(p_property_id UUID)
RETURNS comp_analyses AS $$
  SELECT *
  FROM comp_analyses
  WHERE subject_property_id = p_property_id
  ORDER BY analysis_date DESC
  LIMIT 1;
$$ LANGUAGE sql STABLE;

-- Function to get analyses in same block group
CREATE OR REPLACE FUNCTION get_comp_analyses_in_block_group(p_block_group_geoid VARCHAR(12))
RETURNS SETOF comp_analyses AS $$
  SELECT *
  FROM comp_analyses
  WHERE subject_block_group_geoid = p_block_group_geoid
  ORDER BY analysis_date DESC;
$$ LANGUAGE sql STABLE;

-- Function to count analyses by tier distribution
CREATE OR REPLACE FUNCTION get_comp_tier_stats(p_analysis_id UUID)
RETURNS TABLE(
  tier TEXT,
  count BIGINT,
  avg_score NUMERIC
) AS $$
  SELECT
    comp->>'tier' as tier,
    COUNT(*) as count,
    AVG((comp->>'score')::numeric) as avg_score
  FROM comp_analyses,
       jsonb_array_elements(comps) as comp
  WHERE id = p_analysis_id
  GROUP BY comp->>'tier'
  ORDER BY avg_score DESC;
$$ LANGUAGE sql STABLE;

-- ============================================================================
-- 6. ADD COMMENTS
-- ============================================================================

COMMENT ON TABLE comp_analyses IS
'Stores comparable property analyses including Census geography matching, scoring configuration, and ARV estimates. Used for audit trail and caching.';

COMMENT ON COLUMN comp_analyses.subject_block_group_geoid IS
'Census Block Group GEOID of subject property at time of analysis';

COMMENT ON COLUMN comp_analyses.scoring_config IS
'Scoring weights and thresholds used for this analysis. JSON structure with weights (sameBlockGroup, sameTract, etc.) and thresholds (maxDistanceMiles, minCorrelation, maxCompCount)';

COMMENT ON COLUMN comp_analyses.comps IS
'Array of scored comparables with full details including Census geography, tier classification, and match details';

COMMENT ON COLUMN comp_analyses.summary IS
'Analysis summary including tier counts, average score, and ARV confidence';
