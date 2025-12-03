/**
 * Role-Based Access Control (RBAC)
 * Permission checking and role management
 *
 * NOTE: This file uses server-side Supabase client.
 * Only import in Server Components, API routes, or server actions.
 */

import { createClient } from '@/lib/supabase/server';
import { type Permission, type TeamRole } from '@/lib/user/types';
import { ROLE_PERMISSIONS, type PermissionCheckResult } from './permissions';

// Re-export for convenience
export { ROLE_PERMISSIONS, type PermissionCheckResult };

/**
 * Check if user has a specific permission
 */
export async function checkPermission(permission: Permission): Promise<PermissionCheckResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, error: 'Not authenticated' };
  }

  // Get user's team membership
  const { data: membership } = await supabase
    .from('team_members')
    .select('role, permissions')
    .eq('user_id', user.id)
    .maybeSingle();

  // If no team membership, check if user is a team owner
  if (!membership) {
    const { data: ownedTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle();

    if (ownedTeam) {
      // Owner has all permissions
      return {
        allowed: true,
        role: 'owner',
        permissions: ROLE_PERMISSIONS.owner,
      };
    }

    // Solo user - grant basic permissions
    return {
      allowed: ['view_properties', 'manage_buyers', 'manage_deals', 'send_messages'].includes(
        permission
      ),
      role: 'member',
      permissions: ['view_properties', 'manage_buyers', 'manage_deals', 'send_messages'],
    };
  }

  const role = membership.role as TeamRole;
  const permissions = (membership.permissions as Permission[]) || ROLE_PERMISSIONS[role];

  return {
    allowed: permissions.includes(permission),
    role,
    permissions,
  };
}

/**
 * Check if user has any of the specified permissions
 */
export async function checkAnyPermission(
  permissions: Permission[]
): Promise<PermissionCheckResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, error: 'Not authenticated' };
  }

  const { data: membership } = await supabase
    .from('team_members')
    .select('role, permissions')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    // Solo user
    const userPerms: Permission[] = [
      'view_properties',
      'manage_buyers',
      'manage_deals',
      'send_messages',
    ];
    return {
      allowed: permissions.some((p) => userPerms.includes(p)),
      role: 'member',
      permissions: userPerms,
    };
  }

  const role = membership.role as TeamRole;
  const userPerms = (membership.permissions as Permission[]) || ROLE_PERMISSIONS[role];

  return {
    allowed: permissions.some((p) => userPerms.includes(p)),
    role,
    permissions: userPerms,
  };
}

/**
 * Check if user has all of the specified permissions
 */
export async function checkAllPermissions(
  permissions: Permission[]
): Promise<PermissionCheckResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { allowed: false, error: 'Not authenticated' };
  }

  const { data: membership } = await supabase
    .from('team_members')
    .select('role, permissions')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!membership) {
    const userPerms: Permission[] = [
      'view_properties',
      'manage_buyers',
      'manage_deals',
      'send_messages',
    ];
    return {
      allowed: permissions.every((p) => userPerms.includes(p)),
      role: 'member',
      permissions: userPerms,
    };
  }

  const role = membership.role as TeamRole;
  const userPerms = (membership.permissions as Permission[]) || ROLE_PERMISSIONS[role];

  return {
    allowed: permissions.every((p) => userPerms.includes(p)),
    role,
    permissions: userPerms,
  };
}

/**
 * Get user's current role
 */
export async function getUserRole(): Promise<{ role: TeamRole | null; error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { role: null, error: 'Not authenticated' };
  }

  const { data: membership } = await supabase
    .from('team_members')
    .select('role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (membership) {
    return { role: membership.role as TeamRole };
  }

  // Check if owner
  const { data: ownedTeam } = await supabase
    .from('teams')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  return { role: ownedTeam ? 'owner' : 'member' };
}
