-- ============================================
-- FIX ONBOARDING RLS POLICIES
-- ============================================
-- Date: 2025-01-10
-- Description: Fix RLS policies for onboarding_progress table to work with backend authentication

-- Drop existing user policies (service role policy already exists)
DROP POLICY IF EXISTS "Business owners can view their onboarding progress" ON onboarding_progress;
DROP POLICY IF EXISTS "Business owners can create their onboarding progress" ON onboarding_progress;

-- Note: Service role policy already exists from previous migration
-- Backend uses supabaseAdmin (service role) which bypasses RLS, so these are just for direct client access

-- Allow authenticated users to view their own progress (for direct client access if needed)
CREATE POLICY "Users can view their own onboarding progress"
  ON onboarding_progress FOR SELECT
  TO authenticated
  USING (
    business_id IN (
      SELECT id FROM businesses WHERE id::text = (auth.jwt() -> 'user_metadata' ->> 'business_id')
    )
  );

-- Allow authenticated users to create their own progress (for direct client access if needed)
CREATE POLICY "Users can create their own onboarding progress"
  ON onboarding_progress FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id IN (
      SELECT id FROM businesses WHERE id::text = (auth.jwt() -> 'user_metadata' ->> 'business_id')
    )
  );
