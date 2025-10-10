-- ============================================
-- FIX CUSTOMER ENROLLMENT TRIGGER ERROR
-- ============================================
-- Date: 2025-01-13
-- Issue: auto_complete_qr_sharing() trigger fails on customer INSERT
-- Error: record "new" has no field "qr_downloaded"
-- Root Cause: Function tries to access NEW.qr_downloaded on customers table
-- Fix: Add table-specific logic to only check qr_downloaded for businesses table

-- Replace the buggy function with table-aware version
CREATE OR REPLACE FUNCTION auto_complete_qr_sharing()
RETURNS TRIGGER AS $$
DECLARE
  v_should_complete BOOLEAN := false;
BEGIN
  -- Method 1: QR downloaded via download button (BUSINESSES TABLE ONLY)
  IF TG_TABLE_NAME = 'businesses' THEN
    IF NEW.qr_downloaded = true AND (OLD.qr_downloaded IS NULL OR OLD.qr_downloaded = false) THEN
      v_should_complete := true;
    END IF;

    -- Method 2: QR page visited multiple times (BUSINESSES TABLE ONLY)
    IF NEW.qr_page_visit_count >= 2 AND (OLD.qr_page_visit_count < 2 OR OLD.qr_page_visit_count IS NULL) THEN
      v_should_complete := true;
    END IF;
  END IF;

  -- Method 3: First customer enrolled (CUSTOMERS TABLE)
  -- This is the ultimate proof the QR was shared successfully
  IF TG_TABLE_NAME = 'customers' THEN
    v_should_complete := true;
  END IF;

  -- Complete task if any method triggered
  IF v_should_complete THEN
    PERFORM complete_checklist_task(
      CASE
        WHEN TG_TABLE_NAME = 'customers' THEN NEW.business_id
        ELSE NEW.id
      END,
      'share_enrollment_qr'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION auto_complete_qr_sharing() IS 'Table-aware auto-completion: businesses (qr_downloaded, page_visits) OR customers (enrollment proof). Fixed to avoid qr_downloaded access on customers table.';
