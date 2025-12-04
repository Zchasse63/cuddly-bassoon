/**
 * Notification AI Tools
 * 10 tools for sending SMS, email, and managing communication
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import { createClient } from '@/lib/supabase/server';
import { CommunicationService, getTwilioStatus, getSendGridStatus } from '@/lib/communication';
import { TemplateService } from '@/lib/communication/templates';
import { checkSensitivity } from '@/lib/communication/sensitivity-filter';
import { generateMessage } from '@/lib/communication/ai-generator';

// ============================================================================
// 1. sendSMS - Send an SMS message
// ============================================================================
const sendSMSInput = z.object({
  to: z.string().describe('Recipient phone number'),
  message: z.string().describe('Message content'),
  leadId: z.string().optional(),
  dealId: z.string().optional(),
});

const sendSMSOutput = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
  error: z.string().optional(),
});

type SendSMSInput = z.infer<typeof sendSMSInput>;
type SendSMSOutput = z.infer<typeof sendSMSOutput>;

const sendSMSDef: ToolDefinition<SendSMSInput, SendSMSOutput> = {
  id: 'notification.send_sms',
  name: 'sendSMS',
  description: 'Send an SMS message to a phone number',
  category: 'communication',
  requiredPermission: 'execute',
  inputSchema: sendSMSInput,
  outputSchema: sendSMSOutput,
  requiresConfirmation: true,
  tags: ['sms', 'communication', 'notification'],
};

const sendSMSHandler: ToolHandler<SendSMSInput, SendSMSOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const commService = new CommunicationService(supabase);

  // Check sensitivity
  const sensitivity = checkSensitivity(input.message);
  if (sensitivity.sensitivity_level === 'forbidden') {
    return { success: false, error: 'Message contains forbidden content' };
  }

  const result = await commService.sendSMS(ctx.userId, {
    to: input.to,
    body: input.message,
    lead_id: input.leadId,
    deal_id: input.dealId,
  });

  return {
    success: result.success,
    messageId: result.message_id,
    error: result.error,
  };
};

// ============================================================================
// 2. sendEmail - Send an email
// ============================================================================
const sendEmailInput = z.object({
  to: z.string().describe('Recipient email address'),
  subject: z.string().describe('Email subject'),
  body: z.string().describe('Email body'),
  leadId: z.string().optional(),
  dealId: z.string().optional(),
});

const sendEmailOutput = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
  error: z.string().optional(),
});

type SendEmailInput = z.infer<typeof sendEmailInput>;
type SendEmailOutput = z.infer<typeof sendEmailOutput>;

const sendEmailDef: ToolDefinition<SendEmailInput, SendEmailOutput> = {
  id: 'notification.send_email',
  name: 'sendEmail',
  description: 'Send an email to a recipient',
  category: 'communication',
  requiredPermission: 'execute',
  inputSchema: sendEmailInput,
  outputSchema: sendEmailOutput,
  requiresConfirmation: true,
  tags: ['email', 'communication', 'notification'],
};

const sendEmailHandler: ToolHandler<SendEmailInput, SendEmailOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const commService = new CommunicationService(supabase);

  const sensitivity = checkSensitivity(input.body);
  if (sensitivity.sensitivity_level === 'forbidden') {
    return { success: false, error: 'Message contains forbidden content' };
  }

  const result = await commService.sendEmail(ctx.userId, {
    to: input.to,
    subject: input.subject,
    body: input.body,
    lead_id: input.leadId,
    deal_id: input.dealId,
  });

  return {
    success: result.success,
    messageId: result.message_id,
    error: result.error,
  };
};

// ============================================================================
// 3. sendFromTemplate - Send message using a template
// ============================================================================
const sendFromTemplateInput = z.object({
  templateId: z.string(),
  to: z.string(),
  variables: z.record(z.string(), z.string()),
  leadId: z.string().optional(),
  dealId: z.string().optional(),
});

const sendFromTemplateOutput = z.object({
  success: z.boolean(),
  messageId: z.string().optional(),
  error: z.string().optional(),
});

type SendFromTemplateInput = z.infer<typeof sendFromTemplateInput>;
type SendFromTemplateOutput = z.infer<typeof sendFromTemplateOutput>;

const sendFromTemplateDef: ToolDefinition<SendFromTemplateInput, SendFromTemplateOutput> = {
  id: 'notification.send_from_template',
  name: 'sendFromTemplate',
  description: 'Send a message using a pre-defined template',
  category: 'communication',
  requiredPermission: 'execute',
  inputSchema: sendFromTemplateInput,
  outputSchema: sendFromTemplateOutput,
  requiresConfirmation: true,
  tags: ['template', 'communication', 'notification'],
};

const sendFromTemplateHandler: ToolHandler<SendFromTemplateInput, SendFromTemplateOutput> = async (
  input,
  ctx
) => {
  const supabase = await createClient();
  const commService = new CommunicationService(supabase);

  const result = await commService.sendFromTemplate(
    ctx.userId,
    input.templateId,
    input.to,
    input.variables,
    {
      lead_id: input.leadId,
      deal_id: input.dealId,
    }
  );

  return {
    success: result.success,
    messageId: result.message_id,
    error: result.error,
  };
};

// ============================================================================
// 4. generateAIMessage - Generate personalized message with AI
// ============================================================================
const generateAIMessageInput = z.object({
  messageType: z.enum(['outreach', 'follow_up', 'offer', 'buyer_blast']),
  leadId: z.string().optional(),
  dealId: z.string().optional(),
  channel: z.enum(['sms', 'email']),
  customInstructions: z.string().optional(),
});

const generateAIMessageOutput = z.object({
  message: z.string(),
  subject: z.string().optional(),
  sensitivity: z.object({
    level: z.string(),
    topics: z.array(z.string()),
  }),
});

type GenerateAIMessageInput = z.infer<typeof generateAIMessageInput>;
type GenerateAIMessageOutput = z.infer<typeof generateAIMessageOutput>;

const generateAIMessageDef: ToolDefinition<GenerateAIMessageInput, GenerateAIMessageOutput> = {
  id: 'notification.generate_ai_message',
  name: 'generateAIMessage',
  description: 'Generate a personalized message using AI',
  category: 'communication',
  requiredPermission: 'execute',
  inputSchema: generateAIMessageInput,
  outputSchema: generateAIMessageOutput,
  requiresConfirmation: false,
  tags: ['ai', 'message', 'generation'],
};

const generateAIMessageHandler: ToolHandler<
  GenerateAIMessageInput,
  GenerateAIMessageOutput
> = async (input, ctx) => {
  const supabase = await createClient();

  // Get user info for sender context
  const { data: user } = await supabase
    .from('user_profiles')
    .select('full_name, company_name, phone')
    .eq('id', ctx.userId)
    .single();

  const purpose =
    input.messageType === 'outreach'
      ? 'Initial outreach to property owner'
      : input.messageType === 'follow_up'
        ? 'Follow up on previous conversation'
        : input.messageType === 'offer'
          ? 'Present an offer on the property'
          : 'Blast message to buyer list';

  const result = await generateMessage(purpose, {
    recipient_type: input.messageType === 'buyer_blast' ? 'buyer' : 'seller',
    channel: input.channel,
    sender_name: user?.full_name || 'Real Estate Professional',
    company_name: user?.company_name ?? undefined,
    sender_phone: user?.phone ?? undefined,
    tone: 'professional',
  });

  if (!result.success || !result.message) {
    return {
      message: '',
      sensitivity: {
        level: 'safe',
        topics: [],
      },
    };
  }

  return {
    message: result.message.body,
    subject: result.message.subject,
    sensitivity: {
      level: result.message.sensitivity_level,
      topics: result.message.detected_issues || [],
    },
  };
};

// ============================================================================
// 5. getInboxMessages - Get inbox messages
// ============================================================================
const getInboxInput = z.object({
  channel: z.enum(['sms', 'email', 'all']).default('all'),
  unreadOnly: z.boolean().default(false),
  limit: z.number().default(20),
});

const getInboxOutput = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      channel: z.string(),
      sender: z.string(),
      body: z.string(),
      is_read: z.boolean(),
      created_at: z.string(),
    })
  ),
  unread_count: z.number(),
});

type GetInboxInput = z.infer<typeof getInboxInput>;
type GetInboxOutput = z.infer<typeof getInboxOutput>;

const getInboxDef: ToolDefinition<GetInboxInput, GetInboxOutput> = {
  id: 'notification.get_inbox',
  name: 'getInboxMessages',
  description: 'Get messages from the unified inbox',
  category: 'communication',
  requiredPermission: 'read',
  inputSchema: getInboxInput,
  outputSchema: getInboxOutput,
  requiresConfirmation: false,
  tags: ['inbox', 'messages', 'communication'],
};

const getInboxHandler: ToolHandler<GetInboxInput, GetInboxOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const commService = new CommunicationService(supabase);

  const messages = await commService.getInboxMessages(ctx.userId, {
    channel: input.channel === 'all' ? undefined : input.channel,
    is_read: input.unreadOnly ? false : undefined,
    limit: input.limit,
  });

  const unreadCount = await commService.getUnreadCount(ctx.userId);

  return {
    messages: messages.map((m) => ({
      id: m.id,
      channel: m.channel,
      sender: m.sender || 'Unknown',
      body: m.body,
      is_read: m.is_read,
      created_at: m.created_at,
    })),
    unread_count: unreadCount,
  };
};

// ============================================================================
// 6. markAsRead - Mark messages as read
// ============================================================================
const markAsReadInput = z.object({
  messageIds: z.array(z.string()),
});

const markAsReadOutput = z.object({
  success: z.boolean(),
  marked: z.number(),
});

type MarkAsReadInput = z.infer<typeof markAsReadInput>;
type MarkAsReadOutput = z.infer<typeof markAsReadOutput>;

const markAsReadDef: ToolDefinition<MarkAsReadInput, MarkAsReadOutput> = {
  id: 'notification.mark_as_read',
  name: 'markAsRead',
  description: 'Mark messages as read',
  category: 'communication',
  requiredPermission: 'write',
  inputSchema: markAsReadInput,
  outputSchema: markAsReadOutput,
  requiresConfirmation: false,
  tags: ['inbox', 'messages', 'read'],
};

const markAsReadHandler: ToolHandler<MarkAsReadInput, MarkAsReadOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const commService = new CommunicationService(supabase);

  let marked = 0;
  for (const id of input.messageIds) {
    await commService.markAsRead(ctx.userId, id);
    marked++;
  }

  return { success: true, marked };
};

// ============================================================================
// 7. listTemplates - List available templates
// ============================================================================
const listTemplatesInput = z.object({
  channel: z.enum(['sms', 'email']).optional(),
  category: z.string().optional(),
});

const listTemplatesOutput = z.object({
  templates: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      channel: z.string(),
      category: z.string().optional(),
    })
  ),
});

type ListTemplatesInput = z.infer<typeof listTemplatesInput>;
type ListTemplatesOutput = z.infer<typeof listTemplatesOutput>;

const listTemplatesDef: ToolDefinition<ListTemplatesInput, ListTemplatesOutput> = {
  id: 'notification.list_templates',
  name: 'listTemplates',
  description: 'List available message templates',
  category: 'communication',
  requiredPermission: 'read',
  inputSchema: listTemplatesInput,
  outputSchema: listTemplatesOutput,
  requiresConfirmation: false,
  tags: ['templates', 'communication'],
};

const listTemplatesHandler: ToolHandler<ListTemplatesInput, ListTemplatesOutput> = async (
  input,
  ctx
) => {
  const supabase = await createClient();
  const templateService = new TemplateService(supabase);

  const templates = await templateService.listTemplates(ctx.userId, {
    channel: input.channel,
    category: input.category,
  });

  return {
    templates: templates.map((t) => ({
      id: t.id,
      name: t.name,
      channel: t.channel,
      category: t.category || undefined,
    })),
  };
};

// ============================================================================
// 8. getCommunicationStatus - Check service status
// ============================================================================
const getStatusInput = z.object({});

const getStatusOutput = z.object({
  sms: z.object({ configured: z.boolean(), error: z.string().optional() }),
  email: z.object({ configured: z.boolean(), error: z.string().optional() }),
});

type GetStatusInput = z.infer<typeof getStatusInput>;
type GetStatusOutput = z.infer<typeof getStatusOutput>;

const getStatusDef: ToolDefinition<GetStatusInput, GetStatusOutput> = {
  id: 'notification.get_status',
  name: 'getCommunicationStatus',
  description: 'Check if SMS and email services are configured',
  category: 'communication',
  requiredPermission: 'read',
  inputSchema: getStatusInput,
  outputSchema: getStatusOutput,
  requiresConfirmation: false,
  tags: ['status', 'configuration'],
};

const getStatusHandler: ToolHandler<GetStatusInput, GetStatusOutput> = async () => {
  const twilioStatus = getTwilioStatus();
  const sendgridStatus = getSendGridStatus();

  return {
    sms: { configured: twilioStatus.configured, error: twilioStatus.error },
    email: { configured: sendgridStatus.configured, error: sendgridStatus.error },
  };
};

// ============================================================================
// 9. checkOptOut - Check if contact has opted out
// ============================================================================
const checkOptOutInput = z.object({
  contact: z.string().describe('Phone number or email'),
  channel: z.enum(['sms', 'email']),
});

const checkOptOutOutput = z.object({
  opted_out: z.boolean(),
  opted_out_at: z.string().optional(),
});

type CheckOptOutInput = z.infer<typeof checkOptOutInput>;
type CheckOptOutOutput = z.infer<typeof checkOptOutOutput>;

const checkOptOutDef: ToolDefinition<CheckOptOutInput, CheckOptOutOutput> = {
  id: 'notification.check_opt_out',
  name: 'checkOptOut',
  description: 'Check if a contact has opted out of communications',
  category: 'communication',
  requiredPermission: 'read',
  inputSchema: checkOptOutInput,
  outputSchema: checkOptOutOutput,
  requiresConfirmation: false,
  tags: ['opt-out', 'compliance'],
};

const checkOptOutHandler: ToolHandler<CheckOptOutInput, CheckOptOutOutput> = async (input, ctx) => {
  const supabase = await createClient();
  const commService = new CommunicationService(supabase);

  const isOptedOut = await commService.checkOptOut(ctx.userId, input.contact, input.channel);

  return {
    opted_out: isOptedOut,
  };
};

// ============================================================================
// 10. getMessageHistory - Get message history for a contact
// ============================================================================
const getHistoryInput = z.object({
  contact: z.string().describe('Phone number or email'),
  limit: z.number().default(20),
});

const getHistoryOutput = z.object({
  messages: z.array(
    z.object({
      id: z.string(),
      direction: z.string(),
      channel: z.string(),
      body: z.string(),
      status: z.string(),
      created_at: z.string(),
    })
  ),
});

type GetHistoryInput = z.infer<typeof getHistoryInput>;
type GetHistoryOutput = z.infer<typeof getHistoryOutput>;

const getHistoryDef: ToolDefinition<GetHistoryInput, GetHistoryOutput> = {
  id: 'notification.get_history',
  name: 'getMessageHistory',
  description: 'Get message history for a specific contact',
  category: 'communication',
  requiredPermission: 'read',
  inputSchema: getHistoryInput,
  outputSchema: getHistoryOutput,
  requiresConfirmation: false,
  tags: ['history', 'messages', 'contact'],
};

const getHistoryHandler: ToolHandler<GetHistoryInput, GetHistoryOutput> = async (input, ctx) => {
  const supabase = await createClient();

  const { data: messages } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', ctx.userId)
    .or(`recipient.eq.${input.contact},sender.eq.${input.contact}`)
    .order('created_at', { ascending: false })
    .limit(input.limit);

  return {
    messages: (messages || []).map((m) => ({
      id: m.id,
      direction: m.direction,
      channel: m.channel,
      body: m.body,
      status: m.status || 'unknown',
      created_at: m.created_at || new Date().toISOString(),
    })),
  };
};

// ============================================================================
// Register all tools
// ============================================================================
export function registerNotificationTools(): void {
  toolRegistry.register(sendSMSDef, sendSMSHandler);
  toolRegistry.register(sendEmailDef, sendEmailHandler);
  toolRegistry.register(sendFromTemplateDef, sendFromTemplateHandler);
  toolRegistry.register(generateAIMessageDef, generateAIMessageHandler);
  toolRegistry.register(getInboxDef, getInboxHandler);
  toolRegistry.register(markAsReadDef, markAsReadHandler);
  toolRegistry.register(listTemplatesDef, listTemplatesHandler);
  toolRegistry.register(getStatusDef, getStatusHandler);
  toolRegistry.register(checkOptOutDef, checkOptOutHandler);
  toolRegistry.register(getHistoryDef, getHistoryHandler);
}
