/**
 * Twilio SMS Integration Service
 * Handles SMS sending, receiving, and webhook validation
 * Gracefully degrades when API keys are not configured
 */

import { SendSMSInput, SendMessageResult, ServiceStatus, Message } from './types';

// ============================================================================
// Configuration & Status
// ============================================================================

interface TwilioConfig {
  accountSid: string | undefined;
  authToken: string | undefined;
  phoneNumber: string | undefined;
}

function getConfig(): TwilioConfig {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  };
}

/**
 * Check if Twilio is properly configured
 */
export function isTwilioConfigured(): boolean {
  const config = getConfig();
  return !!(config.accountSid && config.authToken && config.phoneNumber);
}

/**
 * Get Twilio service status
 */
export function getTwilioStatus(): ServiceStatus {
  const config = getConfig();

  if (!config.accountSid || !config.authToken || !config.phoneNumber) {
    const missing: string[] = [];
    if (!config.accountSid) missing.push('TWILIO_ACCOUNT_SID');
    if (!config.authToken) missing.push('TWILIO_AUTH_TOKEN');
    if (!config.phoneNumber) missing.push('TWILIO_PHONE_NUMBER');

    return {
      configured: false,
      available: false,
      error: `Missing environment variables: ${missing.join(', ')}`,
    };
  }

  return {
    configured: true,
    available: true,
  };
}

// ============================================================================
// Phone Number Validation
// ============================================================================

/**
 * Validate and normalize phone number to E.164 format
 */
export function normalizePhoneNumber(phone: string): string | null {
  // Remove all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // If it starts with +, assume it's already in E.164
  if (cleaned.startsWith('+')) {
    if (cleaned.length >= 11 && cleaned.length <= 15) {
      return cleaned;
    }
    return null;
  }

  // US phone number without country code
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  // US phone number with country code
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }

  return null;
}

/**
 * Check if phone number is valid
 */
export function isValidPhoneNumber(phone: string): boolean {
  return normalizePhoneNumber(phone) !== null;
}

// ============================================================================
// SMS Sending
// ============================================================================

/**
 * Send an SMS message via Twilio
 */
export async function sendSMS(input: SendSMSInput): Promise<SendMessageResult> {
  const status = getTwilioStatus();

  if (!status.configured) {
    console.warn('[Twilio] SMS not sent - service not configured:', status.error);
    return {
      success: false,
      error:
        'Twilio is not configured. Please set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.',
      queued: false,
    };
  }

  const config = getConfig();
  const normalizedTo = normalizePhoneNumber(input.to);

  if (!normalizedTo) {
    return {
      success: false,
      error: `Invalid phone number: ${input.to}`,
    };
  }

  // Validate message length (SMS limit is 1600 characters for concatenated SMS)
  if (input.body.length > 1600) {
    return {
      success: false,
      error: 'Message exceeds maximum length of 1600 characters',
    };
  }

  try {
    // Dynamic import to avoid issues when twilio package is not installed
    const twilio = await import('twilio');
    const client = twilio.default(config.accountSid!, config.authToken!);

    const message = await client.messages.create({
      body: input.body,
      from: config.phoneNumber!,
      to: normalizedTo,
    });

    console.log(`[Twilio] SMS sent successfully. SID: ${message.sid}`);

    return {
      success: true,
      external_id: message.sid,
      message_id: message.sid,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Twilio] Failed to send SMS:', errorMessage);

    return {
      success: false,
      error: `Failed to send SMS: ${errorMessage}`,
    };
  }
}

// ============================================================================
// Webhook Signature Validation
// ============================================================================

/**
 * Validate Twilio webhook signature
 * Should be used in webhook handlers to verify requests are from Twilio
 */
export async function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): Promise<boolean> {
  if (!isTwilioConfigured()) {
    console.warn('[Twilio] Cannot validate signature - service not configured');
    return false;
  }

  const config = getConfig();

  try {
    const twilio = await import('twilio');
    const isValid = twilio.validateRequest(config.authToken!, signature, url, params);
    return isValid;
  } catch (error) {
    console.error('[Twilio] Signature validation error:', error);
    return false;
  }
}

// ============================================================================
// Inbound Message Parsing
// ============================================================================

export interface TwilioInboundMessage {
  from: string;
  to: string;
  body: string;
  messageSid: string;
  accountSid: string;
  numMedia: number;
  mediaUrls: string[];
}

/**
 * Parse an inbound Twilio webhook request body
 */
export function parseInboundSMS(params: Record<string, string>): TwilioInboundMessage {
  const numMedia = parseInt(params.NumMedia || '0', 10);
  const mediaUrls: string[] = [];

  for (let i = 0; i < numMedia; i++) {
    const url = params[`MediaUrl${i}`];
    if (url) mediaUrls.push(url);
  }

  return {
    from: params.From || '',
    to: params.To || '',
    body: params.Body || '',
    messageSid: params.MessageSid || '',
    accountSid: params.AccountSid || '',
    numMedia,
    mediaUrls,
  };
}

/**
 * Check if message contains opt-out keywords
 */
export function isOptOutMessage(body: string): boolean {
  const optOutKeywords = ['stop', 'unsubscribe', 'cancel', 'quit', 'end', 'optout', 'opt-out'];
  const normalizedBody = body.toLowerCase().trim();
  return optOutKeywords.some(
    (keyword) => normalizedBody === keyword || normalizedBody.startsWith(keyword + ' ')
  );
}

/**
 * Check if message is a help request
 */
export function isHelpMessage(body: string): boolean {
  const helpKeywords = ['help', 'info', 'information'];
  const normalizedBody = body.toLowerCase().trim();
  return helpKeywords.some((keyword) => normalizedBody === keyword);
}

// ============================================================================
// Voicemail Support
// ============================================================================

export interface VoicemailConfig {
  greeting?: string;
  transcribe: boolean;
  maxLength?: number; // seconds
}

/**
 * Generate TwiML for voicemail handling
 */
export function generateVoicemailTwiML(config: VoicemailConfig = { transcribe: true }): string {
  const greeting = config.greeting || 'Please leave a message after the beep.';
  const maxLength = config.maxLength || 120;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${greeting}</Say>
  <Record
    maxLength="${maxLength}"
    transcribe="${config.transcribe}"
    transcribeCallback="/api/webhooks/twilio/transcription"
    action="/api/webhooks/twilio/voicemail-complete"
  />
</Response>`;
}

/**
 * Generate TwiML response for SMS auto-reply
 */
export function generateSMSResponseTwiML(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${escapeXml(message)}</Message>
</Response>`;
}

/**
 * Generate empty TwiML response (for acknowledgment without reply)
 */
export function generateEmptyTwiML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response></Response>`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ============================================================================
// Rate Limiting & Throttling
// ============================================================================

/**
 * SMS Rate limits for reference
 * In production, these would be enforced via Redis or similar
 */
export const SMS_RATE_LIMIT = {
  perSecond: 1, // Max messages per second per number
  perMinute: 50, // Max messages per minute per account
  perDay: 1000, // Max messages per day per account
};

/**
 * Check if we should throttle SMS sending
 * In a real implementation, this would check against Redis or similar
 */
export function shouldThrottleSMS(): boolean {
  // TODO: Implement actual rate limiting with Redis
  // For now, always allow
  return false;
}

// ============================================================================
// Message Status Mapping
// ============================================================================

/**
 * Map Twilio status callback status to our internal status
 */
export function mapTwilioStatus(twilioStatus: string): Message['status'] {
  const statusMap: Record<string, Message['status']> = {
    queued: 'queued',
    sending: 'sending',
    sent: 'sent',
    delivered: 'delivered',
    undelivered: 'failed',
    failed: 'failed',
  };

  return statusMap[twilioStatus] || 'sent';
}
