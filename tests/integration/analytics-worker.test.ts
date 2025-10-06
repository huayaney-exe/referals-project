import { AnalyticsWorker, AnalyticsJob } from '../../src/infrastructure/workers/AnalyticsWorker';
import Queue from 'bull';

// Mock Bull queue
jest.mock('bull');

describe('Analytics Worker Integration Tests', () => {
  let analyticsWorker: AnalyticsWorker;
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

    analyticsWorker = new AnalyticsWorker();
  });

  afterEach(async () => {
    await analyticsWorker.close();
    jest.clearAllMocks();
  });

  describe('queueSnapshot', () => {
    it('should queue analytics snapshot successfully', async () => {
      const analyticsJob: AnalyticsJob = {
        businessId: 'business-123',
        snapshotDate: '2025-01-05',
        periodType: 'daily',
      };

      mockQueue.add.mockResolvedValue({ id: 'job-123' });

      const jobId = await analyticsWorker.queueSnapshot(analyticsJob);

      expect(jobId).toBe('job-123');
      expect(mockQueue.add).toHaveBeenCalledWith(analyticsJob, {
        jobId: 'business-123-2025-01-05-daily',
      });
    });

    it('should use composite jobId for idempotency', async () => {
      const analyticsJob: AnalyticsJob = {
        businessId: 'business-456',
        snapshotDate: '2025-01-06',
        periodType: 'weekly',
      };

      mockQueue.add.mockResolvedValue({ id: 'job-456' });

      await analyticsWorker.queueSnapshot(analyticsJob);

      expect(mockQueue.add).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          jobId: 'business-456-2025-01-06-weekly',
        })
      );
    });
  });

  describe('scheduled jobs', () => {
    it('should setup daily analytics snapshot at 3 AM Peru time', () => {
      expect(mockQueue.add).toHaveBeenCalledWith(
        expect.objectContaining({
          businessId: 'ALL',
          periodType: 'daily',
        }),
        expect.objectContaining({
          repeat: expect.objectContaining({
            cron: '0 3 * * *',
            tz: 'America/Lima',
          }),
          jobId: 'daily-analytics-snapshot',
        })
      );
    });

    it('should setup weekly analytics snapshot every Monday at 3 AM', () => {
      expect(mockQueue.add).toHaveBeenCalledWith(
        expect.objectContaining({
          businessId: 'ALL',
          periodType: 'weekly',
        }),
        expect.objectContaining({
          repeat: expect.objectContaining({
            cron: '0 3 * * 1',
            tz: 'America/Lima',
          }),
          jobId: 'weekly-analytics-snapshot',
        })
      );
    });

    it('should setup monthly analytics snapshot on 1st at 3 AM', () => {
      expect(mockQueue.add).toHaveBeenCalledWith(
        expect.objectContaining({
          businessId: 'ALL',
          periodType: 'monthly',
        }),
        expect.objectContaining({
          repeat: expect.objectContaining({
            cron: '0 3 1 * *',
            tz: 'America/Lima',
          }),
          jobId: 'monthly-analytics-snapshot',
        })
      );
    });
  });

  describe('getStats', () => {
    it('should return queue statistics', async () => {
      mockQueue.getWaitingCount.mockResolvedValue(2);
      mockQueue.getActiveCount.mockResolvedValue(1);
      mockQueue.getCompletedCount.mockResolvedValue(50);
      mockQueue.getFailedCount.mockResolvedValue(1);
      mockQueue.getDelayedCount.mockResolvedValue(0);

      const stats = await analyticsWorker.getStats();

      expect(stats).toEqual({
        waiting: 2,
        active: 1,
        completed: 50,
        failed: 1,
        delayed: 0,
      });
    });
  });
});
