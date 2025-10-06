# Test-Driven Development Implementation Plan
# Digital Loyalty Platform - Production Grade

**Version**: 1.0
**Date**: January 2025
**Scope**: Phased development with TDD methodology
**Target**: Year 1-2 production system supporting excellent CX, scalability, and efficiency

---

## Executive Summary

This document outlines a **Test-Driven Development (TDD) approach** to build a production-grade digital loyalty platform. The plan is structured around:

1. **Red-Green-Refactor** cycle for all features
2. **Test Pyramid** (70% unit, 20% integration, 10% E2E)
3. **Domain-Driven Design** boundaries with isolated testing
4. **Continuous Integration** with automated test gates
5. **Performance Testing** before each major release

**Key Principle**: Write tests FIRST, then implement. No feature ships without >80% test coverage.

---

## TDD Methodology

### Red-Green-Refactor Cycle

```
┌─────────────────────────────────────────────────┐
│  1. RED: Write failing test (feature doesn't   │
│          exist yet)                             │
│                                                 │
│  2. GREEN: Write minimal code to make test pass│
│           (quick & dirty is OK)                 │
│                                                 │
│  3. REFACTOR: Clean up code while keeping tests│
│              green (improve design)             │
└─────────────────────────────────────────────────┘
```

**Example** (Create Campaign Feature):
```typescript
// 1. RED: Write test first
describe('CampaignService', () => {
  it('should create inactivity campaign with trigger config', async () => {
    const campaign = await campaignService.create({
      businessId: 'biz-123',
      name: 'Win back inactive customers',
      trigger_type: 'inactivity',
      trigger_config: { days_inactive: 14, discount_percent: 15 },
      message_template: 'Te extrañamos {{name}}!'
    });

    expect(campaign.id).toBeDefined();
    expect(campaign.status).toBe('draft');
  });
});

// Test fails (service doesn't exist) ❌

// 2. GREEN: Implement minimal code
class CampaignService {
  async create(data) {
    return await db.campaigns.insert(data);
  }
}

// Test passes ✅

// 3. REFACTOR: Add validation, types, error handling
class CampaignService {
  async create(data: CreateCampaignInput): Promise<Campaign> {
    // Validate input
    const validated = CreateCampaignSchema.parse(data);

    // Insert with proper types
    const campaign = await db.campaigns.insert({
      ...validated,
      id: uuid(),
      status: 'draft',
      created_at: new Date()
    });

    return campaign;
  }
}

// Test still passes ✅ (refactoring didn't break anything)
```

### Test Pyramid Structure

```
           ┌──────────────┐
           │   E2E Tests  │ 10% (slow, fragile, high value)
           │  (Playwright)│
           └──────────────┘
       ┌─────────────────────┐
       │ Integration Tests   │ 20% (medium speed, real dependencies)
       │ (Jest + Test DB)    │
       └─────────────────────┘
   ┌────────────────────────────┐
   │      Unit Tests             │ 70% (fast, isolated, low-level)
   │  (Jest + Mocks)             │
   └────────────────────────────┘
```

**Rationale**:
- **Unit Tests**: Fast feedback loop (run in <1s), test business logic in isolation
- **Integration Tests**: Test real database queries, external API integrations
- **E2E Tests**: Critical user flows only (enrollment, stamping, campaign activation)

---

## Test Stack

### Unit & Integration Testing: Jest + TypeScript

```json
{
  "jest": "^29.7.0",
  "ts-jest": "^29.1.1",
  "@types/jest": "^29.5.11",
  "supertest": "^6.3.3"  // API endpoint testing
}
```

**Jest Configuration** (`jest.config.js`):
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/*.test.ts',
    '**/*.spec.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts'
  ]
};
```

### E2E Testing: Playwright

```json
{
  "@playwright/test": "^1.40.1"
}
```

**Why Playwright over Cypress**:
- ✅ Multi-browser (Chromium, Firefox, WebKit)
- ✅ Better TypeScript support
- ✅ Faster parallel execution
- ✅ Built-in auto-wait (no flaky tests)

### Load Testing: k6

```bash
# k6 load testing tool (runs locally or in CI)
brew install k6
```

---

## Phase 1: Foundation (Weeks 1-2)

**Goal**: Set up project structure, testing infrastructure, and core domain models

### 1.1 Project Setup

**Tasks**:
- [x] Initialize TypeScript project (`tsconfig.json`)
- [x] Configure Jest for unit + integration tests
- [x] Set up ESLint + Prettier
- [x] Configure GitHub Actions CI/CD
- [x] Set up local PostgreSQL + Redis (Docker Compose)

**Test Files Created**:
```
tests/
├── setup/
│   ├── jest.setup.ts        # Global test setup
│   ├── testDatabase.ts      # Test DB helper (reset between tests)
│   └── testRedis.ts         # Test Redis helper
└── README.md                # How to run tests
```

**Acceptance Criteria**:
- [x] `npm test` runs all tests successfully
- [x] Test coverage report generated (`npm run test:coverage`)
- [x] CI pipeline runs tests on every PR

### 1.2 Core Domain Models (TDD)

**Domain**: `src/domains/business/`

**Test Scenarios** (write tests FIRST):
```typescript
describe('Business Domain', () => {
  describe('Business.create', () => {
    it('should create business with valid data', async () => {
      const business = await Business.create({
        email: 'owner@coffee.pe',
        name: 'Café Lima',
        reward_structure: { stamps_required: 5, reward: 'Free coffee' }
      });

      expect(business.id).toBeDefined();
      expect(business.email).toBe('owner@coffee.pe');
    });

    it('should reject duplicate email', async () => {
      await Business.create({ email: 'owner@coffee.pe', ... });

      await expect(
        Business.create({ email: 'owner@coffee.pe', ... })
      ).rejects.toThrow('Email already exists');
    });

    it('should validate reward structure', async () => {
      await expect(
        Business.create({
          email: 'owner@coffee.pe',
          reward_structure: { stamps_required: 0 } // Invalid
        })
      ).rejects.toThrow('stamps_required must be >= 1');
    });
  });
});
```

**Implementation** (after tests written):
```typescript
// src/domains/business/Business.ts
import { z } from 'zod';

const RewardStructureSchema = z.object({
  stamps_required: z.number().int().min(1).max(20),
  reward: z.string().min(3).max(255)
});

const CreateBusinessSchema = z.object({
  email: z.string().email(),
  name: z.string().min(3).max(255),
  reward_structure: RewardStructureSchema
});

export class Business {
  static async create(data: z.infer<typeof CreateBusinessSchema>) {
    // Validate input
    const validated = CreateBusinessSchema.parse(data);

    // Check for duplicate email
    const existing = await db.businesses.findOne({ email: validated.email });
    if (existing) {
      throw new Error('Email already exists');
    }

    // Insert into database
    const business = await db.businesses.insert({
      ...validated,
      id: uuid(),
      created_at: new Date()
    });

    return business;
  }
}
```

**Domains to Build** (in order):
1. **Business** (account management) - 15 tests
2. **Customer** (enrollment, profiles) - 20 tests
3. **Loyalty** (stamps, rewards) - 25 tests
4. **Campaign** (creation, triggers) - 30 tests
5. **Analytics** (metrics, aggregations) - 15 tests
6. **Referral** (attribution, rewards) - 20 tests

**Total**: ~125 unit tests covering domain logic

---

## Phase 2: API Layer (Weeks 3-4)

**Goal**: Build RESTful API with comprehensive integration tests

### 2.1 Authentication & Authorization (TDD)

**Test Scenarios**:
```typescript
describe('POST /api/v1/auth/register', () => {
  it('should register new business owner', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'owner@coffee.pe',
        password: 'SecurePass123!',
        business_name: 'Café Lima'
      });

    expect(response.status).toBe(201);
    expect(response.body.access_token).toBeDefined();
    expect(response.body.refresh_token).toBeDefined();
  });

  it('should reject weak password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'owner@coffee.pe',
        password: '123', // Too weak
        business_name: 'Café Lima'
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Password must be');
  });
});

describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    // Seed test user
    await createTestBusiness({ email: 'owner@coffee.pe', password: 'SecurePass123!' });
  });

  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'owner@coffee.pe',
        password: 'SecurePass123!'
      });

    expect(response.status).toBe(200);
    expect(response.body.access_token).toBeDefined();
  });

  it('should reject invalid password', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'owner@coffee.pe',
        password: 'WrongPassword'
      });

    expect(response.status).toBe(401);
  });
});
```

**API Endpoints to Build** (with tests FIRST):
- `POST /api/v1/auth/register` - 5 tests
- `POST /api/v1/auth/login` - 4 tests
- `POST /api/v1/auth/refresh` - 3 tests
- `POST /api/v1/auth/logout` - 2 tests

### 2.2 Core API Endpoints (TDD)

**Customer Enrollment API**:
```typescript
describe('POST /api/v1/enrollments', () => {
  it('should enroll customer and generate .pkpass file', async () => {
    const response = await request(app)
      .post('/api/v1/enrollments')
      .send({
        business_id: 'biz-123',
        name: 'María López',
        phone: '+51912345678'
      });

    expect(response.status).toBe(201);
    expect(response.body.customer_id).toBeDefined();
    expect(response.body.passkit_url).toMatch(/\.pkpass$/);
  });

  it('should prevent duplicate enrollment with same phone', async () => {
    // First enrollment
    await request(app)
      .post('/api/v1/enrollments')
      .send({ business_id: 'biz-123', phone: '+51912345678', ... });

    // Duplicate enrollment
    const response = await request(app)
      .post('/api/v1/enrollments')
      .send({ business_id: 'biz-123', phone: '+51912345678', ... });

    expect(response.status).toBe(409); // Conflict
    expect(response.body.error).toContain('already enrolled');
  });

  it('should validate Peru phone number format', async () => {
    const response = await request(app)
      .post('/api/v1/enrollments')
      .send({
        business_id: 'biz-123',
        phone: '+1234567890' // Invalid Peru number
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Peru phone number');
  });
});
```

**Stamping API**:
```typescript
describe('POST /api/v1/stamps', () => {
  beforeEach(async () => {
    // Seed test customer
    testCustomer = await createTestCustomer({ business_id: 'biz-123', stamps_count: 3 });
  });

  it('should add stamp and update pass', async () => {
    const response = await authenticatedRequest(app, businessOwnerToken)
      .post('/api/v1/stamps')
      .send({
        customer_id: testCustomer.id
      });

    expect(response.status).toBe(201);
    expect(response.body.stamps_count).toBe(4); // 3 + 1
    expect(response.body.passkit_updated).toBe(true);
  });

  it('should trigger reward when threshold reached', async () => {
    // Customer has 4 stamps, needs 5 for reward
    testCustomer = await createTestCustomer({ stamps_count: 4, stamps_required: 5 });

    const response = await authenticatedRequest(app, businessOwnerToken)
      .post('/api/v1/stamps')
      .send({ customer_id: testCustomer.id });

    expect(response.body.reward_unlocked).toBe(true);
    expect(response.body.stamps_count).toBe(0); // Reset after reward
  });

  it('should prevent duplicate stamp within cooldown period', async () => {
    // Add stamp
    await authenticatedRequest(app, businessOwnerToken)
      .post('/api/v1/stamps')
      .send({ customer_id: testCustomer.id });

    // Try to add another stamp immediately
    const response = await authenticatedRequest(app, businessOwnerToken)
      .post('/api/v1/stamps')
      .send({ customer_id: testCustomer.id });

    expect(response.status).toBe(429); // Too Many Requests
    expect(response.body.error).toContain('cooldown');
  });
});
```

**API Endpoints with Tests**:
- `POST /api/v1/enrollments` - 8 tests
- `POST /api/v1/stamps` - 10 tests
- `GET /api/v1/customers/:id` - 5 tests
- `GET /api/v1/customers?search={phone}` - 4 tests
- `POST /api/v1/campaigns` - 12 tests
- `PATCH /api/v1/campaigns/:id/activate` - 6 tests
- `GET /api/v1/analytics/dashboard` - 8 tests

**Total**: ~60 integration tests covering API layer

---

## Phase 3: External Integrations (Weeks 5-6)

**Goal**: Integrate Twilio, PassKit, S3 with comprehensive mocking and contract testing

### 3.1 Twilio WhatsApp Integration (TDD)

**Test Strategy**: Use **mock server** to avoid real API calls in tests

```typescript
import nock from 'nock'; // HTTP mocking library

describe('TwilioWhatsAppService', () => {
  describe('sendMessage', () => {
    it('should send WhatsApp message successfully', async () => {
      // Mock Twilio API response
      nock('https://api.twilio.com')
        .post('/2010-04-01/Accounts/ACXXX/Messages.json')
        .reply(201, {
          sid: 'SM123',
          status: 'queued',
          to: 'whatsapp:+51912345678'
        });

      const result = await twilioService.sendMessage({
        to: '+51912345678',
        body: '¡Hola María! Te extrañamos ☕'
      });

      expect(result.sid).toBe('SM123');
      expect(result.status).toBe('queued');
    });

    it('should handle rate limit error (429)', async () => {
      nock('https://api.twilio.com')
        .post('/2010-04-01/Accounts/ACXXX/Messages.json')
        .reply(429, { error: 'Rate limit exceeded' });

      await expect(
        twilioService.sendMessage({ to: '+51912345678', body: 'Test' })
      ).rejects.toThrow('Rate limit exceeded');
    });

    it('should handle invalid phone number (400)', async () => {
      nock('https://api.twilio.com')
        .post('/2010-04-01/Accounts/ACXXX/Messages.json')
        .reply(400, { error: 'Invalid phone number' });

      await expect(
        twilioService.sendMessage({ to: 'invalid', body: 'Test' })
      ).rejects.toThrow('Invalid phone number');
    });
  });

  describe('webhook handler', () => {
    it('should process delivered status webhook', async () => {
      const webhookPayload = {
        MessageSid: 'SM123',
        MessageStatus: 'delivered'
      };

      const response = await request(app)
        .post('/webhooks/twilio/status')
        .send(webhookPayload);

      expect(response.status).toBe(200);

      // Verify database updated
      const send = await db.campaign_sends.findOne({ twilio_sid: 'SM123' });
      expect(send.delivered_at).toBeDefined();
    });
  });
});
```

**Twilio Tests**:
- Send message success - 1 test
- Handle rate limit (429) - 1 test
- Handle invalid number (400) - 1 test
- Webhook processing (delivered, failed, read) - 3 tests

### 3.2 PassKit Integration (TDD)

**Test Strategy**: Generate real .pkpass files in tests, validate structure

```typescript
import { PKPass } from 'passkit-generator';

describe('PassKitService', () => {
  describe('generateLoyaltyPass', () => {
    it('should generate valid .pkpass file', async () => {
      const customer = await createTestCustomer({ stamps_count: 3 });
      const business = await createTestBusiness({ reward_structure: { stamps_required: 5 } });

      const passUrl = await passkitService.generateLoyaltyPass(customer, business);

      expect(passUrl).toMatch(/\.pkpass$/);

      // Download and validate pass
      const passBuffer = await downloadFile(passUrl);
      const pass = await PKPass.from(passBuffer);

      expect(pass.serialNumber).toBe(customer.id);
      expect(pass.primaryFields[0].value).toBe(3); // Stamps count
    });

    it('should include QR code for stamper scanning', async () => {
      const customer = await createTestCustomer();
      const passUrl = await passkitService.generateLoyaltyPass(customer, business);

      const passBuffer = await downloadFile(passUrl);
      const pass = await PKPass.from(passBuffer);

      expect(pass.barcodes[0].format).toBe('PKBarcodeFormatQR');
      expect(pass.barcodes[0].message).toBe(customer.id); // Customer ID encoded
    });
  });

  describe('updatePass', () => {
    it('should send APNs notification for pass update', async () => {
      // Mock APNs
      nock('https://api.push.apple.com')
        .post('/3/device/abc123')
        .reply(200);

      await passkitService.updatePass(customer.id, { stamps_count: 4 });

      // Verify APNs notification sent (check nock was called)
      expect(nock.isDone()).toBe(true);
    });
  });
});
```

**PassKit Tests**:
- Generate .pkpass with correct data - 2 tests
- QR code included - 1 test
- APNs push notification - 1 test
- Handle certificate errors - 1 test

### 3.3 S3 Storage Integration (TDD)

**Test Strategy**: Use **localstack** (local S3 emulator) in tests

```typescript
describe('S3StorageService', () => {
  describe('uploadLogo', () => {
    it('should upload logo to S3 and return CDN URL', async () => {
      const logoBuffer = fs.readFileSync('./test-fixtures/logo.png');

      const url = await s3Service.uploadLogo('biz-123', logoBuffer);

      expect(url).toMatch(/cloudfront\.net\/logos\/biz-123\.png/);

      // Verify file exists in S3
      const exists = await s3Service.fileExists('logos/biz-123.png');
      expect(exists).toBe(true);
    });

    it('should reject files >2MB', async () => {
      const largeLogo = Buffer.alloc(3 * 1024 * 1024); // 3MB

      await expect(
        s3Service.uploadLogo('biz-123', largeLogo)
      ).rejects.toThrow('File size exceeds 2MB');
    });
  });
});
```

**S3 Tests**:
- Upload logo success - 1 test
- File size validation - 1 test
- Generate signed URLs - 1 test

---

## Phase 4: Background Jobs (Week 7)

**Goal**: Build reliable job queue with retry logic and monitoring

### 4.1 Campaign Send Jobs (TDD)

**Test Strategy**: Use **in-memory Bull queue** for tests (fast, no Redis required)

```typescript
import { Queue } from 'bull';

describe('Campaign Send Worker', () => {
  let campaignQueue: Queue;

  beforeEach(() => {
    campaignQueue = new Queue('campaign_sends', {
      redis: { host: 'localhost', port: 6379 } // Test Redis
    });
  });

  describe('process send job', () => {
    it('should send WhatsApp message and update status', async () => {
      // Mock Twilio
      nock('https://api.twilio.com')
        .post('/2010-04-01/Accounts/ACXXX/Messages.json')
        .reply(201, { sid: 'SM123', status: 'queued' });

      // Add job to queue
      await campaignQueue.add('send-whatsapp', {
        campaign_id: 'camp-123',
        customer_id: 'cust-456',
        message_template: 'Hola {{name}}!',
        variables: { name: 'María' }
      });

      // Wait for job to complete
      await campaignQueue.process('send-whatsapp', async (job) => {
        await processCampaignSendJob(job.data);
      });

      // Verify database updated
      const send = await db.campaign_sends.findOne({ campaign_id: 'camp-123', customer_id: 'cust-456' });
      expect(send.sent_at).toBeDefined();
      expect(send.twilio_sid).toBe('SM123');
    });

    it('should retry failed jobs with exponential backoff', async () => {
      // Mock Twilio failure
      nock('https://api.twilio.com')
        .post('/2010-04-01/Accounts/ACXXX/Messages.json')
        .reply(500, { error: 'Internal server error' });

      await campaignQueue.add('send-whatsapp', { ... }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000 // 1s, 2s, 4s
        }
      });

      // Verify job retried 3 times
      const failedJobs = await campaignQueue.getFailed();
      expect(failedJobs[0].attemptsMade).toBe(3);
    });

    it('should move to dead letter queue after max retries', async () => {
      // ... (similar to above, but verify DLQ)
    });
  });
});
```

**Job Queue Tests**:
- Send WhatsApp success - 1 test
- Retry on failure - 1 test
- Dead letter queue - 1 test
- PassKit update job - 2 tests
- Analytics job - 2 tests

---

## Phase 5: Real-Time Features (Week 8)

**Goal**: Build WebSocket connections for real-time dashboard updates

### 5.1 Dashboard WebSocket (TDD)

**Test Strategy**: Use Socket.io client for integration tests

```typescript
import { io, Socket } from 'socket.io-client';

describe('Dashboard WebSocket', () => {
  let clientSocket: Socket;
  let serverSocket: any;

  beforeEach((done) => {
    // Start server
    const httpServer = app.listen();
    const ioServer = new Server(httpServer);

    ioServer.on('connection', (socket) => {
      serverSocket = socket;
    });

    // Connect client
    clientSocket = io(`http://localhost:${httpServer.address().port}`, {
      auth: { token: businessOwnerToken }
    });

    clientSocket.on('connect', done);
  });

  afterEach(() => {
    clientSocket.close();
  });

  it('should emit stamp_added event when stamp created', (done) => {
    // Listen for event
    clientSocket.on('stamp_added', (data) => {
      expect(data.customer_id).toBe('cust-123');
      expect(data.stamps_count).toBe(4);
      done();
    });

    // Trigger stamp creation
    await createStamp({ customer_id: 'cust-123' });
  });

  it('should only send events to correct business', (done) => {
    // Business A connects
    const clientA = io(serverUrl, { auth: { token: businessAToken } });

    // Business B connects
    const clientB = io(serverUrl, { auth: { token: businessBToken } });

    // Business A creates stamp
    await createStamp({ business_id: 'biz-A', customer_id: 'cust-123' });

    // Only Business A should receive event
    clientA.on('stamp_added', () => {
      done(); // Success
    });

    clientB.on('stamp_added', () => {
      throw new Error('Business B should not receive event for Business A');
    });
  });
});
```

**WebSocket Tests**:
- Emit stamp_added event - 1 test
- Event isolation by business - 1 test
- Reconnection handling - 1 test

---

## Phase 6: End-to-End Testing (Week 9)

**Goal**: Test critical user flows with Playwright

### 6.1 E2E Test Scenarios

**Scenario 1: Business Owner Onboarding**
```typescript
import { test, expect } from '@playwright/test';

test('business owner can complete onboarding flow', async ({ page }) => {
  // Navigate to signup
  await page.goto('https://app.loyaltyplatform.pe/signup');

  // Fill form
  await page.fill('input[name="email"]', 'owner@coffee.pe');
  await page.fill('input[name="password"]', 'SecurePass123!');
  await page.fill('input[name="business_name"]', 'Café Lima');
  await page.click('button[type="submit"]');

  // Wait for dashboard redirect
  await expect(page).toHaveURL(/\/dashboard$/);

  // Verify setup wizard appears
  await expect(page.locator('h1')).toContainText('Configura tu programa de lealtad');

  // Complete setup wizard
  await page.setInputFiles('input[type="file"]', './test-fixtures/logo.png');
  await page.fill('input[name="stamps_required"]', '5');
  await page.fill('input[name="reward"]', 'Café gratis');
  await page.click('button:has-text("Continuar")');

  // Verify QR code poster generated
  await expect(page.locator('img[alt="QR Code"]')).toBeVisible();
  await page.click('button:has-text("Descargar Póster")');

  // Verify download started
  const download = await page.waitForEvent('download');
  expect(download.suggestedFilename()).toContain('.pdf');
});
```

**Scenario 2: Customer Enrollment Flow**
```typescript
test('customer can enroll via QR code and get Apple Wallet card', async ({ page }) => {
  // Simulate QR code scan (navigate to enrollment page)
  await page.goto('https://app.loyaltyplatform.pe/enroll/biz-123');

  // Fill enrollment form
  await page.fill('input[name="name"]', 'María López');
  await page.fill('input[name="phone"]', '+51912345678');
  await page.click('button:has-text("Agregar a Apple Wallet")');

  // Verify .pkpass download started
  const download = await page.waitForEvent('download');
  expect(download.suggestedFilename()).toContain('.pkpass');

  // Verify success message
  await expect(page.locator('.success-message')).toContainText('¡Tarjeta agregada!');
});
```

**Scenario 3: Stamping Flow (Web Stamper)**
```typescript
test('business owner can stamp customer via web stamper', async ({ page, context }) => {
  // Login
  await page.goto('https://app.loyaltyplatform.pe/stamp');
  await page.fill('input[name="email"]', 'owner@coffee.pe');
  await page.fill('input[name="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');

  // Grant camera permissions (mock)
  await context.grantPermissions(['camera']);

  // Simulate QR code scan (inject customer ID)
  await page.evaluate(() => {
    window.dispatchEvent(new CustomEvent('qr-scan', {
      detail: { customerId: 'cust-123' }
    }));
  });

  // Verify customer details displayed
  await expect(page.locator('.customer-name')).toContainText('María López');
  await expect(page.locator('.stamps-count')).toContainText('3/5 sellos');

  // Add stamp
  await page.click('button:has-text("Agregar Sello")');

  // Verify success
  await expect(page.locator('.stamps-count')).toContainText('4/5 sellos');
  await expect(page.locator('.success-toast')).toContainText('¡Sello agregado!');
});
```

**Scenario 4: Campaign Creation Flow**
```typescript
test('business owner can create and activate campaign', async ({ page }) => {
  // Login and navigate to campaigns
  await loginAsBusinessOwner(page);
  await page.goto('https://app.loyaltyplatform.pe/dashboard/campaigns');

  // Create new campaign
  await page.click('button:has-text("Nueva Campaña")');

  // Fill campaign form
  await page.fill('input[name="name"]', 'Win back inactive customers');
  await page.selectOption('select[name="trigger_type"]', 'inactivity');
  await page.fill('input[name="days_inactive"]', '14');
  await page.fill('input[name="discount_percent"]', '15');
  await page.fill('textarea[name="message_template"]', 'Te extrañamos {{name}}! Usa {{discount_code}}');

  // Preview campaign
  await page.click('button:has-text("Vista Previa")');
  await expect(page.locator('.preview-message')).toContainText('Te extrañamos María!');

  // Send test
  await page.click('button:has-text("Enviar Prueba")');
  await expect(page.locator('.test-sent')).toContainText('Mensaje de prueba enviado');

  // Activate campaign
  await page.click('button:has-text("Activar Campaña")');
  await expect(page.locator('.campaign-status')).toContainText('Activa');
});
```

**E2E Test Coverage**:
- Business owner onboarding - 1 test
- Customer enrollment - 1 test
- Web stamper (QR scan + stamp) - 1 test
- Campaign creation + activation - 1 test
- Dashboard metrics view - 1 test

**Total**: 5 critical E2E tests

---

## Phase 7: Performance Testing (Week 10)

**Goal**: Validate system can handle Year 1-2 projected load

### 7.1 Load Testing with k6

**Test Scenario**: Simulate peak stamping load (112 stamps/minute at Year 3)

```javascript
// loadtest/stamp-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp up to 50 concurrent users
    { duration: '5m', target: 50 },   // Stay at 50 for 5 minutes
    { duration: '2m', target: 100 },  // Ramp up to 100
    { duration: '5m', target: 100 },  // Stay at 100 for 5 minutes
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    'http_req_failed': ['rate<0.01'], // <1% failure rate
  }
};

export default function() {
  const url = 'https://api.loyaltyplatform.pe/api/v1/stamps';
  const payload = JSON.stringify({
    customer_id: `cust-${__VU}-${__ITER}`, // Unique customer per iteration
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.ACCESS_TOKEN}`,
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1); // 1 second between requests per user
}
```

**Run Load Test**:
```bash
# Year 1 load (236 stamps/day = ~20/min peak)
k6 run --vus 10 --duration 5m loadtest/stamp-load.js

# Year 2 load (1,125 stamps/day = ~94/min peak)
k6 run --vus 50 --duration 10m loadtest/stamp-load.js

# Year 3 load (27,000 stamps/day = ~112/min peak)
k6 run --vus 100 --duration 10m loadtest/stamp-load.js
```

**Acceptance Criteria**:
- ✅ p95 response time <500ms (Year 1-3)
- ✅ p99 response time <1s (Year 1-3)
- ✅ <1% error rate under peak load
- ✅ CPU <70%, memory <75% during test

### 7.2 Database Performance Testing

**Test Scenario**: Validate database can handle concurrent reads/writes

```sql
-- Simulate concurrent stamping queries
-- Run with pgbench or custom script

BEGIN;
  -- Customer lookup (read)
  SELECT * FROM customers WHERE id = $1; -- <50ms target

  -- Insert visit (write)
  INSERT INTO visits (id, customer_id, business_id, stamped_at)
  VALUES (gen_random_uuid(), $1, $2, NOW()); -- <100ms target

  -- Update customer (write)
  UPDATE customers SET
    last_visit_at = NOW(),
    visit_frequency_days = calculate_frequency($1)
  WHERE id = $1; -- <100ms target
COMMIT;
```

**Run with pgbench**:
```bash
# Simulate 100 concurrent connections
pgbench -c 100 -T 60 -f loadtest/stamp-queries.sql loyalty_db

# Expected: >100 TPS (transactions per second)
```

---

## Test Coverage Requirements

### Coverage Thresholds (Enforced in CI)

```javascript
// jest.config.js
coverageThreshold: {
  global: {
    branches: 80,    // 80% of code branches covered
    functions: 80,   // 80% of functions covered
    lines: 80,       // 80% of lines covered
    statements: 80   // 80% of statements covered
  },
  './src/domains/**/*.ts': {
    branches: 90,    // Domain logic requires 90% coverage
    functions: 90,
    lines: 90,
    statements: 90
  }
}
```

**Coverage Reports**:
- Generated on every CI run
- Uploaded to Codecov (visual diff on PRs)
- Fails PR if coverage drops >1%

### Test Count by Phase

| Phase | Unit Tests | Integration Tests | E2E Tests | Total |
|-------|-----------|------------------|-----------|-------|
| **Phase 1** (Foundation) | 125 | 0 | 0 | 125 |
| **Phase 2** (API Layer) | 30 | 60 | 0 | 90 |
| **Phase 3** (Integrations) | 15 | 10 | 0 | 25 |
| **Phase 4** (Jobs) | 10 | 7 | 0 | 17 |
| **Phase 5** (Real-Time) | 5 | 3 | 0 | 8 |
| **Phase 6** (E2E) | 0 | 0 | 5 | 5 |
| **Total** | **185** | **80** | **5** | **270** |

**Test Execution Time**:
- Unit tests: <10 seconds (run on every file save)
- Integration tests: <2 minutes (run before commit)
- E2E tests: <5 minutes (run in CI only)
- Load tests: 10-20 minutes (run weekly or before release)

---

## Continuous Integration Pipeline

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:integration
        env:
          DATABASE_URL: postgres://postgres:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    needs: [lint, unit-tests, integration-tests, e2e-tests]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run build
      - run: npm run deploy:production
```

**Quality Gates** (PR must pass all):
1. ✅ Linting (ESLint + Prettier)
2. ✅ Type checking (TypeScript)
3. ✅ Unit tests (>80% coverage)
4. ✅ Integration tests (all pass)
5. ✅ E2E tests (all critical flows pass)

---

## Summary & Best Practices

### TDD Principles Applied

1. **Test First, Always**: Write failing test → implement → refactor
2. **Test Pyramid**: 70% unit, 20% integration, 10% E2E
3. **Fast Feedback**: Unit tests run in <10s (every file save)
4. **Isolated Tests**: No shared state between tests (reset DB/Redis)
5. **Descriptive Tests**: Test names describe behavior, not implementation

### Testing Anti-Patterns to Avoid

❌ **Don't**: Write tests after implementation (defeats TDD purpose)
❌ **Don't**: Test implementation details (test behavior, not internals)
❌ **Don't**: Share test state (use `beforeEach` to reset)
❌ **Don't**: Mock everything (integration tests need real dependencies)
❌ **Don't**: Write slow E2E tests for everything (use unit tests)

### Production Checklist

Before deploying to production, ensure:
- [x] >80% test coverage (enforced by CI)
- [x] All critical E2E flows tested (enrollment, stamping, campaigns)
- [x] Load tests pass at 3x current projected load
- [x] Database queries indexed and optimized (<100ms p95)
- [x] Error tracking configured (Sentry)
- [x] Monitoring dashboards set up (CloudWatch)
- [x] Backup/restore procedure tested
- [x] Rollback procedure documented and tested

---

**Next Document**: TECH-SPECS.md (detailed API design, database schema, caching strategy)
