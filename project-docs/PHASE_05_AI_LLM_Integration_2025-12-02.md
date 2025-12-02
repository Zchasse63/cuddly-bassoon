# Phase 5: AI/LLM Integration

---

**Phase Number:** 5 of 12  
**Duration:** 1 Week  
**Dependencies:** [Phase 1: Foundation](./PHASE_01_Foundation_2025-12-02.md), [Phase 2: Database Schema](./PHASE_02_Database_Schema_2025-12-02.md)  
**Status:** Not Started  
**Start Date:** TBD  
**Target Completion:** TBD  

---

## Overview

Integrate Claude AI models (Opus, Sonnet, Haiku) for reasoning and generation, and OpenAI for embeddings. This phase establishes the AI infrastructure including model routing, streaming responses, token management, and cost optimization.

---

## Objectives

1. Set up Anthropic Claude client with all model tiers
2. Configure OpenAI client for embeddings
3. Implement intelligent model routing based on task complexity
4. Build streaming response handling with Vercel AI SDK
5. Create token counting and limit management
6. Establish cost tracking and optimization
7. Build AI service abstraction layer

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

## Success Criteria

- [ ] All three Claude models accessible and functional
- [ ] OpenAI embeddings generating correctly
- [ ] Streaming responses working in UI
- [ ] Token counting accurate within 5%
- [ ] Cost tracking capturing all requests
- [ ] Model routing making intelligent decisions
- [ ] Error handling preventing user-facing failures

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API rate limits hit | Medium | Medium | Aggressive caching, queue management |
| Costs exceed budget | Medium | High | Cost alerts, model tier management |
| Response quality issues | Low | Medium | Prompt iteration, quality testing |
| Streaming failures | Low | Low | Fallback to non-streaming |

---

## Related Phases

- **Previous Phase:** [Phase 4: Property Search](./PHASE_04_Property_Search_2025-12-02.md)
- **Next Phase:** [Phase 6: Knowledge Base & RAG](./PHASE_06_Knowledge_Base_RAG_2025-12-02.md)
- **Dependent Phases:** Phases 6, 7, 9 heavily use AI infrastructure

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

**Phase Document Version:** 1.0  
**Last Updated:** 2025-12-02

