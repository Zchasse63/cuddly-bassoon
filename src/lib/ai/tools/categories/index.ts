/**
 * Tool Categories Index
 * Central registration for all tool categories
 */

import { registerPropertySearchTools } from './property-search';
import { registerDealAnalysisTools } from './deal-analysis';
import { registerBuyerManagementTools } from './buyer-management';
import { registerSearchTools } from './search-tools';
import { registerPropertyDetailTools } from './property-detail-tools';
import { registerFilterTools } from './filter-tools';
import { registerDealPipelineTools } from './deal-pipeline';
import { registerCrmTools } from './crm-tools';
import { registerSkipTraceTools } from './skip-trace-tools';
import { registerNotificationTools } from './notification-tools';
import { registerHeatMappingTools } from './heat-mapping';
import { registerMarketAnalysisTools } from './market-analysis';
import { registerDashboardAnalyticsTools } from './dashboard-analytics';
import { registerPermitTools } from './permit-tools';
import { registerContractorTools } from './contractor-tools';
import { registerVerticalTools } from './vertical-tools';
import { registerUtilityTools } from './utility-tools';

// New AI Tools Expansion (30 tools across 10 categories)
import { registerBatchTools } from './batch-tools';
import { registerDocumentTools } from './document-tools';
import { registerAutomationTools } from './automation-tools';
import { registerPredictiveTools } from './predictive-tools';
import { registerIntelligenceTools } from './intelligence-tools';
import { registerCommunicationTools } from './communication-tools';
import { registerPortfolioTools } from './portfolio-tools';
import { registerAdvancedSearchTools } from './advanced-search-tools';
import { registerIntegrationTools } from './integration-tools';
import { registerMapTools } from './map-tools';

/**
 * Register all tool categories
 */
export function registerAllTools(): void {
  console.log('[Tool Categories] Registering all tools...');

  // Core tools
  registerPropertySearchTools();
  registerDealAnalysisTools();
  registerBuyerManagementTools();
  registerSearchTools();
  registerPropertyDetailTools();
  registerFilterTools();
  registerDealPipelineTools();
  registerCrmTools();
  registerSkipTraceTools();
  registerNotificationTools();
  registerHeatMappingTools();
  registerMarketAnalysisTools();
  registerDashboardAnalyticsTools();
  registerPermitTools();
  registerContractorTools();
  registerVerticalTools();
  registerUtilityTools();

  // New AI Tools Expansion (30 tools)
  registerBatchTools();
  registerDocumentTools();
  registerAutomationTools();
  registerPredictiveTools();
  registerIntelligenceTools();
  registerCommunicationTools();
  registerPortfolioTools();
  registerAdvancedSearchTools();
  registerIntegrationTools();
  registerMapTools();

  console.log('[Tool Categories] All tools registered (47 categories)');
}

// Core tool exports
export { registerPropertySearchTools } from './property-search';
export { registerDealAnalysisTools } from './deal-analysis';
export { registerBuyerManagementTools } from './buyer-management';
export { registerSearchTools } from './search-tools';
export { registerPropertyDetailTools } from './property-detail-tools';
export { registerFilterTools } from './filter-tools';
export { registerDealPipelineTools } from './deal-pipeline';
export { registerCrmTools } from './crm-tools';
export { registerSkipTraceTools } from './skip-trace-tools';
export { registerNotificationTools } from './notification-tools';
export { registerHeatMappingTools } from './heat-mapping';
export { registerMarketAnalysisTools } from './market-analysis';
export { registerDashboardAnalyticsTools } from './dashboard-analytics';
export { registerPermitTools } from './permit-tools';
export { registerContractorTools } from './contractor-tools';
export { registerVerticalTools } from './vertical-tools';
export { registerUtilityTools } from './utility-tools';

// New AI Tools Expansion exports
export { registerBatchTools, batchTools } from './batch-tools';
export { registerDocumentTools, documentTools } from './document-tools';
export { registerAutomationTools, automationTools } from './automation-tools';
export { registerPredictiveTools, predictiveTools } from './predictive-tools';
export { registerIntelligenceTools, intelligenceTools } from './intelligence-tools';
export { registerCommunicationTools, communicationTools } from './communication-tools';
export { registerPortfolioTools, portfolioTools } from './portfolio-tools';
export { registerAdvancedSearchTools, advancedSearchTools } from './advanced-search-tools';
export { registerIntegrationTools, integrationTools } from './integration-tools';
export { registerMapTools, mapTools } from './map-tools';
