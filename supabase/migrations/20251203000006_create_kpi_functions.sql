-- KPI Calculation Functions
-- Based on FEATURE_KPI_Dashboard_Analytics_Team_Management.md

-- ============================================================================
-- GET ACTIVITY KPIs
-- ============================================================================

CREATE OR REPLACE FUNCTION get_activity_kpis(
    p_user_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_searches INTEGER,
    total_views INTEGER,
    total_saves INTEGER,
    total_analyses INTEGER,
    total_skip_traces INTEGER,
    avg_daily_searches NUMERIC,
    avg_daily_views NUMERIC,
    search_to_save_rate NUMERIC,
    save_to_analyze_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(ad.searches), 0)::INTEGER as total_searches,
        COALESCE(SUM(ad.property_views), 0)::INTEGER as total_views,
        COALESCE(SUM(ad.property_saves), 0)::INTEGER as total_saves,
        COALESCE(SUM(ad.property_analyses), 0)::INTEGER as total_analyses,
        COALESCE(SUM(ad.skip_traces), 0)::INTEGER as total_skip_traces,
        ROUND(COALESCE(AVG(ad.searches), 0), 2) as avg_daily_searches,
        ROUND(COALESCE(AVG(ad.property_views), 0), 2) as avg_daily_views,
        CASE
            WHEN SUM(ad.searches) > 0
            THEN ROUND((SUM(ad.property_saves)::NUMERIC / SUM(ad.searches)) * 100, 2)
            ELSE 0
        END as search_to_save_rate,
        CASE
            WHEN SUM(ad.property_saves) > 0
            THEN ROUND((SUM(ad.property_analyses)::NUMERIC / SUM(ad.property_saves)) * 100, 2)
            ELSE 0
        END as save_to_analyze_rate
    FROM analytics_daily ad
    WHERE ad.user_id = p_user_id
    AND ad.date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET OUTREACH KPIs
-- ============================================================================

CREATE OR REPLACE FUNCTION get_outreach_kpis(
    p_user_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_calls INTEGER,
    connected_calls INTEGER,
    total_call_duration INTEGER,
    total_texts_sent INTEGER,
    total_texts_received INTEGER,
    total_emails_sent INTEGER,
    total_emails_opened INTEGER,
    total_emails_replied INTEGER,
    call_connect_rate NUMERIC,
    email_open_rate NUMERIC,
    email_reply_rate NUMERIC,
    avg_calls_per_day NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(ad.calls_made), 0)::INTEGER,
        COALESCE(SUM(ad.calls_connected), 0)::INTEGER,
        COALESCE(SUM(ad.call_duration_seconds), 0)::INTEGER,
        COALESCE(SUM(ad.texts_sent), 0)::INTEGER,
        COALESCE(SUM(ad.texts_received), 0)::INTEGER,
        COALESCE(SUM(ad.emails_sent), 0)::INTEGER,
        COALESCE(SUM(ad.emails_opened), 0)::INTEGER,
        COALESCE(SUM(ad.emails_replied), 0)::INTEGER,
        CASE
            WHEN SUM(ad.calls_made) > 0
            THEN ROUND((SUM(ad.calls_connected)::NUMERIC / SUM(ad.calls_made)) * 100, 2)
            ELSE 0
        END,
        CASE
            WHEN SUM(ad.emails_sent) > 0
            THEN ROUND((SUM(ad.emails_opened)::NUMERIC / SUM(ad.emails_sent)) * 100, 2)
            ELSE 0
        END,
        CASE
            WHEN SUM(ad.emails_sent) > 0
            THEN ROUND((SUM(ad.emails_replied)::NUMERIC / SUM(ad.emails_sent)) * 100, 2)
            ELSE 0
        END,
        ROUND(COALESCE(AVG(ad.calls_made), 0), 2)
    FROM analytics_daily ad
    WHERE ad.user_id = p_user_id
    AND ad.date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET PIPELINE KPIs
-- ============================================================================

CREATE OR REPLACE FUNCTION get_pipeline_kpis(
    p_user_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_leads INTEGER,
    leads_contacted INTEGER,
    appointments_set INTEGER,
    offers_made INTEGER,
    contracts_signed INTEGER,
    deals_closed INTEGER,
    deals_lost INTEGER,
    lead_to_contact_rate NUMERIC,
    contact_to_appointment_rate NUMERIC,
    appointment_to_offer_rate NUMERIC,
    offer_to_contract_rate NUMERIC,
    contract_to_close_rate NUMERIC,
    overall_conversion_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(ad.leads_created), 0)::INTEGER,
        COALESCE(SUM(ad.leads_contacted), 0)::INTEGER,
        COALESCE(SUM(ad.appointments_set), 0)::INTEGER,
        COALESCE(SUM(ad.offers_made), 0)::INTEGER,
        COALESCE(SUM(ad.contracts_signed), 0)::INTEGER,
        COALESCE(SUM(ad.deals_closed), 0)::INTEGER,
        COALESCE(SUM(ad.deals_lost), 0)::INTEGER,
        CASE WHEN SUM(ad.leads_created) > 0
            THEN ROUND((SUM(ad.leads_contacted)::NUMERIC / SUM(ad.leads_created)) * 100, 2) ELSE 0 END,
        CASE WHEN SUM(ad.leads_contacted) > 0
            THEN ROUND((SUM(ad.appointments_set)::NUMERIC / SUM(ad.leads_contacted)) * 100, 2) ELSE 0 END,
        CASE WHEN SUM(ad.appointments_set) > 0
            THEN ROUND((SUM(ad.offers_made)::NUMERIC / SUM(ad.appointments_set)) * 100, 2) ELSE 0 END,
        CASE WHEN SUM(ad.offers_made) > 0
            THEN ROUND((SUM(ad.contracts_signed)::NUMERIC / SUM(ad.offers_made)) * 100, 2) ELSE 0 END,
        CASE WHEN SUM(ad.contracts_signed) > 0
            THEN ROUND((SUM(ad.deals_closed)::NUMERIC / SUM(ad.contracts_signed)) * 100, 2) ELSE 0 END,
        CASE WHEN SUM(ad.leads_created) > 0
            THEN ROUND((SUM(ad.deals_closed)::NUMERIC / SUM(ad.leads_created)) * 100, 2) ELSE 0 END
    FROM analytics_daily ad
    WHERE ad.user_id = p_user_id
    AND ad.date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET FINANCIAL KPIs
-- ============================================================================

CREATE OR REPLACE FUNCTION get_financial_kpis(
    p_user_id UUID,
    p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_revenue NUMERIC,
    total_expenses NUMERIC,
    net_profit NUMERIC,
    avg_deal_revenue NUMERIC,
    deals_count INTEGER,
    revenue_per_lead NUMERIC,
    cost_per_lead NUMERIC,
    roi_percentage NUMERIC
) AS $$
DECLARE
    v_total_leads INTEGER;
BEGIN
    -- Get total leads for the period
    SELECT COALESCE(SUM(leads_created), 0) INTO v_total_leads
    FROM analytics_daily
    WHERE user_id = p_user_id AND date BETWEEN p_start_date AND p_end_date;

    RETURN QUERY
    SELECT
        COALESCE(SUM(ad.revenue), 0)::NUMERIC,
        COALESCE(SUM(ad.expenses), 0)::NUMERIC,
        (COALESCE(SUM(ad.revenue), 0) - COALESCE(SUM(ad.expenses), 0))::NUMERIC,
        CASE WHEN SUM(ad.deals_closed) > 0
            THEN ROUND(SUM(ad.revenue) / SUM(ad.deals_closed), 2) ELSE 0 END,
        COALESCE(SUM(ad.deals_closed), 0)::INTEGER,
        CASE WHEN v_total_leads > 0
            THEN ROUND(SUM(ad.revenue) / v_total_leads, 2) ELSE 0 END,
        CASE WHEN v_total_leads > 0
            THEN ROUND(SUM(ad.expenses) / v_total_leads, 2) ELSE 0 END,
        CASE WHEN SUM(ad.expenses) > 0
            THEN ROUND(((SUM(ad.revenue) - SUM(ad.expenses)) / SUM(ad.expenses)) * 100, 2) ELSE 0 END
    FROM analytics_daily ad
    WHERE ad.user_id = p_user_id
    AND ad.date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GET DASHBOARD SUMMARY (Combined KPIs for dashboard)
-- ============================================================================

CREATE OR REPLACE FUNCTION get_dashboard_summary(
    p_user_id UUID,
    p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
    -- Activity
    properties_searched INTEGER,
    properties_saved INTEGER,
    properties_analyzed INTEGER,
    -- Pipeline
    active_leads INTEGER,
    active_deals INTEGER,
    deals_closed_period INTEGER,
    -- Financial
    revenue_period NUMERIC,
    avg_assignment_fee NUMERIC,
    -- Trends (vs previous period)
    searches_trend NUMERIC,
    deals_trend NUMERIC,
    revenue_trend NUMERIC
) AS $$
DECLARE
    v_start_date DATE := CURRENT_DATE - (p_days || ' days')::INTERVAL;
    v_prev_start DATE := CURRENT_DATE - (p_days * 2 || ' days')::INTERVAL;
    v_prev_end DATE := CURRENT_DATE - (p_days || ' days')::INTERVAL - INTERVAL '1 day';
    v_current_searches INTEGER;
    v_prev_searches INTEGER;
    v_current_deals INTEGER;
    v_prev_deals INTEGER;
    v_current_revenue NUMERIC;
    v_prev_revenue NUMERIC;
BEGIN
    -- Get current period metrics
    SELECT
        COALESCE(SUM(searches), 0),
        COALESCE(SUM(deals_closed), 0),
        COALESCE(SUM(revenue), 0)
    INTO v_current_searches, v_current_deals, v_current_revenue
    FROM analytics_daily
    WHERE user_id = p_user_id AND date >= v_start_date;

    -- Get previous period metrics
    SELECT
        COALESCE(SUM(searches), 0),
        COALESCE(SUM(deals_closed), 0),
        COALESCE(SUM(revenue), 0)
    INTO v_prev_searches, v_prev_deals, v_prev_revenue
    FROM analytics_daily
    WHERE user_id = p_user_id AND date BETWEEN v_prev_start AND v_prev_end;

    RETURN QUERY
    SELECT
        COALESCE(SUM(ad.searches), 0)::INTEGER,
        COALESCE(SUM(ad.property_saves), 0)::INTEGER,
        COALESCE(SUM(ad.property_analyses), 0)::INTEGER,
        (SELECT COUNT(*)::INTEGER FROM leads WHERE leads.user_id = p_user_id AND status NOT IN ('closed', 'lost')),
        (SELECT COUNT(*)::INTEGER FROM deals WHERE deals.user_id = p_user_id AND stage NOT IN ('closed', 'lost')),
        COALESCE(SUM(ad.deals_closed), 0)::INTEGER,
        COALESCE(SUM(ad.revenue), 0)::NUMERIC,
        CASE WHEN SUM(ad.deals_closed) > 0
            THEN ROUND(SUM(ad.revenue) / SUM(ad.deals_closed), 2) ELSE 0 END,
        CASE WHEN v_prev_searches > 0
            THEN ROUND(((v_current_searches - v_prev_searches)::NUMERIC / v_prev_searches) * 100, 1) ELSE 0 END,
        CASE WHEN v_prev_deals > 0
            THEN ROUND(((v_current_deals - v_prev_deals)::NUMERIC / v_prev_deals) * 100, 1) ELSE 0 END,
        CASE WHEN v_prev_revenue > 0
            THEN ROUND(((v_current_revenue - v_prev_revenue) / v_prev_revenue) * 100, 1) ELSE 0 END
    FROM analytics_daily ad
    WHERE ad.user_id = p_user_id AND ad.date >= v_start_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- UPSERT DAILY ANALYTICS (for event aggregation)
-- ============================================================================

CREATE OR REPLACE FUNCTION upsert_daily_analytics(
    p_user_id UUID,
    p_date DATE,
    p_field TEXT,
    p_increment INTEGER DEFAULT 1
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO analytics_daily (user_id, date)
    VALUES (p_user_id, p_date)
    ON CONFLICT (user_id, date) DO NOTHING;

    EXECUTE format(
        'UPDATE analytics_daily SET %I = %I + $1, updated_at = NOW() WHERE user_id = $2 AND date = $3',
        p_field, p_field
    ) USING p_increment, p_user_id, p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
