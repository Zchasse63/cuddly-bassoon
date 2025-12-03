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

  console.log('[Tool Categories] All tools registered');
}

export { registerPropertySearchTools } from './property-search';
export { registerDealAnalysisTools } from './deal-analysis';
export { registerBuyerManagementTools } from './buyer-management';
export { registerSearchTools } from './search-tools';
export { registerPropertyDetailTools } from './property-detail-tools';
export { registerFilterTools } from './filter-tools';
