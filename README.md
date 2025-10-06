# Loyalty Platform Peru 🇵🇪

AI-powered digital loyalty platform for Peruvian SMBs with Apple Wallet integration and WhatsApp campaigns.

## 📋 Phase 1: Foundation - COMPLETED ✅

### What's Been Set Up

- ✅ Project structure (src/, tests/, scripts/)
- ✅ TypeScript configuration (strict mode)
- ✅ Jest testing framework (80% coverage threshold, 90% for domain logic)
- ✅ ESLint + Prettier (code quality)
- ✅ **Database schema (8 tables created in Supabase)** ✅
- ✅ **Row Level Security (15 RLS policies enabled)** ✅
- ✅ **Stored procedure (add_stamp_with_outbox)** ✅
- ✅ Supabase client configuration
- ✅ GitHub Actions CI/CD pipeline
- ✅ Express server with health checks
- ✅ Environment configuration
- ✅ **Supabase CLI setup and migrations** ✅

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. ~~Set Up Database~~ ✅ ALREADY DONE

**Database is already set up!** 8 tables created and verified:
- ✅ businesses, customers, stamps, campaigns
- ✅ campaign_sends, referrals, analytics_events, outbox_events
- ✅ 28 indexes, 15 RLS policies, 1 stored procedure

See [DATABASE-SETUP-COMPLETE.md](DATABASE-SETUP-COMPLETE.md) for details.

### 3. ~~Configure Environment~~ ✅ ALREADY DONE

All credentials are already configured in `.env`:
- ✅ SUPABASE_URL
- ✅ SUPABASE_ANON_KEY
- ✅ SUPABASE_SERVICE_ROLE_KEY

### 4. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000/health/ready](http://localhost:3000/health/ready) to verify setup.

Expected response:
```json
{
  "status": "ready",
  "checks": {
    "database": true,
    "supabase": true
  }
}
```

## 📦 Available Scripts

```bash
npm run dev           # Start development server with hot reload
npm run build         # Build TypeScript to dist/
npm start             # Run production server
npm test              # Run all tests with coverage
npm run test:watch    # Run tests in watch mode
npm run lint          # Check code quality
npm run lint:fix      # Fix linting issues
npm run format        # Format code with Prettier
npm run typecheck     # Check TypeScript types
```

## 🏗️ Project Structure

```
loyalty-platform-peru/
├── src/
│   ├── config/           # Configuration (Supabase, etc.)
│   ├── domains/          # Domain models (TDD Phase 2)
│   ├── api/              # API routes (Phase 3)
│   └── utils/            # Utilities
├── tests/
│   ├── unit/             # Unit tests (125 tests - Phase 2)
│   ├── integration/      # Integration tests (60 tests - Phase 3)
│   └── e2e/              # E2E tests (5 tests - Phase 7)
├── scripts/
│   ├── schema.sql        # Database schema
│   ├── rls-policies.sql  # Row Level Security policies
│   └── SETUP.md          # Database setup instructions
└── .github/
    └── workflows/
        └── ci.yml        # CI/CD pipeline
```

## 🗄️ Database Schema

### Core Tables

- **businesses**: Business accounts (email, name, reward_structure)
- **customers**: Enrolled customers (phone, stamps_count, pass_url)
- **stamps**: Audit trail of all stamp events
- **campaigns**: WhatsApp campaign management
- **campaign_sends**: Individual message delivery tracking
- **referrals**: Customer referral tracking
- **outbox_events**: Transactional outbox pattern for data consistency

### Key Features

- **Optimistic Locking**: Version column prevents concurrent update conflicts
- **Idempotency**: Prevents duplicate stamp operations
- **Transactional Outbox**: Single DB transaction + async worker processing
- **Stored Procedure**: `add_stamp_with_outbox()` for atomic stamp operations
- **RLS Policies**: Business owners can only access their own data

## 🧪 Testing Strategy

Following TDD methodology with Test Pyramid:

- **70% Unit Tests** (185 tests): Domain logic, business rules
- **20% Integration Tests** (80 tests): API endpoints, database operations
- **10% E2E Tests** (5 tests): Critical user flows

Coverage targets:
- Global: >80%
- Domain logic: >90%

## 📊 Technology Stack

- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL 15 (via Supabase)
- **Auth & Storage**: Supabase (Auth, Storage, Realtime)
- **Testing**: Jest, Playwright (E2E)
- **Queue**: Bull (Redis-backed)
- **Validation**: Zod
- **Deployment**: Render (API + Workers), Vercel (Frontend)

## 🔐 Security

- Row Level Security (RLS) enforced on all tables
- JWT authentication via Supabase Auth
- Service role key for backend operations
- Input validation with Zod schemas
- Rate limiting (Phase 9)
- Security headers (Phase 9)

## 📈 Next Steps (Phase 2)

Follow [IMPLEMENTATION-CHECKLIST.md](IMPLEMENTATION-CHECKLIST.md) for detailed task breakdown.

**Phase 2: Domain Models with TDD** (Days 8-10)
- [ ] Implement Business domain with 25 unit tests
- [ ] Implement Customer domain with 25 unit tests
- [ ] Implement Loyalty domain with 25 unit tests
- [ ] Implement Campaign domain with 25 unit tests
- [ ] Implement Analytics domain with 15 unit tests
- [ ] Implement Referral domain with 10 unit tests

Red → Green → Refactor cycle for all tests.

## 📖 Documentation

- [ARCHITECTURE.md](ARCHITECTURE.md): System design and technical decisions
- [IMPLEMENTATION-PLAN.md](IMPLEMENTATION-PLAN.md): Comprehensive 10-week roadmap
- [IMPLEMENTATION-CHECKLIST.md](IMPLEMENTATION-CHECKLIST.md): Phase-by-phase checklist
- [scripts/SETUP.md](scripts/SETUP.md): Database setup instructions

## 🎯 Growth Projections

- **Year 1**: 105 businesses, 31.5K customers
- **Year 3**: 2,000 businesses, 600K customers
- **Peak Load**: 27,000 stamps/day, 8,150 WhatsApp messages/day

## 🤝 Contributing

This is a YC-grade production system. Follow TDD methodology and maintain >80% test coverage.

## 📄 License

MIT
