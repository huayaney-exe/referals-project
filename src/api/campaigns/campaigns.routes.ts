import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { CampaignService, CreateCampaignInput } from '../../domains/campaign/Campaign';
import { NotFoundError } from '../../domains/types';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/v1/campaigns
 * Create a new campaign
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const input: CreateCampaignInput = {
      business_id: req.user!.businessId,
      name: req.body.name,
      message: req.body.message,
      target_segment: req.body.target_segment,
      scheduled_for: req.body.scheduled_for,
    };

    const campaign = await CampaignService.create(input);

    res.status(201).json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/campaigns
 * List all campaigns for the authenticated business
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string | undefined;
    const campaigns = await CampaignService.findByBusiness(
      req.user!.businessId,
      status as any
    );

    res.json({
      success: true,
      data: campaigns,
      count: campaigns.length,
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * GET /api/v1/campaigns/:id
 * Get a specific campaign by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const campaign = await CampaignService.findById(req.params.id);

    if (!campaign) {
      throw new NotFoundError('Campaign', req.params.id);
    }

    // Verify ownership
    if (campaign.business_id !== req.user!.businessId) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'No tienes permiso para acceder a esta campaña',
        },
      });
      return;
    }

    res.json({
      success: true,
      data: campaign,
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * PATCH /api/v1/campaigns/:id/activate
 * Activate (schedule) a campaign
 */
router.patch('/:id/activate', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const campaign = await CampaignService.findById(req.params.id);

    if (!campaign) {
      throw new NotFoundError('Campaign', req.params.id);
    }

    // Verify ownership
    if (campaign.business_id !== req.user!.businessId) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'No tienes permiso para activar esta campaña',
        },
      });
      return;
    }

    const scheduled_for = req.body.scheduled_for || new Date(Date.now() + 60000).toISOString(); // Default: 1 min from now
    const activated = await CampaignService.schedule(req.params.id, scheduled_for);

    res.json({
      success: true,
      data: activated,
      message: 'Campaña activada exitosamente',
    });
  } catch (error) {
    return next(error);
  }
});

/**
 * DELETE /api/v1/campaigns/:id
 * Delete a draft campaign
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const campaign = await CampaignService.findById(req.params.id);

    if (!campaign) {
      throw new NotFoundError('Campaign', req.params.id);
    }

    // Verify ownership
    if (campaign.business_id !== req.user!.businessId) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'No tienes permiso para eliminar esta campaña',
        },
      });
      return;
    }

    await CampaignService.delete(req.params.id);

    res.json({
      success: true,
      message: 'Campaña eliminada exitosamente',
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
