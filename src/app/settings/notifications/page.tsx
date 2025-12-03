import { Suspense } from 'react';
import { Metadata } from 'next';

import { getCurrentUserProfile } from '@/lib/user';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NotificationsForm } from './NotificationsForm';

export const metadata: Metadata = {
  title: 'Notification Settings',
  description: 'Manage your notification preferences',
};

async function NotificationsContent() {
  const { data: profile, error } = await getCurrentUserProfile();

  if (error || !profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load notification settings: {error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const defaultNotifications = {
    email_new_properties: true,
    email_buyer_matches: true,
    email_deal_updates: true,
    email_team_activity: false,
    email_marketing: false,
    push_enabled: false,
  };

  const rawNotifications = profile.preferences?.notifications;
  const notifications =
    typeof rawNotifications === 'object' &&
    rawNotifications !== null &&
    !Array.isArray(rawNotifications)
      ? { ...defaultNotifications, ...(rawNotifications as Record<string, boolean>) }
      : defaultNotifications;

  return <NotificationsForm initialData={notifications} />;
}

function NotificationsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-6 w-10" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function NotificationsSettingsPage() {
  return (
    <Suspense fallback={<NotificationsSkeleton />}>
      <NotificationsContent />
    </Suspense>
  );
}
