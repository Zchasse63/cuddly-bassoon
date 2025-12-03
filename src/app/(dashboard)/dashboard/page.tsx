'use client';

import { usePageContext } from '@/hooks/usePageContext';
import { useDashboardData } from '@/hooks/use-dashboard-data';
import { KPICard, KPICardGrid } from '@/components/ui/kpi-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { DealPipelineFunnel } from '@/components/analytics';
import {
  Home,
  Users,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Search,
  Target,
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  // Set page context for AI awareness
  usePageContext('dashboard');

  // Fetch real dashboard data
  const { data, isLoading } = useDashboardData(7);

  const summary = data?.summary;
  const deals = data?.deals;
  const buyers = data?.buyers;

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-description">
          Welcome to your AI-powered real estate wholesaling platform.
        </p>
      </div>

      {/* Primary KPI Cards */}
      <KPICardGrid columns={4}>
        <KPICard
          title="Properties Searched"
          value={isLoading ? '...' : (summary?.properties_searched || 0).toString()}
          icon={Search}
          change={
            summary?.searches_trend
              ? { value: summary.searches_trend, label: 'vs last week' }
              : undefined
          }
        />
        <KPICard
          title="Active Buyers"
          value={isLoading ? '...' : (buyers?.active_buyers || 0).toString()}
          icon={Users}
          subtitle={`${buyers?.tier_a_count || 0} Tier A`}
        />
        <KPICard
          title="Active Deals"
          value={isLoading ? '...' : (deals?.active_deals || 0).toString()}
          icon={Briefcase}
          change={
            summary?.deals_trend ? { value: summary.deals_trend, label: 'vs last week' } : undefined
          }
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
        />
      </KPICardGrid>

      {/* Secondary KPI Cards */}
      <KPICardGrid columns={4} className="mt-4 kpi-grid--staggered">
        <KPICard
          title="Properties Saved"
          value={isLoading ? '...' : (summary?.properties_saved || 0).toString()}
          icon={Home}
        />
        <KPICard
          title="Properties Analyzed"
          value={isLoading ? '...' : (summary?.properties_analyzed || 0).toString()}
          icon={Target}
        />
        <KPICard
          title="Active Leads"
          value={isLoading ? '...' : (summary?.active_leads || 0).toString()}
          icon={TrendingUp}
        />
        <KPICard
          title="Avg Assignment Fee"
          value={isLoading ? '...' : `$${(summary?.avg_assignment_fee || 0).toLocaleString()}`}
          icon={Sparkles}
        />
      </KPICardGrid>

      {/* Deal Pipeline Funnel */}
      {deals && (deals.total_deals > 0 || (summary?.active_leads ?? 0) > 0) && (
        <Card className="card-elevated mt-6">
          <CardHeader>
            <CardTitle>Deal Pipeline</CardTitle>
            <CardDescription>Conversion funnel from leads to closed deals</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      {/* Getting Started Card */}
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
    </div>
  );
}
