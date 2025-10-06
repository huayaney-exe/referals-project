import { supabaseAdmin } from '../../config/supabase';
import { BusinessLogicError } from '../types';

export interface StampResult {
  new_stamps_count: number;
  is_reward_earned: boolean;
  stamp_id: string;
}

export interface Stamp {
  id: string;
  customer_id: string;
  business_id: string;
  stamped_at: string;
  stamped_by: string | null;
  is_reward_redemption: boolean;
  stamps_before: number;
  stamps_after: number;
  idempotency_key: string | null;
  metadata: Record<string, unknown>;
}

export class StampService {
  /**
   * Add stamp using stored procedure (transactional outbox pattern)
   */
  static async addStamp(
    customer_id: string,
    business_id: string,
    stamped_by = 'system',
    idempotency_key: string | null = null
  ): Promise<StampResult> {
    const { data, error } = await supabaseAdmin.rpc('add_stamp_with_outbox', {
      p_customer_id: customer_id,
      p_business_id: business_id,
      p_stamped_by: stamped_by,
      p_idempotency_key: idempotency_key,
    });

    if (error) {
      if (error.message.includes('Duplicate stamp operation')) {
        throw new BusinessLogicError('Duplicate stamp operation');
      }
      if (error.message.includes('Customer not found')) {
        throw new BusinessLogicError('Customer not found');
      }
      if (error.message.includes('concurrent update')) {
        throw new BusinessLogicError('Concurrent stamp operation detected');
      }
      throw error;
    }

    const result = Array.isArray(data) ? data[0] : data;
    return result as StampResult;
  }

  /**
   * Get stamp history for customer
   */
  static async getHistory(customer_id: string, limit = 50): Promise<Stamp[]> {
    const { data, error } = await supabaseAdmin
      .from('stamps')
      .select('*')
      .eq('customer_id', customer_id)
      .order('stamped_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as Stamp[]) || [];
  }

  /**
   * Get stamps for business
   */
  static async getByBusiness(business_id: string, limit = 100): Promise<Stamp[]> {
    const { data, error } = await supabaseAdmin
      .from('stamps')
      .select('*')
      .eq('business_id', business_id)
      .order('stamped_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data as Stamp[]) || [];
  }

  /**
   * Count total stamps for business
   */
  static async countByBusiness(business_id: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('stamps')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', business_id);

    if (error) throw error;
    return count || 0;
  }

  /**
   * Count rewards redeemed
   */
  static async countRewards(business_id: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from('stamps')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', business_id)
      .eq('is_reward_redemption', true);

    if (error) throw error;
    return count || 0;
  }
}
