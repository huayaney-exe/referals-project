import { Router } from 'express';
import { z } from 'zod';
import { StampService } from '../../domains/loyalty/Stamp';
import { CustomerService } from '../../domains/customer/Customer';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';
import { stampLimiter } from '../middleware/rateLimiting.middleware';
import { campaignEventEmitter } from '../../infrastructure/events/EventEmitter';

const router = Router();

const addStampSchema = z.object({
  customer_id: z.string().uuid(),
  quantity: z.number().int().min(1).max(10).default(1),
  idempotency_key: z.string().optional(),
});

// POST /api/v1/stamps - Add stamp to customer
router.post('/', authenticate, stampLimiter, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validated = addStampSchema.parse(req.body);
    const { customer_id, quantity } = validated;

    // Verify customer belongs to business
    const customer = await CustomerService.findById(customer_id);
    if (!customer) {
      res.status(404).json({
        error: {
          code: 'CUSTOMER_NOT_FOUND',
          message: 'Customer not found',
        },
      });
      return;
    }

    if (customer.business_id !== req.user!.businessId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Customer does not belong to your business',
        },
      });
      return;
    }

    // Add stamps in a loop (or batch operation in future)
    let totalRewards = 0;
    let finalStampCount = customer.stamps_count;
    const initialStampCount = customer.stamps_count;

    for (let i = 0; i < quantity; i++) {
      const result = await StampService.addStamp(
        customer_id,
        req.user!.businessId,
        req.user!.email,
        validated.idempotency_key ? `${validated.idempotency_key}_${i}` : null
      );
      finalStampCount = result.new_stamps_count;
      if (result.is_reward_earned) totalRewards++;
    }

    // Emit campaign events for event-triggered campaigns
    try {
      // Emit stamps.reached event for the final stamp count
      campaignEventEmitter.emitStampsReached(
        req.user!.businessId,
        customer_id,
        finalStampCount
      );

      // Emit reward.unlocked if customer earned rewards
      if (totalRewards > 0) {
        // Get business reward structure to include reward description
        const business = await CustomerService.getBusinessInfo(req.user!.businessId);
        const rewardDescription = business?.reward_structure?.reward_description || '1 premio gratis';

        campaignEventEmitter.emitRewardUnlocked(
          req.user!.businessId,
          customer_id,
          rewardDescription
        );
      }

      // Emit customer.enrolled if this is their first stamp
      if (initialStampCount === 0 && finalStampCount > 0) {
        campaignEventEmitter.emitCustomerEnrolled(
          req.user!.businessId,
          customer_id
        );
      }
    } catch (eventError) {
      // Log but don't fail the request if event emission fails
      console.error('Error emitting campaign events:', eventError);
    }

    res.status(201).json({
      data: {
        stamps_added: quantity,
        stamps_count: finalStampCount,
        rewards_earned: totalRewards,
        message: totalRewards > 0
          ? `¡${totalRewards} recompensa${totalRewards > 1 ? 's' : ''} desbloqueada${totalRewards > 1 ? 's' : ''}!`
          : `${quantity} sello${quantity > 1 ? 's' : ''} agregado${quantity > 1 ? 's' : ''}`,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/v1/stamps/history/:customerId - Get stamp history
router.get('/history/:customerId', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const customerId = z.string().uuid().parse(req.params.customerId);

    // Verify customer belongs to business
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

    if (customer.business_id !== req.user!.businessId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Customer does not belong to your business',
        },
      });
      return;
    }

    const history = await StampService.getHistory(customerId);

    res.json({
      stamps: history.map((stamp) => ({
        id: stamp.id,
        stamped_at: stamp.stamped_at,
        stamped_by: stamp.stamped_by,
        is_reward_redemption: stamp.is_reward_redemption,
      })),
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
