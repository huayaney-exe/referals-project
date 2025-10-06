import Queue from 'bull';
import { supabaseAdmin } from '../../config/supabase';
import { EvolutionWhatsAppService } from '../whatsapp/EvolutionWhatsAppService';
// PassKit deprecated in favor of QR code implementation
// import { PassKitService } from '../passkit/PassKitService';

interface OutboxEvent {
  id: string;
  event_type: 'whatsapp_message' | 'pass_update' | 'email_notification';
  payload: Record<string, unknown>;
  created_at: string;
  processed_at: string | null;
  retry_count: number;
  error_message: string | null;
}

export class OutboxProcessor {
  private queue: Queue.Queue;
  private whatsappService: EvolutionWhatsAppService;
  // PassKit deprecated - using QR codes instead
  // private passkitService: PassKitService;
  private isProcessing: boolean = false;
  private readonly POLL_INTERVAL = 5000; // 5 seconds
  private readonly MAX_RETRIES = 3;
  private readonly BATCH_SIZE = 10;
  private pollTimer?: NodeJS.Timeout;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    this.queue = new Queue('outbox-events', redisUrl, {
      settings: {
        maxStalledCount: 3,
        stalledInterval: 30000,
      },
      defaultJobOptions: {
        attempts: this.MAX_RETRIES,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    });

    this.whatsappService = new EvolutionWhatsAppService();
    // PassKit deprecated - using QR codes for loyalty cards
    // this.passkitService = new PassKitService();

    this.setupQueueHandlers();
  }

  /**
   * Start the outbox processor
   */
  async start(): Promise<void> {
    console.log('🚀 Starting Outbox Processor...');

    // Start queue processing
    await this.queue.resume();

    // Start polling for new events
    this.isProcessing = true;
    await this.pollOutboxEvents();

    console.log('✅ Outbox Processor started');
  }

  /**
   * Stop the outbox processor
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping Outbox Processor...');

    this.isProcessing = false;

    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
    }

    await this.queue.pause();
    await this.queue.close();

    console.log('✅ Outbox Processor stopped');
  }

  /**
   * Poll the outbox_events table for unprocessed events
   */
  private async pollOutboxEvents(): Promise<void> {
    if (!this.isProcessing) {
      return;
    }

    try {
      // Fetch unprocessed events
      const { data: events, error } = await supabaseAdmin
        .from('outbox_events')
        .select('*')
        .is('processed_at', null)
        .lt('retry_count', this.MAX_RETRIES)
        .order('created_at', { ascending: true })
        .limit(this.BATCH_SIZE);

      if (error) {
        console.error('Error fetching outbox events:', error);
      } else if (events && events.length > 0) {
        console.log(`📬 Found ${events.length} outbox events to process`);

        // Add events to queue
        for (const event of events) {
          await this.queue.add('process-event', event, {
            jobId: event.id,
          });
        }
      }
    } catch (error) {
      console.error('Error polling outbox events:', error);
    }

    // Schedule next poll
    this.pollTimer = setTimeout(() => {
      this.pollOutboxEvents();
    }, this.POLL_INTERVAL);
  }

  /**
   * Setup queue event handlers
   */
  private setupQueueHandlers(): void {
    // Process event
    this.queue.process('process-event', 5, async (job) => {
      const event = job.data as OutboxEvent;
      return this.processEvent(event);
    });

    // Handle successful processing
    this.queue.on('completed', async (job, _result) => {
      console.log(`✅ Event ${job.data.id} processed successfully`);
      await this.markEventAsProcessed(job.data.id);
    });

    // Handle failed processing
    this.queue.on('failed', async (job, err) => {
      console.error(`❌ Event ${job.data.id} failed:`, err.message);
      await this.incrementRetryCount(job.data.id, err.message);
    });

    // Handle stalled jobs
    this.queue.on('stalled', (job) => {
      console.warn(`⚠️ Event ${job.data.id} stalled`);
    });
  }

  /**
   * Process a single outbox event
   */
  private async processEvent(event: OutboxEvent): Promise<void> {
    console.log(`🔄 Processing event ${event.id} of type ${event.event_type}`);

    try {
      switch (event.event_type) {
        case 'whatsapp_message':
          await this.processWhatsAppMessage(event);
          break;

        case 'pass_update':
          await this.processPassUpdate(event);
          break;

        case 'email_notification':
          await this.processEmailNotification(event);
          break;

        default:
          throw new Error(`Unknown event type: ${event.event_type}`);
      }
    } catch (error) {
      // Re-throw to trigger retry logic
      throw error;
    }
  }

  /**
   * Process WhatsApp message event
   */
  private async processWhatsAppMessage(event: OutboxEvent): Promise<void> {
    const { phone, message } = event.payload;

    if (!phone || !message) {
      throw new Error('Invalid WhatsApp message payload');
    }

    await this.whatsappService.sendMessage({
      instanceName: process.env.EVOLUTION_INSTANCE_NAME || 'default',
      phone: phone as string,
      text: message as string,
    });
  }

  /**
   * Process pass update event
   * NOTE: PassKit deprecated - using QR codes for loyalty cards
   */
  private async processPassUpdate(event: OutboxEvent): Promise<void> {
    const { customerId, businessId } = event.payload;

    if (!customerId || !businessId) {
      throw new Error('Invalid pass update payload');
    }

    // PassKit deprecated - QR code updates handled directly via customer queries
    console.log(`Pass update event deprecated for customer ${customerId} in business ${businessId}`);
    // await this.passkitService.sendPushNotification(customerId as string, businessId as string);
  }

  /**
   * Process email notification event
   */
  private async processEmailNotification(event: OutboxEvent): Promise<void> {
    // Email notifications not implemented in MVP
    console.log('Email notification - not implemented in MVP', event.payload);
  }

  /**
   * Mark event as processed
   */
  private async markEventAsProcessed(eventId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('outbox_events')
      .update({ processed_at: new Date().toISOString() })
      .eq('id', eventId);

    if (error) {
      console.error('Error marking event as processed:', error);
    }
  }

  /**
   * Increment retry count for failed event
   */
  private async incrementRetryCount(eventId: string, errorMessage: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('outbox_events')
      .update({
        retry_count: supabaseAdmin.rpc('increment', { row_id: eventId }),
        error_message: errorMessage,
      })
      .eq('id', eventId);

    if (error) {
      console.error('Error incrementing retry count:', error);
    }
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
      isProcessing: this.isProcessing,
    };
  }

  /**
   * Clear dead letter queue (failed events with max retries)
   */
  async clearDeadLetterQueue(): Promise<number> {
    const { data: deadEvents, error } = await supabaseAdmin
      .from('outbox_events')
      .select('id')
      .is('processed_at', null)
      .gte('retry_count', this.MAX_RETRIES);

    if (error || !deadEvents) {
      throw new Error('Failed to fetch dead letter events');
    }

    // Archive dead events (in production, move to separate table)
    console.log(`Found ${deadEvents.length} dead letter events`);

    return deadEvents.length;
  }
}
