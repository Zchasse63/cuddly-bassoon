'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DealForm, PipelineStats, PipelineStatsCompact } from '@/components/deals';
import { DealWithDetails, DealStage } from '@/lib/deals';
import { Plus, LayoutGrid, List, BarChart3, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Lazy load KanbanBoard - heavy component with dnd-kit
const KanbanBoard = dynamic(
  () => import('@/components/deals/KanbanBoard').then((mod) => ({ default: mod.KanbanBoard })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

interface PipelinePageClientProps {
  initialDealsByStage: Record<DealStage, DealWithDetails[]>;
  initialStats: {
    totalDeals: number;
    activeDeals: number;
    dealsByStage: Record<DealStage, number>;
    totalPipelineValue: number;
    closedValue: number;
    avgDaysToClose: number;
  };
}

export function PipelinePageClient({ initialDealsByStage, initialStats }: PipelinePageClientProps) {
  const router = useRouter();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [view, setView] = useState<'kanban' | 'list' | 'stats'>('kanban');

  const handleCreateDeal = async (
    data: Parameters<typeof DealForm>[0]['onSubmit'] extends (d: infer T) => unknown ? T : never
  ) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create deal');
      }

      toast.success('Deal created successfully');
      setIsCreateOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create deal');
    } finally {
      setIsCreating(false);
    }
  };

  const handleStageChange = async (dealId: string, newStage: DealStage) => {
    try {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update stage');
      }

      toast.success('Deal stage updated');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update stage');
      throw error; // Re-throw to trigger optimistic update revert
    }
  };

  const handleDealClick = (deal: DealWithDetails) => {
    router.push(`/pipeline/${deal.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pipeline</h1>
          <p className="text-muted-foreground">Track opportunities from discovery to close.</p>
        </div>

        <div className="flex items-center gap-4">
          <PipelineStatsCompact stats={initialStats} />

          <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
            <Button
              variant={view === 'kanban' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('kanban')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={view === 'stats' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setView('stats')}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Deal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Deal</DialogTitle>
              </DialogHeader>
              <DealForm
                onSubmit={handleCreateDeal}
                onCancel={() => setIsCreateOpen(false)}
                isLoading={isCreating}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {view === 'kanban' && (
        <KanbanBoard
          dealsByStage={initialDealsByStage}
          onDealClick={handleDealClick}
          onStageChange={handleStageChange}
        />
      )}

      {view === 'stats' && <PipelineStats stats={initialStats} />}

      {view === 'list' && (
        <div className="text-center py-12 text-muted-foreground">
          List view coming soon. Use Kanban board for now.
        </div>
      )}
    </div>
  );
}
