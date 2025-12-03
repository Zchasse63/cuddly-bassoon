/**
 * Deal Activity Tracking
 * Handles activity logging and timeline generation
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';
import { ActivityType, DealActivity, CreateActivityInput, DealStage } from './types';
import { DEAL_STAGES } from './stages';

export class ActivityService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Log an activity for a deal
   */
  async logActivity(
    dealId: string,
    userId: string,
    input: CreateActivityInput
  ): Promise<DealActivity> {
    const { data, error } = await this.supabase
      .from('deal_activities')
      .insert({
        deal_id: dealId,
        user_id: userId,
        activity_type: input.activity_type,
        description: input.description,
        metadata:
          input.metadata as Database['public']['Tables']['deal_activities']['Insert']['metadata'],
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to log activity: ${error.message}`);
    }

    return data as DealActivity;
  }

  /**
   * Log a stage change activity
   */
  async logStageChange(
    dealId: string,
    userId: string,
    previousStage: DealStage,
    newStage: DealStage,
    reason?: string
  ): Promise<DealActivity> {
    const previousLabel = DEAL_STAGES[previousStage].label;
    const newLabel = DEAL_STAGES[newStage].label;

    return this.logActivity(dealId, userId, {
      activity_type: 'stage_change',
      description: `Stage changed from ${previousLabel} to ${newLabel}${reason ? `: ${reason}` : ''}`,
      metadata: {
        previous_stage: previousStage,
        new_stage: newStage,
        reason,
      },
    });
  }

  /**
   * Log a call activity
   */
  async logCall(
    dealId: string,
    userId: string,
    outcome: 'connected' | 'no_answer' | 'left_voicemail' | 'wrong_number',
    duration?: number,
    notes?: string
  ): Promise<DealActivity> {
    const outcomeLabels = {
      connected: 'Connected with seller',
      no_answer: 'No answer',
      left_voicemail: 'Left voicemail',
      wrong_number: 'Wrong number',
    };

    return this.logActivity(dealId, userId, {
      activity_type: 'call',
      description: `Call: ${outcomeLabels[outcome]}${notes ? ` - ${notes}` : ''}`,
      metadata: { outcome, duration, notes },
    });
  }

  /**
   * Log a note
   */
  async logNote(dealId: string, userId: string, note: string): Promise<DealActivity> {
    return this.logActivity(dealId, userId, {
      activity_type: 'note',
      description: note,
    });
  }

  /**
   * Get activities for a deal
   */
  async getDealActivities(
    dealId: string,
    limit = 50,
    offset = 0
  ): Promise<{ activities: DealActivity[]; total: number }> {
    const { data, error, count } = await this.supabase
      .from('deal_activities')
      .select('*', { count: 'exact' })
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to get activities: ${error.message}`);
    }

    return {
      activities: (data || []) as DealActivity[],
      total: count || 0,
    };
  }

  /**
   * Get activity summary for a deal
   */
  async getActivitySummary(dealId: string): Promise<{
    totalCalls: number;
    totalEmails: number;
    totalNotes: number;
    lastActivity: string | null;
  }> {
    const { data, error } = await this.supabase
      .from('deal_activities')
      .select('activity_type, created_at')
      .eq('deal_id', dealId);

    if (error) {
      throw new Error(`Failed to get activity summary: ${error.message}`);
    }

    const activities = data || [];

    return {
      totalCalls: activities.filter((a) => a.activity_type === 'call').length,
      totalEmails: activities.filter((a) => a.activity_type === 'email').length,
      totalNotes: activities.filter((a) => a.activity_type === 'note').length,
      lastActivity:
        activities.length > 0
          ? (activities.sort(
              (a, b) =>
                new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
            )[0]?.created_at ?? null)
          : null,
    };
  }

  /**
   * Get recent activities across all deals for a user
   */
  async getRecentActivities(
    userId: string,
    limit = 20
  ): Promise<(DealActivity & { deal_address?: string })[]> {
    const { data, error } = await this.supabase
      .from('deal_activities')
      .select(
        `
        *,
        deals!inner(property_address, user_id)
      `
      )
      .eq('deals.user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to get recent activities: ${error.message}`);
    }

    return (data || []).map((item) => ({
      ...item,
      deal_address: (item as unknown as { deals: { property_address: string } }).deals
        ?.property_address,
    })) as (DealActivity & { deal_address?: string })[];
  }
}

/**
 * Get activity type icon name
 */
export function getActivityIcon(type: ActivityType): string {
  const icons: Record<ActivityType, string> = {
    call: 'Phone',
    email: 'Mail',
    sms: 'MessageSquare',
    note: 'FileText',
    stage_change: 'ArrowRight',
    meeting: 'Calendar',
    other: 'MoreHorizontal',
  };
  return icons[type];
}

/**
 * Get activity type color
 */
export function getActivityColor(type: ActivityType): string {
  const colors: Record<ActivityType, string> = {
    call: 'text-blue-500',
    email: 'text-purple-500',
    sms: 'text-green-500',
    note: 'text-gray-500',
    stage_change: 'text-orange-500',
    meeting: 'text-cyan-500',
    other: 'text-gray-400',
  };
  return colors[type];
}
