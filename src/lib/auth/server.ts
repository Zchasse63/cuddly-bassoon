/**
 * Auth Library Server-Side Exports
 *
 * These functions use server-side Supabase client and should only be
 * imported in Server Components, API routes, or server actions.
 *
 * Usage:
 * import { checkApiCallLimit, checkFeatureAccess } from '@/lib/auth/server';
 * import { checkPermission, getUserRole } from '@/lib/auth/server';
 */

// Subscription tier enforcement (server-side only)
export {
  checkApiCallLimit,
  decrementApiCalls,
  checkFeatureAccess,
  getUpgradePrompt,
  resetApiCalls,
  type TierCheckResult,
  type FeatureCheckResult,
} from './subscription';

// Role-Based Access Control (server-side only)
export {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  getUserRole,
  ROLE_PERMISSIONS,
  type PermissionCheckResult,
} from './rbac';
