/**
 * Auth Client Library
 * Provides authentication helper functions using Supabase Auth
 */

import { createClient } from '@/lib/supabase/client';
import type { User, Session, Provider } from '@supabase/supabase-js';

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: User;
  session?: Session;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  acceptedTerms?: boolean;
}

export interface SignInData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Sign up a new user with email and password
 */
export async function signUp(data: SignUpData): Promise<AuthResult> {
  const supabase = createClient();

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      data: {
        full_name: data.fullName,
        accepted_terms: data.acceptedTerms ?? false,
        accepted_terms_at: data.acceptedTerms ? new Date().toISOString() : null,
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    user: authData.user ?? undefined,
    session: authData.session ?? undefined,
  };
}

/**
 * Sign in with email and password
 */
export async function signIn(data: SignInData): Promise<AuthResult> {
  const supabase = createClient();

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return {
    success: true,
    user: authData.user ?? undefined,
    session: authData.session ?? undefined,
  };
}

/**
 * Sign in with magic link (passwordless)
 */
export async function signInWithMagicLink(email: string, redirectTo?: string): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirectTo ?? '/dashboard'}`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Sign in with OAuth provider (Google, etc.)
 */
export async function signInWithOAuth(
  provider: Provider,
  redirectTo?: string
): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo ?? '/dashboard'}`,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<AuthResult> {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Request password reset email
 */
export async function requestPasswordReset(email: string): Promise<AuthResult> {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update user password (for authenticated users or after reset)
 */
export async function updatePassword(newPassword: string): Promise<AuthResult> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user ?? undefined };
}
