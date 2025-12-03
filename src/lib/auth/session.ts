/**
 * Session Management Helpers
 * Functions for managing user sessions and authentication state
 */

import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface SessionState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error?: string;
}

/**
 * Get the current session
 */
export async function getSession(): Promise<Session | null> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Get the current user
 */
export async function getUser(): Promise<User | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Refresh the current session
 */
export async function refreshSession(): Promise<Session | null> {
  const supabase = createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.refreshSession();

  if (error) {
    console.error('Failed to refresh session:', error.message);
    return null;
  }

  return session;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser();
  return user !== null;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: Session | null) => void): {
  unsubscribe: () => void;
} {
  const supabase = createClient();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });

  return {
    unsubscribe: () => subscription.unsubscribe(),
  };
}

/**
 * Get user email from session
 */
export function getUserEmail(user: User | null): string | null {
  return user?.email ?? null;
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';

  const fullName = user.user_metadata?.full_name;
  if (fullName) return fullName;

  const email = user.email;
  if (email) return email.split('@')[0] ?? 'User';

  return 'User';
}

/**
 * Get user avatar URL
 */
export function getUserAvatarUrl(user: User | null): string | null {
  if (!user) return null;

  // Check for custom avatar in user_metadata
  const customAvatar = user.user_metadata?.avatar_url;
  if (customAvatar) return customAvatar;

  // Check for OAuth provider avatar
  const identities = user.identities ?? [];
  for (const identity of identities) {
    if (identity.identity_data?.avatar_url) {
      return identity.identity_data.avatar_url;
    }
  }

  return null;
}

/**
 * Check if email is verified
 */
export function isEmailVerified(user: User | null): boolean {
  return user?.email_confirmed_at !== null && user?.email_confirmed_at !== undefined;
}

/**
 * Get session expiry time
 */
export function getSessionExpiry(session: Session | null): Date | null {
  if (!session?.expires_at) return null;
  return new Date(session.expires_at * 1000);
}

/**
 * Check if session is about to expire (within 5 minutes)
 */
export function isSessionExpiringSoon(session: Session | null): boolean {
  const expiry = getSessionExpiry(session);
  if (!expiry) return false;

  const fiveMinutes = 5 * 60 * 1000;
  return expiry.getTime() - Date.now() < fiveMinutes;
}
