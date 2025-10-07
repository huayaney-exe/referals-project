# Comprehensive Multi-Tenant Architecture Fix Plan

## Executive Summary

**Problem**: Production system partially broken after owner_id migration
**Impact**: Existing users cannot access dashboard if their business wasn't properly migrated
**Root Cause**: RLS policies block fallback query when owner_id is NULL

---

## Complete Failure Mode Analysis

### Critical Path: User Login → Dashboard Load

```
1. User logs in ✅
   ├─ Backend: signInWithPassword succeeds
   └─ Returns: user with user_metadata.business_id

2. Frontend: useBusinessContext() runs
   ├─ Query 1: SELECT * FROM businesses WHERE owner_id = user.id
   │  └─ Result: 0 rows (if owner_id wasn't set during migration)
   │
   ├─ Fallback triggered (line 59-78)
   │  ├─ Extract: business_id from user_metadata
   │  └─ Query 2: SELECT * FROM businesses WHERE id = business_id
   │     └─ Result: RLS BLOCKS! ❌
   │        (Policy: owner_id = auth.uid(), but owner_id IS NULL)
   │
   └─ Dashboard: Can't load businessId → 💥 BROKEN

3. All dashboard pages fail
   ├─ settings/page.tsx → needs businessId
   ├─ campaigns/page.tsx → needs businessId
   ├─ customers/page.tsx → needs businessId
   └─ All features broken
```

---

## Root Causes (Priority Order)

### 🔴 **CRITICAL #1: RLS Policy Blocks Fallback Query**

**File**: `supabase/migrations/20250113000001_fix_rls_policies_owner_id.sql` (lines 16-18)

```sql
CREATE POLICY "Business owners can view own business"
  ON businesses FOR SELECT
  USING (owner_id = auth.uid());
```

**Problem**:
- If `owner_id IS NULL` → query blocked even if user has valid `business_id` in metadata
- Fallback query in `useBusinessContext.ts` (line 67-71) fails with RLS error

---

### 🔴 **CRITICAL #2: Incomplete Migration Coverage**

**Files**:
- `20250113000000_add_owner_id_to_businesses.sql`
- `20250113000002_fix_orphaned_businesses_by_email.sql`
- `20250113000003_manual_user_business_linking.sql`

**Evidence**:
- Migration 1: Backfilled 14 businesses ✅
- Migration 2: Found 0 orphaned businesses (ran AFTER migration 1)
- Migration 3: Fixed hello@getprisma.io ✅, but huayaney.exe@gmail.com has NO business

**Gap**: Users who registered BEFORE migrations but have `owner_id = NULL`:
- Their business exists in `businesses` table
- Their `user_metadata.business_id` is set
- But `owner_id` column is NULL
- RLS blocks ALL access

---

### 🟡 **IMPORTANT #3: Frontend Hook Has Weak Error Handling**

**File**: `frontend/src/hooks/useBusinessContext.ts` (lines 73-77)

```typescript
if (fallbackError) throw fallbackError;  // ❌ No graceful degradation
return fallbackBusiness as Business;
```

**Problem**: When RLS blocks fallback, entire hook fails → dashboard unusable

---

## World-Class Solution (Step-by-Step with Dependencies)

### **Phase 1: Immediate Mitigation** (Deploy Within 1 Hour)

**Goal**: Allow existing users to access dashboard while we fix database

#### Step 1.1: Temporary RLS Policy Relaxation
**Dependency**: None
**Risk**: Low (still requires valid user session)
**Rollback**: Simple (revert migration)

```sql
-- File: 20250113000004_temporary_rls_fallback_policy.sql

-- Add temporary policy: Allow users to access business if they have it in metadata
-- This is safe because:
-- 1. Still requires authenticated user (auth.uid() must exist)
-- 2. Still validates business_id is in their JWT claims
-- 3. Temporary - will remove after data migration complete

CREATE POLICY "Temporary: Allow access via metadata during migration"
  ON businesses FOR SELECT
  USING (
    -- Primary: owner_id matches (production pattern)
    owner_id = auth.uid()
    OR
    -- Fallback: business_id in user metadata (migration compatibility)
    (
      id::text = (auth.jwt()->>'user_metadata')::jsonb->>'business_id'
      OR
      id::text = (auth.jwt()->>'app_metadata')::jsonb->>'business_id'
    )
  );

COMMENT ON POLICY "Temporary: Allow access via metadata during migration" ON businesses IS
  'TEMPORARY POLICY: Remove after all businesses have valid owner_id. Allows users to access their business during migration period.';
```

**Expected Result**: All users can access dashboard immediately ✅

---

#### Step 1.2: Frontend Error Boundary
**Dependency**: None
**Risk**: None (improves UX)
**Rollback**: N/A (keep improvement)

```typescript
// File: frontend/src/hooks/useBusinessContext.ts

export function useBusinessContext() {
  const { user } = useAuth();

  const { data: business, isLoading, error, refetch } = useQuery<Business | null>({
    queryKey: ['business', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Try database query first (source of truth)
      const { data: businesses, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.id)
        .single();

      if (error) {
        console.warn('[useBusinessContext] Primary query failed, using fallback:', error);

        // Fallback: Use metadata business_id
        const businessId = user.app_metadata?.business_id || user.user_metadata?.business_id;

        if (!businessId) {
          console.error('[useBusinessContext] No business_id in metadata');
          return null; // Graceful: return null instead of throwing
        }

        // Try fallback query
        const { data: fallbackBusiness, error: fallbackError } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', businessId)
          .single();

        if (fallbackError) {
          console.error('[useBusinessContext] Fallback query failed:', fallbackError);
          // CHANGED: Return null instead of throwing
          // This allows dashboard to show "Setup incomplete" message
          return null;
        }

        console.info('[useBusinessContext] Fallback query succeeded');
        return fallbackBusiness as Business;
      }

      return businesses as Business;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1, // CHANGED: Reduce from 3 to 1 (fail fast)
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });

  return {
    business,
    businessId: business?.id,
    isLoading,
    error: error as Error | null,
    refetch,
    // NEW: Explicit error states for UX
    hasError: !!error && !business,
    needsSetup: !isLoading && !business && !!user,
  };
}
```

---

### **Phase 2: Complete Data Migration** (Deploy Within 4 Hours)

**Goal**: Ensure ALL businesses have valid `owner_id`

#### Step 2.1: Comprehensive Business-User Linking
**Dependency**: Phase 1.1 deployed (users can still access dashboard)
**Risk**: Medium (modifies production data)
**Rollback**: Database snapshot before migration

```sql
-- File: 20250113000005_comprehensive_owner_id_migration.sql

-- COMPREHENSIVE MIGRATION: Link ALL businesses to users
-- Strategy:
-- 1. Match by user_metadata.business_id (most common)
-- 2. Match by app_metadata.business_id (new registrations)
-- 3. Match by email (orphaned businesses)
-- 4. Report remaining orphans for manual review

DO $$
DECLARE
  migration_stats RECORD;
  total_businesses INT;
  businesses_with_owner INT;
  businesses_without_owner INT;
  linked_via_user_metadata INT := 0;
  linked_via_app_metadata INT := 0;
  linked_via_email INT := 0;
  remaining_orphans INT;
BEGIN
  -- Get initial stats
  SELECT COUNT(*) INTO total_businesses FROM businesses;
  SELECT COUNT(*) INTO businesses_with_owner FROM businesses WHERE owner_id IS NOT NULL;
  SELECT COUNT(*) INTO businesses_without_owner FROM businesses WHERE owner_id IS NULL;

  RAISE NOTICE '=== MIGRATION START ===';
  RAISE NOTICE 'Total businesses: %', total_businesses;
  RAISE NOTICE 'With owner_id: %', businesses_with_owner;
  RAISE NOTICE 'Without owner_id: %', businesses_without_owner;
  RAISE NOTICE '';

  -- STRATEGY 1: Link via user_metadata.business_id
  RAISE NOTICE 'Strategy 1: Linking via user_metadata.business_id...';

  UPDATE businesses b
  SET owner_id = u.id
  FROM auth.users u
  WHERE b.owner_id IS NULL
    AND b.id::text = u.raw_user_meta_data->>'business_id';

  GET DIAGNOSTICS linked_via_user_metadata = ROW_COUNT;
  RAISE NOTICE '  Linked % businesses via user_metadata', linked_via_user_metadata;

  -- STRATEGY 2: Link via app_metadata.business_id
  RAISE NOTICE 'Strategy 2: Linking via app_metadata.business_id...';

  UPDATE businesses b
  SET owner_id = u.id
  FROM auth.users u
  WHERE b.owner_id IS NULL
    AND b.id::text = u.raw_app_meta_data->>'business_id';

  GET DIAGNOSTICS linked_via_app_metadata = ROW_COUNT;
  RAISE NOTICE '  Linked % businesses via app_metadata', linked_via_app_metadata;

  -- STRATEGY 3: Link via email matching
  RAISE NOTICE 'Strategy 3: Linking via email matching...';

  UPDATE businesses b
  SET owner_id = u.id
  FROM auth.users u
  WHERE b.owner_id IS NULL
    AND b.email = u.email;

  GET DIAGNOSTICS linked_via_email = ROW_COUNT;
  RAISE NOTICE '  Linked % businesses via email', linked_via_email;

  -- Update user metadata for consistency
  RAISE NOTICE 'Updating user metadata for consistency...';

  UPDATE auth.users u
  SET
    raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('business_id', b.id::text, 'business_name', b.name),
    raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('business_id', b.id::text, 'business_name', b.name)
  FROM businesses b
  WHERE b.owner_id = u.id
    AND (
      u.raw_user_meta_data->>'business_id' IS NULL
      OR u.raw_app_meta_data->>'business_id' IS NULL
    );

  -- Final stats
  SELECT COUNT(*) INTO remaining_orphans FROM businesses WHERE owner_id IS NULL;

  RAISE NOTICE '';
  RAISE NOTICE '=== MIGRATION COMPLETE ===';
  RAISE NOTICE 'Total linked: % businesses', linked_via_user_metadata + linked_via_app_metadata + linked_via_email;
  RAISE NOTICE '  - Via user_metadata: %', linked_via_user_metadata;
  RAISE NOTICE '  - Via app_metadata: %', linked_via_app_metadata;
  RAISE NOTICE '  - Via email: %', linked_via_email;
  RAISE NOTICE 'Remaining orphans: %', remaining_orphans;

  IF remaining_orphans > 0 THEN
    RAISE WARNING 'Manual review required for % orphaned businesses', remaining_orphans;

    -- List orphaned businesses for manual review
    FOR migration_stats IN
      SELECT id, email, name, created_at
      FROM businesses
      WHERE owner_id IS NULL
      ORDER BY created_at DESC
    LOOP
      RAISE WARNING '  Orphan: % | % | % | created %',
        migration_stats.id, migration_stats.email, migration_stats.name, migration_stats.created_at;
    END LOOP;
  ELSE
    RAISE NOTICE '✅ ALL businesses successfully linked!';
  END IF;
END $$;
```

---

### **Phase 3: Remove Temporary Policy** (Deploy After 24-48 Hours)

**Goal**: Remove temporary RLS policy once all data is migrated
**Dependency**: Phase 2.1 complete AND verified (all businesses have owner_id)

```sql
-- File: 20250113000006_remove_temporary_rls_policy.sql

-- Verify all businesses have valid owner_id before removing temporary policy
DO $$
DECLARE
  orphan_count INT;
BEGIN
  SELECT COUNT(*) INTO orphan_count FROM businesses WHERE owner_id IS NULL;

  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'Cannot remove temporary policy: % businesses still have owner_id IS NULL', orphan_count;
  END IF;

  RAISE NOTICE '✅ All businesses have valid owner_id - safe to remove temporary policy';
END $$;

-- Drop temporary policy
DROP POLICY IF EXISTS "Temporary: Allow access via metadata during migration" ON businesses;

RAISE NOTICE '✅ Temporary RLS policy removed - production architecture complete';
```

---

## Testing & Validation Plan

### Pre-Deployment Tests (Local/Staging)

1. **Test existing user with migrated business**
   - Login → Dashboard loads ✅
   - Business data displays correctly ✅

2. **Test existing user with unmigrated business** (owner_id = NULL)
   - Login → Temporary policy allows access ✅
   - After Phase 2 migration → owner_id set ✅

3. **Test new user registration**
   - Register → owner_id set immediately ✅
   - Login → Dashboard loads ✅

4. **Test user with no business** (like huayaney.exe@gmail.com)
   - Login succeeds ✅
   - Dashboard shows "Setup incomplete" message ✅
   - No crashes ✅

### Post-Deployment Validation (Production)

```bash
# 1. Check RLS policies
supabase db dump --data-only=false | grep "CREATE POLICY"

# 2. Verify business-user linking
# Count businesses without owner_id (should be 0 after Phase 2)
echo "SELECT COUNT(*) FROM businesses WHERE owner_id IS NULL;" | supabase db execute

# 3. Test critical paths
curl -X POST https://loyalty-platform-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"hello@getprisma.io","password":"testpass"}'
```

---

## Rollback Strategy

### If Phase 1 Breaks Production

```sql
-- Rollback: Remove temporary policy
DROP POLICY IF EXISTS "Temporary: Allow access via metadata during migration" ON businesses;
```

### If Phase 2 Migration Fails

```sql
-- Database snapshot taken before migration
-- Restore from snapshot via Supabase dashboard
-- Re-run migration with fixes
```

### If Phase 3 Breaks Production

```sql
-- Re-add temporary policy immediately
-- Re-run Phase 2 comprehensive migration
```

---

## Communication Plan

### To Users (if downtime occurs)

> **System Maintenance Notice**
>
> We're upgrading our security architecture to production-grade standards. You may experience brief login delays during this period.
>
> **Impact**: None for most users. If you see "Dashboard loading..." for >5 seconds, please refresh your browser.
>
> **Duration**: 1-2 hours
>
> **Benefits**: Improved security, faster dashboard loads, support for multiple team members (coming soon!)

---

## Success Criteria

✅ All existing users can log in and access dashboard
✅ All new users register successfully with owner_id set
✅ Zero RLS policy errors in Supabase logs
✅ All businesses have valid owner_id (orphan count = 0)
✅ Temporary RLS policy removed
✅ Frontend hook handles errors gracefully
✅ Performance: Dashboard loads in <2 seconds

---

## Timeline

- **Hour 0**: Deploy Phase 1.1 (Temporary RLS policy) → Users can access dashboard
- **Hour 0-4**: Monitor logs, deploy Phase 1.2 (Frontend error handling)
- **Hour 4**: Deploy Phase 2.1 (Comprehensive migration) → All businesses linked
- **Hour 4-24**: Validate migration, monitor for issues
- **Hour 24-48**: Deploy Phase 3 (Remove temporary policy) → Production-grade complete

---

## Lessons Learned

1. **Always test migration with temporary rollback window**
   - We should have kept old RLS policies for 24h during migration

2. **Graceful degradation is critical**
   - Frontend should never crash due to missing data

3. **Comprehensive migration coverage**
   - Test ALL user scenarios, not just happy path

4. **Communication is key**
   - Users should know about breaking changes ahead of time

---

## Next Steps (After This Fix)

1. **Add integration tests** for multi-tenant scenarios
2. **Create migration testing framework** (test migrations before production)
3. **Implement database backup automation** (pre-migration snapshots)
4. **Build admin panel** for manual business-user linking
5. **Add monitoring** for orphaned businesses (alert if owner_id IS NULL)
