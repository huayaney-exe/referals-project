"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Stamp_1 = require("../../../src/domains/loyalty/Stamp");
const Business_1 = require("../../../src/domains/business/Business");
const Customer_1 = require("../../../src/domains/customer/Customer");
const types_1 = require("../../../src/domains/types");
const supabase_1 = require("../../../src/config/supabase");
describe('Loyalty Domain', () => {
    let testBusinessId;
    let testCustomerId;
    beforeAll(async () => {
        const business = await Business_1.BusinessService.create({
            email: 'loyalty-test@example.com',
            name: 'Test Business',
            reward_structure: { stamps_required: 5, reward_description: '1 free item' },
        });
        testBusinessId = business.id;
        const customer = await Customer_1.CustomerService.create({
            business_id: testBusinessId,
            phone: '+51 987 000 111',
            name: 'Test Customer',
        });
        testCustomerId = customer.id;
    });
    beforeEach(async () => {
        // Only delete stamps and outbox events for this specific customer
        await supabase_1.supabaseAdmin.from('stamps').delete().eq('customer_id', testCustomerId);
        await supabase_1.supabaseAdmin.from('outbox_events').delete().eq('aggregate_id', testCustomerId);
        // Reset customer stamps
        await supabase_1.supabaseAdmin.from('customers').update({ stamps_count: 0, total_rewards_earned: 0 }).eq('id', testCustomerId);
    });
    afterAll(async () => {
        await supabase_1.supabaseAdmin.from('customers').delete().eq('id', testCustomerId);
        await supabase_1.supabaseAdmin.from('businesses').delete().eq('id', testBusinessId);
    });
    describe('addStamp', () => {
        it('should add stamp to customer', async () => {
            const result = await Stamp_1.StampService.addStamp(testCustomerId, testBusinessId);
            expect(result.new_stamps_count).toBe(1);
            expect(result.is_reward_earned).toBe(false);
            expect(result.stamp_id).toBeDefined();
        });
        it('should increment stamps count', async () => {
            await Stamp_1.StampService.addStamp(testCustomerId, testBusinessId);
            const result = await Stamp_1.StampService.addStamp(testCustomerId, testBusinessId);
            expect(result.new_stamps_count).toBe(2);
        });
        it('should reset stamps when reward unlocked', async () => {
            // Add 4 stamps
            await Stamp_1.StampService.addStamp(testCustomerId, testBusinessId);
            await Stamp_1.StampService.addStamp(testCustomerId, testBusinessId);
            await Stamp_1.StampService.addStamp(testCustomerId, testBusinessId);
            await Stamp_1.StampService.addStamp(testCustomerId, testBusinessId);
            // 5th stamp should trigger reward
            const result = await Stamp_1.StampService.addStamp(testCustomerId, testBusinessId);
            expect(result.new_stamps_count).toBe(0);
            expect(result.is_reward_earned).toBe(true);
        });
        it('should create stamp record in stamps table', async () => {
            const result = await Stamp_1.StampService.addStamp(testCustomerId, testBusinessId);
            const { data } = await supabase_1.supabaseAdmin.from('stamps').select('*').eq('id', result.stamp_id).single();
            expect(data).toBeTruthy();
            expect(data?.customer_id).toBe(testCustomerId);
        });
        it('should prevent duplicate stamp with idempotency key', async () => {
            const idempotencyKey = 'test-key-123';
            await Stamp_1.StampService.addStamp(testCustomerId, testBusinessId, 'system', idempotencyKey);
            await expect(Stamp_1.StampService.addStamp(testCustomerId, testBusinessId, 'system', idempotencyKey)).rejects.toThrow(types_1.BusinessLogicError);
        });
        it('should insert outbox event for PassKit update', async () => {
            await Stamp_1.StampService.addStamp(testCustomerId, testBusinessId);
            const { data } = await supabase_1.supabaseAdmin
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
            await Stamp_1.StampService.addStamp(testCustomerId, testBusinessId);
            await Stamp_1.StampService.addStamp(testCustomerId, testBusinessId);
            const history = await Stamp_1.StampService.getHistory(testCustomerId);
            expect(history).toHaveLength(2);
        });
    });
    describe('countByBusiness', () => {
        it('should count total stamps for business', async () => {
            await Stamp_1.StampService.addStamp(testCustomerId, testBusinessId);
            await Stamp_1.StampService.addStamp(testCustomerId, testBusinessId);
            await Stamp_1.StampService.addStamp(testCustomerId, testBusinessId);
            const count = await Stamp_1.StampService.countByBusiness(testBusinessId);
            expect(count).toBe(3);
        });
    });
    describe('countRewards', () => {
        it('should count rewards redeemed', async () => {
            // Add 5 stamps to trigger reward
            for (let i = 0; i < 5; i++) {
                await Stamp_1.StampService.addStamp(testCustomerId, testBusinessId);
            }
            const rewardCount = await Stamp_1.StampService.countRewards(testBusinessId);
            expect(rewardCount).toBe(1);
        });
    });
});
//# sourceMappingURL=loyalty.test.js.map