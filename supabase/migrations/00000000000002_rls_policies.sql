-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE stamps ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BUSINESSES TABLE POLICIES
-- ============================================

-- Business owners can read their own business data
CREATE POLICY "Business owners can view own business"
  ON businesses FOR SELECT
  USING (auth.uid()::text = id::text);

-- Business owners can update their own business
CREATE POLICY "Business owners can update own business"
  ON businesses FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Allow business registration (INSERT)
CREATE POLICY "Anyone can register a business"
  ON businesses FOR INSERT
  WITH CHECK (true);

-- ============================================
-- CUSTOMERS TABLE POLICIES
-- ============================================

-- Business owners can view their customers
CREATE POLICY "Business owners can view their customers"
  ON customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = customers.business_id
      AND auth.uid()::text = businesses.id::text
    )
  );

-- Business owners can create customers
CREATE POLICY "Business owners can create customers"
  ON customers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_id
      AND auth.uid()::text = businesses.id::text
    )
  );

-- Business owners can update their customers
CREATE POLICY "Business owners can update their customers"
  ON customers FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = customers.business_id
      AND auth.uid()::text = businesses.id::text
    )
  );

-- ============================================
-- STAMPS TABLE POLICIES
-- ============================================

-- Business owners can view stamps for their customers
CREATE POLICY "Business owners can view their stamps"
  ON stamps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = stamps.business_id
      AND auth.uid()::text = businesses.id::text
    )
  );

-- Business owners can create stamps
CREATE POLICY "Business owners can create stamps"
  ON stamps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_id
      AND auth.uid()::text = businesses.id::text
    )
  );

-- ============================================
-- CAMPAIGNS TABLE POLICIES
-- ============================================

-- Business owners can view their campaigns
CREATE POLICY "Business owners can view their campaigns"
  ON campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = campaigns.business_id
      AND auth.uid()::text = businesses.id::text
    )
  );

-- Business owners can create campaigns
CREATE POLICY "Business owners can create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_id
      AND auth.uid()::text = businesses.id::text
    )
  );

-- Business owners can update their campaigns
CREATE POLICY "Business owners can update their campaigns"
  ON campaigns FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = campaigns.business_id
      AND auth.uid()::text = businesses.id::text
    )
  );

-- Business owners can delete their campaigns
CREATE POLICY "Business owners can delete their campaigns"
  ON campaigns FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = campaigns.business_id
      AND auth.uid()::text = businesses.id::text
    )
  );

-- ============================================
-- CAMPAIGN_SENDS TABLE POLICIES
-- ============================================

-- Business owners can view campaign sends for their campaigns
CREATE POLICY "Business owners can view their campaign sends"
  ON campaign_sends FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM campaigns
      JOIN businesses ON businesses.id = campaigns.business_id
      WHERE campaigns.id = campaign_sends.campaign_id
      AND auth.uid()::text = businesses.id::text
    )
  );

-- ============================================
-- REFERRALS TABLE POLICIES
-- ============================================

-- Business owners can view referrals for their business
CREATE POLICY "Business owners can view their referrals"
  ON referrals FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = referrals.business_id
      AND auth.uid()::text = businesses.id::text
    )
  );

-- Business owners can create referrals
CREATE POLICY "Business owners can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = business_id
      AND auth.uid()::text = businesses.id::text
    )
  );

-- Business owners can update referrals
CREATE POLICY "Business owners can update their referrals"
  ON referrals FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = referrals.business_id
      AND auth.uid()::text = businesses.id::text
    )
  );

-- ============================================
-- ANALYTICS_EVENTS TABLE POLICIES
-- ============================================

-- Business owners can view their analytics events
CREATE POLICY "Business owners can view their analytics"
  ON analytics_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = analytics_events.business_id
      AND auth.uid()::text = businesses.id::text
    )
  );

-- ============================================
-- OUTBOX_EVENTS TABLE POLICIES
-- ============================================

-- Service role only (backend workers)
-- No public access to outbox events
CREATE POLICY "Service role can manage outbox events"
  ON outbox_events FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- ============================================
-- ADDITIONAL SECURITY FUNCTIONS
-- ============================================

-- Function to check if user owns a business
CREATE OR REPLACE FUNCTION is_business_owner(business_id_param UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM businesses
    WHERE id = business_id_param
    AND auth.uid()::text = id::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get business from customer
CREATE OR REPLACE FUNCTION get_customer_business(customer_id_param UUID)
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT business_id FROM customers
    WHERE id = customer_id_param
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
