import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

/**
 * Hook to detect and celebrate the first customer enrollment
 * Shows celebration only once per session using localStorage
 */
export function useFirstCustomerCelebration(businessId: string) {
  const [shouldCelebrate, setShouldCelebrate] = useState(false);

  useEffect(() => {
    if (!businessId) return;

    const storageKey = `first-customer-celebrated-${businessId}`;
    const alreadyCelebrated = localStorage.getItem(storageKey);

    if (alreadyCelebrated) return;

    // Subscribe to customer count changes
    const checkFirstCustomer = async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id', { count: 'exact', head: false })
        .eq('business_id', businessId)
        .limit(1);

      if (error) {
        console.error('Error checking customer count:', error);
        return;
      }

      // If we have exactly 1 customer and haven't celebrated yet
      if (data && data.length === 1) {
        setShouldCelebrate(true);
        localStorage.setItem(storageKey, 'true');
      }
    };

    // Check immediately
    checkFirstCustomer();

    // Set up realtime subscription for new customers
    const subscription = supabase
      .channel(`first-customer-${businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'customers',
          filter: `business_id=eq.${businessId}`,
        },
        () => {
          checkFirstCustomer();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [businessId]);

  const dismissCelebration = () => {
    setShouldCelebrate(false);
  };

  return { shouldCelebrate, dismissCelebration };
}
