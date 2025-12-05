-- Historical Deals RAG Infrastructure
-- Enables retrieval-augmented generation for deal predictions based on historical outcomes

-- ============================================================================
-- 1. HISTORICAL DEALS TABLE
-- Stores completed deals with their outcomes for RAG retrieval
-- ============================================================================

CREATE TABLE historical_deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Deal identifiers
    external_id VARCHAR(255) UNIQUE, -- For imported data from external sources

    -- Property details
    address TEXT NOT NULL,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    county VARCHAR(100),
    property_type VARCHAR(50) CHECK (property_type IN ('single_family', 'multi_family', 'condo', 'townhouse', 'mobile', 'land', 'other')),
    bedrooms INTEGER,
    bathrooms DECIMAL(3,1),
    square_footage INTEGER,
    year_built INTEGER,
    lot_size DECIMAL(12,2),

    -- Deal financials
    purchase_price DECIMAL(12,2) NOT NULL,
    arv DECIMAL(12,2), -- After Repair Value
    repair_cost DECIMAL(12,2),
    sale_price DECIMAL(12,2),
    assignment_fee DECIMAL(12,2),
    holding_cost DECIMAL(12,2),
    closing_cost DECIMAL(12,2),
    profit DECIMAL(12,2),
    roi DECIMAL(5,2), -- Return on investment percentage

    -- Deal characteristics
    deal_type VARCHAR(50) CHECK (deal_type IN ('wholesale', 'fix_flip', 'brrrr', 'subject_to', 'owner_finance', 'other')),
    acquisition_source VARCHAR(100), -- e.g., 'direct_mail', 'driving_for_dollars', 'referral', 'mls'
    exit_strategy VARCHAR(100),

    -- Seller information (anonymized)
    seller_type VARCHAR(50) CHECK (seller_type IN ('individual', 'bank_reo', 'trust', 'estate', 'corporate', 'government', 'other')),
    seller_motivation_score INTEGER CHECK (seller_motivation_score BETWEEN 0 AND 100),
    was_absentee_owner BOOLEAN,
    ownership_duration_months INTEGER,

    -- Timeline
    contract_date DATE,
    close_date DATE,
    days_to_close INTEGER,

    -- Market conditions at time of deal
    market_dom_at_deal INTEGER, -- Days on market in that market
    market_sale_to_list_ratio DECIMAL(5,4),
    market_inventory_at_deal INTEGER,

    -- Outcome and learnings
    outcome VARCHAR(50) CHECK (outcome IN ('success', 'failed_financing', 'failed_inspection', 'seller_backed_out', 'buyer_backed_out', 'title_issues', 'other_failure')),
    outcome_notes TEXT,
    lessons_learned TEXT,

    -- Metadata
    data_source VARCHAR(100), -- e.g., 'manual', 'imported', 'platform'
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. HISTORICAL DEAL EMBEDDINGS TABLE
-- Stores vector embeddings for semantic search
-- ============================================================================

CREATE TABLE historical_deal_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES historical_deals(id) ON DELETE CASCADE,
    embedding vector(1536) NOT NULL, -- OpenAI text-embedding-3-small dimensions
    content_hash VARCHAR(64), -- SHA256 hash to detect changes
    model_version VARCHAR(100) DEFAULT 'text-embedding-3-small',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(deal_id)
);

-- ============================================================================
-- 3. DEAL OUTCOME PATTERNS TABLE
-- Stores aggregated patterns from historical data for quick lookups
-- ============================================================================

CREATE TABLE deal_outcome_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Pattern key (combination of factors)
    pattern_key VARCHAR(255) UNIQUE NOT NULL, -- e.g., 'phoenix_az_wholesale_bank_reo_hot_market'

    -- Pattern criteria
    city VARCHAR(100),
    state VARCHAR(50),
    deal_type VARCHAR(50),
    seller_type VARCHAR(50),
    market_condition VARCHAR(50) CHECK (market_condition IN ('hot', 'warm', 'neutral', 'cooling', 'cold')),

    -- Aggregated outcomes
    total_deals INTEGER DEFAULT 0,
    successful_deals INTEGER DEFAULT 0,
    success_rate DECIMAL(5,4),
    avg_profit DECIMAL(12,2),
    avg_roi DECIMAL(5,2),
    avg_days_to_close INTEGER,
    avg_discount_from_arv DECIMAL(5,4), -- How much below ARV deals typically closed at

    -- Risk indicators
    failure_rate DECIMAL(5,4),
    most_common_failure_reason VARCHAR(100),

    -- Metadata
    sample_size INTEGER,
    last_calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Historical deals indexes
CREATE INDEX idx_historical_deals_location ON historical_deals(city, state, zip_code);
CREATE INDEX idx_historical_deals_type ON historical_deals(deal_type);
CREATE INDEX idx_historical_deals_outcome ON historical_deals(outcome);
CREATE INDEX idx_historical_deals_seller_type ON historical_deals(seller_type);
CREATE INDEX idx_historical_deals_close_date ON historical_deals(close_date);
CREATE INDEX idx_historical_deals_profit ON historical_deals(profit);

-- Embedding vector index (HNSW for fast approximate nearest neighbor)
CREATE INDEX idx_historical_deal_embeddings_vector ON historical_deal_embeddings
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

-- Pattern lookups
CREATE INDEX idx_deal_outcome_patterns_lookup ON deal_outcome_patterns(city, state, deal_type, seller_type);

-- ============================================================================
-- 5. RPC FUNCTION FOR SEMANTIC SEARCH
-- ============================================================================

CREATE OR REPLACE FUNCTION match_historical_deals(
    query_embedding vector(1536),
    similarity_threshold float DEFAULT 0.5,
    match_count int DEFAULT 5,
    filter_deal_type text DEFAULT NULL,
    filter_outcome text DEFAULT NULL,
    filter_state text DEFAULT NULL
)
RETURNS TABLE (
    deal_id UUID,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    deal_type VARCHAR(50),
    purchase_price DECIMAL(12,2),
    arv DECIMAL(12,2),
    profit DECIMAL(12,2),
    roi DECIMAL(5,2),
    outcome VARCHAR(50),
    days_to_close INTEGER,
    seller_type VARCHAR(50),
    lessons_learned TEXT,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        hd.id as deal_id,
        hd.address,
        hd.city,
        hd.state,
        hd.deal_type,
        hd.purchase_price,
        hd.arv,
        hd.profit,
        hd.roi,
        hd.outcome,
        hd.days_to_close,
        hd.seller_type,
        hd.lessons_learned,
        1 - (hde.embedding <=> query_embedding) as similarity
    FROM historical_deal_embeddings hde
    JOIN historical_deals hd ON hd.id = hde.deal_id
    WHERE
        (1 - (hde.embedding <=> query_embedding)) > similarity_threshold
        AND (filter_deal_type IS NULL OR hd.deal_type = filter_deal_type)
        AND (filter_outcome IS NULL OR hd.outcome = filter_outcome)
        AND (filter_state IS NULL OR hd.state = filter_state)
    ORDER BY hde.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ============================================================================
-- 6. FUNCTION TO GET SIMILAR DEALS BY PROPERTY CHARACTERISTICS
-- ============================================================================

CREATE OR REPLACE FUNCTION find_similar_deals(
    p_city VARCHAR(100) DEFAULT NULL,
    p_state VARCHAR(50) DEFAULT NULL,
    p_deal_type VARCHAR(50) DEFAULT NULL,
    p_seller_type VARCHAR(50) DEFAULT NULL,
    p_price_min DECIMAL(12,2) DEFAULT NULL,
    p_price_max DECIMAL(12,2) DEFAULT NULL,
    p_limit INT DEFAULT 10
)
RETURNS TABLE (
    deal_id UUID,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(50),
    deal_type VARCHAR(50),
    seller_type VARCHAR(50),
    purchase_price DECIMAL(12,2),
    arv DECIMAL(12,2),
    profit DECIMAL(12,2),
    roi DECIMAL(5,2),
    outcome VARCHAR(50),
    days_to_close INTEGER,
    lessons_learned TEXT,
    relevance_score DECIMAL(5,4)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        hd.id,
        hd.address,
        hd.city,
        hd.state,
        hd.deal_type,
        hd.seller_type,
        hd.purchase_price,
        hd.arv,
        hd.profit,
        hd.roi,
        hd.outcome,
        hd.days_to_close,
        hd.lessons_learned,
        -- Calculate relevance score based on matching criteria
        (
            CASE WHEN hd.city = p_city THEN 0.3 ELSE 0 END +
            CASE WHEN hd.state = p_state THEN 0.2 ELSE 0 END +
            CASE WHEN hd.deal_type = p_deal_type THEN 0.25 ELSE 0 END +
            CASE WHEN hd.seller_type = p_seller_type THEN 0.25 ELSE 0 END
        )::DECIMAL(5,4) as relevance_score
    FROM historical_deals hd
    WHERE
        (p_city IS NULL OR hd.city = p_city OR hd.state = p_state)
        AND (p_state IS NULL OR hd.state = p_state)
        AND (p_deal_type IS NULL OR hd.deal_type = p_deal_type)
        AND (p_seller_type IS NULL OR hd.seller_type = p_seller_type)
        AND (p_price_min IS NULL OR hd.purchase_price >= p_price_min)
        AND (p_price_max IS NULL OR hd.purchase_price <= p_price_max)
        AND hd.outcome IS NOT NULL -- Only completed deals
    ORDER BY
        (
            CASE WHEN hd.city = p_city THEN 0.3 ELSE 0 END +
            CASE WHEN hd.state = p_state THEN 0.2 ELSE 0 END +
            CASE WHEN hd.deal_type = p_deal_type THEN 0.25 ELSE 0 END +
            CASE WHEN hd.seller_type = p_seller_type THEN 0.25 ELSE 0 END
        ) DESC,
        hd.close_date DESC
    LIMIT p_limit;
END;
$$;

-- ============================================================================
-- 7. FUNCTION TO CALCULATE OUTCOME PATTERNS
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_deal_outcome_patterns()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Clear existing patterns
    TRUNCATE deal_outcome_patterns;

    -- Insert aggregated patterns
    INSERT INTO deal_outcome_patterns (
        pattern_key,
        city,
        state,
        deal_type,
        seller_type,
        market_condition,
        total_deals,
        successful_deals,
        success_rate,
        avg_profit,
        avg_roi,
        avg_days_to_close,
        avg_discount_from_arv,
        failure_rate,
        most_common_failure_reason,
        sample_size
    )
    SELECT
        COALESCE(city, 'all') || '_' ||
        COALESCE(state, 'all') || '_' ||
        COALESCE(deal_type, 'all') || '_' ||
        COALESCE(seller_type, 'all') as pattern_key,
        city,
        state,
        deal_type,
        seller_type,
        NULL as market_condition, -- Can be enhanced later
        COUNT(*) as total_deals,
        COUNT(*) FILTER (WHERE outcome = 'success') as successful_deals,
        (COUNT(*) FILTER (WHERE outcome = 'success'))::DECIMAL / NULLIF(COUNT(*), 0) as success_rate,
        AVG(profit) FILTER (WHERE outcome = 'success') as avg_profit,
        AVG(roi) FILTER (WHERE outcome = 'success') as avg_roi,
        AVG(days_to_close) FILTER (WHERE outcome = 'success') as avg_days_to_close,
        AVG((arv - purchase_price) / NULLIF(arv, 0)) FILTER (WHERE outcome = 'success' AND arv > 0) as avg_discount_from_arv,
        (COUNT(*) FILTER (WHERE outcome != 'success'))::DECIMAL / NULLIF(COUNT(*), 0) as failure_rate,
        MODE() WITHIN GROUP (ORDER BY outcome) FILTER (WHERE outcome != 'success') as most_common_failure_reason,
        COUNT(*) as sample_size
    FROM historical_deals
    WHERE outcome IS NOT NULL
    GROUP BY GROUPING SETS (
        (city, state, deal_type, seller_type),
        (state, deal_type, seller_type),
        (deal_type, seller_type),
        (seller_type),
        (deal_type),
        ()
    )
    HAVING COUNT(*) >= 3; -- Only patterns with at least 3 deals
END;
$$;

-- ============================================================================
-- 8. TRIGGER FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_historical_deals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_historical_deals_updated_at
    BEFORE UPDATE ON historical_deals
    FOR EACH ROW
    EXECUTE FUNCTION update_historical_deals_updated_at();

CREATE TRIGGER trigger_historical_deal_embeddings_updated_at
    BEFORE UPDATE ON historical_deal_embeddings
    FOR EACH ROW
    EXECUTE FUNCTION update_historical_deals_updated_at();

-- ============================================================================
-- 9. RLS POLICIES
-- ============================================================================

ALTER TABLE historical_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_deal_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_outcome_patterns ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read historical deals (anonymized data)
CREATE POLICY "Allow authenticated read on historical_deals"
    ON historical_deals FOR SELECT
    TO authenticated
    USING (true);

-- Allow users to insert their own deals
CREATE POLICY "Allow authenticated insert on historical_deals"
    ON historical_deals FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = created_by);

-- Allow users to update their own deals
CREATE POLICY "Allow authenticated update own historical_deals"
    ON historical_deals FOR UPDATE
    TO authenticated
    USING (auth.uid() = created_by);

-- Allow service role full access
CREATE POLICY "Allow service role full access on historical_deals"
    ON historical_deals FOR ALL
    TO service_role
    USING (true);

-- Embedding policies (follow deal access)
CREATE POLICY "Allow authenticated read on historical_deal_embeddings"
    ON historical_deal_embeddings FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow service role full access on historical_deal_embeddings"
    ON historical_deal_embeddings FOR ALL
    TO service_role
    USING (true);

-- Pattern policies (read-only for users)
CREATE POLICY "Allow authenticated read on deal_outcome_patterns"
    ON deal_outcome_patterns FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Allow service role full access on deal_outcome_patterns"
    ON deal_outcome_patterns FOR ALL
    TO service_role
    USING (true);
