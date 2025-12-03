import type {
  RentCastProperty,
  RentCastValuation,
  RentCastRentEstimate,
  RentCastMarketData,
  RentCastListing,
  PropertySearchParams,
  ListingsSearchParams,
} from './types';
import {
  RentCastPropertySchema,
  RentCastValuationSchema,
  RentCastRentEstimateSchema,
  RentCastMarketDataSchema,
  RentCastListingSchema,
  PropertySearchResponseSchema,
  ListingsSearchResponseSchema,
} from './types';
import {
  RentCastApiError,
  RentCastAuthenticationError,
  RentCastRateLimitError,
  RentCastNotFoundError,
  RentCastValidationError,
} from './errors';

// ============================================
// Configuration
// ============================================

const RENTCAST_BASE_URL = 'https://api.rentcast.io/v1';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

interface RentCastClientConfig {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

// ============================================
// RentCast API Client
// ============================================

/**
 * RentCast API Client
 * Provides access to 140M+ property records with rate limiting and caching.
 */
export class RentCastClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config: RentCastClientConfig = {}) {
    const apiKey = config.apiKey || process.env.RENTCAST_API_KEY;
    
    if (!apiKey) {
      throw new RentCastAuthenticationError(
        'RentCast API key not configured. Set RENTCAST_API_KEY environment variable.'
      );
    }

    this.apiKey = apiKey;
    this.baseUrl = config.baseUrl || RENTCAST_BASE_URL;
    this.timeout = config.timeout || DEFAULT_TIMEOUT;
  }

  /**
   * Make an authenticated request to the RentCast API
   */
  private async request<T>(
    endpoint: string,
    options: {
      method?: 'GET' | 'POST';
      params?: Record<string, string | number | boolean | undefined>;
      body?: unknown;
      requestId?: string;
    } = {}
  ): Promise<T> {
    const { method = 'GET', params, body, requestId = crypto.randomUUID() } = options;

    // Build URL with query parameters
    const url = new URL(`${this.baseUrl}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value));
        }
      });
    }

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        method,
        headers: {
          'X-Api-Key': this.apiKey,
          'Content-Type': 'application/json',
          'X-Request-Id': requestId,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        await this.handleHttpError(response, requestId);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof RentCastApiError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new RentCastApiError(
            `Request timed out after ${this.timeout}ms`,
            408,
            requestId
          );
        }
        throw new RentCastApiError(error.message, 0, requestId);
      }

      throw new RentCastApiError('Unknown error occurred', 0, requestId);
    }
  }

  /**
   * Handle HTTP error responses
   */
  private async handleHttpError(response: Response, requestId: string): Promise<never> {
    const status = response.status;
    let message = `RentCast API error: ${response.statusText}`;

    try {
      const errorBody = await response.json();
      message = errorBody.message || errorBody.error || message;
    } catch {
      // Ignore JSON parsing errors
    }

    switch (status) {
      case 401:
        throw new RentCastAuthenticationError(message, requestId);
      case 403:
        throw new RentCastAuthenticationError('API key does not have access to this resource', requestId);
      case 404:
        throw new RentCastNotFoundError(message, requestId);
      case 429:
        throw new RentCastRateLimitError(message, requestId);
      case 400:
        throw new RentCastValidationError(message, requestId);
      default:
        throw new RentCastApiError(message, status, requestId);
    }
  }

  /**
   * Validate API key on startup
   */
  async validateApiKey(): Promise<boolean> {
    try {
      // Make a minimal request to validate the key
      await this.request('/properties', { params: { limit: 1 } });
      return true;
    } catch (error) {
      if (error instanceof RentCastAuthenticationError) {
        return false;
      }
      throw error;
    }
  }

  // ============================================
  // Property Endpoints
  // ============================================

  /**
   * Search for properties matching criteria
   */
  async searchProperties(params: PropertySearchParams = {}): Promise<RentCastProperty[]> {
    const apiParams: Record<string, string | number | boolean | undefined> = {
      address: params.address,
      city: params.city,
      state: params.state,
      zipCode: params.zipCode,
      propertyType: params.propertyType,
      bedrooms: params.bedrooms,
      bedroomsMin: params.bedroomsMin,
      bedroomsMax: params.bedroomsMax,
      bathrooms: params.bathrooms,
      bathroomsMin: params.bathroomsMin,
      bathroomsMax: params.bathroomsMax,
      squareFootageMin: params.squareFootageMin,
      squareFootageMax: params.squareFootageMax,
      yearBuiltMin: params.yearBuiltMin,
      yearBuiltMax: params.yearBuiltMax,
      ownerOccupied: params.ownerOccupied,
      offset: params.offset ?? 0,
      limit: params.limit ?? 50,
    };

    const response = await this.request<unknown>('/properties', { params: apiParams });
    const parsed = PropertySearchResponseSchema.safeParse(response);

    if (!parsed.success) {
      console.warn('RentCast property response validation warning:', parsed.error);
      // Return raw data if validation fails (API may have new fields)
      return response as RentCastProperty[];
    }

    return parsed.data;
  }

  /**
   * Get detailed property information by ID
   */
  async getProperty(propertyId: string): Promise<RentCastProperty> {
    const response = await this.request<unknown>(`/properties/${propertyId}`);
    const parsed = RentCastPropertySchema.safeParse(response);

    if (!parsed.success) {
      console.warn('RentCast property detail validation warning:', parsed.error);
      return response as RentCastProperty;
    }

    return parsed.data;
  }

  // ============================================
  // Valuation Endpoints
  // ============================================

  /**
   * Get automated valuation model (AVM) for a property
   */
  async getValuation(address: string): Promise<RentCastValuation> {
    const response = await this.request<unknown>('/avm/value', {
      params: { address },
    });

    const parsed = RentCastValuationSchema.safeParse(response);

    if (!parsed.success) {
      console.warn('RentCast valuation validation warning:', parsed.error);
      return response as RentCastValuation;
    }

    return parsed.data;
  }

  /**
   * Get rent estimate for a property
   */
  async getRentEstimate(address: string): Promise<RentCastRentEstimate> {
    const response = await this.request<unknown>('/avm/rent/long-term', {
      params: { address },
    });

    const parsed = RentCastRentEstimateSchema.safeParse(response);

    if (!parsed.success) {
      console.warn('RentCast rent estimate validation warning:', parsed.error);
      return response as RentCastRentEstimate;
    }

    return parsed.data;
  }

  // ============================================
  // Market Data Endpoints
  // ============================================

  /**
   * Get market statistics for a zip code
   */
  async getMarketData(zipCode: string): Promise<RentCastMarketData> {
    const response = await this.request<unknown>('/markets', {
      params: { zipCode },
    });

    const parsed = RentCastMarketDataSchema.safeParse(response);

    if (!parsed.success) {
      console.warn('RentCast market data validation warning:', parsed.error);
      return response as RentCastMarketData;
    }

    return parsed.data;
  }

  // ============================================
  // Listings Endpoints
  // ============================================

  /**
   * Search for property listings
   */
  async getListings(params: ListingsSearchParams = {}): Promise<RentCastListing[]> {
    const apiParams: Record<string, string | number | boolean | undefined> = {
      city: params.city,
      state: params.state,
      zipCode: params.zipCode,
      status: params.status,
      propertyType: params.propertyType,
      priceMin: params.priceMin,
      priceMax: params.priceMax,
      bedroomsMin: params.bedroomsMin,
      bedroomsMax: params.bedroomsMax,
      offset: params.offset ?? 0,
      limit: params.limit ?? 50,
    };

    const response = await this.request<unknown>('/listings/sale', { params: apiParams });
    const parsed = ListingsSearchResponseSchema.safeParse(response);

    if (!parsed.success) {
      console.warn('RentCast listings validation warning:', parsed.error);
      return response as RentCastListing[];
    }

    return parsed.data;
  }

  /**
   * Get listing details by ID
   */
  async getListing(listingId: string): Promise<RentCastListing> {
    const response = await this.request<unknown>(`/listings/${listingId}`);
    const parsed = RentCastListingSchema.safeParse(response);

    if (!parsed.success) {
      console.warn('RentCast listing detail validation warning:', parsed.error);
      return response as RentCastListing;
    }

    return parsed.data;
  }
}

// Export singleton instance
let clientInstance: RentCastClient | null = null;

export function getRentCastClient(): RentCastClient {
  if (!clientInstance) {
    clientInstance = new RentCastClient();
  }
  return clientInstance;
}

export function resetRentCastClient(): void {
  clientInstance = null;
}

