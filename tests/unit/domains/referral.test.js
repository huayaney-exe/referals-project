"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Referral_1 = require("../../../src/domains/referral/Referral");
const Business_1 = require("../../../src/domains/business/Business");
const Customer_1 = require("../../../src/domains/customer/Customer");
const types_1 = require("../../../src/domains/types");
const supabase_1 = require("../../../src/config/supabase");
describe('Referral Domain', () => {
    let testBusinessId;
    let testCustomerId;
    beforeAll(async () => {
        const business = await Business_1.BusinessService.create({
            email: 'referral-test@example.com',
            name: 'Test Business',
            reward_structure: { stamps_required: 10, reward_description: 'Reward' },
        });
        testBusinessId = business.id;
        const customer = await Customer_1.CustomerService.create({
            business_id: testBusinessId,
            phone: '+51 987 888 999',
            name: 'Referrer',
        });
        testCustomerId = customer.id;
    });
    beforeEach(async () => {
        await supabase_1.supabaseAdmin.from('referrals').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    });
    afterAll(async () => {
        await supabase_1.supabaseAdmin.from('customers').delete().eq('id', testCustomerId);
        await supabase_1.supabaseAdmin.from('businesses').delete().eq('id', testBusinessId);
    });
    describe('create', () => {
        it('should create referral code', async () => {
            const referral = await Referral_1.ReferralService.create({
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
            const created = await Referral_1.ReferralService.create({
                business_id: testBusinessId,
                referrer_customer_id: testCustomerId,
            });
            const found = await Referral_1.ReferralService.findByCode(created.referral_code);
            expect(found?.id).toBe(created.id);
        });
    });
    describe('complete', () => {
        it('should mark referral as completed and grant bonus', async () => {
            const referral = await Referral_1.ReferralService.create({
                business_id: testBusinessId,
                referrer_customer_id: testCustomerId,
                bonus_stamps: 1,
            });
            const referred = await Customer_1.CustomerService.create({
                business_id: testBusinessId,
                phone: '+51 999 888 777',
                name: 'Referred Customer',
            });
            const completed = await Referral_1.ReferralService.complete(referral.id, referred.id);
            expect(completed.status).toBe('completed');
            expect(completed.referred_customer_id).toBe(referred.id);
        });
        it('should prevent double completion', async () => {
            const referral = await Referral_1.ReferralService.create({
                business_id: testBusinessId,
                referrer_customer_id: testCustomerId,
            });
            const referred = await Customer_1.CustomerService.create({
                business_id: testBusinessId,
                phone: '+51 988 777 666',
                name: 'Customer',
            });
            await Referral_1.ReferralService.complete(referral.id, referred.id);
            await expect(Referral_1.ReferralService.complete(referral.id, referred.id)).rejects.toThrow(types_1.BusinessLogicError);
        });
    });
});
//# sourceMappingURL=referral.test.js.map