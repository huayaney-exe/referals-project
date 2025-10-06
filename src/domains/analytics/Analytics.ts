import { supabaseAdmin } from '../../config/supabase';

export interface BusinessMetrics {
  total_customers: number;
  total_stamps: number;
  total_rewards: number;
  avg_stamps_per_customer: number;
}

export interface TimeSeriesData {
  date: string;
  count: number;
}

export class AnalyticsService {
  static async getBusinessMetrics(business_id: string): Promise<BusinessMetrics> {
    const [customers, stamps, rewards] = await Promise.all([
      supabaseAdmin.from('customers').select('*', { count: 'exact', head: true }).eq('business_id', business_id),
      supabaseAdmin.from('stamps').select('*', { count: 'exact', head: true }).eq('business_id', business_id),
      supabaseAdmin.from('stamps').select('*', { count: 'exact', head: true }).eq('business_id', business_id).eq('is_reward_redemption', true),
    ]);

    const totalCustomers = customers.count || 0;
    const totalStamps = stamps.count || 0;
    const totalRewards = rewards.count || 0;

    return {
      total_customers: totalCustomers,
      total_stamps: totalStamps,
      total_rewards: totalRewards,
      avg_stamps_per_customer: totalCustomers > 0 ? totalStamps / totalCustomers : 0,
    };
  }

  static async getStampsTimeSeries(business_id: string, days = 30): Promise<TimeSeriesData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabaseAdmin
      .from('stamps')
      .select('stamped_at')
      .eq('business_id', business_id)
      .gte('stamped_at', startDate.toISOString());

    if (error) throw error;

    // Group by date
    const grouped = (data || []).reduce((acc: Record<string, number>, stamp) => {
      const date = new Date(stamp.stamped_at).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([date, count]) => ({ date, count }));
  }

  static async getTopCustomers(business_id: string, limit = 10) {
    const { data, error } = await supabaseAdmin
      .from('customers')
      .select('id, name, stamps_count, total_rewards_earned')
      .eq('business_id', business_id)
      .order('stamps_count', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}
