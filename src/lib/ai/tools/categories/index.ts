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

/**
 * Register all tool categories
 */
export function registerAllTools(): void {
  console.log('[Tool Categories] Registering all tools...');

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

  console.log('[Tool Categories] All tools registered');
}

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
