-- ============================================================================
-- Seller Motivation Scoring System Tables
-- Migration: 20251205000002
--
-- Creates tables for the stratified seller motivation scoring system:
-- - owner_classifications: Cached owner type classifications
-- - motivation_scores: Historical score records for analytics
-- - property_signals: Cached property signals from various sources
-- - scoring_experiments: A/B testing configuration
-- - experiment_assignments: Property-level experiment assignments
-- - experiment_outcomes: Outcome tracking for experiments
-- ============================================================================

-- ============================================================================
-- Owner Classifications Table
-- Caches owner classification results for faster subsequent lookups
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.owner_classifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Property reference (can be address-based or ID-based)
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    address TEXT,

    -- Classification result
    owner_name TEXT NOT NULL,
    primary_class TEXT NOT NULL CHECK (primary_class IN ('individual', 'investor_entity', 'institutional_distressed')),
    sub_class TEXT NOT NULL,
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    matched_patterns TEXT[] DEFAULT '{}',

    -- Metadata
    classified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),

    -- Constraints
    CONSTRAINT owner_class_property_or_address CHECK (property_id IS NOT NULL OR address IS NOT NULL)
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_owner_classifications_property_id ON public.owner_classifications(property_id);
CREATE INDEX IF NOT EXISTS idx_owner_classifications_address ON public.owner_classifications(address);
CREATE INDEX IF NOT EXISTS idx_owner_classifications_expires ON public.owner_classifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_owner_classifications_primary_class ON public.owner_classifications(primary_class);

-- ============================================================================
-- Motivation Scores Table
-- Stores calculated motivation scores for analytics and history
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.motivation_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Property reference
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    address TEXT,

    -- Score type
    score_type TEXT NOT NULL CHECK (score_type IN ('standard', 'dealflow_iq')),

    -- Score result
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
    model_used TEXT NOT NULL,

    -- Classification reference
    owner_classification_id UUID REFERENCES public.owner_classifications(id),

    -- Detailed factors (JSONB for flexibility)
    factors JSONB NOT NULL DEFAULT '[]',
    ai_adjustments JSONB DEFAULT NULL, -- Only for DealFlow IQ

    -- Recommendation
    recommendation TEXT,
    risk_factors TEXT[] DEFAULT '{}',

    -- Tracking
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT motivation_property_or_address CHECK (property_id IS NOT NULL OR address IS NOT NULL)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_motivation_scores_property_id ON public.motivation_scores(property_id);
CREATE INDEX IF NOT EXISTS idx_motivation_scores_address ON public.motivation_scores(address);
CREATE INDEX IF NOT EXISTS idx_motivation_scores_created_at ON public.motivation_scores(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_motivation_scores_score ON public.motivation_scores(score);
CREATE INDEX IF NOT EXISTS idx_motivation_scores_model ON public.motivation_scores(model_used);

-- ============================================================================
-- Property Signals Table
-- Caches raw property signals from various data sources
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.property_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Property reference
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    address TEXT,

    -- Source tracking
    signal_source TEXT NOT NULL CHECK (signal_source IN ('rentcast', 'shovels', 'census', 'supabase', 'combined')),

    -- Signal data (JSONB for flexibility across sources)
    signal_data JSONB NOT NULL DEFAULT '{}',

    -- Timestamps
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 hour'),

    -- Constraints
    CONSTRAINT signals_property_or_address CHECK (property_id IS NOT NULL OR address IS NOT NULL)
);

-- Unique constraint for upserts
CREATE UNIQUE INDEX IF NOT EXISTS idx_property_signals_unique
    ON public.property_signals(COALESCE(property_id::text, ''), COALESCE(address, ''), signal_source);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_property_signals_property_id ON public.property_signals(property_id);
CREATE INDEX IF NOT EXISTS idx_property_signals_address ON public.property_signals(address);
CREATE INDEX IF NOT EXISTS idx_property_signals_expires ON public.property_signals(expires_at);

-- ============================================================================
-- Scoring Experiments Table (A/B Testing)
-- Configuration for A/B testing different scoring approaches
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.scoring_experiments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Experiment identity
    experiment_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed')),

    -- Traffic allocation
    control_percentage INTEGER NOT NULL DEFAULT 50 CHECK (control_percentage >= 0 AND control_percentage <= 100),

    -- Model configurations (JSONB)
    control_config JSONB NOT NULL,
    treatment_config JSONB NOT NULL,

    -- Metrics
    primary_metric TEXT NOT NULL DEFAULT 'conversion_rate',
    secondary_metrics TEXT[] DEFAULT '{}',

    -- Timeline
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    min_sample_size INTEGER DEFAULT 100,

    -- Tracking
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_scoring_experiments_status ON public.scoring_experiments(status);
CREATE INDEX IF NOT EXISTS idx_scoring_experiments_dates ON public.scoring_experiments(start_date, end_date);

-- ============================================================================
-- Experiment Assignments Table
-- Tracks which variant a property was assigned to
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.experiment_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    experiment_id TEXT NOT NULL REFERENCES public.scoring_experiments(experiment_id) ON DELETE CASCADE,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    address TEXT,

    -- Assignment
    variant TEXT NOT NULL CHECK (variant IN ('control', 'treatment')),
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Score at assignment
    score_at_assignment INTEGER,

    -- Constraints
    CONSTRAINT assignment_property_or_address CHECK (property_id IS NOT NULL OR address IS NOT NULL)
);

-- Unique constraint (one assignment per property per experiment)
CREATE UNIQUE INDEX IF NOT EXISTS idx_experiment_assignments_unique
    ON public.experiment_assignments(experiment_id, COALESCE(property_id::text, ''), COALESCE(address, ''));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_experiment ON public.experiment_assignments(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_property ON public.experiment_assignments(property_id);
CREATE INDEX IF NOT EXISTS idx_experiment_assignments_variant ON public.experiment_assignments(variant);

-- ============================================================================
-- Experiment Outcomes Table
-- Tracks outcomes for experiment analysis
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.experiment_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- References
    assignment_id UUID NOT NULL REFERENCES public.experiment_assignments(id) ON DELETE CASCADE,
    experiment_id TEXT NOT NULL REFERENCES public.scoring_experiments(experiment_id) ON DELETE CASCADE,

    -- Outcome tracking
    contacted BOOLEAN DEFAULT FALSE,
    contacted_at TIMESTAMPTZ,
    responded BOOLEAN DEFAULT FALSE,
    responded_at TIMESTAMPTZ,
    deal_created BOOLEAN DEFAULT FALSE,
    deal_id UUID REFERENCES public.deals(id),
    deal_closed BOOLEAN DEFAULT FALSE,
    deal_profit DECIMAL(12,2),

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_experiment_outcomes_assignment ON public.experiment_outcomes(assignment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_outcomes_experiment ON public.experiment_outcomes(experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_outcomes_deal ON public.experiment_outcomes(deal_id);

-- ============================================================================
-- Distress Indicators Table
-- Stores property-level distress indicators for motivation scoring
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.distress_indicators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Property reference
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
    address TEXT NOT NULL,

    -- Distress flags
    pre_foreclosure BOOLEAN DEFAULT FALSE,
    tax_delinquent BOOLEAN DEFAULT FALSE,
    vacant BOOLEAN DEFAULT FALSE,
    code_liens INTEGER DEFAULT 0,

    -- Additional details
    pre_foreclosure_date TIMESTAMPTZ,
    tax_delinquent_amount DECIMAL(12,2),
    tax_delinquent_years INTEGER,
    vacancy_duration_months INTEGER,

    -- Source and freshness
    data_source TEXT,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),

    -- Metadata
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_distress_indicators_address ON public.distress_indicators(address);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_distress_indicators_property_id ON public.distress_indicators(property_id);
CREATE INDEX IF NOT EXISTS idx_distress_indicators_pre_foreclosure ON public.distress_indicators(pre_foreclosure) WHERE pre_foreclosure = TRUE;
CREATE INDEX IF NOT EXISTS idx_distress_indicators_tax_delinquent ON public.distress_indicators(tax_delinquent) WHERE tax_delinquent = TRUE;
CREATE INDEX IF NOT EXISTS idx_distress_indicators_vacant ON public.distress_indicators(vacant) WHERE vacant = TRUE;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE public.owner_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.motivation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scoring_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distress_indicators ENABLE ROW LEVEL SECURITY;

-- Owner Classifications - Read access for authenticated users
CREATE POLICY owner_classifications_select ON public.owner_classifications
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY owner_classifications_insert ON public.owner_classifications
    FOR INSERT TO authenticated WITH CHECK (TRUE);

-- Motivation Scores - Users can see all, but created_by tracks who made them
CREATE POLICY motivation_scores_select ON public.motivation_scores
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY motivation_scores_insert ON public.motivation_scores
    FOR INSERT TO authenticated WITH CHECK (TRUE);

-- Property Signals - Read access for authenticated users
CREATE POLICY property_signals_select ON public.property_signals
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY property_signals_insert ON public.property_signals
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY property_signals_update ON public.property_signals
    FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- Scoring Experiments - Separate policies for each operation
CREATE POLICY scoring_experiments_select ON public.scoring_experiments
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY scoring_experiments_insert ON public.scoring_experiments
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY scoring_experiments_update ON public.scoring_experiments
    FOR UPDATE TO authenticated USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

CREATE POLICY scoring_experiments_delete ON public.scoring_experiments
    FOR DELETE TO authenticated USING (auth.uid() = created_by);

-- Experiment Assignments - Separate policies for each operation
CREATE POLICY experiment_assignments_select ON public.experiment_assignments
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY experiment_assignments_insert ON public.experiment_assignments
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY experiment_assignments_update ON public.experiment_assignments
    FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY experiment_assignments_delete ON public.experiment_assignments
    FOR DELETE TO authenticated USING (FALSE);

-- Experiment Outcomes - Separate policies for each operation
CREATE POLICY experiment_outcomes_select ON public.experiment_outcomes
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY experiment_outcomes_insert ON public.experiment_outcomes
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY experiment_outcomes_update ON public.experiment_outcomes
    FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

CREATE POLICY experiment_outcomes_delete ON public.experiment_outcomes
    FOR DELETE TO authenticated USING (FALSE);

-- Distress Indicators - Read access for authenticated users
CREATE POLICY distress_indicators_select ON public.distress_indicators
    FOR SELECT TO authenticated USING (TRUE);

CREATE POLICY distress_indicators_insert ON public.distress_indicators
    FOR INSERT TO authenticated WITH CHECK (TRUE);

CREATE POLICY distress_indicators_update ON public.distress_indicators
    FOR UPDATE TO authenticated USING (TRUE) WITH CHECK (TRUE);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_motivation_caches()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER := 0;
    temp_count INTEGER;
BEGIN
    -- Clean owner classifications
    DELETE FROM public.owner_classifications WHERE expires_at < NOW();
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;

    -- Clean property signals
    DELETE FROM public.property_signals WHERE expires_at < NOW();
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;

    -- Clean distress indicators
    DELETE FROM public.distress_indicators WHERE expires_at < NOW();
    GET DIAGNOSTICS temp_count = ROW_COUNT;
    deleted_count := deleted_count + temp_count;

    RETURN deleted_count;
END;
$$;

-- Function to get experiment assignment for a property
CREATE OR REPLACE FUNCTION get_or_create_experiment_assignment(
    p_experiment_id TEXT,
    p_property_id UUID DEFAULT NULL,
    p_address TEXT DEFAULT NULL
)
RETURNS TABLE (
    variant TEXT,
    is_new BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_existing_variant TEXT;
    v_control_percentage INTEGER;
    v_new_variant TEXT;
BEGIN
    -- Check for existing assignment
    SELECT ea.variant INTO v_existing_variant
    FROM public.experiment_assignments ea
    WHERE ea.experiment_id = p_experiment_id
    AND (
        (p_property_id IS NOT NULL AND ea.property_id = p_property_id)
        OR (p_address IS NOT NULL AND ea.address = p_address)
    )
    LIMIT 1;

    IF v_existing_variant IS NOT NULL THEN
        RETURN QUERY SELECT v_existing_variant, FALSE;
        RETURN;
    END IF;

    -- Get experiment config
    SELECT se.control_percentage INTO v_control_percentage
    FROM public.scoring_experiments se
    WHERE se.experiment_id = p_experiment_id
    AND se.status = 'active';

    IF v_control_percentage IS NULL THEN
        -- Experiment not found or not active, return control
        RETURN QUERY SELECT 'control'::TEXT, FALSE;
        RETURN;
    END IF;

    -- Assign based on random selection
    v_new_variant := CASE WHEN random() * 100 < v_control_percentage THEN 'control' ELSE 'treatment' END;

    -- Create assignment
    INSERT INTO public.experiment_assignments (experiment_id, property_id, address, variant)
    VALUES (p_experiment_id, p_property_id, p_address, v_new_variant);

    RETURN QUERY SELECT v_new_variant, TRUE;
END;
$$;

-- Function to calculate experiment statistics
CREATE OR REPLACE FUNCTION calculate_experiment_stats(p_experiment_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'control', jsonb_build_object(
            'total', COUNT(*) FILTER (WHERE ea.variant = 'control'),
            'contacted', COUNT(*) FILTER (WHERE ea.variant = 'control' AND eo.contacted = TRUE),
            'responded', COUNT(*) FILTER (WHERE ea.variant = 'control' AND eo.responded = TRUE),
            'deals_created', COUNT(*) FILTER (WHERE ea.variant = 'control' AND eo.deal_created = TRUE),
            'deals_closed', COUNT(*) FILTER (WHERE ea.variant = 'control' AND eo.deal_closed = TRUE),
            'total_profit', COALESCE(SUM(eo.deal_profit) FILTER (WHERE ea.variant = 'control'), 0)
        ),
        'treatment', jsonb_build_object(
            'total', COUNT(*) FILTER (WHERE ea.variant = 'treatment'),
            'contacted', COUNT(*) FILTER (WHERE ea.variant = 'treatment' AND eo.contacted = TRUE),
            'responded', COUNT(*) FILTER (WHERE ea.variant = 'treatment' AND eo.responded = TRUE),
            'deals_created', COUNT(*) FILTER (WHERE ea.variant = 'treatment' AND eo.deal_created = TRUE),
            'deals_closed', COUNT(*) FILTER (WHERE ea.variant = 'treatment' AND eo.deal_closed = TRUE),
            'total_profit', COALESCE(SUM(eo.deal_profit) FILTER (WHERE ea.variant = 'treatment'), 0)
        )
    ) INTO v_stats
    FROM public.experiment_assignments ea
    LEFT JOIN public.experiment_outcomes eo ON eo.assignment_id = ea.id
    WHERE ea.experiment_id = p_experiment_id;

    RETURN v_stats;
END;
$$;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE public.owner_classifications IS 'Cached owner type classifications with pattern matching results';
COMMENT ON TABLE public.motivation_scores IS 'Historical motivation scores for analytics and tracking';
COMMENT ON TABLE public.property_signals IS 'Cached property signals from RentCast, Shovels, and other sources';
COMMENT ON TABLE public.scoring_experiments IS 'A/B testing configuration for scoring model comparison';
COMMENT ON TABLE public.experiment_assignments IS 'Property-level experiment variant assignments';
COMMENT ON TABLE public.experiment_outcomes IS 'Outcome tracking for experiment analysis';
COMMENT ON TABLE public.distress_indicators IS 'Property distress signals (pre-foreclosure, tax delinquent, etc.)';
