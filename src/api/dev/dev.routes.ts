import { Router } from 'express';
import { supabaseAdmin } from '../../config/supabase';

const router = Router();

/**
 * DEV ONLY: Reset onboarding status for all businesses
 * POST /api/v1/dev/reset-onboarding
 */
router.post('/reset-onboarding', async (req, res) => {
  // Only allow in development
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'This endpoint is only available in development mode'
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('businesses')
      .update({
        onboarding_completed: false,
        onboarding_completed_at: null,
      })
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

    if (error) {
      throw error;
    }

    // Count how many were reset
    const { count } = await supabaseAdmin
      .from('businesses')
      .select('*', { count: 'exact', head: true })
      .eq('onboarding_completed', false);

    res.json({
      success: true,
      message: `Reset onboarding status for all businesses`,
      businesses_reset: count || 0,
    });

  } catch (error) {
    console.error('Error resetting onboarding:', error);
    res.status(500).json({
      error: 'Failed to reset onboarding status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DEV ONLY: Get onboarding status for all businesses
 * GET /api/v1/dev/onboarding-status
 */
router.get('/onboarding-status', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'This endpoint is only available in development mode'
    });
  }

  try {
    const { data: businesses, error } = await supabaseAdmin
      .from('businesses')
      .select('id, email, name, onboarding_completed, onboarding_completed_at, is_active')
      .order('created_at', { ascending: false});

    if (error) throw error;

    const completed = businesses?.filter(b => b.onboarding_completed).length || 0;
    const incomplete = businesses?.filter(b => !b.onboarding_completed).length || 0;

    res.json({
      total: businesses?.length || 0,
      completed,
      incomplete,
      businesses: businesses || [],
    });

  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    res.status(500).json({
      error: 'Failed to fetch onboarding status'
    });
  }
});

/**
 * DEV ONLY: Activate a business (set is_active = true)
 * POST /api/v1/dev/activate-business/:id
 */
router.post('/activate-business/:id', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'This endpoint is only available in development mode'
    });
  }

  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('businesses')
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: `Business ${id} activated`,
      business: data,
    });

  } catch (error) {
    console.error('Error activating business:', error);
    res.status(500).json({
      error: 'Failed to activate business',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
