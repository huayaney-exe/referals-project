import { Router } from 'express';
import { EvolutionInstanceManager } from '../../infrastructure/whatsapp/EvolutionInstanceManager';
import { authenticate } from '../middleware/auth.middleware';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const evolutionManager = new EvolutionInstanceManager();
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    const instanceName = evolutionManager.generateInstanceName(businessId);

    try {
      // Check if instance is connected
      const status = await evolutionManager.getConnectionStatus(instanceName);
      if (!status.connected) {
        return res.status(400).json({
          error: 'WhatsApp no está conectado. Por favor, conecta WhatsApp primero.',
        });
      }

      // Send test message
      const testMessage = '¡Felicidades! WhatsApp funciona correctamente. 🎉\n\nTu cuenta está lista para enviar mensajes automáticos a tus clientes.';

      await evolutionManager.sendTextMessage(
        instanceName,
        phone,
        testMessage
      );

      res.json({
        success: true,
        message: 'Mensaje de prueba enviado exitosamente',
        phone,
      });
    } catch (error: any) {
      console.error('Test connection error:', error);

      if (error.message.includes('NOT_FOUND') || error.message.includes('INSTANCE_NOT_FOUND')) {
        return res.status(400).json({
          error: 'Instancia de WhatsApp no encontrada. Por favor, conecta WhatsApp primero.',
        });
      }

      return res.status(500).json({
        error: error.message || 'Error al enviar mensaje de prueba',
      });
    }
  } catch (error) {
    return next(error);
  }
});

export default router;
