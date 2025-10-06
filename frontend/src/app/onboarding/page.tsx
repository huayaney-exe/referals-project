'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useOnboardingStore } from '@/lib/stores/onboarding-store';
import { useOnboardingStatus, useCompleteOnboarding, useTrackStep } from '@/lib/hooks/useOnboarding';
import { ProgressIndicator } from './components/ProgressIndicator';
import { WelcomeStep } from './components/WelcomeStep';
import { RewardStep } from './components/RewardStep';
import { DesignStep } from './components/DesignStep';
import { LaunchStep } from './components/LaunchStep';
import type { RewardConfig, CardDesign } from '@/lib/stores/onboarding-store';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const {
    currentStep,
    rewardConfig,
    cardDesign,
    completedSteps,
    nextStep,
    prevStep,
    goToStep,
    setRewardConfig,
    setCardDesign,
    markStepComplete,
    getTimeSpent,
  } = useOnboardingStore();

  const { data: onboardingStatus, isLoading: statusLoading } = useOnboardingStatus();
  const completeOnboardingMutation = useCompleteOnboarding();
  const trackStepMutation = useTrackStep();

  // Redirect if already onboarded
  useEffect(() => {
    if (!statusLoading && onboardingStatus?.onboarding_completed) {
      router.push('/dashboard');
    }
  }, [onboardingStatus, statusLoading, router]);

  // Track step analytics
  const trackStepCompletion = (stepNumber: number, metadata?: any) => {
    const timeSpent = getTimeSpent();
    trackStepMutation.mutate({ stepNumber, timeSpent, metadata });
  };

  // Step Handlers
  const handleWelcomeNext = () => {
    trackStepCompletion(0, { action: 'welcome_completed' });
    markStepComplete(1);
    nextStep();
  };

  const handleRewardNext = (config: RewardConfig) => {
    setRewardConfig(config);
    trackStepCompletion(1, {
      stamps_required: config.stamps_required,
      template_used: config.template_used,
    });
    markStepComplete(2);
    nextStep();
  };

  const handleDesignNext = (design: CardDesign) => {
    setCardDesign(design);
    trackStepCompletion(2, {
      template_id: design.template_id,
      has_logo: !!design.logo_url,
      has_background: !!design.background_image_url,
    });
    markStepComplete(3);
    nextStep();
  };

  const handleLaunchComplete = async (qrDownloaded: boolean) => {
    const businessId = user?.user_metadata?.business_id;
    if (!rewardConfig || !cardDesign || !businessId) return;

    trackStepCompletion(3, { qr_downloaded: qrDownloaded });
    markStepComplete(4);

    try {
      await completeOnboardingMutation.mutateAsync({
        reward_structure: rewardConfig,
        card_design: cardDesign,
        qr_downloaded: qrDownloaded,
      });

      // Success - redirect to dashboard
      router.push('/dashboard?onboarding=complete');
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      alert('Error al completar la configuración. Por favor intenta de nuevo.');
    }
  };

  // Loading states
  if (authLoading || statusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚙️</div>
          <div className="text-gray-600">Cargando...</div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    router.push('/login');
    return null;
  }

  const businessName = user.user_metadata?.business_name || 'Tu Negocio';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-8">
        {/* Progress Indicator */}
        {currentStep > 1 && (
          <ProgressIndicator
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={goToStep}
          />
        )}

        {/* Step Content */}
        <div className="mt-8">
          {currentStep === 1 && (
            <WelcomeStep businessName={businessName} onNext={handleWelcomeNext} />
          )}

          {currentStep === 2 && (
            <RewardStep
              initialConfig={rewardConfig}
              onNext={handleRewardNext}
              onBack={prevStep}
            />
          )}

          {currentStep === 3 && rewardConfig && (
            <DesignStep
              initialDesign={cardDesign}
              rewardDescription={rewardConfig.reward_description}
              stampsRequired={rewardConfig.stamps_required}
              businessName={businessName}
              onNext={handleDesignNext}
              onBack={prevStep}
            />
          )}

          {currentStep === 4 && user.user_metadata?.business_id && (
            <LaunchStep
              businessId={user.user_metadata.business_id}
              businessName={businessName}
              qrDownloaded={false}
              onComplete={handleLaunchComplete}
              onBack={prevStep}
            />
          )}
        </div>

        {/* Loading Overlay */}
        {completeOnboardingMutation.isPending && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="animate-spin text-6xl mb-4">⚙️</div>
              <div className="text-xl font-semibold">Guardando configuración...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
