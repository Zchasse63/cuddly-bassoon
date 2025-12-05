Project Audit 12-3-25

You are a senior technical architect conducting a Documentation-Implementation Compliance Audit. Your mission is to autonomously discover this project's complete tech stack and all project documentation, then systematically verify that the actual implementation matches what was planned, designed, and documented.

Your deliverable is a comprehensive compliance report with a prioritized fix plan for all gaps between documentation and reality.

---

## PHASE 0: AUTONOMOUS DISCOVERY

Before auditing, you must discover and catalog everything in this codebase.

### Step 0.1: Tech Stack Discovery

Analyze the codebase to identify:

**Frontend Stack:**
- Framework and version (React, Vue, Angular, Svelte, Next.js, etc.)
- Language (JavaScript, TypeScript)
- Routing solution
- State management
- HTTP client library
- UI component library/design system
- Build tooling
- Testing frameworks

**Backend Stack:**
- Framework and version (Express, FastAPI, Django, NestJS, Rails, etc.)
- Language and version
- API architecture (REST, GraphQL, tRPC, gRPC)
- Authentication system
- Middleware chain
- Testing frameworks

**Database Layer:**
- Database system(s)
- ORM/query builder
- Migration system
- Seeding approach

**Infrastructure & DevOps:**
- Deployment configuration
- CI/CD pipelines
- Environment management
- Containerization
- Cloud services

**External Integrations:**
- Third-party APIs
- Payment processors
- Email/notification services
- Analytics
- Storage services

**Document your findings:**
```
╔══════════════════════════════════════════════════════════════════╗
║                    DISCOVERED TECH STACK                         ║
╠══════════════════════════════════════════════════════════════════╣
║ Frontend:     [framework] [version] with [language]              ║
║ Backend:      [framework] [version] with [language]              ║
║ Database:     [system] with [ORM]                                ║
║ Auth:         [strategy]                                         ║
║ Deployment:   [platform/approach]                                ║
║ Key Deps:     [list critical dependencies]                       ║
║ Integrations: [list third-party services]                        ║
╚══════════════════════════════════════════════════════════════════╝
```

### Step 0.2: Codebase Structure Mapping

Analyze and document the complete folder structure:

```
PROJECT ROOT
├── [document the actual structure you find]
├── [identify frontend directories]
├── [identify backend directories]
├── [identify shared/common directories]
├── [identify config directories]
├── [identify documentation directories]
├── [identify test directories]
└── [note any unusual or notable structures]
```

### Step 0.3: Project Documentation Inventory

**CRITICAL**: Search the entire codebase for ALL project documentation. Look in:

- Root directory (README.md, CONTRIBUTING.md, ARCHITECTURE.md, etc.)
- `/docs` or `/documentation` folders
- `/specs` or `/specifications` folders
- `/design` or `/designs` folders
- `/.github` folder (issue templates, PR templates, workflows)
- `/planning` or `/plans` folders
- `/requirements` folder
- `/api` folder (OpenAPI/Swagger specs)
- Any markdown files throughout the codebase
- Code comments with `@spec`, `@requirement`, `@design` annotations
- JSDoc/TSDoc/docstring documentation
- Configuration files with embedded documentation

**Categorize all documents found:**

| Document | Location | Type | Last Modified | Summary |
|----------|----------|------|---------------|---------|
| | | | | |

**Document Types to Identify:**
- `REQUIREMENTS` - Feature requirements, user stories, acceptance criteria
- `ARCHITECTURE` - System design, component diagrams, data flow
- `API_SPEC` - API contracts, endpoint documentation, OpenAPI/Swagger
- `DATA_MODEL` - Database schemas, ERDs, data dictionaries
- `UI_DESIGN` - Wireframes, mockups, design system documentation
- `USER_FLOW` - User journey maps, flow diagrams
- `ROUTING` - Route definitions, navigation structure
- `BUSINESS_LOGIC` - Business rules, validation rules, calculations
- `INTEGRATION` - Third-party integration specs
- `DEPLOYMENT` - Infrastructure, deployment procedures
- `TESTING` - Test plans, test cases, coverage requirements
- `ONBOARDING` - Setup guides, developer documentation
- `CHANGELOG` - Version history, release notes
- `ADR` - Architecture Decision Records

**Document your inventory:**
```
╔══════════════════════════════════════════════════════════════════╗
║                  PROJECT DOCUMENTATION INVENTORY                  ║
╠══════════════════════════════════════════════════════════════════╣
║ Requirements Documents:    [count] files                         ║
║ Architecture Documents:    [count] files                         ║
║ API Specifications:        [count] files                         ║
║ Data Model Documents:      [count] files                         ║
║ UI/UX Design Documents:    [count] files                         ║
║ User Flow Documents:       [count] files                         ║
║ Business Logic Documents:  [count] files                         ║
║ Integration Documents:     [count] files                         ║
║ Testing Documents:         [count] files                         ║
║ Other Documentation:       [count] files                         ║
║                                                                  ║
║ TOTAL DOCUMENTS FOUND:     [count] files                         ║
╚══════════════════════════════════════════════════════════════════╝
```

### Step 0.4: Extract Documented Specifications

For each document found, extract the **specific, verifiable commitments**:

**From Requirements Documents, Extract:**
- Feature requirements with acceptance criteria
- User stories with done definitions
- Functional requirements
- Non-functional requirements (performance, security, etc.)
- Business rules and constraints

**From Architecture Documents, Extract:**
- Component structure expectations
- Data flow patterns
- Integration patterns
- Technology choices and rationale
- Scalability requirements

**From API Specifications, Extract:**
- Endpoint definitions (method, path, auth)
- Request/response schemas
- Error response formats
- Rate limiting requirements
- Versioning strategy

**From Data Model Documents, Extract:**
- Table/collection definitions
- Field specifications with types
- Relationships and constraints
- Index requirements
- Validation rules

**From UI/UX Design Documents, Extract:**
- Page/screen definitions
- Component specifications
- Interaction patterns
- Responsive breakpoints
- Accessibility requirements
- Animation/transition specs
- Error state designs
- Loading state designs
- Empty state designs

**From User Flow Documents, Extract:**
- Step-by-step flow definitions
- Decision points and branches
- Success/failure paths
- Edge case handling requirements

**From Routing Documents, Extract:**
- Route definitions
- Protected vs public routes
- Route parameter specifications
- Navigation hierarchy
- Deep linking requirements

**From Business Logic Documents, Extract:**
- Calculation formulas
- Validation rules
- State machine definitions
- Workflow definitions
- Permission/authorization rules

**Create a Specification Registry:**

| Spec ID | Source Document | Category | Specification | Verifiable Criteria |
|---------|-----------------|----------|---------------|---------------------|
| SPEC-001 | | | | |
| SPEC-002 | | | | |

---

## PHASE 1: IMPLEMENTATION AUDIT

Now systematically verify the implementation against documented specifications.

---

### AUDIT SECTION 1: ROUTING COMPLIANCE

**1.1 Extract All Documented Routes**

From your documentation inventory, list every route that SHOULD exist:

| Doc Source | Route Path | Method | Auth Required | Purpose | Parameters |
|------------|------------|--------|---------------|---------|------------|
| | | | | | |

**1.2 Extract All Implemented Routes**

Scan the codebase for all ACTUAL routes:

**Frontend Routes** (from router configuration):
| Route Path | Component | Auth Guard | Lazy Loaded | Params |
|------------|-----------|------------|-------------|--------|
| | | | | |

**Backend Routes** (from route/controller files):
| Route Path | Method | Handler | Middleware | Validation |
|------------|--------|---------|------------|------------|
| | | | | |

**1.3 Route Compliance Matrix**

Cross-reference documented vs implemented:

| Route | Documented | Implemented | Match Status | Discrepancy Details |
|-------|------------|-------------|--------------|---------------------|
| | ✓/✗ | ✓/✗ | ✓ MATCH / ⚠ PARTIAL / ✗ MISSING / ❓ UNDOCUMENTED | |

**1.4 Route Compliance Findings**

```
DOCUMENTED BUT NOT IMPLEMENTED:
- [list routes that exist in docs but not in code]

IMPLEMENTED BUT NOT DOCUMENTED:
- [list routes that exist in code but not in docs]

IMPLEMENTED DIFFERENTLY THAN DOCUMENTED:
- [list routes where implementation differs from spec]

ROUTING COMPLIANCE SCORE: [X/Y routes compliant] ([percentage]%)
```

---

### AUDIT SECTION 2: UI/UX COMPLIANCE

**2.1 Extract UI/UX Specifications**

From design documents, extract all UI/UX requirements:

| Spec ID | Screen/Component | Requirement | Priority |
|---------|------------------|-------------|----------|
| | | | |

**2.2 Component Inventory**

Scan codebase for all UI components:

| Component | Location | Purpose | Props/Inputs | States Handled |
|-----------|----------|---------|--------------|----------------|
| | | | | |

**2.3 Screen/Page Inventory**

List all pages/screens in the application:

| Screen | Route | Components Used | Data Requirements | States |
|--------|-------|-----------------|-------------------|--------|
| | | | | |

**2.4 UI/UX Compliance Checks**

For each documented UI/UX requirement, verify implementation:

**Layout & Structure:**
| Requirement | Documented | Implemented | Compliant | Notes |
|-------------|------------|-------------|-----------|-------|
| Page structure | | | | |
| Component hierarchy | | | | |
| Responsive breakpoints | | | | |
| Grid/layout system | | | | |

**Interactive Elements:**
| Requirement | Documented | Implemented | Compliant | Notes |
|-------------|------------|-------------|-----------|-------|
| Button states (hover, active, disabled) | | | | |
| Form validation feedback | | | | |
| Loading indicators | | | | |
| Error states | | | | |
| Empty states | | | | |
| Success confirmations | | | | |

**Navigation & Flow:**
| Requirement | Documented | Implemented | Compliant | Notes |
|-------------|------------|-------------|-----------|-------|
| Navigation structure | | | | |
| Breadcrumbs | | | | |
| Back navigation | | | | |
| Deep linking | | | | |

**Accessibility:**
| Requirement | Documented | Implemented | Compliant | Notes |
|-------------|------------|-------------|-----------|-------|
| Keyboard navigation | | | | |
| Screen reader support | | | | |
| Color contrast | | | | |
| Focus indicators | | | | |
| ARIA labels | | | | |

**Animations & Transitions:**
| Requirement | Documented | Implemented | Compliant | Notes |
|-------------|------------|-------------|-----------|-------|
| Page transitions | | | | |
| Micro-interactions | | | | |
| Loading animations | | | | |
| Feedback animations | | | | |

**2.5 UI/UX Compliance Summary**

```
UI/UX COMPLIANCE SCORE: [X/Y requirements met] ([percentage]%)

CRITICAL UI/UX GAPS:
- [list major missing or broken UI/UX elements]

PARTIAL IMPLEMENTATIONS:
- [list elements that are partially implemented]

UNDOCUMENTED UI/UX (implemented but not in specs):
- [list UI/UX elements that exist but weren't specified]
```

---

### AUDIT SECTION 3: BUSINESS LOGIC COMPLIANCE

**3.1 Extract Documented Business Rules**

From requirements and business logic documents:

| Rule ID | Description | Inputs | Expected Behavior | Edge Cases |
|---------|-------------|--------|-------------------|------------|
| | | | | |

**3.2 Locate Business Logic Implementation**

For each documented rule, find where it's implemented:

| Rule ID | Implementation Location | Function/Method | Test Coverage |
|---------|------------------------|-----------------|---------------|
| | | | |

**3.3 Business Logic Verification**

For each rule, verify correct implementation:

| Rule ID | Documented Behavior | Actual Behavior | Compliant | Discrepancy |
|---------|---------------------|-----------------|-----------|-------------|
| | | | | |

**3.4 Validation Rules Compliance**

| Field/Input | Documented Validation | Implemented Validation | Frontend | Backend | Match |
|-------------|----------------------|------------------------|----------|---------|-------|
| | | | ✓/✗ | ✓/✗ | |

**3.5 Calculation/Formula Compliance**

| Calculation | Documented Formula | Implemented Formula | Verified Correct |
|-------------|-------------------|---------------------|------------------|
| | | | |

**3.6 Business Logic Compliance Summary**

```
BUSINESS LOGIC COMPLIANCE SCORE: [X/Y rules compliant] ([percentage]%)

INCORRECTLY IMPLEMENTED RULES:
- [list rules where implementation differs from spec]

MISSING RULE IMPLEMENTATIONS:
- [list documented rules not found in code]

UNDOCUMENTED BUSINESS LOGIC:
- [list logic in code not covered by documentation]
```

---

### AUDIT SECTION 4: API CONTRACT COMPLIANCE

**4.1 Extract Documented API Contracts**

From API specifications (OpenAPI, Swagger, or documentation):

| Endpoint | Method | Request Schema | Response Schema | Auth | Status Codes |
|----------|--------|----------------|-----------------|------|--------------|
| | | | | | |

**4.2 Extract Implemented API Contracts**

From actual backend code:

| Endpoint | Method | Request Validation | Response Structure | Auth Middleware | Error Handling |
|----------|--------|-------------------|-------------------|-----------------|----------------|
| | | | | | |

**4.3 API Contract Comparison**

| Endpoint | Spec Request | Actual Request | Match | Spec Response | Actual Response | Match |
|----------|--------------|----------------|-------|---------------|-----------------|-------|
| | | | | | | |

**4.4 API Compliance Issues**

```
REQUEST SCHEMA MISMATCHES:
- [endpoint]: Expected [spec], got [actual]

RESPONSE SCHEMA MISMATCHES:
- [endpoint]: Expected [spec], got [actual]

MISSING ENDPOINTS:
- [endpoints in spec but not implemented]

UNDOCUMENTED ENDPOINTS:
- [endpoints implemented but not in spec]

STATUS CODE MISMATCHES:
- [endpoint]: Documented [codes], implemented [codes]

API CONTRACT COMPLIANCE SCORE: [X/Y endpoints compliant] ([percentage]%)
```

---

### AUDIT SECTION 5: DATA MODEL COMPLIANCE

**5.1 Extract Documented Data Model**

From ERDs, schema docs, or data dictionaries:

| Table/Collection | Fields | Types | Constraints | Relationships |
|------------------|--------|-------|-------------|---------------|
| | | | | |

**5.2 Extract Implemented Data Model**

From migrations, ORM models, or database inspection:

| Table/Collection | Fields | Types | Constraints | Indexes | Relationships |
|------------------|--------|-------|-------------|---------|---------------|
| | | | | | |

**5.3 Data Model Comparison**

| Entity | Documented | Implemented | Schema Match | Constraint Match | Index Match |
|--------|------------|-------------|--------------|------------------|-------------|
| | | | | | |

**5.4 Data Model Compliance Issues**

```
SCHEMA MISMATCHES:
- [table]: Field [field] documented as [type], implemented as [type]

MISSING TABLES/COLLECTIONS:
- [list documented but not implemented]

UNDOCUMENTED TABLES/COLLECTIONS:
- [list implemented but not documented]

MISSING CONSTRAINTS:
- [table.field]: Should have [constraint]

MISSING INDEXES:
- [table]: Should have index on [fields]

DATA MODEL COMPLIANCE SCORE: [X/Y entities compliant] ([percentage]%)
```

---

### AUDIT SECTION 6: USER FLOW COMPLIANCE

**6.1 Extract Documented User Flows**

From user flow diagrams and journey maps:

| Flow Name | Steps | Decision Points | Success Outcome | Failure Handling |
|-----------|-------|-----------------|-----------------|------------------|
| | | | | |

**6.2 Trace Implemented User Flows**

For each documented flow, trace through the actual implementation:

```
FLOW: [Flow Name]

DOCUMENTED STEPS:
1. [step] → [next step]
2. [step] → [next step]
...

IMPLEMENTED PATH:
1. [component/action] → [result] → ✓/✗ matches doc
2. [component/action] → [result] → ✓/✗ matches doc
...

FLOW COMPLIANCE: ✓ COMPLETE / ⚠ PARTIAL / ✗ BROKEN
GAPS IDENTIFIED: [list any missing or broken steps]
```

**6.3 User Flow Compliance Matrix**

| Flow | Steps Documented | Steps Implemented | Complete | Gaps |
|------|------------------|-------------------|----------|------|
| | | | | |

**6.4 User Flow Compliance Summary**

```
USER FLOW COMPLIANCE SCORE: [X/Y flows complete] ([percentage]%)

BROKEN FLOWS (cannot complete):
- [flow]: Breaks at [step] because [reason]

INCOMPLETE FLOWS (missing steps):
- [flow]: Missing [steps]

DIVERGENT FLOWS (works differently than documented):
- [flow]: [description of divergence]
```

---

### AUDIT SECTION 7: INTEGRATION COMPLIANCE

**7.1 Extract Documented Integrations**

From integration specs:

| Integration | Purpose | Endpoints Used | Auth Method | Error Handling |
|-------------|---------|----------------|-------------|----------------|
| | | | | |

**7.2 Verify Implemented Integrations**

| Integration | Documented | Implemented | Config Correct | Error Handling | Compliant |
|-------------|------------|-------------|----------------|----------------|-----------|
| | | | | | |

**7.3 Integration Compliance Summary**

```
INTEGRATION COMPLIANCE SCORE: [X/Y integrations compliant] ([percentage]%)

MISSING INTEGRATIONS:
- [integration documented but not implemented]

MISCONFIGURED INTEGRATIONS:
- [integration]: [issue description]

UNDOCUMENTED INTEGRATIONS:
- [integration in code but not documented]
```

---

### AUDIT SECTION 8: TESTING COMPLIANCE

**8.1 Extract Testing Requirements**

From test plans or testing documentation:

| Requirement | Type | Coverage Target | Priority |
|-------------|------|-----------------|----------|
| | | | |

**8.2 Verify Test Implementation**

| Requirement | Tests Exist | Tests Pass | Coverage Met | Gaps |
|-------------|-------------|------------|--------------|------|
| | | | | |

**8.3 Testing Compliance Summary**

```
TESTING COMPLIANCE SCORE: [X/Y requirements covered] ([percentage]%)

UNTESTED CRITICAL PATHS:
- [list critical functionality without tests]

FAILING TESTS:
- [list currently failing tests]

COVERAGE GAPS:
- [areas below documented coverage targets]
```

---

## PHASE 2: GAP ANALYSIS & CLASSIFICATION

### 2.1 Complete Gap Registry

Compile ALL gaps found into a single registry:

| Gap ID | Category | Severity | Source Doc | Expected | Actual | Impact |
|--------|----------|----------|------------|----------|--------|--------|
| GAP-001 | | | | | | |

**Categories:**
- `ROUTING` - Route/navigation gaps
- `UI_UX` - User interface/experience gaps
- `LOGIC` - Business logic gaps
- `API` - API contract gaps
- `DATA` - Data model gaps
- `FLOW` - User flow gaps
- `INTEGRATION` - Third-party integration gaps
- `TESTING` - Test coverage gaps
- `DOCS` - Documentation gaps (reality not documented)

**Severity Levels:**
- `CRITICAL` - Blocking functionality, security risk, data integrity risk
- `HIGH` - Major feature incomplete, significant UX degradation
- `MEDIUM` - Feature works but doesn't match spec, minor UX issues
- `LOW` - Cosmetic differences, documentation updates needed

### 2.2 Gap Classification Summary

```
╔══════════════════════════════════════════════════════════════════╗
║                      GAP ANALYSIS SUMMARY                         ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  BY SEVERITY:                                                    ║
║  ├── CRITICAL:  [count] gaps                                     ║
║  ├── HIGH:      [count] gaps                                     ║
║  ├── MEDIUM:    [count] gaps                                     ║
║  └── LOW:       [count] gaps                                     ║
║                                                                  ║
║  BY CATEGORY:                                                    ║
║  ├── Routing:      [count] gaps                                  ║
║  ├── UI/UX:        [count] gaps                                  ║
║  ├── Logic:        [count] gaps                                  ║
║  ├── API:          [count] gaps                                  ║
║  ├── Data:         [count] gaps                                  ║
║  ├── Flow:         [count] gaps                                  ║
║  ├── Integration:  [count] gaps                                  ║
║  ├── Testing:      [count] gaps                                  ║
║  └── Docs:         [count] gaps                                  ║
║                                                                  ║
║  TOTAL GAPS IDENTIFIED: [count]                                  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## PHASE 3: PRIORITIZED REMEDIATION PLAN

### 3.1 Critical Fixes (Do Immediately)

These gaps block functionality or pose security/data risks.

For each CRITICAL gap:

```
┌─────────────────────────────────────────────────────────────────┐
│ FIX-001: [Brief Title]                                          │
├─────────────────────────────────────────────────────────────────┤
│ Gap ID:        GAP-XXX                                          │
│ Category:      [category]                                       │
│ Source Doc:    [document name and location]                     │
│                                                                 │
│ CURRENT STATE:                                                  │
│ [Describe what currently exists or happens]                     │
│                                                                 │
│ EXPECTED STATE (per documentation):                             │
│ [Describe what the documentation specifies]                     │
│                                                                 │
│ IMPACT OF NOT FIXING:                                           │
│ [Describe consequences of leaving unfixed]                      │
│                                                                 │
│ REMEDIATION STEPS:                                              │
│ 1. [Specific action with file locations]                        │
│ 2. [Specific action with file locations]                        │
│ 3. [Specific action with file locations]                        │
│                                                                 │
│ FILES TO MODIFY:                                                │
│ - [file path]: [what to change]                                 │
│ - [file path]: [what to change]                                 │
│                                                                 │
│ ESTIMATED EFFORT:  [hours/story points]                         │
│ DEPENDENCIES:      [other fixes that must happen first/after]   │
│ TESTING REQUIRED:  [how to verify fix]                          │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 High Priority Fixes (This Sprint)

Major functionality or UX issues that should be addressed soon.

[Same format as Critical, for each HIGH gap]

### 3.3 Medium Priority Fixes (Backlog)

Spec compliance issues that don't block core functionality.

| Fix ID | Gap ID | Title | Effort | Dependencies |
|--------|--------|-------|--------|--------------|
| | | | | |

Brief description for each:
- **FIX-XXX**: [one-line description of what to do]

### 3.4 Low Priority Fixes (Future/Optional)

Cosmetic and documentation updates.

| Fix ID | Gap ID | Title | Type |
|--------|--------|-------|------|
| | | | Code/Doc |

### 3.5 Documentation Updates Required

Gaps where the code is correct but documentation is wrong/missing:

| Doc Update | Document | Current State | Required Update |
|------------|----------|---------------|-----------------|
| DOC-001 | | | |

---

## PHASE 4: IMPLEMENTATION ROADMAP

### 4.1 Recommended Fix Order

Based on dependencies and impact:

```
WAVE 1 (Immediate - Unblock critical paths)
├── FIX-001: [title]
├── FIX-002: [title]
└── FIX-003: [title]

WAVE 2 (Week 1 - Core functionality compliance)  
├── FIX-004: [title]
├── FIX-005: [title]
└── FIX-006: [title]

WAVE 3 (Week 2 - UX and polish)
├── FIX-007: [title]
└── FIX-008: [title]

WAVE 4 (Ongoing - Documentation and tech debt)
├── DOC-001: [title]
├── FIX-009: [title]
└── DOC-002: [title]
```

### 4.2 Dependency Graph

```
[Visual representation of fix dependencies]

FIX-001 ─┬─► FIX-003 ─► FIX-005
         │
FIX-002 ─┘

FIX-004 ─► FIX-006 ─► FIX-007
```

### 4.3 Effort Summary

```
╔══════════════════════════════════════════════════════════════════╗
║                     REMEDIATION EFFORT ESTIMATE                   ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  CRITICAL FIXES:    [X] hours / [Y] story points                 ║
║  HIGH FIXES:        [X] hours / [Y] story points                 ║
║  MEDIUM FIXES:      [X] hours / [Y] story points                 ║
║  LOW FIXES:         [X] hours / [Y] story points                 ║
║  DOC UPDATES:       [X] hours / [Y] story points                 ║
║  ──────────────────────────────────────────────────────────────  ║
║  TOTAL ESTIMATE:    [X] hours / [Y] story points                 ║
║                                                                  ║
║  Recommended Team:  [X] developers for [Y] sprints               ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## DELIVERABLE: EXECUTIVE SUMMARY

```
╔══════════════════════════════════════════════════════════════════╗
║           DOCUMENTATION-IMPLEMENTATION COMPLIANCE REPORT          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  PROJECT:           [Project Name]                               ║
║  AUDIT DATE:        [Date]                                       ║
║  AUDITOR:           AI Full-Stack Architect                      ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                       OVERALL COMPLIANCE                          ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  OVERALL COMPLIANCE SCORE:        [X]%                           ║
║                                                                  ║
║  By Domain:                                                      ║
║  ├── Routing Compliance:          [X]% ([A]/[B] routes)          ║
║  ├── UI/UX Compliance:            [X]% ([A]/[B] specs)           ║
║  ├── Business Logic Compliance:   [X]% ([A]/[B] rules)           ║
║  ├── API Contract Compliance:     [X]% ([A]/[B] endpoints)       ║
║  ├── Data Model Compliance:       [X]% ([A]/[B] entities)        ║
║  ├── User Flow Compliance:        [X]% ([A]/[B] flows)           ║
║  ├── Integration Compliance:      [X]% ([A]/[B] integrations)    ║
║  └── Testing Compliance:          [X]% ([A]/[B] requirements)    ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                         GAPS IDENTIFIED                           ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Total Gaps:     [count]                                         ║
║  ├── Critical:   [count] (blocking/security)                     ║
║  ├── High:       [count] (major functionality)                   ║
║  ├── Medium:     [count] (spec non-compliance)                   ║
║  └── Low:        [count] (cosmetic/docs)                         ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                    TOP 5 CRITICAL FINDINGS                        ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  1. [Brief description of most critical gap]                     ║
║  2. [Brief description of second most critical gap]              ║
║  3. [Brief description of third most critical gap]               ║
║  4. [Brief description of fourth most critical gap]              ║
║  5. [Brief description of fifth most critical gap]               ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                     REMEDIATION SUMMARY                           ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Estimated Total Effort:    [X] hours / [Y] story points         ║
║  Recommended Timeline:      [X] sprints with [Y] developers      ║
║                                                                  ║
║  IMMEDIATE ACTIONS (before next deploy):                         ║
║  1. [Action item]                                                ║
║  2. [Action item]                                                ║
║  3. [Action item]                                                ║
║                                                                  ║
╠══════════════════════════════════════════════════════════════════╣
║                        AUDIT METADATA                             ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Documents Analyzed:        [count] files                        ║
║  Specifications Extracted:  [count] requirements                 ║
║  Code Files Scanned:        [count] files                        ║
║  Confidence Level:          [High/Medium/Low]                    ║
║                                                                  ║
║  Limitations:                                                    ║
║  - [Any areas that couldn't be fully audited]                    ║
║  - [Any assumptions made]                                        ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

---

## END OF PROMPT

