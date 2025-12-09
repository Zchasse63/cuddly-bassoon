'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, Settings, Crown, Shield, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePageContext } from '@/hooks/usePageContext';
import { KPICard, KPICardGrid } from '@/components/ui/kpi-card';
import { Leaderboard } from '@/components/analytics';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  deals: number;
  revenue: number;
}

interface TeamData {
  memberships: Array<{
    role: string;
    status: string;
    joined_at: string;
    team: {
      id: string;
      name: string;
      owner_id: string;
    };
  }>;
  ownedTeams: Array<{
    id: string;
    name: string;
    owner_id: string;
  }>;
}

const roleIcons: Record<string, typeof Crown> = {
  admin: Crown,
  manager: Shield,
  acquisitions: User,
  dispositions: User,
  junior_acquisitions: User,
  member: User,
};

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  manager: 'Manager',
  acquisitions: 'Acquisitions',
  dispositions: 'Dispositions',
  junior_acquisitions: 'Jr. Acquisitions',
  member: 'Member',
};

export default function TeamPage() {
  usePageContext('team');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await fetch('/api/teams');
        if (!response.ok) {
          throw new Error('Failed to fetch team data');
        }
        const data: TeamData = await response.json();

        // Transform memberships into team members format
        // Note: In a full implementation, we'd fetch member details from a separate endpoint
        const members: TeamMember[] = data.memberships.map((m, index) => ({
          id: `member-${index}`,
          name: `Team Member ${index + 1}`,
          email: '',
          role: m.role,
          status: m.status,
          deals: 0,
          revenue: 0,
        }));
        setTeamMembers(members);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team data');
      } finally {
        setLoading(false);
      }
    };
    fetchTeamData();
  }, []);

  const totalDeals = teamMembers.reduce((sum, m) => sum + m.deals, 0);
  const totalRevenue = teamMembers.reduce((sum, m) => sum + m.revenue, 0);
  const avgDealsPerMember =
    teamMembers.length > 0 ? Math.round(totalDeals / teamMembers.length) : 0;

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="page-description">Manage your team and track performance</p>
        </div>
        <Button
          onClick={() => {
            /* TODO: Invite modal */
          }}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Team KPIs */}
      <KPICardGrid columns={4}>
        <KPICard title="Team Members" value={teamMembers.length.toString()} icon={Users} />
        <KPICard title="Total Deals" value={totalDeals.toString()} icon={Users} />
        <KPICard title="Team Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={Users} />
        <KPICard title="Avg Deals/Member" value={avgDealsPerMember.toString()} icon={Users} />
      </KPICardGrid>

      <div className="grid grid--gap-6 md:grid-cols-2 mt-6">
        {/* Team Leaderboard */}
        <Leaderboard
          title="Team Leaderboard"
          entries={teamMembers.map((m, i) => ({
            id: m.id,
            name: m.name,
            avatar: undefined,
            value: m.revenue,
            rank: i + 1,
          }))}
          valueLabel="Revenue"
          formatValue={(v) => `$${v.toLocaleString()}`}
        />

        {/* Team Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Active team members and their roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="team-members-list">
              {teamMembers.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No team members yet. Invite someone to get started!
                </p>
              ) : (
                teamMembers.map((member) => {
                  const RoleIcon = roleIcons[member.role] || User;
                  return (
                    <div key={member.id} className="team-member">
                      <div className="team-member__info">
                        <div className="team-member__avatar">
                          {member.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="team-member__name">{member.name}</p>
                          <p className="team-member__email">{member.email}</p>
                        </div>
                      </div>
                      <div className="team-member__actions">
                        <span className="team-member__role-badge">
                          <RoleIcon className="h-3 w-3" />
                          {roleLabels[member.role]}
                        </span>
                        <Button variant="ghost" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
