'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { FileText, Calendar, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DataSourceBadge } from '@/components/ui/DataSourceBadge';

interface PermitHistoryPanelProps {
  addressId: string;
  className?: string;
}

const STATUS_CONFIG = {
  final: { color: 'bg-[var(--fluid-success)]/10 text-[var(--fluid-success)] dark:bg-[var(--fluid-success)]/20', icon: CheckCircle },
  active: { color: 'bg-[var(--fluid-primary)]/10 text-[var(--fluid-primary)] dark:bg-[var(--fluid-primary)]/20', icon: Clock },
  in_review: { color: 'bg-[var(--fluid-warning)]/10 text-[var(--fluid-warning)] dark:bg-[var(--fluid-warning)]/20', icon: AlertCircle },
  inactive: { color: 'bg-muted text-muted-foreground dark:bg-muted/50', icon: FileText },
};

/**
 * PermitHistoryPanel - Displays permit history for a property
 * Uses Shovels.ai data via the /api/shovels/permits endpoint
 */
export function PermitHistoryPanel({ addressId, className }: PermitHistoryPanelProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['permits', addressId],
    queryFn: async () => {
      const res = await fetch(`/api/shovels/permits?addressId=${encodeURIComponent(addressId)}`);
      if (!res.ok) throw new Error('Failed to fetch permits');
      return res.json();
    },
    enabled: !!addressId,
  });

  if (isLoading) {
    return (
      <div className={cn('flex items-center justify-center h-48 bg-muted/50 rounded-lg', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-4 bg-destructive/10 rounded-lg text-center text-destructive', className)}>
        Failed to load permit history
      </div>
    );
  }

  const permits = data?.data || [];

  if (permits.length === 0) {
    return (
      <div className={cn('p-4 bg-muted/50 rounded-lg text-center text-muted-foreground', className)}>
        No permit history found for this property
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="w-4 h-4" />
          Permit History
        </h3>
        <DataSourceBadge source="shovels" />
      </div>

      <div className="space-y-3">
        {permits.map((permit: Record<string, unknown>, index: number) => {
          const status = String(permit.status || 'inactive');
          const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.inactive;
          const StatusIcon = statusConfig.icon;
          const permitId = String(permit.id || index);
          const tags = Array.isArray(permit.tags) ? permit.tags : [];
          const description = permit.description ? String(permit.description) : null;
          const jobValue = typeof permit.job_value === 'number' ? permit.job_value : null;
          const fileDate = permit.file_date ? String(permit.file_date) : null;
          const issueDate = permit.issue_date ? String(permit.issue_date) : null;
          const inspectionPassRate = typeof permit.inspection_pass_rate === 'number' ? permit.inspection_pass_rate : null;

          return (
            <div key={permitId} className="p-3 bg-card border rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium', statusConfig.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {status}
                    </span>
                    {tags.map((tag: unknown) => (
                      <span key={String(tag)} className="px-2 py-0.5 bg-muted rounded text-xs">
                        {String(tag)}
                      </span>
                    ))}
                  </div>
                  {description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{description}</p>
                  )}
                </div>
                {jobValue !== null && (
                  <span className="font-medium text-sm whitespace-nowrap">
                    ${jobValue.toLocaleString()}
                  </span>
                )}
              </div>

              <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                {fileDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Filed: {format(new Date(fileDate), 'MMM d, yyyy')}
                  </span>
                )}
                {issueDate && (
                  <span>Issued: {format(new Date(issueDate), 'MMM d, yyyy')}</span>
                )}
                {inspectionPassRate !== null && (
                  <span>Pass Rate: {inspectionPassRate}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

