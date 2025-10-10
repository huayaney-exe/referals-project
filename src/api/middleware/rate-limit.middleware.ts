/**
 * Rate Limiting Middleware
 *
 * Protects WhatsApp endpoints from spam and abuse
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  keyGenerator: (req: Request) => string; // Generate key for rate limit tracking
  message?: string;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(private config: RateLimitConfig) {}

  middleware = (req: Request, res: Response, next: NextFunction) => {
    const key = this.config.keyGenerator(req);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get existing requests for this key
    let timestamps = this.requests.get(key) || [];

    // Remove old timestamps outside the window
    timestamps = timestamps.filter((timestamp) => timestamp > windowStart);

    // Check if limit exceeded
    if (timestamps.length >= this.config.max) {
      const oldestTimestamp = timestamps[0];
      const retryAfter = Math.ceil((oldestTimestamp + this.config.windowMs - now) / 1000);

      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: this.config.message || 'Too many requests, please try again later',
          retryAfter,
        },
      });
    }

    // Add current timestamp
    timestamps.push(now);
    this.requests.set(key, timestamps);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      this.cleanup(windowStart);
    }

    next();
  };

  private cleanup(windowStart: number) {
    for (const [key, timestamps] of this.requests.entries()) {
      const validTimestamps = timestamps.filter((t) => t > windowStart);
      if (validTimestamps.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, validTimestamps);
      }
    }
  }

  reset(key: string) {
    this.requests.delete(key);
  }
}

/**
 * WhatsApp Rate Limiter
 * - 10 messages per 5 minutes per business
 * - Prevents spam and abuse
 */
export const whatsappRateLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10,
  keyGenerator: (req: Request) => {
    // Rate limit by business ID (from authenticated user)
    const businessId = (req as any).user?.businessId || req.body?.businessId || 'anonymous';
    return `whatsapp:${businessId}`;
  },
  message: 'Demasiados mensajes enviados. Por favor espera 5 minutos antes de enviar más.',
});

/**
 * Customer Action Rate Limiter
 * - 20 actions per minute per business
 * - Prevents rapid clicking/abuse
 */
export const customerActionRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  keyGenerator: (req: Request) => {
    const businessId = (req as any).user?.businessId || 'anonymous';
    return `customer-action:${businessId}`;
  },
  message: 'Demasiadas acciones. Por favor espera un momento.',
});

/**
 * Registration Rate Limiter
 * - 5 registrations per minute per business
 * - Prevents bulk registration abuse
 */
export const registrationRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  keyGenerator: (req: Request) => {
    const businessId = (req as any).user?.businessId || 'anonymous';
    return `registration:${businessId}`;
  },
  message: 'Demasiados registros. Por favor espera un momento.',
});
