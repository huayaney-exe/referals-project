"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Analytics_1 = require("../../../src/domains/analytics/Analytics");
const Business_1 = require("../../../src/domains/business/Business");
const Customer_1 = require("../../../src/domains/customer/Customer");
const Stamp_1 = require("../../../src/domains/loyalty/Stamp");
const supabase_1 = require("../../../src/config/supabase");
describe('Analytics Domain', () => {
    let testBusinessId;
    beforeAll(async () => {
        const business = await Business_1.BusinessService.create({
            email: 'analytics-test@example.com',
            name: 'Test Business',
            reward_structure: { stamps_required: 10, reward_description: 'Reward' },
        });
        testBusinessId = business.id;
    });
    beforeEach(async () => {
        // Only delete data for this specific business
        await supabase_1.supabaseAdmin.from('stamps').delete().eq('business_id', testBusinessId);
        const { data: customers } = await supabase_1.supabaseAdmin.from('customers').select('id').eq('business_id', testBusinessId);
        if (customers && customers.length > 0) {
            const customerIds = customers.map(c => c.id);
            await supabase_1.supabaseAdmin.from('customers').delete().in('id', customerIds);
        }
    });
    afterAll(async () => {
        await supabase_1.supabaseAdmin.from('businesses').delete().eq('id', testBusinessId);
    });
    describe('getBusinessMetrics', () => {
        it('should calculate total customers and stamps', async () => {
            const customer1 = await Customer_1.CustomerService.create({
                business_id: testBusinessId,
                phone: '+51 911 111 111',
                name: 'Customer 1',
            });
            const customer2 = await Customer_1.CustomerService.create({
                business_id: testBusinessId,
                phone: '+51 922 222 222',
                name: 'Customer 2',
            });
            await Stamp_1.StampService.addStamp(customer1.id, testBusinessId);
            await Stamp_1.StampService.addStamp(customer2.id, testBusinessId);
            const metrics = await Analytics_1.AnalyticsService.getBusinessMetrics(testBusinessId);
            expect(metrics.total_customers).toBe(2);
            expect(metrics.total_stamps).toBe(2);
            expect(metrics.avg_stamps_per_customer).toBe(1);
        });
    });
    describe('getTopCustomers', () => {
        it('should return top customers by stamps', async () => {
            const customer1 = await Customer_1.CustomerService.create({
                business_id: testBusinessId,
                phone: '+51 933 333 333',
                name: 'High Stamps',
            });
            await Stamp_1.StampService.addStamp(customer1.id, testBusinessId);
            await Stamp_1.StampService.addStamp(customer1.id, testBusinessId);
            const topCustomers = await Analytics_1.AnalyticsService.getTopCustomers(testBusinessId, 5);
            expect(topCustomers).toHaveLength(1);
            expect(topCustomers[0].stamps_count).toBe(2);
        });
    });
});
//# sourceMappingURL=analytics.test.js.map