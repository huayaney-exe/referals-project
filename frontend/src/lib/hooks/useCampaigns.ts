import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export interface Campaign {
  id: string;
  business_id: string;
  name: string;
  message: string; // DB schema uses 'message', not 'message_template'
  status: 'draft' | 'active' | 'paused' | 'completed' | null;
  sent_count: number | null;
  created_at: string | null;
  // Note: failed_count and activated_at removed - not in database schema
}

export function useCampaigns(businessId: string) {
  return useQuery({
    queryKey: ['campaigns', businessId],
    queryFn: async () => {
      console.log('Fetching campaigns for businessId:', businessId); // Debug log
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        throw error;
      }
      console.log('Fetched campaigns:', data); // Debug log
      return data as Campaign[];
    },
    enabled: !!businessId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 0, // Always refetch to ensure fresh data
  });
}

export function useCreateCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaign: {
      business_id: string;
      name: string;
      message: string; // DB schema uses 'message'
      trigger_type?: string;
      trigger_config?: any;
      status?: string;
    }) => {
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          ...campaign,
          status: campaign.status || 'draft',
        })
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

export function useDeleteCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
}

export function useToggleCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, currentStatus }: { id: string; currentStatus: string }) => {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      const { data, error } = await supabase
        .from('campaigns')
        .update({ status: newStatus })
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
