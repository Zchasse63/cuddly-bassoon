'use client';

/**
 * RevealSection - Progressive Disclosure Component
 * 
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 4.2
 * Collapsible sections with spring animation
 */

import { useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RevealSectionProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function RevealSection({
  title,
  subtitle,
  icon,
  children,
  defaultOpen = false,
  className,
  headerClassName,
  contentClassName,
}: RevealSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={cn('overflow-hidden', className)}>
      {/* Header - Always visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between p-4',
          'rounded-[var(--radius-fluid-standard)]',
          'bg-[var(--surface-glass-subtle)] hover:bg-[var(--surface-glass-base)]',
          'transition-colors cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fluid-primary)]',
          headerClassName
        )}
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-8 h-8 rounded-lg bg-[var(--fluid-primary)]/10 flex items-center justify-center text-[var(--fluid-primary)]">
              {icon}
            </div>
          )}
          <div className="text-left">
            <h3 className="font-semibold text-[var(--fluid-text-primary)]">{title}</h3>
            {subtitle && (
              <p className="text-sm text-[var(--fluid-text-secondary)]">{subtitle}</p>
            )}
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        >
          <ChevronDown className="h-5 w-5 text-[var(--fluid-text-secondary)]" />
        </motion.div>
      </button>

      {/* Content - Animated reveal */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: 'auto', 
              opacity: 1,
              transition: {
                height: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2, delay: 0.1 }
              }
            }}
            exit={{ 
              height: 0, 
              opacity: 0,
              transition: {
                height: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.1 }
              }
            }}
            className="overflow-hidden"
          >
            <div className={cn('pt-3', contentClassName)}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * RevealSectionGroup - Container for multiple reveal sections
 * Ensures consistent spacing and optional accordion behavior
 */
interface RevealSectionGroupProps {
  children: ReactNode;
  accordion?: boolean;
  className?: string;
}

export function RevealSectionGroup({
  children,
  accordion: _accordion = false,
  className,
}: RevealSectionGroupProps) {
  // TODO: Implement accordion behavior (only one open at a time)
  return (
    <div className={cn('space-y-3', className)}>
      {children}
    </div>
  );
}

