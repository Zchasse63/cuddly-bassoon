-- Phase 9: Communication Automation Schema Extension
-- Extends existing messages and templates tables, adds workflows and workflow_executions

-- ============================================================================
-- 1. EXTEND MESSAGES TABLE
-- ============================================================================

-- Add new columns to messages table for Phase 9 requirements
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS thread_id UUID,
ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS voicemail_url TEXT,
ADD COLUMN IF NOT EXISTS transcription TEXT,
ADD COLUMN IF NOT EXISTS sensitivity_flags JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS read_at TIMESTAMPTZ;

-- Update channel check constraint to include new channels
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_channel_check;
ALTER TABLE messages ADD CONSTRAINT messages_channel_check 
  CHECK (channel IN ('sms', 'email', 'voicemail', 'in_app'));

-- Update status check constraint
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_status_check;
ALTER TABLE messages ADD CONSTRAINT messages_status_check 
  CHECK (status IN ('queued', 'sending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked', 'spam', 'unsubscribed'));

-- ============================================================================
-- 2. EXTEND TEMPLATES TABLE
-- ============================================================================

-- Add new columns to templates table for Phase 9 requirements
ALTER TABLE templates 
ADD COLUMN IF NOT EXISTS template_type VARCHAR(50) DEFAULT 'outreach',
ADD COLUMN IF NOT EXISTS sensitivity_level VARCHAR(20) DEFAULT 'safe',
ADD COLUMN IF NOT EXISTS forbidden_topics JSONB DEFAULT '[]'::JSONB,
ADD COLUMN IF NOT EXISTS approval_required BOOLEAN DEFAULT FALSE;

-- Add constraints for new columns
ALTER TABLE templates DROP CONSTRAINT IF EXISTS templates_template_type_check;
ALTER TABLE templates ADD CONSTRAINT templates_template_type_check 
  CHECK (template_type IN ('outreach', 'follow_up', 'offer', 'blast', 'notification', 'transactional'));

ALTER TABLE templates DROP CONSTRAINT IF EXISTS templates_sensitivity_level_check;
ALTER TABLE templates ADD CONSTRAINT templates_sensitivity_level_check 
  CHECK (sensitivity_level IN ('safe', 'caution', 'forbidden'));

-- ============================================================================
-- 3. CREATE WORKFLOWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(50) NOT NULL,
    trigger_config JSONB NOT NULL DEFAULT '{}'::JSONB,
    conditions JSONB DEFAULT '[]'::JSONB,
    actions JSONB NOT NULL DEFAULT '[]'::JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraint for trigger types
ALTER TABLE workflows ADD CONSTRAINT workflows_trigger_type_check 
  CHECK (trigger_type IN (
    'lead_status_change',
    'deal_stage_change', 
    'time_based',
    'property_match',
    'inbound_message',
    'form_submission',
    'manual'
  ));

-- ============================================================================
-- 4. CREATE WORKFLOW_EXECUTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS workflow_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    trigger_data JSONB NOT NULL DEFAULT '{}'::JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    actions_completed INTEGER DEFAULT 0,
    actions_total INTEGER DEFAULT 0,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    execution_log JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraint for execution status
ALTER TABLE workflow_executions ADD CONSTRAINT workflow_executions_status_check 
  CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled'));

-- ============================================================================
-- 5. CREATE CAMPAIGNS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'email',
    recipient_criteria JSONB DEFAULT '{}'::JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'draft',
    scheduled_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    messages_total INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    messages_delivered INTEGER DEFAULT 0,
    messages_opened INTEGER DEFAULT 0,
    messages_clicked INTEGER DEFAULT 0,
    messages_failed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraints for campaigns
ALTER TABLE campaigns ADD CONSTRAINT campaigns_channel_check 
  CHECK (channel IN ('sms', 'email'));
  
ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check 
  CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'paused', 'cancelled'));

-- ============================================================================
-- 6. CREATE NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    link TEXT,
    entity_type VARCHAR(50),
    entity_id UUID,
    priority VARCHAR(20) DEFAULT 'normal',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    dismissed_at TIMESTAMPTZ,
    snoozed_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraints for notifications
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN (
    'new_message',
    'delivery_failure', 
    'campaign_complete',
    'response_received',
    'deal_update',
    'lead_update',
    'buyer_match',
    'workflow_triggered',
    'system',
    'reminder'
  ));

ALTER TABLE notifications ADD CONSTRAINT notifications_priority_check
  CHECK (priority IN ('low', 'normal', 'high', 'urgent'));

-- ============================================================================
-- 7. CREATE OPT_OUTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS opt_outs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    contact_identifier VARCHAR(255) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    reason TEXT,
    opted_out_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, contact_identifier, channel)
);

ALTER TABLE opt_outs ADD CONSTRAINT opt_outs_channel_check
  CHECK (channel IN ('sms', 'email', 'all'));

-- ============================================================================
-- 8. CREATE INDEXES
-- ============================================================================

-- Messages indexes
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON messages(is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_messages_user_created ON messages(user_id, created_at DESC);

-- Workflows indexes
CREATE INDEX IF NOT EXISTS idx_workflows_user_active ON workflows(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_workflows_trigger_type ON workflows(trigger_type);

-- Workflow executions indexes
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);

-- Campaigns indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_user_status ON campaigns(user_id, status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled ON campaigns(scheduled_at) WHERE status = 'scheduled';

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- Opt-outs indexes
CREATE INDEX IF NOT EXISTS idx_opt_outs_contact ON opt_outs(contact_identifier);

-- ============================================================================
-- 9. ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE opt_outs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 10. CREATE RLS POLICIES
-- ============================================================================

-- Workflows policies
CREATE POLICY workflows_select ON workflows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY workflows_insert ON workflows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY workflows_update ON workflows FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY workflows_delete ON workflows FOR DELETE USING (auth.uid() = user_id);

-- Workflow executions policies (via workflow ownership)
CREATE POLICY workflow_executions_select ON workflow_executions FOR SELECT
  USING (EXISTS (SELECT 1 FROM workflows WHERE workflows.id = workflow_executions.workflow_id AND workflows.user_id = auth.uid()));

-- Campaigns policies
CREATE POLICY campaigns_select ON campaigns FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY campaigns_insert ON campaigns FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY campaigns_update ON campaigns FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY campaigns_delete ON campaigns FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY notifications_select ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY notifications_insert ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY notifications_update ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY notifications_delete ON notifications FOR DELETE USING (auth.uid() = user_id);

-- Opt-outs policies
CREATE POLICY opt_outs_select ON opt_outs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY opt_outs_insert ON opt_outs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY opt_outs_delete ON opt_outs FOR DELETE USING (auth.uid() = user_id);

