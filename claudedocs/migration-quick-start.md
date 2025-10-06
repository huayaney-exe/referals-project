# Phase 2 Migration Quick Start

**For the production-quality-code startup team 🚀**

---

## Prerequisites (30 minutes)

### 1. Install Supabase CLI (if not installed)
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_ID
```

### 2. Generate TypeScript Types
```bash
# Add to package.json scripts:
"db:types": "supabase gen types typescript --linked > frontend/src/lib/database.types.ts"

# Run it:
npm run db:types
```

### 3. Create Error Handling Module
```bash
# Copy from phase2-production-implementation.md section "Foundation Layer"
# Create: frontend/src/lib/errors.ts
# Update: frontend/src/lib/supabase-client.ts (replace supabase.ts)
```

---

## Migration Execution Plan

### Option A: All-at-Once (Recommended for Off-Peak)
```bash
# 1. Create migration file
cat > supabase/migrations/20250112000000_phase2_foundation.sql << 'EOF'
-- Combine all Phase 2 migrations:
-- - reward_notifications
-- - onboarding_checklist
-- - milestones
-- (Copy SQL from phase2-production-implementation.md)
EOF

# 2. Test locally
supabase db reset  # Resets local DB
supabase start

# 3. Deploy to staging
supabase db push --db-url YOUR_STAGING_URL

# 4. Run integration tests
npm run test:integration

# 5. Deploy to production
supabase db push --linked

# 6. Deploy frontend
npm run build
vercel --prod
```

### Option B: Incremental (Safer, More Testing)
```bash
# Week 1 Day 1: Foundation only
supabase/migrations/20250112000000_types_and_errors.sql

# Week 1 Day 2: Reward notifications
supabase/migrations/20250112000001_reward_notifications.sql

# Week 1 Day 3: Onboarding checklist
supabase/migrations/20250112000002_onboarding_checklist.sql

# Deploy each with testing cycle
```

---

## Verification Checklist

### After Each Migration:

```sql
-- 1. Check tables created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check indexes created
SELECT indexname, tablename FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 3. Check RLS policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. Check triggers
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- 5. Check functions
SELECT routine_name, routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
```

### Test Queries:
```sql
-- Test milestone checking function
SELECT check_milestones('YOUR_TEST_BUSINESS_ID');

-- Test checklist completion
SELECT * FROM checklist_tasks ORDER BY order_index;
SELECT * FROM checklist_progress WHERE business_id = 'YOUR_TEST_BUSINESS_ID';

-- Test reward redemption tracking
SELECT * FROM reward_redemptions WHERE business_id = 'YOUR_TEST_BUSINESS_ID';
```

---

## Frontend Integration Steps

### 1. Update Supabase Import (All Files)
```typescript
// OLD:
import { supabase } from '@/lib/supabase';

// NEW:
import { supabase, type Tables } from '@/lib/supabase-client';
```

### 2. Replace Type Definitions
```typescript
// OLD (manual types):
export interface Customer {
  id: string;
  business_id: string;
  // ...
}

// NEW (generated types):
import { type Tables } from '@/lib/supabase-client';
type Customer = Tables<'customers'>;
```

### 3. Update Error Handling
```typescript
// OLD:
if (error) throw error;

// NEW:
import { DatabaseError } from '@/lib/errors';

if (error) {
  throw new DatabaseError(
    'Failed to fetch customers',
    error.code,
    error.hint,
    error.details
  );
}
```

### 4. Add New Components
```bash
# Copy from phase2-production-implementation.md:
# - frontend/src/components/RewardRedemptionToast.tsx
# - frontend/src/components/OnboardingChecklist.tsx
# - frontend/src/lib/hooks/useRewardRedemptions.ts
# - frontend/src/lib/hooks/useOnboardingChecklist.ts
```

### 5. Integrate in Dashboard
```typescript
// frontend/src/app/dashboard/page.tsx

// Add imports:
import { useRewardRedemptions } from '@/lib/hooks/useRewardRedemptions';
import { RewardRedemptionToast } from '@/components/RewardRedemptionToast';
import { OnboardingChecklist } from '@/components/OnboardingChecklist';

// Add hooks:
const { latestRedemption, dismissRedemption } = useRewardRedemptions(businessId || '');

// Add to JSX (after welcome banner):
<OnboardingChecklist businessId={businessId || ''} autoCollapse={true} />

{latestRedemption && (
  <RewardRedemptionToast
    customerName={latestRedemption.customer.name}
    onDismiss={dismissRedemption}
  />
)}
```

---

## Rollback Procedures

### Database Rollback:
```bash
# 1. Create backup BEFORE migration
pg_dump -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f backup-$(date +%Y%m%d-%H%M).sql

# 2. If rollback needed:
psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f backup-YYYYMMDD-HHMM.sql

# 3. Or use Supabase point-in-time recovery:
# Go to Supabase Dashboard > Settings > Database > Point in Time Recovery
```

### Frontend Rollback:
```bash
# Vercel automatic rollback:
vercel rollback

# Or specific deployment:
vercel rollback [DEPLOYMENT_URL]
```

### Migration-Specific Rollback:
```sql
-- reward_notifications rollback:
DROP TRIGGER IF EXISTS trigger_reward_redemption ON stamps;
DROP FUNCTION IF EXISTS record_reward_redemption();
DROP TABLE IF EXISTS reward_redemptions CASCADE;

-- onboarding_checklist rollback:
DROP TRIGGER IF EXISTS trigger_checklist_customer ON customers;
DROP TRIGGER IF EXISTS trigger_checklist_stamp ON stamps;
DROP TRIGGER IF EXISTS trigger_checklist_qr ON businesses;
DROP FUNCTION IF EXISTS auto_complete_checklist_tasks();
DROP FUNCTION IF EXISTS complete_checklist_task(UUID, VARCHAR);
DROP FUNCTION IF EXISTS is_checklist_complete(UUID);
DROP TABLE IF EXISTS checklist_progress CASCADE;
DROP TABLE IF EXISTS checklist_tasks CASCADE;

-- milestones rollback:
DROP TRIGGER IF EXISTS trigger_milestone_check_customer ON customers;
DROP TRIGGER IF EXISTS trigger_milestone_check_redemption ON reward_redemptions;
DROP TRIGGER IF EXISTS trigger_milestone_check_campaign ON campaigns;
DROP FUNCTION IF EXISTS trigger_milestone_check();
DROP FUNCTION IF EXISTS check_milestones(UUID);
DROP TABLE IF EXISTS business_milestones CASCADE;
DROP TABLE IF EXISTS milestone_definitions CASCADE;
```

---

## Monitoring After Deployment

### 1. Check Supabase Logs (First 30 minutes)
```bash
# Dashboard > Logs > Database Logs
# Look for:
# - Error rate spike
# - Slow query warnings
# - Failed transactions
```

### 2. Check Frontend Errors (Sentry/Vercel)
```bash
# Monitor for:
# - DatabaseError exceptions
# - TypeError (type mismatches)
# - Subscription errors
```

### 3. Check Performance
```sql
-- Query execution time
SELECT
  query,
  calls,
  total_exec_time / 1000 as total_seconds,
  mean_exec_time / 1000 as mean_seconds,
  max_exec_time / 1000 as max_seconds
FROM pg_stat_statements
WHERE query LIKE '%milestone%' OR query LIKE '%checklist%'
ORDER BY mean_exec_time DESC
LIMIT 10;
```

### 4. Check Trigger Execution
```sql
-- Verify triggers are firing
SELECT * FROM business_milestones ORDER BY achieved_at DESC LIMIT 10;
SELECT * FROM checklist_progress ORDER BY created_at DESC LIMIT 10;
SELECT * FROM reward_redemptions ORDER BY redeemed_at DESC LIMIT 10;
```

---

## Common Issues & Solutions

### Issue 1: Type Errors After Migration
```typescript
// Problem: Old interface doesn't match DB
// Solution: Regenerate types and replace imports

npm run db:types
// Find all: import type { Customer } from './types';
// Replace: import { type Tables } from '@/lib/supabase-client';
//          type Customer = Tables<'customers'>;
```

### Issue 2: Realtime Subscription Not Working
```typescript
// Check channel name uniqueness
// Check RLS policy allows SELECT
// Check filter syntax: filter: `business_id=eq.${businessId}`

// Debug subscription:
.on('system', {}, (status) => {
  console.log('[Realtime] Status:', status);
})
.subscribe((status, err) => {
  console.log('[Realtime] Subscribe:', status, err);
});
```

### Issue 3: Trigger Not Firing
```sql
-- Check trigger exists:
SELECT * FROM pg_trigger WHERE tgname = 'trigger_milestone_check_customer';

-- Check function exists:
SELECT * FROM pg_proc WHERE proname = 'check_milestones';

-- Test manually:
SELECT check_milestones('YOUR_BUSINESS_ID');
```

### Issue 4: Slow Queries After Migration
```sql
-- Check indexes created:
SELECT * FROM pg_indexes WHERE tablename IN ('business_milestones', 'checklist_progress');

-- If missing, create manually:
CREATE INDEX IF NOT EXISTS idx_milestones_business ON business_milestones(business_id);
CREATE INDEX IF NOT EXISTS idx_checklist_business ON checklist_progress(business_id);
```

---

## Success Criteria

### Week 1 (Post-Deployment):
- [ ] All migrations applied successfully (0 errors in logs)
- [ ] All indexes created and in use (pg_stat_user_indexes)
- [ ] All triggers firing correctly (check trigger tables)
- [ ] Frontend builds without type errors
- [ ] Realtime subscriptions connected (check Supabase dashboard)
- [ ] Error rate unchanged from baseline
- [ ] Average response time < 500ms

### Week 2 (Feature Adoption):
- [ ] 50%+ of businesses see onboarding checklist
- [ ] 20%+ of reward redemptions trigger celebration toast
- [ ] 10%+ of businesses achieve first milestone
- [ ] 0 database-related support tickets
- [ ] Query performance within acceptable ranges

---

## Support Resources

### Documentation:
- [Supabase Migration Guide](https://supabase.com/docs/guides/database/migrations)
- [Supabase Realtime Guide](https://supabase.com/docs/guides/realtime)
- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/best-practices)

### Team Contacts:
- **Database Issues**: Check Supabase dashboard > Logs
- **Frontend Errors**: Check Vercel deployment logs
- **Type Errors**: Regenerate types with `npm run db:types`

### Emergency Rollback:
```bash
# Full rollback script:
./scripts/emergency-rollback.sh [backup-timestamp]

# Or manually:
# 1. Rollback Vercel deployment
# 2. Restore database from backup
# 3. Notify team via Slack
```

---

## Next Phase Preview

### Week 2-3 Features:
1. **Smart Empty States** (4h)
   - Contextual guidance in empty lists
   - QR preview on empty customers page

2. **Weekly Digest** (6h)
   - Cron job for weekly metric calculation
   - Email template with SendGrid
   - Dashboard banner alternative

3. **Milestone Celebrations** (4h)
   - Modal celebration on milestone achievement
   - Badge display in dashboard
   - Achievement history page

---

**Remember**: Production quality means thorough testing, proper monitoring, and graceful degradation. Take time to test each feature before moving to the next.

**Team Motto**: "We're proud of being a production-quality-code startup" ✨
