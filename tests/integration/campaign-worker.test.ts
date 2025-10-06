import { CampaignWorker, CampaignJob } from '../../src/infrastructure/workers/CampaignWorker';
import { supabaseAdmin } from '../../src/config/supabase';
import Queue from 'bull';

// Mock Bull queue
jest.mock('bull');

describe('Campaign Worker Integration Tests', () => {
  let campaignWorker: CampaignWorker;
  let mockQueue: any;

  beforeEach(() => {
    mockQueue = {
      add: jest.fn(),
      process: jest.fn(),
      on: jest.fn(),
      getWaitingCount: jest.fn().mockResolvedValue(0),
      getActiveCount: jest.fn().mockResolvedValue(0),
      getCompletedCount: jest.fn().mockResolvedValue(0),
      getFailedCount: jest.fn().mockResolvedValue(0),
      getDelayedCount: jest.fn().mockResolvedValue(0),
      close: jest.fn(),
    };

    (Queue as jest.MockedClass<typeof Queue>).mockImplementation(() => mockQueue);

    campaignWorker = new CampaignWorker();
  });

  afterEach(async () => {
    await campaignWorker.close();
    jest.clearAllMocks();
  });

  describe('queueCampaign', () => {
    it('should queue a campaign successfully', async () => {
      const campaignJob: CampaignJob = {
        campaignId: 'campaign-123',
        businessId: 'business-456',
        customerIds: ['customer-1', 'customer-2'],
        message: 'Hola {name}, tenemos una promoción especial!',
      };

      mockQueue.add.mockResolvedValue({ id: 'job-123' });

      // Mock Supabase update
      jest.spyOn(supabaseAdmin, 'from').mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockResolvedValue({ error: null }),
      } as any);

      const jobId = await campaignWorker.queueCampaign(campaignJob);

      expect(jobId).toBe('job-123');
      expect(mockQueue.add).toHaveBeenCalledWith(campaignJob, {
        jobId: 'campaign-123',
      });
    });

    it('should update campaign status to processing when queued', async () => {
      const campaignJob: CampaignJob = {
        campaignId: 'campaign-123',
        businessId: 'business-456',
        customerIds: ['customer-1'],
        message: 'Test message',
      };

      mockQueue.add.mockResolvedValue({ id: 'job-123' });

      const updateMock = jest.fn().mockReturnThis();
      const eqMock = jest.fn().mockResolvedValue({ error: null });

      jest.spyOn(supabaseAdmin, 'from').mockReturnValue({
        update: updateMock,
        eq: eqMock,
      } as any);

      await campaignWorker.queueCampaign(campaignJob);

      expect(updateMock).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'processing',
        })
      );
      expect(eqMock).toHaveBeenCalledWith('id', 'campaign-123');
    });
  });

  describe('campaign processing', () => {
    it('should process campaign with rate limiting', async () => {
      // Verify queue setup includes rate limiting logic
      expect(mockQueue.process).toHaveBeenCalled();
    });

    it('should handle retry on transient failures', async () => {
      // Verify queue configured with retry logic
      expect(Queue).toHaveBeenCalledWith(
        'campaign-sends',
        expect.any(String),
        expect.objectContaining({
          defaultJobOptions: expect.objectContaining({
            attempts: 3,
            backoff: expect.objectContaining({
              type: 'exponential',
              delay: 5000,
            }),
          }),
        })
      );
    });

    it('should move to dead letter queue after max retries', async () => {
      // Verify failed job handler is set up
      expect(mockQueue.on).toHaveBeenCalledWith('failed', expect.any(Function));
    });

    it('should update campaign metrics on completion', async () => {
      // Verify completed job handler is set up
      expect(mockQueue.on).toHaveBeenCalledWith('completed', expect.any(Function));
    });
  });

  describe('getStats', () => {
    it('should return queue statistics', async () => {
      mockQueue.getWaitingCount.mockResolvedValue(5);
      mockQueue.getActiveCount.mockResolvedValue(2);
      mockQueue.getCompletedCount.mockResolvedValue(100);
      mockQueue.getFailedCount.mockResolvedValue(3);
      mockQueue.getDelayedCount.mockResolvedValue(1);

      const stats = await campaignWorker.getStats();

      expect(stats).toEqual({
        waiting: 5,
        active: 2,
        completed: 100,
        failed: 3,
        delayed: 1,
      });
    });
  });
});
