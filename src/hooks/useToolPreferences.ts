'use client';

/**
 * Tool Preferences Hook
 *
 * Manages user favorites, recent tools, and workflows
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  UserFavoriteTool,
  UserRecentTool,
  ToolWorkflow,
  ToolWorkflowCreate,
  ToolWorkflowUpdate,
} from '@/types/tool-preferences';
import type { Json } from '@/types/database';

export function useToolPreferences() {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<UserFavoriteTool[]>([]);
  const [recentTools, setRecentTools] = useState<UserRecentTool[]>([]);
  const [workflows, setWorkflows] = useState<ToolWorkflow[]>([]);
  const [loading, setLoading] = useState(true);

  // Get current user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
      }
    });
  }, [supabase]);

  const loadPreferences = useCallback(async () => {
    try {
      setLoading(true);

      // Load favorites
      const { data: favData } = await supabase
        .from('user_favorite_tools')
        .select('*')
        .order('favorited_at', { ascending: false });

      if (favData) setFavorites(favData);

      // Load recent tools
      const { data: recentData } = await supabase
        .from('user_recent_tools')
        .select('*')
        .order('used_at', { ascending: false })
        .limit(10);

      if (recentData) setRecentTools(recentData);

      // Load workflows
      const { data: workflowData } = await supabase
        .from('user_tool_workflows')
        .select('*')
        .order('last_used_at', { ascending: false, nullsFirst: false });

      if (workflowData) setWorkflows(workflowData);
    } catch (error) {
      console.error('Error loading tool preferences:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Load user preferences when we have a user
  useEffect(() => {
    if (userId) {
      loadPreferences();
    }
  }, [userId, loadPreferences]);

  // Check if a tool is favorited
  const isFavorite = useCallback(
    (toolSlug: string) => {
      return favorites.some((fav) => fav.tool_slug === toolSlug);
    },
    [favorites]
  );

  // Toggle favorite
  const toggleFavorite = useCallback(
    async (toolSlug: string) => {
      if (!userId) return;
      const alreadyFavorited = isFavorite(toolSlug);

      if (alreadyFavorited) {
        // Remove favorite
        const { error } = await supabase
          .from('user_favorite_tools')
          .delete()
          .eq('tool_slug', toolSlug);

        if (!error) {
          setFavorites((prev) => prev.filter((fav) => fav.tool_slug !== toolSlug));
        }
      } else {
        // Add favorite
        const { data, error } = await supabase
          .from('user_favorite_tools')
          .insert({ user_id: userId, tool_slug: toolSlug })
          .select()
          .single();

        if (!error && data) {
          setFavorites((prev) => [data, ...prev]);
        }
      }
    },
    [isFavorite, supabase, userId]
  );

  // Track tool usage (adds to recent tools)
  const trackToolUsage = useCallback(
    async (toolSlug: string, context?: Record<string, unknown>) => {
      if (!userId) return;
      const { error } = await supabase.from('user_recent_tools').insert({
        user_id: userId,
        tool_slug: toolSlug,
        context: context as Json,
        used_at: new Date().toISOString(),
      });

      if (!error) {
        // Reload recent tools
        const { data } = await supabase
          .from('user_recent_tools')
          .select('*')
          .order('used_at', { ascending: false })
          .limit(10);

        if (data) setRecentTools(data);
      }
    },
    [supabase, userId]
  );

  // Create workflow
  const createWorkflow = useCallback(
    async (workflow: ToolWorkflowCreate): Promise<ToolWorkflow | null> => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('user_tool_workflows')
        .insert({
          user_id: userId,
          name: workflow.name,
          description: workflow.description ?? null,
          tool_slugs: workflow.tool_slugs,
          step_prompts: (workflow.step_prompts ?? {}) as Json,
          is_public: workflow.is_public ?? false,
        })
        .select()
        .single();

      if (!error && data) {
        setWorkflows((prev) => [data, ...prev]);
        return data;
      }
      return null;
    },
    [supabase, userId]
  );

  // Update workflow
  const updateWorkflow = useCallback(
    async (id: string, updates: ToolWorkflowUpdate): Promise<ToolWorkflow | null> => {
      const { data, error } = await supabase
        .from('user_tool_workflows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        setWorkflows((prev) => prev.map((w) => (w.id === id ? data : w)));
        return data;
      }
      return null;
    },
    [supabase]
  );

  // Delete workflow
  const deleteWorkflow = useCallback(
    async (id: string): Promise<boolean> => {
      const { error } = await supabase.from('user_tool_workflows').delete().eq('id', id);

      if (!error) {
        setWorkflows((prev) => prev.filter((w) => w.id !== id));
        return true;
      }
      return false;
    },
    [supabase]
  );

  // Execute workflow (track usage and increment count)
  const executeWorkflow = useCallback(
    async (id: string): Promise<string[]> => {
      const workflow = workflows.find((w) => w.id === id);
      if (!workflow) return [];

      // Update usage stats
      await supabase
        .from('user_tool_workflows')
        .update({
          last_used_at: new Date().toISOString(),
          use_count: (workflow.use_count ?? 0) + 1,
        })
        .eq('id', id);

      // Reload workflows to reflect updated stats
      const { data } = await supabase
        .from('user_tool_workflows')
        .select('*')
        .order('last_used_at', { ascending: false, nullsFirst: false });

      if (data) setWorkflows(data);

      return workflow.tool_slugs;
    },
    [workflows, supabase]
  );

  return {
    favorites,
    recentTools,
    workflows,
    loading,
    isFavorite,
    toggleFavorite,
    trackToolUsage,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    executeWorkflow,
    refreshPreferences: loadPreferences,
  };
}
