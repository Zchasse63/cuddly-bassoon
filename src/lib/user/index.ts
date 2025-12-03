/**
 * User Management Library Exports
 */

// Types
export type {
  SubscriptionTier,
  SubscriptionStatus,
  TeamRole,
  UserProfile,
  UserPreferencesData,
  UserPreferences,
  NotificationSettings,
  UIPreferences,
  UpdateProfileData,
  Team,
  TeamSettings,
  TeamMember,
  TeamInvitation,
  Permission,
} from './types';

export { PERMISSIONS, SUBSCRIPTION_LIMITS } from './types';

// Profile Service
export {
  getCurrentUserProfile,
  getUserProfileById,
  updateCurrentUserProfile,
  updateUserPreferences,
  getUserSubscriptionTier,
  checkApiUsage,
  type ProfileResult,
} from './profile-service';

// Team Service
export {
  getUserTeams,
  getTeam,
  createTeam,
  getTeamMembers,
  updateMemberRole,
  removeMember,
  createInvitation,
  getTeamInvitations,
  type TeamResult,
} from './team-service';
