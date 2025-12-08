'use client';

import { cn } from '@/lib/utils';
import { Sentiment, Suggestion } from './types';
import { Sparkles, Zap, AlertTriangle, Lightbulb } from 'lucide-react';

interface LiveAssistProps {
  sentiment: Sentiment;
  suggestions: Suggestion[];
  insights: string[]; // e.g. "Objection: Price too low"
  onApplySuggestion: (text: string) => void;
  className?: string;
}

export function LiveAssist({
  sentiment,
  suggestions,
  insights,
  onApplySuggestion,
  className,
}: LiveAssistProps) {
  return (
    <div className={cn('flex flex-col h-full glass-card p-4 space-y-6', className)}>
      <div className="flex items-center gap-2 pb-4 border-b border-border/10">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-semibold text-sm">Scout Live Assist</h3>
      </div>

      {/* Sentiment Analysis */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Contact Sentiment
        </h4>
        <div className="flex items-center gap-4 p-4 rounded-xl glass-subtle bg-background/30">
          <div className="relative">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-1000',
                sentiment === 'positive' &&
                  'bg-emerald-500/20 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.4)]',
                sentiment === 'neutral' &&
                  'bg-amber-500/20 text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.4)]',
                sentiment === 'negative' &&
                  'bg-red-500/20 text-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
              )}
            >
              <Zap className="h-6 w-6" />
            </div>
          </div>
          <div>
            <p className="font-medium text-sm capitalize">{sentiment}</p>
            <p className="text-xs text-muted-foreground">
              {sentiment === 'positive'
                ? 'Highly engaged and receptive.'
                : sentiment === 'negative'
                  ? 'Showing signs of frustration.'
                  : 'Neutral tone detected.'}
            </p>
          </div>
        </div>
      </div>

      {/* Insights / Objections */}
      {insights.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Detected Insights
          </h4>
          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-3 rounded-lg glass-subtle border border-amber-500/20 bg-amber-500/5"
              >
                <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-medium">{insight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Responses */}
      <div className="space-y-3 flex-1">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Suggested Responses
        </h4>
        <div className="space-y-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => onApplySuggestion(suggestion.text)}
              className="w-full text-left p-3 rounded-xl glass-subtle hover:bg-white/10 hover:scale-[1.02] active:scale-[0.98] transition-all group border border-transparent hover:border-primary/20"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
                  {Math.round(suggestion.confidence * 100)}% Match
                </span>
                <Lightbulb className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs leading-relaxed text-foreground/90">
                &ldquo;{suggestion.text}&rdquo;
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
