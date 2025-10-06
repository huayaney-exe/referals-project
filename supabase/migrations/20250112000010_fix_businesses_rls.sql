-- ============================================
-- FIX BUSINESSES TABLE RLS POLICIES
-- ============================================
-- Date: 2025-01-12
-- Purpose: Fix businesses table RLS to use user_metadata business_id
-- Issue: Original policies used auth.uid() = businesses.id which is wrong
--        auth.uid() is the Supabase auth user ID, NOT the business ID
--        business_id is stored in user_metadata during registration
-- Related: 20250104235900_fix_rls_user_metadata.sql (fixed other tables)

-- Drop existing broken policies
DROP POLICY IF EXISTS "Business owners can view own business" ON businesses;
DROP POLICY IF EXISTS "Business owners can update own business" ON businesses;
DROP POLICY IF EXISTS "Anyone can register a business" ON businesses;
DROP POLICY IF EXISTS "Enable all for service role" ON businesses;

-- Create corrected SELECT policy using user_metadata
CREATE POLICY "Business owners can view own business"
  ON businesses FOR SELECT
  USING (
    id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

-- Create corrected UPDATE policy using user_metadata
CREATE POLICY "Business owners can update own business"
  ON businesses FOR UPDATE
  USING (
    id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

-- Recreate registration policy (this one was fine)
CREATE POLICY "Anyone can register a business"
  ON businesses FOR INSERT
  WITH CHECK (true);

-- Service role bypass for backend operations
CREATE POLICY "Service role can manage all businesses"
  ON businesses FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
