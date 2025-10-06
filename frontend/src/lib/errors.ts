/**
 * Standardized error classes for production-quality error handling
 *
 * Usage:
 * ```typescript
 * import { DatabaseError, ValidationError, ConcurrencyError } from '@/lib/errors';
 *
 * if (error) {
 *   throw new DatabaseError('Failed to fetch customers', error.code, error.hint, error.details);
 * }
 * ```
 */

/**
 * Database operation error with Supabase error context
 */
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly hint?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'DatabaseError';
    Object.setPrototypeOf(this, DatabaseError.prototype);
  }

  toString(): string {
    let result = `${this.name}: ${this.message}`;
    if (this.code) result += ` (code: ${this.code})`;
    if (this.hint) result += `\nHint: ${this.hint}`;
    return result;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      hint: this.hint,
      details: this.details,
    };
  }
}

/**
 * Data validation error for business logic validation
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field?: string,
    public readonly value?: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  toString(): string {
    let result = `${this.name}: ${this.message}`;
    if (this.field) result += ` (field: ${this.field})`;
    return result;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      field: this.field,
      value: this.value,
    };
  }
}

/**
 * Concurrency error for optimistic locking failures
 */
export class ConcurrencyError extends Error {
  constructor(
    message: string,
    public readonly resourceId?: string,
    public readonly expectedVersion?: number,
    public readonly actualVersion?: number
  ) {
    super(message);
    this.name = 'ConcurrencyError';
    Object.setPrototypeOf(this, ConcurrencyError.prototype);
  }

  toString(): string {
    let result = `${this.name}: ${this.message}`;
    if (this.resourceId) result += ` (resource: ${this.resourceId})`;
    if (this.expectedVersion !== undefined && this.actualVersion !== undefined) {
      result += ` (expected version: ${this.expectedVersion}, actual: ${this.actualVersion})`;
    }
    return result;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      resourceId: this.resourceId,
      expectedVersion: this.expectedVersion,
      actualVersion: this.actualVersion,
    };
  }
}

/**
 * Network error for API request failures
 */
export class NetworkError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly endpoint?: string
  ) {
    super(message);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }

  toString(): string {
    let result = `${this.name}: ${this.message}`;
    if (this.statusCode) result += ` (status: ${this.statusCode})`;
    if (this.endpoint) result += ` (endpoint: ${this.endpoint})`;
    return result;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      endpoint: this.endpoint,
    };
  }
}

/**
 * Type guard to check if error is a specific type
 */
export function isDatabaseError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError;
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError;
}

export function isConcurrencyError(error: unknown): error is ConcurrencyError {
  return error instanceof ConcurrencyError;
}

export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Format error for logging/monitoring
 */
export function formatErrorForLogging(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    const base = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    if (isDatabaseError(error)) {
      return {
        ...base,
        code: error.code,
        hint: error.hint,
        details: error.details,
      };
    }

    if (isValidationError(error)) {
      return {
        ...base,
        field: error.field,
        value: error.value,
      };
    }

    if (isConcurrencyError(error)) {
      return {
        ...base,
        resourceId: error.resourceId,
        expectedVersion: error.expectedVersion,
        actualVersion: error.actualVersion,
      };
    }

    if (isNetworkError(error)) {
      return {
        ...base,
        statusCode: error.statusCode,
        endpoint: error.endpoint,
      };
    }

    return base;
  }

  return {
    error: String(error),
  };
}
