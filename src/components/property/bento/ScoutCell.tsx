'use client';

/**
 * ScoutCell - Proactive AI Insights
 *
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 4.2
 * Auto-fetches insights on page load, shows skeleton while processing
 */

import { useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertTriangle, TrendingUp, Lightbulb, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScoutOrb } from '@/components/ai/ScoutOrb';
import { Button } from '@/components/ui/button';
import type { ScoutCellProps } from './types';

interface Insight {
  type: 'opportunity' | 'risk' | 'action';
  title: string;
  description: string;
}

export const ScoutCell = memo(function ScoutCell({ property, className, autoFetch = true }: ScoutCellProps) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(autoFetch);
  const [orbState, setOrbState] = useState<'idle' | 'thinking' | 'success'>('idle');

  useEffect(() => {
    if (!autoFetch) return;

    const fetchInsights = async () => {
      setOrbState('thinking');
      setIsLoading(true);

      try {
        // Simulate AI analysis - in production, this would call the AI endpoint
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate insights based on property data
        const generatedInsights: Insight[] = [];
        
        // Equity-based insight
        if (property.equityPercent && property.equityPercent > 50) {
          generatedInsights.push({
            type: 'opportunity',
            title: 'High Equity Opportunity',
            description: `${property.equityPercent.toFixed(0)}% equity suggests strong negotiation leverage.`
          });
        }

        // Absentee owner insight
        if (property.isOwnerOccupied === false) {
          generatedInsights.push({
            type: 'opportunity',
            title: 'Absentee Owner',
            description: 'Non-owner occupied properties often have more motivated sellers.'
          });
        }

        // Age-based insight
        if (property.yearBuilt && property.yearBuilt < 1970) {
          generatedInsights.push({
            type: 'risk',
            title: 'Older Construction',
            description: 'Built before 1970 - consider inspection for lead paint and outdated systems.'
          });
        }

        // Recommended action
        generatedInsights.push({
          type: 'action',
          title: 'Recommended Next Step',
          description: property.ownerDetails?.phone
            ? 'Contact owner directly to gauge motivation level.'
            : 'Run skip trace to obtain owner contact information.'
        });

        setInsights(generatedInsights);
        setOrbState('success');
      } catch (error) {
        console.error('Failed to fetch insights:', error);
        setOrbState('idle');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, [autoFetch, property]);

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'opportunity':
        return <TrendingUp className="h-4 w-4 text-[var(--fluid-success)]" />;
      case 'risk':
        return <AlertTriangle className="h-4 w-4 text-[var(--fluid-warning)]" />;
      case 'action':
        return <Lightbulb className="h-4 w-4 text-[var(--fluid-primary)]" />;
    }
  };

  return (
    <motion.div
      layout
      className={cn('bento-cell bento-scout', className)}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <ScoutOrb state={orbState} size="sm" />
        <div>
          <h3 className="font-semibold text-[var(--fluid-text-primary)]">Scout Insights</h3>
          <p className="text-sm text-[var(--fluid-text-secondary)]">
            {isLoading ? 'Analyzing property...' : `${insights.length} insights found`}
          </p>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bento-skeleton bento-skeleton-cell h-16" />
          ))}
        </div>
      )}

      {/* Insights List */}
      {!isLoading && (
        <div className="space-y-3">
          {insights.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-3 rounded-lg bg-[var(--surface-glass-subtle)] hover:bg-[var(--surface-glass-base)] transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-2">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <p className="text-xs text-[var(--fluid-text-secondary)] mt-0.5">
                    {insight.description}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--fluid-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Ask Scout Button */}
      <Button
        variant="ghost"
        className="w-full mt-4 text-[var(--fluid-primary)] hover:bg-[var(--fluid-primary)]/10"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Ask Scout about this property
      </Button>
    </motion.div>
  );
});

