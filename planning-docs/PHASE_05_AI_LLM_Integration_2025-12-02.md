# Phase 5: AI/LLM Integration

---

**Phase Number:** 5 of 12
**Duration:** 1.5 Weeks
**Dependencies:** [Phase 1: Foundation](./PHASE_01_Foundation_2025-12-02.md), [Phase 2: Database Schema](./PHASE_02_Database_Schema_2025-12-02.md)
**Status:** Not Started
**Start Date:** TBD
**Target Completion:** TBD

---

## Overview

Integrate Claude AI models (Opus, Sonnet, Haiku) for reasoning and generation, and OpenAI for embeddings. This phase establishes the AI infrastructure including model routing, streaming responses, token management, and cost optimization. **Additionally, this phase implements the foundational AI architecture** from the AI Interaction Map specification, including the ViewContext system, System Prompt Layers, and Tool Execution Framework that enables the 126 AI tools implemented in later phases.

---

## Objectives

1. Set up Anthropic Claude client with all model tiers
2. Configure OpenAI client for embeddings
3. Implement intelligent model routing based on task complexity
4. Build streaming response handling with Vercel AI SDK
5. Create token counting and limit management
6. Establish cost tracking and optimization
7. Build AI service abstraction layer
8. **Implement ViewContext system for page-aware AI**
9. **Build System Prompt Layers architecture**
10. **Create AI Tool Execution Framework**

---

## AI Model Architecture

### Model Selection Strategy
| Task Type | Model | Reasoning |
|-----------|-------|-----------|
| Complex Analysis | Claude Opus 4.5 | Highest capability for deal analysis |
| Content Generation | Claude Sonnet 4.5 | Balance of quality and speed |
| Classification | Claude Haiku | Fast, low-cost for routing |
| Embeddings | OpenAI text-embedding-3-small | 1536 dimensions, cost-effective |

### Cost Estimates (per 1M tokens)
| Model | Input | Output |
|-------|-------|--------|
| Claude Opus 4.5 | $15 | $75 |
| Claude Sonnet 4.5 | $3 | $15 |
| Claude Haiku | $0.25 | $1.25 |
| OpenAI Embeddings | $0.02 | N/A |

---

## Task Hierarchy

### 1. Anthropic Claude Setup
- [ ] **1.1 Install Dependencies**
  - [ ] Install @anthropic-ai/sdk
  - [ ] Install ai (Vercel AI SDK)
  - [ ] Install zod for validation
  - [ ] Verify package versions compatible

- [ ] **1.2 Create Claude Client**
  - [ ] Create lib/ai/anthropic.ts
  - [ ] Initialize Anthropic client with API key
  - [ ] Configure default parameters
  - [ ] Add error handling wrapper
  - [ ] Test connection with simple prompt

- [ ] **1.3 Define Model Constants**
  - [ ] Create lib/ai/models.ts
  - [ ] Define model IDs (opus, sonnet, haiku)
  - [ ] Define context window limits
  - [ ] Define output token limits
  - [ ] Export typed model selection

- [ ] **1.4 Create Claude Service**
  - [ ] Create lib/ai/claude-service.ts
  - [ ] Implement chat completion method
  - [ ] Implement streaming completion method
  - [ ] Support system prompts
  - [ ] Support message history
  - [ ] Return standardized response format

---

### 2. OpenAI Embeddings Setup
- [ ] **2.1 Install Dependencies**
  - [ ] Install openai package
  - [ ] Verify version compatibility

- [ ] **2.2 Create OpenAI Client**
  - [ ] Create lib/ai/openai.ts
  - [ ] Initialize OpenAI client with API key
  - [ ] Configure for embeddings only
  - [ ] Add error handling

- [ ] **2.3 Create Embeddings Service**
  - [ ] Create lib/ai/embeddings-service.ts
  - [ ] Implement single text embedding
  - [ ] Implement batch embeddings
  - [ ] Handle text chunking for long content
  - [ ] Normalize embedding vectors
  - [ ] Cache embeddings in database

---

### 3. Model Router
- [ ] **3.1 Create Router Logic**
  - [ ] Create lib/ai/router.ts
  - [ ] Define task categories
  - [ ] Map tasks to optimal models
  - [ ] Support manual model override
  - [ ] Log routing decisions

- [ ] **3.2 Task Classification**
  - [ ] Use Haiku for task classification
  - [ ] Define classification prompt
  - [ ] Parse classification response
  - [ ] Route to appropriate model
  - [ ] Handle classification failures gracefully

- [ ] **3.3 Routing Rules**
  - [ ] Complex deal analysis → Opus
  - [ ] RAG response generation → Sonnet
  - [ ] Offer letter writing → Sonnet
  - [ ] Intent classification → Haiku
  - [ ] Simple Q&A → Haiku
  - [ ] Document summarization → Sonnet

---

### 4. Streaming Responses
- [ ] **4.1 Configure Vercel AI SDK**
  - [ ] Set up AI SDK streaming utilities
  - [ ] Configure edge runtime support
  - [ ] Test streaming in development

- [ ] **4.2 Create Streaming Endpoints**
  - [ ] Create app/api/ai/chat/route.ts
  - [ ] Implement POST handler with streaming
  - [ ] Parse incoming messages
  - [ ] Stream response chunks
  - [ ] Handle stream errors gracefully

- [ ] **4.3 Client-Side Streaming**
  - [ ] Create useChat hook wrapper
  - [ ] Handle streaming state (loading, streaming, complete)
  - [ ] Display partial responses
  - [ ] Support stream cancellation

---

### 5. Token Management
- [ ] **5.1 Token Counting**
  - [ ] Create lib/ai/token-counter.ts
  - [ ] Implement token estimation for Claude
  - [ ] Implement token counting for OpenAI
  - [ ] Handle different model tokenizers
  - [ ] Cache token counts where possible

- [ ] **5.2 Context Window Management**
  - [ ] Track tokens in conversation
  - [ ] Implement context truncation
  - [ ] Preserve system prompt and recent messages
  - [ ] Warn when approaching limits

- [ ] **5.3 Rate Limiting**
  - [ ] Track requests per minute
  - [ ] Track tokens per minute
  - [ ] Queue requests when approaching limits
  - [ ] Implement backoff for rate limit errors

---

### 6. Cost Tracking
- [ ] **6.1 Create Cost Tracker**
  - [ ] Create lib/ai/cost-tracker.ts
  - [ ] Track input tokens per request
  - [ ] Track output tokens per request
  - [ ] Calculate cost per request
  - [ ] Store in database by user

- [ ] **6.2 Usage Analytics**
  - [ ] Track usage by model
  - [ ] Track usage by feature
  - [ ] Track usage by user
  - [ ] Generate daily usage summaries

- [ ] **6.3 Cost Optimization**
  - [ ] Implement response caching
  - [ ] Cache common query responses
  - [ ] Use smaller models when possible
  - [ ] Batch similar requests

---

### 7. Prompt Management
- [ ] **7.1 Create Prompt Templates**
  - [ ] Create lib/ai/prompts directory
  - [ ] Define deal analysis prompt
  - [ ] Define property description prompt
  - [ ] Define offer letter prompt
  - [ ] Define classification prompts
  - [ ] Use template variables

- [ ] **7.2 System Prompts**
  - [ ] Create base system prompt for platform
  - [ ] Define persona and capabilities
  - [ ] Include response formatting rules
  - [ ] Version control prompts

- [ ] **7.3 Prompt Testing**
  - [ ] Create prompt testing utility
  - [ ] Test prompts with sample inputs
  - [ ] Measure response quality
  - [ ] Document prompt iterations

---

### 8. Error Handling
- [ ] **8.1 AI Error Classes**
  - [ ] Create AIError base class
  - [ ] AIRateLimitError
  - [ ] AIContextLengthError
  - [ ] AIContentFilterError
  - [ ] AIConnectionError

- [ ] **8.2 Retry Logic**
  - [ ] Implement exponential backoff
  - [ ] Retry on transient errors
  - [ ] Fallback to smaller model if context too long
  - [ ] Log all AI errors

- [ ] **8.3 Graceful Degradation**
  - [ ] Provide cached responses when AI unavailable
  - [ ] Show informative error messages to users
  - [ ] Queue requests for retry

---

### 9. AI API Routes
- [ ] **9.1 Chat Endpoint**
  - [ ] POST /api/ai/chat
  - [ ] Accept messages and context
  - [ ] Route to appropriate model
  - [ ] Stream response

- [ ] **9.2 Analyze Endpoint**
  - [ ] POST /api/ai/analyze
  - [ ] Accept property data
  - [ ] Generate analysis with Opus
  - [ ] Return structured response

- [ ] **9.3 Generate Endpoint**
  - [ ] POST /api/ai/generate
  - [ ] Accept generation type and data
  - [ ] Generate content with Sonnet
  - [ ] Return formatted content

- [ ] **9.4 Embed Endpoint**
  - [ ] POST /api/ai/embed
  - [ ] Accept text to embed
  - [ ] Return embedding vector
  - [ ] Support batch embedding

---

### 10. ViewContext System (AI Interaction Map)
- [ ] **10.1 Define ViewContext Interface**
  - [ ] Create lib/ai/view-context.ts
  - [ ] Define ViewContext TypeScript interface:
    ```typescript
    interface ViewContext {
      page: 'search' | 'property_detail' | 'deal_pipeline' | 'buyers' | 'dashboard' | 'analytics' | 'settings';
      searchQuery?: string;
      searchFilters?: string[];
      searchResultCount?: number;
      visiblePropertyIds?: string[];
      propertyId?: string;
      dealId?: string;
      dealStage?: string;
      buyerId?: string;
      listId?: string;
    }
    ```
  - [ ] Create ViewContext provider component
  - [ ] Implement context capture hooks

- [ ] **10.2 Page-Specific Context Capture**
  - [ ] Search page: capture query, filters, result count, visible IDs
  - [ ] Property detail page: capture property ID, linked deal
  - [ ] Deal pipeline page: capture deal ID, stage, buyer assignments
  - [ ] Buyer page: capture buyer ID, preferences, history
  - [ ] Dashboard page: capture active widgets, date range
  - [ ] Implement context serialization for AI prompts

- [ ] **10.3 Context Provider Integration**
  - [ ] Wrap app layout with ViewContextProvider
  - [ ] Create useViewContext hook
  - [ ] Implement context update on route change
  - [ ] Test context persistence during navigation

---

### 11. System Prompt Layers Architecture (AI Interaction Map)
- [ ] **11.1 Create Prompt Layer System**
  - [ ] Create lib/ai/system-prompts.ts
  - [ ] Define 5 prompt layers:
    - Layer 1: Platform Identity
    - Layer 2: Filter Knowledge
    - Layer 3: User Context
    - Layer 4: View Context
    - Layer 5: Session Memory
  - [ ] Create PromptBuilder class

- [ ] **11.2 Layer 1: Platform Identity Prompt**
  - [ ] Define core AI persona and capabilities
  - [ ] List available actions and tools
  - [ ] Specify response formatting rules
  - [ ] Include wholesale industry context
  - [ ] Store in lib/ai/prompts/platform-identity.ts

- [ ] **11.3 Layer 2: Filter Knowledge Prompt**
  - [ ] Document all 21 filters with descriptions
  - [ ] Include filter criteria and thresholds
  - [ ] Explain filter combinations
  - [ ] Provide filter recommendation logic
  - [ ] Store in lib/ai/prompts/filter-knowledge.ts

- [ ] **11.4 Layer 3: User Context Prompt**
  - [ ] Load user profile and preferences
  - [ ] Include user's target markets (zip codes)
  - [ ] Include user's deal history summary
  - [ ] Include buyer network summary
  - [ ] Generate dynamically from database
  - [ ] Create buildUserContextPrompt() function

- [ ] **11.5 Layer 4: View Context Prompt**
  - [ ] Convert ViewContext to natural language
  - [ ] Describe current page and visible data
  - [ ] Include property/deal details when relevant
  - [ ] Create buildViewContextPrompt() function

- [ ] **11.6 Layer 5: Session Memory Prompt**
  - [ ] Track recent actions in session
  - [ ] Maintain conversation context
  - [ ] Store temporary preferences
  - [ ] Create SessionMemory class
  - [ ] Implement memory persistence (sessionStorage)

- [ ] **11.7 Prompt Combiner**
  - [ ] Create combinePromptLayers() function
  - [ ] Order layers correctly (1 → 5)
  - [ ] Handle token limits (truncate if needed)
  - [ ] Log combined prompt length
  - [ ] Test with all layer combinations

---

### 12. AI Tool Execution Framework (AI Interaction Map)
- [ ] **12.1 Define Tool Interface**
  - [ ] Create lib/ai/tools/types.ts
  - [ ] Define AITool interface:
    ```typescript
    interface AITool {
      name: string;
      description: string;
      category: ToolCategory;
      parameters: ZodSchema;
      execute: (params: any, context: ToolContext) => Promise<ToolResult>;
      permissions: string[];
    }
    ```
  - [ ] Define ToolCategory enum (11 categories)
  - [ ] Define ToolContext interface
  - [ ] Define ToolResult interface

- [ ] **12.2 Create Tool Registry**
  - [ ] Create lib/ai/tools/registry.ts
  - [ ] Implement registerTool() function
  - [ ] Implement getTool(name) function
  - [ ] Implement getToolsByCategory() function
  - [ ] Implement listAllTools() function
  - [ ] Export tool schemas for Claude function calling

- [ ] **12.3 Tool Execution Engine**
  - [ ] Create lib/ai/tools/executor.ts
  - [ ] Implement executeTool(name, params, context)
  - [ ] Validate parameters with Zod
  - [ ] Check permissions before execution
  - [ ] Handle tool errors gracefully
  - [ ] Return standardized ToolResult

- [ ] **12.4 Tool Permission System**
  - [ ] Create lib/ai/tools/permissions.ts
  - [ ] Define permission levels (read, write, delete, admin)
  - [ ] Map tools to required permissions
  - [ ] Check user permissions before tool execution
  - [ ] Log permission denials

- [ ] **12.5 Tool Execution Logging**
  - [ ] Create tool_executions table or use existing
  - [ ] Log tool name, parameters, result, duration
  - [ ] Log user and session context
  - [ ] Enable debug mode for development
  - [ ] Create logToolExecution() function

- [ ] **12.6 Multi-Tool Orchestration**
  - [ ] Support chaining multiple tools
  - [ ] Pass output from one tool to next
  - [ ] Handle partial failures
  - [ ] Implement rollback for failed chains
  - [ ] Create executeToolChain() function

- [ ] **12.7 Tool Category Stubs**
  - [ ] Create stub files for each category:
    - [ ] lib/ai/tools/search-tools.ts (10 tools)
    - [ ] lib/ai/tools/property-tools.ts (13 tools)
    - [ ] lib/ai/tools/deal-tools.ts (12 tools)
    - [ ] lib/ai/tools/crm-tools.ts (12 tools)
    - [ ] lib/ai/tools/buyer-tools.ts (12 tools)
    - [ ] lib/ai/tools/market-tools.ts (10 tools)
    - [ ] lib/ai/tools/filter-tools.ts (11 tools)
    - [ ] lib/ai/tools/dashboard-tools.ts (12 tools)
    - [ ] lib/ai/tools/skip-trace-tools.ts (10 tools)
    - [ ] lib/ai/tools/notification-tools.ts (10 tools)
    - [ ] lib/ai/tools/heat-map-tools.ts (14 tools)
  - [ ] Export empty tool arrays from each file
  - [ ] Register all categories in main registry

---

## Success Criteria

- [ ] All three Claude models accessible and functional
- [ ] OpenAI embeddings generating correctly
- [ ] Streaming responses working in UI
- [ ] Token counting accurate within 5%
- [ ] Cost tracking capturing all requests
- [ ] Model routing making intelligent decisions
- [ ] Error handling preventing user-facing failures
- [ ] **ViewContext correctly capturing page state**
- [ ] **All 5 prompt layers combining correctly**
- [ ] **Tool registry accepting and returning tools**
- [ ] **Tool execution framework running stub tools**
- [ ] **Permission system blocking unauthorized tool access**

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API rate limits hit | Medium | Medium | Aggressive caching, queue management |
| Costs exceed budget | Medium | High | Cost alerts, model tier management |
| Response quality issues | Low | Medium | Prompt iteration, quality testing |
| Streaming failures | Low | Low | Fallback to non-streaming |
| ViewContext state sync issues | Medium | Medium | Thorough testing, React context best practices |
| Prompt layer token overflow | Medium | Medium | Token counting, truncation strategy |
| Tool execution security | Low | Critical | Strict permission checks, input validation |

---

## Related Phases

- **Previous Phase:** [Phase 4: Property Search](./PHASE_04_Property_Search_2025-12-02.md)
- **Next Phase:** [Phase 6: Knowledge Base & RAG](./PHASE_06_Knowledge_Base_RAG_2025-12-02.md)
- **Dependent Phases:**
  - Phase 6 uses embeddings and RAG
  - Phase 7 implements 46 AI tools (Search, Property, Filter, Buyer)
  - Phase 8 implements 24 AI tools (Deal Pipeline, CRM)
  - Phase 9 implements 20 AI tools (Skip Tracing, Notifications)
  - Phase 11 implements 36 AI tools (Heat Map, Market, Dashboard)

---

## AI Tool Implementation Schedule

| Phase | Category | Tool Count | Implements |
|-------|----------|------------|------------|
| 7 | Search Tools | 10 | searchPropertiesByDescription, executeFilter, etc. |
| 7 | Property Tools | 13 | analyzePropertyValue, getComparables, etc. |
| 7 | Filter Tools | 11 | suggestFilters, explainFilter, etc. |
| 7 | Buyer Tools | 12 | matchBuyersToProperty, analyzeBuyerActivity, etc. |
| 8 | Deal Tools | 12 | createDeal, updateDealStage, etc. |
| 8 | CRM Tools | 12 | createLeadList, rankListByMotivation, etc. |
| 9 | Skip Trace Tools | 10 | skipTraceProperty, batchSkipTraceList, etc. |
| 9 | Notification Tools | 10 | getAlerts, createCustomAlert, etc. |
| 11 | Heat Map Tools | 14 | getHeatMapData, compareAreas, etc. |
| 11 | Market Tools | 10 | getMarketOverview, analyzeMarketTrends, etc. |
| 11 | Dashboard Tools | 12 | getDashboardSummary, forecastRevenue, etc. |

---

## Phase Completion Summary

> **Template - Complete after phase is finished**

### Completed Successfully
- [ ] Item 1

### Deferred or Blocked
- [ ] Item (Reason: )

### Lessons Learned
-

### Recommendations for Next Phase
-

---

**Phase Document Version:** 2.0
**Last Updated:** 2025-12-02
**Major Updates:** Added ViewContext System, System Prompt Layers, AI Tool Execution Framework from AI Interaction Map specification

