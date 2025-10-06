-- ============================================
-- ADD CAMPAIGN TRIGGER FIELDS
-- ============================================
-- Date: 2025-01-12
-- Purpose: Add trigger_type, trigger_config, and message_template columns to campaigns table
-- Issue: Frontend sends these fields but database schema doesn't have them
-- Error: PGRST204 (Column not found) when creating campaigns

-- Add missing columns to campaigns table
ALTER TABLE campaigns
  ADD COLUMN IF NOT EXISTS message_template TEXT,
  ADD COLUMN IF NOT EXISTS trigger_type VARCHAR(100),
  ADD COLUMN IF NOT EXISTS trigger_config JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS activated_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS failed_count INT DEFAULT 0;

-- Migrate existing data from 'message' to 'message_template'
UPDATE campaigns
SET message_template = message
WHERE message_template IS NULL;

-- Update status CHECK constraint to match frontend expectations
ALTER TABLE campaigns DROP CONSTRAINT IF EXISTS campaigns_status_check;
ALTER TABLE campaigns ADD CONSTRAINT campaigns_status_check
  CHECK (status IN ('draft', 'active', 'paused', 'completed', 'failed'));

-- Add comments for documentation
COMMENT ON COLUMN campaigns.message_template IS 'WhatsApp message template with variable placeholders like {nombre}, {sellos}';
COMMENT ON COLUMN campaigns.trigger_type IS 'Event that triggers the campaign: customer_enrolled, stamps_reached, reward_unlocked, days_inactive, stamp_earned';
COMMENT ON COLUMN campaigns.trigger_config IS 'Configuration for the trigger, e.g., {"type": "stamps_reached", "value": 7}';
COMMENT ON COLUMN campaigns.activated_at IS 'Timestamp when campaign was activated';
COMMENT ON COLUMN campaigns.failed_count IS 'Number of failed message sends for this campaign';
