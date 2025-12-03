'use client';

import { MapPin, Building2, Users, Handshake, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useViewContextSafe, type QuickAction } from '@/contexts/ViewContext';

/**
 * AI Context Bar
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 8
 *
 * Displays current page/entity context in the AI sidebar header
 * with quick action buttons for common operations.
 */

const ENTITY_ICONS = {
  property: Building2,
  buyer: Users,
  deal: Handshake,
  document: FileText,
} as const;

interface AIContextBarProps {
  className?: string;
}

export function AIContextBar({ className }: AIContextBarProps) {
  const viewContext = useViewContextSafe();

  // If no context or no entity, don't render
  if (!viewContext || !viewContext.entity.type) {
    return null;
  }

  const { entity, quickActions } = viewContext;
  const EntityIcon = entity.type ? ENTITY_ICONS[entity.type] : MapPin;

  return (
    <div className={cn('chat-context', className)}>
      {/* Current Context Display */}
      <div className="chat-context__current">
        <EntityIcon className="h-4 w-4" />
        <span>
          Viewing: <strong>{entity.name}</strong>
        </span>
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="chat-context__actions">
          {quickActions.slice(0, 4).map((action) => (
            <QuickActionButton key={action.id} action={action} />
          ))}
        </div>
      )}
    </div>
  );
}

interface QuickActionButtonProps {
  action: QuickAction;
}

function QuickActionButton({ action }: QuickActionButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={action.action}
      className={cn(
        'chat-context__action',
        action.variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90'
      )}
    >
      {action.label}
    </Button>
  );
}

/**
 * Minimal Context Badge
 *
 * Shows just the current page context in the header
 */
interface ContextBadgeProps {
  className?: string;
}

export function ContextBadge({ className }: ContextBadgeProps) {
  const viewContext = useViewContextSafe();

  if (!viewContext) {
    return null;
  }

  return (
    <span className={cn('chat-header__context', className)}>Context: {viewContext.viewLabel}</span>
  );
}
