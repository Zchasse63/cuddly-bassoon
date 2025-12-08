'use client';

/**
 * GenUI Widget Base Component
 *
 * Source: Fluid_OS_Master_Plan.md Phase 3.4
 *
 * Base wrapper for AI-generated UI widgets that appear in chat.
 * Provides consistent glass styling, drag handle, and collapse/close actions.
 */

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { springPresets } from '@/lib/animations';

export interface GenUIWidgetProps {
  /** Widget title displayed in header */
  title: string;
  /** Optional icon to display next to title */
  icon?: ReactNode;
  /** Widget content */
  children: ReactNode;
  /** Whether the widget can be collapsed */
  collapsible?: boolean;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Whether to show close button */
  closable?: boolean;
  /** Callback when widget is closed */
  onClose?: () => void;
  /** Whether to show drag handle */
  draggable?: boolean;
  /** Additional class names */
  className?: string;
  /** Widget variant for different use cases */
  variant?: 'default' | 'compact' | 'prominent';
}

export function GenUIWidget({
  title,
  icon,
  children,
  collapsible = true,
  defaultCollapsed = false,
  closable = true,
  onClose,
  draggable = false,
  className,
  variant = 'default',
}: GenUIWidgetProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    // Delay callback to allow exit animation
    setTimeout(() => onClose?.(), 200);
  };

  const variantStyles = {
    default: 'p-4',
    compact: 'p-3',
    prominent: 'p-5 border-brand-500/20',
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.98 }}
          transition={springPresets.standard}
          className={cn(
            'glass-card overflow-hidden',
            variantStyles[variant],
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            {/* Drag Handle */}
            {draggable && (
              <div className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors">
                <GripVertical className="h-4 w-4" />
              </div>
            )}

            {/* Icon */}
            {icon && (
              <div className="text-brand-500 flex-shrink-0">
                {icon}
              </div>
            )}

            {/* Title */}
            <h4 className="text-sm font-semibold flex-1 truncate">{title}</h4>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {collapsible && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {isCollapsed ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronUp className="h-3.5 w-3.5" />
                  )}
                </Button>
              )}
              {closable && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-destructive/10"
                  onClick={handleClose}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={springPresets.snappy}
                className="overflow-hidden"
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Simple wrapper for inline widget content without the full chrome
 */
export function GenUIWidgetInline({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={springPresets.snappy}
      className={cn('glass-subtle rounded-xl p-3', className)}
    >
      {children}
    </motion.div>
  );
}
