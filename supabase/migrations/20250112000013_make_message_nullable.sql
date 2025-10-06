-- ============================================
-- MAKE MESSAGE COLUMN NULLABLE
-- ============================================
-- Date: 2025-01-12
-- Purpose: Make legacy 'message' column nullable since we use 'message_template' now
-- Issue: NOT NULL constraint on 'message' column causing 23502 error
-- Error: Frontend sends message_template but message is still required as NOT NULL

-- Make message column nullable (we use message_template now)
ALTER TABLE campaigns
  ALTER COLUMN message DROP NOT NULL;

-- Set message to message_template for any existing NULL messages
UPDATE campaigns
SET message = COALESCE(message, message_template, '')
WHERE message IS NULL;

-- Add comment to clarify
COMMENT ON COLUMN campaigns.message IS 'Legacy message column - use message_template for new campaigns (nullable for backwards compatibility)';
