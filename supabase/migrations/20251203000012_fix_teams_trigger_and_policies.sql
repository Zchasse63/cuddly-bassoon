-- ============================================================================
-- Fix Teams Trigger and Add RLS Policies (repair for 20251203000011)
-- ============================================================================

-- Create team_invitations table if it doesn't exist
CREATE TABLE IF NOT EXISTS team_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, email)
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_team_invitations_team ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);

-- Fix trigger (drop and recreate)
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Ensure RLS is enabled
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Teams policies
DROP POLICY IF EXISTS teams_select_policy ON teams;
CREATE POLICY teams_select_policy ON teams FOR SELECT
    USING (
        owner_id = auth.uid() OR
        id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS teams_update_policy ON teams;
CREATE POLICY teams_update_policy ON teams FOR UPDATE
    USING (owner_id = auth.uid());

DROP POLICY IF EXISTS teams_delete_policy ON teams;
CREATE POLICY teams_delete_policy ON teams FOR DELETE
    USING (owner_id = auth.uid());

DROP POLICY IF EXISTS teams_insert_policy ON teams;
CREATE POLICY teams_insert_policy ON teams FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- Team Members policies
DROP POLICY IF EXISTS team_members_select_policy ON team_members;
CREATE POLICY team_members_select_policy ON team_members FOR SELECT
    USING (
        user_id = auth.uid() OR
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    );

DROP POLICY IF EXISTS team_members_insert_policy ON team_members;
CREATE POLICY team_members_insert_policy ON team_members FOR INSERT
    WITH CHECK (
        team_id IN (
            SELECT id FROM teams WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS team_members_update_policy ON team_members;
CREATE POLICY team_members_update_policy ON team_members FOR UPDATE
    USING (
        team_id IN (
            SELECT id FROM teams WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS team_members_delete_policy ON team_members;
CREATE POLICY team_members_delete_policy ON team_members FOR DELETE
    USING (
        user_id = auth.uid() OR
        team_id IN (
            SELECT id FROM teams WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Team Invitations policies
DROP POLICY IF EXISTS team_invitations_select_policy ON team_invitations;
CREATE POLICY team_invitations_select_policy ON team_invitations FOR SELECT
    USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
        OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

DROP POLICY IF EXISTS team_invitations_insert_policy ON team_invitations;
CREATE POLICY team_invitations_insert_policy ON team_invitations FOR INSERT
    WITH CHECK (
        team_id IN (
            SELECT id FROM teams WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

DROP POLICY IF EXISTS team_invitations_delete_policy ON team_invitations;
CREATE POLICY team_invitations_delete_policy ON team_invitations FOR DELETE
    USING (
        team_id IN (
            SELECT id FROM teams WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

