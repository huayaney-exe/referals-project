"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Business_1 = require("../../../src/domains/business/Business");
const types_1 = require("../../../src/domains/types");
const supabase_1 = require("../../../src/config/supabase");
describe('Business Domain', () => {
    beforeEach(async () => {
        // Clean up only businesses created by THIS test suite (using business-test domain)
        const { data } = await supabase_1.supabaseAdmin
            .from('businesses')
            .select('id')
            .like('email', '%business-test-domain.com%');
        if (data && data.length > 0) {
            const ids = data.map(b => b.id);
            await supabase_1.supabaseAdmin.from('businesses').delete().in('id', ids);
        }
    });
    describe('create', () => {
        it('should create business with valid data', async () => {
            const business = await Business_1.BusinessService.create({
                email: 'test@business-test-domain.com',
                name: 'Test Business',
                reward_structure: {
                    stamps_required: 10,
                    reward_description: '1 free coffee',
                },
            });
            expect(business.id).toBeDefined();
            expect(business.email).toBe('test@business-test-domain.com');
            expect(business.name).toBe('Test Business');
            expect(business.reward_structure.stamps_required).toBe(10);
            expect(business.reward_structure.reward_description).toBe('1 free coffee');
            expect(business.is_active).toBe(true);
            expect(business.version).toBe(1);
            expect(business.created_at).toBeDefined();
            expect(business.updated_at).toBeDefined();
        });
        it('should create business with optional fields', async () => {
            const business = await Business_1.BusinessService.create({
                email: 'withphone@business-test-domain.com',
                name: 'Business with Phone',
                phone: '+51 987 654 321',
                category: 'Comida y Bebidas',
                logo_url: 'https://example.com/logo.png',
                reward_structure: {
                    stamps_required: 5,
                    reward_description: '1 producto gratis',
                },
            });
            expect(business.phone).toBe('+51 987 654 321');
            expect(business.category).toBe('Comida y Bebidas');
            expect(business.logo_url).toBe('https://example.com/logo.png');
        });
        it('should reject duplicate email', async () => {
            await Business_1.BusinessService.create({
                email: 'duplicate@business-test-domain.com',
                name: 'First Business',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            });
            await expect(Business_1.BusinessService.create({
                email: 'duplicate@business-test-domain.com',
                name: 'Second Business',
                reward_structure: { stamps_required: 5, reward_description: 'Different Reward' },
            })).rejects.toThrow(types_1.ConflictError);
        });
        it('should reject invalid email format', async () => {
            await expect(Business_1.BusinessService.create({
                email: 'not-an-email',
                name: 'Test',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            })).rejects.toThrow();
        });
        it('should reject empty name', async () => {
            await expect(Business_1.BusinessService.create({
                email: 'test@business-test-domain.com',
                name: '',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            })).rejects.toThrow();
        });
        it('should reject name longer than 255 characters', async () => {
            await expect(Business_1.BusinessService.create({
                email: 'test@business-test-domain.com',
                name: 'A'.repeat(256),
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            })).rejects.toThrow();
        });
        it('should reject invalid Peru phone format', async () => {
            await expect(Business_1.BusinessService.create({
                email: 'test@business-test-domain.com',
                name: 'Test',
                phone: '+51 123 456 789', // Invalid: doesn't start with 9
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            })).rejects.toThrow();
        });
        it('should accept valid Peru phone format', async () => {
            const business = await Business_1.BusinessService.create({
                email: 'phone@business-test-domain.com',
                name: 'Test',
                phone: '+51 987 654 321',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            });
            expect(business.phone).toBe('+51 987 654 321');
        });
        it('should reject stamps_required = 0', async () => {
            await expect(Business_1.BusinessService.create({
                email: 'test@business-test-domain.com',
                name: 'Test',
                reward_structure: { stamps_required: 0, reward_description: 'Reward' },
            })).rejects.toThrow();
        });
        it('should reject negative stamps_required', async () => {
            await expect(Business_1.BusinessService.create({
                email: 'test@business-test-domain.com',
                name: 'Test',
                reward_structure: { stamps_required: -5, reward_description: 'Reward' },
            })).rejects.toThrow();
        });
        it('should reject empty reward_description', async () => {
            await expect(Business_1.BusinessService.create({
                email: 'test@business-test-domain.com',
                name: 'Test',
                reward_structure: { stamps_required: 10, reward_description: '' },
            })).rejects.toThrow();
        });
        it('should reject reward_description longer than 500 characters', async () => {
            await expect(Business_1.BusinessService.create({
                email: 'test@business-test-domain.com',
                name: 'Test',
                reward_structure: { stamps_required: 10, reward_description: 'A'.repeat(501) },
            })).rejects.toThrow();
        });
        it('should reject invalid logo URL format', async () => {
            await expect(Business_1.BusinessService.create({
                email: 'test@business-test-domain.com',
                name: 'Test',
                logo_url: 'not-a-url',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            })).rejects.toThrow();
        });
        it('should accept valid logo URL', async () => {
            const business = await Business_1.BusinessService.create({
                email: 'logo@business-test-domain.com',
                name: 'Test',
                logo_url: 'https://cdn.example.com/logos/business.png',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            });
            expect(business.logo_url).toBe('https://cdn.example.com/logos/business.png');
        });
    });
    describe('findById', () => {
        it('should find business by ID', async () => {
            const created = await Business_1.BusinessService.create({
                email: 'findme@business-test-domain.com',
                name: 'Find Me',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            });
            const found = await Business_1.BusinessService.findById(created.id);
            expect(found).toBeTruthy();
            expect(found?.id).toBe(created.id);
            expect(found?.email).toBe('findme@business-test-domain.com');
        });
        it('should return null if business not found', async () => {
            const found = await Business_1.BusinessService.findById('00000000-0000-0000-0000-000000000000');
            expect(found).toBeNull();
        });
    });
    describe('findByEmail', () => {
        it('should find business by email', async () => {
            await Business_1.BusinessService.create({
                email: 'unique@business-test-domain.com',
                name: 'Unique Business',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            });
            const found = await Business_1.BusinessService.findByEmail('unique@business-test-domain.com');
            expect(found).toBeTruthy();
            expect(found?.email).toBe('unique@business-test-domain.com');
        });
        it('should return null if email not found', async () => {
            const found = await Business_1.BusinessService.findByEmail('nonexistent@business-test-domain.com');
            expect(found).toBeNull();
        });
    });
    describe('listActive', () => {
        it('should list only active businesses', async () => {
            // Create active business
            const active = await Business_1.BusinessService.create({
                email: 'active@business-test-domain.com',
                name: 'Active Business',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            });
            // Create and deactivate another business
            const toDeactivate = await Business_1.BusinessService.create({
                email: 'inactive@business-test-domain.com',
                name: 'Inactive Business',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            });
            await Business_1.BusinessService.deactivate(toDeactivate.id);
            const activeList = await Business_1.BusinessService.listActive();
            const testBusinesses = activeList.filter(b => b.email.includes('business-test-domain.com'));
            expect(testBusinesses).toHaveLength(1);
            expect(testBusinesses[0].id).toBe(active.id);
        });
        it('should return empty array if no active businesses', async () => {
            const list = await Business_1.BusinessService.listActive();
            const testBusinesses = list.filter(b => b.email.includes('business-test-domain.com'));
            expect(testBusinesses).toEqual([]);
        });
    });
    describe('update', () => {
        it('should update business details', async () => {
            const business = await Business_1.BusinessService.create({
                email: 'update@business-test-domain.com',
                name: 'Original Name',
                reward_structure: { stamps_required: 10, reward_description: 'Original Reward' },
            });
            const updated = await Business_1.BusinessService.update(business.id, {
                name: 'Updated Name',
                reward_structure: { stamps_required: 15, reward_description: 'Updated Reward' },
            }, business.version);
            expect(updated.name).toBe('Updated Name');
            expect(updated.reward_structure.stamps_required).toBe(15);
            expect(updated.reward_structure.reward_description).toBe('Updated Reward');
            expect(updated.version).toBe(2);
        });
        it('should use optimistic locking on update', async () => {
            const business = await Business_1.BusinessService.create({
                email: 'locking@business-test-domain.com',
                name: 'Test',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            });
            // Simulate concurrent update
            await Business_1.BusinessService.update(business.id, { name: 'First Update' }, business.version);
            // This should fail because version changed
            await expect(Business_1.BusinessService.update(business.id, { name: 'Second Update' }, business.version)).rejects.toThrow(types_1.ConcurrencyError);
        });
        it('should validate updated fields', async () => {
            const business = await Business_1.BusinessService.create({
                email: 'validate@business-test-domain.com',
                name: 'Test',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            });
            await expect(Business_1.BusinessService.update(business.id, {
                reward_structure: { stamps_required: 0, reward_description: 'Invalid' },
            }, business.version)).rejects.toThrow();
        });
    });
    describe('deactivate', () => {
        it('should deactivate business', async () => {
            const business = await Business_1.BusinessService.create({
                email: 'deactivate@business-test-domain.com',
                name: 'Test',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            });
            await Business_1.BusinessService.deactivate(business.id);
            const found = await Business_1.BusinessService.findById(business.id);
            expect(found?.is_active).toBe(false);
        });
        it('should throw NotFoundError if business does not exist', async () => {
            await expect(Business_1.BusinessService.deactivate('00000000-0000-0000-0000-000000000000')).rejects.toThrow(types_1.NotFoundError);
        });
    });
    describe('reactivate', () => {
        it('should reactivate deactivated business', async () => {
            const business = await Business_1.BusinessService.create({
                email: 'reactivate@business-test-domain.com',
                name: 'Test',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            });
            await Business_1.BusinessService.deactivate(business.id);
            await Business_1.BusinessService.reactivate(business.id);
            const found = await Business_1.BusinessService.findById(business.id);
            expect(found?.is_active).toBe(true);
        });
    });
    describe('count', () => {
        it('should count all businesses', async () => {
            const countBefore = await Business_1.BusinessService.count();
            await Business_1.BusinessService.create({
                email: 'count1@business-test-domain.com',
                name: 'Business 1',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            });
            await Business_1.BusinessService.create({
                email: 'count2@business-test-domain.com',
                name: 'Business 2',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            });
            const countAfter = await Business_1.BusinessService.count();
            expect(countAfter - countBefore).toBe(2);
        });
        it('should count only active businesses', async () => {
            const activeCountBefore = await Business_1.BusinessService.count(true);
            await Business_1.BusinessService.create({
                email: 'active2@business-test-domain.com',
                name: 'Active',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            });
            const inactive = await Business_1.BusinessService.create({
                email: 'inactive2@business-test-domain.com',
                name: 'Inactive',
                reward_structure: { stamps_required: 10, reward_description: 'Reward' },
            });
            await Business_1.BusinessService.deactivate(inactive.id);
            const activeCountAfter = await Business_1.BusinessService.count(true);
            expect(activeCountAfter - activeCountBefore).toBe(1);
        });
    });
});
//# sourceMappingURL=business.test.js.map