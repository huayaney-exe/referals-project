// Shared domain types and errors

export interface DomainError {
  code: string;
  message: string;
  field?: string;
}

export class ValidationError extends Error {
  constructor(public errors: DomainError[]) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}

export class ConcurrencyError extends Error {
  constructor(message: string = 'Concurrent modification detected') {
    super(message);
    this.name = 'ConcurrencyError';
  }
}

export class BusinessLogicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessLogicError';
  }
}
