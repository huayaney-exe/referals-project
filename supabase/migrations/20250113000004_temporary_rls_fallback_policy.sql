-- ============================================
-- PHASE 1.1: Temporary RLS Fallback Policy
-- Immediate Mitigation - Allow users to access dashboard during migration
-- ============================================

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
      id::text = COALESCE(
        (auth.jwt()->>'app_metadata')::jsonb->>'business_id',
        (auth.jwt()->>'user_metadata')::jsonb->>'business_id'
      )
    )
  );

COMMENT ON POLICY "Temporary: Allow access via metadata during migration" ON businesses IS
  'TEMPORARY POLICY: Remove after all businesses have valid owner_id. Allows users to access their business during migration period.';

DO $$
BEGIN
  RAISE NOTICE '✅ Temporary RLS fallback policy created - users can access dashboard during migration';
END $$;
