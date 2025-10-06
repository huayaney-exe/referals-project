-- Fix validate_scanner_token function to cast VARCHAR to TEXT
CREATE OR REPLACE FUNCTION public.validate_scanner_token(token_string TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  business_id UUID,
  business_name TEXT,
  location_name TEXT,
  token_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  token_record public.scanner_tokens%ROWTYPE;
  business_record public.businesses%ROWTYPE;
  location_record public.business_locations%ROWTYPE;
BEGIN
  -- Find the token
  SELECT * INTO token_record
  FROM public.scanner_tokens
  WHERE token = token_string;

  -- Token not found
  IF NOT FOUND THEN
    RETURN QUERY SELECT false::BOOLEAN, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Check if token is active
  IF NOT token_record.is_active THEN
    RETURN QUERY SELECT false::BOOLEAN, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Check if token is expired
  IF token_record.expires_at IS NOT NULL AND token_record.expires_at < CURRENT_TIMESTAMP THEN
    RETURN QUERY SELECT false::BOOLEAN, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Get business info
  SELECT * INTO business_record
  FROM public.businesses
  WHERE id = token_record.business_id;

  -- Get location info if exists
  IF token_record.location_id IS NOT NULL THEN
    SELECT * INTO location_record
    FROM public.business_locations
    WHERE id = token_record.location_id;
  END IF;

  -- Return valid token with business info (cast VARCHAR to TEXT)
  RETURN QUERY SELECT
    true::BOOLEAN,
    business_record.id,
    business_record.name::TEXT,
    COALESCE(location_record.name::TEXT, NULL::TEXT),
    token_record.id;
END;
$$;
