'use client';

import { DEAL_STAGES, DealStage, getOrderedStages, isValidTransition } from '@/lib/deals';
import { cn } from '@/lib/utils';
import { Check, ChevronRight } from 'lucide-react';

interface StagePipelineProps {
  currentStage: DealStage;
  onStageClick?: (stage: DealStage) => void;
  compact?: boolean;
}

export function StagePipeline({ currentStage, onStageClick, compact = false }: StagePipelineProps) {
  const stages = getOrderedStages().filter((s): s is Exclude<DealStage, 'lost'> => s !== 'lost');
  const currentIndex =
    currentStage === 'lost' ? -1 : stages.indexOf(currentStage as Exclude<DealStage, 'lost'>);

  const getStageStatus = (stage: DealStage, index: number) => {
    if (stage === currentStage) return 'current';
    if (index < currentIndex) return 'completed';
    if (isValidTransition(currentStage, stage)) return 'available';
    return 'future';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage, index);
          const config = DEAL_STAGES[stage];

          return (
            <div key={stage} className="flex items-center">
              <button
                onClick={() => onStageClick?.(stage)}
                disabled={status === 'future'}
                className={cn(
                  'px-2 py-1 text-xs rounded-full transition-colors',
                  status === 'current' && `${config.color} text-white`,
                  status === 'completed' && 'bg-green-100 text-green-700',
                  status === 'available' && 'bg-muted hover:bg-muted/80 cursor-pointer',
                  status === 'future' && 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                )}
              >
                {config.label}
              </button>
              {index < stages.length - 1 && (
                <ChevronRight className="h-3 w-3 text-muted-foreground mx-0.5" />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {stages.map((stage, index) => {
          const status = getStageStatus(stage, index);
          const config = DEAL_STAGES[stage];
          const isLast = index === stages.length - 1;

          return (
            <div key={stage} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => onStageClick?.(stage)}
                  disabled={status === 'future'}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                    status === 'current' &&
                      `${config.color} text-white ring-4 ring-offset-2 ring-${config.color}/30`,
                    status === 'completed' && 'bg-green-500 text-white',
                    status === 'available' &&
                      'bg-muted hover:bg-muted/80 cursor-pointer border-2 border-dashed',
                    status === 'future' && 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                  )}
                >
                  {status === 'completed' ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </button>
                <span
                  className={cn(
                    'mt-2 text-xs text-center',
                    status === 'current' && 'font-medium',
                    status === 'future' && 'text-muted-foreground'
                  )}
                >
                  {config.label}
                </span>
              </div>

              {!isLast && (
                <div
                  className={cn(
                    'flex-1 h-0.5 mx-2',
                    index < currentIndex ? 'bg-green-500' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Vertical pipeline for sidebars
export function StagePipelineVertical({ currentStage, onStageClick }: StagePipelineProps) {
  const stages = getOrderedStages().filter((s): s is Exclude<DealStage, 'lost'> => s !== 'lost');
  const currentIndex =
    currentStage === 'lost' ? -1 : stages.indexOf(currentStage as Exclude<DealStage, 'lost'>);

  const getStageStatus = (stage: DealStage, index: number) => {
    if (stage === currentStage) return 'current';
    if (index < currentIndex) return 'completed';
    if (isValidTransition(currentStage, stage)) return 'available';
    return 'future';
  };

  return (
    <div className="space-y-4">
      {stages.map((stage, index) => {
        const status = getStageStatus(stage, index);
        const config = DEAL_STAGES[stage];
        const isLast = index === stages.length - 1;

        return (
          <div key={stage} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <button
                onClick={() => onStageClick?.(stage)}
                disabled={status === 'future'}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                  status === 'current' && `${config.color} text-white`,
                  status === 'completed' && 'bg-green-500 text-white',
                  status === 'available' &&
                    'bg-muted hover:bg-muted/80 cursor-pointer border-2 border-dashed',
                  status === 'future' && 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                )}
              >
                {status === 'completed' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </button>
              {!isLast && (
                <div
                  className={cn(
                    'w-0.5 h-6 mt-1',
                    index < currentIndex ? 'bg-green-500' : 'bg-muted'
                  )}
                />
              )}
            </div>
            <div className="pt-1">
              <p
                className={cn(
                  'text-sm',
                  status === 'current' && 'font-medium',
                  status === 'future' && 'text-muted-foreground'
                )}
              >
                {config.label}
              </p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
