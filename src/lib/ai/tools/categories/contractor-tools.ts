/**
 * Contractor AI Tools (Shovels Integration)
 * 5 tools for contractor search, details, and comparison
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';
import {
  searchContractors as searchContractorsApi,
  getContractorById,
  getContractorPermits,
} from '@/lib/shovels/client';
import { SHOVELS_PERMIT_TAGS, type ShovelsPermitTag } from '@/lib/shovels/types';

// ============================================================================
// 1. searchContractors - Find contractors by location and specialty
// ============================================================================
const searchContractorsInput = z.object({
  geoId: z.string().describe('Geographic ID (zip, city, county)'),
  fromDate: z.string().describe('Start date for permit history (YYYY-MM-DD)'),
  toDate: z.string().describe('End date for permit history (YYYY-MM-DD)'),
  specialties: z.array(z.enum(SHOVELS_PERMIT_TAGS)).optional().describe('Filter by permit tags/specialties'),
  propertyType: z.enum(['residential', 'commercial']).optional(),
  limit: z.number().optional().default(20),
});

const searchContractorsOutput = z.object({
  contractors: z.array(z.object({
    id: z.string(),
    name: z.string(),
    businessName: z.string().optional(),
    licenseNumber: z.string().optional(),
    totalPermits: z.number(),
    lifetimeJobValue: z.number().optional(),
    avgInspectionPassRate: z.number().optional(),
    specialties: z.array(z.string()),
  })),
  totalFound: z.number(),
});

type SearchContractorsInput = z.infer<typeof searchContractorsInput>;
type SearchContractorsOutput = z.infer<typeof searchContractorsOutput>;

const searchContractorsDef: ToolDefinition<SearchContractorsInput, SearchContractorsOutput> = {
  id: 'contractor.search',
  name: 'searchContractors',
  description: 'Search for contractors by location and specialty. Use to find contractors for renovation projects.',
  category: 'contractors',
  requiredPermission: 'read',
  inputSchema: searchContractorsInput,
  outputSchema: searchContractorsOutput,
  requiresConfirmation: false,
  tags: ['contractor', 'search', 'shovels'],
};

const searchContractorsHandler: ToolHandler<SearchContractorsInput, SearchContractorsOutput> = async (input) => {
  const result = await searchContractorsApi({
    geo_id: input.geoId,
    permit_from: input.fromDate,
    permit_to: input.toDate,
    permit_tags: input.specialties as ShovelsPermitTag[],
    property_type: input.propertyType,
  });

  const contractors = result.items.slice(0, input.limit).map((c) => ({
    id: c.id,
    name: c.name,
    businessName: c.business_name,
    licenseNumber: c.license_number,
    totalPermits: c.total_permits,
    lifetimeJobValue: c.lifetime_job_value,
    avgInspectionPassRate: c.avg_inspection_pass_rate,
    specialties: c.permit_tags,
  }));

  return { contractors, totalFound: contractors.length };
};

// ============================================================================
// 2. getContractorDetails - Get contractor performance metrics
// ============================================================================
const contractorDetailsInput = z.object({
  contractorId: z.string().describe('Contractor ID'),
});

const contractorDetailsOutput = z.object({
  contractor: z.object({
    id: z.string(),
    name: z.string(),
    businessName: z.string().optional(),
    licenseNumber: z.string().optional(),
    licenseState: z.string().optional(),
    website: z.string().optional(),
    totalPermits: z.number(),
    lifetimeJobValue: z.number().optional(),
    avgInspectionPassRate: z.number().optional(),
    avgConstructionDuration: z.number().optional(),
    specialties: z.array(z.string()),
    propertyTypes: z.array(z.string()),
  }),
  performanceRating: z.enum(['excellent', 'good', 'average', 'below_average', 'unknown']),
});

type ContractorDetailsInput = z.infer<typeof contractorDetailsInput>;
type ContractorDetailsOutput = z.infer<typeof contractorDetailsOutput>;

const contractorDetailsDef: ToolDefinition<ContractorDetailsInput, ContractorDetailsOutput> = {
  id: 'contractor.details',
  name: 'getContractorDetails',
  description: 'Get detailed information and performance metrics for a specific contractor.',
  category: 'contractors',
  requiredPermission: 'read',
  inputSchema: contractorDetailsInput,
  outputSchema: contractorDetailsOutput,
  requiresConfirmation: false,
  tags: ['contractor', 'details', 'performance', 'shovels'],
};

const contractorDetailsHandler: ToolHandler<ContractorDetailsInput, ContractorDetailsOutput> = async (input) => {
  const c = await getContractorById(input.contractorId);

  // Calculate performance rating based on inspection pass rate
  let performanceRating: 'excellent' | 'good' | 'average' | 'below_average' | 'unknown' = 'unknown';
  if (c.avg_inspection_pass_rate !== undefined) {
    if (c.avg_inspection_pass_rate >= 95) performanceRating = 'excellent';
    else if (c.avg_inspection_pass_rate >= 85) performanceRating = 'good';
    else if (c.avg_inspection_pass_rate >= 70) performanceRating = 'average';
    else performanceRating = 'below_average';
  }

  return {
    contractor: {
      id: c.id,
      name: c.name,
      businessName: c.business_name,
      licenseNumber: c.license_number,
      licenseState: c.license_state,
      website: c.website,
      totalPermits: c.total_permits,
      lifetimeJobValue: c.lifetime_job_value,
      avgInspectionPassRate: c.avg_inspection_pass_rate,
      avgConstructionDuration: c.avg_construction_duration,
      specialties: c.permit_tags,
      propertyTypes: c.property_types,
    },
    performanceRating,
  };
};

// ============================================================================
// 3. getContractorHistory - Get permit history for a contractor
// ============================================================================
const contractorHistoryInput = z.object({
  contractorId: z.string().describe('Contractor ID'),
  fromDate: z.string().describe('Start date (YYYY-MM-DD)'),
  toDate: z.string().describe('End date (YYYY-MM-DD)'),
});

const contractorHistoryOutput = z.object({
  permits: z.array(z.object({
    id: z.string(),
    number: z.string(),
    description: z.string(),
    status: z.string(),
    tags: z.array(z.string()),
    jobValue: z.number().optional(),
    fileDate: z.string().optional(),
    address: z.string(),
  })),
  totalPermits: z.number(),
  totalJobValue: z.number(),
  summary: z.string(),
});

type ContractorHistoryInput = z.infer<typeof contractorHistoryInput>;
type ContractorHistoryOutput = z.infer<typeof contractorHistoryOutput>;

const contractorHistoryDef: ToolDefinition<ContractorHistoryInput, ContractorHistoryOutput> = {
  id: 'contractor.history',
  name: 'getContractorHistory',
  description: 'Get permit history for a contractor to evaluate their work experience.',
  category: 'contractors',
  requiredPermission: 'read',
  inputSchema: contractorHistoryInput,
  outputSchema: contractorHistoryOutput,
  requiresConfirmation: false,
  tags: ['contractor', 'history', 'permits', 'shovels'],
};

const contractorHistoryHandler: ToolHandler<ContractorHistoryInput, ContractorHistoryOutput> = async (input) => {
  const permits = await getContractorPermits(input.contractorId, {
    permit_from: input.fromDate,
    permit_to: input.toDate,
  });

  const totalJobValue = permits.reduce((sum, p) => sum + (p.job_value || 0), 0);

  return {
    permits: permits.map((p) => ({
      id: p.id,
      number: p.number,
      description: p.description,
      status: p.status,
      tags: p.tags,
      jobValue: p.job_value,
      fileDate: p.file_date,
      address: `${p.address.street}, ${p.address.city}, ${p.address.state}`,
    })),
    totalPermits: permits.length,
    totalJobValue,
    summary: `${permits.length} permits with total job value of $${totalJobValue.toLocaleString()}`,
  };
};

// ============================================================================
// 4. compareContractors - Compare multiple contractors
// ============================================================================
const compareContractorsInput = z.object({
  contractorIds: z.array(z.string()).min(2).max(5).describe('List of contractor IDs to compare'),
});

const compareContractorsOutput = z.object({
  comparison: z.array(z.object({
    id: z.string(),
    name: z.string(),
    totalPermits: z.number(),
    lifetimeJobValue: z.number().optional(),
    avgInspectionPassRate: z.number().optional(),
    avgConstructionDuration: z.number().optional(),
    specialties: z.array(z.string()),
    score: z.number(),
  })),
  recommendation: z.string(),
  winner: z.string(),
});

type CompareContractorsInput = z.infer<typeof compareContractorsInput>;
type CompareContractorsOutput = z.infer<typeof compareContractorsOutput>;

const compareContractorsDef: ToolDefinition<CompareContractorsInput, CompareContractorsOutput> = {
  id: 'contractor.compare',
  name: 'compareContractors',
  description: 'Compare multiple contractors side-by-side to help choose the best one.',
  category: 'contractors',
  requiredPermission: 'read',
  inputSchema: compareContractorsInput,
  outputSchema: compareContractorsOutput,
  requiresConfirmation: false,
  tags: ['contractor', 'compare', 'shovels'],
};

const compareContractorsHandler: ToolHandler<CompareContractorsInput, CompareContractorsOutput> = async (input) => {
  const contractors = await Promise.all(
    input.contractorIds.map((id) => getContractorById(id))
  );

  const comparison = contractors.map((c) => {
    // Calculate a composite score (0-100)
    let score = 50; // Base score
    if (c.avg_inspection_pass_rate) score += (c.avg_inspection_pass_rate - 80) * 2;
    if (c.total_permits > 100) score += 10;
    else if (c.total_permits > 50) score += 5;
    if (c.lifetime_job_value && c.lifetime_job_value > 1000000) score += 10;
    score = Math.max(0, Math.min(100, score));

    return {
      id: c.id,
      name: c.name,
      totalPermits: c.total_permits,
      lifetimeJobValue: c.lifetime_job_value,
      avgInspectionPassRate: c.avg_inspection_pass_rate,
      avgConstructionDuration: c.avg_construction_duration,
      specialties: c.permit_tags,
      score: Math.round(score),
    };
  });

  // Sort by score descending
  comparison.sort((a, b) => b.score - a.score);
  const winner = comparison[0]!;

  return {
    comparison,
    recommendation: `${winner.name} has the highest score (${winner.score}/100) based on inspection pass rate, experience, and job value.`,
    winner: winner.id,
  };
};

// ============================================================================
// 5. findTopContractors - Find highest-rated contractors in area
// ============================================================================
const topContractorsInput = z.object({
  geoId: z.string().describe('Geographic ID (zip, city, county)'),
  specialty: z.enum(SHOVELS_PERMIT_TAGS).optional().describe('Filter by specialty'),
  limit: z.number().optional().default(10),
});

const topContractorsOutput = z.object({
  contractors: z.array(z.object({
    id: z.string(),
    name: z.string(),
    businessName: z.string().optional(),
    totalPermits: z.number(),
    avgInspectionPassRate: z.number().optional(),
    lifetimeJobValue: z.number().optional(),
    specialties: z.array(z.string()),
    rank: z.number(),
  })),
  summary: z.string(),
});

type TopContractorsInput = z.infer<typeof topContractorsInput>;
type TopContractorsOutput = z.infer<typeof topContractorsOutput>;

const topContractorsDef: ToolDefinition<TopContractorsInput, TopContractorsOutput> = {
  id: 'contractor.top',
  name: 'findTopContractors',
  description: 'Find the highest-rated contractors in an area, optionally filtered by specialty.',
  category: 'contractors',
  requiredPermission: 'read',
  inputSchema: topContractorsInput,
  outputSchema: topContractorsOutput,
  requiresConfirmation: false,
  tags: ['contractor', 'top', 'rated', 'shovels'],
};

const topContractorsHandler: ToolHandler<TopContractorsInput, TopContractorsOutput> = async (input) => {
  const now = new Date();
  const twoYearsAgo = new Date(now);
  twoYearsAgo.setFullYear(now.getFullYear() - 2);

  const result = await searchContractorsApi({
    geo_id: input.geoId,
    permit_from: twoYearsAgo.toISOString().split('T')[0]!,
    permit_to: now.toISOString().split('T')[0]!,
    permit_tags: input.specialty ? [input.specialty] : undefined,
  });

  // Sort by inspection pass rate and experience
  const sorted = result.items
    .filter((c) => c.total_permits >= 5) // Minimum experience
    .sort((a, b) => {
      const scoreA = (a.avg_inspection_pass_rate || 0) + Math.min(a.total_permits / 10, 10);
      const scoreB = (b.avg_inspection_pass_rate || 0) + Math.min(b.total_permits / 10, 10);
      return scoreB - scoreA;
    })
    .slice(0, input.limit);

  const contractors = sorted.map((c, idx) => ({
    id: c.id,
    name: c.name,
    businessName: c.business_name,
    totalPermits: c.total_permits,
    avgInspectionPassRate: c.avg_inspection_pass_rate,
    lifetimeJobValue: c.lifetime_job_value,
    specialties: c.permit_tags,
    rank: idx + 1,
  }));

  const specialty = input.specialty ? ` specializing in ${input.specialty}` : '';
  const summary = `Top ${contractors.length} contractors${specialty} in the area`;

  return { contractors, summary };
};

// ============================================================================
// Register all contractor tools
// ============================================================================
export function registerContractorTools(): void {
  toolRegistry.register(searchContractorsDef, searchContractorsHandler);
  toolRegistry.register(contractorDetailsDef, contractorDetailsHandler);
  toolRegistry.register(contractorHistoryDef, contractorHistoryHandler);
  toolRegistry.register(compareContractorsDef, compareContractorsHandler);
  toolRegistry.register(topContractorsDef, topContractorsHandler);
  console.log('[Contractor Tools] Registered 5 Shovels contractor AI tools');
}

