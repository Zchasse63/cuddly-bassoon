/**
 * User Profile Service
 * Server-side functions for managing user profiles
 */

import { createClient, createAdminClient } from '@/lib/supabase/server';
import type { UserProfile, UpdateProfileData, UserPreferencesData } from './types';

export interface ProfileResult<T> {
  data: T | null;
  error: string | null;
}

/**
 * Get the current user's profile
 */
export async function getCurrentUserProfile(): Promise<ProfileResult<UserProfile>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as UserProfile, error: null };
}

/**
 * Get a user profile by ID (admin only)
 */
export async function getUserProfileById(userId: string): Promise<ProfileResult<UserProfile>> {
  const supabase = await createAdminClient();

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as UserProfile, error: null };
}

/**
 * Update the current user's profile
 */
export async function updateCurrentUserProfile(
  updates: UpdateProfileData
): Promise<ProfileResult<UserProfile>> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  // If updating preferences, merge with existing
  const updateData: Record<string, unknown> = { ...updates };

  if (updates.preferences) {
    const { data: existing } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();

    updateData.preferences = {
      ...((existing?.preferences as UserPreferencesData) ?? {}),
      ...updates.preferences,
    };
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: data as UserProfile, error: null };
}

/**
 * Update user preferences
 */
export async function updateUserPreferences(
  preferences: Partial<UserPreferencesData>
): Promise<ProfileResult<UserProfile>> {
  return updateCurrentUserProfile({ preferences });
}

/**
 * Get user's subscription tier
 */
export async function getUserSubscriptionTier(): Promise<
  ProfileResult<{ tier: string; status: string }>
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', user.id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return {
    data: {
      tier: data.subscription_tier ?? 'free',
      status: data.subscription_status ?? 'active',
    },
    error: null,
  };
}

/**
 * Check API usage and remaining calls
 */
export async function checkApiUsage(): Promise<
  ProfileResult<{ remaining: number; resetDate: string | null }>
> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { data: null, error: 'Not authenticated' };
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('api_calls_remaining, api_calls_reset_date')
    .eq('id', user.id)
    .single();

  if (error) {
    return { data: null, error: error.message };
  }

  return {
    data: {
      remaining: data.api_calls_remaining ?? 0,
      resetDate: data.api_calls_reset_date,
    },
    error: null,
  };
}
