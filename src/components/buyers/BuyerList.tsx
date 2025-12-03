'use client';

import { BuyerCard } from './BuyerCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { BuyerWithDetails } from '@/lib/buyers/types';

interface BuyerListProps {
  buyers: BuyerWithDetails[];
  isLoading?: boolean;
  onEdit?: (buyer: BuyerWithDetails) => void;
  onDelete?: (buyer: BuyerWithDetails) => void;
  onClick?: (buyer: BuyerWithDetails) => void;
}

export function BuyerList({ buyers, isLoading, onEdit, onDelete, onClick }: BuyerListProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-[180px] w-full rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (buyers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No buyers found</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {buyers.map((buyer) => (
        <BuyerCard
          key={buyer.id}
          buyer={buyer}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClick}
        />
      ))}
    </div>
  );
}

