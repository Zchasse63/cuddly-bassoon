'use client';

/**
 * ActionsCell - Primary Call-to-Actions
 *
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 4.2
 * Giant "Call Owner" and "Skip Trace" buttons
 */

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Phone, Search, FileText, Briefcase, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActionsCellProps } from './types';

interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  disabled?: boolean;
  isLoading?: boolean;
}

function ActionButton({ 
  icon, 
  label, 
  sublabel, 
  onClick, 
  variant = 'secondary',
  disabled = false,
  isLoading = false
}: ActionButtonProps) {
  const variantStyles = {
    primary: 'bg-[var(--fluid-primary)] hover:bg-[var(--fluid-primary-hover)] text-white',
    secondary: 'bg-[var(--surface-glass-subtle)] hover:bg-[var(--surface-glass-base)] text-[var(--fluid-text-primary)]',
    success: 'bg-[var(--fluid-success)] hover:bg-[var(--fluid-success-dark)] text-white',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        "flex-1 min-w-[140px] p-4 rounded-[var(--radius-fluid-standard)] transition-colors",
        "flex flex-col items-center justify-center gap-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant]
      )}
    >
      {isLoading ? (
        <Loader2 className="h-6 w-6 animate-spin" />
      ) : (
        icon
      )}
      <div className="text-center">
        <p className="font-semibold">{label}</p>
        {sublabel && (
          <p className="text-xs opacity-80">{sublabel}</p>
        )}
      </div>
    </motion.button>
  );
}

export const ActionsCell = memo(function ActionsCell({
  property, 
  className, 
  onCall,
  onSkipTrace,
  onCreateDeal,
  onGenerateOffer,
  isLoading = false
}: ActionsCellProps) {
  const hasPhone = !!property.ownerDetails?.phone;

  return (
    <motion.div
      layout
      className={cn('bento-cell bento-actions', className)}
    >
      {/* Primary Actions Row */}
      <div className="flex gap-3 flex-wrap">
        {hasPhone ? (
          <ActionButton
            icon={<Phone className="h-6 w-6" />}
            label="Call Owner"
            sublabel={property.ownerDetails?.phone || undefined}
            onClick={onCall}
            variant="success"
          />
        ) : (
          <ActionButton
            icon={<Search className="h-6 w-6" />}
            label="Skip Trace"
            sublabel="Find contact info"
            onClick={onSkipTrace}
            variant="primary"
            isLoading={isLoading}
          />
        )}

        <ActionButton
          icon={<Briefcase className="h-6 w-6" />}
          label="Create Deal"
          sublabel="Add to pipeline"
          onClick={onCreateDeal}
          variant="secondary"
        />

        <ActionButton
          icon={<FileText className="h-6 w-6" />}
          label="Generate Offer"
          sublabel="Draft contract"
          onClick={onGenerateOffer}
          variant="secondary"
        />
      </div>

      {/* Quick Stats */}
      <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-[var(--border-highlight)] text-sm text-[var(--fluid-text-secondary)]">
        <span>
          Last updated: {new Date().toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
});

