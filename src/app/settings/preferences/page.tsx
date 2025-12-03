import { Suspense } from 'react';
import { Metadata } from 'next';

import { getCurrentUserProfile } from '@/lib/user';
import { PreferencesForm } from './PreferencesForm';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Preferences',
  description: 'Customize your app experience',
};

async function PreferencesContent() {
  const { data: profile, error } = await getCurrentUserProfile();

  if (error || !profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load preferences: {error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>App Preferences</CardTitle>
        <CardDescription>Customize your experience</CardDescription>
      </CardHeader>
      <CardContent>
        <PreferencesForm preferences={profile.preferences} />
      </CardContent>
    </Card>
  );
}

function PreferencesSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function PreferencesPage() {
  return (
    <Suspense fallback={<PreferencesSkeleton />}>
      <PreferencesContent />
    </Suspense>
  );
}
