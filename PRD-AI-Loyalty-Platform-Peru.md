# Product Requirements Document
# Digital Loyalty Platform for Peru SMBs

**Document Type**: Product Requirements Document (Amazon PR-FAQ Format)
**Product Name**: [To be determined - placeholder: "LoyalPe"]
**Target Market**: Coffee shops, salons, small retail (Lima, Peru)
**Version**: 1.0 (MVP Scope - Simplified)
**Last Updated**: January 2025
**Document Owner**: Product Team

**SCOPE CHANGES FROM ORIGINAL PRD:**
- ❌ **OUT OF SCOPE (V1)**: Yape/PLIN payment integration (deferred to Phase 2)
- ❌ **OUT OF SCOPE (V1)**: AI/ML predictive analysis (deferred to Phase 2)
- ✅ **IN SCOPE (V1)**: Apple Wallet digital punch cards
- ✅ **IN SCOPE (V1)**: Rule-based automated retention alerts (not AI, but systematic)
- ✅ **IN SCOPE (V1)**: Admin dashboard with retention metrics
- ✅ **IN SCOPE (V1)**: WhatsApp campaign automation (template-based, variable substitution)

---

## PRESS RELEASE

**FOR IMMEDIATE RELEASE**

### Lima's Coffee Shops Get Digital Loyalty Platform That Stops Customer Loss

**Lima, Peru – January 2025** – Today we announce a digital loyalty platform specifically designed for Peru's small businesses, solving the critical problem of customer churn that costs coffee shops $18,000-36,000 per year in lost revenue.

### The Problem

Small coffee shop owners in Peru face a crisis: **60-70% of their customers churn within the first 3 months**. Despite working hard to acquire new customers through expensive Instagram ads ($10-15 per customer), these businesses have no systematic way to identify who's leaving, why they're leaving, or how to prevent it.

Physical punch cards get lost 30-40% of the time. Instagram posts reach only 2-5% of followers. And business owners spend 8 hours per week manually creating campaigns while burning out from 60-80 hour work weeks.

Meanwhile, chain coffee shops like Starbucks deploy sophisticated digital loyalty programs that small businesses can't afford—existing solutions cost $500-2,000 per month or lack automation entirely.

### The Solution

Our platform delivers automated retention at small business pricing ($50-75/month), specifically built for the Peru market with WhatsApp-first automation and Apple Wallet integration.

The system automatically:
- **Tracks customer visit patterns** and identifies customers who haven't visited in their usual timeframe
- **Sends automated WhatsApp campaigns** when customers become inactive (rule-based triggers)
- **Generates personalized discount codes** for retention campaigns (e.g., "MARIA15" for 15% off)
- **Manages digital punch cards** in Apple Wallet (no physical cards to lose, no app download required)

Business owners spend just **30 minutes per week** (vs. 8 hours) configuring automated campaigns, while the platform runs retention on autopilot.

### Key Benefits

**For Coffee Shop Owners:**
- **50-75% retention improvement** (from 30-40% baseline to 50-65% with automated campaigns)
- **70% time savings** on marketing operations (30 min/week instead of 8 hours)
- **Automated customer re-engagement** without manual work (set rules once, runs continuously)
- **Zero physical card loss** (digital cards can't be forgotten at home or lost)
- **Track retention metrics** in real-time dashboard (see what's working)

**For Their Customers:**
- Digital loyalty cards in Apple Wallet (no app download, always accessible)
- Personalized WhatsApp offers when they're at risk of churning
- Clear progress toward rewards (see stamps in wallet)
- Simple redemption (show digital card, get reward)

### Availability

The platform launches with a pilot program for 10 Lima coffee shops in Q1 2025, expanding to 100 businesses by end of Year 1. Setup takes 5 minutes with simple rule configuration. Support is provided via WhatsApp in Spanish.

### Quote from Executive

*"We watched our mother's coffee shop lose customers to Starbucks not because of better coffee, but because of better technology. Small businesses in Peru deserve the same digital tools that enterprise chains use, but at pricing they can actually afford. That's why we're bringing automated retention and digital loyalty cards to the SMB market at $50-75/month instead of $500+."*

— [Founder Name], CEO

### Quote from Customer (Pilot Testimonial - Projected)

*"Before this platform, I was working 70-hour weeks and still watching customers disappear. Now, the system automatically sends WhatsApp messages when customers haven't visited in 10 days. My retention went from 35% to 55% in two months, and I got back 5 hours per week. This pays for itself in the first week."*

— Ana Martínez, Owner, Café Luna, Miraflores

### Learn More

Visit [website] or WhatsApp +51 [number] for pilot program enrollment.

---

## INTERNAL FAQ

### 1. What specific customer problem does this solve?

**Primary Problem (Job #1 - WTP Score: 900/1000):**
Coffee shop owners are losing 60-70% of customers within 3 months, resulting in $18,000-36,000 per year in preventable revenue loss. They have:
- No systematic way to identify "slipping away" customers before they churn
- No automated retention campaigns (rely on random Instagram posts with 2-5% reach)
- No customer data infrastructure (cash transactions = no tracking)
- Physical punch cards with 30-40% loss/abandonment rate

**Secondary Problem (Job #2 - WTP Score: 720/1000):**
Owner burnout from spending 8 hours/week on manual marketing while wearing all operational hats (60-80 hour work weeks). Marketing is inconsistent, poorly timed, and one-size-fits-all.

**Tertiary Problem (Job #3 - WTP Score: 448/1000):**
High customer acquisition costs ($10-15 per customer via Instagram ads) with no systematic referral program, limiting growth for businesses that can't compete with chain coffee shop marketing budgets.

**Emotional Drivers:**
- Loss aversion (watching customers disappear after hard work to acquire them)
- Burnout (overwhelming operational demands)
- Financial stress (expensive acquisition with unpredictable retention)
- Competitive anxiety (chains have better tech, feel left behind)

### 2. Why is now the right time to build this?

**Market Timing:**
- **SME Digitalization Push**: Government National Digital Economy Platform targeting SME digital transformation by 2030
- **E-commerce Growth**: Peru market growing $25B (2023) → $63B (2026) at 35% CAGR
- **Digital Wallet Adoption**: Apple Wallet penetration growing with iPhone adoption in Peru's middle class
- **Physical Card Fatigue**: 30-40% loss rate driving demand for digital alternatives
- **WhatsApp Dominance**: 57% social commerce adoption makes WhatsApp campaigns natural fit

**Competitive Gap:**
- No existing platforms focus on Peru market with Spanish-first, WhatsApp-native approach
- Loopy Loyalty ($25/mo) lacks automation sophistication and Spanish localization
- PassKit/Thanx ($500+/mo) too expensive for SMBs, complex enterprise features
- Physical punch card providers (e.g., printing companies) offer no digital tracking

**Technology Readiness:**
- WhatsApp Business API publicly available for automated campaigns
- Apple Wallet API mature and well-documented
- Cloud infrastructure (AWS/GCP) accessible for bootstrapped startups
- Rule-based automation doesn't require AI/ML complexity

### 3. How do we know customers want this?

**Quantitative Evidence:**
- **67% of consumers** spend more at retailers with loyalty programs (global benchmark)
- **71% expect personalized interactions** (not one-size-fits-all campaigns)
- **Stamp Me benchmark**: 15-30% average retention increase with digital punch cards
- **Peru-specific**: 57% buy via social media (WhatsApp dominant), 25% transactions via Yape/PLIN
- **Market size**: 2.5M SMEs in Peru, only 8.1% digitally active (huge greenfield)

**Jobs-to-be-Done Validation:**
- **Job #1** (Stop losing customers): WTP $150-300/month based on $18K-36K annual pain
- **Job #2** (Marketing autopilot): WTP $100-200/month based on burnout relief
- **Job #3** (Cheap acquisition): WTP $75-150/month based on $6K-12K wasted ad spend

**Pricing Validation:**
- Combined top 3 jobs WTP: $325-650/month
- Our pricing: $75/month (11-20% of pain cost, healthy SaaS value capture)
- Value ratio: 4-9x perceived value vs. price

**Recommended Validation:**
- Customer discovery interviews with 20-30 Lima coffee shops (pending)
- Pilot with 10 businesses to validate retention lift claims
- Yape API integration feasibility assessment with BCP merchant team

### 4. What is the Total Addressable Market (TAM)?

**Peru SME Market:**
- **Total SMEs**: 2.5M businesses
- **Digitally Active**: 8.1% = 202,500 businesses
- **Serviceable Market**: 10% (coffee shops, salons, small retail) = 20,250 businesses
- **Target Year 1**: 0.5% market share = 100 businesses

**Revenue Projections:**
- **Year 1 ARR**: 100 businesses × $900/year ($75/mo) = **$90,000**
- **Year 3 Target**: 1,000 businesses = **$900,000 ARR**
- **Market Ceiling**: 5% of serviceable market (1,012 businesses) = **$911,000 ARR**

**LATAM Expansion Potential:**
- LATAM loyalty market: $4.35B (2024) → $8.7B (2029) at 14.4% CAGR
- Peru growth: 17% annually (2025)
- Similar pain points in Colombia, Chile, Mexico (different payment ecosystems)

**Customer Lifetime Value:**
- **Net value generated per customer**: $43,000/year (retention + frequency + referrals + optimization + time)
- **Platform cost**: $900/year
- **Customer ROI**: 4,777%
- **Our capture**: ~2% of value created (healthy ratio for long-term retention)

### 5. What resources and capabilities do we need?

**Critical Path Dependencies:**
1. **WhatsApp Business API** 🔴 CRITICAL
   - Apply for WhatsApp Business API approval (Meta Business Manager or Twilio)
   - **Risk**: Campaign open rates drop from 40% (WhatsApp) to 15% (email/SMS) without it
   - **Mitigation**: Use Twilio WhatsApp Business API (faster approval than Meta direct)

2. **Apple Wallet Pass Generation** 🔴 CRITICAL
   - Implement .pkpass file generation (PassKit library or equivalent)
   - Apple Developer account for pass signing certificates
   - **Risk**: Technical complexity in pass generation and updates
   - **Mitigation**: Use established libraries (passkit-generator for Node.js)

3. **Rule Engine for Automation** 🟡 HIGH
   - Simple rule engine for campaign triggers (if-then logic)
   - Customer visit tracking and pattern analysis (last visit date, typical frequency)
   - **Risk**: Rule complexity creep, over-engineering
   - **Mitigation**: Start with 3-4 simple rules (inactivity, birthday, first visit, milestone)

**Team Requirements:**
- **Product**: 1 PM (you)
- **Engineering**: 2 full-stack developers (Python/TypeScript, React, Apple Wallet APIs)
- **Design**: 1 product designer (UX for dashboard + wallet pass templates)
- **Customer Success**: 1 bilingual support (Spanish/English, WhatsApp-based - can start part-time)

**Technology Stack (Recommended):**
- **Backend**: Python (FastAPI or Django) for rule engine simplicity
- **Frontend**: React/TypeScript (business dashboard)
- **Mobile**: React Native or native Swift (stamper app for iOS)
- **Database**: PostgreSQL (customer data, visits, campaigns)
- **Messaging**: Twilio WhatsApp Business API (faster approval than Meta)
- **Wallet Integration**: passkit-generator (Node.js) or pypasskit (Python) for Apple Wallet .pkpass files
- **Infrastructure**: AWS or GCP (start with single region - Lima)

**Budget Estimate (Year 1 - Simplified MVP):**
- **Team**: $80K-120K (2 developers + part-time designer/support in Peru)
- **Infrastructure**: $5K-8K (cloud, Twilio, Apple Developer account)
- **Sales/Marketing**: $10K-15K (pilot acquisition, basic website)
- **Total**: $95K-143K for MVP through 50-100 customers (reduced scope = lower burn)

### 6. What are the main technical and business risks?

**Risk #1: WhatsApp Campaign Engagement** ⚠️ HIGH IMPACT
- **Risk**: WhatsApp campaigns fail to achieve >30% open rate (lower than 40% target without AI personalization)
- **Impact**: Retention campaigns less effective, slower retention improvement
- **Mitigation**:
  - Test campaign templates in pilot (A/B test messaging, timing, frequency)
  - Fallback to SMS if WhatsApp Business API unavailable
  - Limit campaign frequency to prevent "spam" perception (max 2/week per customer)
  - Use personalization variables (customer name, favorite item, stamps remaining)
- **Validation**: Run 50 campaigns across pilot, measure open/click rates

**Risk #2: Business Owner Adoption Friction** ⚠️ MEDIUM IMPACT
- **Risk**: Low digital literacy leads to setup abandonment or low platform usage
- **Impact**: High churn, poor word-of-mouth, slow growth
- **Mitigation**:
  - 5-minute setup wizard (simple Q&A, pre-configured templates)
  - WhatsApp onboarding support (not email—owners live on WhatsApp)
  - In-person setup for pilot customers (white-glove service)
  - Video tutorials in Spanish (3-5 min max, task-focused)
- **Validation**: Pilot onboarding flow, measure time-to-first-campaign, track activation rates

**Risk #3: Apple Wallet Adoption by Customers** ⚠️ MEDIUM IMPACT
- **Risk**: Customers don't adopt digital cards, prefer physical cards or don't have iPhones
- **Impact**: Low digital card activation rates, reduced value prop
- **Mitigation**:
  - Support both physical + digital cards during transition (hybrid model)
  - Target iPhone-heavy neighborhoods first (Miraflores, San Isidro, Barranco)
  - In-store QR code signage ("Add to Apple Wallet" posters)
  - Staff training on how to help customers add cards
- **Validation**: Track digital vs. physical card activation rates in pilot (target: >40% digital adoption)

**Risk #4: Competitive Response** 🔴 HIGH IMPACT
- **Risk**: Loopy Loyalty adds Spanish localization and WhatsApp integration after seeing Peru traction
- **Impact**: First-mover advantage eroded, commoditization pressure on features
- **Mitigation**:
  - Speed to market (launch pilot Q1 2025, build Peru brand fast)
  - Peru-specific playbook (local business context, cultural nuances in messaging)
  - Relationship moat (deep customer success, WhatsApp-based support)
  - Consider exclusive partnerships with local POS providers for distribution
- **Validation**: Monitor competitor announcements, build defensible local brand

**Risk #5: Rule-Based Automation Insufficiency** ⚠️ MEDIUM IMPACT
- **Risk**: Simple rule-based triggers (e.g., "14 days inactive") too simplistic, low effectiveness
- **Impact**: Campaigns feel generic, lower retention impact than projected
- **Mitigation**:
  - Offer flexible rule configuration (business owners adjust thresholds per their customer base)
  - Template library with proven message variations (test in pilot)
  - Collect feedback on "why didn't this work" to iterate rules
  - Phase 2: Add ML layer for smarter triggers based on pilot learnings
- **Validation**: Measure campaign redemption rates (target: >10% redemption on inactivity campaigns)

**Risk #6: Regulatory Compliance** ⚠️ LOW-MEDIUM IMPACT
- **Risk**: SBS data protection or consumer protection regulations restrict campaign automation
- **Impact**: Feature restrictions, compliance costs, delays
- **Mitigation**:
  - Implement opt-in consent for WhatsApp campaigns (GDPR-inspired)
  - Encrypted customer data storage (AES-256)
  - Clear privacy policies in Spanish
  - Legal consultation before pilot launch (verify compliance)
- **Validation**: Legal review completed Month 1, adjust features as needed

### 7. How do we measure success?

**Primary North Star Metric:**
- **Customer Retention Rate Improvement**: +15-25 percentage points within 3-6 months
  - **Baseline**: 30-40% (3-month retention with physical cards or no program)
  - **Target**: 50-65% (3-month retention with digital cards + automated campaigns)
  - **Measurement**: Cohort analysis of pilot businesses

**Secondary KPIs (Platform Performance):**

| Metric | Baseline | Target | Measurement Method |
|--------|----------|--------|-------------------|
| **3-Month Retention Rate** | 30-40% | 50-65% | (End customers - new) / Start × 100 |
| **Repeat Purchase Rate (30 days)** | 35-45% | 55-65% | Customers with 2+ purchases / Total × 100 |
| **Digital Card Activation Rate** | 0% | >40% | Customers with Apple Wallet card / Total enrolled |
| **Campaign Open Rate** | N/A (no campaigns) | >30% | WhatsApp messages opened / Sent |
| **Campaign Redemption Rate** | N/A | >10% | Customers who redeem discount / Contacted |
| **Time-to-Value** | N/A | <14 days | Days from signup to first automated campaign sent |

**Business Impact Metrics:**

| Metric | Target Year 1 | How Measured |
|--------|---------------|--------------|
| **Monthly Active Businesses** | 100 | Businesses sending campaigns monthly |
| **Net Revenue Retention (NRR)** | 120% | (Revenue t1 - churn + expansion) / Revenue t0 |
| **Customer Churn Rate** | <5%/month | Businesses who cancel / Total active |
| **Customer Acquisition Cost (CAC)** | <$500 | Sales/marketing spend / New customers |
| **LTV:CAC Ratio** | >3:1 | ($900 ARPU × avg lifetime months) / CAC |

**Leading Indicators (Early Signals):**
- **Week 1**: Business completes setup wizard successfully
- **Week 2**: First automated campaign sent
- **Week 3**: First customer receives WhatsApp retention offer
- **Week 4**: Measurable retention improvement vs. baseline (even if small)
- **Month 2**: Business owner reports time savings
- **Month 3**: First referrals tracked and attributed
- **Month 6**: +40% LTV achieved (success), business renews subscription

**Qualitative Success Metrics:**
- Net Promoter Score (NPS) >50 (world-class)
- Support ticket volume <2 per business/month
- Business owner testimonials for case studies (5+ detailed success stories)
- Word-of-mouth referrals from business owners to other owners

---

## EXTERNAL FAQ

### 1. How does this compare to existing loyalty platforms like Loopy Loyalty or Stamp Me?

**vs. Loopy Loyalty ($25/month):**

| Feature | Our Platform | Loopy Loyalty |
|---------|-------------|---------------|
| **Digital Punch Cards** | ✅ Apple Wallet | ✅ Apple/Google Wallet |
| **Automated Campaigns** | ✅ Rule-based WhatsApp automation | ⚠️ Manual push notifications |
| **WhatsApp Integration** | ✅ Native (Twilio Business API) | ❌ No WhatsApp support |
| **Campaign Variables** | ✅ Discount codes, personalization | ⚠️ Basic variables only |
| **Spanish Localization** | ✅ Full Spanish UI + support | ⚠️ Limited Spanish |
| **Retention Dashboard** | ✅ Cohort tracking, metrics | ⚠️ Basic analytics |
| **Pricing** | $50-75/mo | $25/mo |

**Our Advantage**: WhatsApp automation + Spanish-first + Peru market focus at 2-3x price delivers stronger retention impact for Peru SMBs.

**vs. Stamp Me (<$50/month):**

| Feature | Our Platform | Stamp Me |
|---------|-------------|----------|
| **Retention Lift** | 50-65% target (vs. 30-40% baseline) | 15-30% proven benchmark |
| **Automated Campaigns** | ✅ Rule-based WhatsApp triggers | ⚠️ Basic notifications |
| **Peru Market** | ✅ WhatsApp, Spanish, local focus | ❌ Not localized |
| **Coalition Programs** | Phase 2 | ✅ Available now |

**Our Advantage**: Higher retention impact through automation, better Peru market fit. Stamp Me wins on coalition programs (we defer to Phase 2).

**vs. PassKit/Thanx (Enterprise: $500-2,000/month):**

| Feature | Our Platform | PassKit/Thanx |
|---------|-------------|---------------|
| **Automated Campaigns** | ✅ Rule-based triggers | ✅ Advanced automation |
| **Advanced Segmentation** | Phase 2 | ✅ Yes (Thanx) |
| **Predictive Analytics** | Phase 3 (AI) | ✅ Yes |
| **Target Market** | SMBs (1-3 locations) | Enterprise (10+ locations) |
| **Pricing** | $50-75/mo | $500-2,000/mo |
| **Setup Complexity** | 5 minutes | Complex (requires tech team) |

**Our Advantage**: We deliver essential automation features at 5-10% of enterprise pricing, optimized for SMB workflows (not enterprise complexity).

**Unique Positioning**: "Loopy Loyalty ease-of-use + enterprise-grade automation + Peru market fit (WhatsApp, Spanish) at SMB pricing."

### 2. Why would coffee shops choose this over alternatives?

**Decision Criteria Matrix:**

| Priority | What They Need | Our Solution | Alternatives Fall Short |
|----------|----------------|--------------|------------------------|
| **#1: Stop Churn** | Identify + prevent customer loss | Rule-based detection of at-risk customers, automated WhatsApp campaigns | Loopy/Stamp Me = manual only, no automation |
| **#2: Save Time** | Marketing automation | 30 min/week vs. 8 hours (70% reduction) | Physical cards = manual, Instagram = constant posting |
| **#3: Lower CAC** | Referral engine | Phase 2: referral tracking | No platforms optimize referrals for WhatsApp (Peru's dominant channel) |
| **#4: Local Fit** | WhatsApp, Spanish | Native WhatsApp campaigns, Spanish support, Peru focus | Zero platforms WhatsApp-native, most English-first |
| **#5: Affordability** | <$100/month | $50-75/mo with automation | Enterprise automation ($500+) unaffordable, cheap options ($25) lack automation |

**Emotional Buying Triggers:**
- **Loss Aversion**: "Stop losing customers you worked hard to get" (Job #1 - highest WTP)
- **Burnout Relief**: "Marketing on autopilot in 30 min/week" (Job #2 - quality of life)
- **Financial Stress**: "35% of customers from referrals, not expensive ads" (Job #3 - ROI proof)
- **Status Anxiety**: "Technology as good as Starbucks, priced for small business" (Job #5 - competitive parity)

**Switching Barriers:**
- From physical cards: Zero switching cost (cards still work during transition)
- From Loopy/Stamp Me: Export customer data, migrate to our platform
- From nothing: Greenfield opportunity (81.9% of SMEs not digitally active)

### 3. What is the unique value proposition?

**One-Sentence Value Prop:**
*"We help Peru's coffee shops increase customer retention by 50-75% through automated WhatsApp campaigns and Apple Wallet digital punch cards—at 1/10th the cost of enterprise platforms."*

**Differentiation Triangle:**

```
        Automation
      (PassKit/Thanx)
              /\
             /  \
            /    \
           /      \
          /   US   \
         /          \
        /____________\
   SMB Pricing     Peru Market Fit
 (Loopy Loyalty)   (WhatsApp, Spanish)
```

**We're the ONLY platform at the intersection of all three:**
- **Automation**: Rule-based retention triggers, WhatsApp campaign automation
- **SMB Pricing**: $50-75/mo accessible to small businesses
- **Peru-First**: WhatsApp-native, Spanish, local business context

**Competitive Moats:**
1. **First-Mover**: No existing platform is WhatsApp-native for Peru loyalty market
2. **Network Effects**: More businesses = template library improvements = better campaigns
3. **Local Network Effects**: WhatsApp virality for referrals (57% social commerce)
4. **Peru Market Focus**: Spanish-first, local business understanding, Peru payment ecosystem knowledge

### 4. What do coffee shops need to adopt this successfully?

**Minimum Requirements:**
- ✅ Smartphone (iOS or Android) for stamper app
- ✅ Internet connection (Wi-Fi or mobile data)
- ✅ Customer base of 50+ regular customers
- ✅ Basic WhatsApp usage (most owners already use it daily)

**No Requirements:**
- ❌ POS system integration (nice-to-have, not required)
- ❌ Technical skills (5-minute guided setup)
- ❌ Marketing experience (pre-configured templates)
- ❌ Large budget (affordable at $50-75/mo)

**Onboarding Flow (5 minutes):**
1. **Sign up** via WhatsApp link (no website form)
2. **Answer 5 questions**: Business name, location, average transaction, current loyalty method, busy hours
3. **Auto-configure**: Punch card design, reward thresholds, campaign templates based on business type
4. **Download stamper app**: iOS or Android, log in
5. **First stamp test**: Owner stamps their own phone to verify
6. **First campaign**: System suggests "Welcome back inactive customers" campaign from templates, owner approves

**Success Enablers:**
- **WhatsApp support** in Spanish (not email tickets)
- **Video tutorials**: 2-3 minute clips on setup, stamping, campaigns
- **Template library**: Pre-written WhatsApp messages for common scenarios
- **Peer learning**: Connect pilot businesses for best practice sharing

**Adoption Risks to Mitigate:**
- **Fear of change**: Offer physical + digital cards in parallel during transition
- **Technical anxiety**: In-person setup for pilot customers (white-glove)
- **ROI skepticism**: 14-day free trial, no credit card required
- **Time constraints**: Emphasize "5-minute setup, then autopilot"

---

## FEATURE BACKLOG

Features prioritized by Jobs-to-be-Done Willingness to Pay (WTP) scores from problem-framing.md.

**SIMPLIFIED MVP SCOPE (V1 - No AI, No Yape)**

### MUST HAVE (MVP - Job #1: Stop Losing Customers | WTP 900)

**Epic 1: Digital Loyalty Cards**
- [ ] **F1.1**: Generate digital punch cards for Apple Wallet (.pkpass files)
- [ ] **F1.2**: Customizable card design (logo upload, color picker, reward text)
- [ ] **F1.3**: Multi-tier reward support (e.g., 5 stamps = S/10 off, 10 stamps = free item)
- [ ] **F1.4**: QR code generation for customer enrollment (scan to add to wallet)
- [ ] **F1.5**: Card update API (add stamp, update progress, trigger reward notification)
- [ ] **F1.6**: Reward redemption tracking (mark reward as redeemed, reset stamps)

**Epic 2: Customer Visit Tracking & At-Risk Detection**
- [ ] **F2.1**: Customer visit logging (timestamp, business location, transaction amount)
- [ ] **F2.2**: Visit frequency calculation (avg days between visits per customer)
- [ ] **F2.3**: Rule-based at-risk detection (hasn't visited in 2x their typical frequency)
- [ ] **F2.4**: "At-risk" customer dashboard list (sorted by days since last visit)
- [ ] **F2.5**: Configurable inactivity threshold (business owner sets "X days inactive = at-risk")
- [ ] **F2.6**: Manual override (business owner can mark customer as "not at-risk")

**Epic 3: Automated WhatsApp Campaigns**
- [ ] **F3.1**: WhatsApp message composer with template library (10+ pre-written Spanish templates)
- [ ] **F3.2**: Automated "inactive customer" trigger (configurable threshold, default 14 days)
- [ ] **F3.3**: Personalized variables ({{customer_name}}, {{days_since_visit}}, {{stamps_remaining}}, {{discount_code}})
- [ ] **F3.4**: Dynamic discount code generation (unique per campaign: "MARIA15" for 15% off)
- [ ] **F3.5**: Campaign scheduling (send now, specific date/time, recurring weekly/monthly)
- [ ] **F3.6**: Campaign analytics (sent, delivered, opened, clicked, redeemed - via Twilio webhooks)

**Epic 4: Business Owner Dashboard**
- [ ] **F4.1**: Active customer count (visited in last 90 days)
- [ ] **F4.2**: 3-month retention rate (cohort-based: customers from 6 months ago still active)
- [ ] **F4.3**: At-risk customer list (top 20, exportable to CSV)
- [ ] **F4.4**: Campaign history (last 10 campaigns with open/redemption rates)
- [ ] **F4.5**: Retention trend chart (monthly retention % over time)
- [ ] **F4.6**: Digital card adoption rate (% customers with Apple Wallet vs. physical only)

### SHOULD HAVE (Phase 1 - Job #2: Marketing Autopilot | WTP 720)

**Epic 5: Pre-Built Campaign Templates**
- [ ] **F5.1**: Birthday campaign template ("¡Feliz cumpleaños {{name}}! Toma S/10 off hoy: {{code}}")
- [ ] **F5.2**: Inactivity campaign (3 variations: 7 days, 14 days, 30 days inactive)
- [ ] **F5.3**: Milestone celebration ("¡10 visitas! Gracias por tu lealtad: {{code}}")
- [ ] **F5.4**: First-visit welcome ("Bienvenido {{name}}! Agregaste tu tarjeta digital")
- [ ] **F5.5**: Reward proximity reminder ("Solo {{stamps_remaining}} sellos más para tu café gratis!")
- [ ] **F5.6**: Re-engagement (30+ days: "Te extrañamos {{name}}, regresa con 20% off")

**Epic 6: Setup Wizard & Onboarding**
- [ ] **F6.1**: 5-minute setup wizard (business name, logo upload, reward structure, inactivity threshold)
- [ ] **F6.2**: Pre-configured campaign templates (auto-suggest based on business type: café, salón, retail)
- [ ] **F6.3**: Punch card design preview (real-time preview before publishing)
- [ ] **F6.4**: Test enrollment (owner scans QR, adds to own Apple Wallet to verify)
- [ ] **F6.5**: First campaign tutorial (walkthrough: select template, customize, schedule)
- [ ] **F6.6**: Video tutorials library (3-min videos: setup, stamping, campaigns, dashboard)

**Epic 7: Stamper App (iOS Mobile)**
- [ ] **F7.1**: iOS stamper app (scan customer QR from Apple Wallet)
- [ ] **F7.2**: Manual phone number entry (if customer doesn't have digital card yet)
- [ ] **F7.3**: Stamp validation (prevent duplicate stamps within 2 hours)
- [ ] **F7.4**: Reward redemption flow (scan card, mark reward redeemed, reset stamps)
- [ ] **F7.5**: Offline mode (queue stamps, sync when online - for poor connectivity)
- [ ] **F7.6**: Real-time dashboard sync (stamps appear in admin dashboard immediately)

**Epic 8: Advanced Dashboard Analytics**
- [ ] **F8.1**: Cohort retention analysis (Month 1 vs Month 2 vs Month 3 retention curves)
- [ ] **F8.2**: Customer segmentation view (VIPs, Regulars, At-Risk, New, Churned)
- [ ] **F8.3**: Campaign A/B testing (test 2 messages, auto-select winner)
- [ ] **F8.4**: Revenue impact tracking (estimate revenue from retention campaigns)
- [ ] **F8.5**: Export reports (CSV download: customer list, campaign history, retention data)
- [ ] **F8.6**: Benchmarking (compare retention vs. industry average for coffee shops)

### COULD HAVE (Phase 2 - Job #3: Cheap Acquisition | WTP 448)

**Epic 9: Referral Program**
- [ ] **F9.1**: Referral link generation (unique per customer)
- [ ] **F9.2**: WhatsApp share integration ("Share via WhatsApp" button)
- [ ] **F9.3**: Referral attribution tracking (referee ID → referrer ID)
- [ ] **F9.4**: Instant Yape reward for referrer (e.g., S/5 credit on next visit)
- [ ] **F9.5**: Referee welcome bonus (first-time visitor incentive)
- [ ] **F9.6**: Referral leaderboard (top referrers displayed in dashboard)

**Epic 10: AI Discount Optimization**
- [ ] **F10.1**: Historical campaign performance analysis (discount % vs. redemption rate)
- [ ] **F10.2**: AI recommendation engine ("Offer 15% instead of 20% for same redemption")
- [ ] **F10.3**: Margin impact calculator (show profit difference between discount options)
- [ ] **F10.4**: A/B test automation (test 15% vs. 20% on split customer segments)
- [ ] **F10.5**: Optimal discount dashboard (per customer segment: VIP, regular, new, at-risk)
- [ ] **F10.6**: Campaign ROI forecasting ("This campaign will generate S/500, 85% confidence")

**Epic 11: Advanced Segmentation**
- [ ] **F11.1**: VIP auto-segmentation (top 20% revenue generators)
- [ ] **F11.2**: Customer lifecycle stages (new, regular, at-risk, churned)
- [ ] **F11.3**: Custom segments ("Weekend morning regulars inactive 14+ days")
- [ ] **F11.4**: Natural language segment creation ("Show me customers who...")
- [ ] **F11.5**: Segment-specific campaigns (different offers for VIP vs. new)
- [ ] **F11.6**: Segment analytics (LTV, retention rate, visit frequency per segment)

**Epic 12: Gamification**
- [ ] **F12.1**: Customer badges (e.g., "5-visit streak", "Early bird regular")
- [ ] **F12.2**: Challenges (e.g., "Visit 3x this week, get bonus stamp")
- [ ] **F12.3**: Public leaderboard (top customers by stamps, opt-in)
- [ ] **F12.4**: Surprise rewards (random bonus for loyalty engagement)
- [ ] **F12.5**: Progress visualization (show customer how close to next reward)
- [ ] **F12.6**: Social sharing (customer can share badge achievement on social media)

### WON'T HAVE (V1 - Deferred to Future)

**Deferred Features (Not in 6-Month Roadmap):**
- [ ] **Custom Mobile App** (Wallet integration sufficient, no separate app needed)
- [ ] **PLIN Integration** (Yape priority, PLIN interoperability later)
- [ ] **Multi-Location Management** (focus single-location first, expand Phase 3)
- [ ] **Coalition Programs** (multi-business shared rewards, defer to Phase 3)
- [ ] **POS Integration** (manual stamping sufficient, API integration Phase 3)
- [ ] **Advanced Analytics** (predictive LTV, cohort retention curves, Phase 3)
- [ ] **White-Label Platform** (offer to agencies/consultants, Phase 4)
- [ ] **International Expansion** (Colombia, Chile, Mexico markets, Phase 4)

---

## SUCCESS METRICS

### Primary North Star Metric

**Customer Lifetime Value (LTV) Increase: +40% within 6 months**

**Definition**: Average revenue per customer over their lifetime as an active patron

**Baseline (Typical Coffee Shop):**
- Average customer: 8 visits before churning
- Average transaction: S/18 ($5 USD equivalent)
- Baseline LTV: **S/144** ($40 USD)

**Target (With Platform):**
- Retention improvement: 8 visits → 12 visits (+50%)
- Frequency improvement: 1x/month → 2x/month
- Upsell: S/18 → S/20 avg (AI recommendations)
- **Target LTV: S/237** ($66 USD) = **+65% increase**

**How Measured**:
- Cohort analysis comparing pre-platform vs. post-platform customers
- Track at 3 months, 6 months, 12 months
- Segment by business size, location, industry (coffee vs. salon vs. retail)

---

### Secondary KPIs

| Metric | Formula | Baseline | Target | How Measured |
|--------|---------|----------|--------|--------------|
| **Customer Retention Rate (3-month)** | (Customers at end - new) / Start × 100 | 30-40% | **75%** | Cohort tracking per business |
| **Repeat Purchase Rate (30-day)** | Customers with 2+ purchases / Total × 100 | 35-45% | **65%** | First-time visitor conversion |
| **Referral Rate** | New from referrals / Total new × 100 | 5-10% | **35%** | Referral attribution tracking |
| **Campaign ROI** | (Revenue - cost) / Cost × 100 | 100-150% | **400%** | WhatsApp campaign analytics |
| **Time-to-Value (TTV)** | Days from signup to retention improvement | N/A | **<14 days** | First measurable retention lift |
| **AI Recommendation Acceptance** | Owner accepts AI suggestion / Total suggestions | N/A | **>60%** | Dashboard interaction tracking |
| **Customer Engagement Score** | (Stamps + campaigns opened + referrals) / Customers | N/A | **8+ actions/mo** | Platform activity tracking |

---

### Business Impact Metrics (Per Coffee Shop Customer)

| Value Layer | Mechanism | Annual Value | Source |
|-------------|-----------|--------------|--------|
| **Retention Value** | Prevent 40% churn (120 customers saved @ S/144 LTV) | S/17,280 ($4,800) | problem-framing.md Layer 1 |
| **Frequency Value** | 2x visits/month (3,600 extra visits @ S/18) | S/64,800 ($18,000) | problem-framing.md Layer 2 |
| **Referral Value** | 35% referrals (90 customers @ S/237 LTV, CAC saved) | S/24,624 ($6,840) | problem-framing.md Layer 3 |
| **Optimization Value** | AI discount optimization (5% margin improvement) | S/17,640 ($4,900) | problem-framing.md Layer 4 |
| **Time Value** | 70% time savings (312 hours @ S/108/hr) | S/33,696 ($9,360) | problem-framing.md Layer 5 |
| **TOTAL VALUE GENERATED** | Combined annual impact | **S/158,040** ($43,900) | problem-framing.md Total |

**Platform Cost**: S/3,240/year ($900 at $75/mo)
**Net Value to Business**: S/154,800/year ($43,000)
**Customer ROI**: **4,777%**
**Payback Period**: **8 days**

---

### Platform Performance Metrics (Our Business)

| Metric | Target Year 1 | How Measured |
|--------|---------------|--------------|
| **Monthly Active Businesses (MAB)** | 100 | Businesses sending ≥1 campaign/month |
| **Average Revenue Per User (ARPU)** | S/270/mo ($75) | Monthly recurring revenue / Active businesses |
| **Net Revenue Retention (NRR)** | 120% | (Revenue t1 - churn + upsell) / Revenue t0 × 100 |
| **Customer Churn Rate** | <5%/month | Businesses canceled / Total active × 100 |
| **Customer Acquisition Cost (CAC)** | <S/1,800 ($500) | Sales + marketing / New customers |
| **LTV:CAC Ratio** | >3:1 | (ARPU × avg lifetime months) / CAC |
| **Net Promoter Score (NPS)** | >50 | "How likely to recommend?" survey (0-10 scale) |
| **Support Ticket Volume** | <2/business/month | Tickets / Active businesses |

---

### Leading Indicators (Early Success Signals)

**Week 1**:
- ✅ Business completes setup wizard (5 minutes or less)
- ✅ First punch card design published
- ✅ First customer enrolled (scanned QR, card in wallet)

**Week 2**:
- ✅ First automated campaign sent (birthday or inactivity)
- ✅ Business owner logs into dashboard 3+ times
- ✅ At least 10 customers enrolled in loyalty program

**Week 4**:
- ✅ First measurable retention improvement (even small, e.g., +5%)
- ✅ First referral tracked and attributed
- ✅ Business owner reports time savings in survey

**Month 2**:
- ✅ Retention rate improving toward 50% (halfway to 75% target)
- ✅ Business owner accepts ≥1 AI recommendation
- ✅ Campaign ROI >200% (halfway to 400% target)

**Month 3**:
- ✅ Referral rate >20% (progress toward 35%)
- ✅ Business owner gives positive testimonial
- ✅ Business owner refers another coffee shop (word-of-mouth)

**Month 6**:
- ✅ **+40% LTV achieved** (primary success metric)
- ✅ Business renews subscription (retention validated)
- ✅ NPS >50 (would recommend to peers)

---

## TECHNICAL REQUIREMENTS

### Functional Requirements (MoSCoW Prioritization)

#### MUST HAVE (MVP - Critical Path)

**Digital Loyalty Cards**:
- Generate Apple Wallet passes (.pkpass format)
- Generate Google Wallet passes (JWT-based API)
- Support Yape-compatible loyalty card design
- Customizable branding (logo upload, color picker, text fields)
- Multi-tier rewards (e.g., 5 stamps = S/10 off, 10 stamps = free item)
- QR code generation for customer enrollment
- Card expiration management (optional expiry dates)

**Customer Management**:
- Customer registration (phone number-based, no password)
- Customer profile (name, phone, enrollment date, visit history)
- Visit tracking (timestamp, location if multi-location)
- Stamp issuance (manual via stamper app, automatic via Yape integration Phase 1)
- Reward redemption tracking (decrement balance, log redemption date)
- Customer segmentation (VIP, regular, new, at-risk, churned)

**Churn Detection**:
- Rule-based inactivity detection (14-day threshold configurable)
- Customer visit frequency calculation (avg days between visits)
- At-risk customer identification (missed expected visit by 50% threshold)
- Dashboard alert list (sorted by churn probability, high to low)
- AI churn prediction model (Phase 1: logistic regression or random forest, >70% accuracy)
- Confidence score display (e.g., "85% likely to churn within 7 days")

**Campaign Management**:
- WhatsApp message composer (rich text, emojis, variables)
- Template library (10+ pre-written messages in Spanish)
- Message personalization (customer name, last visit, stamps remaining)
- Campaign targeting (all customers, segments, manual selection)
- Campaign scheduling (send now, scheduled date/time, recurring)
- Campaign analytics (sent, delivered, opened, clicked, redeemed)

**Business Owner Dashboard**:
- Real-time active customer count
- 3-month retention rate (baseline vs. current, with trend chart)
- At-risk customer list (top 20, sorted by churn risk)
- Campaign performance history (last 10 campaigns, ROI per campaign)
- Revenue attribution (loyalty revenue vs. total revenue, % split)
- LTV tracking (cohort-based, baseline vs. current)

#### SHOULD HAVE (Phase 1 - High Value)

**Automated Campaign Triggers**:
- Birthday campaign (3 days before, auto-send personalized offer)
- Inactivity campaign (14 days inactive, auto-send re-engagement)
- VIP recognition (monthly thank-you to top 20% revenue customers)
- First-visit welcome (trigger on first stamp, introduce program)
- Reward reminder ("1 stamp away!" notification)
- Re-engagement (30+ days inactive, stronger offer)

**Yape Payment Integration**:
- Yape API authentication (OAuth or API key)
- Automatic stamp on Yape payment (detect transaction, issue stamp)
- Payment amount validation (minimum S/10 to earn stamp, configurable)
- Transaction history (link Yape payments to customer profiles)
- Instant Yape rewards for referrals (send S/5 credit to referrer wallet)

**AI Capabilities**:
- Churn prediction model training pipeline (retrain weekly with new data)
- Discount optimization recommendations ("Offer 15% instead of 20%")
- Campaign ROI forecasting ("Expected S/500 revenue, 85% confidence")
- Customer segment recommendations ("Target weekend regulars inactive 14 days")
- Confidence score transparency (show model accuracy, allow manual override)

**Stamper Mobile App**:
- iOS app (Swift or React Native)
- Android app (Kotlin or React Native)
- QR code scanner (scan customer card QR to issue stamp)
- Phone number entry (manual lookup if QR unavailable)
- Offline mode (queue stamps, sync when online)
- Reward redemption (scan to redeem, confirm on screen)

#### COULD HAVE (Phase 2 - Nice to Have)

**Referral Program**:
- Unique referral links per customer
- WhatsApp share button ("Invite friends via WhatsApp")
- Referral attribution (track referee → referrer linkage)
- Referrer reward (instant Yape S/5 credit or bonus stamps)
- Referee welcome bonus (first-time visitor S/5 off)
- Referral leaderboard (top 10 referrers, gamification)

**Advanced Segmentation**:
- Custom segment builder ("Customers who visit weekends, inactive 14+ days")
- Natural language segment creation ("Show me customers who...")
- Segment-specific campaign performance (VIP response rate vs. regular)
- Segment LTV analysis (which segments have highest lifetime value)

**Gamification**:
- Customer badges ("5-visit streak", "Early bird regular")
- Challenges ("Visit 3x this week, get bonus stamp")
- Progress bars (visual indicator of stamps to next reward)
- Social sharing (share badge on social media)

#### WON'T HAVE (V1 - Explicitly Deferred)

- Custom branded mobile app (Wallet integration sufficient)
- PLIN integration (Yape priority, interoperability later)
- Multi-location management (single-location focus first)
- Coalition programs (multi-business rewards, Phase 3)
- POS system integration (Lightspeed, Square, Clover - Phase 3)
- Advanced analytics (predictive LTV curves, cohort funnels - Phase 3)
- White-label platform (Phase 4)
- International expansion (Colombia, Chile, Mexico - Phase 4)

---

### Non-Functional Requirements

**Performance**:
- API response time: <200ms for 95th percentile (dashboard loads, stamp issuance)
- Campaign send time: <2 seconds per WhatsApp message
- Yape stamp validation: Real-time (<500ms after payment confirmation)
- Dashboard load time: <1 second on 4G mobile connection
- Database query performance: <100ms for customer lookups
- Scalability target: Support 100 businesses (30K customers) Year 1, 1,000 businesses (300K customers) Year 3

**Security**:
- **Data Encryption**: AES-256 for customer data at rest, TLS 1.3 for data in transit
- **PCI-DSS Compliance**: No storage of full credit card numbers (Yape handles payments)
- **SBS Data Protection**: Comply with Peru banking regulations (encrypted storage, access controls)
- **Authentication**: Business owner login via phone + OTP (no passwords)
- **Authorization**: Role-based access control (owner, staff, admin)
- **Privacy**: GDPR-inspired data policies (customer consent, right to deletion)
- **Audit Logging**: Track all customer data access, modifications, deletions

**Reliability**:
- Uptime SLA: 99.5% (allowed downtime: 3.6 hours/month)
- Disaster recovery: Daily backups, 24-hour recovery point objective (RPO)
- Failover: Multi-region deployment (primary: Lima AWS, backup: Sao Paulo AWS)
- Error handling: Graceful degradation (if WhatsApp API down, queue messages, retry)

**Scalability**:
- Horizontal scaling: Auto-scale web servers based on CPU/memory thresholds
- Database: PostgreSQL with read replicas for analytics queries
- Caching: Redis for frequently accessed data (customer profiles, campaign templates)
- Message queue: SQS or RabbitMQ for async WhatsApp message processing

**Usability**:
- Mobile-first design (80% of business owners use smartphones, not desktops)
- Spanish-language UI (100% of interface, no English fallbacks)
- WCAG 2.1 AA accessibility (keyboard navigation, screen reader support)
- Browser support: Chrome, Safari, Firefox (last 2 versions)
- Responsive design: 320px (mobile) to 1920px (desktop)

**Maintainability**:
- Code coverage: >80% unit tests, >60% integration tests
- Documentation: API docs (Swagger/OpenAPI), architecture diagrams, runbooks
- Monitoring: Datadog or New Relic for performance, error tracking (Sentry)
- Logging: Centralized logs (CloudWatch or ELK stack)
- CI/CD: Automated testing and deployment (GitHub Actions or GitLab CI)

---

### AI-Specific Requirements

**Model Performance**:
- **Churn Prediction Accuracy**: >70% (precision and recall balanced)
- **False Positive Rate**: <20% (avoid over-alerting business owners)
- **Discount Optimization**: 5-10% margin improvement validation in pilot
- **Campaign ROI Forecasting**: ±20% accuracy (e.g., predict S/500, actual S/400-600 acceptable)

**Ethical AI & Bias**:
- **Bias Audit**: Quarterly review of churn predictions by customer demographics (ensure no gender/age discrimination)
- **Fairness**: VIP segmentation based on revenue only, not protected characteristics
- **Transparency**: Display model confidence scores ("80% confident María will churn")
- **Human Override**: Business owners can adjust thresholds, ignore AI recommendations
- **Explainability**: Dashboard shows "why" customer flagged (e.g., "14 days inactive, usually visits weekly")

**Hallucination Prevention**:
- **Not Applicable**: Platform uses deterministic AI (classification, regression), not generative models
- **No LLM Text Generation**: WhatsApp messages use templates (no GPT-style hallucinations)
- **Validation**: All AI outputs validated against business rules before display

**Model Governance**:
- **Training Data**: Anonymized customer transaction data from pilot businesses (consent required)
- **Retraining Cadence**: Weekly model retraining as new data accumulates
- **Versioning**: Track model versions, rollback capability if accuracy degrades
- **Monitoring**: Track model drift (prediction accuracy over time), retrain triggers

---

## IMPLEMENTATION ROADMAP

### MVP Scope (Months 1-2): Core Retention Foundation

**Goal**: Launch pilot with 10 Lima coffee shops, validate retention lift hypothesis

**Features**:
- ✅ Digital punch cards (Apple Wallet, Google Wallet, basic Yape compatibility)
- ✅ Rule-based churn detection (14-day inactivity threshold)
- ✅ Manual WhatsApp campaigns (template-based, manual send)
- ✅ Business owner dashboard (active customers, retention rate, at-risk list)
- ✅ Stamper app MVP (iOS only, manual QR scan or phone entry)
- ✅ Customer enrollment flow (QR code scan to wallet)

**Success Criteria**:
- 10 businesses onboarded and actively using platform
- 30+ customers enrolled per business (300 total customers)
- First retention lift measurement (even if <40%, progress toward goal)
- <5 minute setup time validated
- Zero critical bugs (P0/P1 issues blocking usage)

**Dependencies**:
- WhatsApp Business API approval (apply Month 1, expect 2-4 week approval)
- Basic AI infrastructure setup (AWS SageMaker or equivalent)
- Legal/compliance review (SBS data protection consultation)

**Timeline**:
- **Month 1**: Development (80% complete), pilot recruitment (10 businesses identified)
- **Month 2**: Beta testing (10 businesses onboarded), bug fixes, first retention data

---

### Phase 1 (Months 3-4): AI & Automation

**Goal**: Activate AI churn prediction and automated campaigns, validate AI acceptance >60%

**Features**:
- ✅ Yape API integration (instant stamp on payment, if BCP partnership secured)
- ✅ AI churn prediction model (logistic regression, >70% accuracy target)
- ✅ Automated campaign triggers (birthday, inactivity, VIP, welcome, reward reminder)
- ✅ WhatsApp Business API integration (automated message sending)
- ✅ Referral tracking system (basic attribution, WhatsApp share links)
- ✅ Instant Yape rewards for referrers (S/5 credit on wallet)
- ✅ Android stamper app (expand from iOS-only)

**Success Criteria**:
- AI churn prediction >70% accuracy on pilot data
- >60% AI recommendation acceptance by business owners
- Automated campaigns running (≥3 trigger types active per business)
- Referral rate >15% (progress toward 35% target)
- WhatsApp campaign open rate >40%

**Dependencies**:
- **CRITICAL**: Yape API partnership (BCP merchant team approval)
  - **Mitigation**: If unavailable, launch with QR code integration (less seamless)
- AI model training data (2+ months of pilot customer behavior)
- WhatsApp Business API fully operational (templates approved)

**Timeline**:
- **Month 3**: Yape API integration (if available), AI model training, automated trigger development
- **Month 4**: Deployment to pilot businesses, A/B testing campaign templates, AI tuning

---

### Phase 2 (Months 5-6): Optimization & Scale

**Goal**: Achieve +40% LTV target, expand from 10 to 50 businesses, validate scalability

**Features**:
- ✅ AI discount optimization (recommend 15% vs. 20% based on historical data)
- ✅ Campaign ROI forecasting ("This campaign will generate S/500, 85% confidence")
- ✅ VIP auto-segmentation (top 20% revenue, exclusive offers)
- ✅ Advanced customer segments ("Weekend regulars inactive 14+ days")
- ✅ Multi-location support (single dashboard for 2-3 locations per business)
- ✅ Gamification basics (badges, challenges, progress bars)
- ✅ Enhanced analytics (segment LTV, cohort retention curves)

**Success Criteria**:
- **Primary**: +40% LTV achieved in pilot businesses (6-month measurement)
- 50 total businesses using platform (expand from 10)
- AI discount optimization validated (5-10% margin improvement)
- NRR >120% (upsells from Micro to SMB tier, multi-location expansion)
- NPS >50 (business owners actively recommend to peers)

**Dependencies**:
- Pilot business success stories (5+ detailed testimonials)
- Scalable infrastructure (support 50 businesses = 15,000 customers)
- Sales/marketing resources (content, case studies, referral program)

**Timeline**:
- **Month 5**: AI optimization features, multi-location beta, gamification development
- **Month 6**: Scale to 50 businesses, 6-month LTV cohort analysis, iterate based on feedback

---

### Critical Path Dependencies

**🔴 CRITICAL (Blocking)**:
1. **Yape API Partnership**
   - **Owner**: Product/Business Development
   - **Timeline**: Initiate discussions Month 1, secure partnership by Month 3
   - **Risk**: If unavailable, fallback to QR code integration (degrades value prop)
   - **Mitigation**: Parallel development of QR code flow as Plan B

2. **WhatsApp Business API Approval**
   - **Owner**: Engineering
   - **Timeline**: Apply Month 1, expect approval Week 3-4
   - **Risk**: Rejection or delay
   - **Mitigation**: Use Twilio WhatsApp Business API (faster approval), migrate to Meta API later

3. **AI Model Training Data**
   - **Owner**: Data Science/ML Engineer
   - **Timeline**: Accumulate 2 months of pilot data (Months 1-2), train model Month 3
   - **Risk**: Insufficient data quantity/quality
   - **Mitigation**: Start with rule-based system, layer AI when ready (Phase 1 not MVP)

**🟡 HIGH (Important but not blocking)**:
1. **Pilot Business Recruitment**
   - **Owner**: Product/Customer Success
   - **Timeline**: Identify 20 prospects Month 1, onboard 10 by Month 2
   - **Risk**: Low interest, setup friction
   - **Mitigation**: In-person demos, white-glove onboarding, 14-day free trial

2. **Legal/Compliance Review**
   - **Owner**: Legal/Compliance Consultant
   - **Timeline**: SBS data protection review Month 1, ongoing compliance
   - **Risk**: Regulatory blockers
   - **Mitigation**: Consult early, implement encryption/audit logging from Day 1

3. **AI Infrastructure Setup**
   - **Owner**: Engineering/DevOps
   - **Timeline**: AWS SageMaker setup Month 1, model deployment Month 3
   - **Risk**: Cost overruns, complexity
   - **Mitigation**: Start with managed services (SageMaker), optimize later

**🟢 MEDIUM (Nice to have, not urgent)**:
1. **Android Stamper App** (Phase 1, not MVP)
2. **Multi-Location Support** (Phase 2)
3. **Gamification Features** (Phase 2)
4. **Advanced Analytics** (Phase 2)

---

## RISKS & MITIGATIONS

### Documented in Internal FAQ Section (Question #6)

See **Internal FAQ Question #6: "What are the main technical and business risks?"** for detailed risk analysis including:
- Risk #1: Yape API Access (CRITICAL)
- Risk #2: AI Churn Prediction Accuracy (MEDIUM)
- Risk #3: WhatsApp Campaign Engagement (MEDIUM)
- Risk #4: Business Owner Adoption Friction (MEDIUM)
- Risk #5: Competitive Response (HIGH)
- Risk #6: Regulatory Compliance (MEDIUM)

---

## NEXT STEPS (Immediate Actions)

### Week 1-2: Foundation & Partnership Initiation
1. **Yape Partnership Outreach** 🔴
   - Contact BCP merchant team, request meeting
   - Prepare partnership proposal (mutual value, exclusivity terms)
   - Set target: Partnership decision by Month 3

2. **WhatsApp Business API Application** 🔴
   - Apply via Meta Business Manager or Twilio
   - Prepare message templates for approval
   - Set target: Approval by Week 4

3. **Pilot Recruitment** 🟡
   - Identify 20 Lima coffee shops (Miraflores, Barranco, San Isidro)
   - Schedule in-person demos
   - Set target: 10 businesses committed by Month 2

### Month 1: MVP Development Sprint
1. **Engineering Sprint 1**
   - Digital wallet pass generation (Apple/Google)
   - Basic dashboard (active customers, retention rate)
   - QR code enrollment flow

2. **Engineering Sprint 2**
   - Stamper app MVP (iOS, QR scan, manual entry)
   - WhatsApp message composer
   - Rule-based churn detection (14-day threshold)

3. **Design**
   - Business owner dashboard wireframes
   - Punch card design templates (5 pre-made options)
   - Onboarding flow UX (5-minute setup wizard)

### Month 2: Beta Launch with Pilot
1. **Pilot Onboarding** (10 businesses)
   - In-person setup (white-glove service)
   - First campaign launch assistance
   - Weekly check-ins for feedback

2. **Data Collection**
   - Customer enrollment metrics (QR scans, wallet adds)
   - Campaign performance (open rates, redemption)
   - Early retention indicators (visit frequency changes)

3. **Bug Fixes & Iteration**
   - Address P0/P1 bugs immediately
   - Iterate on UX friction points
   - Prepare for Phase 1 (AI + Yape integration)

---

**Document Status**: Draft for Review
**Approval Required**: Product Leadership, Engineering, Legal/Compliance
**Next Review Date**: [To be scheduled after pilot recruitment]

---

**End of PRD**
