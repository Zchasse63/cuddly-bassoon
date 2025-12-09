import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { DealService } from '@/lib/deals';
import { PipelinePageClient } from './PipelinePageClient';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Pipeline',
};

async function PipelineContent() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const service = new DealService(supabase);
  const [dealsByStage, stats] = await Promise.all([
    service.getDealsByStage(user.id),
    service.getPipelineStats(user.id),
  ]);

  return <PipelinePageClient initialDealsByStage={dealsByStage} initialStats={stats} />;
}

export default function PipelinePage() {
  return (
    <Suspense fallback={<PipelinePageSkeleton />}>
      <PipelineContent />
    </Suspense>
  );
}

function PipelinePageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-32 bg-muted animate-pulse rounded" />
          <div className="h-5 w-64 bg-muted animate-pulse rounded mt-2" />
        </div>
        <div className="h-10 w-28 bg-muted animate-pulse rounded" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="min-w-[280px] h-[400px] bg-muted/30 animate-pulse rounded-lg" />
        ))}
      </div>
    </div>
  );
}
