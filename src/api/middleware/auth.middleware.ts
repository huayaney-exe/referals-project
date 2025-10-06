import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../../config/supabase';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string | undefined;
    businessId: string;
  };
}

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      error: {
        code: 'MISSING_TOKEN',
        message: 'Authorization header required',
      },
    });
    return;
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Token inválido o expirado',
        },
      });
      return;
    }

    // Try to get business_id from user_metadata first
    let businessId = data.user.user_metadata?.business_id;

    // If not in metadata, query businesses table by email (fallback for legacy users)
    if (!businessId) {
      const { data: businessData, error: businessError } = await supabaseAdmin
        .from('businesses')
        .select('id')
        .eq('email', data.user.email)
        .single();

      if (businessError || !businessData) {
        res.status(401).json({
          error: {
            code: 'BUSINESS_NOT_FOUND',
            message: 'No business associated with this account',
          },
        });
        return;
      }

      businessId = businessData.id;
    }

    req.user = {
      userId: data.user.id,
      email: data.user.email,
      businessId: businessId,
    };

    next();
  } catch (error) {
    res.status(401).json({
      error: {
        code: 'AUTH_ERROR',
        message: 'Error de autenticación',
      },
    });
  }
}
