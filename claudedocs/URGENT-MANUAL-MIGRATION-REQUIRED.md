# 🚨 URGENT: Manual Migration Required

## Issue
Customer enrollment is failing with error: `record "new" has no field "qr_downloaded"`

## Root Cause
Database trigger `auto_complete_qr_sharing()` tries to access `qr_downloaded` column on customers table, but it only exists on businesses table.

## Impact
**ALL customer enrollments are currently broken in production.**

## Fix Required
Run the following SQL in Supabase SQL Editor:

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Navigate to your project
3. Click "SQL Editor" in left sidebar

### Step 2: Execute This SQL

```sql
CREATE OR REPLACE FUNCTION auto_complete_qr_sharing()
RETURNS TRIGGER AS $$
DECLARE
  v_should_complete BOOLEAN := false;
BEGIN
  -- Method 1: QR downloaded via download button (BUSINESSES TABLE ONLY)
  IF TG_TABLE_NAME = 'businesses' THEN
    IF NEW.qr_downloaded = true AND (OLD.qr_downloaded IS NULL OR OLD.qr_downloaded = false) THEN
      v_should_complete := true;
    END IF;

    -- Method 2: QR page visited multiple times (BUSINESSES TABLE ONLY)
    IF NEW.qr_page_visit_count >= 2 AND (OLD.qr_page_visit_count < 2 OR OLD.qr_page_visit_count IS NULL) THEN
      v_should_complete := true;
    END IF;
  END IF;

  -- Method 3: First customer enrolled (CUSTOMERS TABLE)
  IF TG_TABLE_NAME = 'customers' THEN
    v_should_complete := true;
  END IF;

  -- Complete task if any method triggered
  IF v_should_complete THEN
    PERFORM complete_checklist_task(
      CASE
        WHEN TG_TABLE_NAME = 'customers' THEN NEW.business_id
        ELSE NEW.id
      END,
      'share_enrollment_qr'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Step 3: Verify Fix
After running the SQL, test customer enrollment:

```bash
curl -X POST https://your-api-url.com/api/v1/enrollments \
  -H "Content-Type: application/json" \
  -d '{
    "business_id": "83d04291-7f1e-4290-99c6-37c76407064d",
    "phone": "+51900900999",
    "name": "Test Customer",
    "email_opt_in": true
  }'
```

Expected response: `201 Created` with customer data

### Migration File
The migration has been committed to: `supabase/migrations/20250113000006_fix_customer_enrollment_trigger.sql`

Once you run manual migrations (or if Supabase auto-applies on deploy), this will be resolved automatically.

## Verification Checklist
- [ ] SQL executed in Supabase dashboard
- [ ] Test enrollment succeeds (returns 201)
- [ ] Customer appears in database
- [ ] No errors in Supabase logs
- [ ] Delete this file once fixed
