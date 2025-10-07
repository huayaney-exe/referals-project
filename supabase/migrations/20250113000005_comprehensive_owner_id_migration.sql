-- ============================================
-- PHASE 2.1: Comprehensive Owner ID Migration
-- Complete Data Migration - Link ALL businesses to users
-- ============================================

DO $$
DECLARE
  total_businesses INT;
  businesses_with_owner INT;
  businesses_without_owner INT;
  linked_via_user_metadata INT := 0;
  linked_via_app_metadata INT := 0;
  linked_via_email INT := 0;
  remaining_orphans INT;
  orphan_record RECORD;
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
    FOR orphan_record IN
      SELECT id, email, name, created_at
      FROM businesses
      WHERE owner_id IS NULL
      ORDER BY created_at DESC
    LOOP
      RAISE WARNING '  Orphan: % | % | % | created %',
        orphan_record.id, orphan_record.email, orphan_record.name, orphan_record.created_at;
    END LOOP;
  ELSE
    RAISE NOTICE '✅ ALL businesses successfully linked!';
  END IF;
END $$;
