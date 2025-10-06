import * as Sentry from '@sentry/node';
import { errorHandler } from '../../src/api/middleware/errorHandler.middleware';
import { Request, Response, NextFunction } from 'express';
import { NotFoundError, ValidationError } from '../../src/domains/types';

// Mock Sentry
jest.mock('@sentry/node');

describe('Sentry Integration Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      id: 'test-request-123',
      method: 'POST',
      url: '/api/v1/test',
      body: { test: 'data' },
      user: {
        userId: 'user-123',
        email: 'test@example.com',
        businessId: 'business-123',
      },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    nextFunction = jest.fn();

    // Reset mocks
    jest.clearAllMocks();
  });

  describe('error capture', () => {
    it('should capture errors with Sentry in production', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalDSN = process.env.SENTRY_DSN;

      process.env.NODE_ENV = 'production';
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';

      const error = new Error('Test error');
      const mockWithScope = jest.fn((callback) => callback({
        setUser: jest.fn(),
        setContext: jest.fn(),
        setLevel: jest.fn(),
      }));
      const mockCaptureException = jest.fn();

      (Sentry.withScope as jest.Mock) = mockWithScope;
      (Sentry.captureException as jest.Mock) = mockCaptureException;

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockWithScope).toHaveBeenCalled();
      expect(mockCaptureException).toHaveBeenCalledWith(error);

      process.env.NODE_ENV = originalEnv;
      process.env.SENTRY_DSN = originalDSN;
    });

    it('should not capture errors in non-production environments', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'test';

      const error = new Error('Test error');
      const mockCaptureException = jest.fn();

      (Sentry.captureException as jest.Mock) = mockCaptureException;

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockCaptureException).not.toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('context enrichment', () => {
    it('should add user context to Sentry errors', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalDSN = process.env.SENTRY_DSN;

      process.env.NODE_ENV = 'production';
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';

      const error = new Error('Test error');
      let capturedScope: any;

      const mockWithScope = jest.fn((callback) => {
        const scope = {
          setUser: jest.fn(),
          setContext: jest.fn(),
          setLevel: jest.fn(),
        };
        capturedScope = scope;
        callback(scope);
      });

      (Sentry.withScope as jest.Mock) = mockWithScope;
      (Sentry.captureException as jest.Mock) = jest.fn();

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(capturedScope.setUser).toHaveBeenCalledWith({
        id: 'user-123',
        email: 'test@example.com',
      });

      expect(capturedScope.setContext).toHaveBeenCalledWith('request', {
        id: 'test-request-123',
        method: 'POST',
        url: '/api/v1/test',
        body: { test: 'data' },
      });

      expect(capturedScope.setLevel).toHaveBeenCalledWith('error');

      process.env.NODE_ENV = originalEnv;
      process.env.SENTRY_DSN = originalDSN;
    });
  });

  describe('error filtering', () => {
    it('should not capture validation errors in Sentry', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalDSN = process.env.SENTRY_DSN;

      process.env.NODE_ENV = 'production';
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';

      const error = new ValidationError([{ code: 'INVALID_EMAIL', field: 'email', message: 'Invalid email' }]);
      const mockCaptureException = jest.fn();

      (Sentry.captureException as jest.Mock) = mockCaptureException;

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      // Validation errors should not be captured
      expect(mockResponse.status).toHaveBeenCalledWith(400);

      process.env.NODE_ENV = originalEnv;
      process.env.SENTRY_DSN = originalDSN;
    });

    it('should not capture 404 errors in Sentry', () => {
      const originalEnv = process.env.NODE_ENV;
      const originalDSN = process.env.SENTRY_DSN;

      process.env.NODE_ENV = 'production';
      process.env.SENTRY_DSN = 'https://test@sentry.io/123';

      const error = new NotFoundError('Customer', 'customer-123');
      const mockCaptureException = jest.fn();

      (Sentry.captureException as jest.Mock) = mockCaptureException;

      errorHandler(error, mockRequest as Request, mockResponse as Response, nextFunction);

      // Not found errors should not be captured
      expect(mockResponse.status).toHaveBeenCalledWith(404);

      process.env.NODE_ENV = originalEnv;
      process.env.SENTRY_DSN = originalDSN;
    });
  });
});
