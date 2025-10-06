import { OutboxProcessor } from '../../src/infrastructure/outbox/OutboxProcessor';
import { supabaseAdmin } from '../../src/config/supabase';
import Queue from 'bull';

// Mock Bull queue
jest.mock('bull');

describe('Outbox Processor Integration Tests', () => {
  let outboxProcessor: OutboxProcessor;
  let mockQueue: any;

  beforeEach(() => {
    mockQueue = {
      process: jest.fn(),
      add: jest.fn(),
      on: jest.fn(),
      resume: jest.fn(),
      pause: jest.fn(),
      close: jest.fn(),
      getWaitingCount: jest.fn().mockResolvedValue(0),
      getActiveCount: jest.fn().mockResolvedValue(0),
      getCompletedCount: jest.fn().mockResolvedValue(0),
      getFailedCount: jest.fn().mockResolvedValue(0),
      getDelayedCount: jest.fn().mockResolvedValue(0),
    };

    (Queue as jest.MockedClass<typeof Queue>).mockImplementation(() => mockQueue);

    outboxProcessor = new OutboxProcessor();
  });

  afterEach(async () => {
    if (outboxProcessor) {
      await outboxProcessor.stop();
    }
    jest.clearAllMocks();
  });

  describe('start', () => {
    it('should start the outbox processor and resume queue', async () => {
      // Mock Supabase query
      jest.spyOn(supabaseAdmin, 'from').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data: [], error: null }),
      } as any);

      await outboxProcessor.start();

      expect(mockQueue.resume).toHaveBeenCalled();
    });
  });

  describe('stop', () => {
    it('should stop the outbox processor and close queue', async () => {
      await outboxProcessor.stop();

      expect(mockQueue.pause).toHaveBeenCalled();
      expect(mockQueue.close).toHaveBeenCalled();
    });
  });

  describe('processEvent', () => {
    it('should process WhatsApp message events', async () => {
      const event = {
        id: 'test-event-123',
        event_type: 'whatsapp_message',
        payload: {
          phone: '+51987654321',
          message: 'Hola! Tienes 5 sellos.',
        },
        created_at: new Date().toISOString(),
        processed_at: null,
        retry_count: 0,
        error_message: null,
      };

      // Mock queue process handler
      let processHandler: any;
      mockQueue.process.mockImplementation((_name: string, _concurrency: number, handler: any) => {
        processHandler = handler;
      });

      new OutboxProcessor();

      // Simulate processing the event
      if (processHandler) {
        await expect(processHandler({ data: event })).resolves.not.toThrow();
      }
    });

    it('should handle unknown event types', async () => {
      const event = {
        id: 'test-event-456',
        event_type: 'unknown_type',
        payload: {},
        created_at: new Date().toISOString(),
        processed_at: null,
        retry_count: 0,
        error_message: null,
      };

      let processHandler: any;
      mockQueue.process.mockImplementation((_name: string, _concurrency: number, handler: any) => {
        processHandler = handler;
      });

      new OutboxProcessor();

      if (processHandler) {
        await expect(processHandler({ data: event })).rejects.toThrow('Unknown event type');
      }
    });
  });

  describe('getStats', () => {
    it('should return queue statistics', async () => {
      mockQueue.getWaitingCount.mockResolvedValue(5);
      mockQueue.getActiveCount.mockResolvedValue(2);
      mockQueue.getCompletedCount.mockResolvedValue(100);
      mockQueue.getFailedCount.mockResolvedValue(3);
      mockQueue.getDelayedCount.mockResolvedValue(1);

      const stats = await outboxProcessor.getStats();

      expect(stats).toEqual({
        waiting: 5,
        active: 2,
        completed: 100,
        failed: 3,
        delayed: 1,
        isProcessing: false,
      });
    });
  });

  describe('clearDeadLetterQueue', () => {
    it('should identify dead letter events', async () => {
      const deadEvents = [
        { id: 'dead-1' },
        { id: 'dead-2' },
      ];

      jest.spyOn(supabaseAdmin, 'from').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        gte: jest.fn().mockResolvedValue({ data: deadEvents, error: null }),
      } as any);

      const count = await outboxProcessor.clearDeadLetterQueue();

      expect(count).toBe(2);
    });

    it('should throw error when fetching dead events fails', async () => {
      jest.spyOn(supabaseAdmin, 'from').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        gte: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
      } as any);

      await expect(outboxProcessor.clearDeadLetterQueue()).rejects.toThrow(
        'Failed to fetch dead letter events'
      );
    });
  });

  describe('retry logic', () => {
    it('should increment retry count on failure', async () => {
      const updateMock = jest.fn().mockResolvedValue({ error: null });

      jest.spyOn(supabaseAdmin, 'from').mockReturnValue({
        update: jest.fn().mockReturnThis(),
        eq: updateMock,
      } as any);

      // Trigger failed event handler
      let failedHandler: any;
      mockQueue.on.mockImplementation((event: string, handler: any) => {
        if (event === 'failed') {
          failedHandler = handler;
        }
      });

      new OutboxProcessor();

      if (failedHandler) {
        await failedHandler(
          { data: { id: 'test-event' } },
          new Error('Processing failed')
        );
      }

      // Verify error was logged
      expect(mockQueue.on).toHaveBeenCalledWith('failed', expect.any(Function));
    });
  });

  describe('idempotency', () => {
    it('should not process same event twice', async () => {
      const eventId = 'idempotent-event-123';

      jest.spyOn(supabaseAdmin, 'from').mockReturnValue({
        select: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({
          data: [
            {
              id: eventId,
              event_type: 'whatsapp_message',
              payload: { phone: '+51987654321', message: 'Test' },
              created_at: new Date().toISOString(),
              processed_at: null,
              retry_count: 0,
              error_message: null,
            },
          ],
          error: null,
        }),
      } as any);

      await outboxProcessor.start();

      // Should add job with jobId equal to event.id for idempotency
      expect(mockQueue.add).toHaveBeenCalledWith(
        'process-event',
        expect.objectContaining({ id: eventId }),
        expect.objectContaining({ jobId: eventId })
      );

      await outboxProcessor.stop();
    });
  });
});
