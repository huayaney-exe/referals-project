import Queue, { Job } from 'bull';
import { EvolutionWhatsAppService } from '../whatsapp/EvolutionWhatsAppService';
import { supabaseAdmin } from '../../config/supabase';

export interface CampaignJob {
  campaignId: string;
  businessId: string;
  customerIds: string[];
  message: string;
}

export class CampaignWorker {
  private queue: Queue.Queue<CampaignJob>;
  private whatsappService: EvolutionWhatsAppService;
  private readonly RATE_LIMIT_DELAY = 2000; // 2 seconds between messages

  constructor(redisUrl: string = process.env.REDIS_URL || 'redis://localhost:6379') {
    this.queue = new Queue<CampaignJob>('campaign-sends', redisUrl, {
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: 100, // Keep last 100 completed jobs
        removeOnFail: false, // Keep failed jobs for analysis
      },
    });

    this.whatsappService = new EvolutionWhatsAppService();
    this.setupProcessor();
  }

  /**
   * Setup queue processor
   */
  private setupProcessor(): void {
    this.queue.process(async (job: Job<CampaignJob>) => {
      return this.processCampaign(job);
    });

    // Event handlers
    this.queue.on('completed', async (job: Job<CampaignJob>) => {
      console.log(`Campaign ${job.data.campaignId} completed successfully`);
      await this.updateCampaignStatus(job.data.campaignId, 'completed');
    });

    this.queue.on('failed', async (job: Job<CampaignJob>, err: Error) => {
      console.error(`Campaign ${job.data.campaignId} failed:`, err.message);

      // Move to dead letter queue after max retries
      if (job.attemptsMade >= (job.opts.attempts || 3)) {
        await this.updateCampaignStatus(job.data.campaignId, 'failed', err.message);
      }
    });
  }

  /**
   * Process a campaign - send messages to all customers
   */
  private async processCampaign(job: Job<CampaignJob>): Promise<void> {
    const { campaignId, businessId, customerIds, message } = job.data;

    console.log(`Processing campaign ${campaignId} for ${customerIds.length} customers`);

    let sentCount = 0;
    let failedCount = 0;

    for (const customerId of customerIds) {
      try {
        // Get customer data with stamps and business info
        const { data: customer, error } = await supabaseAdmin
          .from('customers')
          .select('phone, name, stamps_count, business:businesses(name, reward_structure)')
          .eq('id', customerId)
          .eq('business_id', businessId)
          .single();

        if (error || !customer) {
          console.error(`Customer ${customerId} not found`);
          failedCount++;
          continue;
        }

        // Get business reward info
        const business = customer.business as any;
        const stampsRequired = business?.reward_structure?.stamps_required || 10;
        const rewardDescription = business?.reward_structure?.reward_description || 'premio';
        const stampsCount = customer.stamps_count || 0;
        const stampsMissing = Math.max(0, stampsRequired - stampsCount);

        // Calculate days inactive (if last_activity_at was fetched)
        const daysInactive = 0; // Would need last_activity_at to calculate

        // Personalize message with ALL Spanish variables
        const personalizedMessage = message
          .replace(/{nombre}/g, customer.name)
          .replace(/{name}/g, customer.name) // Support both Spanish and English
          .replace(/{sellos}/g, stampsCount.toString())
          .replace(/{stamps}/g, stampsCount.toString()) // Support both
          .replace(/{sellos_faltantes}/g, stampsMissing.toString())
          .replace(/{recompensa}/g, rewardDescription)
          .replace(/{reward}/g, rewardDescription) // Support both
          .replace(/{negocio}/g, business?.name || 'nuestro negocio')
          .replace(/{business}/g, business?.name || 'nuestro negocio') // Support both
          .replace(/{dias_inactivo}/g, daysInactive.toString());

        // Send WhatsApp message
        await this.whatsappService.sendMessage({
          instanceName: process.env.EVOLUTION_INSTANCE_NAME || 'default',
          phone: customer.phone,
          text: personalizedMessage,
        });

        sentCount++;

        // Update job progress
        const progress = Math.floor((sentCount + failedCount) / customerIds.length * 100);
        await job.progress(progress);

        // Rate limiting - wait between sends
        if (sentCount < customerIds.length) {
          await this.delay(this.RATE_LIMIT_DELAY);
        }
      } catch (error) {
        console.error(`Failed to send to customer ${customerId}:`, error);
        failedCount++;
      }
    }

    // Update final campaign metrics
    await this.updateCampaignMetrics(campaignId, sentCount, failedCount);

    console.log(`Campaign ${campaignId} processed: ${sentCount} sent, ${failedCount} failed`);
  }

  /**
   * Add a campaign to the queue
   */
  async queueCampaign(campaignJob: CampaignJob): Promise<string> {
    const job = await this.queue.add(campaignJob, {
      jobId: campaignJob.campaignId, // Idempotency
    });

    // Update campaign status to 'processing'
    await this.updateCampaignStatus(campaignJob.campaignId, 'processing');

    return job.id as string;
  }

  /**
   * Update campaign status in database
   */
  private async updateCampaignStatus(
    campaignId: string,
    status: 'processing' | 'completed' | 'failed',
    errorMessage?: string
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    const { error } = await supabaseAdmin
      .from('campaigns')
      .update(updateData)
      .eq('id', campaignId);

    if (error) {
      console.error('Failed to update campaign status:', error);
    }
  }

  /**
   * Update campaign send metrics
   */
  private async updateCampaignMetrics(
    campaignId: string,
    sentCount: number,
    failedCount: number
  ): Promise<void> {
    const { error } = await supabaseAdmin
      .from('campaigns')
      .update({
        sent_count: sentCount,
        failed_count: failedCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', campaignId);

    if (error) {
      console.error('Failed to update campaign metrics:', error);
    }
  }

  /**
   * Delay helper for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get queue statistics
   */
  async getStats() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
      this.queue.getDelayedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
    };
  }

  /**
   * Graceful shutdown
   */
  async close(): Promise<void> {
    await this.queue.close();
  }
}
