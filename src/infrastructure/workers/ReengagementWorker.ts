import Queue, { Job } from 'bull';
import { supabaseAdmin } from '../../config/supabase';
import { EvolutionWhatsAppService } from '../whatsapp/EvolutionWhatsAppService';

export interface ReengagementJob {
  businessId: string;
  inactiveDays: number;
  messageTemplate: string;
}

interface InactiveCustomer {
  id: string;
  phone: string;
  name: string;
  stamps_count: number;
  last_activity_at: string;
}

export class ReengagementWorker {
  private queue: Queue.Queue<ReengagementJob>;
  private whatsappService: EvolutionWhatsAppService;
  private readonly RATE_LIMIT_DELAY = 2000; // 2 seconds between messages
  private readonly DEFAULT_INACTIVE_DAYS = 30;

  constructor(redisUrl: string = process.env.REDIS_URL || 'redis://localhost:6379') {
    this.queue = new Queue<ReengagementJob>('reengagement-campaigns', redisUrl, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100,
        removeOnFail: false,
      },
    });

    this.whatsappService = new EvolutionWhatsAppService();
    this.setupProcessor();
    this.setupScheduledJobs();
  }

  private setupProcessor(): void {
    this.queue.process(3, async (job: Job<ReengagementJob>) => {
      await this.processReengagement(job);
    });

    this.queue.on('completed', (job: Job) => {
      console.log(`Reengagement campaign completed: ${job.id}`);
    });

    this.queue.on('failed', (job: Job, err: Error) => {
      console.error(`Reengagement campaign failed: ${job.id}`, err);
    });
  }

  private setupScheduledJobs(): void {
    // Weekly re-engagement check every Sunday at 10 AM Peru time
    this.queue.add(
      {
        businessId: 'ALL',
        inactiveDays: this.DEFAULT_INACTIVE_DAYS,
        messageTemplate:
          'Hola {name}! 👋 Hace un tiempo no te vemos. Tenemos promociones especiales esperándote. ¡Vuelve pronto! 🎁',
      },
      {
        repeat: {
          cron: '0 10 * * 0', // Sunday at 10 AM
          tz: 'America/Lima',
        },
        jobId: 'weekly-reengagement-campaign',
      }
    );
  }

  private async processReengagement(job: Job<ReengagementJob>): Promise<void> {
    const { businessId, inactiveDays, messageTemplate } = job.data;

    if (businessId === 'ALL') {
      // Process for all businesses
      const { data: businesses } = await supabaseAdmin.from('businesses').select('id');

      if (businesses) {
        for (const business of businesses) {
          await this.reengageInactiveCustomers(business.id, inactiveDays, messageTemplate);
        }
      }
    } else {
      // Process for single business
      await this.reengageInactiveCustomers(businessId, inactiveDays, messageTemplate);
    }
  }

  private async reengageInactiveCustomers(
    businessId: string,
    inactiveDays: number,
    messageTemplate: string
  ): Promise<void> {
    // Calculate inactive threshold date
    const inactiveDate = new Date();
    inactiveDate.setDate(inactiveDate.getDate() - inactiveDays);

    // Find inactive customers with stamps (they were engaged before)
    const { data: inactiveCustomers, error } = await supabaseAdmin
      .from('customers')
      .select('id, phone, name, stamps_count, last_activity_at')
      .eq('business_id', businessId)
      .lt('last_activity_at', inactiveDate.toISOString())
      .gt('stamps_count', 0)
      .order('last_activity_at', { ascending: true })
      .limit(50); // Limit to 50 customers per run to avoid spam

    if (error || !inactiveCustomers || inactiveCustomers.length === 0) {
      console.log(`No inactive customers found for business ${businessId}`);
      return;
    }

    let sentCount = 0;
    let failedCount = 0;

    for (const customer of inactiveCustomers as InactiveCustomer[]) {
      try {
        // Personalize message
        const personalizedMessage = messageTemplate
          .replace('{name}', customer.name)
          .replace('{stamps}', customer.stamps_count.toString());

        // Send WhatsApp message
        await this.whatsappService.sendMessage({
          instanceName: process.env.EVOLUTION_INSTANCE_NAME || 'default',
          phone: customer.phone,
          text: personalizedMessage,
        });

        // Update last_contacted_at
        await supabaseAdmin
          .from('customers')
          .update({ last_contacted_at: new Date().toISOString() })
          .eq('id', customer.id);

        sentCount++;

        // Rate limiting
        if (sentCount < inactiveCustomers.length) {
          await this.delay(this.RATE_LIMIT_DELAY);
        }
      } catch (error) {
        console.error(`Failed to reengage customer ${customer.id}:`, error);
        failedCount++;
      }
    }

    console.log(
      `Reengagement campaign for business ${businessId}: ${sentCount} sent, ${failedCount} failed`
    );

    // Log reengagement campaign
    await supabaseAdmin.from('reengagement_logs').insert({
      business_id: businessId,
      inactive_days: inactiveDays,
      customers_targeted: inactiveCustomers.length,
      messages_sent: sentCount,
      messages_failed: failedCount,
      sent_at: new Date().toISOString(),
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async queueReengagement(reengagementJob: ReengagementJob): Promise<string> {
    const job = await this.queue.add(reengagementJob, {
      jobId: `${reengagementJob.businessId}-reengagement-${Date.now()}`,
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
