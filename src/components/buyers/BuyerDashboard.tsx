'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, Clock, DollarSign, Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface BuyerStats {
  totalBuyers: number;
  activeBuyers: number;
  qualifiedBuyers: number;
  tierACount: number;
  tierBCount: number;
  tierCCount: number;
  buyersByType: Record<string, number>;
}

interface BuyerMetrics {
  averageResponseTime: number;
  dealAcceptanceRate: number;
  averageTransactionValue: number;
  totalClosedVolume: number;
}

interface RecentActivity {
  id: string;
  buyerName: string;
  action: string;
  timestamp: string;
}

export function BuyerDashboard() {
  const [stats, setStats] = useState<BuyerStats | null>(null);
  const [metrics, setMetrics] = useState<BuyerMetrics | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, metricsRes, activityRes] = await Promise.all([
        fetch('/api/buyers/analytics/stats'),
        fetch('/api/buyers/analytics/metrics'),
        fetch('/api/buyers/analytics/activity'),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      if (metricsRes.ok) {
        const data = await metricsRes.json();
        setMetrics(data);
      }
      if (activityRes.ok) {
        const data = await activityRes.json();
        setRecentActivity(data.activities || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (type: 'buyers' | 'transactions') => {
    setIsExporting(true);
    try {
      const res = await fetch(`/api/buyers/export?type=${type}`);
      if (!res.ok) throw new Error('Export failed');
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${type} exported successfully`);
    } catch {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Buyer Analytics</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('buyers')} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" /> Export Buyers
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('transactions')} disabled={isExporting}>
            <Download className="h-4 w-4 mr-2" /> Export Transactions
          </Button>
          <Button variant="outline" size="sm" onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Buyers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalBuyers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeBuyers || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Qualified Buyers</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.qualifiedBuyers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalBuyers ? ((stats.qualifiedBuyers / stats.totalBuyers) * 100).toFixed(0) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.averageResponseTime ? `${metrics.averageResponseTime.toFixed(1)}h` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">Hours to respond</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(metrics?.totalClosedVolume || 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Closed transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tier Distribution & Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Buyer Tiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">A</Badge>
                  <span>Priority Buyers</span>
                </div>
                <span className="font-bold">{stats?.tierACount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">B</Badge>
                  <span>Active Buyers</span>
                </div>
                <span className="font-bold">{stats?.tierBCount || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-gray-100 text-gray-800">C</Badge>
                  <span>New/Inactive</span>
                </div>
                <span className="font-bold">{stats?.tierCCount || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-medium">{activity.buyerName}</span>
                      <span className="text-muted-foreground ml-2">{activity.action}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Metrics */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{metrics.dealAcceptanceRate.toFixed(0)}%</div>
                <div className="text-sm text-muted-foreground">Deal Acceptance</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">${metrics.averageTransactionValue.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Avg Transaction</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">{metrics.averageResponseTime.toFixed(1)}h</div>
                <div className="text-sm text-muted-foreground">Avg Response</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold">${metrics.totalClosedVolume.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Volume</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

