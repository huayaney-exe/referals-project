# Onboarding Implementation Guide - Production Ready

## Status: Backend Complete ✅ | Frontend In Progress

---

## Completed Work

### ✅ Database Schema
**File**: `/supabase/migrations/20250110000000_onboarding_tracking.sql`

- Added `onboarding_completed`, `onboarding_completed_at`, `card_design`, `brand_colors` to `businesses` table
- Created `onboarding_progress` table for step tracking
- RLS policies configured
- Helper functions: `complete_onboarding()`, `track_onboarding_step()`

### ✅ Backend API Routes
**File**: `/src/api/onboarding/onboarding.routes.ts`
**Registered in**: `/src/index.ts`

**Endpoints**:
- `GET /api/v1/onboarding/status` - Check onboarding completion status
- `PATCH /api/v1/onboarding/step/:stepNumber` - Track step completion (analytics)
- `PATCH /api/v1/onboarding/complete` - Save all onboarding data
- `POST /api/v1/onboarding/upload` - Upload logo/background image (multer)
- `GET /api/v1/onboarding/templates` - Get card templates (6 templates)
- `GET /api/v1/onboarding/reward-templates` - Get reward description templates

---

## Frontend Implementation Plan

### Phase 1: Foundation (Now)
**Files to Create**:
```
/frontend/src/
  ├── app/onboarding/
  │   ├── page.tsx                    # Main wizard container
  │   ├── layout.tsx                  # Full-screen layout (no dashboard sidebar)
  │   └── components/
  │       ├── ProgressIndicator.tsx   # Step progress bar
  │       ├── WelcomeStep.tsx         # Step 1: Welcome & value prop
  │       ├── RewardStep.tsx          # Step 2: Reward configuration
  │       ├── DesignStep.tsx          # Step 3: Card design
  │       └── LaunchStep.tsx          # Step 4: QR code & celebration
  │
  ├── lib/stores/
  │   └── onboarding-store.ts         # Zustand state management
  │
  └── lib/hooks/
      └── useOnboarding.ts            # React Query mutations
```

### Phase 2: Core Components

#### 1. Onboarding Store (Zustand)
**File**: `/frontend/src/lib/stores/onboarding-store.ts`

```typescript
import { create } from 'zustand';

interface RewardConfig {
  stamps_required: number;
  reward_description: string;
  template_used?: string;
}

interface CardDesign {
  template_id: string;
  brand_color_primary: string;
  brand_color_accent: string;
  logo_url?: string;
  background_image_url?: string;
  use_gradient: boolean;
}

interface OnboardingStore {
  // State
  currentStep: number;
  rewardConfig: RewardConfig | null;
  cardDesign: CardDesign | null;
  stepStartTime: number;

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setRewardConfig: (config: RewardConfig) => void;
  setCardDesign: (design: CardDesign) => void;
  reset: () => void;
  getTimeSpent: () => number;
}

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  currentStep: 1,
  rewardConfig: null,
  cardDesign: null,
  stepStartTime: Date.now(),

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < 4) {
      set({ currentStep: currentStep + 1, stepStartTime: Date.now() });
    }
  },

  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 1) {
      set({ currentStep: currentStep - 1, stepStartTime: Date.now() });
    }
  },

  goToStep: (step) => {
    if (step >= 1 && step <= 4) {
      set({ currentStep: step, stepStartTime: Date.now() });
    }
  },

  setRewardConfig: (config) => set({ rewardConfig: config }),
  setCardDesign: (design) => set({ cardDesign: design }),
  reset: () => set({
    currentStep: 1,
    rewardConfig: null,
    cardDesign: null,
    stepStartTime: Date.now()
  }),

  getTimeSpent: () => Math.floor((Date.now() - get().stepStartTime) / 1000),
}));
```

#### 2. React Query Hooks
**File**: `/frontend/src/lib/hooks/useOnboarding.ts`

```typescript
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useOnboardingStatus() {
  return useQuery({
    queryKey: ['onboarding-status'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/onboarding/status`,
        { headers: { 'Authorization': `Bearer ${session?.access_token}` } }
      );
      if (!response.ok) throw new Error('Failed to fetch onboarding status');
      return response.json();
    },
  });
}

export function useCompleteOnboarding() {
  return useMutation({
    mutationFn: async (data: {
      reward_structure: any;
      card_design: any;
      qr_downloaded: boolean;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/onboarding/complete`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        }
      );
      if (!response.ok) throw new Error('Failed to complete onboarding');
      return response.json();
    },
  });
}

export function useTrackStep() {
  return useMutation({
    mutationFn: async ({
      stepNumber,
      timeSpent,
      metadata
    }: {
      stepNumber: number;
      timeSpent: number;
      metadata?: any;
    }) => {
      const { data: { session } } = await supabase.auth.getSession();
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/onboarding/step/${stepNumber}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            time_spent_seconds: timeSpent,
            metadata,
          }),
        }
      );
    },
  });
}

export function useCardTemplates() {
  return useQuery({
    queryKey: ['card-templates'],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/onboarding/templates`
      );
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      return data.templates;
    },
  });
}

export function useRewardTemplates() {
  return useQuery({
    queryKey: ['reward-templates'],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/onboarding/reward-templates`
      );
      if (!response.ok) throw new Error('Failed to fetch reward templates');
      const data = await response.json();
      return data.templates;
    },
  });
}
```

### Phase 3: UI Components (Next Response)

I'll build these in the next message to avoid token limits:
1. Progress Indicator
2. Welcome Step
3. Reward Step
4. Design Step
5. Launch Step
6. Main Wizard Container

### Phase 4: Post-Registration Redirect

**File**: `/frontend/src/lib/auth-context.tsx`

Add after successful registration:
```typescript
// Check if first login
const { data: business } = await supabase
  .from('businesses')
  .select('onboarding_completed')
  .eq('id', businessId)
  .single();

if (!business?.onboarding_completed) {
  router.push('/onboarding');
} else {
  router.push('/dashboard');
}
```

---

## Next Steps

1. **Build UI Components** (I'll do this in next response)
2. **Test backend endpoints** with Postman/Thunder Client
3. **Run database migration** on local Supabase
4. **Test end-to-end flow**
5. **Deploy to production**

---

## Testing Checklist

- [ ] Backend migration runs successfully
- [ ] All API endpoints return 200
- [ ] File upload works (logo/background)
- [ ] Onboarding wizard renders
- [ ] Step progression works
- [ ] Data saves to database
- [ ] Post-registration redirects to onboarding
- [ ] Post-onboarding redirects to dashboard
- [ ] QR code displays correctly
- [ ] Template selection works
- [ ] Color picker updates preview

---

**Ready to continue with UI components?**
