'use client';

/**
 * OwnerCell - Owner Information with Progressive Reveal
 *
 * Source: Fluid_Real_Estate_OS_Design_System.md Section 4.2
 * Owner name, tenure, status badges. Expandable to reveal phone/email.
 */

import { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Clock, Phone, Mail, ChevronDown, ChevronUp, Loader2, MapPinOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { OwnerCellProps } from './types';

export const OwnerCell = memo(function OwnerCell({
  property, 
  className, 
  onSkipTrace,
  isSkipTracing = false 
}: OwnerCellProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate ownership tenure
  const calculateTenure = () => {
    if (!property.lastSaleDate) return null;
    const saleDate = new Date(property.lastSaleDate);
    const now = new Date();
    const years = Math.floor((now.getTime() - saleDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    return years;
  };

  const tenure = calculateTenure();
  const ownerPhone = property.ownerDetails?.phone;
  const ownerEmail = property.ownerDetails?.email;
  const hasContactInfo = ownerPhone || ownerEmail;

  return (
    <motion.div
      layout
      className={cn('bento-cell bento-owner', className)}
      data-expanded={isExpanded}
    >
      {/* Owner Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--surface-glass-subtle)] flex items-center justify-center">
            <User className="h-5 w-5 text-[var(--fluid-text-secondary)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--fluid-text-primary)]">
              {property.ownerDetails?.name || property.ownerName || 'Unknown Owner'}
            </h3>
            {tenure !== null && (
              <div className="flex items-center gap-1 text-sm text-[var(--fluid-text-secondary)]">
                <Clock className="h-3.5 w-3.5" />
                <span>Owned {tenure} year{tenure !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Expand Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Status Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        {property.isOwnerOccupied === false && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <MapPinOff className="h-3 w-3 mr-1" />
            Absentee
          </Badge>
        )}
        {property.isOwnerOccupied === true && (
          <Badge variant="outline" className="bg-[var(--fluid-primary)]/10 text-[var(--fluid-primary)] border-[var(--fluid-primary)]/30">
            Owner Occupied
          </Badge>
        )}
        {tenure && tenure >= 10 && (
          <Badge variant="outline" className="bg-[var(--fluid-success)]/10 text-[var(--fluid-success)] border-[var(--fluid-success)]/30">
            Long-term Owner
          </Badge>
        )}
      </div>

      {/* Expandable Contact Info */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-[var(--border-highlight)] space-y-2">
              {hasContactInfo ? (
                <>
                  {ownerPhone && (
                    <a
                      href={`tel:${ownerPhone}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--surface-glass-subtle)] transition-colors"
                    >
                      <Phone className="h-4 w-4 text-[var(--fluid-primary)]" />
                      <span>{ownerPhone}</span>
                    </a>
                  )}
                  {ownerEmail && (
                    <a
                      href={`mailto:${ownerEmail}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-[var(--surface-glass-subtle)] transition-colors"
                    >
                      <Mail className="h-4 w-4 text-[var(--fluid-primary)]" />
                      <span>{ownerEmail}</span>
                    </a>
                  )}
                </>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-[var(--fluid-text-secondary)] mb-2">
                    No contact info available
                  </p>
                  {onSkipTrace && (
                    <Button
                      size="sm"
                      onClick={onSkipTrace}
                      disabled={isSkipTracing}
                      className="bg-[var(--fluid-primary)] hover:bg-[var(--fluid-primary-hover)]"
                    >
                      {isSkipTracing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Skip Trace Owner
                    </Button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

