'use client';

/**
 * Campaign Card Component
 * Displays campaign summary with status and metrics
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  StopCircle,
  MessageSquare,
  Mail,
  CheckCircle,
  Clock,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Campaign, CampaignStatus, MessageChannel } from '@/lib/communication/types';

interface CampaignCardProps {
  campaign: Campaign;
  onStart?: (id: string) => void;
  onPause?: (id: string) => void;
  onCancel?: (id: string) => void;
  onClick?: (campaign: Campaign) => void;
  className?: string;
}

export function CampaignCard({
  campaign,
  onStart,
  onPause,
  onCancel,
  onClick,
  className,
}: CampaignCardProps) {
  const getStatusBadge = (status: CampaignStatus) => {
    const variants: Record<
      CampaignStatus,
      { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }
    > = {
      draft: { variant: 'secondary', icon: <Clock className="h-3 w-3" /> },
      scheduled: { variant: 'outline', icon: <Clock className="h-3 w-3" /> },
      sending: { variant: 'default', icon: <Play className="h-3 w-3" /> },
      paused: { variant: 'secondary', icon: <Pause className="h-3 w-3" /> },
      completed: { variant: 'outline', icon: <CheckCircle className="h-3 w-3" /> },
      cancelled: { variant: 'destructive', icon: <StopCircle className="h-3 w-3" /> },
    };
    const { variant, icon } = variants[status];
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getChannelIcon = (channel: MessageChannel) => {
    return channel === 'email' ? (
      <Mail className="h-4 w-4" />
    ) : (
      <MessageSquare className="h-4 w-4" />
    );
  };

  const progress =
    campaign.messages_total > 0
      ? Math.round((campaign.messages_sent / campaign.messages_total) * 100)
      : 0;

  return (
    <Card
      className={cn('cursor-pointer hover:shadow-md transition-shadow', className)}
      onClick={() => onClick?.(campaign)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {getChannelIcon(campaign.channel)}
              {campaign.name}
            </CardTitle>
            <CardDescription className="line-clamp-1">
              {campaign.description || 'No description'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(campaign.status)}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {campaign.status === 'draft' && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onStart?.(campaign.id);
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" /> Start Campaign
                  </DropdownMenuItem>
                )}
                {campaign.status === 'sending' && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onPause?.(campaign.id);
                    }}
                  >
                    <Pause className="h-4 w-4 mr-2" /> Pause Campaign
                  </DropdownMenuItem>
                )}
                {campaign.status === 'paused' && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onStart?.(campaign.id);
                    }}
                  >
                    <Play className="h-4 w-4 mr-2" /> Resume Campaign
                  </DropdownMenuItem>
                )}
                {['draft', 'sending', 'paused'].includes(campaign.status) && (
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancel?.(campaign.id);
                    }}
                    className="text-destructive"
                  >
                    <StopCircle className="h-4 w-4 mr-2" /> Cancel Campaign
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {campaign.messages_sent} / {campaign.messages_total}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-semibold">{campaign.messages_total}</p>
            <p className="text-xs text-muted-foreground">Recipients</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold text-green-600">{campaign.messages_delivered}</p>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold text-blue-600">{campaign.messages_opened}</p>
            <p className="text-xs text-muted-foreground">Opened</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-semibold text-red-600">{campaign.messages_failed}</p>
            <p className="text-xs text-muted-foreground">Failed</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default CampaignCard;
