import type {
  RentCastProperty,
  RentCastValuation,
  RentCastRentEstimate,
  RentCastMarketData,
  NormalizedProperty,
  NormalizedValuation,
  NormalizedRentEstimate,
  NormalizedMarketData,
} from './types';

// ============================================
// Property Transformation
// ============================================

/**
 * Transform RentCast property data to internal schema.
 */
export function transformProperty(raw: RentCastProperty): NormalizedProperty {
  // Calculate ownership duration if last sale date available
  const ownershipDurationMonths = raw.lastSaleDate
    ? calculateOwnershipDuration(raw.lastSaleDate)
    : undefined;

  // Determine absentee status
  const isAbsentee = raw.ownerOccupied === false;

  // Build owner name from names array
  const ownerName = raw.owner?.names?.join(', ') || undefined;

  // Format mailing address
  const mailingAddress = raw.owner?.mailingAddress
    ? formatAddress(raw.owner.mailingAddress)
    : undefined;

  // Calculate equity percentage if we have values
  let equityPercent: number | undefined;
  if (raw.taxAssessment?.marketValue && raw.lastSalePrice) {
    const currentValue = raw.taxAssessment.marketValue;
    const purchasePrice = raw.lastSalePrice;
    equityPercent = ((currentValue - purchasePrice) / currentValue) * 100;
  }

  return {
    id: crypto.randomUUID(),
    rentcastId: raw.id,
    address: raw.formattedAddress,
    addressLine1: raw.addressLine1 || undefined,
    addressLine2: raw.addressLine2 || undefined,
    city: raw.city || undefined,
    state: raw.state || undefined,
    zip: raw.zipCode || undefined,
    county: raw.county || undefined,
    latitude: raw.latitude || undefined,
    longitude: raw.longitude || undefined,
    propertyType: normalizePropertyType(raw.propertyType),
    bedrooms: raw.bedrooms || undefined,
    bathrooms: raw.bathrooms || undefined,
    squareFootage: raw.squareFootage || undefined,
    lotSize: raw.lotSize || undefined,
    yearBuilt: raw.yearBuilt || undefined,
    ownerName,
    ownerType: normalizeOwnerType(raw.owner?.ownerType),
    ownerOccupied: raw.ownerOccupied ?? undefined,
    mailingAddress,
    lastSaleDate: raw.lastSaleDate ? new Date(raw.lastSaleDate) : undefined,
    lastSalePrice: raw.lastSalePrice || undefined,
    assessedValue: raw.taxAssessment?.assessedValue || undefined,
    marketValue: raw.taxAssessment?.marketValue || undefined,
    taxAmount: raw.taxAssessment?.taxAmount || undefined,
    equityPercent,
    ownershipDurationMonths,
    isAbsentee,
    features: raw.features
      ? {
          cooling: raw.features.cooling ?? undefined,
          heating: raw.features.heating ?? undefined,
          fireplace: raw.features.fireplace ?? undefined,
          pool: raw.features.pool ?? undefined,
          garage: raw.features.garage ?? undefined,
          garageSpaces: raw.features.garageSpaces ?? undefined,
          stories: raw.features.stories ?? undefined,
        }
      : undefined,
    enrichmentStatus: 'none',
  };
}

/**
 * Transform multiple properties.
 */
export function transformProperties(raw: RentCastProperty[]): NormalizedProperty[] {
  return raw.map(transformProperty);
}

// ============================================
// Valuation Transformation
// ============================================

/**
 * Transform RentCast valuation to internal schema.
 */
export function transformValuation(
  raw: RentCastValuation,
  propertyId: string
): NormalizedValuation {
  return {
    propertyId,
    estimatedValue: raw.price,
    priceRangeLow: raw.priceRangeLow,
    priceRangeHigh: raw.priceRangeHigh,
    pricePerSqft: raw.pricePerSquareFoot || undefined,
    confidence: normalizeConfidence(raw.confidence),
    comparableCount: raw.comparables?.length || 0,
    dataSource: 'rentcast',
    valuationDate: new Date(),
  };
}

// ============================================
// Rent Estimate Transformation
// ============================================

/**
 * Transform RentCast rent estimate to internal schema.
 */
export function transformRentEstimate(
  raw: RentCastRentEstimate,
  propertyId: string
): NormalizedRentEstimate {
  return {
    propertyId,
    rentEstimate: raw.rent,
    rentRangeLow: raw.rentRangeLow,
    rentRangeHigh: raw.rentRangeHigh,
    rentPerSqft: raw.rentPerSquareFoot || undefined,
    comparableCount: raw.comparables?.length || 0,
    dataSource: 'rentcast',
    estimateDate: new Date(),
  };
}

// ============================================
// Market Data Transformation
// ============================================

/**
 * Transform RentCast market data to internal schema.
 */
export function transformMarketData(raw: RentCastMarketData): NormalizedMarketData {
  // Calculate absorption rate if we have the data
  const absorptionRate = calculateAbsorptionRate(raw);

  return {
    zipCode: raw.zipCode,
    city: raw.city || undefined,
    state: raw.state || undefined,
    county: raw.county || undefined,
    medianHomeValue: raw.medianSalePrice || undefined,
    medianRent: raw.medianRent || undefined,
    pricePerSqft: raw.pricePerSquareFoot || undefined,
    rentPerSqft: raw.rentPerSquareFoot || undefined,
    daysOnMarketAvg: raw.daysOnMarket || undefined,
    inventoryCount: raw.inventory || undefined,
    yearOverYearChange: raw.yearOverYearChange || undefined,
    absorptionRate,
    dataSource: 'rentcast',
    dataDate: new Date(),
  };
}

// ============================================
// Helper Functions
// ============================================

function calculateOwnershipDuration(lastSaleDate: string): number {
  const saleDate = new Date(lastSaleDate);
  const now = new Date();
  const diffMs = now.getTime() - saleDate.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24 * 30));
}

function formatAddress(addr: {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
}): string {
  const parts = [
    addr.addressLine1,
    addr.addressLine2,
    addr.city,
    addr.state,
    addr.zipCode,
  ].filter(Boolean);
  return parts.join(', ');
}

function normalizePropertyType(type?: string | null): string | undefined {
  if (!type) return undefined;
  const normalized = type.toLowerCase().trim();
  const typeMap: Record<string, string> = {
    'single family': 'single_family',
    'single-family': 'single_family',
    'singlefamily': 'single_family',
    'multi-family': 'multi_family',
    'multifamily': 'multi_family',
    'multi family': 'multi_family',
    condo: 'condo',
    condominium: 'condo',
    townhouse: 'townhouse',
    townhome: 'townhouse',
    mobile: 'mobile',
    'mobile home': 'mobile',
    manufactured: 'mobile',
    land: 'land',
    lot: 'land',
    'vacant land': 'land',
  };
  return typeMap[normalized] || type;
}

function normalizeOwnerType(type?: string | null): string | undefined {
  if (!type) return undefined;
  const normalized = type.toLowerCase().trim();
  const typeMap: Record<string, string> = {
    individual: 'individual',
    person: 'individual',
    company: 'company',
    corporation: 'company',
    corp: 'company',
    llc: 'company',
    trust: 'trust',
    government: 'government',
    govt: 'government',
    bank: 'bank',
    financial: 'bank',
  };
  return typeMap[normalized] || 'unknown';
}

function normalizeConfidence(confidence?: number | null): number | undefined {
  if (confidence === null || confidence === undefined) return undefined;
  // Ensure confidence is between 0 and 100
  return Math.max(0, Math.min(100, confidence));
}

function calculateAbsorptionRate(data: RentCastMarketData): number | undefined {
  // Absorption rate = sales per month / inventory
  // We don't have direct sales data, so estimate from DOM
  if (!data.inventory || !data.daysOnMarket) return undefined;

  // Rough estimate: if DOM is 30 days, absorption is ~100%
  // Higher DOM = lower absorption
  const monthlyTurnover = 30 / data.daysOnMarket;
  return Math.min(100, monthlyTurnover * 100);
}

