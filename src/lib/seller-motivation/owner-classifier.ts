/**
 * Owner Classification System
 *
 * Classifies property owners into primary categories and sub-classes
 * using pattern matching on owner names and property characteristics.
 */

import type {
  OwnerClassification,
  OwnerPrimaryClass,
  OwnerSubClass,
  IndividualSubClass,
  InvestorSubClass,
  InstitutionalSubClass,
} from './types';

// ============================================================================
// Entity Pattern Definitions
// ============================================================================

/**
 * Pattern configuration for entity detection
 */
interface EntityPattern {
  pattern: RegExp;
  primaryClass: OwnerPrimaryClass;
  subClass: OwnerSubClass;
  confidence: number;  // Base confidence for this pattern match
  name: string;        // Human-readable pattern name
}

/**
 * Bank/REO patterns - catches major banks and financial institutions
 */
const bankPatterns: EntityPattern[] = [
  // Major banks
  { pattern: /\b(BANK\s+OF\s+AMERICA|BOA)\b/i, primaryClass: 'institutional_distressed', subClass: 'bank_reo', confidence: 0.95, name: 'Bank of America' },
  { pattern: /\bWELLS\s+FARGO\b/i, primaryClass: 'institutional_distressed', subClass: 'bank_reo', confidence: 0.95, name: 'Wells Fargo' },
  { pattern: /\bJPMORGAN|JP\s+MORGAN|CHASE\s+BANK\b/i, primaryClass: 'institutional_distressed', subClass: 'bank_reo', confidence: 0.95, name: 'JPMorgan Chase' },
  { pattern: /\bCITIBANK|CITIGROUP|CITI\s+MORTGAGE\b/i, primaryClass: 'institutional_distressed', subClass: 'bank_reo', confidence: 0.95, name: 'Citibank' },
  { pattern: /\bUS\s+BANK|U\.?S\.?\s+BANK\b/i, primaryClass: 'institutional_distressed', subClass: 'bank_reo', confidence: 0.95, name: 'US Bank' },
  { pattern: /\bPNC\s+BANK\b/i, primaryClass: 'institutional_distressed', subClass: 'bank_reo', confidence: 0.95, name: 'PNC Bank' },
  { pattern: /\bTRUST\s*BANK|TRUSTMARK\b/i, primaryClass: 'institutional_distressed', subClass: 'bank_reo', confidence: 0.90, name: 'Trust Bank' },

  // Mortgage servicers and lenders
  { pattern: /\bNATIONSTAR|MR\.?\s*COOPER\b/i, primaryClass: 'institutional_distressed', subClass: 'bank_reo', confidence: 0.90, name: 'Mr. Cooper/Nationstar' },
  { pattern: /\bOCWEN|PHH\s+MORTGAGE\b/i, primaryClass: 'institutional_distressed', subClass: 'bank_reo', confidence: 0.90, name: 'Ocwen/PHH' },
  { pattern: /\bSELENE\s+FINANCE\b/i, primaryClass: 'institutional_distressed', subClass: 'bank_reo', confidence: 0.90, name: 'Selene Finance' },
  { pattern: /\bCARRINGTON\s+MORTGAGE\b/i, primaryClass: 'institutional_distressed', subClass: 'bank_reo', confidence: 0.90, name: 'Carrington' },
  { pattern: /\bDITECH\b/i, primaryClass: 'institutional_distressed', subClass: 'bank_reo', confidence: 0.90, name: 'Ditech' },

  // Generic bank patterns (lower confidence)
  { pattern: /\bBANK\s+N\.?A\.?\b/i, primaryClass: 'institutional_distressed', subClass: 'bank_reo', confidence: 0.85, name: 'Generic Bank NA' },
  { pattern: /\b(FEDERAL\s+)?SAVINGS\s+(BANK|ASSOC)/i, primaryClass: 'institutional_distressed', subClass: 'bank_reo', confidence: 0.85, name: 'Savings Bank' },
  { pattern: /\bCREDIT\s+UNION\b/i, primaryClass: 'institutional_distressed', subClass: 'bank_reo', confidence: 0.80, name: 'Credit Union' },
  { pattern: /\bMORTGAGE\s+(CORP|COMPANY|CO\.?|INC)\b/i, primaryClass: 'institutional_distressed', subClass: 'bank_reo', confidence: 0.75, name: 'Mortgage Company' },
];

/**
 * Government patterns - federal, state, and local agencies
 */
const governmentPatterns: EntityPattern[] = [
  // Federal agencies
  { pattern: /\b(HUD|HOUSING\s+AND\s+URBAN\s+DEVELOPMENT)\b/i, primaryClass: 'institutional_distressed', subClass: 'government_federal', confidence: 0.95, name: 'HUD' },
  { pattern: /\b(VA|VETERANS?\s+AFFAIRS?|VETERANS?\s+ADMIN)\b/i, primaryClass: 'institutional_distressed', subClass: 'government_federal', confidence: 0.95, name: 'VA' },
  { pattern: /\b(FHA|FEDERAL\s+HOUSING)\b/i, primaryClass: 'institutional_distressed', subClass: 'government_federal', confidence: 0.95, name: 'FHA' },
  { pattern: /\bFANNIE\s+MAE|FNMA\b/i, primaryClass: 'institutional_distressed', subClass: 'government_federal', confidence: 0.95, name: 'Fannie Mae' },
  { pattern: /\bFREDDIE\s+MAC|FHLMC\b/i, primaryClass: 'institutional_distressed', subClass: 'government_federal', confidence: 0.95, name: 'Freddie Mac' },
  { pattern: /\bUNITED\s+STATES\s+(OF\s+AMERICA\s+)?GOVERNMENT\b/i, primaryClass: 'institutional_distressed', subClass: 'government_federal', confidence: 0.95, name: 'US Government' },

  // State agencies
  { pattern: /\bSTATE\s+OF\s+\w+/i, primaryClass: 'institutional_distressed', subClass: 'government_state', confidence: 0.85, name: 'State Government' },
  { pattern: /\b\w+\s+STATE\s+(HOUSING|DEVELOPMENT|FINANCE)\b/i, primaryClass: 'institutional_distressed', subClass: 'government_state', confidence: 0.85, name: 'State Housing Agency' },

  // Local agencies
  { pattern: /\bCOUNTY\s+OF\s+\w+/i, primaryClass: 'institutional_distressed', subClass: 'government_local', confidence: 0.85, name: 'County Government' },
  { pattern: /\bCITY\s+OF\s+\w+/i, primaryClass: 'institutional_distressed', subClass: 'government_local', confidence: 0.85, name: 'City Government' },
  { pattern: /\b(HOUSING|REDEVELOPMENT)\s+AUTHORITY\b/i, primaryClass: 'institutional_distressed', subClass: 'government_local', confidence: 0.80, name: 'Housing Authority' },
  { pattern: /\bMUNICIPAL(ITY)?\b/i, primaryClass: 'institutional_distressed', subClass: 'government_local', confidence: 0.75, name: 'Municipality' },
];

/**
 * Trust patterns - living trusts, irrevocable trusts, estate trusts
 */
const trustPatterns: EntityPattern[] = [
  // Revocable/Living trusts (usually investor or individual)
  { pattern: /\b(REVOCABLE|LIVING|FAMILY)\s+TRUST\b/i, primaryClass: 'investor_entity', subClass: 'trust_living', confidence: 0.85, name: 'Living Trust' },
  { pattern: /\b\w+\s+(REVOCABLE|LIVING)\s+TRUST\b/i, primaryClass: 'investor_entity', subClass: 'trust_living', confidence: 0.85, name: 'Named Living Trust' },

  // Irrevocable trusts
  { pattern: /\bIRREVOCABLE\s+TRUST\b/i, primaryClass: 'investor_entity', subClass: 'trust_irrevocable', confidence: 0.85, name: 'Irrevocable Trust' },

  // Estate/probate related trusts (distressed category)
  { pattern: /\bESTATE\s+OF\s+\w+/i, primaryClass: 'institutional_distressed', subClass: 'estate_probate', confidence: 0.90, name: 'Estate Of' },
  { pattern: /\bTRUST\s+(UNDER\s+)?WILL\b/i, primaryClass: 'institutional_distressed', subClass: 'estate_probate', confidence: 0.85, name: 'Trust Under Will' },
  { pattern: /\bTESTAMENTARY\s+TRUST\b/i, primaryClass: 'institutional_distressed', subClass: 'estate_probate', confidence: 0.85, name: 'Testamentary Trust' },
  { pattern: /\bDECEASED\b/i, primaryClass: 'institutional_distressed', subClass: 'estate_probate', confidence: 0.90, name: 'Deceased Owner' },

  // Executor sales
  { pattern: /\bEXECUTOR|EXECUTRIX\b/i, primaryClass: 'institutional_distressed', subClass: 'estate_executor', confidence: 0.90, name: 'Executor' },
  { pattern: /\bPERSONAL\s+REP(RESENTATIVE)?\b/i, primaryClass: 'institutional_distressed', subClass: 'estate_executor', confidence: 0.85, name: 'Personal Representative' },
  { pattern: /\bADMINISTRATOR|ADMINISTRATRIX\b/i, primaryClass: 'institutional_distressed', subClass: 'estate_executor', confidence: 0.85, name: 'Administrator' },

  // Generic trust pattern (lower confidence - could be living or irrevocable)
  { pattern: /\bTRUST(EE)?\s*$/i, primaryClass: 'investor_entity', subClass: 'trust_living', confidence: 0.70, name: 'Generic Trust' },
  { pattern: /\b\w+\s+TRUST\b/i, primaryClass: 'investor_entity', subClass: 'trust_living', confidence: 0.65, name: 'Named Trust' },
];

/**
 * LLC/Corporate patterns
 */
const llcCorporatePatterns: EntityPattern[] = [
  // LLCs
  { pattern: /\bL\.?L\.?C\.?\s*$/i, primaryClass: 'investor_entity', subClass: 'llc_single', confidence: 0.85, name: 'LLC Suffix' },
  { pattern: /\bLIMITED\s+LIABILITY\s+(COMPANY|CO\.?)\b/i, primaryClass: 'investor_entity', subClass: 'llc_single', confidence: 0.85, name: 'LLC Full' },

  // Corporations
  { pattern: /\bINC\.?\s*$/i, primaryClass: 'investor_entity', subClass: 'corporate', confidence: 0.80, name: 'Inc Suffix' },
  { pattern: /\bCORP\.?\s*$/i, primaryClass: 'investor_entity', subClass: 'corporate', confidence: 0.80, name: 'Corp Suffix' },
  { pattern: /\bCORPORATION\s*$/i, primaryClass: 'investor_entity', subClass: 'corporate', confidence: 0.80, name: 'Corporation' },
  { pattern: /\bCOMPANY|CO\.?\s*$/i, primaryClass: 'investor_entity', subClass: 'corporate', confidence: 0.70, name: 'Company' },

  // Limited partnerships
  { pattern: /\bL\.?P\.?\s*$/i, primaryClass: 'investor_entity', subClass: 'corporate', confidence: 0.75, name: 'LP Suffix' },
  { pattern: /\bLIMITED\s+PARTNERSHIP\b/i, primaryClass: 'investor_entity', subClass: 'corporate', confidence: 0.75, name: 'Limited Partnership' },
];

/**
 * Investor indicator patterns (not definitive, adds confidence to investor classification)
 */
const investorIndicatorPatterns: EntityPattern[] = [
  { pattern: /\bPROPERT(Y|IES)\s*(INVEST|MGMT|MANAGEMENT)\b/i, primaryClass: 'investor_entity', subClass: 'portfolio_investor', confidence: 0.90, name: 'Property Investment' },
  { pattern: /\bREAL\s*(TY|ESTATE)\s*(INVEST|HOLDINGS)\b/i, primaryClass: 'investor_entity', subClass: 'portfolio_investor', confidence: 0.90, name: 'Real Estate Investment' },
  { pattern: /\bHOLDINGS?\b/i, primaryClass: 'investor_entity', subClass: 'portfolio_investor', confidence: 0.70, name: 'Holdings' },
  { pattern: /\bVENTURES?\b/i, primaryClass: 'investor_entity', subClass: 'portfolio_investor', confidence: 0.65, name: 'Ventures' },
  { pattern: /\bCAPITAL\b/i, primaryClass: 'investor_entity', subClass: 'portfolio_investor', confidence: 0.65, name: 'Capital' },
  { pattern: /\bINVESTMENTS?\b/i, primaryClass: 'investor_entity', subClass: 'portfolio_investor', confidence: 0.70, name: 'Investments' },
  { pattern: /\bRENTALS?\b/i, primaryClass: 'investor_entity', subClass: 'small_investor', confidence: 0.75, name: 'Rentals' },
  { pattern: /\bGROUP\b/i, primaryClass: 'investor_entity', subClass: 'portfolio_investor', confidence: 0.60, name: 'Group' },
  { pattern: /\bENTERPRISES?\b/i, primaryClass: 'investor_entity', subClass: 'portfolio_investor', confidence: 0.60, name: 'Enterprises' },
  { pattern: /\bACQUISITIONS?\b/i, primaryClass: 'investor_entity', subClass: 'portfolio_investor', confidence: 0.70, name: 'Acquisitions' },
];

/**
 * Tax lien patterns
 */
const taxLienPatterns: EntityPattern[] = [
  { pattern: /\bTAX\s+(LIEN|SALE|DEED)\b/i, primaryClass: 'institutional_distressed', subClass: 'tax_lien', confidence: 0.90, name: 'Tax Lien/Sale' },
  { pattern: /\bTAX\s+COLLECTOR\b/i, primaryClass: 'institutional_distressed', subClass: 'tax_lien', confidence: 0.90, name: 'Tax Collector' },
  { pattern: /\bTREASURER\s+(OF|FOR)\b/i, primaryClass: 'institutional_distressed', subClass: 'tax_lien', confidence: 0.80, name: 'Treasurer' },
];

// Combine all patterns in priority order (more specific first)
const allPatterns: EntityPattern[] = [
  ...bankPatterns,
  ...governmentPatterns,
  ...taxLienPatterns,
  ...trustPatterns,           // Trusts before LLC (some trusts have LLC in name)
  ...llcCorporatePatterns,
  ...investorIndicatorPatterns,
];

// ============================================================================
// Classification Functions
// ============================================================================

/**
 * Classify an owner based on their name and optional additional signals
 */
export function classifyOwner(
  ownerName: string,
  options?: {
    ownerType?: string;           // From RentCast: Individual, Company, Bank, Trust, etc.
    ownerOccupied?: boolean;
    mailingState?: string;        // Owner mailing state
    propertyState?: string;       // Property state
    portfolioSize?: number;       // Known portfolio size
  }
): OwnerClassification {
  const normalizedName = ownerName.trim().toUpperCase();
  const matchedPatterns: string[] = [];
  let bestMatch: EntityPattern | null = null;
  let bestConfidence = 0;

  // Check all patterns
  for (const pattern of allPatterns) {
    if (pattern.pattern.test(normalizedName)) {
      matchedPatterns.push(pattern.name);

      // Track best match
      if (pattern.confidence > bestConfidence) {
        bestMatch = pattern;
        bestConfidence = pattern.confidence;
      }
    }
  }

  // If we have a pattern match, use it
  if (bestMatch) {
    const classification = applyClassificationAdjustments(bestMatch, options);
    return {
      ...classification,
      matchedPatterns,
      rawOwnerName: ownerName,
    };
  }

  // No pattern match - classify as individual
  return classifyAsIndividual(ownerName, options);
}

/**
 * Apply adjustments based on additional signals
 */
function applyClassificationAdjustments(
  baseMatch: EntityPattern,
  options?: {
    ownerType?: string;
    ownerOccupied?: boolean;
    mailingState?: string;
    propertyState?: string;
    portfolioSize?: number;
  }
): Omit<OwnerClassification, 'matchedPatterns' | 'rawOwnerName'> {
  let { primaryClass, subClass, confidence } = baseMatch;

  // Adjust for portfolio size (upgrade small investor to portfolio investor)
  if (primaryClass === 'investor_entity' && options?.portfolioSize) {
    if (options.portfolioSize >= 5) {
      subClass = 'portfolio_investor' as InvestorSubClass;
      confidence = Math.min(0.95, confidence + 0.1);
    } else if (options.portfolioSize > 1 && subClass === 'llc_single') {
      subClass = 'llc_multi' as InvestorSubClass;
      confidence = Math.min(0.95, confidence + 0.05);
    }
  }

  // Adjust for RentCast owner type
  if (options?.ownerType) {
    const ownerType = options.ownerType.toLowerCase();

    if (ownerType === 'bank' && primaryClass !== 'institutional_distressed') {
      // RentCast says bank but patterns didn't catch it
      primaryClass = 'institutional_distressed';
      subClass = 'bank_reo';
      confidence = 0.90;
    } else if (ownerType === 'trust' && primaryClass !== 'investor_entity' && primaryClass !== 'institutional_distressed') {
      // RentCast says trust
      primaryClass = 'investor_entity';
      subClass = 'trust_living';
      confidence = 0.80;
    } else if (ownerType === 'government' && primaryClass !== 'institutional_distressed') {
      primaryClass = 'institutional_distressed';
      subClass = 'government_local';
      confidence = 0.85;
    }
  }

  return { primaryClass, subClass, confidence };
}

/**
 * Classify as individual owner with sub-classification
 */
function classifyAsIndividual(
  ownerName: string,
  options?: {
    ownerType?: string;
    ownerOccupied?: boolean;
    mailingState?: string;
    propertyState?: string;
    portfolioSize?: number;
  }
): OwnerClassification {
  let subClass: IndividualSubClass = 'unknown';
  let confidence = 0.70;  // Base confidence for individual

  // Check for investor indicators in name (even for individuals)
  const looksLikeInvestorName =
    /\bPROPERT|INVEST|RENTAL|HOLDING/i.test(ownerName);

  if (looksLikeInvestorName) {
    // This might be an individual investor using their name + property in title
    return {
      primaryClass: 'investor_entity',
      subClass: 'small_investor',
      confidence: 0.60,
      matchedPatterns: ['Investor Name Pattern'],
      rawOwnerName: ownerName,
    };
  }

  // Determine sub-class based on occupancy and mailing address
  if (options?.ownerOccupied === true) {
    subClass = 'owner_occupied';
    confidence = 0.85;
  } else if (options?.ownerOccupied === false) {
    subClass = 'absentee';
    confidence = 0.85;

    // Check for out-of-state
    if (
      options.mailingState &&
      options.propertyState &&
      options.mailingState.toUpperCase() !== options.propertyState.toUpperCase()
    ) {
      subClass = 'out_of_state';
      confidence = 0.90;
    }
  }

  // Check for inherited indicators in name
  if (/\bET\s+AL\b|\bHEIRS?\b|\b(AND|&)\s+OTHERS?\b/i.test(ownerName)) {
    subClass = 'inherited';
    confidence = 0.75;
  }

  return {
    primaryClass: 'individual',
    subClass,
    confidence,
    matchedPatterns: [],
    rawOwnerName: ownerName,
  };
}

/**
 * Quick check if owner name looks like an entity (not individual)
 */
export function isLikelyEntity(ownerName: string): boolean {
  const normalizedName = ownerName.trim().toUpperCase();

  // Check for any entity pattern match
  for (const pattern of allPatterns) {
    if (pattern.pattern.test(normalizedName)) {
      return true;
    }
  }

  return false;
}

/**
 * Get all patterns that match an owner name (for debugging/transparency)
 */
export function getMatchingPatterns(ownerName: string): string[] {
  const normalizedName = ownerName.trim().toUpperCase();
  const matches: string[] = [];

  for (const pattern of allPatterns) {
    if (pattern.pattern.test(normalizedName)) {
      matches.push(`${pattern.name} (${pattern.primaryClass}/${pattern.subClass}) [${pattern.confidence}]`);
    }
  }

  return matches;
}

/**
 * Export patterns for testing
 */
export const entityPatterns = {
  bank: bankPatterns,
  government: governmentPatterns,
  trust: trustPatterns,
  llcCorporate: llcCorporatePatterns,
  investorIndicator: investorIndicatorPatterns,
  taxLien: taxLienPatterns,
};
