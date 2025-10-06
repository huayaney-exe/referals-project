-- ============================================
-- ADD QR CODE URL TO BUSINESSES
-- ============================================
-- Date: 2025-01-12
-- Purpose: Add qr_code_url column for enrollment QR codes
-- Dependencies: businesses table

-- Add qr_code_url column to businesses table
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- Comment for documentation
COMMENT ON COLUMN businesses.qr_code_url IS 'URL to the enrollment QR code image stored in Supabase Storage';
