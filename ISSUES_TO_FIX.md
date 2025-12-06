# Pre-Testing Issues & Fixes Required

**Generated:** December 5, 2025
**Priority Levels:** CRITICAL (blocks testing), HIGH (should fix before testing), MEDIUM (fix during testing), LOW (technical debt)

---

## Executive Summary

| Category | Count | Priority |
|----------|-------|----------|
| Duplicate Files (to delete) | 118+ in src/ | CRITICAL |
| TypeScript Errors | 68+ | CRITICAL |
| Missing Dependencies | 1 | CRITICAL |
| Database Schema Mismatch | 2 tables | HIGH |
| Mock Data in Production Code | 3 pages | HIGH |
| Incomplete TODO Items | 7 | MEDIUM |
| API Consistency Issues | 12+ routes | MEDIUM |
| Type Safety (as any) | 4+ files | MEDIUM |

---

## CRITICAL Issues (Must Fix Before Testing)

### 1. Delete 118+ Duplicate Files in src/

**Problem:** There are 118+ duplicate files with " 2" suffix that cause TypeScript errors and confusion.

**Files to Delete (sample):**
```
src/app/(dashboard)/team/page 2.tsx
src/app/(dashboard)/deals/[id]/page 2.tsx
src/app/(dashboard)/leads/leads-client 2.tsx
src/components/ai/AIContextBar 2.tsx
src/components/ai/QuickActions 2.tsx
src/components/buyers/BuyerForm 2.tsx
src/components/deals/ActivityTimeline 2.tsx
src/lib/shovels/cache 2.ts
src/lib/rag/cache 2.ts
... (and 100+ more)
```

**Fix Command:**
```bash
# Preview files to delete
find src -name "* 2.*" -type f

# Delete all duplicate files
find src -name "* 2.*" -type f -delete

# Also check knowledge-base and scripts
find knowledge-base -name "* 2.md" -type f -delete
find scripts -name "* 2.ts" -type f -delete
```

---

### 2. Missing Radix UI Dependency

**File:** `src/components/ui/collapsible.tsx:9`
**Error:** `Cannot find module '@radix-ui/react-collapsible'`

**Fix:**
```bash
npm install @radix-ui/react-collapsible
```

---

### 3. TypeScript Errors - Must Fix

#### 3.1 ZodError Property Access (5 files)

**Problem:** Using `.errors` instead of `.issues` on ZodError

**Files:**
- `src/app/api/market-velocity/area/route.ts:35`
- `src/app/api/market-velocity/compare/route.ts:28`
- `src/app/api/market-velocity/heatmap/route.ts:52`
- `src/app/api/market-velocity/rankings/route.ts:35`
- `src/app/api/market-velocity/trend/[zipCode]/route.ts:44`

**Fix:** Change `.errors` to `.issues`:
```typescript
// Before
return NextResponse.json({ error: 'Invalid parameters', details: validation.error.errors }, { status: 400 });

// After
return NextResponse.json({ error: 'Invalid parameters', details: validation.error.issues }, { status: 400 });
```

#### 3.2 FilterId Type Mismatch (12 errors)

**File:** `src/hooks/useFilterSuggestions.ts`

**Problem:** Using hyphens instead of underscores in FilterId values

**Fix:** Replace all hyphenated filter IDs with underscored versions:
```typescript
// Wrong
'distressed-owner', 'long-term-owner', 'absentee-owner', 'tax-delinquent',
'high-equity', 'vacant-property', 'below-market-rent', 'code-violations',
'long-term-tenant', 'low-property-taxes'

// Correct
'distressed_owner', 'long_term_owner', 'absentee_owner', 'tax_delinquent',
'high_equity', 'vacant_property', 'below_market_rent', 'code_violations',
'long_term_tenant', 'low_property_taxes'
```

#### 3.3 Database Schema Mismatch

**File:** `src/app/api/properties/[id]/motivation/route.ts`

**Problems:**
1. Line 58: Column `formatted_address` doesn't exist on `shovels_address_metrics`
2. Line 113: Table `motivation_scores` not in Supabase generated types

**Fix Options:**
- Option A: Add missing columns/tables to migration and regenerate types
- Option B: Remove references to non-existent schema elements
- Option C: Mark as TODO and skip in tests for now

**Regenerate types:**
```bash
npx supabase gen types typescript --project-id $SUPABASE_PROJECT_REF > src/types/database.ts
```

#### 3.4 EnhancedChatInterface Type Errors

**File:** `src/components/ai/EnhancedChatInterface.tsx`

**Errors:**
- Line 74: `setInputValue` called with function instead of string
- Line 191: Accessing `.enhanced` on string type
- Line 207: Using undefined as index type

**Fix:** Review and correct the prompt enhancement logic type handling.

#### 3.5 AIToolPalette Undefined Checks

**File:** `src/components/ai/AIToolPalette.tsx`

**Error:** Line 480-481: `cat` is possibly undefined

**Fix:** Add null checks:
```typescript
// Before
cat.name
cat.tools

// After
cat?.name ?? ''
cat?.tools ?? []
```

#### 3.6 ToolWorkflows Missing Property

**File:** `src/components/ai/ToolWorkflows.tsx`

**Error:** Line 96: Missing `is_public` property

**Fix:** Add the required property:
```typescript
{
  name: string;
  description: string;
  tool_slugs: string[];
  step_prompts: Record<string, string>;
  is_public: false  // Add this
}
```

#### 3.7 QuickActions Missing View Types

**File:** `src/components/ai/QuickActions 2.tsx` (and QuickActions.tsx if same issue)

**Error:** Missing properties for ViewType record

**Fix:** Add all required view types to the quick actions record.

#### 3.8 AI Tools Page Type Errors

**File:** `src/app/(dashboard)/help/ai-tools/page.tsx`

**Errors:** Multiple - AIToolDoc array/string type confusion

**Fix:** Review the tool documentation data structure and type definitions.

---

## HIGH Priority Issues

### 4. Mock Data in Production Code

#### 4.1 Team Page Uses Mock Data

**File:** `src/app/(dashboard)/team/page.tsx:10-11`

```typescript
// Mock team data - will be replaced with real API data
const mockTeamMembers = [...]
```

**Fix:** Implement actual API call to `/api/teams` endpoint.

#### 4.2 Property Search Uses Mock Data

**File:** `src/app/(dashboard)/properties/search-client.tsx:14-15`

```typescript
// Mock data for demonstration - in production this would come from API/database
const MOCK_PROPERTIES: PropertyData[] = [...]
```

**Fix:** Implement actual API call to property search endpoint.

---

### 5. Skip Trace Tools Return Mock Data

**Files:**
- `src/lib/ai/tools/categories/skip-trace-tools.ts`
- `src/lib/ai/tools/categories/batch-tools.ts`

**Affected handlers:**
- `skipTraceLeadHandler` - Returns mock phone/email data
- `skipTraceBulkHandler` - Returns mock job ID
- `findRelatedHandler` - Returns empty array
- `reversePhoneHandler` - Returns `found: false`
- `reverseAddressHandler` - Returns `found: false`

**Note:** Per codebase comments, this is intentional as skip trace requires paid external API. Mark these handlers for integration testing skip or mock appropriately.

---

## MEDIUM Priority Issues

### 6. TODO Items to Implement

| File | Line | TODO |
|------|------|------|
| `src/app/(dashboard)/team/page.tsx` | 84 | Invite modal |
| `src/app/settings/account/AccountActions.tsx` | 39 | Data export |
| `src/app/(dashboard)/properties/search-client.tsx` | 121 | Property navigation |
| `src/lib/jobs/calculate-velocity-indexes.ts` | 250-251 | County/state aggregates |
| `src/app/api/user/delete/route.ts` | 54-55 | Confirmation email, subscription cancellation |
| `src/app/api/teams/[teamId]/invite/route.ts` | 55 | Invitation email |
| `src/lib/communication/twilio.ts` | 328 | Redis rate limiting |

---

### 7. API Route Consistency Issues

#### 7.1 Validation Inconsistency

**Problem:** Some routes use `.parse()` (throws), others use `.safeParse()` (returns result)

**Files to fix:**
- `src/app/api/leads/route.ts` - Use `.safeParse()`
- `src/app/api/leads/[id]/route.ts` - Use `.safeParse()`

**Standard pattern:**
```typescript
const validation = schema.safeParse(body);
if (!validation.success) {
  return NextResponse.json({
    error: 'Validation failed',
    details: validation.error.issues
  }, { status: 400 });
}
```

#### 7.2 Inconsistent Response Formats

**Issue:** Different routes use different response wrappers

**Current patterns:**
- Direct: `return NextResponse.json(lead)`
- Wrapped: `return NextResponse.json({ deal })`
- Meta: `return NextResponse.json({ data, meta })`

**Recommendation:** Standardize on wrapped format:
```typescript
return NextResponse.json({
  data: result,
  meta: { cached, count, etc }
});
```

#### 7.3 Silent Webhook Failures

**Files:**
- `src/app/api/webhooks/sendgrid/route.ts:21`
- `src/app/api/webhooks/twilio/route.ts:25`

**Problem:** Return 200 success when service not configured (misleading)

**Fix:** Return 503 Service Unavailable or log warning.

---

### 8. Type Safety Issues (as any)

**Files with unsafe casts:**
- `src/app/api/teams/route.ts:18` - Auth type assertion
- `src/app/api/analytics/dashboard/route.ts:20` - Supabase query
- `src/app/api/recommendations/route.ts:31,53` - Database queries
- `src/lib/analytics/aggregation.ts` - Multiple Supabase casts

**Fix:** Use proper TypeScript types instead of `as any`.

---

## LOW Priority (Technical Debt)

### 9. Hardcoded Configuration Values

Values that should be environment variables or constants:

| File | Value | Recommended Constant |
|------|-------|---------------------|
| Multiple API routes | `25`, `50`, `100` | `DEFAULT_PAGE_SIZE`, `MAX_PAGE_SIZE` |
| `motivation/route.ts:76` | `3600` | `MOTIVATION_CACHE_TTL` |
| `rag/ask/route.ts:29-30` | `2000`, `3` | `MAX_QUERY_LENGTH`, `MIN_QUERY_LENGTH` |
| `enhance-prompt/route.ts:40` | `500` | `MAX_AI_TOKENS` |

### 10. Unused Imports (Linting)

Multiple files have unused imports that should be removed:
- `src/app/(dashboard)/help/ai-tools/page.tsx:15` - ScrollArea
- `src/app/(dashboard)/properties/[id]/property-detail-client.tsx:54` - MotivationScoreBadge
- `src/components/ai/EmptyChatState.tsx:20` - getFeaturedTools
- `src/components/ai/ToolTransparency.tsx:11` - Button
- `src/components/ai/ToolWorkflows.tsx:83` - handleReorderTool
- `src/components/motivation/MotivationScoreBadge.tsx:97` - level
- `src/components/motivation/MotivationScoreCard.tsx:14` - Progress

---

## Recommended Fix Order

### Phase 1: Critical (Do First)
1. Delete all 118+ duplicate " 2" files
2. Install missing @radix-ui/react-collapsible
3. Fix ZodError `.errors` → `.issues`
4. Fix FilterId hyphen → underscore
5. Regenerate Supabase types

### Phase 2: High Priority
1. Fix TypeScript errors in components
2. Replace mock data with API calls (team, properties)
3. Add null checks in AIToolPalette

### Phase 3: Medium Priority
1. Standardize API validation to `.safeParse()`
2. Fix webhook silent failures
3. Remove `as any` type assertions
4. Implement key TODO items

### Phase 4: Low Priority
1. Extract hardcoded values to config
2. Remove unused imports
3. Standardize response formats

---

## Quick Fix Script

Run this to fix the most critical issues:

```bash
#!/bin/bash

# 1. Delete duplicate files
find src -name "* 2.*" -type f -delete
find knowledge-base -name "* 2.md" -type f -delete
find scripts -name "* 2.ts" -type f -delete

# 2. Install missing dependency
npm install @radix-ui/react-collapsible

# 3. Regenerate Supabase types
npx supabase gen types typescript --project-id $SUPABASE_PROJECT_REF > src/types/database.ts

# 4. Run TypeScript to see remaining errors
npx tsc --noEmit
```

---

## Estimated Fix Time

| Category | Estimated Time |
|----------|---------------|
| Delete duplicates + install deps | 5 minutes |
| Fix TypeScript errors | 1-2 hours |
| Replace mock data with APIs | 2-3 hours |
| API consistency fixes | 2-3 hours |
| TODO implementations | 4-8 hours |
| **Total** | **9-16 hours** |

---

*End of Issues Report*
