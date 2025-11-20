import { User } from '../../generated/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        activeCompanyId?: string | null;
        role?: string;
      };
    }
  }
}

export { };
