# AI Testing Suite Development Prompt

## Objective

You are tasked with building a comprehensive test suite for the AI-first real estate wholesaling platform. Your job is to autonomously research this project, discover all AI tools, understand their purposes, and create thorough tests. Do not ask for clarification—investigate, make informed decisions, and execute.

---

## Phase 1: Discovery & Research

### Step 1: Find All AI Tools

Search through the entire project codebase and documentation to locate and catalog every AI tool. You should find approximately 187 tools. For each tool discovered:

- Record the tool name/identifier
- Document its purpose and function
- Identify its input parameters and expected outputs
- Note which platform area it belongs to:
  - Property Search
  - Deal Pipeline
  - Lead Lists/CRM
  - Buyer Database
  - Market Analysis
  - Filter Systems
  - Dashboard/KPIs
  - Skip Tracing
  - Notifications
  - Heat Mapping
  - Mapbox integrations
  - Other areas as discovered
- Determine which AI model tier it should use (Opus 4.5, Sonnet 4.5, or Haiku 4.5)

Create a complete inventory before proceeding. If you find fewer or more than 187 tools, document what you found and proceed with the actual count.

---

## Phase 2: Database Seeding

### Step 2: Create Supabase Seed Script

Research the database schema by examining:

- Migration files
- Type definitions
- Existing seed files
- API routes and their data expectations
- The RentCast integration specification for property data structures

Build a comprehensive seed script that populates the test database with realistic data including:

- Properties (various types, conditions, equity levels, motivation indicators)
- Leads at different pipeline stages
- Buyer profiles with varied acquisition criteria
- Market data samples
- User accounts with different permission levels
- Historical transaction records
- Any other entities required by the tools you discovered

The seed data must be sufficient to test all tool functionality including edge cases. Generate realistic but fictional data appropriate for a real estate wholesaling platform.

---

## Phase 3: Test Infrastructure Setup

### Step 3: Configure Test Environment

Set up test infrastructure that connects to:

#### Real APIs (not mocked)

| Service | Purpose |
|---------|---------|
| **Supabase** | Test against actual database operations |
| **RentCast API** | Test real property data retrieval |
| **Shovels API** | Test real permit and construction data |
| **Mapbox API** | Test real geocoding, routing, and map operations |

#### Mocked Services

| Service | Purpose |
|---------|---------|
| **Skip Tracing** | Create mock responses that simulate expected skip trace data structures (phone numbers, emails, alternate addresses, etc.) since this API is not yet integrated |

---

## Phase 4: Test Suite Development

### Step 4: Write Single-Turn Tests

For each of the discovered tools, create single-turn tests that verify:

- **Tool Selection Accuracy:** Given a specific user request, does the system select the correct tool(s)?
- **Input Validation:** Does the tool properly validate and handle its inputs?
- **Output Correctness:** Does the tool return expected results for known inputs?
- **Error Handling:** Does the tool gracefully handle invalid inputs, API failures, and edge cases?
- **API Integration:** Do tools correctly interact with RentCast, Shovels, Mapbox, and Supabase?

### Step 5: Write Multi-Turn Tests

Create multi-turn conversation tests that verify:

- **Context Retention:** Does the system maintain context across multiple exchanges?
- **Tool Chaining:** When a workflow requires multiple tools in sequence, are they selected and executed correctly?
- **Refinement Handling:** When users refine or modify their requests, does the system adapt appropriately?
- **Complex Workflows:** Test realistic user journeys such as:
  - Finding properties → Analyzing deals → Adding to pipeline → Matching with buyers
  - Creating lead lists → Running skip traces → Initiating outreach campaigns
  - Market analysis → Heat map generation → Property filtering → Export
- **Conversation Recovery:** If a tool fails mid-workflow, does the system recover gracefully?

---

## Phase 5: Model Selection Validation

### Step 6: AI Model Tier Testing

Create specific tests to validate correct model selection:

#### Opus 4.5 (Complex Analysis)

Verify selection for:

- Deal analysis requiring nuanced financial assessment
- Complex market comparisons
- Multi-factor property evaluations
- Sophisticated buyer-property matching algorithms
- Any task requiring deep reasoning

#### Sonnet 4.5 (General Tasks)

Verify selection for:

- Standard property searches
- Lead management operations
- CRM interactions
- Report generation
- Most conversational interactions

#### Haiku 4.5 (Fast Responses)

Verify selection for:

- Quick lookups
- Simple data retrieval
- Notification triggers
- Real-time UI updates
- High-volume, low-complexity operations

#### Model Routing Validation

Test that the system routes requests to the appropriate model tier based on:

- Complexity of the request
- Required reasoning depth
- Response time requirements
- Cost efficiency considerations

---

## Phase 6: Tool Selection Precision Testing

### Step 7: Rigorous Tool Selection Tests

**This is critical.** Create tests that verify the AI selects exactly the right tool(s) for ambiguous and specific requests:

| Test Type | Description |
|-----------|-------------|
| **Exact Match Tests** | Clear requests that should map to one specific tool |
| **Disambiguation Tests** | Requests that could match multiple tools—verify the best one is chosen |
| **Negative Tests** | Requests that should NOT trigger certain tools |
| **Compound Request Tests** | Requests requiring multiple tools—verify all necessary tools are selected and none extraneous |
| **Natural Language Variation Tests** | The same intent expressed multiple ways should select the same tool(s) |
| **Context-Dependent Tests** | Tool selection that should vary based on conversation context or user state |

---

## Deliverables

Produce the following:

### 1. Tool Inventory Document
Complete catalog of all discovered tools with metadata

### 2. Seed Script
Executable script to populate test database

### 3. Test Suite
Organized test files covering:
- Single-turn tests for each tool
- Multi-turn conversation tests
- Model selection tests
- Tool selection precision tests

### 4. Test Configuration
Setup for real API connections and skip tracing mocks

### 5. Test Runner Documentation
Instructions for executing the test suite

---

## Execution Instructions

- Do not ask questions—investigate the codebase to find answers
- Make reasonable assumptions when necessary and document them
- If you encounter ambiguity in tool purposes, examine the implementation code
- Cross-reference the master research report and definitive plan documents for context
- Prioritize test coverage for high-impact tools (deal analysis, property search, buyer matching)
- Ensure tests are deterministic where possible, accounting for API variability where not

---

## Begin

Start by searching the project for all AI tool definitions and building your inventory.