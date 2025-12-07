/**
 * AI Chat Streaming Endpoint
 * POST /api/ai/chat
 *
 * UNIFIED AI INTERFACE with:
 * - RAG integration for domain knowledge (pgvector)
 * - 212 AI tools for real estate operations
 * - xAI Grok models with auto-routing
 *
 * Every request queries RAG for relevant real estate knowledge
 * to inform tool usage and response generation.
 *
 * Updated December 2025 - Migrated from Claude to xAI Grok
 */

import { NextRequest } from 'next/server';
import { createXai } from '@ai-sdk/xai';
import {
  streamText,
  CoreMessage,
  NoSuchToolError,
  InvalidToolInputError,
} from 'ai';
import { z } from 'zod';

import { GROK_MODELS, GrokModelId } from '@/lib/ai/models';
import { classifyAndRoute } from '@/lib/ai/router';
import {
  ensureToolsInitialized,
  convertToAISDKTools,
  createDefaultContext,
  getActiveToolKeys,
  getToolCount,
} from '@/lib/ai/tools/adapter';
import { ToolCategory } from '@/lib/ai/tools/types';
import { searchDocuments, type SearchResult } from '@/lib/rag/search';

// Phase 1-4 RAG Improvements
import { reformulateForRAG } from '@/lib/rag/query-reformulator';
import { getToolAwareCategories } from '@/lib/rag/tool-rag-hints';
import {
  getConversationState,
  updateConversationState,
  summarizeConversation,
  generateContextAwareQuery,
} from '@/lib/rag/conversation-context';
import { analyzeToolResult, dynamicRetrieve, mightNeedReRetrieval } from '@/lib/rag/dynamic-retrieval';

const xai = createXai({
  apiKey: process.env.XAI_API_KEY || '',
});

// Request validation schema
const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })
  ),
  model: z.enum([GROK_MODELS.REASONING, GROK_MODELS.FAST]).optional(),
  systemPrompt: z.string().optional(),
  autoRoute: z.boolean().optional().default(true),
  maxTokens: z.number().optional().default(4096),
  temperature: z.number().min(0).max(1).optional().default(0.7),
  // Tool-related options
  enableTools: z.boolean().optional().default(true),
  toolCategories: z.array(z.string()).optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

// Note: Using nodejs runtime for RAG/pgvector compatibility
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Enhanced RAG Context with Phase 1-4 Improvements
 *
 * Phase 1: Query Reformulation - Transform action queries for better retrieval
 * Phase 2: Tool-Aware Categories - Pre-associate likely tools with KB categories
 * Phase 3: Conversation Context - Track fetched docs, avoid redundancy
 */
interface EnhancedRAGResult {
  context: string;
  sources: Array<{ title: string; category: string; relevance: number }>;
  fetchedDocIds: string[];
  fetchedCategories: string[];
  reformulatedQuery: string;
}

async function fetchEnhancedRAGContext(
  query: string,
  messages: CoreMessage[],
  sessionId?: string,
  routingClassification?: { categories?: string[] } | null
): Promise<EnhancedRAGResult> {
  try {
    // Phase 1: Query Reformulation (with timeout for latency)
    const reformulated = await reformulateForRAG(query, { timeout: 1500 });

    // Phase 2: Tool-Aware Categories
    const toolCategories = getToolAwareCategories(query, routingClassification as Parameters<typeof getToolAwareCategories>[1]);

    // Phase 3: Conversation Context
    let excludeDocIds: string[] = [];
    let conversationCategories: string[] = [];

    if (sessionId) {
      const conversationState = await getConversationState(sessionId);
      if (conversationState) {
        const summary = await summarizeConversation(messages, conversationState);
        const contextAware = generateContextAwareQuery(
          reformulated.knowledgeQuery,
          summary,
          conversationState
        );
        excludeDocIds = contextAware.excludeDocIds;
        conversationCategories = contextAware.categories;
      }
    }

    // Merge all category sources (reformulation + tool-aware + conversation)
    const allCategories = [
      ...new Set([
        ...reformulated.suggestedCategories,
        ...toolCategories,
        ...conversationCategories,
      ]),
    ];

    // Search with enhanced parameters
    const results = await searchDocuments(reformulated.knowledgeQuery, {
      limit: 4, // Slightly more for better coverage
      threshold: 0.45, // Slightly lower threshold for reformulated queries
      categories: allCategories.length > 0 ? allCategories : undefined,
      excludeDocIds: excludeDocIds.length > 0 ? excludeDocIds : undefined,
    });

    if (results.length === 0) {
      return {
        context: '',
        sources: [],
        fetchedDocIds: [],
        fetchedCategories: [],
        reformulatedQuery: reformulated.knowledgeQuery,
      };
    }

    // Format RAG results into context string
    const contextParts = results.map((r: SearchResult, i: number) =>
      `[Source ${i + 1}: ${r.metadata.title}]\n${r.content}`
    );

    const sources = results.map((r: SearchResult) => ({
      title: r.metadata.title,
      category: r.metadata.category,
      relevance: Math.round(r.similarity * 100),
    }));

    const fetchedDocIds = results.map((r: SearchResult) => r.documentId);
    const fetchedCategories = [...new Set(results.map((r: SearchResult) => r.metadata.category))];

    return {
      context: contextParts.join('\n\n'),
      sources,
      fetchedDocIds,
      fetchedCategories,
      reformulatedQuery: reformulated.knowledgeQuery,
    };
  } catch (error) {
    console.error('[AI Chat] Enhanced RAG fetch error:', error);
    // Graceful fallback to simple search
    try {
      const results = await searchDocuments(query, { limit: 3, threshold: 0.5 });
      const contextParts = results.map((r: SearchResult, i: number) =>
        `[Source ${i + 1}: ${r.metadata.title}]\n${r.content}`
      );
      const sources = results.map((r: SearchResult) => ({
        title: r.metadata.title,
        category: r.metadata.category,
        relevance: Math.round(r.similarity * 100),
      }));
      return {
        context: contextParts.join('\n\n'),
        sources,
        fetchedDocIds: results.map(r => r.documentId),
        fetchedCategories: [...new Set(results.map(r => r.metadata.category))],
        reformulatedQuery: query,
      };
    } catch {
      return {
        context: '',
        sources: [],
        fetchedDocIds: [],
        fetchedCategories: [],
        reformulatedQuery: query,
      };
    }
  }
}

/**
 * Build system prompt with RAG context
 *
 * IMPORTANT: RAG context provides foundational knowledge, NOT limitations.
 * The framing language explicitly encourages creative problem-solving
 * beyond documented patterns.
 */
function buildSystemPromptWithRAG(
  basePrompt: string | undefined,
  ragContext: string,
  toolCount: number
): string {
  const parts: string[] = [];

  // Base identity with creativity emphasis
  parts.push(basePrompt || 'You are an expert real estate wholesaling AI assistant.');

  // Creative problem-solving principle (always included)
  parts.push(`
## Core Principle: Creative Problem Solving
You are a creative problem-solving partner, not a documentation lookup system. The knowledge and tools available to you are building blocks that enable you to:

- **Combine tools in novel ways** not explicitly documented
- **Adapt workflows** to each user's specific situation
- **Create custom solutions** when standard approaches don't fit
- **Think beyond categories** - any tool can inform any situation
- **Prioritize user needs** over matching documented patterns

Documentation describes common patterns and examples, NOT the limits of what's possible. If a user needs something, find a creative way to help them using available capabilities.
`);

  // Domain knowledge from RAG (with enabling framing)
  if (ragContext) {
    parts.push(`
## Domain Knowledge (Foundational, Not Limiting)
The following knowledge provides context and common patterns. Use this as a **starting point** for understanding, but feel free to:
- Combine concepts in ways not explicitly shown
- Apply knowledge creatively to the user's specific situation
- Go beyond documented workflows when better approaches exist
- Propose novel solutions using these building blocks

${ragContext}

Remember: This knowledge enables creative solutions—it doesn't define the boundaries of what you can do.
`);
  }

  // Tool awareness with combinatorial framing
  parts.push(`
## Available Tools (${toolCount} Capabilities)
You have access to ${toolCount} tools for real estate operations. These tools can be:
- **Combined creatively** in ways beyond documented use cases
- **Applied to novel situations** not explicitly described
- **Sequenced in custom workflows** designed for specific needs
- **Used as building blocks** for sophisticated solutions

Tool categories include: property search & analysis, deal pipeline management, buyer matching & CRM, market analysis, motivation scoring, permits & contractors, geographic/map tools, communication, document generation, batch operations, and more.

When helping users:
1. Understand what they're actually trying to accomplish
2. Consider ALL tools that might contribute (not just obvious matches)
3. Combine and adapt tools creatively for their specific situation
4. Propose solutions even if not explicitly documented
`);

  return parts.join('\n\n');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = chatRequestSchema.safeParse(body);

    if (!validatedData.success) {
      return new Response(JSON.stringify({ error: 'Invalid request', details: validatedData.error.flatten() }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const {
      messages,
      model: requestedModel,
      systemPrompt,
      autoRoute,
      maxTokens,
      temperature,
      enableTools,
      toolCategories,
      userId,
      sessionId,
    } = validatedData.data;

    // Initialize tools (only runs once)
    await ensureToolsInitialized();

    // Get the latest user message for RAG query and model routing
    const lastUserMessage = messages.filter((m) => m.role === 'user').pop();
    const userQuery = lastUserMessage?.content || '';

    // Determine which model to use
    let selectedModel: GrokModelId = requestedModel || GROK_MODELS.FAST;
    let routingDecision: { model: GrokModelId; categories?: string[] } | null = null;

    if (autoRoute && !requestedModel && userQuery) {
      routingDecision = await classifyAndRoute(userQuery);
      selectedModel = routingDecision.model;
    }

    // Convert messages to CoreMessage format (needed for RAG context)
    const coreMessages: CoreMessage[] = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Fetch enhanced RAG context with all Phase 1-4 improvements
    const ragPromise = userQuery
      ? fetchEnhancedRAGContext(userQuery, coreMessages, sessionId, routingDecision)
      : Promise.resolve({
          context: '',
          sources: [],
          fetchedDocIds: [],
          fetchedCategories: [],
          reformulatedQuery: '',
        });

    // Create execution context
    const context = createDefaultContext({ userId, sessionId });

    // Get tools if enabled
    const tools = enableTools ? convertToAISDKTools(context) : undefined;

    // Get active tool keys (for limiting available tools by category)
    const activeTools = enableTools && toolCategories?.length
      ? getActiveToolKeys(context, toolCategories as ToolCategory[])
      : undefined;

    // Wait for RAG context
    const ragResult = await ragPromise;
    const { context: ragContext, sources: ragSources, fetchedDocIds, fetchedCategories } = ragResult;

    // Log RAG usage with enhanced info
    if (ragSources.length > 0) {
      console.log(`[AI Chat] RAG context loaded: ${ragSources.map(s => s.title).join(', ')}`);
      if (ragResult.reformulatedQuery !== userQuery) {
        console.log(`[AI Chat] Query reformulated: "${userQuery}" -> "${ragResult.reformulatedQuery}"`);
      }
    }

    // Phase 3: Update conversation state (async, non-blocking)
    if (sessionId) {
      updateConversationState(sessionId, {
        fetchedDocIds,
        fetchedCategories,
        messageCount: 1,
      }).catch(err => console.error('[AI Chat] Failed to update conversation state:', err));
    }

    // Build enhanced system prompt with RAG context and tool awareness
    const enhancedSystemPrompt = buildSystemPromptWithRAG(
      systemPrompt,
      ragContext,
      enableTools ? getToolCount() : 0
    );

    // Create streaming response with tools
    const result = streamText({
      model: xai(selectedModel),
      messages: coreMessages,
      system: enhancedSystemPrompt,
      maxOutputTokens: maxTokens,
      temperature,
      tools,
      experimental_activeTools: activeTools,
      // Phase 4: onStepFinish for logging and dynamic re-retrieval
      onStepFinish: async (stepResult) => {
        // Log tool calls if any
        const toolCalls = stepResult.content.filter(
          (part): part is { type: 'tool-call'; toolCallId: string; toolName: string; input: unknown } =>
            'type' in part && part.type === 'tool-call'
        );
        if (toolCalls.length > 0) {
          console.log(`[AI Chat] Tool calls completed:`, toolCalls.map(tc => tc.toolName));

          // Phase 4: Analyze tool results for dynamic re-retrieval
          for (const toolCall of toolCalls) {
            // Quick check if re-retrieval might be needed
            const toolResult = stepResult.content.find(
              (part): part is { type: 'tool-result'; toolCallId: string; result: unknown } =>
                'type' in part && part.type === 'tool-result' && part.toolCallId === toolCall.toolCallId
            );

            if (toolResult && mightNeedReRetrieval(toolResult.result)) {
              // Full analysis
              const analysis = analyzeToolResult(
                toolCall.toolName,
                toolResult.result,
                fetchedCategories
              );

              if (analysis.shouldRetrieve && analysis.urgency !== 'low') {
                console.log(`[AI Chat] Dynamic re-retrieval triggered for: ${analysis.unexpectedTerms.join(', ')}`);

                // Fetch additional context (non-blocking for now, could be enhanced later)
                dynamicRetrieve(analysis, fetchedDocIds, { limit: 2 })
                  .then(result => {
                    if (result.additionalContext) {
                      console.log(`[AI Chat] Dynamic retrieval added: ${result.sources.map(s => s.title).join(', ')}`);
                      // Note: In a future enhancement, this context could be injected
                      // into the conversation state for the next turn
                      if (sessionId) {
                        updateConversationState(sessionId, {
                          fetchedDocIds: [...fetchedDocIds, ...result.sources.map(s => s.slug)],
                          fetchedCategories: [...new Set([...fetchedCategories, ...result.retrievedCategories])],
                        }).catch(() => {});
                      }
                    }
                  })
                  .catch(err => console.error('[AI Chat] Dynamic retrieval error:', err));
              }
            }
          }
        }
      },
      // Phase 2: Error handling
      onError: async ({ error }) => {
        if (NoSuchToolError.isInstance(error)) {
          console.error('[AI Chat] Unknown tool called:', error.message);
        } else if (InvalidToolInputError.isInstance(error)) {
          console.error('[AI Chat] Invalid tool input:', error.message);
        } else {
          console.error('[AI Chat] Stream error:', error);
        }
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('[AI Chat] Error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

