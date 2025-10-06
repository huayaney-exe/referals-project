import { Router } from 'express';
import { z } from 'zod';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';
import { supabaseAdmin } from '../../config/supabase';

const router = Router();

// Validation schemas
const createTokenSchema = z.object({
  name: z.string().min(1).max(100),
  location_id: z.string().uuid().optional(),
  expires_at: z.string().datetime().optional(),
});

const updateTokenSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  is_active: z.boolean().optional(),
});

// POST /api/v1/scanner-tokens - Create new scanner token
router.post('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validated = createTokenSchema.parse(req.body);

    // Generate unique token
    const { data: tokenData, error: tokenGenError } = await supabaseAdmin
      .rpc('generate_scanner_token');

    if (tokenGenError) throw tokenGenError;

    // Create scanner token record
    const { data, error } = await supabaseAdmin
      .from('scanner_tokens')
      .insert({
        business_id: req.user!.businessId,
        token: tokenData,
        name: validated.name,
        created_by: req.user!.userId,
        location_id: validated.location_id || null,
        expires_at: validated.expires_at || null,
      })
      .select()
      .single();

    if (error) throw error;

    // Generate access URL
    const accessUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/scan/${tokenData}`;

    res.status(201).json({
      data: {
        id: data.id,
        name: data.name,
        token: tokenData,
        access_url: accessUrl,
        location_id: data.location_id,
        expires_at: data.expires_at,
        is_active: data.is_active,
        created_at: data.created_at,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// GET /api/v1/scanner-tokens - List all tokens for business
router.get('/', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('scanner_tokens')
      .select(`
        id,
        name,
        token,
        location_id,
        is_active,
        expires_at,
        created_at,
        last_used_at,
        usage_count,
        business_locations (
          id,
          name
        )
      `)
      .eq('business_id', req.user!.businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Mask tokens for security (only show first/last few chars)
    const maskedData = data.map(token => ({
      ...token,
      token_preview: `${token.token.substring(0, 8)}...${token.token.substring(token.token.length - 4)}`,
      token: undefined, // Remove full token
    }));

    res.json({ data: maskedData });
  } catch (error) {
    return next(error);
  }
});

// GET /api/v1/scanner-tokens/:id - Get token details
router.get('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabaseAdmin
      .from('scanner_tokens')
      .select(`
        id,
        name,
        token,
        location_id,
        is_active,
        expires_at,
        created_at,
        last_used_at,
        usage_count,
        business_locations (
          id,
          name
        )
      `)
      .eq('id', id)
      .eq('business_id', req.user!.businessId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: {
          code: 'TOKEN_NOT_FOUND',
          message: 'Scanner token not found',
        },
      });
    }

    // Generate access URL with full token
    const accessUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/scan/${data.token}`;

    res.json({
      data: {
        ...data,
        access_url: accessUrl,
      },
    });
  } catch (error) {
    return next(error);
  }
});

// PATCH /api/v1/scanner-tokens/:id - Update token
router.patch('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    const validated = updateTokenSchema.parse(req.body);

    const { data, error } = await supabaseAdmin
      .from('scanner_tokens')
      .update(validated)
      .eq('id', id)
      .eq('business_id', req.user!.businessId)
      .select()
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: {
          code: 'TOKEN_NOT_FOUND',
          message: 'Scanner token not found',
        },
      });
    }

    res.json({ data });
  } catch (error) {
    return next(error);
  }
});

// DELETE /api/v1/scanner-tokens/:id - Delete token
router.delete('/:id', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    const { error } = await supabaseAdmin
      .from('scanner_tokens')
      .delete()
      .eq('id', id)
      .eq('business_id', req.user!.businessId);

    if (error) throw error;

    res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

// GET /api/v1/scanner-tokens/:id/stats - Get usage statistics
router.get('/:id/stats', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;

    // Verify token belongs to business
    const { data: token, error: tokenError } = await supabaseAdmin
      .from('scanner_tokens')
      .select('id, usage_count, last_used_at')
      .eq('id', id)
      .eq('business_id', req.user!.businessId)
      .single();

    if (tokenError || !token) {
      return res.status(404).json({
        error: {
          code: 'TOKEN_NOT_FOUND',
          message: 'Scanner token not found',
        },
      });
    }

    // Get recent sessions
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('scanner_sessions')
      .select(`
        id,
        stamps_added,
        created_at,
        customers (
          id,
          name,
          phone
        )
      `)
      .eq('scanner_token_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (sessionsError) throw sessionsError;

    res.json({
      data: {
        usage_count: token.usage_count,
        last_used_at: token.last_used_at,
        recent_sessions: sessions,
      },
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
