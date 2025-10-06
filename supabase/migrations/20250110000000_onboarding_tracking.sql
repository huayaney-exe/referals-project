-- ============================================
-- ONBOARDING TRACKING - SUPABASE MIGRATION
-- ============================================
-- Date: 2025-01-10
-- Description: Add onboarding tracking fields and tables

-- Add onboarding fields to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS card_design JSONB DEFAULT '{}'::jsonb;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS brand_colors JSONB DEFAULT '{"primary": "#A855F7", "accent": "#F97316"}'::jsonb;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS background_image_url TEXT;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS qr_downloaded BOOLEAN DEFAULT FALSE;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS qr_downloaded_at TIMESTAMPTZ;

-- Create onboarding progress tracking table
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  step_number INT NOT NULL CHECK (step_number BETWEEN 1 AND 4),
  step_name VARCHAR(50) NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  time_spent_seconds INT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_onboarding_business ON onboarding_progress(business_id);
CREATE INDEX idx_onboarding_completed ON onboarding_progress(business_id, completed);

-- Enable RLS
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Business owners can view their onboarding progress"
  ON onboarding_progress FOR SELECT
  TO authenticated
  USING (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

CREATE POLICY "Business owners can create their onboarding progress"
  ON onboarding_progress FOR INSERT
  TO authenticated
  WITH CHECK (
    business_id = (auth.jwt() -> 'user_metadata' ->> 'business_id')::uuid
  );

CREATE POLICY "Service role can manage all onboarding progress"
  ON onboarding_progress FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create function to mark onboarding as complete
CREATE OR REPLACE FUNCTION complete_onboarding(p_business_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE businesses
  SET
    onboarding_completed = true,
    onboarding_completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to track onboarding step completion
CREATE OR REPLACE FUNCTION track_onboarding_step(
  p_business_id UUID,
  p_step_number INT,
  p_step_name VARCHAR(50),
  p_time_spent_seconds INT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
  v_progress_id UUID;
BEGIN
  INSERT INTO onboarding_progress (
    business_id,
    step_number,
    step_name,
    completed,
    completed_at,
    time_spent_seconds,
    metadata
  )
  VALUES (
    p_business_id,
    p_step_number,
    p_step_name,
    true,
    NOW(),
    p_time_spent_seconds,
    p_metadata
  )
  RETURNING id INTO v_progress_id;

  RETURN v_progress_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add indexes for performance
CREATE INDEX idx_businesses_onboarding ON businesses(onboarding_completed);
CREATE INDEX idx_onboarding_step ON onboarding_progress(step_number);

-- Comments for documentation
COMMENT ON COLUMN businesses.onboarding_completed IS 'Whether business has completed initial onboarding wizard';
COMMENT ON COLUMN businesses.card_design IS 'JSON object containing punch card template and customization';
COMMENT ON COLUMN businesses.brand_colors IS 'JSON object with primary and accent brand colors';
COMMENT ON TABLE onboarding_progress IS 'Tracks individual step completion for analytics and recovery';
