import { Suspense } from 'react';
import { BuyersPageClient } from './buyers-client';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata = {
  title: 'Buyers',
};

export default function BuyersPage() {
  return (
    <Suspense fallback={<BuyersPageSkeleton />}>
      <BuyersPageClient />
    </Suspense>
  );
}

function BuyersPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[180px] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
