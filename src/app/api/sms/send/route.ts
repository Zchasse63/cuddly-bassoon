/**
 * SMS Send API Route
 * POST /api/sms/send - Send an SMS message
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CommunicationService, getTwilioStatus } from '@/lib/communication';
import { checkSensitivity } from '@/lib/communication/sensitivity-filter';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check Twilio configuration
    const twilioStatus = getTwilioStatus();
    if (!twilioStatus.configured) {
      return NextResponse.json(
        {
          error: 'SMS service not configured',
          details: twilioStatus.error,
          configured: false,
        },
        { status: 503 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { to, message, deal_id, buyer_id, lead_id, template_id, variables } = body;

    // Validate required fields
    if (!to || !message) {
      return NextResponse.json({ error: 'Missing required fields: to, message' }, { status: 400 });
    }

    // Check message sensitivity
    const sensitivityCheck = checkSensitivity(message);
    if (sensitivityCheck.sensitivity_level === 'forbidden') {
      return NextResponse.json(
        {
          error: 'Message contains forbidden content',
          detected_topics: sensitivityCheck.detected_topics,
          suggestions: sensitivityCheck.suggestions,
        },
        { status: 422 }
      );
    }

    // Send SMS
    const commService = new CommunicationService(supabase);
    const result = await commService.sendSMS(user.id, {
      to,
      body: message,
      deal_id,
      buyer_id,
      lead_id,
      template_id,
      variables,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message_id: result.message_id,
      external_id: result.external_id,
      sensitivity_warning:
        sensitivityCheck.sensitivity_level === 'caution' ? sensitivityCheck.suggestions : undefined,
    });
  } catch (error) {
    console.error('[API] SMS send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint to check SMS service status
export async function GET() {
  const status = getTwilioStatus();
  return NextResponse.json({
    service: 'twilio',
    ...status,
  });
}
