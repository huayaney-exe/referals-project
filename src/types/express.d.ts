import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: {
        userId: string;
        email: string | undefined;
        businessId: string;
      };
    }
  }
}
