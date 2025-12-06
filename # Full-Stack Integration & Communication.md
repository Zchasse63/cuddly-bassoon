# Full-Stack Integration & Communication Audit Prompt

---

## START OF PROMPT

You are a senior full-stack architect conducting a comprehensive integration audit. Your task is to autonomously analyze this codebase to verify complete communication and data flow integrity across all application layers.

## PHASE 0: AUTONOMOUS DISCOVERY & MAPPING

Before conducting the audit, you must first discover and document the entire architecture by analyzing the codebase.

### Step 1: Identify Tech Stack

Analyze the codebase to determine what technologies are in use. Look at package files, dependency manifests, imports, file extensions, and code patterns to identify:

**Frontend Layer:**
- Primary framework and version (examples: React, Vue, Angular, Svelte, Next.js, Nuxt, SvelteKit, or other)
- Language used (examples: JavaScript, TypeScript, or other)
- Routing solution (examine how pages/routes are defined)
- State management approach (examine how global/shared state is handled)
- HTTP/API client (examine how API calls are made)
- UI component library or styling approach
- Build tooling and bundler

**Backend Layer:**
- Primary framework and version (examples: Express, Fastify, NestJS, Django, FastAPI, Flask, Rails, Spring, Go Fiber, or other)
- Language and runtime (examples: Node.js, Python, Go, Java, Ruby, Rust, PHP, .NET, or other)
- API architecture style (examples: REST, GraphQL, gRPC, tRPC, or other)
- Authentication approach (examine how users are authenticated)
- Middleware and request processing pipeline

**Data Layer:**
- Database system(s) (examples: PostgreSQL, MySQL, MongoDB, Redis, SQLite, DynamoDB, Supabase, Firebase, or other)
- ORM, ODM, or query builder (examine how database queries are constructed)
- Migration system and schema management
- Connection management and pooling
- Caching layer (if present)

**Scripts & Background Processing:**
- Standalone scripts in any language (look for /scripts, /jobs, /workers, /tasks directories or similar)
- Scheduled jobs and cron tasks
- Task/job queues and workers
- Data processing pipelines
- CLI tools

**External Service Integrations:**
- Payment processing
- Email/SMS/notification services
- File storage and CDN
- Analytics and tracking
- Search services
- Any other third-party APIs or SDKs

**Real-Time Communication:**
- WebSocket implementations
- Server-Sent Events (SSE)
- Real-time database subscriptions
- Push notification services

**Infrastructure & DevOps:**
- Caching systems
- Message queues and event buses
- Environment and secrets management
- Containerization and orchestration
- CI/CD configuration

**Document your findings in this format:**
```
DISCOVERED TECH STACK
=====================
Frontend: [what you found] ([version if detectable])
Backend: [what you found] ([version if detectable])
Database: [what you found]
ORM/Data Access: [what you found]
Key Dependencies: [list significant libraries/packages]
External Services: [list third-party integrations discovered]
Real-Time: [what you found, or "None detected"]
Background Jobs: [what you found, or "None detected"]
```

### Step 2: Map Codebase Structure

Analyze and document the actual folder structure of this project:
- Identify where frontend code lives
- Identify where backend code lives
- Identify where database schemas/models are defined
- Identify where scripts and jobs are located
- Identify shared code, types, or utilities
- Identify configuration and environment files
- Identify test directories

**Document in this format:**
```
CODEBASE STRUCTURE
==================
[Draw the actual folder tree you discovered, showing the organization of this specific project]
```

### Step 3: Identify Critical User Flows

By analyzing the code (routes, components, handlers, etc.), identify the main user journeys and system processes:
- Authentication flows (registration, login, logout, password reset)
- Core business operations (what does this app primarily do?)
- Data submission and retrieval flows
- Payment or transaction flows (if applicable)
- Admin or management operations
- Background processes and scheduled tasks
- Any complex multi-step workflows

**List the top 5-10 critical flows you identify, ranked by importance to the application's core functionality**

### Step 4: Identify All Integration Points

Scan the codebase to create a preliminary inventory of:
- All backend API endpoints (examine route definitions)
- All frontend API calls (search for HTTP client usage patterns)
- All database tables/collections (examine schema files and models)
- All scripts and background jobs (find standalone executable files)
- All external API integrations (look for API keys, SDK imports, third-party client instantiation)
- All webhook endpoints (incoming webhooks from external services)
- All real-time channels/subscriptions (if applicable)

**Create a preliminary count:**
```
INTEGRATION POINT SUMMARY
=========================
Backend Endpoints: [count]
Frontend API Calls: [count]
Database Tables/Collections: [count]
Scripts/Background Jobs: [count]
External API Integrations: [count]
Webhook Endpoints: [count]
Real-Time Channels: [count]
```

---

## PHASE 1: COMPREHENSIVE AUDIT

Now conduct the full integration audit using the architecture you discovered in Phase 0. Adapt your analysis to the specific technologies found - the sections below are framework-agnostic and should be applied to whatever stack this project uses.

---

### AUDIT SECTION 1: BACKEND API ENDPOINT MAPPING

For EACH backend endpoint/route in the system, document:

**Endpoint Details:**
- HTTP Method and Path
- Handler/Controller function name and file location
- Middleware or guards applied (authentication, validation, rate limiting, logging, etc.)

**Request Contract:**
- Expected request body structure (with types/schema)
- URL parameters and query parameters
- Required vs optional fields
- Validation rules implemented
- Expected headers

**Processing Logic:**
- Database operations performed
- External API calls made
- Business logic and transformations
- Side effects (emails sent, events emitted, files created, etc.)

**Response Contract:**
- Success response structure (with types/schema)
- HTTP status codes used
- Error response structures
- Headers set

**Security:**
- Authentication required (yes/no, what type)
- Authorization/permission checks
- Input sanitization
- Rate limiting

**Dependencies:**
- Database tables/collections accessed
- External services called
- Internal services or other endpoints called
- Environment variables required

**Create a comprehensive table:**

| Endpoint | Method | Auth | Request Schema | Response Schema | DB Tables | External Calls | Status | Issues |
|----------|--------|------|----------------|-----------------|-----------|----------------|--------|--------|
| [fill for each endpoint] | | | | | | | ✓/✗ | |

---

### AUDIT SECTION 2: FRONTEND API INTEGRATION MAPPING

For EACH API call made from the frontend, document:

**Call Location:**
- File path where call is made
- Function/component name
- User action or event that triggers it

**Request Details:**
- Target endpoint (verify it exists in backend)
- HTTP method
- Payload structure sent
- Headers included
- Query parameters

**Contract Validation:**
- ✓ Does the endpoint exist in backend?
- ✓ Does request payload match backend expectations exactly?
- ✓ Are all required fields sent?
- ✓ Are data types correct?
- ✓ Is authentication token properly included?

**Response Handling:**
- How success responses are processed
- Data transformations applied
- State management updates
- UI updates triggered
- Cache invalidation/updates

**Error Handling:**
- How error responses are caught
- User feedback mechanism (toast, modal, inline message, etc.)
- Retry logic (if any)
- Fallback behavior
- Error logging/reporting

**Loading & UX States:**
- Loading indicator implemented
- Button/form disabled during request
- Optimistic updates (if applicable)
- Success confirmation shown

**Create a comprehensive table:**

| Frontend Location | Endpoint | Trigger | Payload Matches | Response Handled | Errors Handled | Loading State | Status | Issues |
|-------------------|----------|---------|-----------------|------------------|----------------|---------------|--------|--------|
| [fill for each call] | | | | | | | ✓/✗ | |

---

### AUDIT SECTION 3: DATABASE INTEGRATION AUDIT

For EACH database table/collection, document:

**Schema Definition:**
- Table/collection name
- Fields with data types
- Primary key(s)
- Foreign keys and relationships
- Indexes
- Constraints (unique, not null, check, etc.)
- Default values

**Access Patterns:**
- Which backend endpoints READ from this table
- Which backend endpoints WRITE to this table
- Which scripts/jobs access this table
- Common query patterns (simple select, joins, aggregations)

**Data Integrity:**
- Validation before writes
- Sanitization implemented
- Transaction usage for multi-table operations
- Referential integrity enforcement
- Soft delete vs hard delete patterns

**Performance Considerations:**
- Indexes on frequently queried columns
- N+1 query risks identified
- Large table handling (pagination, cursors)
- Query optimization opportunities

**Schema Management:**
- Migration files present and up to date
- Schema version tracking
- Rollback capability

**Create a comprehensive table:**

| Table/Collection | Backend Endpoints | Scripts/Jobs | Relationships | Indexed Fields | Validation | Issues |
|------------------|-------------------|--------------|---------------|----------------|------------|--------|
| [fill for each] | | | | | | |

---

### AUDIT SECTION 4: SCRIPTS & BACKGROUND JOB AUDIT

For EACH script, worker, scheduled job, or background task (in any language), document:

**Identity:**
- File name and location
- Language/runtime
- Purpose and functionality
- Execution method (cron, queue, manual, event-triggered, etc.)
- Schedule (if applicable)

**Inputs:**
- Command-line arguments
- Environment variables required
- Configuration files read
- Database connections needed
- Message queue subscriptions

**Processing:**
- Database operations performed
- External APIs called
- Files read/written
- Data transformations

**Outputs:**
- Database changes made
- Files/reports generated
- Notifications sent
- Events emitted
- API calls to other services

**Integration:**
- How it's triggered (scheduler, API call, queue message, manual)
- How it reports status/completion
- How it integrates with the main application
- Shared data formats or contracts

**Reliability:**
- Error handling implemented
- Retry logic
- Idempotency (safe to re-run?)
- Logging and monitoring
- Alerting on failure

**Create a comprehensive table:**

| Script/Job | Language | Purpose | Trigger | DB Access | External Calls | Error Handling | Status | Issues |
|------------|----------|---------|---------|-----------|----------------|----------------|--------|--------|
| [fill for each] | | | | | | | ✓/✗ | |

---

### AUDIT SECTION 5: EXTERNAL API INTEGRATION AUDIT

For EACH third-party service or external API, document:

**Service Identity:**
- Service name and purpose
- SDK or client library used
- API version

**Integration Points:**
- Where it's called from (list all backend endpoints, frontend locations, and scripts)
- Is it called directly or through an abstraction layer?

**Authentication:**
- How credentials are managed
- Environment variables used
- Token refresh handling (if applicable)

**Usage:**
- Specific endpoints/methods called
- Request/response formats
- Rate limits and quotas

**Incoming Data (Webhooks):**
- Webhook endpoints registered
- Event types handled
- Signature verification implemented
- Idempotency handling

**Error Handling:**
- Network failure handling
- API error response handling
- Retry logic with backoff
- Fallback behavior
- Circuit breaker pattern (if applicable)

**Monitoring:**
- API call logging
- Error tracking
- Performance monitoring
- Cost tracking (if usage-based pricing)

**Create a comprehensive table:**

| Service | Called From | Purpose | Auth Method | Webhooks | Error Handling | Fallback | Status | Issues |
|---------|-------------|---------|-------------|----------|----------------|----------|--------|--------|
| [fill for each] | | | | | | | ✓/✗ | |

---

### AUDIT SECTION 6: COMPLETE DATA FLOW TRACING

For EACH critical user flow discovered in Phase 0, trace the complete data journey:

**Use this format for each flow:**
```
FLOW: [Name of the flow]
=====================================

1. USER ACTION
   → [What the user does]

2. FRONTEND
   → Component/Page: [file location]
   → Trigger: [event/action]
   → Validation: [client-side validation performed]
   → API Call: [method] [endpoint]
   → Payload: [structure sent]

3. BACKEND RECEIPT
   → Route Handler: [file:function]
   → Middleware Chain: [list middleware executed]
   → Request Validation: [validation performed]

4. BUSINESS LOGIC
   → Service/Logic Layer: [file:function]
   → Operations: [what happens]
   → Database Queries: [tables accessed, operations performed]

5. EXTERNAL CALLS (if any)
   → Service: [external API]
   → Purpose: [why it's called]
   → Data Exchanged: [what's sent/received]

6. RESPONSE CONSTRUCTION
   → Response Format: [structure]
   → Status Code: [code]

7. FRONTEND HANDLING
   → Response Handler: [file:function]
   → State Update: [what state changes]
   → UI Update: [what re-renders]

8. USER FEEDBACK
   → Confirmation: [how user knows it worked]

VERIFICATION CHECKLIST:
[ ] All code paths exist
[ ] Data formats match at each boundary
[ ] Error handling at each step
[ ] Loading states implemented
[ ] Success feedback shown
[ ] Edge cases handled

ISSUES FOUND:
- [list any problems]
```

---

### AUDIT SECTION 7: AUTHENTICATION & AUTHORIZATION AUDIT

Document the complete auth system:

**User Registration:**
- Frontend form location
- API endpoint
- Validation (client and server)
- Password handling (hashing algorithm, strength requirements)
- User record creation
- Email verification (if applicable)
- Initial session/token creation
- Post-registration flow

**User Login:**
- Frontend form location
- API endpoint
- Credential validation
- Token/session generation
- Token storage location (cookie, localStorage, memory)
- Response to frontend
- Redirect behavior

**Token/Session Management:**
- Token type and format
- Expiration policy
- Refresh mechanism
- Storage security
- Transmission method (header, cookie)
- Revocation capability

**Protected Frontend Routes:**
| Route | Auth Guard | Unauthorized Redirect | Issues |
|-------|------------|----------------------|--------|
| [list all protected routes] | | | |

**Protected Backend Endpoints:**
| Endpoint | Auth Middleware | Permission Check | Unauthorized Response | Issues |
|----------|-----------------|------------------|----------------------|--------|
| [list all protected endpoints] | | | | |

**Authorization & Permissions:**
- Permission model (RBAC, ABAC, custom)
- How roles are assigned
- How permissions are checked
- Resource-level access control
- Consistency across frontend and backend

**Security Concerns:**
- Password storage method
- Brute force protection
- Session fixation prevention
- CSRF protection
- Token security (httpOnly, secure flags)

---

### AUDIT SECTION 8: REAL-TIME COMMUNICATION AUDIT

If real-time features exist, document:

**Technology Used:**
- Implementation (WebSocket, SSE, polling, third-party service)
- Library or framework

**Channels/Events:**
| Channel/Event | Purpose | Publisher | Subscribers | Auth Required | Issues |
|---------------|---------|-----------|-------------|---------------|--------|
| [list all] | | | | | |

**Connection Management:**
- Connection establishment flow
- Authentication/authorization for connections
- Reconnection handling
- Heartbeat/keepalive mechanism

**Data Flow:**
- Message formats
- Serialization/deserialization
- Message ordering guarantees
- Delivery guarantees

**Scaling Considerations:**
- Horizontal scaling approach
- State management across instances
- Pub/sub backend (if applicable)

---

### AUDIT SECTION 9: CONFIGURATION & ENVIRONMENT AUDIT

**Environment Variables:**
| Variable | Used In | Purpose | Default | Required | Validated | Issues |
|----------|---------|---------|---------|----------|-----------|--------|
| [list ALL env vars] | | | | | | |

**Configuration Files:**
- List all config files found
- What each configures
- Environment-specific overrides
- Sensitive data handling

**Secrets Management:**
- How secrets are stored
- How secrets are accessed
- Rotation policy (if any)
- No hardcoded credentials verification

**Database Configuration:**
- Connection string management
- Connection pooling settings
- Timeout configuration
- SSL/TLS in production

**CORS Configuration:**
- Allowed origins
- Allowed methods
- Credentials handling
- Preflight caching

**Feature Flags/Toggles (if present):**
- How they're implemented
- Where they're defined
- How they're accessed

---

### AUDIT SECTION 10: TYPE SAFETY & CONTRACT AUDIT

**API Contract Definitions:**
- Are request/response types defined?
- Where are they defined (shared types, OpenAPI, GraphQL schema, etc.)?
- Are they used consistently across frontend and backend?

**Type Mismatches Found:**

| Location | Expected | Actual | Impact | Fix |
|----------|----------|--------|--------|-----|
| [document all type mismatches] | | | | |

**Schema Validation:**
- Backend request validation (library used, coverage)
- Frontend form validation
- Database schema validation
- Are validation rules consistent across layers?

**Contract Documentation:**
- API documentation exists?
- Is it generated or manual?
- Is it up to date?

---

### AUDIT SECTION 11: INTEGRATION ISSUES REPORT

Compile all issues found into severity categories:

### CRITICAL (Broken functionality - fix immediately)
```
ISSUE #[N]: [Title]
Location: [file:line or endpoint]
Description: [What's wrong]
Impact: [What's broken or at risk]
Current Behavior: [What happens now]
Expected Behavior: [What should happen]
Recommended Fix: [Specific action to take]
Effort Estimate: [Low/Medium/High]
```

### HIGH (Potential failures - fix soon)
[Same format]

### MEDIUM (Best practice violations - plan to fix)
[Same format]

### LOW (Optimization opportunities - nice to have)
[Same format]

---

### AUDIT SECTION 12: ORPHANED & DEAD CODE

**Frontend Calls to Non-Existent Endpoints:**
| Frontend Location | Target Endpoint | Likely Cause |
|-------------------|-----------------|--------------|
| [list all] | | |

**Backend Endpoints with No Consumers:**
| Endpoint | Last Modified | Recommendation |
|----------|---------------|----------------|
| [list all] | | Keep/Remove/Investigate |

**Unused Database Tables:**
| Table | Recommendation |
|-------|----------------|
| [list all] | |

**Unused External Integrations:**
| Service | Configured In | Recommendation |
|---------|---------------|----------------|
| [list all] | | |

**Orphaned Scripts/Jobs:**
| Script | Last Modified | Recommendation |
|--------|---------------|----------------|
| [list all] | | |

**Dead Code Patterns:**
- Unreachable functions
- Commented-out code blocks
- Duplicate implementations
- Unused exports

---

### AUDIT SECTION 13: BEST PRACTICE VIOLATIONS

**Error Handling:**
- Inconsistent error response formats
- Missing error handling in critical paths
- Errors swallowed silently
- Poor error messages for users

**Input Validation:**
- Missing server-side validation
- Client-only validation (security risk)
- Inconsistent validation rules
- SQL injection risks
- XSS vulnerabilities

**Performance:**
- N+1 query problems
- Missing indexes
- No pagination on large datasets
- Synchronous blocking operations
- Missing caching opportunities
- Large payload transfers

**Security:**
- Unprotected sensitive endpoints
- Weak authentication
- Missing rate limiting
- Exposed sensitive data in responses
- Insecure direct object references

**Code Organization:**
- Duplicated logic
- Overly large files/functions
- Poor separation of concerns
- Missing abstraction layers
- Inconsistent patterns

**UX:**
- Missing loading states
- No error feedback to users
- Missing success confirmations
- Broken or confusing flows

---

### AUDIT SECTION 14: ARCHITECTURE RECOMMENDATIONS

**Immediate Improvements:**
1. [Highest impact, lowest effort fixes]
2. [...]

**Short-term Improvements:**
1. [Important fixes requiring more effort]
2. [...]

**Long-term Improvements:**
1. [Architectural changes to consider]
2. [...]

**Consolidation Opportunities:**
- Duplicate logic that should be abstracted
- Similar API calls that could be unified
- Repeated patterns that need a shared solution

**Documentation Needs:**
- API documentation
- Architecture diagrams
- Setup/deployment guides
- Code comments for complex logic

**Testing Gaps:**
- Critical flows without integration tests
- Edge cases not covered
- External integrations not mocked

---

## DELIVERABLE SUMMARY

**Overall Integration Health Score: [X/10]**

**Discovery Statistics:**
- Backend Endpoints: [N]
- Frontend API Calls: [N]
- Database Tables: [N]
- Scripts/Jobs: [N]
- External Integrations: [N]
- Real-Time Channels: [N]

**Issues Found:**
- Critical: [N]
- High: [N]
- Medium: [N]
- Low: [N]

**Top 5 Most Critical Findings:**
1. [Issue + brief description]
2. [Issue + brief description]
3. [Issue + brief description]
4. [Issue + brief description]
5. [Issue + brief description]

**Immediate Action Items (Do This Week):**
1. [Most urgent fix]
2. [Second priority]
3. [Third priority]

**Integration Health by Layer:**
- Frontend ↔ Backend Communication: [X/10]
- Backend ↔ Database Integration: [X/10]
- External API Integrations: [X/10]
- Scripts/Jobs Integration: [X/10]
- Authentication System: [X/10]
- Real-Time Systems: [X/10 or N/A]
- Configuration Management: [X/10]
- Type Safety/Contracts: [X/10]

**Audit Confidence Level:** [High/Medium/Low]
Based on: [level of code access, documentation available, codebase complexity]

**Recommended Follow-Up Audits:**
- [Specific areas that need deeper investigation]

---

## END OF PROMPT


---
