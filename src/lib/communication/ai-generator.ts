/**
 * AI Message Generation Service
 * Uses Claude AI to generate personalized, context-aware messages
 */

import Anthropic from '@anthropic-ai/sdk';
import { MessageChannel, SensitivityLevel } from './types';

// ============================================================================
// Configuration
// ============================================================================

function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('[AIGenerator] ANTHROPIC_API_KEY not configured');
    return null;
  }
  return new Anthropic({ apiKey });
}

// ============================================================================
// Types
// ============================================================================

export interface MessageGenerationContext {
  // Recipient info
  recipient_name?: string;
  recipient_type: 'seller' | 'buyer' | 'lead';

  // Property info
  property_address?: string;
  property_type?: string;
  property_condition?: string;
  estimated_value?: number;

  // Deal info
  offer_amount?: number;
  deal_stage?: string;

  // Sender info
  sender_name: string;
  company_name?: string;
  sender_phone?: string;

  // Communication context
  previous_messages?: string[];
  relationship_notes?: string;

  // Constraints
  channel: MessageChannel;
  max_length?: number;
  tone?: 'professional' | 'friendly' | 'casual' | 'urgent';

  // Sensitivity
  forbidden_topics?: string[];
}

export interface GeneratedMessage {
  subject?: string;
  body: string;
  sensitivity_level: SensitivityLevel;
  detected_issues?: string[];
  suggestions?: string[];
}

export interface MessageGenerationResult {
  success: boolean;
  message?: GeneratedMessage;
  error?: string;
}

// ============================================================================
// System Prompts
// ============================================================================

const SYSTEM_PROMPT = `You are an expert real estate communication assistant. Your role is to help generate professional, personalized messages for real estate wholesaling operations.

CRITICAL RULES:
1. NEVER mention or reference sensitive topics including:
   - Divorce or marital problems
   - Foreclosure or financial distress
   - Death, probate, or inheritance
   - Health issues or disabilities
   - Legal troubles or lawsuits
   - Bankruptcy or debt

2. Keep messages:
   - Professional but warm
   - Concise and to the point
   - Focused on value proposition
   - Compliant with real estate communication laws

3. For SMS messages:
   - Keep under 160 characters when possible
   - Maximum 320 characters
   - No special formatting

4. For emails:
   - Include a clear subject line
   - Use proper formatting
   - Include call to action

5. Always personalize based on available context.

Respond in JSON format with:
{
  "subject": "Email subject (only for email channel)",
  "body": "The message body",
  "sensitivity_level": "safe" | "caution" | "forbidden",
  "detected_issues": ["any potential issues found"],
  "suggestions": ["improvement suggestions"]
}`;

// ============================================================================
// Message Generation
// ============================================================================

/**
 * Generate a personalized message using AI
 */
export async function generateMessage(
  purpose: string,
  context: MessageGenerationContext
): Promise<MessageGenerationResult> {
  const client = getAnthropicClient();

  if (!client) {
    return {
      success: false,
      error: 'AI service not configured. Please set ANTHROPIC_API_KEY.',
    };
  }

  const maxLength =
    context.channel === 'sms' ? context.max_length || 320 : context.max_length || 2000;

  const prompt = buildPrompt(purpose, context, maxLength);

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (!content || content.type !== 'text') {
      return { success: false, error: 'Unexpected response format' };
    }

    const parsed = parseAIResponse(content.text);
    if (!parsed) {
      return { success: false, error: 'Failed to parse AI response' };
    }

    return { success: true, message: parsed };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AIGenerator] Generation failed:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

function buildPrompt(
  purpose: string,
  context: MessageGenerationContext,
  maxLength: number
): string {
  const parts: string[] = [
    `Generate a ${context.channel} message for the following purpose: ${purpose}`,
    '',
    'CONTEXT:',
  ];

  if (context.recipient_name) {
    parts.push(`- Recipient: ${context.recipient_name} (${context.recipient_type})`);
  }
  if (context.property_address) {
    parts.push(`- Property: ${context.property_address}`);
  }
  if (context.property_type) {
    parts.push(`- Property Type: ${context.property_type}`);
  }
  if (context.offer_amount) {
    parts.push(`- Offer Amount: $${context.offer_amount.toLocaleString()}`);
  }
  if (context.deal_stage) {
    parts.push(`- Deal Stage: ${context.deal_stage}`);
  }
  parts.push(
    `- Sender: ${context.sender_name}${context.company_name ? ` (${context.company_name})` : ''}`
  );

  if (context.previous_messages && context.previous_messages.length > 0) {
    parts.push('', 'PREVIOUS MESSAGES:');
    context.previous_messages.slice(-3).forEach((msg, i) => {
      parts.push(`${i + 1}. ${msg.substring(0, 200)}...`);
    });
  }

  if (context.relationship_notes) {
    parts.push('', `RELATIONSHIP NOTES: ${context.relationship_notes}`);
  }

  parts.push('', 'CONSTRAINTS:');
  parts.push(`- Channel: ${context.channel}`);
  parts.push(`- Maximum length: ${maxLength} characters`);
  parts.push(`- Tone: ${context.tone || 'professional'}`);

  if (context.forbidden_topics && context.forbidden_topics.length > 0) {
    parts.push(`- AVOID these topics: ${context.forbidden_topics.join(', ')}`);
  }

  return parts.join('\n');
}

function parseAIResponse(text: string): GeneratedMessage | null {
  try {
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      subject: parsed.subject,
      body: parsed.body || '',
      sensitivity_level: parsed.sensitivity_level || 'safe',
      detected_issues: parsed.detected_issues || [],
      suggestions: parsed.suggestions || [],
    };
  } catch {
    return null;
  }
}

// ============================================================================
// Specialized Generators
// ============================================================================

/**
 * Generate initial outreach message
 */
export async function generateOutreachMessage(
  context: MessageGenerationContext
): Promise<MessageGenerationResult> {
  return generateMessage(
    'Initial outreach to a property owner to express interest in purchasing their property',
    context
  );
}

/**
 * Generate follow-up message
 */
export async function generateFollowUpMessage(
  context: MessageGenerationContext,
  daysSinceLastContact: number
): Promise<MessageGenerationResult> {
  return generateMessage(
    `Follow-up message after ${daysSinceLastContact} days of no response. Be polite and not pushy.`,
    context
  );
}

/**
 * Generate offer presentation message
 */
export async function generateOfferMessage(
  context: MessageGenerationContext
): Promise<MessageGenerationResult> {
  if (!context.offer_amount) {
    return { success: false, error: 'Offer amount is required' };
  }
  return generateMessage(
    'Present a cash offer for the property. Highlight benefits like quick closing and no repairs needed.',
    context
  );
}

/**
 * Generate buyer blast message
 */
export async function generateBuyerBlastMessage(
  context: MessageGenerationContext
): Promise<MessageGenerationResult> {
  return generateMessage(
    'Announce a new investment opportunity to a buyer. Create urgency and highlight key property details.',
    { ...context, recipient_type: 'buyer' }
  );
}

/**
 * Generate response to inbound message
 */
export async function generateResponseMessage(
  context: MessageGenerationContext,
  inboundMessage: string
): Promise<MessageGenerationResult> {
  return generateMessage(
    `Respond to this inbound message: "${inboundMessage}". Be helpful and move the conversation forward.`,
    context
  );
}

// ============================================================================
// Message Improvement
// ============================================================================

/**
 * Improve an existing message
 */
export async function improveMessage(
  originalMessage: string,
  channel: MessageChannel,
  instructions?: string
): Promise<MessageGenerationResult> {
  const client = getAnthropicClient();

  if (!client) {
    return {
      success: false,
      error: 'AI service not configured.',
    };
  }

  const prompt = `Improve this ${channel} message while maintaining its core intent:

ORIGINAL MESSAGE:
${originalMessage}

${instructions ? `SPECIFIC INSTRUCTIONS: ${instructions}` : ''}

Make it more professional, engaging, and effective. Ensure it follows all sensitivity guidelines.`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (!content || content.type !== 'text') {
      return { success: false, error: 'Unexpected response format' };
    }

    const parsed = parseAIResponse(content.text);
    if (!parsed) {
      return { success: false, error: 'Failed to parse AI response' };
    }

    return { success: true, message: parsed };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}

// ============================================================================
// Subject Line Generation
// ============================================================================

/**
 * Generate email subject lines
 */
export async function generateSubjectLines(
  context: MessageGenerationContext,
  count: number = 3
): Promise<{ success: boolean; subjects?: string[]; error?: string }> {
  const client = getAnthropicClient();

  if (!client) {
    return { success: false, error: 'AI service not configured.' };
  }

  const prompt = `Generate ${count} compelling email subject lines for a real estate message.

Context:
- Recipient: ${context.recipient_name || 'Property Owner'} (${context.recipient_type})
- Property: ${context.property_address || 'their property'}
- Purpose: ${context.deal_stage || 'initial outreach'}

Requirements:
- Keep under 50 characters
- Create curiosity without being clickbait
- Be professional
- Avoid spam trigger words

Respond with a JSON array of subject lines: ["subject1", "subject2", "subject3"]`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (!content || content.type !== 'text') {
      return { success: false, error: 'Unexpected response format' };
    }

    const match = content.text.match(/\[[\s\S]*\]/);
    if (!match) {
      return { success: false, error: 'Failed to parse subjects' };
    }

    const subjects = JSON.parse(match[0]);
    return { success: true, subjects };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
}
