import { Router } from 'express';
import { z } from 'zod';
import { supabase } from '../../config/supabase';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'branding');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
    }
  },
});

// Validation schemas
const rewardConfigSchema = z.object({
  stamps_required: z.number().int().min(5).max(20),
  reward_description: z.string().min(1).max(255),
  template_used: z.string().optional(),
});

const cardDesignSchema = z.object({
  template_id: z.string(),
  brand_color_primary: z.string().regex(/^#[0-9A-F]{6}$/i),
  brand_color_accent: z.string().regex(/^#[0-9A-F]{6}$/i),
  use_gradient: z.boolean().default(true),
});

const completeOnboardingSchema = z.object({
  reward_structure: rewardConfigSchema,
  card_design: cardDesignSchema,
  qr_downloaded: z.boolean().default(false),
});

// GET /api/v1/onboarding/status - Check onboarding status
router.get('/status', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { data: business, error } = await supabase
      .from('businesses')
      .select('onboarding_completed, onboarding_completed_at, card_design, brand_colors')
      .eq('id', req.user!.businessId)
      .single();

    if (error) throw error;

    // Get progress steps
    const { data: progress, error: progressError } = await supabase
      .from('onboarding_progress')
      .select('*')
      .eq('business_id', req.user!.businessId)
      .order('step_number', { ascending: true });

    if (progressError) throw progressError;

    res.json({
      onboarding_completed: business.onboarding_completed,
      onboarding_completed_at: business.onboarding_completed_at,
      card_design: business.card_design,
      brand_colors: business.brand_colors,
      progress: progress || [],
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/onboarding/step/:stepNumber - Update onboarding step
router.patch('/step/:stepNumber', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const stepNumber = parseInt(req.params.stepNumber);
    if (stepNumber < 0 || stepNumber > 4) {
      res.status(400).json({
        error: {
          code: 'INVALID_STEP',
          message: 'Step number must be between 0 and 4',
        },
      });
      return;
    }

    const stepNames = ['initial_load', 'welcome', 'reward_config', 'card_design', 'launch'];
    const stepName = stepNames[stepNumber];

    const timeSpent = req.body.time_spent_seconds || null;
    const metadata = req.body.metadata || {};

    // Track step completion
    const { data, error } = await supabase.rpc('track_onboarding_step', {
      p_business_id: req.user!.businessId,
      p_step_number: stepNumber,
      p_step_name: stepName,
      p_time_spent_seconds: timeSpent,
      p_metadata: metadata,
    });

    if (error) throw error;

    res.json({
      success: true,
      step_number: stepNumber,
      step_name: stepName,
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/onboarding/complete - Complete onboarding
router.patch('/complete', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const validated = completeOnboardingSchema.parse(req.body);

    // Update business with onboarding data
    const { error: updateError } = await supabase
      .from('businesses')
      .update({
        reward_structure: validated.reward_structure,
        card_design: validated.card_design,
        brand_colors: {
          primary: validated.card_design.brand_color_primary,
          accent: validated.card_design.brand_color_accent,
        },
        qr_downloaded: validated.qr_downloaded,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.user!.businessId);

    if (updateError) throw updateError;

    // Mark onboarding as complete
    const { error: completeError } = await supabase.rpc('complete_onboarding', {
      p_business_id: req.user!.businessId,
    });

    if (completeError) throw completeError;

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/onboarding/upload - Upload logo or background image
router.post(
  '/upload',
  authenticate,
  upload.single('file'),
  async (req: AuthenticatedRequest, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({
          error: {
            code: 'NO_FILE',
            message: 'No file uploaded',
          },
        });
        return;
      }

      const type = req.body.type as 'logo' | 'background';
      if (type !== 'logo' && type !== 'background') {
        // Delete uploaded file
        await fs.unlink(req.file.path);

        res.status(400).json({
          error: {
            code: 'INVALID_TYPE',
            message: 'Type must be "logo" or "background"',
          },
        });
        return;
      }

      // Generate public URL (in production, upload to S3/Cloudinary)
      const publicUrl = `/uploads/branding/${req.file.filename}`;

      // Update business with image URL
      const updateField = type === 'logo' ? 'logo_url' : 'background_image_url';
      const { error: updateError } = await supabase
        .from('businesses')
        .update({
          [updateField]: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.user!.businessId);

      if (updateError) {
        // Delete uploaded file on error
        await fs.unlink(req.file.path);
        throw updateError;
      }

      res.json({
        success: true,
        url: publicUrl,
        type,
      });
    } catch (error) {
      // Clean up file on error
      if (req.file) {
        await fs.unlink(req.file.path).catch(() => {});
      }
      next(error);
    }
  }
);

// GET /api/v1/onboarding/templates - Get card templates
router.get('/templates', async (req, res) => {
  const templates = [
    {
      id: 'modern',
      name: 'Moderna',
      preview_url: '/templates/modern.png',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      stamp_style: 'circles',
      category: 'trendy',
    },
    {
      id: 'classic',
      name: 'Clásica',
      preview_url: '/templates/classic.png',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      stamp_style: 'squares',
      category: 'timeless',
    },
    {
      id: 'minimal',
      name: 'Minimalista',
      preview_url: '/templates/minimal.png',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      stamp_style: 'lines',
      category: 'simple',
    },
    {
      id: 'elegant',
      name: 'Elegante',
      preview_url: '/templates/elegant.png',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      stamp_style: 'hearts',
      category: 'premium',
    },
    {
      id: 'playful',
      name: 'Divertida',
      preview_url: '/templates/playful.png',
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      stamp_style: 'stars',
      category: 'fun',
    },
    {
      id: 'premium',
      name: 'Premium',
      preview_url: '/templates/premium.png',
      gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)',
      stamp_style: 'diamonds',
      category: 'luxury',
    },
  ];

  res.json({ templates });
});

// GET /api/v1/onboarding/reward-templates - Get reward description templates
router.get('/reward-templates', async (req, res) => {
  const templates = [
    { id: 'coffee', label: '☕ Café Gratis', description: '1 café gratis' },
    { id: 'pizza', label: '🍕 Pizza Gratis', description: '1 pizza gratis' },
    { id: 'haircut', label: '✂️ Corte Gratis', description: '1 corte de cabello gratis' },
    { id: 'manicure', label: '💅 Manicure Gratis', description: '1 manicure gratis' },
    { id: 'discount', label: '20% OFF', description: '20% de descuento en tu compra' },
    { id: 'custom', label: '✏️ Personalizado', description: '' },
  ];

  res.json({ templates });
});

export default router;
