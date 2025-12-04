# AI Tools Implementation Prompt
## Comprehensive Tool Inventory, Gap Analysis, and Implementation

**Purpose:** This prompt instructs an AI development tool to analyze the existing codebase, inventory all AI tool definitions, identify gaps based on new integration requirements, and implement missing tools following established patterns.

---

## PROMPT START

You are an expert AI systems architect working on an AI-first real estate wholesaling platform. Your task is to perform a comprehensive audit of the existing AI tool infrastructure, identify gaps based on new integration requirements, and implement all missing tools.

### PHASE 1: PROJECT DISCOVERY

First, thoroughly explore the project structure to understand the codebase:

```
1. Map the complete project structure:
   - Find the root directory and list all top-level folders
   - Identify the lib/ directory structure
   - Locate all AI-related code (lib/ai/, app/api/ai/, etc.)
   - Find all service files (lib/services/, lib/[provider]/, etc.)
   - Identify type definitions (types/, lib/*/types.ts, etc.)

2. Locate the Vercel AI SDK implementation:
   - Find where `ai` package is imported
   - Locate `tool()` function usage
   - Find `streamText`, `generateText`, `generateObject` usage
   - Identify the model configuration (Claude models)
   - Find the main chat API route (likely app/api/ai/chat/route.ts)

3. Identify existing tool patterns:
   - How are tools organized? (single file, multiple files, by domain?)
   - What naming conventions are used?
   - How are tools exported and combined?
   - What parameter validation patterns exist (Zod schemas)?
   - How do tools call underlying services?

4. Map data layer connections:
   - How do tools access Supabase?
   - How do tools call external APIs (RentCast, etc.)?
   - What caching patterns exist?
   - How is authentication handled in tools?
```

Execute these discovery steps and document your findings before proceeding.

---

### PHASE 2: EXISTING TOOL INVENTORY

Create a complete inventory of every AI tool currently defined in the project:

```
For EACH tool found, document:

1. Tool Metadata:
   - Tool name/identifier
   - File location
   - Description (from tool definition)
   
2. Parameters:
   - Complete Zod schema
   - Required vs optional parameters
   - Parameter descriptions
   
3. Return Type:
   - What data structure does it return?
   - What fields are included?
   
4. Dependencies:
   - What services does it call?
   - What database tables does it access?
   - What external APIs does it use?
   
5. Usage Context:
   - When should AI use this tool?
   - What user intents trigger this tool?
```

Create an inventory table in this format:

| Tool Name | Location | Category | Data Source | Description |
|-----------|----------|----------|-------------|-------------|
| searchProperties | lib/ai/tools/property-tools.ts | Property | RentCast | Search properties with filters |
| getPropertyDetails | lib/ai/tools/property-tools.ts | Property | RentCast | Get single property details |
| ... | ... | ... | ... | ... |

---

### PHASE 3: REQUIREMENTS ANALYSIS

Read and analyze the following specification documents to understand what new tools are needed:

1. **Shovels Integration Specification** (`shovels_integration_specification.md`)
   - What new data sources are being added?
   - What new capabilities does Shovels provide?
   - What filters require Shovels data?
   - What user queries would need Shovels tools?

2. **Master Platform Specification** (`AI_First_Wholesaling_Platform_DEFINITIVE_PLAN_v2.md`)
   - What tools were originally planned?
   - Are all planned tools implemented?
   - What tool categories exist?

3. **RentCast Integration Specification** (`rentcast_integration_specification_v2.md`)
   - What RentCast tools should exist?
   - Are all RentCast endpoints covered by tools?

Create a requirements matrix:

| Capability | Required Tools | Data Source | Status |
|------------|---------------|-------------|--------|
| Permit history lookup | getPermitHistory | Shovels | Missing |
| Vitality score calculation | getVitalityScore | Shovels | Missing |
| ... | ... | ... | ... |

---

### PHASE 4: GAP ANALYSIS

Compare existing tools against requirements to identify gaps:

```
1. Missing Tool Categories:
   - What entire categories of tools are missing?
   - Example: No Shovels tools exist yet
   
2. Missing Individual Tools:
   - What specific tools are needed but don't exist?
   - List each missing tool with its purpose
   
3. Incomplete Tools:
   - Which existing tools need enhancement?
   - What parameters should be added?
   - What return data is missing?
   
4. Integration Gaps:
   - Where do tools need to combine data sources?
   - What cross-service tools are needed?
   
5. AI Context Gaps:
   - What information does AI need but can't access?
   - What user questions can't be answered with current tools?
```

Create a prioritized gap list:

| Priority | Gap Type | Tool Name | Description | Complexity |
|----------|----------|-----------|-------------|------------|
| P0 | Missing | getPermitHistory | Core permit lookup | Medium |
| P0 | Missing | analyzePropertyCondition | Combine RentCast + Shovels | High |
| P1 | Enhancement | searchProperties | Add permit filter support | Medium |
| ... | ... | ... | ... | ... |

---

### PHASE 5: TOOL DESIGN

For each missing or incomplete tool, create a complete design specification:

```typescript
// Template for each tool design:

/**
 * Tool: [TOOL_NAME]
 * Category: [property | permits | contractors | analysis | market | buyers | etc.]
 * Data Sources: [RentCast, Shovels, Supabase, etc.]
 * Priority: [P0 | P1 | P2]
 * 
 * Purpose:
 * [Detailed description of what this tool does and when AI should use it]
 * 
 * User Intents (when AI should call this tool):
 * - "[Example user query 1]"
 * - "[Example user query 2]"
 * - "[Example user query 3]"
 * 
 * Parameters:
 * - param1 (required): Description
 * - param2 (optional): Description
 * 
 * Returns:
 * {
 *   field1: type,
 *   field2: type,
 *   ...
 * }
 * 
 * Implementation Notes:
 * - [Any special considerations]
 * - [Error handling requirements]
 * - [Caching strategy]
 * 
 * Dependencies:
 * - [Service function 1]
 * - [Service function 2]
 */
```

---

### PHASE 6: IMPLEMENTATION

Implement all missing tools following the established patterns. 

#### 6.1 Create Service Layer First

Before creating tools, ensure underlying services exist:

```typescript
// For each new data source, create:

// 1. Types file: lib/[source]/types.ts
// 2. Service file: lib/[source]/[source]-service.ts  
// 3. Any helper utilities needed

// Services must:
// - Handle authentication
// - Implement rate limiting
// - Implement caching (Redis + Supabase)
// - Return strongly typed responses
// - Handle errors gracefully
```

#### 6.2 Create Tool Files by Category

Organize tools into logical files:

```
lib/ai/tools/
├── index.ts                    # Exports all tools combined
├── property-tools.ts           # Property search, details, valuation
├── permit-tools.ts             # NEW: Shovels permit tools
├── contractor-tools.ts         # NEW: Shovels contractor tools  
├── analysis-tools.ts           # Deal analysis, motivation scoring
├── market-tools.ts             # Market data, vitality scores
├── buyer-tools.ts              # Buyer search, matching
├── filter-tools.ts             # Filter suggestions, applications
├── heatmap-tools.ts            # NEW: Heat map data tools
└── vertical-tools.ts           # NEW: Vertical-specific tools
```

#### 6.3 Tool Implementation Template

Follow this exact pattern for each tool:

```typescript
// lib/ai/tools/[category]-tools.ts

import { tool } from 'ai';
import { z } from 'zod';
import { [ServiceFunctions] } from '@/lib/[source]/[source]-service';
import { createClient } from '@/lib/supabase/server';

export const [category]Tools = {

  toolName: tool({
    description: `
      [Clear, detailed description that helps AI know when to use this tool]
      
      Use this tool when:
      - [Scenario 1]
      - [Scenario 2]
      
      Do NOT use this tool for:
      - [Anti-pattern 1]
    `,
    parameters: z.object({
      requiredParam: z.string().describe('Clear description of this parameter'),
      optionalParam: z.string().optional().describe('When to include this'),
      enumParam: z.enum(['option1', 'option2']).default('option1')
        .describe('What each option means'),
      objectParam: z.object({
        nested: z.string()
      }).optional().describe('Complex parameter explanation')
    }),
    execute: async (params) => {
      try {
        // 1. Validate/transform input
        const { requiredParam, optionalParam } = params;
        
        // 2. Call service layer
        const result = await someService(params);
        
        // 3. Transform for AI consumption
        return {
          success: true,
          data: transformForAI(result),
          summary: generateSummary(result),
          metadata: {
            count: result.length,
            timestamp: new Date().toISOString()
          }
        };
        
      } catch (error) {
        // 4. Handle errors gracefully
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          suggestion: 'Try with different parameters or check if data exists'
        };
      }
    }
  }),

  // ... more tools
};
```

#### 6.4 Combine All Tools

Create the master tools export:

```typescript
// lib/ai/tools/index.ts

import { propertyTools } from './property-tools';
import { permitTools } from './permit-tools';
import { contractorTools } from './contractor-tools';
import { analysisTools } from './analysis-tools';
import { marketTools } from './market-tools';
import { buyerTools } from './buyer-tools';
import { filterTools } from './filter-tools';
import { heatmapTools } from './heatmap-tools';
import { verticalTools } from './vertical-tools';

// Combined tools object for AI SDK
export const allTools = {
  ...propertyTools,
  ...permitTools,
  ...contractorTools,
  ...analysisTools,
  ...marketTools,
  ...buyerTools,
  ...filterTools,
  ...heatmapTools,
  ...verticalTools
};

// Export individual categories for selective use
export {
  propertyTools,
  permitTools,
  contractorTools,
  analysisTools,
  marketTools,
  buyerTools,
  filterTools,
  heatmapTools,
  verticalTools
};

// Tool metadata for documentation/introspection
export const toolRegistry = {
  property: Object.keys(propertyTools),
  permits: Object.keys(permitTools),
  contractors: Object.keys(contractorTools),
  analysis: Object.keys(analysisTools),
  market: Object.keys(marketTools),
  buyers: Object.keys(buyerTools),
  filters: Object.keys(filterTools),
  heatmap: Object.keys(heatmapTools),
  verticals: Object.keys(verticalTools)
};
```

---

### PHASE 7: REQUIRED TOOLS CHECKLIST

Implement ALL of the following tools. Check each off as you complete it:

#### Property Tools (RentCast)
- [ ] `searchProperties` - Search properties with filters and natural language
- [ ] `getPropertyDetails` - Get complete details for a single property
- [ ] `getPropertyValuation` - Get AVM estimate for a property
- [ ] `getRentEstimate` - Get rent estimate for a property
- [ ] `getComparables` - Get comparable sales for a property
- [ ] `getOwnerInfo` - Get owner details for a property
- [ ] `getTransactionHistory` - Get sale history for a property

#### Permit Tools (Shovels) - NEW
- [ ] `getPermitHistory` - Get all permits for a property
- [ ] `getPermitDetails` - Get details for a specific permit
- [ ] `searchPermitsByArea` - Search permits in a geographic area
- [ ] `getPermitMetrics` - Get aggregated permit metrics for an address
- [ ] `analyzePermitPatterns` - Analyze permit history for motivation signals
- [ ] `checkSystemAge` - Check age of major systems (roof, HVAC, etc.)
- [ ] `identifyDeferredMaintenance` - Find properties with deferred maintenance
- [ ] `findStalledPermits` - Find properties with stalled/expired permits

#### Contractor Tools (Shovels) - NEW
- [ ] `searchContractors` - Find contractors by location and specialty
- [ ] `getContractorDetails` - Get contractor performance metrics
- [ ] `getContractorHistory` - Get permit history for a contractor
- [ ] `compareContractors` - Compare multiple contractors
- [ ] `findTopContractors` - Find highest-rated contractors in area

#### Analysis Tools (Combined)
- [ ] `analyzeDeal` - Complete deal analysis with ARV, equity, cash flow
- [ ] `calculateMotivationScore` - Score seller motivation (combined signals)
- [ ] `assessPropertyCondition` - Assess condition from permits + age
- [ ] `estimateRepairCosts` - Estimate repairs based on permit history
- [ ] `compareToComps` - Compare property to recent sales
- [ ] `analyzeInvestmentPotential` - Full investment analysis

#### Market Tools (RentCast + Shovels)
- [ ] `getMarketStatistics` - Get market stats for a zip/city
- [ ] `getVitalityScore` - Calculate neighborhood vitality score
- [ ] `getMarketTrends` - Get price/rent trends over time
- [ ] `compareMarkets` - Compare multiple markets
- [ ] `getPermitActivityTrends` - Get permit activity trends for area

#### Heat Map Tools - NEW
- [ ] `getHeatMapData` - Get data for specific heat map layer
- [ ] `getVitalityHeatMap` - Get vitality scores for map visualization
- [ ] `getPermitActivityHeatMap` - Get permit density for map
- [ ] `getRenovationWaveHeatMap` - Get improvement permit hotspots
- [ ] `getElectrificationHeatMap` - Get solar/EV/heat pump adoption

#### Buyer Tools
- [ ] `searchBuyers` - Search buyer database with filters
- [ ] `matchBuyersToProperty` - Find buyers matching property criteria
- [ ] `getBuyerDetails` - Get buyer profile and preferences
- [ ] `getBuyerActivity` - Get buyer's purchase history
- [ ] `analyzeBuyerFit` - Score buyer fit for specific property

#### Filter Tools
- [ ] `suggestFilters` - Suggest filters based on user query
- [ ] `explainFilter` - Explain what a filter does
- [ ] `getFilterOptions` - Get available filter options
- [ ] `applyContrarianFilter` - Apply a contrarian filter
- [ ] `combineFilters` - Combine multiple filters intelligently

#### Vertical Tools - NEW
- [ ] `getActiveVertical` - Get user's current vertical
- [ ] `switchVertical` - Change active vertical
- [ ] `getVerticalFilters` - Get filters for current vertical
- [ ] `getVerticalInsights` - Get vertical-specific insights for property

#### Utility Tools
- [ ] `geocodeAddress` - Convert address to coordinates
- [ ] `reverseGeocode` - Convert coordinates to address
- [ ] `formatCurrency` - Format numbers as currency
- [ ] `calculateDistance` - Calculate distance between points
- [ ] `getSkipTraceData` - Get contact info for property owner

---

### PHASE 8: INTEGRATION TESTING

After implementing tools, verify they work correctly:

```typescript
// Test each tool category:

1. Unit Tests:
   - Each tool returns expected structure
   - Error handling works correctly
   - Parameters validate properly
   
2. Integration Tests:
   - Tools correctly call services
   - Data flows through properly
   - Caching works as expected
   
3. AI Integration Tests:
   - AI correctly selects tools based on user intent
   - Tool descriptions are clear enough for AI
   - Tool results are usable by AI for responses
   
4. End-to-End Tests:
   - User query → AI → Tool → Service → API → Response
   - Multi-tool scenarios work correctly
   - Context is maintained across tool calls
```

---

### PHASE 9: DOCUMENTATION

Create comprehensive documentation:

```markdown
# AI Tools Reference

## Overview
[Brief description of the AI tools system]

## Tool Categories

### Property Tools
[List each tool with description, parameters, and examples]

### Permit Tools
[List each tool with description, parameters, and examples]

[... etc for each category ...]

## Usage Examples

### Example 1: Property Search
User: "Find 3 bedroom houses in Tampa with tired landlords"
Tools Used: suggestFilters → searchProperties
[Show the flow]

### Example 2: Deal Analysis
User: "Analyze this property at 123 Main St"
Tools Used: getPropertyDetails → getPermitHistory → analyzeDeal
[Show the flow]

[... more examples ...]

## Adding New Tools
[Instructions for adding new tools following the patterns]
```

---

### PHASE 10: FINAL VERIFICATION

Before completing, verify:

```
□ All tools from checklist are implemented
□ All tools follow the established patterns
□ All tools have clear descriptions for AI
□ All tools have proper error handling
□ All tools are exported in index.ts
□ All underlying services exist and work
□ Tool registry is complete and accurate
□ Documentation is comprehensive
□ No TypeScript errors
□ No linting errors
```

---

## EXECUTION INSTRUCTIONS

1. **Start with Phase 1** - You cannot skip project discovery
2. **Be thorough in Phase 2** - Missing existing tools causes duplicate work
3. **Cross-reference in Phase 3** - Read ALL specification documents
4. **Be comprehensive in Phase 4** - Every gap must be identified
5. **Design before implementing** - Phase 5 prevents rework
6. **Follow patterns exactly** - Consistency is critical
7. **Complete the checklist** - Every tool must be implemented
8. **Test as you go** - Don't wait until the end
9. **Document everything** - Future developers need this
10. **Verify before declaring done** - Use the final checklist

## OUTPUT EXPECTATIONS

At the end of this process, you should have:

1. **Inventory Document**: Complete list of all existing tools
2. **Gap Analysis Document**: All missing/incomplete tools identified
3. **Implementation**: All new tool files created and working
4. **Updated Index**: Master export file with all tools
5. **Documentation**: Complete tools reference guide
6. **Test Results**: Verification that all tools work

---

## PROMPT END