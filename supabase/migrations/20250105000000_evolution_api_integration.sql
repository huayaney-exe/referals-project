-- ================================================
-- MIGRATION: Evolution API Integration
-- Description: Add columns to support multi-tenant WhatsApp via Evolution API
-- Date: 2025-01-05
-- ================================================

-- Add Evolution API columns to businesses table
ALTER TABLE businesses
ADD COLUMN evolution_instance_name VARCHAR(100),
ADD COLUMN evolution_whatsapp_number VARCHAR(20),
ADD COLUMN evolution_connected BOOLEAN DEFAULT false,
ADD COLUMN evolution_qr_code TEXT,
ADD COLUMN evolution_connected_at TIMESTAMPTZ;

-- Add index for instance lookups
CREATE INDEX idx_businesses_evolution_instance
ON businesses(evolution_instance_name)
WHERE evolution_instance_name IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN businesses.evolution_instance_name IS 'Unique instance name in Evolution API (format: business_{uuid})';
COMMENT ON COLUMN businesses.evolution_whatsapp_number IS 'WhatsApp number connected to this business (Peru format: +51 9XX XXX XXX)';
COMMENT ON COLUMN businesses.evolution_connected IS 'Whether WhatsApp is currently connected via Evolution API';
COMMENT ON COLUMN businesses.evolution_qr_code IS 'Latest QR code for connecting WhatsApp (base64 encoded)';
COMMENT ON COLUMN businesses.evolution_connected_at IS 'Timestamp when WhatsApp was last successfully connected';

-- Add column to campaign_sends to track Evolution API message IDs
ALTER TABLE campaign_sends
ADD COLUMN evolution_message_id VARCHAR(100);

-- Add index for message ID lookups (for webhook updates)
CREATE INDEX idx_campaign_sends_evolution_id
ON campaign_sends(evolution_message_id)
WHERE evolution_message_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN campaign_sends.evolution_message_id IS 'Message ID returned by Evolution API for delivery tracking';
