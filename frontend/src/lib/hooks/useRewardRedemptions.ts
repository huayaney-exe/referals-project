/**
 * Hook for tracking reward redemptions with real-time notifications
 *
 * Features:
 * - Real-time subscription to new reward redemptions
 * - Automatic customer data fetching for display
 * - Toast notification management
 * - Connection health monitoring
 *
 * Usage:
 * ```tsx
 * const { latestRedemption, dismissRedemption } = useRewardRedemptions(businessId);
 *
 * {latestRedemption && (
 *   <RewardRedemptionToast
 *     customerName={latestRedemption.customer.name}
 *     onDismiss={dismissRedemption}
 *   />
 * )}
 * ```
 */

import { useEffect, useState } from 'react';
import { createRealtimeChannel, type Tables } from '@/lib/supabase-client';
import { supabase } from '@/lib/supabase-client';
import { useQueryClient } from '@tanstack/react-query';

type RewardRedemption = Tables<'reward_redemptions'> & {
  customer: {
    name: string;
    phone: string;
  };
};

export function useRewardRedemptions(businessId: string) {
  const [latestRedemption, setLatestRedemption] = useState<RewardRedemption | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!businessId) return;

    console.log('[useRewardRedemptions] Setting up subscription for business:', businessId);

    // Subscribe to new reward redemptions
    const channel = createRealtimeChannel(
      `redemptions-${businessId}`,
      {
        table: 'reward_redemptions',
        filter: `business_id=eq.${businessId}`,
        event: 'INSERT',
        callback: async (payload) => {
          console.log('[useRewardRedemptions] New redemption detected:', payload.new);

          // Fetch full customer data for the redemption
          const { data: customer, error } = await supabase
            .from('customers')
            .select('name, phone')
            .eq('id', payload.new.customer_id)
            .single();

          if (error) {
            console.error('[useRewardRedemptions] Failed to fetch customer:', error);
            return;
          }

          if (customer) {
            setLatestRedemption({
              ...payload.new,
              customer,
            } as RewardRedemption);

            // Invalidate analytics queries to refresh dashboard stats
            queryClient.invalidateQueries({ queryKey: ['customer-activity'] });
            queryClient.invalidateQueries({ queryKey: ['stamp-timeline'] });
          }
        },
        onError: (error) => {
          console.error('[useRewardRedemptions] Subscription error:', error);
        },
      }
    );

    return () => {
      console.log('[useRewardRedemptions] Cleaning up subscription');
      channel.unsubscribe();
    };
  }, [businessId, queryClient]);

  const dismissRedemption = () => {
    console.log('[useRewardRedemptions] Dismissing redemption notification');
    setLatestRedemption(null);
  };

  return {
    latestRedemption,
    dismissRedemption,
  };
}
