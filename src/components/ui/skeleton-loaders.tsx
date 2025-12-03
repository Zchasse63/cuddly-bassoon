'use client';

import { cn } from '@/lib/utils';

/**
 * Skeleton Loaders
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md Section 9
 * "Content-aware skeleton loaders matching expected content shape"
 */

interface SkeletonProps {
  className?: string;
}

// Base skeleton with pulse animation
export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-md bg-muted', className)} />;
}

// KPI Card Skeleton
export function KPICardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('kpi-card', className)}>
      <div className="kpi-card__header">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-24 mt-2" />
      <Skeleton className="h-4 w-16 mt-2" />
    </div>
  );
}

// Property Card Skeleton
export function PropertyCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('property-card', className)}>
      {/* Image placeholder */}
      <div className="property-card__image">
        <Skeleton className="h-full w-full rounded-none" />
      </div>
      <div className="property-card__content">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-1" />
        <div className="property-card__stats">
          <div className="property-card__stat">
            <Skeleton className="h-5 w-16 mx-auto" />
            <Skeleton className="h-3 w-12 mx-auto mt-1" />
          </div>
          <div className="property-card__stat">
            <Skeleton className="h-5 w-12 mx-auto" />
            <Skeleton className="h-3 w-12 mx-auto mt-1" />
          </div>
          <div className="property-card__stat">
            <Skeleton className="h-5 w-14 mx-auto" />
            <Skeleton className="h-3 w-12 mx-auto mt-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Deal Card Skeleton
export function DealCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('deal-card', className)}>
      <div className="flex items-start gap-2">
        <Skeleton className="h-4 w-4 mt-1" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
          <div className="flex justify-between items-center pt-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Buyer Card Skeleton
export function BuyerCardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('buyer-card', className)}>
      <div className="p-4 pb-2 flex justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <div className="px-4 pb-4 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
    </div>
  );
}

// Table Row Skeleton
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
}

// Chat Message Skeleton
export function ChatMessageSkeleton({ isUser = false }: { isUser?: boolean }) {
  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <div className={cn('space-y-2 max-w-[80%]', isUser && 'items-end')}>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}
