'use client';

/**
 * Proactive AI Insights Component
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md
 * Displays context-aware AI suggestions without user prompting
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useViewContextSafe } from '@/contexts/ViewContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronRight,
  X,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Insight {
  id: string;
  type: 'suggestion' | 'alert' | 'opportunity' | 'reminder';
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  metadata?: Record<string, unknown>;
  priority: 'high' | 'medium' | 'low';
}

interface ProactiveInsightsProps {
  className?: string;
  maxInsights?: number;
  /** Custom insights to display */
  customInsights?: Insight[];
  /** Callback when AI action is triggered */
  onAIAction?: (prompt: string) => void;
}

// Generate context-specific insights based on current view and entity
function generateInsights(
  view: string,
  entity: { type: string | null; name: string | null; data?: Record<string, unknown> } | null,
  navigate: (path: string) => void
): Insight[] {
  const insights: Insight[] = [];

  // Dashboard insights
  if (view === 'dashboard') {
    insights.push({
      id: 'dash-stale-deals',
      type: 'alert',
      title: '3 deals need attention',
      description: 'These deals have been stale for 7+ days. Consider following up.',
      priority: 'high',
      action: {
        label: 'View Stale Deals',
        onClick: () => navigate('/deals?filter=stale'),
      },
    });
    insights.push({
      id: 'dash-new-matches',
      type: 'opportunity',
      title: '12 new property matches',
      description: 'Properties matching your saved filters were found.',
      priority: 'medium',
      action: {
        label: 'View Matches',
        onClick: () => navigate('/properties'),
      },
    });
  }

  // Property detail insights
  if (view === 'property-detail' && entity?.data) {
    const data = entity.data as Record<string, unknown>;
    const equity = data.equity as number | undefined;
    const value = data.value as number | undefined;

    if (equity && equity > 50) {
      insights.push({
        id: 'prop-high-equity',
        type: 'opportunity',
        title: 'High equity property',
        description: `${equity}% equity indicates a motivated seller opportunity. Consider reaching out.`,
        priority: 'high',
      });
    }

    if (value) {
      insights.push({
        id: 'prop-calc-mao',
        type: 'suggestion',
        title: 'Calculate Max Allowable Offer',
        description: `Based on est. value of $${value.toLocaleString()}, your MAO could be $${Math.round(value * 0.7 - 25000).toLocaleString()} (70% rule - $25k repairs)`,
        priority: 'medium',
      });
    }

    insights.push({
      id: 'prop-matched-buyers',
      type: 'suggestion',
      title: 'Find matching buyers',
      description: 'Ask AI to identify buyers in your network that match this property.',
      priority: 'low',
    });
  }

  // Deal detail insights
  if (view === 'deal-detail' && entity?.data) {
    const data = entity.data as Record<string, unknown>;
    const stage = data.stage as string | undefined;
    const daysInStage = data.daysInStage as number | undefined;

    if (daysInStage && daysInStage > 7) {
      insights.push({
        id: 'deal-stale',
        type: 'alert',
        title: 'Deal needs attention',
        description: `This deal has been in "${stage}" for ${daysInStage} days. Consider following up or updating status.`,
        priority: 'high',
      });
    }

    if (stage === 'offer') {
      insights.push({
        id: 'deal-offer-tips',
        type: 'suggestion',
        title: 'Offer stage tips',
        description:
          'AI can help you draft a compelling offer letter or suggest negotiation tactics.',
        priority: 'medium',
      });
    }

    if (stage === 'contract') {
      insights.push({
        id: 'deal-find-buyer',
        type: 'suggestion',
        title: 'Time to find a buyer',
        description: 'Contract signed! AI can help match this deal to buyers in your network.',
        priority: 'high',
      });
    }
  }

  // Buyer detail insights
  if (view === 'buyer-detail' && entity?.data) {
    const data = entity.data as Record<string, unknown>;
    const tier = data.tier as string | undefined;
    const lastContact = data.lastContact as string | undefined;

    if (tier === 'A') {
      insights.push({
        id: 'buyer-tier-a',
        type: 'opportunity',
        title: 'Tier A buyer',
        description: 'This is a high-priority buyer. Consider sending them your best deals first.',
        priority: 'medium',
      });
    }

    if (lastContact) {
      const daysSince = Math.floor(
        (Date.now() - new Date(lastContact).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSince > 14) {
        insights.push({
          id: 'buyer-followup',
          type: 'reminder',
          title: 'Follow up needed',
          description: `It's been ${daysSince} days since you last contacted this buyer.`,
          priority: 'medium',
          action: {
            label: 'Log Contact',
            onClick: () => {},
          },
        });
      }
    }
  }

  // Analytics insights
  if (view === 'analytics') {
    insights.push({
      id: 'analytics-trend',
      type: 'opportunity',
      title: 'Deal velocity up 15%',
      description: 'Your deals are closing faster this month. Keep up the momentum!',
      priority: 'low',
    });
  }

  return insights;
}

const insightIcons: Record<Insight['type'], typeof Sparkles> = {
  suggestion: Lightbulb,
  alert: AlertTriangle,
  opportunity: TrendingUp,
  reminder: Clock,
};

const insightColors: Record<Insight['type'], string> = {
  suggestion: 'bg-[var(--fluid-primary)]/10 text-[var(--fluid-primary)]',
  alert: 'bg-[var(--fluid-warning)]/10 text-[var(--fluid-warning)]',
  opportunity: 'bg-[var(--fluid-success)]/10 text-[var(--fluid-success)]',
  reminder: 'bg-[var(--fluid-accent)]/10 text-[var(--fluid-accent)]',
};

export function ProactiveInsights({
  className,
  maxInsights = 3,
  customInsights,
  onAIAction: _onAIAction,
}: ProactiveInsightsProps) {
  const router = useRouter();
  const viewContext = useViewContextSafe();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [_isLoading, _setIsLoading] = useState(false);

  // Navigate function for insights
  const navigate = useCallback(
    (path: string) => {
      router.push(path);
    },
    [router]
  );

  // Generate insights based on context
  const insights = useMemo(() => {
    if (customInsights) return customInsights;
    if (!viewContext) return [];

    const entityForInsights = viewContext.entity
      ? {
          type: viewContext.entity.type,
          name: viewContext.entity.name,
          data: viewContext.entity.metadata,
        }
      : null;

    return generateInsights(viewContext.currentView, entityForInsights, navigate);
  }, [viewContext, customInsights, navigate]);

  // Filter out dismissed insights and limit count
  const visibleInsights = useMemo(() => {
    return insights
      .filter((insight) => !dismissedIds.has(insight.id))
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, maxInsights);
  }, [insights, dismissedIds, maxInsights]);

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => new Set([...prev, id]));
  };

  if (visibleInsights.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Sparkles className="h-4 w-4 text-brand-500" />
        <span>AI Insights</span>
      </div>

      <div className="space-y-2">
        {visibleInsights.map((insight) => {
          const Icon = insightIcons[insight.type];
          const colorClass = insightColors[insight.type];

          return (
            <Card
              key={insight.id}
              className={cn(
                'relative overflow-hidden transition-all hover:shadow-md',
                insight.priority === 'high' && 'ring-1 ring-amber-200 dark:ring-amber-800'
              )}
            >
              <CardContent className="p-3">
                <div className="flex gap-3">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      colorClass
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-sm">{insight.title}</div>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="h-5 w-5 -mr-1 -mt-1 opacity-50 hover:opacity-100"
                        onClick={() => handleDismiss(insight.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {insight.description}
                    </p>

                    {insight.action && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 mt-2 text-xs"
                        onClick={insight.action.onClick}
                      >
                        {insight.action.label}
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Daily Briefing Card - Shows on dashboard
 */
export function DailyBriefingCard({ className }: { className?: string }) {
  const [briefing, setBriefing] = useState<{
    summary: string;
    highlights: string[];
    loading: boolean;
  }>({
    summary: '',
    highlights: [],
    loading: true,
  });

  useEffect(() => {
    // Simulate fetching daily briefing (would be API call in production)
    const timer = setTimeout(() => {
      setBriefing({
        summary:
          'Good morning! You have 3 deals requiring follow-up today. Your pipeline value increased 12% this week.',
        highlights: [
          '3 deals need follow-up (stale 7+ days)',
          '12 new properties match your filters',
          '2 buyers are interested in your latest deal',
        ],
        loading: false,
      });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (briefing.loading) {
    return (
      <Card className={cn('card-elevated', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
            <span className="text-sm text-muted-foreground">Loading your daily briefing...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'card-elevated bg-gradient-to-r from-brand-50 to-brand-100/50 dark:from-brand-900/20 dark:to-brand-800/10 border-brand-200 dark:border-brand-800',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-brand-500 text-white flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold">Daily Briefing</h3>
              <Badge variant="secondary" className="text-xs">
                AI
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{briefing.summary}</p>
            <ul className="space-y-1">
              {briefing.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm">
                  <ChevronRight className="h-3 w-3 text-brand-500" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Stale Deals Alert - Proactive notification about deals needing attention
 */
export function StaleDealsAlert({
  staleDealCount,
  onViewDeals,
  className,
}: {
  staleDealCount: number;
  onViewDeals: () => void;
  className?: string;
}) {
  if (staleDealCount === 0) return null;

  return (
    <Card
      className={cn(
        'card-elevated border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10',
        className
      )}
    >
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium text-sm">
                {staleDealCount} deal{staleDealCount > 1 ? 's' : ''} need attention
              </div>
              <div className="text-xs text-muted-foreground">Stale for 7+ days</div>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onViewDeals}>
            View Deals
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
