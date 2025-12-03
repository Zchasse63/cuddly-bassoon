'use client';

import { useState } from 'react';
import { usePageContext } from '@/hooks/usePageContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { KPICard, KPICardGrid } from '@/components/ui/kpi-card';
import { Button } from '@/components/ui/button';
import { TrendChart } from '@/components/analytics';
import { MessageSquare, Mail, Phone, Clock, TrendingUp, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type DateRange = 7 | 30 | 90 | 365;

interface CommunicationAnalytics {
  summary: {
    total_messages: number;
    emails_sent: number;
    sms_sent: number;
    calls_made: number;
    response_rate: number;
    avg_response_time: number;
  };
  channels: Array<{
    channel: string;
    sent: number;
    delivered: number;
    opened: number;
    responded: number;
    rate: number;
  }>;
  trends: Array<{
    date: string;
    emails: number;
    sms: number;
    calls: number;
  }>;
  response_times: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  campaigns: Array<{
    id: string;
    name: string;
    type: string;
    sent: number;
    opened: number;
    responded: number;
    rate: number;
  }>;
}

async function fetchCommunicationAnalytics(days: number): Promise<CommunicationAnalytics> {
  const response = await fetch(`/api/analytics/communications?days=${days}`);
  if (!response.ok) throw new Error('Failed to fetch communication analytics');
  return response.json();
}

export default function CommunicationAnalyticsPage() {
  usePageContext('analytics-communications');
  const [dateRange, setDateRange] = useState<DateRange>(30);

  const { data, isLoading } = useQuery({
    queryKey: ['communication-analytics', dateRange],
    queryFn: () => fetchCommunicationAnalytics(dateRange),
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Link href="/analytics" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="page-title">Communication Analytics</h1>
            <p className="page-description">Channel performance and response metrics</p>
          </div>
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
        </div>
      </div>

      {/* Summary KPIs */}
      <KPICardGrid columns={4}>
        <KPICard
          title="Total Messages"
          value={isLoading ? '...' : (data?.summary.total_messages || 0).toString()}
          icon={MessageSquare}
        />
        <KPICard
          title="Emails Sent"
          value={isLoading ? '...' : (data?.summary.emails_sent || 0).toString()}
          icon={Mail}
        />
        <KPICard
          title="SMS Sent"
          value={isLoading ? '...' : (data?.summary.sms_sent || 0).toString()}
          icon={MessageSquare}
        />
        <KPICard
          title="Response Rate"
          value={isLoading ? '...' : `${data?.summary.response_rate || 0}%`}
          icon={TrendingUp}
          subtitle={`Avg ${data?.summary.avg_response_time || 0}h response`}
        />
      </KPICardGrid>

      {/* Channel Performance and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Channel Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Performance</CardTitle>
            <CardDescription>Delivery and response rates by channel</CardDescription>
          </CardHeader>
          <CardContent>
            <ChannelPerformance channels={data?.channels || []} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Communication Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Communication Trends</CardTitle>
            <CardDescription>Messages sent over time</CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={data?.trends || []}
              lines={[
                { dataKey: 'emails', name: 'Emails', color: 'var(--color-primary)' },
                { dataKey: 'sms', name: 'SMS', color: 'var(--color-success)' },
                { dataKey: 'calls', name: 'Calls', color: 'var(--color-warning)' },
              ]}
              height={250}
            />
          </CardContent>
        </Card>
      </div>

      {/* Response Times and Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Response Time Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Response Time Distribution</CardTitle>
            <CardDescription>How quickly contacts respond</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponseTimeChart times={data?.response_times || []} isLoading={isLoading} />
          </CardContent>
        </Card>

        {/* Campaign Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Performance</CardTitle>
            <CardDescription>Recent campaign results</CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignList campaigns={data?.campaigns || []} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Channel Performance Component
function ChannelPerformance({
  channels,
  isLoading,
}: {
  channels: CommunicationAnalytics['channels'];
  isLoading: boolean;
}) {
  const channelIcons: Record<string, React.ReactNode> = {
    email: <Mail className="h-4 w-4" />,
    sms: <MessageSquare className="h-4 w-4" />,
    call: <Phone className="h-4 w-4" />,
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No communication data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {channels.map((channel) => (
        <div key={channel.channel} className="p-3 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded bg-primary/10 text-primary">
                {channelIcons[channel.channel.toLowerCase()] || (
                  <MessageSquare className="h-4 w-4" />
                )}
              </div>
              <span className="font-medium capitalize">{channel.channel}</span>
            </div>
            <span className="text-sm font-bold text-primary">{channel.rate}%</span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <p className="text-muted-foreground">Sent</p>
              <p className="font-medium">{channel.sent}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Delivered</p>
              <p className="font-medium">{channel.delivered}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Opened</p>
              <p className="font-medium">{channel.opened}</p>
            </div>
            <div className="text-center">
              <p className="text-muted-foreground">Responded</p>
              <p className="font-medium">{channel.responded}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Response Time Chart Component
function ResponseTimeChart({
  times,
  isLoading,
}: {
  times: CommunicationAnalytics['response_times'];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-8 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (times.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Clock className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No response data available</p>
      </div>
    );
  }

  const colors = ['bg-emerald-500', 'bg-green-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-500'];

  return (
    <div className="space-y-3">
      {times.map((time, index) => (
        <div key={time.range} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{time.range}</span>
            <span className="font-medium">
              {time.count} ({time.percentage}%)
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full ${colors[index % colors.length]} rounded-full transition-all`}
              style={{ width: `${time.percentage}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Campaign List Component
function CampaignList({
  campaigns,
  isLoading,
}: {
  campaigns: CommunicationAnalytics['campaigns'];
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 bg-muted rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Mail className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No campaigns in this period</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.slice(0, 5).map((campaign) => (
        <div
          key={campaign.id}
          className="p-3 rounded-lg border hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium truncate">{campaign.name}</span>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                campaign.rate >= 20
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : campaign.rate >= 10
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {campaign.rate}% response
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="capitalize">{campaign.type}</span>
            <span>Sent: {campaign.sent}</span>
            <span>Opened: {campaign.opened}</span>
            <span>Responded: {campaign.responded}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
