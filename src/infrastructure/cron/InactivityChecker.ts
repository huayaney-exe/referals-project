import * as cron from 'node-cron';
import { supabaseAdmin } from '../../config/supabase';
import { campaignEventEmitter } from '../events/EventEmitter';

export class InactivityChecker {
  private cronJob: cron.ScheduledTask | null = null;

  /**
   * Start the inactivity checker cron job
   * Runs daily at 10:00 AM to check for inactive customers
   */
  start() {
    // Run daily at 10:00 AM
    this.cronJob = cron.schedule('0 10 * * *', async () => {
      console.log('Running inactivity checker...');
      await this.checkInactiveCustomers();
    });

    console.log('Inactivity checker cron job started (daily at 10:00 AM)');
  }

  /**
   * Stop the cron job
   */
  stop() {
    if (this.cronJob) {
      this.cronJob.stop();
      console.log('Inactivity checker cron job stopped');
    }
  }

  /**
   * Check for inactive customers and emit events
   */
  private async checkInactiveCustomers() {
    try {
      // Get all active campaigns with days_inactive trigger
      const { data: campaigns } = await supabaseAdmin
        .from('campaigns')
        .select('business_id, trigger_config')
        .eq('status', 'active')
        .eq('trigger_type', 'days_inactive');

      if (!campaigns || campaigns.length === 0) {
        console.log('No active days_inactive campaigns found');
        return;
      }

      // Group campaigns by business and get unique day thresholds
      const businessThresholds = new Map<string, Set<number>>();

      for (const campaign of campaigns) {
        const businessId = campaign.business_id;
        const days = campaign.trigger_config?.value;

        if (!days) continue;

        if (!businessThresholds.has(businessId)) {
          businessThresholds.set(businessId, new Set());
        }
        businessThresholds.get(businessId)!.add(days);
      }

      // Check each business's customers
      for (const [businessId, dayThresholds] of businessThresholds.entries()) {
        for (const days of dayThresholds) {
          await this.checkBusinessCustomersInactive(businessId, days);
        }
      }
    } catch (error) {
      console.error('Error in inactivity checker:', error);
    }
  }

  /**
   * Check customers for a specific business and inactivity threshold
   */
  private async checkBusinessCustomersInactive(businessId: string, days: number) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - days);

    // Find customers whose last_activity_at is exactly 'days' ago (within 24-hour window)
    const windowStart = new Date(thresholdDate);
    windowStart.setHours(0, 0, 0, 0);

    const windowEnd = new Date(thresholdDate);
    windowEnd.setHours(23, 59, 59, 999);

    const { data: customers } = await supabaseAdmin
      .from('customers')
      .select('id, name')
      .eq('business_id', businessId)
      .gte('last_activity_at', windowStart.toISOString())
      .lte('last_activity_at', windowEnd.toISOString());

    if (!customers || customers.length === 0) {
      console.log(`No customers inactive for exactly ${days} days in business ${businessId}`);
      return;
    }

    console.log(`Found ${customers.length} customers inactive for ${days} days in business ${businessId}`);

    // Emit event for each inactive customer
    for (const customer of customers) {
      campaignEventEmitter.emitCustomerInactive(businessId, customer.id, days);
    }
  }

  /**
   * Run the checker immediately (for testing)
   */
  async runNow() {
    console.log('Running inactivity checker manually...');
    await this.checkInactiveCustomers();
  }
}

// Singleton instance
export const inactivityChecker = new InactivityChecker();
