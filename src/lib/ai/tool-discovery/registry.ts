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
    shortDescription: "Find properties by describing what you're looking for",
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
    keywords: [
      'find',
      'search',
      'properties',
      'houses',
      'filter',
      'landlord',
      'equity',
      'absentee',
    ],
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
        prompt: "What's the MAO for this property?",
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
        prompt: "Who's buying 3 beds in this zip code?",
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
    fullDescription: 'Search through your buyer contacts by name, criteria, location, or tags.',
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
      "Deep dive into a buyer's purchase history, preferences, and behavior patterns.",
    category: 'buyer-intelligence',
    icon: 'BarChart3',
    examples: [
      {
        prompt: "Tell me about this buyer's purchase history",
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
        prompt: "How's the Tampa market doing?",
        description: 'General market health check',
        resultPreview: 'Key metrics with trend indicators',
      },
      {
        prompt: "What's the median price in 33607?",
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
        prompt: "What's the market velocity in Tampa?",
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
        prompt: "What's this property worth?",
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
        prompt: "Find the owner's phone number",
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
    fullDescription: 'Analyze your pipeline health, identify bottlenecks, and get recommendations.',
    category: 'pipeline',
    icon: 'BarChart3',
    examples: [
      {
        prompt: "How's my pipeline looking?",
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
        prompt: "What's the motivation score for this owner?",
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
    fullDescription: 'Configure automated follow-up actions when certain conditions are met.',
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
    fullDescription: 'Attach notes to any entity for reference and team collaboration.',
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
    fullDescription: 'Save your current search criteria as a reusable filter.',
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

  // ==========================================
  // PROPERTY DETAILS & INSIGHTS
  // ==========================================
  {
    slug: 'property.neighborhood',
    displayName: 'Neighborhood Insights',
    shortDescription: 'Analyze the surrounding area and neighborhood',
    fullDescription:
      'Get comprehensive neighborhood analysis including crime statistics, school ratings, walkability scores, nearby amenities, and market trends. Helps assess location quality for investment.',
    category: 'market-research',
    icon: 'MapPin',
    examples: [
      {
        prompt: 'Tell me about the neighborhood for this property',
        description: 'Get neighborhood overview',
        resultPreview: 'Crime stats, schools, walkability, amenities',
      },
      {
        prompt: 'Is this a good neighborhood for rental property?',
        description: 'Rental neighborhood assessment',
        resultPreview: 'Rental market analysis with recommendations',
      },
    ],
    keywords: ['neighborhood', 'area', 'location', 'crime', 'schools', 'amenities'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property'],
  },
  {
    slug: 'property.rental',
    displayName: 'Rental Analysis',
    shortDescription: 'Assess rental income potential',
    fullDescription:
      'Estimate potential rental income, calculate cap rate, analyze cash flow projections, and compare to market rental rates. Essential for buy-and-hold investors.',
    category: 'deal-analysis',
    icon: 'DollarSign',
    examples: [
      {
        prompt: 'What could this property rent for?',
        description: 'Estimate rental income',
        resultPreview: 'Monthly rent estimate with market data',
      },
      {
        prompt: 'Calculate the cap rate for this property',
        description: 'Investment return calculation',
        resultPreview: 'Cap rate with cash flow projection',
      },
    ],
    keywords: ['rental', 'rent', 'cap rate', 'cash flow', 'income'],
    isPrimary: true,
    isAdvanced: false,
    requiresContext: ['property'],
  },
  {
    slug: 'property.issues',
    displayName: 'Property Red Flags',
    shortDescription: 'Identify potential issues and red flags',
    fullDescription:
      'Scan for title issues, liens, code violations, permit problems, and other red flags that could affect the deal. Helps avoid problematic properties.',
    category: 'deal-analysis',
    icon: 'AlertTriangle',
    examples: [
      {
        prompt: 'Check this property for red flags',
        description: 'Comprehensive issue scan',
        resultPreview: 'List of identified issues with severity',
      },
      {
        prompt: 'Are there any liens on this property?',
        description: 'Lien search',
        resultPreview: 'Lien status and details',
      },
    ],
    keywords: ['issues', 'red flags', 'liens', 'violations', 'problems'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property'],
  },

  // ==========================================
  // ADVANCED SEARCH & FILTERING
  // ==========================================
  {
    slug: 'search.similar_to_deal',
    displayName: 'Find Similar Properties',
    shortDescription: 'Find properties like your successful deals',
    fullDescription:
      'Analyze your past successful deals and find similar properties in the market. Uses AI to match property characteristics, owner profiles, and deal metrics.',
    category: 'property-search',
    icon: 'Target',
    examples: [
      {
        prompt: 'Find properties similar to my best deal',
        description: 'Match to successful deal',
        resultPreview: 'Properties matching your winning criteria',
      },
      {
        prompt: 'Show me more properties like this one',
        description: 'Find similar properties',
        resultPreview: 'Similar properties ranked by match',
      },
    ],
    keywords: ['similar', 'like', 'match', 'find more'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property', 'deal'],
  },
  {
    slug: 'search.by_description',
    displayName: 'Conversational Search',
    shortDescription: 'Search using natural language description',
    fullDescription:
      "Describe what you're looking for in plain English and let the AI translate it into precise search criteria. The most flexible way to search.",
    category: 'property-search',
    icon: 'MessageSquare',
    examples: [
      {
        prompt: 'I need fix and flip opportunities under $150k in decent neighborhoods',
        description: 'Natural language search',
        resultPreview: 'Properties matching description',
      },
      {
        prompt: 'Find me wholesale deals that I can assign quickly',
        description: 'Strategy-based search',
        resultPreview: 'High-assignment properties',
      },
    ],
    keywords: ['search', 'find', 'looking for', 'describe'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },

  // ==========================================
  // MARKET ANALYSIS & TRENDS
  // ==========================================
  {
    slug: 'market_analysis.forecast',
    displayName: 'Price Forecast',
    shortDescription: 'Predict future property prices',
    fullDescription:
      'AI-powered price forecasting using historical trends, market conditions, and economic indicators. Helps time your market entry and exit.',
    category: 'market-research',
    icon: 'TrendingUp',
    examples: [
      {
        prompt: 'What will prices do in Tampa over the next 6 months?',
        description: 'Market price forecast',
        resultPreview: 'Price trend prediction with confidence',
      },
      {
        prompt: 'Should I buy now or wait?',
        description: 'Timing recommendation',
        resultPreview: 'Market timing analysis',
      },
    ],
    keywords: ['forecast', 'predict', 'future', 'trends', 'timing'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },
  {
    slug: 'heat_mapping.detect_opportunities',
    displayName: 'Opportunity Zones',
    shortDescription: 'Find high-opportunity investment areas',
    fullDescription:
      'Identify geographic areas with high concentrations of motivated sellers, equity, and deal potential. Visual heat mapping shows where to focus your efforts.',
    category: 'market-research',
    icon: 'Map',
    examples: [
      {
        prompt: 'Where are the best opportunities in Tampa?',
        description: 'Find hot zones',
        resultPreview: 'Heat map of opportunity areas',
      },
      {
        prompt: 'Show me areas with motivated sellers',
        description: 'Motivation-based mapping',
        resultPreview: 'Motivation heat map',
      },
    ],
    keywords: ['opportunity', 'zones', 'areas', 'heat map', 'where'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },

  // ==========================================
  // PERMITS & PROPERTY CONDITION
  // ==========================================
  {
    slug: 'permit.history',
    displayName: 'Permit History',
    shortDescription: 'Check permit and renovation history',
    fullDescription:
      'View complete permit history to understand what work has been done on the property, identify deferred maintenance, and spot motivation signals.',
    category: 'property-search',
    icon: 'FileText',
    examples: [
      {
        prompt: 'Show me the permit history for this property',
        description: 'Full permit history',
        resultPreview: 'Timeline of all permits',
      },
      {
        prompt: 'Has this property been recently renovated?',
        description: 'Recent work check',
        resultPreview: 'Recent permit activity summary',
      },
    ],
    keywords: ['permits', 'history', 'renovations', 'work done'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property'],
  },
  {
    slug: 'permit.analyze_patterns',
    displayName: 'Permit Pattern Analysis',
    shortDescription: 'Identify motivation signals from permits',
    fullDescription:
      'Analyze permit patterns to identify seller motivation signals like stalled projects, expired permits, or lack of maintenance.',
    category: 'deal-analysis',
    icon: 'Activity',
    examples: [
      {
        prompt: 'Analyze permit patterns for motivation',
        description: 'Motivation signal detection',
        resultPreview: 'Motivation indicators from permits',
      },
    ],
    keywords: ['permits', 'patterns', 'motivation', 'stalled', 'signals'],
    isPrimary: false,
    isAdvanced: true,
    requiresContext: ['property'],
  },

  // ==========================================
  // BUYER MANAGEMENT & DISPOSITION
  // ==========================================
  {
    slug: 'buyer.suggest_outreach',
    displayName: 'Buyer Outreach Suggestions',
    shortDescription: 'Get recommendations on which buyers to contact',
    fullDescription:
      'AI-powered buyer outreach recommendations based on deal characteristics, buyer preferences, and historical activity.',
    category: 'buyer-intelligence',
    icon: 'Target',
    examples: [
      {
        prompt: 'Which buyers should I contact for this deal?',
        description: 'Get buyer recommendations',
        resultPreview: 'Prioritized buyer list with reasons',
      },
      {
        prompt: 'Help me choose the best buyer for this property',
        description: 'Buyer selection help',
        resultPreview: 'Top buyer matches with scoring',
      },
    ],
    keywords: ['buyers', 'contact', 'suggest', 'recommend', 'outreach'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property', 'deal'],
  },
  {
    slug: 'buyer_management.analyze_buyer_activity',
    displayName: 'Buyer Activity Analysis',
    shortDescription: 'Analyze buyer engagement and performance',
    fullDescription:
      'Track buyer activity, identify top performers, and find buyers who need attention. Helps maintain a healthy buyer network.',
    category: 'buyer-intelligence',
    icon: 'BarChart3',
    examples: [
      {
        prompt: 'Which buyers are most active right now?',
        description: 'Find active buyers',
        resultPreview: 'Active buyers with recent activity',
      },
      {
        prompt: "Show me buyers I haven't contacted in a while",
        description: 'Find dormant buyers',
        resultPreview: 'Buyers needing engagement',
      },
    ],
    keywords: ['buyer', 'activity', 'active', 'engagement', 'performance'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },
  {
    slug: 'buyer.score_fit',
    displayName: 'Buyer Match Score',
    shortDescription: 'Score how well a buyer matches a property',
    fullDescription:
      'Calculate a match score between a buyer and a property based on their criteria, history, and preferences.',
    category: 'buyer-intelligence',
    icon: 'Target',
    examples: [
      {
        prompt: 'How good of a match is this buyer for this property?',
        description: 'Calculate match score',
        resultPreview: 'Match score with explanation',
      },
    ],
    keywords: ['match', 'score', 'fit', 'buyer', 'property'],
    isPrimary: false,
    isAdvanced: true,
    requiresContext: ['buyer', 'property'],
  },

  // ==========================================
  // COMMUNICATION & OUTREACH
  // ==========================================
  {
    slug: 'notification.send_sms',
    displayName: 'Send SMS',
    shortDescription: 'Send text message to a lead or contact',
    fullDescription:
      'Send SMS messages directly to property owners, buyers, or other contacts. Track delivery and responses.',
    category: 'outreach',
    icon: 'MessageSquare',
    examples: [
      {
        prompt: "Send an SMS to this owner asking if they're interested in selling",
        description: 'Direct SMS outreach',
        resultPreview: 'SMS sent with tracking',
      },
      {
        prompt: 'Text this buyer about a new deal',
        description: 'Buyer SMS notification',
        resultPreview: 'Message sent to buyer',
      },
    ],
    keywords: ['sms', 'text', 'send', 'message'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property', 'buyer'],
  },
  {
    slug: 'notification.send_email',
    displayName: 'Send Email',
    shortDescription: 'Send email to a lead or contact',
    fullDescription:
      'Send professional emails to property owners, buyers, or contacts. Supports templates and tracking.',
    category: 'outreach',
    icon: 'Mail',
    examples: [
      {
        prompt: 'Email this owner with an offer',
        description: 'Send offer email',
        resultPreview: 'Email sent with tracking',
      },
    ],
    keywords: ['email', 'send', 'message', 'contact'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property', 'buyer'],
  },
  {
    slug: 'notification.create_drip_campaign',
    displayName: 'Create Drip Campaign',
    shortDescription: 'Set up automated follow-up sequence',
    fullDescription:
      'Create multi-touch drip campaigns with automated emails and SMS over time. Perfect for nurturing leads.',
    category: 'automation',
    icon: 'Zap',
    examples: [
      {
        prompt: 'Set up a 5-email drip campaign for this seller',
        description: 'Create email sequence',
        resultPreview: 'Drip campaign configured',
      },
    ],
    keywords: ['drip', 'campaign', 'sequence', 'automation', 'follow-up'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property'],
  },

  // ==========================================
  // DASHBOARD & ANALYTICS
  // ==========================================
  {
    slug: 'dashboard.insights',
    displayName: 'Dashboard Insights',
    shortDescription: 'Get AI-powered insights from your data',
    fullDescription:
      'Receive personalized insights about your deal flow, conversion rates, and opportunities based on your activity.',
    category: 'help',
    icon: 'Sparkles',
    examples: [
      {
        prompt: 'What insights do you have for me?',
        description: 'Get personalized insights',
        resultPreview: 'AI-generated insights and recommendations',
      },
      {
        prompt: 'How am I performing this month?',
        description: 'Performance summary',
        resultPreview: 'Monthly performance overview',
      },
    ],
    keywords: ['insights', 'dashboard', 'performance', 'analytics'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },
  {
    slug: 'dashboard.funnel',
    displayName: 'Conversion Funnel',
    shortDescription: 'Analyze your deal conversion funnel',
    fullDescription:
      'See where leads drop off in your pipeline and get recommendations to improve conversion rates.',
    category: 'pipeline',
    icon: 'GitBranch',
    examples: [
      {
        prompt: 'Show me my conversion funnel',
        description: 'View funnel analysis',
        resultPreview: 'Pipeline stages with conversion rates',
      },
      {
        prompt: 'Where am I losing deals?',
        description: 'Identify bottlenecks',
        resultPreview: 'Drop-off analysis with suggestions',
      },
    ],
    keywords: ['funnel', 'conversion', 'pipeline', 'analyze'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },

  // ==========================================
  // BATCH OPERATIONS
  // ==========================================
  {
    slug: 'batch.skip_trace_bulk',
    displayName: 'Bulk Skip Trace',
    shortDescription: 'Skip trace multiple properties at once',
    fullDescription:
      'Queue multiple properties for skip tracing in a single operation. More efficient and cost-effective than one-by-one.',
    category: 'skip-tracing',
    icon: 'Users',
    examples: [
      {
        prompt: 'Skip trace all 50 properties in this list',
        description: 'Bulk skip trace',
        resultPreview: 'Skip trace job queued',
      },
    ],
    keywords: ['bulk', 'batch', 'skip trace', 'multiple'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['list'],
  },
  {
    slug: 'batch.export_properties',
    displayName: 'Export Properties',
    shortDescription: 'Export property data to CSV or Excel',
    fullDescription:
      'Export property lists, search results, or deal data to CSV, Excel, or JSON format for external use.',
    category: 'list-management',
    icon: 'FileSpreadsheet',
    examples: [
      {
        prompt: 'Export these properties to Excel',
        description: 'Export to spreadsheet',
        resultPreview: 'Download Excel file',
      },
      {
        prompt: 'Download this list as CSV',
        description: 'CSV export',
        resultPreview: 'Download CSV file',
      },
    ],
    keywords: ['export', 'download', 'csv', 'excel', 'spreadsheet'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['list', 'none'],
  },

  // ==========================================
  // PREDICTIVE & AI-POWERED TOOLS
  // ==========================================
  {
    slug: 'predict.deal_success',
    displayName: 'Deal Success Prediction',
    shortDescription: 'Predict likelihood of closing a deal',
    fullDescription:
      'AI-powered prediction of deal success based on property characteristics, seller motivation, market conditions, and your historical performance.',
    category: 'deal-analysis',
    icon: 'Target',
    examples: [
      {
        prompt: 'What are my chances of closing this deal?',
        description: 'Predict deal success',
        resultPreview: 'Success probability with factors',
      },
      {
        prompt: 'Is this deal worth pursuing?',
        description: 'Deal viability check',
        resultPreview: 'Recommendation with reasoning',
      },
    ],
    keywords: ['predict', 'success', 'probability', 'likelihood', 'close'],
    isPrimary: false,
    isAdvanced: true,
    requiresContext: ['deal', 'property'],
  },
  {
    slug: 'predict.optimal_offer',
    displayName: 'Optimal Offer Suggestion',
    shortDescription: 'Get AI-recommended offer strategy',
    fullDescription:
      'Receive tiered offer recommendations (optimal, target, max, walk-away) based on property analysis, seller motivation, and market conditions.',
    category: 'deal-analysis',
    icon: 'DollarSign',
    examples: [
      {
        prompt: 'What should I offer for this property?',
        description: 'Get offer recommendation',
        resultPreview: 'Tiered offer strategy',
      },
      {
        prompt: 'Help me create an offer strategy',
        description: 'Strategic offer planning',
        resultPreview: 'Multi-level offer plan',
      },
    ],
    keywords: ['offer', 'optimal', 'suggest', 'recommend', 'strategy'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property'],
  },
  {
    slug: 'predict.lead_score',
    displayName: 'Lead Scoring',
    shortDescription: 'Score and prioritize leads',
    fullDescription:
      'AI-powered lead scoring based on motivation indicators, property characteristics, and conversion likelihood. Helps you focus on the best opportunities.',
    category: 'list-management',
    icon: 'Star',
    examples: [
      {
        prompt: 'Score these leads for me',
        description: 'Prioritize leads',
        resultPreview: 'Leads ranked by score',
      },
      {
        prompt: 'Which leads should I focus on first?',
        description: 'Lead prioritization',
        resultPreview: 'Top leads with reasons',
      },
    ],
    keywords: ['score', 'lead', 'prioritize', 'rank'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['list', 'none'],
  },

  // ==========================================
  // CRM & DEAL MANAGEMENT
  // ==========================================
  {
    slug: 'deal.predict_outcome',
    displayName: 'Deal Outcome Prediction',
    shortDescription: 'Predict likelihood of deal closing',
    fullDescription:
      'Analyze deal progress and predict the likelihood of successful closing based on activity, timeline, and historical patterns.',
    category: 'pipeline',
    icon: 'Target',
    examples: [
      {
        prompt: 'Will this deal close?',
        description: 'Predict deal outcome',
        resultPreview: 'Close probability with factors',
      },
    ],
    keywords: ['predict', 'outcome', 'close', 'deal'],
    isPrimary: false,
    isAdvanced: true,
    requiresContext: ['deal'],
  },
  {
    slug: 'deal.flag_issues',
    displayName: 'Flag Deal Issues',
    shortDescription: 'Identify deals that need attention',
    fullDescription:
      'Automatically identify deals with issues like long time in stage, lack of activity, or missing information.',
    category: 'pipeline',
    icon: 'AlertTriangle',
    examples: [
      {
        prompt: 'Which deals need my attention?',
        description: 'Find problem deals',
        resultPreview: 'Deals with issues flagged',
      },
      {
        prompt: 'Show me stalled deals',
        description: 'Find inactive deals',
        resultPreview: 'Stalled deals with suggestions',
      },
    ],
    keywords: ['issues', 'problems', 'stalled', 'attention', 'flag'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },
  {
    slug: 'crm.identify_hot',
    displayName: 'Hot Leads',
    shortDescription: 'Find your hottest leads to contact',
    fullDescription:
      'Identify leads with the highest motivation scores and best characteristics. Shows you who to call first.',
    category: 'list-management',
    icon: 'Flame',
    examples: [
      {
        prompt: 'Show me my hottest leads',
        description: 'Find top leads',
        resultPreview: 'Leads ranked by temperature',
      },
      {
        prompt: 'Who should I call today?',
        description: 'Daily call list',
        resultPreview: 'Prioritized contact list',
      },
    ],
    keywords: ['hot', 'leads', 'priority', 'contact', 'call'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },

  // ==========================================
  // MAP & GEOGRAPHIC TOOLS
  // ==========================================
  {
    slug: 'map.compare_areas',
    displayName: 'Compare Geographic Areas',
    shortDescription: 'Compare multiple areas side-by-side',
    fullDescription:
      'Compare different geographic areas on metrics like median price, days on market, inventory, and opportunity scores.',
    category: 'market-research',
    icon: 'GitCompare',
    examples: [
      {
        prompt: 'Compare downtown Tampa vs South Tampa',
        description: 'Area comparison',
        resultPreview: 'Side-by-side area metrics',
      },
    ],
    keywords: ['compare', 'areas', 'geographic', 'map'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },
  {
    slug: 'map.show_commute_time',
    displayName: 'Commute Time Analysis',
    shortDescription: 'Show areas by drive time',
    fullDescription:
      'Display isochrone maps showing areas reachable within a specified drive time. Useful for targeting around employment centers.',
    category: 'property-search',
    icon: 'MapPin',
    examples: [
      {
        prompt: 'Show properties within 20 minutes of downtown',
        description: 'Drive time search',
        resultPreview: 'Properties in commute zone',
      },
    ],
    keywords: ['commute', 'drive time', 'distance', 'map'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },

  // ==========================================
  // INTEGRATION & SYNC TOOLS
  // ==========================================
  {
    slug: 'sync.crm_export',
    displayName: 'Export to CRM',
    shortDescription: 'Export data to external CRM systems',
    fullDescription:
      'Export leads, contacts, and deals to external CRM platforms like Salesforce, HubSpot, or Podio.',
    category: 'settings',
    icon: 'Upload',
    examples: [
      {
        prompt: 'Export these leads to my CRM',
        description: 'CRM export',
        resultPreview: 'Data synced to CRM',
      },
    ],
    keywords: ['export', 'crm', 'sync', 'integration'],
    isPrimary: false,
    isAdvanced: true,
    requiresContext: ['list', 'none'],
  },

  // ==========================================
  // CONTRACTOR & REPAIR TOOLS
  // ==========================================
  {
    slug: 'contractor.search',
    displayName: 'Find Contractors',
    shortDescription: 'Search for contractors by location and specialty',
    fullDescription:
      'Find licensed contractors for your renovation projects. Search by location, specialty (roofing, electrical, plumbing, etc.), and ratings.',
    category: 'documents',
    subcategory: 'contractors',
    icon: 'Hammer',
    examples: [
      {
        prompt: 'Find roofers in Tampa',
        description: 'Search contractors',
        resultPreview: 'Contractor list with ratings',
      },
      {
        prompt: 'Who are the best general contractors in this area?',
        description: 'Top contractors',
        resultPreview: 'Highly-rated contractors',
      },
    ],
    keywords: ['contractor', 'find', 'search', 'renovation', 'repair'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['property', 'none'],
  },
  {
    slug: 'contractor.compare',
    displayName: 'Compare Contractors',
    shortDescription: 'Compare multiple contractors side-by-side',
    fullDescription:
      'Compare contractors on price, ratings, experience, and past project quality to make the best choice.',
    category: 'documents',
    subcategory: 'contractors',
    icon: 'GitCompare',
    examples: [
      {
        prompt: 'Compare these 3 contractors',
        description: 'Side-by-side comparison',
        resultPreview: 'Contractor comparison table',
      },
    ],
    keywords: ['compare', 'contractor', 'evaluate'],
    isPrimary: false,
    isAdvanced: false,
    requiresContext: ['none'],
  },

  // ==========================================
  // INTELLIGENCE & COMPETITIVE ANALYSIS
  // ==========================================
  {
    slug: 'intel.competitor_activity',
    displayName: 'Competitor Analysis',
    shortDescription: 'Analyze investor activity in your market',
    fullDescription:
      "Track competitor investor and flipper activity using permit data. See where other investors are buying and what they're doing.",
    category: 'market-research',
    icon: 'Users',
    examples: [
      {
        prompt: 'What are other investors doing in Tampa?',
        description: 'Competitor activity',
        resultPreview: 'Investor activity heatmap',
      },
      {
        prompt: 'Show me where flippers are buying',
        description: 'Flipper tracking',
        resultPreview: 'Active flip locations',
      },
    ],
    keywords: ['competitor', 'investor', 'activity', 'flippers'],
    isPrimary: false,
    isAdvanced: true,
    requiresContext: ['none'],
  },
  {
    slug: 'intel.market_saturation',
    displayName: 'Market Saturation Analysis',
    shortDescription: 'Check if a market is oversaturated',
    fullDescription:
      'Analyze market saturation by comparing investor activity, inventory levels, and days on market. Helps avoid overly competitive markets.',
    category: 'market-research',
    icon: 'Activity',
    examples: [
      {
        prompt: 'Is the Tampa market oversaturated?',
        description: 'Saturation check',
        resultPreview: 'Saturation analysis with score',
      },
    ],
    keywords: ['saturation', 'competition', 'crowded', 'oversaturated'],
    isPrimary: false,
    isAdvanced: true,
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
  return toolRegistry.filter((tool) => tool.isPrimary && !tool.isAdvanced).slice(0, 8);
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
