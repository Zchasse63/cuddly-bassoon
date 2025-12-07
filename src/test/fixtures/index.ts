/**
 * Test Fixtures Index
 * Central export for all test fixtures
 */

export * from './properties';
export * from './buyers';
export * from './deals';
export * from './leads';

// Re-export commonly used fixtures with convenient names
export { sampleProperties, allSampleProperties, comparables, propertySearchResults } from './properties';
export { sampleBuyers, allSampleBuyers, activeBuyers, buyerMatchCriteria } from './buyers';
export { sampleDeals, allSampleDeals, dealsByStage, pipelineMetrics, dealAnalysisInput } from './deals';
export { sampleLeads, allSampleLeads, leadsByStatus, leadEngagementMetrics, skipTraceResult } from './leads';

/**
 * Create a random ID for testing
 */
export function createTestId(prefix: string = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a date string relative to now
 */
export function relativeDate(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
}

/**
 * Sample market data for various locations
 */
export const marketData = {
  miami: {
    zipCode: '33101',
    city: 'Miami',
    state: 'FL',
    medianPrice: 425000,
    pricePerSqft: 285,
    avgDaysOnMarket: 45,
    inventory: 1250,
    priceChange1Year: 8.5,
    rentMedian: 2300,
    capRate: 5.2,
    appreciation3Year: 28.5,
    marketType: 'sellers',
  },
  fortLauderdale: {
    zipCode: '33301',
    city: 'Fort Lauderdale',
    state: 'FL',
    medianPrice: 475000,
    pricePerSqft: 310,
    avgDaysOnMarket: 38,
    inventory: 890,
    priceChange1Year: 9.2,
    rentMedian: 2500,
    capRate: 4.8,
    appreciation3Year: 32.1,
    marketType: 'sellers',
  },
  hialeah: {
    zipCode: '33012',
    city: 'Hialeah',
    state: 'FL',
    medianPrice: 285000,
    pricePerSqft: 195,
    avgDaysOnMarket: 52,
    inventory: 520,
    priceChange1Year: 6.8,
    rentMedian: 1800,
    capRate: 6.5,
    appreciation3Year: 22.4,
    marketType: 'balanced',
  },
};

/**
 * Sample permit data for testing
 */
export const permitData = {
  recentPermits: [
    {
      id: 'permit-001',
      propertyId: 'prop-sf-001',
      type: 'roof_replacement',
      status: 'finaled',
      issueDate: '2023-06-15',
      finalDate: '2023-07-20',
      contractor: 'ABC Roofing Inc',
      value: 15000,
    },
    {
      id: 'permit-002',
      propertyId: 'prop-sf-001',
      type: 'electrical',
      status: 'active',
      issueDate: '2024-02-01',
      contractor: 'XYZ Electric',
      value: 5000,
    },
  ],
  permitMetrics: {
    totalPermits: 45,
    activePermits: 12,
    avgPermitValue: 8500,
    topPermitTypes: ['roof_replacement', 'ac_replacement', 'electrical'],
  },
};

/**
 * Sample heat map data for testing
 */
export const heatMapData = {
  opportunityZones: [
    { zipCode: '33012', score: 85, opportunities: 25, avgDiscount: 22 },
    { zipCode: '33010', score: 78, opportunities: 18, avgDiscount: 18 },
    { zipCode: '33016', score: 72, opportunities: 15, avgDiscount: 15 },
  ],
  distressIndicators: [
    { zipCode: '33012', foreclosures: 15, taxDelinquent: 28, vacant: 42 },
    { zipCode: '33010', foreclosures: 8, taxDelinquent: 15, vacant: 25 },
  ],
};

/**
 * Sample notification templates
 */
export const notificationTemplates = {
  sms: {
    initial: 'Hi {firstName}, I noticed your property at {address}. Would you consider selling? Reply YES for a cash offer.',
    followUp: 'Hi {firstName}, following up on {address}. Still interested in a cash offer? Call me at {agentPhone}.',
  },
  email: {
    initial: {
      subject: 'Cash Offer for {address}',
      body: 'Dear {firstName},\n\nI am interested in purchasing your property at {address}...',
    },
    followUp: {
      subject: 'Following up: {address}',
      body: 'Dear {firstName},\n\nI wanted to follow up on my previous message...',
    },
  },
};
