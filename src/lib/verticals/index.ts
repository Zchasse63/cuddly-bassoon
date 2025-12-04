/**
 * Verticals Module
 * Barrel export for vertical selection system
 */

// Types
export {
  type BusinessVertical,
  type VerticalConfig,
  VERTICAL_CONFIGS,
  isValidVertical,
  getVerticalConfig,
  getAllVerticals,
  getVerticalById,
} from './types';

// Service
export {
  getUserVertical,
  setUserVertical,
  getUserEnabledVerticals,
  setUserEnabledVerticals,
  getDefaultFiltersForVertical,
  getPrimaryColumnsForVertical,
  getHeatMapLayersForVertical,
  getAIPromptForVertical,
  getFiltersForVertical,
} from './vertical-service';

