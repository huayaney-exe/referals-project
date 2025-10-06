-- Analytics Snapshots Table
-- Daily, weekly, monthly aggregated metrics for performance tracking

CREATE TABLE IF NOT EXISTS analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Snapshot metadata
  snapshot_date DATE NOT NULL,
  period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),

  -- Customer metrics
  total_customers INTEGER NOT NULL DEFAULT 0,
  new_customers INTEGER NOT NULL DEFAULT 0,
  active_customers INTEGER NOT NULL DEFAULT 0,
  churned_customers INTEGER NOT NULL DEFAULT 0,

  -- Stamp metrics
  total_stamps_issued INTEGER NOT NULL DEFAULT 0,
  total_stamps_redeemed INTEGER NOT NULL DEFAULT 0,
  avg_stamps_per_customer DECIMAL(10, 2) DEFAULT 0,

  -- Campaign metrics
  campaigns_sent INTEGER NOT NULL DEFAULT 0,
  campaign_messages_sent INTEGER NOT NULL DEFAULT 0,
  campaign_success_rate DECIMAL(5, 2) DEFAULT 0,

  -- Engagement metrics
  enrollment_rate DECIMAL(5, 2) DEFAULT 0,
  redemption_rate DECIMAL(5, 2) DEFAULT 0,
  avg_days_to_redemption DECIMAL(10, 2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Constraints
  UNIQUE (business_id, snapshot_date, period_type)
);

-- Indexes for efficient querying
CREATE INDEX idx_analytics_snapshots_business_id ON analytics_snapshots(business_id);
CREATE INDEX idx_analytics_snapshots_date ON analytics_snapshots(snapshot_date);
CREATE INDEX idx_analytics_snapshots_period ON analytics_snapshots(period_type);
CREATE INDEX idx_analytics_snapshots_business_date ON analytics_snapshots(business_id, snapshot_date DESC);

-- Enable RLS
ALTER TABLE analytics_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Businesses can view their own analytics"
  ON analytics_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = analytics_snapshots.business_id
      AND auth.uid()::text = businesses.id::text
    )
  );

CREATE POLICY "Service role can manage all analytics"
  ON analytics_snapshots FOR ALL
  USING (auth.role() = 'service_role');

-- Comments
COMMENT ON TABLE analytics_snapshots IS 'Aggregated business metrics for daily, weekly, and monthly reporting';
COMMENT ON COLUMN analytics_snapshots.period_type IS 'Aggregation period: daily, weekly, or monthly';
COMMENT ON COLUMN analytics_snapshots.total_customers IS 'Total customers at snapshot date';
COMMENT ON COLUMN analytics_snapshots.new_customers IS 'New customers enrolled in period';
COMMENT ON COLUMN analytics_snapshots.active_customers IS 'Customers with activity in period';
COMMENT ON COLUMN analytics_snapshots.churned_customers IS 'Customers with no activity for 90+ days';
COMMENT ON COLUMN analytics_snapshots.campaign_success_rate IS 'Percentage of successful campaign message sends';
COMMENT ON COLUMN analytics_snapshots.enrollment_rate IS 'New enrollments / total customers (%)';
COMMENT ON COLUMN analytics_snapshots.redemption_rate IS 'Stamps redeemed / stamps issued (%)';
