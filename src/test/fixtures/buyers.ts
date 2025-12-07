/**
 * Buyer Test Fixtures
 * Sample buyer data for testing AI tools
 */

export const sampleBuyers = {
  // Cash buyer - investor
  cashInvestor: {
    id: 'buyer-cash-001',
    name: 'Robert Investment Group',
    email: 'robert@investmentgroup.com',
    phone: '+1-555-100-2000',
    type: 'investor',
    preferences: {
      priceRange: { min: 100000, max: 300000 },
      propertyTypes: ['single_family', 'multi_family'],
      locations: ['Miami', 'Hialeah', 'Homestead'],
      minBedrooms: 2,
      minBathrooms: 1,
      maxYearBuilt: 2000,
      targetROI: 15,
      strategyType: 'fix_and_flip',
    },
    financingType: 'cash',
    proofOfFunds: true,
    closingSpeed: '7-14 days',
    status: 'active',
    recentPurchases: 12,
    averagePurchasePrice: 185000,
    rating: 4.8,
    createdAt: '2023-01-15T10:00:00Z',
    lastActivity: '2024-03-01T14:30:00Z',
  },

  // First-time homebuyer
  firstTimeBuyer: {
    id: 'buyer-ftb-001',
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1-555-200-3000',
    type: 'end_buyer',
    preferences: {
      priceRange: { min: 300000, max: 450000 },
      propertyTypes: ['single_family', 'townhouse'],
      locations: ['Coral Gables', 'South Miami', 'Pinecrest'],
      minBedrooms: 3,
      minBathrooms: 2,
      minSqft: 1500,
      mustHave: ['garage', 'updated kitchen'],
      schoolDistrictImportance: 'high',
    },
    financingType: 'conventional',
    preApproved: true,
    preApprovalAmount: 425000,
    closingSpeed: '30-45 days',
    status: 'active',
    rating: null,
    createdAt: '2024-02-01T09:00:00Z',
    lastActivity: '2024-03-10T11:15:00Z',
  },

  // Wholesale buyer
  wholesaleBuyer: {
    id: 'buyer-whl-001',
    name: 'Quick Close Properties LLC',
    email: 'deals@quickclose.com',
    phone: '+1-555-300-4000',
    type: 'wholesaler',
    preferences: {
      priceRange: { min: 50000, max: 200000 },
      propertyTypes: ['single_family'],
      locations: ['Miami-Dade County', 'Broward County'],
      minBedrooms: 2,
      targetDiscount: 30, // 30% below market
      acceptsAssignments: true,
      preferredConditions: ['distressed', 'pre_foreclosure', 'estate'],
    },
    financingType: 'cash',
    proofOfFunds: true,
    closingSpeed: '3-7 days',
    status: 'active',
    recentPurchases: 45,
    averagePurchasePrice: 125000,
    rating: 4.5,
    createdAt: '2022-06-20T08:00:00Z',
    lastActivity: '2024-03-12T16:45:00Z',
  },

  // Buy and hold investor
  buyAndHold: {
    id: 'buyer-bh-001',
    name: 'Passive Income Partners',
    email: 'info@passiveincome.com',
    phone: '+1-555-400-5000',
    type: 'investor',
    preferences: {
      priceRange: { min: 200000, max: 500000 },
      propertyTypes: ['single_family', 'duplex', 'triplex'],
      locations: ['Fort Lauderdale', 'Hollywood', 'Pompano Beach'],
      minBedrooms: 2,
      minCapRate: 6,
      targetCashFlow: 500, // per month
      strategyType: 'buy_and_hold',
      tenantInPlace: 'preferred',
    },
    financingType: 'conventional',
    preApproved: true,
    preApprovalAmount: 750000,
    closingSpeed: '21-30 days',
    status: 'active',
    portfolioSize: 8,
    averageRent: 2200,
    rating: 4.9,
    createdAt: '2021-11-10T12:00:00Z',
    lastActivity: '2024-03-08T10:20:00Z',
  },

  // Inactive buyer
  inactiveBuyer: {
    id: 'buyer-inactive-001',
    name: 'Dormant Investor',
    email: 'dormant@email.com',
    phone: '+1-555-500-6000',
    type: 'investor',
    preferences: {
      priceRange: { min: 100000, max: 250000 },
      propertyTypes: ['single_family'],
      locations: ['Miami'],
    },
    financingType: 'cash',
    status: 'inactive',
    lastActivity: '2023-06-15T09:00:00Z',
    inactiveReason: 'No response to last 5 deals',
  },
};

// Array of all sample buyers
export const allSampleBuyers = Object.values(sampleBuyers);

// Active buyers only
export const activeBuyers = allSampleBuyers.filter(b => b.status === 'active');

// Buyer matching criteria for testing
export const buyerMatchCriteria = {
  // Property that matches cash investor
  forCashInvestor: {
    price: 185000,
    propertyType: 'single_family',
    city: 'Miami',
    bedrooms: 3,
    yearBuilt: 1985,
    condition: 'needs_work',
    estimatedARV: 280000,
    estimatedRepairs: 35000,
  },

  // Property that matches first-time buyer
  forFirstTimeBuyer: {
    price: 395000,
    propertyType: 'single_family',
    city: 'Coral Gables',
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    features: ['garage', 'updated kitchen', 'new roof'],
    schoolRating: 9,
  },
};

// Buyer activity history for engagement testing
export const buyerActivityHistory = {
  'buyer-cash-001': [
    { type: 'property_viewed', propertyId: 'prop-001', timestamp: '2024-03-01T10:00:00Z' },
    { type: 'offer_submitted', propertyId: 'prop-001', amount: 175000, timestamp: '2024-03-01T14:00:00Z' },
    { type: 'deal_closed', propertyId: 'prop-002', amount: 192000, timestamp: '2024-02-15T16:00:00Z' },
  ],
  'buyer-ftb-001': [
    { type: 'search_saved', criteria: { city: 'Coral Gables', minBeds: 3 }, timestamp: '2024-03-10T09:00:00Z' },
    { type: 'property_viewed', propertyId: 'prop-003', timestamp: '2024-03-10T11:00:00Z' },
    { type: 'tour_scheduled', propertyId: 'prop-003', timestamp: '2024-03-10T11:30:00Z' },
  ],
};
