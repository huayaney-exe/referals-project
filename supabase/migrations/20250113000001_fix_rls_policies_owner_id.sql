-- ============================================
-- PHASE 2: Fix Broken RLS Policies to Use owner_id
-- Replaces incorrect auth.uid() = business.id with owner_id
-- ============================================

-- Drop broken policies that assumed auth.uid() = business.id
DROP POLICY IF EXISTS "Business owners can view own business" ON businesses;
DROP POLICY IF EXISTS "Business owners can update own business" ON businesses;
DROP POLICY IF EXISTS "Anyone can register a business" ON businesses;

-- Drop helper function that used broken logic
DROP FUNCTION IF EXISTS is_business_owner(UUID);

-- ============================================
-- NEW BUSINESSES TABLE POLICIES (CORRECT)
-- ============================================

-- Business owners can read their own business data
CREATE POLICY "Business owners can view own business"
  ON businesses FOR SELECT
  USING (owner_id = auth.uid());

-- Business owners can update their own business
CREATE POLICY "Business owners can update own business"
  ON businesses FOR UPDATE
  USING (owner_id = auth.uid());

-- Allow business creation during registration
-- Note: owner_id will be set by the registration API endpoint
CREATE POLICY "Users can create their own business"
  ON businesses FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- ============================================
-- UPDATE DEPENDENT TABLE POLICIES
-- ============================================

-- Drop and recreate customers policies to use new owner_id relationship
DROP POLICY IF EXISTS "Business owners can view their customers" ON customers;
DROP POLICY IF EXISTS "Business owners can create customers" ON customers;
DROP POLICY IF EXISTS "Business owners can update their customers" ON customers;

CREATE POLICY "Business owners can view their customers"
  ON customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = customers.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can create customers"
  ON customers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update their customers"
  ON customers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = customers.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Drop and recreate stamps policies
DROP POLICY IF EXISTS "Business owners can view their stamps" ON stamps;
DROP POLICY IF EXISTS "Business owners can create stamps" ON stamps;

CREATE POLICY "Business owners can view their stamps"
  ON stamps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = stamps.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can create stamps"
  ON stamps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Drop and recreate campaigns policies
DROP POLICY IF EXISTS "Business owners can view their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Business owners can create campaigns" ON campaigns;
DROP POLICY IF EXISTS "Business owners can update their campaigns" ON campaigns;
DROP POLICY IF EXISTS "Business owners can delete their campaigns" ON campaigns;

CREATE POLICY "Business owners can view their campaigns"
  ON campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = campaigns.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update their campaigns"
  ON campaigns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = campaigns.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can delete their campaigns"
  ON campaigns FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = campaigns.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Drop and recreate campaign_sends policies
DROP POLICY IF EXISTS "Business owners can view their campaign sends" ON campaign_sends;

CREATE POLICY "Business owners can view their campaign sends"
  ON campaign_sends FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      JOIN businesses ON businesses.id = campaigns.business_id
      WHERE campaigns.id = campaign_sends.campaign_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Drop and recreate referrals policies
DROP POLICY IF EXISTS "Business owners can view their referrals" ON referrals;
DROP POLICY IF EXISTS "Business owners can create referrals" ON referrals;
DROP POLICY IF EXISTS "Business owners can update their referrals" ON referrals;

CREATE POLICY "Business owners can view their referrals"
  ON referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = referrals.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update their referrals"
  ON referrals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = referrals.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Drop and recreate analytics_events policies
DROP POLICY IF EXISTS "Business owners can view their analytics" ON analytics_events;

CREATE POLICY "Business owners can view their analytics"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = analytics_events.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- ============================================
-- HELPER FUNCTIONS (CORRECTED)
-- ============================================

-- Function to check if user owns a business (CORRECTED)
CREATE OR REPLACE FUNCTION is_business_owner(business_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM businesses
    WHERE id = business_id_param
    AND owner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION is_business_owner IS 'Returns true if current user owns the specified business';
