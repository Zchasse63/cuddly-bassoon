/**
 * Twilio Webhook Handler
 * POST /api/webhooks/twilio - Handle inbound SMS and status callbacks
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  validateTwilioSignature,
  parseInboundSMS,
  isOptOutMessage,
  isHelpMessage,
  generateSMSResponseTwiML,
  generateEmptyTwiML,
  mapTwilioStatus,
  isTwilioConfigured,
} from '@/lib/communication/twilio';
import { CommunicationService } from '@/lib/communication';
import { handleTrigger } from '@/lib/automation/workflow-executor';

export async function POST(request: NextRequest) {
  try {
    // Check if Twilio is configured
    if (!isTwilioConfigured()) {
      console.warn('[Webhook] Twilio not configured, ignoring webhook');
      return new NextResponse(generateEmptyTwiML(), {
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Parse form data
    const formData = await request.formData();
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = String(value);
    });

    // Validate signature in production
    if (process.env.NODE_ENV === 'production') {
      const signature = request.headers.get('X-Twilio-Signature') || '';
      const url = request.url;
      const isValid = await validateTwilioSignature(signature, url, params);

      if (!isValid) {
        console.error('[Webhook] Invalid Twilio signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    }

    // Determine webhook type
    const messageStatus = params.MessageStatus;

    if (messageStatus) {
      // Status callback
      return handleStatusCallback(params);
    } else {
      // Inbound message
      return handleInboundMessage(params);
    }
  } catch (error) {
    console.error('[Webhook] Twilio error:', error);
    return new NextResponse(generateEmptyTwiML(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }
}

/**
 * Handle inbound SMS message
 */
async function handleInboundMessage(params: Record<string, string>) {
  const message = parseInboundSMS(params);
  const supabase = await createClient();

  // Find user by Twilio phone number (the "To" number)
  // In a real app, you'd have a mapping of phone numbers to users
  const { data: userProfile } = await supabase.from('user_profiles').select('id').limit(1).single();

  if (!userProfile) {
    console.warn('[Webhook] No user found for inbound message');
    return new NextResponse(generateEmptyTwiML(), {
      headers: { 'Content-Type': 'text/xml' },
    });
  }

  const userId = userProfile.id;
  const commService = new CommunicationService(supabase);

  // Check for opt-out
  if (isOptOutMessage(message.body)) {
    await commService.recordOptOut(userId, message.from, 'sms', 'User replied STOP');

    return new NextResponse(
      generateSMSResponseTwiML('You have been unsubscribed. Reply START to resubscribe.'),
      { headers: { 'Content-Type': 'text/xml' } }
    );
  }

  // Check for help request
  if (isHelpMessage(message.body)) {
    return new NextResponse(
      generateSMSResponseTwiML('Reply STOP to unsubscribe. For assistance, call our office.'),
      { headers: { 'Content-Type': 'text/xml' } }
    );
  }

  // Store inbound message
  await commService.storeInboundMessage(userId, {
    channel: 'sms',
    sender: message.from,
    body: message.body,
    external_id: message.messageSid,
  });

  // Trigger workflows for inbound message
  await handleTrigger(supabase, userId, 'inbound_message', {
    channel: 'sms',
    sender: message.from,
    body: message.body,
    phone: message.from,
  });

  // Create notification for new message
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'new_message',
    title: 'New SMS Received',
    message: `From ${message.from}: ${message.body.substring(0, 100)}...`,
    priority: 'normal',
  });

  // Return empty response (no auto-reply by default)
  return new NextResponse(generateEmptyTwiML(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}

/**
 * Handle message status callback
 */
async function handleStatusCallback(params: Record<string, string>) {
  const messageSid = params.MessageSid;
  const status = params.MessageStatus;
  const errorCode = params.ErrorCode;

  if (!messageSid || !status) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = await createClient();
  const commService = new CommunicationService(supabase);

  // Map Twilio status to our status
  const mappedStatus = mapTwilioStatus(status);

  // Update message status
  await commService.updateMessageStatus(messageSid, mappedStatus);

  // If failed, create notification
  if (mappedStatus === 'failed' && errorCode) {
    const { data: message } = await supabase
      .from('messages')
      .select('user_id, recipient')
      .eq('external_id', messageSid)
      .single();

    if (message) {
      await supabase.from('notifications').insert({
        user_id: message.user_id,
        type: 'delivery_failure',
        title: 'SMS Delivery Failed',
        message: `Failed to deliver SMS to ${message.recipient}. Error: ${errorCode}`,
        priority: 'high',
      });
    }
  }

  return NextResponse.json({ success: true });
}
