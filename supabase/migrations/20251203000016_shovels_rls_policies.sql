-- =============================================
-- Multi-Vertical Lead Generation: RLS Policies
-- =============================================

-- Enable RLS on all Shovels tables
ALTER TABLE shovels_permits ENABLE ROW LEVEL SECURITY;
ALTER TABLE shovels_address_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE geo_vitality_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE shovels_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_verticals ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Shovels Permits Policies
-- Read-only for authenticated users (shared data)
-- =============================================
DROP POLICY IF EXISTS "shovels_permits_select_authenticated" ON shovels_permits;
CREATE POLICY "shovels_permits_select_authenticated"
  ON shovels_permits FOR SELECT
  TO authenticated
  USING (true);

-- Service role can insert/update (for API sync)
DROP POLICY IF EXISTS "shovels_permits_insert_service" ON shovels_permits;
CREATE POLICY "shovels_permits_insert_service"
  ON shovels_permits FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "shovels_permits_update_service" ON shovels_permits;
CREATE POLICY "shovels_permits_update_service"
  ON shovels_permits FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================
-- Shovels Address Metrics Policies
-- Read-only for authenticated users (shared data)
-- =============================================
DROP POLICY IF EXISTS "shovels_address_metrics_select_authenticated" ON shovels_address_metrics;
CREATE POLICY "shovels_address_metrics_select_authenticated"
  ON shovels_address_metrics FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "shovels_address_metrics_insert_service" ON shovels_address_metrics;
CREATE POLICY "shovels_address_metrics_insert_service"
  ON shovels_address_metrics FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "shovels_address_metrics_update_service" ON shovels_address_metrics;
CREATE POLICY "shovels_address_metrics_update_service"
  ON shovels_address_metrics FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================
-- Geo Vitality Scores Policies
-- Read-only for authenticated users (shared data)
-- =============================================
DROP POLICY IF EXISTS "geo_vitality_scores_select_authenticated" ON geo_vitality_scores;
CREATE POLICY "geo_vitality_scores_select_authenticated"
  ON geo_vitality_scores FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "geo_vitality_scores_insert_service" ON geo_vitality_scores;
CREATE POLICY "geo_vitality_scores_insert_service"
  ON geo_vitality_scores FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "geo_vitality_scores_update_service" ON geo_vitality_scores;
CREATE POLICY "geo_vitality_scores_update_service"
  ON geo_vitality_scores FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================
-- Shovels Contractors Policies
-- Read-only for authenticated users (shared data)
-- =============================================
DROP POLICY IF EXISTS "shovels_contractors_select_authenticated" ON shovels_contractors;
CREATE POLICY "shovels_contractors_select_authenticated"
  ON shovels_contractors FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "shovels_contractors_insert_service" ON shovels_contractors;
CREATE POLICY "shovels_contractors_insert_service"
  ON shovels_contractors FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "shovels_contractors_update_service" ON shovels_contractors;
CREATE POLICY "shovels_contractors_update_service"
  ON shovels_contractors FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =============================================
-- User Verticals Policies
-- Users can only access their own vertical preferences
-- =============================================
DROP POLICY IF EXISTS "user_verticals_select_own" ON user_verticals;
CREATE POLICY "user_verticals_select_own"
  ON user_verticals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_verticals_insert_own" ON user_verticals;
CREATE POLICY "user_verticals_insert_own"
  ON user_verticals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_verticals_update_own" ON user_verticals;
CREATE POLICY "user_verticals_update_own"
  ON user_verticals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_verticals_delete_own" ON user_verticals;
CREATE POLICY "user_verticals_delete_own"
  ON user_verticals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
