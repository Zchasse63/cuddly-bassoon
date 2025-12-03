# Comprehensive Remediation Plan
## AI-First Real Estate Wholesaling Platform
### Based on Audit Report: December 3, 2025

---

## Executive Overview

| Metric | Value |
|--------|-------|
| Total Gaps to Fix | 17 |
| TypeScript Errors | 135 in 42 files |
| Implementation Waves | 4 |
| Total Estimated Time | 7-8 hours |
| Target Outcome | 0 errors, 100% compliance |

---

## Pre-Implementation Setup

### Required Tools
```bash
# Ensure Node.js and npm are up to date
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher

# Ensure shadcn/ui CLI is available
npx shadcn@latest --help
```

### Environment Preparation
```bash
# Navigate to project root
cd /Users/zach/Desktop/cuddly-bassoon

# Ensure dependencies are installed
npm install

# Verify current error count (should show 135 errors)
npm run type-check 2>&1 | tail -5
```

### Backup Recommendation
```bash
# Create a backup branch before starting
git checkout -b pre-remediation-backup
git add -A
git commit -m "Backup before remediation plan execution"
git checkout main
```

---

## Implementation Waves Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│ WAVE 1: BUILD BLOCKERS (Critical UI Components)          ~45 min   │
│ ├── GAP-001: Add checkbox component                                │
│ ├── GAP-002: Add switch component                                  │
│ ├── GAP-003: Add slider component                                  │
│ ├── GAP-004: Add alert component                                   │
│ ├── GAP-005: Add alert-dialog component                            │
│ ├── GAP-006: Create use-toast hook                                 │
│ └── GAP-018: Export createBrowserClient                            │
├─────────────────────────────────────────────────────────────────────┤
│ WAVE 2: SCHEMA ALIGNMENT (Database & Types)              ~3.5 hrs  │
│ ├── GAP-007: Fix deals.buyer_id references                         │
│ ├── GAP-008: Fix deals.closed_at references                        │
│ ├── GAP-009: Fix properties.zip_code references                    │
│ ├── GAP-010: Fix properties.price references                       │
│ ├── GAP-011: Fix teams table type mismatches                       │
│ ├── GAP-012: Fix user_profiles.onboarding_completed                │
│ ├── GAP-013: Fix campaigns table column references                 │
│ ├── GAP-014: Handle team_invitations table                         │
│ └── GAP-015: Add analytics ViewTypes                               │
├─────────────────────────────────────────────────────────────────────┤
│ WAVE 3: CODE QUALITY (Null Safety & Cleanup)             ~2.5 hrs  │
│ ├── GAP-017: Fix null safety issues                                │
│ └── GAP-016: Remove unused imports                                 │
├─────────────────────────────────────────────────────────────────────┤
│ WAVE 4: DOCUMENTATION (Update Phase Docs)                ~1 hr     │
│ └── GAP-020: Update phase documentation status                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## WAVE 1: BUILD BLOCKERS (~45 minutes)

### Progress Checklist
- [ ] GAP-001: Checkbox component
- [ ] GAP-002: Switch component
- [ ] GAP-003: Slider component
- [ ] GAP-004: Alert component
- [ ] GAP-005: Alert-dialog component
- [ ] GAP-006: use-toast hook
- [ ] GAP-018: createBrowserClient export

---

### GAP-001: Missing Checkbox Component

**Audit Reference**: `@/components/ui/checkbox` not found
**Severity**: CRITICAL
**Affected Files**:
- `src/app/(auth)/login/page.tsx:12`
- `src/app/(auth)/signup/page.tsx:12`

**Root Cause**: shadcn/ui checkbox component was never installed

**Fix Command**:
```bash
npx shadcn@latest add checkbox
```

**Expected Result**: Creates `src/components/ui/checkbox.tsx`

**Verification**:
```bash
ls -la src/components/ui/checkbox.tsx
npm run type-check 2>&1 | grep -c "checkbox"  # Should be 0
```

**Estimated Time**: 2 minutes
**Dependencies**: None

---

### GAP-002: Missing Switch Component

**Audit Reference**: `@/components/ui/switch` not found
**Severity**: CRITICAL
**Affected Files**:
- `src/app/settings/notifications/NotificationsForm.tsx:8`
- `src/components/heatmap/HeatMapControls.tsx:6`

**Root Cause**: shadcn/ui switch component was never installed

**Fix Command**:
```bash
npx shadcn@latest add switch
```

**Expected Result**: Creates `src/components/ui/switch.tsx`

**Verification**:
```bash
ls -la src/components/ui/switch.tsx
npm run type-check 2>&1 | grep -c "switch"  # Should be 0
```

**Estimated Time**: 2 minutes
**Dependencies**: None

---

### GAP-003: Missing Slider Component

**Audit Reference**: `@/components/ui/slider` not found
**Severity**: CRITICAL
**Affected Files**:
- `src/components/heatmap/HeatMapControls.tsx:7`

**Root Cause**: shadcn/ui slider component was never installed

**Fix Command**:
```bash
npx shadcn@latest add slider
```

**Expected Result**: Creates `src/components/ui/slider.tsx`

**Verification**:
```bash
ls -la src/components/ui/slider.tsx
npm run type-check 2>&1 | grep -c "slider"  # Should be 0
```

**Estimated Time**: 2 minutes
**Dependencies**: None

---

### GAP-004: Missing Alert Component

**Audit Reference**: `@/components/ui/alert` not found
**Severity**: CRITICAL
**Affected Files**:
- `src/app/(dashboard)/settings/account/page.tsx:7`

**Root Cause**: shadcn/ui alert component was never installed

**Fix Command**:
```bash
npx shadcn@latest add alert
```

**Expected Result**: Creates `src/components/ui/alert.tsx`

**Verification**:
```bash
ls -la src/components/ui/alert.tsx
npm run type-check 2>&1 | grep -c "\"alert\""  # Should be 0
```

**Estimated Time**: 2 minutes
**Dependencies**: None

---

### GAP-005: Missing Alert-Dialog Component

**Audit Reference**: `@/components/ui/alert-dialog` not found
**Severity**: CRITICAL
**Affected Files**:
- `src/components/navigation/LogoutButton.tsx:6`

**Root Cause**: shadcn/ui alert-dialog component was never installed

**Fix Command**:
```bash
npx shadcn@latest add alert-dialog
```

**Expected Result**: Creates `src/components/ui/alert-dialog.tsx`

**Verification**:
```bash
ls -la src/components/ui/alert-dialog.tsx
npm run type-check 2>&1 | grep -c "alert-dialog"  # Should be 0
```

**Estimated Time**: 2 minutes
**Dependencies**: None

---

### GAP-006: Missing use-toast Hook

**Audit Reference**: `@/hooks/use-toast` not found
**Severity**: HIGH
**Affected Files**:
- `src/app/(dashboard)/settings/profile/page.tsx:8`
- `src/app/(dashboard)/settings/security/page.tsx:8`
- `src/app/(dashboard)/settings/preferences/page.tsx:5`
- `src/app/(dashboard)/settings/team/page.tsx:5`
- `src/app/(dashboard)/onboarding/page.tsx:8`
- `src/components/settings/ProfileForm.tsx:4`
- `src/components/settings/SecurityForm.tsx:4`

**Root Cause**: Toast hook not created. Codebase uses Sonner for toasts but some files import a non-existent hook.

**Fix - Create the Hook**:

Create new file: `src/hooks/use-toast.ts`

```typescript
import { toast as sonnerToast } from "sonner"

export interface ToastProps {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

export function useToast() {
  const toast = ({ title, description, variant }: ToastProps) => {
    if (variant === "destructive") {
      sonnerToast.error(title, { description })
    } else {
      sonnerToast.success(title, { description })
    }
  }

  return { toast }
}

export { sonnerToast as toast }
```

**Verification**:
```bash
ls -la src/hooks/use-toast.ts
npm run type-check 2>&1 | grep -c "use-toast"  # Should be 0
```

**Estimated Time**: 15 minutes
**Dependencies**: None

---

### GAP-018: createBrowserClient Not Exported

**Audit Reference**: `createBrowserClient` is not exported from `@/lib/supabase/client`
**Severity**: HIGH
**Affected Files**:
- `src/app/(dashboard)/settings/profile/page.tsx:4`
- `src/app/(dashboard)/settings/security/page.tsx:4`

**Root Cause**: The Supabase client module doesn't export this function

**Fix - Add Export to Supabase Client**:

Modify `src/lib/supabase/client.ts` to add the export:

```typescript
import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr"

export function createBrowserClient() {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Verification**:
```bash
npm run type-check 2>&1 | grep "createBrowserClient"  # Should be empty
```

**Estimated Time**: 5 minutes
**Dependencies**: None

---

## WAVE 1 COMPLETION CHECKPOINT

After completing all Wave 1 fixes:

```bash
# Verify all components exist
ls -la src/components/ui/checkbox.tsx
ls -la src/components/ui/switch.tsx
ls -la src/components/ui/slider.tsx
ls -la src/components/ui/alert.tsx
ls -la src/components/ui/alert-dialog.tsx

# Verify hook exists
ls -la src/hooks/use-toast.ts

# Run type check - errors should drop significantly
npm run type-check 2>&1 | tail -5
```

**Expected Error Reduction**: 135 → ~80-90 errors

---

## WAVE 2: SCHEMA ALIGNMENT (~3.5 hours)

### Progress Checklist
- [ ] GAP-007: deals.buyer_id
- [ ] GAP-008: deals.closed_at
- [ ] GAP-009: properties.zip_code
- [ ] GAP-010: properties.price
- [ ] GAP-011: teams table columns
- [ ] GAP-012: user_profiles.onboarding_completed
- [ ] GAP-013: campaigns table columns
- [ ] GAP-014: team_invitations table
- [ ] GAP-015: Analytics ViewTypes

---

### GAP-007: deals.buyer_id Column Missing

**Audit Reference**: Code references `buyer_id` on deals table but column doesn't exist
**Severity**: CRITICAL
**Affected Files**:
- `src/app/api/analytics/buyers/route.ts`

**Root Cause**: Database schema doesn't have buyer_id column on deals table

**Fix Option A - Database Migration (Recommended)**:

Run in Supabase SQL Editor:
```sql
ALTER TABLE deals ADD COLUMN buyer_id UUID REFERENCES buyers(id);
CREATE INDEX idx_deals_buyer_id ON deals(buyer_id);
```

Then regenerate types:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/database.types.ts
```

**Fix Option B - Update Code**:

If buyer relationship exists differently, update the analytics query to use the correct join.

**Verification**:
```bash
npm run type-check 2>&1 | grep "buyer_id"  # Should be empty
```

**Estimated Time**: 30 minutes
**Dependencies**: Supabase access

---

### GAP-008: deals.closed_at Column Missing

**Audit Reference**: Code references `closed_at` on deals table but column doesn't exist
**Severity**: CRITICAL
**Affected Files**:
- `src/app/api/analytics/deals/route.ts`

**Root Cause**: Database schema uses different column name or doesn't track close date

**Fix Option A - Database Migration**:
```sql
ALTER TABLE deals ADD COLUMN closed_at TIMESTAMPTZ;
CREATE INDEX idx_deals_closed_at ON deals(closed_at);
```

**Fix Option B - Use Existing Column**:
If `updated_at` or status-based tracking exists, update the analytics code accordingly.

**Verification**:
```bash
npm run type-check 2>&1 | grep "closed_at"  # Should be empty
```

**Estimated Time**: 30 minutes
**Dependencies**: GAP-007 should be resolved first

---

### GAP-009: properties.zip_code Column Missing

**Audit Reference**: Code references `zip_code` on properties table but column doesn't exist
**Severity**: HIGH
**Affected Files**:
- `src/app/api/analytics/markets/route.ts`

**Root Cause**: Properties table may use `zip` instead of `zip_code`

**Analysis First**: Check the actual column name in database.types.ts:
```bash
grep -n "zip" src/lib/supabase/database.types.ts | head -20
```

**Fix - Update Code to Use Correct Column**:

Modify `src/app/api/analytics/markets/route.ts`:
```typescript
// Replace: .select('zip_code')
// With: .select('zip')  // or whatever the actual column name is
```

**Verification**:
```bash
npm run type-check 2>&1 | grep "zip_code"  # Should be empty
```

**Estimated Time**: 15 minutes
**Dependencies**: None

---

### GAP-010: properties.price Column Missing

**Audit Reference**: Code references `price` on properties table but column doesn't exist
**Severity**: HIGH
**Affected Files**:
- `src/app/api/analytics/markets/route.ts`

**Root Cause**: Properties table may use `asking_price` or `list_price` instead of `price`

**Analysis First**: Check available price columns:
```bash
grep -n "price" src/lib/supabase/database.types.ts | head -30
```

**Fix - Update Code to Use Correct Column**:

Modify `src/app/api/analytics/markets/route.ts`:
```typescript
// Replace: .select('price')
// With: .select('asking_price')  // or 'list_price'
```

**Verification**:
```bash
npm run type-check 2>&1 | grep "properties.*price"  # Context-specific check
```

**Estimated Time**: 15 minutes
**Dependencies**: None

---

### GAP-011: teams Table Type Mismatches

**Audit Reference**: Teams table missing `subscription_tier`, `max_members` columns
**Severity**: HIGH
**Affected Files**:
- `src/lib/team/team-service.ts`

**Root Cause**: Code expects columns that don't exist in schema

**Fix Option A - Database Migration**:
```sql
ALTER TABLE teams ADD COLUMN subscription_tier VARCHAR(50) DEFAULT 'free';
ALTER TABLE teams ADD COLUMN max_members INTEGER DEFAULT 5;
```

**Fix Option B - Update Code**:
Remove references to these columns or make them optional in the code.

**Verification**:
```bash
npm run type-check 2>&1 | grep "subscription_tier\|max_members"
```

**Estimated Time**: 30 minutes
**Dependencies**: Supabase access

---

### GAP-012: user_profiles.onboarding_completed Missing

**Audit Reference**: Code references `onboarding_completed` on user_profiles but column doesn't exist
**Severity**: HIGH
**Affected Files**:
- `src/app/(dashboard)/onboarding/page.tsx`

**Root Cause**: Onboarding status tracking column not added to user_profiles

**Fix - Database Migration**:
```sql
ALTER TABLE user_profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE user_profiles ADD COLUMN onboarding_step INTEGER DEFAULT 0;
```

Then regenerate types.

**Verification**:
```bash
npm run type-check 2>&1 | grep "onboarding_completed"
```

**Estimated Time**: 15 minutes
**Dependencies**: Supabase access

---

### GAP-013: campaigns Table Column Mismatches

**Audit Reference**: Campaigns table missing `type`, `sent_count`, `opened_count`, `responded_count`
**Severity**: HIGH
**Affected Files**:
- `src/app/api/analytics/communications/route.ts`

**Root Cause**: Analytics code expects metrics columns that don't exist

**Fix - Database Migration**:
```sql
ALTER TABLE campaigns ADD COLUMN type VARCHAR(50);
ALTER TABLE campaigns ADD COLUMN sent_count INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN opened_count INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN responded_count INTEGER DEFAULT 0;
ALTER TABLE campaigns ADD COLUMN click_count INTEGER DEFAULT 0;
```

**Verification**:
```bash
npm run type-check 2>&1 | grep "sent_count\|opened_count"
```

**Estimated Time**: 30 minutes
**Dependencies**: Supabase access

---

### GAP-014: team_invitations Table Missing

**Audit Reference**: `team_invitations` table used in code but doesn't exist in database
**Severity**: CRITICAL
**Affected Files**:
- `src/lib/team/team-service.ts`

**Root Cause**: Table was never created in database

**Fix - Database Migration**:
```sql
CREATE TABLE team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  token VARCHAR(255) NOT NULL UNIQUE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);
CREATE INDEX idx_team_invitations_token ON team_invitations(token);

-- RLS Policies
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view invitations"
  ON team_invitations FOR SELECT
  USING (team_id IN (
    SELECT team_id FROM team_members WHERE user_id = auth.uid()
  ));

CREATE POLICY "Team admins can manage invitations"
  ON team_invitations FOR ALL
  USING (team_id IN (
    SELECT team_id FROM team_members
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
  ));
```

Then regenerate types.

**Verification**:
```bash
npm run type-check 2>&1 | grep "team_invitations"
```

**Estimated Time**: 45 minutes
**Dependencies**: Supabase access

---

### GAP-015: Analytics ViewTypes Missing

**Audit Reference**: ViewType missing analytics subtypes
**Severity**: MEDIUM
**Affected Files**:
- `src/hooks/usePageContext.ts`
- All analytics pages

**Root Cause**: ViewType union doesn't include analytics-specific types

**Fix - Update usePageContext.ts**:

```typescript
// In src/hooks/usePageContext.ts, update the ViewType union:

export type ViewType =
  | 'dashboard'
  | 'properties'
  | 'property-detail'
  | 'search'
  | 'buyers'
  | 'buyer-detail'
  | 'deals'
  | 'deal-detail'
  | 'documents'
  | 'analytics'
  | 'analytics-buyers'      // ADD
  | 'analytics-communications'  // ADD
  | 'analytics-deals'       // ADD
  | 'analytics-heatmap'     // ADD
  | 'analytics-markets'     // ADD
  | 'analytics-reports'     // ADD
  | 'settings'
  | 'inbox'
  | 'leads'
  | 'lists'
  | 'filters'
  | 'market'
  | 'map'
  | 'team'
  | 'help'
  | 'notifications'
  | 'onboarding'
```

**Verification**:
```bash
npm run type-check 2>&1 | grep "ViewType"
```

**Estimated Time**: 15 minutes
**Dependencies**: None

---

## WAVE 2 COMPLETION CHECKPOINT

After completing all Wave 2 fixes:

```bash
# Regenerate database types (if migrations were run)
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/database.types.ts

# Run type check - errors should be significantly reduced
npm run type-check 2>&1 | tail -10
```

**Expected Error Reduction**: ~80 → ~20-30 errors

---

## WAVE 3: CODE QUALITY (~2.5 hours)

### Progress Checklist
- [ ] GAP-017: Fix null safety issues
- [ ] GAP-016: Remove unused imports

---

### GAP-017: Null Safety Issues

**Audit Reference**: Multiple `string | null` to `string` type mismatches
**Severity**: MEDIUM
**Affected Files**: 20+ locations across analytics routes

**Root Cause**: Database queries return nullable types but code expects non-null

**Fix Pattern - Add Null Checks**:

```typescript
// Before (causes error):
const value: string = data.name;

// After (handles null):
const value: string = data.name ?? '';
// OR
const value: string = data.name || 'Unknown';
// OR with early return:
if (!data.name) {
  return NextResponse.json({ error: 'Name required' }, { status: 400 });
}
const value: string = data.name;
```

**Common Locations to Fix**:
1. `src/app/api/analytics/buyers/route.ts` - buyer data fields
2. `src/app/api/analytics/deals/route.ts` - deal data fields
3. `src/app/api/analytics/markets/route.ts` - property fields
4. `src/app/api/analytics/communications/route.ts` - campaign fields
5. `src/app/api/analytics/heatmap/route.ts` - location fields

**Systematic Fix Approach**:
```bash
# Find all null-safety errors
npm run type-check 2>&1 | grep "null" | head -50
```

Fix each file by adding appropriate null coalescing (`??`) or optional chaining (`?.`).

**Verification**:
```bash
npm run type-check 2>&1 | grep -c "null"  # Should be 0 or very low
```

**Estimated Time**: 2 hours
**Dependencies**: Wave 1 and Wave 2 complete

---

### GAP-016: Unused Imports

**Audit Reference**: Unused imports across 15+ files
**Severity**: LOW
**Affected Files**: Various throughout codebase

**Root Cause**: Code refactoring left behind unused imports

**Fix Command - ESLint Auto-fix**:
```bash
npm run lint -- --fix
```

**If ESLint doesn't catch all**:
```bash
# Find unused imports manually
npm run type-check 2>&1 | grep "declared but"
```

Then remove each unused import manually.

**Verification**:
```bash
npm run lint 2>&1 | grep -c "unused"  # Should be 0
```

**Estimated Time**: 30 minutes
**Dependencies**: Wave 1 and Wave 2 complete

---

## WAVE 3 COMPLETION CHECKPOINT

```bash
# Run full type check
npm run type-check

# Run linting
npm run lint

# Both should pass with 0 errors
```

**Expected Error Reduction**: ~20 → 0 errors

---

## WAVE 4: DOCUMENTATION (~1 hour)

### Progress Checklist
- [ ] GAP-020: Update phase documentation status

---

### GAP-020: Phase Documentation Staleness

**Audit Reference**: Phase docs show "Not Started" but implementation exists
**Severity**: MEDIUM
**Affected Files**:
- `project-docs/PHASE_05_AI_LLM_Integration_2025-12-02.md`
- `project-docs/PHASE_07_Buyer_Intelligence_2025-12-02.md`
- `project-docs/PHASE_08_Deal_Pipeline_2025-12-02.md`
- `project-docs/PHASE_09_Communication_2025-12-02.md`
- `project-docs/PHASE_10_User_Management_2025-12-02.md`
- `project-docs/PHASE_11_Analytics_2025-12-02.md`

**Root Cause**: Documentation not updated after implementation

**Fix**: Update status section in each file from "Not Started" to "Complete" with implementation notes.

**Estimated Time**: 1 hour
**Dependencies**: All code fixes complete

---

## Post-Implementation Verification

### Final Verification Checklist

```bash
# 1. TypeScript Compilation - MUST BE 0 ERRORS
npm run type-check
echo "Expected: 0 errors"

# 2. ESLint - MUST PASS
npm run lint
echo "Expected: No errors or warnings"

# 3. Build - MUST SUCCEED
npm run build
echo "Expected: Build successful"

# 4. Component Verification
echo "Verifying UI components..."
ls -la src/components/ui/checkbox.tsx && echo "✓ checkbox"
ls -la src/components/ui/switch.tsx && echo "✓ switch"
ls -la src/components/ui/slider.tsx && echo "✓ slider"
ls -la src/components/ui/alert.tsx && echo "✓ alert"
ls -la src/components/ui/alert-dialog.tsx && echo "✓ alert-dialog"

# 5. Hook Verification
ls -la src/hooks/use-toast.ts && echo "✓ use-toast hook"

# 6. Dev Server Test
npm run dev
# Visit http://localhost:3000 and check:
# - [ ] Login page loads
# - [ ] Dashboard loads after auth
# - [ ] Settings pages load
# - [ ] Analytics pages load
# - [ ] No console errors
```

### Compliance Score After Remediation

| Domain | Before | After | Target |
|--------|--------|-------|--------|
| Routing | 94% | 100% | 100% |
| UI/UX Components | 83% | 100% | 100% |
| API Contracts | 86% | 100% | 100% |
| Data Model | 90% | 100% | 100% |
| Integrations | 100% | 100% | 100% |
| Testing | 0% | 0% | Phase 12 |
| **Overall** | **75%** | **100%** | **100%** |

---

## Rollback Procedures

If something goes wrong during remediation:

### Rollback UI Components
```bash
# Remove added components
rm src/components/ui/checkbox.tsx
rm src/components/ui/switch.tsx
rm src/components/ui/slider.tsx
rm src/components/ui/alert.tsx
rm src/components/ui/alert-dialog.tsx
```

### Rollback Hook
```bash
rm src/hooks/use-toast.ts
```

### Rollback Database Changes
```sql
-- Only if migrations were applied
ALTER TABLE deals DROP COLUMN IF EXISTS buyer_id;
ALTER TABLE deals DROP COLUMN IF EXISTS closed_at;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS onboarding_completed;
ALTER TABLE user_profiles DROP COLUMN IF EXISTS onboarding_step;
ALTER TABLE teams DROP COLUMN IF EXISTS subscription_tier;
ALTER TABLE teams DROP COLUMN IF EXISTS max_members;
ALTER TABLE campaigns DROP COLUMN IF EXISTS type;
ALTER TABLE campaigns DROP COLUMN IF EXISTS sent_count;
ALTER TABLE campaigns DROP COLUMN IF EXISTS opened_count;
ALTER TABLE campaigns DROP COLUMN IF EXISTS responded_count;
DROP TABLE IF EXISTS team_invitations;
```

### Full Git Rollback
```bash
# If all else fails, restore from backup
git checkout pre-remediation-backup
git checkout -b main-recovered
```

---

## Total Time Estimate Summary

| Wave | Description | Estimated Time |
|------|-------------|----------------|
| 1 | Build Blockers | 45 minutes |
| 2 | Schema Alignment | 3.5 hours |
| 3 | Code Quality | 2.5 hours |
| 4 | Documentation | 1 hour |
| **Total** | **All Waves** | **7.75 hours** |

### Recommended Timeline

| Day | Tasks | Expected Outcome |
|-----|-------|------------------|
| Day 1, AM | Wave 1 (all) | Build compiles |
| Day 1, PM | Wave 2 (GAP-007 through GAP-012) | Schema aligned |
| Day 2, AM | Wave 2 (GAP-013 through GAP-015) + Wave 3 | 0 TypeScript errors |
| Day 2, PM | Wave 4 + Final verification | 100% compliance |

---

## Master Checklist

### Wave 1: Build Blockers
- [ ] GAP-001: `npx shadcn@latest add checkbox`
- [ ] GAP-002: `npx shadcn@latest add switch`
- [ ] GAP-003: `npx shadcn@latest add slider`
- [ ] GAP-004: `npx shadcn@latest add alert`
- [ ] GAP-005: `npx shadcn@latest add alert-dialog`
- [ ] GAP-006: Create `src/hooks/use-toast.ts`
- [ ] GAP-018: Export `createBrowserClient` from Supabase client
- [ ] **CHECKPOINT**: Run `npm run type-check` - errors < 90

### Wave 2: Schema Alignment
- [ ] GAP-007: Add/fix `buyer_id` on deals
- [ ] GAP-008: Add/fix `closed_at` on deals
- [ ] GAP-009: Fix `zip_code` → `zip` reference
- [ ] GAP-010: Fix `price` → `asking_price` reference
- [ ] GAP-011: Add team columns or update code
- [ ] GAP-012: Add `onboarding_completed` to user_profiles
- [ ] GAP-013: Add campaign metric columns
- [ ] GAP-014: Create `team_invitations` table
- [ ] GAP-015: Add analytics ViewTypes to usePageContext
- [ ] Regenerate database.types.ts
- [ ] **CHECKPOINT**: Run `npm run type-check` - errors < 30

### Wave 3: Code Quality
- [ ] GAP-017: Fix all null safety issues
- [ ] GAP-016: Remove unused imports
- [ ] **CHECKPOINT**: Run `npm run type-check` - errors = 0

### Wave 4: Documentation
- [ ] GAP-020: Update all phase documentation status
- [ ] **CHECKPOINT**: All docs accurate

### Final Verification
- [ ] `npm run type-check` passes (0 errors)
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] Dev server starts without errors
- [ ] All pages load correctly
- [ ] No console errors in browser

---

## Document Metadata

| Field | Value |
|-------|-------|
| Created | December 3, 2025 |
| Based On | AUDIT_REPORT_2025-12-03.md |
| Total Gaps Addressed | 17 |
| TypeScript Errors to Fix | 135 |
| Target Outcome | 0 errors, 100% compliance |
| Ready for Phase 12 | After all checkpoints pass |

---

**END OF REMEDIATION PLAN**

