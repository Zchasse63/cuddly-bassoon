/**
 * Deal Stage Management
 * Handles stage transitions, validation, and requirements
 */

import { DealStage, StageTransitionResult } from './types';

// Stage configuration with metadata
export const DEAL_STAGES: Record<
  DealStage,
  {
    label: string;
    description: string;
    color: string;
    order: number;
  }
> = {
  lead: {
    label: 'Lead',
    description: 'New potential deal',
    color: 'bg-slate-500',
    order: 0,
  },
  contacted: {
    label: 'Contacted',
    description: 'Seller conversation started',
    color: 'bg-blue-500',
    order: 1,
  },
  appointment: {
    label: 'Appointment',
    description: 'Meeting scheduled',
    color: 'bg-cyan-500',
    order: 2,
  },
  offer: {
    label: 'Offer Made',
    description: 'Offer submitted',
    color: 'bg-purple-500',
    order: 3,
  },
  contract: {
    label: 'Under Contract',
    description: 'Contract signed',
    color: 'bg-amber-500',
    order: 4,
  },
  assigned: {
    label: 'Assigned',
    description: 'Buyer found',
    color: 'bg-indigo-500',
    order: 5,
  },
  closing: {
    label: 'Closing',
    description: 'In escrow',
    color: 'bg-orange-500',
    order: 6,
  },
  closed: {
    label: 'Closed',
    description: 'Deal completed',
    color: 'bg-green-500',
    order: 7,
  },
  lost: {
    label: 'Lost',
    description: 'Deal fell through',
    color: 'bg-red-500',
    order: 8,
  },
};

// Valid stage transitions (from -> to[])
export const VALID_TRANSITIONS: Record<DealStage, DealStage[]> = {
  lead: ['contacted', 'lost'],
  contacted: ['appointment', 'offer', 'lost'],
  appointment: ['offer', 'contacted', 'lost'],
  offer: ['contract', 'appointment', 'lost'],
  contract: ['assigned', 'closing', 'lost'],
  assigned: ['closing', 'contract', 'lost'],
  closing: ['closed', 'lost'],
  closed: [], // Terminal state
  lost: ['lead'], // Can reopen
};

// Stage requirements
export const STAGE_REQUIREMENTS: Record<DealStage, string[]> = {
  lead: [],
  contacted: ['Contact attempt made'],
  appointment: ['Meeting scheduled'],
  offer: ['Offer amount set'],
  contract: ['Contract price agreed'],
  assigned: ['Buyer assigned'],
  closing: ['Title work started'],
  closed: ['Funds disbursed'],
  lost: ['Lost reason provided'],
};

/**
 * Check if a stage transition is valid
 */
export function isValidTransition(from: DealStage, to: DealStage): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Get all stages in order
 */
export function getOrderedStages(): DealStage[] {
  return Object.entries(DEAL_STAGES)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([stage]) => stage as DealStage);
}

/**
 * Get active stages (excluding lost)
 */
export function getActiveStages(): DealStage[] {
  return getOrderedStages().filter((s) => s !== 'lost' && s !== 'closed');
}

/**
 * Validate stage transition with requirements check
 */
export function validateTransition(
  from: DealStage,
  to: DealStage,
  deal: {
    seller_phone?: string | null;
    offer_price?: number | null;
    contract_price?: number | null;
    assigned_buyer_id?: string | null;
    notes?: string | null;
  }
): StageTransitionResult {
  // Check if transition is valid
  if (!isValidTransition(from, to)) {
    return {
      success: false,
      previousStage: from,
      newStage: to,
      reason: `Cannot transition from ${DEAL_STAGES[from].label} to ${DEAL_STAGES[to].label}`,
    };
  }

  // Check specific requirements
  if (to === 'contacted' && !deal.seller_phone) {
    return {
      success: false,
      previousStage: from,
      newStage: to,
      reason: 'Seller phone number required',
      requiresAction: 'Add seller contact information',
    };
  }

  if (to === 'offer' && !deal.offer_price) {
    return {
      success: false,
      previousStage: from,
      newStage: to,
      reason: 'Offer price required',
      requiresAction: 'Set offer amount before moving to Offer stage',
    };
  }

  if (to === 'contract' && !deal.contract_price) {
    return {
      success: false,
      previousStage: from,
      newStage: to,
      reason: 'Contract price required',
      requiresAction: 'Set contract price before moving to Contract stage',
    };
  }

  if (to === 'assigned' && !deal.assigned_buyer_id) {
    return {
      success: false,
      previousStage: from,
      newStage: to,
      reason: 'Buyer assignment required',
      requiresAction: 'Assign a buyer before moving to Assigned stage',
    };
  }

  return {
    success: true,
    previousStage: from,
    newStage: to,
  };
}

/**
 * Calculate days in current stage
 */
export function calculateDaysInStage(updatedAt: string | null): number {
  if (!updatedAt) return 0;
  const updated = new Date(updatedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - updated.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a deal is stale in its current stage
 */
export function isDealStale(stage: DealStage, daysInStage: number): boolean {
  const staleThresholds: Partial<Record<DealStage, number>> = {
    lead: 7,
    contacted: 5,
    appointment: 3,
    offer: 7,
    contract: 14,
    assigned: 7,
    closing: 30,
  };

  const threshold = staleThresholds[stage];
  return threshold ? daysInStage > threshold : false;
}
