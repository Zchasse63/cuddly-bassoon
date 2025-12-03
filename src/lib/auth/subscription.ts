/**
 * Subscription Tier Enforcement
 * Check tier limits and enforce feature access
 */

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { SUBSCRIPTION_LIMITS, type SubscriptionTier } from '@/lib/user/types';

export interface TierCheckResult {
  allowed: boolean;
  tier: SubscriptionTier;
  limit: number;
  remaining: number;
  error?: string;
}

export interface FeatureCheckResult {
  allowed: boolean;
  tier: SubscriptionTier;
  requiredTier?: SubscriptionTier;
  error?: string;
}

/**
 * Check if user has remaining API calls
 */
export async function checkApiCallLimit(): Promise<TierCheckResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, tier: 'free', limit: 0, remaining: 0, error: 'Not authenticated' };
  }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('subscription_tier, api_calls_remaining')
    .eq('id', user.id)
    .single();

  if (error || !profile) {
    return { allowed: false, tier: 'free', limit: 0, remaining: 0, error: 'Profile not found' };
  }

  const tier = profile.subscription_tier as SubscriptionTier;
  const limits = SUBSCRIPTION_LIMITS[tier];

  // Enterprise has unlimited
  if (limits.api_calls === -1) {
    return { allowed: true, tier, limit: -1, remaining: -1 };
  }

  return {
    allowed: (profile.api_calls_remaining ?? 0) > 0,
    tier,
    limit: limits.api_calls,
    remaining: profile.api_calls_remaining ?? 0,
  };
}

/**
 * Decrement user's API call count
 */
export async function decrementApiCalls(count: number = 1): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // Check tier first
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier, api_calls_remaining')
    .eq('id', user.id)
    .single();

  if (!profile) return false;

  const tier = profile.subscription_tier as SubscriptionTier;
  const limits = SUBSCRIPTION_LIMITS[tier];

  // Enterprise has unlimited
  if (limits.api_calls === -1) return true;

  // Decrement count
  const { error } = await supabase
    .from('user_profiles')
    .update({ api_calls_remaining: Math.max(0, (profile.api_calls_remaining ?? 0) - count) })
    .eq('id', user.id);

  return !error;
}

/**
 * Check if a feature is available for the user's tier
 */
export async function checkFeatureAccess(
  feature: 'ai_features' | 'team_members' | 'saved_searches'
): Promise<FeatureCheckResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, tier: 'free', error: 'Not authenticated' };
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { allowed: false, tier: 'free', error: 'Profile not found' };
  }

  const tier = profile.subscription_tier as SubscriptionTier;
  const limits = SUBSCRIPTION_LIMITS[tier];

  if (feature === 'ai_features') {
    return {
      allowed: limits.ai_features,
      tier,
      requiredTier: limits.ai_features ? undefined : 'pro',
    };
  }

  return { allowed: true, tier };
}

/**
 * Get upgrade prompt message based on current tier and feature
 */
export function getUpgradePrompt(tier: SubscriptionTier, feature?: string): string {
  if (tier === 'free') {
    return feature === 'ai_features'
      ? 'Upgrade to Pro to access AI-powered features like intelligent property analysis and buyer matching.'
      : 'Upgrade to Pro for more API calls, team members, and advanced features.';
  }
  if (tier === 'pro') {
    return 'Contact sales for Enterprise features including unlimited API calls and custom integrations.';
  }
  return '';
}

/**
 * Reset API calls for a user (admin function for monthly reset)
 */
export async function resetApiCalls(userId: string): Promise<boolean> {
  const supabase = await createAdminClient();

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single();

  if (!profile) return false;

  const tier = profile.subscription_tier as SubscriptionTier;
  const limits = SUBSCRIPTION_LIMITS[tier];

  const { error } = await supabase
    .from('user_profiles')
    .update({
      api_calls_remaining: limits.api_calls === -1 ? 999999 : limits.api_calls,
      api_calls_reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
    })
    .eq('id', userId);

  return !error;
}
