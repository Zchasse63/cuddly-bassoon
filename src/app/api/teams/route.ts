import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET user's teams
export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get teams where user is a member
    // Note: Using type assertion as database types need regeneration after migration
    const { data: memberships, error: memberError } = await (supabase as any)
      .from('team_members')
      .select(
        `
        role,
        status,
        joined_at,
        team:teams (
          id,
          name,
          owner_id,
          settings,
          is_active,
          created_at
        )
      `
      )
      .eq('user_id', user.id)
      .eq('status', 'active');

    if (memberError) {
      console.error('Error fetching teams:', memberError);
      return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 });
    }

    // Get teams user owns
    const { data: ownedTeams, error: ownedError } = await (supabase as any)
      .from('teams')
      .select('*')
      .eq('owner_id', user.id);

    if (ownedError) {
      console.error('Error fetching owned teams:', ownedError);
    }

    return NextResponse.json({
      memberships: memberships || [],
      ownedTeams: ownedTeams || [],
    });
  } catch (error) {
    console.error('Teams fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST create new team
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, settings = {} } = body;

    if (!name) {
      return NextResponse.json({ error: 'Team name is required' }, { status: 400 });
    }

    // Create team
    // Note: Using type assertion as database types need regeneration after migration
    const { data: team, error: teamError } = await (supabase as any)
      .from('teams')
      .insert({
        name,
        owner_id: user.id,
        settings,
      })
      .select()
      .single();

    if (teamError) {
      console.error('Error creating team:', teamError);
      return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
    }

    // Add owner as admin member
    const { error: memberError } = await (supabase as any).from('team_members').insert({
      team_id: team.id,
      user_id: user.id,
      role: 'admin',
      status: 'active',
      joined_at: new Date().toISOString(),
    });

    if (memberError) {
      console.error('Error adding owner as member:', memberError);
    }

    // Update user's current team (using type assertion as types need regeneration)
    await (supabase as any)
      .from('user_profiles')
      .update({ current_team_id: team.id })
      .eq('id', user.id);

    return NextResponse.json({ team }, { status: 201 });
  } catch (error) {
    console.error('Team creation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
