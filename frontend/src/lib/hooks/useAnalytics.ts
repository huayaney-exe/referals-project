'use client';

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface AnalyticsSnapshot {
  id: string;
  business_id: string;
  snapshot_date: string;
  active_customers: number;
  total_stamps: number;
  rewards_issued: number;
  churn_rate: number | null;
  retention_rate: number | null;
  created_at: string;
}

export interface CustomerActivityMetrics {
  total_customers: number;
  active_customers: number;
  at_risk_customers: number;
  avg_stamps_per_customer: number;
}

export interface CampaignPerformanceMetrics {
  campaign_id: string;
  campaign_name: string;
  sent_count: number;
  success_rate: number;
}

export interface StampTimelineData {
  date: string;
  count: number;
}

/**
 * Fetch analytics snapshots for a date range
 */
export function useAnalyticsSnapshots(
  businessId: string,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: ['analytics-snapshots', businessId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_snapshots')
        .select('*')
        .eq('business_id', businessId)
        .gte('snapshot_date', startDate)
        .lte('snapshot_date', endDate)
        .order('snapshot_date', { ascending: true });

      if (error) throw error;
      return data as unknown as AnalyticsSnapshot[];
    },
    enabled: !!businessId,
  });
}

/**
 * Fetch customer activity metrics
 */
export function useCustomerActivityMetrics(businessId: string) {
  return useQuery({
    queryKey: ['customer-activity', businessId],
    queryFn: async () => {
      // Fetch all customers
      const { data: customers, error: customersError } = await supabase
        .from('customers')
        .select('id, stamps_count, last_stamp_at')
        .eq('business_id', businessId);

      if (customersError) {
        console.error('[useCustomerActivityMetrics] Supabase error:', {
          message: customersError.message,
          details: customersError.details,
          hint: customersError.hint,
          code: customersError.code,
        });
        throw customersError;
      }

      const total_customers = customers?.length || 0;

      // Active: has activity in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const active_customers = customers?.filter(c => {
        if (!c.last_stamp_at) return false;
        return new Date(c.last_stamp_at) >= thirtyDaysAgo;
      }).length || 0;

      // At risk: has activity but not in last 14 days
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

      const at_risk_customers = customers?.filter(c => {
        if (!c.last_stamp_at) return false;
        const lastActivity = new Date(c.last_stamp_at);
        return lastActivity < fourteenDaysAgo && lastActivity >= thirtyDaysAgo;
      }).length || 0;

      // Average stamps
      const total_stamps = customers?.reduce((sum, c) => sum + (c.stamps_count || 0), 0) || 0;
      const avg_stamps_per_customer = total_customers > 0 ? total_stamps / total_customers : 0;

      return {
        total_customers,
        active_customers,
        at_risk_customers,
        avg_stamps_per_customer: Math.round(avg_stamps_per_customer * 10) / 10,
      } as CustomerActivityMetrics;
    },
    enabled: !!businessId,
  });
}

/**
 * Fetch campaign performance metrics
 */
export function useCampaignPerformance(businessId: string) {
  return useQuery({
    queryKey: ['campaign-performance', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaigns')
        .select('id, name, sent_count')
        .eq('business_id', businessId)
        .eq('status', 'active');

      if (error) throw error;

      return data?.map(campaign => ({
        campaign_id: campaign.id,
        campaign_name: campaign.name,
        sent_count: campaign.sent_count || 0,
        success_rate: 100, // TODO: Track failed_count when column exists
      })) as CampaignPerformanceMetrics[];
    },
    enabled: !!businessId,
  });
}

/**
 * Fetch stamp timeline data (daily stamps for chart)
 */
export function useStampTimeline(
  businessId: string,
  startDate: string,
  endDate: string
) {
  return useQuery({
    queryKey: ['stamp-timeline', businessId, startDate, endDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stamps')
        .select('stamped_at')
        .eq('business_id', businessId)
        .gte('stamped_at', startDate)
        .lte('stamped_at', endDate)
        .order('stamped_at', { ascending: true });

      if (error) {
        console.error('[useStampTimeline] Supabase error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          query: { businessId, startDate, endDate },
        });
        throw error;
      }

      // Group by date
      const grouped = data?.reduce((acc, stamp) => {
        if (!stamp.stamped_at) return acc; // Skip if stamped_at is null
        const date = new Date(stamp.stamped_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      return Object.entries(grouped).map(([date, count]) => ({
        date,
        count,
      })) as StampTimelineData[];
    },
    enabled: !!businessId,
  });
}

/**
 * Fetch latest analytics snapshot (for quick overview)
 */
export function useLatestAnalytics(businessId: string) {
  return useQuery({
    queryKey: ['latest-analytics', businessId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('analytics_snapshots')
        .select('*')
        .eq('business_id', businessId)
        .order('snapshot_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
      return data as AnalyticsSnapshot | null;
    },
    enabled: !!businessId,
  });
}
