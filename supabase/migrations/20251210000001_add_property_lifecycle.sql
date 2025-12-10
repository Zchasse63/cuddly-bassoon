-- Property Lifecycle Management Migration
-- Adds status tracking to properties and creates property_sales table for tracking sold properties
-- Includes loss pipeline analytics for understanding why deals were lost

-- ============================================================================
-- 1. ADD STATUS COLUMNS TO PROPERTIES TABLE
-- ============================================================================

-- Add lifecycle status columns to properties table
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'
    CHECK (status IN ('active', 'in_pipeline', 'sold', 'off_market', 'excluded')),
ADD COLUMN IF NOT EXISTS status_changed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status_changed_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS status_reason TEXT;

-- Add comments for documentation
COMMENT ON COLUMN properties.status IS 'Property lifecycle status: active (available), in_pipeline (being pursued), sold (transaction completed), off_market (not available), excluded (user excluded from searches)';
COMMENT ON COLUMN properties.status_changed_at IS 'Timestamp when status was last changed';
COMMENT ON COLUMN properties.status_changed_by IS 'User who changed the status';
COMMENT ON COLUMN properties.status_reason IS 'Optional reason or note for status change';

-- Create index for common status queries
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_status_changed_at ON properties(status_changed_at DESC);

-- ============================================================================
-- 2. CREATE PROPERTY_SALES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS property_sales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),

    -- Sale Information
    sale_date DATE NOT NULL,
    sale_price DECIMAL(15, 2),
    buyer_name VARCHAR(255),
    buyer_type VARCHAR(50) CHECK (buyer_type IN ('investor', 'owner_occupant', 'flipper', 'wholesaler', 'unknown')),
    source VARCHAR(50) CHECK (source IN ('manual', 'mls', 'county_records', 'skip_trace', 'ai_detected')),

    -- Pipeline Context
    was_in_pipeline BOOLEAN DEFAULT false,
    pipeline_stage_when_sold VARCHAR(50),
    our_offer_amount DECIMAL(15, 2),
    days_from_first_contact INTEGER,

    -- Loss Analysis (when we lost the deal)
    lost_reason VARCHAR(100) CHECK (lost_reason IN (
        'price_too_low', 'price_too_high', 'timing', 'seller_changed_mind',
        'competing_offer', 'financing_issues', 'inspection_issues',
        'title_issues', 'property_condition', 'seller_unrealistic',
        'lost_contact', 'personal_reasons', 'other', NULL
    )),
    lost_reason_details TEXT,
    competitor_who_won VARCHAR(255),
    price_delta DECIMAL(15, 2), -- difference between our offer and winning offer (positive = we were lower)

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE property_sales IS 'Tracks all property sales, including deals we lost, for pipeline analytics';
COMMENT ON COLUMN property_sales.was_in_pipeline IS 'Whether this property was in our pipeline when it sold';
COMMENT ON COLUMN property_sales.pipeline_stage_when_sold IS 'What stage the deal was in when it sold (if in our pipeline)';
COMMENT ON COLUMN property_sales.our_offer_amount IS 'The amount we offered (if we made an offer)';
COMMENT ON COLUMN property_sales.lost_reason IS 'Why we lost the deal (if applicable)';
COMMENT ON COLUMN property_sales.price_delta IS 'Difference between our offer and winning price (positive means we bid lower)';
COMMENT ON COLUMN property_sales.source IS 'How we learned about the sale';

-- ============================================================================
-- 3. CREATE INDEXES FOR PROPERTY_SALES
-- ============================================================================

CREATE INDEX idx_property_sales_property_id ON property_sales(property_id);
CREATE INDEX idx_property_sales_user_id ON property_sales(user_id);
CREATE INDEX idx_property_sales_sale_date ON property_sales(sale_date DESC);
CREATE INDEX idx_property_sales_was_in_pipeline ON property_sales(was_in_pipeline);
CREATE INDEX idx_property_sales_lost_reason ON property_sales(lost_reason) WHERE lost_reason IS NOT NULL;
CREATE INDEX idx_property_sales_buyer_type ON property_sales(buyer_type);
CREATE INDEX idx_property_sales_created_at ON property_sales(created_at DESC);

-- ============================================================================
-- 4. CREATE LOSS PIPELINE ANALYTICS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW loss_pipeline_analytics AS
SELECT
    user_id,
    DATE_TRUNC('month', sale_date) as month,

    -- Overall metrics
    COUNT(*) as total_sales_tracked,
    COUNT(*) FILTER (WHERE was_in_pipeline = true) as pipeline_sales,
    COUNT(*) FILTER (WHERE was_in_pipeline = true AND lost_reason IS NOT NULL) as deals_lost,

    -- Loss reasons breakdown
    COUNT(*) FILTER (WHERE lost_reason = 'price_too_low') as lost_price_too_low,
    COUNT(*) FILTER (WHERE lost_reason = 'price_too_high') as lost_price_too_high,
    COUNT(*) FILTER (WHERE lost_reason = 'competing_offer') as lost_competing_offer,
    COUNT(*) FILTER (WHERE lost_reason = 'timing') as lost_timing,
    COUNT(*) FILTER (WHERE lost_reason = 'seller_changed_mind') as lost_seller_changed_mind,
    COUNT(*) FILTER (WHERE lost_reason = 'financing_issues') as lost_financing,
    COUNT(*) FILTER (WHERE lost_reason = 'inspection_issues') as lost_inspection,
    COUNT(*) FILTER (WHERE lost_reason = 'lost_contact') as lost_contact,

    -- Pricing analytics
    AVG(price_delta) FILTER (WHERE price_delta IS NOT NULL) as avg_price_delta,
    AVG(our_offer_amount) FILTER (WHERE our_offer_amount IS NOT NULL) as avg_our_offer,
    AVG(sale_price) FILTER (WHERE sale_price IS NOT NULL) as avg_winning_price,

    -- Buyer type breakdown
    COUNT(*) FILTER (WHERE buyer_type = 'investor') as sold_to_investors,
    COUNT(*) FILTER (WHERE buyer_type = 'flipper') as sold_to_flippers,
    COUNT(*) FILTER (WHERE buyer_type = 'wholesaler') as sold_to_wholesalers,
    COUNT(*) FILTER (WHERE buyer_type = 'owner_occupant') as sold_to_owner_occupants,

    -- Timing metrics
    AVG(days_from_first_contact) FILTER (WHERE days_from_first_contact IS NOT NULL) as avg_days_in_pipeline

FROM property_sales
GROUP BY user_id, DATE_TRUNC('month', sale_date);

COMMENT ON VIEW loss_pipeline_analytics IS 'Monthly analytics on lost deals and pipeline performance';

-- ============================================================================
-- 5. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE property_sales ENABLE ROW LEVEL SECURITY;

-- Users can only view their own sales records
CREATE POLICY "Users can view own property sales"
    ON property_sales FOR SELECT
    USING (auth.uid() = user_id);

-- Users can insert their own sales records
CREATE POLICY "Users can insert own property sales"
    ON property_sales FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Users can update their own sales records
CREATE POLICY "Users can update own property sales"
    ON property_sales FOR UPDATE
    USING (auth.uid() = user_id);

-- Users can delete their own sales records
CREATE POLICY "Users can delete own property sales"
    ON property_sales FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- 6. ADD UPDATED_AT TRIGGER
-- ============================================================================

DROP TRIGGER IF EXISTS update_property_sales_updated_at ON property_sales;
CREATE TRIGGER update_property_sales_updated_at
    BEFORE UPDATE ON property_sales
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 7. CREATE HELPER FUNCTION FOR MARKING PROPERTY AS SOLD
-- ============================================================================

-- Function to atomically mark a property as sold and create sales record
CREATE OR REPLACE FUNCTION mark_property_sold(
    p_property_id UUID,
    p_user_id UUID,
    p_sale_date DATE,
    p_sale_price DECIMAL(15, 2) DEFAULT NULL,
    p_buyer_name VARCHAR(255) DEFAULT NULL,
    p_buyer_type VARCHAR(50) DEFAULT 'unknown',
    p_was_in_pipeline BOOLEAN DEFAULT false,
    p_pipeline_stage VARCHAR(50) DEFAULT NULL,
    p_our_offer_amount DECIMAL(15, 2) DEFAULT NULL,
    p_lost_reason VARCHAR(100) DEFAULT NULL,
    p_lost_reason_details TEXT DEFAULT NULL,
    p_competitor_who_won VARCHAR(255) DEFAULT NULL,
    p_price_delta DECIMAL(15, 2) DEFAULT NULL,
    p_status_reason TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_sale_id UUID;
BEGIN
    -- Update property status to sold
    UPDATE properties
    SET
        status = 'sold',
        status_changed_at = NOW(),
        status_changed_by = p_user_id,
        status_reason = p_status_reason
    WHERE id = p_property_id;

    -- Create sales record
    INSERT INTO property_sales (
        property_id,
        user_id,
        sale_date,
        sale_price,
        buyer_name,
        buyer_type,
        source,
        was_in_pipeline,
        pipeline_stage_when_sold,
        our_offer_amount,
        lost_reason,
        lost_reason_details,
        competitor_who_won,
        price_delta
    ) VALUES (
        p_property_id,
        p_user_id,
        p_sale_date,
        p_sale_price,
        p_buyer_name,
        p_buyer_type,
        'manual',
        p_was_in_pipeline,
        p_pipeline_stage,
        p_our_offer_amount,
        p_lost_reason,
        p_lost_reason_details,
        p_competitor_who_won,
        p_price_delta
    ) RETURNING id INTO v_sale_id;

    RETURN v_sale_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION mark_property_sold IS 'Atomically marks a property as sold and creates a sales record';

-- ============================================================================
-- 8. CREATE FUNCTION TO GET USER'S LOSS ANALYTICS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_loss_analytics(
    p_user_id UUID,
    p_start_date DATE DEFAULT NOW() - INTERVAL '12 months',
    p_end_date DATE DEFAULT NOW()
) RETURNS TABLE (
    metric_name TEXT,
    metric_value NUMERIC,
    metric_label TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH sales_data AS (
        SELECT * FROM property_sales
        WHERE user_id = p_user_id
        AND sale_date BETWEEN p_start_date AND p_end_date
    )
    SELECT 'total_tracked'::TEXT, COUNT(*)::NUMERIC, 'Total Sales Tracked'::TEXT FROM sales_data
    UNION ALL
    SELECT 'in_pipeline'::TEXT, COUNT(*) FILTER (WHERE was_in_pipeline = true)::NUMERIC, 'Deals in Pipeline'::TEXT FROM sales_data
    UNION ALL
    SELECT 'deals_lost'::TEXT, COUNT(*) FILTER (WHERE was_in_pipeline = true AND lost_reason IS NOT NULL)::NUMERIC, 'Deals Lost'::TEXT FROM sales_data
    UNION ALL
    SELECT 'avg_price_delta'::TEXT, AVG(price_delta) FILTER (WHERE price_delta IS NOT NULL), 'Avg Price Delta ($)'::TEXT FROM sales_data
    UNION ALL
    SELECT 'avg_days_in_pipeline'::TEXT, AVG(days_from_first_contact) FILTER (WHERE days_from_first_contact IS NOT NULL), 'Avg Days in Pipeline'::TEXT FROM sales_data
    UNION ALL
    SELECT 'lost_to_price'::TEXT,
        COUNT(*) FILTER (WHERE lost_reason IN ('price_too_low', 'price_too_high', 'competing_offer'))::NUMERIC,
        'Lost to Price Issues'::TEXT
    FROM sales_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_loss_analytics IS 'Returns key loss analytics metrics for a user within a date range';
