-- Migration: Add Search Analytics Tables for Phase 7
-- Description: Creates tables for search history, scheduled searches, and search performance tracking

-- ============================================================================
-- 1. Search History Table
-- Tracks all search queries executed by users for analytics and recent searches feature
-- ============================================================================
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    query_type VARCHAR(50) NOT NULL DEFAULT 'property', -- property, buyer, deal
    criteria JSONB NOT NULL DEFAULT '{}'::JSONB,
    natural_language_query TEXT, -- Original NL query if applicable
    results_count INTEGER DEFAULT 0,
    execution_time_ms INTEGER, -- Query execution time in milliseconds
    properties_viewed INTEGER DEFAULT 0, -- How many results user actually viewed
    led_to_action BOOLEAN DEFAULT FALSE, -- Whether search led to offer/contact
    action_type VARCHAR(50), -- offer_made, buyer_contacted, saved_filter
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient user history queries
CREATE INDEX IF NOT EXISTS idx_search_history_user_created 
    ON search_history(user_id, created_at DESC);

-- Index for analytics on search patterns
CREATE INDEX IF NOT EXISTS idx_search_history_query_type 
    ON search_history(query_type, created_at DESC);

-- ============================================================================
-- 2. Scheduled Searches Table
-- Stores recurring search jobs with notification preferences
-- ============================================================================
CREATE TABLE IF NOT EXISTS scheduled_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    criteria JSONB NOT NULL DEFAULT '{}'::JSONB,
    frequency VARCHAR(20) NOT NULL DEFAULT 'daily', -- daily, weekly, monthly
    notify_via VARCHAR(20) NOT NULL DEFAULT 'email', -- email, sms, both, none
    is_active BOOLEAN DEFAULT TRUE,
    last_run_at TIMESTAMPTZ,
    next_run_at TIMESTAMPTZ,
    last_results_count INTEGER DEFAULT 0,
    new_results_count INTEGER DEFAULT 0, -- New since last run
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for finding due scheduled searches
CREATE INDEX IF NOT EXISTS idx_scheduled_searches_next_run 
    ON scheduled_searches(next_run_at) WHERE is_active = TRUE;

-- Index for user's scheduled searches
CREATE INDEX IF NOT EXISTS idx_scheduled_searches_user 
    ON scheduled_searches(user_id, is_active);

-- ============================================================================
-- 3. Search Performance Metrics Table
-- Aggregated metrics for search-to-deal conversion analysis
-- ============================================================================
CREATE TABLE IF NOT EXISTS search_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    period_type VARCHAR(20) NOT NULL DEFAULT 'weekly', -- daily, weekly, monthly
    total_searches INTEGER DEFAULT 0,
    unique_criteria_count INTEGER DEFAULT 0,
    avg_results_per_search DECIMAL(10,2) DEFAULT 0,
    searches_with_actions INTEGER DEFAULT 0,
    offers_from_searches INTEGER DEFAULT 0,
    deals_from_searches INTEGER DEFAULT 0,
    conversion_rate DECIMAL(5,2) DEFAULT 0,
    top_criteria JSONB DEFAULT '[]'::JSONB, -- Most successful search criteria
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, period_start, period_type)
);

-- Index for performance lookups
CREATE INDEX IF NOT EXISTS idx_search_performance_user_period 
    ON search_performance(user_id, period_start DESC);

-- ============================================================================
-- 4. RLS Policies for new tables
-- ============================================================================

-- Enable RLS
ALTER TABLE search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_performance ENABLE ROW LEVEL SECURITY;

-- Search History policies
CREATE POLICY "Users can view own search history" ON search_history
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search history" ON search_history
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Scheduled Searches policies
CREATE POLICY "Users can view own scheduled searches" ON scheduled_searches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own scheduled searches" ON scheduled_searches
    FOR ALL USING (auth.uid() = user_id);

-- Search Performance policies
CREATE POLICY "Users can view own search performance" ON search_performance
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- 5. Helper Functions
-- ============================================================================

-- Function to log a search and return the search ID
CREATE OR REPLACE FUNCTION log_search(
    p_user_id UUID,
    p_query_type VARCHAR DEFAULT 'property',
    p_criteria JSONB DEFAULT '{}'::JSONB,
    p_natural_language_query TEXT DEFAULT NULL,
    p_results_count INTEGER DEFAULT 0,
    p_execution_time_ms INTEGER DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_search_id UUID;
BEGIN
    INSERT INTO search_history (
        user_id, query_type, criteria, natural_language_query, 
        results_count, execution_time_ms
    ) VALUES (
        p_user_id, p_query_type, p_criteria, p_natural_language_query,
        p_results_count, p_execution_time_ms
    ) RETURNING id INTO v_search_id;
    
    RETURN v_search_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's search statistics
CREATE OR REPLACE FUNCTION get_search_statistics(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
) RETURNS TABLE (
    total_searches BIGINT,
    unique_criteria BIGINT,
    avg_results DECIMAL,
    conversion_rate DECIMAL,
    most_used_criteria JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_searches,
        COUNT(DISTINCT criteria::TEXT)::BIGINT as unique_criteria,
        ROUND(AVG(results_count)::DECIMAL, 2) as avg_results,
        ROUND(
            (COUNT(*) FILTER (WHERE led_to_action = TRUE)::DECIMAL / 
             NULLIF(COUNT(*), 0) * 100), 2
        ) as conversion_rate,
        (
            SELECT jsonb_agg(criteria ORDER BY cnt DESC)
            FROM (
                SELECT criteria, COUNT(*) as cnt
                FROM search_history sh2
                WHERE sh2.user_id = p_user_id
                AND sh2.created_at >= NOW() - (p_days || ' days')::INTERVAL
                GROUP BY criteria
                LIMIT 5
            ) top_criteria
        ) as most_used_criteria
    FROM search_history sh
    WHERE sh.user_id = p_user_id
    AND sh.created_at >= NOW() - (p_days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

