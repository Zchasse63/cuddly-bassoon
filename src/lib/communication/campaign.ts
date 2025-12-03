/**
 * Campaign Service
 * Handles buyer blast campaigns with queuing, sending, and tracking
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Json } from '@/types/database';
import {
  Campaign,
  CreateCampaignInput,
  CampaignStats,
  CampaignRecipientCriteria,
  Template,
  TemplateVariables,
} from './types';
import { CommunicationService } from './index';
import { TemplateService } from './templates';

// ============================================================================
// Campaign Service Class
// ============================================================================

export class CampaignService {
  private commService: CommunicationService;
  private templateService: TemplateService;

  constructor(private supabase: SupabaseClient<Database>) {
    this.commService = new CommunicationService(supabase);
    this.templateService = new TemplateService(supabase);
  }

  // ==========================================================================
  // Campaign CRUD
  // ==========================================================================

  /**
   * Create a new campaign
   */
  async createCampaign(
    userId: string,
    input: CreateCampaignInput
  ): Promise<{ data: Campaign | null; error: string | null }> {
    // Validate template exists
    const template = await this.templateService.getTemplate(userId, input.template_id);
    if (!template) {
      return { data: null, error: 'Template not found' };
    }

    // Count recipients
    const recipientCount = await this.countRecipients(userId, input.recipient_criteria);

    const { data, error } = await this.supabase
      .from('campaigns')
      .insert({
        user_id: userId,
        name: input.name,
        description: input.description,
        deal_id: input.deal_id,
        template_id: input.template_id,
        channel: input.channel,
        recipient_criteria: input.recipient_criteria as unknown as Json,
        status: input.scheduled_at ? 'scheduled' : 'draft',
        scheduled_at: input.scheduled_at,
        messages_total: recipientCount,
      })
      .select()
      .single();

    if (error) {
      console.error('[CampaignService] Create error:', error);
      return { data: null, error: error.message };
    }

    return { data: data as Campaign, error: null };
  }

  /**
   * Get campaign by ID
   */
  async getCampaign(userId: string, campaignId: string): Promise<Campaign | null> {
    const { data, error } = await this.supabase
      .from('campaigns')
      .select('*')
      .eq('id', campaignId)
      .eq('user_id', userId)
      .single();

    if (error) {
      return null;
    }

    return data as Campaign;
  }

  /**
   * List campaigns
   */
  async listCampaigns(
    userId: string,
    options?: {
      status?: Campaign['status'];
      channel?: Campaign['channel'];
      limit?: number;
    }
  ): Promise<Campaign[]> {
    let query = this.supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.status) {
      query = query.eq('status', options.status);
    }
    if (options?.channel) {
      query = query.eq('channel', options.channel);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      return [];
    }

    return data as Campaign[];
  }

  /**
   * Update campaign
   */
  async updateCampaign(
    userId: string,
    campaignId: string,
    updates: Partial<CreateCampaignInput> & { status?: Campaign['status'] }
  ): Promise<{ data: Campaign | null; error: string | null }> {
    // Can only update draft or scheduled campaigns
    const existing = await this.getCampaign(userId, campaignId);
    if (!existing) {
      return { data: null, error: 'Campaign not found' };
    }
    if (!['draft', 'scheduled'].includes(existing.status)) {
      return { data: null, error: 'Cannot update campaign in progress' };
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.template_id !== undefined) updateData.template_id = updates.template_id;
    if (updates.recipient_criteria !== undefined) {
      updateData.recipient_criteria = updates.recipient_criteria;
      updateData.messages_total = await this.countRecipients(userId, updates.recipient_criteria);
    }
    if (updates.scheduled_at !== undefined) updateData.scheduled_at = updates.scheduled_at;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await this.supabase
      .from('campaigns')
      .update(updateData)
      .eq('id', campaignId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: data as Campaign, error: null };
  }

  /**
   * Delete campaign
   */
  async deleteCampaign(userId: string, campaignId: string): Promise<boolean> {
    const existing = await this.getCampaign(userId, campaignId);
    if (!existing || !['draft', 'scheduled'].includes(existing.status)) {
      return false;
    }

    const { error } = await this.supabase
      .from('campaigns')
      .delete()
      .eq('id', campaignId)
      .eq('user_id', userId);

    return !error;
  }

  // ==========================================================================
  // Campaign Execution
  // ==========================================================================

  /**
   * Start sending a campaign
   */
  async startCampaign(
    userId: string,
    campaignId: string
  ): Promise<{ success: boolean; error?: string }> {
    const campaign = await this.getCampaign(userId, campaignId);
    if (!campaign) {
      return { success: false, error: 'Campaign not found' };
    }
    if (!['draft', 'scheduled'].includes(campaign.status)) {
      return { success: false, error: 'Campaign cannot be started' };
    }

    // Get template
    const template = await this.templateService.getTemplate(userId, campaign.template_id!);
    if (!template) {
      return { success: false, error: 'Template not found' };
    }

    // Update status to sending
    await this.supabase
      .from('campaigns')
      .update({ status: 'sending', started_at: new Date().toISOString() })
      .eq('id', campaignId);

    // Get recipients
    const recipients = await this.getRecipients(userId, campaign.recipient_criteria);

    // Send messages (in batches for large campaigns)
    let sent = 0;
    let delivered = 0;
    let failed = 0;

    for (const recipient of recipients) {
      const variables = this.buildVariables(recipient, campaign);
      const result = await this.sendCampaignMessage(
        userId,
        campaign,
        template,
        recipient,
        variables
      );

      if (result.success) {
        sent++;
        delivered++; // Assume delivered for now, webhooks will update
      } else {
        failed++;
      }

      // Update progress periodically
      if ((sent + failed) % 10 === 0) {
        await this.updateCampaignStats(campaignId, { sent, delivered, failed });
      }
    }

    // Finalize campaign
    await this.supabase
      .from('campaigns')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        messages_sent: sent,
        messages_delivered: delivered,
        messages_failed: failed,
      })
      .eq('id', campaignId);

    return { success: true };
  }

  /**
   * Pause a running campaign
   */
  async pauseCampaign(userId: string, campaignId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('campaigns')
      .update({ status: 'paused' })
      .eq('id', campaignId)
      .eq('user_id', userId)
      .eq('status', 'sending');

    return !error;
  }

  /**
   * Cancel a campaign
   */
  async cancelCampaign(userId: string, campaignId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('campaigns')
      .update({ status: 'cancelled' })
      .eq('id', campaignId)
      .eq('user_id', userId)
      .in('status', ['draft', 'scheduled', 'sending', 'paused']);

    return !error;
  }

  // ==========================================================================
  // Recipient Management
  // ==========================================================================

  /**
   * Count recipients based on criteria
   */
  private async countRecipients(
    userId: string,
    criteria: CampaignRecipientCriteria
  ): Promise<number> {
    // If specific IDs provided
    if (criteria.buyer_ids && criteria.buyer_ids.length > 0) {
      return criteria.buyer_ids.length;
    }

    // Query buyers based on filters
    let query = this.supabase
      .from('buyers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (criteria.buyer_filters) {
      const filters = criteria.buyer_filters;
      if (filters.min_budget) {
        query = query.gte('budget_max', filters.min_budget);
      }
      if (filters.max_budget) {
        query = query.lte('budget_min', filters.max_budget);
      }
      if (filters.is_verified !== undefined) {
        query = query.eq('is_verified', filters.is_verified);
      }
    }

    const { count } = await query;
    return count || 0;
  }

  /**
   * Get recipients based on criteria
   */
  private async getRecipients(
    userId: string,
    criteria: CampaignRecipientCriteria
  ): Promise<BuyerRecipient[]> {
    // If specific IDs provided
    if (criteria.buyer_ids && criteria.buyer_ids.length > 0) {
      const { data } = await this.supabase
        .from('buyers')
        .select('id, name, email, phone')
        .eq('user_id', userId)
        .in('id', criteria.buyer_ids);

      return (data || []) as BuyerRecipient[];
    }

    // Query buyers based on filters
    let query = this.supabase.from('buyers').select('id, name, email, phone').eq('user_id', userId);

    if (criteria.buyer_filters) {
      const filters = criteria.buyer_filters;
      if (filters.min_budget) {
        query = query.gte('budget_max', filters.min_budget);
      }
      if (filters.max_budget) {
        query = query.lte('budget_min', filters.max_budget);
      }
      if (filters.is_verified !== undefined) {
        query = query.eq('is_verified', filters.is_verified);
      }
    }

    const { data } = await query;
    return (data || []) as BuyerRecipient[];
  }

  // ==========================================================================
  // Message Sending
  // ==========================================================================

  private async sendCampaignMessage(
    userId: string,
    campaign: Campaign,
    template: Template,
    recipient: BuyerRecipient,
    variables: TemplateVariables
  ): Promise<{ success: boolean; error?: string }> {
    const rendered = this.templateService.renderFullTemplate(template, variables);

    if (campaign.channel === 'sms') {
      if (!recipient.phone) {
        return { success: false, error: 'No phone number' };
      }
      const result = await this.commService.sendSMS(userId, {
        to: recipient.phone,
        body: rendered.body,
        buyer_id: recipient.id,
        deal_id: campaign.deal_id || undefined,
      });
      return { success: result.success, error: result.error };
    } else {
      if (!recipient.email) {
        return { success: false, error: 'No email address' };
      }
      const result = await this.commService.sendEmail(userId, {
        to: recipient.email,
        subject: rendered.subject || 'New Investment Opportunity',
        body: rendered.body,
        buyer_id: recipient.id,
        deal_id: campaign.deal_id || undefined,
      });
      return { success: result.success, error: result.error };
    }
  }

  private buildVariables(recipient: BuyerRecipient, _campaign: Campaign): TemplateVariables {
    return {
      buyer_name: recipient.name || 'Investor',
      // Add more variables as needed from deal, property, etc.
    };
  }

  private async updateCampaignStats(
    campaignId: string,
    stats: { sent: number; delivered: number; failed: number }
  ): Promise<void> {
    await this.supabase
      .from('campaigns')
      .update({
        messages_sent: stats.sent,
        messages_delivered: stats.delivered,
        messages_failed: stats.failed,
      })
      .eq('id', campaignId);
  }

  // ==========================================================================
  // Statistics
  // ==========================================================================

  /**
   * Get campaign statistics
   */
  async getCampaignStats(userId: string, campaignId: string): Promise<CampaignStats | null> {
    const campaign = await this.getCampaign(userId, campaignId);
    if (!campaign) return null;

    const total = campaign.messages_total;
    const sent = campaign.messages_sent;
    const delivered = campaign.messages_delivered;
    const opened = campaign.messages_opened;
    const clicked = campaign.messages_clicked;
    const failed = campaign.messages_failed;

    return {
      total,
      sent,
      delivered,
      opened,
      clicked,
      failed,
      delivery_rate: sent > 0 ? (delivered / sent) * 100 : 0,
      open_rate: delivered > 0 ? (opened / delivered) * 100 : 0,
      click_rate: opened > 0 ? (clicked / opened) * 100 : 0,
    };
  }
}

// ============================================================================
// Types
// ============================================================================

interface BuyerRecipient {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

// ============================================================================
// Factory Function
// ============================================================================

export function createCampaignService(supabase: SupabaseClient<Database>): CampaignService {
  return new CampaignService(supabase);
}
