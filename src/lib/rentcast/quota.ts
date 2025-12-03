import { redis } from '@/lib/cache/redis';

// ============================================
// Quota Configuration
// ============================================

/**
 * Monthly quota limits by plan tier
 */
export const QUOTA_LIMITS = {
  free: 500,
  starter: 5000,
  professional: 25000,
  enterprise: 100000,
} as const;

export type QuotaTier = keyof typeof QUOTA_LIMITS;

/**
 * Alert thresholds as percentages of quota
 */
export const ALERT_THRESHOLDS = [75, 90, 95] as const;

// Redis key prefixes
const QUOTA_PREFIX = 'rentcast:quota:';
const DAILY_USAGE_PREFIX = 'rentcast:usage:daily:';
const MONTHLY_USAGE_PREFIX = 'rentcast:usage:monthly:';

// ============================================
// Quota Manager
// ============================================

export interface QuotaStatus {
  used: number;
  limit: number;
  remaining: number;
  percentUsed: number;
  resetDate: Date;
  alertTriggered: boolean;
  alertLevel?: number;
}

export interface UsageStats {
  daily: Record<string, number>;
  monthly: number;
  byEndpoint: Record<string, number>;
}

/**
 * Manages API quota tracking and enforcement.
 */
export class QuotaManager {
  private readonly tier: QuotaTier;
  private readonly hardLimitPercent = 100; // Block at 100%

  constructor(tier: QuotaTier = 'professional') {
    this.tier = tier;
  }

  /**
   * Get current quota status
   */
  async getQuotaStatus(): Promise<QuotaStatus> {
    const limit = QUOTA_LIMITS[this.tier];
    const monthKey = this.getMonthKey();
    const key = `${MONTHLY_USAGE_PREFIX}${monthKey}`;

    try {
      const used = (await redis.get<number>(key)) || 0;
      const remaining = Math.max(0, limit - used);
      const percentUsed = (used / limit) * 100;

      // Determine alert level
      let alertTriggered = false;
      let alertLevel: number | undefined;

      for (const threshold of ALERT_THRESHOLDS) {
        if (percentUsed >= threshold) {
          alertTriggered = true;
          alertLevel = threshold;
        }
      }

      return {
        used,
        limit,
        remaining,
        percentUsed,
        resetDate: this.getNextResetDate(),
        alertTriggered,
        alertLevel,
      };
    } catch (error) {
      console.error('Failed to get quota status:', error);
      return {
        used: 0,
        limit,
        remaining: limit,
        percentUsed: 0,
        resetDate: this.getNextResetDate(),
        alertTriggered: false,
      };
    }
  }

  /**
   * Check if request can proceed under quota limits
   */
  async canMakeRequest(): Promise<{ allowed: boolean; reason?: string }> {
    const status = await this.getQuotaStatus();

    if (status.percentUsed >= this.hardLimitPercent) {
      return {
        allowed: false,
        reason: `Monthly quota exceeded (${status.used}/${status.limit}). Resets on ${status.resetDate.toLocaleDateString()}.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Record API usage
   */
  async recordUsage(endpoint: string, count: number = 1): Promise<void> {
    const monthKey = this.getMonthKey();
    const dayKey = this.getDayKey();

    try {
      const pipeline = redis.pipeline();

      // Increment monthly usage
      pipeline.incrby(`${MONTHLY_USAGE_PREFIX}${monthKey}`, count);
      // Set expiry for monthly key (35 days to be safe)
      pipeline.expire(`${MONTHLY_USAGE_PREFIX}${monthKey}`, 35 * 24 * 60 * 60);

      // Increment daily usage
      pipeline.incrby(`${DAILY_USAGE_PREFIX}${dayKey}`, count);
      // Set expiry for daily key (2 days)
      pipeline.expire(`${DAILY_USAGE_PREFIX}${dayKey}`, 2 * 24 * 60 * 60);

      // Track by endpoint
      pipeline.hincrby(`${QUOTA_PREFIX}endpoints:${monthKey}`, endpoint, count);
      pipeline.expire(`${QUOTA_PREFIX}endpoints:${monthKey}`, 35 * 24 * 60 * 60);

      await pipeline.exec();

      // Check for alerts
      await this.checkAlerts();
    } catch (error) {
      console.error('Failed to record usage:', error);
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<UsageStats> {
    const monthKey = this.getMonthKey();

    try {
      // Get last 7 days of usage
      const daily: Record<string, number> = {};
      const today = new Date();

      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dayKey = this.formatDate(date);
        const usage = (await redis.get<number>(`${DAILY_USAGE_PREFIX}${dayKey}`)) || 0;
        daily[dayKey] = usage;
      }

      // Get monthly total
      const monthly = (await redis.get<number>(`${MONTHLY_USAGE_PREFIX}${monthKey}`)) || 0;

      // Get usage by endpoint
      const byEndpoint = (await redis.hgetall(`${QUOTA_PREFIX}endpoints:${monthKey}`)) || {};
      const endpointStats: Record<string, number> = {};
      for (const [key, value] of Object.entries(byEndpoint)) {
        endpointStats[key] = typeof value === 'number' ? value : parseInt(value as string, 10) || 0;
      }

      return { daily, monthly, byEndpoint: endpointStats };
    } catch (error) {
      console.error('Failed to get usage stats:', error);
      return { daily: {}, monthly: 0, byEndpoint: {} };
    }
  }

  /**
   * Check and trigger alerts if thresholds are crossed
   */
  private async checkAlerts(): Promise<void> {
    const status = await this.getQuotaStatus();

    if (status.alertTriggered && status.alertLevel) {
      const alertKey = `${QUOTA_PREFIX}alert:${this.getMonthKey()}:${status.alertLevel}`;
      const alreadyAlerted = await redis.get(alertKey);

      if (!alreadyAlerted) {
        // Mark alert as sent
        await redis.set(alertKey, '1', { ex: 35 * 24 * 60 * 60 });

        // Log alert (in production, would send notification)
        console.warn(
          `RentCast quota alert: ${status.alertLevel}% threshold reached ` +
            `(${status.used}/${status.limit} requests used)`
        );
      }
    }
  }

  private getMonthKey(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }

  private getDayKey(): string {
    return this.formatDate(new Date());
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0] ?? '';
  }

  private getNextResetDate(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
}

// Export singleton instance
let quotaManagerInstance: QuotaManager | null = null;

export function getQuotaManager(tier?: QuotaTier): QuotaManager {
  if (!quotaManagerInstance) {
    quotaManagerInstance = new QuotaManager(tier);
  }
  return quotaManagerInstance;
}

