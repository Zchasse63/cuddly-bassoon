'use client';

import { Users, UserPlus, Settings, Crown, Shield, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePageContext } from '@/hooks/usePageContext';
import { KPICard, KPICardGrid } from '@/components/ui/kpi-card';
import { Leaderboard } from '@/components/analytics';

// Mock team data - will be replaced with real API data
const mockTeamMembers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    deals: 12,
    revenue: 145000,
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'acquisitions',
    status: 'active',
    deals: 8,
    revenue: 98000,
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike@example.com',
    role: 'dispositions',
    status: 'active',
    deals: 15,
    revenue: 187000,
  },
  {
    id: '4',
    name: 'Emily Chen',
    email: 'emily@example.com',
    role: 'junior_acquisitions',
    status: 'active',
    deals: 5,
    revenue: 42000,
  },
];

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

  const totalDeals = mockTeamMembers.reduce((sum, m) => sum + m.deals, 0);
  const totalRevenue = mockTeamMembers.reduce((sum, m) => sum + m.revenue, 0);
  const avgDealsPerMember = Math.round(totalDeals / mockTeamMembers.length);

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
        <KPICard title="Team Members" value={mockTeamMembers.length.toString()} icon={Users} />
        <KPICard title="Total Deals" value={totalDeals.toString()} icon={Users} />
        <KPICard title="Team Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={Users} />
        <KPICard title="Avg Deals/Member" value={avgDealsPerMember.toString()} icon={Users} />
      </KPICardGrid>

      <div className="grid grid--gap-6 md:grid-cols-2 mt-6">
        {/* Team Leaderboard */}
        <Leaderboard
          title="Team Leaderboard"
          entries={mockTeamMembers.map((m, i) => ({
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
              {mockTeamMembers.map((member) => {
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
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
