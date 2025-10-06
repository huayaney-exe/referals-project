-- ============================================
-- REWARD REDEMPTION NOTIFICATIONS MIGRATION
-- ============================================
-- Date: 2025-01-12
-- Purpose: Enable real-time reward redemption notifications for business owners
-- Dependencies: stamps table with is_reward_redemption field
-- Rollback: See end of file

-- Track reward redemptions for real-time notifications
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  stamp_id UUID NOT NULL REFERENCES stamps(id) ON DELETE CASCADE,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(stamp_id)  -- One redemption per stamp
);

-- Indexes for efficient queries
CREATE INDEX idx_redemptions_business ON reward_redemptions(business_id, redeemed_at DESC);
CREATE INDEX idx_redemptions_notified ON reward_redemptions(business_id, notified)
WHERE notified = false;
CREATE INDEX idx_redemptions_customer ON reward_redemptions(customer_id);

-- Enable Row Level Security
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Business owners can view their reward redemptions"
  ON reward_redemptions FOR SELECT
  TO authenticated
  USING (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

CREATE POLICY "Service role can manage all reward redemptions"
  ON reward_redemptions FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to record redemption (called automatically by trigger)
CREATE OR REPLACE FUNCTION record_reward_redemption()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create redemption record for reward redemptions
  IF NEW.is_reward_redemption = true THEN
    INSERT INTO reward_redemptions (
      business_id,
      customer_id,
      stamp_id,
      notified,
      metadata
    ) VALUES (
      NEW.business_id,
      NEW.customer_id,
      NEW.id,
      false,
      jsonb_build_object(
        'stamps_before', NEW.stamps_before,
        'stamps_after', NEW.stamps_after,
        'stamped_by', NEW.stamped_by
      )
    )
    ON CONFLICT (stamp_id) DO NOTHING;  -- Idempotent
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create redemption records
CREATE TRIGGER trigger_reward_redemption
  AFTER INSERT ON stamps
  FOR EACH ROW
  WHEN (NEW.is_reward_redemption = true)
  EXECUTE FUNCTION record_reward_redemption();

-- Function to mark redemption as notified
CREATE OR REPLACE FUNCTION mark_redemption_notified(p_redemption_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE reward_redemptions
  SET notified = true, notified_at = NOW()
  WHERE id = p_redemption_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comments for documentation
COMMENT ON TABLE reward_redemptions IS 'Tracks reward redemptions for real-time business owner notifications and analytics';
COMMENT ON COLUMN reward_redemptions.notified IS 'Whether business owner has been notified of this redemption via toast/modal';
COMMENT ON COLUMN reward_redemptions.stamp_id IS 'Reference to the stamp that triggered the reward redemption';
COMMENT ON FUNCTION record_reward_redemption() IS 'Automatically creates redemption record when customer earns a reward';
COMMENT ON FUNCTION mark_redemption_notified(UUID) IS 'Marks a redemption as notified to prevent duplicate notifications';

-- ============================================
-- ROLLBACK INSTRUCTIONS
-- ============================================
-- To rollback this migration, run:
--
-- DROP TRIGGER IF EXISTS trigger_reward_redemption ON stamps;
-- DROP FUNCTION IF EXISTS record_reward_redemption();
-- DROP FUNCTION IF EXISTS mark_redemption_notified(UUID);
-- DROP TABLE IF EXISTS reward_redemptions CASCADE;
