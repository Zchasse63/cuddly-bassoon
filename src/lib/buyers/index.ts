/**
 * Buyer Intelligence Module
 * Central export for buyer management functionality
 */

// Types - export from types.ts (primary source)
export type {
  BuyerType,
  BuyerStatus,
  BuyerTier,
  ConditionTolerance,
  TransactionType,
  QualificationStage,
  Buyer,
  BuyerPreferences,
  BuyerTransaction,
  BuyerWithDetails,
  CreateBuyerInput,
  UpdateBuyerInput,
  BuyerListFilters,
  BuyerScoreFactors,
  BuyerMatchResult,
} from './types';

// Validation schemas (not types - those come from types.ts)
export {
  buyerTypeSchema,
  buyerStatusSchema,
  buyerTierSchema,
  conditionToleranceSchema,
  transactionTypeSchema,
  qualificationStageSchema,
  createBuyerSchema,
  updateBuyerSchema,
  marketSchema,
  preferencesSchema,
  transactionSchema,
  buyerListFiltersSchema,
} from './validation';
export type { PreferencesInput, TransactionInput, BuyerListFiltersInput } from './validation';

// Services
export { BuyerService } from './buyer-service';
export { PreferencesService } from './preferences-service';
export { QualificationService, getQualificationStages, QUALIFICATION_STAGES } from './qualification';
export { TransactionService } from './transaction-service';
export type { CreateTransactionInput, TransactionAnalysis } from './transaction-service';
export { calculateBuyerScore, getTierDescription, getTierColor } from './scoring';
export type { ScoringInput, ScoringResult } from './scoring';
export { MatchingEngine } from './matching';
export type { PropertyForMatching, MatchCriteria, MatchFactor } from './matching';
export { CommunicationService } from './communication-service';
export type { Message, MessageChannel, MessageDirection, MessageStatus, CommunicationStats, SendMessageInput } from './communication-service';
