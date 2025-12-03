'use client';

import { useState } from 'react';
import { DealActivity, ActivityType, getActivityColor } from '@/lib/deals';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Phone,
  Mail,
  MessageSquare,
  FileText,
  ArrowRight,
  Calendar,
  MoreHorizontal,
  Send,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ActivityTimelineProps {
  activities: DealActivity[];
  onAddActivity?: (type: ActivityType, description: string) => Promise<void>;
  isLoading?: boolean;
}

const ACTIVITY_ICONS: Record<ActivityType, React.ElementType> = {
  call: Phone,
  email: Mail,
  sms: MessageSquare,
  note: FileText,
  stage_change: ArrowRight,
  meeting: Calendar,
  other: MoreHorizontal,
};

const ACTIVITY_TYPE_OPTIONS = [
  { value: 'note', label: 'Note' },
  { value: 'call', label: 'Call' },
  { value: 'email', label: 'Email' },
  { value: 'sms', label: 'SMS' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'other', label: 'Other' },
];

export function ActivityTimeline({ activities, onAddActivity }: ActivityTimelineProps) {
  const [newActivityType, setNewActivityType] = useState<ActivityType>('note');
  const [newActivityText, setNewActivityText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newActivityText.trim() || !onAddActivity) return;

    setSubmitting(true);
    try {
      await onAddActivity(newActivityType, newActivityText);
      setNewActivityText('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {onAddActivity && (
        <div className="flex gap-2">
          <Select
            value={newActivityType}
            onValueChange={(v) => setNewActivityType(v as ActivityType)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACTIVITY_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Add activity..."
            value={newActivityText}
            onChange={(e) => setNewActivityText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={submitting || !newActivityText.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="relative">
        {activities.length > 0 && <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />}

        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = ACTIVITY_ICONS[activity.activity_type as ActivityType] || MoreHorizontal;
            const colorClass = getActivityColor(activity.activity_type as ActivityType);

            return (
              <div key={activity.id} className="flex gap-3 relative">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center bg-background border z-10',
                    colorClass
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.created_at && (
                      <>
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        <span className="mx-1">·</span>
                        {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                      </>
                    )}
                  </p>
                </div>
              </div>
            );
          })}

          {activities.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No activity yet</p>
              <p className="text-xs">Activities will appear here as you work on this deal</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Compact version for cards/previews
export function ActivitySummary({ activities }: { activities: DealActivity[] }) {
  const recent = activities.slice(0, 3);

  return (
    <div className="space-y-2">
      {recent.map((activity) => {
        const Icon = ACTIVITY_ICONS[activity.activity_type as ActivityType] || MoreHorizontal;

        return (
          <div key={activity.id} className="flex items-start gap-2 text-xs">
            <Icon className="h-3 w-3 mt-0.5 text-muted-foreground" />
            <span className="truncate">{activity.description}</span>
          </div>
        );
      })}
      {activities.length > 3 && (
        <p className="text-xs text-muted-foreground">+{activities.length - 3} more activities</p>
      )}
    </div>
  );
}
