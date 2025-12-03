import { getRentCastClient } from './client';
import { getRateLimiter, RequestPriority } from './rate-limiter';
import { getQuotaManager } from './quota';
import { withRetry } from './retry';
import { transformValuation, transformRentEstimate, transformMarketData } from './transform';
import type { NormalizedProperty, NormalizedValuation, NormalizedRentEstimate, NormalizedMarketData } from './types';

// ============================================
// Enrichment Stages
// ============================================

export enum EnrichmentStage {
  BASIC = 1,        // Basic property data
  VALUATION = 2,    // AVM valuation
  MARKET = 3,       // Market context
  LISTING = 4,      // Listing history
  OWNER = 5,        // Owner insights
}

export type EnrichmentStatus = 'none' | 'partial' | 'complete';

// ============================================
// Enrichment Service
// ============================================

export interface EnrichmentResult {
  property: NormalizedProperty;
  valuation?: NormalizedValuation;
  rentEstimate?: NormalizedRentEstimate;
  marketData?: NormalizedMarketData;
  completedStages: EnrichmentStage[];
  status: EnrichmentStatus;
  errors: string[];
}

export interface EnrichmentOptions {
  stages?: EnrichmentStage[];
  priority?: RequestPriority;
  skipCache?: boolean;
}

/**
 * Property enrichment service.
 * Enriches property data with valuations, market data, and more.
 */
export class PropertyEnrichmentService {
  private readonly client = getRentCastClient();
  private readonly rateLimiter = getRateLimiter();
  private readonly quotaManager = getQuotaManager();

  /**
   * Enrich a property with additional data.
   */
  async enrichProperty(
    property: NormalizedProperty,
    options: EnrichmentOptions = {}
  ): Promise<EnrichmentResult> {
    const {
      stages = [EnrichmentStage.VALUATION, EnrichmentStage.MARKET],
      priority = RequestPriority.NORMAL,
    } = options;

    const result: EnrichmentResult = {
      property: { ...property },
      completedStages: [],
      status: 'none',
      errors: [],
    };

    // Check quota before proceeding
    const quotaCheck = await this.quotaManager.canMakeRequest();
    if (!quotaCheck.allowed) {
      result.errors.push(quotaCheck.reason || 'Quota exceeded');
      return result;
    }

    // Process each requested stage
    for (const stage of stages.sort()) {
      try {
        await this.processStage(stage, result, priority);
        result.completedStages.push(stage);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        result.errors.push(`Stage ${stage} failed: ${message}`);
      }
    }

    // Update enrichment status
    result.status = this.determineStatus(result.completedStages, stages);
    result.property.enrichmentStatus = result.status;
    result.property.lastEnrichedAt = new Date();

    return result;
  }

  /**
   * Process a single enrichment stage.
   */
  private async processStage(
    stage: EnrichmentStage,
    result: EnrichmentResult,
    priority: RequestPriority
  ): Promise<void> {
    const address = result.property.address;

    switch (stage) {
      case EnrichmentStage.VALUATION:
        await this.enrichValuation(result, address, priority);
        break;

      case EnrichmentStage.MARKET:
        await this.enrichMarketData(result, priority);
        break;

      case EnrichmentStage.BASIC:
      case EnrichmentStage.LISTING:
      case EnrichmentStage.OWNER:
        // These stages use data already in the property
        break;
    }
  }

  private async enrichValuation(
    result: EnrichmentResult,
    address: string,
    priority: RequestPriority
  ): Promise<void> {
    // Get AVM valuation
    const valuation = await this.rateLimiter.executeWithRateLimit(
      '/avm/value',
      async () => {
        return withRetry(() => this.client.getValuation(address));
      },
      priority
    );

    if (valuation) {
      result.valuation = transformValuation(valuation, result.property.id);
      await this.quotaManager.recordUsage('/avm/value');
    }

    // Get rent estimate
    const rentEstimate = await this.rateLimiter.executeWithRateLimit(
      '/avm/rent',
      async () => {
        return withRetry(() => this.client.getRentEstimate(address));
      },
      priority
    );

    if (rentEstimate) {
      result.rentEstimate = transformRentEstimate(rentEstimate, result.property.id);
      await this.quotaManager.recordUsage('/avm/rent');
    }
  }

  private async enrichMarketData(
    result: EnrichmentResult,
    priority: RequestPriority
  ): Promise<void> {
    const zipCode = result.property.zip;
    if (!zipCode) return;

    const marketData = await this.rateLimiter.executeWithRateLimit(
      '/markets',
      async () => {
        return withRetry(() => this.client.getMarketData(zipCode));
      },
      priority
    );

    if (marketData) {
      result.marketData = transformMarketData(marketData);
      await this.quotaManager.recordUsage('/markets');
    }
  }

  private determineStatus(
    completed: EnrichmentStage[],
    requested: EnrichmentStage[]
  ): EnrichmentStatus {
    if (completed.length === 0) return 'none';
    if (completed.length === requested.length) return 'complete';
    return 'partial';
  }
}

// ============================================
// Background Enrichment Queue
// ============================================

interface QueuedEnrichment {
  property: NormalizedProperty;
  options: EnrichmentOptions;
  resolve: (result: EnrichmentResult) => void;
  reject: (error: Error) => void;
}

/**
 * Background enrichment queue for batch processing.
 */
export class EnrichmentQueue {
  private queue: QueuedEnrichment[] = [];
  private isProcessing = false;
  private readonly service = new PropertyEnrichmentService();
  private readonly batchSize = 10;
  private readonly delayBetweenBatchesMs = 1000;

  /**
   * Add property to enrichment queue.
   */
  async enqueue(
    property: NormalizedProperty,
    options: EnrichmentOptions = {}
  ): Promise<EnrichmentResult> {
    return new Promise((resolve, reject) => {
      this.queue.push({ property, options, resolve, reject });
      this.processQueue();
    });
  }

  /**
   * Add multiple properties to enrichment queue.
   */
  async enqueueBatch(
    properties: NormalizedProperty[],
    options: EnrichmentOptions = {}
  ): Promise<EnrichmentResult[]> {
    return Promise.all(properties.map((p) => this.enqueue(p, options)));
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const batch = this.queue.splice(0, this.batchSize);

      // Process batch in parallel
      await Promise.all(
        batch.map(async (item) => {
          try {
            const result = await this.service.enrichProperty(item.property, item.options);
            item.resolve(result);
          } catch (error) {
            item.reject(error instanceof Error ? error : new Error(String(error)));
          }
        })
      );

      // Delay between batches to respect rate limits
      if (this.queue.length > 0) {
        await new Promise((r) => setTimeout(r, this.delayBetweenBatchesMs));
      }
    }

    this.isProcessing = false;
  }

  /**
   * Get current queue length.
   */
  getQueueLength(): number {
    return this.queue.length;
  }
}

// Export singleton instances
let enrichmentServiceInstance: PropertyEnrichmentService | null = null;
let enrichmentQueueInstance: EnrichmentQueue | null = null;

export function getEnrichmentService(): PropertyEnrichmentService {
  if (!enrichmentServiceInstance) {
    enrichmentServiceInstance = new PropertyEnrichmentService();
  }
  return enrichmentServiceInstance;
}

export function getEnrichmentQueue(): EnrichmentQueue {
  if (!enrichmentQueueInstance) {
    enrichmentQueueInstance = new EnrichmentQueue();
  }
  return enrichmentQueueInstance;
}

