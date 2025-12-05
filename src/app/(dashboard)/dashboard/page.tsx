'use client';

import { usePageContext } from '@/hooks/usePageContext';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { useActivities, usePipelineSummary } from '@/hooks/use-activities';
import { KPICard, KPICardGrid } from '@/components/ui/kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DealPipelineFunnel,
  ActivityFeed,
  ActivityFeedSkeleton,
  PipelineSummary,
  PipelineSummarySkeleton,
  QuickActions,
} from '@/components/analytics';
import { DailyBriefingCard, StaleDealsAlert } from '@/components/ai/ProactiveInsights';
import {
  Users,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Search,
  Plus,
  BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  // Set page context for AI awareness
  usePageContext('dashboard');
  const router = useRouter();

  // Fetch real dashboard data
  const { data, isLoading } = useDashboardData(7);
  const { data: activitiesData, isLoading: activitiesLoading } = useActivities(8);
  const { data: pipelineData, isLoading: pipelineLoading } = usePipelineSummary();

  const summary = data?.summary;
  const deals = data?.deals;
  const buyers = data?.buyers;

  // Quick actions configuration
  const quickActions = [
    {
      id: 'new-deal',
      label: 'New Deal',
      description: 'Create a new deal',
      icon: Plus,
      href: '/deals/new',
      variant: 'primary' as const,
    },
    {
      id: 'search-properties',
      label: 'Search Properties',
      description: 'Find investment properties',
      icon: Search,
      href: '/properties',
    },
    {
      id: 'view-buyers',
      label: 'View Buyers',
      description: 'Manage your buyer network',
      icon: Users,
      href: '/buyers',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      description: 'View performance metrics',
      icon: BarChart3,
      href: '/analytics',
    },
  ];

  // Calculate stale deals count from pipeline data
  const staleDealCount =
    pipelineData?.stages
      ?.filter((stage) => stage.staleDealCount && stage.staleDealCount > 0)
      .reduce((sum, stage) => sum + (stage.staleDealCount || 0), 0) || 3; // Default to demo value

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Welcome to your AI-powered real estate wholesaling platform.
        </p>
      </div>

      {/* AI Daily Briefing - Top Priority */}
      <DailyBriefingCard className="mb-6" />

      {/* Stale Deals Alert - Only show if there are stale deals */}
      {staleDealCount > 0 && (
        <StaleDealsAlert
          staleDealCount={staleDealCount}
          onViewDeals={() => router.push('/deals?filter=stale')}
          className="mb-6"
        />
      )}

      {/* Focused KPI Cards - Reduced to 4 key metrics */}
      <KPICardGrid columns={4}>
        <KPICard
          title="Active Deals"
          value={isLoading ? '...' : (deals?.active_deals || 0).toString()}
          icon={Briefcase}
          change={
            summary?.deals_trend ? { value: summary.deals_trend, label: 'vs last week' } : undefined
          }
          onClick={() => router.push('/deals')}
          className="cursor-pointer hover:shadow-md transition-shadow"
        />
        <KPICard
          title="Revenue (7d)"
          value={isLoading ? '...' : `$${(summary?.revenue_period || 0).toLocaleString()}`}
          icon={DollarSign}
          change={
            summary?.revenue_trend
              ? { value: summary.revenue_trend, label: 'vs last week' }
              : undefined
          }
          onClick={() => router.push('/analytics')}
          className="cursor-pointer hover:shadow-md transition-shadow"
        />
        <KPICard
          title="Active Buyers"
          value={isLoading ? '...' : (buyers?.active_buyers || 0).toString()}
          icon={Users}
          subtitle={`${buyers?.tier_a_count || 0} Tier A buyers`}
          onClick={() => router.push('/buyers')}
          className="cursor-pointer hover:shadow-md transition-shadow"
        />
        <KPICard
          title="Pipeline Value"
          value={
            isLoading || pipelineLoading
              ? '...'
              : `$${(pipelineData?.totalValue || 0).toLocaleString()}`
          }
          icon={TrendingUp}
          subtitle={`${deals?.deals_by_stage?.contract || 0} in contract`}
          onClick={() => router.push('/deals')}
          className="cursor-pointer hover:shadow-md transition-shadow"
        />
      </KPICardGrid>

      {/* Quick Actions */}
      <Card className="card-elevated mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <QuickActions actions={quickActions} />
        </CardContent>
      </Card>

      {/* Pipeline Summary and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Pipeline Summary */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Pipeline Summary</CardTitle>
            <CardDescription>Current deals by stage</CardDescription>
          </CardHeader>
          <CardContent>
            {pipelineLoading ? (
              <PipelineSummarySkeleton />
            ) : pipelineData ? (
              <PipelineSummary stages={pipelineData.stages} totalValue={pipelineData.totalValue} />
            ) : (
              <DealPipelineFunnel
                data={{
                  leads: summary?.active_leads || 0,
                  contacted: Math.floor((summary?.active_leads || 0) * 0.7),
                  appointments: Math.floor((summary?.active_leads || 0) * 0.4),
                  offers: deals?.deals_by_stage?.offer || 0,
                  contracts: deals?.deals_by_stage?.contract || 0,
                  closed: deals?.closed_deals || 0,
                }}
              />
            )}
          </CardContent>
        </Card>

        {/* Activity Feed */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest actions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            {activitiesLoading ? (
              <ActivityFeedSkeleton count={5} />
            ) : (
              <ActivityFeed
                activities={activitiesData?.activities || []}
                maxItems={8}
                onActivityClick={(activity) => {
                  if (activity.entityType && activity.entityId) {
                    router.push(`/${activity.entityType}s/${activity.entityId}`);
                  }
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Card - Show only for new users */}
      {(!deals?.total_deals || deals.total_deals === 0) && (
        <Card className="card-elevated mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-[var(--color-brand-500)]" />
              Getting Started
            </CardTitle>
            <CardDescription>Complete these steps to set up your platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid--gap-4 md:grid-cols-2">
              <Link href="/properties" className="group">
                <div className="p-4 rounded-lg border border-border hover:border-[var(--color-brand-300)] transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium mb-1">Add Properties</h4>
                      <p className="text-sm text-muted-foreground">
                        Import properties from your lead sources
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-[var(--color-brand-500)] transition-colors" />
                  </div>
                </div>
              </Link>
              <Link href="/buyers" className="group">
                <div className="p-4 rounded-lg border border-border hover:border-[var(--color-brand-300)] transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium mb-1">Build Buyer Network</h4>
                      <p className="text-sm text-muted-foreground">
                        Add buyers with their criteria and contact info
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-[var(--color-brand-500)] transition-colors" />
                  </div>
                </div>
              </Link>
              <Link href="/deals" className="group">
                <div className="p-4 rounded-lg border border-border hover:border-[var(--color-brand-300)] transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium mb-1">Track Deals</h4>
                      <p className="text-sm text-muted-foreground">
                        Move deals through your pipeline stages
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-[var(--color-brand-500)] transition-colors" />
                  </div>
                </div>
              </Link>
              <div className="p-4 rounded-lg border border-dashed border-[var(--color-brand-300)] bg-[var(--color-brand-50)] dark:bg-[var(--color-brand-900)]/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-[var(--color-brand-500)] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Ask AI for Help</h4>
                    <p className="text-sm text-muted-foreground">
                      Use the chat panel to analyze deals and get recommendations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
