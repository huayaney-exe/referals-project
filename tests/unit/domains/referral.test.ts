import { ReferralService } from '../../../src/domains/referral/Referral';
import { BusinessService } from '../../../src/domains/business/Business';
import { CustomerService } from '../../../src/domains/customer/Customer';
import { BusinessLogicError } from '../../../src/domains/types';
import { supabaseAdmin } from '../../../src/config/supabase';

describe('Referral Domain', () => {
  let testBusinessId: string;
  let testCustomerId: string;

  beforeAll(async () => {
    const business = await BusinessService.create({
      email: 'referral-test@example.com',
      name: 'Test Business',
      reward_structure: { stamps_required: 10, reward_description: 'Reward' },
    });
    testBusinessId = business.id;

    const customer = await CustomerService.create({
      business_id: testBusinessId,
      phone: '+51 987 888 999',
      name: 'Referrer',
    });
    testCustomerId = customer.id;
  });

  beforeEach(async () => {
    await supabaseAdmin.from('referrals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  });

  afterAll(async () => {
    await supabaseAdmin.from('customers').delete().eq('id', testCustomerId);
    await supabaseAdmin.from('businesses').delete().eq('id', testBusinessId);
  });

  describe('create', () => {
    it('should create referral code', async () => {
      const referral = await ReferralService.create({
        business_id: testBusinessId,
        referrer_customer_id: testCustomerId,
        bonus_stamps: 1,
      });

      expect(referral.id).toBeDefined();
      expect(referral.referral_code).toHaveLength(8);
      expect(referral.status).toBe('pending');
      expect(referral.expires_at).toBeDefined();
    });
  });

  describe('findByCode', () => {
    it('should find referral by code', async () => {
      const created = await ReferralService.create({
        business_id: testBusinessId,
        referrer_customer_id: testCustomerId,
      });

      const found = await ReferralService.findByCode(created.referral_code);
      expect(found?.id).toBe(created.id);
    });
  });

  describe('complete', () => {
    it('should mark referral as completed and grant bonus', async () => {
      const referral = await ReferralService.create({
        business_id: testBusinessId,
        referrer_customer_id: testCustomerId,
        bonus_stamps: 1,
      });

      const referred = await CustomerService.create({
        business_id: testBusinessId,
        phone: '+51 999 888 777',
        name: 'Referred Customer',
      });

      const completed = await ReferralService.complete(referral.id, referred.id);
      expect(completed.status).toBe('completed');
      expect(completed.referred_customer_id).toBe(referred.id);
    });

    it('should prevent double completion', async () => {
      const referral = await ReferralService.create({
        business_id: testBusinessId,
        referrer_customer_id: testCustomerId,
      });

      const referred = await CustomerService.create({
        business_id: testBusinessId,
        phone: '+51 988 777 666',
        name: 'Customer',
      });

      await ReferralService.complete(referral.id, referred.id);

      await expect(ReferralService.complete(referral.id, referred.id)).rejects.toThrow(
        BusinessLogicError
      );
    });
  });
});
