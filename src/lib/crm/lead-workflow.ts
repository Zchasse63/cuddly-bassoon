/**
 * CRM Lead Workflow
 * Status transitions, scoring, and workflow logic
 */

import { LeadStatus } from './types';

// Lead status configuration
export const LEAD_STATUSES: Record<
  LeadStatus,
  {
    label: string;
    description: string;
    color: string;
    order: number;
  }
> = {
  new: {
    label: 'New',
    description: 'Fresh lead, not contacted',
    color: 'bg-slate-500',
    order: 0,
  },
  contacted: {
    label: 'Contacted',
    description: 'Initial contact made',
    color: 'bg-blue-500',
    order: 1,
  },
  engaged: {
    label: 'Engaged',
    description: 'Active conversation',
    color: 'bg-cyan-500',
    order: 2,
  },
  qualified: {
    label: 'Qualified',
    description: 'Motivated seller confirmed',
    color: 'bg-purple-500',
    order: 3,
  },
  offer_made: {
    label: 'Offer Made',
    description: 'Offer submitted',
    color: 'bg-amber-500',
    order: 4,
  },
  negotiating: {
    label: 'Negotiating',
    description: 'In negotiations',
    color: 'bg-orange-500',
    order: 5,
  },
  under_contract: {
    label: 'Under Contract',
    description: 'Contract signed',
    color: 'bg-indigo-500',
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
    description: 'Lead lost',
    color: 'bg-red-500',
    order: 8,
  },
};

// Valid status transitions
export const VALID_LEAD_TRANSITIONS: Record<LeadStatus, LeadStatus[]> = {
  new: ['contacted', 'lost'],
  contacted: ['engaged', 'new', 'lost'],
  engaged: ['qualified', 'contacted', 'lost'],
  qualified: ['offer_made', 'engaged', 'lost'],
  offer_made: ['negotiating', 'qualified', 'lost'],
  negotiating: ['under_contract', 'offer_made', 'lost'],
  under_contract: ['closed', 'lost'],
  closed: [],
  lost: ['new'], // Can reopen
};

/**
 * Check if a lead status transition is valid
 */
export function isValidLeadTransition(from: LeadStatus, to: LeadStatus): boolean {
  return VALID_LEAD_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Get ordered lead statuses
 */
export function getOrderedLeadStatuses(): LeadStatus[] {
  return Object.entries(LEAD_STATUSES)
    .sort(([, a], [, b]) => a.order - b.order)
    .map(([status]) => status as LeadStatus);
}

/**
 * Get active lead statuses (excluding lost and closed)
 */
export function getActiveLeadStatuses(): LeadStatus[] {
  return getOrderedLeadStatuses().filter((s) => s !== 'lost' && s !== 'closed');
}

/**
 * Calculate motivation score based on signals
 */
export function calculateMotivationScore(signals: {
  daysOnMarket?: number;
  priceReductions?: number;
  vacantProperty?: boolean;
  ownerResponded?: boolean;
  urgencyMentioned?: boolean;
  financialDistress?: boolean;
  inheritedProperty?: boolean;
  divorceRelated?: boolean;
}): number {
  let score = 50; // Base score

  // Days on market factor
  if (signals.daysOnMarket) {
    if (signals.daysOnMarket > 180) score += 15;
    else if (signals.daysOnMarket > 90) score += 10;
    else if (signals.daysOnMarket > 30) score += 5;
  }

  // Price reductions
  if (signals.priceReductions) {
    score += Math.min(signals.priceReductions * 5, 15);
  }

  // Property signals
  if (signals.vacantProperty) score += 10;
  if (signals.ownerResponded) score += 10;
  if (signals.urgencyMentioned) score += 15;

  // Distress indicators
  if (signals.financialDistress) score += 20;
  if (signals.inheritedProperty) score += 15;
  if (signals.divorceRelated) score += 15;

  return Math.min(score, 100);
}

/**
 * Categorize lead by motivation level
 */
export function getMotivationLevel(score: number): 'hot' | 'warm' | 'cold' {
  if (score >= 75) return 'hot';
  if (score >= 50) return 'warm';
  return 'cold';
}

/**
 * Get recommended follow-up interval based on status and motivation
 */
export function getFollowUpInterval(status: LeadStatus, motivationScore: number): number {
  const level = getMotivationLevel(motivationScore);

  const intervals: Record<LeadStatus, Record<string, number>> = {
    new: { hot: 1, warm: 3, cold: 7 },
    contacted: { hot: 1, warm: 2, cold: 5 },
    engaged: { hot: 1, warm: 1, cold: 3 },
    qualified: { hot: 1, warm: 1, cold: 2 },
    offer_made: { hot: 1, warm: 1, cold: 2 },
    negotiating: { hot: 1, warm: 1, cold: 1 },
    under_contract: { hot: 1, warm: 1, cold: 1 },
    closed: { hot: 0, warm: 0, cold: 0 },
    lost: { hot: 14, warm: 30, cold: 60 },
  };

  return intervals[status]?.[level] ?? 7;
}

/**
 * Check if lead needs follow-up
 */
export function needsFollowUp(
  status: LeadStatus,
  lastContactDate: string | null,
  motivationScore: number
): boolean {
  if (status === 'closed') return false;
  if (!lastContactDate) return true;

  const interval = getFollowUpInterval(status, motivationScore);
  const daysSinceContact = Math.floor(
    (Date.now() - new Date(lastContactDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return daysSinceContact >= interval;
}
