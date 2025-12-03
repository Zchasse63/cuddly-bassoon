/**
 * Buyer Communication Service
 * Manage communication history and preferences
 */

import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

export type MessageChannel = 'email' | 'sms' | 'phone' | 'other';
export type MessageDirection = 'inbound' | 'outbound';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'failed' | 'read';

export interface Message {
  id: string;
  buyer_id: string | null;
  deal_id: string | null;
  channel: MessageChannel;
  direction: MessageDirection;
  status: MessageStatus | null;
  subject: string | null;
  body: string;
  sender: string | null;
  recipient: string | null;
  external_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
}

export interface CommunicationStats {
  totalMessages: number;
  inboundCount: number;
  outboundCount: number;
  emailCount: number;
  smsCount: number;
  averageResponseTime?: number;
  lastContact?: string;
}

export interface SendMessageInput {
  buyer_id: string;
  channel: MessageChannel;
  subject?: string;
  body: string;
  deal_id?: string;
  recipient?: string;
}

export class CommunicationService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Get messages for a buyer
   */
  async getMessages(
    buyerId: string,
    options: {
      channel?: MessageChannel;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Message[]> {
    const { channel, limit = 50, offset = 0 } = options;

    let query = this.supabase
      .from('messages')
      .select('*')
      .eq('buyer_id', buyerId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (channel) {
      query = query.eq('channel', channel);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Failed to get messages: ${error.message}`);
    
    return (data || []) as unknown as Message[];
  }

  /**
   * Send a message to a buyer
   */
  async sendMessage(userId: string, input: SendMessageInput): Promise<Message> {
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        user_id: userId,
        buyer_id: input.buyer_id,
        deal_id: input.deal_id || null,
        channel: input.channel,
        direction: 'outbound',
        status: 'pending',
        subject: input.subject || null,
        body: input.body,
        recipient: input.recipient || null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to send message: ${error.message}`);
    return data as unknown as Message;
  }

  /**
   * Get communication stats for a buyer
   */
  async getBuyerStats(buyerId: string): Promise<CommunicationStats> {
    const { data: messages, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('buyer_id', buyerId);

    if (error) throw new Error(`Failed to get stats: ${error.message}`);

    const msgs = (messages || []) as unknown as Message[];
    
    const inbound = msgs.filter((m) => m.direction === 'inbound');
    const outbound = msgs.filter((m) => m.direction === 'outbound');
    const emails = msgs.filter((m) => m.channel === 'email');
    const sms = msgs.filter((m) => m.channel === 'sms');

    // Calculate average response time
    let avgResponseTime: number | undefined;
    if (inbound.length > 0 && outbound.length > 0) {
      // Simple calculation: time between last outbound and first inbound response
      const responseTimes: number[] = [];
      for (const out of outbound) {
        const outTime = new Date(out.created_at || 0).getTime();
        const nextIn = inbound.find(
          (i) => new Date(i.created_at || 0).getTime() > outTime
        );
        if (nextIn) {
          const inTime = new Date(nextIn.created_at || 0).getTime();
          responseTimes.push((inTime - outTime) / (1000 * 60 * 60)); // hours
        }
      }
      if (responseTimes.length > 0) {
        avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      }
    }

    // Get last contact
    const sortedMsgs = [...msgs].sort(
      (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    );
    const lastContact = sortedMsgs[0]?.created_at || undefined;

    return {
      totalMessages: msgs.length,
      inboundCount: inbound.length,
      outboundCount: outbound.length,
      emailCount: emails.length,
      smsCount: sms.length,
      averageResponseTime: avgResponseTime,
      lastContact,
    };
  }

  /**
   * Log a phone call
   */
  async logCall(
    userId: string,
    buyerId: string,
    notes: string,
    duration?: number
  ): Promise<Message> {
    const { data, error } = await this.supabase
      .from('messages')
      .insert({
        user_id: userId,
        buyer_id: buyerId,
        channel: 'phone',
        direction: 'outbound',
        status: 'delivered',
        body: notes,
        metadata: duration ? { duration_seconds: duration } : null,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to log call: ${error.message}`);
    return data as unknown as Message;
  }

  /**
   * Get recent activity across all buyers
   */
  async getRecentActivity(
    userId: string,
    limit = 20
  ): Promise<Array<Message & { buyer_name?: string }>> {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*, buyers(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to get activity: ${error.message}`);

    return (data || []).map((m) => ({
      ...(m as unknown as Message),
      buyer_name: (m.buyers as { name: string } | null)?.name,
    }));
  }
}

