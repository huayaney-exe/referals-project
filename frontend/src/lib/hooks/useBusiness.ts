import { useQuery } from '@tanstack/react-query';
import { supabase } from '../supabase';

export interface Business {
  id: string;
  name: string;
  logo_url: string | null;
  qr_code_url: string | null;
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  } | null;
  reward_structure: {
    stamps_required: number;
    reward_description: string;
  };
  card_design: {
    template: string;
    colors: {
      primary: string;
      secondary: string;
    };
  } | null;
  qr_downloaded: boolean;
  onboarding_completed: boolean;
}

export function useBusiness(businessId: string) {
  return useQuery({
    queryKey: ['business', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      return data as Business;
    },
    enabled: !!businessId,
  });
}
