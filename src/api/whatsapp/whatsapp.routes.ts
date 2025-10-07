import { Router } from 'express';
import { EvolutionInstanceManager } from '../../infrastructure/whatsapp/EvolutionInstanceManager';
import { evolutionWhatsAppService } from '../../infrastructure/whatsapp/EvolutionWhatsAppService';
import { authenticate } from '../middleware/auth.middleware';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const evolutionManager = new EvolutionInstanceManager();
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Rate limiting cache for test messages (in-memory for MVP, move to Redis for production scale)
const testMessageRateLimit = new Map<string, number>();
const TEST_MESSAGE_COOLDOWN = 5 * 60 * 1000; // 5 minutes

/**
 * GET /api/v1/whatsapp/status/:businessId
 * Get WhatsApp connection status for a business
 */
router.get('/status/:businessId', authenticate, async (req, res, next) => {
  try {
    const { businessId } = req.params;

    // Verify user owns this business
    if (!req.user || req.user.businessId !== businessId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'No tienes permiso para acceder a este negocio',
        },
      });
    }

    // Get instance name from business ID
    const instanceName = evolutionManager.generateInstanceName(businessId);

    try {
      // Check connection status
      const status = await evolutionManager.getConnectionStatus(instanceName);

      res.json({
        connected: status.connected,
        instance_name: instanceName,
        state: status.state,
      });
    } catch (error: any) {
      // Instance doesn't exist or error checking status
      res.json({
        connected: false,
        instance_name: instanceName,
        state: 'not_created',
      });
    }
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/whatsapp/qr/:businessId
 * Get QR code to connect WhatsApp (or create instance if doesn't exist)
 */
router.get('/qr/:businessId', authenticate, async (req, res, next) => {
  try {
    const { businessId } = req.params;

    // Verify user owns this business
    if (!req.user || req.user.businessId !== businessId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'No tienes permiso para acceder a este negocio',
        },
      });
    }

    const instanceName = evolutionManager.generateInstanceName(businessId);

    try {
      // Try to get QR code (will fail if instance doesn't exist)
      const qrCode = await evolutionManager.getQRCode(instanceName);

      res.json({
        connected: false,
        instance_name: instanceName,
        qr_code: qrCode,
      });
    } catch (error: any) {
      // Instance might not exist, try to create it
      if (error.message.includes('NOT_FOUND') || error.message.includes('INSTANCE_NOT_FOUND')) {
        try {
          // Create instance
          await evolutionManager.createInstance(businessId);

          // Get QR code
          const qrCode = await evolutionManager.getQRCode(instanceName);

          res.json({
            connected: false,
            instance_name: instanceName,
            qr_code: qrCode,
          });
        } catch (createError: any) {
          console.error('Evolution instance creation failed:', createError.message);

          // Determine appropriate error response based on error type
          if (createError.message.includes('INVALID_API_KEY') ||
              createError.message.includes('Unauthorized')) {
            return res.status(503).json({
              error: {
                code: 'WHATSAPP_SERVICE_UNAVAILABLE',
                message: 'El servicio de WhatsApp no está disponible. Contacta a soporte.',
                details: process.env.NODE_ENV === 'development' ? createError.message : undefined,
              },
            });
          }

          return res.status(500).json({
            error: {
              code: 'INSTANCE_CREATE_FAILED',
              message: 'Error al crear instancia de WhatsApp',
              details: process.env.NODE_ENV === 'development' ? createError.message : undefined,
            },
          });
        }
      } else {
        // Other error - log for debugging
        console.error('QR code generation failed:', error.message);

        return res.status(500).json({
          error: {
            code: 'QR_GENERATION_FAILED',
            message: 'Error al generar código QR',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          },
        });
      }
    }
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/v1/whatsapp/disconnect/:businessId
 * Disconnect WhatsApp instance
 */
router.post('/disconnect/:businessId', authenticate, async (req, res, next) => {
  try {
    const { businessId } = req.params;

    // Verify user owns this business
    if (!req.user || req.user.businessId !== businessId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'No tienes permiso para acceder a este negocio',
        },
      });
    }

    const instanceName = evolutionManager.generateInstanceName(businessId);

    try {
      await evolutionManager.deleteInstance(instanceName);

      res.json({
        success: true,
        message: 'WhatsApp desconectado exitosamente',
      });
    } catch (error: any) {
      return res.status(500).json({
        error: {
          code: 'DISCONNECT_FAILED',
          message: 'Error al desconectar WhatsApp',
        },
      });
    }
  } catch (error) {
    return next(error);
  }
});

/**
 * POST /api/v1/whatsapp/test-connection
 * Test WhatsApp connectivity by sending a test message
 */
router.post('/test-connection', authenticate, async (req, res, next) => {
  try {
    const { businessId, phone } = req.body;

    // Validate input
    if (!businessId || !phone) {
      return res.status(400).json({
        error: 'businessId y phone son requeridos',
      });
    }

    // Verify user owns this business
    if (!req.user || req.user.businessId !== businessId) {
      return res.status(403).json({
        error: 'No tienes permiso para acceder a este negocio',
      });
    }

    // Rate limiting check
    const lastTestTime = testMessageRateLimit.get(businessId);
    const now = Date.now();

    if (lastTestTime && (now - lastTestTime) < TEST_MESSAGE_COOLDOWN) {
      const remainingSeconds = Math.ceil((TEST_MESSAGE_COOLDOWN - (now - lastTestTime)) / 1000);
      return res.status(429).json({
        error: `Por favor espera ${Math.ceil(remainingSeconds / 60)} minutos antes de enviar otro mensaje de prueba.`,
        retryAfter: remainingSeconds,
      });
    }

    // Validate phone number format (Peru mobile)
    if (!evolutionWhatsAppService.isValidPeruPhone(phone)) {
      return res.status(400).json({
        error: 'Número de teléfono inválido. Debe ser un número móvil de Perú (+51 9XX XXX XXX).',
      });
    }

    const instanceName = evolutionManager.generateInstanceName(businessId);

    try {
      // Check if instance is connected
      const status = await evolutionWhatsAppService.getInstanceStatus(instanceName);
      if (!status.connected) {
        return res.status(400).json({
          error: 'WhatsApp no está conectado. Por favor, conecta WhatsApp primero.',
        });
      }

      // Send test message using production service
      const testMessage = '¡Felicidades! WhatsApp funciona correctamente. 🎉\n\nTu cuenta está lista para enviar mensajes automáticos a tus clientes.';

      await evolutionWhatsAppService.sendMessage({
        instanceName,
        phone,
        text: testMessage,
      });

      // Update rate limit
      testMessageRateLimit.set(businessId, now);

      // TODO: Add audit logging when whatsapp_test_logs table is created
      console.log(`Test message sent successfully - Business: ${businessId}, Phone: ${evolutionWhatsAppService.formatPhoneNumber(phone)}`);

      res.json({
        success: true,
        message: 'Mensaje de prueba enviado exitosamente',
      });
    } catch (error: any) {
      console.error('Test connection error:', error);

      // TODO: Add audit logging for failed attempts when table is created
      console.log(`Test message failed - Business: ${businessId}, Error: ${error.message}`);

      // Return user-friendly error messages
      if (error.message.includes('INSTANCE_NOT_FOUND')) {
        return res.status(400).json({
          error: 'Instancia de WhatsApp no encontrada. Por favor, conecta WhatsApp primero.',
        });
      }

      if (error.message.includes('INSTANCE_NOT_CONNECTED')) {
        return res.status(400).json({
          error: 'WhatsApp no está conectado. Por favor, verifica tu conexión.',
        });
      }

      if (error.message.includes('INVALID_PHONE') || error.message.includes('INVALID_PERU_PHONE_FORMAT')) {
        return res.status(400).json({
          error: 'Número de teléfono inválido. Verifica el formato.',
        });
      }

      if (error.message.includes('REQUEST_TIMEOUT')) {
        return res.status(504).json({
          error: 'Tiempo de espera agotado. Por favor intenta nuevamente.',
        });
      }

      // Generic error for production
      return res.status(500).json({
        error: 'Error al enviar mensaje de prueba. Por favor intenta nuevamente.',
      });
    }
  } catch (error) {
    return next(error);
  }
});

export default router;
