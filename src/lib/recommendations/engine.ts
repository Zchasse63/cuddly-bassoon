/**
 * Success-Based Recommendation Engine
 * Learns from closed deals to recommend properties
 *
 * Pattern Weights:
 * - zip_code: 30%
 * - price_range: 20%
 * - filter_match: 20%
 * - property_type: 15%
 * - buyer_network: 10%
 * - bedroom: 5%
 */

export interface DealPattern {
  zipCode: string;
  priceRange: { min: number; max: number };
  propertyType: string;
  bedrooms: number;
  buyerId?: string;
  profit: number;
  daysToClose: number;
}

export interface PropertyMatch {
  propertyId: string;
  score: number;
  matchReasons: string[];
  estimatedProfit: number;
  confidence: number;
}

export interface RecommendationConfig {
  weights: {
    zipCode: number;
    priceRange: number;
    filterMatch: number;
    propertyType: number;
    buyerNetwork: number;
    bedroom: number;
  };
  minConfidence: number;
  maxResults: number;
}

const DEFAULT_CONFIG: RecommendationConfig = {
  weights: {
    zipCode: 0.3,
    priceRange: 0.2,
    filterMatch: 0.2,
    propertyType: 0.15,
    buyerNetwork: 0.1,
    bedroom: 0.05,
  },
  minConfidence: 0.5,
  maxResults: 20,
};

export class RecommendationEngine {
  private patterns: DealPattern[] = [];
  private config: RecommendationConfig;

  constructor(config: Partial<RecommendationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Learn from historical closed deals
   */
  learnFromDeals(deals: DealPattern[]): void {
    this.patterns = [...this.patterns, ...deals];
    console.log(
      `[RecommendationEngine] Learned from ${deals.length} deals. Total patterns: ${this.patterns.length}`
    );
  }

  /**
   * Calculate match score for a property
   */
  calculateScore(property: {
    zipCode: string;
    price: number;
    propertyType: string;
    bedrooms: number;
    filters?: Record<string, unknown>;
  }): { score: number; reasons: string[] } {
    if (this.patterns.length === 0) {
      return { score: 0, reasons: ['No historical data available'] };
    }

    let totalScore = 0;
    const reasons: string[] = [];
    const { weights } = this.config;

    // Zip code match (30%)
    const zipMatches = this.patterns.filter((p) => p.zipCode === property.zipCode);
    if (zipMatches.length > 0) {
      const zipScore = Math.min(zipMatches.length / 5, 1) * weights.zipCode;
      totalScore += zipScore;
      reasons.push(`${zipMatches.length} successful deals in this ZIP`);
    }

    // Price range match (20%)
    const priceMatches = this.patterns.filter(
      (p) => property.price >= p.priceRange.min && property.price <= p.priceRange.max
    );
    if (priceMatches.length > 0) {
      const priceScore = Math.min(priceMatches.length / 5, 1) * weights.priceRange;
      totalScore += priceScore;
      reasons.push(`Price matches ${priceMatches.length} successful deals`);
    }

    // Property type match (15%)
    const typeMatches = this.patterns.filter((p) => p.propertyType === property.propertyType);
    if (typeMatches.length > 0) {
      const typeScore = Math.min(typeMatches.length / 5, 1) * weights.propertyType;
      totalScore += typeScore;
      reasons.push(`${typeMatches.length} successful ${property.propertyType} deals`);
    }

    // Bedroom match (5%)
    const bedMatches = this.patterns.filter((p) => p.bedrooms === property.bedrooms);
    if (bedMatches.length > 0) {
      const bedScore = Math.min(bedMatches.length / 5, 1) * weights.bedroom;
      totalScore += bedScore;
      reasons.push(`${bedMatches.length} deals with ${property.bedrooms} bedrooms`);
    }

    return { score: Math.min(totalScore, 1), reasons };
  }

  /**
   * Get property recommendations
   */
  getRecommendations(
    properties: Array<{
      id: string;
      zipCode: string;
      price: number;
      propertyType: string;
      bedrooms: number;
      filters?: Record<string, unknown>;
    }>
  ): PropertyMatch[] {
    const matches: PropertyMatch[] = properties.map((property) => {
      const { score, reasons } = this.calculateScore(property);
      const avgProfit = this.getAverageProfit(property.zipCode, property.propertyType);

      return {
        propertyId: property.id,
        score,
        matchReasons: reasons,
        estimatedProfit: avgProfit,
        confidence: this.calculateConfidence(score, reasons.length),
      };
    });

    return matches
      .filter((m) => m.confidence >= this.config.minConfidence)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.config.maxResults);
  }

  private getAverageProfit(zipCode: string, propertyType: string): number {
    const relevant = this.patterns.filter(
      (p) => p.zipCode === zipCode || p.propertyType === propertyType
    );
    if (relevant.length === 0) return 0;
    return relevant.reduce((sum, p) => sum + p.profit, 0) / relevant.length;
  }

  private calculateConfidence(score: number, reasonCount: number): number {
    const patternConfidence = Math.min(this.patterns.length / 20, 1);
    const reasonConfidence = Math.min(reasonCount / 4, 1);
    return score * 0.5 + patternConfidence * 0.3 + reasonConfidence * 0.2;
  }

  getPatternCount(): number {
    return this.patterns.length;
  }

  getTopZipCodes(limit = 5): { zipCode: string; count: number; avgProfit: number }[] {
    const zipStats = new Map<string, { count: number; totalProfit: number }>();
    this.patterns.forEach((p) => {
      const stats = zipStats.get(p.zipCode) || { count: 0, totalProfit: 0 };
      stats.count++;
      stats.totalProfit += p.profit;
      zipStats.set(p.zipCode, stats);
    });
    return Array.from(zipStats.entries())
      .map(([zipCode, stats]) => ({
        zipCode,
        count: stats.count,
        avgProfit: stats.totalProfit / stats.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

export const recommendationEngine = new RecommendationEngine();
