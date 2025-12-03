/**
 * ViewContext Types
 * Defines the structure for capturing page-specific context for AI
 */

/**
 * Base context that all views share
 */
export interface BaseViewContext {
  viewType: ViewType;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

/**
 * Supported view types in the application
 */
export type ViewType =
  | 'dashboard'
  | 'property_search'
  | 'property_detail'
  | 'deal_analysis'
  | 'buyer_list'
  | 'buyer_detail'
  | 'campaign'
  | 'settings'
  | 'unknown';

/**
 * Dashboard view context
 */
export interface DashboardContext extends BaseViewContext {
  viewType: 'dashboard';
  metrics: {
    activeDeals?: number;
    pendingOffers?: number;
    recentActivity?: string[];
  };
  widgets: string[];
}

/**
 * Property search view context
 */
export interface PropertySearchContext extends BaseViewContext {
  viewType: 'property_search';
  filters: {
    location?: string;
    propertyType?: string[];
    priceRange?: { min?: number; max?: number };
    bedrooms?: { min?: number; max?: number };
    squareFootage?: { min?: number; max?: number };
    ownerType?: string[];
    equityPercent?: { min?: number; max?: number };
    motivationScore?: { min?: number; max?: number };
    [key: string]: unknown;
  };
  resultCount: number;
  currentPage: number;
  sortBy?: string;
  selectedPropertyIds?: string[];
}

/**
 * Property detail view context
 */
export interface PropertyDetailContext extends BaseViewContext {
  viewType: 'property_detail';
  property: {
    id: string;
    address: string;
    city?: string;
    state?: string;
    zip?: string;
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    squareFootage?: number;
    yearBuilt?: number;
    estimatedValue?: number;
    askingPrice?: number;
    ownerName?: string;
    ownerType?: string;
    ownershipLength?: number;
    equityPercent?: number;
    motivationScore?: number;
  };
  comparables?: Array<{
    address: string;
    salePrice: number;
    saleDate: string;
    squareFootage: number;
  }>;
  marketData?: {
    medianValue?: number;
    pricePerSqft?: number;
    daysOnMarket?: number;
  };
}

/**
 * Deal analysis view context
 */
export interface DealAnalysisContext extends BaseViewContext {
  viewType: 'deal_analysis';
  deal: {
    propertyId: string;
    address: string;
    arv?: number;
    repairCost?: number;
    mao?: number;
    offerPrice?: number;
    assignmentFee?: number;
    potentialProfit?: number;
    dealScore?: number;
  };
  analysisResults?: {
    recommendation?: string;
    risks?: string[];
    opportunities?: string[];
  };
}

/**
 * Buyer list view context
 */
export interface BuyerListContext extends BaseViewContext {
  viewType: 'buyer_list';
  filters: {
    location?: string;
    buyerType?: string[];
    budget?: { min?: number; max?: number };
    propertyPreferences?: string[];
  };
  resultCount: number;
  selectedBuyerIds?: string[];
}

/**
 * Buyer detail view context
 */
export interface BuyerDetailContext extends BaseViewContext {
  viewType: 'buyer_detail';
  buyer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    buyerType?: string;
    budget?: { min?: number; max?: number };
    preferredLocations?: string[];
    propertyPreferences?: string[];
    purchaseHistory?: number;
    lastContact?: Date;
  };
}

/**
 * Campaign view context
 */
export interface CampaignContext extends BaseViewContext {
  viewType: 'campaign';
  campaign?: {
    id: string;
    name: string;
    type: string;
    status: string;
    targetCount: number;
    sentCount: number;
    responseRate?: number;
  };
}

/**
 * Union type for all view contexts
 */
export type ViewContext =
  | DashboardContext
  | PropertySearchContext
  | PropertyDetailContext
  | DealAnalysisContext
  | BuyerListContext
  | BuyerDetailContext
  | CampaignContext
  | BaseViewContext;

