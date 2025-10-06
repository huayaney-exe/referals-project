-- Fix RLS policies to use user_metadata business_id instead of auth.uid()
-- The issue: auth.uid() returns the Supabase auth user ID, NOT the business ID
-- We store business_id in user_metadata during registration

-- Drop existing customer policies
DROP POLICY IF EXISTS "Business owners can view their customers" ON customers;
DROP POLICY IF EXISTS "Business owners can create customers" ON customers;
DROP POLICY IF EXISTS "Business owners can update their customers" ON customers;
DROP POLICY IF EXISTS "Enable all for service role" ON customers;

-- Create corrected policies using user_metadata
CREATE POLICY "Business owners can view their customers"
  ON customers FOR SELECT
  USING (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

CREATE POLICY "Business owners can create customers"
  ON customers FOR INSERT
  WITH CHECK (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

CREATE POLICY "Business owners can update their customers"
  ON customers FOR UPDATE
  USING (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

-- Service role bypass (for backend operations)
CREATE POLICY "Service role can manage all customers"
  ON customers FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Fix stamps policies
DROP POLICY IF EXISTS "Business owners can view their stamps" ON stamps;
DROP POLICY IF EXISTS "Business owners can create stamps" ON stamps;
DROP POLICY IF EXISTS "Enable all for service role" ON stamps;

CREATE POLICY "Business owners can view their stamps"
  ON stamps FOR SELECT
  USING (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

CREATE POLICY "Business owners can create stamps"
  ON stamps FOR INSERT
  WITH CHECK (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

CREATE POLICY "Service role can manage all stamps"
  ON stamps FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Fix campaigns policies
DROP POLICY IF EXISTS "Business owners can view their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Business owners can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Business owners can update their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Business owners can delete their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Enable all for service role" ON campaigns;

CREATE POLICY "Business owners can view their campaigns"
  ON campaigns FOR SELECT
  USING (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

CREATE POLICY "Business owners can create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

CREATE POLICY "Business owners can update their campaigns"
  ON campaigns FOR UPDATE
  USING (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

CREATE POLICY "Business owners can delete their campaigns"
  ON campaigns FOR DELETE
  USING (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

CREATE POLICY "Service role can manage all campaigns"
  ON campaigns FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Fix referrals policies
DROP POLICY IF EXISTS "Business owners can view their referrals" ON referrals;
DROP POLICY IF EXISTS "Business owners can create referrals" ON referrals;
DROP POLICY IF EXISTS "Business owners can update their referrals" ON referrals;
DROP POLICY IF EXISTS "Enable all for service role" ON referrals;

CREATE POLICY "Business owners can view their referrals"
  ON referrals FOR SELECT
  USING (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

CREATE POLICY "Business owners can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

CREATE POLICY "Business owners can update their referrals"
  ON referrals FOR UPDATE
  USING (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

CREATE POLICY "Service role can manage all referrals"
  ON referrals FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');

-- Outbox events already has correct service role policy, but let's ensure it's there
DROP POLICY IF EXISTS "Service role can manage outbox events" ON outbox_events;
DROP POLICY IF EXISTS "Enable all for service role" ON outbox_events;

CREATE POLICY "Service role can manage all outbox events"
  ON outbox_events FOR ALL
  USING (auth.jwt()->>'role' = 'service_role')
  WITH CHECK (auth.jwt()->>'role' = 'service_role');
