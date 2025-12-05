'use client';

/**
 * useMotivationScore Hook
 *
 * Fetches and caches seller motivation scores for properties.
 */

import { useState, useEffect, useCallback } from 'react';

interface ScoringFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

interface AIAdjustment {
  factor: string;
  adjustment: number;
  reasoning: string;
}

interface Predictions {
  timeToDecision: string;
  bestApproachTiming: string;
  optimalOfferRange: { min: number; max: number };
}

interface OwnerClassification {
  primaryClass: 'individual' | 'investor_entity' | 'institutional_distressed';
  subClass: string;
  confidence: number;
}

interface MotivationScore {
  propertyId: string;
  address: string;
  standardScore: {
    score: number;
    confidence: number;
    factors: ScoringFactor[];
    recommendation: string;
    riskFactors?: string[];
    modelUsed?: string;
  };
  ownerClassification: OwnerClassification;
  dealFlowIQ?: {
    iqScore: number;
    aiAdjustments: AIAdjustment[];
    predictions: Predictions;
  };
  dataQuality: {
    signalsAvailable: number;
    signalsMissing: string[];
    sourcesUsed: string[];
    confidence: number;
  };
  timing: {
    fetchMs: number;
    classifyMs: number;
    scoreMs: number;
    totalMs: number;
  };
}

interface UseMotivationScoreOptions {
  propertyId: string;
  scoreType?: 'standard' | 'dealflow_iq' | 'both';
  enabled?: boolean;
}

interface UseMotivationScoreResult {
  data: MotivationScore | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Simple in-memory cache
const scoreCache = new Map<string, { data: MotivationScore; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useMotivationScore({
  propertyId,
  scoreType = 'standard',
  enabled = true,
}: UseMotivationScoreOptions): UseMotivationScoreResult {
  const [data, setData] = useState<MotivationScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async (forceRefresh = false) => {
    if (!propertyId) return;

    const cacheKey = `${propertyId}-${scoreType}`;

    // Check cache first
    if (!forceRefresh) {
      const cached = scoreCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setData(cached.data);
        return;
      }
    }

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({ scoreType });
      if (forceRefresh) {
        params.append('refresh', 'true');
      }

      const response = await fetch(
        `/api/properties/${propertyId}/motivation?${params.toString()}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch motivation score');
      }

      const scoreData: MotivationScore = await response.json();

      // Update cache
      scoreCache.set(cacheKey, {
        data: scoreData,
        timestamp: Date.now(),
      });

      setData(scoreData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [propertyId, scoreType]);

  useEffect(() => {
    if (enabled && propertyId) {
      fetchScore();
    }
  }, [enabled, propertyId, fetchScore]);

  const refetch = useCallback(async () => {
    await fetchScore(true);
  }, [fetchScore]);

  return { data, isLoading, error, refetch };
}

/**
 * Prefetch motivation score for a property
 */
export async function prefetchMotivationScore(
  propertyId: string,
  scoreType: 'standard' | 'dealflow_iq' | 'both' = 'standard'
): Promise<MotivationScore | null> {
  const cacheKey = `${propertyId}-${scoreType}`;

  // Check cache
  const cached = scoreCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({ scoreType });
    const response = await fetch(
      `/api/properties/${propertyId}/motivation?${params.toString()}`
    );

    if (!response.ok) {
      return null;
    }

    const scoreData: MotivationScore = await response.json();

    // Update cache
    scoreCache.set(cacheKey, {
      data: scoreData,
      timestamp: Date.now(),
    });

    return scoreData;
  } catch {
    return null;
  }
}

/**
 * Clear cache for a property
 */
export function clearMotivationScoreCache(propertyId?: string): void {
  if (propertyId) {
    // Clear specific property
    for (const key of scoreCache.keys()) {
      if (key.startsWith(propertyId)) {
        scoreCache.delete(key);
      }
    }
  } else {
    // Clear all
    scoreCache.clear();
  }
}
