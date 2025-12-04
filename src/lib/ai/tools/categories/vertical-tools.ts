/**
 * Vertical AI Tools
 * 4 tools for managing business verticals and vertical-specific insights
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import {
  getUserVertical,
  setUserVertical,
  getFiltersForVertical,
} from '@/lib/verticals/vertical-service';
import {
  BUSINESS_VERTICALS,
  getVerticalConfig,
} from '@/lib/verticals/types';

// ============================================================================
// 1. getActiveVertical - Get user's current vertical
// ============================================================================
const getActiveVerticalInput = z.object({});

const getActiveVerticalOutput = z.object({
  vertical: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    icon: z.string(),
    color: z.string(),
  }),
  defaultFilters: z.array(z.string()),
  heatMapLayers: z.array(z.string()),
  aiPromptAddition: z.string(),
});

type GetActiveVerticalInput = z.infer<typeof getActiveVerticalInput>;
type GetActiveVerticalOutput = z.infer<typeof getActiveVerticalOutput>;

const getActiveVerticalDef: ToolDefinition<GetActiveVerticalInput, GetActiveVerticalOutput> = {
  id: 'vertical.get_active',
  name: 'getActiveVertical',
  description: 'Get the user\'s currently active business vertical and its configuration.',
  category: 'verticals',
  requiredPermission: 'read',
  inputSchema: getActiveVerticalInput,
  outputSchema: getActiveVerticalOutput,
  requiresConfirmation: false,
  tags: ['vertical', 'active', 'configuration'],
};

const getActiveVerticalHandler: ToolHandler<GetActiveVerticalInput, GetActiveVerticalOutput> = async (
  _input,
  ctx
) => {
  const verticalId = await getUserVertical(ctx.userId);
  const config = getVerticalConfig(verticalId);

  return {
    vertical: {
      id: config.id,
      name: config.name,
      description: config.description,
      icon: config.icon,
      color: config.color,
    },
    defaultFilters: config.defaultFilters,
    heatMapLayers: config.heatMapLayers,
    aiPromptAddition: config.aiSystemPromptAddition,
  };
};

// ============================================================================
// 2. switchVertical - Change active vertical
// ============================================================================
const switchVerticalInput = z.object({
  vertical: z.enum(BUSINESS_VERTICALS).describe('The vertical to switch to'),
});

const switchVerticalOutput = z.object({
  success: z.boolean(),
  previousVertical: z.string(),
  newVertical: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    icon: z.string(),
  }),
  message: z.string(),
});

type SwitchVerticalInput = z.infer<typeof switchVerticalInput>;
type SwitchVerticalOutput = z.infer<typeof switchVerticalOutput>;

const switchVerticalDef: ToolDefinition<SwitchVerticalInput, SwitchVerticalOutput> = {
  id: 'vertical.switch',
  name: 'switchVertical',
  description: 'Switch the user\'s active business vertical. Changes filters, heat maps, and AI behavior.',
  category: 'verticals',
  requiredPermission: 'write',
  inputSchema: switchVerticalInput,
  outputSchema: switchVerticalOutput,
  requiresConfirmation: true,
  tags: ['vertical', 'switch', 'change'],
};

const switchVerticalHandler: ToolHandler<SwitchVerticalInput, SwitchVerticalOutput> = async (
  input,
  ctx
) => {
  const previousVertical = await getUserVertical(ctx.userId);
  await setUserVertical(ctx.userId, input.vertical);
  const newConfig = getVerticalConfig(input.vertical);

  return {
    success: true,
    previousVertical,
    newVertical: {
      id: newConfig.id,
      name: newConfig.name,
      description: newConfig.description,
      icon: newConfig.icon,
    },
    message: `Switched from ${previousVertical} to ${newConfig.name}`,
  };
};

// ============================================================================
// 3. getVerticalFilters - Get filters for current vertical
// ============================================================================
const getVerticalFiltersInput = z.object({
  vertical: z.enum(BUSINESS_VERTICALS).optional().describe('Vertical to get filters for (defaults to active)'),
});

const getVerticalFiltersOutput = z.object({
  vertical: z.string(),
  filters: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    isDefault: z.boolean(),
  })),
  totalFilters: z.number(),
});

type GetVerticalFiltersInput = z.infer<typeof getVerticalFiltersInput>;
type GetVerticalFiltersOutput = z.infer<typeof getVerticalFiltersOutput>;

const getVerticalFiltersDef: ToolDefinition<GetVerticalFiltersInput, GetVerticalFiltersOutput> = {
  id: 'vertical.filters',
  name: 'getVerticalFilters',
  description: 'Get the available filters for a business vertical.',
  category: 'verticals',
  requiredPermission: 'read',
  inputSchema: getVerticalFiltersInput,
  outputSchema: getVerticalFiltersOutput,
  requiresConfirmation: false,
  tags: ['vertical', 'filters'],
};

const getVerticalFiltersHandler: ToolHandler<GetVerticalFiltersInput, GetVerticalFiltersOutput> = async (
  input,
  ctx
) => {
  const verticalId = input.vertical || await getUserVertical(ctx.userId);
  const filterIds = getFiltersForVertical(verticalId);
  const config = getVerticalConfig(verticalId);

  // Map filter IDs to filter objects with descriptions
  const filterDescriptions: Record<string, string> = {
    'absentee-owner': 'Properties owned by non-occupant landlords',
    'high-equity': 'Properties with 40%+ equity',
    'tired-landlord': 'Long-term landlords with aging properties',
    'roof-replacement-due': 'Properties with roofs 20+ years old',
    'solar-ready-new-roof': 'Properties with new roofs suitable for solar',
    'hvac-replacement-due': 'Properties with HVAC systems 15+ years old',
    'heat-pump-candidate': 'Properties suitable for heat pump conversion',
    'panel-upgrade-candidate': 'Properties needing electrical panel upgrades',
    'ev-charger-ready': 'Properties suitable for EV charger installation',
    'aging-electrical': 'Properties with old electrical systems',
    'water-heater-replacement': 'Properties with water heaters 10+ years old',
    'repiping-candidate': 'Properties with old plumbing needing replacement',
    'prime-solar-candidate': 'Properties ideal for solar installation',
    'electrification-journey': 'Properties on the path to full electrification',
  };

  const filters = filterIds.map((id) => ({
    id,
    name: id.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    description: filterDescriptions[id] || `Filter for ${id}`,
    isDefault: config.defaultFilters.includes(id),
  }));

  return {
    vertical: verticalId,
    filters,
    totalFilters: filters.length,
  };
};

// ============================================================================
// 4. getVerticalInsights - Get vertical-specific insights for property
// ============================================================================
const getVerticalInsightsInput = z.object({
  addressId: z.string().describe('Shovels address ID'),
  vertical: z.enum(BUSINESS_VERTICALS).optional().describe('Vertical for insights (defaults to active)'),
});

const getVerticalInsightsOutput = z.object({
  vertical: z.string(),
  insights: z.array(z.object({
    type: z.string(),
    title: z.string(),
    description: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
    actionable: z.boolean(),
  })),
  opportunities: z.array(z.string()),
  risks: z.array(z.string()),
  recommendedActions: z.array(z.string()),
});

type GetVerticalInsightsInput = z.infer<typeof getVerticalInsightsInput>;
type GetVerticalInsightsOutput = z.infer<typeof getVerticalInsightsOutput>;

const getVerticalInsightsDef: ToolDefinition<GetVerticalInsightsInput, GetVerticalInsightsOutput> = {
  id: 'vertical.insights',
  name: 'getVerticalInsights',
  description: 'Get vertical-specific insights and opportunities for a property.',
  category: 'verticals',
  requiredPermission: 'read',
  inputSchema: getVerticalInsightsInput,
  outputSchema: getVerticalInsightsOutput,
  requiresConfirmation: false,
  tags: ['vertical', 'insights', 'property'],
};

const getVerticalInsightsHandler: ToolHandler<GetVerticalInsightsInput, GetVerticalInsightsOutput> = async (
  input,
  ctx
) => {
  const { getPermitsForAddress } = await import('@/lib/shovels/client');

  const verticalId = input.vertical || await getUserVertical(ctx.userId);
  const permits = await getPermitsForAddress(input.addressId);

  const insights: Array<{ type: string; title: string; description: string; priority: 'high' | 'medium' | 'low'; actionable: boolean }> = [];
  const opportunities: string[] = [];
  const risks: string[] = [];
  const recommendedActions: string[] = [];

  // Analyze based on vertical
  switch (verticalId) {
    case 'wholesaling': {
      const stalledPermits = permits.filter((p) => p.status === 'active' && p.file_date &&
        (Date.now() - new Date(p.file_date).getTime()) > 180 * 24 * 60 * 60 * 1000);
      if (stalledPermits.length > 0) {
        insights.push({ type: 'motivation', title: 'Stalled Project', description: `${stalledPermits.length} stalled permits indicate potential motivated seller`, priority: 'high', actionable: true });
        opportunities.push('Seller may be motivated due to abandoned renovation');
        recommendedActions.push('Inquire about project status and seller motivation');
      }
      break;
    }
    case 'roofing': {
      const roofPermits = permits.filter((p) => p.tags.includes('roofing'));
      const lastRoof = roofPermits.sort((a, b) => (b.file_date || '').localeCompare(a.file_date || ''))[0];
      if (!lastRoof || (lastRoof.file_date && (Date.now() - new Date(lastRoof.file_date).getTime()) > 20 * 365 * 24 * 60 * 60 * 1000)) {
        insights.push({ type: 'opportunity', title: 'Roof Replacement Due', description: 'No roofing permits in 20+ years', priority: 'high', actionable: true });
        opportunities.push('Roof likely needs replacement');
        recommendedActions.push('Offer free roof inspection');
      }
      break;
    }
    case 'hvac': {
      const hvacPermits = permits.filter((p) => p.tags.includes('hvac'));
      const lastHvac = hvacPermits.sort((a, b) => (b.file_date || '').localeCompare(a.file_date || ''))[0];
      if (!lastHvac || (lastHvac.file_date && (Date.now() - new Date(lastHvac.file_date).getTime()) > 15 * 365 * 24 * 60 * 60 * 1000)) {
        insights.push({ type: 'opportunity', title: 'HVAC Replacement Due', description: 'No HVAC permits in 15+ years', priority: 'high', actionable: true });
        opportunities.push('HVAC system likely needs replacement');
        recommendedActions.push('Offer efficiency assessment');
      }
      break;
    }
    case 'solar': {
      const roofPermits = permits.filter((p) => p.tags.includes('roofing'));
      const solarPermits = permits.filter((p) => p.tags.includes('solar'));
      const lastRoof = roofPermits.sort((a, b) => (b.file_date || '').localeCompare(a.file_date || ''))[0];
      if (lastRoof?.file_date && (Date.now() - new Date(lastRoof.file_date).getTime()) < 5 * 365 * 24 * 60 * 60 * 1000 && solarPermits.length === 0) {
        insights.push({ type: 'opportunity', title: 'Solar Ready', description: 'New roof with no solar installation', priority: 'high', actionable: true });
        opportunities.push('New roof is ideal for solar installation');
        recommendedActions.push('Present solar ROI analysis');
      }
      break;
    }
    default: {
      // Generic insights for other verticals
      const relevantTag = verticalId as string;
      const relevantPermits = permits.filter((p) => p.tags.includes(relevantTag as never));
      if (relevantPermits.length === 0) {
        insights.push({ type: 'opportunity', title: 'No Recent Work', description: `No ${verticalId} permits found`, priority: 'medium', actionable: true });
        opportunities.push(`Property may need ${verticalId} services`);
      }
    }
  }

  return {
    vertical: verticalId,
    insights,
    opportunities,
    risks,
    recommendedActions,
  };
};

// ============================================================================
// Register all vertical tools
// ============================================================================
export function registerVerticalTools(): void {
  toolRegistry.register(getActiveVerticalDef, getActiveVerticalHandler);
  toolRegistry.register(switchVerticalDef, switchVerticalHandler);
  toolRegistry.register(getVerticalFiltersDef, getVerticalFiltersHandler);
  toolRegistry.register(getVerticalInsightsDef, getVerticalInsightsHandler);
  console.log('[Vertical Tools] Registered 4 vertical AI tools');
}

