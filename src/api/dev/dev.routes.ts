import { Router } from 'express';
import { supabaseAdmin } from '../../config/supabase';
import { campaignEventEmitter } from '../../infrastructure/events/EventEmitter';

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

/**
 * DEV ONLY: Manually trigger a campaign event for testing
 * POST /api/v1/dev/trigger-campaign-event
 * Body: { businessId, customerId, eventType, value?, phone?, name? }
 */
router.post('/trigger-campaign-event', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'This endpoint is only available in development mode'
    });
  }

  try {
    const { businessId, customerId, eventType, value, phone, name } = req.body;

    if (!businessId || !customerId || !eventType) {
      return res.status(400).json({
        error: 'businessId, customerId, and eventType are required',
        example: {
          businessId: 'uuid',
          customerId: 'uuid',
          eventType: 'customer_enrolled | stamps_reached | reward_unlocked | customer_inactive',
          value: 7, // optional, for stamps_reached or days_inactive
          phone: '+51999999999', // optional, for display
          name: 'Test Customer' // optional, for display
        }
      });
    }

    // Emit the appropriate event
    switch (eventType) {
      case 'customer_enrolled':
        campaignEventEmitter.emitCustomerEnrolled(businessId, customerId, { name, phone });
        break;

      case 'stamps_reached':
        if (!value) {
          return res.status(400).json({ error: 'value (stamps count) required for stamps_reached' });
        }
        campaignEventEmitter.emitStampsReached(businessId, customerId, value);
        break;

      case 'reward_unlocked':
        const rewardDescription = req.body.rewardDescription || '1 premio gratis';
        campaignEventEmitter.emitRewardUnlocked(businessId, customerId, rewardDescription);
        break;

      case 'customer_inactive':
        if (!value) {
          return res.status(400).json({ error: 'value (days inactive) required for customer_inactive' });
        }
        campaignEventEmitter.emitCustomerInactive(businessId, customerId, value);
        break;

      default:
        return res.status(400).json({
          error: `Invalid eventType: ${eventType}`,
          validTypes: ['customer_enrolled', 'stamps_reached', 'reward_unlocked', 'customer_inactive']
        });
    }

    res.json({
      success: true,
      message: `Event ${eventType} emitted successfully`,
      event: {
        businessId,
        customerId,
        eventType,
        value,
        name,
        phone
      },
      nextSteps: [
        '1. Check backend logs for event processing',
        '2. Verify campaign matched in database',
        '3. Check WhatsApp message sent',
        '4. Verify campaign sent_count incremented'
      ]
    });

  } catch (error) {
    console.error('Error triggering campaign event:', error);
    res.status(500).json({
      error: 'Failed to trigger campaign event',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DEV ONLY: Test campaign with specific customer data
 * POST /api/v1/dev/test-campaign-message
 * Body: { businessId, customerId, phone, name }
 */
router.post('/test-campaign-message', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      error: 'This endpoint is only available in development mode'
    });
  }

  try {
    const { businessId, customerId, phone, name } = req.body;

    if (!businessId || !customerId || !phone || !name) {
      return res.status(400).json({
        error: 'businessId, customerId, phone, and name are required',
        example: {
          businessId: '83d04291-7f1e-4290-99c6-37c76407064d',
          customerId: 'customer-uuid',
          phone: '+51999999999',
          name: 'Juan Perez'
        }
      });
    }

    // Get active campaigns for this business
    const { data: campaigns, error } = await supabaseAdmin
      .from('campaigns')
      .select('*')
      .eq('business_id', businessId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!campaigns || campaigns.length === 0) {
      return res.status(404).json({
        error: 'No active campaigns found for this business',
        hint: 'Create a campaign first in the dashboard at /dashboard/campaigns/new'
      });
    }

    // Emit customer_enrolled event to trigger welcome campaigns
    campaignEventEmitter.emitCustomerEnrolled(businessId, customerId, { name, phone });

    res.json({
      success: true,
      message: 'Test event emitted - campaign should trigger shortly',
      activeCampaigns: campaigns.map(c => ({
        id: c.id,
        name: c.name,
        trigger_type: c.trigger_type,
        trigger_config: c.trigger_config
      })),
      testData: {
        businessId,
        customerId,
        phone,
        name
      },
      nextSteps: [
        '1. Check backend logs for "Processing customer.enrolled event"',
        '2. Check WhatsApp for message at: ' + phone,
        '3. Verify campaign sent_count incremented in database',
        '4. Try other events: stamps_reached, reward_unlocked'
      ]
    });

  } catch (error) {
    console.error('Error testing campaign:', error);
    res.status(500).json({
      error: 'Failed to test campaign',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
