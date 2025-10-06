-- ============================================
-- REFINED ONBOARDING CHECKLIST MIGRATION
-- ============================================
-- Date: 2025-01-12
-- Purpose: Simplified 4-step setup checklist with educational focus
-- Changes:
--   - Remove manual tasks (first_customer, first_stamp, share_social)
--   - Add share_enrollment_qr (critical step 2)
--   - Keep scanner access and campaign creation
--   - Focus on setup actions, not organic outcomes
-- Dependencies: checklist_tasks, checklist_progress, businesses, scanner_tokens, campaigns

-- ============================================
-- PART 1: CLEAN UP OLD TASKS
-- ============================================

-- Remove old tasks that are now notifications
DELETE FROM checklist_progress WHERE task_id IN ('first_customer', 'first_stamp', 'share_social', 'download_qr');
DELETE FROM checklist_tasks WHERE id IN ('first_customer', 'first_stamp', 'share_social', 'download_qr');

-- ============================================
-- PART 2: UPDATE EXISTING TASKS
-- ============================================

-- Update create_card task (step 1)
UPDATE checklist_tasks
SET
  title = 'Crear Tarjeta de Fidelidad',
  description = 'Diseña tu tarjeta personalizada',
  order_index = 1,
  action_hint = 'Completa el diseño en Onboarding'
WHERE id = 'create_card';

-- ============================================
-- PART 3: ADD NEW TASKS
-- ============================================

-- Insert share_enrollment_qr task (step 2) - CRITICAL NEW TASK
INSERT INTO checklist_tasks (id, title, description, order_index, required, icon, action_hint) VALUES
  ('share_enrollment_qr',
   'Compartir QR de Inscripción',
   'Comparte para que clientes se inscriban',
   2,
   true,
   'qr-code',
   'Descarga e imprime, o comparte digitalmente')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  required = EXCLUDED.required,
  icon = EXCLUDED.icon,
  action_hint = EXCLUDED.action_hint;

-- Update create_scanner_access order (step 3)
INSERT INTO checklist_tasks (id, title, description, order_index, required, icon, action_hint) VALUES
  ('create_scanner_access',
   'Crear Acceso para Equipo',
   'Link para que tu equipo dé sellos',
   3,
   true,
   'users',
   'Ve a Acceso Empleados → Crear Nuevo')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  required = EXCLUDED.required,
  icon = EXCLUDED.icon,
  action_hint = EXCLUDED.action_hint;

-- Update create_campaign order (step 4)
INSERT INTO checklist_tasks (id, title, description, order_index, required, icon, action_hint) VALUES
  ('create_campaign',
   'Crear Primera Campaña',
   'Promoción para acelerar inscripciones',
   4,
   true,
   'megaphone',
   'Ve a Campañas → Prueba Doble Puntos')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index,
  required = EXCLUDED.required,
  icon = EXCLUDED.icon,
  action_hint = EXCLUDED.action_hint;

-- ============================================
-- PART 4: ADD TRACKING COLUMNS TO BUSINESSES
-- ============================================

-- Add columns to track QR page visits
ALTER TABLE businesses
ADD COLUMN IF NOT EXISTS qr_page_visit_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS qr_last_visited_at TIMESTAMPTZ;

-- ============================================
-- PART 5: AUTO-COMPLETION FUNCTIONS
-- ============================================

-- Function to auto-complete share_enrollment_qr task
CREATE OR REPLACE FUNCTION auto_complete_qr_sharing()
RETURNS TRIGGER AS $$
BEGIN
  -- Complete task if QR downloaded OR page visited 2+ times
  IF (NEW.qr_downloaded = true AND (OLD.qr_downloaded IS NULL OR OLD.qr_downloaded = false))
     OR (NEW.qr_page_visit_count >= 2 AND OLD.qr_page_visit_count < 2) THEN
    PERFORM complete_checklist_task(NEW.id, 'share_enrollment_qr');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-complete scanner access creation
CREATE OR REPLACE FUNCTION auto_complete_scanner_access()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM complete_checklist_task(NEW.business_id, 'create_scanner_access');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-complete campaign creation
CREATE OR REPLACE FUNCTION auto_complete_campaign_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only complete if campaign is active (not draft)
  IF NEW.status = 'active' THEN
    PERFORM complete_checklist_task(NEW.business_id, 'create_campaign');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 6: TRIGGERS
-- ============================================

-- Drop old triggers if they exist
DROP TRIGGER IF EXISTS trigger_checklist_customer ON customers;
DROP TRIGGER IF EXISTS trigger_checklist_stamp ON stamps;
DROP TRIGGER IF EXISTS trigger_checklist_qr ON businesses;

-- Create new trigger for QR sharing
DROP TRIGGER IF EXISTS trigger_qr_sharing_checklist ON businesses;
CREATE TRIGGER trigger_qr_sharing_checklist
  AFTER UPDATE OF qr_downloaded, qr_page_visit_count ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION auto_complete_qr_sharing();

-- Create trigger for scanner access creation
DROP TRIGGER IF EXISTS trigger_scanner_access_checklist ON scanner_tokens;
CREATE TRIGGER trigger_scanner_access_checklist
  AFTER INSERT ON scanner_tokens
  FOR EACH ROW
  EXECUTE FUNCTION auto_complete_scanner_access();

-- Create trigger for campaign creation
DROP TRIGGER IF EXISTS trigger_campaign_checklist ON campaigns;
CREATE TRIGGER trigger_campaign_checklist
  AFTER INSERT ON campaigns
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION auto_complete_campaign_creation();

-- ============================================
-- PART 7: BACKFILL EXISTING BUSINESSES
-- ============================================

DO $$
DECLARE
  v_business RECORD;
BEGIN
  FOR v_business IN SELECT id FROM businesses WHERE onboarding_completed = true
  LOOP
    -- Task 1: create_card is already completed (via onboarding_completed trigger)

    -- Task 2: share_enrollment_qr
    -- Mark complete if QR was already downloaded
    IF EXISTS (SELECT 1 FROM businesses WHERE id = v_business.id AND qr_downloaded = true) THEN
      PERFORM complete_checklist_task(v_business.id, 'share_enrollment_qr');
    END IF;

    -- Task 3: create_scanner_access
    -- Mark complete if they have any scanner tokens
    IF EXISTS (SELECT 1 FROM scanner_tokens WHERE business_id = v_business.id LIMIT 1) THEN
      PERFORM complete_checklist_task(v_business.id, 'create_scanner_access');
    END IF;

    -- Task 4: create_campaign
    -- Mark complete if they have any active campaigns
    IF EXISTS (SELECT 1 FROM campaigns WHERE business_id = v_business.id AND status = 'active' LIMIT 1) THEN
      PERFORM complete_checklist_task(v_business.id, 'create_campaign');
    END IF;
  END LOOP;
END $$;

-- ============================================
-- PART 8: COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN businesses.qr_page_visit_count IS 'Number of times business owner visited QR page (for checklist completion)';
COMMENT ON COLUMN businesses.qr_last_visited_at IS 'Last time business owner visited QR page';

COMMENT ON FUNCTION auto_complete_qr_sharing() IS 'Auto-completes share_enrollment_qr task when QR downloaded or page visited 2+ times';
COMMENT ON FUNCTION auto_complete_scanner_access() IS 'Auto-completes create_scanner_access task when first scanner token created';
COMMENT ON FUNCTION auto_complete_campaign_creation() IS 'Auto-completes create_campaign task when first active campaign created';

-- ============================================
-- ROLLBACK INSTRUCTIONS
-- ============================================
-- To rollback this migration, run:
--
-- DROP TRIGGER IF EXISTS trigger_qr_sharing_checklist ON businesses;
-- DROP TRIGGER IF EXISTS trigger_scanner_access_checklist ON scanner_tokens;
-- DROP TRIGGER IF EXISTS trigger_campaign_checklist ON campaigns;
-- DROP FUNCTION IF EXISTS auto_complete_qr_sharing();
-- DROP FUNCTION IF EXISTS auto_complete_scanner_access();
-- DROP FUNCTION IF EXISTS auto_complete_campaign_creation();
-- ALTER TABLE businesses DROP COLUMN IF EXISTS qr_page_visit_count;
-- ALTER TABLE businesses DROP COLUMN IF EXISTS qr_last_visited_at;
-- DELETE FROM checklist_tasks WHERE id = 'share_enrollment_qr';
