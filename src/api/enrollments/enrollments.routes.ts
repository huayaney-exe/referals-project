import { Router } from 'express';
import { z } from 'zod';
import { CustomerService } from '../../domains/customer/Customer';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';
import { QRCodeService } from '../../infrastructure/qrcode/QRCodeService';

const router = Router();
const qrCodeService = new QRCodeService();

const enrollSchema = z.object({
  business_id: z.string().uuid('Invalid business ID'),
  phone: z.string().regex(/^\+\d{1,4}\d{9}$/, 'Invalid phone format'),
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email').optional(),
  email_opt_in: z.boolean().default(true),
});

// POST /api/v1/enrollments - Enroll new customer (PUBLIC - no auth required)
router.post('/', async (req, res, next) => {
  try {
    const validated = enrollSchema.parse(req.body);

    const customer = await CustomerService.create({
      business_id: validated.business_id,
      phone: validated.phone,
      name: validated.name,
      email: validated.email,
      email_opt_in: validated.email_opt_in,
    });

    res.status(201).json({
      data: {
        customer_id: customer.id,
        phone: customer.phone,
        name: customer.name,
        stamps_count: customer.stamps_count,
        enrolled_at: customer.enrolled_at,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/enrollments/check?business_id=...&phone=... - Check if customer exists (PUBLIC)
router.get('/check', async (req, res, next) => {
  try {
    const business_id = z.string().uuid().parse(req.query.business_id);
    const phone = z.string().regex(/^\+\d{1,4}\d{9}$/).parse(req.query.phone);

    const customer = await CustomerService.findByPhone(business_id, phone);

    if (!customer) {
      res.json({ exists: false });
      return;
    }

    res.json({
      exists: true,
      customer: {
        id: customer.id,
        phone: customer.phone,
        name: customer.name,
        stamps_count: customer.stamps_count,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/enrollments/:customerId/qrcode - Get QR code for customer enrollment
router.get('/:customerId/qrcode', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const customerId = req.params.customerId;
    const size = (req.query.size as 'small' | 'medium' | 'large') || 'medium';
    const format = (req.query.format as 'png' | 'svg') || 'png';

    // Get customer details
    const customer = await CustomerService.findById(customerId);

    if (!customer) {
      res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Customer not found',
        },
      });
      return;
    }

    // Verify customer belongs to this business
    if (customer.business_id !== req.user!.businessId) {
      res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Customer does not belong to your business',
        },
      });
      return;
    }

    // Generate QR code
    const qrBuffer = await qrCodeService.generateEnrollmentQR(
      {
        enrollmentId: customer.id,
        businessId: customer.business_id,
        customerId: customer.id,
        businessName: 'Business Name', // TODO: Fetch from business service
        customerName: customer.name,
        currentStamps: customer.stamps_count || 0,
        requiredStamps: 10, // TODO: Fetch from business reward structure
      },
      size,
      format
    );

    // Set appropriate content type
    const contentType = format === 'svg' ? 'image/svg+xml' : 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="loyalty-qr-${customerId}.${format}"`);
    res.send(qrBuffer);
  } catch (error) {
    next(error);
  }
});

export default router;
