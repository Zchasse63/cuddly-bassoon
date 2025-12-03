/**
 * User Management Types
 */

export type SubscriptionTier = 'free' | 'pro' | 'enterprise';
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';
export type TeamRole = 'owner' | 'admin' | 'member';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus;
  api_calls_remaining: number;
  api_calls_reset_date: string | null;
  preferences: UserPreferencesData;
  created_at: string;
  updated_at: string;
}

export interface UserPreferencesData {
  theme?: 'light' | 'dark' | 'system';
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
    deals?: boolean;
    buyers?: boolean;
    weekly_digest?: boolean;
  };
  default_view?: 'list' | 'grid' | 'map';
  timezone?: string;
  date_format?: string;
  currency?: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  default_markets: string[];
  default_filters: Record<string, unknown>;
  notification_settings: NotificationSettings;
  ui_preferences: UIPreferences;
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  deal_alerts: boolean;
  buyer_alerts: boolean;
  weekly_digest: boolean;
}

export interface UIPreferences {
  theme: 'light' | 'dark' | 'system';
  sidebar_collapsed: boolean;
  default_view: 'list' | 'grid' | 'map';
  items_per_page: number;
}

export interface UpdateProfileData {
  full_name?: string;
  company_name?: string;
  phone?: string;
  preferences?: Partial<UserPreferencesData>;
}

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  is_active: boolean | null;
  lead_assignment_mode: string | null;
  territory_mode: string | null;
  monthly_report_day: number | null;
  weekly_report_recipients: unknown | null;
  settings: TeamSettings | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TeamSettings {
  default_permissions: string[];
  invite_restriction: 'owner' | 'admin' | 'member';
  data_sharing: boolean;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  permissions: unknown | null;
  invited_by: string | null;
  invited_at: string | null;
  joined_at: string | null;
  status: string | null;
  territories: unknown | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  email: string;
  role: TeamRole;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
}

// Permission constants
export const PERMISSIONS = {
  VIEW_PROPERTIES: 'view_properties',
  MANAGE_BUYERS: 'manage_buyers',
  MANAGE_DEALS: 'manage_deals',
  SEND_MESSAGES: 'send_messages',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_TEAM: 'manage_team',
  ADMIN_SETTINGS: 'admin_settings',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// Subscription tier limits
export const SUBSCRIPTION_LIMITS = {
  free: {
    api_calls: 100,
    team_members: 1,
    saved_searches: 3,
    ai_features: false,
  },
  pro: {
    api_calls: 5000,
    team_members: 5,
    saved_searches: 25,
    ai_features: true,
  },
  enterprise: {
    api_calls: -1, // unlimited
    team_members: -1, // unlimited
    saved_searches: -1, // unlimited
    ai_features: true,
  },
} as const;
