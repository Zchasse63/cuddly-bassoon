'use client';

import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { DealCard, DealCardStatic } from './DealCard';
import { DealWithDetails, DealStage, DEAL_STAGES, getActiveStages } from '@/lib/deals';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface KanbanBoardProps {
  dealsByStage: Record<DealStage, DealWithDetails[]>;
  onDealClick?: (deal: DealWithDetails) => void;
  onStageChange?: (dealId: string, newStage: DealStage) => Promise<void>;
}

interface KanbanColumnProps {
  stage: DealStage;
  deals: DealWithDetails[];
  onDealClick?: (deal: DealWithDetails) => void;
}

function KanbanColumn({ stage, deals, onDealClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });
  const stageConfig = DEAL_STAGES[stage];

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col min-w-[280px] max-w-[280px] bg-muted/30 rounded-lg',
        isOver && 'bg-muted/50 ring-2 ring-primary/20'
      )}
    >
      <div className="p-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-full', stageConfig.color)} />
            <h3 className="font-medium text-sm">{stageConfig.label}</h3>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {deals.length}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{stageConfig.description}</p>
      </div>

      <ScrollArea className="flex-1 p-2">
        <SortableContext items={deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} onClick={() => onDealClick?.(deal)} />
            ))}
            {deals.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No deals in this stage
              </div>
            )}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  );
}

export function KanbanBoard({ dealsByStage, onDealClick, onStageChange }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [optimisticDeals, setOptimisticDeals] = useState<Record<
    DealStage,
    DealWithDetails[]
  > | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const activeDeal = activeId
    ? Object.values(optimisticDeals || dealsByStage)
        .flat()
        .find((d) => d.id === activeId)
    : null;

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Find the source stage
      let sourceStage: DealStage | null = null;
      let deal: DealWithDetails | null = null;

      for (const [stage, deals] of Object.entries(dealsByStage)) {
        const found = deals.find((d) => d.id === activeId);
        if (found) {
          sourceStage = stage as DealStage;
          deal = found;
          break;
        }
      }

      if (!sourceStage || !deal) return;

      // Determine target stage
      const targetStage = Object.keys(DEAL_STAGES).includes(overId)
        ? (overId as DealStage)
        : (() => {
            for (const [stage, deals] of Object.entries(dealsByStage)) {
              if (deals.some((d) => d.id === overId)) return stage as DealStage;
            }
            return null;
          })();

      if (!targetStage || targetStage === sourceStage) return;

      // Optimistic update
      const newDeals = { ...dealsByStage };
      newDeals[sourceStage] = newDeals[sourceStage].filter((d) => d.id !== activeId);
      newDeals[targetStage] = [...newDeals[targetStage], { ...deal, stage: targetStage }];
      setOptimisticDeals(newDeals);

      try {
        await onStageChange?.(activeId, targetStage);
      } catch {
        // Revert on error
        setOptimisticDeals(null);
      } finally {
        setOptimisticDeals(null);
      }
    },
    [dealsByStage, onStageChange]
  );

  const displayDeals = optimisticDeals || dealsByStage;
  const stages = getActiveStages();

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-200px)]">
        {stages.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            deals={displayDeals[stage] || []}
            onDealClick={onDealClick}
          />
        ))}
      </div>

      <DragOverlay>{activeDeal && <DealCardStatic deal={activeDeal} />}</DragOverlay>
    </DndContext>
  );
}
