import { Router } from 'express';
import { supabaseAdmin } from '../../config/supabase';

const router = Router();

/**
 * GET /api/v1/businesses/:id
 * Public endpoint - fetch business info for customer enrollment
 * No authentication required (uses admin client to bypass RLS)
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({
        error: 'Invalid business ID format'
      });
    }

    // Fetch public business information (admin client bypasses RLS)
    const { data: business, error } = await supabaseAdmin
      .from('businesses')
      .select('id, name, logo_url, category, reward_structure, card_design, brand_colors, is_active')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !business) {
      return res.status(404).json({
        error: 'Business not found'
      });
    }

    // Return public business data - wrapped in data object for consistency
    res.json({
      id: business.id,
      name: business.name,
      logo_url: business.logo_url,
      category: business.category,
      reward_structure: business.reward_structure,
      card_design: business.card_design || {},
      brand_colors: business.brand_colors || { primary: '#A855F7', accent: '#F97316' },
    });

  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({
      error: 'Failed to fetch business information'
    });
  }
});

export default router;
