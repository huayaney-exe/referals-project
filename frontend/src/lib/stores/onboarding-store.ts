import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RewardConfig {
  stamps_required: number;
  reward_description: string;
  template_used?: string;
}

export interface CardDesign {
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
  completedSteps: number[];

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setRewardConfig: (config: RewardConfig) => void;
  setCardDesign: (design: CardDesign) => void;
  markStepComplete: (step: number) => void;
  reset: () => void;
  getTimeSpent: () => number;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentStep: 1,
      rewardConfig: null,
      cardDesign: {
        template_id: 'modern',
        brand_color_primary: '#A855F7',
        brand_color_accent: '#F97316',
        use_gradient: true,
      },
      stepStartTime: Date.now(),
      completedSteps: [],

      // Navigation
      nextStep: () => {
        const { currentStep, completedSteps } = get();
        if (currentStep < 4) {
          const newStep = currentStep + 1;
          set({
            currentStep: newStep,
            stepStartTime: Date.now(),
            completedSteps: [...new Set([...completedSteps, currentStep])],
          });
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({
            currentStep: currentStep - 1,
            stepStartTime: Date.now(),
          });
        }
      },

      goToStep: (step) => {
        if (step >= 1 && step <= 4) {
          set({
            currentStep: step,
            stepStartTime: Date.now(),
          });
        }
      },

      // Data updates
      setRewardConfig: (config) => set({ rewardConfig: config }),

      setCardDesign: (design) => set({ cardDesign: design }),

      markStepComplete: (step) => {
        const { completedSteps } = get();
        set({
          completedSteps: [...new Set([...completedSteps, step])],
        });
      },

      // Utility
      reset: () =>
        set({
          currentStep: 1,
          rewardConfig: null,
          cardDesign: {
            template_id: 'modern',
            brand_color_primary: '#A855F7',
            brand_color_accent: '#F97316',
            use_gradient: true,
          },
          stepStartTime: Date.now(),
          completedSteps: [],
        }),

      getTimeSpent: () => Math.floor((Date.now() - get().stepStartTime) / 1000),
    }),
    {
      name: 'seya-onboarding-storage',
      skipHydration: true,
      partialize: (state) => ({
        rewardConfig: state.rewardConfig,
        cardDesign: state.cardDesign,
        currentStep: state.currentStep,
      }),
    }
  )
);
