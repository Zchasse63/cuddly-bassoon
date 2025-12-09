import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { DealService, ActivityService } from '@/lib/deals';
import { DealDetailClient } from './DealDetailClient';

export const metadata = {
  title: 'Pipeline Details',
};

interface DealDetailPageProps {
  params: Promise<{ id: string }>;
}

async function DealContent({ params }: DealDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const dealService = new DealService(supabase);
  const activityService = new ActivityService(supabase);

  const deal = await dealService.getDeal(id, user.id);

  if (!deal) {
    notFound();
  }

  const { activities } = await activityService.getDealActivities(id, 50);

  return <DealDetailClient deal={deal} activities={activities} />;
}

export default function DealDetailPage({ params }: DealDetailPageProps) {
  return (
    <Suspense fallback={<DealDetailSkeleton />}>
      <DealContent params={params} />
    </Suspense>
  );
}

function DealDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-64 bg-muted animate-pulse rounded" />
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          <div className="h-10 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="h-32 bg-muted animate-pulse rounded-lg" />
          <div className="h-64 bg-muted animate-pulse rounded-lg" />
        </div>
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    </div>
  );
}
