import { AnalyticsService } from '../../../src/domains/analytics/Analytics';
import { BusinessService } from '../../../src/domains/business/Business';
import { CustomerService } from '../../../src/domains/customer/Customer';
import { StampService } from '../../../src/domains/loyalty/Stamp';
import { supabaseAdmin } from '../../../src/config/supabase';

describe('Analytics Domain', () => {
  let testBusinessId: string;

  beforeAll(async () => {
    const business = await BusinessService.create({
      email: 'analytics-test@example.com',
      name: 'Test Business',
      reward_structure: { stamps_required: 10, reward_description: 'Reward' },
    });
    testBusinessId = business.id;
  });

  beforeEach(async () => {
    // Only delete data for this specific business
    await supabaseAdmin.from('stamps').delete().eq('business_id', testBusinessId);
    const { data: customers } = await supabaseAdmin.from('customers').select('id').eq('business_id', testBusinessId);
    if (customers && customers.length > 0) {
      const customerIds = customers.map(c => c.id);
      await supabaseAdmin.from('customers').delete().in('id', customerIds);
    }
  });

  afterAll(async () => {
    await supabaseAdmin.from('businesses').delete().eq('id', testBusinessId);
  });

  describe('getBusinessMetrics', () => {
    it('should calculate total customers and stamps', async () => {
      const customer1 = await CustomerService.create({
        business_id: testBusinessId,
        phone: '+51 911 111 111',
        name: 'Customer 1',
      });
      const customer2 = await CustomerService.create({
        business_id: testBusinessId,
        phone: '+51 922 222 222',
        name: 'Customer 2',
      });

      await StampService.addStamp(customer1.id, testBusinessId);
      await StampService.addStamp(customer2.id, testBusinessId);

      const metrics = await AnalyticsService.getBusinessMetrics(testBusinessId);
      expect(metrics.total_customers).toBe(2);
      expect(metrics.total_stamps).toBe(2);
      expect(metrics.avg_stamps_per_customer).toBe(1);
    });
  });

  describe('getTopCustomers', () => {
    it('should return top customers by stamps', async () => {
      const customer1 = await CustomerService.create({
        business_id: testBusinessId,
        phone: '+51 933 333 333',
        name: 'High Stamps',
      });

      await StampService.addStamp(customer1.id, testBusinessId);
      await StampService.addStamp(customer1.id, testBusinessId);

      const topCustomers = await AnalyticsService.getTopCustomers(testBusinessId, 5);
      expect(topCustomers).toHaveLength(1);
      expect(topCustomers[0].stamps_count).toBe(2);
    });
  });
});
