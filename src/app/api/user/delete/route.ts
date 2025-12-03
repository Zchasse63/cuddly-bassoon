import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/user/delete
 * Schedule account for deletion (soft delete with 30-day grace period)
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Mark account for deletion with 30-day grace period
    const deletionDate = new Date();
    deletionDate.setDate(deletionDate.getDate() + 30);

    // Get current preferences
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('preferences')
      .eq('id', user.id)
      .single();

    const currentPreferences =
      typeof profile?.preferences === 'object' &&
      profile?.preferences !== null &&
      !Array.isArray(profile?.preferences)
        ? (profile.preferences as Record<string, unknown>)
        : {};

    const { error } = await supabase
      .from('user_profiles')
      .update({
        preferences: {
          ...currentPreferences,
          scheduled_deletion_at: deletionDate.toISOString(),
          is_active: false,
        },
      })
      .eq('id', user.id);

    if (error) {
      console.error('Delete account error:', error);
      return NextResponse.json({ error: 'Failed to schedule deletion' }, { status: 500 });
    }

    // TODO: Send confirmation email about account deletion
    // TODO: Cancel any active subscriptions

    return NextResponse.json({
      message: 'Account scheduled for deletion',
      deletion_date: deletionDate.toISOString(),
    });
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
