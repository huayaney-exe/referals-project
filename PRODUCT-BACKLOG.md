# Product Backlog - Digital Loyalty & Referral Platform

**Version**: V1 Simplified MVP
**Date**: January 2025
**Target Market**: SMBs in Peru (coffee shops, salons, retail stores, restaurants)
**Core Value**: Automated customer retention through digital loyalty cards and WhatsApp campaigns

---

## Product Vision

**Mission Statement**:
*Empower small businesses in Peru to increase customer retention by 50-75% through automated WhatsApp campaigns, digital loyalty cards, and referral programs—without requiring technical skills or large budgets.*

**Target Users**:
1. **Business Owners**: Coffee shops, salons, retail stores, restaurants (1-3 locations, 50+ regular customers)
2. **Customers**: Regular patrons who want convenient digital loyalty tracking

**Core Workflows**:
- Business owners create accounts, configure loyalty programs, and monitor retention metrics
- Customers scan QR codes to enroll, receive digital cards in Apple Wallet, and get automated retention offers
- System automatically detects at-risk customers and sends personalized WhatsApp campaigns
- Business owners activate referral programs with configurable discount rewards

---

## User Journeys

### Journey 1: Business Owner Onboarding & Setup (5 minutes)

**As a business owner**, I want to quickly set up my loyalty program so I can start retaining customers today.

**Steps**:
1. Visit platform landing page → Click "Empezar Gratis" (Start Free)
2. Create account (email, password, business name)
3. Complete setup wizard:
   - Upload business logo
   - Choose punch card color scheme
   - Define reward structure (e.g., "5 stamps = S/10 off")
   - Set inactivity threshold (default: 14 days)
4. **Dashboard tour**: See overview of key sections (Customers, Campaigns, Analytics, Stamper)
5. Download QR code poster for customer enrollment
6. **Bookmark stamper web app**: Visit `app.loyaltyplatform.pe/stamp` on phone, bookmark for easy access
7. Test first stamp on own phone to verify setup
8. **No auto-activation**: Dashboard shows "Create your first campaign" prompt (owner will configure manually)

**Success Criteria**:
- ✅ Complete setup in <5 minutes
- ✅ Digital card visible in Apple Wallet
- ✅ First test stamp works (via web stamper)
- ✅ QR code poster downloadable as PDF
- ✅ Business owner understands dashboard navigation

---

### Journey 2: Customer Enrollment & Card Activation (30 seconds)

**As a customer**, I want to quickly join the loyalty program without downloading an app.

**Steps**:
1. See QR code poster at business location
2. Scan QR code with iPhone camera
3. Landing page opens → Enter name and phone number (WhatsApp)
4. Click "Agregar a Apple Wallet" button
5. Digital punch card added to Apple Wallet with 0 stamps
6. Receive WhatsApp welcome message: "¡Bienvenido {{name}}! Tu tarjeta digital está lista."

**Success Criteria**:
- ✅ Enrollment takes <30 seconds
- ✅ No app download required
- ✅ Digital card immediately visible in Apple Wallet
- ✅ Welcome WhatsApp received within 1 minute

---

### Journey 3: Business Owner Configures Retention Campaigns (Dashboard-Driven)

**As a business owner**, I want to manually create and activate retention campaigns from my dashboard without coding.

**Steps**:
1. **Log into dashboard** → Navigate to "Campañas" section (main navigation)
2. Click "Nueva Campaña" → **Owner chooses trigger type**:
   - Inactivity (customer hasn't visited in X days)
   - Birthday
   - Milestone (reached X stamps)
   - First visit
3. **Select template as starting point** (owner customizes before saving):
   - Template: "Te extrañamos {{name}}! Toma {{discount_code}} para 15% off en tu próxima visita"
   - **Owner edits message** to match business voice
4. **Configure campaign rules** (no-code visual interface):
   - **Trigger**: "Customer hasn't visited in 14 days" (owner sets threshold)
   - **Discount**: 15% off (owner chooses % or S/ amount)
   - **Validity**: 7 days (owner sets expiration)
   - **Send time**: 10:00 AM (owner sets schedule)
5. **Preview campaign** → **Send test to owner's WhatsApp** → Review test message
6. **Owner clicks "Activar Campaña"** (manual activation required)
7. **Monitor analytics from dashboard**: sent, opened, redeemed (real-time updates)

**Success Criteria**:
- ✅ Create and activate campaign in <3 minutes
- ✅ No coding required (visual rules builder)
- ✅ Real-time preview before activation
- ✅ Test message sent to owner before going live
- ✅ Owner has full control over activation timing
- ✅ Track redemption rates from dashboard

---

### Journey 4: Business Owner Activates Referral Program

**As a business owner**, I want to incentivize customers to refer friends with configurable rewards.

**Steps**:
1. Log into dashboard → Navigate to "Programa de Referidos"
2. Click "Activar Programa" → Configure rewards:
   - **Referrer reward**: 20% off next order
   - **Referee reward**: 15% off first order
   - **Minimum spend**: S/20 to qualify
3. System generates unique referral links for each customer
4. Choose distribution method:
   - Automatic WhatsApp message: "Comparte tu café favorito con amigos y obtén 20% off"
   - QR code for in-store sharing
5. Activate program → Customers receive referral links via WhatsApp
6. Monitor referral dashboard:
   - Total referrals sent
   - Successful conversions
   - Revenue from referred customers

**Success Criteria**:
- ✅ Activate referral program in <2 minutes
- ✅ Configurable reward percentages and minimum spend
- ✅ Auto-generate unique referral links per customer
- ✅ Track referral attribution and revenue impact
- ✅ WhatsApp sharing enabled

---

### Journey 5: Customer Receives & Redeems Retention Offer

**As a customer**, I want to receive personalized offers when I haven't visited in a while.

**Steps**:
1. Haven't visited coffee shop in 15 days (exceeds 14-day threshold)
2. Receive WhatsApp message at 10:00 AM:
   - "Hola Maria! Te extrañamos ☕ Toma MARIA15 para 15% off en tu próxima visita (válido 7 días)"
3. Visit coffee shop within 7 days
4. Show discount code "MARIA15" to barista
5. Barista opens web stamper → enters code → validates and applies 15% discount
6. Customer pays and receives stamp on digital card
7. Apple Wallet card updates: 3/5 stamps, notification "¡2 sellos más para tu café gratis!"

**Success Criteria**:
- ✅ Receive offer within 24 hours of becoming at-risk
- ✅ Unique discount code per customer
- ✅ Code validates in web stamper
- ✅ Card updates in real-time after stamp
- ✅ Push notification for progress updates

---

### Journey 6: Business Owner Monitors Retention Metrics

**As a business owner**, I want to see if my retention efforts are working with clear metrics.

**Steps**:
1. Log into dashboard → View home screen metrics:
   - **Active Customers**: 287 (visited in last 90 days)
   - **3-Month Retention Rate**: 58% ↑ from 35% baseline
   - **Digital Card Adoption**: 42% of customers
   - **At-Risk Customers**: 34 customers (haven't visited in 14+ days)
2. Click "Clientes en Riesgo" → See list sorted by days inactive:
   - Maria Lopez (18 days inactive, 4/5 stamps)
   - Carlos Ruiz (22 days inactive, 2/5 stamps)
3. Export CSV for manual follow-up if needed
4. Navigate to "Campañas" → View campaign performance:
   - Birthday Campaign: 45% open rate, 12% redemption
   - Inactivity Campaign: 32% open rate, 8% redemption
5. View retention trend chart (monthly retention % over 6 months)

**Success Criteria**:
- ✅ Key metrics visible on home screen
- ✅ At-risk customer list exportable as CSV
- ✅ Campaign analytics track open and redemption rates
- ✅ Retention trend visualized over time
- ✅ Compare retention before/after platform adoption

---

## Feature Backlog (MoSCoW Prioritization)

### MUST HAVE (MVP - Core Retention Features)

#### Epic 1: Business Owner Account & Setup (6 features)

**Priority**: 🔴 CRITICAL
**User Story**: As a business owner, I can create my account and configure my loyalty program in <5 minutes

- **F1.1**: Business owner registration & authentication
  - Email/password signup
  - Email verification
  - Secure password requirements
  - "Forgot password" flow

- **F1.2**: Setup wizard (5-minute onboarding)
  - Business name input
  - Logo upload (image validation: PNG/JPG, <2MB)
  - Punch card color picker (preview in real-time)
  - Reward structure configuration (X stamps = Y reward)

- **F1.3**: Inactivity threshold configuration
  - Default: 14 days
  - Configurable range: 7-30 days
  - Tooltip explanation: "Customers who haven't visited in X days are considered at-risk"

- **F1.4**: QR code generation for enrollment
  - Unique QR code per business (links to enrollment landing page)
  - Downloadable as PDF poster (A4 size, printable)
  - Preview before download

- **F1.5**: Dashboard home screen
  - Active customer count (visited in last 90 days)
  - 3-month retention rate (cohort-based calculation)
  - Digital card adoption rate (% with Apple Wallet cards)
  - At-risk customer count (exceeds inactivity threshold)

- **F1.6**: Business profile management
  - Edit business name, logo, contact info
  - Update reward structure
  - Change inactivity threshold
  - View subscription status and billing

**Acceptance Criteria**:
- Setup wizard completes in <5 minutes
- QR code downloadable immediately after setup
- Dashboard shows real-time metrics
- All settings editable post-setup

---

#### Epic 2: Customer Enrollment & Digital Card (6 features)

**Priority**: 🔴 CRITICAL
**User Story**: As a customer, I can scan a QR code and get a digital loyalty card in my Apple Wallet in <30 seconds

- **F2.1**: QR code enrollment landing page
  - Mobile-optimized design
  - Business logo and name displayed
  - "Agregar a Apple Wallet" prominent CTA button
  - Input fields: Name, phone number (WhatsApp)

- **F2.2**: Customer data validation
  - Phone number format validation (Peru: +51 9XXXXXXXX)
  - Check if phone already registered (allow re-downloads, see F2.7)
  - Name required (minimum 2 characters)

- **F2.3**: Apple Wallet .pkpass file generation
  - PassKit integration for .pkpass creation
  - Customizable card design (logo, colors from business setup)
  - Initial state: 0 stamps, reward tier 1
  - Barcode/QR code for scanning by stamper app

- **F2.4**: Digital card added to Apple Wallet
  - One-tap "Add to Apple Wallet" button
  - Card immediately visible in Wallet app
  - Lock screen visibility when near business location (geofencing - Phase 2)

- **F2.5**: Welcome WhatsApp message
  - Sent within 1 minute of enrollment
  - Template: "¡Bienvenido {{name}}! Tu tarjeta digital para {{business_name}} está lista. Acumula sellos y gana recompensas 🎁"
  - Twilio WhatsApp Business API integration

- **F2.6**: Customer profile creation
  - Store customer data: name, phone, enrollment date
  - Link to business account
  - Track visit history (initially empty)
  - Calculate visit frequency (after 2+ visits)

- **F2.7**: Card re-download mechanism (for lost/deleted cards)
  - Customer visits enrollment page and enters registered phone number
  - System detects existing account
  - Display message: "Ya tienes una tarjeta con {{business_name}}"
  - Show current progress: "{{stamps}}/{{stamps_needed}} sellos"
  - Button: "Volver a Descargar a Apple Wallet"
  - Send WhatsApp with re-download link (valid 24 hours)
  - Re-download preserves existing stamp count and customer history
  - Security: Require phone number confirmation (prevents unauthorized downloads)

**Acceptance Criteria**:
- Enrollment completes in <30 seconds
- Digital card appears in Apple Wallet immediately
- Welcome WhatsApp received within 1 minute
- No app download required for customers
- Existing customers can re-download cards without losing progress

---

#### Epic 3: Visit Tracking & Stamping (Web-Based) (6 features)

**Priority**: 🔴 CRITICAL
**User Story**: As a business owner, I can stamp customer cards via web interface on any smartphone

- **F3.1**: Web-based stamper interface (Progressive Web App)
  - Mobile-optimized web app (works on iPhone, Android, any browser)
  - Business owner login (email/password)
  - Camera access for QR scanning (browser camera API)
  - No app download required - works via URL (e.g., `app.loyaltyplatform.pe/stamp`)
  - Responsive design for mobile and tablet

- **F3.2**: Scan QR from Apple Wallet card
  - Browser-based QR code scanner (HTML5 camera API)
  - Scan barcode/QR from customer's digital card
  - Validate card belongs to this business
  - Display customer name and current stamp count

- **F3.3**: Manual phone number entry (alternative to QR scan)
  - Search by phone number if customer doesn't have phone/card accessible
  - Display customer details for confirmation
  - Prevents stamping wrong customer

- **F3.4**: Add stamp to card
  - One-tap "Agregar Sello" button
  - Duplicate prevention (max 1 stamp per visit - configurable cooldown period)
  - Update card in Apple Wallet via PassKit API
  - Log visit timestamp and optional transaction amount
  - Visual confirmation: "¡Sello agregado! Maria tiene 3/5 sellos"

- **F3.5**: Reward redemption flow
  - Detect when customer reaches reward threshold (e.g., 5 stamps)
  - "Canjear Recompensa" button appears
  - Confirm redemption → reset stamps to 0
  - Send reward notification to Apple Wallet
  - Log redemption in customer history

- **F3.6**: Visit history logging & sync
  - Store visit data: timestamp, stamps added, transaction amount
  - Calculate visit frequency (avg days between visits)
  - Update customer profile with latest visit date
  - Real-time sync to dashboard analytics
  - Auto-update at-risk customer detection

**Acceptance Criteria**:
- Works on any smartphone browser (no app download)
- QR scan takes <2 seconds
- Apple Wallet card updates in real-time (push notification)
- Reward redemption tracked and logged
- Accessible via simple URL (bookmarkable)

---

#### Epic 4: WhatsApp Retention Campaigns (Business Owner Configured) (6 features)

**Priority**: 🔴 CRITICAL
**User Story**: As a business owner, I can manually create and activate retention campaigns from my dashboard

- **F4.1**: Campaign creation interface (no-code, manual configuration)
  - Business owner accesses dashboard → "Campañas" section → "Nueva Campaña"
  - Trigger selection dropdown (business owner chooses):
    - Inactivity (X days since last visit)
    - Birthday
    - Milestone (X stamps reached)
    - First visit
  - Rule configuration (visual, no SQL/code) - **owner sets all parameters**
  - **No auto-activation**: Campaign saved as draft until owner explicitly activates

- **F4.2**: Pre-built message template library (starting points for customization)
  - 10+ Spanish templates for common scenarios (business owner selects and customizes):
    - Inactivity (7, 14, 30 days): "Te extrañamos {{name}}!"
    - Birthday: "¡Feliz cumpleaños {{name}}! Celebra con {{discount_code}}"
    - Milestone: "¡{{stamps}} sellos! Gracias por tu lealtad"
    - First visit: "Bienvenido {{name}}, gracias por tu primera visita"
    - Reward proximity: "Solo {{stamps_remaining}} sellos más para tu recompensa"
  - Template categories for different business types (café, salón, retail)
  - **Templates are suggestions only** - owner edits message before saving

- **F4.3**: Message customization with variables
  - Variable picker UI (click to insert):
    - {{name}}: Customer first name
    - {{days_since_visit}}: Days inactive
    - {{stamps}}: Current stamp count
    - {{stamps_remaining}}: Stamps until next reward
    - {{discount_code}}: Auto-generated unique code
  - Real-time preview with sample data
  - Character count (WhatsApp limit: 1,600 characters)

- **F4.4**: Dynamic discount code generation
  - Auto-generate unique codes per customer (e.g., "MARIA15", "CARLOS20")
  - Configure discount type: percentage (15% off) or fixed (S/10 off)
  - Set expiration (3, 7, 14, 30 days)
  - Set minimum spend requirement (optional)
  - Track code redemption in web stamper

- **F4.5**: Campaign scheduling & activation (manual control)
  - Send options (business owner chooses):
    - Now (immediate send to all matching customers)
    - Scheduled (specific date/time)
    - Triggered automation (send when customer meets condition - **owner activates trigger**)
  - Frequency cap (max 1 message per customer per 7 days - prevent spam)
  - **Test mode required**: Send test to business owner WhatsApp before activating
  - Activation workflow: Configure → Preview → Test → **Owner clicks "Activar"**
  - One-click activate/pause/deactivate (owner controls campaign state)

- **F4.6**: Campaign analytics dashboard
  - Metrics per campaign:
    - Sent: Total messages sent
    - Delivered: Twilio delivery confirmation
    - Opened: WhatsApp read receipts (if available)
    - Clicked: Link clicks (if included in message)
    - Redeemed: Discount codes used
  - Redemption rate calculation: (redeemed / sent) × 100
  - Revenue impact tracking (if transaction amounts logged)

**Acceptance Criteria**:
- Create campaign in <3 minutes (no coding)
- Templates available in Spanish
- Discount codes auto-generated and unique
- Analytics track full funnel (sent → redeemed)
- Test mode prevents accidental spam

---

#### Epic 5: At-Risk Customer Detection (Rule-Based) (6 features)

**Priority**: 🔴 CRITICAL
**User Story**: As a business owner, I can see which customers are at-risk and why, so I can proactively retain them

- **F5.1**: Rule-based at-risk detection engine
  - Algorithm: Customer hasn't visited in >2x their average visit frequency
  - Fallback: If <2 visits, use business-wide inactivity threshold (14 days default)
  - Run daily at midnight (automated)
  - Flag customers as "at-risk" in database

- **F5.2**: At-risk customer dashboard list
  - Sortable table:
    - Name
    - Phone number
    - Days since last visit
    - Average visit frequency (e.g., "every 8 days")
    - Current stamp count
    - Total lifetime visits
  - Sort by: Days inactive (default), stamp count, lifetime visits
  - Pagination (20 per page)

- **F5.3**: Configurable inactivity threshold
  - Business owner sets global threshold (7-30 days, default 14)
  - Override per customer (manual adjustment if needed)
  - Tooltip help: "Customers who haven't visited in X days will trigger retention campaigns"

- **F5.4**: Manual override & exclusions
  - "Mark as not at-risk" button (e.g., customer traveled, known absence)
  - Exclusion list (never send campaigns): opt-out customers, VIP custom handling
  - Re-enable automation toggle

- **F5.5**: At-risk notifications for business owner
  - Daily email summary: "You have 12 new at-risk customers this week"
  - WhatsApp notification option (for business owner)
  - Frequency settings (daily, weekly, never)

- **F5.6**: CSV export for manual outreach
  - Export at-risk list to CSV
  - Columns: Name, Phone, Days Inactive, Stamps, Last Visit Date
  - Use case: Manual calling, personal follow-up for high-value customers

**Acceptance Criteria**:
- At-risk detection runs automatically daily
- Dashboard shows real-time at-risk count
- Exportable CSV for offline use
- Manual overrides possible for exceptions

---

#### Epic 6: Referral Program Configuration (6 features)

**Priority**: 🟡 HIGH
**User Story**: As a business owner, I can activate a referral program and configure rewards for referrers and referees

- **F6.1**: Referral program activation toggle
  - One-click "Activar Programa de Referidos" button
  - Configuration modal opens:
    - Referrer reward (% off or S/ off)
    - Referee reward (% off or S/ off)
    - Minimum spend to qualify (e.g., S/20)
    - Expiration period (7, 14, 30 days)
  - Save and activate

- **F6.2**: Unique referral link generation per customer
  - Format: `https://app.loyaltyplatform.pe/ref/ABC123`
  - ABC123 = unique code tied to referrer customer ID
  - Link opens enrollment landing page with pre-filled referrer attribution

- **F6.3**: Referral link distribution via WhatsApp (owner-initiated)
  - Business owner activates referral program → **owner decides when to send invitations**
  - WhatsApp message template (owner can customize):
    - "Comparte tu café favorito con amigos y obtén {{referrer_reward}} off en tu próxima compra. Envía este link: {{referral_link}}"
  - Send options:
    - **Manual send**: Owner clicks "Enviar Invitaciones" to all active customers
    - **Individual resend**: Owner sends to specific customers from customer list
  - QR code version for in-store sharing (printed poster)

- **F6.4**: Referral attribution tracking
  - Track when referee clicks referral link
  - Track when referee enrolls (adds digital card)
  - Track when referee makes first purchase (stamps card)
  - Track when referrer and referee redeem rewards

- **F6.5**: Automated reward generation (based on owner-configured triggers)
  - **Owner configures reward rules** (when activating referral program)
  - When referee makes first purchase (stamped by owner):
    - System auto-generates referee discount code (e.g., "BIENVENIDO15")
    - System sends WhatsApp: "Gracias {{referee_name}}! Usa {{code}} para 15% off"
  - When referee redeems code (validated by owner in stamper):
    - System auto-generates referrer reward code (e.g., "GRACIAS20")
    - System sends WhatsApp to referrer: "¡Tu amigo {{referee_name}} visitó! Usa {{code}} para 20% off"
  - **Note**: Rewards only sent when owner-configured conditions are met (not random automation)

- **F6.6**: Referral analytics dashboard
  - Metrics:
    - Total referral links sent
    - Click-through rate (clicks / sent)
    - Conversion rate (enrollments / clicks)
    - Redemption rate (purchases / enrollments)
    - Revenue from referred customers
  - Top referrers leaderboard (most successful customers)
  - Export referral data to CSV

**Acceptance Criteria**:
- Activate referral program in <2 minutes
- Unique referral links auto-generated per customer
- Rewards auto-issued when conditions met
- Full attribution tracking (link → enrollment → purchase)
- Dashboard shows referral funnel and revenue impact

---

### SHOULD HAVE (Phase 1 - Polish & Enhancements)

#### Epic 7: Web Stamper Enhancements (4 features) - DEFERRED TO PHASE 2

**Priority**: 🟢 LOW (Phase 2)
**User Story**: As a business owner, I need advanced stamping features for peak hours and staff management

- **F7.1**: Multiple staff accounts (Phase 2)
  - Business owner creates staff logins
  - Role-based permissions:
    - Staff: Can stamp, redeem rewards (no access to dashboard/campaigns)
    - Manager: Staff + view analytics
    - Owner: Full access

- **F7.2**: Transaction amount logging (Phase 2)
  - Optional input field: "Monto de compra: S/_____"
  - Used for analytics (average transaction value per customer)
  - Revenue impact tracking for retention campaigns

- **F7.3**: Advanced stamp validation (Phase 2)
  - Configurable cooldown period (1-24 hours between stamps)
  - "Undo last stamp" feature (within 5 minutes)
  - Confirmation dialog toggle (on/off)

- **F7.4**: PWA offline mode (Phase 2)
  - Progressive Web App installable to home screen
  - Cache customer data for offline use
  - Queue stamps when offline, sync when online

**Acceptance Criteria** (Phase 2):
- Staff accounts with role-based permissions
- Optional transaction tracking
- PWA installable on iOS/Android home screens

---

#### Epic 8: Advanced Dashboard Analytics (6 features)

**Priority**: 🟢 MEDIUM
**User Story**: As a business owner, I want deeper insights into customer behavior and campaign performance

- **F8.1**: Cohort retention analysis
  - Retention curves by cohort (customers enrolled in same month)
  - Compare retention across cohorts (January vs. February)
  - Identify which cohorts have highest retention

- **F8.2**: Customer segmentation view
  - Segments:
    - Champions (frequent visitors, high stamps)
    - At-Risk (inactive, need campaigns)
    - Occasional (visit <1x per month)
    - New (enrolled <30 days ago)
  - Segment size and revenue contribution

- **F8.3**: Campaign A/B testing
  - Create 2 versions of same campaign (different messages)
  - Split at-risk customers 50/50
  - Compare open and redemption rates
  - Declare winner, use for future campaigns

- **F8.4**: Revenue impact tracking
  - Calculate revenue attributed to retention campaigns
  - Formula: (Redeemed customers × Avg transaction) - (Discount cost)
  - ROI calculation: (Revenue impact / Campaign cost)

- **F8.5**: Exportable reports (CSV)
  - Customer list export (all data fields)
  - Campaign performance export
  - Visit history export (for accounting)
  - Referral attribution export

- **F8.6**: Industry benchmarking (Peru SMBs)
  - Compare retention rate to industry average (anonymized)
  - Benchmarks: Coffee shops (50-65%), salons (40-55%), retail (35-50%)
  - Percentile ranking: "Your retention is in top 25% of coffee shops"

**Acceptance Criteria**:
- Cohort analysis shows retention curves over 6+ months
- Customer segments auto-calculated daily
- A/B tests track statistical significance
- Revenue impact visible per campaign
- Benchmark data from 50+ businesses minimum

---

### COULD HAVE (Phase 2 - Nice to Have)

#### Epic 9: Google Wallet Support (4 features)

**Priority**: 🟢 LOW
**User Story**: As a customer with Android, I want digital loyalty cards in Google Wallet

- **F9.1**: Google Wallet pass generation
- **F9.2**: Dual wallet support (Apple + Google)
- **F9.3**: Web stamper already cross-platform (no separate Android app needed)
- **F9.4**: Cross-platform QR code compatibility

---

#### Epic 10: Multi-Location Support (5 features)

**Priority**: 🟢 LOW
**User Story**: As a business owner with multiple locations, I want unified customer tracking

- **F10.1**: Location management (add/edit locations)
- **F10.2**: Unified customer view across locations
- **F10.3**: Location-specific campaigns
- **F10.4**: Location-level analytics
- **F10.5**: Staff permissions per location

---

#### Epic 11: VIP Customer Segmentation (4 features)

**Priority**: 🟢 LOW
**User Story**: As a business owner, I want to treat high-value customers differently

- **F11.1**: Manual VIP tagging
- **F11.2**: VIP-only campaigns (exclusive offers)
- **F11.3**: VIP dashboard (high-value customer list)
- **F11.4**: Auto-VIP threshold (e.g., >20 visits in 90 days)

---

#### Epic 12: Birthday Campaign Automation (3 features)

**Priority**: 🟢 LOW
**User Story**: As a business owner, I want to send birthday offers automatically

- **F12.1**: Birthday field in customer profile (optional)
- **F12.2**: Automated birthday campaign trigger
- **F12.3**: Birthday template: "¡Feliz cumpleaños {{name}}! Celebra con {{discount_code}}"

---

### WON'T HAVE (Deferred to Phase 3+)

**Out of Scope for V1**:
- ❌ AI/ML churn prediction (requires 6+ months training data)
- ❌ Yape/PLIN payment integration (partnership dependency)
- ❌ AI discount optimization
- ❌ Natural language campaign creation
- ❌ Gamification (badges, leaderboards)
- ❌ Coalition programs (multi-business loyalty)
- ❌ POS system integration
- ❌ Predictive analytics/forecasting
- ❌ White-label platform
- ❌ International expansion (focus Peru first)

---

## Technical Requirements (High-Level)

### Frontend
- **Landing Page**: Next.js (SEO-optimized)
- **Dashboard**: React + TypeScript (business owner UI)
- **Enrollment Page**: Mobile-optimized React (customer-facing)
- **Web Stamper**: Progressive Web App (PWA) - React + TypeScript
  - Mobile-optimized for iOS and Android
  - HTML5 camera API for QR scanning
  - Responsive design (works on any smartphone browser)
  - No app store deployment needed

### Backend
- **API**: Node.js + Express (RESTful API)
- **Database**: PostgreSQL (customer, visit, campaign data)
- **Authentication**: JWT tokens, bcrypt password hashing

### Integrations
- **Apple Wallet**: PassKit library for .pkpass generation
- **WhatsApp**: Twilio WhatsApp Business API
- **QR Codes**: QRCode.js for generation
- **Camera Access**: HTML5 getUserMedia API (browser camera)

### Infrastructure
- **Hosting**: AWS or GCP (scalable cloud)
- **CDN**: CloudFront for static assets
- **Monitoring**: Sentry (error tracking), Mixpanel (analytics)

---

## Success Metrics (V1 - MVP)

### Primary North Star Metric
**3-Month Retention Rate Improvement**: +15-25 percentage points

| Metric | Baseline (No Program) | Target (With Platform) | Measurement Method |
|--------|----------------------|------------------------|-------------------|
| **3-Month Retention** | 30-40% | 50-65% | Cohort analysis (customers from 6 months ago still active) |
| **Repeat Rate (30-day)** | 35-45% | 55-65% | % customers with 2+ purchases in 30 days |
| **Digital Card Activation** | 0% | >40% | % customers who add Apple Wallet card after enrollment |
| **Campaign Open Rate** | N/A | >30% | WhatsApp delivered/opened (Twilio webhooks) |
| **Campaign Redemption** | N/A | >10% | Discount codes redeemed / sent |
| **Time-to-Value** | N/A | <14 days | Days from signup to first campaign sent |

### Business Health Metrics
- **Onboarding Completion**: >80% of signups complete setup wizard
- **Active Business Retention**: <5% churn rate (businesses stay >6 months)
- **NPS**: >50 (world-class satisfaction)
- **Support Tickets**: <2 per business/month

---

## Roadmap (Simplified)

### MVP - Months 1-2: Core Digital Cards + Campaign Dashboard

**Goal**: Launch with 10 pilot businesses, validate retention lift

**Features**:
- ✅ Business owner account & setup wizard (dashboard orientation)
- ✅ Customer enrollment & Apple Wallet cards (with re-download feature)
- ✅ **Web-based stamper** (QR scan via browser, manual phone entry)
- ✅ Campaign dashboard (owner creates/activates campaigns manually)
- ✅ Pre-built Spanish message templates (10+ templates)
- ✅ Rule-based at-risk detection (14-day threshold)
- ✅ Basic dashboard (retention rate, at-risk list, campaign analytics)
- ✅ Referral program (owner-configured rewards, manual invitation sends)

**Success Criteria**:
- 10 businesses onboarded
- 30+ customers enrolled per business
- >40% digital card activation rate
- First retention measurement (any improvement = success)
- <5 min setup time validated
- Web stamper works on iOS and Android browsers (no app download)
- Business owners manually create and activate ≥2 campaigns each

---

### Phase 1 - Months 3-4: Campaign Automation + Analytics

**Goal**: Enable triggered campaigns, reduce owner time to 30 min/week

**Features**:
- ✅ Triggered campaign automation (owner activates, system sends when conditions met)
- ✅ Dynamic discount code generation (unique per customer)
- ✅ Advanced campaign analytics (open/redemption tracking, A/B testing)
- ✅ Cohort retention analysis
- ✅ Customer segmentation dashboard

**Success Criteria**:
- >30% WhatsApp campaign open rate
- >10% campaign redemption rate
- Triggered campaigns running (≥3 types per business, owner-activated)
- 50-65% retention rate achieved (vs. 30-40% baseline)
- Referral tracking active (5+ referrals per business)

---

### Phase 2 - Months 5-6: Scale + Multi-Platform

**Goal**: Expand from 10 to 50-100 businesses

**Features**:
- ✅ Google Wallet support (expand beyond iPhone)
- ✅ PWA offline mode (install to home screen, offline stamping)
- ✅ Multi-location support (basic)
- ✅ Staff accounts with role-based permissions

**Success Criteria**:
- 50-100 total businesses
- +20 percentage point retention improvement validated
- NPS >50 (would recommend)
- <5% business churn rate
- Case studies published (5+ testimonials)

---

### Phase 3 - Months 7-12: AI/ML + Partnerships (Deferred)

**Features** (requires 6+ months data):
- AI churn prediction (>70% accuracy)
- Yape/PLIN integration (if partnership secured)
- AI discount optimization
- POS system integrations

---

## Appendix: User Interface Mockups (Text Descriptions)

### Landing Page (Customer-Facing)
- Hero: Business logo, "¡Únete al programa de lealtad!"
- QR code prominently displayed
- Input fields: Name, WhatsApp phone number
- CTA button: "Agregar a Apple Wallet" (large, green)
- Footer: Privacy policy, terms of service

### Dashboard Home (Business Owner)
- **Top Metrics** (cards):
  - Active Customers: 287
  - 3-Month Retention: 58% (↑ +23 pp from baseline)
  - At-Risk Customers: 34 (clickable → at-risk list)
  - Digital Card Adoption: 42%
- **Retention Trend Chart**: Line graph (last 6 months)
- **Recent Campaigns**: Table (name, sent, opened, redeemed)
- **Quick Actions**: "Nueva Campaña", "Ver Clientes en Riesgo"

### Campaign Builder (No-Code)
- **Step 1 - Trigger**: Dropdown (Inactivity, Birthday, Milestone, First Visit)
- **Step 2 - Rule Configuration**:
  - Inactivity: Slider "14 days" (7-30 range)
- **Step 3 - Message**: Template picker + text editor
  - Variable picker: Click to insert {{name}}, {{discount_code}}, etc.
  - Live preview panel (right side)
- **Step 4 - Discount**:
  - Type: Percentage or Fixed
  - Amount: Input "15%"
  - Expiration: Dropdown "7 days"
- **Step 5 - Schedule**:
  - Radio buttons: Now, Scheduled, Automated Trigger
  - Send time: Time picker "10:00 AM"
- **Action Buttons**: "Guardar Borrador", "Enviar Prueba", "Activar Campaña"

### Referral Program Setup
- **Toggle**: "Activar Programa de Referidos" (off/on)
- **Configuration Panel** (when activated):
  - Referrer Reward: Input "20%" + dropdown (% or S/)
  - Referee Reward: Input "15%" + dropdown (% or S/)
  - Minimum Spend: Input "S/20"
  - Expiration: Dropdown "14 days"
- **Preview**: Sample WhatsApp message with referral link
- **Action Button**: "Guardar y Activar"
- **Analytics Panel** (below):
  - Total Referrals Sent: 120
  - Click-Through Rate: 25%
  - Conversion Rate: 12%
  - Revenue from Referrals: S/3,450

---

## Questions & Assumptions

### Assumptions
1. **Target businesses have 50+ regular customers** (minimum viable for retention value)
2. **iPhone adoption in Peru urban areas >40%** (sufficient for Apple Wallet focus)
3. **WhatsApp Business API approval takes 2-4 weeks** (via Twilio)
4. **Business owners spend <30 min/week on manual campaigns** (pain point validated)
5. **Retention baseline for SMBs in Peru: 30-40%** (no loyalty program)

### Open Questions
1. **Pricing model**: Flat $50-75/mo or tiered by customer count?
2. **Free trial length**: 14 days or 30 days?
3. **Payment methods**: Credit card only or cash/bank transfer in Peru?
4. **Multi-language support**: Spanish-only MVP or add English later?
5. **Data retention policy**: How long to store customer visit history?

---

**Document Owner**: Product Team
**Last Updated**: January 2025
**Status**: APPROVED for V1 Development
