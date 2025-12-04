/**
 * Vertical Types
 * Business vertical definitions and configurations
 */

// ============================================
// Types
// ============================================

export const BUSINESS_VERTICALS = [
  'wholesaling',
  'roofing',
  'hvac',
  'electrical',
  'plumbing',
  'solar',
] as const;

export type BusinessVertical = (typeof BUSINESS_VERTICALS)[number];

export interface VerticalConfig {
  id: BusinessVertical;
  name: string;
  description: string;
  icon: string;
  color: string;
  defaultFilters: string[];
  primaryColumns: string[];
  heatMapLayers: string[];
  aiSystemPromptAddition: string;
}

// ============================================
// Vertical Configurations
// ============================================

export const VERTICAL_CONFIGS: Record<BusinessVertical, VerticalConfig> = {
  wholesaling: {
    id: 'wholesaling',
    name: 'Real Estate Wholesaling',
    description: 'Find motivated sellers and wholesale deals',
    icon: '🏠',
    color: '#3B82F6',
    defaultFilters: ['absentee-owner', 'high-equity', 'tired-landlord'],
    primaryColumns: ['equity_percent', 'owner_type', 'motivation_score', 'last_sale_date'],
    heatMapLayers: ['vitality', 'property_values', 'rent_growth'],
    aiSystemPromptAddition:
      'Focus on deal analysis, seller motivation indicators, ARV calculations, and exit strategies (wholesale, flip, or hold).',
  },
  roofing: {
    id: 'roofing',
    name: 'Roofing',
    description: 'Find homeowners needing roof replacement',
    icon: '🏗️',
    color: '#EF4444',
    defaultFilters: ['roof-replacement-due', 'solar-ready-new-roof'],
    primaryColumns: ['last_roofing_permit', 'year_built', 'property_value', 'owner_occupied'],
    heatMapLayers: ['renovation_wave', 'property_values'],
    aiSystemPromptAddition:
      'Focus on roof age estimation, replacement timing, insurance claim opportunities, and solar upsell potential.',
  },
  hvac: {
    id: 'hvac',
    name: 'HVAC',
    description: 'Find homeowners needing HVAC services',
    icon: '❄️',
    color: '#06B6D4',
    defaultFilters: ['hvac-replacement-due', 'heat-pump-candidate'],
    primaryColumns: ['last_hvac_permit', 'year_built', 'square_footage', 'owner_occupied'],
    heatMapLayers: ['electrification', 'renovation_wave'],
    aiSystemPromptAddition:
      'Focus on system age assessment, sizing requirements, efficiency upgrade opportunities, and heat pump conversion potential.',
  },
  electrical: {
    id: 'electrical',
    name: 'Electrical',
    description: 'Find homeowners needing electrical work',
    icon: '⚡',
    color: '#F59E0B',
    defaultFilters: ['panel-upgrade-candidate', 'ev-charger-ready', 'aging-electrical'],
    primaryColumns: ['last_electrical_permit', 'year_built', 'property_value', 'has_solar'],
    heatMapLayers: ['electrification', 'property_values'],
    aiSystemPromptAddition:
      'Focus on panel capacity assessment, EV charger installation requirements, code compliance, and safety upgrades.',
  },
  plumbing: {
    id: 'plumbing',
    name: 'Plumbing',
    description: 'Find homeowners needing plumbing services',
    icon: '🔧',
    color: '#10B981',
    defaultFilters: ['water-heater-replacement', 'repiping-candidate'],
    primaryColumns: ['last_plumbing_permit', 'year_built', 'bathrooms', 'owner_occupied'],
    heatMapLayers: ['renovation_wave', 'property_values'],
    aiSystemPromptAddition:
      'Focus on pipe material assessment, water heater age, repiping needs, and bathroom renovation opportunities.',
  },
  solar: {
    id: 'solar',
    name: 'Solar',
    description: 'Find homeowners ready for solar installation',
    icon: '☀️',
    color: '#8B5CF6',
    defaultFilters: ['prime-solar-candidate', 'electrification-journey'],
    primaryColumns: ['last_roofing_permit', 'has_ev_charger', 'has_heat_pump', 'square_footage'],
    heatMapLayers: ['electrification', 'property_values'],
    aiSystemPromptAddition:
      'Focus on roof suitability, energy usage estimation, ROI calculations, and battery storage opportunities.',
  },
};

// ============================================
// Helper Functions
// ============================================

export function isValidVertical(value: string): value is BusinessVertical {
  return ['wholesaling', 'roofing', 'hvac', 'electrical', 'plumbing', 'solar'].includes(value);
}

export function getVerticalConfig(vertical: BusinessVertical): VerticalConfig {
  return VERTICAL_CONFIGS[vertical];
}

export function getAllVerticals(): VerticalConfig[] {
  return Object.values(VERTICAL_CONFIGS);
}

export function getVerticalById(id: string): VerticalConfig | undefined {
  if (isValidVertical(id)) {
    return VERTICAL_CONFIGS[id];
  }
  return undefined;
}

