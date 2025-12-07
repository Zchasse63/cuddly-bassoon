/**
 * Lead Test Fixtures
 * Sample lead data for testing AI tools
 */

export const leadSources = [
  'website',
  'referral',
  'cold_call',
  'mailer',
  'driving_for_dollars',
  'list_purchase',
  'sms_campaign',
  'ppc',
  'social_media',
  'other',
] as const;

export type LeadSource = typeof leadSources[number];

export const leadStatuses = [
  'new',
  'contacted',
  'qualified',
  'nurturing',
  'hot',
  'converted',
  'dead',
] as const;

export type LeadStatus = typeof leadStatuses[number];

export const sampleLeads = {
  // New lead - just came in
  newLead: {
    id: 'lead-new-001',
    firstName: 'Michael',
    lastName: 'Williams',
    name: 'Michael Williams',
    email: 'michael.w@email.com',
    phone: '+1-555-100-1001',
    address: '123 Prospect Ave',
    city: 'Miami',
    state: 'FL',
    zip: '33101',
    source: 'website' as LeadSource,
    status: 'new' as LeadStatus,
    motivationScore: null,
    createdAt: '2024-03-12T08:00:00Z',
    updatedAt: '2024-03-12T08:00:00Z',
    contactAttempts: 0,
    lastContactDate: null,
    notes: 'Submitted form on website - interested in selling',
    property: {
      address: '123 Prospect Ave',
      city: 'Miami',
      state: 'FL',
      estimatedValue: 320000,
    },
  },

  // Hot lead - high motivation
  hotLead: {
    id: 'lead-hot-001',
    firstName: 'Sandra',
    lastName: 'Martinez',
    name: 'Sandra Martinez',
    email: 'sandra.m@email.com',
    phone: '+1-555-200-2002',
    address: '456 Urgent St',
    city: 'Hialeah',
    state: 'FL',
    zip: '33012',
    source: 'cold_call' as LeadSource,
    status: 'hot' as LeadStatus,
    motivationScore: 9,
    motivationFactors: ['divorce', 'behind_on_payments', 'needs_quick_sale'],
    createdAt: '2024-03-05T10:00:00Z',
    updatedAt: '2024-03-11T15:30:00Z',
    contactAttempts: 3,
    lastContactDate: '2024-03-11T15:30:00Z',
    nextFollowUp: '2024-03-13T10:00:00Z',
    notes: 'Very motivated - going through divorce, 2 months behind on mortgage',
    property: {
      address: '456 Urgent St',
      city: 'Hialeah',
      state: 'FL',
      estimatedValue: 245000,
      condition: 'fair',
      owedAmount: 180000,
    },
    preferredContact: 'phone',
    bestTimeToCall: 'evening',
  },

  // Qualified lead - ready for offer
  qualifiedLead: {
    id: 'lead-qual-001',
    firstName: 'David',
    lastName: 'Chen',
    name: 'David Chen',
    email: 'david.chen@email.com',
    phone: '+1-555-300-3003',
    address: '789 Ready Rd',
    city: 'Fort Lauderdale',
    state: 'FL',
    zip: '33301',
    source: 'referral' as LeadSource,
    status: 'qualified' as LeadStatus,
    motivationScore: 7,
    motivationFactors: ['relocation', 'job_transfer'],
    createdAt: '2024-02-28T09:00:00Z',
    updatedAt: '2024-03-10T14:00:00Z',
    contactAttempts: 4,
    lastContactDate: '2024-03-10T14:00:00Z',
    nextFollowUp: '2024-03-14T11:00:00Z',
    appointmentDate: '2024-03-15T14:00:00Z',
    notes: 'Relocating for work in 60 days. Wants quick close. Referred by John Smith.',
    property: {
      address: '789 Ready Rd',
      city: 'Fort Lauderdale',
      state: 'FL',
      estimatedValue: 425000,
      condition: 'good',
      owedAmount: 280000,
      yearsOwned: 8,
    },
    referredBy: 'lead-ref-001',
  },

  // Nurturing lead - not ready yet
  nurturingLead: {
    id: 'lead-nur-001',
    firstName: 'Patricia',
    lastName: 'Brown',
    name: 'Patricia Brown',
    email: 'patricia.b@email.com',
    phone: '+1-555-400-4004',
    address: '321 Maybe Ln',
    city: 'Coral Gables',
    state: 'FL',
    zip: '33134',
    source: 'mailer' as LeadSource,
    status: 'nurturing' as LeadStatus,
    motivationScore: 4,
    motivationFactors: ['considering_downsizing'],
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-03-01T09:00:00Z',
    contactAttempts: 6,
    lastContactDate: '2024-03-01T09:00:00Z',
    nextFollowUp: '2024-04-01T10:00:00Z',
    notes: 'Considering selling in 6-12 months when she retires. Add to drip campaign.',
    property: {
      address: '321 Maybe Ln',
      city: 'Coral Gables',
      state: 'FL',
      estimatedValue: 685000,
      condition: 'excellent',
      owedAmount: 0,
      yearsOwned: 25,
    },
    tags: ['long_term', 'free_and_clear', 'retirement'],
    dripCampaignId: 'drip-retirement-001',
  },

  // Dead lead
  deadLead: {
    id: 'lead-dead-001',
    firstName: 'Robert',
    lastName: 'Taylor',
    name: 'Robert Taylor',
    email: 'robert.t@email.com',
    phone: '+1-555-500-5005',
    address: '555 No Thanks Blvd',
    city: 'Miami Beach',
    state: 'FL',
    zip: '33139',
    source: 'sms_campaign' as LeadSource,
    status: 'dead' as LeadStatus,
    motivationScore: 1,
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-02-15T10:00:00Z',
    contactAttempts: 5,
    lastContactDate: '2024-02-15T10:00:00Z',
    deadReason: 'not_interested',
    notes: 'Not interested in selling. Listed with agent. Do not contact again.',
    property: {
      address: '555 No Thanks Blvd',
      city: 'Miami Beach',
      state: 'FL',
      estimatedValue: 1200000,
    },
    doNotContact: true,
  },

  // Converted lead (became a deal)
  convertedLead: {
    id: 'lead-conv-001',
    firstName: 'Angela',
    lastName: 'Davis',
    name: 'Angela Davis',
    email: 'angela.d@email.com',
    phone: '+1-555-600-6006',
    address: '888 Success Way',
    city: 'Hollywood',
    state: 'FL',
    zip: '33020',
    source: 'driving_for_dollars' as LeadSource,
    status: 'converted' as LeadStatus,
    motivationScore: 8,
    motivationFactors: ['inherited', 'out_of_state', 'vacant'],
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-03-01T11:00:00Z',
    contactAttempts: 4,
    lastContactDate: '2024-03-01T11:00:00Z',
    convertedDate: '2024-03-01T11:00:00Z',
    dealId: 'deal-uc-001',
    notes: 'Inherited property. Lives in California. Converted to deal on 3/1.',
    property: {
      address: '888 Success Way',
      city: 'Hollywood',
      state: 'FL',
      estimatedValue: 310000,
      condition: 'needs_work',
    },
  },
};

// Array of all sample leads
export const allSampleLeads = Object.values(sampleLeads);

// Leads by status
export const leadsByStatus = {
  new: [sampleLeads.newLead],
  hot: [sampleLeads.hotLead],
  qualified: [sampleLeads.qualifiedLead],
  nurturing: [sampleLeads.nurturingLead],
  dead: [sampleLeads.deadLead],
  converted: [sampleLeads.convertedLead],
};

// Lead list for CRM testing
export const leadList = {
  id: 'list-001',
  name: 'March 2024 Hot Leads',
  description: 'Leads with motivation score 7+',
  leadCount: 15,
  createdAt: '2024-03-01T00:00:00Z',
  updatedAt: '2024-03-12T00:00:00Z',
  filters: {
    motivationScore: { min: 7 },
    status: ['new', 'contacted', 'qualified', 'hot'],
  },
  leads: [sampleLeads.hotLead, sampleLeads.qualifiedLead],
};

// Lead engagement metrics
export const leadEngagementMetrics = {
  totalLeads: 250,
  byStatus: {
    new: 45,
    contacted: 80,
    qualified: 35,
    nurturing: 50,
    hot: 15,
    converted: 20,
    dead: 5,
  },
  bySource: {
    website: 40,
    cold_call: 50,
    mailer: 60,
    referral: 25,
    driving_for_dollars: 30,
    sms_campaign: 25,
    other: 20,
  },
  avgMotivationScore: 5.2,
  conversionRate: 8.0,
  avgTimeToConvert: 21, // days
};

// Skip trace result mock
export const skipTraceResult = {
  leadId: 'lead-new-001',
  status: 'complete',
  confidence: 0.92,
  phones: [
    { number: '+1-555-100-1001', type: 'mobile', verified: true },
    { number: '+1-555-100-1002', type: 'landline', verified: false },
  ],
  emails: [
    { address: 'michael.w@email.com', verified: true },
    { address: 'mwilliams@work.com', verified: false },
  ],
  addresses: [
    { address: '123 Prospect Ave, Miami, FL 33101', type: 'property', current: true },
    { address: '500 Other St, Miami, FL 33102', type: 'mailing', current: true },
  ],
  relatives: [
    { name: 'Susan Williams', relationship: 'spouse' },
  ],
  bankruptcies: [],
  liens: [],
  creditsUsed: 1,
  timestamp: '2024-03-12T08:05:00Z',
};
