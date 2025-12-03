'use client';

import { useQuery } from '@tanstack/react-query';
import type { Activity } from '@/components/analytics';

interface ActivitiesResponse {
  activities: Activity[];
  total: number;
  hasMore: boolean;
}

async function fetchActivities(
  limit: number = 10,
  offset: number = 0,
  type?: string
): Promise<ActivitiesResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  if (type) {
    params.set('type', type);
  }

  const response = await fetch(`/api/activities?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch activities');
  }
  return response.json();
}

export function useActivities(limit: number = 10, type?: string) {
  return useQuery({
    queryKey: ['activities', limit, type],
    queryFn: () => fetchActivities(limit, 0, type),
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // Refetch every minute
  });
}

// Hook for fetching pipeline summary data
interface PipelineStage {
  name: string;
  count: number;
  value: number;
  color: string;
}

interface PipelineSummaryData {
  stages: PipelineStage[];
  totalValue: number;
  totalDeals: number;
}

async function fetchPipelineSummary(): Promise<PipelineSummaryData> {
  const response = await fetch('/api/analytics/pipeline-summary');
  if (!response.ok) {
    throw new Error('Failed to fetch pipeline summary');
  }
  return response.json();
}

export function usePipelineSummary() {
  return useQuery({
    queryKey: ['pipeline-summary'],
    queryFn: fetchPipelineSummary,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5,
  });
}
