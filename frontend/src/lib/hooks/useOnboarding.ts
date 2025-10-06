import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface OnboardingCompleteData {
  reward_structure: {
    stamps_required: number;
    reward_description: string;
    template_used?: string;
  };
  card_design: {
    template_id: string;
    brand_color_primary: string;
    brand_color_accent: string;
    logo_url?: string;
    background_image_url?: string;
    use_gradient: boolean;
  };
  qr_downloaded: boolean;
}

async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error('No active session');
  }

  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

// Check onboarding status
export function useOnboardingStatus() {
  return useQuery({
    queryKey: ['onboarding-status'],
    queryFn: async () => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/onboarding/status`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch onboarding status');
      }

      return response.json();
    },
  });
}

// Complete onboarding
export function useCompleteOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: OnboardingCompleteData) => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/onboarding/complete`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || 'Failed to complete onboarding');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}

// Track step completion (analytics)
export function useTrackStep() {
  return useMutation({
    mutationFn: async ({
      stepNumber,
      timeSpent,
      metadata,
    }: {
      stepNumber: number;
      timeSpent: number;
      metadata?: any;
    }) => {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/onboarding/step/${stepNumber}`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            time_spent_seconds: timeSpent,
            metadata,
          }),
        }
      );

      if (!response.ok) {
        // Don't throw - analytics tracking is non-critical
        console.error('Failed to track onboarding step');
      }

      return response.json().catch(() => ({}));
    },
  });
}

// Get card templates
export function useCardTemplates() {
  return useQuery({
    queryKey: ['card-templates'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/onboarding/templates`);

      if (!response.ok) {
        throw new Error('Failed to fetch card templates');
      }

      const data = await response.json();
      return data.templates;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get reward templates
export function useRewardTemplates() {
  return useQuery({
    queryKey: ['reward-templates'],
    queryFn: async () => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/onboarding/reward-templates`);

      if (!response.ok) {
        throw new Error('Failed to fetch reward templates');
      }

      const data = await response.json();
      return data.templates;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Upload image (logo or background)
export function useUploadImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, type }: { file: File; type: 'logo' | 'background' }) => {
      const headers = await getAuthHeaders();
      delete (headers as any)['Content-Type']; // Let browser set multipart boundary

      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/onboarding/upload`, {
        method: 'POST',
        headers: {
          Authorization: headers.Authorization,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || 'Failed to upload image');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['onboarding-status'] });
    },
  });
}
