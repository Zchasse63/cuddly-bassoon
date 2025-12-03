import { Suspense } from 'react';
import { Metadata } from 'next';
import { Shield, Key, Smartphone, History } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SecurityActions } from './SecurityActions';

export const metadata: Metadata = {
  title: 'Security Settings',
  description: 'Manage your account security settings',
};

async function SecurityContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!user || !session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load security settings</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const lastSignIn = user.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleString()
    : 'Unknown';
  const sessionExpiry = session.expires_at
    ? new Date(session.expires_at * 1000).toLocaleString()
    : 'Unknown';

  return (
    <div className="space-y-6">
      {/* Current Session */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Current Session</CardTitle>
          </div>
          <CardDescription>Your active session information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge variant="default" className="bg-green-500">
              Active
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last Sign In</span>
            <span className="text-sm">{lastSignIn}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Session Expires</span>
            <span className="text-sm">{sessionExpiry}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm">{user.email}</span>
          </div>
        </CardContent>
      </Card>

      {/* Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            <CardTitle>Password</CardTitle>
          </div>
          <CardDescription>Manage your password</CardDescription>
        </CardHeader>
        <CardContent>
          <SecurityActions userId={user.id} email={user.email || ''} />
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smartphone className="h-5 w-5 text-primary" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>Add an extra layer of security</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-muted-foreground">2FA is not enabled</p>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <CardTitle>Recent Activity</CardTitle>
          </div>
          <CardDescription>Your recent account activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Signed in</span>
              <span className="text-muted-foreground">{lastSignIn}</span>
            </div>
            <p className="text-xs text-muted-foreground">Full activity log coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SecuritySkeleton() {
  return (
    <div className="space-y-6">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SecuritySettingsPage() {
  return (
    <Suspense fallback={<SecuritySkeleton />}>
      <SecurityContent />
    </Suspense>
  );
}
