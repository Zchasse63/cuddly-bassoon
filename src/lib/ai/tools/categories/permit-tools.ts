/**
 * Permit AI Tools (Shovels Integration)
 * 8 tools for permit history, analysis, and deferred maintenance detection
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import {
  getPermitsForAddress,
  searchPermits,
  getAddressMetrics,
} from '@/lib/shovels/client';
import { SHOVELS_PERMIT_TAGS, type ShovelsPermitTag } from '@/lib/shovels/types';

// ============================================================================
// 1. getPermitHistory - Get all permits for a property
// ============================================================================
const permitHistoryInput = z.object({
  addressId: z.string().describe('Shovels address ID'),
  fromDate: z.string().optional().describe('Start date (YYYY-MM-DD)'),
  toDate: z.string().optional().describe('End date (YYYY-MM-DD)'),
});

const permitHistoryOutput = z.object({
  permits: z.array(z.object({
    id: z.string(),
    number: z.string(),
    description: z.string(),
    status: z.string(),
    tags: z.array(z.string()),
    jobValue: z.number().optional(),
    fileDate: z.string().optional(),
    issueDate: z.string().optional(),
    finalDate: z.string().optional(),
    contractorName: z.string().optional(),
  })),
  totalCount: z.number(),
  summary: z.string(),
});

type PermitHistoryInput = z.infer<typeof permitHistoryInput>;
type PermitHistoryOutput = z.infer<typeof permitHistoryOutput>;

const permitHistoryDef: ToolDefinition<PermitHistoryInput, PermitHistoryOutput> = {
  id: 'permit.history',
  name: 'getPermitHistory',
  description: 'Get complete permit history for a property address. Use when user asks about permits, renovations, or construction history.',
  category: 'permits',
  requiredPermission: 'read',
  inputSchema: permitHistoryInput,
  outputSchema: permitHistoryOutput,
  requiresConfirmation: false,
  tags: ['permit', 'history', 'shovels'],
};

const permitHistoryHandler: ToolHandler<PermitHistoryInput, PermitHistoryOutput> = async (input) => {
  const permits = await getPermitsForAddress(input.addressId, {
    from: input.fromDate,
    to: input.toDate,
  });

  const mapped = permits.map((p) => ({
    id: p.id,
    number: p.number,
    description: p.description,
    status: p.status,
    tags: p.tags,
    jobValue: p.job_value,
    fileDate: p.file_date,
    issueDate: p.issue_date,
    finalDate: p.final_date,
    contractorName: p.contractor_name,
  }));

  const totalValue = permits.reduce((sum, p) => sum + (p.job_value || 0), 0);
  const summary = `Found ${permits.length} permits with total job value of $${totalValue.toLocaleString()}`;

  return { permits: mapped, totalCount: permits.length, summary };
};

// ============================================================================
// 2. getPermitDetails - Get details for a specific permit
// ============================================================================
const permitDetailsInput = z.object({
  permitId: z.string().describe('Permit ID'),
});

const permitDetailsOutput = z.object({
  permit: z.object({
    id: z.string(),
    number: z.string(),
    description: z.string(),
    status: z.string(),
    tags: z.array(z.string()),
    propertyType: z.string(),
    jobValue: z.number().optional(),
    fees: z.number().optional(),
    fileDate: z.string().optional(),
    issueDate: z.string().optional(),
    finalDate: z.string().optional(),
    inspectionPassRate: z.number().optional(),
    approvalDuration: z.number().optional(),
    constructionDuration: z.number().optional(),
    contractorId: z.string().optional(),
    contractorName: z.string().optional(),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
    }),
  }),
});

type PermitDetailsInput = z.infer<typeof permitDetailsInput>;
type PermitDetailsOutput = z.infer<typeof permitDetailsOutput>;

const permitDetailsDef: ToolDefinition<PermitDetailsInput, PermitDetailsOutput> = {
  id: 'permit.details',
  name: 'getPermitDetails',
  description: 'Get detailed information about a specific permit by ID.',
  category: 'permits',
  requiredPermission: 'read',
  inputSchema: permitDetailsInput,
  outputSchema: permitDetailsOutput,
  requiresConfirmation: false,
  tags: ['permit', 'details', 'shovels'],
};

const permitDetailsHandler: ToolHandler<PermitDetailsInput, PermitDetailsOutput> = async (input) => {
  const { getPermitsByIds } = await import('@/lib/shovels/client');
  const permits = await getPermitsByIds([input.permitId]);
  
  if (!permits.length) {
    throw new Error(`Permit ${input.permitId} not found`);
  }

  const p = permits[0]!;
  return {
    permit: {
      id: p.id,
      number: p.number,
      description: p.description,
      status: p.status,
      tags: p.tags,
      propertyType: p.property_type,
      jobValue: p.job_value,
      fees: p.fees,
      fileDate: p.file_date,
      issueDate: p.issue_date,
      finalDate: p.final_date,
      inspectionPassRate: p.inspection_pass_rate,
      approvalDuration: p.approval_duration,
      constructionDuration: p.construction_duration,
      contractorId: p.contractor_id,
      contractorName: p.contractor_name,
      address: {
        street: p.address.street,
        city: p.address.city,
        state: p.address.state,
        zipCode: p.address.zip_code,
      },
    },
  };
};

// ============================================================================
// 3. searchPermitsByArea - Search permits in a geographic area
// ============================================================================
const searchPermitsInput = z.object({
  geoId: z.string().describe('Geographic ID (zip, city, county)'),
  fromDate: z.string().describe('Start date (YYYY-MM-DD)'),
  toDate: z.string().describe('End date (YYYY-MM-DD)'),
  tags: z.array(z.enum(SHOVELS_PERMIT_TAGS)).optional().describe('Filter by permit tags'),
  status: z.enum(['active', 'final', 'in_review', 'inactive']).optional(),
  minJobValue: z.number().optional(),
  limit: z.number().optional().default(50),
});

const searchPermitsOutput = z.object({
  permits: z.array(z.object({
    id: z.string(),
    number: z.string(),
    description: z.string(),
    status: z.string(),
    tags: z.array(z.string()),
    jobValue: z.number().optional(),
    address: z.string(),
  })),
  totalCount: z.number(),
  hasMore: z.boolean(),
});

type SearchPermitsInput = z.infer<typeof searchPermitsInput>;
type SearchPermitsOutput = z.infer<typeof searchPermitsOutput>;

const searchPermitsDef: ToolDefinition<SearchPermitsInput, SearchPermitsOutput> = {
  id: 'permit.search',
  name: 'searchPermitsByArea',
  description: 'Search for permits in a geographic area with filters. Use for finding renovation activity in neighborhoods.',
  category: 'permits',
  requiredPermission: 'read',
  inputSchema: searchPermitsInput,
  outputSchema: searchPermitsOutput,
  requiresConfirmation: false,
  tags: ['permit', 'search', 'area', 'shovels'],
};

const searchPermitsHandler: ToolHandler<SearchPermitsInput, SearchPermitsOutput> = async (input) => {
  const result = await searchPermits({
    geo_id: input.geoId,
    permit_from: input.fromDate,
    permit_to: input.toDate,
    permit_tags: input.tags as ShovelsPermitTag[],
    status: input.status,
    min_job_value: input.minJobValue,
    size: input.limit,
  });

  return {
    permits: result.items.map((p) => ({
      id: p.id,
      number: p.number,
      description: p.description,
      status: p.status,
      tags: p.tags,
      jobValue: p.job_value,
      address: `${p.address.street}, ${p.address.city}, ${p.address.state} ${p.address.zip_code}`,
    })),
    totalCount: result.items.length,
    hasMore: !!result.next_page || !!result.cursor,
  };
};

// ============================================================================
// 4. getPermitMetrics - Get aggregated permit metrics for an address
// ============================================================================
const permitMetricsInput = z.object({
  addressId: z.string().describe('Shovels address ID'),
});

const permitMetricsOutput = z.object({
  metrics: z.object({
    totalPermits: z.number(),
    totalJobValue: z.number(),
    avgApprovalDuration: z.number().optional(),
    avgConstructionDuration: z.number().optional(),
    avgInspectionPassRate: z.number().optional(),
    permitsByTag: z.record(z.string(), z.number()),
    lastPermitDate: z.string().optional(),
    yearsWithoutPermit: z.number().optional(),
  }),
});

type PermitMetricsInput = z.infer<typeof permitMetricsInput>;
type PermitMetricsOutput = z.infer<typeof permitMetricsOutput>;

const permitMetricsDef: ToolDefinition<PermitMetricsInput, PermitMetricsOutput> = {
  id: 'permit.metrics',
  name: 'getPermitMetrics',
  description: 'Get aggregated permit metrics for a property. Shows total permits, values, and activity patterns.',
  category: 'permits',
  requiredPermission: 'read',
  inputSchema: permitMetricsInput,
  outputSchema: permitMetricsOutput,
  requiresConfirmation: false,
  tags: ['permit', 'metrics', 'analysis', 'shovels'],
};

const permitMetricsHandler: ToolHandler<PermitMetricsInput, PermitMetricsOutput> = async (input) => {
  const [metricsData, permits] = await Promise.all([
    getAddressMetrics(input.addressId),
    getPermitsForAddress(input.addressId),
  ]);

  const permitsByTag: Record<string, number> = {};
  let totalJobValue = 0;
  let lastPermitDate: string | undefined;

  for (const p of permits) {
    totalJobValue += p.job_value || 0;
    for (const tag of p.tags) {
      permitsByTag[tag] = (permitsByTag[tag] || 0) + 1;
    }
    if (p.file_date && (!lastPermitDate || p.file_date > lastPermitDate)) {
      lastPermitDate = p.file_date;
    }
  }

  const yearsWithoutPermit = lastPermitDate
    ? Math.floor((Date.now() - new Date(lastPermitDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : undefined;

  return {
    metrics: {
      totalPermits: permits.length,
      totalJobValue,
      avgApprovalDuration: (metricsData as Record<string, number>).avg_approval_duration,
      avgConstructionDuration: (metricsData as Record<string, number>).avg_construction_duration,
      avgInspectionPassRate: (metricsData as Record<string, number>).avg_inspection_pass_rate,
      permitsByTag,
      lastPermitDate,
      yearsWithoutPermit,
    },
  };
};

// ============================================================================
// 5. analyzePermitPatterns - Analyze permit history for motivation signals
// ============================================================================
const analyzePatternInput = z.object({
  addressId: z.string().describe('Shovels address ID'),
});

const analyzePatternOutput = z.object({
  analysis: z.object({
    motivationSignals: z.array(z.object({
      signal: z.string(),
      strength: z.enum(['high', 'medium', 'low']),
      description: z.string(),
    })),
    propertyCondition: z.enum(['excellent', 'good', 'fair', 'poor', 'unknown']),
    maintenancePattern: z.enum(['proactive', 'reactive', 'deferred', 'unknown']),
    investmentLevel: z.enum(['high', 'medium', 'low', 'none']),
    recommendations: z.array(z.string()),
  }),
});

type AnalyzePatternInput = z.infer<typeof analyzePatternInput>;
type AnalyzePatternOutput = z.infer<typeof analyzePatternOutput>;

const analyzePatternDef: ToolDefinition<AnalyzePatternInput, AnalyzePatternOutput> = {
  id: 'permit.analyze_patterns',
  name: 'analyzePermitPatterns',
  description: 'Analyze permit history to identify seller motivation signals and property condition.',
  category: 'permits',
  requiredPermission: 'read',
  inputSchema: analyzePatternInput,
  outputSchema: analyzePatternOutput,
  requiresConfirmation: false,
  tags: ['permit', 'analysis', 'motivation', 'shovels'],
};

const analyzePatternHandler: ToolHandler<AnalyzePatternInput, AnalyzePatternOutput> = async (input) => {
  const permits = await getPermitsForAddress(input.addressId);
  const signals: Array<{ signal: string; strength: 'high' | 'medium' | 'low'; description: string }> = [];
  const recommendations: string[] = [];

  // Check for stalled permits
  const stalledPermits = permits.filter((p) => p.status === 'active' && p.file_date &&
    (Date.now() - new Date(p.file_date).getTime()) > 180 * 24 * 60 * 60 * 1000);
  if (stalledPermits.length > 0) {
    signals.push({ signal: 'Stalled Permits', strength: 'high', description: `${stalledPermits.length} permits stalled for 6+ months` });
    recommendations.push('Inquire about abandoned renovation projects');
  }

  // Check for no recent permits
  const recentPermits = permits.filter((p) => p.file_date &&
    (Date.now() - new Date(p.file_date).getTime()) < 5 * 365 * 24 * 60 * 60 * 1000);
  if (recentPermits.length === 0 && permits.length > 0) {
    signals.push({ signal: 'Deferred Maintenance', strength: 'medium', description: 'No permits in 5+ years' });
    recommendations.push('Property may need updates - good negotiation leverage');
  }

  // Check for major system permits
  const majorSystems = ['roofing', 'hvac', 'plumbing', 'electrical'];
  const systemPermits = permits.filter((p) => p.tags.some((t) => majorSystems.includes(t)));
  const oldSystemPermits = systemPermits.filter((p) => p.file_date &&
    (Date.now() - new Date(p.file_date).getTime()) > 15 * 365 * 24 * 60 * 60 * 1000);
  if (oldSystemPermits.length > 0) {
    signals.push({ signal: 'Aging Systems', strength: 'medium', description: 'Major systems 15+ years old' });
  }

  // Determine property condition
  let propertyCondition: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown' = 'unknown';
  if (recentPermits.length >= 3) propertyCondition = 'excellent';
  else if (recentPermits.length >= 1) propertyCondition = 'good';
  else if (permits.length > 0) propertyCondition = 'fair';
  else if (stalledPermits.length > 0) propertyCondition = 'poor';

  // Determine maintenance pattern
  let maintenancePattern: 'proactive' | 'reactive' | 'deferred' | 'unknown' = 'unknown';
  if (recentPermits.length >= 2) maintenancePattern = 'proactive';
  else if (recentPermits.length === 1) maintenancePattern = 'reactive';
  else if (permits.length > 0) maintenancePattern = 'deferred';

  // Investment level
  const totalValue = permits.reduce((sum, p) => sum + (p.job_value || 0), 0);
  let investmentLevel: 'high' | 'medium' | 'low' | 'none' = 'none';
  if (totalValue > 100000) investmentLevel = 'high';
  else if (totalValue > 25000) investmentLevel = 'medium';
  else if (totalValue > 0) investmentLevel = 'low';

  return {
    analysis: {
      motivationSignals: signals,
      propertyCondition,
      maintenancePattern,
      investmentLevel,
      recommendations,
    },
  };
};

// ============================================================================
// 6. checkSystemAge - Check age of major systems
// ============================================================================
const checkSystemInput = z.object({
  addressId: z.string().describe('Shovels address ID'),
  systemType: z.enum(['roofing', 'hvac', 'plumbing', 'electrical', 'water_heater']).optional(),
});

const checkSystemOutput = z.object({
  systems: z.array(z.object({
    type: z.string(),
    lastPermitDate: z.string().optional(),
    ageYears: z.number().optional(),
    needsReplacement: z.boolean(),
    typicalLifespan: z.number(),
  })),
  summary: z.string(),
});

type CheckSystemInput = z.infer<typeof checkSystemInput>;
type CheckSystemOutput = z.infer<typeof checkSystemOutput>;

const checkSystemDef: ToolDefinition<CheckSystemInput, CheckSystemOutput> = {
  id: 'permit.check_system_age',
  name: 'checkSystemAge',
  description: 'Check the age of major systems (roof, HVAC, plumbing, electrical) based on permit history.',
  category: 'permits',
  requiredPermission: 'read',
  inputSchema: checkSystemInput,
  outputSchema: checkSystemOutput,
  requiresConfirmation: false,
  tags: ['permit', 'systems', 'age', 'shovels'],
};

const checkSystemHandler: ToolHandler<CheckSystemInput, CheckSystemOutput> = async (input) => {
  const permits = await getPermitsForAddress(input.addressId);

  const systemLifespans: Record<string, number> = {
    roofing: 25,
    hvac: 15,
    plumbing: 50,
    electrical: 40,
    water_heater: 12,
  };

  const systemsToCheck = input.systemType ? [input.systemType] : Object.keys(systemLifespans);
  const systems: Array<{ type: string; lastPermitDate?: string; ageYears?: number; needsReplacement: boolean; typicalLifespan: number }> = [];

  for (const system of systemsToCheck) {
    const systemPermits = permits.filter((p) => p.tags.includes(system as ShovelsPermitTag));
    const lastPermit = systemPermits.sort((a, b) =>
      (b.file_date || '').localeCompare(a.file_date || ''))[0];

    const lifespan = systemLifespans[system] || 20;
    let ageYears: number | undefined;
    let needsReplacement = false;

    if (lastPermit?.file_date) {
      ageYears = Math.floor((Date.now() - new Date(lastPermit.file_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      needsReplacement = ageYears >= lifespan;
    }

    systems.push({
      type: system,
      lastPermitDate: lastPermit?.file_date,
      ageYears,
      needsReplacement,
      typicalLifespan: lifespan,
    });
  }

  const needingReplacement = systems.filter((s) => s.needsReplacement);
  const summary = needingReplacement.length > 0
    ? `${needingReplacement.length} system(s) may need replacement: ${needingReplacement.map((s) => s.type).join(', ')}`
    : 'All checked systems appear to be within typical lifespan';

  return { systems, summary };
};

// ============================================================================
// 7. identifyDeferredMaintenance - Find properties with deferred maintenance
// ============================================================================
const deferredMaintenanceInput = z.object({
  geoId: z.string().describe('Geographic ID (zip, city)'),
  minYearsWithoutPermit: z.number().optional().default(5),
  limit: z.number().optional().default(50),
});

const deferredMaintenanceOutput = z.object({
  properties: z.array(z.object({
    addressId: z.string(),
    address: z.string(),
    lastPermitDate: z.string().optional(),
    yearsWithoutPermit: z.number(),
    lastPermitType: z.string().optional(),
  })),
  totalFound: z.number(),
});

type DeferredMaintenanceInput = z.infer<typeof deferredMaintenanceInput>;
type DeferredMaintenanceOutput = z.infer<typeof deferredMaintenanceOutput>;

const deferredMaintenanceDef: ToolDefinition<DeferredMaintenanceInput, DeferredMaintenanceOutput> = {
  id: 'permit.deferred_maintenance',
  name: 'identifyDeferredMaintenance',
  description: 'Find properties with no recent permits, indicating potential deferred maintenance.',
  category: 'permits',
  requiredPermission: 'read',
  inputSchema: deferredMaintenanceInput,
  outputSchema: deferredMaintenanceOutput,
  requiresConfirmation: false,
  tags: ['permit', 'deferred', 'maintenance', 'shovels'],
};

const deferredMaintenanceHandler: ToolHandler<DeferredMaintenanceInput, DeferredMaintenanceOutput> = async (input) => {
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - input.minYearsWithoutPermit);

  // Search for permits in the area from long ago
  const oldPermits = await searchPermits({
    geo_id: input.geoId,
    permit_from: '2000-01-01',
    permit_to: cutoffDate.toISOString().split('T')[0]!,
    size: input.limit,
  });

  // Group by address and find those without recent activity
  const addressMap = new Map<string, { address: string; lastDate: string; lastType: string }>();

  for (const p of oldPermits.items) {
    const addrId = p.geo_ids.address_id;
    const existing = addressMap.get(addrId);
    if (!existing || (p.file_date && p.file_date > existing.lastDate)) {
      addressMap.set(addrId, {
        address: `${p.address.street}, ${p.address.city}, ${p.address.state}`,
        lastDate: p.file_date || '',
        lastType: p.tags[0] || 'unknown',
      });
    }
  }

  const properties = Array.from(addressMap.entries()).map(([addressId, data]) => ({
    addressId,
    address: data.address,
    lastPermitDate: data.lastDate || undefined,
    yearsWithoutPermit: data.lastDate
      ? Math.floor((Date.now() - new Date(data.lastDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
      : input.minYearsWithoutPermit,
    lastPermitType: data.lastType,
  }));

  return { properties, totalFound: properties.length };
};

// ============================================================================
// 8. findStalledPermits - Find properties with stalled/expired permits
// ============================================================================
const stalledPermitsInput = z.object({
  geoId: z.string().describe('Geographic ID (zip, city)'),
  minStallDays: z.number().optional().default(180),
  limit: z.number().optional().default(50),
});

const stalledPermitsOutput = z.object({
  properties: z.array(z.object({
    addressId: z.string(),
    address: z.string(),
    permitId: z.string(),
    permitNumber: z.string(),
    description: z.string(),
    fileDate: z.string(),
    daysSinceFile: z.number(),
    jobValue: z.number().optional(),
  })),
  totalFound: z.number(),
  summary: z.string(),
});

type StalledPermitsInput = z.infer<typeof stalledPermitsInput>;
type StalledPermitsOutput = z.infer<typeof stalledPermitsOutput>;

const stalledPermitsDef: ToolDefinition<StalledPermitsInput, StalledPermitsOutput> = {
  id: 'permit.stalled',
  name: 'findStalledPermits',
  description: 'Find properties with stalled or expired permits - indicates abandoned projects or motivated sellers.',
  category: 'permits',
  requiredPermission: 'read',
  inputSchema: stalledPermitsInput,
  outputSchema: stalledPermitsOutput,
  requiresConfirmation: false,
  tags: ['permit', 'stalled', 'expired', 'shovels'],
};

const stalledPermitsHandler: ToolHandler<StalledPermitsInput, StalledPermitsOutput> = async (input) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - input.minStallDays);

  const result = await searchPermits({
    geo_id: input.geoId,
    permit_from: '2020-01-01',
    permit_to: cutoffDate.toISOString().split('T')[0]!,
    status: 'active',
    size: input.limit,
  });

  const properties = result.items.map((p) => ({
    addressId: p.geo_ids.address_id,
    address: `${p.address.street}, ${p.address.city}, ${p.address.state}`,
    permitId: p.id,
    permitNumber: p.number,
    description: p.description,
    fileDate: p.file_date || '',
    daysSinceFile: p.file_date
      ? Math.floor((Date.now() - new Date(p.file_date).getTime()) / (24 * 60 * 60 * 1000))
      : 0,
    jobValue: p.job_value,
  }));

  const totalValue = properties.reduce((sum, p) => sum + (p.jobValue || 0), 0);
  const summary = `Found ${properties.length} stalled permits with total job value of $${totalValue.toLocaleString()}`;

  return { properties, totalFound: properties.length, summary };
};

// ============================================================================
// Register all permit tools
// ============================================================================
export function registerPermitTools(): void {
  toolRegistry.register(permitHistoryDef, permitHistoryHandler);
  toolRegistry.register(permitDetailsDef, permitDetailsHandler);
  toolRegistry.register(searchPermitsDef, searchPermitsHandler);
  toolRegistry.register(permitMetricsDef, permitMetricsHandler);
  toolRegistry.register(analyzePatternDef, analyzePatternHandler);
  toolRegistry.register(checkSystemDef, checkSystemHandler);
  toolRegistry.register(deferredMaintenanceDef, deferredMaintenanceHandler);
  toolRegistry.register(stalledPermitsDef, stalledPermitsHandler);
  console.log('[Permit Tools] Registered 8 Shovels permit AI tools');
}

