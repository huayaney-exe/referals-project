import { StampService } from '../../../src/domains/loyalty/Stamp';
import { BusinessService } from '../../../src/domains/business/Business';
import { CustomerService } from '../../../src/domains/customer/Customer';
import { BusinessLogicError } from '../../../src/domains/types';
import { supabaseAdmin } from '../../../src/config/supabase';

describe('Loyalty Domain', () => {
  let testBusinessId: string;
  let testCustomerId: string;

  beforeAll(async () => {
    const business = await BusinessService.create({
      email: 'loyalty-test@example.com',
      name: 'Test Business',
      reward_structure: { stamps_required: 5, reward_description: '1 free item' },
    });
    testBusinessId = business.id;

    const customer = await CustomerService.create({
      business_id: testBusinessId,
      phone: '+51 987 000 111',
      name: 'Test Customer',
    });
    testCustomerId = customer.id;
  });

  beforeEach(async () => {
    // Only delete stamps and outbox events for this specific customer
    await supabaseAdmin.from('stamps').delete().eq('customer_id', testCustomerId);
    await supabaseAdmin.from('outbox_events').delete().eq('aggregate_id', testCustomerId);
    // Reset customer stamps
    await supabaseAdmin.from('customers').update({ stamps_count: 0, total_rewards_earned: 0 }).eq('id', testCustomerId);
  });

  afterAll(async () => {
    await supabaseAdmin.from('customers').delete().eq('id', testCustomerId);
    await supabaseAdmin.from('businesses').delete().eq('id', testBusinessId);
  });

  describe('addStamp', () => {
    it('should add stamp to customer', async () => {
      const result = await StampService.addStamp(testCustomerId, testBusinessId);

      expect(result.new_stamps_count).toBe(1);
      expect(result.is_reward_earned).toBe(false);
      expect(result.stamp_id).toBeDefined();
    });

    it('should increment stamps count', async () => {
      await StampService.addStamp(testCustomerId, testBusinessId);
      const result = await StampService.addStamp(testCustomerId, testBusinessId);

      expect(result.new_stamps_count).toBe(2);
    });

    it('should reset stamps when reward unlocked', async () => {
      // Add 4 stamps
      await StampService.addStamp(testCustomerId, testBusinessId);
      await StampService.addStamp(testCustomerId, testBusinessId);
      await StampService.addStamp(testCustomerId, testBusinessId);
      await StampService.addStamp(testCustomerId, testBusinessId);

      // 5th stamp should trigger reward
      const result = await StampService.addStamp(testCustomerId, testBusinessId);

      expect(result.new_stamps_count).toBe(0);
      expect(result.is_reward_earned).toBe(true);
    });

    it('should create stamp record in stamps table', async () => {
      const result = await StampService.addStamp(testCustomerId, testBusinessId);

      const { data } = await supabaseAdmin.from('stamps').select('*').eq('id', result.stamp_id).single();
      expect(data).toBeTruthy();
      expect(data?.customer_id).toBe(testCustomerId);
    });

    it('should prevent duplicate stamp with idempotency key', async () => {
      const idempotencyKey = 'test-key-123';

      await StampService.addStamp(testCustomerId, testBusinessId, 'system', idempotencyKey);

      await expect(
        StampService.addStamp(testCustomerId, testBusinessId, 'system', idempotencyKey)
      ).rejects.toThrow(BusinessLogicError);
    });

    it('should insert outbox event for PassKit update', async () => {
      await StampService.addStamp(testCustomerId, testBusinessId);

      const { data } = await supabaseAdmin
        .from('outbox_events')
        .select('*')
        .eq('aggregate_type', 'customer')
        .eq('aggregate_id', testCustomerId)
        .order('created_at', { ascending: false })
        .limit(1);

      expect(data).toHaveLength(1);
      expect(data?.[0].event_type).toBe('stamp_added');
    });
  });

  describe('getHistory', () => {
    it('should get stamp history for customer', async () => {
      await StampService.addStamp(testCustomerId, testBusinessId);
      await StampService.addStamp(testCustomerId, testBusinessId);

      const history = await StampService.getHistory(testCustomerId);
      expect(history).toHaveLength(2);
    });
  });

  describe('countByBusiness', () => {
    it('should count total stamps for business', async () => {
      await StampService.addStamp(testCustomerId, testBusinessId);
      await StampService.addStamp(testCustomerId, testBusinessId);
      await StampService.addStamp(testCustomerId, testBusinessId);

      const count = await StampService.countByBusiness(testBusinessId);
      expect(count).toBe(3);
    });
  });

  describe('countRewards', () => {
    it('should count rewards redeemed', async () => {
      // Add 5 stamps to trigger reward
      for (let i = 0; i < 5; i++) {
        await StampService.addStamp(testCustomerId, testBusinessId);
      }

      const rewardCount = await StampService.countRewards(testBusinessId);
      expect(rewardCount).toBe(1);
    });
  });
});
