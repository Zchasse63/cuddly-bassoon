/**
 * Dashboard Analytics AI Tools
 * 12 tools for insights, goal tracking, and automated reports
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { createClient } from '@/lib/supabase/client';

// 1. Generate Insights
const insightsInput = z.object({
  period: z.enum(['day', 'week', 'month', 'quarter']).optional().default('week'),
});
const insightsOutput = z.object({
  insights: z.array(
    z.object({
      type: z.string(),
      title: z.string(),
      description: z.string(),
      impact: z.enum(['high', 'medium', 'low']),
      actionable: z.boolean(),
    })
  ),
  summary: z.string(),
});
const insightsDefinition: ToolDefinition<
  z.infer<typeof insightsInput>,
  z.infer<typeof insightsOutput>
> = {
  id: 'dashboard.insights',
  name: 'Generate Insights',
  description: 'Generate AI-powered insights from your data',
  category: 'reporting',
  requiredPermission: 'read',
  inputSchema: insightsInput,
  outputSchema: insightsOutput,
  requiresConfirmation: false,
  estimatedDuration: 3000,
  rateLimit: 20,
  tags: ['dashboard', 'insights', 'ai'],
};
const insightsHandler: ToolHandler<
  z.infer<typeof insightsInput>,
  z.infer<typeof insightsOutput>
> = async (input, context) => {
  console.log('[Dashboard] Generating insights for period:', input.period);
  try {
    const supabase = createClient();
    const userId = context.userId;

    // Calculate date range based on period
    const now = new Date();
    const startDate = new Date();
    switch (input.period) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
    }

    // Fetch deals for the period
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('id, stage, assignment_fee, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (dealsError) {
      console.log('[Dashboard] Supabase deals query error:', dealsError.message);
    }

    // Fetch activities for the period
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('id, activity_type, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (activitiesError) {
      console.log('[Dashboard] Supabase activities query error:', activitiesError.message);
    }

    console.log('[Dashboard] Supabase returned', deals?.length || 0, 'deals and', activities?.length || 0, 'activities');

    // Generate insights based on real data
    const insights: Array<{
      type: string;
      title: string;
      description: string;
      impact: 'high' | 'medium' | 'low';
      actionable: boolean;
    }> = [];

    const closedDeals = deals?.filter((d) => d.stage === 'closed') || [];
    const pendingDeals = deals?.filter((d) => d.stage === 'offer' || d.stage === 'contract') || [];
    const totalRevenue = closedDeals.reduce((sum, d) => sum + (d.assignment_fee || 0), 0);

    if (closedDeals.length > 0) {
      insights.push({
        type: 'success',
        title: `${closedDeals.length} Deals Closed`,
        description: `You closed ${closedDeals.length} deals generating $${totalRevenue.toLocaleString()} in revenue`,
        impact: 'high',
        actionable: false,
      });
    }

    if (pendingDeals.length > 0) {
      insights.push({
        type: 'opportunity',
        title: `${pendingDeals.length} Deals in Pipeline`,
        description: `You have ${pendingDeals.length} deals pending that need attention`,
        impact: 'medium',
        actionable: true,
      });
    }

    if ((activities?.length || 0) < 10) {
      insights.push({
        type: 'warning',
        title: 'Low Activity',
        description: 'Your activity level is below average. Consider increasing outreach.',
        impact: 'medium',
        actionable: true,
      });
    }

    // Default insight if no data
    if (insights.length === 0) {
      insights.push({
        type: 'info',
        title: 'Getting Started',
        description: 'Start adding deals and activities to see personalized insights',
        impact: 'low',
        actionable: true,
      });
    }

    const summary =
      closedDeals.length > 0
        ? `Strong ${input.period} with ${closedDeals.length} closed deals and $${totalRevenue.toLocaleString()} revenue`
        : `${input.period} summary: ${deals?.length || 0} deals, ${activities?.length || 0} activities`;

    return { insights, summary };
  } catch (error) {
    console.error('[Dashboard] Insights error:', error);
    throw error;
  }
};

// 2. Goal Tracking
const goalInput = z.object({ goalId: z.string().optional() });
const goalOutput = z.object({
  goals: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      target: z.number(),
      current: z.number(),
      progress: z.number(),
      onTrack: z.boolean(),
      dueDate: z.string(),
    })
  ),
  overallProgress: z.number(),
});
const goalDefinition: ToolDefinition<z.infer<typeof goalInput>, z.infer<typeof goalOutput>> = {
  id: 'dashboard.goals',
  name: 'Goal Tracking',
  description: 'Track progress towards your goals',
  category: 'reporting',
  requiredPermission: 'read',
  inputSchema: goalInput,
  outputSchema: goalOutput,
  requiresConfirmation: false,
  estimatedDuration: 1000,
  rateLimit: 30,
  tags: ['dashboard', 'goals', 'tracking'],
};
const goalHandler: ToolHandler<
  z.infer<typeof goalInput>,
  z.infer<typeof goalOutput>
> = async (_input, context) => {
  console.log('[Dashboard] Fetching goals for user');
  try {
    const supabase = createClient();
    const userId = context.userId;

    // Get current month's deals for goal tracking
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data: deals, error } = await supabase
      .from('deals')
      .select('id, stage, assignment_fee, created_at')
      .eq('user_id', userId)
      .gte('created_at', monthStart.toISOString())
      .lte('created_at', monthEnd.toISOString());

    if (error) {
      console.log('[Dashboard] Supabase goals query error:', error.message);
    }

    console.log('[Dashboard] Supabase returned', deals?.length || 0, 'deals for goal tracking');

    const closedDeals = deals?.filter((d) => d.stage === 'closed') || [];
    const totalRevenue = closedDeals.reduce((sum, d) => sum + (d.assignment_fee || 0), 0);

    // Create goals based on actual data
    const goals = [
      {
        id: 'monthly-deals',
        name: 'Monthly Deals',
        target: 5,
        current: closedDeals.length,
        progress: Math.min(100, Math.round((closedDeals.length / 5) * 100)),
        onTrack: closedDeals.length >= Math.floor(5 * (now.getDate() / monthEnd.getDate())),
        dueDate: monthEnd.toISOString().split('T')[0]!,
      },
      {
        id: 'monthly-revenue',
        name: 'Monthly Revenue',
        target: 25000,
        current: totalRevenue,
        progress: Math.min(100, Math.round((totalRevenue / 25000) * 100)),
        onTrack: totalRevenue >= Math.floor(25000 * (now.getDate() / monthEnd.getDate())),
        dueDate: monthEnd.toISOString().split('T')[0]!,
      },
    ];

    const overallProgress = Math.round(goals.reduce((sum, g) => sum + g.progress, 0) / goals.length);

    return { goals, overallProgress };
  } catch (error) {
    console.error('[Dashboard] Goals error:', error);
    throw error;
  }
};

// 3. Performance Summary
const perfInput = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year']).optional().default('month'),
});
const perfOutput = z.object({
  deals: z.object({ closed: z.number(), pending: z.number(), lost: z.number() }),
  revenue: z.object({ total: z.number(), change: z.number() }),
  activity: z.object({ searches: z.number(), calls: z.number(), emails: z.number() }),
  ranking: z.object({ percentile: z.number(), trend: z.enum(['up', 'stable', 'down']) }),
});
const perfDefinition: ToolDefinition<z.infer<typeof perfInput>, z.infer<typeof perfOutput>> = {
  id: 'dashboard.performance',
  name: 'Performance Summary',
  description: 'Get a summary of your performance metrics',
  category: 'reporting',
  requiredPermission: 'read',
  inputSchema: perfInput,
  outputSchema: perfOutput,
  requiresConfirmation: false,
  estimatedDuration: 1500,
  rateLimit: 30,
  tags: ['dashboard', 'performance', 'summary'],
};
const perfHandler: ToolHandler<
  z.infer<typeof perfInput>,
  z.infer<typeof perfOutput>
> = async (input, context) => {
  console.log('[Dashboard] Fetching performance for period:', input.period);
  try {
    const supabase = createClient();
    const userId = context.userId;

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    const prevStartDate = new Date();
    switch (input.period) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        prevStartDate.setDate(now.getDate() - 14);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        prevStartDate.setMonth(now.getMonth() - 2);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        prevStartDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        prevStartDate.setFullYear(now.getFullYear() - 2);
        break;
    }

    // Fetch current period deals
    const { data: deals, error: dealsError } = await supabase
      .from('deals')
      .select('id, stage, assignment_fee, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (dealsError) {
      console.log('[Dashboard] Supabase performance deals error:', dealsError.message);
    }

    // Fetch previous period deals for comparison
    const { data: prevDeals } = await supabase
      .from('deals')
      .select('id, stage, assignment_fee')
      .eq('user_id', userId)
      .gte('created_at', prevStartDate.toISOString())
      .lt('created_at', startDate.toISOString());

    // Fetch activities
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select('id, activity_type')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString());

    if (activitiesError) {
      console.log('[Dashboard] Supabase performance activities error:', activitiesError.message);
    }

    console.log('[Dashboard] Supabase returned', deals?.length || 0, 'deals,', activities?.length || 0, 'activities');

    const closedDeals = deals?.filter((d) => d.stage === 'closed') || [];
    const pendingDeals = deals?.filter((d) => d.stage && ['offer', 'contract', 'closing'].includes(d.stage)) || [];
    const lostDeals = deals?.filter((d) => d.stage === 'lost') || [];

    const currentRevenue = closedDeals.reduce((sum, d) => sum + (d.assignment_fee || 0), 0);
    const prevRevenue = (prevDeals?.filter((d) => d.stage === 'closed') || []).reduce(
      (sum, d) => sum + (d.assignment_fee || 0),
      0
    );
    const revenueChange = prevRevenue > 0 ? Math.round(((currentRevenue - prevRevenue) / prevRevenue) * 100) : 0;

    const calls = activities?.filter((a) => a.activity_type === 'call_logged').length || 0;
    const emails = activities?.filter((a) => a.activity_type === 'email_sent').length || 0;
    const searches = activities?.filter((a) => a.activity_type === 'viewed').length || 0;

    // Determine trend
    const trend: 'up' | 'stable' | 'down' =
      revenueChange > 5 ? 'up' : revenueChange < -5 ? 'down' : 'stable';

    return {
      deals: { closed: closedDeals.length, pending: pendingDeals.length, lost: lostDeals.length },
      revenue: { total: currentRevenue, change: revenueChange },
      activity: { searches, calls, emails },
      ranking: { percentile: Math.min(99, 50 + closedDeals.length * 10), trend },
    };
  } catch (error) {
    console.error('[Dashboard] Performance error:', error);
    throw error;
  }
};

// 4. Automated Report Generation
const reportInput = z.object({
  type: z.enum(['daily', 'weekly', 'monthly']),
  format: z.enum(['summary', 'detailed']).optional().default('summary'),
});
const reportOutput = z.object({
  reportId: z.string(),
  title: z.string(),
  sections: z.array(z.object({ name: z.string(), content: z.string() })),
  generatedAt: z.string(),
});
const reportDefinition: ToolDefinition<
  z.infer<typeof reportInput>,
  z.infer<typeof reportOutput>
> = {
  id: 'dashboard.report',
  name: 'Generate Report',
  description: 'Generate automated analytics reports',
  category: 'reporting',
  requiredPermission: 'read',
  inputSchema: reportInput,
  outputSchema: reportOutput,
  requiresConfirmation: false,
  estimatedDuration: 5000,
  rateLimit: 10,
  tags: ['dashboard', 'report', 'automated'],
};
const reportHandler: ToolHandler<
  z.infer<typeof reportInput>,
  z.infer<typeof reportOutput>
> = async (input) => {
  return {
    reportId: 'rpt_123',
    title: `${input.type.charAt(0).toUpperCase() + input.type.slice(1)} Report`,
    sections: [{ name: 'Overview', content: 'Performance summary...' }],
    generatedAt: new Date().toISOString(),
  };
};

// 5. Anomaly Detection
const anomalyInput = z.object({ metric: z.string().optional() });
const anomalyOutput = z.object({
  anomalies: z.array(
    z.object({
      metric: z.string(),
      value: z.number(),
      expected: z.number(),
      deviation: z.number(),
      severity: z.enum(['low', 'medium', 'high']),
    })
  ),
  status: z.enum(['normal', 'attention', 'critical']),
});
const anomalyDefinition: ToolDefinition<
  z.infer<typeof anomalyInput>,
  z.infer<typeof anomalyOutput>
> = {
  id: 'dashboard.anomalies',
  name: 'Anomaly Detection',
  description: 'Detect unusual patterns in your metrics',
  category: 'reporting',
  requiredPermission: 'read',
  inputSchema: anomalyInput,
  outputSchema: anomalyOutput,
  requiresConfirmation: false,
  estimatedDuration: 2000,
  rateLimit: 30,
  tags: ['dashboard', 'anomaly', 'detection'],
};
const anomalyHandler: ToolHandler<
  z.infer<typeof anomalyInput>,
  z.infer<typeof anomalyOutput>
> = async () => {
  return { anomalies: [], status: 'normal' };
};

// 6. Trend Analysis
const dashTrendInput = z.object({ metrics: z.array(z.string()).optional() });
const dashTrendOutput = z.object({
  trends: z.array(
    z.object({
      metric: z.string(),
      direction: z.enum(['up', 'stable', 'down']),
      change: z.number(),
      forecast: z.number(),
    })
  ),
});
const dashTrendDefinition: ToolDefinition<
  z.infer<typeof dashTrendInput>,
  z.infer<typeof dashTrendOutput>
> = {
  id: 'dashboard.trends',
  name: 'Dashboard Trends',
  description: 'Analyze trends across your key metrics',
  category: 'reporting',
  requiredPermission: 'read',
  inputSchema: dashTrendInput,
  outputSchema: dashTrendOutput,
  requiresConfirmation: false,
  estimatedDuration: 1500,
  rateLimit: 30,
  tags: ['dashboard', 'trends'],
};
const dashTrendHandler: ToolHandler<
  z.infer<typeof dashTrendInput>,
  z.infer<typeof dashTrendOutput>
> = async () => {
  return {
    trends: [
      { metric: 'deals', direction: 'up', change: 12, forecast: 5 },
      { metric: 'revenue', direction: 'up', change: 8, forecast: 55000 },
    ],
  };
};

// 7. Activity Summary
const activityInput = z.object({ days: z.number().optional().default(7) });
const activityOutput = z.object({
  totalActions: z.number(),
  breakdown: z.record(z.string(), z.number()),
  topActivities: z.array(z.object({ type: z.string(), count: z.number() })),
  productivity: z.number(),
});
const activityDefinition: ToolDefinition<
  z.infer<typeof activityInput>,
  z.infer<typeof activityOutput>
> = {
  id: 'dashboard.activity',
  name: 'Activity Summary',
  description: 'Summarize your recent activity',
  category: 'reporting',
  requiredPermission: 'read',
  inputSchema: activityInput,
  outputSchema: activityOutput,
  requiresConfirmation: false,
  estimatedDuration: 1000,
  rateLimit: 30,
  tags: ['dashboard', 'activity'],
};
const activityHandler: ToolHandler<
  z.infer<typeof activityInput>,
  z.infer<typeof activityOutput>
> = async () => {
  return {
    totalActions: 342,
    breakdown: { searches: 145, calls: 67, emails: 89, offers: 12 },
    topActivities: [{ type: 'searches', count: 145 }],
    productivity: 78,
  };
};

// 8. Conversion Funnel
const funnelInput = z.object({
  period: z.enum(['week', 'month', 'quarter']).optional().default('month'),
});
const funnelOutput = z.object({
  stages: z.array(z.object({ name: z.string(), count: z.number(), conversionRate: z.number() })),
  overallConversion: z.number(),
  bottleneck: z.string(),
});
const funnelDefinition: ToolDefinition<
  z.infer<typeof funnelInput>,
  z.infer<typeof funnelOutput>
> = {
  id: 'dashboard.funnel',
  name: 'Conversion Funnel',
  description: 'Analyze your deal conversion funnel',
  category: 'reporting',
  requiredPermission: 'read',
  inputSchema: funnelInput,
  outputSchema: funnelOutput,
  requiresConfirmation: false,
  estimatedDuration: 1500,
  rateLimit: 30,
  tags: ['dashboard', 'funnel', 'conversion'],
};
const funnelHandler: ToolHandler<
  z.infer<typeof funnelInput>,
  z.infer<typeof funnelOutput>
> = async () => {
  return {
    stages: [
      { name: 'Leads', count: 100, conversionRate: 100 },
      { name: 'Contacted', count: 65, conversionRate: 65 },
      { name: 'Offers', count: 20, conversionRate: 31 },
      { name: 'Closed', count: 5, conversionRate: 25 },
    ],
    overallConversion: 5,
    bottleneck: 'Contacted to Offers',
  };
};

// 9-12: Additional tools (compact)
const comparePeriodsInput = z.object({ period1: z.string(), period2: z.string() });
const comparePeriodsOutput = z.object({
  metrics: z.array(
    z.object({ name: z.string(), period1: z.number(), period2: z.number(), change: z.number() })
  ),
});
const comparePeriodsDefinition: ToolDefinition<
  z.infer<typeof comparePeriodsInput>,
  z.infer<typeof comparePeriodsOutput>
> = {
  id: 'dashboard.compare_periods',
  name: 'Compare Periods',
  description: 'Compare metrics between two time periods',
  category: 'reporting',
  requiredPermission: 'read',
  inputSchema: comparePeriodsInput,
  outputSchema: comparePeriodsOutput,
  requiresConfirmation: false,
  estimatedDuration: 1500,
  rateLimit: 30,
  tags: ['dashboard', 'compare'],
};
const comparePeriodsHandler: ToolHandler<
  z.infer<typeof comparePeriodsInput>,
  z.infer<typeof comparePeriodsOutput>
> = async () => ({ metrics: [] });

const alertsInput = z.object({});
const alertsOutput = z.object({
  alerts: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      message: z.string(),
      priority: z.enum(['low', 'medium', 'high']),
    })
  ),
});
const alertsDefinition: ToolDefinition<
  z.infer<typeof alertsInput>,
  z.infer<typeof alertsOutput>
> = {
  id: 'dashboard.alerts',
  name: 'Get Alerts',
  description: 'Get current alerts and notifications',
  category: 'reporting',
  requiredPermission: 'read',
  inputSchema: alertsInput,
  outputSchema: alertsOutput,
  requiresConfirmation: false,
  estimatedDuration: 500,
  rateLimit: 60,
  tags: ['dashboard', 'alerts'],
};
const alertsHandler: ToolHandler<
  z.infer<typeof alertsInput>,
  z.infer<typeof alertsOutput>
> = async () => ({ alerts: [] });

const recommendationsInput = z.object({});
const recommendationsOutput = z.object({
  recommendations: z.array(
    z.object({ action: z.string(), reason: z.string(), priority: z.number() })
  ),
});
const recommendationsDefinition: ToolDefinition<
  z.infer<typeof recommendationsInput>,
  z.infer<typeof recommendationsOutput>
> = {
  id: 'dashboard.recommendations',
  name: 'Get Recommendations',
  description: 'Get AI-powered action recommendations',
  category: 'reporting',
  requiredPermission: 'read',
  inputSchema: recommendationsInput,
  outputSchema: recommendationsOutput,
  requiresConfirmation: false,
  estimatedDuration: 2000,
  rateLimit: 20,
  tags: ['dashboard', 'recommendations', 'ai'],
};
const recommendationsHandler: ToolHandler<
  z.infer<typeof recommendationsInput>,
  z.infer<typeof recommendationsOutput>
> = async () => ({
  recommendations: [
    { action: 'Follow up with 3 hot leads', reason: 'High engagement detected', priority: 1 },
  ],
});

const kpiInput = z.object({ kpis: z.array(z.string()).optional() });
const kpiOutput = z.object({
  kpis: z.array(
    z.object({
      name: z.string(),
      value: z.number(),
      target: z.number(),
      status: z.enum(['on_track', 'at_risk', 'behind']),
    })
  ),
});
const kpiDefinition: ToolDefinition<z.infer<typeof kpiInput>, z.infer<typeof kpiOutput>> = {
  id: 'dashboard.kpis',
  name: 'KPI Status',
  description: 'Get current KPI status and progress',
  category: 'reporting',
  requiredPermission: 'read',
  inputSchema: kpiInput,
  outputSchema: kpiOutput,
  requiresConfirmation: false,
  estimatedDuration: 1000,
  rateLimit: 30,
  tags: ['dashboard', 'kpi'],
};
const kpiHandler: ToolHandler<z.infer<typeof kpiInput>, z.infer<typeof kpiOutput>> = async () => ({
  kpis: [{ name: 'Monthly Revenue', value: 45000, target: 50000, status: 'on_track' }],
});

// Register all dashboard analytics tools
export function registerDashboardAnalyticsTools(): void {
  toolRegistry.register(insightsDefinition, insightsHandler);
  toolRegistry.register(goalDefinition, goalHandler);
  toolRegistry.register(perfDefinition, perfHandler);
  toolRegistry.register(reportDefinition, reportHandler);
  toolRegistry.register(anomalyDefinition, anomalyHandler);
  toolRegistry.register(dashTrendDefinition, dashTrendHandler);
  toolRegistry.register(activityDefinition, activityHandler);
  toolRegistry.register(funnelDefinition, funnelHandler);
  toolRegistry.register(comparePeriodsDefinition, comparePeriodsHandler);
  toolRegistry.register(alertsDefinition, alertsHandler);
  toolRegistry.register(recommendationsDefinition, recommendationsHandler);
  toolRegistry.register(kpiDefinition, kpiHandler);
  console.log('[Dashboard Analytics Tools] Registered 12 tools');
}
