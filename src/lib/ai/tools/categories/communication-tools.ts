/**
 * Communication Tools
 * Tools for generating communication content
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';

// ============================================================================
// Generate SMS Template Tool
// ============================================================================
const generateSmsTemplateInput = z.object({
  purpose: z.enum(['initial_contact', 'follow_up', 'offer', 'closing', 'general']),
  propertyId: z.string().optional(),
  sellerName: z.string().optional(),
  tone: z.enum(['professional', 'friendly', 'urgent']).default('friendly'),
  includeCallToAction: z.boolean().default(true),
});

const generateSmsTemplateOutput = z.object({
  message: z.string(),
  characterCount: z.number(),
  segments: z.number(),
  variations: z.array(z.string()),
});

type GenerateSmsTemplateInput = z.infer<typeof generateSmsTemplateInput>;
type GenerateSmsTemplateOutput = z.infer<typeof generateSmsTemplateOutput>;

const generateSmsTemplateDefinition: ToolDefinition<GenerateSmsTemplateInput, GenerateSmsTemplateOutput> = {
  id: 'comms.generate_sms_template',
  name: 'Generate SMS Template',
  description: 'Generate personalized SMS templates for seller outreach.',
  category: 'communications',
  requiredPermission: 'read',
  inputSchema: generateSmsTemplateInput,
  outputSchema: generateSmsTemplateOutput,
  requiresConfirmation: false,
  estimatedDuration: 2000,
  rateLimit: 30,
  tags: ['communication', 'sms', 'template', 'outreach'],
};

const generateSmsTemplateHandler: ToolHandler<GenerateSmsTemplateInput, GenerateSmsTemplateOutput> = async (input) => {
  console.log('[Comms] Generate SMS for:', input.purpose);
  const name = input.sellerName || 'there';
  const message = `Hi ${name}! I noticed your property and wanted to reach out. We buy houses in any condition. Would you be interested in a no-obligation cash offer? Reply YES to learn more.`;
  return {
    message,
    characterCount: message.length,
    segments: Math.ceil(message.length / 160),
    variations: [
      `Hey ${name}, quick question - any interest in selling your property? We pay cash and close fast!`,
      `Hi ${name}! I'm a local investor interested in your property. Can we chat?`,
    ],
  };
};

// ============================================================================
// Generate Email Sequence Tool
// ============================================================================
const generateEmailSequenceInput = z.object({
  purpose: z.enum(['cold_outreach', 'follow_up', 'nurture', 'closing']),
  propertyId: z.string().optional(),
  sequenceLength: z.number().min(1).max(10).default(5),
  daysBetween: z.number().min(1).max(14).default(3),
  tone: z.enum(['professional', 'friendly', 'urgent']).default('professional'),
});

const generateEmailSequenceOutput = z.object({
  emails: z.array(z.object({
    day: z.number(),
    subject: z.string(),
    body: z.string(),
    callToAction: z.string(),
  })),
  totalDuration: z.number(),
});

type GenerateEmailSequenceInput = z.infer<typeof generateEmailSequenceInput>;
type GenerateEmailSequenceOutput = z.infer<typeof generateEmailSequenceOutput>;

const generateEmailSequenceDefinition: ToolDefinition<GenerateEmailSequenceInput, GenerateEmailSequenceOutput> = {
  id: 'comms.generate_email_sequence',
  name: 'Generate Email Sequence',
  description: 'Generate a multi-email drip sequence for seller outreach.',
  category: 'communications',
  requiredPermission: 'read',
  inputSchema: generateEmailSequenceInput,
  outputSchema: generateEmailSequenceOutput,
  requiresConfirmation: false,
  estimatedDuration: 5000,
  rateLimit: 15,
  tags: ['communication', 'email', 'sequence', 'drip'],
};

const generateEmailSequenceHandler: ToolHandler<GenerateEmailSequenceInput, GenerateEmailSequenceOutput> = async (input) => {
  console.log('[Comms] Generate email sequence:', input.purpose);
  return {
    emails: Array.from({ length: input.sequenceLength }, (_, i) => ({
      day: i * input.daysBetween,
      subject: `Email ${i + 1}: ${input.purpose}`,
      body: `This is email ${i + 1} in the ${input.purpose} sequence...`,
      callToAction: 'Reply to this email or call us at (555) 123-4567',
    })),
    totalDuration: (input.sequenceLength - 1) * input.daysBetween,
  };
};

// ============================================================================
// Generate Talking Points Tool
// ============================================================================
const generateTalkingPointsInput = z.object({
  propertyId: z.string(),
  scenario: z.enum(['cold_call', 'callback', 'negotiation', 'objection_handling']),
  sellerSituation: z.string().optional(),
});

const generateTalkingPointsOutput = z.object({
  opener: z.string(),
  keyPoints: z.array(z.string()),
  objectionResponses: z.array(z.object({ objection: z.string(), response: z.string() })),
  closingStatements: z.array(z.string()),
});

type GenerateTalkingPointsInput = z.infer<typeof generateTalkingPointsInput>;
type GenerateTalkingPointsOutput = z.infer<typeof generateTalkingPointsOutput>;

const generateTalkingPointsDefinition: ToolDefinition<GenerateTalkingPointsInput, GenerateTalkingPointsOutput> = {
  id: 'comms.generate_talking_points',
  name: 'Generate Talking Points',
  description: 'Generate talking points and scripts for seller calls.',
  category: 'communications',
  requiredPermission: 'read',
  inputSchema: generateTalkingPointsInput,
  outputSchema: generateTalkingPointsOutput,
  requiresConfirmation: false,
  estimatedDuration: 3000,
  rateLimit: 25,
  tags: ['communication', 'script', 'call', 'talking-points'],
};

const generateTalkingPointsHandler: ToolHandler<GenerateTalkingPointsInput, GenerateTalkingPointsOutput> = async (input) => {
  console.log('[Comms] Generate talking points for:', input.scenario);
  return {
    opener: 'Hi, this is [Your Name] with [Company]. I was calling about your property...',
    keyPoints: ['We buy houses in any condition', 'No repairs needed', 'Close on your timeline', 'Cash offer within 24 hours'],
    objectionResponses: [
      { objection: "I'm not interested", response: "I understand. May I ask what your plans are for the property?" },
      { objection: 'The price is too low', response: "I appreciate that. What price would work for you?" },
    ],
    closingStatements: ['Would you like me to send over a no-obligation offer?', 'When would be a good time to meet at the property?'],
  };
};

// ============================================================================
// Register All Communication Tools
// ============================================================================
export function registerCommunicationTools() {
  toolRegistry.register(generateSmsTemplateDefinition, generateSmsTemplateHandler);
  toolRegistry.register(generateEmailSequenceDefinition, generateEmailSequenceHandler);
  toolRegistry.register(generateTalkingPointsDefinition, generateTalkingPointsHandler);
}

export const communicationTools = {
  generateSmsTemplate: generateSmsTemplateDefinition,
  generateEmailSequence: generateEmailSequenceDefinition,
  generateTalkingPoints: generateTalkingPointsDefinition,
};

