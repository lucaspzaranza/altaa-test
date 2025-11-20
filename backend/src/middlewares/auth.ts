import { Request, Response, NextFunction } from "express";
import { verifySession } from "../utils/jwt";
import prisma from "../prismaClient";

export interface AuthRequest extends Request {
  user?: any;
  activeCompanyId?: string | null;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies["session"];
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const payload = verifySession(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ message: "User not found" });
    req.user = user;
    req.activeCompanyId = payload.activeCompanyId ?? user.activeCompanyId ?? null;
    next();
  } catch (err) { next(err); }
};
