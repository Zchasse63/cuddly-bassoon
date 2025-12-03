/**
 * SendGrid Webhook Handler
 * POST /api/webhooks/sendgrid - Handle email events (delivery, opens, clicks, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  parseSendGridWebhook,
  mapSendGridEvent,
  isOptOutEvent,
  isSendGridConfigured,
} from '@/lib/communication/sendgrid';
import { CommunicationService } from '@/lib/communication';

export async function POST(request: NextRequest) {
  try {
    // Check if SendGrid is configured
    if (!isSendGridConfigured()) {
      console.warn('[Webhook] SendGrid not configured, ignoring webhook');
      return NextResponse.json({ success: true });
    }

    // Parse webhook body
    const body = await request.json();
    const events = parseSendGridWebhook(body);

    if (events.length === 0) {
      return NextResponse.json({ success: true, processed: 0 });
    }

    const supabase = await createClient();
    const commService = new CommunicationService(supabase);

    let processed = 0;
    let errors = 0;

    for (const event of events) {
      try {
        // Map SendGrid event to our status
        const status = mapSendGridEvent(event.event);

        // Update message status
        if (event.sg_message_id) {
          await commService.updateMessageStatus(event.sg_message_id, status);
        }

        // Handle opt-out events
        if (isOptOutEvent(event.event)) {
          // Find the user who sent the original message
          const { data: message } = await supabase
            .from('messages')
            .select('user_id')
            .eq('external_id', event.sg_message_id)
            .single();

          if (message) {
            await commService.recordOptOut(
              message.user_id,
              event.email,
              'email',
              `SendGrid event: ${event.event}`
            );
          }
        }

        // Handle bounce/failure events
        if (['bounce', 'dropped'].includes(event.event)) {
          const { data: message } = await supabase
            .from('messages')
            .select('user_id, recipient')
            .eq('external_id', event.sg_message_id)
            .single();

          if (message) {
            // Use type assertion for Phase 9 tables not yet in generated types
            await (
              supabase as unknown as {
                from: (table: string) => {
                  insert: (data: Record<string, unknown>) => Promise<unknown>;
                };
              }
            )
              .from('notifications')
              .insert({
                user_id: message.user_id,
                type: 'delivery_failure',
                title: 'Email Delivery Failed',
                message: `Email to ${event.email} ${event.event === 'bounce' ? 'bounced' : 'was dropped'}. ${event.reason || ''}`,
                priority: 'high',
              });
          }
        }

        // Update campaign stats for opens/clicks
        if (event.event === 'open' || event.event === 'click') {
          await updateCampaignStats(supabase, event.sg_message_id, event.event);
        }

        processed++;
      } catch (error) {
        console.error('[Webhook] Error processing event:', error);
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      errors,
    });
  } catch (error) {
    console.error('[Webhook] SendGrid error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Update campaign statistics for opens/clicks
 */
async function updateCampaignStats(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  messageId: string,
  eventType: 'open' | 'click'
) {
  // Find the message and its associated campaign
  const { data: message } = await supabase
    .from('messages')
    .select('deal_id')
    .eq('external_id', messageId)
    .single();

  if (!message?.deal_id) return;

  // Find campaign for this deal
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('id, messages_opened, messages_clicked')
    .eq('deal_id', message.deal_id)
    .single();

  if (!campaign) return;

  // Increment the appropriate counter
  const updates: Record<string, number> = {};
  if (eventType === 'open') {
    updates.messages_opened = (campaign.messages_opened || 0) + 1;
  } else if (eventType === 'click') {
    updates.messages_clicked = (campaign.messages_clicked || 0) + 1;
  }

  await supabase.from('campaigns').update(updates).eq('id', campaign.id);
}
