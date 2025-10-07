-- ============================================
-- FIX: Link orphaned businesses by matching email
-- Handles businesses created before owner_id migration
-- ============================================

-- Scenario: User exists in auth.users, business exists in businesses table
-- but owner_id is NULL because user_metadata.business_id was never set
-- Solution: Match by email and link them

DO $$
DECLARE
  business_record RECORD;
  matched_user_id UUID;
  deleted_count INT;
BEGIN
  -- Find all businesses without owner_id
  FOR business_record IN
    SELECT id, email FROM businesses WHERE owner_id IS NULL
  LOOP
    -- Try to find matching user by email
    SELECT id INTO matched_user_id
    FROM auth.users
    WHERE email = business_record.email;

    IF matched_user_id IS NOT NULL THEN
      -- Link business to user
      UPDATE businesses
      SET owner_id = matched_user_id
      WHERE id = business_record.id;

      -- Also update user metadata for consistency
      UPDATE auth.users
      SET raw_user_meta_data =
        COALESCE(raw_user_meta_data, '{}'::jsonb) ||
        jsonb_build_object('business_id', business_record.id::text),
      raw_app_meta_data =
        COALESCE(raw_app_meta_data, '{}'::jsonb) ||
        jsonb_build_object('business_id', business_record.id::text)
      WHERE id = matched_user_id;

      RAISE NOTICE 'Linked orphaned business % (%) to user %',
        business_record.id, business_record.email, matched_user_id;
    ELSE
      RAISE WARNING 'Orphaned business % (%) has no matching user - will be deleted',
        business_record.id, business_record.email;
    END IF;
  END LOOP;

  -- Delete any remaining orphaned businesses (no matching user by email)
  DELETE FROM businesses WHERE owner_id IS NULL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  IF deleted_count > 0 THEN
    RAISE NOTICE 'Deleted % orphaned businesses with no matching users', deleted_count;
  END IF;
END $$;

-- Verify all businesses now have owners
DO $$
DECLARE
  orphan_count INT;
BEGIN
  SELECT COUNT(*) INTO orphan_count FROM businesses WHERE owner_id IS NULL;
  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'Still have % orphaned businesses after email matching!', orphan_count;
  ELSE
    RAISE NOTICE '✅ All businesses now have valid owner_id';
  END IF;
END $$;
