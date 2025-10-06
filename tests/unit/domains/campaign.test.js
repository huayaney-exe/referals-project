"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Campaign_1 = require("../../../src/domains/campaign/Campaign");
const Business_1 = require("../../../src/domains/business/Business");
const types_1 = require("../../../src/domains/types");
const supabase_1 = require("../../../src/config/supabase");
describe('Campaign Domain', () => {
    let testBusinessId;
    beforeAll(async () => {
        const business = await Business_1.BusinessService.create({
            email: 'campaign-test@example.com',
            name: 'Test Business',
            reward_structure: { stamps_required: 10, reward_description: 'Reward' },
        });
        testBusinessId = business.id;
    });
    beforeEach(async () => {
        // Only delete campaigns for this specific business
        await supabase_1.supabaseAdmin.from('campaigns').delete().eq('business_id', testBusinessId);
    });
    afterAll(async () => {
        await supabase_1.supabaseAdmin.from('businesses').delete().eq('id', testBusinessId);
    });
    describe('create', () => {
        it('should create campaign with valid config', async () => {
            const campaign = await Campaign_1.CampaignService.create({
                business_id: testBusinessId,
                name: 'Welcome Campaign',
                message: '¡Bienvenido! Gana 1 sello gratis hoy.',
                target_segment: { min_stamps: 0, max_stamps: 5 },
            });
            expect(campaign.id).toBeDefined();
            expect(campaign.name).toBe('Welcome Campaign');
            expect(campaign.status).toBe('draft');
            expect(campaign.sent_count).toBe(0);
        });
        it('should validate message length', async () => {
            await expect(Campaign_1.CampaignService.create({
                business_id: testBusinessId,
                name: 'Test',
                message: 'A'.repeat(1601),
                target_segment: { min_stamps: 0, max_stamps: null },
            })).rejects.toThrow();
        });
    });
    describe('schedule', () => {
        it('should schedule draft campaign', async () => {
            const campaign = await Campaign_1.CampaignService.create({
                business_id: testBusinessId,
                name: 'Test',
                message: 'Test message',
                target_segment: { min_stamps: 0, max_stamps: null },
            });
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const scheduled = await Campaign_1.CampaignService.schedule(campaign.id, tomorrow.toISOString());
            expect(scheduled.status).toBe('scheduled');
            expect(scheduled.scheduled_for).toBeDefined();
        });
        it('should reject scheduling for past time', async () => {
            const campaign = await Campaign_1.CampaignService.create({
                business_id: testBusinessId,
                name: 'Test',
                message: 'Test',
                target_segment: { min_stamps: 0, max_stamps: null },
            });
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            await expect(Campaign_1.CampaignService.schedule(campaign.id, yesterday.toISOString())).rejects.toThrow(types_1.BusinessLogicError);
        });
    });
    describe('delete', () => {
        it('should delete draft campaign', async () => {
            const campaign = await Campaign_1.CampaignService.create({
                business_id: testBusinessId,
                name: 'To Delete',
                message: 'Test',
                target_segment: { min_stamps: 0, max_stamps: null },
            });
            await Campaign_1.CampaignService.delete(campaign.id);
            const found = await Campaign_1.CampaignService.findById(campaign.id);
            expect(found).toBeNull();
        });
        it('should prevent deletion of scheduled campaign', async () => {
            const campaign = await Campaign_1.CampaignService.create({
                business_id: testBusinessId,
                name: 'Test',
                message: 'Test',
                target_segment: { min_stamps: 0, max_stamps: null },
            });
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            await Campaign_1.CampaignService.schedule(campaign.id, tomorrow.toISOString());
            await expect(Campaign_1.CampaignService.delete(campaign.id)).rejects.toThrow(types_1.BusinessLogicError);
        });
    });
});
//# sourceMappingURL=campaign.test.js.map