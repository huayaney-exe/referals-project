-- Reengagement Logs Table
-- Track re-engagement campaigns sent to inactive customers

CREATE TABLE IF NOT EXISTS reengagement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Campaign metadata
  inactive_days INTEGER NOT NULL,
  customers_targeted INTEGER NOT NULL DEFAULT 0,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  messages_failed INTEGER NOT NULL DEFAULT 0,

  -- Timestamp
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Index for querying
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for efficient querying
CREATE INDEX idx_reengagement_logs_business_id ON reengagement_logs(business_id);
CREATE INDEX idx_reengagement_logs_sent_at ON reengagement_logs(sent_at DESC);

-- Enable RLS
ALTER TABLE reengagement_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Businesses can view their own reengagement logs"
  ON reengagement_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = reengagement_logs.business_id
      AND auth.uid()::text = businesses.id::text
    )
  );

CREATE POLICY "Service role can manage all reengagement logs"
  ON reengagement_logs FOR ALL
  USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE reengagement_logs IS 'Logs of re-engagement campaigns sent to inactive customers';
COMMENT ON COLUMN reengagement_logs.inactive_days IS 'Number of days of inactivity threshold for targeting';
COMMENT ON COLUMN reengagement_logs.customers_targeted IS 'Number of customers identified as inactive';
COMMENT ON COLUMN reengagement_logs.messages_sent IS 'Number of messages successfully sent';
COMMENT ON COLUMN reengagement_logs.messages_failed IS 'Number of messages that failed to send';
