import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import * as Sentry from '@sentry/node';
import {
  ValidationError,
  NotFoundError,
  ConflictError,
  ConcurrencyError,
  BusinessLogicError,
} from '../../domains/types';
import { ErrorMessages } from '../../shared/errors/messages';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Add request context to Sentry
  if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
    Sentry.withScope((scope) => {
      scope.setUser({
        id: req.user?.userId,
        email: req.user?.email,
      });
      scope.setContext('request', {
        id: req.id,
        method: req.method,
        url: req.url,
        body: req.body,
      });
      scope.setLevel('error');
      Sentry.captureException(error);
    });
  }

  // Zod validation errors
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: ErrorMessages.VALIDATION_INVALID_FORMAT,
        message_es: ErrorMessages.VALIDATION_INVALID_FORMAT,
        details: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
    });
    return;
  }

  // Domain validation errors
  if (error instanceof ValidationError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        message_es: ErrorMessages.BAD_REQUEST,
        details: error.errors,
      },
    });
    return;
  }

  // Not found errors
  if (error instanceof NotFoundError) {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: error.message,
        message_es: ErrorMessages.NOT_FOUND,
      },
    });
    return;
  }

  // Conflict errors (duplicate, etc.)
  if (error instanceof ConflictError) {
    res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: error.message,
        message_es: ErrorMessages.CONFLICT,
      },
    });
    return;
  }

  // Concurrency errors (optimistic locking)
  if (error instanceof ConcurrencyError) {
    res.status(409).json({
      error: {
        code: 'CONCURRENCY_ERROR',
        message: error.message,
        message_es: ErrorMessages.CONFLICT,
      },
    });
    return;
  }

  // Business logic errors
  if (error instanceof BusinessLogicError) {
    res.status(422).json({
      error: {
        code: 'BUSINESS_LOGIC_ERROR',
        message: error.message,
        message_es: ErrorMessages.BAD_REQUEST,
      },
    });
    return;
  }

  // Default server error
  console.error('Unhandled error:', error);
  console.error('Error stack:', error.stack);
  res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
      message_es: ErrorMessages.INTERNAL_ERROR,
      ...(process.env.NODE_ENV === 'test' && { details: error.message }),
    },
  });
}
