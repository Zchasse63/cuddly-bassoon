'use client';

/**
 * Motivation Score Card Component
 *
 * Detailed view of seller motivation score with all factors,
 * owner classification, and recommendations.
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
  Brain,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Zap,
  User,
  Building2,
  Landmark,
  AlertTriangle,
  Clock,
  Target,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';
import { MotivationScoreBadge } from './MotivationScoreBadge';

interface ScoringFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

interface AIAdjustment {
  factor: string;
  adjustment: number;
  reasoning: string;
}

interface Predictions {
  timeToDecision: string;
  bestApproachTiming: string;
  optimalOfferRange: { min: number; max: number };
}

interface OwnerClassification {
  primaryClass: 'individual' | 'investor_entity' | 'institutional_distressed';
  subClass: string;
  confidence: number;
}

interface MotivationScoreCardProps {
  score: number;
  confidence: number;
  factors: ScoringFactor[];
  recommendation: string;
  ownerClassification?: OwnerClassification;
  modelUsed?: string;
  riskFactors?: string[];
  // DealFlow IQ fields (optional)
  dealFlowIQ?: {
    iqScore: number;
    aiAdjustments: AIAdjustment[];
    predictions: Predictions;
  };
  // Actions
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

function getOwnerIcon(primaryClass?: string) {
  switch (primaryClass) {
    case 'individual':
      return User;
    case 'investor_entity':
      return Building2;
    case 'institutional_distressed':
      return Landmark;
    default:
      return User;
  }
}

function getOwnerLabel(primaryClass?: string, subClass?: string): { primary: string; sub: string } {
  const labels: Record<string, string> = {
    individual: 'Individual Owner',
    investor_entity: 'Investor/Entity',
    institutional_distressed: 'Institutional/Distressed',
    owner_occupied: 'Owner Occupied',
    absentee: 'Absentee Owner',
    inherited: 'Inherited Property',
    out_of_state: 'Out of State',
    small_investor: 'Small Investor (1-4 properties)',
    portfolio_investor: 'Portfolio Investor (5+)',
    llc_single: 'Single-Property LLC',
    llc_multi: 'Multi-Property LLC',
    corporate: 'Corporation',
    trust_living: 'Living Trust',
    trust_irrevocable: 'Irrevocable Trust',
    bank_reo: 'Bank REO',
    government_federal: 'Federal Government',
    government_state: 'State Government',
    government_local: 'Local Government',
    tax_lien: 'Tax Lien',
    estate_probate: 'Estate/Probate',
    estate_executor: 'Executor Sale',
  };

  return {
    primary: labels[primaryClass || ''] || 'Unknown',
    sub: labels[subClass || ''] || subClass || 'Unknown',
  };
}

function getImpactIcon(impact: string) {
  switch (impact) {
    case 'positive':
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    case 'negative':
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    default:
      return <Minus className="h-4 w-4 text-amber-500" />;
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function MotivationScoreCard({
  score,
  confidence,
  factors,
  recommendation,
  ownerClassification,
  modelUsed,
  riskFactors,
  dealFlowIQ,
  onRefresh,
  isLoading,
  className,
}: MotivationScoreCardProps) {
  const [showFactors, setShowFactors] = useState(false);
  const [showAIDetails, setShowAIDetails] = useState(false);

  const OwnerIcon = getOwnerIcon(ownerClassification?.primaryClass);
  const ownerLabels = getOwnerLabel(
    ownerClassification?.primaryClass,
    ownerClassification?.subClass
  );

  return (
    <Card className={cn('card-elevated', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-brand-500" />
              Seller Motivation Analysis
            </CardTitle>
            <CardDescription>
              AI-powered analysis of seller motivation signals
            </CardDescription>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Score Display */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Standard Score</div>
            <div className="flex items-center gap-3">
              <MotivationScoreBadge
                score={score}
                confidence={confidence}
                ownerType={ownerClassification?.primaryClass}
                size="lg"
                showTooltip={false}
              />
              <span className="text-sm text-muted-foreground">
                {confidence >= 0.7 ? 'High' : confidence >= 0.4 ? 'Medium' : 'Low'} confidence
              </span>
            </div>
          </div>

          {dealFlowIQ && (
            <div className="space-y-1 text-right">
              <div className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                <Zap className="h-4 w-4 text-brand-500" />
                DealFlow IQ™
              </div>
              <MotivationScoreBadge
                score={dealFlowIQ.iqScore}
                size="lg"
                variant="dealflow_iq"
                showTooltip={false}
              />
            </div>
          )}
        </div>

        {/* Owner Classification */}
        {ownerClassification && (
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              <OwnerIcon className="h-5 w-5 text-brand-600" />
            </div>
            <div className="flex-1">
              <div className="font-medium">{ownerLabels.primary}</div>
              <div className="text-sm text-muted-foreground">{ownerLabels.sub}</div>
            </div>
            <Badge variant="outline" className="text-xs">
              {Math.round(ownerClassification.confidence * 100)}% confidence
            </Badge>
          </div>
        )}

        {/* Recommendation */}
        <div className="p-4 bg-brand-50 dark:bg-brand-900/20 rounded-lg border border-brand-200 dark:border-brand-800">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-brand-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-brand-800 dark:text-brand-200 mb-1">
                Recommendation
              </div>
              <p className="text-sm text-brand-700 dark:text-brand-300">{recommendation}</p>
            </div>
          </div>
        </div>

        {/* DealFlow IQ Predictions */}
        {dealFlowIQ?.predictions && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">Decision Time</div>
              <div className="font-medium">{dealFlowIQ.predictions.timeToDecision}</div>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <Target className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">Best Timing</div>
              <div className="font-medium text-sm">{dealFlowIQ.predictions.bestApproachTiming}</div>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Target className="h-5 w-5 mx-auto mb-1 text-green-600" />
              <div className="text-xs text-muted-foreground">Offer Range</div>
              <div className="font-medium text-green-600">
                {formatCurrency(dealFlowIQ.predictions.optimalOfferRange.min)} -{' '}
                {formatCurrency(dealFlowIQ.predictions.optimalOfferRange.max)}
              </div>
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {riskFactors && riskFactors.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-600">
              <AlertTriangle className="h-4 w-4" />
              Risk Factors
            </div>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {riskFactors.map((risk, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-1">•</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Separator />

        {/* Scoring Factors Collapsible */}
        <Collapsible open={showFactors} onOpenChange={setShowFactors}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="text-sm font-medium">Scoring Factors ({factors.length})</span>
              {showFactors ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 pt-3">
            {factors.map((factor, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getImpactIcon(factor.impact)}
                    <span className="font-medium text-sm">{factor.name}</span>
                  </div>
                  <Badge
                    variant={
                      factor.impact === 'positive'
                        ? 'success'
                        : factor.impact === 'negative'
                          ? 'destructive'
                          : 'secondary'
                    }
                    className="text-xs"
                  >
                    {Math.round(factor.weight * 100)}% weight
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground pl-6">{factor.description}</p>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        {/* AI Adjustments Collapsible (if DealFlow IQ) */}
        {dealFlowIQ?.aiAdjustments && dealFlowIQ.aiAdjustments.length > 0 && (
          <Collapsible open={showAIDetails} onOpenChange={setShowAIDetails}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Zap className="h-4 w-4 text-brand-500" />
                  AI Adjustments ({dealFlowIQ.aiAdjustments.length})
                </span>
                {showAIDetails ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-3 pt-3">
              {dealFlowIQ.aiAdjustments.map((adj, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div
                    className={cn(
                      'text-sm font-bold min-w-[40px] text-center',
                      adj.adjustment > 0 ? 'text-green-600' : 'text-red-600'
                    )}
                  >
                    {adj.adjustment > 0 ? '+' : ''}
                    {adj.adjustment}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{adj.factor}</div>
                    <p className="text-sm text-muted-foreground">{adj.reasoning}</p>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Model Info */}
        {modelUsed && (
          <div className="text-xs text-muted-foreground text-center">
            Model: {modelUsed} • Confidence: {Math.round(confidence * 100)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}
