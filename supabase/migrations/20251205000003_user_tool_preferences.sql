-- User Tool Preferences and History Migration
-- Tracks user favorites, recent tools, and custom workflows

-- User Favorite Tools
CREATE TABLE IF NOT EXISTS user_favorite_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_slug TEXT NOT NULL,
  favorited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure user can't favorite same tool twice
  UNIQUE(user_id, tool_slug),

  -- Indexes for fast lookups
  CONSTRAINT user_favorite_tools_user_id_idx UNIQUE (user_id, tool_slug)
);

CREATE INDEX IF NOT EXISTS idx_user_favorite_tools_user_id
  ON user_favorite_tools(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_tools_favorited_at
  ON user_favorite_tools(favorited_at DESC);

-- User Recent Tools (Last 10 used tools per user)
CREATE TABLE IF NOT EXISTS user_recent_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_slug TEXT NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Context when tool was used (optional metadata)
  context JSONB,

  -- Indexes
  CONSTRAINT user_recent_tools_idx UNIQUE (user_id, tool_slug, used_at)
);

CREATE INDEX IF NOT EXISTS idx_user_recent_tools_user_id_used_at
  ON user_recent_tools(user_id, used_at DESC);

-- Tool Workflows (Custom tool combinations)
CREATE TABLE IF NOT EXISTS user_tool_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,

  -- Array of tool slugs in execution order
  tool_slugs TEXT[] NOT NULL,

  -- Optional: Store example prompts for each step
  step_prompts JSONB,

  -- Metadata
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  use_count INTEGER DEFAULT 0,

  -- Ensure workflow has at least 2 tools
  CONSTRAINT workflow_min_tools CHECK (array_length(tool_slugs, 1) >= 2)
);

CREATE INDEX IF NOT EXISTS idx_user_tool_workflows_user_id
  ON user_tool_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tool_workflows_last_used
  ON user_tool_workflows(last_used_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_user_tool_workflows_public
  ON user_tool_workflows(is_public) WHERE is_public = TRUE;

-- Row Level Security (RLS) Policies

-- Favorite Tools: Users can only see/manage their own favorites
ALTER TABLE user_favorite_tools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own favorite tools" ON user_favorite_tools;
CREATE POLICY "Users can view their own favorite tools"
  ON user_favorite_tools FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own favorite tools" ON user_favorite_tools;
CREATE POLICY "Users can insert their own favorite tools"
  ON user_favorite_tools FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own favorite tools" ON user_favorite_tools;
CREATE POLICY "Users can delete their own favorite tools"
  ON user_favorite_tools FOR DELETE
  USING (auth.uid() = user_id);

-- Recent Tools: Users can only see/manage their own recent tools
ALTER TABLE user_recent_tools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own recent tools" ON user_recent_tools;
CREATE POLICY "Users can view their own recent tools"
  ON user_recent_tools FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own recent tools" ON user_recent_tools;
CREATE POLICY "Users can insert their own recent tools"
  ON user_recent_tools FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own recent tools" ON user_recent_tools;
CREATE POLICY "Users can delete their own recent tools"
  ON user_recent_tools FOR DELETE
  USING (auth.uid() = user_id);

-- Workflows: Users can see their own + public workflows
ALTER TABLE user_tool_workflows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own workflows" ON user_tool_workflows;
CREATE POLICY "Users can view their own workflows"
  ON user_tool_workflows FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view public workflows" ON user_tool_workflows;
CREATE POLICY "Users can view public workflows"
  ON user_tool_workflows FOR SELECT
  USING (is_public = TRUE);

DROP POLICY IF EXISTS "Users can insert their own workflows" ON user_tool_workflows;
CREATE POLICY "Users can insert their own workflows"
  ON user_tool_workflows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own workflows" ON user_tool_workflows;
CREATE POLICY "Users can update their own workflows"
  ON user_tool_workflows FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own workflows" ON user_tool_workflows;
CREATE POLICY "Users can delete their own workflows"
  ON user_tool_workflows FOR DELETE
  USING (auth.uid() = user_id);

-- Function to clean up old recent tools (keep only last 10 per user)
CREATE OR REPLACE FUNCTION cleanup_recent_tools()
RETURNS TRIGGER AS $$
BEGIN
  -- Delete old entries if user has more than 10
  DELETE FROM user_recent_tools
  WHERE id IN (
    SELECT id FROM user_recent_tools
    WHERE user_id = NEW.user_id
    ORDER BY used_at DESC
    OFFSET 10
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-cleanup recent tools
DROP TRIGGER IF EXISTS trigger_cleanup_recent_tools ON user_recent_tools;
CREATE TRIGGER trigger_cleanup_recent_tools
  AFTER INSERT ON user_recent_tools
  FOR EACH ROW
  EXECUTE FUNCTION cleanup_recent_tools();

-- Function to update workflow updated_at timestamp
CREATE OR REPLACE FUNCTION update_workflow_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update workflow timestamp
DROP TRIGGER IF EXISTS trigger_update_workflow_timestamp ON user_tool_workflows;
CREATE TRIGGER trigger_update_workflow_timestamp
  BEFORE UPDATE ON user_tool_workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_workflow_updated_at();

-- Comments for documentation
COMMENT ON TABLE user_favorite_tools IS 'User-favorited AI tools for quick access';
COMMENT ON TABLE user_recent_tools IS 'Recently used tools per user (max 10)';
COMMENT ON TABLE user_tool_workflows IS 'Custom tool combinations/workflows created by users';
