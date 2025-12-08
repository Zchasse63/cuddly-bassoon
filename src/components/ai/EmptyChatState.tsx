'use client';

/**
 * Empty Chat State Component
 *
 * Shown when the chat has no messages. Provides quick action buttons
 * to help users get started with common tasks.
 */

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Search, Calculator, Users, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// Simplified quick action for empty state
interface QuickStartAction {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  prompt: string;
  color: string;
}

const QUICK_START_ACTIONS: QuickStartAction[] = [
  {
    id: 'find-deals',
    label: 'Find Deals',
    icon: Search,
    prompt: 'Find 3 bed houses with tired landlords under $200k',
    color: 'bg-[var(--fluid-primary)]/10 text-[var(--fluid-primary)] hover:bg-[var(--fluid-primary)]/20',
  },
  {
    id: 'analyze',
    label: 'Analyze Deals',
    icon: Calculator,
    prompt: 'Analyze this property for a potential wholesale deal',
    color: 'bg-[var(--fluid-success)]/10 text-[var(--fluid-success)] hover:bg-[var(--fluid-success)]/20',
  },
  {
    id: 'find-buyers',
    label: 'Find Buyers',
    icon: Users,
    prompt: 'Find cash buyers for this property',
    color: 'bg-[var(--fluid-accent)]/10 text-[var(--fluid-accent)] hover:bg-[var(--fluid-accent)]/20',
  },
  {
    id: 'market-intel',
    label: 'Market Intel',
    icon: TrendingUp,
    prompt: "How's the Tampa market doing?",
    color: 'bg-[var(--fluid-warning)]/10 text-[var(--fluid-warning)] hover:bg-[var(--fluid-warning)]/20',
  },
];

interface EmptyChatStateProps {
  /** Callback when user clicks a quick action */
  onActionClick: (prompt: string) => void;
  /** Optional class name */
  className?: string;
  /** Whether to show the full version or compact version */
  variant?: 'full' | 'compact';
}

/**
 * Full empty state with prominent quick actions
 */
function FullEmptyState({ onActionClick, className }: EmptyChatStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-6 text-center', className)}>
      <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <Sparkles className="h-7 w-7 text-primary" />
      </div>

      <h2 className="text-lg font-semibold mb-1">What would you like to do?</h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-md">
        Ask Scout anything about properties, deals, buyers, or markets. Try one of these to get
        started:
      </p>

      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {QUICK_START_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant="outline"
              className={cn(
                'h-auto py-3 px-4 flex flex-col items-center gap-2 border-2',
                'hover:border-primary/50 transition-all'
              )}
              onClick={() => onActionClick(action.prompt)}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  action.color
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm">{action.label}</span>
            </Button>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground mt-6">Or just start typing what you need...</p>
    </div>
  );
}

/**
 * Compact empty state (inline with chat input)
 */
function CompactEmptyState({ onActionClick, className }: EmptyChatStateProps) {
  return (
    <div className={cn('px-4 py-3', className)}>
      <p className="text-sm text-muted-foreground mb-3">Try one of these:</p>
      <div className="flex flex-wrap gap-2">
        {QUICK_START_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => onActionClick(action.prompt)}
            >
              <Icon className="h-3.5 w-3.5" />
              {action.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Empty Chat State - shows when chat has no messages
 */
export function EmptyChatState({
  onActionClick,
  className,
  variant = 'full',
}: EmptyChatStateProps) {
  if (variant === 'compact') {
    return <CompactEmptyState onActionClick={onActionClick} className={className} />;
  }

  return <FullEmptyState onActionClick={onActionClick} className={className} />;
}

/**
 * Suggested prompts based on current context
 */
type PromptContext = 'dashboard' | 'properties' | 'buyers' | 'deals' | 'map' | 'general';

interface SuggestedPromptsProps {
  /** Current page/view context */
  context?: PromptContext;
  /** Callback when user clicks a prompt */
  onPromptClick: (prompt: string) => void;
  /** Optional class name */
  className?: string;
}

const CONTEXT_PROMPTS: Record<PromptContext, string[]> = {
  dashboard: [
    'Show me my pipeline summary',
    'What deals need attention today?',
    'Analyze my recent activity',
  ],
  properties: [
    'Find properties with high equity in this area',
    'Search for absentee owners',
    'Show me recently listed properties',
  ],
  buyers: [
    'Who are my most active buyers?',
    'Find buyers for this property type',
    'Match buyers to my available deals',
  ],
  deals: [
    'Which deals are stalled?',
    'Analyze my conversion rates',
    "What's my projected revenue?",
  ],
  map: [
    'Show distress indicators on the map',
    'Find properties in this area',
    "What's the market velocity here?",
  ],
  general: ['Help me find motivated sellers', 'Analyze a deal for me', 'Search for cash buyers'],
};

export function SuggestedPrompts({
  context = 'general',
  onPromptClick,
  className,
}: SuggestedPromptsProps) {
  const prompts = useMemo(() => {
    return CONTEXT_PROMPTS[context] || CONTEXT_PROMPTS.general;
  }, [context]);

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {prompts.map((prompt, idx) => (
        <button
          key={idx}
          onClick={() => onPromptClick(prompt)}
          className={cn(
            'text-xs px-3 py-1.5 rounded-full border',
            'bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground',
            'transition-colors'
          )}
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
