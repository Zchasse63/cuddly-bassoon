'use client';

import { MapPin, Building2, Users, Handshake, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useViewContextSafe, type QuickAction } from '@/contexts/ViewContext';
import { fadeUpVariants, springPresets } from '@/lib/animations';

/**
 * AI Context Bar
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 8
 * Updated to Fluid OS Glass Design System
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
  isProcessing?: boolean;
  activeTools?: string[];
}

export function AIContextBar({ className, isProcessing = false, activeTools = [] }: AIContextBarProps) {
  const viewContext = useViewContextSafe();

  // If no context or no entity, don't render
  if (!viewContext || !viewContext.entity.type) {
    return null;
  }

  const { entity, quickActions } = viewContext;
  const EntityIcon = entity.type ? ENTITY_ICONS[entity.type] : MapPin;

  return (
    <motion.div
      variants={fadeUpVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(
        'glass-subtle border border-white/10 rounded-xl p-4 space-y-3',
        className
      )}
    >
      {/* Current Context Display - Glass Pill */}
      <div className="flex items-center gap-2 flex-wrap">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={springPresets.snappy}
          className="glass-base rounded-full px-3 py-1.5 flex items-center gap-2 text-sm"
        >
          <EntityIcon className="h-4 w-4 text-[var(--fluid-text-secondary)]" />
          <span className="text-[var(--fluid-text-primary)]">
            Viewing: <strong className="font-semibold">{entity.name}</strong>
          </span>
        </motion.div>

        {/* Active Tools Indicator */}
        {isProcessing && activeTools.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={springPresets.snappy}
            className="glass-base rounded-full px-3 py-1.5 flex items-center gap-2 text-sm"
          >
            <div className="flex items-center gap-1">
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[var(--scout-thinking)]"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[var(--scout-thinking)]"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.2,
                }}
              />
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-[var(--scout-thinking)]"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 0.4,
                }}
              />
            </div>
            <span className="text-[var(--fluid-text-secondary)] text-xs">
              Using: {activeTools.join(', ')}
            </span>
          </motion.div>
        )}
      </div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickActions.slice(0, 4).map((action, index) => (
            <QuickActionButton key={action.id} action={action} index={index} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

interface QuickActionButtonProps {
  action: QuickAction;
  index: number;
}

function QuickActionButton({ action, index }: QuickActionButtonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        ...springPresets.snappy,
        delay: index * 0.05,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
    >
      <Button
        variant="outline"
        size="sm"
        onClick={action.action}
        className={cn(
          'glass-base border-white/10 rounded-lg px-3 py-1.5 text-sm',
          'hover:glass-high hover:border-white/20 transition-all duration-200',
          'text-[var(--fluid-text-primary)] hover:text-[var(--fluid-primary)]',
          action.variant === 'primary' &&
            'bg-[var(--fluid-primary)] text-white border-transparent hover:bg-[var(--fluid-primary-hover)]'
        )}
      >
        {action.label}
      </Button>
    </motion.div>
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
