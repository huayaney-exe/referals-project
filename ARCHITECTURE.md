# System Architecture
# Digital Loyalty Platform - Production Grade

**Version**: 1.0
**Date**: January 2025
**Scope**: Year 1-2 Production System (10-500 businesses, 3K-150K customers)
**Scalability Target**: Year 3 (2,000 businesses, 600K customers)

---

## Executive Summary

This architecture document defines a **production-grade, monolithic-first approach** optimized for:
- ✅ **Rapid iteration** (TDD-friendly, single codebase)
- ✅ **Cost efficiency** (avoid premature microservices complexity)
- ✅ **Horizontal scalability** (stateless design, ready for Year 3)
- ✅ **Developer experience** (TypeScript, modern tooling, clear boundaries)
- ✅ **Operational simplicity** (single deployment, unified monitoring)

**Key Principle**: Start with a **well-structured monolith** that can scale horizontally, not a distributed system that's overkill for Year 1-2.

---

## Architecture Principles

### 1. Monolith-First Strategy

**Rationale**:
- Year 1-2 load (10-500 businesses) doesn't justify microservices complexity
- Single codebase = faster development, easier debugging, simpler deployment
- Modular monolith with clear domain boundaries = easy extraction later if needed

**When to Consider Microservices**:
- **Trigger**: >2,000 businesses, >500K customers, >100 RPS sustained
- **Candidates for Extraction** (Year 3+):
  - Campaign Engine (WhatsApp sending, heavy I/O)
  - Analytics Engine (batch processing, different scaling profile)
  - PassKit Service (Apple Wallet operations, can fail independently)

### 2. Domain-Driven Design Boundaries

**Core Domains** (separate modules within monolith):

```
src/
├── domains/
│   ├── business/          # Business account management
│   ├── customer/          # Customer profiles, enrollment
│   ├── loyalty/           # Stamps, rewards, cards
│   ├── campaign/          # WhatsApp campaigns, triggers
│   ├── analytics/         # Retention metrics, dashboards
│   └── referral/          # Referral program, attribution
├── infrastructure/        # External integrations
│   ├── whatsapp/         # Twilio WhatsApp API
│   ├── passkit/          # Apple Wallet PassKit
│   ├── storage/          # S3/CloudFront
│   └── database/         # PostgreSQL, Redis
└── shared/               # Cross-cutting concerns
    ├── auth/             # JWT authentication
    ├── validation/       # Input validation
    └── errors/           # Error handling
```

**Why This Matters**:
- Clear boundaries enable **parallel development** (team can work on different domains)
- **Testability**: Mock domain boundaries, test in isolation
- **Future extraction**: Clean interfaces make microservice migration easier (if needed)

### 3. Stateless Application Design

**No Server-Side Session State**:
- All sessions stored in **Redis** (not in-memory)
- JWT tokens for authentication (stateless, no server lookup)
- WebSocket connections managed by Socket.io with Redis adapter (multi-instance support)

**Why This Matters**:
- Horizontal scaling: Add app servers behind load balancer without sticky sessions
- Zero-downtime deployments: Rolling updates don't break user sessions
- Resilience: App server crashes don't lose session data

### 4. Database-First Performance

**PostgreSQL Optimization**:
- **Indexes**: Every foreign key, every query WHERE clause
- **Partial indexes**: For common queries (e.g., `WHERE active = true`)
- **JSONB columns**: For flexible schema (campaign configuration, analytics events)
- **Connection pooling**: PgBouncer in transaction mode (Year 1+)
- **Read replicas**: Year 2+ for analytics queries

**Redis Caching Strategy**:
- **Cache-aside pattern**: App checks cache → if miss, query DB → write to cache
- **TTL strategy**:
  - Customer data: 5 minutes (changes infrequently)
  - Dashboard aggregations: 30 seconds (near real-time)
  - Rate limiting: 1 minute (sliding window)

---

## Technology Stack (Production-Grade)

### Backend: Node.js + TypeScript

**Framework**: **Express.js** (not NestJS)

**Rationale**:
- ✅ Lightweight, mature, widely understood
- ✅ Excellent async performance (critical for WhatsApp/PassKit I/O)
- ✅ Easy to hire for, massive ecosystem
- ❌ NestJS: Too much magic, overkill for monolith, harder debugging

**Key Libraries**:
```json
{
  "express": "^4.18.2",           // Web framework
  "typescript": "^5.3.3",         // Type safety
  "zod": "^3.22.4",              // Runtime validation + TypeScript types
  "pg": "^8.11.3",               // PostgreSQL client
  "ioredis": "^5.3.2",           // Redis client
  "bull": "^4.12.0",             // Background jobs (Redis-backed)
  "socket.io": "^4.6.1",         // Real-time WebSocket
  "passport": "^0.7.0",          // Authentication
  "passport-jwt": "^4.0.1",      // JWT strategy
  "winston": "^3.11.0",          // Structured logging
  "helmet": "^7.1.0",            // Security headers
  "express-rate-limit": "^7.1.5" // Rate limiting
}
```

**Why TypeScript**:
- Catch errors at compile-time (critical for production)
- Self-documenting code (types = living documentation)
- Excellent IDE support (autocomplete, refactoring)
- Easy to onboard new developers

### Frontend: React + TypeScript

**Dashboard** (Business Owner):
- **Framework**: React 18 + TypeScript
- **State Management**: **TanStack Query (React Query)** (not Redux)
  - Cache-first, automatic refetching, optimistic updates
  - Simpler than Redux, built for async data
- **UI Library**: **shadcn/ui** (Tailwind + Radix UI primitives)
  - Copy-paste components (no package bloat)
  - Fully customizable, accessible by default
- **Build Tool**: **Vite** (fast, modern, great DX)

**Web Stamper** (Progressive Web App):
- Same stack as Dashboard (code reuse)
- **QR Scanner**: `html5-qrcode` library (browser camera API)
- **Offline Support**: Service Worker (cache API requests for offline stamping)

**Enrollment Page** (Customer-Facing):
- Simple React SPA (no complex state)
- Mobile-optimized, minimal JS bundle
- Server-side rendering (SSR) for SEO (Next.js? No - overkill for single page)

**Why React Query over Redux**:
- Redux: Verbose boilerplate, manual cache invalidation, complex middleware
- React Query: Automatic caching, refetching, mutations, 1/10th the code

### Database: PostgreSQL 15

**Why PostgreSQL over MySQL**:
- ✅ Better JSON support (JSONB for campaign config, analytics events)
- ✅ Advanced indexing (GIN indexes for JSONB, partial indexes)
- ✅ Full-text search (if needed later for customer search)
- ✅ Better window functions (for cohort analysis)
- ✅ Stronger consistency guarantees (ACID compliance)

**Schema Design Philosophy**:
- **Normalized tables**: Avoid duplication, enforce referential integrity
- **Denormalization where needed**: Pre-computed aggregations for dashboards
- **JSONB for flexibility**: Campaign configuration, analytics events (avoid schema migrations)
- **Partitioning ready**: Design for future partitioning (Year 3+)

### Cache: Redis 7

**Use Cases**:
1. **Session Store**: JWT refresh tokens, WebSocket session data
2. **Rate Limiting**: Sliding window counters (prevent abuse)
3. **Cache Layer**: Customer lookups, dashboard aggregations
4. **Job Queue**: Bull queue backend (campaign sends, PassKit updates)
5. **Real-Time Pub/Sub**: Socket.io adapter (multi-instance coordination)

**Why Redis over Memcached**:
- ✅ Data structures (lists, sets, sorted sets) for queues
- ✅ Pub/sub for real-time (Socket.io)
- ✅ Persistence (AOF/RDS) for job queue reliability
- ✅ Cluster mode for Year 3+ horizontal scaling

### Background Jobs: Bull (Redis-backed)

**Why Bull over other job queues**:
- ✅ Built on Redis (reuse existing infrastructure)
- ✅ Retry logic, priority queues, rate limiting
- ✅ Dashboard UI (bull-board) for monitoring
- ✅ Delayed jobs (schedule campaign sends)

**Queue Design**:
```typescript
// Priority queues
campaignSendsQueue     // P1: WhatsApp message sends
passKitUpdatesQueue    // P2: Apple Wallet updates
analyticsQueue         // P3: Batch analytics processing
```

---

## System Components

### 1. API Server (Express + TypeScript)

**Responsibilities**:
- RESTful API for dashboard, web stamper, enrollment
- Authentication (JWT)
- Input validation (Zod schemas)
- Business logic orchestration
- Real-time WebSocket connections (Socket.io)

**Deployment**:
- **Year 1**: 2 instances behind ALB (Application Load Balancer)
- **Year 2**: 3-6 instances with auto-scaling (CPU >70%)
- **Year 3**: 8+ instances (based on revised projections)

**Horizontal Scaling Pattern**:
```
Client → ALB → [API Server 1, API Server 2, ..., API Server N]
                      ↓ (stateless, share Redis/PostgreSQL)
              Redis ← → PostgreSQL
```

**Code Structure**:
```
src/api/
├── routes/
│   ├── business.routes.ts    // Business account CRUD
│   ├── customer.routes.ts    // Customer enrollment, lookup
│   ├── stamp.routes.ts       // Stamping operations
│   ├── campaign.routes.ts    // Campaign CRUD, activation
│   └── analytics.routes.ts   // Dashboard metrics
├── middleware/
│   ├── auth.middleware.ts    // JWT verification
│   ├── validation.middleware.ts // Zod schema validation
│   └── rateLimiting.middleware.ts // Express rate limit
└── websocket/
    └── dashboard.socket.ts   // Real-time dashboard updates
```

### 2. Background Worker (Bull + TypeScript)

**Responsibilities**:
- Process job queues (campaign sends, PassKit updates, analytics)
- Retry failed jobs with exponential backoff
- Dead letter queue for permanent failures

**Deployment**:
- **Year 1**: 1 instance (sufficient for <1,000 messages/day)
- **Year 2**: 2 instances (scale with campaign volume)
- **Year 3**: 6 instances (handle 8,150 messages/day)

**Job Processing Pattern**:
```typescript
// Campaign send job
interface CampaignSendJob {
  campaignId: string;
  customerId: string;
  messageTemplate: string;
  variables: Record<string, string>; // {{name}}, {{discount_code}}
}

campaignSendsQueue.process('send-whatsapp', 10, async (job) => {
  const { customerId, messageTemplate, variables } = job.data;

  // Render template with variables
  const message = renderTemplate(messageTemplate, variables);

  // Send via Twilio WhatsApp API
  await twilioClient.messages.create({
    to: `whatsapp:${customer.phone}`,
    from: `whatsapp:${config.twilioWhatsAppNumber}`,
    body: message
  });

  // Update campaign analytics
  await db.campaign_sends.update({ status: 'delivered' });
});
```

**Why Separate Worker Process**:
- API servers optimized for low latency (request/response)
- Workers optimized for throughput (batch processing)
- Independent scaling (add more workers without adding API capacity)

### 3. Database (PostgreSQL + PgBouncer)

**Connection Pooling Architecture**:
```
API Servers (10 connections each) → PgBouncer (pool 100 client connections)
                                        ↓ (transaction mode)
                                   PostgreSQL (50 server connections)
```

**Why PgBouncer**:
- Year 1: Single PostgreSQL instance has 100 connection limit
- Year 2: With 6 API servers × 10 connections = 60 connections (manageable)
- Year 3: With 8+ servers, need pooling to avoid "too many connections" errors

**Schema Highlights**:
```sql
-- Businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  reward_structure JSONB NOT NULL, -- { "stamps_required": 5, "reward": "Free coffee" }
  inactivity_threshold_days INT DEFAULT 14,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_businesses_email ON businesses(email);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  phone VARCHAR(20) NOT NULL, -- WhatsApp phone
  name VARCHAR(255) NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  last_visit_at TIMESTAMPTZ,
  visit_frequency_days NUMERIC(5,2), -- Calculated: avg days between visits
  is_at_risk BOOLEAN DEFAULT false, -- Flagged by cron job
  UNIQUE(business_id, phone) -- One enrollment per phone per business
);
CREATE INDEX idx_customers_business ON customers(business_id);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_at_risk ON customers(business_id, is_at_risk) WHERE is_at_risk = true; -- Partial index

-- Visits (stamps) table
CREATE TABLE visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  stamped_at TIMESTAMPTZ DEFAULT NOW(),
  transaction_amount NUMERIC(10,2), -- Optional
  stamped_by_user_id UUID REFERENCES users(id) -- Business owner or staff
);
CREATE INDEX idx_visits_customer ON visits(customer_id);
CREATE INDEX idx_visits_business_date ON visits(business_id, stamped_at DESC);
-- Future partitioning (Year 3): PARTITION BY RANGE (stamped_at)

-- Campaigns table
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  trigger_type VARCHAR(50) NOT NULL, -- 'inactivity', 'birthday', 'milestone'
  trigger_config JSONB NOT NULL, -- { "days_inactive": 14, "discount_percent": 15 }
  message_template TEXT NOT NULL, -- "Te extrañamos {{name}}! Usa {{discount_code}}"
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'paused'
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_campaigns_business ON campaigns(business_id);
CREATE INDEX idx_campaigns_status ON campaigns(business_id, status) WHERE status = 'active';

-- Campaign sends table (high volume, partition in Year 3)
CREATE TABLE campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ, -- From Twilio webhook
  clicked_at TIMESTAMPTZ,
  discount_code VARCHAR(50), -- Generated unique code
  redeemed_at TIMESTAMPTZ
);
CREATE INDEX idx_campaign_sends_campaign ON campaign_sends(campaign_id);
CREATE INDEX idx_campaign_sends_customer ON campaign_sends(customer_id);
-- Future partitioning: PARTITION BY RANGE (sent_at)
```

### 4. Cache Layer (Redis)

**Data Structures**:
```typescript
// Customer lookup cache (reduce DB queries)
// Key: customer:{businessId}:{phone}
// Value: JSON customer object
// TTL: 5 minutes
await redis.setex(
  `customer:${businessId}:${phone}`,
  300,
  JSON.stringify(customer)
);

// Dashboard aggregations cache
// Key: dashboard:{businessId}:metrics
// Value: JSON { activeCustomers, retentionRate, atRiskCount }
// TTL: 30 seconds
await redis.setex(
  `dashboard:${businessId}:metrics`,
  30,
  JSON.stringify(metrics)
);

// Rate limiting (sliding window)
// Key: rate_limit:{businessId}:campaign_sends
// Value: Sorted set with timestamps
// TTL: 7 days (frequency cap)
await redis.zadd(
  `rate_limit:${businessId}:campaign_sends`,
  Date.now(),
  `${customerId}:${Date.now()}`
);
// Count sends in last 7 days
const count = await redis.zcount(
  `rate_limit:${businessId}:campaign_sends`,
  Date.now() - 7 * 24 * 60 * 60 * 1000,
  Date.now()
);
```

---

## External Integrations

### 1. Twilio WhatsApp Business API

**SDK**: `twilio` (official Node.js SDK)

**Integration Pattern**:
```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send WhatsApp message
async function sendWhatsAppMessage(to: string, body: string) {
  const message = await client.messages.create({
    from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
    to: `whatsapp:${to}`, // Peru: +51 9XXXXXXXX
    body: body
  });

  return message.sid; // Store for webhook correlation
}

// Webhook endpoint for status updates
app.post('/webhooks/twilio/status', async (req, res) => {
  const { MessageSid, MessageStatus } = req.body;

  // Update campaign_sends table
  if (MessageStatus === 'delivered') {
    await db.campaign_sends.update({
      delivered_at: new Date()
    }).where({ twilio_sid: MessageSid });
  }

  res.sendStatus(200);
});
```

**Error Handling**:
- **Rate Limit (429)**: Exponential backoff with Bull retry
- **Invalid Number (400)**: Mark customer phone as invalid, notify business owner
- **Quota Exceeded (error 63018)**: Pause campaigns, alert admin

**Cost Optimization**:
- Batch sends: Process queue at 80 MPS (Twilio's default throughput)
- Template approval: Pre-approve templates with Meta to avoid rejections
- Quality monitoring: Track opt-out rates (<2% target)

### 2. Apple PassKit API

**Libraries**:
- `passkit-generator`: Generate .pkpass files
- `apn`: Send push notifications for pass updates (via APNs)

**Pass Generation Pattern**:
```typescript
import { PKPass } from 'passkit-generator';

async function generateLoyaltyPass(customer: Customer, business: Business) {
  const pass = new PKPass({
    model: './templates/loyalty-card', // .pass bundle
    certificates: {
      wwdr: fs.readFileSync('./certs/wwdr.pem'),
      signerCert: fs.readFileSync('./certs/signerCert.pem'),
      signerKey: fs.readFileSync('./certs/signerKey.pem')
    }
  });

  // Customize pass
  pass.serialNumber = customer.id;
  pass.setBarcodes({
    message: customer.id, // QR code data (for stamper scanning)
    format: 'PKBarcodeFormatQR'
  });

  pass.primaryFields.push({
    key: 'stamps',
    label: 'Sellos',
    value: customer.stamps_count
  });

  pass.auxiliaryFields.push({
    key: 'reward',
    label: 'Recompensa',
    value: business.reward_structure.reward
  });

  const buffer = pass.getAsBuffer();

  // Upload to S3 for customer download
  await s3.putObject({
    Bucket: process.env.S3_BUCKET,
    Key: `passes/${customer.id}.pkpass`,
    Body: buffer,
    ContentType: 'application/vnd.apple.pkpass'
  });

  return `${process.env.CDN_URL}/passes/${customer.id}.pkpass`;
}
```

**Pass Update Pattern** (when stamp added):
```typescript
import apn from 'apn';

const apnProvider = new apn.Provider({
  token: {
    key: fs.readFileSync('./certs/AuthKey.p8'),
    keyId: process.env.APPLE_KEY_ID,
    teamId: process.env.APPLE_TEAM_ID
  },
  production: true
});

async function notifyPassUpdate(customer: Customer) {
  const notification = new apn.Notification({
    topic: 'pass.com.loyaltyplatform.loyalty',
    payload: {} // Empty payload triggers pass update
  });

  await apnProvider.send(notification, customer.apns_device_token);
}
```

**Why Not Generate Passes On-The-Fly**:
- ❌ Slow: PKPass generation takes 200-500ms (blocks enrollment)
- ✅ Better: Generate once, cache on S3/CloudFront (CDN), serve instantly

### 3. Storage (AWS S3 + CloudFront CDN)

**Use Cases**:
1. **Business Logos**: Uploaded during setup, served via CDN
2. **.pkpass Files**: Generated once, cached 24 hours, purged on update
3. **QR Code Posters**: PDF generated during setup, downloadable

**S3 Bucket Structure**:
```
s3://loyalty-platform-peru/
├── logos/
│   └── {businessId}.png
├── passes/
│   └── {customerId}.pkpass (TTL: 24 hours)
└── posters/
    └── {businessId}-enrollment-qr.pdf
```

**CloudFront Configuration**:
- **Cache TTL**: 24 hours (passes), 7 days (logos/posters)
- **Geo-Restriction**: South America (optimize for Peru)
- **HTTPS Only**: Force SSL for security

---

## Security Architecture

### Authentication & Authorization

**JWT Strategy**:
```typescript
// Access token (short-lived)
const accessToken = jwt.sign(
  {
    userId: user.id,
    businessId: user.business_id,
    role: user.role // 'owner', 'staff', 'admin'
  },
  process.env.JWT_ACCESS_SECRET,
  { expiresIn: '15m' } // Short expiration
);

// Refresh token (long-lived, stored in Redis)
const refreshToken = jwt.sign(
  { userId: user.id, tokenVersion: user.token_version },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: '7d' }
);

await redis.setex(
  `refresh_token:${user.id}`,
  7 * 24 * 60 * 60, // 7 days
  refreshToken
);
```

**Authorization Middleware**:
```typescript
// Ensure user can only access their own business data
function requireBusinessOwnership(req, res, next) {
  const { businessId } = req.params;
  const { businessId: userBusinessId, role } = req.user; // From JWT

  if (role === 'admin') return next(); // Admins can access all

  if (businessId !== userBusinessId) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  next();
}

// Usage
app.get('/api/v1/businesses/:businessId/customers',
  authenticate,           // Verify JWT
  requireBusinessOwnership, // Check authorization
  getCustomers
);
```

### Input Validation (Zod)

**Why Zod over Joi/Yup**:
- TypeScript-first (types inferred from schemas)
- Runtime validation + compile-time types (single source of truth)
- Better error messages

**Example**:
```typescript
import { z } from 'zod';

// Define schema
const CreateCampaignSchema = z.object({
  name: z.string().min(3).max(255),
  trigger_type: z.enum(['inactivity', 'birthday', 'milestone']),
  trigger_config: z.object({
    days_inactive: z.number().int().min(7).max(30).optional(),
    discount_percent: z.number().int().min(5).max(50)
  }),
  message_template: z.string().min(10).max(1000)
});

// Infer TypeScript type
type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>;

// Validate in route
app.post('/api/v1/campaigns', async (req, res) => {
  const result = CreateCampaignSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: result.error.flatten()
    });
  }

  const campaign = await createCampaign(result.data);
  res.json(campaign);
});
```

### Rate Limiting

**Strategy**:
```typescript
import rateLimit from 'express-rate-limit';

// Global API rate limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Max 1000 requests per 15 minutes per IP
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', apiLimiter);

// Stricter limit for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Max 5 login attempts per 15 minutes
  skipSuccessfulRequests: true
});

app.use('/api/v1/auth/login', authLimiter);

// Campaign send frequency cap (business-level, Redis-based)
async function checkCampaignFrequency(businessId: string, customerId: string) {
  const key = `campaign_frequency:${businessId}:${customerId}`;
  const lastSent = await redis.get(key);

  if (lastSent) {
    const daysSinceLastSent = (Date.now() - parseInt(lastSent)) / (24 * 60 * 60 * 1000);
    if (daysSinceLastSent < 7) {
      throw new Error('Customer already received campaign in last 7 days');
    }
  }

  await redis.setex(key, 7 * 24 * 60 * 60, Date.now().toString());
}
```

### Data Encryption

**At Rest**:
- PostgreSQL: Encrypted EBS volumes (AWS)
- S3: Server-side encryption (SSE-S3)
- Backups: Encrypted snapshots

**In Transit**:
- HTTPS only (TLS 1.2+)
- Database connections: SSL/TLS required
- Redis: TLS encryption (Year 2+, when multi-AZ)

**Sensitive Data**:
- Customer phone numbers: Consider tokenization (Year 2+, if compliance requires)
- Passwords: bcrypt with salt (cost factor 12)

---

## Monitoring & Observability

### Logging (Winston + CloudWatch)

**Structured Logging**:
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json() // Structured logs for parsing
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Usage
logger.info('Campaign sent', {
  campaignId: campaign.id,
  customerId: customer.id,
  twilioSid: messageSid,
  businessId: business.id
});
```

**What to Log**:
- ✅ API requests (method, path, status, duration)
- ✅ Database queries (slow queries >500ms)
- ✅ External API calls (Twilio, PassKit, S3)
- ✅ Background job processing (job type, duration, success/failure)
- ✅ Authentication events (login, logout, failed attempts)
- ❌ Customer PII (avoid logging phone numbers, emails in plain text)

### Metrics (CloudWatch + Prometheus)

**Key Metrics**:
```typescript
// Application metrics
- api_requests_total (counter) { method, path, status }
- api_request_duration_seconds (histogram) { method, path }
- db_query_duration_seconds (histogram) { query_type }
- background_job_duration_seconds (histogram) { job_type }
- whatsapp_messages_sent_total (counter) { status: 'success' | 'failed' }
- passkit_updates_total (counter) { status: 'success' | 'failed' }

// Business metrics
- customers_enrolled_total (counter) { business_id }
- stamps_added_total (counter) { business_id }
- campaigns_sent_total (counter) { campaign_id }
- campaign_redemptions_total (counter) { campaign_id }
```

### Error Tracking (Sentry)

**Integration**:
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1, // Sample 10% of transactions
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app })
  ]
});

// Error handler middleware
app.use(Sentry.Handlers.errorHandler());
```

**What to Track**:
- Unhandled exceptions (app crashes)
- API errors (500s, 400s with context)
- External API failures (Twilio, PassKit)
- Database errors (connection failures, query timeouts)

### Health Checks

**Liveness Probe** (is app running?):
```typescript
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});
```

**Readiness Probe** (is app ready to serve traffic?):
```typescript
app.get('/health/ready', async (req, res) => {
  try {
    // Check database connection
    await db.raw('SELECT 1');

    // Check Redis connection
    await redis.ping();

    res.status(200).json({
      status: 'ready',
      checks: {
        database: 'ok',
        redis: 'ok'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      error: error.message
    });
  }
});
```

---

## Deployment Architecture (AWS)

### Year 1-2 Infrastructure

```
                           ┌─────────────────┐
                           │   CloudFront    │ (CDN)
                           │  (static assets)│
                           └────────┬────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  │                                   │
        ┌─────────▼─────────┐            ┌───────────▼──────────┐
        │  Application      │            │     S3 Bucket        │
        │  Load Balancer    │            │ (logos, passes, PDFs)│
        │      (ALB)        │            └──────────────────────┘
        └─────────┬─────────┘
                  │
     ┌────────────┼────────────┐
     │            │            │
┌────▼────┐  ┌───▼─────┐  ┌──▼──────┐
│ API     │  │ API     │  │ API     │
│ Server 1│  │ Server 2│  │ Server N│
│(EC2)    │  │ (EC2)   │  │ (EC2)   │
└────┬────┘  └────┬────┘  └────┬────┘
     │            │            │
     └────────────┼────────────┘
                  │
     ┌────────────┼────────────┐
     │            │            │
┌────▼────┐  ┌───▼─────┐  ┌──▼──────┐
│Background│  │Background│  │ Background│
│Worker 1  │  │ Worker 2 │  │ Worker N │
│ (EC2)    │  │ (EC2)    │  │ (EC2)    │
└────┬─────┘  └────┬─────┘  └────┬────┘
     │             │             │
     └─────────────┼─────────────┘
                   │
     ┌─────────────┴─────────────┐
     │                           │
┌────▼─────┐              ┌──────▼──────┐
│PostgreSQL│              │    Redis    │
│ Primary  │              │  (cache +   │
│ + Replica│              │   queues)   │
│  (RDS)   │              │ (ElastiCache)│
└──────────┘              └─────────────┘
```

**Year 1 Sizing** (10-105 businesses, 3K-31K customers):
- **EC2 API**: 2 × t3.medium (auto-scale to 4)
- **EC2 Workers**: 1 × t3.small
- **RDS**: 1 × db.t3.medium (no replica yet)
- **ElastiCache**: 1 × cache.t3.micro

**Year 2 Sizing** (105-500 businesses, 31K-150K customers):
- **EC2 API**: 3 × t3.large (auto-scale to 6)
- **EC2 Workers**: 2 × t3.medium
- **RDS**: 1 × db.t3.large + 1 read replica
- **ElastiCache**: 1 × cache.t3.small

### CI/CD Pipeline (GitHub Actions)

**Pipeline Stages**:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - run: npm run build
      - run: docker build -t loyalty-api:${{ github.sha }} .
      - run: docker push loyalty-api:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - run: aws ecs update-service --cluster prod --service api --force-new-deployment
```

**Deployment Strategy**:
- **Blue-Green**: Deploy new version alongside old, switch traffic when healthy
- **Rolling Updates**: Replace instances one-by-one (zero downtime)
- **Rollback**: Keep previous 3 versions, rollback in 1 command

---

## Performance Targets

### API Response Times

| Endpoint | p50 | p95 | p99 |
|----------|-----|-----|-----|
| **POST /stamps** | <100ms | <300ms | <500ms |
| **GET /customers/:id** | <50ms | <150ms | <300ms |
| **GET /dashboard/metrics** | <200ms | <500ms | <1s |
| **POST /campaigns** | <300ms | <700ms | <1.5s |
| **POST /enrollments** | <500ms | <1s | <2s |

### Database Query Times

| Query Type | p95 | p99 |
|------------|-----|-----|
| **Customer lookup** (indexed) | <50ms | <100ms |
| **Dashboard aggregation** (cached) | <100ms | <300ms |
| **Campaign sends insert** (batch) | <200ms | <500ms |

### Background Job Processing

| Job Type | Target Throughput | Max Queue Wait |
|----------|------------------|---------------|
| **WhatsApp sends** | 80/second | <30s |
| **PassKit updates** | 100/second | <1min |
| **Analytics** | Batch (nightly) | <5min |

---

## Scalability Plan

### Vertical Scaling (Year 1-2)

**When to Scale Up**:
- CPU >70% sustained for 10+ minutes
- Memory >75% sustained
- Database IOPS >80% of provisioned

**Scaling Path**:
1. t3.medium → t3.large (2x CPU/RAM)
2. t3.large → t3.xlarge (2x CPU/RAM)
3. db.t3.medium → db.t3.large → db.m5.xlarge

### Horizontal Scaling (Year 2+)

**When to Scale Out**:
- Auto-scaling triggers at CPU >70%
- Add API servers behind ALB (stateless design)
- Add worker instances (process queues faster)

**Bottleneck Management**:
- **Database**: Add read replicas for analytics queries
- **Redis**: Upgrade to cluster mode (Year 3+)
- **WhatsApp API**: Already handles 80 MPS (sufficient for Year 3)

### Database Partitioning (Year 3+)

**When to Partition**:
- `visits` table >10M rows (Year 3)
- `campaign_sends` table >50M rows (Year 3)

**Partitioning Strategy**:
```sql
-- Partition visits by month (Year 3)
CREATE TABLE visits (
  id UUID,
  customer_id UUID,
  stamped_at TIMESTAMPTZ,
  ...
) PARTITION BY RANGE (stamped_at);

CREATE TABLE visits_2027_01 PARTITION OF visits
  FOR VALUES FROM ('2027-01-01') TO ('2027-02-01');

CREATE TABLE visits_2027_02 PARTITION OF visits
  FOR VALUES FROM ('2027-02-01') TO ('2027-03-01');
```

---

## Disaster Recovery

### Backup Strategy

**Automated Backups**:
- **PostgreSQL**: Daily snapshots, 7-day retention
- **Redis**: Daily RDB snapshots (persistence enabled)
- **S3**: Versioning enabled (accidental delete recovery)

**Backup Testing**:
- Monthly restore test (validate backup integrity)
- Document restore procedure (RTO: 1 hour, RPO: 24 hours)

### High Availability

**Year 1**: Single-AZ (acceptable for early stage)
**Year 2**: Multi-AZ deployment:
- RDS: Multi-AZ automatic failover
- ElastiCache: Replication group (automatic failover)
- API servers: Distributed across AZs

**Failover Targets**:
- **RDS**: <60s automatic failover
- **ElastiCache**: <30s automatic failover
- **API**: Instant (ALB routes to healthy instances)

---

## Cost Management

### Year 1 Monthly Costs (Detailed)

| Category | Service | Cost |
|----------|---------|------|
| **Compute** | 2 × t3.medium API | $60 |
| **Compute** | 1 × t3.small Worker | $15 |
| **Database** | 1 × db.t3.medium | $85 |
| **Cache** | 1 × cache.t3.micro | $15 |
| **Load Balancer** | ALB | $25 |
| **Storage** | S3 (10 GB) | $5 |
| **CDN** | CloudFront (50 GB) | $10 |
| **Monitoring** | CloudWatch | $20 |
| **DNS** | Route 53 | $5 |
| **Total** | | **$240/month** |

**External Services**:
- Twilio: ~$175/month (387 msgs/day × 30 × $0.015)
- Sentry: $26/month
- Total: **$441/month** (Year 1 average)

**Year 2 Monthly Costs**: ~$1,200/month (infrastructure + services)

---

## Summary & Recommendations

### Architecture Strengths

✅ **Monolith-First**: Simple, fast iteration, easy debugging
✅ **Stateless Design**: Horizontal scaling ready, no sticky sessions
✅ **Domain Boundaries**: Clear modules enable parallel development
✅ **TypeScript**: Type safety, self-documenting code
✅ **Production-Grade**: Logging, monitoring, error tracking from day 1
✅ **Cost-Efficient**: $240-1,200/month infrastructure (scales with revenue)

### Technology Choices Rationale

| Choice | Reason |
|--------|--------|
| **Express over NestJS** | Simpler, less magic, easier debugging |
| **React Query over Redux** | 1/10th the code, automatic caching |
| **PostgreSQL over MySQL** | Better JSON support, advanced features |
| **Bull over others** | Redis-backed, built-in retries, dashboard UI |
| **Zod over Joi** | TypeScript-first, type inference |
| **shadcn/ui over MUI** | Copy-paste components, no bloat |

### When to Evolve Architecture

**Year 3 Triggers** (>2,000 businesses, >600K customers):
- **Microservices**: Extract campaign engine if queue >10K jobs/day
- **Database Sharding**: If single PostgreSQL instance maxed out (>50K IOPS)
- **Redis Cluster**: If single instance >50 GB memory
- **Caching Layer**: Add application-level cache (Varnish/Nginx)

**Don't Premature Optimize**:
- ❌ Microservices in Year 1-2 (overkill)
- ❌ GraphQL federation (no need with monolith)
- ❌ Event sourcing/CQRS (unnecessary complexity)
- ❌ Kubernetes (ECS/EC2 sufficient for scale)

---

**Next Document**: TDD Implementation Plan (phased development with test-first approach)
