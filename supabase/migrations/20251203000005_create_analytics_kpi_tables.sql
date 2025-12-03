-- KPI Dashboard & Analytics System Tables
-- Based on FEATURE_KPI_Dashboard_Analytics_Team_Management.md

-- ============================================================================
-- 1. ANALYTICS EVENTS TABLE (Append-only event log)
-- ============================================================================

CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    team_id UUID,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB DEFAULT '{}'::JSONB,
    session_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event type categories:
-- Search & Discovery: property_search, property_view, property_save, property_analyze, filter_applied, skip_trace_run
-- Outreach: call_made, call_completed, sms_sent, sms_received, email_sent, email_opened, email_replied, mail_sent
-- Pipeline: lead_created, lead_stage_changed, appointment_set, offer_made, contract_signed, deal_closed
-- Financial: revenue_recorded, expense_recorded

COMMENT ON TABLE analytics_events IS 'Append-only event log for all user activities';
COMMENT ON COLUMN analytics_events.event_type IS 'Type of event: property_search, call_made, lead_created, deal_closed, etc.';

-- ============================================================================
-- 2. ANALYTICS DAILY TABLE (Aggregated daily metrics)
-- ============================================================================

CREATE TABLE analytics_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- Activity Metrics
    searches INTEGER DEFAULT 0,
    property_views INTEGER DEFAULT 0,
    property_saves INTEGER DEFAULT 0,
    property_analyses INTEGER DEFAULT 0,
    skip_traces INTEGER DEFAULT 0,

    -- Outreach Metrics
    calls_made INTEGER DEFAULT 0,
    calls_connected INTEGER DEFAULT 0,
    call_duration_seconds INTEGER DEFAULT 0,
    texts_sent INTEGER DEFAULT 0,
    texts_received INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_replied INTEGER DEFAULT 0,
    mail_sent INTEGER DEFAULT 0,
    mail_responses INTEGER DEFAULT 0,

    -- Pipeline Metrics
    leads_created INTEGER DEFAULT 0,
    leads_contacted INTEGER DEFAULT 0,
    appointments_set INTEGER DEFAULT 0,
    offers_made INTEGER DEFAULT 0,
    contracts_signed INTEGER DEFAULT 0,
    deals_closed INTEGER DEFAULT 0,
    deals_lost INTEGER DEFAULT 0,

    -- Financial Metrics
    revenue DECIMAL(15, 2) DEFAULT 0,
    expenses DECIMAL(15, 2) DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(user_id, date)
);

COMMENT ON TABLE analytics_daily IS 'Pre-aggregated daily metrics for fast dashboard queries';

-- ============================================================================
-- 3. TEAMS TABLE
-- ============================================================================

CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    settings JSONB DEFAULT '{}'::JSONB,
    lead_assignment_mode VARCHAR(20) DEFAULT 'round_robin' CHECK (lead_assignment_mode IN (
        'round_robin', 'manual', 'by_territory', 'by_expertise'
    )),
    territory_mode VARCHAR(20) DEFAULT 'zip_code' CHECK (territory_mode IN (
        'zip_code', 'county', 'city', 'custom'
    )),
    weekly_report_recipients JSONB DEFAULT '[]'::JSONB,
    monthly_report_day INTEGER DEFAULT 1 CHECK (monthly_report_day >= 1 AND monthly_report_day <= 28),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE teams IS 'Team definitions for multi-user organizations';

-- ============================================================================
-- 4. TEAM MEMBERS TABLE
-- ============================================================================

CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN (
        'admin', 'manager', 'acquisitions', 'junior_acquisitions', 'dispositions', 'member'
    )),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('invited', 'active', 'inactive')),
    invited_by UUID REFERENCES user_profiles(id),
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ,
    territories JSONB DEFAULT '[]'::JSONB,
    permissions JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(team_id, user_id)
);

COMMENT ON TABLE team_members IS 'Team membership with roles and permissions';

-- ============================================================================
-- 5. ANALYTICS TEAM DAILY (Aggregated team metrics)
-- ============================================================================

CREATE TABLE analytics_team_daily (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    -- Same structure as analytics_daily but aggregated for team
    searches INTEGER DEFAULT 0,
    property_views INTEGER DEFAULT 0,
    property_saves INTEGER DEFAULT 0,
    property_analyses INTEGER DEFAULT 0,
    skip_traces INTEGER DEFAULT 0,
    calls_made INTEGER DEFAULT 0,
    calls_connected INTEGER DEFAULT 0,
    texts_sent INTEGER DEFAULT 0,
    texts_received INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    emails_replied INTEGER DEFAULT 0,
    mail_sent INTEGER DEFAULT 0,
    leads_created INTEGER DEFAULT 0,
    leads_contacted INTEGER DEFAULT 0,
    appointments_set INTEGER DEFAULT 0,
    offers_made INTEGER DEFAULT 0,
    contracts_signed INTEGER DEFAULT 0,
    deals_closed INTEGER DEFAULT 0,
    revenue DECIMAL(15, 2) DEFAULT 0,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(team_id, date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_team_id ON analytics_events(team_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_user_created ON analytics_events(user_id, created_at DESC);

CREATE INDEX idx_analytics_daily_user_date ON analytics_daily(user_id, date DESC);
CREATE INDEX idx_analytics_daily_date ON analytics_daily(date DESC);

CREATE INDEX idx_teams_owner_id ON teams(owner_id);
CREATE INDEX idx_teams_is_active ON teams(is_active);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_user_id ON team_members(user_id);
CREATE INDEX idx_team_members_status ON team_members(status);

CREATE INDEX idx_analytics_team_daily_team_date ON analytics_team_daily(team_id, date DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_team_daily ENABLE ROW LEVEL SECURITY;

-- Analytics Events policies
CREATE POLICY "Users can view own events"
    ON analytics_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own events"
    ON analytics_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Analytics Daily policies
CREATE POLICY "Users can view own daily analytics"
    ON analytics_daily FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own daily analytics"
    ON analytics_daily FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily analytics"
    ON analytics_daily FOR UPDATE
    USING (auth.uid() = user_id);

-- Teams policies
CREATE POLICY "Team owners can manage team"
    ON teams FOR ALL
    USING (auth.uid() = owner_id);

CREATE POLICY "Team members can view team"
    ON teams FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = teams.id
        AND team_members.user_id = auth.uid()
        AND team_members.status = 'active'
    ));

-- Team Members policies
CREATE POLICY "Team admins can manage members"
    ON team_members FOR ALL
    USING (EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.role IN ('admin', 'manager')
    ));

CREATE POLICY "Members can view team members"
    ON team_members FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM team_members tm
        WHERE tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
        AND tm.status = 'active'
    ));

-- Team Daily Analytics policies
CREATE POLICY "Team members can view team analytics"
    ON analytics_team_daily FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM team_members
        WHERE team_members.team_id = analytics_team_daily.team_id
        AND team_members.user_id = auth.uid()
        AND team_members.status = 'active'
        AND team_members.role IN ('admin', 'manager')
    ));

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_analytics_daily_updated_at
    BEFORE UPDATE ON analytics_daily
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
    BEFORE UPDATE ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_analytics_team_daily_updated_at
    BEFORE UPDATE ON analytics_team_daily
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Add team_id to user_profiles for team association
-- ============================================================================

ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS current_team_id UUID REFERENCES teams(id);
