import { Suspense } from 'react';
import { Metadata } from 'next';

import { getUserTeams, getTeamMembers, getTeamInvitations } from '@/lib/user';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamManagement } from './TeamManagement';

export const metadata: Metadata = {
  title: 'Team Settings',
  description: 'Manage your team members and invitations',
};

async function TeamContent() {
  const { data: teams, error } = await getUserTeams();

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>Failed to load teams: {error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Get the first team (most users have one team)
  const team = teams && teams.length > 0 ? teams[0] : null;

  let members = null;
  let invitations = null;

  if (team) {
    const [membersResult, invitationsResult] = await Promise.all([
      getTeamMembers(team.id),
      getTeamInvitations(team.id),
    ]);
    members = membersResult.data;
    invitations = invitationsResult.data;
  }

  return <TeamManagement team={team ?? null} members={members} invitations={invitations} />;
}

function TeamSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-1 h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default function TeamSettingsPage() {
  return (
    <Suspense fallback={<TeamSkeleton />}>
      <TeamContent />
    </Suspense>
  );
}
