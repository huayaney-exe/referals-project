import { Router } from 'express';
import { z } from 'zod';
import { CustomerService } from '../../domains/customer/Customer';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';
import { supabaseAdmin } from '../../config/supabase';

const router = Router();

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
    next(error);
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
    next(error);
  }
});

export default router;
