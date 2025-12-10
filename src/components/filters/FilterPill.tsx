'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { springPresets } from '@/lib/animations';

/**
 * FilterPill Component
 *
 * Source: ARCHITECTURE_SOURCE_OF_TRUTH.md Section 9 Phase 5
 *
 * FluidOS glass pill component for active filters with:
 * - Glass morphism styling (bg-white/65 backdrop-blur-md)
 * - Tooltip showing full description on hover
 * - Smooth animations and hover effects
 * - Active/inactive states
 * - Close button for removal
 */

interface FilterPillProps {
  /** Filter name to display */
  label: string;
  /** Full description shown in tooltip */
  description?: string;
  /** Whether the filter is currently active */
  isActive?: boolean;
  /** Callback when the pill is clicked to toggle */
  onClick?: () => void;
  /** Callback when the close button is clicked */
  onRemove?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Show close button (typically only when active) */
  showClose?: boolean;
}

export function FilterPill({
  label,
  description,
  isActive = false,
  onClick,
  onRemove,
  className,
  showClose = true,
}: FilterPillProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleMouseEnter = () => {
    if (description) {
      // Slight delay before showing tooltip
      setTimeout(() => setShowTooltip(true), 300);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove?.();
  };

  return (
    <div className="relative">
      <motion.button
        type="button"
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          // Glass pill base styling
          'inline-flex items-center gap-1.5 h-8 px-3 rounded-full',
          'text-sm font-medium',
          'transition-all duration-300',
          'focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:ring-offset-1',

          // Glass effect with subtle border
          isActive
            ? 'bg-brand-500 text-white border border-brand-600 shadow-md'
            : 'bg-white/65 backdrop-blur-md border border-white/40 text-foreground',

          // Hover states
          !isActive && 'hover:bg-white/80 hover:border-white/60 hover:shadow-sm',
          isActive && 'hover:bg-brand-600 hover:shadow-lg',

          className
        )}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        transition={springPresets.snappy}
      >
        <span className="whitespace-nowrap">{label}</span>

        {showClose && isActive && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={springPresets.snappy}
          >
            <X
              className="size-3.5 cursor-pointer hover:opacity-70 transition-opacity ml-0.5"
              onClick={handleRemoveClick}
            />
          </motion.div>
        )}
      </motion.button>

      {/* Tooltip with description */}
      <AnimatePresence>
        {showTooltip && description && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={springPresets.snappy}
            className={cn(
              'absolute z-50 left-1/2 -translate-x-1/2 top-full mt-2',
              'px-3 py-2 rounded-lg',
              'bg-gray-900/95 backdrop-blur-md text-white text-xs',
              'shadow-xl border border-white/10',
              'max-w-xs w-max',
              'pointer-events-none'
            )}
          >
            {/* Tooltip arrow */}
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900/95 rotate-45 border-t border-l border-white/10" />

            {/* Tooltip content */}
            <p className="relative z-10 leading-relaxed">{description}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * FilterPillGroup Component
 *
 * Container for multiple filter pills with animation support
 */

interface FilterPillGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterPillGroup({ children, className }: FilterPillGroupProps) {
  return (
    <motion.div
      className={cn('flex items-center gap-2 flex-wrap', className)}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      transition={springPresets.standard}
    >
      {children}
    </motion.div>
  );
}
