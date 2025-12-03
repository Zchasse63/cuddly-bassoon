/**
 * AI Rate Limiter
 * Manages rate limiting for AI API requests
 */

import { redis } from '@/lib/cache';

// Rate limit configuration
const RATE_LIMITS = {
  requests: {
    perMinute: 60,
    perHour: 1000,
  },
  tokens: {
    perMinute: 100000,
    perDay: 1000000,
  },
};

export interface RateLimitStatus {
  allowed: boolean;
  remaining: {
    requestsPerMinute: number;
    requestsPerHour: number;
    tokensPerMinute: number;
    tokensPerDay: number;
  };
  resetAt: {
    requestsMinute: Date;
    requestsHour: Date;
    tokensMinute: Date;
    tokensDay: Date;
  };
  retryAfter?: number;
}

/**
 * Check if a request is allowed under rate limits
 */
export async function checkRateLimit(
  userId: string,
  estimatedTokens: number = 0
): Promise<RateLimitStatus> {
  const now = Date.now();
  const minuteWindow = Math.floor(now / 60000);
  const hourWindow = Math.floor(now / 3600000);
  const dayWindow = Math.floor(now / 86400000);

  const keys = {
    reqMin: `ai:rate:req:min:${userId}:${minuteWindow}`,
    reqHour: `ai:rate:req:hour:${userId}:${hourWindow}`,
    tokMin: `ai:rate:tok:min:${userId}:${minuteWindow}`,
    tokDay: `ai:rate:tok:day:${userId}:${dayWindow}`,
  };

  try {
    // Get current counts
    const [reqMinCount, reqHourCount, tokMinCount, tokDayCount] = await Promise.all([
      redis.get(keys.reqMin),
      redis.get(keys.reqHour),
      redis.get(keys.tokMin),
      redis.get(keys.tokDay),
    ]);

    const current = {
      reqMin: parseInt(reqMinCount as string) || 0,
      reqHour: parseInt(reqHourCount as string) || 0,
      tokMin: parseInt(tokMinCount as string) || 0,
      tokDay: parseInt(tokDayCount as string) || 0,
    };

    // Check limits
    const exceeds = {
      reqMin: current.reqMin >= RATE_LIMITS.requests.perMinute,
      reqHour: current.reqHour >= RATE_LIMITS.requests.perHour,
      tokMin: current.tokMin + estimatedTokens > RATE_LIMITS.tokens.perMinute,
      tokDay: current.tokDay + estimatedTokens > RATE_LIMITS.tokens.perDay,
    };

    const allowed = !exceeds.reqMin && !exceeds.reqHour && !exceeds.tokMin && !exceeds.tokDay;

    // Calculate reset times
    const nextMinute = new Date((minuteWindow + 1) * 60000);
    const nextHour = new Date((hourWindow + 1) * 3600000);
    const nextDay = new Date((dayWindow + 1) * 86400000);

    // Calculate retry after (seconds)
    let retryAfter: number | undefined;
    if (!allowed) {
      if (exceeds.reqMin || exceeds.tokMin) {
        retryAfter = Math.ceil((nextMinute.getTime() - now) / 1000);
      } else if (exceeds.reqHour) {
        retryAfter = Math.ceil((nextHour.getTime() - now) / 1000);
      } else {
        retryAfter = Math.ceil((nextDay.getTime() - now) / 1000);
      }
    }

    return {
      allowed,
      remaining: {
        requestsPerMinute: Math.max(0, RATE_LIMITS.requests.perMinute - current.reqMin),
        requestsPerHour: Math.max(0, RATE_LIMITS.requests.perHour - current.reqHour),
        tokensPerMinute: Math.max(0, RATE_LIMITS.tokens.perMinute - current.tokMin),
        tokensPerDay: Math.max(0, RATE_LIMITS.tokens.perDay - current.tokDay),
      },
      resetAt: {
        requestsMinute: nextMinute,
        requestsHour: nextHour,
        tokensMinute: nextMinute,
        tokensDay: nextDay,
      },
      retryAfter,
    };
  } catch (error) {
    console.error('[AI Rate Limiter] Error checking rate limit:', error);
    // Allow on error to avoid blocking
    return {
      allowed: true,
      remaining: {
        requestsPerMinute: RATE_LIMITS.requests.perMinute,
        requestsPerHour: RATE_LIMITS.requests.perHour,
        tokensPerMinute: RATE_LIMITS.tokens.perMinute,
        tokensPerDay: RATE_LIMITS.tokens.perDay,
      },
      resetAt: {
        requestsMinute: new Date(now + 60000),
        requestsHour: new Date(now + 3600000),
        tokensMinute: new Date(now + 60000),
        tokensDay: new Date(now + 86400000),
      },
    };
  }
}

/**
 * Record a request for rate limiting
 */
export async function recordRequest(userId: string, tokensUsed: number): Promise<void> {
  const now = Date.now();
  const minuteWindow = Math.floor(now / 60000);
  const hourWindow = Math.floor(now / 3600000);
  const dayWindow = Math.floor(now / 86400000);

  const keys = {
    reqMin: `ai:rate:req:min:${userId}:${minuteWindow}`,
    reqHour: `ai:rate:req:hour:${userId}:${hourWindow}`,
    tokMin: `ai:rate:tok:min:${userId}:${minuteWindow}`,
    tokDay: `ai:rate:tok:day:${userId}:${dayWindow}`,
  };

  try {
    await Promise.all([
      redis.incr(keys.reqMin).then(() => redis.expire(keys.reqMin, 120)),
      redis.incr(keys.reqHour).then(() => redis.expire(keys.reqHour, 7200)),
      redis.incrby(keys.tokMin, tokensUsed).then(() => redis.expire(keys.tokMin, 120)),
      redis.incrby(keys.tokDay, tokensUsed).then(() => redis.expire(keys.tokDay, 172800)),
    ]);
  } catch (error) {
    console.error('[AI Rate Limiter] Error recording request:', error);
  }
}

