-- Fix add_stamp_with_outbox function to use SECURITY DEFINER
-- This allows the function to insert into outbox_events even when called by authenticated users
-- The function will run with the permissions of the function owner (postgres role)

DROP FUNCTION IF EXISTS add_stamp_with_outbox(UUID, UUID, VARCHAR, VARCHAR);

CREATE OR REPLACE FUNCTION add_stamp_with_outbox(
  p_customer_id UUID,
  p_business_id UUID,
  p_stamped_by VARCHAR(100) DEFAULT 'system',
  p_idempotency_key VARCHAR(255) DEFAULT NULL
)
RETURNS TABLE(
  new_stamps_count INT,
  is_reward_earned BOOLEAN,
  stamp_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER  -- This is the critical change
AS $$
DECLARE
  v_current_stamps INT;
  v_new_stamps INT;
  v_required_stamps INT;
  v_is_reward BOOLEAN := false;
  v_stamp_id UUID;
  v_customer_version INT;
BEGIN
  -- Get current customer state with optimistic lock
  SELECT stamps_count, version INTO v_current_stamps, v_customer_version
  FROM customers
  WHERE id = p_customer_id AND business_id = p_business_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer not found';
  END IF;

  -- Check idempotency
  IF p_idempotency_key IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM stamps WHERE idempotency_key = p_idempotency_key) THEN
      RAISE EXCEPTION 'Duplicate stamp operation';
    END IF;
  END IF;

  -- Get business reward structure
  SELECT (reward_structure->>'stamps_required')::INT INTO v_required_stamps
  FROM businesses
  WHERE id = p_business_id;

  -- Calculate new stamps
  v_new_stamps := v_current_stamps + 1;

  -- Check if reward earned
  IF v_new_stamps >= v_required_stamps THEN
    v_is_reward := true;
    v_new_stamps := 0;
  END IF;

  -- Insert stamp record
  INSERT INTO stamps (
    customer_id,
    business_id,
    stamped_by,
    is_reward_redemption,
    stamps_before,
    stamps_after,
    idempotency_key
  ) VALUES (
    p_customer_id,
    p_business_id,
    p_stamped_by,
    v_is_reward,
    v_current_stamps,
    v_new_stamps,
    p_idempotency_key
  ) RETURNING id INTO v_stamp_id;

  -- Update customer with version check (optimistic locking)
  UPDATE customers
  SET
    stamps_count = v_new_stamps,
    total_rewards_earned = total_rewards_earned + CASE WHEN v_is_reward THEN 1 ELSE 0 END,
    last_stamp_at = NOW(),
    version = version + 1
  WHERE id = p_customer_id AND version = v_customer_version;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Customer version conflict - concurrent update detected';
  END IF;

  -- Insert outbox event for PassKit update
  -- With SECURITY DEFINER, this will succeed even for authenticated users
  INSERT INTO outbox_events (
    aggregate_type,
    aggregate_id,
    event_type,
    payload
  ) VALUES (
    'customer',
    p_customer_id,
    'stamp_added',
    jsonb_build_object(
      'customer_id', p_customer_id,
      'business_id', p_business_id,
      'stamps_count', v_new_stamps,
      'is_reward_earned', v_is_reward
    )
  );

  RETURN QUERY SELECT v_new_stamps, v_is_reward, v_stamp_id;
END;
$$;
