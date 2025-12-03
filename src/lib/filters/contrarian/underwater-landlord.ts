/**
 * Underwater Landlord Filter
 * Identifies rental properties with negative cash flow
 * Rent does not cover PITI (Principal, Interest, Taxes, Insurance)
 */

import type { PropertyData, FilterMatch } from '../types';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UnderwaterLandlordParams {
  // No configurable parameters
}

/**
 * Extended property data with rental and expense information
 */
export interface PropertyWithRentalData extends PropertyData {
  monthlyRent?: number;
  monthlyMortgagePayment?: number;
  monthlyPropertyTax?: number;
  monthlyInsurance?: number;
  monthlyHOA?: number;
  // Combined PITI if individual components not available
  monthlyPITI?: number;
}

/**
 * Estimate monthly property tax from annual amount
 */
function estimateMonthlyTax(annualTax: number | null | undefined): number {
  if (!annualTax) return 0;
  return annualTax / 12;
}

/**
 * Estimate monthly mortgage from balance and rate (rough approximation)
 * Assumes 30-year mortgage at estimated rate
 */
function estimateMonthlyMortgage(
  balance: number | null | undefined,
  annualRate: number = 0.07
): number {
  if (!balance || balance <= 0) return 0;

  const monthlyRate = annualRate / 12;
  const payments = 360; // 30 years

  // Standard mortgage payment formula
  const payment =
    (balance * (monthlyRate * Math.pow(1 + monthlyRate, payments))) /
    (Math.pow(1 + monthlyRate, payments) - 1);

  return payment;
}

/**
 * Check if property has negative cash flow
 */
export function applyUnderwaterLandlordFilter(
  property: PropertyWithRentalData,
  _params: UnderwaterLandlordParams = {}
): FilterMatch {
  // Get monthly rent (actual or estimated)
  const monthlyRent = property.monthlyRent || property.rentEstimate || 0;

  if (!monthlyRent) {
    return {
      filterId: 'underwater_landlord',
      matched: false,
      score: 0,
      reason: 'Rent estimate not available',
    };
  }

  // Calculate or get PITI
  let monthlyExpenses = 0;

  if (property.monthlyPITI) {
    monthlyExpenses = property.monthlyPITI;
  } else {
    // Build from components
    const mortgage =
      property.monthlyMortgagePayment || estimateMonthlyMortgage(property.mortgageBalance);
    const tax = property.monthlyPropertyTax || estimateMonthlyTax(property.taxAmount);
    const insurance = property.monthlyInsurance || 0;
    const hoa = property.monthlyHOA || 0;

    monthlyExpenses = mortgage + tax + insurance + hoa;

    // If we only have mortgage estimate, add rough insurance estimate
    if (!property.monthlyInsurance && mortgage > 0) {
      monthlyExpenses += ((property.estimatedValue || 0) * 0.005) / 12; // ~0.5% annual
    }
  }

  if (monthlyExpenses <= 0) {
    return {
      filterId: 'underwater_landlord',
      matched: false,
      score: 0,
      reason: 'Unable to estimate monthly expenses (missing mortgage/tax data)',
    };
  }

  // Calculate cash flow
  const monthlyCashFlow = monthlyRent - monthlyExpenses;
  const cashFlowRatio = monthlyRent / monthlyExpenses;

  if (monthlyCashFlow < 0) {
    // Deeper underwater = higher score
    const underwaterPercent = Math.abs(monthlyCashFlow / monthlyExpenses) * 100;
    const score = Math.min(100, 70 + underwaterPercent);

    return {
      filterId: 'underwater_landlord',
      matched: true,
      score: Math.round(score),
      reason: `Negative cash flow of $${Math.abs(monthlyCashFlow).toFixed(0)}/month (rent $${monthlyRent.toFixed(0)} vs expenses $${monthlyExpenses.toFixed(0)})`,
      data: {
        monthlyRent,
        monthlyExpenses,
        monthlyCashFlow,
        cashFlowRatio,
        isEstimate: !property.monthlyPITI,
      },
    };
  }

  return {
    filterId: 'underwater_landlord',
    matched: false,
    score: 0,
    reason: `Positive cash flow of $${monthlyCashFlow.toFixed(0)}/month`,
    data: {
      monthlyRent,
      monthlyExpenses,
      monthlyCashFlow,
    },
  };
}
