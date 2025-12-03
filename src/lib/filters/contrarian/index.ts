/**
 * Contrarian Filters Index
 * Exports all 10 contrarian property filters
 */

export { applyAlmostSoldFilter } from './almost-sold';
export type { AlmostSoldParams, PropertyWithTransactionHistory } from './almost-sold';

export { applyShrinkingLandlordFilter } from './shrinking-landlord';
export type { ShrinkingLandlordParams, PropertyWithPortfolioHistory } from './shrinking-landlord';

export { applyUnderwaterLandlordFilter } from './underwater-landlord';
export type { UnderwaterLandlordParams, PropertyWithRentalData } from './underwater-landlord';

export { applyTaxSqueezeFilter } from './tax-squeeze';
export type { TaxSqueezeParams, PropertyWithTaxHistory } from './tax-squeeze';

export { applyQuietEquityFilter } from './quiet-equity';
export type { QuietEquityParams, PropertyWithRefinanceHistory } from './quiet-equity';

export { applyNegativeMomentumFilter } from './negative-momentum';
export type { NegativeMomentumParams, PropertyWithValueHistory } from './negative-momentum';

export { applyFSBOFatigueFilter } from './fsbo-fatigue';
export type { FSBOFatigueParams, PropertyWithFSBOData } from './fsbo-fatigue';

export { applyLifeStageFilter } from './life-stage';
export type { LifeStageParams, PropertyWithLifeStageData } from './life-stage';

export { applyOrphanPropertyFilter } from './orphan-property';
export type { OrphanPropertyParams, PropertyWithVacancyData } from './orphan-property';

export { applyCompetitorExitFilter } from './competitor-exit';
export type { CompetitorExitParams, PropertyWithTransactionData } from './competitor-exit';

