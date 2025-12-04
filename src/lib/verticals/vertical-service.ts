/**
 * Vertical Service
 * Manages user vertical preferences and vertical-specific configurations
 */

import { createClient } from '@/lib/supabase/server';
import { BusinessVertical, VERTICAL_CONFIGS, getVerticalConfig } from './types';

// ============================================
// User Vertical Management
// ============================================

/**
 * Get the user's active vertical.
 */
export async function getUserVertical(userId: string): Promise<BusinessVertical> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('user_verticals')
    .select('active_vertical')
    .eq('user_id', userId)
    .single();

  return (data?.active_vertical as BusinessVertical) || 'wholesaling';
}

/**
 * Set the user's active vertical.
 */
export async function setUserVertical(
  userId: string,
  vertical: BusinessVertical
): Promise<void> {
  const supabase = await createClient();

  await supabase.from('user_verticals').upsert(
    {
      user_id: userId,
      active_vertical: vertical,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
    }
  );
}

/**
 * Get the user's enabled verticals.
 */
export async function getUserEnabledVerticals(userId: string): Promise<BusinessVertical[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('user_verticals')
    .select('enabled_verticals')
    .eq('user_id', userId)
    .single();

  return (data?.enabled_verticals as BusinessVertical[]) || ['wholesaling'];
}

/**
 * Set the user's enabled verticals.
 */
export async function setUserEnabledVerticals(
  userId: string,
  verticals: BusinessVertical[]
): Promise<void> {
  const supabase = await createClient();

  await supabase.from('user_verticals').upsert(
    {
      user_id: userId,
      enabled_verticals: verticals,
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: 'user_id',
    }
  );
}

// ============================================
// Vertical Configuration Helpers
// ============================================

/**
 * Get the default filters for a vertical.
 */
export function getDefaultFiltersForVertical(vertical: BusinessVertical): string[] {
  const config = getVerticalConfig(vertical);
  return config.defaultFilters;
}

/**
 * Get the primary columns for a vertical.
 */
export function getPrimaryColumnsForVertical(vertical: BusinessVertical): string[] {
  const config = getVerticalConfig(vertical);
  return config.primaryColumns;
}

/**
 * Get the heat map layers for a vertical.
 */
export function getHeatMapLayersForVertical(vertical: BusinessVertical): string[] {
  const config = getVerticalConfig(vertical);
  return config.heatMapLayers;
}

/**
 * Get the AI system prompt addition for a vertical.
 */
export function getAIPromptForVertical(vertical: BusinessVertical): string {
  const config = getVerticalConfig(vertical);
  return config.aiSystemPromptAddition;
}

/**
 * Get all available verticals.
 */
export function getAllVerticals() {
  return Object.values(VERTICAL_CONFIGS);
}

// ============================================
// Filter Helpers (to be expanded in Phase 6)
// ============================================

/**
 * Get filters available for a vertical.
 * This will be expanded when filter definitions are created.
 */
export function getFiltersForVertical(vertical: BusinessVertical): string[] {
  const config = getVerticalConfig(vertical);

  if (vertical === 'wholesaling') {
    // Wholesaling gets all standard + enhanced + contrarian + shovels filters
    // This will be expanded when filter definitions are created
    return config.defaultFilters;
  }

  // Home services verticals get their specific filters
  return config.defaultFilters;
}

