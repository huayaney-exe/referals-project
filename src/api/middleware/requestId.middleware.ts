import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * Request ID Middleware
 * Adds a unique request ID to each request for tracking and debugging
 */
export function requestId(req: Request, res: Response, next: NextFunction): void {
  // Use existing X-Request-ID header or generate a new UUID
  const id = (req.headers['x-request-id'] as string) || uuidv4();

  // Attach to request object
  req.id = id;

  // Send in response headers
  res.setHeader('X-Request-ID', id);

  next();
}
