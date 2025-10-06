-- ============================================
-- QR VISIT TRACKING RPC FUNCTION
-- ============================================
-- Date: 2025-01-12
-- Purpose: Track QR page visits for completion triggers
-- Dependencies: businesses table, checklist system

-- Function to increment QR page visit count
CREATE OR REPLACE FUNCTION increment_qr_page_visits(p_business_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE businesses
  SET
    qr_page_visit_count = COALESCE(qr_page_visit_count, 0) + 1,
    qr_last_visited_at = NOW()
  WHERE id = p_business_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment for documentation
COMMENT ON FUNCTION increment_qr_page_visits(UUID) IS 'Increments QR page visit count and triggers auto-completion at 2 visits';
