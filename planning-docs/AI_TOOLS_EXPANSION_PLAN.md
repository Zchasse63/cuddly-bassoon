# AI Tools Expansion Plan

> **30 New AI Tools to Address Workflow Gaps and Edge Cases**
> 
> Version: 1.0
> Last Updated: December 2024
> Current Tool Count: 153 tools across 17 categories

---

## Executive Summary

This document outlines 30 new AI tools identified through comprehensive edge case analysis of user workflows. These tools address gaps in batch operations, predictive analytics, document generation, competitive intelligence, and cross-functional workflows.

---

## Table of Contents

1. [Priority Tier 1: Critical Workflow Gaps](#priority-tier-1-critical-workflow-gaps)
2. [Priority Tier 2: Enhanced User Experience](#priority-tier-2-enhanced-user-experience)
3. [Priority Tier 3: Advanced Capabilities](#priority-tier-3-advanced-capabilities)
4. [Implementation Guidelines](#implementation-guidelines)
5. [Tool Specifications](#tool-specifications)

---

## Priority Tier 1: Critical Workflow Gaps

**10 tools addressing immediate pain points**

### 1.1 Batch Operations (4 tools)

| Tool ID | Name | Description | Category |
|---------|------|-------------|----------|
| `batch.skip_trace_bulk` | Bulk Skip Trace | Skip trace multiple properties in one request | skip-trace |
| `batch.add_to_list_bulk` | Bulk Add to List | Add multiple properties to lead lists | crm |
| `batch.update_deal_status` | Bulk Deal Status Update | Update status for multiple deals | deal-pipeline |
| `batch.export_properties` | Bulk Property Export | Export filtered properties to CSV/Excel | utility |

### 1.2 Document Generation (3 tools)

| Tool ID | Name | Description | Category |
|---------|------|-------------|----------|
| `docs.generate_offer_letter` | Generate Offer Letter | Create customized offer letters | documents |
| `docs.generate_deal_summary` | Generate Deal Summary | Create investor-ready deal summaries | documents |
| `docs.generate_comp_report` | Generate Comp Report | Create comparable sales report | documents |

### 1.3 Workflow Automation (3 tools)

| Tool ID | Name | Description | Category |
|---------|------|-------------|----------|
| `workflow.auto_follow_up` | Schedule Auto Follow-Up | Set automated follow-up sequences | automation |
| `workflow.deal_stage_trigger` | Deal Stage Triggers | Configure actions on stage changes | automation |
| `workflow.alert_on_match` | Buyer Match Alert | Notify when property matches buyer criteria | automation |

---

## Priority Tier 2: Enhanced User Experience

**10 tools improving efficiency and insights**

### 2.1 Predictive Analytics (4 tools)

| Tool ID | Name | Description | Category |
|---------|------|-------------|----------|
| `predict.seller_motivation` | Predict Seller Motivation | ML-based motivation scoring | analytics |
| `predict.deal_close_probability` | Deal Close Probability | Predict likelihood of deal closing | analytics |
| `predict.optimal_offer_price` | Optimal Offer Calculator | Calculate best offer based on signals | analytics |
| `predict.time_to_close` | Time to Close Estimator | Estimate days to close deal | analytics |

### 2.2 Competitive Intelligence (3 tools)

| Tool ID | Name | Description | Category |
|---------|------|-------------|----------|
| `intel.competitor_activity` | Competitor Activity Tracker | Track other investors in area | market-analysis |
| `intel.market_saturation` | Market Saturation Analysis | Analyze investor density | market-analysis |
| `intel.emerging_markets` | Emerging Markets Detector | Find under-served markets | market-analysis |

### 2.3 Communication Tools (3 tools)

| Tool ID | Name | Description | Category |
|---------|------|-------------|----------|
| `comms.generate_sms_template` | Generate SMS Template | Create personalized SMS | communications |
| `comms.generate_email_sequence` | Generate Email Sequence | Create drip campaigns | communications |
| `comms.talking_points` | Generate Talking Points | Create call scripts | communications |

---

## Priority Tier 3: Advanced Capabilities

**10 tools for power users and scaling**

### 3.1 Portfolio Analysis (3 tools)

| Tool ID | Name | Description | Category |
|---------|------|-------------|----------|
| `portfolio.performance_summary` | Portfolio Performance | Analyze deal performance over time | analytics |
| `portfolio.roi_by_strategy` | ROI by Strategy | Compare returns across strategies | analytics |
| `portfolio.geographic_concentration` | Geographic Analysis | Analyze portfolio distribution | analytics |

### 3.2 Advanced Search (3 tools)

| Tool ID | Name | Description | Category |
|---------|------|-------------|----------|
| `search.similar_to_deal` | Find Similar Deals | Find properties like successful deals | search |
| `search.buyer_property_match` | Match Properties to Buyers | Reverse search: start with buyer | search |
| `search.permit_pattern_match` | Permit Pattern Search | Find properties with specific permit patterns | search |

### 3.3 Integration & Sync (2 tools)

| Tool ID | Name | Description | Category |
|---------|------|-------------|----------|
| `sync.crm_export` | CRM Export | Sync data to external CRMs | integrations |
| `sync.calendar_integration` | Calendar Sync | Sync follow-ups to calendar | integrations |

### 3.4 Map Control (2 tools)

| Tool ID | Name | Description | Category |
|---------|------|-------------|----------|
| `map.draw_search_area` | Draw Search Area | Create custom polygon search | map |
| `map.compare_areas` | Compare Areas | Side-by-side area comparison | map |

---

## Implementation Guidelines

### New Category: `documents`

```typescript
// Add to src/lib/ai/tools/types.ts
export type ToolCategory =
  // ... existing categories
  | 'documents'      // NEW: Document generation
  | 'automation'     // NEW: Workflow automation
  | 'communications' // NEW: Outreach tools
  | 'integrations'   // NEW: External system sync
  | 'map';           // NEW: Map control tools
```

### File Structure

```
src/lib/ai/tools/categories/
├── existing files...
├── document-tools.ts      # docs.* tools
├── automation-tools.ts    # workflow.* tools
├── predictive-tools.ts    # predict.* tools
├── intelligence-tools.ts  # intel.* tools
├── communication-tools.ts # comms.* tools
├── portfolio-tools.ts     # portfolio.* tools
├── batch-tools.ts         # batch.* tools
├── integration-tools.ts   # sync.* tools
└── map-tools.ts           # map.* tools
```

---

## Tool Specifications

### Tier 1 Tool Specifications

#### 1. `batch.skip_trace_bulk`

```typescript
{
  id: 'batch.skip_trace_bulk',
  name: 'Bulk Skip Trace',
  description: 'Skip trace multiple properties in a single batch operation. Returns contact information for property owners.',
  category: 'skip-trace',
  inputSchema: z.object({
    propertyIds: z.array(z.string()).min(1).max(100).describe('Array of property IDs to skip trace'),
    includeEmail: z.boolean().optional().default(true),
    includePhone: z.boolean().optional().default(true),
    includeRelatives: z.boolean().optional().default(false),
  }),
  outputSchema: z.object({
    successful: z.number(),
    failed: z.number(),
    results: z.array(z.object({
      propertyId: z.string(),
      status: z.enum(['success', 'not_found', 'error']),
      ownerName: z.string().optional(),
      phones: z.array(z.string()).optional(),
      emails: z.array(z.string()).optional(),
    })),
    creditsUsed: z.number(),
  }),
}
```

#### 2. `batch.add_to_list_bulk`

```typescript
{
  id: 'batch.add_to_list_bulk',
  name: 'Bulk Add to List',
  description: 'Add multiple properties to a lead list in one operation.',
  category: 'crm',
  inputSchema: z.object({
    listId: z.string().describe('Target list ID'),
    propertyIds: z.array(z.string()).min(1).max(500),
    skipDuplicates: z.boolean().optional().default(true),
    tags: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    added: z.number(),
    skipped: z.number(),
    duplicates: z.number(),
    listName: z.string(),
    totalInList: z.number(),
  }),
}
```

#### 3. `batch.update_deal_status`

```typescript
{
  id: 'batch.update_deal_status',
  name: 'Bulk Deal Status Update',
  description: 'Update status for multiple deals simultaneously.',
  category: 'deal-pipeline',
  inputSchema: z.object({
    dealIds: z.array(z.string()).min(1).max(100),
    newStatus: z.enum(['lead', 'contacted', 'negotiating', 'under_contract', 'closed', 'dead']),
    note: z.string().optional().describe('Note to add to all deals'),
    updateTimestamp: z.boolean().optional().default(true),
  }),
  outputSchema: z.object({
    updated: z.number(),
    failed: z.number(),
    previousStatuses: z.record(z.string(), z.string()),
  }),
}
```

#### 4. `batch.export_properties`

```typescript
{
  id: 'batch.export_properties',
  name: 'Bulk Property Export',
  description: 'Export filtered properties to CSV or Excel format.',
  category: 'utility',
  inputSchema: z.object({
    propertyIds: z.array(z.string()).optional(),
    filters: z.object({
      listId: z.string().optional(),
      status: z.string().optional(),
      dateRange: z.object({
        start: z.string(),
        end: z.string(),
      }).optional(),
    }).optional(),
    format: z.enum(['csv', 'xlsx']).default('csv'),
    fields: z.array(z.string()).optional().describe('Specific fields to include'),
    includeSkipTraceData: z.boolean().optional().default(false),
  }),
  outputSchema: z.object({
    downloadUrl: z.string(),
    rowCount: z.number(),
    expiresAt: z.string(),
    fileSize: z.string(),
  }),
}
```

#### 5. `docs.generate_offer_letter`

```typescript
{
  id: 'docs.generate_offer_letter',
  name: 'Generate Offer Letter',
  description: 'Create a customized offer letter for a property.',
  category: 'documents',
  inputSchema: z.object({
    propertyId: z.string(),
    offerPrice: z.number(),
    buyerName: z.string(),
    buyerCompany: z.string().optional(),
    closingDays: z.number().default(30),
    earnestMoney: z.number().optional(),
    contingencies: z.array(z.enum(['inspection', 'financing', 'appraisal', 'title'])).optional(),
    personalNote: z.string().optional(),
    template: z.enum(['formal', 'friendly', 'urgent']).default('formal'),
  }),
  outputSchema: z.object({
    letterContent: z.string(),
    downloadUrl: z.string(),
    format: z.string(),
  }),
}
```

#### 6. `docs.generate_deal_summary`

```typescript
{
  id: 'docs.generate_deal_summary',
  name: 'Generate Deal Summary',
  description: 'Create an investor-ready deal summary with financials and property details.',
  category: 'documents',
  inputSchema: z.object({
    propertyId: z.string(),
    dealId: z.string().optional(),
    includeComps: z.boolean().default(true),
    includePhotos: z.boolean().default(true),
    includeRepairEstimate: z.boolean().default(true),
    targetAudience: z.enum(['flipper', 'landlord', 'developer']).default('flipper'),
  }),
  outputSchema: z.object({
    summaryContent: z.string(),
    downloadUrl: z.string(),
    highlights: z.array(z.string()),
    keyMetrics: z.object({
      arv: z.number(),
      repairCost: z.number(),
      mao: z.number(),
      potentialProfit: z.number(),
    }),
  }),
}
```

#### 7. `docs.generate_comp_report`

```typescript
{
  id: 'docs.generate_comp_report',
  name: 'Generate Comp Report',
  description: 'Create a professional comparable sales report.',
  category: 'documents',
  inputSchema: z.object({
    propertyId: z.string(),
    radius: z.number().default(0.5).describe('Radius in miles'),
    maxComps: z.number().default(6),
    includeActive: z.boolean().default(true),
    includeSold: z.boolean().default(true),
    soldWithinMonths: z.number().default(6),
    adjustments: z.boolean().default(true).describe('Include price adjustments'),
  }),
  outputSchema: z.object({
    reportContent: z.string(),
    downloadUrl: z.string(),
    estimatedValue: z.object({
      low: z.number(),
      mid: z.number(),
      high: z.number(),
    }),
    compsUsed: z.number(),
  }),
}
```

#### 8. `workflow.auto_follow_up`

```typescript
{
  id: 'workflow.auto_follow_up',
  name: 'Schedule Auto Follow-Up',
  description: 'Set up automated follow-up sequences for leads.',
  category: 'automation',
  inputSchema: z.object({
    propertyIds: z.array(z.string()),
    sequence: z.array(z.object({
      dayOffset: z.number().describe('Days after initial contact'),
      channel: z.enum(['sms', 'email', 'call_reminder']),
      templateId: z.string().optional(),
      customMessage: z.string().optional(),
    })),
    startDate: z.string().optional().describe('ISO date string'),
    stopOnResponse: z.boolean().default(true),
  }),
  outputSchema: z.object({
    sequenceId: z.string(),
    propertiesEnrolled: z.number(),
    scheduledTouchpoints: z.number(),
    estimatedCompletionDate: z.string(),
  }),
}
```

#### 9. `workflow.deal_stage_trigger`

```typescript
{
  id: 'workflow.deal_stage_trigger',
  name: 'Deal Stage Triggers',
  description: 'Configure automated actions when deals move between stages.',
  category: 'automation',
  inputSchema: z.object({
    triggerId: z.string().optional().describe('Existing trigger to update'),
    fromStage: z.string(),
    toStage: z.string(),
    actions: z.array(z.object({
      type: z.enum(['notification', 'email', 'task', 'webhook', 'update_field']),
      config: z.record(z.unknown()),
    })),
    isActive: z.boolean().default(true),
  }),
  outputSchema: z.object({
    triggerId: z.string(),
    status: z.enum(['created', 'updated', 'activated', 'deactivated']),
  }),
}
```

#### 10. `workflow.alert_on_match`

```typescript
{
  id: 'workflow.alert_on_match',
  name: 'Buyer Match Alert',
  description: 'Configure alerts when new properties match buyer criteria.',
  category: 'automation',
  inputSchema: z.object({
    buyerId: z.string(),
    alertChannels: z.array(z.enum(['email', 'sms', 'push', 'in_app'])),
    frequency: z.enum(['instant', 'daily_digest', 'weekly_digest']).default('instant'),
    minMatchScore: z.number().min(0).max(100).default(70),
    maxAlertsPerDay: z.number().optional(),
  }),
  outputSchema: z.object({
    alertId: z.string(),
    buyerName: z.string(),
    criteriaSnapshot: z.object({
      locations: z.array(z.string()),
      priceRange: z.object({ min: z.number(), max: z.number() }),
      propertyTypes: z.array(z.string()),
    }),
    status: z.string(),
  }),
}
```

---

### Tier 2 Tool Specifications

#### 11. `predict.seller_motivation`

```typescript
{
  id: 'predict.seller_motivation',
  name: 'Predict Seller Motivation',
  description: 'ML-based prediction of seller motivation level using multiple signals.',
  category: 'analytics',
  inputSchema: z.object({
    propertyId: z.string(),
    includeFactors: z.boolean().default(true).describe('Include contributing factors'),
  }),
  outputSchema: z.object({
    motivationScore: z.number().min(0).max(100),
    confidence: z.number().min(0).max(100),
    level: z.enum(['very_low', 'low', 'moderate', 'high', 'very_high']),
    factors: z.array(z.object({
      factor: z.string(),
      impact: z.enum(['positive', 'negative', 'neutral']),
      weight: z.number(),
      details: z.string(),
    })).optional(),
    recommendations: z.array(z.string()),
  }),
}
```

#### 12. `predict.deal_close_probability`

```typescript
{
  id: 'predict.deal_close_probability',
  name: 'Deal Close Probability',
  description: 'Predict likelihood of a deal closing based on current signals.',
  category: 'analytics',
  inputSchema: z.object({
    dealId: z.string(),
    includeComparison: z.boolean().default(true).describe('Compare to similar deals'),
  }),
  outputSchema: z.object({
    probability: z.number().min(0).max(100),
    confidence: z.number(),
    riskFactors: z.array(z.object({
      factor: z.string(),
      severity: z.enum(['low', 'medium', 'high']),
      mitigation: z.string(),
    })),
    similarDealsOutcome: z.object({
      total: z.number(),
      closed: z.number(),
      averageDaysToClose: z.number(),
    }).optional(),
  }),
}
```

#### 13. `predict.optimal_offer_price`

```typescript
{
  id: 'predict.optimal_offer_price',
  name: 'Optimal Offer Calculator',
  description: 'Calculate the optimal offer price based on market data and seller signals.',
  category: 'analytics',
  inputSchema: z.object({
    propertyId: z.string(),
    targetProfit: z.number().optional().describe('Minimum profit target'),
    riskTolerance: z.enum(['conservative', 'moderate', 'aggressive']).default('moderate'),
    exitStrategy: z.enum(['wholesale', 'flip', 'rental']).default('wholesale'),
  }),
  outputSchema: z.object({
    recommendedOffer: z.number(),
    offerRange: z.object({ low: z.number(), high: z.number() }),
    reasoning: z.string(),
    metrics: z.object({
      arv: z.number(),
      repairEstimate: z.number(),
      mao: z.number(),
      expectedProfit: z.number(),
      profitMargin: z.number(),
    }),
    negotiationTips: z.array(z.string()),
  }),
}
```

#### 14. `predict.time_to_close`

```typescript
{
  id: 'predict.time_to_close',
  name: 'Time to Close Estimator',
  description: 'Estimate how many days until a deal closes.',
  category: 'analytics',
  inputSchema: z.object({
    dealId: z.string(),
  }),
  outputSchema: z.object({
    estimatedDays: z.number(),
    range: z.object({ min: z.number(), max: z.number() }),
    factors: z.array(z.object({
      factor: z.string(),
      impact: z.enum(['speeds_up', 'slows_down', 'neutral']),
      days: z.number(),
    })),
    milestones: z.array(z.object({
      milestone: z.string(),
      estimatedDate: z.string(),
      status: z.enum(['completed', 'pending', 'at_risk']),
    })),
  }),
}
```

#### 15. `intel.competitor_activity`

```typescript
{
  id: 'intel.competitor_activity',
  name: 'Competitor Activity Tracker',
  description: 'Track investor activity in a geographic area.',
  category: 'market-analysis',
  inputSchema: z.object({
    location: z.object({
      zipCodes: z.array(z.string()).optional(),
      city: z.string().optional(),
      county: z.string().optional(),
      radiusMiles: z.number().optional(),
      centerPoint: z.object({ lat: z.number(), lng: z.number() }).optional(),
    }),
    timeframeDays: z.number().default(90),
    activityTypes: z.array(z.enum(['cash_purchases', 'flips', 'permits', 'llc_registrations'])).optional(),
  }),
  outputSchema: z.object({
    totalInvestors: z.number(),
    totalTransactions: z.number(),
    topInvestors: z.array(z.object({
      name: z.string(),
      transactionCount: z.number(),
      avgPurchasePrice: z.number(),
      primaryStrategy: z.string(),
    })),
    trends: z.object({
      volumeChange: z.number(),
      priceChange: z.number(),
      newEntrants: z.number(),
    }),
    heatMapData: z.array(z.object({
      lat: z.number(),
      lng: z.number(),
      intensity: z.number(),
    })),
  }),
}
```

#### 16. `intel.market_saturation`

```typescript
{
  id: 'intel.market_saturation',
  name: 'Market Saturation Analysis',
  description: 'Analyze investor density and market saturation levels.',
  category: 'market-analysis',
  inputSchema: z.object({
    location: z.string().describe('City, ZIP, or county'),
    compareToNational: z.boolean().default(true),
  }),
  outputSchema: z.object({
    saturationLevel: z.enum(['undersaturated', 'normal', 'saturated', 'oversaturated']),
    saturationScore: z.number().min(0).max(100),
    metrics: z.object({
      investorsPerThousandHomes: z.number(),
      avgDaysOnMarket: z.number(),
      wholesaleDealVolume: z.number(),
      flipVolume: z.number(),
    }),
    nationalComparison: z.object({
      percentile: z.number(),
      vsNationalAvg: z.string(),
    }).optional(),
    recommendation: z.string(),
  }),
}
```

#### 17. `intel.emerging_markets`

```typescript
{
  id: 'intel.emerging_markets',
  name: 'Emerging Markets Detector',
  description: 'Find under-served markets with growth potential.',
  category: 'market-analysis',
  inputSchema: z.object({
    state: z.string().optional(),
    region: z.enum(['northeast', 'southeast', 'midwest', 'southwest', 'west']).optional(),
    minPopulation: z.number().optional(),
    maxSaturation: z.number().optional().describe('Max saturation score 0-100'),
    growthIndicators: z.array(z.enum([
      'population_growth', 'job_growth', 'permit_activity', 'price_appreciation', 'low_inventory'
    ])).optional(),
  }),
  outputSchema: z.object({
    markets: z.array(z.object({
      location: z.string(),
      state: z.string(),
      population: z.number(),
      saturationScore: z.number(),
      opportunityScore: z.number(),
      growthIndicators: z.record(z.number()),
      topZipCodes: z.array(z.string()),
    })),
    methodology: z.string(),
  }),
}
```

#### 18. `comms.generate_sms_template`

```typescript
{
  id: 'comms.generate_sms_template',
  name: 'Generate SMS Template',
  description: 'Create personalized SMS messages for property outreach.',
  category: 'communications',
  inputSchema: z.object({
    propertyId: z.string(),
    tone: z.enum(['professional', 'friendly', 'urgent', 'casual']).default('friendly'),
    purpose: z.enum(['initial_outreach', 'follow_up', 'offer', 'closing']),
    includeOffer: z.boolean().default(false),
    offerAmount: z.number().optional(),
    senderName: z.string(),
    maxLength: z.number().default(160),
  }),
  outputSchema: z.object({
    message: z.string(),
    characterCount: z.number(),
    personalizationTokens: z.array(z.string()),
    variants: z.array(z.string()).optional(),
  }),
}
```

#### 19. `comms.generate_email_sequence`

```typescript
{
  id: 'comms.generate_email_sequence',
  name: 'Generate Email Sequence',
  description: 'Create a multi-email drip campaign for lead nurturing.',
  category: 'communications',
  inputSchema: z.object({
    campaignType: z.enum(['cold_outreach', 'follow_up', 'buyer_nurture', 'reactivation']),
    numberOfEmails: z.number().min(1).max(10).default(5),
    daysBetweenEmails: z.number().default(3),
    tone: z.enum(['professional', 'friendly', 'urgent']).default('professional'),
    senderInfo: z.object({
      name: z.string(),
      company: z.string().optional(),
      phone: z.string().optional(),
    }),
    includePropertyDetails: z.boolean().default(false),
    propertyId: z.string().optional(),
  }),
  outputSchema: z.object({
    sequenceId: z.string(),
    emails: z.array(z.object({
      order: z.number(),
      subject: z.string(),
      body: z.string(),
      sendDay: z.number(),
    })),
    estimatedOpenRate: z.number(),
    tips: z.array(z.string()),
  }),
}
```

#### 20. `comms.talking_points`

```typescript
{
  id: 'comms.talking_points',
  name: 'Generate Talking Points',
  description: 'Create call scripts and talking points for seller conversations.',
  category: 'communications',
  inputSchema: z.object({
    propertyId: z.string(),
    callPurpose: z.enum(['initial_contact', 'follow_up', 'negotiation', 'closing']),
    sellerMotivation: z.enum(['unknown', 'low', 'moderate', 'high']).optional(),
    objections: z.array(z.string()).optional().describe('Known objections to address'),
    includeQuestions: z.boolean().default(true),
  }),
  outputSchema: z.object({
    opener: z.string(),
    keyPoints: z.array(z.object({
      point: z.string(),
      explanation: z.string(),
    })),
    discoveryQuestions: z.array(z.string()),
    objectionHandlers: z.array(z.object({
      objection: z.string(),
      response: z.string(),
    })),
    closingStatements: z.array(z.string()),
    doNots: z.array(z.string()),
  }),
}
```

---

### Tier 3 Tool Specifications

#### 21. `portfolio.performance_summary`

```typescript
{
  id: 'portfolio.performance_summary',
  name: 'Portfolio Performance',
  description: 'Analyze deal performance over time with key metrics.',
  category: 'analytics',
  inputSchema: z.object({
    timeframe: z.enum(['30d', '90d', '6m', '1y', 'all']).default('90d'),
    groupBy: z.enum(['month', 'quarter', 'strategy', 'location']).optional(),
  }),
  outputSchema: z.object({
    summary: z.object({
      totalDeals: z.number(),
      closedDeals: z.number(),
      totalRevenue: z.number(),
      totalProfit: z.number(),
      avgProfitPerDeal: z.number(),
      avgDaysToClose: z.number(),
      conversionRate: z.number(),
    }),
    trends: z.array(z.object({
      period: z.string(),
      deals: z.number(),
      revenue: z.number(),
      profit: z.number(),
    })),
    topDeals: z.array(z.object({
      dealId: z.string(),
      address: z.string(),
      profit: z.number(),
    })),
  }),
}
```

#### 22. `portfolio.roi_by_strategy`

```typescript
{
  id: 'portfolio.roi_by_strategy',
  name: 'ROI by Strategy',
  description: 'Compare returns across different investment strategies.',
  category: 'analytics',
  inputSchema: z.object({
    timeframe: z.enum(['6m', '1y', '2y', 'all']).default('1y'),
    strategies: z.array(z.enum(['wholesale', 'flip', 'rental', 'novation', 'subject_to'])).optional(),
  }),
  outputSchema: z.object({
    comparison: z.array(z.object({
      strategy: z.string(),
      dealCount: z.number(),
      totalInvested: z.number(),
      totalReturns: z.number(),
      avgROI: z.number(),
      avgTimeToProfit: z.number(),
      riskScore: z.number(),
    })),
    recommendation: z.string(),
    insights: z.array(z.string()),
  }),
}
```

#### 23. `portfolio.geographic_concentration`

```typescript
{
  id: 'portfolio.geographic_concentration',
  name: 'Geographic Analysis',
  description: 'Analyze portfolio distribution and geographic concentration risk.',
  category: 'analytics',
  inputSchema: z.object({
    groupBy: z.enum(['state', 'city', 'zip', 'county']).default('city'),
  }),
  outputSchema: z.object({
    distribution: z.array(z.object({
      location: z.string(),
      dealCount: z.number(),
      percentage: z.number(),
      totalValue: z.number(),
      avgProfit: z.number(),
    })),
    concentrationRisk: z.enum(['low', 'moderate', 'high']),
    diversificationScore: z.number(),
    recommendations: z.array(z.string()),
    mapData: z.array(z.object({
      lat: z.number(),
      lng: z.number(),
      value: z.number(),
    })),
  }),
}
```

#### 24. `search.similar_to_deal`

```typescript
{
  id: 'search.similar_to_deal',
  name: 'Find Similar Deals',
  description: 'Find properties similar to your successful deals.',
  category: 'search',
  inputSchema: z.object({
    referencePropertyId: z.string().optional(),
    referenceDealId: z.string().optional(),
    similarityFactors: z.array(z.enum([
      'price_range', 'property_type', 'location', 'condition', 'seller_motivation', 'equity'
    ])).optional(),
    radius: z.number().optional().describe('Search radius in miles'),
    limit: z.number().default(20),
  }),
  outputSchema: z.object({
    properties: z.array(z.object({
      propertyId: z.string(),
      address: z.string(),
      similarityScore: z.number(),
      matchingFactors: z.array(z.string()),
      estimatedProfit: z.number().optional(),
    })),
    searchCriteria: z.record(z.unknown()),
  }),
}
```

#### 25. `search.buyer_property_match`

```typescript
{
  id: 'search.buyer_property_match',
  name: 'Match Properties to Buyers',
  description: 'Find properties that match a specific buyer\'s criteria.',
  category: 'search',
  inputSchema: z.object({
    buyerId: z.string(),
    expandCriteria: z.boolean().default(false).describe('Expand search beyond exact match'),
    limit: z.number().default(25),
    includeOffMarket: z.boolean().default(true),
  }),
  outputSchema: z.object({
    buyer: z.object({
      name: z.string(),
      criteria: z.record(z.unknown()),
    }),
    matches: z.array(z.object({
      propertyId: z.string(),
      address: z.string(),
      matchScore: z.number(),
      matchingCriteria: z.array(z.string()),
      missingCriteria: z.array(z.string()),
      estimatedARV: z.number(),
      potentialSpread: z.number(),
    })),
    recommendedActions: z.array(z.string()),
  }),
}
```

#### 26. `search.permit_pattern_match`

```typescript
{
  id: 'search.permit_pattern_match',
  name: 'Permit Pattern Search',
  description: 'Find properties with specific permit activity patterns.',
  category: 'search',
  inputSchema: z.object({
    location: z.string(),
    patterns: z.array(z.enum([
      'stalled_renovation',      // Permit opened but not closed
      'recent_major_work',       // Large permits recently completed
      'unpermitted_work',        // Signs of work without permits
      'electrical_upgrade',      // Electrical panel upgrades
      'solar_installation',      // Solar permits
      'adu_potential',           // ADU-ready properties
      'foundation_issues',       // Foundation/structural permits
    ])),
    timeframeDays: z.number().default(365),
    limit: z.number().default(50),
  }),
  outputSchema: z.object({
    properties: z.array(z.object({
      propertyId: z.string(),
      address: z.string(),
      matchedPatterns: z.array(z.string()),
      permits: z.array(z.object({
        type: z.string(),
        status: z.string(),
        date: z.string(),
        value: z.number().optional(),
      })),
      investmentSignal: z.enum(['buy', 'avoid', 'investigate']),
    })),
    patternInsights: z.record(z.string()),
  }),
}
```

#### 27. `sync.crm_export`

```typescript
{
  id: 'sync.crm_export',
  name: 'CRM Export',
  description: 'Export data to external CRM systems.',
  category: 'integrations',
  inputSchema: z.object({
    destination: z.enum(['podio', 'hubspot', 'salesforce', 'followup_boss', 'csv']),
    dataType: z.enum(['leads', 'deals', 'buyers', 'properties']),
    filters: z.object({
      dateRange: z.object({ start: z.string(), end: z.string() }).optional(),
      status: z.array(z.string()).optional(),
      listIds: z.array(z.string()).optional(),
    }).optional(),
    fieldMapping: z.record(z.string()).optional().describe('Custom field mappings'),
  }),
  outputSchema: z.object({
    exportId: z.string(),
    recordCount: z.number(),
    status: z.enum(['completed', 'pending', 'failed']),
    downloadUrl: z.string().optional(),
    syncedAt: z.string(),
    errors: z.array(z.string()).optional(),
  }),
}
```

#### 28. `sync.calendar_integration`

```typescript
{
  id: 'sync.calendar_integration',
  name: 'Calendar Sync',
  description: 'Sync follow-ups and appointments to calendar.',
  category: 'integrations',
  inputSchema: z.object({
    provider: z.enum(['google', 'outlook', 'apple']),
    action: z.enum(['sync_all', 'sync_selected', 'get_status']),
    eventTypes: z.array(z.enum(['follow_ups', 'appointments', 'deadlines', 'closings'])).optional(),
    dealIds: z.array(z.string()).optional(),
  }),
  outputSchema: z.object({
    status: z.string(),
    eventsSynced: z.number(),
    calendarId: z.string(),
    nextSync: z.string(),
    conflicts: z.array(z.object({
      eventId: z.string(),
      issue: z.string(),
    })).optional(),
  }),
}
```

#### 29. `map.draw_search_area`

```typescript
{
  id: 'map.draw_search_area',
  name: 'Draw Search Area',
  description: 'Create a custom polygon search area on the map.',
  category: 'map',
  inputSchema: z.object({
    areaName: z.string().optional(),
    polygon: z.array(z.object({
      lat: z.number(),
      lng: z.number(),
    })).min(3).describe('Polygon vertices'),
    saveArea: z.boolean().default(true),
    searchImmediately: z.boolean().default(true),
  }),
  outputSchema: z.object({
    areaId: z.string(),
    areaName: z.string(),
    squareMiles: z.number(),
    propertyCount: z.number(),
    bounds: z.object({
      north: z.number(),
      south: z.number(),
      east: z.number(),
      west: z.number(),
    }),
  }),
}
```

#### 30. `map.compare_areas`

```typescript
{
  id: 'map.compare_areas',
  name: 'Compare Areas',
  description: 'Side-by-side comparison of multiple geographic areas.',
  category: 'map',
  inputSchema: z.object({
    areas: z.array(z.object({
      areaId: z.string().optional(),
      zipCode: z.string().optional(),
      city: z.string().optional(),
      customPolygon: z.array(z.object({ lat: z.number(), lng: z.number() })).optional(),
    })).min(2).max(4),
    metrics: z.array(z.enum([
      'avg_price', 'price_growth', 'days_on_market', 'inventory',
      'distressed_ratio', 'investor_activity', 'permit_activity', 'rental_yield'
    ])).optional(),
  }),
  outputSchema: z.object({
    comparison: z.array(z.object({
      areaName: z.string(),
      metrics: z.record(z.number()),
      ranking: z.number(),
      recommendation: z.string(),
    })),
    winner: z.object({
      areaName: z.string(),
      reason: z.string(),
    }),
    visualizationData: z.array(z.object({
      metric: z.string(),
      values: z.array(z.object({
        area: z.string(),
        value: z.number(),
      })),
    })),
  }),
}
```

---

## Implementation Checklist

### Phase 1: Tier 1 Tools (Week 1-2)

- [ ] Create `batch-tools.ts` with 4 batch operation tools
- [ ] Create `document-tools.ts` with 3 document generation tools
- [ ] Create `automation-tools.ts` with 3 workflow tools
- [ ] Add new ToolCategory types to `types.ts`
- [ ] Register all tools in `index.ts`
- [ ] Write unit tests for each tool

### Phase 2: Tier 2 Tools (Week 3-4)

- [ ] Create `predictive-tools.ts` with 4 prediction tools
- [ ] Create `intelligence-tools.ts` with 3 intel tools
- [ ] Create `communication-tools.ts` with 3 comms tools
- [ ] Integrate ML models for prediction tools
- [ ] Add template system for communication tools

### Phase 3: Tier 3 Tools (Week 5-6)

- [ ] Create `portfolio-tools.ts` with 3 analytics tools
- [ ] Add advanced search tools to `search-tools.ts`
- [ ] Create `integration-tools.ts` with 2 sync tools
- [ ] Create `map-tools.ts` with 2 map control tools
- [ ] End-to-end testing of all tool chains

---

## Summary

| Priority | Tools | Focus Area | Estimated Effort |
|----------|-------|------------|------------------|
| Tier 1 | 10 | Critical workflows | 40 hours |
| Tier 2 | 10 | Enhanced UX | 60 hours |
| Tier 3 | 10 | Advanced features | 80 hours |
| **Total** | **30** | | **180 hours** |

---

*Document generated for Scout AI-First Real Estate Platform*

