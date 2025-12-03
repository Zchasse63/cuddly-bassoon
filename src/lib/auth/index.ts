/**
 * Auth Library Exports (Client-safe)
 *
 * Usage:
 * import { signIn, signUp, signOut } from '@/lib/auth';
 * import { getSession, getUser, isAuthenticated } from '@/lib/auth';
 * import { validatePassword, getStrengthLabel } from '@/lib/auth';
 *
 * For server-side only functions (RBAC, subscription checks):
 * import { checkPermission, checkApiCallLimit } from '@/lib/auth/server';
 */

// Client-side auth functions
export {
  signUp,
  signIn,
  signInWithMagicLink,
  signInWithOAuth,
  signOut,
  requestPasswordReset,
  updatePassword,
  type AuthResult,
  type SignUpData,
  type SignInData,
} from './client';

// Session management
export {
  getSession,
  getUser,
  refreshSession,
  isAuthenticated,
  onAuthStateChange,
  getUserEmail,
  getUserDisplayName,
  getUserAvatarUrl,
  isEmailVerified,
  getSessionExpiry,
  isSessionExpiringSoon,
  type SessionState,
} from './session';

// Password utilities
export {
  validatePassword,
  getStrengthLabel,
  getStrengthColor,
  doPasswordsMatch,
  generateSecurePassword,
  type PasswordValidation,
  type PasswordRequirement,
} from './password';

// Re-export types only from server modules (types are safe for client)
export type { TierCheckResult, FeatureCheckResult } from './subscription';

// Permission constants (safe for client)
export { ROLE_PERMISSIONS, type PermissionCheckResult } from './permissions';
