/**
 * Property Types
 *
 * Source: UI_UX_DESIGN_SYSTEM_v1.md
 */

import type { PropertyData } from '@/lib/filters/types';

// Extended property with additional computed fields
export interface PropertyWithDetails extends PropertyData {
  // Computed fields
  estimatedEquity?: number;
  pricePerSqft?: number;
  daysOwned?: number;

  // Related data
  permits?: PropertyPermit[];
  comps?: PropertyComp[];
  ownerDetails?: PropertyOwner;
  valuationHistory?: ValuationPoint[];

  // Matching
  matchedBuyers?: MatchedBuyer[];
  matchScore?: number;
}

export interface PropertyPermit {
  id: string;
  permitNumber: string;
  type: string;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  description?: string;
  jobValue?: number;
  issuedDate?: string;
  completedDate?: string;
  expirationDate?: string;
  inspections?: PermitInspection[];
}

export interface PermitInspection {
  id: string;
  type: string;
  status: 'passed' | 'failed' | 'pending' | 'scheduled';
  date?: string;
  notes?: string;
}

export interface PropertyComp {
  id: string;
  address: string;
  city?: string;
  state?: string;
  zip?: string;
  distanceMiles: number;
  salePrice: number;
  saleDate: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFootage?: number;
  yearBuilt?: number;
  pricePerSqft?: number;
  daysOnMarket?: number;
  similarityScore: number; // 0-100
}

export interface PropertyOwner {
  name?: string;
  type?: 'individual' | 'corporate' | 'trust' | 'llc' | 'other';
  mailingAddress?: string;
  mailingCity?: string;
  mailingState?: string;
  mailingZip?: string;
  phone?: string;
  email?: string;
  propertyCount?: number;
  ownershipStartDate?: string;
}

export interface ValuationPoint {
  date: string;
  value: number;
  source: 'assessment' | 'sale' | 'estimate' | 'appraisal';
}

export interface MatchedBuyer {
  id: string;
  name: string;
  companyName?: string;
  tier?: 'A' | 'B' | 'C';
  matchScore: number; // 0-100
  matchReasons: string[];
  email?: string;
  phone?: string;
}

// Property list filters
export interface PropertyListFilters {
  search?: string;
  city?: string;
  state?: string;
  zip?: string;
  minValue?: number;
  maxValue?: number;
  minEquity?: number;
  maxEquity?: number;
  propertyType?: string;
  minBedrooms?: number;
  maxBedrooms?: number;
  ownerType?: string;
  hasPermits?: boolean;
}

// Property API response
export interface PropertyResponse {
  property: PropertyWithDetails;
  relatedDeals?: Array<{
    id: string;
    stage: string;
    status: string;
    createdAt: string;
  }>;
}

// Property list response
export interface PropertyListResponse {
  properties: PropertyWithDetails[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
