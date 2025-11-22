declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      email: string;
      activeCompanyId?: string | null;
      role?: string;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export { };
