import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { apiLimiter } from './api/middleware/rateLimiting.middleware';
import { errorHandler } from './api/middleware/errorHandler.middleware';
import { requestId } from './api/middleware/requestId.middleware';
import { supabaseAdmin } from './config/supabase';
import authRoutes from './api/auth/auth.routes';
import enrollmentRoutes from './api/enrollments/enrollments.routes';
import stampRoutes from './api/stamps/stamps.routes';
import customerRoutes from './api/customers/customers.routes';
import campaignRoutes from './api/campaigns/campaigns.routes';
import analyticsRoutes from './api/analytics/analytics.routes';
import evolutionWebhookRoutes from './api/webhooks/evolution.routes';
import onboardingRoutes from './api/onboarding/onboarding.routes';
import businessesRoutes from './api/businesses/businesses.routes';
import scannerTokenRoutes from './api/scanner-tokens/scanner-tokens.routes';
import scannerRoutes from './api/scanner/scanner.routes';
import whatsappRoutes from './api/whatsapp/whatsapp.routes';
import devRoutes from './api/dev/dev.routes';
import { OutboxProcessor } from './infrastructure/outbox/OutboxProcessor';
import { eventListener } from './infrastructure/events/EventListener';
import { inactivityChecker } from './infrastructure/cron/InactivityChecker';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Sentry
if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    integrations: [
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 0.1, // 10% of transactions
    profilesSampleRate: 0.1, // 10% of transactions
    environment: process.env.NODE_ENV || 'development',
    beforeSend(event, hint) {
      // Filter out 404 and validation errors
      const error = hint.originalException;
      if (error instanceof Error) {
        if (error.message.includes('NOT_FOUND') || error.message.includes('Validation')) {
          return null;
        }
      }
      return event;
    },
  });
}

// Security middleware
app.use(helmet());
app.use(cors());

// Request ID tracking
app.use(requestId);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Rate limiting
app.use('/api', apiLimiter);

// Health checks
app.get('/health/live', (_req, res) => {
  res.json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get('/health/ready', async (_req, res) => {
  try {
    // Check database connection
    const { error } = await supabaseAdmin.from('businesses').select('id').limit(1);

    if (error) {
      throw error;
    }

    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      timestamp: new Date().toISOString(),
      services: {
        database: 'disconnected',
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/onboarding', onboardingRoutes);
app.use('/api/v1/businesses', businessesRoutes);
app.use('/api/v1/enrollments', enrollmentRoutes);
app.use('/api/v1/stamps', stampRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/scanner-tokens', scannerTokenRoutes);
app.use('/api/v1/scanner', scannerRoutes);
app.use('/api/v1/whatsapp', whatsappRoutes);
app.use('/api/v1/webhooks/evolution', evolutionWebhookRoutes);

// Dev-only routes
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/v1/dev', devRoutes);
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
});

// Sentry error handler (must be before other error handlers)
if (process.env.SENTRY_DSN && process.env.NODE_ENV === 'production') {
  Sentry.setupExpressErrorHandler(app);
}

// Error handler (must be last)
app.use(errorHandler);

// Initialize outbox processor
let outboxProcessor: OutboxProcessor | null = null;

// Start server only if not in test mode
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`🚀 API running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health/live`);
    console.log(`🔍 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Initialize event listener for campaign triggers
    console.log('📡 Event listener initialized for campaign triggers');

    // Start inactivity checker cron job
    inactivityChecker.start();
    console.log('⏰ Inactivity checker started');

    // Start outbox processor only if Redis is configured
    if (process.env.REDIS_URL) {
      try {
        outboxProcessor = new OutboxProcessor();
        await outboxProcessor.start();
      } catch (error) {
        console.warn('⚠️  Outbox processor failed to start:', error instanceof Error ? error.message : 'Unknown error');
        console.warn('⚠️  Continuing without background job processing. Set REDIS_URL to enable.');
      }
    } else {
      console.warn('⚠️  REDIS_URL not configured. Background job processing disabled.');
      console.warn('⚠️  To enable: Create Redis instance and set REDIS_URL environment variable.');
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    inactivityChecker.stop();
    if (outboxProcessor) {
      await outboxProcessor.stop();
    }
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    inactivityChecker.stop();
    if (outboxProcessor) {
      await outboxProcessor.stop();
    }
    process.exit(0);
  });
}

export default app;
