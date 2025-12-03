/**
 * Team Management Service
 */

import { createClient } from '@/lib/supabase/server';
import type { Team, TeamMember, TeamInvitation } from './types';

export interface TeamResult<T> {
  data: T | null;
  error: string | null;
}

/**
 * Get user's teams
 */
export async function getUserTeams(): Promise<TeamResult<Team[]>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return { data: null, error: error.message };
  return { data: data as Team[], error: null };
}

/**
 * Get a specific team
 */
export async function getTeam(teamId: string): Promise<TeamResult<Team>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('teams').select('*').eq('id', teamId).single();

  if (error) return { data: null, error: error.message };
  return { data: data as Team, error: null };
}

/**
 * Create a new team
 */
export async function createTeam(name: string): Promise<TeamResult<Team>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  // Create team
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({ name, owner_id: user.id })
    .select()
    .single();

  if (teamError) return { data: null, error: teamError.message };

  // Add creator as owner
  const { error: memberError } = await supabase.from('team_members').insert({
    team_id: team.id,
    user_id: user.id,
    role: 'owner',
    permissions: JSON.stringify([
      'view_properties',
      'manage_buyers',
      'manage_deals',
      'send_messages',
      'view_analytics',
      'manage_team',
      'admin_settings',
    ]),
    joined_at: new Date().toISOString(),
    status: 'active',
  });

  if (memberError) return { data: null, error: memberError.message };
  return { data: team as Team, error: null };
}

/**
 * Get team members
 */
export async function getTeamMembers(teamId: string): Promise<TeamResult<TeamMember[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: true });

  if (error) return { data: null, error: error.message };
  return { data: data as TeamMember[], error: null };
}

/**
 * Update team member role
 */
export async function updateMemberRole(
  teamId: string,
  userId: string,
  role: string
): Promise<TeamResult<TeamMember>> {
  const supabase = await createClient();

  const permissions =
    role === 'admin'
      ? JSON.stringify([
          'view_properties',
          'manage_buyers',
          'manage_deals',
          'send_messages',
          'view_analytics',
          'manage_team',
        ])
      : JSON.stringify(['view_properties', 'manage_buyers', 'manage_deals', 'send_messages']);

  const { data, error } = await supabase
    .from('team_members')
    .update({ role, permissions })
    .eq('team_id', teamId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) return { data: null, error: error.message };
  return { data: data as TeamMember, error: null };
}

/**
 * Remove team member
 */
export async function removeMember(teamId: string, userId: string): Promise<TeamResult<boolean>> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('team_id', teamId)
    .eq('user_id', userId);

  if (error) return { data: null, error: error.message };
  return { data: true, error: null };
}

/**
 * Create team invitation
 * Note: Uses team_members table with status='invited' since team_invitations table doesn't exist
 */
export async function createInvitation(
  teamId: string,
  email: string,
  role: 'admin' | 'member' = 'member'
): Promise<TeamResult<TeamInvitation>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { data: null, error: 'Not authenticated' };

  // Create a placeholder user_id for the invitation (will be updated when accepted)
  const placeholderUserId = crypto.randomUUID();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 day expiry

  const { data, error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      user_id: placeholderUserId,
      role,
      status: 'invited',
      invited_by: user.id,
      invited_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) return { data: null, error: error.message };

  // Return as TeamInvitation format
  const invitation: TeamInvitation = {
    id: data.id,
    team_id: data.team_id,
    email, // Store email separately (not in DB)
    role: data.role as 'owner' | 'admin' | 'member',
    invited_by: data.invited_by || '',
    expires_at: expiresAt.toISOString(),
    accepted_at: null,
    created_at: data.created_at || new Date().toISOString(),
  };
  return { data: invitation, error: null };
}

/**
 * Get pending invitations for a team
 * Note: Uses team_members table with status='invited' since team_invitations table doesn't exist
 */
export async function getTeamInvitations(teamId: string): Promise<TeamResult<TeamInvitation[]>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('team_id', teamId)
    .eq('status', 'invited');

  if (error) return { data: null, error: error.message };

  // Convert to TeamInvitation format
  const invitations: TeamInvitation[] = (data || []).map((m) => ({
    id: m.id,
    team_id: m.team_id,
    email: '', // Email not stored in team_members
    role: m.role as 'owner' | 'admin' | 'member',
    invited_by: m.invited_by || '',
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    accepted_at: m.joined_at,
    created_at: m.created_at || new Date().toISOString(),
  }));
  return { data: invitations, error: null };
}
