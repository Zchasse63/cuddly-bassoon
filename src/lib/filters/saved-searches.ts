/**
 * Saved Searches Service
 * Manages saving, loading, and running saved property searches
 */

import { createClient } from '@/lib/supabase/client';
import type { ActiveFilter, FilterCombinationMode } from './types';

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  filters: {
    activeFilters: ActiveFilter[];
    filterMode: FilterCombinationMode;
    location?: {
      city?: string;
      state?: string;
      zip?: string;
    };
  };
  isActive: boolean;
  notifyOnNew: boolean;
  resultsCount?: number | null;
  lastRunAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavedSearchInput {
  name: string;
  description?: string;
  filters: SavedSearch['filters'];
  notifyOnNew?: boolean;
}

export interface UpdateSavedSearchInput {
  name?: string;
  description?: string;
  filters?: SavedSearch['filters'];
  isActive?: boolean;
  notifyOnNew?: boolean;
}

/**
 * Get all saved searches for the current user
 */
export async function getSavedSearches(): Promise<SavedSearch[]> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(mapDbToSavedSearch);
}

/**
 * Get a single saved search by ID
 */
export async function getSavedSearch(id: string): Promise<SavedSearch | null> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return mapDbToSavedSearch(data);
}

/**
 * Create a new saved search
 */
export async function createSavedSearch(
  input: CreateSavedSearchInput
): Promise<SavedSearch> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('saved_searches')
    .insert({
      user_id: user.id,
      name: input.name,
      description: input.description,
      filters: JSON.parse(JSON.stringify(input.filters)),
      notify_on_new: input.notifyOnNew ?? false,
      is_active: true,
    })
    .select()
    .single();

  if (error) throw error;

  return mapDbToSavedSearch(data);
}

/**
 * Update an existing saved search
 */
export async function updateSavedSearch(
  id: string,
  input: UpdateSavedSearchInput
): Promise<SavedSearch> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.filters !== undefined) updateData.filters = JSON.parse(JSON.stringify(input.filters));
  if (input.isActive !== undefined) updateData.is_active = input.isActive;
  if (input.notifyOnNew !== undefined) updateData.notify_on_new = input.notifyOnNew;

  const { data, error } = await supabase
    .from('saved_searches')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return mapDbToSavedSearch(data);
}

/**
 * Delete a saved search
 */
export async function deleteSavedSearch(id: string): Promise<void> {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('saved_searches')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) throw error;
}

// Helper to map database row to SavedSearch type
function mapDbToSavedSearch(row: Record<string, unknown>): SavedSearch {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    description: row.description as string | null,
    filters: row.filters as SavedSearch['filters'],
    isActive: row.is_active as boolean,
    notifyOnNew: row.notify_on_new as boolean,
    resultsCount: row.results_count as number | null,
    lastRunAt: row.last_run_at as string | null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

