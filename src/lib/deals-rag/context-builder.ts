/**
 * Deal Prediction Context Builder
 * Builds context from historical deals for AI-powered predictions
 */

import {
  searchHistoricalDeals,
  findSimilarDeals,
  getOutcomePattern,
  getHistoricalDealCount,
  buildDealEmbeddingText,
} from './search';
import type {
  DealSearchResult,
  DealOutcomePattern,
  DealPredictionContext,
  DealType,
  SellerType,
} from './types';

/**
 * Build a prediction context for a new deal using historical data
 */
export async function buildDealPredictionContext(options: {
  address?: string;
  city?: string;
  state?: string;
  dealType?: DealType;
  sellerType?: SellerType;
  purchasePrice?: number;
  arv?: number;
  propertyType?: string;
  lessonsQuery?: string; // Specific question to search for relevant lessons
}): Promise<DealPredictionContext> {
  const {
    address,
    city,
    state,
    dealType,
    sellerType,
    purchasePrice,
    arv,
    propertyType,
    lessonsQuery,
  } = options;

  // Check if we have any historical data
  const dealCount = await getHistoricalDealCount();

  if (dealCount === 0) {
    // No historical data available - return empty context
    return {
      similarDeals: [],
      predictedSuccessRate: 0.75, // Default optimistic rate
      predictedDaysToClose: 30,
      riskFactors: ['No historical deal data available for comparison'],
      recommendations: [
        'Consider building historical deal database for better predictions',
        'Use market data and property analysis for deal evaluation',
      ],
      confidence: 0.1, // Very low confidence without historical data
    };
  }

  // Build a query for semantic search
  const queryParts: string[] = [];

  if (city && state) {
    queryParts.push(`Property in ${city}, ${state}`);
  } else if (state) {
    queryParts.push(`Property in ${state}`);
  }

  if (dealType) {
    queryParts.push(`${dealType.replace('_', ' ')} deal`);
  }

  if (sellerType) {
    queryParts.push(`${sellerType.replace('_', ' ')} seller`);
  }

  if (propertyType) {
    queryParts.push(`${propertyType.replace('_', ' ')} property`);
  }

  if (purchasePrice) {
    queryParts.push(`Purchase price around $${purchasePrice.toLocaleString()}`);
  }

  if (arv) {
    queryParts.push(`ARV approximately $${arv.toLocaleString()}`);
  }

  if (lessonsQuery) {
    queryParts.push(lessonsQuery);
  }

  const searchQuery = queryParts.length > 0
    ? queryParts.join('. ')
    : 'Successful wholesale real estate deal';

  // Parallel search for similar deals
  const [semanticResults, attributeResults, outcomePattern] = await Promise.all([
    // Semantic search for contextually similar deals
    searchHistoricalDeals(searchQuery, {
      limit: 5,
      similarityThreshold: 0.4,
      filterDealType: dealType,
      filterState: state,
    }),
    // Attribute-based search for structurally similar deals
    findSimilarDeals({
      city,
      state,
      dealType,
      sellerType,
      priceMin: purchasePrice ? purchasePrice * 0.7 : undefined,
      priceMax: purchasePrice ? purchasePrice * 1.3 : undefined,
      limit: 5,
    }),
    // Get aggregated outcome pattern
    getOutcomePattern({
      city,
      state,
      dealType,
      sellerType,
    }),
  ]);

  // Merge and deduplicate results
  const seenDeals = new Set<string>();
  const similarDeals: DealSearchResult[] = [];

  // Add semantic results first (more relevant)
  for (const deal of semanticResults) {
    if (!seenDeals.has(deal.dealId)) {
      seenDeals.add(deal.dealId);
      similarDeals.push(deal);
    }
  }

  // Add attribute results
  for (const deal of attributeResults) {
    if (!seenDeals.has(deal.dealId) && similarDeals.length < 10) {
      seenDeals.add(deal.dealId);
      similarDeals.push(deal);
    }
  }

  // Calculate predictions from similar deals
  const successfulDeals = similarDeals.filter(d => d.outcome === 'success');
  const failedDeals = similarDeals.filter(d => d.outcome && d.outcome !== 'success');

  // Success rate prediction
  let predictedSuccessRate: number;
  if (outcomePattern && outcomePattern.sampleSize >= 5) {
    // Prefer pattern-based prediction if we have enough data
    predictedSuccessRate = outcomePattern.successRate;
  } else if (similarDeals.length >= 3) {
    // Calculate from similar deals
    predictedSuccessRate = successfulDeals.length / (successfulDeals.length + failedDeals.length) || 0.5;
  } else {
    // Default with low confidence
    predictedSuccessRate = 0.65;
  }

  // Days to close prediction
  let predictedDaysToClose: number;
  if (outcomePattern?.avgDaysToClose) {
    predictedDaysToClose = Math.round(outcomePattern.avgDaysToClose);
  } else {
    const daysToCloseValues = successfulDeals
      .filter(d => d.daysToClose)
      .map(d => d.daysToClose!);
    predictedDaysToClose = daysToCloseValues.length > 0
      ? Math.round(daysToCloseValues.reduce((a, b) => a + b, 0) / daysToCloseValues.length)
      : 30;
  }

  // Profit prediction
  let predictedProfit: number | undefined;
  if (outcomePattern?.avgProfit) {
    predictedProfit = outcomePattern.avgProfit;
  } else {
    const profits = successfulDeals
      .filter(d => d.profit !== undefined)
      .map(d => d.profit!);
    if (profits.length > 0) {
      predictedProfit = profits.reduce((a, b) => a + b, 0) / profits.length;
    }
  }

  // Extract risk factors from failed deals
  const riskFactors: string[] = [];

  // Analyze failure reasons
  const failureReasons = failedDeals
    .filter(d => d.outcome)
    .map(d => d.outcome!);

  const failureCounts: Record<string, number> = {};
  for (const reason of failureReasons) {
    failureCounts[reason] = (failureCounts[reason] || 0) + 1;
  }

  if (outcomePattern?.mostCommonFailureReason) {
    riskFactors.push(`Common failure in similar deals: ${outcomePattern.mostCommonFailureReason.replace('_', ' ')}`);
  }

  for (const [reason, count] of Object.entries(failureCounts)) {
    if (count >= 2) {
      riskFactors.push(`${count} similar deals failed due to ${reason.replace(/_/g, ' ')}`);
    }
  }

  if (predictedSuccessRate < 0.6) {
    riskFactors.push('Low historical success rate for similar deals');
  }

  // Extract recommendations from lessons learned
  const recommendations: string[] = [];
  const allLessons = similarDeals
    .filter(d => d.lessonsLearned)
    .map(d => d.lessonsLearned!)
    .slice(0, 3);

  for (const lesson of allLessons) {
    if (lesson.length < 200) {
      recommendations.push(lesson);
    } else {
      recommendations.push(lesson.slice(0, 200) + '...');
    }
  }

  // Add generic recommendations based on deal type
  if (dealType === 'wholesale' && recommendations.length === 0) {
    recommendations.push('Build strong buyer list before locking up properties');
    recommendations.push('Verify seller motivation early in the process');
  } else if (dealType === 'fix_flip' && recommendations.length === 0) {
    recommendations.push('Get accurate repair estimates from contractors');
    recommendations.push('Factor in holding costs and market timing');
  }

  // Calculate confidence based on data quality
  let confidence = 0.3; // Base confidence

  if (similarDeals.length >= 5) {
    confidence += 0.2;
  } else if (similarDeals.length >= 3) {
    confidence += 0.1;
  }

  if (outcomePattern && outcomePattern.sampleSize >= 10) {
    confidence += 0.3;
  } else if (outcomePattern && outcomePattern.sampleSize >= 5) {
    confidence += 0.15;
  }

  if (semanticResults.length > 0 && semanticResults[0]!.similarity > 0.7) {
    confidence += 0.2;
  }

  confidence = Math.min(0.95, confidence);

  return {
    similarDeals,
    outcomePattern: outcomePattern || undefined,
    predictedSuccessRate,
    predictedDaysToClose,
    predictedProfit,
    riskFactors,
    recommendations,
    confidence,
  };
}

/**
 * Format prediction context for LLM prompt
 */
export function formatPredictionContextForPrompt(context: DealPredictionContext): string {
  const parts: string[] = [];

  parts.push('## Historical Deal Analysis');
  parts.push('');

  if (context.similarDeals.length > 0) {
    parts.push(`### Similar Historical Deals (${context.similarDeals.length} found)`);
    parts.push('');

    for (const deal of context.similarDeals.slice(0, 5)) {
      parts.push(`**Deal in ${deal.city || 'Unknown'}, ${deal.state || 'Unknown'}**`);
      parts.push(`- Type: ${deal.dealType?.replace('_', ' ') || 'Unknown'}`);
      parts.push(`- Purchase: $${deal.purchasePrice.toLocaleString()}`);
      if (deal.profit !== undefined) {
        parts.push(`- Profit: $${deal.profit.toLocaleString()}`);
      }
      parts.push(`- Outcome: ${deal.outcome?.replace('_', ' ') || 'Unknown'}`);
      if (deal.lessonsLearned) {
        parts.push(`- Lesson: ${deal.lessonsLearned.slice(0, 100)}...`);
      }
      parts.push('');
    }
  } else {
    parts.push('*No similar historical deals found in database*');
    parts.push('');
  }

  parts.push('### Predictions Based on Historical Data');
  parts.push('');
  parts.push(`- **Success Rate**: ${(context.predictedSuccessRate * 100).toFixed(0)}%`);
  parts.push(`- **Estimated Days to Close**: ${context.predictedDaysToClose}`);
  if (context.predictedProfit) {
    parts.push(`- **Average Profit**: $${Math.round(context.predictedProfit).toLocaleString()}`);
  }
  parts.push(`- **Confidence Level**: ${(context.confidence * 100).toFixed(0)}%`);
  parts.push('');

  if (context.riskFactors.length > 0) {
    parts.push('### Risk Factors');
    for (const risk of context.riskFactors) {
      parts.push(`- ${risk}`);
    }
    parts.push('');
  }

  if (context.recommendations.length > 0) {
    parts.push('### Recommendations from Similar Deals');
    for (const rec of context.recommendations) {
      parts.push(`- ${rec}`);
    }
    parts.push('');
  }

  return parts.join('\n');
}
