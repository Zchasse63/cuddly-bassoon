/**
 * Home Services Filters
 * Filters for identifying home service opportunities by vertical
 */

// Roofing
export {
  applyAgingRoofFilter,
  applyStormDamageFilter,
  applyNoReroofHistoryFilter,
  type AgingRoofParams,
  type StormDamageParams,
  type NoReroofHistoryParams,
} from './roofing';

// HVAC
export {
  applyHvacReplacementDueFilter,
  applyHeatPumpCandidateFilter,
  applyNoHvacHistoryFilter,
  type HvacReplacementDueParams,
  type HeatPumpCandidateParams,
  type NoHvacHistoryParams,
} from './hvac';

// Electrical
export {
  applyPanelUpgradeCandidateFilter,
  applyEvChargerReadyFilter,
  applyNoElectricalUpgradesFilter,
  type PanelUpgradeCandidateParams,
  type EvChargerReadyParams,
  type NoElectricalUpgradesParams,
} from './electrical';

// Plumbing
export {
  applyRepipingCandidateFilter,
  applyWaterHeaterDueFilter,
  applyNoPlumbingPermitsFilter,
  type RepipingCandidateParams,
  type WaterHeaterDueParams,
  type NoPlumbingPermitsParams,
} from './plumbing';

// Solar
export {
  applySolarReadyFilter,
  applyBatteryUpgradeFilter,
  applyHighConsumptionAreaFilter,
  type SolarReadyParams,
  type BatteryUpgradeParams,
  type HighConsumptionAreaParams,
} from './solar';

// Filter groups by vertical
export const ROOFING_FILTER_IDS = ['aging_roof', 'storm_damage', 'no_reroof_history'] as const;
export const HVAC_FILTER_IDS = ['hvac_replacement_due', 'heat_pump_candidate', 'no_hvac_history'] as const;
export const ELECTRICAL_FILTER_IDS = ['panel_upgrade_candidate', 'ev_charger_ready', 'no_electrical_upgrades'] as const;
export const PLUMBING_FILTER_IDS = ['repiping_candidate', 'water_heater_due', 'no_plumbing_permits'] as const;
export const SOLAR_FILTER_IDS = ['solar_ready', 'battery_upgrade', 'high_consumption_area'] as const;

export const HOME_SERVICES_FILTER_IDS = [
  ...ROOFING_FILTER_IDS,
  ...HVAC_FILTER_IDS,
  ...ELECTRICAL_FILTER_IDS,
  ...PLUMBING_FILTER_IDS,
  ...SOLAR_FILTER_IDS,
] as const;

