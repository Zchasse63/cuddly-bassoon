/**
 * Email Send API Route
 * POST /api/email/send - Send an email message
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { CommunicationService, getSendGridStatus } from '@/lib/communication';
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

    // Check SendGrid configuration
    const sendgridStatus = getSendGridStatus();
    if (!sendgridStatus.configured) {
      return NextResponse.json(
        {
          error: 'Email service not configured',
          details: sendgridStatus.error,
          configured: false,
        },
        { status: 503 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      to,
      subject,
      message,
      html_body,
      deal_id,
      buyer_id,
      lead_id,
      template_id,
      variables,
      attachments,
    } = body;

    // Validate required fields
    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message' },
        { status: 400 }
      );
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

    // Send email
    const commService = new CommunicationService(supabase);
    const result = await commService.sendEmail(user.id, {
      to,
      subject,
      body: message,
      html_body,
      deal_id,
      buyer_id,
      lead_id,
      template_id,
      variables,
      attachments,
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
    console.error('[API] Email send error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint to check email service status
export async function GET() {
  const status = getSendGridStatus();
  return NextResponse.json({
    service: 'sendgrid',
    ...status,
  });
}
