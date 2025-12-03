-- Phase 2: Analytics RPC Functions

-- 10.3 Deal Statistics Function
CREATE OR REPLACE FUNCTION get_deal_statistics(
    p_user_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_deals BIGINT,
    active_deals BIGINT,
    closed_deals BIGINT,
    lost_deals BIGINT,
    total_contract_value NUMERIC,
    total_assignment_fees NUMERIC,
    avg_assignment_fee NUMERIC,
    deals_by_stage JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH deal_stats AS (
        SELECT 
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE status = 'active') AS active,
            COUNT(*) FILTER (WHERE stage = 'closed') AS closed,
            COUNT(*) FILTER (WHERE stage = 'lost') AS lost,
            COALESCE(SUM(contract_price), 0) AS contract_total,
            COALESCE(SUM(assignment_fee), 0) AS fee_total,
            COALESCE(AVG(assignment_fee), 0) AS fee_avg
        FROM deals
        WHERE user_id = p_user_id
            AND (p_start_date IS NULL OR created_at >= p_start_date)
            AND (p_end_date IS NULL OR created_at <= p_end_date)
    ),
    stage_breakdown AS (
        SELECT jsonb_object_agg(stage, cnt) AS stages
        FROM (
            SELECT stage, COUNT(*) AS cnt
            FROM deals
            WHERE user_id = p_user_id
                AND (p_start_date IS NULL OR created_at >= p_start_date)
                AND (p_end_date IS NULL OR created_at <= p_end_date)
            GROUP BY stage
        ) s
    )
    SELECT 
        ds.total,
        ds.active,
        ds.closed,
        ds.lost,
        ds.contract_total,
        ds.fee_total,
        ds.fee_avg,
        COALESCE(sb.stages, '{}'::JSONB)
    FROM deal_stats ds, stage_breakdown sb;
END;
$$;

-- Buyer Statistics Function
CREATE OR REPLACE FUNCTION get_buyer_statistics(
    p_user_id UUID
)
RETURNS TABLE (
    total_buyers BIGINT,
    active_buyers BIGINT,
    qualified_buyers BIGINT,
    tier_a_count BIGINT,
    tier_b_count BIGINT,
    tier_c_count BIGINT,
    buyers_by_type JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH buyer_stats AS (
        SELECT 
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE status = 'active') AS active,
            COUNT(*) FILTER (WHERE status = 'qualified') AS qualified,
            COUNT(*) FILTER (WHERE tier = 'A') AS tier_a,
            COUNT(*) FILTER (WHERE tier = 'B') AS tier_b,
            COUNT(*) FILTER (WHERE tier = 'C') AS tier_c
        FROM buyers
        WHERE user_id = p_user_id
    ),
    type_breakdown AS (
        SELECT jsonb_object_agg(buyer_type, cnt) AS types
        FROM (
            SELECT buyer_type, COUNT(*) AS cnt
            FROM buyers
            WHERE user_id = p_user_id AND buyer_type IS NOT NULL
            GROUP BY buyer_type
        ) t
    )
    SELECT 
        bs.total,
        bs.active,
        bs.qualified,
        bs.tier_a,
        bs.tier_b,
        bs.tier_c,
        COALESCE(tb.types, '{}'::JSONB)
    FROM buyer_stats bs, type_breakdown tb;
END;
$$;

-- Communication Statistics Function
CREATE OR REPLACE FUNCTION get_communication_stats(
    p_user_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_messages BIGINT,
    sms_count BIGINT,
    email_count BIGINT,
    outbound_count BIGINT,
    inbound_count BIGINT,
    delivered_count BIGINT,
    failed_count BIGINT,
    messages_by_status JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    WITH msg_stats AS (
        SELECT 
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE channel = 'sms') AS sms,
            COUNT(*) FILTER (WHERE channel = 'email') AS email,
            COUNT(*) FILTER (WHERE direction = 'outbound') AS outbound,
            COUNT(*) FILTER (WHERE direction = 'inbound') AS inbound,
            COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
            COUNT(*) FILTER (WHERE status = 'failed') AS failed
        FROM messages
        WHERE user_id = p_user_id
            AND (p_start_date IS NULL OR created_at >= p_start_date)
            AND (p_end_date IS NULL OR created_at <= p_end_date)
    ),
    status_breakdown AS (
        SELECT jsonb_object_agg(status, cnt) AS statuses
        FROM (
            SELECT status, COUNT(*) AS cnt
            FROM messages
            WHERE user_id = p_user_id
                AND (p_start_date IS NULL OR created_at >= p_start_date)
                AND (p_end_date IS NULL OR created_at <= p_end_date)
            GROUP BY status
        ) s
    )
    SELECT 
        ms.total,
        ms.sms,
        ms.email,
        ms.outbound,
        ms.inbound,
        ms.delivered,
        ms.failed,
        COALESCE(sb.statuses, '{}'::JSONB)
    FROM msg_stats ms, status_breakdown sb;
END;
$$;

