-- ============================================
-- LOYALTY PLATFORM PERU - DATABASE SCHEMA
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BUSINESSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  category VARCHAR(100),
  reward_structure JSONB NOT NULL DEFAULT '{"stamps_required": 10, "reward_description": "1 producto gratis"}'::jsonb,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  version INT DEFAULT 1
);

CREATE INDEX idx_businesses_email ON businesses(email);
CREATE INDEX idx_businesses_is_active ON businesses(is_active);
CREATE INDEX idx_businesses_created_at ON businesses(created_at DESC);

-- ============================================
-- CUSTOMERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  stamps_count INT DEFAULT 0 CHECK (stamps_count >= 0),
  total_rewards_earned INT DEFAULT 0,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  last_stamp_at TIMESTAMPTZ,
  pass_serial_number VARCHAR(255) UNIQUE,
  pass_url TEXT,
  version INT DEFAULT 1,
  UNIQUE(business_id, phone)
);

CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_stamps_count ON customers(stamps_count);
CREATE INDEX idx_customers_enrolled_at ON customers(enrolled_at DESC);
CREATE INDEX idx_customers_pass_serial ON customers(pass_serial_number);

-- ============================================
-- STAMPS TABLE (Audit Trail)
-- ============================================
CREATE TABLE IF NOT EXISTS stamps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  stamped_at TIMESTAMPTZ DEFAULT NOW(),
  stamped_by VARCHAR(100),
  is_reward_redemption BOOLEAN DEFAULT false,
  stamps_before INT NOT NULL,
  stamps_after INT NOT NULL,
  idempotency_key VARCHAR(255) UNIQUE,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_stamps_customer ON stamps(customer_id);
CREATE INDEX idx_stamps_business ON stamps(business_id);
CREATE INDEX idx_stamps_stamped_at ON stamps(stamped_at DESC);
CREATE INDEX idx_stamps_idempotency ON stamps(idempotency_key);

-- Partition by month for scalability (Year 3: 9.9M stamps)
-- Will be enabled when needed: PARTITION BY RANGE (stamped_at);

-- ============================================
-- CAMPAIGNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  target_segment JSONB NOT NULL DEFAULT '{"min_stamps": 0, "max_stamps": null}'::jsonb,
  scheduled_for TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'completed', 'failed')),
  sent_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_campaigns_business ON campaigns(business_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_scheduled_for ON campaigns(scheduled_for);

-- ============================================
-- CAMPAIGN_SENDS TABLE (WhatsApp Send Tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  sent_at TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  twilio_message_sid VARCHAR(255),
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_campaign_sends_campaign ON campaign_sends(campaign_id);
CREATE INDEX idx_campaign_sends_customer ON campaign_sends(customer_id);
CREATE INDEX idx_campaign_sends_status ON campaign_sends(status);

-- ============================================
-- REFERRALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  referrer_customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  referred_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  referred_phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  bonus_stamps INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_referrals_business ON referrals(business_id);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_customer_id);
CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_status ON referrals(status);

-- ============================================
-- ANALYTICS_EVENTS TABLE (Future Phase)
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_business ON analytics_events(business_id);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);

-- ============================================
-- TRANSACTIONAL OUTBOX TABLE (Data Consistency)
-- ============================================
CREATE TABLE IF NOT EXISTS outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type VARCHAR(100) NOT NULL,
  aggregate_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  retry_count INT DEFAULT 0,
  error_message TEXT
);

CREATE INDEX idx_outbox_status ON outbox_events(status, created_at);
CREATE INDEX idx_outbox_aggregate ON outbox_events(aggregate_type, aggregate_id);

-- ============================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ADD STAMP WITH OUTBOX PATTERN (Stored Procedure)
-- ============================================
CREATE OR REPLACE FUNCTION add_stamp_with_outbox(
  p_customer_id UUID,
  p_business_id UUID,
  p_stamped_by VARCHAR(100) DEFAULT 'system',
  p_idempotency_key VARCHAR(255) DEFAULT NULL
)
RETURNS TABLE(
  new_stamps_count INT,
  is_reward_earned BOOLEAN,
  stamp_id UUID
) AS $$
DECLARE
  v_current_stamps INT;
  v_new_stamps INT;
  v_required_stamps INT;
  v_is_reward BOOLEAN := false;
  v_stamp_id UUID;
  v_customer_version INT;
BEGIN
  -- Get current customer state with optimistic lock
  SELECT stamps_count, version INTO v_current_stamps, v_customer_version
  FROM customers
  WHERE id = p_customer_id AND business_id = p_business_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer not found';
  END IF;

  -- Check idempotency
  IF p_idempotency_key IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM stamps WHERE idempotency_key = p_idempotency_key) THEN
      RAISE EXCEPTION 'Duplicate stamp operation';
    END IF;
  END IF;

  -- Get business reward structure
  SELECT (reward_structure->>'stamps_required')::INT INTO v_required_stamps
  FROM businesses
  WHERE id = p_business_id;

  -- Calculate new stamps
  v_new_stamps := v_current_stamps + 1;

  -- Check if reward earned
  IF v_new_stamps >= v_required_stamps THEN
    v_is_reward := true;
    v_new_stamps := 0;
  END IF;

  -- Insert stamp record
  INSERT INTO stamps (
    customer_id,
    business_id,
    stamped_by,
    is_reward_redemption,
    stamps_before,
    stamps_after,
    idempotency_key
  ) VALUES (
    p_customer_id,
    p_business_id,
    p_stamped_by,
    v_is_reward,
    v_current_stamps,
    v_new_stamps,
    p_idempotency_key
  ) RETURNING id INTO v_stamp_id;

  -- Update customer with version check (optimistic locking)
  UPDATE customers
  SET
    stamps_count = v_new_stamps,
    total_rewards_earned = total_rewards_earned + CASE WHEN v_is_reward THEN 1 ELSE 0 END,
    last_stamp_at = NOW(),
    version = version + 1
  WHERE id = p_customer_id AND version = v_customer_version;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer version conflict - concurrent update detected';
  END IF;

  -- Insert outbox event for PassKit update
  INSERT INTO outbox_events (
    aggregate_type,
    aggregate_id,
    event_type,
    payload
  ) VALUES (
    'customer',
    p_customer_id,
    'stamp_added',
    jsonb_build_object(
      'customer_id', p_customer_id,
      'business_id', p_business_id,
      'stamps_count', v_new_stamps,
      'is_reward_earned', v_is_reward
    )
  );

  RETURN QUERY SELECT v_new_stamps, v_is_reward, v_stamp_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SAMPLE DATA FOR TESTING (Optional)
-- ============================================
-- Uncomment to insert sample business for testing
/*
INSERT INTO businesses (email, name, phone, category, reward_structure)
VALUES (
  'test@cafeteria.com',
  'Cafetería Central',
  '+51987654321',
  'Comida y Bebidas',
  '{"stamps_required": 10, "reward_description": "1 café gratis"}'::jsonb
);
*/
