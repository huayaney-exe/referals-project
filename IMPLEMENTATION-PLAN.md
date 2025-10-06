# COMPREHENSIVE IMPLEMENTATION PLAN
# Digital Loyalty Platform - Production Grade

**Version**: 2.0
**Date**: January 2025
**Stack**: Supabase (DB) + Render (APIs) + Vercel (Frontend)
**Methodology**: Test-Driven Development (TDD) with Production-Grade Standards

---

## Executive Summary

This document provides a **crystal-clear, production-ready implementation plan** incorporating:

1. **YC-Grade Architecture Feedback** (API contracts, error handling, data consistency, DR plans)
2. **Platform-Specific Design** (Supabase, Render, Vercel optimizations)
3. **Revised Growth Projections** (600K customers Year 3, not 100K)
4. **TDD Methodology** (Red-Green-Refactor, >80% coverage)
5. **Operational Excellence** (monitoring, rollback procedures, disaster recovery)

**Key Principle**: Build for Year 1-2 with excellent CX, scalability, and efficiency — ready to scale to Year 3 (600K customers).

---

## Platform Architecture (Supabase + Render + Vercel)

### Why This Stack?

| Platform | Purpose | Why Chosen |
|----------|---------|------------|
| **Supabase** | PostgreSQL database + Auth + Storage + Realtime | Production Postgres, auto-backups, built-in auth, 99.9% SLA |
| **Render** | Backend API servers + Background workers | Auto-deploy from Git, managed Redis, health checks, zero-config SSL |
| **Vercel** | Frontend hosting (Dashboard + Web Stamper + Enrollment) | Edge CDN, instant rollbacks, preview deploys, optimized for React |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                   │
│  (Business Owners, Customers, Admin)                            │
└────────────┬───────────────────────┬────────────────────────────┘
             │                       │
             │                       │
┌────────────▼──────────┐   ┌────────▼─────────────────────────┐
│   VERCEL (Frontend)   │   │   RENDER (Backend API)           │
│  ─────────────────────│   │  ─────────────────────────────── │
│  • Dashboard (React)  │   │  • Express.js + TypeScript       │
│  • Web Stamper (PWA)  │   │  • 8 instances (Year 3)          │
│  • Enrollment Page    │   │  • Auto-scaling (CPU >70%)       │
│                       │   │  • Health checks (/health/ready) │
└────────────┬──────────┘   └──────────┬───────────────────────┘
             │                         │
             │                         │
             └──────────┬──────────────┘
                        │
           ┌────────────▼───────────────────────────────┐
           │       SUPABASE (Database & Services)       │
           │  ────────────────────────────────────────  │
           │  • PostgreSQL 15 (managed)                 │
           │  • Supabase Auth (JWT)                     │
           │  • Supabase Storage (S3-compatible)        │
           │  • Supabase Realtime (WebSocket)           │
           │  • Auto-backups (daily snapshots)          │
           │  • Point-in-time Recovery (PITR)           │
           └────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│        RENDER BACKGROUND WORKERS                             │
│  • Campaign Send Queue (Bull + Redis)                        │
│  • PassKit Update Queue                                      │
│  • Analytics Processing Queue                                │
│  • 6 worker instances (Year 3)                               │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│        EXTERNAL INTEGRATIONS                                 │
│  • Twilio WhatsApp Business API (campaign sends)             │
│  • Apple PassKit (loyalty card generation)                   │
│  • Supabase Storage (logos, .pkpass files, QR posters)       │
└──────────────────────────────────────────────────────────────┘
```

---

## API CONTRACT SPECIFICATION (YC-Grade)

### URL Structure

**Base URL**: `https://api.loyaltyplatform.pe`

**Versioning**: URL-based (not header-based)
- Version 1: `/api/v1/...`
- Version 2: `/api/v2/...` (when breaking changes needed)

**Resource Naming**:
- Plural nouns: `/customers`, `/campaigns`, `/stamps`
- Nesting max 2 levels: `/businesses/:id/customers`
- Actions as POST endpoints: `/campaigns/:id/activate`

### Response Envelope (Standard Format)

**Success Response**:
```json
{
  "data": {
    "id": "cust-abc123",
    "name": "María López",
    "stamps_count": 4
  },
  "meta": {
    "timestamp": "2025-01-15T14:30:00Z",
    "request_id": "req-xyz789"
  }
}
```

**Paginated Response**:
```json
{
  "data": [
    { "id": "cust-1", "name": "María" },
    { "id": "cust-2", "name": "Carlos" }
  ],
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8,
    "next_cursor": "eyJpZCI6ImN1c3QtMjAifQ"
  }
}
```

**Error Response**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "phone",
        "code": "INVALID_FORMAT",
        "message": "Número de teléfono debe ser formato Perú (+51 9XX XXX XXX)"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T14:30:00Z",
    "request_id": "req-xyz789"
  }
}
```

### HTTP Status Codes

| Code | Meaning | When to Use |
|------|---------|-------------|
| **200** | OK | Successful GET/PATCH |
| **201** | Created | Successful POST (resource created) |
| **202** | Accepted | Async operation started (e.g., campaign send queued) |
| **204** | No Content | Successful DELETE |
| **400** | Bad Request | Validation error, malformed JSON |
| **401** | Unauthorized | Missing or invalid JWT token |
| **403** | Forbidden | Valid token but insufficient permissions |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Duplicate resource (e.g., customer already enrolled) |
| **422** | Unprocessable Entity | Business logic error (e.g., "Already redeemed reward today") |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Unhandled exception (log to Sentry) |
| **503** | Service Unavailable | Database down, Twilio down |

### Rate Limiting Headers

**Response Headers**:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 973
X-RateLimit-Reset: 1704067200
Retry-After: 3600
```

**Rate Limits**:
- **Global API**: 1,000 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP (brute-force protection)
- **Campaign sends**: 7-day frequency cap per customer (prevent spam)

### Versioning & Deprecation Policy

**Version Lifecycle**:
1. **New version announcement**: 6 months notice
2. **Parallel support**: Both versions active (12 months minimum)
3. **Sunset notice**: 3 months before v1 shutdown
4. **Breaking changes**: Never in same version (always new version)

**Example**:
- Jan 2025: Launch v1
- Jan 2026: Announce v2 (v1 still supported)
- Jan 2027: Sunset v1 (force migration to v2)

### API Endpoints Specification

#### Authentication

**POST /api/v1/auth/register**
```typescript
Request:
{
  "email": "owner@coffee.pe",
  "password": "SecurePass123!",
  "business_name": "Café Lima"
}

Response (201):
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "usr-abc123",
      "email": "owner@coffee.pe",
      "business_id": "biz-abc123"
    }
  }
}

Errors:
- 400: Weak password, invalid email
- 409: Email already exists
```

**POST /api/v1/auth/login**
```typescript
Request:
{
  "email": "owner@coffee.pe",
  "password": "SecurePass123!"
}

Response (200):
{
  "data": {
    "access_token": "...",
    "refresh_token": "..."
  }
}

Errors:
- 401: Invalid credentials
- 429: Too many failed attempts (rate limited)
```

**POST /api/v1/auth/refresh**
```typescript
Request:
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}

Response (200):
{
  "data": {
    "access_token": "...",
    "refresh_token": "..."
  }
}

Errors:
- 401: Invalid or expired refresh token
```

#### Customer Enrollment

**POST /api/v1/enrollments**
```typescript
Request:
{
  "business_id": "biz-abc123",
  "name": "María López",
  "phone": "+51912345678"
}

Response (201):
{
  "data": {
    "customer_id": "cust-xyz789",
    "passkit_url": "https://storage.supabase.co/passes/cust-xyz789.pkpass",
    "whatsapp_sent": true
  }
}

Errors:
- 400: Invalid Peru phone format
- 409: Customer already enrolled with this business
- 503: PassKit generation failed (retry)
```

**GET /api/v1/enrollments/check?business_id=biz-abc123&phone=+51912345678**
```typescript
Response (200) - Customer exists:
{
  "data": {
    "exists": true,
    "customer_id": "cust-xyz789",
    "stamps_count": 3,
    "enrolled_at": "2025-01-10T10:00:00Z"
  }
}

Response (200) - Customer doesn't exist:
{
  "data": {
    "exists": false
  }
}
```

#### Stamping

**POST /api/v1/stamps**
```typescript
Request:
Headers:
  Authorization: Bearer <access_token>
  Idempotency-Key: <uuid> (prevent double stamping)

Body:
{
  "customer_id": "cust-xyz789"
}

Response (201):
{
  "data": {
    "visit_id": "visit-abc123",
    "customer_id": "cust-xyz789",
    "stamps_count": 4,
    "stamps_required": 5,
    "reward_unlocked": false,
    "passkit_updated": true
  }
}

Response (201) - Reward unlocked:
{
  "data": {
    "visit_id": "visit-abc124",
    "stamps_count": 0,
    "reward_unlocked": true,
    "reward": "Café gratis",
    "passkit_updated": true
  }
}

Errors:
- 401: Invalid token
- 403: Token doesn't belong to this business
- 404: Customer not found
- 429: Duplicate stamp within cooldown period (5 minutes)
```

#### Campaigns

**POST /api/v1/campaigns**
```typescript
Request:
{
  "name": "Win back inactive customers",
  "trigger_type": "inactivity",
  "trigger_config": {
    "days_inactive": 14,
    "discount_percent": 15
  },
  "message_template": "Te extrañamos {{name}}! Usa {{discount_code}} para 15% descuento"
}

Response (201):
{
  "data": {
    "campaign_id": "camp-abc123",
    "status": "draft",
    "created_at": "2025-01-15T14:30:00Z"
  }
}

Errors:
- 400: Invalid trigger_type, days_inactive out of range (7-30)
- 422: Message template missing required variables
```

**POST /api/v1/campaigns/:id/activate**
```typescript
Response (200):
{
  "data": {
    "campaign_id": "camp-abc123",
    "status": "active",
    "activated_at": "2025-01-15T14:35:00Z",
    "eligible_customers": 45
  }
}

Errors:
- 404: Campaign not found
- 422: Campaign already active
- 422: Test send required before activation
```

---

## ERROR HANDLING & RECOVERY STRATEGY (YC-Grade)

### Error Categories

#### 1. Client Errors (4xx) - User Fixable

**Philosophy**: Provide actionable, localized error messages

**Logging**: INFO level (not errors)

**User Message**: Specific, in Spanish

**Example**:
```typescript
// Validation Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "phone",
        "code": "INVALID_FORMAT",
        "message": "Número debe tener formato +51 9XX XXX XXX"
      }
    ]
  }
}
```

**Error Codes**:
- `VALIDATION_ERROR`: Input validation failed
- `PHONE_INVALID`: Invalid Peru phone format
- `CUSTOMER_EXISTS`: Customer already enrolled
- `CAMPAIGN_LIMIT`: Too many campaigns sent to customer
- `DUPLICATE_STAMP`: Stamp cooldown period active

#### 2. Server Errors (5xx) - System Issues

**Philosophy**: Generic message to user, full context to Sentry

**Logging**: ERROR level with stack trace

**User Message**: "Algo salió mal, intenta de nuevo en unos momentos"

**Sentry Context**:
```typescript
Sentry.captureException(error, {
  tags: {
    business_id: req.user.business_id,
    endpoint: req.path,
    method: req.method
  },
  extra: {
    request_body: req.body,
    headers: req.headers,
    user_agent: req.headers['user-agent']
  },
  user: {
    id: req.user.id,
    email: req.user.email
  },
  fingerprint: [req.path, error.message] // Group similar errors
});
```

**Response**:
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Algo salió mal, intenta de nuevo",
    "request_id": "req-xyz789"
  }
}
```

#### 3. External API Failures - Retry Strategies

**Twilio WhatsApp API**:

| Error | HTTP | Retry Strategy | Fallback |
|-------|------|---------------|----------|
| Rate limit | 429 | 3 retries, exponential backoff (5s, 25s, 125s) | Queue for later (max 24h delay) |
| Invalid number | 400 | No retry | Mark customer phone as invalid, notify business owner |
| Quota exceeded | 400 (error 63018) | No retry | Pause all campaigns, alert admin |
| Network timeout | - | 3 retries, 10s timeout per attempt | Dead letter queue |
| Server error | 500 | 5 retries, exponential with jitter | Dead letter queue |

**Apple PassKit/APNs**:

| Error | HTTP | Retry Strategy | Fallback |
|-------|------|---------------|----------|
| Certificate invalid | 401 | No retry | Alert admin, block pass generation |
| Device token invalid | 410 | No retry | Mark customer device as inactive, send WhatsApp instead |
| Network timeout | - | 2 retries, 5s timeout | Return 202 Accepted, process async |
| Server error | 500 | 3 retries, exponential | Continue without push (user refreshes card manually) |

**Supabase Storage (S3)**:

| Error | HTTP | Retry Strategy | Fallback |
|-------|------|---------------|----------|
| Upload timeout | - | 3 retries, 15s timeout | Fail request, user retries |
| Storage quota | 507 | No retry | Alert admin, expand storage |
| Network error | - | 3 retries, exponential | Fail request |

### Retry Implementation (Bull Queue)

```typescript
// Campaign send job with retry
await campaignQueue.add('send-whatsapp', {
  campaign_id: 'camp-123',
  customer_id: 'cust-456',
  message: 'Te extrañamos María!'
}, {
  attempts: 5,
  backoff: {
    type: 'exponential',
    delay: 5000 // 5s, 25s, 125s, 625s, 3125s
  },
  removeOnComplete: true, // Clean up after success
  removeOnFail: false // Keep failed jobs for inspection
});

// Job processor
campaignQueue.process('send-whatsapp', async (job) => {
  try {
    const result = await twilioService.sendMessage({
      to: job.data.customer_phone,
      body: job.data.message
    });

    await db.campaign_sends.update({
      id: job.data.send_id,
      status: 'delivered',
      twilio_sid: result.sid
    });

    return result;
  } catch (error) {
    // Categorize error
    if (error.code === 429) {
      throw new Error('RATE_LIMIT'); // Retry
    } else if (error.code === 400) {
      await db.campaign_sends.update({
        id: job.data.send_id,
        status: 'failed',
        error_message: error.message
      });
      throw new Error('INVALID_NUMBER'); // Don't retry
    } else {
      throw error; // Retry
    }
  }
});

// Dead letter queue handler
campaignQueue.on('failed', async (job, err) => {
  if (job.attemptsMade >= 5) {
    // Move to dead letter queue
    await deadLetterQueue.add('campaign-failed', {
      original_job: job.data,
      error: err.message,
      attempts: job.attemptsMade
    });

    // Alert admin
    await sendAdminAlert({
      type: 'CAMPAIGN_SEND_FAILED',
      campaign_id: job.data.campaign_id,
      error: err.message
    });
  }
});
```

### User-Facing Error Messages (Localized Spanish)

```typescript
const ERROR_MESSAGES = {
  // Validation
  PHONE_INVALID: "Número de teléfono debe ser formato Perú (+51 9XX XXX XXX)",
  EMAIL_INVALID: "Correo electrónico no es válido",
  PASSWORD_WEAK: "Contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 número",

  // Business Logic
  CUSTOMER_EXISTS: "Ya estás registrado con este negocio. Revisa tu Apple Wallet.",
  DUPLICATE_STAMP: "Acabas de recibir un sello. Espera 5 minutos antes del siguiente.",
  REWARD_ALREADY_REDEEMED: "Ya canjeaste tu recompensa hoy",
  CAMPAIGN_LIMIT: "Has recibido muchas campañas recientemente. Intenta mañana.",

  // System
  INTERNAL_ERROR: "Algo salió mal. Intenta de nuevo en unos momentos.",
  SERVICE_UNAVAILABLE: "Servicio temporalmente no disponible. Intenta en 5 minutos.",
  RATE_LIMIT: "Demasiadas solicitudes. Espera 1 minuto e intenta de nuevo."
};
```

---

## DATA CONSISTENCY & TRANSACTION BOUNDARIES (YC-Grade)

### Pattern 1: Transactional Outbox

**Use Case**: Stamp added → PassKit update must happen eventually

**Problem**: Database committed but external API (APNs) fails → inconsistent state

**Solution**: Single DB transaction + asynchronous worker

```typescript
// API Endpoint: POST /api/v1/stamps
async function addStamp(customerId: string, businessId: string) {
  // Single database transaction
  const result = await supabase.rpc('add_stamp_with_outbox', {
    p_customer_id: customerId,
    p_business_id: businessId
  });

  // Enqueue background job (doesn't affect transaction)
  await passKitQueue.add('update-pass', {
    customer_id: customerId,
    stamps_count: result.new_stamps_count
  });

  return result;
}

// Supabase RPC function (SQL)
CREATE OR REPLACE FUNCTION add_stamp_with_outbox(
  p_customer_id UUID,
  p_business_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_new_count INT;
  v_reward_unlocked BOOLEAN := false;
BEGIN
  -- 1. Insert visit
  INSERT INTO visits (id, customer_id, business_id, stamped_at)
  VALUES (gen_random_uuid(), p_customer_id, p_business_id, NOW());

  -- 2. Update customer stamps count
  UPDATE customers
  SET
    stamps_count = stamps_count + 1,
    last_visit_at = NOW()
  WHERE id = p_customer_id
  RETURNING stamps_count INTO v_new_count;

  -- 3. Check if reward unlocked
  IF v_new_count >= (SELECT reward_structure->>'stamps_required' FROM businesses WHERE id = p_business_id)::INT THEN
    v_reward_unlocked := true;

    -- Reset stamps
    UPDATE customers SET stamps_count = 0 WHERE id = p_customer_id;

    -- Record reward
    INSERT INTO rewards (id, customer_id, business_id, unlocked_at)
    VALUES (gen_random_uuid(), p_customer_id, p_business_id, NOW());
  END IF;

  -- 4. Write to outbox (for PassKit update)
  INSERT INTO outbox (id, event_type, payload, status, created_at)
  VALUES (
    gen_random_uuid(),
    'STAMP_ADDED',
    jsonb_build_object(
      'customer_id', p_customer_id,
      'stamps_count', CASE WHEN v_reward_unlocked THEN 0 ELSE v_new_count END,
      'reward_unlocked', v_reward_unlocked
    ),
    'pending',
    NOW()
  );

  RETURN jsonb_build_object(
    'stamps_count', CASE WHEN v_reward_unlocked THEN 0 ELSE v_new_count END,
    'reward_unlocked', v_reward_unlocked
  );
END;
$$ LANGUAGE plpgsql;

// Background worker processes outbox
setInterval(async () => {
  const pendingEvents = await supabase
    .from('outbox')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
    .limit(100);

  for (const event of pendingEvents.data) {
    try {
      if (event.event_type === 'STAMP_ADDED') {
        await passkitService.updatePass(
          event.payload.customer_id,
          event.payload.stamps_count
        );
      }

      // Mark as processed
      await supabase
        .from('outbox')
        .update({ status: 'processed', processed_at: new Date() })
        .eq('id', event.id);
    } catch (error) {
      // Retry later
      await supabase
        .from('outbox')
        .update({
          retry_count: event.retry_count + 1,
          last_error: error.message
        })
        .eq('id', event.id);
    }
  }
}, 5000); // Process every 5 seconds
```

### Pattern 2: Idempotency Keys

**Use Case**: User double-clicks "Agregar Sello" → prevent double stamping

**Implementation**:
```typescript
// Middleware: Check idempotency key
app.post('/api/v1/stamps', async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key']; // UUID from client

  if (!idempotencyKey) {
    return res.status(400).json({
      error: { code: 'MISSING_IDEMPOTENCY_KEY', message: 'Header required' }
    });
  }

  // Check Redis cache for existing response
  const cached = await redis.get(`idempotency:${idempotencyKey}`);
  if (cached) {
    return res.json(JSON.parse(cached)); // Return cached response
  }

  // Process request
  const result = await addStamp(req.body.customer_id, req.user.business_id);

  // Cache response for 24 hours
  await redis.setex(
    `idempotency:${idempotencyKey}`,
    86400,
    JSON.stringify({ data: result })
  );

  res.status(201).json({ data: result });
});
```

### Pattern 3: Optimistic Locking

**Use Case**: Concurrent campaign sends to same customer → prevent race condition

**Implementation**:
```typescript
// Add version column to customers table
ALTER TABLE customers ADD COLUMN version INT DEFAULT 1;

// Update with optimistic locking
async function sendCampaign(campaignId: string, customerId: string) {
  const customer = await supabase
    .from('customers')
    .select('id, version, phone')
    .eq('id', customerId)
    .single();

  // Send WhatsApp message
  const result = await twilioService.sendMessage({
    to: customer.phone,
    body: 'Campaign message...'
  });

  // Update with version check
  const { data, error } = await supabase
    .from('customers')
    .update({
      last_campaign_sent_at: new Date(),
      version: customer.version + 1
    })
    .eq('id', customerId)
    .eq('version', customer.version) // Optimistic lock
    .select();

  if (error || !data) {
    // Version mismatch = another process updated customer
    throw new Error('CONCURRENT_UPDATE');
  }

  return result;
}
```

### Pattern 4: Saga Pattern (Compensating Transactions)

**Use Case**: Enrollment fails after PassKit generation → cleanup

**Implementation**:
```typescript
async function enrollCustomer(data: EnrollmentData) {
  let customer;
  let passUrl;

  try {
    // Step 1: Create customer record
    customer = await supabase
      .from('customers')
      .insert({
        business_id: data.business_id,
        name: data.name,
        phone: data.phone,
        stamps_count: 0
      })
      .select()
      .single();

    // Step 2: Generate .pkpass file
    passUrl = await passkitService.generatePass(customer.data);

    // Step 3: Send WhatsApp with pass link
    await twilioService.sendMessage({
      to: data.phone,
      body: `¡Hola ${data.name}! Descarga tu tarjeta: ${passUrl}`
    });

    return { customer: customer.data, passUrl };

  } catch (error) {
    // Compensating transactions (rollback)

    if (passUrl) {
      // Delete generated pass from storage
      await supabase.storage
        .from('passes')
        .remove([`${customer.data.id}.pkpass`]);
    }

    if (customer) {
      // Delete customer record
      await supabase
        .from('customers')
        .delete()
        .eq('id', customer.data.id);
    }

    throw error; // Re-throw to return 500 to client
  }
}
```

---

## DEPLOYMENT & ROLLBACK PROCEDURES (YC-Grade)

### Deployment Strategy (Render)

#### Rolling Deployment (Default)

**Process**:
1. Deploy to 1 instance → Health check (30s) → Deploy next instance
2. Health check endpoint: `GET /health/ready`
3. Rollback trigger: Error rate >2% for 2 minutes (auto-rollback)
4. Max deployment time: 10 minutes (8 instances × 75s each)

**Health Check Implementation**:
```typescript
// Liveness probe (is app running?)
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive', timestamp: new Date() });
});

// Readiness probe (is app ready to serve traffic?)
app.get('/health/ready', async (req, res) => {
  const checks = {
    database: false,
    redis: false,
    supabase: false
  };

  try {
    // Check Supabase connection
    const { data, error } = await supabase.from('businesses').select('id').limit(1);
    checks.database = !error;
    checks.supabase = !error;

    // Check Redis connection
    await redis.ping();
    checks.redis = true;

    if (checks.database && checks.redis && checks.supabase) {
      res.status(200).json({ status: 'ready', checks });
    } else {
      res.status(503).json({ status: 'not ready', checks });
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      checks,
      error: error.message
    });
  }
});
```

**Render Configuration** (`render.yaml`):
```yaml
services:
  - type: web
    name: loyalty-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    healthCheckPath: /health/ready
    envVars:
      - key: NODE_ENV
        value: production
      - key: SUPABASE_URL
        fromDatabase:
          name: loyalty-db
          property: connectionString
    autoDeploy: true
    numInstances: 8
    scaling:
      minInstances: 2
      maxInstances: 16
      targetCPUPercent: 70
```

#### Canary Deployment (Year 3+)

**Process**:
1. Deploy new version to 10% of instances (1 out of 8)
2. Monitor for 15 minutes:
   - Error rate <1%
   - p95 latency <500ms
   - No increase in Sentry errors
3. If pass → 50% instances → Monitor 10 min → 100%
4. If fail → instant rollback to 100% old version

**Monitoring Script**:
```typescript
// canary-monitor.ts
import { Sentry } from '@sentry/node';

async function monitorCanary(canaryVersion: string) {
  const startTime = Date.now();
  const duration = 15 * 60 * 1000; // 15 minutes

  while (Date.now() - startTime < duration) {
    // Check error rate
    const errorRate = await getErrorRate(canaryVersion);
    if (errorRate > 0.01) { // >1%
      await rollbackCanary(canaryVersion);
      throw new Error(`Canary failed: Error rate ${errorRate * 100}%`);
    }

    // Check latency
    const p95Latency = await getP95Latency(canaryVersion);
    if (p95Latency > 500) { // >500ms
      await rollbackCanary(canaryVersion);
      throw new Error(`Canary failed: p95 latency ${p95Latency}ms`);
    }

    // Check Sentry errors
    const sentryErrors = await getSentryErrorCount(canaryVersion);
    const baselineErrors = await getSentryErrorCount('stable');
    if (sentryErrors > baselineErrors * 1.2) { // >20% increase
      await rollbackCanary(canaryVersion);
      throw new Error(`Canary failed: Sentry errors increased ${((sentryErrors / baselineErrors) - 1) * 100}%`);
    }

    await sleep(60000); // Check every 1 minute
  }

  console.log('Canary passed all checks ✅');
  return true;
}
```

### Database Migration Safety (Supabase)

#### Safe Migrations (No Downtime)

**✅ Adding Nullable Column**:
```sql
-- Safe: No table lock
ALTER TABLE customers ADD COLUMN preferred_language VARCHAR(10) DEFAULT 'es';
```

**✅ Adding Index Concurrently**:
```sql
-- Safe: No table lock, builds index in background
CREATE INDEX CONCURRENTLY idx_customers_phone ON customers(phone);
```

**✅ Creating New Table**:
```sql
-- Safe: New table doesn't affect existing queries
CREATE TABLE customer_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  notification_channel VARCHAR(20) DEFAULT 'whatsapp',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Unsafe Migrations (Require Maintenance Window)

**❌ Dropping Column** (Breaking change):
```sql
-- WRONG: Instant breaking change
ALTER TABLE customers DROP COLUMN old_field;

-- RIGHT: Multi-step process
-- Step 1: Deploy code that stops writing to old_field
-- Step 2: Wait 1 week (ensure no rollback needed)
-- Step 3: Drop column in maintenance window
ALTER TABLE customers DROP COLUMN old_field;
```

**❌ Changing Column Type** (Table lock):
```sql
-- WRONG: Locks table, breaks running queries
ALTER TABLE customers ALTER COLUMN phone TYPE VARCHAR(25);

-- RIGHT: Dual-write pattern
-- Step 1: Add new column
ALTER TABLE customers ADD COLUMN phone_new VARCHAR(25);

-- Step 2: Deploy code that writes to both columns
UPDATE customers SET phone_new = phone WHERE phone_new IS NULL;

-- Step 3: Switch reads to new column
-- Step 4: Wait 1 week, then drop old column
ALTER TABLE customers DROP COLUMN phone;
ALTER TABLE customers RENAME COLUMN phone_new TO phone;
```

**❌ Adding Foreign Key on Large Table**:
```sql
-- WRONG: Locks table during validation
ALTER TABLE visits ADD CONSTRAINT fk_customer
  FOREIGN KEY (customer_id) REFERENCES customers(id);

-- RIGHT: Add NOT VALID first, then validate separately
ALTER TABLE visits ADD CONSTRAINT fk_customer
  FOREIGN KEY (customer_id) REFERENCES customers(id) NOT VALID;

-- Validate in background (doesn't lock)
ALTER TABLE visits VALIDATE CONSTRAINT fk_customer;
```

### Migration Checklist

**Before Migration**:
- [ ] Migration runs in <30s (test in staging)
- [ ] Rollback script written and tested
- [ ] No table locks on large tables (>100K rows)
- [ ] Backward-compatible with current code version
- [ ] Run `EXPLAIN ANALYZE` on affected queries

**After Migration**:
- [ ] Verify indexes created successfully
- [ ] Check query performance (no regressions)
- [ ] Monitor error rate for 1 hour
- [ ] Document migration in CHANGELOG.md

### Rollback Procedures

#### Application Rollback (Render)

**Instant Rollback** (via Render Dashboard):
1. Navigate to Service → Deployments
2. Find last stable deployment
3. Click "Rollback to this version"
4. Render redeploys previous version (2-5 minutes)

**Automated Rollback** (via API):
```bash
# Rollback to specific deployment
curl -X POST https://api.render.com/v1/services/{service_id}/deploys/{deploy_id}/rollback \
  -H "Authorization: Bearer $RENDER_API_KEY"
```

**Rollback Triggers** (Automatic):
- Error rate >2% for 2 minutes
- Health check fails 3 consecutive times
- Memory usage >90% for 5 minutes

#### Database Rollback (Supabase)

**Point-in-Time Recovery (PITR)**:
```bash
# Restore database to 1 hour ago
supabase db restore \
  --project-ref abc123 \
  --timestamp "2025-01-15T13:00:00Z"
```

**Manual Snapshot Restore**:
1. Navigate to Supabase Dashboard → Database → Backups
2. Find snapshot before migration (daily snapshots)
3. Click "Restore" (creates new database instance)
4. Update connection string in Render
5. Restart application

**Max Rollback Time**: <5 minutes (application), <1 hour (database)

---

## DISASTER RECOVERY PLAN (YC-Grade)

### Recovery Targets

- **RTO (Recovery Time Objective)**: 4 hours (max downtime)
- **RPO (Recovery Point Objective)**: 1 hour (max data loss)

### Scenario 1: Supabase Database Corruption

**Detection**: Automated integrity checks fail, query errors spike

**Response**:
1. **Stop Writes** (5 min):
   ```typescript
   // Enable read-only mode via environment variable
   process.env.DB_READ_ONLY = 'true';

   app.use((req, res, next) => {
     if (process.env.DB_READ_ONLY === 'true' && req.method !== 'GET') {
       return res.status(503).json({
         error: {
           code: 'MAINTENANCE_MODE',
           message: 'Sistema en mantenimiento. Intenta en 1 hora.'
         }
       });
     }
     next();
   });
   ```

2. **Restore from Snapshot** (30 min):
   - Navigate to Supabase Dashboard → Database → Backups
   - Select latest automated snapshot (hourly backups)
   - Click "Restore to new project" (preserves original)
   - Verify data integrity: `SELECT COUNT(*) FROM customers;`

3. **Replay Write-Ahead Logs (WAL)** (1 hour):
   ```bash
   # Supabase automatically stores WAL logs
   # Replay to minimize data loss (RPO <1 hour)
   supabase db restore \
     --project-ref abc123 \
     --replay-wal \
     --until "2025-01-15T14:00:00Z"
   ```

4. **Validate Data** (30 min):
   - Run data integrity queries
   - Verify customer counts match expected
   - Check for missing transactions

5. **Resume Writes** (5 min):
   - Set `DB_READ_ONLY=false`
   - Restart Render services
   - Monitor error rate for anomalies

**Estimated Recovery**: 2 hours
**Last Tested**: [DATE] (test quarterly)

### Scenario 2: Render Service Outage (Complete Failure)

**Detection**: All health checks fail for >5 minutes, no API responses

**Response**:
1. **Verify Outage Scope** (5 min):
   - Check Render Status Page: https://status.render.com
   - Test from external endpoint: `curl https://api.loyaltyplatform.pe/health/live`

2. **Activate Backup Region** (manual failover - 1 hour):
   ```bash
   # Deploy to backup Render region (EU West)
   git push render-eu main

   # Update DNS (Vercel automatic failover)
   # Update environment variables to point to EU instance
   ```

3. **Update Vercel Frontend** (15 min):
   ```bash
   # Update API URL in Vercel environment
   vercel env add API_URL https://api-eu.loyaltyplatform.pe
   vercel --prod
   ```

4. **Validate Services** (30 min):
   - Test enrollment flow
   - Test stamping flow
   - Test campaign sends

**Estimated Recovery**: 2 hours (manual), 30 min (automated in Year 3)
**Last Tested**: [DATE] (test annually)

### Scenario 3: Accidental Data Deletion

**Detection**: Support ticket reports missing customer data

**Response**:
1. **Identify Deletion Timestamp** (15 min):
   ```sql
   -- Check audit logs (if enabled)
   SELECT * FROM audit_logs
   WHERE table_name = 'customers'
   AND operation = 'DELETE'
   ORDER BY created_at DESC
   LIMIT 100;
   ```

2. **Restore to Point-in-Time** (30 min):
   ```bash
   # Supabase PITR to just before deletion
   supabase db restore \
     --project-ref abc123 \
     --timestamp "2025-01-15T13:45:00Z"
   ```

3. **Extract Affected Rows** (15 min):
   ```sql
   -- From restored database, export deleted customers
   COPY (
     SELECT * FROM customers
     WHERE id IN ('cust-1', 'cust-2', ...)
   ) TO '/tmp/recovered_customers.csv' CSV HEADER;
   ```

4. **Merge into Current Database** (30 min):
   ```sql
   -- Import into production (upsert to avoid duplicates)
   INSERT INTO customers (id, name, phone, ...)
   VALUES (...)
   ON CONFLICT (id) DO UPDATE SET ...;
   ```

**Estimated Recovery**: 1 hour
**Last Tested**: [DATE] (test bi-annually)

### Scenario 4: Twilio WhatsApp Outage

**Detection**: Campaign sends fail with 100% error rate, Twilio status page shows outage

**Response**:
1. **Pause Campaigns** (5 min):
   ```typescript
   // Auto-pause if Twilio error rate >80%
   if (twilioErrorRate > 0.8) {
     await supabase
       .from('campaigns')
       .update({ status: 'paused', paused_reason: 'TWILIO_OUTAGE' })
       .eq('status', 'active');
   }
   ```

2. **Queue Messages for Retry** (automatic):
   ```typescript
   // Bull queue automatically retries failed jobs
   // Max retry period: 24 hours
   // After 24h, move to dead letter queue
   ```

3. **Notify Business Owners** (15 min):
   ```typescript
   // Send email via Supabase
   await supabase.functions.invoke('send-email', {
     to: business.email,
     subject: 'Campañas pausadas temporalmente',
     body: 'WhatsApp temporalmente no disponible. Reanudaremos automáticamente.'
   });
   ```

4. **Resume When Twilio Recovers** (automatic):
   ```typescript
   // Health check every 5 minutes
   setInterval(async () => {
     const isHealthy = await checkTwilioHealth();
     if (isHealthy) {
       await supabase
         .from('campaigns')
         .update({ status: 'active' })
         .eq('paused_reason', 'TWILIO_OUTAGE');
     }
   }, 5 * 60 * 1000);
   ```

**Estimated Recovery**: Automatic (when Twilio recovers)
**Data Loss**: None (messages queued for retry)

### Backup Testing Checklist

**Monthly**:
- [ ] Restore database snapshot to staging environment
- [ ] Verify all data readable and consistent
- [ ] Run full test suite against restored database
- [ ] Document restore time and issues

**Quarterly**:
- [ ] Full disaster recovery drill (entire team)
- [ ] Simulate database corruption → restore → validate
- [ ] Document recovery time and update procedures
- [ ] Test rollback procedures (application + database)

**Annually**:
- [ ] Simulate complete Render outage → failover to backup region
- [ ] Test Twilio outage scenario → queue retry
- [ ] Verify all runbooks up-to-date

---

## OBSERVABILITY & ALERTING (YC-Grade)

### Monitoring Stack

| Tool | Purpose | Cost (Year 3) |
|------|---------|---------------|
| **Sentry** | Error tracking, stack traces | $200/month |
| **Supabase Dashboard** | Database metrics, query performance | Included |
| **Render Dashboard** | Application metrics, CPU, memory | Included |
| **Uptime Robot** | External uptime monitoring | Free tier |
| **LogTail** (optional) | Centralized logging | $50/month |

### Critical Alerts (PagerDuty - Wake Up Engineer)

| Alert | Threshold | Window | Action |
|-------|-----------|--------|--------|
| **API Error Rate >1%** | Sustained 5 min | All endpoints | Investigate immediately, check Sentry |
| **Database Connections >80%** | Sustained 2 min | Supabase pool | Scale up or investigate connection leak |
| **WhatsApp Send Failures >5%** | Sustained 10 min | Campaign queue | Check Twilio status page |
| **Disk Space >85%** | Current | Supabase storage | Expand storage or clean old logs |
| **No Health Check Response** | 3 consecutive fails | Any Render instance | Auto-terminate instance (Render handles) |
| **Memory Usage >90%** | Sustained 5 min | Render instances | Scale up or investigate memory leak |

**PagerDuty Integration**:
```typescript
import PagerDuty from 'node-pagerduty';

async function triggerAlert(alert: {
  type: string;
  severity: 'critical' | 'warning';
  message: string;
  details: any;
}) {
  const pd = new PagerDuty({ apiToken: process.env.PAGERDUTY_API_KEY });

  await pd.createIncident({
    title: `[${alert.severity.toUpperCase()}] ${alert.type}`,
    body: alert.message,
    urgency: alert.severity === 'critical' ? 'high' : 'low',
    details: JSON.stringify(alert.details)
  });

  // Also log to Sentry
  Sentry.captureMessage(alert.message, {
    level: alert.severity,
    tags: { alert_type: alert.type },
    extra: alert.details
  });
}

// Example usage
if (errorRate > 0.01) {
  await triggerAlert({
    type: 'API_ERROR_RATE_HIGH',
    severity: 'critical',
    message: `API error rate is ${errorRate * 100}% (threshold: 1%)`,
    details: {
      current_error_rate: errorRate,
      endpoint: '/api/v1/stamps',
      affected_users: 45
    }
  });
}
```

### Warning Alerts (Slack - Review Next Business Day)

| Alert | Threshold | Window | Action |
|-------|-----------|--------|--------|
| **API p95 Latency >500ms** | Sustained 15 min | Per endpoint | Investigate slow queries |
| **Redis Memory >75%** | Sustained 30 min | Cache eviction | Plan Redis upgrade |
| **Job Queue Delay >5 min** | Current | Background jobs | Add workers or investigate stuck jobs |
| **Daily Active Users -20%** | Compared to 7-day avg | Business metric | Investigate customer churn |
| **Campaign Open Rate <10%** | 7-day average | Marketing metric | Review message templates |

**Slack Integration**:
```typescript
import { WebClient } from '@slack/web-api';

const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

async function sendSlackWarning(warning: {
  channel: string;
  message: string;
  details: any;
}) {
  await slack.chat.postMessage({
    channel: warning.channel,
    text: warning.message,
    attachments: [{
      color: 'warning',
      fields: Object.entries(warning.details).map(([key, value]) => ({
        title: key,
        value: String(value),
        short: true
      }))
    }]
  });
}

// Example usage
if (p95Latency > 500) {
  await sendSlackWarning({
    channel: '#alerts-warnings',
    message: 'API p95 latency exceeded 500ms',
    details: {
      endpoint: '/api/v1/stamps',
      p95_latency: `${p95Latency}ms`,
      p99_latency: `${p99Latency}ms`,
      requests_per_min: 112
    }
  });
}
```

### Distributed Tracing (Request Correlation)

**Every request gets UUID for end-to-end tracking**:

```typescript
import { v4 as uuidv4 } from 'uuid';
import { context, trace } from '@opentelemetry/api';

// Middleware: Add request ID
app.use((req, res, next) => {
  req.id = req.headers['x-request-id'] || uuidv4();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// Middleware: Add to logger context
app.use((req, res, next) => {
  req.logger = logger.child({ request_id: req.id });
  next();
});

// Example endpoint
app.post('/api/v1/stamps', async (req, res) => {
  const span = trace.getTracer('api').startSpan('POST /stamps');
  span.setAttribute('request_id', req.id);
  span.setAttribute('customer_id', req.body.customer_id);
  span.setAttribute('business_id', req.user.business_id);

  try {
    req.logger.info('Adding stamp', {
      customer_id: req.body.customer_id,
      business_id: req.user.business_id
    });

    const result = await addStamp(req.body.customer_id, req.user.business_id);

    req.logger.info('Stamp added successfully', { result });
    span.setStatus({ code: SpanStatusCode.OK });

    res.status(201).json({ data: result });
  } catch (error) {
    req.logger.error('Failed to add stamp', { error: error.message, stack: error.stack });
    span.recordException(error);
    span.setStatus({ code: SpanStatusCode.ERROR });

    // Return request ID in error for support
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Algo salió mal',
        request_id: req.id // Customer support can search logs
      }
    });
  } finally {
    span.end();
  }
});
```

**Correlation ID in Logs**:
```json
{
  "timestamp": "2025-01-15T14:30:00Z",
  "level": "error",
  "message": "Failed to add stamp",
  "request_id": "req-abc123",
  "customer_id": "cust-xyz789",
  "business_id": "biz-123",
  "error": "Database connection timeout",
  "stack": "Error: timeout\n    at Client.connect..."
}
```

---

## SUPABASE-SPECIFIC OPTIMIZATIONS

### Database Schema (PostgreSQL 15)

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  reward_structure JSONB NOT NULL,
  inactivity_threshold_days INT DEFAULT 14,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_businesses_email ON businesses(email);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  last_visit_at TIMESTAMPTZ,
  stamps_count INT DEFAULT 0,
  visit_frequency_days NUMERIC(5,2),
  is_at_risk BOOLEAN DEFAULT false,
  apns_device_token TEXT, -- For PassKit updates
  version INT DEFAULT 1, -- Optimistic locking
  UNIQUE(business_id, phone)
);

CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_at_risk ON customers(business_id, is_at_risk) WHERE is_at_risk = true;

-- Visits (stamps) table
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  stamped_at TIMESTAMPTZ DEFAULT NOW(),
  transaction_amount NUMERIC(10,2),
  stamped_by_user_id UUID REFERENCES auth.users(id)
);

CREATE INDEX idx_visits_customer ON visits(customer_id);
CREATE INDEX idx_visits_business_date ON visits(business_id, stamped_at DESC);

-- Future partitioning (Year 3)
-- ALTER TABLE visits PARTITION BY RANGE (stamped_at);

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL,
  trigger_config JSONB NOT NULL,
  message_template TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'draft',
  activated_at TIMESTAMPTZ,
  paused_reason VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_campaigns_business ON campaigns(business_id);
CREATE INDEX idx_campaigns_status ON campaigns(business_id, status) WHERE status = 'active';

-- Campaign sends table
CREATE TABLE campaign_sends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  discount_code VARCHAR(50),
  redeemed_at TIMESTAMPTZ,
  twilio_sid VARCHAR(100),
  status VARCHAR(20) DEFAULT 'queued',
  error_message TEXT
);

CREATE INDEX idx_campaign_sends_campaign ON campaign_sends(campaign_id);
CREATE INDEX idx_campaign_sends_customer ON campaign_sends(customer_id);
CREATE INDEX idx_campaign_sends_status ON campaign_sends(status) WHERE status IN ('queued', 'failed');

-- Outbox table (Transactional Outbox Pattern)
CREATE TABLE outbox (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  retry_count INT DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX idx_outbox_status ON outbox(status, created_at) WHERE status = 'pending';

-- Rewards table
CREATE TABLE rewards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  redeemed_at TIMESTAMPTZ,
  reward_description TEXT
);

CREATE INDEX idx_rewards_customer ON rewards(customer_id);

-- Referrals table
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_customer_id UUID REFERENCES customers(id),
  referred_customer_id UUID REFERENCES customers(id),
  business_id UUID REFERENCES businesses(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  bonus_granted BOOLEAN DEFAULT false
);

CREATE INDEX idx_referrals_referrer ON referrals(referrer_customer_id);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Business owners can only access their own data
CREATE POLICY business_owner_policy ON businesses
  FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'business_id' = businesses.id::text
  ));

-- Business owners can only access their customers
CREATE POLICY customer_access_policy ON customers
  FOR ALL
  USING (business_id IN (
    SELECT (raw_user_meta_data->>'business_id')::uuid FROM auth.users WHERE id = auth.uid()
  ));

-- Public can read businesses for enrollment page
CREATE POLICY public_business_read ON businesses
  FOR SELECT
  USING (true);
```

### Supabase Realtime (WebSocket)

**Enable for real-time dashboard updates**:

```sql
-- Enable realtime for specific tables
ALTER PUBLICATION supabase_realtime ADD TABLE visits;
ALTER PUBLICATION supabase_realtime ADD TABLE customers;
```

**Client-side subscription** (React Dashboard):
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Subscribe to new visits (stamps)
useEffect(() => {
  const subscription = supabase
    .channel('dashboard-updates')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'visits',
      filter: `business_id=eq.${businessId}`
    }, (payload) => {
      // Update UI in real-time
      console.log('New stamp added:', payload.new);
      setStampCount(prev => prev + 1);
      showToast('¡Nuevo sello agregado!');
    })
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [businessId]);
```

### Supabase Storage (S3-Compatible)

**Bucket Configuration**:
```typescript
// Create buckets via Supabase Dashboard or SQL
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('logos', 'logos', true),
  ('passes', 'passes', true),
  ('posters', 'posters', true);

// Storage policies
CREATE POLICY "Business owners can upload logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'logos' AND
    (storage.foldername(name))[1] IN (
      SELECT (raw_user_meta_data->>'business_id') FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Public can read all files"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('logos', 'passes', 'posters'));
```

**Upload Implementation**:
```typescript
// Upload business logo
async function uploadLogo(businessId: string, file: File) {
  const { data, error } = await supabase.storage
    .from('logos')
    .upload(`${businessId}.png`, file, {
      cacheControl: '604800', // 7 days
      upsert: true
    });

  if (error) throw error;

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('logos')
    .getPublicUrl(`${businessId}.png`);

  return urlData.publicUrl;
}

// Upload .pkpass file (24-hour expiry)
async function uploadPass(customerId: string, passBuffer: Buffer) {
  const { data, error } = await supabase.storage
    .from('passes')
    .upload(`${customerId}.pkpass`, passBuffer, {
      cacheControl: '86400', // 24 hours
      contentType: 'application/vnd.apple.pkpass',
      upsert: true
    });

  if (error) throw error;

  // Get signed URL (expires in 24 hours)
  const { data: urlData } = await supabase.storage
    .from('passes')
    .createSignedUrl(`${customerId}.pkpass`, 86400);

  return urlData.signedUrl;
}
```

### Supabase Auth Integration

**JWT Strategy**:
```typescript
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role in backend
);

// Verify JWT token (middleware)
async function verifyToken(token: string) {
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    throw new Error('INVALID_TOKEN');
  }

  return {
    userId: data.user.id,
    email: data.user.email,
    businessId: data.user.user_metadata.business_id
  };
}

// Express middleware
app.use('/api/v1', async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      error: { code: 'MISSING_TOKEN', message: 'Authorization header required' }
    });
  }

  try {
    req.user = await verifyToken(token);
    next();
  } catch (error) {
    return res.status(401).json({
      error: { code: 'INVALID_TOKEN', message: 'Token inválido o expirado' }
    });
  }
});
```

---

## RENDER-SPECIFIC OPTIMIZATIONS

### Auto-Scaling Configuration

**Render YAML** (`render.yaml`):
```yaml
services:
  # API Server
  - type: web
    name: loyalty-api
    env: node
    region: oregon
    plan: standard
    buildCommand: npm ci && npm run build
    startCommand: npm start
    healthCheckPath: /health/ready
    numInstances: 2
    scaling:
      minInstances: 2
      maxInstances: 16
      targetCPUPercent: 70
      targetMemoryPercent: 80
    envVars:
      - key: NODE_ENV
        value: production
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: TWILIO_ACCOUNT_SID
        sync: false
      - key: REDIS_URL
        fromService:
          name: loyalty-redis
          property: connectionString

  # Background Worker
  - type: worker
    name: loyalty-worker
    env: node
    region: oregon
    plan: standard
    buildCommand: npm ci && npm run build
    startCommand: npm run worker
    numInstances: 2
    scaling:
      minInstances: 1
      maxInstances: 8
      targetCPUPercent: 70
    envVars:
      - key: NODE_ENV
        value: production
      - key: SUPABASE_URL
        sync: false
      - key: REDIS_URL
        fromService:
          name: loyalty-redis
          property: connectionString

  # Redis
  - type: redis
    name: loyalty-redis
    region: oregon
    plan: standard
    maxmemoryPolicy: allkeys-lru
    ipAllowList: []

databases:
  # Note: We use Supabase for PostgreSQL (not Render's managed Postgres)
```

### Render Environment Variables

**Set via Render Dashboard**:
```bash
# Supabase
SUPABASE_URL=https://abc123.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=+14155238886

# Apple PassKit
APPLE_TEAM_ID=ABCDE12345
APPLE_KEY_ID=FGHIJ67890
APPLE_PASS_TYPE_ID=pass.com.loyaltyplatform.loyalty

# Sentry
SENTRY_DSN=https://...@sentry.io/...

# App Config
JWT_ACCESS_SECRET=<random-256-bit-key>
JWT_REFRESH_SECRET=<random-256-bit-key>
FRONTEND_URL=https://app.loyaltyplatform.pe
```

### Render Disk Management

**Problem**: Render uses ephemeral disk (resets on deploy)

**Solution**: Store all persistent data in Supabase Storage
```typescript
// ❌ WRONG: Write to local disk
fs.writeFileSync('/tmp/logo.png', buffer);

// ✅ RIGHT: Upload to Supabase Storage
await supabase.storage.from('logos').upload('biz-123.png', buffer);
```

### Render Logging

**Structured Logging** (JSON format for Render log aggregation):
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console() // Render captures stdout
  ]
});

// Usage
logger.info('Stamp added', {
  customer_id: 'cust-123',
  business_id: 'biz-456',
  stamps_count: 4,
  request_id: 'req-xyz'
});
```

**View Logs**:
- Render Dashboard → Service → Logs
- Real-time streaming
- Search by request ID, customer ID, etc.

---

## VERCEL-SPECIFIC OPTIMIZATIONS

### Frontend Deployment

**Vercel Configuration** (`vercel.json`):
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "NEXT_PUBLIC_API_URL": "https://api.loyaltyplatform.pe"
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/enroll/:businessId",
      "destination": "/enrollment?business=:businessId",
      "permanent": false
    }
  ]
}
```

### Next.js Configuration

**Optimized for Performance** (`next.config.js`):
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Image optimization
  images: {
    domains: ['abc123.supabase.co'], // Supabase Storage CDN
    formats: ['image/avif', 'image/webp']
  },

  // Compression
  compress: true,

  // Production source maps (for debugging)
  productionBrowserSourceMaps: true,

  // Environment variables
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

### Progressive Web App (PWA) - Web Stamper

**Manifest** (`public/manifest.json`):
```json
{
  "name": "Loyalty Platform Stamper",
  "short_name": "Stamper",
  "description": "Agrega sellos a tus clientes",
  "start_url": "/stamp",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#4F46E5",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**Service Worker** (`public/sw.js`):
```javascript
// Cache API requests for offline stamping
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/v1/stamps')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Cache successful stamp responses
          const clone = response.clone();
          caches.open('stamps-v1').then(cache => {
            cache.put(event.request, clone);
          });
          return response;
        })
        .catch(() => {
          // Offline: Queue stamp for later
          return caches.match(event.request).then(cached => {
            return cached || new Response('Offline - stamp queued');
          });
        })
    );
  }
});
```

### Vercel Analytics

**Enable Web Vitals tracking**:
```typescript
// pages/_app.tsx
import { Analytics } from '@vercel/analytics/react';

export function reportWebVitals(metric) {
  console.log(metric); // CLS, FID, FCP, LCP, TTFB
}

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

---

## TESTING IMPLEMENTATION (TDD)

### Test Pyramid (Year 1-3)

```
           ┌──────────────┐
           │   E2E Tests  │ 10% (5 critical flows)
           │  (Playwright)│
           └──────────────┘
       ┌─────────────────────┐
       │ Integration Tests   │ 20% (80 tests - API + DB)
       │ (Jest + Supabase)   │
       └─────────────────────┘
   ┌────────────────────────────┐
   │      Unit Tests             │ 70% (185 tests - business logic)
   │  (Jest + Mocks)             │
   └────────────────────────────┘
```

**Total**: 270 tests (>80% coverage enforced)

### Jest Configuration

**`jest.config.js`**:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './src/domains/**/*.ts': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts'
  ],

  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts']
};
```

**Test Setup** (`tests/setup.ts`):
```typescript
import { createClient } from '@supabase/supabase-js';

// Test Supabase instance
export const testSupabase = createClient(
  process.env.SUPABASE_TEST_URL,
  process.env.SUPABASE_TEST_SERVICE_ROLE_KEY
);

// Reset database before each test
beforeEach(async () => {
  await testSupabase.from('visits').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await testSupabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await testSupabase.from('campaigns').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await testSupabase.from('businesses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
});

// Clean up after all tests
afterAll(async () => {
  // Close connections
});
```

### Unit Test Example (Domain Logic)

```typescript
// tests/domains/customer.test.ts
import { Customer } from '../../src/domains/customer/Customer';
import { testSupabase } from '../setup';

describe('Customer Domain', () => {
  describe('create', () => {
    it('should create customer with valid Peru phone', async () => {
      const customer = await Customer.create({
        business_id: 'biz-123',
        name: 'María López',
        phone: '+51912345678'
      });

      expect(customer.id).toBeDefined();
      expect(customer.phone).toBe('+51912345678');
      expect(customer.stamps_count).toBe(0);
    });

    it('should reject invalid Peru phone format', async () => {
      await expect(
        Customer.create({
          business_id: 'biz-123',
          name: 'María',
          phone: '+1234567890' // Invalid Peru number
        })
      ).rejects.toThrow('PHONE_INVALID');
    });

    it('should prevent duplicate enrollment', async () => {
      await Customer.create({
        business_id: 'biz-123',
        phone: '+51912345678',
        name: 'María'
      });

      await expect(
        Customer.create({
          business_id: 'biz-123',
          phone: '+51912345678',
          name: 'María'
        })
      ).rejects.toThrow('CUSTOMER_EXISTS');
    });
  });

  describe('addStamp', () => {
    it('should increment stamps count', async () => {
      const customer = await Customer.create({
        business_id: 'biz-123',
        name: 'María',
        phone: '+51912345678'
      });

      const updated = await customer.addStamp();

      expect(updated.stamps_count).toBe(1);
    });

    it('should reset stamps when reward unlocked', async () => {
      // Create business with 5 stamps required
      const business = await testSupabase
        .from('businesses')
        .insert({
          id: 'biz-123',
          reward_structure: { stamps_required: 5, reward: 'Café gratis' }
        });

      const customer = await Customer.create({
        business_id: 'biz-123',
        name: 'María',
        phone: '+51912345678'
      });

      // Add 4 stamps
      for (let i = 0; i < 4; i++) {
        await customer.addStamp();
      }

      // 5th stamp should unlock reward and reset
      const result = await customer.addStamp();

      expect(result.stamps_count).toBe(0);
      expect(result.reward_unlocked).toBe(true);
    });
  });
});
```

### Integration Test Example (API Endpoints)

```typescript
// tests/api/stamps.test.ts
import request from 'supertest';
import app from '../../src/app';
import { testSupabase } from '../setup';

describe('POST /api/v1/stamps', () => {
  let businessToken: string;
  let customerId: string;

  beforeEach(async () => {
    // Create test business and get auth token
    const { data: authData } = await testSupabase.auth.signUp({
      email: 'owner@test.pe',
      password: 'SecurePass123!',
      options: {
        data: { business_id: 'biz-123' }
      }
    });
    businessToken = authData.session.access_token;

    // Create test customer
    const { data: customer } = await testSupabase
      .from('customers')
      .insert({
        business_id: 'biz-123',
        name: 'Test Customer',
        phone: '+51912345678',
        stamps_count: 3
      })
      .select()
      .single();
    customerId = customer.id;
  });

  it('should add stamp with valid token', async () => {
    const response = await request(app)
      .post('/api/v1/stamps')
      .set('Authorization', `Bearer ${businessToken}`)
      .set('Idempotency-Key', '550e8400-e29b-41d4-a716-446655440000')
      .send({ customer_id: customerId });

    expect(response.status).toBe(201);
    expect(response.body.data.stamps_count).toBe(4);
    expect(response.body.data.passkit_updated).toBe(true);
  });

  it('should prevent duplicate stamp with same idempotency key', async () => {
    const idempotencyKey = '550e8400-e29b-41d4-a716-446655440000';

    // First request
    await request(app)
      .post('/api/v1/stamps')
      .set('Authorization', `Bearer ${businessToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({ customer_id: customerId });

    // Duplicate request (same key)
    const response = await request(app)
      .post('/api/v1/stamps')
      .set('Authorization', `Bearer ${businessToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send({ customer_id: customerId });

    expect(response.status).toBe(201);
    expect(response.body.data.stamps_count).toBe(4); // Not 5
  });

  it('should return 401 without token', async () => {
    const response = await request(app)
      .post('/api/v1/stamps')
      .send({ customer_id: customerId });

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('MISSING_TOKEN');
  });

  it('should return 403 if token belongs to different business', async () => {
    // Create another business
    const { data: otherAuth } = await testSupabase.auth.signUp({
      email: 'other@test.pe',
      password: 'SecurePass123!',
      options: {
        data: { business_id: 'biz-456' }
      }
    });

    const response = await request(app)
      .post('/api/v1/stamps')
      .set('Authorization', `Bearer ${otherAuth.session.access_token}`)
      .send({ customer_id: customerId }); // Customer belongs to biz-123

    expect(response.status).toBe(403);
  });
});
```

### E2E Test Example (Playwright)

```typescript
// tests/e2e/enrollment.spec.ts
import { test, expect } from '@playwright/test';

test('customer can enroll and receive Apple Wallet card', async ({ page }) => {
  // Navigate to enrollment page
  await page.goto('https://app.loyaltyplatform.pe/enroll/biz-123');

  // Verify business info displayed
  await expect(page.locator('h1')).toContainText('Café Lima');

  // Fill enrollment form
  await page.fill('input[name="name"]', 'María López');
  await page.fill('input[name="phone"]', '+51912345678');

  // Submit form
  await page.click('button:has-text("Agregar a Apple Wallet")');

  // Wait for .pkpass download
  const downloadPromise = page.waitForEvent('download');
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/\.pkpass$/);

  // Verify success message
  await expect(page.locator('.success-message')).toContainText('¡Tarjeta agregada!');

  // Verify WhatsApp message sent indicator
  await expect(page.locator('.whatsapp-sent')).toBeVisible();
});

test('existing customer sees re-download option', async ({ page }) => {
  // Navigate to enrollment page
  await page.goto('https://app.loyaltyplatform.pe/enroll/biz-123');

  // Enter phone of existing customer
  await page.fill('input[name="phone"]', '+51912345678');
  await page.blur('input[name="phone"]'); // Trigger check

  // Verify existing customer message
  await expect(page.locator('.existing-customer')).toContainText('Ya tienes una tarjeta');
  await expect(page.locator('.stamps-progress')).toContainText('3/5 sellos');

  // Click re-download button
  await page.click('button:has-text("Reenviar Tarjeta")');

  // Verify WhatsApp sent
  await expect(page.locator('.whatsapp-sent')).toContainText('Te enviamos el link por WhatsApp');
});
```

### Load Test (k6)

```javascript
// loadtests/stamps-year3.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 50 },   // Ramp to 50 users
    { duration: '5m', target: 100 },  // Ramp to 100 users
    { duration: '3m', target: 100 },  // Stay at 100
    { duration: '2m', target: 0 }     // Ramp down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'], // Year 3 targets
    'http_req_failed': ['rate<0.01'] // <1% error rate
  }
};

export default function() {
  const url = 'https://api.loyaltyplatform.pe/api/v1/stamps';

  const payload = JSON.stringify({
    customer_id: `cust-${__VU}-${__ITER}`
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${__ENV.TEST_TOKEN}`,
      'Idempotency-Key': `${__VU}-${__ITER}-${Date.now()}`
    }
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'stamps_count returned': (r) => JSON.parse(r.body).data.stamps_count !== undefined
  });

  sleep(1);
}
```

**Run Load Tests**:
```bash
# Year 1 load (1,418 stamps/day = ~118/hour = ~2/min)
k6 run --vus 5 --duration 5m loadtests/stamps-year1.js

# Year 3 load (27,000 stamps/day = ~2,250/hour = ~112/min)
k6 run --vus 100 --duration 10m loadtests/stamps-year3.js

# Expected results:
# ✓ http_req_duration: p95<500ms, p99<1000ms
# ✓ http_req_failed: <1%
# ✓ 100 concurrent users handled
```

---

## 10-WEEK IMPLEMENTATION ROADMAP

### Week 1-2: Foundation

**Tasks**:
- [ ] Initialize monorepo (`/api`, `/frontend`, `/worker`)
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up Supabase project (database, auth, storage)
- [ ] Create Render account, configure services
- [ ] Create Vercel account, link GitHub repo
- [ ] Configure CI/CD (GitHub Actions)
- [ ] Write 125 unit tests for domain models (TDD)

**Deliverables**:
- `npm test` runs all tests (>80% coverage)
- CI pipeline green on every commit
- Database schema deployed to Supabase

---

### Week 3-4: API Layer

**Tasks**:
- [ ] Implement authentication (Supabase Auth + JWT)
- [ ] Build enrollment API (`POST /api/v1/enrollments`)
- [ ] Build stamping API (`POST /api/v1/stamps`)
- [ ] Build campaigns API (`POST /api/v1/campaigns`, `/activate`)
- [ ] Write 60 integration tests (API + DB)
- [ ] Deploy to Render (staging environment)

**Deliverables**:
- All API endpoints working
- Postman collection with examples
- Integration tests passing in CI

---

### Week 5-6: External Integrations

**Tasks**:
- [ ] Integrate Twilio WhatsApp API (send messages)
- [ ] Integrate Apple PassKit (generate .pkpass files)
- [ ] Configure Supabase Storage (logos, passes, posters)
- [ ] Implement transactional outbox pattern
- [ ] Write 25 integration tests (mocked external APIs)
- [ ] Add error tracking (Sentry)

**Deliverables**:
- WhatsApp messages send successfully
- .pkpass files generate and download
- All external APIs mocked in tests

---

### Week 7: Background Jobs

**Tasks**:
- [ ] Set up Bull queue (Render Redis)
- [ ] Implement campaign send worker
- [ ] Implement PassKit update worker
- [ ] Implement analytics worker (nightly batch)
- [ ] Write 17 integration tests (job processing)
- [ ] Add dead letter queue handling

**Deliverables**:
- Campaign sends queued and processed
- PassKit updates queued and processed
- Bull dashboard accessible

---

### Week 8: Real-Time & Frontend (Dashboard)

**Tasks**:
- [ ] Enable Supabase Realtime (WebSocket)
- [ ] Build Dashboard UI (React + shadcn/ui)
  - Business onboarding flow
  - Customer list + search
  - Campaign creation + activation
  - Analytics dashboard
- [ ] Implement real-time stamp notifications
- [ ] Deploy to Vercel (production)
- [ ] Write 8 integration tests (WebSocket)

**Deliverables**:
- Dashboard live at `app.loyaltyplatform.pe`
- Real-time updates working
- Business owners can create campaigns

---

### Week 9: Frontend (Web Stamper + Enrollment)

**Tasks**:
- [ ] Build Web Stamper PWA (QR scanner)
- [ ] Build Enrollment Page (customer-facing)
- [ ] Implement offline support (Service Worker)
- [ ] Add Apple Wallet integration
- [ ] Write 5 E2E tests (Playwright)
- [ ] Performance optimization (Lighthouse >90)

**Deliverables**:
- Web Stamper works on mobile browsers
- Enrollment page generates .pkpass files
- PWA installable on iOS/Android
- All E2E tests passing

---

### Week 10: Performance, Security, Monitoring

**Tasks**:
- [ ] Run load tests (k6) - validate Year 3 targets
- [ ] Database indexing optimization
- [ ] Add rate limiting (Express + Redis)
- [ ] Configure monitoring (Sentry + Render metrics)
- [ ] Set up alerts (PagerDuty + Slack)
- [ ] Security audit (OWASP Top 10)
- [ ] Documentation (API specs, runbooks)
- [ ] Disaster recovery testing

**Deliverables**:
- Load tests pass (p95 <500ms, p99 <1s)
- Monitoring dashboards configured
- Rollback procedures tested
- Production-ready checklist complete

---

## PRODUCTION CHECKLIST

**Before Go-Live**:

### Security
- [ ] Rate limiting enabled (1,000 req/15min per IP)
- [ ] HTTPS enforced (Render + Vercel)
- [ ] Supabase RLS policies enabled
- [ ] JWT tokens expire (15min access, 7d refresh)
- [ ] Secrets in environment variables (not code)
- [ ] CORS configured (whitelist domains)
- [ ] SQL injection prevention (Supabase parameterized queries)
- [ ] XSS prevention (React auto-escaping + CSP headers)

### Testing
- [ ] >80% test coverage (enforced in CI)
- [ ] All E2E tests passing
- [ ] Load tests pass at 3x projected load
- [ ] Database queries <100ms p95
- [ ] API endpoints <500ms p95

### Monitoring
- [ ] Sentry configured (error tracking)
- [ ] PagerDuty alerts configured (critical errors)
- [ ] Slack warnings configured (non-critical)
- [ ] Render metrics dashboard reviewed
- [ ] Uptime monitoring (Uptime Robot)

### Disaster Recovery
- [ ] Supabase daily backups enabled
- [ ] Point-in-time recovery tested
- [ ] Application rollback tested
- [ ] Database restore tested
- [ ] Runbooks documented

### Performance
- [ ] Database indexes created
- [ ] Query performance validated
- [ ] Redis caching configured
- [ ] Image optimization (Vercel)
- [ ] Lighthouse score >90

### Legal & Compliance
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] GDPR compliance (data export/delete)
- [ ] WhatsApp opt-in/opt-out flow
- [ ] Cookie consent (if EU users)

---

## COST SUMMARY (Year 1-3)

### Year 1 (105 businesses, 31.5K customers)

| Service | Cost |
|---------|------|
| **Supabase Pro** | $25/month |
| **Render Web** (2 × Standard) | $14/month |
| **Render Worker** (1 × Standard) | $7/month |
| **Render Redis** | $10/month |
| **Vercel Pro** | $20/month |
| **Twilio WhatsApp** | $175/month (387 msgs/day) |
| **Sentry** | $26/month |
| **Uptime Robot** | Free |
| **Domain** | $12/year = $1/month |
| **Total** | **$278/month** |

**MRR**: $6,300
**Gross Margin**: 95.6%

---

### Year 3 (2,000 businesses, 600K customers)

| Service | Cost |
|---------|------|
| **Supabase Pro** (scaled) | $500/month |
| **Render Web** (8 × Standard) | $56/month |
| **Render Worker** (6 × Standard) | $42/month |
| **Render Redis** (cluster) | $100/month |
| **Vercel Pro** | $20/month |
| **Twilio WhatsApp** | $2,445/month (8,150 msgs/day) |
| **Sentry** | $200/month |
| **PagerDuty** | $125/month |
| **Monitoring** | $100/month |
| **Total** | **$3,588/month** |

**MRR**: $120,000
**Gross Margin**: 97.0%

---

## NEXT STEPS

1. **Approve Plan** → Review and confirm approach
2. **Set Up Accounts** → Supabase, Render, Vercel
3. **Week 1 Start** → Initialize repo, configure CI/CD
4. **Daily Standups** → 15-min check-ins on progress
5. **Weekly Demos** → Show working features every Friday

**Questions? Concerns? Ready to start?**
