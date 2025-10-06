-- ============================================
-- MILESTONES SYSTEM MIGRATION
-- ============================================
-- Date: 2025-01-12
-- Purpose: Progressive achievement system to celebrate business growth
-- Dependencies: businesses, customers, stamps, reward_redemptions, campaigns tables
-- Rollback: See end of file

-- Milestone definitions (static reference data)
CREATE TABLE IF NOT EXISTS milestone_definitions (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  threshold INT NOT NULL CHECK (threshold > 0),
  metric_type VARCHAR(50) NOT NULL CHECK (metric_type IN ('customers', 'stamps', 'rewards', 'campaigns', 'stamps_weekly')),
  tier INT NOT NULL CHECK (tier BETWEEN 1 AND 4),
  celebration_message TEXT NOT NULL,
  celebration_submessage TEXT,
  badge_color VARCHAR(20) NOT NULL,
  order_index INT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert predefined milestones
INSERT INTO milestone_definitions (id, title, description, icon, threshold, metric_type, tier, celebration_message, celebration_submessage, badge_color, order_index) VALUES
  ('customers_5', 'Primera Comunidad', 'Inscribiste 5 clientes en tu programa', 'users', 5, 'customers', 1, '¡5 Clientes Inscritos! 🥉', 'Tu comunidad está creciendo', '#CD7F32', 1),
  ('customers_25', 'Comunidad Establecida', 'Inscribiste 25 clientes activos', 'users', 25, 'customers', 2, '¡25 Clientes! 🥈', 'Tu programa está ganando tracción', '#C0C0C0', 2),
  ('customers_100', 'Comunidad Próspera', 'Inscribiste 100 clientes fieles', 'users', 100, 'customers', 3, '¡100 Clientes! 🥇', 'Tu programa es un éxito comprobado', '#FFD700', 3),
  ('customers_500', 'Líder de Fidelidad', 'Inscribiste 500 clientes', 'users', 500, 'customers', 4, '¡500 Clientes! 💎', 'Eres un líder en programas de fidelidad', '#B9F2FF', 4),
  ('first_reward', 'Primer Premio', 'Primer cliente canjeó su premio', 'gift', 1, 'rewards', 1, '¡Primer Premio Canjeado! 🎁', 'Tu programa está generando valor real', '#CD7F32', 5),
  ('rewards_10', 'Generador de Valor', 'Otorgaste 10 premios a clientes', 'gift', 10, 'rewards', 2, '¡10 Premios Canjeados! 🏆', 'Tus clientes están altamente comprometidos', '#C0C0C0', 6),
  ('rewards_50', 'Máquina de Premios', 'Otorgaste 50 premios', 'gift', 50, 'rewards', 3, '¡50 Premios! 🎯', 'Tu programa genera lealtad excepcional', '#FFD700', 7),
  ('week_10_stamps', 'Semana Activa', 'Otorgaste 10+ sellos en una semana', 'trending-up', 10, 'stamps_weekly', 1, '¡Semana de Alta Actividad! 📈', 'Tu programa está activo y saludable', '#CD7F32', 8),
  ('week_50_stamps', 'Semana Explosiva', 'Otorgaste 50+ sellos en una semana', 'zap', 50, 'stamps_weekly', 2, '¡Semana Explosiva! ⚡', 'Increíble nivel de actividad', '#C0C0C0', 9),
  ('first_campaign', 'Primer Campaña', 'Enviaste tu primera campaña', 'message-circle', 1, 'campaigns', 1, '¡Primera Campaña Enviada! 💬', 'Estás re-engagando clientes activamente', '#CD7F32', 10)
ON CONFLICT (id) DO NOTHING;

-- Business milestone achievements
CREATE TABLE IF NOT EXISTS business_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  milestone_id VARCHAR(50) NOT NULL REFERENCES milestone_definitions(id),
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notified BOOLEAN DEFAULT FALSE,
  notified_at TIMESTAMPTZ,
  metric_value INT NOT NULL CHECK (metric_value > 0),
  metadata JSONB DEFAULT '{}'::jsonb,
  UNIQUE(business_id, milestone_id)
);

-- Indexes for performance
CREATE INDEX idx_milestones_business ON business_milestones(business_id, achieved_at DESC);
CREATE INDEX idx_milestones_achieved ON business_milestones(achieved_at DESC);
CREATE INDEX idx_milestones_notified ON business_milestones(business_id, notified, achieved_at DESC)
WHERE notified = false;
CREATE INDEX idx_milestones_tier ON business_milestones(business_id, milestone_id)
INCLUDE (achieved_at);

-- Enable Row Level Security
ALTER TABLE business_milestones ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Business owners can view their milestones"
  ON business_milestones FOR SELECT
  TO authenticated
  USING (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

CREATE POLICY "Service role can manage all milestones"
  ON business_milestones FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Function to check and award milestones (idempotent)
CREATE OR REPLACE FUNCTION check_milestones(p_business_id UUID)
RETURNS SETOF business_milestones AS $$
DECLARE
  v_customer_count INT;
  v_reward_count INT;
  v_campaign_count INT;
  v_weekly_stamps INT;
  v_milestone RECORD;
  v_new_milestone business_milestones;
BEGIN
  -- Get current metrics
  SELECT COUNT(*) INTO v_customer_count
  FROM customers
  WHERE business_id = p_business_id;

  SELECT COUNT(*) INTO v_reward_count
  FROM reward_redemptions
  WHERE business_id = p_business_id;

  SELECT COUNT(*) INTO v_campaign_count
  FROM campaigns
  WHERE business_id = p_business_id AND status = 'completed';

  SELECT COUNT(*) INTO v_weekly_stamps
  FROM stamps
  WHERE business_id = p_business_id
    AND stamped_at >= DATE_TRUNC('week', NOW());

  -- Check each milestone definition
  FOR v_milestone IN SELECT * FROM milestone_definitions ORDER BY threshold
  LOOP
    -- Determine if milestone is achieved
    IF (
      (v_milestone.metric_type = 'customers' AND v_customer_count >= v_milestone.threshold) OR
      (v_milestone.metric_type = 'rewards' AND v_reward_count >= v_milestone.threshold) OR
      (v_milestone.metric_type = 'campaigns' AND v_campaign_count >= v_milestone.threshold) OR
      (v_milestone.metric_type = 'stamps_weekly' AND v_weekly_stamps >= v_milestone.threshold)
    ) THEN
      -- Try to insert milestone (idempotent with ON CONFLICT)
      INSERT INTO business_milestones (
        business_id,
        milestone_id,
        metric_value,
        notified,
        metadata
      ) VALUES (
        p_business_id,
        v_milestone.id,
        CASE
          WHEN v_milestone.metric_type = 'customers' THEN v_customer_count
          WHEN v_milestone.metric_type = 'rewards' THEN v_reward_count
          WHEN v_milestone.metric_type = 'campaigns' THEN v_campaign_count
          WHEN v_milestone.metric_type = 'stamps_weekly' THEN v_weekly_stamps
        END,
        false,
        jsonb_build_object(
          'metric_type', v_milestone.metric_type,
          'threshold', v_milestone.threshold,
          'actual_value', CASE
            WHEN v_milestone.metric_type = 'customers' THEN v_customer_count
            WHEN v_milestone.metric_type = 'rewards' THEN v_reward_count
            WHEN v_milestone.metric_type = 'campaigns' THEN v_campaign_count
            WHEN v_milestone.metric_type = 'stamps_weekly' THEN v_weekly_stamps
          END
        )
      )
      ON CONFLICT (business_id, milestone_id) DO NOTHING
      RETURNING * INTO v_new_milestone;

      -- Return newly achieved milestone
      IF v_new_milestone.id IS NOT NULL THEN
        RETURN NEXT v_new_milestone;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark milestone as notified
CREATE OR REPLACE FUNCTION mark_milestone_notified(p_milestone_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE business_milestones
  SET notified = true, notified_at = NOW()
  WHERE id = p_milestone_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get business milestone summary
CREATE OR REPLACE FUNCTION get_milestone_summary(p_business_id UUID)
RETURNS TABLE(
  total_milestones INT,
  achieved_milestones INT,
  bronze_count INT,
  silver_count INT,
  gold_count INT,
  platinum_count INT,
  latest_milestone VARCHAR(255),
  latest_achieved_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INT FROM milestone_definitions),
    (SELECT COUNT(*)::INT FROM business_milestones WHERE business_id = p_business_id),
    (SELECT COUNT(*)::INT
     FROM business_milestones bm
     JOIN milestone_definitions md ON bm.milestone_id = md.id
     WHERE bm.business_id = p_business_id AND md.tier = 1),
    (SELECT COUNT(*)::INT
     FROM business_milestones bm
     JOIN milestone_definitions md ON bm.milestone_id = md.id
     WHERE bm.business_id = p_business_id AND md.tier = 2),
    (SELECT COUNT(*)::INT
     FROM business_milestones bm
     JOIN milestone_definitions md ON bm.milestone_id = md.id
     WHERE bm.business_id = p_business_id AND md.tier = 3),
    (SELECT COUNT(*)::INT
     FROM business_milestones bm
     JOIN milestone_definitions md ON bm.milestone_id = md.id
     WHERE bm.business_id = p_business_id AND md.tier = 4),
    (SELECT md.title
     FROM business_milestones bm
     JOIN milestone_definitions md ON bm.milestone_id = md.id
     WHERE bm.business_id = p_business_id
     ORDER BY bm.achieved_at DESC
     LIMIT 1),
    (SELECT bm.achieved_at
     FROM business_milestones bm
     WHERE bm.business_id = p_business_id
     ORDER BY bm.achieved_at DESC
     LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Trigger to check milestones on relevant events
CREATE OR REPLACE FUNCTION trigger_milestone_check()
RETURNS TRIGGER AS $$
BEGIN
  -- Check milestones asynchronously (won't block the transaction)
  PERFORM check_milestones(NEW.business_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic milestone checking
CREATE TRIGGER trigger_milestone_check_customer
  AFTER INSERT ON customers
  FOR EACH ROW
  EXECUTE FUNCTION trigger_milestone_check();

CREATE TRIGGER trigger_milestone_check_redemption
  AFTER INSERT ON reward_redemptions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_milestone_check();

CREATE TRIGGER trigger_milestone_check_campaign
  AFTER UPDATE OF status ON campaigns
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION trigger_milestone_check();

CREATE TRIGGER trigger_milestone_check_stamp
  AFTER INSERT ON stamps
  FOR EACH ROW
  EXECUTE FUNCTION trigger_milestone_check();

-- Initialize milestones for existing businesses
DO $$
DECLARE
  v_business RECORD;
BEGIN
  FOR v_business IN SELECT id FROM businesses
  LOOP
    PERFORM check_milestones(v_business.id);
  END LOOP;
END $$;

-- Comments for documentation
COMMENT ON TABLE milestone_definitions IS 'Defines all possible milestones businesses can achieve';
COMMENT ON TABLE business_milestones IS 'Tracks which milestones each business has achieved';
COMMENT ON COLUMN milestone_definitions.tier IS '1=bronze, 2=silver, 3=gold, 4=platinum';
COMMENT ON COLUMN milestone_definitions.metric_type IS 'Type of metric: customers, stamps, rewards, campaigns, stamps_weekly';
COMMENT ON COLUMN business_milestones.notified IS 'Whether business owner has been shown celebration for this milestone';
COMMENT ON COLUMN business_milestones.metric_value IS 'Actual metric value when milestone was achieved';
COMMENT ON FUNCTION check_milestones(UUID) IS 'Checks and awards all applicable milestones for a business';
COMMENT ON FUNCTION mark_milestone_notified(UUID) IS 'Marks a milestone as notified to prevent duplicate celebrations';
COMMENT ON FUNCTION get_milestone_summary(UUID) IS 'Returns milestone achievement statistics for a business';
COMMENT ON FUNCTION trigger_milestone_check() IS 'Automatically checks for new milestones when actions occur';

-- ============================================
-- ROLLBACK INSTRUCTIONS
-- ============================================
-- To rollback this migration, run:
--
-- DROP TRIGGER IF EXISTS trigger_milestone_check_customer ON customers;
-- DROP TRIGGER IF EXISTS trigger_milestone_check_redemption ON reward_redemptions;
-- DROP TRIGGER IF EXISTS trigger_milestone_check_campaign ON campaigns;
-- DROP TRIGGER IF EXISTS trigger_milestone_check_stamp ON stamps;
-- DROP FUNCTION IF EXISTS trigger_milestone_check();
-- DROP FUNCTION IF EXISTS get_milestone_summary(UUID);
-- DROP FUNCTION IF EXISTS mark_milestone_notified(UUID);
-- DROP FUNCTION IF EXISTS check_milestones(UUID);
-- DROP TABLE IF EXISTS business_milestones CASCADE;
-- DROP TABLE IF EXISTS milestone_definitions CASCADE;
