import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUserProfile, updateCurrentUserProfile } from '@/lib/user';

/**
 * GET /api/user/profile
 * Get the current user's profile
 */
export async function GET() {
  const { data, error } = await getCurrentUserProfile();

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  return NextResponse.json({ profile: data });
}

/**
 * PATCH /api/user/profile
 * Update the current user's profile
 */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate input - onboarding_completed goes into preferences JSON
    const allowedFields = ['full_name', 'company_name', 'phone', 'preferences'];
    const updates: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    }

    // Handle onboarding_completed by storing it in preferences
    if (body.onboarding_completed !== undefined) {
      updates.preferences = {
        ...((updates.preferences as Record<string, unknown>) || {}),
        onboarding_completed: body.onboarding_completed,
      };
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await updateCurrentUserProfile(updates);

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ profile: data });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
