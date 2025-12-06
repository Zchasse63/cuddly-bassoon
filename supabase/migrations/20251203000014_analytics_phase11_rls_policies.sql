-- Phase 11: Analytics & Reporting - RLS Policies
-- Row Level Security for analytics tables

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================
ALTER TABLE public.heat_map_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_heat_map_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_success_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pending_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- heat_map_cache policies (public read, system write)
-- ============================================================================
DROP POLICY IF EXISTS "heat_map_cache_select_policy" ON public.heat_map_cache;
CREATE POLICY "heat_map_cache_select_policy" ON public.heat_map_cache
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "heat_map_cache_insert_policy" ON public.heat_map_cache;
CREATE POLICY "heat_map_cache_insert_policy" ON public.heat_map_cache
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "heat_map_cache_update_policy" ON public.heat_map_cache;
CREATE POLICY "heat_map_cache_update_policy" ON public.heat_map_cache
    FOR UPDATE USING (true);

DROP POLICY IF EXISTS "heat_map_cache_delete_policy" ON public.heat_map_cache;
CREATE POLICY "heat_map_cache_delete_policy" ON public.heat_map_cache
    FOR DELETE USING (true);

-- ============================================================================
-- user_heat_map_data policies (user owns their data)
-- ============================================================================
DROP POLICY IF EXISTS "user_heat_map_data_select_policy" ON public.user_heat_map_data;
CREATE POLICY "user_heat_map_data_select_policy" ON public.user_heat_map_data
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_heat_map_data_insert_policy" ON public.user_heat_map_data;
CREATE POLICY "user_heat_map_data_insert_policy" ON public.user_heat_map_data
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_heat_map_data_update_policy" ON public.user_heat_map_data;
CREATE POLICY "user_heat_map_data_update_policy" ON public.user_heat_map_data
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_heat_map_data_delete_policy" ON public.user_heat_map_data;
CREATE POLICY "user_heat_map_data_delete_policy" ON public.user_heat_map_data
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- user_success_profiles policies (user owns their profile)
-- ============================================================================
DROP POLICY IF EXISTS "user_success_profiles_select_policy" ON public.user_success_profiles;
CREATE POLICY "user_success_profiles_select_policy" ON public.user_success_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_success_profiles_insert_policy" ON public.user_success_profiles;
CREATE POLICY "user_success_profiles_insert_policy" ON public.user_success_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_success_profiles_update_policy" ON public.user_success_profiles;
CREATE POLICY "user_success_profiles_update_policy" ON public.user_success_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_success_profiles_delete_policy" ON public.user_success_profiles;
CREATE POLICY "user_success_profiles_delete_policy" ON public.user_success_profiles
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- recommendation_interactions policies (user owns their interactions)
-- ============================================================================
DROP POLICY IF EXISTS "recommendation_interactions_select_policy" ON public.recommendation_interactions;
CREATE POLICY "recommendation_interactions_select_policy" ON public.recommendation_interactions
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "recommendation_interactions_insert_policy" ON public.recommendation_interactions;
CREATE POLICY "recommendation_interactions_insert_policy" ON public.recommendation_interactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "recommendation_interactions_update_policy" ON public.recommendation_interactions;
CREATE POLICY "recommendation_interactions_update_policy" ON public.recommendation_interactions
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "recommendation_interactions_delete_policy" ON public.recommendation_interactions;
CREATE POLICY "recommendation_interactions_delete_policy" ON public.recommendation_interactions
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- pending_recommendations policies (user owns their recommendations)
-- ============================================================================
DROP POLICY IF EXISTS "pending_recommendations_select_policy" ON public.pending_recommendations;
CREATE POLICY "pending_recommendations_select_policy" ON public.pending_recommendations
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "pending_recommendations_insert_policy" ON public.pending_recommendations;
CREATE POLICY "pending_recommendations_insert_policy" ON public.pending_recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "pending_recommendations_update_policy" ON public.pending_recommendations;
CREATE POLICY "pending_recommendations_update_policy" ON public.pending_recommendations
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "pending_recommendations_delete_policy" ON public.pending_recommendations;
CREATE POLICY "pending_recommendations_delete_policy" ON public.pending_recommendations
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- user_tasks policies (user owns their tasks)
-- ============================================================================
DROP POLICY IF EXISTS "user_tasks_select_policy" ON public.user_tasks;
CREATE POLICY "user_tasks_select_policy" ON public.user_tasks
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_tasks_insert_policy" ON public.user_tasks;
CREATE POLICY "user_tasks_insert_policy" ON public.user_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_tasks_update_policy" ON public.user_tasks;
CREATE POLICY "user_tasks_update_policy" ON public.user_tasks
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_tasks_delete_policy" ON public.user_tasks;
CREATE POLICY "user_tasks_delete_policy" ON public.user_tasks
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- Trigger functions for updated_at columns
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
DROP TRIGGER IF EXISTS update_heat_map_cache_updated_at ON public.heat_map_cache;
CREATE TRIGGER update_heat_map_cache_updated_at
    BEFORE UPDATE ON public.heat_map_cache
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_heat_map_data_updated_at ON public.user_heat_map_data;
CREATE TRIGGER update_user_heat_map_data_updated_at
    BEFORE UPDATE ON public.user_heat_map_data
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_tasks_updated_at ON public.user_tasks;
CREATE TRIGGER update_user_tasks_updated_at
    BEFORE UPDATE ON public.user_tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- Helper function to clean expired cache entries
-- ============================================================================
CREATE OR REPLACE FUNCTION public.clean_expired_heat_map_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.heat_map_cache
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Helper function to clean expired recommendations
-- ============================================================================
CREATE OR REPLACE FUNCTION public.clean_expired_recommendations()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE public.pending_recommendations
    SET status = 'expired'
    WHERE expires_at < NOW() AND status = 'pending';
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

