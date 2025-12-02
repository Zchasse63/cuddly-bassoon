# Phase 10: User Management

---

**Phase Number:** 10 of 12  
**Duration:** 1 Week  
**Dependencies:** [Phase 1: Foundation](./PHASE_01_Foundation_2025-12-02.md), [Phase 2: Database Schema](./PHASE_02_Database_Schema_2025-12-02.md)  
**Status:** Not Started  
**Start Date:** TBD  
**Target Completion:** TBD  

---

## Overview

Implement complete user management using Supabase Auth including authentication, authorization, user profiles, subscription tiers, team management, and usage tracking. This phase establishes the multi-tenant foundation for the platform.

---

## Objectives

1. Configure Supabase Auth with multiple providers
2. Build authentication flows (signup, login, password reset)
3. Create user profile management
4. Implement subscription tier system
5. Build team/organization management
6. Create role-based access control
7. Implement usage tracking and limits

---

## Subscription Tiers Reference

| Tier | Price | API Calls | Features |
|------|-------|-----------|----------|
| Free | $0 | 100/month | Basic search, 5 saved searches |
| Pro | $99/mo | 5,000/month | All filters, unlimited saves, AI chat |
| Enterprise | Custom | Unlimited | Team features, API access, priority support |

---

## Task Hierarchy

### 1. Supabase Auth Configuration
- [ ] **1.1 Enable Auth Providers**
  - [ ] Email/password authentication
  - [ ] Magic link (passwordless)
  - [ ] Google OAuth
  - [ ] Configure redirect URLs
  - [ ] Set up email templates

- [ ] **1.2 Auth Settings**
  - [ ] Configure password requirements
  - [ ] Set session duration
  - [ ] Enable email confirmation
  - [ ] Configure rate limiting

- [ ] **1.3 Auth Client Setup**
  - [ ] Create lib/auth/client.ts
  - [ ] Initialize Supabase client
  - [ ] Create auth helper functions
  - [ ] Handle session management

---

### 2. Authentication Flows
- [ ] **2.1 Sign Up Flow**
  - [ ] Create app/auth/signup/page.tsx
  - [ ] Email and password form
  - [ ] Password strength indicator
  - [ ] Terms acceptance checkbox
  - [ ] Email verification handling
  - [ ] Redirect to onboarding

- [ ] **2.2 Login Flow**
  - [ ] Create app/auth/login/page.tsx
  - [ ] Email/password login
  - [ ] Magic link option
  - [ ] Google OAuth button
  - [ ] Remember me option
  - [ ] Redirect to dashboard

- [ ] **2.3 Password Reset**
  - [ ] Create app/auth/reset-password/page.tsx
  - [ ] Request reset email
  - [ ] Reset password form
  - [ ] Success confirmation

- [ ] **2.4 Logout**
  - [ ] Logout button component
  - [ ] Clear session
  - [ ] Redirect to login

- [ ] **2.5 Auth Middleware**
  - [ ] Create middleware.ts
  - [ ] Protect authenticated routes
  - [ ] Redirect unauthenticated users
  - [ ] Handle session refresh

---

### 3. User Profiles
- [ ] **3.1 Profile Creation**
  - [ ] Create profile on signup (trigger)
  - [ ] Link to auth.users
  - [ ] Set default subscription tier
  - [ ] Initialize preferences

- [ ] **3.2 Profile Page**
  - [ ] Create app/settings/profile/page.tsx
  - [ ] Display user info
  - [ ] Edit name, company, phone
  - [ ] Upload avatar
  - [ ] Change email (with verification)

- [ ] **3.3 Profile API**
  - [ ] GET /api/user/profile
  - [ ] PATCH /api/user/profile
  - [ ] Handle avatar upload

- [ ] **3.4 User Preferences**
  - [ ] Create app/settings/preferences/page.tsx
  - [ ] Default markets
  - [ ] Default filters
  - [ ] Notification settings
  - [ ] UI preferences (theme, etc.)

---

### 4. Subscription Management
- [ ] **4.1 Subscription Display**
  - [ ] Create app/settings/subscription/page.tsx
  - [ ] Show current tier
  - [ ] Show usage vs limits
  - [ ] Show renewal date
  - [ ] Upgrade/downgrade options

- [ ] **4.2 Tier Enforcement**
  - [ ] Create lib/auth/subscription.ts
  - [ ] Check tier on API calls
  - [ ] Enforce feature limits
  - [ ] Return appropriate errors
  - [ ] Show upgrade prompts

- [ ] **4.3 Usage Tracking**
  - [ ] Track API calls per user
  - [ ] Track by feature type
  - [ ] Reset counters monthly
  - [ ] Store in user_profiles

- [ ] **4.4 Upgrade Flow (Placeholder)**
  - [ ] Upgrade button
  - [ ] Plan comparison
  - [ ] (Payment integration future phase)

---

### 5. Team Management
- [ ] **5.1 Team Model**
  - [ ] Create teams table
  - [ ] Create team_members table
  - [ ] Define roles (owner, admin, member)
  - [ ] Link users to teams

- [ ] **5.2 Team Creation**
  - [ ] Create team form
  - [ ] Set team name
  - [ ] Creator becomes owner
  - [ ] Generate invite link

- [ ] **5.3 Team Invitations**
  - [ ] Create team_invitations table
  - [ ] Send invite email
  - [ ] Accept/decline invite
  - [ ] Expire old invites

- [ ] **5.4 Team Management UI**
  - [ ] Create app/settings/team/page.tsx
  - [ ] List team members
  - [ ] Invite new members
  - [ ] Change member roles
  - [ ] Remove members

- [ ] **5.5 Team API**
  - [ ] POST /api/teams (create)
  - [ ] GET /api/teams (list user's teams)
  - [ ] GET /api/teams/[id] (detail)
  - [ ] POST /api/teams/[id]/invite
  - [ ] DELETE /api/teams/[id]/members/[userId]

---

### 6. Role-Based Access Control
- [ ] **6.1 Define Permissions**
  - [ ] Create lib/auth/permissions.ts
  - [ ] Define permission types:
    - [ ] view_properties
    - [ ] manage_buyers
    - [ ] manage_deals
    - [ ] send_messages
    - [ ] view_analytics
    - [ ] manage_team
    - [ ] admin_settings
  - [ ] Map roles to permissions

- [ ] **6.2 Permission Checking**
  - [ ] Create hasPermission(user, permission) function
  - [ ] Check in API routes
  - [ ] Check in UI components
  - [ ] Handle unauthorized access

- [ ] **6.3 Role Assignment**
  - [ ] Assign roles to team members
  - [ ] Owner has all permissions
  - [ ] Admin has most permissions
  - [ ] Member has limited permissions

---

### 7. Onboarding Flow
- [ ] **7.1 Onboarding Steps**
  - [ ] Create app/onboarding/page.tsx
  - [ ] Step 1: Complete profile
  - [ ] Step 2: Set default markets
  - [ ] Step 3: Import buyers (optional)
  - [ ] Step 4: Quick tour
  - [ ] Mark onboarding complete

- [ ] **7.2 Onboarding Progress**
  - [ ] Track completed steps
  - [ ] Allow skip
  - [ ] Resume where left off
  - [ ] Show progress indicator

- [ ] **7.3 Welcome Email**
  - [ ] Send on signup
  - [ ] Include getting started tips
  - [ ] Link to documentation

---

### 8. Security Features
- [ ] **8.1 Session Management**
  - [ ] View active sessions
  - [ ] Revoke sessions
  - [ ] Session timeout settings

- [ ] **8.2 Two-Factor Authentication (Optional)**
  - [ ] Enable 2FA option
  - [ ] TOTP setup
  - [ ] Backup codes
  - [ ] 2FA verification on login

- [ ] **8.3 Audit Logging**
  - [ ] Log authentication events
  - [ ] Log permission changes
  - [ ] Log sensitive actions
  - [ ] Retention policy

---

### 9. Settings Pages
- [ ] **9.1 Settings Layout**
  - [ ] Create app/settings/layout.tsx
  - [ ] Settings navigation sidebar
  - [ ] Sections: Profile, Preferences, Subscription, Team, Security

- [ ] **9.2 Account Deletion**
  - [ ] Delete account option
  - [ ] Confirmation flow
  - [ ] Data export before deletion
  - [ ] Soft delete with grace period

---

## Success Criteria

- [ ] All auth flows working (signup, login, reset)
- [ ] User profiles editable
- [ ] Subscription tiers enforced
- [ ] Team creation and management functional
- [ ] RBAC preventing unauthorized access
- [ ] Onboarding flow complete
- [ ] RLS policies protecting user data

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Auth security vulnerabilities | Low | Critical | Use Supabase Auth, follow best practices |
| RLS policy gaps | Medium | High | Thorough testing, security review |
| Session management issues | Low | Medium | Proper token handling |

---

## Related Phases

- **Previous Phase:** [Phase 9: Communication Automation](./PHASE_09_Communication_2025-12-02.md)
- **Next Phase:** [Phase 11: Analytics & Reporting](./PHASE_11_Analytics_2025-12-02.md)
- **Dependent Phases:** All phases use auth context

---

## Phase Completion Summary

> **Template - Complete after phase is finished**

### Completed Successfully
- [ ] Item 1

### Deferred or Blocked
- [ ] Item (Reason: )

### Lessons Learned
- 

### Recommendations for Next Phase
- 

---

**Phase Document Version:** 1.0  
**Last Updated:** 2025-12-02

