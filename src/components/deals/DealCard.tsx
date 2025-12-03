'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { DealWithDetails, DealStage, isDealStale } from '@/lib/deals';
import { formatDistanceToNow } from 'date-fns';
import { Clock, DollarSign, User, AlertCircle, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DealCardProps {
  deal: DealWithDetails;
  onClick?: () => void;
  isDragging?: boolean;
}

export function DealCard({ deal, onClick, isDragging }: DealCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const daysInStage = deal.days_in_stage || 0;
  const isStale = isDealStale(deal.stage as DealStage, daysInStage);

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const displayPrice = deal.contract_price || deal.offer_price || deal.asking_price;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('deal-card', isDragging && 'dragging', isStale && 'stale')}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-1 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-medium text-sm truncate flex-1">{deal.property_address}</h4>
            {isStale && <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />}
          </div>

          {deal.seller_name && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <User className="h-3 w-3" />
              <span className="truncate">{deal.seller_name}</span>
            </div>
          )}

          {displayPrice && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <DollarSign className="h-3 w-3" />
              <span>{formatCurrency(displayPrice)}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {deal.updated_at
                  ? formatDistanceToNow(new Date(deal.updated_at), { addSuffix: true })
                  : 'Unknown'}
              </span>
            </div>

            {deal.assigned_buyer && (
              <Badge variant="secondary" className="text-xs">
                {deal.assigned_buyer.name}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Static version without drag-and-drop for lists
export function DealCardStatic({ deal, onClick }: Omit<DealCardProps, 'isDragging'>) {
  const daysInStage = deal.days_in_stage || 0;
  const isStale = isDealStale(deal.stage as DealStage, daysInStage);

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const displayPrice = deal.contract_price || deal.offer_price || deal.asking_price;

  return (
    <div className={cn('deal-card', isStale && 'stale')} onClick={onClick}>
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-medium text-sm truncate flex-1">{deal.property_address}</h4>
        {isStale && <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />}
      </div>

      {deal.seller_name && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
          <User className="h-3 w-3" />
          <span className="truncate">{deal.seller_name}</span>
        </div>
      )}

      {displayPrice && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
          <DollarSign className="h-3 w-3" />
          <span>{formatCurrency(displayPrice)}</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>
            {deal.updated_at
              ? formatDistanceToNow(new Date(deal.updated_at), { addSuffix: true })
              : 'Unknown'}
          </span>
        </div>
        {deal.assigned_buyer && (
          <Badge variant="secondary" className="text-xs">
            {deal.assigned_buyer.name}
          </Badge>
        )}
      </div>
    </div>
  );
}
