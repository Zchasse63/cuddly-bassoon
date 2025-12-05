/**
 * AI Tool Discovery Registry
 *
 * Maps internal tool slugs to user-friendly metadata for the discovery UI.
 * This registry powers onboarding, command palette, and tool transparency features.
 */

import { DiscoveryToolDefinition, DiscoveryCategory } from './types';

/**
 * Tool Registry - User-friendly metadata for all AI tools
 *
 * Tools are organized by what users want to accomplish, not by technical function.
 * Each tool includes example prompts that teach users effective usage patterns.
 */
export const toolRegistry: DiscoveryToolDefinition[] = [
  // ==========================================
  // PROPERTY SEARCH TOOLS
  // ==========================================
  {
    slug: 'property_search.search',
    displayName: 'Natural Language Search',
    shortDescription: 'Find properties by describing what you\'re looking for',
    fullDescription:
      'Search the property database using plain English. Describe the type of properties you want (location, bedrooms, price range, owner characteristics) and the AI will find matching results. Supports all standard filters plus contrarian filters like "tired landlords" and "underwater owners".',
    category: 'property-search',
    icon: 'Search',
    examples: [
      {
        prompt: 'Find 3 bed houses in Tampa with tired landlords under $200k',
        description: 'Combines property specs with motivation filters',
        resultPreview: 'Property list with equity and motivation scores',
      },
      {
        prompt: 'High equity absentee owners in 33607',
        description: 'Filter-focused search by zip code',
        resultPreview: 'Properties with 50%+ equity, non-owner occupied',
      },
      {
        prompt: 'Free and clear properties near downtown Orlando',
        description: 'No mortgage properties in a specific area',
        resultPreview: 'Properties with no outstanding loans',
      },
    ],
    keywords: ['find', 'search', 'properties', 'houses', 'filter', 'landlord', 'equity', 'absentee'],
    isPrimary: true,
    isAdvanced: false,
    requiresContext: ['none'],
  },
  {
    slug: 'property_search.get_details',
    displayName: 'Property Details',
    shortDescription: 'Get complete information about a specific property',
    fullDescription:
      'Retrieve detailed information about any property including owner info, valuation, liens, permits, and more.',
    category: 'property-search',
    icon: 'Home',
    examples: [
      {
        prompt: 'Tell me about 123 Main St, Tampa FL',
        description: 'Get full property details by address',
        resultPreview: 'Complete property profile',
      },
      {
        prompt: 'What can you tell me about this property?',
        description: 'When viewing a property, get AI summary',
        resultPreview: 'AI-generated property analysis',
      },
    ],
    keywords: ['details', 'info', 'property', 'lookup', 'address'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none', 'property'],
  },

  // ==========================================
  // DEAL ANALYSIS TOOLS
  // ==========================================
  {
    slug: 'deal_analysis.analyze',
    displayName: 'Deal Analysis',
    shortDescription: 'Get complete analysis on any property',
    fullDescription:
      'Comprehensive deal analysis including ARV estimate, repair cost estimation, equity calculation, cash flow projections, and AI-powered deal scoring. The analysis considers comparable sales, market conditions, and your target profit margins.',
    category: 'deal-analysis',
    icon: 'Calculator',
    examples: [
      {
        prompt: 'Analyze 123 Main St, Tampa FL',
        description: 'Full deal analysis by address',
        resultPreview: 'ARV, repair estimate, MAO, deal score',
      },
      {
        prompt: 'Is this a good wholesale deal?',
        description: 'When viewing a property, get a deal assessment',
        resultPreview: 'Deal recommendation with reasoning',
      },
      {
        prompt: 'Run the numbers on this property at $150k purchase price',
        description: 'Analysis with custom purchase price',
        resultPreview: 'Profit projections at specified price',
      },
    ],
    keywords: ['analyze', 'analysis', 'deal', 'numbers', 'arv', 'profit', 'evaluate'],
    isPrimary: true,
    isAdvanced: false,
    requiresContext: ['none', 'property'],
  },
  {
    slug: 'deal_analysis.calculate_mao',
    displayName: 'Calculate MAO',
    shortDescription: 'Calculate Maximum Allowable Offer for a property',
    fullDescription:
      'Calculate your Maximum Allowable Offer using the 70% rule or custom formula. Factors in ARV, estimated repairs, and your target profit margin.',
    category: 'deal-analysis',
    icon: 'Calculator',
    examples: [
      {
        prompt: 'What\'s the MAO for this property?',
        description: 'Calculate max offer based on ARV and repairs',
        resultPreview: 'MAO breakdown with formula',
      },
      {
        prompt: 'Calculate MAO with $30k in repairs and $250k ARV',
        description: 'Custom inputs for MAO calculation',
        resultPreview: 'Detailed MAO calculation',
      },
    ],
    keywords: ['mao', 'offer', 'maximum', 'allowable', '70%', 'formula'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none', 'property'],
  },
  {
    slug: 'deal_analysis.score',
    displayName: 'Score Deal',
    shortDescription: 'Get an AI-powered deal score',
    fullDescription:
      'Get a comprehensive deal score (1-100) based on profit potential, risk factors, market conditions, and comparable transactions.',
    category: 'deal-analysis',
    icon: 'Star',
    examples: [
      {
        prompt: 'Score this deal for me',
        description: 'Get AI deal score for current property',
        resultPreview: 'Score with breakdown of factors',
      },
    ],
    keywords: ['score', 'rating', 'evaluate', 'grade'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property', 'deal'],
  },

  // ==========================================
  // BUYER INTELLIGENCE TOOLS
  // ==========================================
  {
    slug: 'buyer_management.match_buyers_to_property',
    displayName: 'Find Matching Buyers',
    shortDescription: 'Discover cash buyers for a specific deal',
    fullDescription:
      'Search the buyer database to find investors whose buying criteria match your property. Results are ranked by match strength based on their historical purchase patterns, stated preferences, and recent activity in the area.',
    category: 'buyer-intelligence',
    icon: 'UserSearch',
    examples: [
      {
        prompt: 'Who\'s buying 3 beds in this zip code?',
        description: 'Find active buyers by property type and area',
        resultPreview: 'Buyer list with match scores and contact info',
      },
      {
        prompt: 'Find buyers for this property',
        description: 'When viewing a property, find matching buyers',
        resultPreview: 'Ranked buyer matches based on criteria',
      },
      {
        prompt: 'Show me the most active cash buyers in Tampa',
        description: 'Find high-volume investors in an area',
        resultPreview: 'Buyers sorted by transaction volume',
      },
    ],
    keywords: ['buyers', 'investors', 'cash buyer', 'match', 'disposition', 'assign'],
    isPrimary: true,
    isAdvanced: false,
    requiresContext: ['none', 'property', 'deal'],
  },
  {
    slug: 'buyer_management.search_buyers',
    displayName: 'Search Buyers',
    shortDescription: 'Search your buyer database',
    fullDescription:
      'Search through your buyer contacts by name, criteria, location, or tags.',
    category: 'buyer-intelligence',
    icon: 'Users',
    examples: [
      {
        prompt: 'Show me all buyers interested in Tampa duplexes',
        description: 'Search by criteria and location',
        resultPreview: 'Filtered buyer list',
      },
      {
        prompt: 'Find buyers who closed deals last month',
        description: 'Search by activity',
        resultPreview: 'Active buyers with recent transactions',
      },
    ],
    keywords: ['search', 'find', 'buyers', 'list'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },
  {
    slug: 'buyer_management.get_buyer_insights',
    displayName: 'Buyer Insights',
    shortDescription: 'Get analytics on a buyer',
    fullDescription:
      'Deep dive into a buyer\'s purchase history, preferences, and behavior patterns.',
    category: 'buyer-intelligence',
    icon: 'BarChart3',
    examples: [
      {
        prompt: 'Tell me about this buyer\'s purchase history',
        description: 'Get buying pattern analysis',
        resultPreview: 'Transaction history and preferences',
      },
    ],
    keywords: ['insights', 'analytics', 'buyer', 'history'],
    isPrimary: false,
    isAdvanced: true,
    requiresContext: ['buyer'],
  },

  // ==========================================
  // MARKET RESEARCH TOOLS
  // ==========================================
  {
    slug: 'market.get_trends',
    displayName: 'Market Overview',
    shortDescription: 'Get market statistics and trends for an area',
    fullDescription:
      'Retrieve comprehensive market data including median prices, days on market, inventory levels, price trends, and the Market Velocity Index. Data is available at city, zip code, and neighborhood levels.',
    category: 'market-research',
    icon: 'TrendingUp',
    examples: [
      {
        prompt: 'How\'s the Tampa market doing?',
        description: 'General market health check',
        resultPreview: 'Key metrics with trend indicators',
      },
      {
        prompt: 'What\'s the median price in 33607?',
        description: 'Specific metric for a zip code',
        resultPreview: 'Median price with historical context',
      },
      {
        prompt: 'Compare markets: Tampa vs Orlando for wholesaling',
        description: 'Side-by-side market comparison',
        resultPreview: 'Comparison table with key metrics',
      },
    ],
    keywords: ['market', 'stats', 'trends', 'median', 'prices', 'inventory', 'days on market'],
    isPrimary: true,
    isAdvanced: false,
    requiresContext: ['none'],
  },
  {
    slug: 'market_velocity.get_velocity',
    displayName: 'Market Velocity Index',
    shortDescription: 'Check how fast a market is moving',
    fullDescription:
      'Get the Market Velocity Index (MVI) for any area. Higher velocity indicates a faster-moving market with more opportunity.',
    category: 'market-research',
    icon: 'Gauge',
    examples: [
      {
        prompt: 'What\'s the market velocity in Tampa?',
        description: 'Get MVI for a city',
        resultPreview: 'Velocity score with interpretation',
      },
      {
        prompt: 'Find hot markets in Florida',
        description: 'Discover high-velocity areas',
        resultPreview: 'Ranked markets by velocity',
      },
    ],
    keywords: ['velocity', 'speed', 'hot', 'moving', 'fast'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },
  {
    slug: 'market.compare_markets',
    displayName: 'Compare Markets',
    shortDescription: 'Side-by-side market comparison',
    fullDescription:
      'Compare two or more markets across key metrics to identify the best opportunities.',
    category: 'market-research',
    icon: 'GitCompare',
    examples: [
      {
        prompt: 'Compare Tampa and Orlando markets',
        description: 'Two-market comparison',
        resultPreview: 'Side-by-side metrics table',
      },
    ],
    keywords: ['compare', 'versus', 'vs', 'markets'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },

  // ==========================================
  // VALUATION TOOLS
  // ==========================================
  {
    slug: 'property.comps',
    displayName: 'Comparable Sales',
    shortDescription: 'Find recent comparable sales for valuation',
    fullDescription:
      'Pull comparable sales within a specified radius of a subject property. Comps are filtered by property type, size, and recency. Each comp includes sale price, price per square foot, days on market, and an explanation of how it compares to the subject.',
    category: 'valuation',
    icon: 'Scale',
    examples: [
      {
        prompt: 'Pull comps for 123 Main St',
        description: 'Get comparable sales for a property',
        resultPreview: 'Comp list with prices and adjustments',
      },
      {
        prompt: 'Find similar sales within half a mile in the last 6 months',
        description: 'Customized comp search',
        resultPreview: 'Filtered comps with map view',
      },
      {
        prompt: 'Why did you choose these comps?',
        description: 'Get explanation of comp selection',
        resultPreview: 'Reasoning for each comparable',
      },
    ],
    keywords: ['comps', 'comparables', 'sales', 'arv', 'value', 'similar'],
    isPrimary: true,
    isAdvanced: false,
    requiresContext: ['none', 'property'],
  },
  {
    slug: 'property.valuation',
    displayName: 'Property Valuation',
    shortDescription: 'Get automated valuation estimate',
    fullDescription:
      'Get an Automated Valuation Model (AVM) estimate with confidence range and supporting data.',
    category: 'valuation',
    icon: 'DollarSign',
    examples: [
      {
        prompt: 'What\'s this property worth?',
        description: 'Get AVM valuation',
        resultPreview: 'Value estimate with range',
      },
      {
        prompt: 'Estimate the ARV for this property',
        description: 'After-repair value estimate',
        resultPreview: 'ARV with confidence level',
      },
    ],
    keywords: ['value', 'worth', 'arv', 'avm', 'estimate'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property'],
  },
  {
    slug: 'property.repairs',
    displayName: 'Repair Estimate',
    shortDescription: 'Estimate repair costs for a property',
    fullDescription:
      'Get an AI-powered repair cost estimate based on property condition, age, and market rates.',
    category: 'valuation',
    icon: 'Hammer',
    examples: [
      {
        prompt: 'Estimate repair costs for this property',
        description: 'Get rehab estimate',
        resultPreview: 'Itemized repair estimate',
      },
    ],
    keywords: ['repairs', 'rehab', 'renovation', 'costs', 'estimate'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property'],
  },

  // ==========================================
  // OUTREACH TOOLS
  // ==========================================
  {
    slug: 'comms.generate_sms_template',
    displayName: 'Generate SMS',
    shortDescription: 'Create personalized text messages for sellers',
    fullDescription:
      'Generate customized SMS messages based on property data and owner circumstances. Messages are personalized but never mention sensitive situations.',
    category: 'outreach',
    icon: 'MessageSquare',
    examples: [
      {
        prompt: 'Write an SMS for this absentee owner',
        description: 'Text message outreach',
        resultPreview: 'Compliant, personalized SMS',
      },
      {
        prompt: 'Create a follow-up text for this lead',
        description: 'Follow-up message',
        resultPreview: 'Friendly follow-up SMS',
      },
    ],
    keywords: ['sms', 'text', 'message', 'outreach'],
    isPrimary: true,
    isAdvanced: false,
    requiresContext: ['property'],
  },
  {
    slug: 'comms.generate_email_sequence',
    displayName: 'Generate Email Sequence',
    shortDescription: 'Create email drip campaigns',
    fullDescription:
      'Generate a series of personalized emails for seller outreach or buyer follow-up.',
    category: 'outreach',
    icon: 'Mail',
    examples: [
      {
        prompt: 'Create an email sequence for this seller',
        description: 'Multi-email drip campaign',
        resultPreview: '3-5 email sequence',
      },
      {
        prompt: 'Write a follow-up email for this buyer',
        description: 'Single email',
        resultPreview: 'Personalized email',
      },
    ],
    keywords: ['email', 'drip', 'sequence', 'outreach'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property', 'buyer'],
  },
  {
    slug: 'comms.generate_talking_points',
    displayName: 'Generate Talking Points',
    shortDescription: 'Create call scripts and talking points',
    fullDescription:
      'Generate voicemail scripts or cold call talking points based on the property and owner situation.',
    category: 'outreach',
    icon: 'Phone',
    examples: [
      {
        prompt: 'Write a voicemail script for this property',
        description: 'Cold call voicemail',
        resultPreview: 'Natural-sounding script',
      },
      {
        prompt: 'Give me talking points for this owner call',
        description: 'Call preparation',
        resultPreview: 'Key points and objection handlers',
      },
    ],
    keywords: ['voicemail', 'call', 'script', 'talking points'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property'],
  },

  // ==========================================
  // SKIP TRACING TOOLS
  // ==========================================
  {
    slug: 'skip_trace.lookup',
    displayName: 'Skip Trace Owner',
    shortDescription: 'Get phone numbers and emails for property owners',
    fullDescription:
      'Look up contact information for property owners including phone numbers (mobile, landline), email addresses, and alternative contacts. Results include confidence scores.',
    category: 'skip-tracing',
    icon: 'Phone',
    examples: [
      {
        prompt: 'Get contact info for this owner',
        description: 'Skip trace current property',
        resultPreview: 'Phone numbers and emails with confidence scores',
      },
      {
        prompt: 'Find the owner\'s phone number',
        description: 'Quick phone lookup',
        resultPreview: 'Phone numbers ranked by confidence',
      },
    ],
    keywords: ['skip', 'trace', 'phone', 'email', 'contact', 'owner', 'number'],
    isPrimary: true,
    isAdvanced: false,
    requiresContext: ['property'],
  },
  {
    slug: 'skip_trace.batch_lookup',
    displayName: 'Batch Skip Trace',
    shortDescription: 'Skip trace multiple properties at once',
    fullDescription:
      'Look up contact information for multiple property owners in a single request.',
    category: 'skip-tracing',
    icon: 'Users',
    examples: [
      {
        prompt: 'Skip trace all properties in my list',
        description: 'Bulk skip tracing',
        resultPreview: 'Contact info for entire list',
      },
    ],
    keywords: ['bulk', 'batch', 'multiple', 'skip trace'],
    isPrimary: false,
    isAdvanced: true,
    requiresContext: ['list'],
  },

  // ==========================================
  // DEAL PIPELINE TOOLS
  // ==========================================
  {
    slug: 'pipeline.add_activity',
    displayName: 'Add to Pipeline',
    shortDescription: 'Move a property into your deal pipeline',
    fullDescription:
      'Add a property to your deal pipeline at a specific stage. Track your deals from initial contact through closing.',
    category: 'pipeline',
    icon: 'GitBranch',
    examples: [
      {
        prompt: 'Add this to my pipeline',
        description: 'Start tracking a deal',
        resultPreview: 'Deal card created in pipeline',
      },
      {
        prompt: 'Move this deal to Under Contract',
        description: 'Update deal stage',
        resultPreview: 'Deal moved to new stage',
      },
    ],
    keywords: ['pipeline', 'deal', 'stage', 'track', 'under contract', 'prospect'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property', 'deal'],
  },
  {
    slug: 'pipeline.analyze_pipeline',
    displayName: 'Analyze Pipeline',
    shortDescription: 'Get insights on your deal pipeline',
    fullDescription:
      'Analyze your pipeline health, identify bottlenecks, and get recommendations.',
    category: 'pipeline',
    icon: 'BarChart3',
    examples: [
      {
        prompt: 'How\'s my pipeline looking?',
        description: 'Pipeline health check',
        resultPreview: 'Pipeline analysis with recommendations',
      },
      {
        prompt: 'What deals need attention?',
        description: 'Find stalled deals',
        resultPreview: 'Deals requiring action',
      },
    ],
    keywords: ['pipeline', 'analyze', 'deals', 'bottleneck'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },

  // ==========================================
  // DOCUMENT TOOLS
  // ==========================================
  {
    slug: 'docs.generate_offer_letter',
    displayName: 'Generate Offer Letter',
    shortDescription: 'Create a property offer letter',
    fullDescription:
      'Generate a professional offer letter with property details, offer amount, and terms.',
    category: 'documents',
    icon: 'FileText',
    examples: [
      {
        prompt: 'Create an offer letter for this property at $150k',
        description: 'Generate offer with specific price',
        resultPreview: 'Professional offer letter',
      },
    ],
    keywords: ['offer', 'letter', 'document', 'generate'],
    isPrimary: true,
    isAdvanced: false,
    requiresContext: ['property'],
  },
  {
    slug: 'docs.generate_deal_summary',
    displayName: 'Generate Deal Summary',
    shortDescription: 'Create a deal summary report',
    fullDescription:
      'Generate a comprehensive deal summary including property details, financials, and analysis.',
    category: 'documents',
    icon: 'FileSpreadsheet',
    examples: [
      {
        prompt: 'Create a deal summary for this property',
        description: 'Full deal package',
        resultPreview: 'PDF-ready deal summary',
      },
    ],
    keywords: ['summary', 'report', 'deal', 'document'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property', 'deal'],
  },

  // ==========================================
  // PREDICTIVE / MOTIVATION TOOLS
  // ==========================================
  {
    slug: 'predict.seller_motivation',
    displayName: 'Motivation Score',
    shortDescription: 'Score seller motivation level',
    fullDescription:
      'Analyze property and owner data to predict seller motivation. Uses stratified scoring models based on owner type (Individual, Investor, Institutional).',
    category: 'deal-analysis',
    subcategory: 'motivation',
    icon: 'Target',
    examples: [
      {
        prompt: 'What\'s the motivation score for this owner?',
        description: 'Get seller motivation analysis',
        resultPreview: 'Score with factors and recommendation',
      },
      {
        prompt: 'Is this seller likely motivated?',
        description: 'Quick motivation check',
        resultPreview: 'Motivation assessment',
      },
    ],
    keywords: ['motivation', 'seller', 'score', 'motivated', 'likelihood'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property'],
  },
  {
    slug: 'predict.classify_owner',
    displayName: 'Classify Owner',
    shortDescription: 'Identify owner type and characteristics',
    fullDescription:
      'Classify property owners into categories (individual, investor entity, institutional/distressed) to inform outreach strategy.',
    category: 'deal-analysis',
    subcategory: 'motivation',
    icon: 'UserCheck',
    examples: [
      {
        prompt: 'What type of owner is this?',
        description: 'Classify the property owner',
        resultPreview: 'Owner classification with confidence',
      },
    ],
    keywords: ['owner', 'classify', 'type', 'investor', 'individual'],
    isPrimary: false,
    isAdvanced: true,
    requiresContext: ['property'],
  },

  // ==========================================
  // HELP TOOLS
  // ==========================================
  {
    slug: 'filter.explain',
    displayName: 'Explain Filter',
    shortDescription: 'Learn what a filter does and when to use it',
    fullDescription:
      'Get detailed explanations of any filter in the system, including what data it uses, why it indicates seller motivation, and strategies for using it effectively.',
    category: 'help',
    icon: 'HelpCircle',
    examples: [
      {
        prompt: 'What is a tired landlord?',
        description: 'Understand a specific filter',
        resultPreview: 'Definition with usage strategies',
      },
      {
        prompt: 'Explain the underwater landlord filter',
        description: 'Learn about contrarian filters',
        resultPreview: 'How it works and when to use it',
      },
      {
        prompt: 'What filters should I use to find motivated sellers?',
        description: 'Strategy guidance',
        resultPreview: 'Recommended filter combinations',
      },
    ],
    keywords: ['filter', 'explain', 'what is', 'how does', 'definition', 'strategy'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },

  // ==========================================
  // MAP TOOLS
  // ==========================================
  {
    slug: 'map.draw_search_area',
    displayName: 'Draw Search Area',
    shortDescription: 'Define a geographic search area on the map',
    fullDescription:
      'Create a search area by drawing on the map or specifying a radius around a point.',
    category: 'property-search',
    subcategory: 'map',
    icon: 'MapPin',
    examples: [
      {
        prompt: 'Search properties within 2 miles of downtown Tampa',
        description: 'Radius-based search',
        resultPreview: 'Properties in defined area',
      },
    ],
    keywords: ['map', 'area', 'radius', 'draw', 'geographic'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },

  // ==========================================
  // AUTOMATION TOOLS
  // ==========================================
  {
    slug: 'workflow.auto_follow_up',
    displayName: 'Auto Follow-Up',
    shortDescription: 'Set up automated follow-up sequences',
    fullDescription:
      'Configure automated follow-up actions when certain conditions are met.',
    category: 'automation',
    icon: 'Zap',
    examples: [
      {
        prompt: 'Set up auto follow-up for stalled deals',
        description: 'Configure automation',
        resultPreview: 'Automation rule created',
      },
    ],
    keywords: ['automation', 'follow-up', 'workflow', 'auto'],
    isPrimary: false,
    isAdvanced: true,
    requiresContext: ['none'],
  },
  {
    slug: 'workflow.alert_on_match',
    displayName: 'Property Alerts',
    shortDescription: 'Get notified when properties match your criteria',
    fullDescription:
      'Set up alerts to be notified when new properties matching your criteria become available.',
    category: 'automation',
    icon: 'Bell',
    examples: [
      {
        prompt: 'Alert me when 3 beds under $200k come on market in Tampa',
        description: 'Set up property alert',
        resultPreview: 'Alert configured',
      },
    ],
    keywords: ['alert', 'notify', 'watch', 'match'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },

  // ==========================================
  // CRM / LIST MANAGEMENT TOOLS
  // ==========================================
  {
    slug: 'crm.add_note',
    displayName: 'Add Note',
    shortDescription: 'Add notes to properties, deals, or contacts',
    fullDescription:
      'Attach notes to any entity for reference and team collaboration.',
    category: 'list-management',
    icon: 'StickyNote',
    examples: [
      {
        prompt: 'Add a note that owner is willing to negotiate',
        description: 'Add property note',
        resultPreview: 'Note saved',
      },
    ],
    keywords: ['note', 'add', 'comment', 'memo'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property', 'deal', 'buyer'],
  },
  {
    slug: 'search.save_filter',
    displayName: 'Save Search',
    shortDescription: 'Save current search for later',
    fullDescription:
      'Save your current search criteria as a reusable filter.',
    category: 'list-management',
    icon: 'Bookmark',
    examples: [
      {
        prompt: 'Save this search as "Tampa Hot Leads"',
        description: 'Name and save search',
        resultPreview: 'Search saved',
      },
    ],
    keywords: ['save', 'search', 'filter', 'bookmark'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },
];

/**
 * Get tool by slug
 */
export function getToolBySlug(slug: string): DiscoveryToolDefinition | undefined {
  return toolRegistry.find((tool) => tool.slug === slug);
}

/**
 * Get tools by category
 */
export function getToolsByCategory(category: DiscoveryCategory): DiscoveryToolDefinition[] {
  return toolRegistry
    .filter((tool) => tool.category === category)
    .sort((a, b) => {
      // Primary tools first, then alphabetical
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return a.displayName.localeCompare(b.displayName);
    });
}

/**
 * Get primary/featured tools for onboarding
 */
export function getFeaturedTools(): DiscoveryToolDefinition[] {
  return toolRegistry
    .filter((tool) => tool.isPrimary && !tool.isAdvanced)
    .slice(0, 8);
}

/**
 * Search tools by query
 */
export function searchTools(query: string): DiscoveryToolDefinition[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  return toolRegistry
    .filter((tool) => {
      // Search across name, description, keywords, and example prompts
      const searchableText = [
        tool.displayName,
        tool.shortDescription,
        ...tool.keywords,
        ...tool.examples.map((e) => e.prompt),
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    })
    .sort((a, b) => {
      // Prioritize matches in name over description over examples
      const aNameMatch = a.displayName.toLowerCase().includes(normalizedQuery);
      const bNameMatch = b.displayName.toLowerCase().includes(normalizedQuery);
      if (aNameMatch !== bNameMatch) return aNameMatch ? -1 : 1;

      // Then by primary status
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;

      return 0;
    });
}

/**
 * Get all non-advanced tools
 */
export function getBeginnerTools(): DiscoveryToolDefinition[] {
  return toolRegistry.filter((tool) => !tool.isAdvanced);
}

/**
 * Get tool display name from slug (for transparency feature)
 */
export function getToolDisplayName(slug: string): string {
  const tool = getToolBySlug(slug);
  if (tool) return tool.displayName;

  // Fallback: convert slug to readable name
  return slug
    .replace(/_/g, ' ')
    .replace(/\./g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Get tool icon from slug (for transparency feature)
 */
export function getToolIcon(slug: string): string {
  const tool = getToolBySlug(slug);
  return tool?.icon || 'Wrench';
}
