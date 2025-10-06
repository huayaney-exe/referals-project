import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export interface Campaign {
  id: string;
  business_id: string;
  name: string;
  message_template: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  sent_count: number | null;
  failed_count: number | null;
  created_at: string;
  activated_at: string | null;
}

export function useCampaigns(businessId: string) {
  return useQuery({
    queryKey: ['campaigns', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!businessId,
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: {
      business_id: string;
      name: string;
      message_template: string;
      trigger_type?: string;
      trigger_config?: any;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({ ...campaign, status: campaign.status || 'draft' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useUpdateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Campaign>;
    }) => {
      const { data, error} = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select('*')
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}
