"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Customer_1 = require("../../../src/domains/customer/Customer");
const Business_1 = require("../../../src/domains/business/Business");
const types_1 = require("../../../src/domains/types");
const supabase_1 = require("../../../src/config/supabase");
describe('Customer Domain', () => {
    let testBusinessId;
    beforeAll(async () => {
        const business = await Business_1.BusinessService.create({
            email: 'customer-test@example.com',
            name: 'Test Business',
            reward_structure: { stamps_required: 10, reward_description: 'Reward' },
        });
        testBusinessId = business.id;
    });
    beforeEach(async () => {
        await supabase_1.supabaseAdmin.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    });
    afterAll(async () => {
        await supabase_1.supabaseAdmin.from('businesses').delete().eq('id', testBusinessId);
    });
    describe('create', () => {
        it('should create customer with valid Peru phone', async () => {
            const customer = await Customer_1.CustomerService.create({
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
            await expect(Customer_1.CustomerService.create({
                business_id: testBusinessId,
                phone: '+51 123 456 789',
                name: 'Test',
            })).rejects.toThrow();
        });
        it('should prevent duplicate enrollment', async () => {
            await Customer_1.CustomerService.create({
                business_id: testBusinessId,
                phone: '+51 987 111 222',
                name: 'First',
            });
            await expect(Customer_1.CustomerService.create({
                business_id: testBusinessId,
                phone: '+51 987 111 222',
                name: 'Second',
            })).rejects.toThrow(types_1.ConflictError);
        });
        it('should allow same phone for different businesses', async () => {
            const business2 = await Business_1.BusinessService.create({
                email: 'business2@example.com',
                name: 'Business 2',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            });
            await Customer_1.CustomerService.create({
                business_id: testBusinessId,
                phone: '+51 999 888 777',
                name: 'Customer 1',
            });
            const customer2 = await Customer_1.CustomerService.create({
                business_id: business2.id,
                phone: '+51 999 888 777',
                name: 'Customer 2',
            });
            expect(customer2.id).toBeDefined();
            await Business_1.BusinessService.delete(business2.id);
        });
    });
    describe('findByPhone', () => {
        it('should find customer by phone', async () => {
            await Customer_1.CustomerService.create({
                business_id: testBusinessId,
                phone: '+51 911 222 333',
                name: 'Find Me',
            });
            const found = await Customer_1.CustomerService.findByPhone(testBusinessId, '+51 911 222 333');
            expect(found).toBeTruthy();
            expect(found?.name).toBe('Find Me');
        });
    });
    describe('findByBusiness', () => {
        it('should list all customers for business', async () => {
            await Customer_1.CustomerService.create({
                business_id: testBusinessId,
                phone: '+51 911 111 111',
                name: 'Customer 1',
            });
            await Customer_1.CustomerService.create({
                business_id: testBusinessId,
                phone: '+51 922 222 222',
                name: 'Customer 2',
            });
            const customers = await Customer_1.CustomerService.findByBusiness(testBusinessId);
            expect(customers).toHaveLength(2);
        });
    });
    describe('update', () => {
        it('should update customer name', async () => {
            const customer = await Customer_1.CustomerService.create({
                business_id: testBusinessId,
                phone: '+51 933 444 555',
                name: 'Original Name',
            });
            const updated = await Customer_1.CustomerService.update(customer.id, { name: 'Updated Name' }, customer.version);
            expect(updated.name).toBe('Updated Name');
            expect(updated.version).toBe(2);
        });
        it('should enforce optimistic locking', async () => {
            const customer = await Customer_1.CustomerService.create({
                business_id: testBusinessId,
                phone: '+51 944 555 666',
                name: 'Test',
            });
            await Customer_1.CustomerService.update(customer.id, { name: 'First Update' }, customer.version);
            await expect(Customer_1.CustomerService.update(customer.id, { name: 'Second Update' }, customer.version)).rejects.toThrow(types_1.ConcurrencyError);
        });
    });
    describe('count', () => {
        it('should count customers for business', async () => {
            await Customer_1.CustomerService.create({
                business_id: testBusinessId,
                phone: '+51 955 666 777',
                name: 'Customer 1',
            });
            await Customer_1.CustomerService.create({
                business_id: testBusinessId,
                phone: '+51 966 777 888',
                name: 'Customer 2',
            });
            const count = await Customer_1.CustomerService.count(testBusinessId);
            expect(count).toBe(2);
        });
    });
});
//# sourceMappingURL=customer.test.js.map