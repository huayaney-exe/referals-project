import Queue, { Job } from 'bull';
import { supabaseAdmin } from '../../config/supabase';

export interface AnalyticsJob {
  businessId: string;
  snapshotDate: string; // YYYY-MM-DD
  periodType: 'daily' | 'weekly' | 'monthly';
}

export interface AnalyticsSnapshot {
  business_id: string;
  snapshot_date: string;
  period_type: 'daily' | 'weekly' | 'monthly';
  total_customers: number;
  new_customers: number;
  active_customers: number;
  churned_customers: number;
  total_stamps_issued: number;
  total_stamps_redeemed: number;
  avg_stamps_per_customer: number;
  campaigns_sent: number;
  campaign_messages_sent: number;
  campaign_success_rate: number;
  enrollment_rate: number;
  redemption_rate: number;
  avg_days_to_redemption: number;
}

export class AnalyticsWorker {
  private queue: Queue.Queue<AnalyticsJob>;

  constructor(redisUrl: string = process.env.REDIS_URL || 'redis://localhost:6379') {
    this.queue = new Queue<AnalyticsJob>('analytics-snapshots', redisUrl, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 10000,
        },
        removeOnComplete: 50,
        removeOnFail: false,
      },
    });

    this.setupProcessor();
    this.setupScheduledJobs();
  }

  private setupProcessor(): void {
    this.queue.process(5, async (job: Job<AnalyticsJob>) => {
      await this.processAnalytics(job);
    });

    this.queue.on('completed', (job: Job) => {
      console.log(`Analytics snapshot completed: ${job.id}`);
    });

    this.queue.on('failed', (job: Job, err: Error) => {
      console.error(`Analytics snapshot failed: ${job.id}`, err);
    });
  }

  private setupScheduledJobs(): void {
    // Daily snapshots at 3 AM Peru time (GMT-5)
    this.queue.add(
      {
        businessId: 'ALL',
        snapshotDate: new Date().toISOString().split('T')[0],
        periodType: 'daily',
      },
      {
        repeat: {
          cron: '0 3 * * *', // 3 AM daily
          tz: 'America/Lima',
        },
        jobId: 'daily-analytics-snapshot',
      }
    );

    // Weekly snapshots every Monday at 3 AM
    this.queue.add(
      {
        businessId: 'ALL',
        snapshotDate: new Date().toISOString().split('T')[0],
        periodType: 'weekly',
      },
      {
        repeat: {
          cron: '0 3 * * 1', // Monday at 3 AM
          tz: 'America/Lima',
        },
        jobId: 'weekly-analytics-snapshot',
      }
    );

    // Monthly snapshots on 1st of month at 3 AM
    this.queue.add(
      {
        businessId: 'ALL',
        snapshotDate: new Date().toISOString().split('T')[0],
        periodType: 'monthly',
      },
      {
        repeat: {
          cron: '0 3 1 * *', // 1st of month at 3 AM
          tz: 'America/Lima',
        },
        jobId: 'monthly-analytics-snapshot',
      }
    );
  }

  private async processAnalytics(job: Job<AnalyticsJob>): Promise<void> {
    const { businessId, snapshotDate, periodType } = job.data;

    if (businessId === 'ALL') {
      // Process for all businesses
      const { data: businesses } = await supabaseAdmin.from('businesses').select('id');

      if (businesses) {
        for (const business of businesses) {
          await this.generateSnapshot(business.id, snapshotDate, periodType);
        }
      }
    } else {
      // Process for single business
      await this.generateSnapshot(businessId, snapshotDate, periodType);
    }
  }

  private async generateSnapshot(
    businessId: string,
    snapshotDate: string,
    periodType: 'daily' | 'weekly' | 'monthly'
  ): Promise<void> {
    const dateRange = this.getDateRange(snapshotDate, periodType);

    // Customer metrics
    const { count: totalCustomersCount } = await supabaseAdmin
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .lte('enrolled_at', dateRange.end);

    const { count: newCustomersCount } = await supabaseAdmin
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('enrolled_at', dateRange.start)
      .lte('enrolled_at', dateRange.end);

    const { count: activeCustomersCount } = await supabaseAdmin
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .gte('last_activity_at', dateRange.start);

    // Stamp metrics
    const { data: stampsData } = await supabaseAdmin
      .from('stamps')
      .select('status')
      .eq('business_id', businessId)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    const totalStampsIssued = stampsData?.length || 0;
    const totalStampsRedeemed = stampsData?.filter((s) => s.status === 'redeemed').length || 0;

    const { data: customersWithStamps } = await supabaseAdmin
      .from('customers')
      .select('stamps_count')
      .eq('business_id', businessId)
      .gt('stamps_count', 0);

    const avgStampsPerCustomer =
      customersWithStamps && customersWithStamps.length > 0
        ? customersWithStamps.reduce((sum, c) => sum + (c.stamps_count || 0), 0) /
          customersWithStamps.length
        : 0;

    // Campaign metrics
    const { data: campaigns } = await supabaseAdmin
      .from('campaigns')
      .select('id, sent_count, failed_count')
      .eq('business_id', businessId)
      .gte('sent_at', dateRange.start)
      .lte('sent_at', dateRange.end);

    const campaignsSent = campaigns?.length || 0;
    const campaignMessagesSent = campaigns?.reduce((sum, c) => sum + (c.sent_count || 0), 0) || 0;
    const campaignMessagesTotal =
      campaigns?.reduce((sum, c) => sum + (c.sent_count || 0) + (c.failed_count || 0), 0) || 0;
    const campaignSuccessRate =
      campaignMessagesTotal > 0 ? (campaignMessagesSent / campaignMessagesTotal) * 100 : 0;

    // Engagement metrics
    const enrollmentRate =
      (totalCustomersCount || 0) > 0
        ? ((newCustomersCount || 0) / (totalCustomersCount || 1)) * 100
        : 0;

    const redemptionRate =
      totalStampsIssued > 0 ? (totalStampsRedeemed / totalStampsIssued) * 100 : 0;

    // Days to redemption calculation
    const { data: redemptionData } = await supabaseAdmin.rpc('calculate_avg_days_to_redemption', {
      p_business_id: businessId,
      p_start_date: dateRange.start,
      p_end_date: dateRange.end,
    });

    const avgDaysToRedemption = redemptionData || 0;

    // Churned customers (no activity in 90+ days)
    const churnDate = new Date(dateRange.end);
    churnDate.setDate(churnDate.getDate() - 90);
    const { count: churnedCustomersCount } = await supabaseAdmin
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .lt('last_activity_at', churnDate.toISOString());

    // Upsert snapshot
    const snapshot: AnalyticsSnapshot = {
      business_id: businessId,
      snapshot_date: snapshotDate,
      period_type: periodType,
      total_customers: totalCustomersCount || 0,
      new_customers: newCustomersCount || 0,
      active_customers: activeCustomersCount || 0,
      churned_customers: churnedCustomersCount || 0,
      total_stamps_issued: totalStampsIssued,
      total_stamps_redeemed: totalStampsRedeemed,
      avg_stamps_per_customer: parseFloat(avgStampsPerCustomer.toFixed(2)),
      campaigns_sent: campaignsSent,
      campaign_messages_sent: campaignMessagesSent,
      campaign_success_rate: parseFloat(campaignSuccessRate.toFixed(2)),
      enrollment_rate: parseFloat(enrollmentRate.toFixed(2)),
      redemption_rate: parseFloat(redemptionRate.toFixed(2)),
      avg_days_to_redemption: parseFloat(avgDaysToRedemption.toFixed(2)),
    };

    await supabaseAdmin
      .from('analytics_snapshots')
      .upsert(snapshot, { onConflict: 'business_id,snapshot_date,period_type' });
  }

  private getDateRange(
    snapshotDate: string,
    periodType: 'daily' | 'weekly' | 'monthly'
  ): { start: string; end: string } {
    const date = new Date(snapshotDate);

    if (periodType === 'daily') {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return {
        start: start.toISOString(),
        end: end.toISOString(),
      };
    }

    if (periodType === 'weekly') {
      // Week starts on Monday
      const dayOfWeek = date.getDay();
      const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0
      const start = new Date(date);
      start.setDate(date.getDate() - diff);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return {
        start: start.toISOString(),
        end: end.toISOString(),
      };
    }

    // Monthly
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    end.setHours(23, 59, 59, 999);
    return {
      start: start.toISOString(),
      end: end.toISOString(),
    };
  }

  async queueSnapshot(analyticsJob: AnalyticsJob): Promise<string> {
    const job = await this.queue.add(analyticsJob, {
      jobId: `${analyticsJob.businessId}-${analyticsJob.snapshotDate}-${analyticsJob.periodType}`,
    });
    return job.id as string;
  }

  async getStats() {
    return {
      waiting: await this.queue.getWaitingCount(),
      active: await this.queue.getActiveCount(),
      completed: await this.queue.getCompletedCount(),
      failed: await this.queue.getFailedCount(),
      delayed: await this.queue.getDelayedCount(),
    };
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}
