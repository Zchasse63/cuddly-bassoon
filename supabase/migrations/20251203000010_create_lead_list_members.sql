-- ============================================================================
-- Lead List Members Table
-- Join table for leads and lead_lists
-- ============================================================================

CREATE TABLE IF NOT EXISTS lead_list_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  lead_list_id UUID NOT NULL REFERENCES lead_lists(id) ON DELETE CASCADE,
  added_by UUID REFERENCES user_profiles(id) ON DELETE SET NULL,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  
  -- Prevent duplicate entries
  UNIQUE(lead_id, lead_list_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lead_list_members_lead_id ON lead_list_members(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_list_members_list_id ON lead_list_members(lead_list_id);

-- RLS Policies
ALTER TABLE lead_list_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members of their lists"
  ON lead_list_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lead_lists 
      WHERE lead_lists.id = lead_list_members.lead_list_id 
      AND lead_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add members to their lists"
  ON lead_list_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lead_lists 
      WHERE lead_lists.id = lead_list_members.lead_list_id 
      AND lead_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove members from their lists"
  ON lead_list_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM lead_lists 
      WHERE lead_lists.id = lead_list_members.lead_list_id 
      AND lead_lists.user_id = auth.uid()
    )
  );

