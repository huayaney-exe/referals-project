import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../../config/supabase';
import { StampService } from '../../domains/loyalty/Stamp';
import { CustomerService } from '../../domains/customer/Customer';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiters
const validateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute per IP
  message: 'Too many validation requests, please try again later',
});

const stampLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 stamps per hour per IP
  message: 'Scanner usage limit reached, please try again later',
});

// Validation schemas
const stampSchema = z.object({
  customer_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(10).default(1),
});

// GET /api/v1/scanner/validate/:token - Validate scanner token (public)
router.get('/validate/:token', validateLimiter, async (req, res, next) => {
  try {
    const { token } = req.params;

    // Call validation function
    const { data, error } = await supabaseAdmin
      .rpc('validate_scanner_token', { token_string: token });

    if (error) throw error;

    const result = data[0];

    if (!result || !result.is_valid) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired scanner token',
        },
      });
    }

    // Get business reward structure for card state
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('reward_structure')
      .eq('id', result.business_id)
      .single();

    res.json({
      data: {
        is_valid: true,
        business_id: result.business_id,
        business_name: result.business_name,
        location_name: result.location_name,
        token_id: result.token_id,
        card_state: {
          stamps_required: business?.reward_structure?.stamps_required || 10,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/scanner/:token/stamp - Add stamp using scanner token (public)
router.post('/:token/stamp', stampLimiter, async (req, res, next) => {
  try {
    const { token } = req.params;
    const validated = stampSchema.parse(req.body);
    const { customer_id, quantity } = validated;

    // Validate token
    const { data: validationData, error: validationError } = await supabaseAdmin
      .rpc('validate_scanner_token', { token_string: token });

    if (validationError) throw validationError;

    const validation = validationData[0];

    if (!validation || !validation.is_valid) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired scanner token',
        },
      });
    }

    // Verify customer belongs to same business
    const customer = await CustomerService.findById(customer_id);
    if (!customer) {
      return res.status(404).json({
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found',
        },
      });
    }

    if (customer.business_id !== validation.business_id) {
      return res.status(403).json({
        error: {
          code: 'BUSINESS_MISMATCH',
          message: 'Customer does not belong to this business',
        },
      });
    }

    // Get business reward structure
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('reward_structure')
      .eq('id', validation.business_id)
      .single();

    const stampsRequired = business?.reward_structure?.stamps_required || 10;

    // Block if card is already complete
    if (customer.stamps_count >= stampsRequired) {
      return res.status(400).json({
        error: {
          code: 'CARD_COMPLETE',
          message: 'La tarjeta está completa. Debe canjear la recompensa primero.',
          stamps_current: customer.stamps_count,
          stamps_required: stampsRequired,
        },
      });
    }

    // Add stamps
    let finalStampCount = 0;
    let totalRewards = 0;

    for (let i = 0; i < quantity; i++) {
      const result = await StampService.addStamp(
        customer_id,
        validation.business_id,
        `scanner_token_${validation.token_id}`, // Use token as created_by identifier
        null // No idempotency key for scanner operations
      );
      finalStampCount = result.new_stamps_count;
      if (result.is_reward_earned) totalRewards++;
    }

    // Record scanner session (trigger will auto-update usage_count)
    await supabaseAdmin
      .from('scanner_sessions')
      .insert({
        scanner_token_id: validation.token_id,
        customer_id,
        stamps_added: quantity,
      });

    res.status(201).json({
      data: {
        stamps_added: quantity,
        stamps_count: finalStampCount,
        rewards_earned: totalRewards,
        message:
          totalRewards > 0
            ? `¡${totalRewards} recompensa${totalRewards > 1 ? 's' : ''} desbloqueada${totalRewards > 1 ? 's' : ''}!`
            : `${quantity} sello${quantity > 1 ? 's' : ''} agregado${quantity > 1 ? 's' : ''}`,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Validation schema for redemption
const redeemSchema = z.object({
  customer_id: z.string().uuid(),
});

// POST /api/v1/scanner/:token/redeem - Redeem reward (public)
router.post('/:token/redeem', stampLimiter, async (req, res, next) => {
  try {
    const { token } = req.params;
    const validated = redeemSchema.parse(req.body);
    const { customer_id } = validated;

    // Validate token
    const { data: validationData, error: validationError } = await supabaseAdmin
      .rpc('validate_scanner_token', { token_string: token });

    if (validationError) throw validationError;

    const validation = validationData[0];

    if (!validation || !validation.is_valid) {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid or expired scanner token',
        },
      });
    }

    // Get customer
    const customer = await CustomerService.findById(customer_id);
    if (!customer) {
      return res.status(404).json({
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found',
        },
      });
    }

    // Verify customer belongs to same business
    if (customer.business_id !== validation.business_id) {
      return res.status(403).json({
        error: {
          code: 'BUSINESS_MISMATCH',
          message: 'Customer does not belong to this business',
        },
      });
    }

    // Get business reward structure
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('reward_structure')
      .eq('id', validation.business_id)
      .single();

    const stampsRequired = business?.reward_structure?.stamps_required || 10;
    const rewardDescription = business?.reward_structure?.reward_description || 'Recompensa';

    // Verify card is complete
    if (customer.stamps_count < stampsRequired) {
      return res.status(400).json({
        error: {
          code: 'CARD_INCOMPLETE',
          message: 'La tarjeta no está completa todavía',
          stamps_current: customer.stamps_count,
          stamps_required: stampsRequired,
        },
      });
    }

    // Add redemption stamp (this will reset the card to 0)
    const result = await StampService.addStamp(
      customer_id,
      validation.business_id,
      `scanner_token_${validation.token_id}_redemption`,
      null
    );

    // Log redemption in scanner_sessions (negative stamps to indicate redemption)
    await supabaseAdmin
      .from('scanner_sessions')
      .insert({
        scanner_token_id: validation.token_id,
        customer_id,
        stamps_added: -stampsRequired,
      });

    res.status(200).json({
      data: {
        success: true,
        stamps_before: stampsRequired,
        stamps_after: result.new_stamps_count,
        reward_description: rewardDescription,
        message: '¡Recompensa canjeada exitosamente!',
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
