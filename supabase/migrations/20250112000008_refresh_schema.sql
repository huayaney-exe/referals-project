-- ============================================
-- REFRESH POSTGREST SCHEMA CACHE
-- ============================================
-- Date: 2025-01-12
-- Purpose: Force PostgREST to reload schema after qr_code_url addition
-- Dependencies: 20250112000006_add_qr_code_url.sql

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Verify column exists and is accessible
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'businesses'
      AND column_name = 'qr_code_url'
  ) THEN
    RAISE EXCEPTION 'Column qr_code_url does not exist in businesses table';
  END IF;
END $$;

-- Grant explicit access to the column (in case it's missing)
GRANT SELECT, UPDATE ON businesses TO authenticated;
GRANT SELECT, UPDATE ON businesses TO anon;
