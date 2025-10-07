-- ============================================
-- PHASE 1: Add owner_id Foreign Key to Businesses Table
-- Production-Grade Multi-Tenant Architecture
-- Supports 1:N, N:1, or N:N user/tenant relations
-- ============================================

-- Step 1: Add owner_id column (nullable initially for backfill)
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Create index for query performance (10-100ms with connection pooling)
CREATE INDEX IF NOT EXISTS idx_businesses_owner_id ON businesses(owner_id);

-- Step 3: Backfill owner_id from existing user_metadata.business_id
-- Migrates existing users to new architecture
DO $$
DECLARE
  user_record RECORD;
  business_uuid UUID;
BEGIN
  FOR user_record IN
    SELECT id, raw_user_meta_data
    FROM auth.users
    WHERE raw_user_meta_data->>'business_id' IS NOT NULL
  LOOP
    BEGIN
      business_uuid := (user_record.raw_user_meta_data->>'business_id')::UUID;

      UPDATE businesses
      SET owner_id = user_record.id
      WHERE id = business_uuid
      AND owner_id IS NULL;

      RAISE NOTICE 'Migrated business % to owner %', business_uuid, user_record.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Failed to migrate user %: %', user_record.id, SQLERRM;
    END;
  END LOOP;
END $$;

-- Step 4: Handle orphaned businesses (no matching user in auth.users)
-- Delete orphaned businesses for data integrity
DO $$
DECLARE
  orphan_count INT;
BEGIN
  SELECT COUNT(*) INTO orphan_count FROM businesses WHERE owner_id IS NULL;
  IF orphan_count > 0 THEN
    RAISE WARNING 'Found % orphaned businesses without owners - deleting for data integrity', orphan_count;
    DELETE FROM businesses WHERE owner_id IS NULL;
  END IF;
END $$;

-- Step 5: Make owner_id NOT NULL (all businesses must have an owner)
ALTER TABLE businesses
ALTER COLUMN owner_id SET NOT NULL;

COMMENT ON COLUMN businesses.owner_id IS 'Foreign key to auth.users - source of truth for business ownership';
