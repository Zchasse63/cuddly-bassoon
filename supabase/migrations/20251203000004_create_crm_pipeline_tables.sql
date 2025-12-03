-- Phase 8: CRM and Deal Pipeline Tables Extension
-- Creates 7 new tables for leads, lists, activities, offer strategies, and sales reports

-- ============================================================================
-- 1. LEADS TABLE
-- ============================================================================

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
    property_address VARCHAR(500),
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN (
        'new', 'contacted', 'engaged', 'qualified', 
        'offer_made', 'negotiating', 'under_contract', 'closed', 'lost'
    )),
    source VARCHAR(50) CHECK (source IN (
        'skip_trace', 'driving_for_dollars', 'referral', 
        'marketing', 'direct_mail', 'cold_call', 'website', 'other'
    )),
    motivation_score INTEGER CHECK (motivation_score >= 0 AND motivation_score <= 100),
    owner_name VARCHAR(255),
    owner_phone VARCHAR(50),
    owner_email VARCHAR(255),
    notes TEXT,
    lost_reason VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. LEAD LISTS TABLE
-- ============================================================================

CREATE TABLE lead_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    list_type VARCHAR(20) DEFAULT 'static' CHECK (list_type IN ('static', 'dynamic')),
    filter_criteria JSONB DEFAULT '{}'::JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. LEAD LIST ITEMS TABLE (Junction Table)
-- ============================================================================

CREATE TABLE lead_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES lead_lists(id) ON DELETE CASCADE,
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(list_id, lead_id)
);

-- ============================================================================
-- 4. LEAD CONTACT HISTORY TABLE
-- ============================================================================

CREATE TABLE lead_contact_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    contact_type VARCHAR(50) NOT NULL CHECK (contact_type IN (
        'call', 'sms', 'email', 'voicemail', 'in_person'
    )),
    outcome VARCHAR(50) CHECK (outcome IN (
        'no_answer', 'left_message', 'spoke_with', 
        'scheduled', 'not_interested', 'wrong_number', 'disconnected'
    )),
    duration_seconds INTEGER,
    notes TEXT,
    contacted_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. ACTIVITIES TABLE (Generic Activity Log)
-- ============================================================================

CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN (
        'lead', 'deal', 'buyer', 'property', 'offer'
    )),
    entity_id UUID NOT NULL,
    activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN (
        'created', 'updated', 'deleted', 'status_change', 'stage_change',
        'note_added', 'call_logged', 'email_sent', 'sms_sent',
        'document_uploaded', 'offer_made', 'offer_accepted', 'offer_rejected',
        'assigned', 'unassigned', 'viewed', 'exported'
    )),
    description TEXT,
    old_value JSONB,
    new_value JSONB,
    metadata JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 6. OFFER STRATEGIES TABLE
-- ============================================================================

CREATE TABLE offer_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    optimal_price DECIMAL(15, 2),
    target_price DECIMAL(15, 2),
    maximum_price DECIMAL(15, 2),
    walk_away_price DECIMAL(15, 2),
    arv DECIMAL(15, 2),
    repair_estimate DECIMAL(15, 2),
    profit_margin DECIMAL(5, 2),
    market_factor DECIMAL(5, 2) DEFAULT 1.0,
    strategy_reasoning TEXT,
    negotiation_tips JSONB DEFAULT '[]'::JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. SALES REPORTS TABLE
-- ============================================================================

CREATE TABLE sales_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    report_type VARCHAR(50) NOT NULL CHECK (report_type IN (
        'caller_briefing', 'property_analysis', 'negotiation_guide'
    )),
    title VARCHAR(255) NOT NULL,
    content JSONB NOT NULL DEFAULT '{}'::JSONB,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_motivation_score ON leads(motivation_score DESC);
CREATE INDEX idx_leads_property_id ON leads(property_id);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

CREATE INDEX idx_lead_lists_user_id ON lead_lists(user_id);
CREATE INDEX idx_lead_lists_is_active ON lead_lists(is_active);

CREATE INDEX idx_lead_list_items_list_id ON lead_list_items(list_id);
CREATE INDEX idx_lead_list_items_lead_id ON lead_list_items(lead_id);

CREATE INDEX idx_lead_contact_history_lead_id ON lead_contact_history(lead_id);
CREATE INDEX idx_lead_contact_history_user_id ON lead_contact_history(user_id);
CREATE INDEX idx_lead_contact_history_contacted_at ON lead_contact_history(contacted_at DESC);

CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_type ON activities(activity_type);
CREATE INDEX idx_activities_created_at ON activities(created_at DESC);

CREATE INDEX idx_offer_strategies_deal_id ON offer_strategies(deal_id);
CREATE INDEX idx_offer_strategies_user_id ON offer_strategies(user_id);
CREATE INDEX idx_offer_strategies_is_active ON offer_strategies(is_active);

CREATE INDEX idx_sales_reports_user_id ON sales_reports(user_id);
CREATE INDEX idx_sales_reports_lead_id ON sales_reports(lead_id);
CREATE INDEX idx_sales_reports_deal_id ON sales_reports(deal_id);
CREATE INDEX idx_sales_reports_type ON sales_reports(report_type);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_contact_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE offer_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_reports ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "Users can view own leads"
    ON leads FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads"
    ON leads FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
    ON leads FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
    ON leads FOR DELETE
    USING (auth.uid() = user_id);

-- Lead Lists policies
CREATE POLICY "Users can view own lead lists"
    ON lead_lists FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lead lists"
    ON lead_lists FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lead lists"
    ON lead_lists FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lead lists"
    ON lead_lists FOR DELETE
    USING (auth.uid() = user_id);

-- Lead List Items policies (via lead_lists ownership)
CREATE POLICY "Users can view own lead list items"
    ON lead_list_items FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM lead_lists WHERE id = list_id AND user_id = auth.uid()
    ));

CREATE POLICY "Users can insert own lead list items"
    ON lead_list_items FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM lead_lists WHERE id = list_id AND user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own lead list items"
    ON lead_list_items FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM lead_lists WHERE id = list_id AND user_id = auth.uid()
    ));

-- Lead Contact History policies
CREATE POLICY "Users can view own lead contact history"
    ON lead_contact_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lead contact history"
    ON lead_contact_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Activities policies
CREATE POLICY "Users can view own activities"
    ON activities FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own activities"
    ON activities FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Offer Strategies policies
CREATE POLICY "Users can view own offer strategies"
    ON offer_strategies FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own offer strategies"
    ON offer_strategies FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own offer strategies"
    ON offer_strategies FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own offer strategies"
    ON offer_strategies FOR DELETE
    USING (auth.uid() = user_id);

-- Sales Reports policies
CREATE POLICY "Users can view own sales reports"
    ON sales_reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sales reports"
    ON sales_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sales reports"
    ON sales_reports FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sales reports"
    ON sales_reports FOR DELETE
    USING (auth.uid() = user_id);

-- ============================================================================
-- TRIGGERS FOR updated_at
-- ============================================================================

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_lists_updated_at
    BEFORE UPDATE ON lead_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offer_strategies_updated_at
    BEFORE UPDATE ON offer_strategies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- EXTEND DEALS TABLE FOR NEW STAGES
-- ============================================================================

-- Update deals stage constraint to include new stages from Phase 8
ALTER TABLE deals DROP CONSTRAINT IF EXISTS deals_stage_check;
ALTER TABLE deals ADD CONSTRAINT deals_stage_check CHECK (stage IN (
    'lead', 'contacted', 'appointment', 'offer', 'contract',
    'assigned', 'closing', 'closed', 'lost'
));

