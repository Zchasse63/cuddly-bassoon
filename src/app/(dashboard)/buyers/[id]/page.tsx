import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { BuyerService } from '@/lib/buyers';
import { BuyerDetailClient } from './buyer-detail-client';
import { Skeleton } from '@/components/ui/skeleton';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { title: 'Buyer' };
  
  const service = new BuyerService(supabase);
  const buyer = await service.getBuyer(id, user.id);
  
  return {
    title: buyer?.name || 'Buyer',
  };
}

export default async function BuyerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    notFound();
  }
  
  const service = new BuyerService(supabase);
  const buyer = await service.getBuyer(id, user.id);
  
  if (!buyer) {
    notFound();
  }

  return (
    <Suspense fallback={<DetailSkeleton />}>
      <BuyerDetailClient initialBuyer={buyer} />
    </Suspense>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[300px]" />
        <Skeleton className="h-[300px]" />
      </div>
    </div>
  );
}

