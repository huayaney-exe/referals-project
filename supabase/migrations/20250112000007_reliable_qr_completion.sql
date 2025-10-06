-- ============================================
-- RELIABLE QR COMPLETION TRACKING
-- ============================================
-- Date: 2025-01-12
-- Purpose: Fix QR sharing completion with database-driven, single-source-of-truth approach
-- Philosophy: Observe reality (actual data changes), don't track intent (button clicks)
-- Dependencies: businesses, customers, checklist_progress tables

-- ============================================
-- PART 1: ENHANCED AUTO-COMPLETION FUNCTION
-- ============================================

-- Replace the simple auto-completion with comprehensive detection
CREATE OR REPLACE FUNCTION auto_complete_qr_sharing()
RETURNS TRIGGER AS $$
DECLARE
  v_should_complete BOOLEAN := false;
BEGIN
  -- Method 1: QR downloaded via download button
  IF NEW.qr_downloaded = true AND (OLD.qr_downloaded IS NULL OR OLD.qr_downloaded = false) THEN
    v_should_complete := true;
  END IF;

  -- Method 2: QR page visited multiple times (indicates sharing intent)
  IF NEW.qr_page_visit_count >= 2 AND (OLD.qr_page_visit_count < 2 OR OLD.qr_page_visit_count IS NULL) THEN
    v_should_complete := true;
  END IF;

  -- Method 3: First customer enrolled (proves QR was actually shared and used)
  -- This is the ultimate proof the QR was shared successfully
  IF TG_OP = 'INSERT' AND TG_TABLE_NAME = 'customers' THEN
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

-- ============================================
-- PART 2: UPDATE TRIGGERS FOR COMPREHENSIVE DETECTION
-- ============================================

-- Drop and recreate trigger for businesses table
DROP TRIGGER IF EXISTS trigger_qr_sharing_checklist ON businesses;
CREATE TRIGGER trigger_qr_sharing_checklist
  AFTER UPDATE OF qr_downloaded, qr_page_visit_count ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION auto_complete_qr_sharing();

-- NEW: Add trigger on customer enrollment (ultimate proof of QR sharing)
DROP TRIGGER IF EXISTS trigger_first_enrollment_checklist ON customers;
CREATE TRIGGER trigger_first_enrollment_checklist
  AFTER INSERT ON customers
  FOR EACH ROW
  EXECUTE FUNCTION auto_complete_qr_sharing();

-- ============================================
-- PART 3: QR PAGE VIEW TRACKING FUNCTION
-- ============================================

-- Function to track QR page views (safer than direct updates)
CREATE OR REPLACE FUNCTION track_qr_page_view(p_business_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE businesses
  SET
    qr_page_visit_count = COALESCE(qr_page_visit_count, 0) + 1,
    qr_last_visited_at = NOW()
  WHERE id = p_business_id;

  -- Note: The UPDATE trigger will auto-complete task if count reaches 2
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 4: AUDIT LOG FOR DEBUGGING
-- ============================================

-- Create completion audit log for debugging and analytics
CREATE TABLE IF NOT EXISTS checklist_completion_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  task_id VARCHAR(50) NOT NULL REFERENCES checklist_tasks(id),
  completion_method VARCHAR(100), -- e.g., 'qr_downloaded', 'first_enrollment', 'page_visits'
  triggered_by VARCHAR(100), -- e.g., 'trigger_qr_sharing_checklist', 'manual_api_call'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_completion_log_business ON checklist_completion_log(business_id);
CREATE INDEX idx_completion_log_task ON checklist_completion_log(task_id);
CREATE INDEX idx_completion_log_created ON checklist_completion_log(created_at DESC);

-- Enable RLS
ALTER TABLE checklist_completion_log ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Business owners can view their logs
CREATE POLICY "Business owners can view completion logs"
  ON checklist_completion_log FOR SELECT
  TO authenticated
  USING (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

-- RLS Policy: Service role full access
CREATE POLICY "Service role full access to completion logs"
  ON checklist_completion_log FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- PART 5: ENHANCED COMPLETION FUNCTION WITH AUDIT
-- ============================================

-- Upgrade complete_checklist_task to include audit logging
CREATE OR REPLACE FUNCTION complete_checklist_task(
  p_business_id UUID,
  p_task_id VARCHAR(50),
  p_method VARCHAR(100) DEFAULT 'unknown',
  p_triggered_by VARCHAR(100) DEFAULT 'database_trigger'
)
RETURNS void AS $$
DECLARE
  v_was_already_complete BOOLEAN;
BEGIN
  -- Check if already complete
  SELECT completed INTO v_was_already_complete
  FROM checklist_progress
  WHERE business_id = p_business_id AND task_id = p_task_id;

  -- Insert or update completion
  INSERT INTO checklist_progress (business_id, task_id, completed, completed_at)
  VALUES (p_business_id, p_task_id, true, NOW())
  ON CONFLICT (business_id, task_id)
  DO UPDATE SET
    completed = true,
    completed_at = COALESCE(checklist_progress.completed_at, NOW());

  -- Log completion (only if newly completed, avoid spam)
  IF v_was_already_complete IS NULL OR v_was_already_complete = false THEN
    INSERT INTO checklist_completion_log (business_id, task_id, completion_method, triggered_by)
    VALUES (p_business_id, p_task_id, p_method, p_triggered_by);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 6: BACKFILL EXISTING ENROLLMENTS
-- ============================================

-- For existing businesses that have customers but didn't get credit
DO $$
DECLARE
  v_business RECORD;
BEGIN
  FOR v_business IN
    SELECT DISTINCT b.id
    FROM businesses b
    JOIN customers c ON c.business_id = b.id
    WHERE NOT EXISTS (
      SELECT 1 FROM checklist_progress cp
      WHERE cp.business_id = b.id
        AND cp.task_id = 'share_enrollment_qr'
        AND cp.completed = true
    )
  LOOP
    PERFORM complete_checklist_task(
      v_business.id,
      'share_enrollment_qr',
      'backfill_existing_enrollments',
      'migration_20250112000007'
    );
  END LOOP;
END $$;

-- ============================================
-- PART 7: DOCUMENTATION
-- ============================================

COMMENT ON FUNCTION auto_complete_qr_sharing() IS 'Auto-completes share_enrollment_qr task via 3 methods: 1) QR downloaded, 2) QR page visited 2+ times, 3) First customer enrolled';

COMMENT ON FUNCTION track_qr_page_view(UUID) IS 'Safely tracks QR page views and triggers auto-completion at 2 visits';

COMMENT ON TABLE checklist_completion_log IS 'Audit log for checklist task completions - for debugging and analytics';

COMMENT ON FUNCTION complete_checklist_task(UUID, VARCHAR, VARCHAR, VARCHAR) IS 'Idempotent task completion with audit logging. Enhanced with method and trigger tracking';
