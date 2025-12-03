/**
 * Enhanced Filters Index
 * Exports all 5 enhanced property filters
 */

export { applyNewAbsenteeFilter } from './new-absentee';
export type { NewAbsenteeParams } from './new-absentee';

export { applyDistantOwnerFilter } from './distant-owner';
export type { DistantOwnerParams } from './distant-owner';

export { applyMultiPropertyFilter } from './multi-property';
export type { MultiPropertyParams, PropertyWithPortfolio } from './multi-property';

export { applyEquitySweetSpotFilter } from './equity-sweet-spot';
export type { EquitySweetSpotParams } from './equity-sweet-spot';

export { applyAccidentalLandlordFilter } from './accidental-landlord';
export type { AccidentalLandlordParams, PropertyWithHistory } from './accidental-landlord';

