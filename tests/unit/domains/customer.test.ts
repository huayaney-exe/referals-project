import { CustomerService } from '../../../src/domains/customer/Customer';
import { BusinessService } from '../../../src/domains/business/Business';
import { ConflictError, ConcurrencyError } from '../../../src/domains/types';
import { supabaseAdmin } from '../../../src/config/supabase';

describe('Customer Domain', () => {
  let testBusinessId: string;

  beforeAll(async () => {
    const business = await BusinessService.create({
      email: 'customer-test@example.com',
      name: 'Test Business',
      reward_structure: { stamps_required: 10, reward_description: 'Reward' },
    });
    testBusinessId = business.id;
  });

  beforeEach(async () => {
    await supabaseAdmin.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  });

  afterAll(async () => {
    await supabaseAdmin.from('businesses').delete().eq('id', testBusinessId);
  });

  describe('create', () => {
    it('should create customer with valid Peru phone', async () => {
      const customer = await CustomerService.create({
        business_id: testBusinessId,
        phone: '+51 987 654 321',
        name: 'María López',
      });

      expect(customer.id).toBeDefined();
      expect(customer.phone).toBe('+51 987 654 321');
      expect(customer.name).toBe('María López');
      expect(customer.stamps_count).toBe(0);
      expect(customer.total_rewards_earned).toBe(0);
      expect(customer.version).toBe(1);
    });

    it('should reject invalid Peru phone format', async () => {
      await expect(
        CustomerService.create({
          business_id: testBusinessId,
          phone: '+51 123 456 789',
          name: 'Test',
        })
      ).rejects.toThrow();
    });

    it('should prevent duplicate enrollment', async () => {
      await CustomerService.create({
        business_id: testBusinessId,
        phone: '+51 987 111 222',
        name: 'First',
      });

      await expect(
        CustomerService.create({
          business_id: testBusinessId,
          phone: '+51 987 111 222',
          name: 'Second',
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should allow same phone for different businesses', async () => {
      const business2 = await BusinessService.create({
        email: 'business2@example.com',
        name: 'Business 2',
        reward_structure: { stamps_required: 10, reward_description: 'Reward' },
      });

      await CustomerService.create({
        business_id: testBusinessId,
        phone: '+51 999 888 777',
        name: 'Customer 1',
      });

      const customer2 = await CustomerService.create({
        business_id: business2.id,
        phone: '+51 999 888 777',
        name: 'Customer 2',
      });

      expect(customer2.id).toBeDefined();
      await BusinessService.delete(business2.id);
    });
  });

  describe('findByPhone', () => {
    it('should find customer by phone', async () => {
      await CustomerService.create({
        business_id: testBusinessId,
        phone: '+51 911 222 333',
        name: 'Find Me',
      });

      const found = await CustomerService.findByPhone(testBusinessId, '+51 911 222 333');
      expect(found).toBeTruthy();
      expect(found?.name).toBe('Find Me');
    });
  });

  describe('findByBusiness', () => {
    it('should list all customers for business', async () => {
      await CustomerService.create({
        business_id: testBusinessId,
        phone: '+51 911 111 111',
        name: 'Customer 1',
      });
      await CustomerService.create({
        business_id: testBusinessId,
        phone: '+51 922 222 222',
        name: 'Customer 2',
      });

      const customers = await CustomerService.findByBusiness(testBusinessId);
      expect(customers).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update customer name', async () => {
      const customer = await CustomerService.create({
        business_id: testBusinessId,
        phone: '+51 933 444 555',
        name: 'Original Name',
      });

      const updated = await CustomerService.update(customer.id, { name: 'Updated Name' }, customer.version);
      expect(updated.name).toBe('Updated Name');
      expect(updated.version).toBe(2);
    });

    it('should enforce optimistic locking', async () => {
      const customer = await CustomerService.create({
        business_id: testBusinessId,
        phone: '+51 944 555 666',
        name: 'Test',
      });

      await CustomerService.update(customer.id, { name: 'First Update' }, customer.version);

      await expect(
        CustomerService.update(customer.id, { name: 'Second Update' }, customer.version)
      ).rejects.toThrow(ConcurrencyError);
    });
  });

  describe('count', () => {
    it('should count customers for business', async () => {
      await CustomerService.create({
        business_id: testBusinessId,
        phone: '+51 955 666 777',
        name: 'Customer 1',
      });
      await CustomerService.create({
        business_id: testBusinessId,
        phone: '+51 966 777 888',
        name: 'Customer 2',
      });

      const count = await CustomerService.count(testBusinessId);
      expect(count).toBe(2);
    });
  });
});
