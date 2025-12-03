/**
 * Permission Constants
 * These are safe to use in both client and server components
 */

import { type Permission, type TeamRole } from '@/lib/user/types';

export interface PermissionCheckResult {
  allowed: boolean;
  role?: TeamRole;
  permissions?: Permission[];
  error?: string;
}

/**
 * Default permissions by role
 */
export const ROLE_PERMISSIONS: Record<TeamRole, Permission[]> = {
  owner: [
    'view_properties',
    'manage_buyers',
    'manage_deals',
    'send_messages',
    'view_analytics',
    'manage_team',
    'admin_settings',
  ],
  admin: [
    'view_properties',
    'manage_buyers',
    'manage_deals',
    'send_messages',
    'view_analytics',
    'manage_team',
  ],
  member: ['view_properties', 'manage_buyers', 'manage_deals', 'send_messages'],
};
