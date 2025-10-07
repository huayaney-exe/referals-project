import { Router } from 'express';
import { supabaseAdmin } from '../../config/supabase';
import { authenticate } from '../middleware/auth.middleware';

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

/**
 * PATCH /api/v1/businesses/:id
 * Update business settings
 * Requires authentication
 */
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Verify user owns this business
    if (!req.user || req.user.businessId !== id) {
      return res.status(403).json({
        error: 'No tienes permiso para modificar este negocio'
      });
    }

    // Validate allowed fields
    const allowedFields = ['name', 'email', 'phone', 'category', 'logo_url', 'reward_structure'];
    const updateData: any = {};

    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateData[field] = updates[field];
      }
    }

    // Validate phone format if provided
    if (updateData.phone) {
      const phoneRegex = /^\+?51\s?9\d{8}$/;
      if (!phoneRegex.test(updateData.phone)) {
        return res.status(400).json({
          error: 'Formato de teléfono inválido. Debe ser un número móvil de Perú (+51 9XX XXX XXX)'
        });
      }
    }

    // Validate reward_structure if provided
    if (updateData.reward_structure) {
      if (!updateData.reward_structure.stamps_required || !updateData.reward_structure.reward_description) {
        return res.status(400).json({
          error: 'La estructura de recompensas debe incluir stamps_required y reward_description'
        });
      }
    }

    // Update business
    const { data: business, error } = await supabaseAdmin
      .from('businesses')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating business:', error);
      return res.status(500).json({
        error: 'Error al actualizar la configuración del negocio'
      });
    }

    res.json(business);

  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({
      error: 'Error al actualizar la configuración del negocio'
    });
  }
});

export default router;
