/**
 * Context Builder for RAG
 * Assembles relevant context from search results for LLM prompts
 */

import { type SearchResult } from './search';

export interface RAGContext {
  systemPrompt: string;
  contextText: string;
  sources: Array<{
    title: string;
    slug: string;
    category: string;
    relevance: number;
  }>;
  tokenEstimate: number;
}

const SYSTEM_PROMPT = `You are an expert AI assistant for real estate wholesaling. You help users understand real estate investing concepts, analyze deals, and navigate the wholesaling process.

Your knowledge comes from a comprehensive knowledge base covering:
- Real estate fundamentals (70% rule, ARV, repair estimates)
- Property filters and search criteria
- Buyer intelligence and list building
- Market analysis techniques
- Deal analysis and evaluation
- Negotiation strategies
- Outreach and communication
- Risk factors and due diligence
- Legal compliance and contracts
- Real-world case studies

Guidelines:
1. Base your answers on the provided context from the knowledge base
2. Be specific and actionable in your advice
3. When discussing numbers or calculations, show your work
4. If the context doesn't contain enough information, say so clearly
5. Reference specific concepts or strategies from the knowledge base when relevant
6. For legal or compliance questions, recommend consulting with local professionals`;

/**
 * Build context from search results for RAG
 */
export function buildContext(
  _query: string,
  searchResults: SearchResult[],
  maxTokens = 4000
): RAGContext {
  const sources: RAGContext['sources'] = [];
  const contextParts: string[] = [];
  let tokenEstimate = 0;

  // Sort by similarity (highest first)
  const sortedResults = [...searchResults].sort((a, b) => b.similarity - a.similarity);

  for (const result of sortedResults) {
    // Estimate tokens (rough: 1 token ≈ 4 chars)
    const chunkTokens = Math.ceil(result.content.length / 4);
    
    if (tokenEstimate + chunkTokens > maxTokens) {
      break;
    }

    // Build context section
    const sectionHeader = result.metadata.sectionHeaders.length > 0
      ? ` > ${result.metadata.sectionHeaders.join(' > ')}`
      : '';
    
    const contextSection = `
---
Source: ${result.metadata.title}${sectionHeader}
Category: ${result.metadata.category}
Relevance: ${(result.similarity * 100).toFixed(0)}%

${result.content}
---`;

    contextParts.push(contextSection);
    tokenEstimate += chunkTokens + 20; // Add overhead for formatting

    // Track unique sources
    if (!sources.find(s => s.slug === result.metadata.slug)) {
      sources.push({
        title: result.metadata.title,
        slug: result.metadata.slug,
        category: result.metadata.category,
        relevance: result.similarity,
      });
    }
  }

  const contextText = contextParts.length > 0
    ? `Here is relevant information from the knowledge base:\n${contextParts.join('\n')}`
    : 'No relevant information found in the knowledge base for this query.';

  return {
    systemPrompt: SYSTEM_PROMPT,
    contextText,
    sources,
    tokenEstimate,
  };
}

/**
 * Format the final prompt for the LLM
 */
export function formatPrompt(context: RAGContext, userQuery: string): string {
  return `${context.contextText}

User Question: ${userQuery}

Please provide a helpful, accurate response based on the knowledge base context above. If the context doesn't fully address the question, acknowledge what you can answer and what requires additional information.`;
}

/**
 * Build a simple context for classification (lighter weight)
 */
export function buildClassificationContext(query: string): string {
  return `Classify the following user query about real estate wholesaling.

Query: "${query}"

Determine:
1. Intent: question, how-to, calculation, comparison, or general
2. Topics: List relevant topics (e.g., 70% rule, ARV, filters, negotiations)
3. Complexity: simple, moderate, or complex
4. Requires: List what information is needed to answer

Respond in JSON format.`;
}

