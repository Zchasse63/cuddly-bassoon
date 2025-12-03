/**
 * Communication Service - Unified Interface
 * Provides a single entry point for all communication operations
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { Database, Json } from '@/types/database';
import {
  Message,
  MessageChannel,
  SendSMSInput,
  SendEmailInput,
  SendMessageResult,
  CommunicationServiceStatus,
  TemplateVariables,
} from './types';
import { sendSMS, getTwilioStatus, isTwilioConfigured } from './twilio';
import { sendEmail, getSendGridStatus, isSendGridConfigured } from './sendgrid';

export * from './types';
export * from './twilio';
export * from './sendgrid';

// ============================================================================
// Communication Service Class
// ============================================================================

export class CommunicationService {
  constructor(private supabase: SupabaseClient<Database>) {}

  // ==========================================================================
  // Service Status
  // ==========================================================================

  /**
   * Get status of all communication services
   */
  getServiceStatus(): CommunicationServiceStatus {
    return {
      twilio: getTwilioStatus(),
      sendgrid: getSendGridStatus(),
    };
  }

  /**
   * Check if any communication channel is available
   */
  isAnyChannelAvailable(): boolean {
    return isTwilioConfigured() || isSendGridConfigured();
  }

  // ==========================================================================
  // Message Sending
  // ==========================================================================

  /**
   * Send SMS message
   */
  async sendSMS(userId: string, input: SendSMSInput): Promise<SendMessageResult> {
    // Check for opt-out before sending
    const isOptedOut = await this.checkOptOut(userId, input.to, 'sms');
    if (isOptedOut) {
      return {
        success: false,
        error: 'Recipient has opted out of SMS messages',
      };
    }

    const result = await sendSMS(input);

    if (result.success) {
      await this.storeMessage(userId, {
        channel: 'sms',
        direction: 'outbound',
        recipient: input.to,
        body: input.body,
        status: 'sent',
        external_id: result.external_id,
        deal_id: input.deal_id,
        buyer_id: input.buyer_id,
        lead_id: input.lead_id,
      });
    }

    return result;
  }

  /**
   * Send email message
   */
  async sendEmail(userId: string, input: SendEmailInput): Promise<SendMessageResult> {
    // Check for opt-out before sending
    const isOptedOut = await this.checkOptOut(userId, input.to, 'email');
    if (isOptedOut) {
      return {
        success: false,
        error: 'Recipient has opted out of email messages',
      };
    }

    const result = await sendEmail(input);

    if (result.success) {
      await this.storeMessage(userId, {
        channel: 'email',
        direction: 'outbound',
        recipient: input.to,
        subject: input.subject,
        body: input.body,
        status: 'sent',
        external_id: result.external_id,
        deal_id: input.deal_id,
        buyer_id: input.buyer_id,
        lead_id: input.lead_id,
      });
    }

    return result;
  }

  /**
   * Send message using template
   */
  async sendFromTemplate(
    userId: string,
    templateId: string,
    recipient: string,
    variables: TemplateVariables,
    options?: {
      deal_id?: string;
      buyer_id?: string;
      lead_id?: string;
    }
  ): Promise<SendMessageResult> {
    // Get template
    const { data: template, error } = await this.supabase
      .from('templates')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', userId)
      .single();

    if (error || !template) {
      return { success: false, error: 'Template not found' };
    }

    // Render template
    const body = this.renderTemplate(template.body_template, variables);
    const subject = template.subject_template
      ? this.renderTemplate(template.subject_template, variables)
      : undefined;

    // Send based on channel
    if (template.channel === 'sms') {
      return this.sendSMS(userId, {
        to: recipient,
        body,
        template_id: templateId,
        ...options,
      });
    } else {
      return this.sendEmail(userId, {
        to: recipient,
        subject: subject || 'Message from Real Estate Platform',
        body,
        template_id: templateId,
        ...options,
      });
    }
  }

  // ==========================================================================
  // Template Rendering
  // ==========================================================================

  /**
   * Render a template string with variables
   */
  renderTemplate(template: string, variables: TemplateVariables): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      const value = variables[key];
      return value !== undefined ? String(value) : match;
    });
  }

  // ==========================================================================
  // Message Storage
  // ==========================================================================

  /**
   * Store a message in the database
   */
  private async storeMessage(userId: string, message: Partial<Message>): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        user_id: userId,
        channel: message.channel!,
        direction: message.direction!,
        recipient: message.recipient,
        sender: message.sender,
        subject: message.subject,
        body: message.body!,
        status: message.status || 'sent',
        external_id: message.external_id,
        deal_id: message.deal_id,
        buyer_id: message.buyer_id,
        lead_id: message.lead_id,
        thread_id: message.thread_id,
        metadata: message.metadata as unknown as Json,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[CommunicationService] Failed to store message:', error);
      return null;
    }

    return data?.id || null;
  }

  /**
   * Store an inbound message
   */
  async storeInboundMessage(
    userId: string,
    message: {
      channel: MessageChannel;
      sender: string;
      body: string;
      subject?: string;
      external_id?: string;
      voicemail_url?: string;
      transcription?: string;
    }
  ): Promise<string | null> {
    // Try to find existing thread
    const threadId = await this.findOrCreateThread(userId, message.sender, message.channel);

    return this.storeMessage(userId, {
      ...message,
      direction: 'inbound',
      status: 'delivered',
      thread_id: threadId,
      is_read: false,
    });
  }

  /**
   * Find or create a conversation thread
   */
  private async findOrCreateThread(
    userId: string,
    contactIdentifier: string,
    _channel: MessageChannel
  ): Promise<string> {
    // Look for existing thread with this contact
    const { data: existingMessage } = await this.supabase
      .from('messages')
      .select('thread_id')
      .eq('user_id', userId)
      .or(`recipient.eq.${contactIdentifier},sender.eq.${contactIdentifier}`)
      .not('thread_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (existingMessage?.thread_id) {
      return existingMessage.thread_id;
    }

    // Generate new thread ID
    return crypto.randomUUID();
  }

  // ==========================================================================
  // Opt-Out Management
  // ==========================================================================

  /**
   * Check if a contact has opted out
   */
  async checkOptOut(
    userId: string,
    contactIdentifier: string,
    channel: 'sms' | 'email'
  ): Promise<boolean> {
    const { data } = await this.supabase
      .from('opt_outs')
      .select('id')
      .eq('user_id', userId)
      .eq('contact_identifier', contactIdentifier)
      .or(`channel.eq.${channel},channel.eq.all`)
      .limit(1);

    return (data?.length || 0) > 0;
  }

  /**
   * Record an opt-out
   */
  async recordOptOut(
    userId: string,
    contactIdentifier: string,
    channel: 'sms' | 'email' | 'all',
    reason?: string
  ): Promise<void> {
    await this.supabase.from('opt_outs').upsert(
      {
        user_id: userId,
        contact_identifier: contactIdentifier,
        channel,
        reason,
        opted_out_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,contact_identifier,channel' }
    );
  }

  // ==========================================================================
  // Message Retrieval
  // ==========================================================================

  /**
   * Get messages for inbox view
   */
  async getInboxMessages(
    userId: string,
    options?: {
      channel?: MessageChannel;
      is_read?: boolean;
      limit?: number;
      offset?: number;
    }
  ): Promise<Message[]> {
    let query = this.supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.channel) {
      query = query.eq('channel', options.channel);
    }
    if (options?.is_read !== undefined) {
      query = query.eq('is_read', options.is_read);
    }
    if (options?.limit) {
      query = query.limit(options.limit);
    }
    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[CommunicationService] Failed to get inbox:', error);
      return [];
    }

    return data as Message[];
  }

  /**
   * Get conversation thread
   */
  async getThread(userId: string, threadId: string): Promise<Message[]> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[CommunicationService] Failed to get thread:', error);
      return [];
    }

    return data as Message[];
  }

  /**
   * Mark message as read
   */
  async markAsRead(userId: string, messageId: string): Promise<void> {
    await this.supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', messageId)
      .eq('user_id', userId);
  }

  /**
   * Mark all messages in thread as read
   */
  async markThreadAsRead(userId: string, threadId: string): Promise<void> {
    await this.supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('thread_id', threadId)
      .eq('user_id', userId)
      .eq('is_read', false);
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count } = await this.supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return count || 0;
  }

  /**
   * Update message status (for webhook callbacks)
   */
  async updateMessageStatus(externalId: string, status: Message['status']): Promise<void> {
    await this.supabase.from('messages').update({ status }).eq('external_id', externalId);
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create a new CommunicationService instance
 */
export function createCommunicationService(
  supabase: SupabaseClient<Database>
): CommunicationService {
  return new CommunicationService(supabase);
}
