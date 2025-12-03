'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, Target, Phone, Mail, Search, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { usePageContext } from '@/hooks/usePageContext';
import { useKPIs } from '@/hooks/use-dashboard-data';
import { KPICard, KPICardGrid } from '@/components/ui/kpi-card';
import { DealPipelineFunnel, WeeklySnapshot } from '@/components/analytics';
import { Button } from '@/components/ui/button';

type DateRange = 7 | 30 | 90 | 365;

export default function AnalyticsPage() {
  usePageContext('analytics');
  const [dateRange, setDateRange] = useState<DateRange>(30);

  const { data: kpiData, isLoading } = useKPIs('all', dateRange);

  const activity = kpiData?.kpis?.activity;
  const outreach = kpiData?.kpis?.outreach;
  const pipeline = kpiData?.kpis?.pipeline;
  const financial = kpiData?.kpis?.financial;

  // Weekly snapshot data
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weekEnd = new Date();

  // Export handlers
  const handleExportCSV = () => {
    window.open(`/api/analytics/export?format=csv&days=${dateRange}`, '_blank');
  };

  const handleExportJSON = () => {
    window.open(`/api/analytics/export?format=json&days=${dateRange}`, '_blank');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-description">Track your performance and business metrics</p>
        </div>
        <div className="page-header__actions">
          {([7, 30, 90, 365] as DateRange[]).map((days) => (
            <Button
              key={days}
              variant={dateRange === days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDateRange(days)}
            >
              {days === 7 ? '7D' : days === 30 ? '30D' : days === 90 ? '90D' : '1Y'}
            </Button>
          ))}
          <div className="page-header__actions-group">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportJSON}>
              <Download className="h-4 w-4 mr-1" />
              JSON
            </Button>
          </div>
        </div>
      </div>

      {/* Activity KPIs */}
      <section className="analytics-section">
        <h2 className="analytics-section__title">Activity Metrics</h2>
        <KPICardGrid columns={4}>
          <KPICard
            title="Total Searches"
            value={isLoading ? '...' : (activity?.total_searches || 0).toString()}
            icon={Search}
            subtitle={`${activity?.avg_daily_searches || 0}/day avg`}
          />
          <KPICard
            title="Properties Viewed"
            value={isLoading ? '...' : (activity?.total_views || 0).toString()}
            icon={Target}
          />
          <KPICard
            title="Properties Saved"
            value={isLoading ? '...' : (activity?.total_saves || 0).toString()}
            icon={BarChart3}
            subtitle={`${activity?.search_to_save_rate || 0}% save rate`}
          />
          <KPICard
            title="Properties Analyzed"
            value={isLoading ? '...' : (activity?.total_analyses || 0).toString()}
            icon={TrendingUp}
          />
        </KPICardGrid>
      </section>

      {/* Outreach KPIs */}
      <section className="analytics-section">
        <h2 className="analytics-section__title">Outreach Metrics</h2>
        <KPICardGrid columns={4}>
          <KPICard
            title="Calls Made"
            value={isLoading ? '...' : (outreach?.total_calls || 0).toString()}
            icon={Phone}
            subtitle={`${outreach?.call_connect_rate || 0}% connect rate`}
          />
          <KPICard
            title="Connected Calls"
            value={isLoading ? '...' : (outreach?.connected_calls || 0).toString()}
            icon={Phone}
          />
          <KPICard
            title="Emails Sent"
            value={isLoading ? '...' : (outreach?.total_emails_sent || 0).toString()}
            icon={Mail}
            subtitle={`${outreach?.email_open_rate || 0}% open rate`}
          />
          <KPICard
            title="Texts Sent"
            value={isLoading ? '...' : (outreach?.total_texts_sent || 0).toString()}
            icon={Mail}
          />
        </KPICardGrid>
      </section>

      {/* Pipeline & Financial */}
      <div className="grid grid--gap-6 md:grid-cols-2 analytics-section">
        {/* Pipeline Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Pipeline</CardTitle>
            <CardDescription>Conversion funnel from leads to closed deals</CardDescription>
          </CardHeader>
          <CardContent>
            <DealPipelineFunnel
              data={{
                leads: pipeline?.total_leads || 0,
                contacted: pipeline?.leads_contacted || 0,
                appointments: pipeline?.appointments_set || 0,
                offers: pipeline?.offers_made || 0,
                contracts: pipeline?.contracts_signed || 0,
                closed: pipeline?.deals_closed || 0,
              }}
            />
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Summary</CardTitle>
            <CardDescription>Revenue and profitability metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="financial-summary">
              <div className="financial-item">
                <span className="financial-item__label">Total Revenue</span>
                <span className="financial-item__value financial-item__value--positive">
                  ${(financial?.total_revenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="financial-item">
                <span className="financial-item__label">Total Expenses</span>
                <span className="financial-item__value financial-item__value--negative">
                  ${(financial?.total_expenses || 0).toLocaleString()}
                </span>
              </div>
              <div className="financial-item">
                <span className="financial-item__label">Net Profit</span>
                <span className="financial-item__value financial-item__value--neutral">
                  ${(financial?.net_profit || 0).toLocaleString()}
                </span>
              </div>
              <div className="financial-item">
                <span className="financial-item__label">Avg Deal Revenue</span>
                <span className="financial-item__value financial-item__value--neutral">
                  ${(financial?.avg_deal_revenue || 0).toLocaleString()}
                </span>
              </div>
              <div className="financial-item">
                <span className="financial-item__label">ROI</span>
                <span className="financial-item__value financial-item__value--positive">
                  {financial?.roi_percentage || 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Snapshot */}
      <WeeklySnapshot
        weekStart={weekStart}
        weekEnd={weekEnd}
        metrics={[
          { label: 'Searches', value: activity?.total_searches || 0 },
          { label: 'Leads', value: pipeline?.total_leads || 0 },
          { label: 'Offers', value: pipeline?.offers_made || 0 },
          { label: 'Closed', value: pipeline?.deals_closed || 0 },
          { label: 'Revenue', value: financial?.total_revenue || 0, format: 'currency' },
          { label: 'Conversion', value: pipeline?.overall_conversion_rate || 0, format: 'percent' },
        ]}
        highlights={[
          pipeline?.deals_closed
            ? `Closed ${pipeline.deals_closed} deals this period`
            : 'No deals closed yet',
          financial?.total_revenue
            ? `Generated $${financial.total_revenue.toLocaleString()} in revenue`
            : 'Start tracking revenue',
        ]}
      />
    </div>
  );
}
