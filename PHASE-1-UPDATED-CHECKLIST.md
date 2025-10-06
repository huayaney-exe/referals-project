# IMPLEMENTATION CHECKLIST - UPDATED
# Digital Loyalty Platform - Sequential Phase-by-Phase Guide

**Version**: 1.1
**Stack**: Supabase + Render + Vercel
**Methodology**: Test-Driven Development (TDD)
**Timeline**: 10 weeks to production-ready MVP
**Last Updated**: October 4, 2025

---

## HOW TO USE THIS CHECKLIST

1. **Complete each phase sequentially** - Don't skip ahead
2. **Mark checkboxes as you complete tasks** - Track progress
3. **Each phase has acceptance criteria** - Must pass before moving on
4. **Blockers?** - Document issues in `BLOCKERS.md` (create if needed)
5. **Daily progress** - Update this file daily

**Current Phase**: ✅ Phase 1 COMPLETE → 🔄 Phase 2 (Domain Models TDD)

---

## PHASE 0: PRE-DEVELOPMENT SETUP (Days 1-2) ✅ **SKIPPED**

**Status**: Skipped - Using simplified single-repo structure

**Note**: We're using a simplified structure instead of monorepo:
- Single `src/` directory for all code
- Single `tests/` directory for all tests
- Direct project in `/Users/luishuayaney/Projects/referals`

---

## PHASE 1: FOUNDATION SETUP (Days 3-7) ✅ **COMPLETE**

**Goal**: Configure TypeScript, testing, CI/CD, and database schema

**Completed**: October 4, 2025
**Duration**: ~2 hours

### TypeScript Configuration ✅

- [x] Install TypeScript and dependencies
- [x] Create `tsconfig.json` with strict mode
- [x] Create build script in `package.json`
- [x] Verify TypeScript compilation works

### Code Quality Tools ✅

- [x] Install ESLint and Prettier
- [x] Create `.eslintrc.js`
- [x] Create `.prettierrc`
- [x] Add lint and format scripts
- [x] Verify linting passes (0 errors, 2 warnings OK)

### Testing Infrastructure ✅

- [x] Install Jest and testing dependencies
- [x] Create `jest.config.js` with 80% global, 90% domain coverage
- [x] Add test scripts to `package.json`
- [x] Create initial test (3 tests passing)
- [x] Verify test coverage reporting works

### Supabase Database Setup ✅

- [x] Initialize Supabase CLI (`npx supabase init`)
- [x] Create migrations folder (`supabase/migrations/`)
- [x] Create migration: `00000000000001_initial_schema.sql`
- [x] Create migration: `00000000000002_rls_policies.sql`
- [x] Link to Supabase project (`npx supabase link`)
- [x] Fix UUID function (gen_random_uuid)
- [x] Push migrations (`npx supabase db push --linked`)
- [x] **8 tables created**: businesses, customers, stamps, campaigns, campaign_sends, referrals, analytics_events, outbox_events
- [x] **28 indexes created** for performance
- [x] **15 RLS policies enabled** for security
- [x] **1 stored procedure**: `add_stamp_with_outbox()`
- [x] **1 trigger**: `update_updated_at_column()`

### Environment Configuration ✅

- [x] Create `.env` file
- [x] Create `.env.example` template
- [x] Add SUPABASE_URL
- [x] Add SUPABASE_ANON_KEY
- [x] Add SUPABASE_SERVICE_ROLE_KEY
- [x] Create `.gitignore` to exclude `.env`

### Supabase Client ✅

- [x] Install `@supabase/supabase-js`
- [x] Create `src/config/supabase.ts`
- [x] Configure public client (with RLS)
- [x] Configure admin client (service role)
- [x] Add TypeScript types for database schema

### Express API Setup ✅

- [x] Install Express and dependencies
- [x] Create `src/index.ts` with Express server
- [x] Add health check endpoint (`/health`)
- [x] Add readiness check (`/health/ready`)
- [x] Verify server starts successfully
- [x] Test health checks return 200 OK

### CI/CD Pipeline ✅

- [x] Create `.github/workflows/ci.yml`
- [x] Configure GitHub Actions for:
  - [x] Lint checks
  - [x] TypeScript compilation
  - [x] Test execution
  - [x] Coverage reporting
  - [x] Security audit
- [x] Test pipeline locally (ready for GitHub push)

### Acceptance Criteria (Phase 1) ✅ ALL MET

- [x] TypeScript compiles without errors: `npm run build` ✅
- [x] Linting passes: `npm run lint` ✅ (0 errors, 2 warnings acceptable)
- [x] Can run tests: `npm test` ✅ (3/3 passing, 83% coverage)
- [x] CI pipeline configured ✅ (ready for GitHub)
- [x] **Database schema deployed to Supabase** ✅ (8 tables verified)
- [x] **RLS policies enabled and verified** ✅ (15 policies active)
- [x] **Environment variables configured** ✅ (all credentials set)
- [x] **Health checks passing** ✅ (`{"status":"ready"}`)

**Files Created**: 18 files
**Tables Created**: 8/8 (verified with `npx ts-node scripts/verify-tables.ts`)
**Test Coverage**: 83.33% (3 tests passing)

**Estimated Time**: 1 week → **Actual**: 2 hours ⚡

**See**: [PHASE-1-COMPLETION.md](PHASE-1-COMPLETION.md) and [DATABASE-SETUP-COMPLETE.md](DATABASE-SETUP-COMPLETE.md)

---

## PHASE 2: DOMAIN MODELS (TDD) (Days 8-10) 🔄 **IN PROGRESS**

**Goal**: Build core business logic with TDD (125 unit tests)

**Started**: October 4, 2025
**Target**: 3 days (Days 8-10)

### Overview

Implement 6 domain models using Test-Driven Development:
1. **Business Domain** - 25 tests
2. **Customer Domain** - 25 tests
3. **Loyalty Domain** - 25 tests
4. **Campaign Domain** - 25 tests
5. **Analytics Domain** - 15 tests
6. **Referral Domain** - 10 tests

**Total**: 125 unit tests with >90% coverage

### TDD Workflow (Red-Green-Refactor)

For each domain:
1. **RED**: Write failing test
2. **GREEN**: Write minimum code to pass
3. **REFACTOR**: Improve code quality
4. Repeat until all tests pass

### Business Domain (25 tests)

**File**: `src/domains/business/Business.ts`
**Test**: `tests/unit/domains/business.test.ts`

- [ ] Create Business domain class
- [ ] Write test suite (25 tests):
  - [ ] ✅ RED: should create business with valid data
  - [ ] ✅ GREEN: Implement `Business.create()`
  - [ ] ✅ REFACTOR: Add Zod validation schema
  - [ ] ✅ RED: should reject invalid email format
  - [ ] ✅ GREEN: Add email validation
  - [ ] ✅ RED: should reject duplicate email
  - [ ] ✅ GREEN: Add uniqueness check
  - [ ] ✅ RED: should validate reward structure (stamps_required > 0)
  - [ ] ✅ GREEN: Add reward structure validation
  - [ ] ✅ RED: should reject invalid reward_description
  - [ ] ✅ GREEN: Add description validation
  - [ ] ✅ RED: should update business details
  - [ ] ✅ GREEN: Implement `Business.update()`
  - [ ] ✅ RED: should get business by ID
  - [ ] ✅ GREEN: Implement `Business.findById()`
  - [ ] ✅ RED: should get business by email
  - [ ] ✅ GREEN: Implement `Business.findByEmail()`
  - [ ] ✅ RED: should deactivate business
  - [ ] ✅ GREEN: Implement `Business.deactivate()`
  - [ ] ✅ RED: should only show active businesses
  - [ ] ✅ GREEN: Add `is_active` filter
  - [ ] ✅ RED: should validate phone format (Peru: +51 9XX XXX XXX)
  - [ ] ✅ GREEN: Add Peru phone validation
  - [ ] ✅ RED: should validate category enum
  - [ ] ✅ GREEN: Add category validation
  - [ ] ✅ RED: should handle logo URL validation
  - [ ] ✅ GREEN: Add URL format check
  - [ ] ✅ RED: should use optimistic locking on update
  - [ ] ✅ GREEN: Implement version check
  - [ ] ✅ RED: should throw on version conflict
  - [ ] ✅ GREEN: Handle concurrent update error
  - [ ] Additional edge cases (5 more tests)

- [ ] Run tests: `npm run test:unit -- business.test`
- [ ] Coverage: >90% (verify with coverage report)
- [ ] Refactor: Extract validation logic to shared utils

### Customer Domain (25 tests)

**File**: `src/domains/customer/Customer.ts`
**Test**: `tests/unit/domains/customer.test.ts`

- [ ] Create Customer domain class
- [ ] Write test suite (25 tests):
  - [ ] ✅ RED: should create customer with valid Peru phone
  - [ ] ✅ GREEN: Implement `Customer.create()`
  - [ ] ✅ REFACTOR: Add Zod validation
  - [ ] ✅ RED: should reject invalid Peru phone format
  - [ ] ✅ GREEN: Add phone validation regex: `^\\+51 9\\d{2} \\d{3} \\d{3}$`
  - [ ] ✅ RED: should prevent duplicate enrollment
  - [ ] ✅ GREEN: Check UNIQUE(business_id, phone)
  - [ ] ✅ RED: should enroll customer with initial stamps = 0
  - [ ] ✅ GREEN: Set default stamps_count
  - [ ] ✅ RED: should update customer name
  - [ ] ✅ GREEN: Implement `Customer.updateName()`
  - [ ] ✅ RED: should get customer by ID
  - [ ] ✅ GREEN: Implement `Customer.findById()`
  - [ ] ✅ RED: should get customer by phone
  - [ ] ✅ GREEN: Implement `Customer.findByPhone(business_id, phone)`
  - [ ] ✅ RED: should list all customers for business
  - [ ] ✅ GREEN: Implement `Customer.findByBusiness(business_id)`
  - [ ] ✅ RED: should track last_stamp_at timestamp
  - [ ] ✅ GREEN: Update last_stamp_at on stamp
  - [ ] ✅ RED: should calculate total_rewards_earned
  - [ ] ✅ GREEN: Increment on reward redemption
  - [ ] ✅ RED: should store pass_serial_number (Apple Wallet)
  - [ ] ✅ GREEN: Add pass_serial_number field
  - [ ] ✅ RED: should store pass_url
  - [ ] ✅ GREEN: Add pass_url field
  - [ ] ✅ RED: should use optimistic locking
  - [ ] ✅ GREEN: Version check on update
  - [ ] ✅ RED: should throw on version conflict
  - [ ] ✅ GREEN: Handle concurrent updates
  - [ ] Additional edge cases (10 more tests)

- [ ] Run tests: `npm run test:unit -- customer.test`
- [ ] Coverage: >90%

### Loyalty Domain (25 tests)

**File**: `src/domains/loyalty/Stamp.ts`
**Test**: `tests/unit/domains/loyalty.test.ts`

- [ ] Create Stamp/Loyalty domain class
- [ ] Write test suite (25 tests):
  - [ ] ✅ RED: should add stamp to customer
  - [ ] ✅ GREEN: Implement `Stamp.add(customer_id, business_id)`
  - [ ] ✅ REFACTOR: Extract to service method
  - [ ] ✅ RED: should increment customer stamps_count
  - [ ] ✅ GREEN: Update customer.stamps_count + 1
  - [ ] ✅ RED: should reset stamps when reward unlocked (stamps >= required)
  - [ ] ✅ GREEN: Check if stamps >= reward_structure.stamps_required
  - [ ] ✅ RED: should create stamp record in stamps table
  - [ ] ✅ GREEN: Insert into stamps table
  - [ ] ✅ RED: should mark stamp as reward redemption
  - [ ] ✅ GREEN: Set is_reward_redemption = true
  - [ ] ✅ RED: should record stamps_before and stamps_after
  - [ ] ✅ GREEN: Track state transition
  - [ ] ✅ RED: should prevent duplicate stamp with idempotency_key
  - [ ] ✅ GREEN: Check idempotency_key uniqueness
  - [ ] ✅ RED: should throw on duplicate idempotency_key
  - [ ] ✅ GREEN: Handle UNIQUE constraint error
  - [ ] ✅ RED: should use transactional outbox pattern
  - [ ] ✅ GREEN: Call `add_stamp_with_outbox()` stored procedure
  - [ ] ✅ RED: should insert outbox event for PassKit update
  - [ ] ✅ GREEN: Insert into outbox_events table
  - [ ] ✅ RED: should use optimistic locking
  - [ ] ✅ GREEN: Version check in stored procedure
  - [ ] ✅ RED: should throw on concurrent stamp addition
  - [ ] ✅ GREEN: Handle version conflict error
  - [ ] ✅ RED: should track stamped_by user
  - [ ] ✅ GREEN: Store stamped_by field
  - [ ] ✅ RED: should get stamp history for customer
  - [ ] ✅ GREEN: Implement `Stamp.getHistory(customer_id)`
  - [ ] Additional edge cases (10 more tests)

- [ ] Run tests: `npm run test:unit -- loyalty.test`
- [ ] Coverage: >90%

### Campaign Domain (25 tests)

**File**: `src/domains/campaign/Campaign.ts`
**Test**: `tests/unit/domains/campaign.test.ts`

- [ ] Create Campaign domain class
- [ ] Write test suite (25 tests):
  - [ ] ✅ RED: should create campaign with valid config
  - [ ] ✅ GREEN: Implement `Campaign.create()`
  - [ ] ✅ RED: should validate campaign name (required, min 3 chars)
  - [ ] ✅ GREEN: Add name validation
  - [ ] ✅ RED: should validate message template (required, max 1600 chars)
  - [ ] ✅ GREEN: Add message validation
  - [ ] ✅ RED: should validate target_segment structure
  - [ ] ✅ GREEN: Add segment validation (min_stamps, max_stamps)
  - [ ] ✅ RED: should set status to 'draft' by default
  - [ ] ✅ GREEN: Default status = 'draft'
  - [ ] ✅ RED: should transition to 'scheduled' status
  - [ ] ✅ GREEN: Implement `Campaign.schedule(scheduled_for)`
  - [ ] ✅ RED: should reject invalid status transitions
  - [ ] ✅ GREEN: Add status machine validation
  - [ ] ✅ RED: should validate scheduled_for is future timestamp
  - [ ] ✅ GREEN: Check timestamp > NOW()
  - [ ] ✅ RED: should get campaigns by business
  - [ ] ✅ GREEN: Implement `Campaign.findByBusiness(business_id)`
  - [ ] ✅ RED: should filter by status
  - [ ] ✅ GREEN: Add status filter
  - [ ] ✅ RED: should update campaign details
  - [ ] ✅ GREEN: Implement `Campaign.update()`
  - [ ] ✅ RED: should delete campaign (only if draft)
  - [ ] ✅ GREEN: Check status = 'draft' before delete
  - [ ] ✅ RED: should prevent deletion of sent campaigns
  - [ ] ✅ GREEN: Throw error if status != 'draft'
  - [ ] ✅ RED: should track sent_count
  - [ ] ✅ GREEN: Increment on each send
  - [ ] ✅ RED: should mark campaign as 'completed'
  - [ ] ✅ GREEN: Set status = 'completed', completed_at = NOW()
  - [ ] Additional edge cases (10 more tests)

- [ ] Run tests: `npm run test:unit -- campaign.test`
- [ ] Coverage: >90%

### Analytics Domain (15 tests)

**File**: `src/domains/analytics/Analytics.ts`
**Test**: `tests/unit/domains/analytics.test.ts`

- [ ] Create Analytics domain class
- [ ] Write test suite (15 tests):
  - [ ] ✅ RED: should calculate total customers
  - [ ] ✅ GREEN: Implement `Analytics.getTotalCustomers(business_id)`
  - [ ] ✅ RED: should calculate total stamps given
  - [ ] ✅ GREEN: Count rows in stamps table
  - [ ] ✅ RED: should calculate total rewards redeemed
  - [ ] ✅ GREEN: Sum is_reward_redemption = true
  - [ ] ✅ RED: should get stamps per day (time series)
  - [ ] ✅ GREEN: GROUP BY DATE(stamped_at)
  - [ ] ✅ RED: should get customer acquisition trend
  - [ ] ✅ GREEN: GROUP BY DATE(enrolled_at)
  - [ ] ✅ RED: should get top customers by stamps
  - [ ] ✅ GREEN: ORDER BY stamps_count DESC LIMIT N
  - [ ] ✅ RED: should calculate average stamps per customer
  - [ ] ✅ GREEN: AVG(stamps_count)
  - [ ] ✅ RED: should filter analytics by date range
  - [ ] ✅ GREEN: WHERE stamped_at BETWEEN start AND end
  - [ ] Additional edge cases (7 more tests)

- [ ] Run tests: `npm run test:unit -- analytics.test`
- [ ] Coverage: >90%

### Referral Domain (10 tests)

**File**: `src/domains/referral/Referral.ts`
**Test**: `tests/unit/domains/referral.test.ts`

- [ ] Create Referral domain class
- [ ] Write test suite (10 tests):
  - [ ] ✅ RED: should create referral code
  - [ ] ✅ GREEN: Implement `Referral.create(referrer_customer_id)`
  - [ ] ✅ RED: should generate unique 8-char alphanumeric code
  - [ ] ✅ GREEN: Generate random code
  - [ ] ✅ RED: should track referral status (pending/completed/expired)
  - [ ] ✅ GREEN: Set status = 'pending'
  - [ ] ✅ RED: should mark referral as completed
  - [ ] ✅ GREEN: Implement `Referral.complete(referred_customer_id)`
  - [ ] ✅ RED: should grant bonus stamps to referrer
  - [ ] ✅ GREEN: Update customer.stamps_count
  - [ ] ✅ RED: should track referred customer
  - [ ] ✅ GREEN: Store referred_customer_id
  - [ ] ✅ RED: should set completed_at timestamp
  - [ ] ✅ GREEN: Set completed_at = NOW()
  - [ ] ✅ RED: should expire referrals after 30 days
  - [ ] ✅ GREEN: Check expires_at < NOW()
  - [ ] ✅ RED: should prevent double completion
  - [ ] ✅ GREEN: Check status != 'completed'
  - [ ] Additional edge cases (1 more test)

- [ ] Run tests: `npm run test:unit -- referral.test`
- [ ] Coverage: >90%

### Acceptance Criteria (Phase 2)

- [ ] All 125 unit tests passing
- [ ] Overall coverage >90% for `src/domains/**`
- [ ] No linting errors
- [ ] All domain models follow TDD methodology
- [ ] Zod validation schemas for all input
- [ ] Error handling for all edge cases
- [ ] Domain models are pure (no side effects except DB)

**Estimated Time**: 3 days (Days 8-10)

---

## Next: PHASE 3 (API Layer - Days 11-17)

After Phase 2 completion, move to API layer with 60 integration tests.

See full [IMPLEMENTATION-CHECKLIST.md](IMPLEMENTATION-CHECKLIST.md) for remaining phases.
