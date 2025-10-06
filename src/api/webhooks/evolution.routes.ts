import { Router } from 'express';
import { evolutionWebhookHandler } from './evolution.handler';

const router = Router();

/**
 * POST /api/v1/webhooks/evolution
 * Receive webhook events from Evolution API
 */
router.post('/', async (req, res) => {
  try {
    // 1. Verify API key for security
    const apiKey = req.headers['apikey'] || req.headers['api-key'];

    if (apiKey !== process.env.EVOLUTION_API_KEY) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid API key',
        },
      });
    }

    // 2. Validate payload structure
    const { event, instance, data } = req.body;

    if (!event || !instance || !data) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PAYLOAD',
          message: 'Missing required fields: event, instance, or data',
        },
      });
    }

    // 3. Route to appropriate handler based on event type
    switch (event) {
      case 'MESSAGES_UPDATE':
        await evolutionWebhookHandler.handleMessagesUpdate(req.body);
        break;

      case 'MESSAGES_UPSERT':
        await evolutionWebhookHandler.handleMessagesUpsert(req.body);
        break;

      case 'SEND_MESSAGE':
        await evolutionWebhookHandler.handleSendMessage(req.body);
        break;

      case 'CONNECTION_UPDATE':
        await evolutionWebhookHandler.handleConnectionUpdate(req.body);
        break;

      default:
        console.log('Unhandled webhook event:', event);
    }

    // 4. Always respond 200 OK to prevent Evolution API from retrying
    return res.status(200).json({
      received: true,
      event,
      instance,
    });
  } catch (error) {
    console.error('Webhook processing error:', error);

    // Still return 200 to prevent retries (log error for debugging)
    return res.status(200).json({
      received: true,
      error: 'Processing failed but webhook acknowledged',
    });
  }
});

export default router;
