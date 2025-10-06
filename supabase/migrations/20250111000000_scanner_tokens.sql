-- Scanner Token Management System
-- Allows business owners to create secure scanner access links for employees

-- Business Locations (for multi-location support)
CREATE TABLE IF NOT EXISTS public.business_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Scanner Tokens (employee access tokens)
CREATE TABLE IF NOT EXISTS public.scanner_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  location_id UUID REFERENCES public.business_locations(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER DEFAULT 0
);

-- Scanner Sessions (audit trail)
CREATE TABLE IF NOT EXISTS public.scanner_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scanner_token_id UUID NOT NULL REFERENCES public.scanner_tokens(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  stamps_added INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_locations_business_id ON public.business_locations(business_id);
CREATE INDEX IF NOT EXISTS idx_scanner_tokens_business_id ON public.scanner_tokens(business_id);
CREATE INDEX IF NOT EXISTS idx_scanner_tokens_token ON public.scanner_tokens(token);
CREATE INDEX IF NOT EXISTS idx_scanner_sessions_token_id ON public.scanner_sessions(scanner_token_id);
CREATE INDEX IF NOT EXISTS idx_scanner_sessions_customer_id ON public.scanner_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_scanner_sessions_created_at ON public.scanner_sessions(created_at DESC);

-- RLS Policies for business_locations
ALTER TABLE public.business_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view their locations"
  ON public.business_locations
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE auth.uid()::text = id::text
    )
  );

CREATE POLICY "Business owners can create locations"
  ON public.business_locations
  FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE auth.uid()::text = id::text
    )
  );

CREATE POLICY "Business owners can update their locations"
  ON public.business_locations
  FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE auth.uid()::text = id::text
    )
  );

-- RLS Policies for scanner_tokens
ALTER TABLE public.scanner_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view their scanner tokens"
  ON public.scanner_tokens
  FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE auth.uid()::text = id::text
    )
  );

CREATE POLICY "Business owners can create scanner tokens"
  ON public.scanner_tokens
  FOR INSERT
  WITH CHECK (
    business_id IN (
      SELECT id FROM public.businesses WHERE auth.uid()::text = id::text
    )
    AND created_by = auth.uid()
  );

CREATE POLICY "Business owners can update their scanner tokens"
  ON public.scanner_tokens
  FOR UPDATE
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE auth.uid()::text = id::text
    )
  );

CREATE POLICY "Business owners can delete their scanner tokens"
  ON public.scanner_tokens
  FOR DELETE
  USING (
    business_id IN (
      SELECT id FROM public.businesses WHERE auth.uid()::text = id::text
    )
  );

-- RLS Policies for scanner_sessions
ALTER TABLE public.scanner_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Business owners can view scanner sessions"
  ON public.scanner_sessions
  FOR SELECT
  USING (
    scanner_token_id IN (
      SELECT id FROM public.scanner_tokens
      WHERE business_id IN (
        SELECT id FROM public.businesses WHERE auth.uid()::text = id::text
      )
    )
  );

-- Function to validate scanner token (public access)
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

  -- Return valid token with business info
  RETURN QUERY SELECT
    true::BOOLEAN,
    business_record.id,
    business_record.name::TEXT,
    COALESCE(location_record.name::TEXT, NULL::TEXT),
    token_record.id;
END;
$$;

-- Function to generate secure token
CREATE OR REPLACE FUNCTION public.generate_scanner_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  token_value TEXT;
  token_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random token with syt_ prefix
    token_value := 'syt_' || encode(gen_random_bytes(24), 'base64');
    token_value := replace(token_value, '/', '_');
    token_value := replace(token_value, '+', '-');
    token_value := replace(token_value, '=', '');

    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM public.scanner_tokens WHERE token = token_value) INTO token_exists;

    -- Exit loop if token is unique
    EXIT WHEN NOT token_exists;
  END LOOP;

  RETURN token_value;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_business_locations_updated_at
  BEFORE UPDATE ON public.business_locations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
