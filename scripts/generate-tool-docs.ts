/**
 * Generate AI Tool Documentation for RAG Knowledge Base
 *
 * This script extracts tool definitions from the tool registry and generates
 * markdown documentation files for the RAG system to ingest.
 *
 * Usage: npx tsx scripts/generate-tool-docs.ts
 */

import * as fs from 'fs';
import * as path from 'path';

// Tool definition structure (matches src/lib/ai/tools/types.ts)
interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredPermission: string;
  requiresConfirmation: boolean;
  estimatedDuration?: number;
  rateLimit?: number;
  tags: string[];
}

// Category metadata for documentation
const CATEGORY_METADATA: Record<string, {
  displayName: string;
  subcategory: string;
  relatedFundamentals: string[];
  relatedDataSources: string[];
  relatedWorkflows: string[];
  relatedInterpretation: string[];
}> = {
  deal_analysis: {
    displayName: 'Deal Analysis Tools',
    subcategory: 'Financial Analysis',
    relatedFundamentals: ['maximum-allowable-offer-formula', '70-percent-rule-explained', 'arv-calculation-methods'],
    relatedDataSources: ['rentcast-valuation-data', 'shovels-permit-data'],
    relatedWorkflows: ['deal-pipeline-workflow'],
    relatedInterpretation: ['interpreting-deal-scores', 'interpreting-arv-estimates'],
  },
  property_search: {
    displayName: 'Property Search Tools',
    subcategory: 'Property Discovery',
    relatedFundamentals: ['property-types-for-wholesaling', 'comps-and-comparables'],
    relatedDataSources: ['rentcast-property-data', 'rentcast-overview'],
    relatedWorkflows: ['first-search-workflow', 'saved-searches-workflow'],
    relatedInterpretation: ['interpreting-property-metrics'],
  },
  buyer_management: {
    displayName: 'Buyer Management Tools',
    subcategory: 'CRM & Buyers',
    relatedFundamentals: ['building-buyer-list', 'buyer-types-explained', 'buyer-matching-algorithm'],
    relatedDataSources: [],
    relatedWorkflows: ['buyer-management-workflow', 'deal-assignment-workflow'],
    relatedInterpretation: ['interpreting-buyer-scores'],
  },
  predictive: {
    displayName: 'Predictive Analytics Tools',
    subcategory: 'AI & Predictions',
    relatedFundamentals: ['motivation-scoring-fundamentals', 'deal-analysis-framework'],
    relatedDataSources: ['rentcast-valuation-data', 'shovels-permit-data', 'census-demographics'],
    relatedWorkflows: ['lead-prioritization-workflow'],
    relatedInterpretation: ['interpreting-motivation-scores', 'interpreting-deal-scores'],
  },
  crm: {
    displayName: 'CRM Tools',
    subcategory: 'Lead Management',
    relatedFundamentals: ['motivation-scoring-fundamentals'],
    relatedDataSources: [],
    relatedWorkflows: ['crm-pipeline-workflow', 'lead-stages-workflow'],
    relatedInterpretation: ['interpreting-motivation-scores', 'interpreting-lead-status'],
  },
  data_enrichment: {
    displayName: 'Skip Trace & Data Enrichment Tools',
    subcategory: 'Contact Discovery',
    relatedFundamentals: [],
    relatedDataSources: [],
    relatedWorkflows: ['skip-trace-workflow'],
    relatedInterpretation: ['interpreting-contact-data'],
  },
  market_analysis: {
    displayName: 'Market Analysis Tools',
    subcategory: 'Market Intelligence',
    relatedFundamentals: ['market-analysis-fundamentals', 'neighborhood-analysis'],
    relatedDataSources: ['rentcast-market-data', 'census-demographics'],
    relatedWorkflows: ['market-research-workflow'],
    relatedInterpretation: ['interpreting-market-velocity', 'interpreting-price-trends'],
  },
  deal_pipeline: {
    displayName: 'Deal Pipeline Tools',
    subcategory: 'Deal Management',
    relatedFundamentals: ['deal-analysis-framework', 'wholesale-contracts-101'],
    relatedDataSources: [],
    relatedWorkflows: ['deal-pipeline-workflow', 'deal-stages-workflow'],
    relatedInterpretation: ['interpreting-deal-scores'],
  },
  permits: {
    displayName: 'Permit Tools',
    subcategory: 'Property Intelligence',
    relatedFundamentals: ['repair-estimation-guide'],
    relatedDataSources: ['shovels-permit-data', 'shovels-overview'],
    relatedWorkflows: ['property-analysis-workflow'],
    relatedInterpretation: ['interpreting-permit-activity', 'interpreting-permit-gaps'],
  },
  contractors: {
    displayName: 'Contractor Tools',
    subcategory: 'Property Intelligence',
    relatedFundamentals: ['repair-estimation-guide'],
    relatedDataSources: ['shovels-contractor-data'],
    relatedWorkflows: ['contractor-lookup-workflow'],
    relatedInterpretation: ['interpreting-contractor-history'],
  },
  map: {
    displayName: 'Map & Geographic Tools',
    subcategory: 'Geographic Analysis',
    relatedFundamentals: ['neighborhood-analysis'],
    relatedDataSources: ['census-boundaries', 'census-demographics'],
    relatedWorkflows: ['map-search-workflow', 'heat-map-workflow'],
    relatedInterpretation: ['interpreting-heat-maps', 'interpreting-market-indicators'],
  },
  communication: {
    displayName: 'Communication Tools',
    subcategory: 'Outreach & Notifications',
    relatedFundamentals: ['follow-up-sequences', 'outreach-channel-strategies'],
    relatedDataSources: [],
    relatedWorkflows: ['sms-campaign-workflow', 'email-sequence-workflow'],
    relatedInterpretation: [],
  },
  document_generation: {
    displayName: 'Document Generation Tools',
    subcategory: 'Documents',
    relatedFundamentals: ['wholesale-contracts-101', 'contract-law-essentials'],
    relatedDataSources: [],
    relatedWorkflows: ['document-generation-workflow'],
    relatedInterpretation: [],
  },
  batch_operations: {
    displayName: 'Batch Operations Tools',
    subcategory: 'Efficiency',
    relatedFundamentals: [],
    relatedDataSources: [],
    relatedWorkflows: ['batch-processing-workflow'],
    relatedInterpretation: [],
  },
  automation: {
    displayName: 'Automation Tools',
    subcategory: 'Workflow Automation',
    relatedFundamentals: [],
    relatedDataSources: [],
    relatedWorkflows: ['automation-setup-workflow'],
    relatedInterpretation: [],
  },
  intelligence: {
    displayName: 'Intelligence Tools',
    subcategory: 'AI Analysis',
    relatedFundamentals: ['deal-analysis-framework', 'market-analysis-fundamentals'],
    relatedDataSources: ['rentcast-overview', 'shovels-overview'],
    relatedWorkflows: [],
    relatedInterpretation: ['combining-multiple-signals'],
  },
  portfolio: {
    displayName: 'Portfolio Tools',
    subcategory: 'Portfolio Management',
    relatedFundamentals: [],
    relatedDataSources: [],
    relatedWorkflows: ['portfolio-analysis-workflow'],
    relatedInterpretation: [],
  },
  advanced_search: {
    displayName: 'Advanced Search Tools',
    subcategory: 'Property Discovery',
    relatedFundamentals: ['property-types-for-wholesaling'],
    relatedDataSources: ['rentcast-property-data'],
    relatedWorkflows: ['advanced-search-workflow'],
    relatedInterpretation: [],
  },
  integrations: {
    displayName: 'Integration Tools',
    subcategory: 'External Integrations',
    relatedFundamentals: [],
    relatedDataSources: [],
    relatedWorkflows: ['integration-setup-workflow'],
    relatedInterpretation: [],
  },
  verticals: {
    displayName: 'Vertical Tools',
    subcategory: 'Specialization',
    relatedFundamentals: [],
    relatedDataSources: [],
    relatedWorkflows: [],
    relatedInterpretation: [],
  },
  utility: {
    displayName: 'Utility Tools',
    subcategory: 'System',
    relatedFundamentals: [],
    relatedDataSources: [],
    relatedWorkflows: [],
    relatedInterpretation: [],
  },
  reporting: {
    displayName: 'Reporting Tools',
    subcategory: 'Analytics',
    relatedFundamentals: [],
    relatedDataSources: [],
    relatedWorkflows: ['reporting-workflow'],
    relatedInterpretation: [],
  },
  system: {
    displayName: 'System Tools',
    subcategory: 'System',
    relatedFundamentals: [],
    relatedDataSources: [],
    relatedWorkflows: [],
    relatedInterpretation: [],
  },
};

// Hardcoded tool definitions extracted from the codebase
// In a production environment, these would be dynamically loaded
const TOOLS: ToolDefinition[] = [
  // Deal Analysis Tools (3)
  { id: 'deal_analysis.analyze', name: 'Analyze Deal', description: 'Perform comprehensive analysis of a wholesale deal including ARV, MAO, and profit calculations. Uses RentCast for property valuations and compares against the 70% rule.', category: 'deal_analysis', requiredPermission: 'read', requiresConfirmation: false, estimatedDuration: 3000, rateLimit: 20, tags: ['analysis', 'deal', 'arv', 'mao'] },
  { id: 'deal_analysis.calculate_mao', name: 'Calculate MAO', description: 'Calculate Maximum Allowable Offer based on ARV, repairs, and desired margins. Formula: MAO = (ARV × Investor %) - Repairs - Assignment Fee.', category: 'deal_analysis', requiredPermission: 'read', requiresConfirmation: false, estimatedDuration: 100, rateLimit: 100, tags: ['mao', 'calculation', 'offer'] },
  { id: 'deal_analysis.score', name: 'Score Deal', description: 'Generate a deal score based on multiple factors including motivation, equity, and market conditions. Returns score 1-10 with breakdown.', category: 'deal_analysis', requiredPermission: 'read', requiresConfirmation: false, estimatedDuration: 500, rateLimit: 50, tags: ['score', 'deal', 'ranking'] },

  // Property Search Tools (2)
  { id: 'property_search.search', name: 'Search Properties', description: 'Search for properties matching specified criteria including location, price, property type, and motivation indicators. Uses RentCast API with 140M+ records.', category: 'property_search', requiredPermission: 'read', requiresConfirmation: false, estimatedDuration: 2000, rateLimit: 30, tags: ['search', 'properties', 'filter'] },
  { id: 'property_search.get_details', name: 'Get Property Details', description: 'Get detailed information about a specific property including owner info and comparable sales. Fetches data from RentCast.', category: 'property_search', requiredPermission: 'read', requiresConfirmation: false, estimatedDuration: 1500, rateLimit: 60, tags: ['property', 'details', 'comps'] },

  // Buyer Management Tools (13)
  { id: 'buyer_management.match_buyers_to_property', name: 'Match Buyers to Property', description: 'Find buyers whose preferences match a specific property. Returns ranked list with match scores and factors.', category: 'buyer_management', requiredPermission: 'read', requiresConfirmation: false, estimatedDuration: 3000, rateLimit: 20, tags: ['buyers', 'matching', 'property'] },
  { id: 'buyer_management.get_buyer_insights', name: 'Get Buyer Insights', description: 'Get AI-powered insights about a buyer including score breakdown, strengths, and recommendations.', category: 'buyer_management', requiredPermission: 'read', requiresConfirmation: false, estimatedDuration: 2000, rateLimit: 30, tags: ['buyers', 'insights', 'analysis'] },
  { id: 'buyer_management.analyze_buyer_activity', name: 'Analyze Buyer Activity', description: 'Analyze buyer engagement patterns, identify top performers and those needing attention.', category: 'buyer_management', requiredPermission: 'read', requiresConfirmation: false, estimatedDuration: 4000, rateLimit: 10, tags: ['buyers', 'analytics', 'activity'] },
  { id: 'buyer_management.search_buyers', name: 'Search Buyers', description: 'Search for buyers by name, status, tier, or type.', category: 'buyer_management', requiredPermission: 'read', requiresConfirmation: false, estimatedDuration: 1500, rateLimit: 30, tags: ['buyers', 'search'] },
  { id: 'buyer.suggest_outreach', name: 'Suggest Buyer Outreach', description: 'Identify buyers to contact and prioritize by opportunity.', category: 'buyer_management', requiredPermission: 'read', requiresConfirmation: false, tags: ['buyer', 'outreach', 'crm'] },
  { id: 'buyer.compare', name: 'Compare Buyers', description: 'Compare buyers and recommend for specific deal.', category: 'buyer_management', requiredPermission: 'read', requiresConfirmation: false, tags: ['buyer', 'compare', 'analysis'] },
  { id: 'buyer.predict_behavior', name: 'Predict Buyer Behavior', description: 'Predict buyer response and close probability.', category: 'buyer_management', requiredPermission: 'read', requiresConfirmation: false, tags: ['buyer', 'predict', 'ai'] },
  { id: 'buyer.segment', name: 'Segment Buyers', description: 'Group buyers by criteria for targeted marketing.', category: 'buyer_management', requiredPermission: 'read', requiresConfirmation: false, tags: ['buyer', 'segment', 'marketing'] },
  { id: 'buyer.identify_gaps', name: 'Identify Buyer Gaps', description: 'Analyze buyer network coverage and identify missing types.', category: 'buyer_management', requiredPermission: 'read', requiresConfirmation: false, tags: ['buyer', 'gaps', 'analysis'] },
  { id: 'buyer.generate_report', name: 'Generate Buyer Report', description: 'Create buyer summary report with activity metrics.', category: 'buyer_management', requiredPermission: 'read', requiresConfirmation: false, tags: ['buyer', 'report'] },
  { id: 'buyer.score_fit', name: 'Score Buyer Fit', description: 'Calculate buyer-property fit score with match factors.', category: 'buyer_management', requiredPermission: 'read', requiresConfirmation: false, tags: ['buyer', 'scoring', 'matching'] },
  { id: 'buyer.track_preference_changes', name: 'Track Buyer Preference Changes', description: 'Monitor preference updates and alert on significant changes.', category: 'buyer_management', requiredPermission: 'read', requiresConfirmation: false, tags: ['buyer', 'preferences', 'tracking'] },
  { id: 'buyer.recommend_actions', name: 'Recommend Buyer Actions', description: 'Suggest next actions for buyers prioritized by impact.', category: 'buyer_management', requiredPermission: 'read', requiresConfirmation: false, tags: ['buyer', 'actions', 'recommendations'] },

  // Predictive Tools (7)
  { id: 'predict.seller_motivation', name: 'Predict Seller Motivation', description: 'Analyze property and owner data using stratified scoring models. Uses different scoring logic based on owner type: Individual (long ownership = HIGH motivation), Investor/Entity (long ownership = LOW motivation), Institutional (process-focused). Optionally includes AI-enhanced DealFlow IQ score.', category: 'predictive', requiredPermission: 'read', requiresConfirmation: false, estimatedDuration: 5000, rateLimit: 20, tags: ['predictive', 'motivation', 'seller', 'analysis', 'stratified-scoring'] },
  { id: 'predict.deal_close_probability', name: 'Predict Deal Close Probability', description: 'Predict the likelihood of a deal closing using market velocity and property data.', category: 'predictive', requiredPermission: 'read', requiresConfirmation: false, estimatedDuration: 5000, rateLimit: 20, tags: ['predictive', 'deals', 'probability', 'risk'] },
  { id: 'predict.optimal_offer_price', name: 'Calculate Optimal Offer Price', description: 'Calculate optimal offer price using real ARV from RentCast and market data.', category: 'predictive', requiredPermission: 'read', requiresConfirmation: false, estimatedDuration: 5000, rateLimit: 15, tags: ['predictive', 'pricing', 'offer', 'analysis'] },
  { id: 'predict.time_to_close', name: 'Predict Time to Close', description: 'Predict deal timeline using market velocity data and deal type analysis.', category: 'predictive', requiredPermission: 'read', requiresConfirmation: false, estimatedDuration: 4000, rateLimit: 25, tags: ['predictive', 'timeline', 'deals'] },
  { id: 'predict.classify_owner', name: 'Classify Owner Type', description: 'Classify a property owner into categories: Individual (owner-occupied/absentee), Investor/Entity (LLC, corporation, trust), or Institutional (bank REO, government, estate). Uses pattern matching on owner name and optional signals.', category: 'predictive', requiredPermission: 'read', requiresConfirmation: false, estimatedDuration: 500, rateLimit: 50, tags: ['predictive', 'owner', 'classification', 'entity-detection'] },
  { id: 'predict.batch_motivation', name: 'Batch Score Seller Motivation', description: 'Calculate seller motivation scores for multiple properties at once. Returns scores, owner classifications, and recommendations for up to 20 properties. Useful for prioritizing lead lists.', category: 'predictive', requiredPermission: 'read', requiresConfirmation: false, estimatedDuration: 30000, rateLimit: 5, tags: ['predictive', 'motivation', 'batch', 'lead-scoring'] },
  { id: 'predict.compare_motivation', name: 'Compare Motivation Scores', description: 'Compare seller motivation scores across multiple properties to prioritize outreach. Ranks properties and provides analysis of which to contact first.', category: 'predictive', requiredPermission: 'read', requiresConfirmation: false, estimatedDuration: 15000, rateLimit: 10, tags: ['predictive', 'motivation', 'comparison', 'prioritization'] },

  // CRM Tools (12)
  { id: 'crm.create_lead_list', name: 'Create Lead List', description: 'Create a new lead list for organizing leads.', category: 'crm', requiredPermission: 'write', requiresConfirmation: true, tags: ['crm', 'leads', 'list'] },
  { id: 'crm.rank_by_motivation', name: 'Rank List by Motivation', description: 'Rank leads by motivation score, highest first.', category: 'crm', requiredPermission: 'read', requiresConfirmation: false, tags: ['crm', 'leads', 'motivation', 'ranking'] },
  { id: 'crm.suggest_outreach', name: 'Suggest Lead Outreach', description: 'Suggest leads to contact based on motivation and status.', category: 'crm', requiredPermission: 'read', requiresConfirmation: false, tags: ['crm', 'leads', 'outreach'] },
  { id: 'crm.analyze_source', name: 'Analyze Lead Source', description: 'Analyze performance of different lead sources.', category: 'crm', requiredPermission: 'read', requiresConfirmation: false, tags: ['crm', 'leads', 'analytics', 'source'] },
  { id: 'crm.segment_leads', name: 'Segment Leads', description: 'Segment leads by motivation, status, source, or recency.', category: 'crm', requiredPermission: 'read', requiresConfirmation: false, tags: ['crm', 'leads', 'segmentation'] },
  { id: 'crm.predict_conversion', name: 'Predict Lead Conversion', description: 'Predict likelihood of lead converting to deal.', category: 'crm', requiredPermission: 'read', requiresConfirmation: false, tags: ['crm', 'leads', 'prediction', 'ai'] },
  { id: 'crm.generate_report', name: 'Generate Lead Report', description: 'Generate a summary report for leads.', category: 'crm', requiredPermission: 'read', requiresConfirmation: false, tags: ['crm', 'leads', 'report'] },
  { id: 'crm.identify_hot', name: 'Identify Hot Leads', description: 'Find leads with high motivation scores.', category: 'crm', requiredPermission: 'read', requiresConfirmation: false, tags: ['crm', 'leads', 'hot', 'priority'] },
  { id: 'crm.track_engagement', name: 'Track Lead Engagement', description: 'Track engagement history for a lead.', category: 'crm', requiredPermission: 'read', requiresConfirmation: false, tags: ['crm', 'leads', 'engagement'] },
  { id: 'crm.suggest_nurturing', name: 'Suggest Lead Nurturing', description: 'Suggest nurturing plan for a lead.', category: 'crm', requiredPermission: 'read', requiresConfirmation: false, tags: ['crm', 'leads', 'nurturing'] },
  { id: 'crm.merge_leads', name: 'Merge Lead Records', description: 'Merge duplicate lead records.', category: 'crm', requiredPermission: 'write', requiresConfirmation: true, tags: ['crm', 'leads', 'merge', 'cleanup'] },
  { id: 'crm.export_leads', name: 'Export Lead Data', description: 'Export lead data in JSON or CSV format.', category: 'crm', requiredPermission: 'read', requiresConfirmation: false, tags: ['crm', 'leads', 'export'] },

  // Skip Trace Tools (10)
  { id: 'skip_trace.trace_lead', name: 'Skip Trace Lead', description: 'Skip trace a lead to find phone numbers, emails, and addresses.', category: 'data_enrichment', requiredPermission: 'execute', requiresConfirmation: true, estimatedDuration: 5000, tags: ['skip-trace', 'contact', 'enrichment'] },
  { id: 'skip_trace.batch_trace', name: 'Batch Skip Trace', description: 'Queue multiple leads for skip tracing.', category: 'data_enrichment', requiredPermission: 'execute', requiresConfirmation: true, tags: ['skip-trace', 'batch', 'enrichment'] },
  { id: 'skip_trace.get_status', name: 'Get Skip Trace Status', description: 'Check the status of a skip trace request.', category: 'data_enrichment', requiredPermission: 'read', requiresConfirmation: false, tags: ['skip-trace', 'status'] },
  { id: 'skip_trace.validate_phone', name: 'Validate Phone Number', description: 'Validate and get info about a phone number.', category: 'data_enrichment', requiredPermission: 'read', requiresConfirmation: false, tags: ['skip-trace', 'phone', 'validation'] },
  { id: 'skip_trace.validate_email', name: 'Validate Email', description: 'Validate an email address.', category: 'data_enrichment', requiredPermission: 'read', requiresConfirmation: false, tags: ['skip-trace', 'email', 'validation'] },
  { id: 'skip_trace.enrich_lead', name: 'Enrich Lead Data', description: 'Enrich lead with demographics, property, or financial data.', category: 'data_enrichment', requiredPermission: 'execute', requiresConfirmation: true, tags: ['skip-trace', 'enrichment', 'data'] },
  { id: 'skip_trace.find_related', name: 'Find Related Contacts', description: 'Find relatives, associates, or neighbors of a lead.', category: 'data_enrichment', requiredPermission: 'execute', requiresConfirmation: true, tags: ['skip-trace', 'contacts', 'relatives'] },
  { id: 'skip_trace.reverse_phone', name: 'Reverse Phone Lookup', description: 'Look up owner information by phone number.', category: 'data_enrichment', requiredPermission: 'execute', requiresConfirmation: true, tags: ['skip-trace', 'phone', 'lookup'] },
  { id: 'skip_trace.reverse_address', name: 'Reverse Address Lookup', description: 'Look up owner information by property address.', category: 'data_enrichment', requiredPermission: 'execute', requiresConfirmation: true, tags: ['skip-trace', 'address', 'lookup'] },
  { id: 'skip_trace.get_credits', name: 'Get Skip Trace Credits', description: 'Check remaining skip trace credits.', category: 'data_enrichment', requiredPermission: 'read', requiresConfirmation: false, tags: ['skip-trace', 'credits', 'billing'] },
];

// Helper function to generate slug from tool ID
function toolIdToSlug(toolId: string): string {
  return `tool-${toolId.replace(/\./g, '-').replace(/_/g, '-')}`;
}

// Helper function to generate category slug
function categoryToSlug(category: string): string {
  return category.replace(/_/g, '-');
}

// Generate tags for a tool
function generateTags(tool: ToolDefinition): string[] {
  const tags = new Set<string>();

  // Add tool prefix tags
  tool.tags.forEach(tag => tags.add(`tool-${tag}`));

  // Add category-based tags
  tags.add(`tool-${categoryToSlug(tool.category)}`);

  // Add action tags based on common patterns
  if (tool.name.toLowerCase().includes('search')) tags.add('action-search');
  if (tool.name.toLowerCase().includes('analyze') || tool.name.toLowerCase().includes('analysis')) tags.add('action-analyze');
  if (tool.name.toLowerCase().includes('calculate')) tags.add('action-calculate');
  if (tool.name.toLowerCase().includes('predict')) tags.add('action-predict');
  if (tool.name.toLowerCase().includes('score')) tags.add('action-score');
  if (tool.name.toLowerCase().includes('match')) tags.add('action-match');
  if (tool.name.toLowerCase().includes('export')) tags.add('action-export');
  if (tool.name.toLowerCase().includes('generate')) tags.add('action-generate');
  if (tool.name.toLowerCase().includes('create')) tags.add('action-create');

  // Add concept tags
  if (tool.description.toLowerCase().includes('mao')) tags.add('concept-mao');
  if (tool.description.toLowerCase().includes('arv')) tags.add('concept-arv');
  if (tool.description.toLowerCase().includes('motivation')) tags.add('concept-motivation');
  if (tool.description.toLowerCase().includes('equity')) tags.add('concept-equity');

  // Add data source tags
  if (tool.description.toLowerCase().includes('rentcast')) tags.add('data-rentcast');
  if (tool.description.toLowerCase().includes('shovels')) tags.add('data-shovels');
  if (tool.description.toLowerCase().includes('census')) tags.add('data-census');

  return Array.from(tags);
}

// Generate related docs for a tool
function generateRelatedDocs(tool: ToolDefinition): string[] {
  const related: string[] = [];
  const metadata = CATEGORY_METADATA[tool.category];

  if (metadata) {
    related.push(...metadata.relatedFundamentals.slice(0, 2));
    related.push(...metadata.relatedDataSources.slice(0, 1));
    related.push(...metadata.relatedWorkflows.slice(0, 1));
    related.push(...metadata.relatedInterpretation.slice(0, 1));
  }

  return related.filter(Boolean);
}

// Generate markdown content for a single tool
function generateToolMarkdown(tool: ToolDefinition): string {
  const slug = toolIdToSlug(tool.id);
  const tags = generateTags(tool);
  const relatedDocs = generateRelatedDocs(tool);
  const metadata = CATEGORY_METADATA[tool.category] || {
    displayName: tool.category,
    subcategory: 'Other',
  };

  const frontmatter = `---
slug: ${slug}
title: "${tool.name} - AI Tool Documentation"
category: AI Tools
subcategory: ${metadata.displayName}
tags: [${tags.join(', ')}]
related_docs: [${relatedDocs.join(', ')}]
difficulty_level: beginner
tool_id: ${tool.id}
---`;

  const content = `
# ${tool.name}

## Quick Reference

- **Tool ID**: \`${tool.id}\`
- **Category**: ${metadata.displayName}
- **Permission Required**: ${tool.requiredPermission}
- **Requires Confirmation**: ${tool.requiresConfirmation ? 'Yes' : 'No'}
${tool.estimatedDuration ? `- **Typical Duration**: ${tool.estimatedDuration}ms` : ''}
${tool.rateLimit ? `- **Rate Limit**: ${tool.rateLimit} calls/minute` : ''}

## What This Tool Does

${tool.description}

## When to Use This Tool

Use **${tool.name}** when you need to:
${generateUseCases(tool)}

## How to Use This Tool

### Natural Language Examples

${generateNaturalLanguageExamples(tool)}

### Parameters

${generateParameterDocs(tool)}

## Tips for Best Results

${generateTips(tool)}

## Related Workflows

${generateRelatedWorkflowsList(tool)}
`;

  return frontmatter + content;
}

// Generate use cases for a tool
function generateUseCases(tool: ToolDefinition): string {
  const cases: string[] = [];

  if (tool.category === 'deal_analysis') {
    cases.push('- Evaluate the profitability of a potential wholesale deal');
    cases.push('- Calculate the maximum price you can offer for a property');
    cases.push('- Compare multiple deals to prioritize your efforts');
  } else if (tool.category === 'property_search') {
    cases.push('- Find properties matching specific investment criteria');
    cases.push('- Research a specific property\'s details and owner information');
    cases.push('- Discover motivated seller opportunities in a target area');
  } else if (tool.category === 'buyer_management') {
    cases.push('- Find the best buyer match for a specific property');
    cases.push('- Analyze your buyer network performance');
    cases.push('- Prioritize buyer outreach for maximum deal flow');
  } else if (tool.category === 'predictive') {
    cases.push('- Assess seller motivation before making contact');
    cases.push('- Predict deal outcomes based on property and market data');
    cases.push('- Prioritize leads based on likelihood to sell');
  } else if (tool.category === 'crm') {
    cases.push('- Organize and prioritize your lead pipeline');
    cases.push('- Track lead engagement and follow-up effectiveness');
    cases.push('- Identify high-priority leads for immediate action');
  } else if (tool.category === 'data_enrichment') {
    cases.push('- Find contact information for property owners');
    cases.push('- Validate phone numbers and emails before outreach');
    cases.push('- Enrich lead records with additional data');
  } else {
    cases.push('- Automate repetitive tasks in your workflow');
    cases.push('- Get data-driven insights for decision making');
  }

  return cases.join('\n');
}

// Generate natural language examples
function generateNaturalLanguageExamples(tool: ToolDefinition): string {
  const examples: string[] = [];

  if (tool.id === 'deal_analysis.analyze') {
    examples.push('- "Analyze the deal for property 123 Main Street"');
    examples.push('- "What\'s the profit potential on this property?"');
    examples.push('- "Run a full deal analysis including ARV and MAO"');
  } else if (tool.id === 'deal_analysis.calculate_mao') {
    examples.push('- "Calculate MAO for a property with $300k ARV and $40k repairs"');
    examples.push('- "What\'s my maximum offer if ARV is $250,000?"');
    examples.push('- "Calculate the 70% rule for this deal"');
  } else if (tool.id === 'property_search.search') {
    examples.push('- "Find properties in Miami under $200k"');
    examples.push('- "Search for high-equity absentee owners in 33139"');
    examples.push('- "Show me 3-bedroom properties with motivated sellers"');
  } else if (tool.id === 'predict.seller_motivation') {
    examples.push('- "What\'s the seller motivation for 123 Oak Street?"');
    examples.push('- "Score this property owner\'s likelihood to sell"');
    examples.push('- "Is this owner motivated to sell?"');
  } else if (tool.id === 'buyer_management.match_buyers_to_property') {
    examples.push('- "Find matching buyers for this property"');
    examples.push('- "Who in my buyer list would want this deal?"');
    examples.push('- "Match cash buyers to this flip opportunity"');
  } else {
    examples.push(`- "Use ${tool.name.toLowerCase()} for this property"`);
    examples.push(`- "${tool.description.split('.')[0]}"`);
  }

  return examples.join('\n');
}

// Generate parameter documentation
function generateParameterDocs(tool: ToolDefinition): string {
  // Simplified parameter docs based on tool patterns
  let params = '';

  if (tool.id.includes('property') || tool.id.includes('deal') || tool.id.includes('predict')) {
    params += '- **propertyId** or **address**: The property to analyze\n';
  }
  if (tool.id.includes('buyer')) {
    params += '- **buyerId**: The buyer to analyze or match\n';
  }
  if (tool.id.includes('lead') || tool.id.includes('crm')) {
    params += '- **leadId**: The lead to process\n';
  }
  if (tool.id.includes('search')) {
    params += '- **location**: City, zip code, or address to search\n';
    params += '- **limit**: Maximum number of results (default: 25)\n';
  }
  if (tool.id.includes('batch')) {
    params += '- **ids**: Array of IDs to process in batch\n';
  }

  return params || 'See tool schema for complete parameter list.';
}

// Generate tips for best results
function generateTips(tool: ToolDefinition): string {
  const tips: string[] = [];

  if (tool.category === 'deal_analysis') {
    tips.push('- Always verify ARV with recent comparable sales');
    tips.push('- Include repair estimates from a contractor when possible');
    tips.push('- Use conservative estimates for repairs (add 10-15% buffer)');
  } else if (tool.category === 'predictive') {
    tips.push('- Combine motivation scores with equity analysis for best results');
    tips.push('- Higher confidence scores indicate more reliable predictions');
    tips.push('- Different owner types require different scoring interpretations');
  } else if (tool.category === 'buyer_management') {
    tips.push('- Keep buyer preferences updated for accurate matching');
    tips.push('- A-tier buyers should be contacted first for new deals');
    tips.push('- Track buyer response rates to improve future matching');
  } else if (tool.category === 'crm') {
    tips.push('- Prioritize high-motivation leads for immediate outreach');
    tips.push('- Track all contact attempts for engagement analysis');
    tips.push('- Use lead segmentation for targeted campaigns');
  } else {
    tips.push('- Provide complete input data for more accurate results');
    tips.push('- Check tool status and credits before batch operations');
  }

  return tips.join('\n');
}

// Generate related workflows list
function generateRelatedWorkflowsList(tool: ToolDefinition): string {
  const metadata = CATEGORY_METADATA[tool.category];
  if (!metadata || metadata.relatedWorkflows.length === 0) {
    return 'See Platform Workflows documentation for integration guides.';
  }

  return metadata.relatedWorkflows.map(w => `- [${w}](${w})`).join('\n');
}

// Group tools by category
function groupToolsByCategory(tools: ToolDefinition[]): Map<string, ToolDefinition[]> {
  const grouped = new Map<string, ToolDefinition[]>();

  for (const tool of tools) {
    const existing = grouped.get(tool.category) || [];
    existing.push(tool);
    grouped.set(tool.category, existing);
  }

  return grouped;
}

// Generate category overview document
function generateCategoryOverview(category: string, tools: ToolDefinition[]): string {
  const metadata = CATEGORY_METADATA[category] || {
    displayName: category,
    subcategory: 'Other',
    relatedFundamentals: [],
    relatedDataSources: [],
    relatedWorkflows: [],
    relatedInterpretation: [],
  };

  const allTags = new Set<string>();
  tools.forEach(t => generateTags(t).forEach(tag => allTags.add(tag)));

  const frontmatter = `---
slug: tool-category-${categoryToSlug(category)}
title: "${metadata.displayName} - Complete Tool Reference"
category: AI Tools
subcategory: ${metadata.subcategory}
tags: [${Array.from(allTags).slice(0, 10).join(', ')}]
related_docs: [${[...metadata.relatedFundamentals.slice(0, 2), ...metadata.relatedWorkflows.slice(0, 1)].join(', ')}]
difficulty_level: beginner
---`;

  const toolList = tools.map(t => `
### ${t.name}

**ID**: \`${t.id}\`

${t.description}

**When to use**: ${generateShortUseCase(t)}
`).join('\n');

  const content = `
# ${metadata.displayName}

## Overview

This category contains ${tools.length} tools for ${metadata.subcategory.toLowerCase()} operations.

## Available Tools

${toolList}

## Common Use Cases

${generateCategoryUseCases(category)}

## Related Documentation

- **Fundamentals**: ${metadata.relatedFundamentals.join(', ') || 'N/A'}
- **Data Sources**: ${metadata.relatedDataSources.join(', ') || 'N/A'}
- **Workflows**: ${metadata.relatedWorkflows.join(', ') || 'N/A'}
- **Data Interpretation**: ${metadata.relatedInterpretation.join(', ') || 'N/A'}
`;

  return frontmatter + content;
}

function generateShortUseCase(tool: ToolDefinition): string {
  const desc = tool.description.toLowerCase();
  if (desc.includes('calculate')) return 'Calculate values and metrics';
  if (desc.includes('search') || desc.includes('find')) return 'Search and discover data';
  if (desc.includes('analyze')) return 'Analyze data and generate insights';
  if (desc.includes('predict')) return 'Predict outcomes and scores';
  if (desc.includes('match')) return 'Match and compare records';
  if (desc.includes('create') || desc.includes('generate')) return 'Create new records or content';
  return 'Perform specialized operations';
}

function generateCategoryUseCases(category: string): string {
  const cases: Record<string, string> = {
    deal_analysis: `
1. **Evaluate a New Deal**: Use \`deal_analysis.analyze\` to get comprehensive deal metrics
2. **Calculate Offer Price**: Use \`deal_analysis.calculate_mao\` for precise MAO calculations
3. **Compare Deals**: Use \`deal_analysis.score\` to rank multiple opportunities`,
    property_search: `
1. **Find Investment Properties**: Search by location, price, and property type
2. **Research a Property**: Get detailed property and owner information
3. **Discover Motivated Sellers**: Filter by equity, ownership duration, and distress signals`,
    buyer_management: `
1. **Find Buyers for a Deal**: Match property to buyer preferences
2. **Analyze Your Network**: Review buyer activity and engagement
3. **Prioritize Outreach**: Identify which buyers to contact first`,
    predictive: `
1. **Score Leads**: Calculate seller motivation before outreach
2. **Predict Outcomes**: Forecast deal close probability
3. **Prioritize Pipeline**: Rank leads by likelihood to sell`,
    crm: `
1. **Organize Leads**: Create lists and segment by criteria
2. **Prioritize Follow-up**: Rank leads by motivation and engagement
3. **Track Performance**: Analyze source effectiveness and conversion`,
    data_enrichment: `
1. **Find Contact Info**: Skip trace property owners
2. **Validate Data**: Verify phone numbers and emails
3. **Enrich Records**: Add demographic and financial data`,
  };

  return cases[category] || 'See individual tool documentation for use cases.';
}

// Main function
async function main() {
  const outputDir = path.join(process.cwd(), 'knowledge-base', '11-ai-tools');

  console.log('Generating AI Tool Documentation...');
  console.log(`Output directory: ${outputDir}`);

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Group tools by category
  const groupedTools = groupToolsByCategory(TOOLS);

  // Generate category overview documents
  for (const [category, tools] of groupedTools) {
    const categoryDir = path.join(outputDir, categoryToSlug(category));
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }

    // Generate category overview
    const overviewContent = generateCategoryOverview(category, tools);
    const overviewPath = path.join(categoryDir, '_overview.md');
    fs.writeFileSync(overviewPath, overviewContent);
    console.log(`  Created: ${overviewPath}`);

    // Generate individual tool docs
    for (const tool of tools) {
      const toolContent = generateToolMarkdown(tool);
      const toolPath = path.join(categoryDir, `${toolIdToSlug(tool.id)}.md`);
      fs.writeFileSync(toolPath, toolContent);
      console.log(`  Created: ${toolPath}`);
    }
  }

  // Generate main index
  const indexContent = generateMainIndex(groupedTools);
  const indexPath = path.join(outputDir, '_overview.md');
  fs.writeFileSync(indexPath, indexContent);
  console.log(`  Created: ${indexPath}`);

  console.log(`\nGenerated documentation for ${TOOLS.length} tools in ${groupedTools.size} categories.`);
}

function generateMainIndex(groupedTools: Map<string, ToolDefinition[]>): string {
  const totalTools = Array.from(groupedTools.values()).reduce((sum, tools) => sum + tools.length, 0);

  const frontmatter = `---
slug: ai-tools-overview
title: "AI Tools Reference - Complete Platform Tool Documentation"
category: AI Tools
subcategory: Overview
tags: [tool-overview, ai-tools, platform-tools]
related_docs: [first-search-workflow, deal-pipeline-workflow, crm-pipeline-workflow]
difficulty_level: beginner
---`;

  const categoryList = Array.from(groupedTools.entries())
    .map(([category, tools]) => {
      const metadata = CATEGORY_METADATA[category] || { displayName: category };
      return `- **[${metadata.displayName}](tool-category-${categoryToSlug(category)})**: ${tools.length} tools`;
    })
    .join('\n');

  const content = `
# AI Tools Reference

## Overview

This platform provides ${totalTools} AI-powered tools across ${groupedTools.size} categories to help you find deals, manage buyers, analyze markets, and close more wholesale transactions.

## Tool Categories

${categoryList}

## How to Use These Tools

### Natural Language Requests

Simply describe what you want to do in natural language. The AI will select and use the appropriate tools.

**Examples:**
- "Find high-equity properties in Miami"
- "Calculate MAO for this property"
- "Match buyers to this deal"
- "Score the seller's motivation"

### Tool Selection

The AI automatically selects tools based on your request. You don't need to know tool names or IDs - just describe your goal.

### Tool Confirmation

Some tools that create or modify data require confirmation before executing. You'll be prompted to approve these actions.

## Quick Start

1. **Search Properties**: Ask to find properties in a location or with specific criteria
2. **Analyze Deals**: Request deal analysis including ARV, MAO, and profit potential
3. **Score Leads**: Get motivation scores to prioritize your outreach
4. **Match Buyers**: Find the best buyer matches for your deals

## Related Documentation

- [Getting Started with the Platform](first-search-workflow)
- [Understanding Deal Analysis](deal-analysis-framework)
- [Lead Management](crm-pipeline-workflow)
`;

  return frontmatter + content;
}

// Run the script
main().catch(console.error);
