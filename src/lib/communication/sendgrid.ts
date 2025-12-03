/**
 * SendGrid Email Integration Service
 * Handles email sending, tracking, and webhook processing
 * Gracefully degrades when API keys are not configured
 */

import {
  SendEmailInput,
  SendMessageResult,
  ServiceStatus,
  EmailAttachment,
  Message,
} from './types';

// ============================================================================
// Configuration & Status
// ============================================================================

interface SendGridConfig {
  apiKey: string | undefined;
  fromEmail: string | undefined;
  fromName: string | undefined;
}

function getConfig(): SendGridConfig {
  return {
    apiKey: process.env.SENDGRID_API_KEY,
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
    fromName: process.env.SENDGRID_FROM_NAME || 'Real Estate Platform',
  };
}

/**
 * Check if SendGrid is properly configured
 */
export function isSendGridConfigured(): boolean {
  const config = getConfig();
  return !!config.apiKey;
}

/**
 * Get SendGrid service status
 */
export function getSendGridStatus(): ServiceStatus {
  const config = getConfig();

  if (!config.apiKey) {
    return {
      configured: false,
      available: false,
      error: 'Missing environment variable: SENDGRID_API_KEY',
    };
  }

  return {
    configured: true,
    available: true,
  };
}

// ============================================================================
// Email Validation
// ============================================================================

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// ============================================================================
// Email Sending
// ============================================================================

/**
 * Send an email via SendGrid
 */
export async function sendEmail(input: SendEmailInput): Promise<SendMessageResult> {
  const status = getSendGridStatus();

  if (!status.configured) {
    console.warn('[SendGrid] Email not sent - service not configured:', status.error);
    return {
      success: false,
      error: 'SendGrid is not configured. Please set SENDGRID_API_KEY environment variable.',
      queued: false,
    };
  }

  const config = getConfig();

  if (!isValidEmail(input.to)) {
    return {
      success: false,
      error: `Invalid email address: ${input.to}`,
    };
  }

  try {
    // Dynamic import to avoid issues when @sendgrid/mail is not installed
    const sgMail = await import('@sendgrid/mail');
    sgMail.default.setApiKey(config.apiKey!);

    const message = {
      to: sanitizeEmail(input.to),
      from: {
        email: config.fromEmail!,
        name: config.fromName,
      },
      subject: input.subject,
      text: input.body,
      html: input.html_body || input.body.replace(/\n/g, '<br>'),
      trackingSettings: {
        clickTracking: { enable: true },
        openTracking: { enable: true },
      },
      attachments: undefined as
        | { content: string; filename: string; type: string; disposition: string }[]
        | undefined,
    };

    // Add attachments if present
    if (input.attachments && input.attachments.length > 0) {
      message.attachments = input.attachments.map((att: EmailAttachment) => ({
        content: att.content,
        filename: att.filename,
        type: att.type,
        disposition: 'attachment',
      }));
    }

    const [response] = await sgMail.default.send(message);
    const messageId = response.headers['x-message-id'] || `sg_${Date.now()}`;

    console.log(`[SendGrid] Email sent successfully. ID: ${messageId}`);

    return {
      success: true,
      external_id: messageId,
      message_id: messageId,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[SendGrid] Failed to send email:', errorMessage);

    // Check for specific SendGrid errors
    if (error && typeof error === 'object' && 'response' in error) {
      const sgError = error as { response?: { body?: { errors?: Array<{ message: string }> } } };
      const errors = sgError.response?.body?.errors;
      if (errors && errors.length > 0) {
        return {
          success: false,
          error: `SendGrid error: ${errors.map((e) => e.message).join(', ')}`,
        };
      }
    }

    return {
      success: false,
      error: `Failed to send email: ${errorMessage}`,
    };
  }
}

// ============================================================================
// Batch Email Sending
// ============================================================================

export interface BatchEmailInput {
  recipients: Array<{
    email: string;
    name?: string;
    substitutions?: Record<string, string>;
  }>;
  subject: string;
  body: string;
  html_body?: string;
}

/**
 * Send batch emails via SendGrid (up to 1000 per request)
 */
export async function sendBatchEmail(input: BatchEmailInput): Promise<SendMessageResult> {
  const status = getSendGridStatus();

  if (!status.configured) {
    return {
      success: false,
      error: 'SendGrid is not configured.',
      queued: false,
    };
  }

  if (input.recipients.length > 1000) {
    return {
      success: false,
      error: 'Maximum 1000 recipients per batch',
    };
  }

  const config = getConfig();

  try {
    const sgMail = await import('@sendgrid/mail');
    sgMail.default.setApiKey(config.apiKey!);

    const messages = input.recipients.map((recipient) => ({
      to: { email: sanitizeEmail(recipient.email), name: recipient.name },
      from: {
        email: config.fromEmail!,
        name: config.fromName,
      },
      subject: input.subject,
      text: input.body,
      html: input.html_body || input.body.replace(/\n/g, '<br>'),
      substitutions: recipient.substitutions,
    }));

    await sgMail.default.send(messages);

    return {
      success: true,
      message_id: `batch_${Date.now()}`,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      success: false,
      error: `Batch send failed: ${errorMessage}`,
    };
  }
}

// ============================================================================
// Webhook Event Handling
// ============================================================================

export type SendGridEventType =
  | 'processed'
  | 'dropped'
  | 'delivered'
  | 'deferred'
  | 'bounce'
  | 'open'
  | 'click'
  | 'spamreport'
  | 'unsubscribe'
  | 'group_unsubscribe'
  | 'group_resubscribe';

export interface SendGridWebhookEvent {
  email: string;
  timestamp: number;
  event: SendGridEventType;
  sg_message_id: string;
  sg_event_id: string;
  ip?: string;
  url?: string;
  useragent?: string;
  reason?: string;
  status?: string;
  response?: string;
  category?: string[];
}

/**
 * Parse SendGrid webhook events
 */
export function parseSendGridWebhook(body: unknown): SendGridWebhookEvent[] {
  if (!Array.isArray(body)) {
    return [];
  }

  return body.map((event: Record<string, unknown>) => ({
    email: String(event.email || ''),
    timestamp: Number(event.timestamp) || Date.now() / 1000,
    event: String(event.event) as SendGridEventType,
    sg_message_id: String(event.sg_message_id || ''),
    sg_event_id: String(event.sg_event_id || ''),
    ip: event.ip ? String(event.ip) : undefined,
    url: event.url ? String(event.url) : undefined,
    useragent: event.useragent ? String(event.useragent) : undefined,
    reason: event.reason ? String(event.reason) : undefined,
    status: event.status ? String(event.status) : undefined,
    response: event.response ? String(event.response) : undefined,
    category: Array.isArray(event.category) ? event.category.map(String) : undefined,
  }));
}

/**
 * Map SendGrid event to internal message status
 */
export function mapSendGridEvent(event: SendGridEventType): Message['status'] {
  const statusMap: Record<SendGridEventType, Message['status']> = {
    processed: 'queued',
    dropped: 'failed',
    delivered: 'delivered',
    deferred: 'queued',
    bounce: 'bounced',
    open: 'opened',
    click: 'clicked',
    spamreport: 'spam',
    unsubscribe: 'unsubscribed',
    group_unsubscribe: 'unsubscribed',
    group_resubscribe: 'delivered',
  };

  return statusMap[event] || 'sent';
}

/**
 * Check if event indicates opt-out
 */
export function isOptOutEvent(event: SendGridEventType): boolean {
  return ['unsubscribe', 'group_unsubscribe', 'spamreport'].includes(event);
}

// ============================================================================
// Webhook Signature Validation
// ============================================================================

/**
 * Validate SendGrid webhook signature
 * Uses Event Webhook Verification
 */
export async function validateSendGridSignature(
  publicKey: string,
  payload: string,
  signature: string,
  timestamp: string
): Promise<boolean> {
  try {
    const { EventWebhook } = await import('@sendgrid/eventwebhook');
    const eventWebhook = new EventWebhook();
    const ecPublicKey = eventWebhook.convertPublicKeyToECDSA(publicKey);
    return eventWebhook.verifySignature(ecPublicKey, payload, signature, timestamp);
  } catch (error) {
    console.error('[SendGrid] Signature validation error:', error);
    return false;
  }
}

// ============================================================================
// Email Templates
// ============================================================================

/**
 * Format HTML email with basic styling
 */
export function formatHtmlEmail(
  content: string,
  options?: {
    header?: string;
    footer?: string;
    primaryColor?: string;
  }
): string {
  const primaryColor = options?.primaryColor || '#7551FF';
  const header = options?.header || '';
  const footer = options?.footer || 'This message was sent by Real Estate Platform.';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${primaryColor}; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #fff; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .button { display: inline-block; padding: 12px 24px; background: ${primaryColor}; color: white; text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    ${header ? `<div class="header">${header}</div>` : ''}
    <div class="content">${content}</div>
    <div class="footer">${footer}</div>
  </div>
</body>
</html>`;
}
