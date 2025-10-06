import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';

export interface Customer {
  id: string;
  business_id: string;
  phone: string;
  name: string;
  stamps_count: number | null;
  enrolled_at: string;
  last_activity_at: string | null;
  created_at: string;
}

export function useCustomers(businessId: string, search?: string) {
  return useQuery({
    queryKey: ['customers', businessId, search],
    queryFn: async () => {
      let query = supabase
        .from('customers')
        .select('*')
        .eq('business_id', businessId)
        .order('enrolled_at', { ascending: false });

      if (search) {
        query = query.or(`phone.ilike.%${search}%,name.ilike.%${search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Customer[];
    },
    enabled: !!businessId,
  });
}

export function useCustomer(customerId: string) {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) throw error;
      return data as Customer;
    },
    enabled: !!customerId,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (customer: {
      business_id: string;
      phone: string;
      name: string;
    }) => {
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}
