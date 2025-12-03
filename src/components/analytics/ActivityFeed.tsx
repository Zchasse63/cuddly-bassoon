'use client';

import { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Home,
  Users,
  Briefcase,
  Phone,
  Mail,
  MessageSquare,
  Search,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Activity {
  id: string;
  type:
    | 'property'
    | 'deal'
    | 'buyer'
    | 'call'
    | 'email'
    | 'sms'
    | 'search'
    | 'offer'
    | 'contract'
    | 'closed'
    | 'lost';
  title: string;
  description?: string;
  timestamp: string;
  entityId?: string;
  entityType?: string;
  metadata?: Record<string, unknown>;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  showFilter?: boolean;
  onActivityClick?: (activity: Activity) => void;
  className?: string;
}

const activityIcons: Record<Activity['type'], React.ElementType> = {
  property: Home,
  deal: Briefcase,
  buyer: Users,
  call: Phone,
  email: Mail,
  sms: MessageSquare,
  search: Search,
  offer: FileText,
  contract: FileText,
  closed: CheckCircle2,
  lost: XCircle,
};

const activityColors: Record<Activity['type'], string> = {
  property: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
  deal: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  buyer: 'text-green-500 bg-green-50 dark:bg-green-900/20',
  call: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
  email: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
  sms: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20',
  search: 'text-gray-500 bg-gray-50 dark:bg-gray-900/20',
  offer: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
  contract: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
  closed: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  lost: 'text-red-500 bg-red-50 dark:bg-red-900/20',
};

export function ActivityFeed({
  activities,
  maxItems = 10,
  onActivityClick,
  className,
}: ActivityFeedProps) {
  const displayedActivities = useMemo(() => activities.slice(0, maxItems), [activities, maxItems]);

  if (displayedActivities.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8 text-center', className)}>
        <Clock className="h-8 w-8 text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">No recent activity</p>
        <p className="text-xs text-muted-foreground mt-1">
          Activities will appear here as you use the platform
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {displayedActivities.map((activity) => {
        const Icon = activityIcons[activity.type] || Briefcase;
        const colorClass = activityColors[activity.type] || activityColors.deal;

        return (
          <div
            key={activity.id}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border border-border/50 hover:border-border transition-colors',
              onActivityClick && 'cursor-pointer hover:bg-muted/50'
            )}
            onClick={() => onActivityClick?.(activity)}
          >
            <div className={cn('p-2 rounded-lg flex-shrink-0', colorClass)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{activity.title}</p>
              {activity.description && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {activity.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ActivityFeedSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border/50">
          <div className="w-8 h-8 rounded-lg bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
            <div className="h-3 w-1/2 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
