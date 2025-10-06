-- ============================================
-- ONBOARDING CHECKLIST MIGRATION
-- ============================================
-- Date: 2025-01-12
-- Purpose: Guided onboarding with auto-completing checklist
-- Dependencies: businesses, customers, stamps tables
-- Rollback: See end of file

-- Task definitions (static reference data)
CREATE TABLE IF NOT EXISTS checklist_tasks (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INT NOT NULL UNIQUE,
  required BOOLEAN DEFAULT true,
  icon VARCHAR(50),
  action_hint TEXT,  -- Hint for how to complete
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert predefined tasks
INSERT INTO checklist_tasks (id, title, description, order_index, required, icon, action_hint) VALUES
  ('create_card', 'Crear Tarjeta', 'Diseña tu tarjeta de fidelidad personalizada', 1, true, 'credit-card', 'Completa el proceso de onboarding'),
  ('download_qr', 'Descargar QR', 'Descarga tu código QR para compartir', 2, true, 'qr-code', 'Visita la página de Código QR y descarga'),
  ('first_customer', 'Inscribir Cliente', 'Inscribe tu primer cliente al programa', 3, true, 'user-plus', 'Comparte tu QR o inscribe manualmente'),
  ('first_stamp', 'Dar Primer Sello', 'Otorga tu primer sello de fidelidad', 4, true, 'stamp', 'Usa el Scanner o página de Clientes'),
  ('share_social', 'Compartir en Redes', 'Comparte tu QR en redes sociales', 5, false, 'share-2', 'Descarga el QR y compártelo en tus redes')
ON CONFLICT (id) DO NOTHING;

-- Track individual business progress
CREATE TABLE IF NOT EXISTS checklist_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  task_id VARCHAR(50) NOT NULL REFERENCES checklist_tasks(id),
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(business_id, task_id)
);

-- Indexes for performance
CREATE INDEX idx_checklist_business ON checklist_progress(business_id);
CREATE INDEX idx_checklist_completed ON checklist_progress(business_id, completed);
CREATE INDEX idx_checklist_task ON checklist_progress(task_id) WHERE completed = false;

-- Enable Row Level Security
ALTER TABLE checklist_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Business owners can manage their checklist"
  ON checklist_progress FOR ALL
  TO authenticated
  USING (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  )
  WITH CHECK (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

CREATE POLICY "Service role can manage all checklists"
  ON checklist_progress FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to complete a checklist task (idempotent)
CREATE OR REPLACE FUNCTION complete_checklist_task(
  p_business_id UUID,
  p_task_id VARCHAR(50)
)
RETURNS void AS $$
BEGIN
  INSERT INTO checklist_progress (business_id, task_id, completed, completed_at)
  VALUES (p_business_id, p_task_id, true, NOW())
  ON CONFLICT (business_id, task_id)
  DO UPDATE SET
    completed = true,
    completed_at = COALESCE(checklist_progress.completed_at, NOW());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if all required tasks are complete
CREATE OR REPLACE FUNCTION is_checklist_complete(p_business_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_required_count INT;
  v_completed_count INT;
BEGIN
  -- Count required tasks
  SELECT COUNT(*) INTO v_required_count
  FROM checklist_tasks
  WHERE required = true;

  -- Count completed required tasks
  SELECT COUNT(*) INTO v_completed_count
  FROM checklist_progress cp
  JOIN checklist_tasks ct ON cp.task_id = ct.id
  WHERE cp.business_id = p_business_id
    AND cp.completed = true
    AND ct.required = true;

  RETURN v_completed_count >= v_required_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Get checklist progress percentage
CREATE OR REPLACE FUNCTION get_checklist_progress(p_business_id UUID)
RETURNS TABLE(
  total_tasks INT,
  completed_tasks INT,
  required_tasks INT,
  completed_required_tasks INT,
  progress_percent INT,
  is_complete BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INT FROM checklist_tasks),
    (SELECT COUNT(*)::INT FROM checklist_progress WHERE business_id = p_business_id AND completed = true),
    (SELECT COUNT(*)::INT FROM checklist_tasks WHERE required = true),
    (SELECT COUNT(*)::INT
     FROM checklist_progress cp
     JOIN checklist_tasks ct ON cp.task_id = ct.id
     WHERE cp.business_id = p_business_id
       AND cp.completed = true
       AND ct.required = true),
    (SELECT ROUND((COUNT(*) FILTER (WHERE completed = true)::DECIMAL / COUNT(*)::DECIMAL) * 100)::INT
     FROM checklist_progress WHERE business_id = p_business_id),
    is_checklist_complete(p_business_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Trigger to auto-complete tasks based on actions
CREATE OR REPLACE FUNCTION auto_complete_checklist_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-complete 'first_customer' when customer created
  IF TG_TABLE_NAME = 'customers' THEN
    PERFORM complete_checklist_task(NEW.business_id, 'first_customer');
  END IF;

  -- Auto-complete 'first_stamp' when first stamp issued
  IF TG_TABLE_NAME = 'stamps' THEN
    PERFORM complete_checklist_task(NEW.business_id, 'first_stamp');
  END IF;

  -- Auto-complete 'download_qr' when QR downloaded
  IF TG_TABLE_NAME = 'businesses' AND NEW.qr_downloaded = true AND (OLD.qr_downloaded IS NULL OR OLD.qr_downloaded = false) THEN
    PERFORM complete_checklist_task(NEW.id, 'download_qr');
  END IF;

  -- Auto-complete 'create_card' when onboarding completed
  IF TG_TABLE_NAME = 'businesses' AND NEW.onboarding_completed = true AND (OLD.onboarding_completed IS NULL OR OLD.onboarding_completed = false) THEN
    PERFORM complete_checklist_task(NEW.id, 'create_card');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for automatic task completion
CREATE TRIGGER trigger_checklist_customer
  AFTER INSERT ON customers
  FOR EACH ROW
  EXECUTE FUNCTION auto_complete_checklist_tasks();

CREATE TRIGGER trigger_checklist_stamp
  AFTER INSERT ON stamps
  FOR EACH ROW
  EXECUTE FUNCTION auto_complete_checklist_tasks();

CREATE TRIGGER trigger_checklist_qr
  AFTER UPDATE OF qr_downloaded ON businesses
  FOR EACH ROW
  WHEN (NEW.qr_downloaded = true)
  EXECUTE FUNCTION auto_complete_checklist_tasks();

CREATE TRIGGER trigger_checklist_onboarding
  AFTER UPDATE OF onboarding_completed ON businesses
  FOR EACH ROW
  WHEN (NEW.onboarding_completed = true)
  EXECUTE FUNCTION auto_complete_checklist_tasks();

-- Initialize checklist for existing businesses
DO $$
DECLARE
  v_business RECORD;
BEGIN
  FOR v_business IN SELECT id FROM businesses WHERE onboarding_completed = true
  LOOP
    -- Mark create_card as complete for existing businesses
    PERFORM complete_checklist_task(v_business.id, 'create_card');

    -- Check if they've downloaded QR
    IF EXISTS (SELECT 1 FROM businesses WHERE id = v_business.id AND qr_downloaded = true) THEN
      PERFORM complete_checklist_task(v_business.id, 'download_qr');
    END IF;

    -- Check if they have customers
    IF EXISTS (SELECT 1 FROM customers WHERE business_id = v_business.id LIMIT 1) THEN
      PERFORM complete_checklist_task(v_business.id, 'first_customer');
    END IF;

    -- Check if they've given stamps
    IF EXISTS (SELECT 1 FROM stamps WHERE business_id = v_business.id LIMIT 1) THEN
      PERFORM complete_checklist_task(v_business.id, 'first_stamp');
    END IF;
  END LOOP;
END $$;

-- Comments for documentation
COMMENT ON TABLE checklist_tasks IS 'Defines onboarding checklist tasks for all businesses';
COMMENT ON TABLE checklist_progress IS 'Tracks individual business progress through onboarding checklist';
COMMENT ON COLUMN checklist_tasks.required IS 'Whether task must be completed before checklist is considered done';
COMMENT ON COLUMN checklist_tasks.action_hint IS 'User-facing hint for how to complete the task';
COMMENT ON FUNCTION complete_checklist_task(UUID, VARCHAR) IS 'Idempotently marks a task as complete for a business';
COMMENT ON FUNCTION is_checklist_complete(UUID) IS 'Returns true if all required tasks are complete';
COMMENT ON FUNCTION get_checklist_progress(UUID) IS 'Returns detailed progress statistics for a business';
COMMENT ON FUNCTION auto_complete_checklist_tasks() IS 'Automatically completes tasks when actions are performed';

-- ============================================
-- ROLLBACK INSTRUCTIONS
-- ============================================
-- To rollback this migration, run:
--
-- DROP TRIGGER IF EXISTS trigger_checklist_customer ON customers;
-- DROP TRIGGER IF EXISTS trigger_checklist_stamp ON stamps;
-- DROP TRIGGER IF EXISTS trigger_checklist_qr ON businesses;
-- DROP TRIGGER IF EXISTS trigger_checklist_onboarding ON businesses;
-- DROP FUNCTION IF EXISTS auto_complete_checklist_tasks();
-- DROP FUNCTION IF EXISTS get_checklist_progress(UUID);
-- DROP FUNCTION IF EXISTS is_checklist_complete(UUID);
-- DROP FUNCTION IF EXISTS complete_checklist_task(UUID, VARCHAR);
-- DROP TABLE IF EXISTS checklist_progress CASCADE;
-- DROP TABLE IF EXISTS checklist_tasks CASCADE;
