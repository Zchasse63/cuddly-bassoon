/**
 * Workflow Automation Tools
 * Tools for automating repetitive tasks and workflows
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';

// ============================================================================
// Auto Follow-Up Tool
// ============================================================================
const autoFollowUpInput = z.object({
  dealId: z.string(),
  followUpType: z.enum(['email', 'sms', 'call_reminder']),
  delayDays: z.number().min(1).max(30).default(3),
  message: z.string().optional(),
  maxAttempts: z.number().min(1).max(10).default(3),
});

const autoFollowUpOutput = z.object({
  automationId: z.string(),
  scheduledAt: z.string(),
  status: z.enum(['scheduled', 'active', 'paused', 'completed']),
});

type AutoFollowUpInput = z.infer<typeof autoFollowUpInput>;
type AutoFollowUpOutput = z.infer<typeof autoFollowUpOutput>;

const autoFollowUpDefinition: ToolDefinition<AutoFollowUpInput, AutoFollowUpOutput> = {
  id: 'workflow.auto_follow_up',
  name: 'Auto Follow-Up',
  description: 'Schedule automatic follow-up communications for a deal.',
  category: 'automation',
  requiredPermission: 'execute',
  inputSchema: autoFollowUpInput,
  outputSchema: autoFollowUpOutput,
  requiresConfirmation: true,
  estimatedDuration: 2000,
  rateLimit: 30,
  tags: ['automation', 'follow-up', 'communication'],
};

const autoFollowUpHandler: ToolHandler<AutoFollowUpInput, AutoFollowUpOutput> = async (input) => {
  console.log('[Automation] Auto follow-up for deal:', input.dealId);
  return {
    automationId: `auto_${Date.now()}`,
    scheduledAt: new Date(Date.now() + input.delayDays * 86400000).toISOString(),
    status: 'scheduled',
  };
};

// ============================================================================
// Deal Stage Trigger Tool
// ============================================================================
const dealStageTriggerInput = z.object({
  triggerName: z.string(),
  fromStage: z.string(),
  toStage: z.string(),
  actions: z.array(z.object({
    type: z.enum(['notify', 'create_task', 'send_email', 'update_field']),
    config: z.record(z.string(), z.unknown()),
  })),
  conditions: z.array(z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'greater_than', 'less_than', 'contains']),
    value: z.unknown(),
  })).optional(),
});

const dealStageTriggerOutput = z.object({
  triggerId: z.string(),
  status: z.enum(['active', 'inactive']),
  createdAt: z.string(),
});

type DealStageTriggerInput = z.infer<typeof dealStageTriggerInput>;
type DealStageTriggerOutput = z.infer<typeof dealStageTriggerOutput>;

const dealStageTriggerDefinition: ToolDefinition<DealStageTriggerInput, DealStageTriggerOutput> = {
  id: 'workflow.deal_stage_trigger',
  name: 'Deal Stage Trigger',
  description: 'Create automated actions when deals move between stages.',
  category: 'automation',
  requiredPermission: 'admin',
  inputSchema: dealStageTriggerInput,
  outputSchema: dealStageTriggerOutput,
  requiresConfirmation: true,
  estimatedDuration: 3000,
  rateLimit: 10,
  tags: ['automation', 'trigger', 'deals', 'workflow'],
};

const dealStageTriggerHandler: ToolHandler<DealStageTriggerInput, DealStageTriggerOutput> = async (input) => {
  console.log('[Automation] Create trigger:', input.triggerName);
  return {
    triggerId: `trigger_${Date.now()}`,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
};

// ============================================================================
// Alert on Match Tool
// ============================================================================
const alertOnMatchInput = z.object({
  alertName: z.string(),
  criteria: z.object({
    location: z.string().optional(),
    priceRange: z.object({ min: z.number(), max: z.number() }).optional(),
    propertyTypes: z.array(z.string()).optional(),
    motivationScore: z.number().optional(),
    equityPercent: z.number().optional(),
  }),
  notifyVia: z.array(z.enum(['email', 'sms', 'push', 'in_app'])),
  frequency: z.enum(['instant', 'daily', 'weekly']).default('instant'),
});

const alertOnMatchOutput = z.object({
  alertId: z.string(),
  status: z.enum(['active', 'paused']),
  estimatedMatches: z.number(),
});

type AlertOnMatchInput = z.infer<typeof alertOnMatchInput>;
type AlertOnMatchOutput = z.infer<typeof alertOnMatchOutput>;

const alertOnMatchDefinition: ToolDefinition<AlertOnMatchInput, AlertOnMatchOutput> = {
  id: 'workflow.alert_on_match',
  name: 'Alert on Match',
  description: 'Create alerts for properties matching specific criteria.',
  category: 'automation',
  requiredPermission: 'write',
  inputSchema: alertOnMatchInput,
  outputSchema: alertOnMatchOutput,
  requiresConfirmation: false,
  estimatedDuration: 2000,
  rateLimit: 20,
  tags: ['automation', 'alerts', 'notifications', 'matching'],
};

const alertOnMatchHandler: ToolHandler<AlertOnMatchInput, AlertOnMatchOutput> = async (input) => {
  console.log('[Automation] Create alert:', input.alertName);
  return {
    alertId: `alert_${Date.now()}`,
    status: 'active',
    estimatedMatches: Math.floor(Math.random() * 50) + 10,
  };
};

// ============================================================================
// Register All Automation Tools
// ============================================================================
export function registerAutomationTools() {
  toolRegistry.register(autoFollowUpDefinition, autoFollowUpHandler);
  toolRegistry.register(dealStageTriggerDefinition, dealStageTriggerHandler);
  toolRegistry.register(alertOnMatchDefinition, alertOnMatchHandler);
}

export const automationTools = {
  autoFollowUp: autoFollowUpDefinition,
  dealStageTrigger: dealStageTriggerDefinition,
  alertOnMatch: alertOnMatchDefinition,
};
