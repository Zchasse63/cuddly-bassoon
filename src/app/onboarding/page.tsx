import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from './OnboardingWizard';

export const metadata: Metadata = {
  title: 'Welcome - Get Started',
  description: 'Complete your profile and set up your account',
};

export default async function OnboardingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user has completed onboarding (stored in preferences JSON)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('full_name, company_name, preferences')
    .eq('id', user.id)
    .single();

  // Check onboarding_completed in preferences JSON
  const preferences = profile?.preferences as Record<string, unknown> | null;
  if (preferences?.onboarding_completed) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <OnboardingWizard
        userId={user.id}
        email={user.email || ''}
        initialData={{
          fullName: profile?.full_name || '',
          companyName: profile?.company_name || '',
          preferences:
            typeof profile?.preferences === 'object' &&
            profile?.preferences !== null &&
            !Array.isArray(profile?.preferences)
              ? (profile.preferences as Record<string, unknown>)
              : {},
        }}
      />
    </div>
  );
}
