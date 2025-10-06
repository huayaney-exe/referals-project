-- ============================================
-- DIAGNOSE QR_CODE_URL COLUMN
-- ============================================
-- Date: 2025-01-12
-- Purpose: Check if qr_code_url column exists and is properly configured

-- Check column information
DO $$
DECLARE
  col_exists BOOLEAN;
  col_type TEXT;
  col_nullable TEXT;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'businesses'
      AND column_name = 'qr_code_url'
  ) INTO col_exists;

  IF col_exists THEN
    SELECT data_type, is_nullable
    INTO col_type, col_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'businesses'
      AND column_name = 'qr_code_url';

    RAISE NOTICE 'Column qr_code_url EXISTS: type=%, nullable=%', col_type, col_nullable;
  ELSE
    RAISE EXCEPTION 'Column qr_code_url DOES NOT EXIST';
  END IF;
END $$;

-- Drop and recreate the column to ensure it's clean
ALTER TABLE businesses DROP COLUMN IF EXISTS qr_code_url;
ALTER TABLE businesses ADD COLUMN qr_code_url TEXT NULL;

-- Update the comment
COMMENT ON COLUMN businesses.qr_code_url IS 'URL to the enrollment QR code image stored in Supabase Storage';

-- Explicitly grant access
GRANT SELECT (qr_code_url) ON businesses TO authenticated;
GRANT SELECT (qr_code_url) ON businesses TO anon;
GRANT UPDATE (qr_code_url) ON businesses TO authenticated;

-- Force schema reload
NOTIFY pgrst, 'reload schema';
NOTIFY pgrst, 'reload config';
