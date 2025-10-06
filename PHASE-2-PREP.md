# Phase 2: Domain Models with TDD - PREPARATION GUIDE

**Start Date**: Ready to begin
**Duration**: 3 days (Days 8-10)
**Goal**: 125 unit tests, >90% coverage

---

## 📋 Overview

Phase 2 implements 6 domain models using Test-Driven Development:

| Domain | Tests | Files | Priority |
|--------|-------|-------|----------|
| Business | 25 | `src/domains/business/`, `tests/unit/domains/business.test.ts` | 🔴 High |
| Customer | 25 | `src/domains/customer/`, `tests/unit/domains/customer.test.ts` | 🔴 High |
| Loyalty | 25 | `src/domains/loyalty/`, `tests/unit/domains/loyalty.test.ts` | 🔴 High |
| Campaign | 25 | `src/domains/campaign/`, `tests/unit/domains/campaign.test.ts` | 🟡 Medium |
| Analytics | 15 | `src/domains/analytics/`, `tests/unit/domains/analytics.test.ts` | 🟡 Medium |
| Referral | 10 | `src/domains/referral/`, `tests/unit/domains/referral.test.ts` | 🟢 Low |

**Total**: 125 tests

---

## 🚀 Quick Start

### 1. Create Domain Directory Structure

```bash
mkdir -p src/domains/{business,customer,loyalty,campaign,analytics,referral}
mkdir -p tests/unit/domains
```

### 2. Install Additional Dependencies

```bash
npm install zod  # For validation schemas
npm install --save-dev @types/uuid
```

### 3. Create Shared Types

Create `src/domains/types.ts`:

```typescript
export interface DomainError {
  code: string;
  message: string;
  field?: string;
}

export class ValidationError extends Error {
  constructor(public errors: DomainError[]) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class ConcurrencyError extends Error {
  constructor(message: string = 'Concurrent modification detected') {
    super(message);
    this.name = 'ConcurrencyError';
  }
}
```

---

## 📝 TDD Workflow

For each domain, follow this cycle:

```
1. RED   → Write failing test
2. GREEN → Write minimal code to pass
3. REFACTOR → Improve code quality
4. REPEAT → Until all features covered
```

### Example TDD Cycle

```typescript
// STEP 1: RED - Write failing test
describe('Business.create', () => {
  it('should create business with valid data', async () => {
    const result = await Business.create({
      email: 'test@example.com',
      name: 'Test Business',
      reward_structure: { stamps_required: 10, reward_description: '1 free item' },
    });

    expect(result.id).toBeDefined();
    expect(result.email).toBe('test@example.com');
    // Test FAILS because Business.create doesn't exist yet
  });
});

// STEP 2: GREEN - Write minimal code to pass
export class Business {
  static async create(data: CreateBusinessInput): Promise<Business> {
    const { data: business, error } = await supabase
      .from('businesses')
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return business;
    // Test PASSES
  }
}

// STEP 3: REFACTOR - Add validation, error handling
export class Business {
  static async create(data: CreateBusinessInput): Promise<Business> {
    // Validate input with Zod
    const validated = businessSchema.parse(data);

    // Check for duplicates
    const existing = await this.findByEmail(validated.email);
    if (existing) throw new ConflictError('Email already exists');

    // Insert
    const { data: business, error } = await supabaseAdmin
      .from('businesses')
      .insert(validated)
      .select()
      .single();

    if (error) throw error;
    return business;
    // Test STILL PASSES (refactored code is better)
  }
}
```

---

## 🧪 Domain Model Templates

### Business Domain Template

**File**: `src/domains/business/Business.ts`

```typescript
import { z } from 'zod';
import { supabaseAdmin } from '../../config/supabase';
import { ValidationError, NotFoundError, ConflictError } from '../types';

// Zod validation schema
const businessSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(255),
  phone: z.string().regex(/^\+51 9\d{2} \d{3} \d{3}$/, 'Invalid Peru phone format').optional(),
  category: z.string().max(100).optional(),
  reward_structure: z.object({
    stamps_required: z.number().int().min(1, 'Must require at least 1 stamp'),
    reward_description: z.string().min(1, 'Reward description is required'),
  }),
  logo_url: z.string().url().optional(),
});

export type CreateBusinessInput = z.infer<typeof businessSchema>;

export interface Business {
  id: string;
  email: string;
  name: string;
  phone?: string;
  category?: string;
  reward_structure: {
    stamps_required: number;
    reward_description: string;
  };
  logo_url?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  version: number;
}

export class BusinessService {
  static async create(input: CreateBusinessInput): Promise<Business> {
    // Validate input
    const validated = businessSchema.parse(input);

    // Check for duplicate email
    const existing = await this.findByEmail(validated.email);
    if (existing) {
      throw new ConflictError('Business with this email already exists');
    }

    // Insert into database
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .insert(validated)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async findById(id: string): Promise<Business | null> {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findByEmail(email: string): Promise<Business | null> {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async update(id: string, input: Partial<CreateBusinessInput>, version: number): Promise<Business> {
    // Optimistic locking: check version
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .update({ ...input, version: version + 1 })
      .eq('id', id)
      .eq('version', version)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new ConcurrencyError('Business was modified by another request');

    return data;
  }

  static async deactivate(id: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('businesses')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  }
}
```

**Test File**: `tests/unit/domains/business.test.ts`

```typescript
import { BusinessService } from '../../../src/domains/business/Business';
import { ConflictError } from '../../../src/domains/types';
import { supabaseAdmin } from '../../../src/config/supabase';

describe('Business Domain', () => {
  beforeEach(async () => {
    // Clean up test data
    await supabaseAdmin.from('businesses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  });

  describe('create', () => {
    it('should create business with valid data', async () => {
      const business = await BusinessService.create({
        email: 'test@example.com',
        name: 'Test Business',
        reward_structure: {
          stamps_required: 10,
          reward_description: '1 free coffee',
        },
      });

      expect(business.id).toBeDefined();
      expect(business.email).toBe('test@example.com');
      expect(business.name).toBe('Test Business');
      expect(business.reward_structure.stamps_required).toBe(10);
      expect(business.is_active).toBe(true);
      expect(business.version).toBe(1);
    });

    it('should reject duplicate email', async () => {
      await BusinessService.create({
        email: 'duplicate@example.com',
        name: 'First Business',
        reward_structure: { stamps_required: 10, reward_description: 'Reward' },
      });

      await expect(
        BusinessService.create({
          email: 'duplicate@example.com',
          name: 'Second Business',
          reward_structure: { stamps_required: 5, reward_description: 'Different Reward' },
        })
      ).rejects.toThrow(ConflictError);
    });

    it('should validate reward structure has stamps_required > 0', async () => {
      await expect(
        BusinessService.create({
          email: 'test@example.com',
          name: 'Test',
          reward_structure: { stamps_required: 0, reward_description: 'Reward' },
        })
      ).rejects.toThrow();
    });

    // Add 22 more tests...
  });

  describe('findById', () => {
    it('should find business by ID', async () => {
      const created = await BusinessService.create({
        email: 'findme@example.com',
        name: 'Find Me',
        reward_structure: { stamps_required: 10, reward_description: 'Reward' },
      });

      const found = await BusinessService.findById(created.id);
      expect(found).toEqual(created);
    });

    it('should return null if business not found', async () => {
      const found = await BusinessService.findById('00000000-0000-0000-0000-000000000000');
      expect(found).toBeNull();
    });
  });

  // Add more test suites for update, deactivate, etc...
});
```

---

## ✅ Checklist for Each Domain

Use this checklist for each of the 6 domains:

### Pre-Development
- [ ] Create domain directory: `src/domains/{domain_name}/`
- [ ] Create domain class file: `{DomainName}.ts`
- [ ] Create test file: `tests/unit/domains/{domain_name}.test.ts`
- [ ] Import Zod and Supabase dependencies

### Implementation (TDD)
- [ ] Define Zod schema for validation
- [ ] Define TypeScript interfaces
- [ ] Write first RED test
- [ ] Write GREEN code to pass
- [ ] REFACTOR for quality
- [ ] Repeat for all methods (create, read, update, delete)
- [ ] Add edge case tests
- [ ] Verify >90% coverage

### Quality Checks
- [ ] Run tests: `npm run test:unit -- {domain}.test`
- [ ] Check coverage: `npm run test:coverage`
- [ ] Lint: `npm run lint`
- [ ] Type check: `npm run typecheck`

---

## 📊 Progress Tracking

Track your progress for each domain:

| Domain | Created | Tests Written | Tests Passing | Coverage | Status |
|--------|---------|---------------|---------------|----------|--------|
| Business | ⬜ | 0/25 | 0/25 | 0% | ⬜ Not Started |
| Customer | ⬜ | 0/25 | 0/25 | 0% | ⬜ Not Started |
| Loyalty | ⬜ | 0/25 | 0/25 | 0% | ⬜ Not Started |
| Campaign | ⬜ | 0/25 | 0/25 | 0% | ⬜ Not Started |
| Analytics | ⬜ | 0/15 | 0/15 | 0% | ⬜ Not Started |
| Referral | ⬜ | 0/10 | 0/10 | 0% | ⬜ Not Started |

Update this table as you progress!

---

## 🎯 Success Criteria

Phase 2 is complete when:

✅ All 125 unit tests passing
✅ Coverage >90% for `src/domains/**`
✅ Zero linting errors
✅ All Zod validation schemas in place
✅ Error handling for all edge cases
✅ Optimistic locking implemented where needed
✅ All domain models pure (no side effects except DB)

---

## 🚀 Ready to Start?

**Recommended Order**:
1. **Day 1**: Business + Customer domains (50 tests)
2. **Day 2**: Loyalty + Campaign domains (50 tests)
3. **Day 3**: Analytics + Referral domains (25 tests)

**Commands to run**:
```bash
# Create directory structure
mkdir -p src/domains/{business,customer,loyalty,campaign,analytics,referral}
mkdir -p tests/unit/domains

# Install Zod
npm install zod

# Create shared types
# (copy from template above)

# Start with Business domain
# 1. Create src/domains/business/Business.ts
# 2. Create tests/unit/domains/business.test.ts
# 3. Follow TDD cycle: RED → GREEN → REFACTOR

# Run tests as you go
npm run test:watch
```

**Good luck! 🚀**

See [PHASE-1-UPDATED-CHECKLIST.md](PHASE-1-UPDATED-CHECKLIST.md) for complete Phase 2 task breakdown.
