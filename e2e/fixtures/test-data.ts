/**
 * Test Data Fixtures
 * Reusable test data for E2E tests
 */

export const testProperty = {
  address: '123 Test Street',
  city: 'Miami',
  state: 'FL',
  zip: '33101',
  price: 350000,
  bedrooms: 3,
  bathrooms: 2,
  sqft: 1800,
  yearBuilt: 1995,
  propertyType: 'single_family',
};

export const testBuyer = {
  firstName: 'Test',
  lastName: 'Buyer',
  email: 'testbuyer@example.com',
  phone: '555-123-4567',
  buyerType: 'investor',
  budget: {
    min: 200000,
    max: 500000,
  },
  criteria: {
    propertyTypes: ['single_family', 'multi_family'],
    locations: ['Miami', 'Fort Lauderdale'],
    minBedrooms: 2,
  },
};

export const testDeal = {
  title: 'Test Deal',
  propertyAddress: '123 Test Street, Miami, FL 33101',
  askingPrice: 350000,
  offerPrice: 320000,
  arv: 450000,
  repairEstimate: 50000,
  stage: 'lead',
};

export const testLead = {
  firstName: 'Test',
  lastName: 'Seller',
  email: 'testseller@example.com',
  phone: '555-987-6543',
  propertyAddress: '456 Test Avenue, Miami, FL 33102',
  motivation: 'high',
  source: 'direct_mail',
};

export const testSearchFilters = {
  location: 'Miami, FL',
  priceMin: 200000,
  priceMax: 500000,
  bedrooms: 3,
  propertyType: 'single_family',
  daysOnMarket: 30,
};

export const testAIPrompts = {
  propertyAnalysis: 'Analyze this property at 123 Main St, Miami FL',
  marketAnalysis: 'What is the market velocity in Miami?',
  dealAnalysis: 'Calculate the MAO for a property with ARV of 400000 and repairs of 50000',
  filterQuery: 'Find me distressed properties in Miami with high equity',
};

/**
 * Generate unique test data with timestamp
 */
export function generateUniqueTestData() {
  const timestamp = Date.now();
  return {
    email: `test-${timestamp}@example.com`,
    phone: `555-${timestamp.toString().slice(-7)}`,
    address: `${timestamp} Test Street`,
  };
}
