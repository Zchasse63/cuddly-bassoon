'use client';

/**
 * AI Onboarding Modal
 *
 * Interactive first-run experience showing AI capabilities.
 * Users learn by trying example prompts, not reading documentation.
 */

import { useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Search,
  Calculator,
  Users,
  TrendingUp,
  DollarSign,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFeaturedTools } from '@/lib/ai/tool-discovery';
import type { DiscoveryToolDefinition } from '@/lib/ai/tool-discovery/types';

// Icon mapping for dynamic icon rendering
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Search,
  Calculator,
  Users,
  TrendingUp,
  DollarSign,
  MessageSquare,
  UserSearch: Users,
  Scale: Calculator,
  Mail: MessageSquare,
  Target: Sparkles,
  Phone: MessageSquare,
  FileText: MessageSquare,
  Home: Search,
};

interface OnboardingModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when user clicks "Try this" on an example */
  onTryExample: (prompt: string) => void;
  /** Callback when user wants to open the command palette */
  onOpenToolPalette: () => void;
}

interface OnboardingCardProps {
  tool: DiscoveryToolDefinition;
  onTry: () => void;
}

function OnboardingCard({ tool, onTry }: OnboardingCardProps) {
  const Icon = iconMap[tool.icon] || Sparkles;
  const firstExample = tool.examples[0];

  return (
    <div
      className={cn(
        'group relative flex flex-col p-4 rounded-lg border bg-card',
        'hover:border-primary/50 hover:shadow-md transition-all duration-200',
        'cursor-pointer'
      )}
      onClick={onTry}
    >
      <div className="flex items-start gap-3 mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
            'bg-primary/10 text-primary'
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm">{tool.displayName}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {tool.shortDescription}
          </p>
        </div>
      </div>

      <div className="flex-1">
        <p className="text-sm text-foreground font-mono bg-muted/50 p-2 rounded text-left line-clamp-2">
          &ldquo;{firstExample?.prompt}&rdquo;
        </p>
      </div>

      <div className="flex justify-end mt-3">
        <Button
          size="sm"
          variant="ghost"
          className="text-xs gap-1 group-hover:text-primary group-hover:bg-primary/10"
        >
          Try this
          <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function OnboardingModal({
  isOpen,
  onClose,
  onTryExample,
  onOpenToolPalette,
}: OnboardingModalProps) {
  const featuredTools = getFeaturedTools();

  const handleTryExample = useCallback(
    (prompt: string) => {
      onTryExample(prompt);
      onClose();
    },
    [onTryExample, onClose]
  );

  const handleBrowseAll = useCallback(() => {
    onOpenToolPalette();
    onClose();
  }, [onOpenToolPalette, onClose]);

  const handleDismiss = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center pb-2">
          <div className="flex justify-center mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl">What can Scout help you with?</DialogTitle>
          <DialogDescription className="text-base">
            Scout is your AI assistant for finding deals, analyzing properties, and connecting
            with buyers. Try any of these:
          </DialogDescription>
        </DialogHeader>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-4">
          {featuredTools.map((tool) => (
            <OnboardingCard
              key={tool.slug}
              tool={tool}
              onTry={() => handleTryExample(tool.examples[0]?.prompt || '')}
            />
          ))}
        </div>

        {/* Pro Tip */}
        <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
            <Zap className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-sm">
              <span className="font-medium">Pro tip:</span> You can also click the{' '}
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">
                <Zap className="h-3 w-3 inline" />
              </kbd>{' '}
              button in the chat to browse all tools, or press{' '}
              <kbd className="px-1.5 py-0.5 bg-background rounded border text-xs">
                ⌘K
              </kbd>{' '}
              anytime.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-4">
          <Button variant="outline" onClick={handleBrowseAll}>
            Browse all tools
          </Button>
          <Button onClick={handleDismiss}>
            Got it, let&apos;s go
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
