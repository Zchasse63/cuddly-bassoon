-- Phase 11: Analytics & Reporting - Database Schema Extension
-- Creates 6 new tables for heat maps and recommendations

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- Table 1: heat_map_cache
-- Pre-computed heat map data with TTL-based expiration
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.heat_map_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    layer_type TEXT NOT NULL,
    geographic_bounds JSONB NOT NULL, -- {north, south, east, west}
    zoom_level INTEGER DEFAULT 10,
    data JSONB NOT NULL, -- Heat map data points
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_heat_map_cache_layer ON public.heat_map_cache(layer_type);
CREATE INDEX IF NOT EXISTS idx_heat_map_cache_expires ON public.heat_map_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_heat_map_cache_bounds ON public.heat_map_cache USING GIN (geographic_bounds);

-- ============================================================================
-- Table 2: user_heat_map_data
-- User-specific heat map overlays with RLS
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_heat_map_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    layer_type TEXT NOT NULL, -- my_closed_deals, my_active_deals, my_buyer_network, my_success_patterns, my_target_areas
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, layer_type)
);

CREATE INDEX IF NOT EXISTS idx_user_heat_map_user ON public.user_heat_map_data(user_id);
CREATE INDEX IF NOT EXISTS idx_user_heat_map_layer ON public.user_heat_map_data(layer_type);

-- ============================================================================
-- Table 3: user_success_profiles
-- Learned success patterns from closed deals
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_success_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    profile_data JSONB NOT NULL DEFAULT '{}', -- Aggregated success patterns
    pattern_weights JSONB NOT NULL DEFAULT '{
        "zip_code": 0.30,
        "price_range": 0.20,
        "filter_match": 0.20,
        "property_type": 0.15,
        "buyer_network": 0.10,
        "bedroom_count": 0.05
    }',
    closed_deals_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_success_profiles_user ON public.user_success_profiles(user_id);

-- ============================================================================
-- Table 4: recommendation_interactions
-- Tracks user responses to recommendations for feedback loop
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.recommendation_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL,
    recommendation_score DECIMAL(5,4) NOT NULL, -- 0.0000 to 1.0000
    action TEXT NOT NULL CHECK (action IN ('viewed', 'saved', 'contacted', 'made_offer', 'closed', 'dismissed')),
    action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rec_interactions_user ON public.recommendation_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_interactions_property ON public.recommendation_interactions(property_id);
CREATE INDEX IF NOT EXISTS idx_rec_interactions_action ON public.recommendation_interactions(action);
CREATE INDEX IF NOT EXISTS idx_rec_interactions_date ON public.recommendation_interactions(action_at);

-- ============================================================================
-- Table 5: pending_recommendations
-- Queue of recommendations to show user
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.pending_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    property_id UUID NOT NULL,
    score DECIMAL(5,4) NOT NULL,
    reason TEXT NOT NULL,
    match_factors JSONB DEFAULT '{}', -- Which factors contributed to the match
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shown', 'acted', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    shown_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_pending_rec_user ON public.pending_recommendations(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_rec_status ON public.pending_recommendations(status);
CREATE INDEX IF NOT EXISTS idx_pending_rec_expires ON public.pending_recommendations(expires_at);
CREATE INDEX IF NOT EXISTS idx_pending_rec_score ON public.pending_recommendations(score DESC);

-- ============================================================================
-- Table 6: user_tasks
-- AI-generated task suggestions
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL, -- follow_up, outreach, analysis, review, etc.
    title TEXT NOT NULL,
    description TEXT,
    entity_type TEXT, -- property, deal, buyer, lead
    entity_id UUID,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE,
    source TEXT DEFAULT 'ai', -- ai, manual, system
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_tasks_user ON public.user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_type ON public.user_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_user_tasks_due ON public.user_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_user_tasks_priority ON public.user_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_user_tasks_status ON public.user_tasks(completed_at, dismissed_at);

