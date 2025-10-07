-- ============================================
-- MANUAL FIX: Link specific users to their businesses
-- For users who registered but business wasn't properly linked
-- ============================================

-- This migration is safe to run multiple times (idempotent)

DO $$
DECLARE
  user_email TEXT;
  user_id UUID;
  business_id UUID;
  linked_count INT := 0;
BEGIN
  -- List of user emails that need manual business linking
  -- Add more users here as needed
  FOR user_email IN
    SELECT UNNEST(ARRAY[
      'huayaney.exe@gmail.com',
      'hello@getprisma.io'
      -- Add more emails here if needed
    ])
  LOOP
    -- Find user ID
    SELECT id INTO user_id
    FROM auth.users
    WHERE email = user_email;

    IF user_id IS NULL THEN
      RAISE WARNING 'User % not found in auth.users', user_email;
      CONTINUE;
    END IF;

    -- Find business by email
    SELECT id INTO business_id
    FROM businesses
    WHERE email = user_email;

    IF business_id IS NULL THEN
      RAISE WARNING 'Business for % not found in businesses table', user_email;
      CONTINUE;
    END IF;

    -- Link business to user (update owner_id)
    UPDATE businesses
    SET owner_id = user_id
    WHERE id = business_id;

    -- Update user metadata for consistency
    UPDATE auth.users
    SET raw_user_meta_data =
      COALESCE(raw_user_meta_data, '{}'::jsonb) ||
      jsonb_build_object('business_id', business_id::text, 'business_name', (SELECT name FROM businesses WHERE id = business_id)),
    raw_app_meta_data =
      COALESCE(raw_app_meta_data, '{}'::jsonb) ||
      jsonb_build_object('business_id', business_id::text, 'business_name', (SELECT name FROM businesses WHERE id = business_id))
    WHERE id = user_id;

    linked_count := linked_count + 1;
    RAISE NOTICE '✅ Linked % → business % (user %)', user_email, business_id, user_id;
  END LOOP;

  RAISE NOTICE 'Successfully linked % users to their businesses', linked_count;
END $$;
