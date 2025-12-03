import { NextRequest, NextResponse } from 'next/server';

import { createInvitation, getTeam, getTeamMembers } from '@/lib/user';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/teams/[teamId]/invite
 * Create a team invitation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is owner or admin of the team
    const { data: team } = await getTeam(teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    const { data: members } = await getTeamMembers(teamId);
    const currentMember = members?.find((m) => m.user_id === user.id);

    if (!currentMember || (currentMember.role !== 'owner' && currentMember.role !== 'admin')) {
      return NextResponse.json({ error: 'Not authorized to invite members' }, { status: 403 });
    }

    const body = await request.json();
    const { email, role = 'member' } = body;

    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (role !== 'admin' && role !== 'member') {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const { data, error } = await createInvitation(teamId, email.trim(), role);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    // TODO: Send invitation email

    return NextResponse.json({ invitation: data }, { status: 201 });
  } catch (error) {
    console.error('Create invitation error:', error);
    return NextResponse.json({ error: 'Failed to create invitation' }, { status: 500 });
  }
}
