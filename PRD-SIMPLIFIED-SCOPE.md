# PRD Scope Simplification Summary

**Date**: January 2025
**Status**: APPROVED - Simplified MVP
**Previous Version**: PRD-AI-Loyalty-Platform-Peru.md (Full AI/Yape scope)

---

## ⚠️ CRITICAL SCOPE CHANGES

### ❌ OUT OF SCOPE (V1)

1. **Yape/PLIN Payment Integration**
   - Reason: Complex partnership dependency, API access uncertain
   - Defer to: Phase 2 (after pilot validation)
   - Impact: Manual stamping via iOS app sufficient for MVP

2. **AI/ML Predictive Analysis**
   - Reason: Requires training data, increases complexity and cost
   - Defer to: Phase 2 (after collecting 3-6 months pilot data)
   - Impact: Rule-based automation sufficient for retention (Stamp Me proves 15-30% lift without AI)

### ✅ IN SCOPE (V1 - Simplified MVP)

1. **Apple Wallet Digital Punch Cards**
   - Generate .pkpass files for Apple Wallet
   - Customizable design (logo, colors, reward tiers)
   - QR code enrollment
   - Card updates via API (add stamp, trigger notifications)

2. **Rule-Based Automated Retention Alerts**
   - Configurable inactivity threshold (e.g., 14 days)
   - WhatsApp automated campaigns with variables
   - Dynamic discount code generation (e.g., "MARIA15")
   - Template library (10+ pre-written Spanish messages)

3. **Admin Dashboard with Retention Metrics**
   - Active customer count
   - 3-month retention rate (cohort-based)
   - At-risk customer list (sorted by days inactive)
   - Campaign analytics (open/redemption rates)
   - Retention trend chart

4. **Everything Else Not Explicitly Removed**
   - iOS stamper app (scan QR, manual entry, offline mode)
   - WhatsApp Business API integration (Twilio)
   - Setup wizard (5-minute onboarding)
   - Customer visit tracking
   - Campaign scheduling and personalization

---

## 📊 SIMPLIFIED FEATURE BACKLOG

### MUST HAVE (MVP - Core Retention)

**Epic 1: Digital Loyalty Cards** (6 features)
- Apple Wallet .pkpass generation
- Customizable design (logo, colors, reward text)
- Multi-tier rewards (5 stamps, 10 stamps, etc.)
- QR code enrollment
- Card update API
- Reward redemption tracking

**Epic 2: Visit Tracking & At-Risk Detection** (6 features)
- Customer visit logging
- Visit frequency calculation
- Rule-based at-risk detection (2x typical frequency threshold)
- At-risk dashboard list
- Configurable inactivity threshold
- Manual override

**Epic 3: Automated WhatsApp Campaigns** (6 features)
- Message composer with template library
- Automated inactive customer trigger
- Personalized variables (name, stamps, discount codes)
- Dynamic discount code generation
- Campaign scheduling
- Campaign analytics (Twilio webhooks)

**Epic 4: Admin Dashboard** (6 features)
- Active customer count
- 3-month retention rate
- At-risk customer list (exportable CSV)
- Campaign history
- Retention trend chart
- Digital card adoption rate

### SHOULD HAVE (Phase 1 - Automation + Polish)

**Epic 5: Pre-Built Templates** (6 templates)
- Birthday campaign
- Inactivity campaigns (7, 14, 30 days)
- Milestone celebration
- First-visit welcome
- Reward proximity reminder
- Re-engagement (30+ days)

**Epic 6: Setup Wizard** (6 features)
- 5-minute setup flow
- Pre-configured templates by business type
- Real-time design preview
- Test enrollment
- First campaign tutorial
- Video tutorials library

**Epic 7: iOS Stamper App** (6 features)
- Scan QR from Apple Wallet
- Manual phone entry
- Stamp validation (prevent duplicates)
- Reward redemption flow
- Offline mode
- Real-time dashboard sync

**Epic 8: Advanced Analytics** (6 features)
- Cohort retention curves
- Customer segmentation view
- Campaign A/B testing
- Revenue impact tracking
- CSV exports
- Industry benchmarking

### COULD HAVE (Phase 2 - Nice to Have)

**Epic 9: Simple Referral Tracking** (6 features)
- Referral link generation
- WhatsApp share button
- Attribution tracking
- Referrer bonus stamp
- Referee welcome discount
- Referral dashboard

**Epic 10: Google Wallet Support** (4 features)
- Google Wallet pass generation
- Dual wallet support
- Android stamper app
- Cross-platform QR

**Epic 11: Multi-Location** (5 features)
- Location management
- Unified customer view
- Location-specific campaigns
- Location analytics
- Staff permissions

**Epic 12: VIP Segmentation** (4 features)
- Manual VIP tagging
- VIP-only campaigns
- VIP dashboard
- Auto-VIP threshold

### WON'T HAVE (Deferred)

- ❌ AI/ML churn prediction
- ❌ Yape/PLIN payment integration
- ❌ AI discount optimization
- ❌ Natural language segmentation
- ❌ Gamification (badges, leaderboards)
- ❌ Coalition programs
- ❌ POS system integration
- ❌ Predictive analytics/forecasting
- ❌ White-label platform
- ❌ International expansion

---

## 🎯 UPDATED SUCCESS METRICS

### Primary North Star (Simplified)
- **3-Month Retention Rate Improvement**: +15-25 percentage points
- **Baseline**: 30-40% (physical cards or no program)
- **Target**: 50-65% (digital cards + automated campaigns)

### Secondary KPIs

| Metric | Baseline | Target (V1) | Measurement |
|--------|----------|-------------|-------------|
| **3-Month Retention** | 30-40% | 50-65% | Cohort analysis |
| **Repeat Rate (30-day)** | 35-45% | 55-65% | 2+ purchases |
| **Digital Card Activation** | 0% | >40% | Apple Wallet adds |
| **Campaign Open Rate** | N/A | >30% | WhatsApp delivered/opened |
| **Campaign Redemption** | N/A | >10% | Discount code usage |
| **Time-to-Value** | N/A | <14 days | First campaign sent |

---

## 💰 UPDATED BUDGET (Year 1 - Simplified)

**Team** (Reduced from 5 to 3.5 FTE):
- 1 PM (you)
- 2 full-stack developers (Python/React/Swift)
- 0.5 designer (part-time, contract)
- 0.5 customer success (part-time Spanish support)

**Infrastructure** (Reduced):
- Cloud hosting (AWS/GCP): $3K-5K
- Twilio WhatsApp API: $1K-2K
- Apple Developer account: $99
- Tools/services: $500-1K
- **Total**: $5K-8K

**Sales/Marketing**:
- Pilot acquisition: $5K
- Basic website/landing: $3K
- Case study production: $2K
- **Total**: $10K-15K

**GRAND TOTAL: $95K-143K** (vs. $180K-245K original)
- **40% cost reduction** by removing AI/ML engineer and complex integrations

---

## 📅 UPDATED ROADMAP

### MVP (Months 1-2): Core Digital Cards + Manual Campaigns

**Goal**: Launch with 10 pilot businesses, validate retention lift without AI

**Features**:
- ✅ Apple Wallet punch cards
- ✅ Manual WhatsApp campaigns (template-based)
- ✅ Rule-based at-risk detection (14-day threshold)
- ✅ Basic dashboard (retention rate, at-risk list)
- ✅ iOS stamper app (QR scan, manual entry)

**Success Criteria**:
- 10 businesses onboarded
- 30+ customers enrolled per business
- >40% digital card activation rate
- First retention measurement (any improvement = success)
- <5 min setup time validated

**Dependencies**:
- WhatsApp Business API approval (Twilio - Month 1)
- Apple Developer account setup
- Basic cloud infrastructure

---

### Phase 1 (Months 3-4): Automation + Templates

**Goal**: Activate automated campaigns, reduce owner time to 30 min/week

**Features**:
- ✅ Automated campaign triggers (birthday, inactivity, milestone)
- ✅ Pre-built template library (10+ Spanish templates)
- ✅ Dynamic discount code generation
- ✅ Campaign analytics (open/redemption tracking)
- ✅ Setup wizard (5-minute onboarding)

**Success Criteria**:
- >30% WhatsApp campaign open rate
- >10% campaign redemption rate
- Automated campaigns running (≥3 types per business)
- 50-65% retention rate achieved (vs. 30-40% baseline)

**Dependencies**:
- Twilio webhook integration for analytics
- Template testing and translation

---

### Phase 2 (Months 5-6): Scale + Polish

**Goal**: Expand from 10 to 50-100 businesses, add phase 1 features

**Features**:
- ✅ Google Wallet support (expand beyond iPhone)
- ✅ Android stamper app
- ✅ Simple referral tracking
- ✅ Multi-location support (basic)
- ✅ Advanced analytics (cohort curves, exports)

**Success Criteria**:
- 50-100 total businesses
- +20 percentage point retention improvement validated
- NPS >50 (would recommend)
- <5% business churn rate
- Case studies published (5+ testimonials)

**Defer to Phase 3** (Months 7-12):
- AI/ML churn prediction (with 6+ months data)
- Yape/PLIN integration (if partnership secured)
- AI discount optimization
- POS system integrations

---

## 🔑 KEY COMPETITIVE ADVANTAGES (Without AI/Yape)

1. **WhatsApp-Native Automation** (Loopy Loyalty doesn't have this)
2. **Spanish-First for Peru Market** (no competitors focus on Peru)
3. **Rule-Based Simplicity** (faster to market, lower risk than AI)
4. **Affordable Pricing** ($50-75/mo vs. $500+ enterprise)
5. **Apple Wallet Integration** (no physical card loss)

---

## ⚠️ UPDATED RISKS

### Risk #1: WhatsApp Engagement ⚠️ HIGH
- **Target**: >30% open rate (vs. 40% with AI personalization)
- **Mitigation**: A/B test templates, limit frequency, use variables

### Risk #2: Apple Wallet Adoption ⚠️ MEDIUM
- **Target**: >40% digital adoption
- **Mitigation**: Hybrid physical+digital, target iPhone neighborhoods, staff training

### Risk #3: Rule-Based Insufficiency ⚠️ MEDIUM
- **Risk**: Simple triggers too generic
- **Mitigation**: Flexible config, template variety, Phase 2 AI layer

### Risk #4: Competitive Response 🔴 HIGH
- **Risk**: Loopy adds WhatsApp + Spanish
- **Mitigation**: Speed to market, Peru brand, relationship moat

### Risk #5: Business Adoption Friction ⚠️ MEDIUM
- **Mitigation**: 5-min wizard, WhatsApp support, in-person pilot setup

---

## ✅ APPROVAL CHECKLIST

- [x] Removed Yape/PLIN integration from MVP
- [x] Removed AI/ML features from MVP
- [x] Focused on Apple Wallet (defer Google Wallet to Phase 1)
- [x] Rule-based automation only (no predictive models)
- [x] Simplified dashboard (core retention metrics)
- [x] Updated budget ($95K-143K vs. $180K-245K)
- [x] Updated metrics (50-65% retention vs. 75%)
- [x] Updated roadmap (MVP = 2 months, not dependent on partnerships)

---

## 📝 NEXT IMMEDIATE ACTIONS

**Week 1-2**:
1. ✅ Apply for Twilio WhatsApp Business API
2. ✅ Set up Apple Developer account
3. ✅ Recruit 20 pilot prospects (target 10 sign-ups)

**Month 1**:
1. ✅ Engineering Sprint 1: Apple Wallet .pkpass generation, QR enrollment
2. ✅ Engineering Sprint 2: WhatsApp composer, rule-based at-risk detection
3. ✅ Design: Dashboard wireframes, punch card templates

**Month 2**:
1. ✅ Pilot onboarding (10 businesses, white-glove)
2. ✅ First campaigns launched
3. ✅ Data collection for retention validation

---

**Document Owner**: Product Team
**Approved By**: [Pending]
**Date**: January 2025

**This simplified scope enables faster launch, lower risk, and validates core retention value prop before investing in AI/Yape complexity.**
