/**
 * Shovels API Types
 * Type definitions for the Shovels.ai construction permit and contractor API
 */

// =============================================
// Permit Tags (22 Standardized)
// =============================================
export const SHOVELS_PERMIT_TAGS = [
  'addition',
  'adu',
  'bathroom',
  'battery',
  'demolition',
  'electric_meter',
  'electrical',
  'ev_charger',
  'fire_sprinkler',
  'gas',
  'generator',
  'grading',
  'heat_pump',
  'hvac',
  'kitchen',
  'new_construction',
  'plumbing',
  'pool_and_hot_tub',
  'remodel',
  'roofing',
  'solar',
  'water_heater',
] as const;

export type ShovelsPermitTag = (typeof SHOVELS_PERMIT_TAGS)[number];

// =============================================
// Permit Status (4 Standardized)
// =============================================
export const SHOVELS_PERMIT_STATUS = ['active', 'final', 'in_review', 'inactive'] as const;

export type ShovelsPermitStatus = (typeof SHOVELS_PERMIT_STATUS)[number];

// =============================================
// Permit Interface
// =============================================
export interface ShovelsPermit {
  id: string;
  description: string;
  number: string;
  jurisdiction: string;
  status: ShovelsPermitStatus;
  tags: ShovelsPermitTag[];
  property_type: 'residential' | 'commercial';
  job_value?: number;
  fees?: number;
  file_date?: string;
  issue_date?: string;
  final_date?: string;
  inspection_pass_rate?: number;
  approval_duration?: number;
  construction_duration?: number;
  contractor_id?: string;
  contractor_name?: string;
  geo_ids: {
    address_id: string;
    zip_code: string;
    city_id?: string;
    county_id?: string;
    jurisdiction_id?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zip_code: string;
  };
}

// =============================================
// Contractor Interface
// =============================================
export interface ShovelsContractor {
  id: string;
  name: string;
  business_name?: string;
  license_number?: string;
  license_state?: string;
  website?: string;
  total_permits: number;
  lifetime_job_value?: number;
  avg_inspection_pass_rate?: number;
  avg_construction_duration?: number;
  permit_tags: ShovelsPermitTag[];
  property_types: string[];
}

// =============================================
// Geographic Metrics Interface
// =============================================
export interface ShovelsGeoMetrics {
  geo_id: string;
  geo_type: 'zip' | 'city' | 'county' | 'jurisdiction';
  name: string;
  state?: string;
  metrics: {
    total_permits: number;
    permits_by_month: Array<{ month: string; count: number }>;
    avg_approval_duration: number;
    avg_construction_duration: number;
    avg_inspection_pass_rate: number;
    permit_value_total: number;
    active_contractors: number;
  };
}

// =============================================
// Address Resident Interface
// =============================================
export interface ShovelsAddressResident {
  name: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
}

// =============================================
// Search Parameters
// =============================================
export interface ShovelsSearchParams {
  geo_id: string;
  permit_from: string; // YYYY-MM-DD
  permit_to: string; // YYYY-MM-DD
  status?: ShovelsPermitStatus | ShovelsPermitStatus[];
  permit_tags?: ShovelsPermitTag | ShovelsPermitTag[];
  property_type?: 'residential' | 'commercial';
  keyword?: string;
  min_job_value?: number;
  min_fees?: number;
  min_inspection_pass_rate?: number;
  has_contractor?: boolean;
  page?: number;
  size?: number;
  cursor?: string;
}

// =============================================
// Paginated Response
// =============================================
export interface ShovelsPaginatedResponse<T> {
  items: T[];
  page: number;
  size: number;
  next_page?: number;
  cursor?: string;
}

