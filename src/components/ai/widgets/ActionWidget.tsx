'use client';

/**
 * Action Widget
 *
 * Source: Fluid_OS_Master_Plan.md Phase 3.4
 *
 * Displays actionable buttons in AI chat responses.
 * Allows Scout to suggest and execute actions directly in conversation.
 */

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Phone,
  Mail,
  FileText,
  Briefcase,
  Search,
  MapPin,
  Users,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { springPresets } from '@/lib/animations';

export type ActionType =
  | 'analyze'
  | 'skip_trace'
  | 'send_email'
  | 'send_sms'
  | 'create_deal'
  | 'find_comps'
  | 'find_buyers'
  | 'view_on_map'
  | 'generate_document'
  | 'custom';

export interface ActionItem {
  type: ActionType;
  label: string;
  description?: string;
  icon?: ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}

const ACTION_ICONS: Record<ActionType, ReactNode> = {
  analyze: <Sparkles className="h-4 w-4" />,
  skip_trace: <Phone className="h-4 w-4" />,
  send_email: <Mail className="h-4 w-4" />,
  send_sms: <Phone className="h-4 w-4" />,
  create_deal: <Briefcase className="h-4 w-4" />,
  find_comps: <Search className="h-4 w-4" />,
  find_buyers: <Users className="h-4 w-4" />,
  view_on_map: <MapPin className="h-4 w-4" />,
  generate_document: <FileText className="h-4 w-4" />,
  custom: <ArrowRight className="h-4 w-4" />,
};

interface ActionWidgetProps {
  /** Title shown above actions */
  title?: string;
  /** List of actions to display */
  actions: ActionItem[];
  /** Layout mode */
  layout?: 'horizontal' | 'vertical' | 'grid';
  /** Additional class names */
  className?: string;
}

export function ActionWidget({
  title = 'Suggested Actions',
  actions,
  layout = 'horizontal',
  className,
}: ActionWidgetProps) {
  const layoutStyles = {
    horizontal: 'flex flex-wrap gap-2',
    vertical: 'flex flex-col gap-2',
    grid: 'grid grid-cols-2 gap-2',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.standard}
      className={cn('glass-subtle rounded-xl p-3', className)}
    >
      {title && (
        <p className="text-xs font-medium text-muted-foreground mb-2.5 flex items-center gap-1.5">
          <Sparkles className="h-3 w-3" />
          {title}
        </p>
      )}

      <div className={layoutStyles[layout]}>
        {actions.map((action, index) => (
          <ActionButton key={`${action.type}-${index}`} action={action} />
        ))}
      </div>
    </motion.div>
  );
}

interface ActionButtonProps {
  action: ActionItem;
}

function ActionButton({ action }: ActionButtonProps) {
  const icon = action.icon || ACTION_ICONS[action.type];

  const buttonContent = (
    <>
      {icon}
      <span>{action.label}</span>
    </>
  );

  const buttonClass = cn(
    'h-auto py-2 px-3 justify-start gap-2 text-sm',
    'transition-all hover:scale-[1.02]',
    action.variant === 'default' && 'bg-brand-500 hover:bg-brand-600 text-white',
  );

  if (action.href) {
    return (
      <Button
        asChild
        variant={action.variant || 'outline'}
        className={buttonClass}
        disabled={action.disabled}
      >
        <a href={action.href}>{buttonContent}</a>
      </Button>
    );
  }

  return (
    <Button
      variant={action.variant || 'outline'}
      className={buttonClass}
      onClick={action.onClick}
      disabled={action.disabled}
    >
      {buttonContent}
    </Button>
  );
}

/**
 * Single prominent action button
 */
export function PrimaryAction({
  action,
  className,
}: {
  action: ActionItem;
  className?: string;
}) {
  const icon = action.icon || ACTION_ICONS[action.type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springPresets.snappy}
    >
      <Button
        variant="default"
        className={cn(
          'w-full h-auto py-3 px-4 justify-between',
          'bg-gradient-to-r from-brand-500 to-brand-600',
          'hover:from-brand-600 hover:to-brand-700',
          'text-white shadow-lg shadow-brand-500/20',
          'transition-all hover:scale-[1.02] hover:shadow-brand-500/30',
          className
        )}
        onClick={action.onClick}
        disabled={action.disabled}
      >
        <div className="flex items-center gap-2">
          {icon}
          <div className="text-left">
            <div className="font-semibold">{action.label}</div>
            {action.description && (
              <div className="text-xs opacity-80">{action.description}</div>
            )}
          </div>
        </div>
        <ArrowRight className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}
