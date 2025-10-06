import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { AnalyticsService } from '../../domains/analytics/Analytics';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/analytics/dashboard
 * Get business dashboard metrics
 */
router.get('/dashboard', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = req.user!.businessId;

    const metrics = await AnalyticsService.getBusinessMetrics(businessId);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/analytics/top-customers
 * Get top customers by stamps
 */
router.get('/top-customers', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = req.user!.businessId;
    const limit = parseInt(req.query.limit as string) || 10;

    const topCustomers = await AnalyticsService.getTopCustomers(businessId, limit);

    res.json({
      success: true,
      data: topCustomers,
      count: topCustomers.length,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/analytics/stamps-timeline
 * Get stamps timeline data (last N days)
 */
router.get('/stamps-timeline', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = req.user!.businessId;
    const days = parseInt(req.query.days as string) || 30;

    const timeline = await AnalyticsService.getStampsTimeSeries(businessId, days);

    res.json({
      success: true,
      data: timeline,
      count: timeline.length,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
