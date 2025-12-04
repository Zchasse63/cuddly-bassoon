/**
 * AI Cost Tracker
 * Tracks token usage and costs for AI requests
 */

import { GrokModelId, MODEL_COSTS, GROK_MODELS } from './models';
import { redis } from '@/lib/cache';

export interface UsageRecord {
  userId: string;
  model: GrokModelId;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  feature: string;
  timestamp: Date;
}

export interface UsageSummary {
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  byModel: Record<string, { inputTokens: number; outputTokens: number; cost: number }>;
  byFeature: Record<string, { inputTokens: number; outputTokens: number; cost: number }>;
  requestCount: number;
}

/**
 * Calculate cost for a request
 */
export function calculateCost(
  model: GrokModelId,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = MODEL_COSTS[model];
  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;
  return Math.round((inputCost + outputCost) * 10000) / 10000; // Round to 4 decimal places
}

/**
 * Track a usage record
 */
export async function trackUsage(record: Omit<UsageRecord, 'cost' | 'timestamp'>): Promise<void> {
  const cost = calculateCost(record.model, record.inputTokens, record.outputTokens);
  const timestamp = new Date();
  const dayKey = timestamp.toISOString().split('T')[0] ?? timestamp.toISOString().slice(0, 10);

  const fullRecord: UsageRecord = {
    ...record,
    cost,
    timestamp,
  };

  try {
    // Store in Redis for fast access
    const userDayKey = `ai:usage:${record.userId}:${dayKey}`;

    // Get existing data or create new
    const existing = await redis.get(userDayKey);
    const data: UsageRecord[] = existing ? (JSON.parse(existing as string) as UsageRecord[]) : [];
    data.push(fullRecord);

    // Store with 30 day expiry
    await redis.set(userDayKey, JSON.stringify(data), { ex: 30 * 24 * 60 * 60 });

    // Update daily totals
    await updateDailyTotals(record.userId, dayKey, fullRecord);

    console.log('[AI Cost Tracker] Recorded:', {
      model: record.model,
      tokens: record.inputTokens + record.outputTokens,
      cost: `$${cost.toFixed(4)}`,
    });
  } catch (error) {
    console.error('[AI Cost Tracker] Error tracking usage:', error);
  }
}

async function updateDailyTotals(userId: string, dayKey: string, record: UsageRecord): Promise<void> {
  const totalsKey = `ai:totals:${userId}:${dayKey}`;

  const existing = await redis.get(totalsKey);
  const totals: UsageSummary = existing
    ? (JSON.parse(existing as string) as UsageSummary)
    : {
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCost: 0,
        byModel: {},
        byFeature: {},
        requestCount: 0,
      };

  // Update totals
  totals.totalInputTokens += record.inputTokens;
  totals.totalOutputTokens += record.outputTokens;
  totals.totalCost += record.cost;
  totals.requestCount += 1;

  // Update by model
  const modelStats = totals.byModel[record.model] ?? { inputTokens: 0, outputTokens: 0, cost: 0 };
  modelStats.inputTokens += record.inputTokens;
  modelStats.outputTokens += record.outputTokens;
  modelStats.cost += record.cost;
  totals.byModel[record.model] = modelStats;

  // Update by feature
  const featureStats = totals.byFeature[record.feature] ?? { inputTokens: 0, outputTokens: 0, cost: 0 };
  featureStats.inputTokens += record.inputTokens;
  featureStats.outputTokens += record.outputTokens;
  featureStats.cost += record.cost;
  totals.byFeature[record.feature] = featureStats;

  await redis.set(totalsKey, JSON.stringify(totals), { ex: 30 * 24 * 60 * 60 });
}

/**
 * Get usage summary for a user
 */
export async function getUsageSummary(
  userId: string,
  days: number = 7
): Promise<UsageSummary> {
  const summaries: UsageSummary[] = [];

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dayKey = date.toISOString().split('T')[0];
    const totalsKey = `ai:totals:${userId}:${dayKey}`;

    const data = await redis.get(totalsKey);
    if (data) {
      summaries.push(JSON.parse(data as string) as UsageSummary);
    }
  }

  // Aggregate summaries
  return summaries.reduce(
    (acc, curr) => ({
      totalInputTokens: acc.totalInputTokens + curr.totalInputTokens,
      totalOutputTokens: acc.totalOutputTokens + curr.totalOutputTokens,
      totalCost: acc.totalCost + curr.totalCost,
      byModel: mergeRecords(acc.byModel, curr.byModel),
      byFeature: mergeRecords(acc.byFeature, curr.byFeature),
      requestCount: acc.requestCount + curr.requestCount,
    }),
    {
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalCost: 0,
      byModel: {},
      byFeature: {},
      requestCount: 0,
    }
  );
}

function mergeRecords(
  a: Record<string, { inputTokens: number; outputTokens: number; cost: number }>,
  b: Record<string, { inputTokens: number; outputTokens: number; cost: number }>
): Record<string, { inputTokens: number; outputTokens: number; cost: number }> {
  const result = { ...a };
  for (const key of Object.keys(b)) {
    const bValue = b[key];
    if (!bValue) continue;
    const existing = result[key] ?? { inputTokens: 0, outputTokens: 0, cost: 0 };
    existing.inputTokens += bValue.inputTokens;
    existing.outputTokens += bValue.outputTokens;
    existing.cost += bValue.cost;
    result[key] = existing;
  }
  return result;
}

/**
 * Get cost estimate for a request
 */
export function estimateCost(model: GrokModelId, inputTokens: number, expectedOutput: number = 500): number {
  return calculateCost(model, inputTokens, expectedOutput);
}

/**
 * Get the cheapest model that can handle a task
 */
export function getCheapestModel(requiresComplexReasoning: boolean = false): GrokModelId {
  return requiresComplexReasoning ? GROK_MODELS.REASONING : GROK_MODELS.FAST;
}

