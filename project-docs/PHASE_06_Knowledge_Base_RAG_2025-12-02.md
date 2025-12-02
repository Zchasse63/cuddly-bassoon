# Phase 6: Knowledge Base & RAG System

---

**Phase Number:** 6 of 12  
**Duration:** 2 Weeks  
**Dependencies:** [Phase 2: Database Schema](./PHASE_02_Database_Schema_2025-12-02.md), [Phase 5: AI/LLM Integration](./PHASE_05_AI_LLM_Integration_2025-12-02.md)  
**Status:** Not Started  
**Start Date:** TBD  
**Target Completion:** TBD  

---

## Overview

Implement the RAG (Retrieval-Augmented Generation) system using the 75-100+ knowledge base documents defined in the Knowledge Base Creation Framework. This phase covers document ingestion, embedding generation, vector storage, semantic search, query routing, and AI-powered response generation.

---

## Objectives

1. Build document ingestion and processing pipeline
2. Implement text chunking with optimal strategies
3. Generate and store embeddings in pgvector
4. Create semantic search with Supabase RPC functions
5. Build query routing and intent classification
6. Implement RAG response generation pipeline
7. Optimize retrieval quality and performance

---

## Knowledge Base Structure Reference

From the Knowledge Base Creation Framework:

| Category | Document Count | Focus |
|----------|----------------|-------|
| 01-Fundamentals | 15-20 | Core wholesaling concepts |
| 02-Filters | 25+ | All 21 filters explained |
| 03-Buyer Intelligence | 10-12 | Buyer management |
| 04-Market Analysis | 8-10 | Market evaluation |
| 05-Deal Analysis | 10-12 | Property evaluation |
| 06-Negotiations | 12-15 | Negotiation strategies |
| 07-Outreach | 8-10 | Communication strategies |
| 08-Risk Factors | 10-12 | Risk identification |
| 09-Legal Compliance | 6-8 | Legal requirements |
| 10-Case Studies | 10-15 | Real-world examples |

**Total: 75-100+ documents**

---

## Task Hierarchy

### 1. Document Ingestion Pipeline
- [ ] **1.1 Create Document Processor**
  - [ ] Create lib/rag/document-processor.ts
  - [ ] Parse markdown frontmatter (YAML)
  - [ ] Extract metadata (title, category, tags)
  - [ ] Clean and normalize content
  - [ ] Validate document structure

- [ ] **1.2 Build Ingestion Workflow**
  - [ ] Create lib/rag/ingestion.ts
  - [ ] Read documents from file system
  - [ ] Parse and validate each document
  - [ ] Store in documents table
  - [ ] Track ingestion status

- [ ] **1.3 Document Versioning**
  - [ ] Detect document changes (hash comparison)
  - [ ] Update existing documents
  - [ ] Track version history
  - [ ] Re-embed on content changes

- [ ] **1.4 Ingestion CLI**
  - [ ] Create scripts/ingest-documents.ts
  - [ ] Support single file ingestion
  - [ ] Support batch ingestion
  - [ ] Show progress and errors
  - [ ] Generate ingestion report

---

### 2. Text Chunking
- [ ] **2.1 Create Chunking Service**
  - [ ] Create lib/rag/chunker.ts
  - [ ] Implement recursive text splitting
  - [ ] Respect markdown structure (headers)
  - [ ] Configure chunk size (500-1000 tokens)
  - [ ] Configure chunk overlap (100-200 tokens)

- [ ] **2.2 Chunking Strategies**
  - [ ] Split by headers (preserve sections)
  - [ ] Split by paragraphs within sections
  - [ ] Handle code blocks (keep intact)
  - [ ] Handle lists (keep together when possible)

- [ ] **2.3 Chunk Metadata**
  - [ ] Preserve parent document reference
  - [ ] Include chunk index
  - [ ] Include section headers in chunk
  - [ ] Calculate token count per chunk

- [ ] **2.4 Store Chunks**
  - [ ] Insert into document_chunks table
  - [ ] Link to parent document
  - [ ] Store chunk content and metadata
  - [ ] Index for retrieval

---

### 3. Embedding Generation
- [ ] **3.1 Batch Embedding Service**
  - [ ] Create lib/rag/embedder.ts
  - [ ] Process chunks in batches (20 at a time)
  - [ ] Use OpenAI text-embedding-3-small
  - [ ] Handle rate limits and retries
  - [ ] Track embedding progress

- [ ] **3.2 Embedding Storage**
  - [ ] Store embeddings in pgvector column
  - [ ] Link to chunk record
  - [ ] Store model version for reproducibility
  - [ ] Create HNSW index for fast retrieval

- [ ] **3.3 Embedding Updates**
  - [ ] Detect chunks needing re-embedding
  - [ ] Delete old embeddings
  - [ ] Generate new embeddings
  - [ ] Maintain referential integrity

- [ ] **3.4 Embedding Validation**
  - [ ] Verify embedding dimensions (1536)
  - [ ] Test similarity search on samples
  - [ ] Validate retrieval quality

---

### 4. Semantic Search
- [ ] **4.1 Create Search RPC Function**
  - [ ] Create match_documents function in Supabase
  - [ ] Accept query embedding vector
  - [ ] Accept match_count parameter
  - [ ] Accept similarity threshold
  - [ ] Return ranked results with scores

- [ ] **4.2 Advanced Search Function**
  - [ ] Create match_documents_filtered
  - [ ] Filter by category
  - [ ] Filter by tags
  - [ ] Filter by difficulty level
  - [ ] Combine vector and metadata filtering

- [ ] **4.3 Search Service**
  - [ ] Create lib/rag/search.ts
  - [ ] Embed query text
  - [ ] Call RPC function
  - [ ] Process and rank results
  - [ ] Return formatted documents

- [ ] **4.4 Search Optimization**
  - [ ] Tune similarity threshold
  - [ ] Optimize result count
  - [ ] Implement re-ranking (optional)
  - [ ] Cache frequent queries

---

### 5. Query Routing
- [ ] **5.1 Intent Classification**
  - [ ] Create lib/rag/classifier.ts
  - [ ] Use Claude Haiku for classification
  - [ ] Define intent categories:
    - [ ] filter_question (about filters)
    - [ ] deal_analysis (property evaluation)
    - [ ] buyer_question (buyer management)
    - [ ] negotiation_help (scripts, strategies)
    - [ ] legal_compliance (regulations)
    - [ ] general_question (other)
  - [ ] Parse classification response

- [ ] **5.2 Query Enhancement**
  - [ ] Create lib/rag/query-enhancer.ts
  - [ ] Expand query with synonyms
  - [ ] Add relevant context
  - [ ] Generate hypothetical answer (HyDE)
  - [ ] Improve retrieval accuracy

- [ ] **5.3 Routing Logic**
  - [ ] Create lib/rag/router.ts
  - [ ] Route to appropriate document categories
  - [ ] Adjust result count by intent
  - [ ] Select response model by complexity

---

### 6. RAG Response Generation
- [ ] **6.1 Context Assembly**
  - [ ] Create lib/rag/context-builder.ts
  - [ ] Combine retrieved documents
  - [ ] Order by relevance
  - [ ] Truncate to context limit
  - [ ] Format for LLM consumption

- [ ] **6.2 Response Generation**
  - [ ] Create lib/rag/generator.ts
  - [ ] Build system prompt with context
  - [ ] Include user question
  - [ ] Generate response with Claude Sonnet
  - [ ] Stream response to client

- [ ] **6.3 Response Formatting**
  - [ ] Format as markdown
  - [ ] Include source citations
  - [ ] Add relevant document links
  - [ ] Handle multi-part responses

- [ ] **6.4 Quality Controls**
  - [ ] Detect "I don't know" responses
  - [ ] Fallback to broader search
  - [ ] Log low-confidence responses
  - [ ] Track user feedback (future)

---

### 7. RAG API Endpoints
- [ ] **7.1 Ask Endpoint**
  - [ ] POST /api/rag/ask
  - [ ] Accept question text
  - [ ] Accept optional filters (category, etc.)
  - [ ] Return streaming response
  - [ ] Include source documents

- [ ] **7.2 Search Endpoint**
  - [ ] POST /api/rag/search
  - [ ] Accept query text
  - [ ] Return relevant documents
  - [ ] Support pagination
  - [ ] Include similarity scores

- [ ] **7.3 Documents Endpoint**
  - [ ] GET /api/rag/documents
  - [ ] List all knowledge base documents
  - [ ] Filter by category
  - [ ] Return metadata only

- [ ] **7.4 Document Detail Endpoint**
  - [ ] GET /api/rag/documents/[slug]
  - [ ] Return full document content
  - [ ] Include related documents

---

### 8. Chat Interface
- [ ] **8.1 Create Chat Component**
  - [ ] Create components/rag/ChatInterface.tsx
  - [ ] Message input with send button
  - [ ] Message history display
  - [ ] Streaming response display
  - [ ] Source document links

- [ ] **8.2 Chat State Management**
  - [ ] Create useRagChat hook
  - [ ] Manage message history
  - [ ] Handle streaming state
  - [ ] Support conversation context

- [ ] **8.3 Chat UI Features**
  - [ ] Show thinking/loading state
  - [ ] Display source documents
  - [ ] Support markdown rendering
  - [ ] Add copy response button

- [ ] **8.4 Chat Page**
  - [ ] Create app/ask/page.tsx
  - [ ] Integrate chat interface
  - [ ] Add suggested questions
  - [ ] Show recent conversations

---

### 9. Testing and Validation
- [ ] **9.1 Retrieval Quality Testing**
  - [ ] Create test question set
  - [ ] Measure retrieval accuracy
  - [ ] Test edge cases
  - [ ] Document quality metrics

- [ ] **9.2 Response Quality Testing**
  - [ ] Test response accuracy
  - [ ] Verify source citations
  - [ ] Check for hallucinations
  - [ ] Measure user satisfaction

- [ ] **9.3 Performance Testing**
  - [ ] Measure embedding time
  - [ ] Measure search latency
  - [ ] Measure response generation time
  - [ ] Optimize bottlenecks

---

## Success Criteria

- [ ] All 75-100+ documents ingested
- [ ] Embeddings generated for all chunks
- [ ] Semantic search returning relevant results
- [ ] RAG responses accurate and well-sourced
- [ ] Chat interface functional and responsive
- [ ] Search latency < 200ms
- [ ] Response streaming starts < 500ms

---

## Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Poor retrieval quality | Medium | High | Tune chunking, threshold, re-ranking |
| Documents not ready | High | Critical | Parallel document creation, placeholder content |
| Embedding costs | Low | Low | Batch processing, cache embeddings |
| Context length limits | Medium | Medium | Smart truncation, summarization |

---

## Related Phases

- **Previous Phase:** [Phase 5: AI/LLM Integration](./PHASE_05_AI_LLM_Integration_2025-12-02.md)
- **Next Phase:** [Phase 7: Buyer Intelligence](./PHASE_07_Buyer_Intelligence_2025-12-02.md)
- **Related:** Knowledge Base Creation Framework document
- **Dependent Phases:** Phases 7, 9 use RAG for intelligent assistance

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

