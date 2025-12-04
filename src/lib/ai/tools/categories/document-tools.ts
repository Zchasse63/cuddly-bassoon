/**
 * Document Generation Tools
 * Tools for generating professional documents
 */

import { z } from 'zod';
import { toolRegistry } from '../registry';
import { ToolDefinition, ToolHandler } from '../types';

// ============================================================================
// Generate Offer Letter Tool
// ============================================================================
const generateOfferLetterInput = z.object({
  propertyId: z.string(),
  offerAmount: z.number(),
  earnestMoney: z.number().optional(),
  closingDate: z.string().optional(),
  contingencies: z.array(z.string()).optional(),
  buyerName: z.string(),
  sellerName: z.string().optional(),
  customTerms: z.string().optional(),
});

const generateOfferLetterOutput = z.object({
  documentId: z.string(),
  downloadUrl: z.string(),
  previewUrl: z.string(),
  expiresAt: z.string(),
});

type GenerateOfferLetterInput = z.infer<typeof generateOfferLetterInput>;
type GenerateOfferLetterOutput = z.infer<typeof generateOfferLetterOutput>;

const generateOfferLetterDefinition: ToolDefinition<GenerateOfferLetterInput, GenerateOfferLetterOutput> = {
  id: 'docs.generate_offer_letter',
  name: 'Generate Offer Letter',
  description: 'Generate a professional offer letter for a property with customizable terms.',
  category: 'document_generation',
  requiredPermission: 'write',
  inputSchema: generateOfferLetterInput,
  outputSchema: generateOfferLetterOutput,
  requiresConfirmation: false,
  estimatedDuration: 5000,
  rateLimit: 20,
  tags: ['documents', 'offer', 'letter'],
};

const generateOfferLetterHandler: ToolHandler<GenerateOfferLetterInput, GenerateOfferLetterOutput> = async (input) => {
  console.log('[Docs] Generate offer letter for:', input.propertyId);
  const docId = `doc_${Date.now()}`;
  return {
    documentId: docId,
    downloadUrl: `https://api.example.com/docs/${docId}/download`,
    previewUrl: `https://api.example.com/docs/${docId}/preview`,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  };
};

// ============================================================================
// Generate Deal Summary Tool
// ============================================================================
const generateDealSummaryInput = z.object({
  dealId: z.string(),
  includeComps: z.boolean().default(true),
  includeFinancials: z.boolean().default(true),
  includeTimeline: z.boolean().default(true),
  format: z.enum(['pdf', 'docx', 'html']).default('pdf'),
});

const generateDealSummaryOutput = z.object({
  documentId: z.string(),
  downloadUrl: z.string(),
  summary: z.object({
    propertyAddress: z.string(),
    purchasePrice: z.number(),
    arv: z.number(),
    potentialProfit: z.number(),
  }),
});

type GenerateDealSummaryInput = z.infer<typeof generateDealSummaryInput>;
type GenerateDealSummaryOutput = z.infer<typeof generateDealSummaryOutput>;

const generateDealSummaryDefinition: ToolDefinition<GenerateDealSummaryInput, GenerateDealSummaryOutput> = {
  id: 'docs.generate_deal_summary',
  name: 'Generate Deal Summary',
  description: 'Generate a comprehensive deal summary with comps, financials, and timeline.',
  category: 'document_generation',
  requiredPermission: 'read',
  inputSchema: generateDealSummaryInput,
  outputSchema: generateDealSummaryOutput,
  requiresConfirmation: false,
  estimatedDuration: 8000,
  rateLimit: 15,
  tags: ['documents', 'deal', 'summary', 'report'],
};

const generateDealSummaryHandler: ToolHandler<GenerateDealSummaryInput, GenerateDealSummaryOutput> = async (input) => {
  console.log('[Docs] Generate deal summary for:', input.dealId);
  return {
    documentId: `doc_${Date.now()}`,
    downloadUrl: `https://api.example.com/docs/deal_${input.dealId}.${input.format}`,
    summary: {
      propertyAddress: '123 Main St',
      purchasePrice: 150000,
      arv: 220000,
      potentialProfit: 45000,
    },
  };
};

// ============================================================================
// Generate Comp Report Tool
// ============================================================================
const generateCompReportInput = z.object({
  propertyId: z.string(),
  radius: z.number().default(0.5),
  maxComps: z.number().default(10),
  propertyTypes: z.array(z.string()).optional(),
  soldWithinMonths: z.number().default(6),
});

const generateCompReportOutput = z.object({
  documentId: z.string(),
  downloadUrl: z.string(),
  compCount: z.number(),
  averagePrice: z.number(),
  priceRange: z.object({ min: z.number(), max: z.number() }),
});

type GenerateCompReportInput = z.infer<typeof generateCompReportInput>;
type GenerateCompReportOutput = z.infer<typeof generateCompReportOutput>;

const generateCompReportDefinition: ToolDefinition<GenerateCompReportInput, GenerateCompReportOutput> = {
  id: 'docs.generate_comp_report',
  name: 'Generate Comp Report',
  description: 'Generate a comparable sales report for a property.',
  category: 'document_generation',
  requiredPermission: 'read',
  inputSchema: generateCompReportInput,
  outputSchema: generateCompReportOutput,
  requiresConfirmation: false,
  estimatedDuration: 6000,
  rateLimit: 20,
  tags: ['documents', 'comps', 'report', 'analysis'],
};

const generateCompReportHandler: ToolHandler<GenerateCompReportInput, GenerateCompReportOutput> = async (input) => {
  console.log('[Docs] Generate comp report for:', input.propertyId);
  return {
    documentId: `doc_${Date.now()}`,
    downloadUrl: `https://api.example.com/docs/comps_${input.propertyId}.pdf`,
    compCount: 8,
    averagePrice: 185000,
    priceRange: { min: 145000, max: 225000 },
  };
};

// ============================================================================
// Register All Document Tools
// ============================================================================
export function registerDocumentTools() {
  toolRegistry.register(generateOfferLetterDefinition, generateOfferLetterHandler);
  toolRegistry.register(generateDealSummaryDefinition, generateDealSummaryHandler);
  toolRegistry.register(generateCompReportDefinition, generateCompReportHandler);
}

export const documentTools = {
  generateOfferLetter: generateOfferLetterDefinition,
  generateDealSummary: generateDealSummaryDefinition,
  generateCompReport: generateCompReportDefinition,
};
