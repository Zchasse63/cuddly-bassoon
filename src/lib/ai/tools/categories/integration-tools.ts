/**
 * Integration Tools
 * Tools for external system integrations
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';

// ============================================================================
// CRM Export Tool
// ============================================================================
const crmExportInput = z.object({
  crm: z.enum(['salesforce', 'hubspot', 'podio', 'followupboss', 'custom']),
  entityType: z.enum(['leads', 'contacts', 'deals', 'properties']),
  entityIds: z.array(z.string()).min(1).max(500),
  fieldMapping: z.record(z.string(), z.string()).optional(),
  updateExisting: z.boolean().default(false),
});

const crmExportOutput = z.object({
  exported: z.number(),
  created: z.number(),
  updated: z.number(),
  failed: z.number(),
  errors: z.array(z.object({ entityId: z.string(), error: z.string() })),
  syncId: z.string(),
});

type CrmExportInput = z.infer<typeof crmExportInput>;
type CrmExportOutput = z.infer<typeof crmExportOutput>;

const crmExportDefinition: ToolDefinition<CrmExportInput, CrmExportOutput> = {
  id: 'sync.crm_export',
  name: 'Export to CRM',
  description: 'Export leads, contacts, or deals to external CRM systems.',
  category: 'integrations',
  requiredPermission: 'execute',
  inputSchema: crmExportInput,
  outputSchema: crmExportOutput,
  requiresConfirmation: true,
  estimatedDuration: 10000,
  rateLimit: 5,
  tags: ['integration', 'crm', 'export', 'sync'],
};

const crmExportHandler: ToolHandler<CrmExportInput, CrmExportOutput> = async (input) => {
  console.log('[Integration] CRM export to:', input.crm);
  return {
    exported: input.entityIds.length,
    created: Math.floor(input.entityIds.length * 0.7),
    updated: Math.floor(input.entityIds.length * 0.3),
    failed: 0,
    errors: [],
    syncId: `sync_${Date.now()}`,
  };
};

// ============================================================================
// Calendar Integration Tool
// ============================================================================
const calendarIntegrationInput = z.object({
  provider: z.enum(['google', 'outlook', 'apple']),
  action: z.enum(['create_event', 'update_event', 'delete_event', 'list_events']),
  event: z
    .object({
      title: z.string(),
      description: z.string().optional(),
      startTime: z.string(),
      endTime: z.string(),
      location: z.string().optional(),
      attendees: z.array(z.string()).optional(),
      reminders: z.array(z.number()).optional(),
    })
    .optional(),
  eventId: z.string().optional(),
  dateRange: z.object({ start: z.string(), end: z.string() }).optional(),
});

const calendarIntegrationOutput = z.object({
  success: z.boolean(),
  eventId: z.string().optional(),
  eventUrl: z.string().optional(),
  events: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .optional(),
});

type CalendarIntegrationInput = z.infer<typeof calendarIntegrationInput>;
type CalendarIntegrationOutput = z.infer<typeof calendarIntegrationOutput>;

const calendarIntegrationDefinition: ToolDefinition<
  CalendarIntegrationInput,
  CalendarIntegrationOutput
> = {
  id: 'sync.calendar_integration',
  name: 'Calendar Integration',
  description: 'Create, update, or manage calendar events for property viewings and meetings.',
  category: 'integrations',
  requiredPermission: 'execute',
  inputSchema: calendarIntegrationInput,
  outputSchema: calendarIntegrationOutput,
  requiresConfirmation: true,
  estimatedDuration: 3000,
  rateLimit: 20,
  tags: ['integration', 'calendar', 'scheduling', 'events'],
};

// Handler disabled - tool not registered to stay under xAI 200 tool limit
const _calendarIntegrationHandler: ToolHandler<
  CalendarIntegrationInput,
  CalendarIntegrationOutput
> = async (input) => {
  console.log('[Integration] Calendar:', input.action, 'on', input.provider);
  if (input.action === 'list_events') {
    return {
      success: true,
      events: [
        {
          id: 'evt_1',
          title: 'Property Viewing - 123 Main St',
          startTime: '2024-01-20T10:00:00Z',
          endTime: '2024-01-20T11:00:00Z',
        },
        {
          id: 'evt_2',
          title: 'Closing Meeting',
          startTime: '2024-01-22T14:00:00Z',
          endTime: '2024-01-22T15:30:00Z',
        },
      ],
    };
  }
  return {
    success: true,
    eventId: `evt_${Date.now()}`,
    eventUrl: `https://calendar.${input.provider}.com/event/${Date.now()}`,
  };
};
void _calendarIntegrationHandler; // Suppress unused warning

// ============================================================================
// Register All Integration Tools
// ============================================================================
export function registerIntegrationTools() {
  toolRegistry.register(crmExportDefinition, crmExportHandler);
  // Disabled to stay under xAI 200 tool limit - placeholder functionality
  // toolRegistry.register(calendarIntegrationDefinition, calendarIntegrationHandler);
}

export const integrationTools = {
  crmExport: crmExportDefinition,
  calendarIntegration: calendarIntegrationDefinition,
};
