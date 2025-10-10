import { Router } from 'express';
import { z } from 'zod';
import { CustomerService } from '../../domains/customer/Customer';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';
import { supabaseAdmin } from '../../config/supabase';
import { evolutionWhatsAppService } from '../../infrastructure/whatsapp/EvolutionWhatsAppService';
import { EvolutionInstanceManager } from '../../infrastructure/whatsapp/EvolutionInstanceManager';
import { whatsappRateLimiter } from '../middleware/rate-limit.middleware';

const router = Router();
const evolutionManager = new EvolutionInstanceManager();

// GET /api/v1/customers - List customers with pagination
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const customers = await CustomerService.findByBusiness(req.user!.businessId);

    res.json({
      customers: customers.map((c) => ({
        id: c.id,
        phone: c.phone,
        name: c.name,
        stamps_count: c.stamps_count,
        total_rewards_earned: c.total_rewards_earned,
        enrolled_at: c.enrolled_at,
      })),
      total: customers.length,
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/v1/customers/:id - Get customer by ID with business design
router.get('/:id', async (req, res, next) => {
  try {
    const customerId = z.string().uuid().parse(req.params.id);

    const customer = await CustomerService.findById(customerId);

    if (!customer) {
      res.status(404).json({
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found',
        },
      });
      return;
    }

    // Get business with card_design
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('id, name, logo_url, background_image_url, card_design, brand_colors, reward_structure')
      .eq('id', customer.business_id)
      .single();

    if (businessError || !business) {
      res.status(404).json({
        error: {
          code: 'BUSINESS_NOT_FOUND',
          message: 'Business not found',
        },
      });
      return;
    }

    res.json({
      data: {
        customer: {
          id: customer.id,
          phone: customer.phone,
          name: customer.name,
          stamps_count: customer.stamps_count,
          total_rewards_earned: customer.total_rewards_earned,
          enrolled_at: customer.enrolled_at,
          last_stamp_at: customer.last_stamp_at,
        },
        business: {
          id: business.id,
          name: business.name,
          logo_url: business.logo_url,
          background_image_url: business.background_image_url,
          card_design: business.card_design || {},
          brand_colors: business.brand_colors || { primary: '#9333EA', accent: '#F97316' },
          reward_structure: business.reward_structure,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/v1/customers/:id/send-card - Send card recovery via WhatsApp
router.post('/:id/send-card', authenticate, whatsappRateLimiter.middleware, async (req: AuthenticatedRequest, res, next) => {
  try {
    const customerId = z.string().uuid().parse(req.params.id);

    // Get customer
    const customer = await CustomerService.findById(customerId);

    if (!customer) {
      res.status(404).json({
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Cliente no encontrado',
        },
      });
      return;
    }

    // Verify customer belongs to this business (security check)
    if (customer.business_id !== req.user!.businessId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'No tienes permiso para acceder a este cliente',
        },
      });
      return;
    }

    // Get business details
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('name')
      .eq('id', customer.business_id)
      .single();

    const businessName = business?.name || 'Tu negocio';

    // Generate card URL (or use existing pass_url)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    const cardUrl = customer.pass_url || `${frontendUrl}/card/${customer.id}`;

    // Get WhatsApp instance name
    const instanceName = evolutionManager.generateInstanceName(customer.business_id);

    // Check instance connection
    try {
      const status = await evolutionWhatsAppService.getInstanceStatus(instanceName);
      if (!status.connected) {
        res.status(400).json({
          error: {
            code: 'WHATSAPP_NOT_CONNECTED',
            message: 'WhatsApp no está conectado. Por favor, conecta WhatsApp en la configuración.',
          },
        });
        return;
      }
    } catch (error: any) {
      res.status(503).json({
        error: {
          code: 'WHATSAPP_SERVICE_ERROR',
          message: 'Error al verificar conexión de WhatsApp',
        },
      });
      return;
    }

    // Format message
    const message = `Hola ${customer.name}! 👋

Aquí está tu tarjeta de fidelidad de *${businessName}*:

🎁 Progreso actual: ${customer.stamps_count || 0} sellos

👉 Accede a tu tarjeta aquí:
${cardUrl}

¡Guarda este enlace para siempre tener tu tarjeta a mano!`;

    // Send message
    try {
      await evolutionWhatsAppService.sendMessage({
        instanceName,
        phone: customer.phone,
        text: message,
      });

      // Log the send (optional - for audit trail)
      console.log(`Card recovery sent - Customer: ${customer.id}, Business: ${customer.business_id}`);

      res.json({
        success: true,
        message: 'Tarjeta enviada exitosamente por WhatsApp',
      });
    } catch (error: any) {
      console.error('Failed to send card recovery:', error);

      // Handle specific errors
      if (error.message.includes('INVALID_PHONE')) {
        res.status(400).json({
          error: {
            code: 'INVALID_PHONE',
            message: 'Número de teléfono inválido',
          },
        });
        return;
      }

      if (error.message.includes('INSTANCE_NOT_CONNECTED')) {
        res.status(400).json({
          error: {
            code: 'WHATSAPP_NOT_CONNECTED',
            message: 'WhatsApp no está conectado',
          },
        });
        return;
      }

      res.status(500).json({
        error: {
          code: 'SEND_FAILED',
          message: 'Error al enviar mensaje. Por favor intenta nuevamente.',
        },
      });
    }
  } catch (error) {
    return next(error);
  }
});

export default router;
