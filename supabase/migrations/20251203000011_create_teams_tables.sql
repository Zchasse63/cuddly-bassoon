-- ============================================================================
-- PHASE 10: Team Management Tables
-- ============================================================================

-- 1. Teams Table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_tier VARCHAR(50) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    max_members INTEGER DEFAULT 1,
    settings JSONB DEFAULT '{
        "default_permissions": ["view_properties", "manage_buyers", "manage_deals"],
        "invite_restriction": "admin",
        "data_sharing": true
    }'::JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Team Members Table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    permissions TEXT[] DEFAULT ARRAY['view_properties', 'manage_buyers', 'manage_deals'],
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(team_id, user_id)
);

-- 3. Team Invitations Table
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

-- 4. Indexes for Teams
CREATE INDEX IF NOT EXISTS idx_teams_owner ON teams(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);

-- 5. Update triggers for teams
DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
    BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. RLS Policies for Teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Teams: Users can view teams they own or are members of
DROP POLICY IF EXISTS teams_select_policy ON teams;
CREATE POLICY teams_select_policy ON teams FOR SELECT
    USING (
        owner_id = auth.uid() OR
        id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    );

-- Teams: Only owners can update their teams
DROP POLICY IF EXISTS teams_update_policy ON teams;
CREATE POLICY teams_update_policy ON teams FOR UPDATE
    USING (owner_id = auth.uid());

-- Teams: Only owners can delete their teams
DROP POLICY IF EXISTS teams_delete_policy ON teams;
CREATE POLICY teams_delete_policy ON teams FOR DELETE
    USING (owner_id = auth.uid());

-- Teams: Authenticated users can create teams
DROP POLICY IF EXISTS teams_insert_policy ON teams;
CREATE POLICY teams_insert_policy ON teams FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- Team Members: Members can view their team's members
DROP POLICY IF EXISTS team_members_select_policy ON team_members;
CREATE POLICY team_members_select_policy ON team_members FOR SELECT
    USING (
        user_id = auth.uid() OR
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    );

-- Team Members: Owners and admins can manage members
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

-- Team Invitations: Members can view invitations for their teams
DROP POLICY IF EXISTS team_invitations_select_policy ON team_invitations;
CREATE POLICY team_invitations_select_policy ON team_invitations FOR SELECT
    USING (
        team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
        OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- Team Invitations: Owners and admins can create invitations
DROP POLICY IF EXISTS team_invitations_insert_policy ON team_invitations;
CREATE POLICY team_invitations_insert_policy ON team_invitations FOR INSERT
    WITH CHECK (
        team_id IN (
            SELECT id FROM teams WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

-- Team Invitations: Owners and admins can delete invitations
DROP POLICY IF EXISTS team_invitations_delete_policy ON team_invitations;
CREATE POLICY team_invitations_delete_policy ON team_invitations FOR DELETE
    USING (
        team_id IN (
            SELECT id FROM teams WHERE owner_id = auth.uid()
            UNION
            SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
        )
    );

