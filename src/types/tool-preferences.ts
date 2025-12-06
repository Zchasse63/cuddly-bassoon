/**
 * User Tool Preferences Types
 *
 * Types for user favorites, recent tools, and workflows
 * Note: Nullable fields match the database schema
 */

import type { Json } from './database';

export interface UserFavoriteTool {
  id: string;
  user_id: string;
  tool_slug: string;
  favorited_at: string | null;
}

export interface UserRecentTool {
  id: string;
  user_id: string;
  tool_slug: string;
  used_at: string | null;
  context?: Json;
}

export interface ToolWorkflow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  tool_slugs: string[];
  step_prompts: Json; // tool_slug -> example prompt
  is_public: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  last_used_at: string | null;
  use_count: number | null;
}

export interface ToolWorkflowCreate {
  name: string;
  description?: string;
  tool_slugs: string[];
  step_prompts?: Record<string, string>;
  is_public?: boolean;
}

export interface ToolWorkflowUpdate {
  name?: string;
  description?: string;
  tool_slugs?: string[];
  step_prompts?: Record<string, string>;
  is_public?: boolean;
}
