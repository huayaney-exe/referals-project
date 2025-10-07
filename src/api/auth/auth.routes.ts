import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../../config/supabase';
import { BusinessService } from '../../domains/business/Business';
import { authLimiter } from '../middleware/rateLimiting.middleware';
import { EvolutionInstanceManager } from '../../infrastructure/whatsapp/EvolutionInstanceManager';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  businessName: z.string().min(1, 'Business name is required'),
  phone: z.string().regex(/^\+51 9\d{2} \d{3} \d{3}$/, 'Invalid Peru phone format').optional(),
  rewardStructure: z.object({
    stamps_required: z.number().int().min(1).max(50),
    reward_description: z.string().min(1).max(500),
  }),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/v1/auth/register - Register new business
router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const validated = registerSchema.parse(req.body);

    // Step 1: Create Supabase auth user FIRST to get user_id
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validated.email,
      password: validated.password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Supabase auth error:', authError);

      // Handle specific error cases
      if (authError.status === 422 && authError.code === 'email_exists') {
        res.status(409).json({
          error: {
            code: 'EMAIL_EXISTS',
            message: 'Este correo ya está registrado. Usa otro correo o inicia sesión.',
          },
        });
        return;
      }

      throw authError;
    }

    // Step 2: Create business in database with owner_id foreign key
    const business = await BusinessService.create({
      email: validated.email,
      name: validated.businessName,
      phone: validated.phone,
      reward_structure: validated.rewardStructure,
      owner_id: authData.user.id, // Production-grade: DB foreign key
    });

    // Step 3: Update user with app_metadata (secure, admin-only)
    // Also keep user_metadata for backwards compatibility during migration
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authData.user.id, {
      app_metadata: {
        business_id: business.id, // Source of truth for JWT claims
        business_name: validated.businessName,
      },
      user_metadata: {
        business_id: business.id, // Backwards compatibility (deprecated)
        business_name: validated.businessName,
      },
    });

    if (updateError) {
      console.error('Failed to update user metadata:', updateError);
      // Rollback: delete both auth user and business
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      await BusinessService.deactivate(business.id);
      throw updateError;
    }

    // Create Evolution API instance for WhatsApp
    let whatsappInstance = null;
    try {
      const instanceManager = new EvolutionInstanceManager();
      const instanceName = instanceManager.generateInstanceName(business.id);

      // Create instance
      await instanceManager.createInstance(business.id);

      // Get QR code for WhatsApp connection
      const qrCode = await instanceManager.getQRCode(instanceName);

      // Update business with Evolution instance details
      await supabaseAdmin
        .from('businesses')
        .update({
          evolution_instance_name: instanceName,
          evolution_qr_code: qrCode,
          evolution_connected: false,
        })
        .eq('id', business.id);

      whatsappInstance = {
        instance_name: instanceName,
        qr_code: qrCode,
        status: 'awaiting_connection',
        instructions: 'Scan this QR code with WhatsApp on your phone to connect',
      };
    } catch (evolutionError: any) {
      console.error('Evolution API error during registration:', evolutionError);
      // Continue registration even if WhatsApp setup fails
      // Business can set up WhatsApp later via dedicated endpoint
      whatsappInstance = {
        status: 'setup_failed',
        message: 'WhatsApp setup incomplete. You can retry from settings.',
        error: evolutionError.message,
      };
    }

    res.status(201).json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        businessId: business.id,
      },
      business: {
        id: business.id,
        name: business.name,
        email: business.email,
      },
      whatsapp: whatsappInstance,
    });
  } catch (error) {
    return next(error);
  }
});

// POST /api/v1/auth/login - Login
router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const validated = loginSchema.parse(req.body);

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    });

    if (error) {
      res.status(401).json({
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Email o password incorrecto',
        },
      });
      return;
    }

    res.json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_in: data.session.expires_in,
      user: {
        id: data.user.id,
        email: data.user.email,
        businessId: data.user.user_metadata?.business_id,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
