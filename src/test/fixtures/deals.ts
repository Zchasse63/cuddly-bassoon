/**
 * Deal Test Fixtures
 * Sample deal data for testing AI tools
 */

export const dealStages = [
  'lead',
  'contacted',
  'appointment_set',
  'offer_submitted',
  'under_contract',
  'due_diligence',
  'closing',
  'closed',
  'dead',
] as const;

export type DealStage = typeof dealStages[number];

export const sampleDeals = {
  // New lead - just entered pipeline
  newLead: {
    id: 'deal-lead-001',
    propertyId: 'prop-sf-001',
    stage: 'lead' as DealStage,
    source: 'driving_for_dollars',
    createdAt: '2024-03-10T09:00:00Z',
    updatedAt: '2024-03-10T09:00:00Z',
    property: {
      address: '123 Main St',
      city: 'Miami',
      state: 'FL',
      estimatedValue: 380000,
    },
    seller: {
      name: 'John Smith',
      phone: '+1-555-111-2222',
      motivation: null,
      contactAttempts: 0,
    },
    activities: [],
  },

  // In negotiation
  negotiation: {
    id: 'deal-neg-001',
    propertyId: 'prop-distressed-001',
    buyerId: 'buyer-cash-001',
    stage: 'offer_submitted' as DealStage,
    source: 'list_purchase',
    askingPrice: 180000,
    offerPrice: 155000,
    counterOffer: 170000,
    arv: 250000,
    estimatedRepairs: 35000,
    maxAllowableOffer: 140000,
    createdAt: '2024-02-20T14:00:00Z',
    updatedAt: '2024-03-08T16:30:00Z',
    property: {
      address: '789 Foreclosure Dr',
      city: 'Hialeah',
      state: 'FL',
      estimatedValue: 250000,
    },
    seller: {
      name: 'Estate of Maria Rodriguez',
      phone: '+1-555-333-4444',
      motivation: 8,
      motivationFactors: ['estate_sale', 'tax_delinquent', 'vacant'],
      contactAttempts: 5,
    },
    assignmentFee: 15000,
    expectedProfit: 15000,
    activities: [
      { type: 'contact', note: 'Initial call - spoke with executor', timestamp: '2024-02-21T10:00:00Z' },
      { type: 'appointment', note: 'Property walkthrough scheduled', timestamp: '2024-02-25T14:00:00Z' },
      { type: 'offer', note: 'Submitted offer at $155k', timestamp: '2024-03-01T11:00:00Z' },
      { type: 'counter', note: 'Counter received at $170k', timestamp: '2024-03-05T15:00:00Z' },
    ],
  },

  // Under contract
  underContract: {
    id: 'deal-uc-001',
    propertyId: 'prop-absentee-001',
    buyerId: 'buyer-bh-001',
    stage: 'under_contract' as DealStage,
    source: 'absentee_list',
    purchasePrice: 385000,
    arv: 450000,
    estimatedRepairs: 15000,
    contractDate: '2024-03-01T00:00:00Z',
    closingDate: '2024-03-28T00:00:00Z',
    inspectionDeadline: '2024-03-10T00:00:00Z',
    financingContingencyDate: '2024-03-15T00:00:00Z',
    earnestMoney: 5000,
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-03-05T10:00:00Z',
    property: {
      address: '321 Rental Ln',
      city: 'Fort Lauderdale',
      state: 'FL',
      estimatedValue: 450000,
    },
    seller: {
      name: 'XYZ Holdings LLC',
      phone: '+1-555-555-6666',
      motivation: 6,
      motivationFactors: ['tired_landlord', 'out_of_state'],
      contactAttempts: 3,
    },
    dueDiligence: {
      inspectionComplete: true,
      inspectionIssues: ['minor roof repair needed'],
      titleClear: true,
      appraisalOrdered: true,
      appraisalValue: null,
    },
    activities: [
      { type: 'contact', note: 'Initial outreach', timestamp: '2024-02-10T09:00:00Z' },
      { type: 'offer', note: 'Offer accepted', timestamp: '2024-02-28T16:00:00Z' },
      { type: 'contract', note: 'Contract executed', timestamp: '2024-03-01T10:00:00Z' },
      { type: 'inspection', note: 'Inspection complete - minor issues', timestamp: '2024-03-08T14:00:00Z' },
    ],
  },

  // Closed deal
  closedDeal: {
    id: 'deal-closed-001',
    propertyId: 'prop-closed-001',
    buyerId: 'buyer-whl-001',
    stage: 'closed' as DealStage,
    source: 'cold_call',
    purchasePrice: 142000,
    salePrice: 157000,
    arv: 210000,
    actualRepairs: 0,
    profit: 15000,
    roi: 10.6,
    contractDate: '2024-01-15T00:00:00Z',
    closingDate: '2024-02-01T00:00:00Z',
    actualClosingDate: '2024-02-01T00:00:00Z',
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-02-01T16:00:00Z',
    property: {
      address: '999 Quick Sale St',
      city: 'Miami',
      state: 'FL',
      estimatedValue: 210000,
    },
    seller: {
      name: 'Motivated Seller',
      motivation: 9,
      motivationFactors: ['divorce', 'relocation', 'financial_distress'],
    },
    timeInPipeline: 27, // days
    daysToClose: 17,
  },

  // Dead deal
  deadDeal: {
    id: 'deal-dead-001',
    propertyId: 'prop-dead-001',
    stage: 'dead' as DealStage,
    source: 'mailer',
    deadReason: 'seller_unrealistic_expectations',
    deadDate: '2024-02-20T00:00:00Z',
    lastOfferPrice: 195000,
    sellerAskingPrice: 275000,
    createdAt: '2024-01-20T10:00:00Z',
    updatedAt: '2024-02-20T11:00:00Z',
    property: {
      address: '777 No Deal Ave',
      city: 'Miami',
      state: 'FL',
      estimatedValue: 240000,
    },
    seller: {
      name: 'Stubborn Owner',
      motivation: 3,
    },
    followUpDate: '2024-05-20T00:00:00Z', // 3 months later
    notes: 'Seller wants retail price. Follow up in 3 months.',
  },
};

// Array of all sample deals
export const allSampleDeals = Object.values(sampleDeals);

// Deals by stage for pipeline testing
export const dealsByStage = {
  lead: [sampleDeals.newLead],
  offer_submitted: [sampleDeals.negotiation],
  under_contract: [sampleDeals.underContract],
  closed: [sampleDeals.closedDeal],
  dead: [sampleDeals.deadDeal],
};

// Pipeline metrics for dashboard testing
export const pipelineMetrics = {
  totalDeals: 45,
  byStage: {
    lead: 15,
    contacted: 8,
    appointment_set: 5,
    offer_submitted: 7,
    under_contract: 4,
    due_diligence: 2,
    closing: 1,
    closed: 2,
    dead: 1,
  },
  totalValue: 2850000,
  expectedProfit: 125000,
  avgDaysInPipeline: 18,
  conversionRate: 4.4, // percentage
  thisMonth: {
    newLeads: 12,
    dealsWon: 2,
    dealsClosed: 1,
    revenue: 15000,
  },
};

// Deal analysis input for testing
export const dealAnalysisInput = {
  propertyId: 'prop-distressed-001',
  askingPrice: 180000,
  estimatedARV: 250000,
  estimatedRepairs: 35000,
  holdingCosts: 5000,
  closingCosts: 8000,
  targetProfit: 25000,
};
