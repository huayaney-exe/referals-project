# Seya - Onboarding UX Design & User Flow
**Date**: 2025-10-05
**Version**: 1.0 - Initial Design

---

## Table of Contents
1. [Benchmark Analysis](#benchmark-analysis)
2. [User Journey Map](#user-journey-map)
3. [Onboarding Flow Design](#onboarding-flow-design)
4. [Wireframes & Interactions](#wireframes--interactions)
5. [Value Perception Strategy](#value-perception-strategy)
6. [Technical Requirements](#technical-requirements)

---

## 1. Benchmark Analysis

### Best-in-Class Onboarding Patterns

#### **A. Smile.io (Loyalty Platform Leader)**
**Strengths:**
- ✅ 4-step wizard: Brand → Rewards → Design → Launch
- ✅ Shows "time to value" (2 minutes to launch)
- ✅ Pre-built templates with industry defaults
- ✅ Live preview of customer-facing card
- ✅ Skip option for power users

**Weaknesses:**
- ❌ Too many configuration options upfront
- ❌ Doesn't explain value proposition early

#### **B. LoyaltyLion**
**Strengths:**
- ✅ Progressive disclosure (basic → advanced)
- ✅ "Quick Start" vs "Custom Setup" paths
- ✅ Integration checklist with progress tracking
- ✅ Educational tooltips with best practices

**Weaknesses:**
- ❌ Overwhelming for small businesses
- ❌ Requires e-commerce platform integration first

#### **C. Duolingo (Consumer App - Gold Standard)**
**Strengths:**
- ✅ **Immediate value demonstration** (try before configure)
- ✅ Gamified progress indicators
- ✅ Personalization questions drive engagement
- ✅ "Aha moment" within 60 seconds

**Learnings for Seya:**
- Show QR code generation FIRST (instant value)
- Then ask configuration questions
- Make it feel like "completing a game level"

#### **D. Canva (Design Tool)**
**Strengths:**
- ✅ Template gallery as starting point
- ✅ "Remix this design" → instant customization
- ✅ Brand kit creation (colors, fonts, logo)
- ✅ Export/share immediately visible

**Learnings for Seya:**
- Punch card template gallery
- One-click customization
- Brand identity capture (logo, colors)

---

## 2. User Journey Map

### Business Owner Personas

#### **Persona 1: "María la Cafetería"**
- **Profile**: Small café owner, 40s, not tech-savvy
- **Goal**: Replace paper punch cards, reduce waste
- **Pain Point**: Customers lose paper cards, no way to reach them
- **Success Metric**: 20+ customers enrolled in first week

#### **Persona 2: "Carlos el Barbero"**
- **Profile**: Barbershop owner, 30s, Instagram-savvy
- **Goal**: Build customer loyalty, reduce no-shows
- **Pain Point**: Customers only come when they need haircut, no repeat visits
- **Success Metric**: 10% increase in monthly visits

#### **Persona 3: "Sofia la Boutique"**
- **Profile**: Fashion boutique, 25s, design-conscious
- **Goal**: Premium loyalty experience, brand alignment
- **Pain Point**: Generic loyalty programs don't match brand aesthetic
- **Success Metric**: Beautiful punch card that customers want to share

---

### Current Journey (BROKEN)

```
Register → Dashboard (Confused) → Click around → Give up ❌
│
└─> Pain Points:
    - No clear next action
    - Doesn't understand what "campaigns" are
    - QR code appears with no context
    - No explanation of how customers use it
```

### Desired Journey (DESIGNED)

```
Register → Onboarding Wizard → "Aha Moment" → Active Usage ✅
│
├─> Step 1: WELCOME & VALUE (30 sec)
│   "Tu programa de lealtad digital en 2 minutos"
│   Preview of final result: QR code + digital card
│
├─> Step 2: QUICK SETUP (45 sec)
│   Q: ¿Qué ofreces de recompensa?
│   Templates: "Café gratis", "20% descuento", "Corte gratis"
│   Q: ¿Cuántos sellos para el premio?
│   Slider: 5-6-7-8-9-[10]-12-15-20
│
├─> Step 3: DESIGN YOUR CARD (60 sec)
│   Template gallery (6 pre-designed cards)
│   Quick customization: Logo upload, colors, background
│   Live preview of customer experience
│
├─> Step 4: LAUNCH (15 sec)
│   ✅ Your QR code is ready!
│   Download/Print options
│   Next steps: "Invite your first customer"
│
└─> Dashboard (Confident & Equipped)
    Clear metrics, actionable next steps
```

**Total Time**: ~2.5 minutes
**Perceived Value**: Instant (has working QR code)
**Confidence Level**: High (knows what to do next)

---

## 3. Onboarding Flow Design

### Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│  POST-REGISTRATION REDIRECT LOGIC                       │
│                                                          │
│  if (user.is_first_login) {                            │
│    redirect('/onboarding');                            │
│  } else {                                              │
│    redirect('/dashboard');                             │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  ONBOARDING WIZARD - STEP 1: WELCOME                    │
│  Route: /onboarding (step=1)                           │
└─────────────────────────────────────────────────────────┘
```

---

### Step 1: Welcome & Value Proposition
**Duration**: 30 seconds
**Goal**: Show what they're about to build

```
┌──────────────────────────────────────────────────────┐
│  [Skip to Dashboard] ←─────────────────────── [X]    │
│                                                       │
│              🎯 Tu Programa de Lealtad                │
│            ¡Listo en solo 2 minutos!                  │
│                                                       │
│  ┌─────────────────────────────────────────────┐     │
│  │  [ANIMATED PREVIEW]                         │     │
│  │                                              │     │
│  │  1. Tu código QR único                       │     │
│  │     [QR Code Animation]                      │     │
│  │                                              │     │
│  │  2. Tarjeta digital de sellos                │     │
│  │     [Card with 10 circles, filling up]       │     │
│  │                                              │     │
│  │  3. Notificaciones automáticas               │     │
│  │     [WhatsApp message animation]             │     │
│  │                                              │     │
│  └─────────────────────────────────────────────┘     │
│                                                       │
│  Perfecto para:                                       │
│  ☑️  Cafeterías, restaurantes                         │
│  ☑️  Barberías, salones de belleza                    │
│  ☑️  Tiendas retail                                   │
│                                                       │
│               [Comenzar →]                            │
│                                                       │
│  ⏱️  Tiempo estimado: 2 minutos                       │
└──────────────────────────────────────────────────────┘
```

**UX Principles:**
- ✅ Show, don't tell (animated preview)
- ✅ Time commitment upfront (2 minutes)
- ✅ Social proof (industry examples)
- ✅ Skip option for power users

---

### Step 2: Reward Configuration
**Duration**: 45 seconds
**Goal**: Define the loyalty program rules

```
┌──────────────────────────────────────────────────────┐
│  [← Atrás]  Paso 2 de 4: Tu Recompensa   [Siguiente →]│
│                                                       │
│  ──────●──────○──────○──────○                        │
│       Recompensa  Diseño  QR  Listo                   │
│                                                       │
│  ❓ ¿Qué premio recibirán tus clientes?               │
│                                                       │
│  Plantillas populares:                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ ☕ Café   │ │ 🍕 Pizza │ │ ✂️ Corte │             │
│  │  Gratis  │ │  Gratis  │ │  Gratis  │             │
│  └──────────┘ └──────────┘ └──────────┘             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ 💅 Manicure│ │ 20% OFF │ │ + Escribe│             │
│  │   Gratis  │ │ Compra  │ │   Tuyo   │             │
│  └──────────┘ └──────────┘ └──────────┘             │
│                                                       │
│  O escribe tu propio premio:                          │
│  ┌────────────────────────────────────────────┐      │
│  │ 1 producto gratis                           │      │
│  └────────────────────────────────────────────┘      │
│                                                       │
│  ❓ ¿Cuántos sellos necesitan?                        │
│                                                       │
│  ○○○○○ ●○○○○ ○○○○○ ○○○○○                              │
│   5     10     15     20    Personalizado             │
│                                                       │
│  👥 Recomendado para ti: 10 sellos                    │
│  💡 El 78% de negocios usan 8-12 sellos               │
│                                                       │
│               [Continuar →]                           │
└──────────────────────────────────────────────────────┘
```

**UX Principles:**
- ✅ Templates reduce decision fatigue
- ✅ Custom option for flexibility
- ✅ Data-driven recommendations
- ✅ Progress indicator shows completion

**Form State:**
```typescript
interface RewardConfig {
  reward_description: string;
  stamps_required: number;
  template_used?: string; // Track analytics
}
```

---

### Step 3: Card Design
**Duration**: 60 seconds
**Goal**: Create branded punch card visual

```
┌──────────────────────────────────────────────────────┐
│  [← Atrás]  Paso 3 de 4: Diseña tu Tarjeta [Siguiente →]│
│                                                       │
│  ──────●──────●──────○──────○                        │
│       Recompensa  Diseño  QR  Listo                   │
│                                                       │
│  Elige una plantilla:                                 │
│                                                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│  │ Moderna │ │ Clásica │ │ Minimalista│              │
│  │ [IMG]   │ │ [IMG]   │ │ [IMG]    │               │
│  └─────────┘ └─────────┘ └─────────┘                │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│  │ Elegante│ │ Divertida│ │ Premium │               │
│  │ [IMG]   │ │ [IMG]   │ │ [IMG]    │               │
│  └─────────┘ └─────────┘ └─────────┘                │
│                                                       │
│  Personaliza:                                         │
│  ┌────────────────────────────────────────┐          │
│  │  📷 Logo (opcional)                    │          │
│  │  [Subir imagen] o [Usar inicial]       │          │
│  │                                         │          │
│  │  🎨 Colores del negocio                 │          │
│  │  Color principal: [#A855F7] 🟣          │          │
│  │  Color acento: [#F97316] 🟠             │          │
│  │                                         │          │
│  │  🖼️  Fondo (opcional)                   │          │
│  │  [Subir imagen] o [Usar degradado]     │          │
│  └────────────────────────────────────────┘          │
│                                                       │
│  Vista previa:                                        │
│  ┌────────────────────────────────────────┐          │
│  │  [LIVE PREVIEW OF PUNCH CARD]          │          │
│  │                                         │          │
│  │  🏪 TU NEGOCIO                          │          │
│  │  ●●●●●○○○○○                              │          │
│  │  5/10 sellos                            │          │
│  │  Premio: 1 café gratis                  │          │
│  └────────────────────────────────────────┘          │
│                                                       │
│               [Continuar →]                           │
└──────────────────────────────────────────────────────┘
```

**UX Principles:**
- ✅ Template-first (speed)
- ✅ Customization optional (flexibility)
- ✅ Live preview (confidence)
- ✅ Mobile-first design preview

**Design State:**
```typescript
interface CardDesign {
  template_id: string;
  brand_color_primary: string;
  brand_color_accent: string;
  logo_url?: string;
  background_image_url?: string;
  use_gradient: boolean;
}
```

**Template Library**:
```typescript
const CARD_TEMPLATES = [
  {
    id: 'modern',
    name: 'Moderna',
    preview_url: '/templates/modern.png',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    stamp_style: 'circles',
  },
  {
    id: 'classic',
    name: 'Clásica',
    preview_url: '/templates/classic.png',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    stamp_style: 'squares',
  },
  {
    id: 'minimal',
    name: 'Minimalista',
    preview_url: '/templates/minimal.png',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    stamp_style: 'lines',
  },
  // ... 3 more templates
];
```

---

### Step 4: QR Code & Launch
**Duration**: 15 seconds
**Goal**: Celebrate success, provide next actions

```
┌──────────────────────────────────────────────────────┐
│  [← Atrás]  Paso 4 de 4: ¡Todo Listo! 🎉            │
│                                                       │
│  ──────●──────●──────●──────●                        │
│       Recompensa  Diseño  QR  Listo                   │
│                                                       │
│            🎊 ¡Felicidades! 🎊                        │
│    Tu programa de lealtad está activo                 │
│                                                       │
│  ┌─────────────────────────────────────────────┐    │
│  │  TU CÓDIGO QR ÚNICO                         │    │
│  │                                              │    │
│  │        ┌───────────────┐                     │    │
│  │        │               │                     │    │
│  │        │   [QR CODE]   │                     │    │
│  │        │               │                     │    │
│  │        └───────────────┘                     │    │
│  │                                              │    │
│  │  Muestra este código a tus clientes          │    │
│  │  para que se registren                       │    │
│  │                                              │    │
│  │  [📥 Descargar] [🖨️ Imprimir] [📱 Compartir] │    │
│  └─────────────────────────────────────────────┘    │
│                                                       │
│  📋 Próximos pasos sugeridos:                         │
│                                                       │
│  1. 📸 Imprime tu QR y colócalo en tu mostrador       │
│     [Descargar poster →]                              │
│                                                       │
│  2. 📢 Crea tu primera campaña de bienvenida          │
│     [Ir a campañas →]                                 │
│                                                       │
│  3. 👥 Invita a tu primer cliente                     │
│     [Compartir enlace →]                              │
│                                                       │
│               [Ir al Dashboard →]                     │
│                                                       │
│  💡 Tip: El 85% de negocios registran su primer       │
│     cliente en las primeras 24 horas                  │
└──────────────────────────────────────────────────────┘
```

**UX Principles:**
- ✅ Celebration moment (dopamine hit)
- ✅ Clear next actions (reduce uncertainty)
- ✅ Multiple export options (flexibility)
- ✅ Social proof (urgency)

**Post-Onboarding Actions:**
```typescript
interface OnboardingCompletion {
  onboarding_completed_at: Date;
  qr_code_downloaded: boolean;
  first_campaign_created: boolean;
  first_customer_enrolled: boolean;
}
```

---

## 4. Wireframes & Interactions

### Mobile-First Card Design Preview

```
┌──────────────────────┐
│  📱 Vista del Cliente │
│                       │
│  ┌─────────────────┐ │
│  │ 🏪 Café Central │ │
│  │                 │ │
│  │  Tu Tarjeta:    │ │
│  │  ●●●●● ○○○○○    │ │
│  │  5 de 10 sellos │ │
│  │                 │ │
│  │  Premio:        │ │
│  │  ☕ 1 Café      │ │
│  │     Gratis      │ │
│  │                 │ │
│  │  [Compartir]    │ │
│  └─────────────────┘ │
│                       │
│  Como se ve en        │
│  WhatsApp/Apple       │
│  Wallet               │
└──────────────────────┘
```

### Interaction Patterns

#### A. Template Selection
- **Hover**: Scale 1.05, shadow increases
- **Click**: Checkmark appears, outline highlights
- **Selected**: Blue border, "Seleccionado" badge

#### B. Color Picker
- **Type**: Swatches + custom hex input
- **Presets**: 8 popular color combinations
- **Live Update**: Card preview updates instantly

#### C. Image Upload
- **Drag & Drop**: Supported
- **Crop**: 1:1 aspect ratio enforced
- **Preview**: Shows on card immediately
- **Fallback**: Business name initial if no logo

#### D. Progress Indicator
- **Animation**: Fill from left to right
- **State**: Current step highlighted
- **Click**: Jump to previous steps (not future)

---

## 5. Value Perception Strategy

### Aha Moments (Critical for Retention)

#### Moment 1: "Wow, that was fast!" (End of Step 4)
**Trigger**: QR code appears
**Emotion**: Accomplishment
**Action**: Download QR code
**Retention Impact**: +40%

#### Moment 2: "My first customer!" (Within 24 hours)
**Trigger**: First customer enrollment notification
**Emotion**: Validation
**Action**: Check dashboard, share with friends
**Retention Impact**: +60%

#### Moment 3: "It's working!" (Day 7)
**Trigger**: 10+ customers enrolled
**Emotion**: Success
**Action**: Create first campaign
**Retention Impact**: +80%

### Emotional Journey

```
Registration → Onboarding → First Use → Habit Formation
     ↓              ↓            ↓              ↓
  Curious      Excited      Validated      Dependent

  Anxiety:     Anxiety:     Anxiety:       Anxiety:
  "Too hard?"  "Worth it?"  "Working?"     "What if stop?"

  Relief:      Relief:      Relief:        Relief:
  "Easy!"      "Done fast"  "Customers!"   "Growth!"
```

### Gamification Elements

#### Progress Tracking
```typescript
interface OnboardingProgress {
  setup_completed: boolean;      // ✅ Onboarding done
  qr_downloaded: boolean;         // 📥 QR saved
  first_customer: boolean;        // 👤 1st enrollment
  five_customers: boolean;        // 👥 5 enrollments
  first_campaign: boolean;        // 📧 1st campaign
  ten_stamps_issued: boolean;     // 🎯 10 stamps
  first_reward_redeemed: boolean; // 🎁 1st redemption
}
```

#### Achievement Badges
- 🥉 "First Steps" - Complete onboarding
- 🥈 "Growing" - 10 customers enrolled
- 🥇 "Thriving" - 50 customers enrolled
- 💎 "Master" - 100 stamps issued

---

## 6. Technical Requirements

### Database Schema Updates

```sql
-- Add onboarding tracking to businesses table
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS card_design JSONB DEFAULT '{}'::jsonb;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS brand_colors JSONB DEFAULT '{"primary": "#A855F7", "accent": "#F97316"}'::jsonb;
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS qr_downloaded BOOLEAN DEFAULT FALSE;

-- Track onboarding progress
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  step_completed VARCHAR(50) NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_onboarding_business ON onboarding_progress(business_id);
```

### Frontend Routes

```
/onboarding
  ├── /onboarding?step=1  (Welcome)
  ├── /onboarding?step=2  (Reward Config)
  ├── /onboarding?step=3  (Card Design)
  └── /onboarding?step=4  (QR & Launch)
```

### API Endpoints Needed

```typescript
// Update business with onboarding data
PATCH /api/v1/businesses/:id/onboarding
Body: {
  reward_structure: { stamps_required, reward_description },
  card_design: { template_id, brand_color_primary, brand_color_accent, logo_url },
  onboarding_completed: true
}

// Generate QR code with custom branding
GET /api/v1/businesses/:id/qr-code
Query: ?format=png&size=300&branded=true

// Upload logo/background
POST /api/v1/businesses/:id/upload
FormData: { file, type: 'logo' | 'background' }

// Track onboarding progress (analytics)
POST /api/v1/onboarding/track
Body: { business_id, step, action, metadata }
```

### Component Architecture

```
/frontend/src/app/onboarding/
  ├── page.tsx                 # Main wizard container
  ├── layout.tsx               # Full-screen layout (no sidebar)
  └── components/
      ├── WelcomeStep.tsx      # Step 1
      ├── RewardStep.tsx       # Step 2
      ├── DesignStep.tsx       # Step 3
      ├── LaunchStep.tsx       # Step 4
      ├── ProgressIndicator.tsx
      ├── TemplateGallery.tsx
      ├── ColorPicker.tsx
      ├── ImageUpload.tsx
      └── CardPreview.tsx      # Live preview component
```

### State Management

```typescript
// Zustand store for onboarding state
interface OnboardingStore {
  currentStep: number;
  rewardConfig: RewardConfig;
  cardDesign: CardDesign;
  qrCodeUrl: string;

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  updateReward: (config: RewardConfig) => void;
  updateDesign: (design: CardDesign) => void;
  completeOnboarding: () => Promise<void>;
}
```

---

## 7. Success Metrics

### Onboarding Funnel KPIs

```
Registration (100%)
    ↓
Start Onboarding (Goal: 95%)
    ↓
Complete Step 2 (Goal: 85%)
    ↓
Complete Step 3 (Goal: 80%)
    ↓
Complete Step 4 (Goal: 75%)
    ↓
Download QR (Goal: 70%)
    ↓
First Customer (Goal: 50% within 24h)
```

### Quality Metrics

- **Time to Complete**: Target < 3 minutes (Current design: ~2.5 min)
- **Drop-off Rate**: Target < 25% (Industry average: 40%)
- **Time to First Customer**: Target < 24 hours
- **QR Download Rate**: Target > 70%

---

## 8. Implementation Phases

### Phase 1: MVP (Essential)
**Effort**: 6-8 hours
- ✅ Step 1: Welcome (static content)
- ✅ Step 2: Reward config (form)
- ✅ Step 3: Template selection only (no customization)
- ✅ Step 4: QR code display + download
- ✅ Progress indicator
- ✅ Skip to dashboard option

### Phase 2: Enhanced (Delightful)
**Effort**: 4-6 hours
- ✅ Step 3: Full customization (colors, logo, background)
- ✅ Live card preview
- ✅ Template gallery with 6 designs
- ✅ Celebration animations
- ✅ Analytics tracking

### Phase 3: Advanced (Competitive)
**Effort**: 6-8 hours
- ✅ A/B testing different template orders
- ✅ Smart defaults based on business category
- ✅ Video tutorial integration
- ✅ WhatsApp onboarding message automation
- ✅ Referral invitation in Step 4

---

## Next Steps

1. **User Approval**: Review this UX design document
2. **Engineering Design**: Create technical architecture for implementation
3. **Development**: Build MVP (Phase 1) first
4. **User Testing**: Test with 5 real business owners
5. **Iterate**: Refine based on feedback
6. **Launch**: Deploy with analytics

---

**Questions for Discussion:**
1. Template gallery: 6 templates enough or need more?
2. Logo upload: Required or optional?
3. Skip option: Allow skipping or force completion?
4. Mobile experience: Build mobile-specific flow or responsive?
