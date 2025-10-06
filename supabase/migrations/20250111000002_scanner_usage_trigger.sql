-- Scanner Token Usage Counter Trigger
-- Automatically increments usage_count when scanner sessions are created
-- Eliminates race condition from manual fetch-then-update pattern

-- Function to increment usage_count atomically
CREATE OR REPLACE FUNCTION increment_scanner_usage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update scanner token stats atomically
  UPDATE scanner_tokens
  SET
    usage_count = usage_count + 1,
    last_used_at = NEW.created_at
  WHERE id = NEW.scanner_token_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger fires after each scanner session insert
CREATE TRIGGER update_scanner_usage
AFTER INSERT ON scanner_sessions
FOR EACH ROW
EXECUTE FUNCTION increment_scanner_usage();

-- Add comment for documentation
COMMENT ON FUNCTION increment_scanner_usage() IS
'Automatically increments scanner_tokens.usage_count when a new scanner_session is created. Ensures atomic updates without race conditions.';
