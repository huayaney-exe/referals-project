import {
  ReengagementWorker,
  ReengagementJob,
} from '../../src/infrastructure/workers/ReengagementWorker';
import Queue from 'bull';

// Mock Bull queue
jest.mock('bull');

describe('Reengagement Worker Integration Tests', () => {
  let reengagementWorker: ReengagementWorker;
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

    reengagementWorker = new ReengagementWorker();
  });

  afterEach(async () => {
    await reengagementWorker.close();
    jest.clearAllMocks();
  });

  describe('queueReengagement', () => {
    it('should queue reengagement campaign successfully', async () => {
      const reengagementJob: ReengagementJob = {
        businessId: 'business-123',
        inactiveDays: 30,
        messageTemplate: 'Hola {name}! Vuelve pronto! 🎁',
      };

      mockQueue.add.mockResolvedValue({ id: 'job-123' });

      const jobId = await reengagementWorker.queueReengagement(reengagementJob);

      expect(jobId).toBe('job-123');
      expect(mockQueue.add).toHaveBeenCalledWith(
        reengagementJob,
        expect.objectContaining({
          jobId: expect.stringContaining('business-123-reengagement-'),
        })
      );
    });

    it('should use timestamped jobId for tracking', async () => {
      const reengagementJob: ReengagementJob = {
        businessId: 'business-456',
        inactiveDays: 45,
        messageTemplate: 'Te extrañamos {name}!',
      };

      mockQueue.add.mockResolvedValue({ id: 'job-456' });

      await reengagementWorker.queueReengagement(reengagementJob);

      expect(mockQueue.add).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          jobId: expect.stringMatching(/business-456-reengagement-\d+/),
        })
      );
    });
  });

  describe('scheduled jobs', () => {
    it('should setup weekly reengagement campaign every Sunday at 10 AM Peru time', () => {
      expect(mockQueue.add).toHaveBeenCalledWith(
        expect.objectContaining({
          businessId: 'ALL',
          inactiveDays: 30,
          messageTemplate: expect.stringContaining('Hola {name}'),
        }),
        expect.objectContaining({
          repeat: expect.objectContaining({
            cron: '0 10 * * 0',
            tz: 'America/Lima',
          }),
          jobId: 'weekly-reengagement-campaign',
        })
      );
    });
  });

  describe('getStats', () => {
    it('should return queue statistics', async () => {
      mockQueue.getWaitingCount.mockResolvedValue(3);
      mockQueue.getActiveCount.mockResolvedValue(1);
      mockQueue.getCompletedCount.mockResolvedValue(25);
      mockQueue.getFailedCount.mockResolvedValue(2);
      mockQueue.getDelayedCount.mockResolvedValue(0);

      const stats = await reengagementWorker.getStats();

      expect(stats).toEqual({
        waiting: 3,
        active: 1,
        completed: 25,
        failed: 2,
        delayed: 0,
      });
    });
  });
});
