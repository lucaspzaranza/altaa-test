import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";
import prisma from "../prismaClient";

export const requireCompany = (requireActive = true) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const companyId = req.params.id ?? req.body.companyId ?? req.activeCompanyId;
    if (!companyId && requireActive) return res.status(400).json({ message: "CompanyId required" });
    if (!companyId) { req.activeCompanyId = null; return next(); }

    const membership = await prisma.membership.findUnique({
      where: { userId_companyId: { userId: req.user.id, companyId } }
    });
    if (!membership) return res.status(403).json({ message: "Forbidden: not a member" });
    req.activeCompanyId = companyId;
    req.user.role = membership.role;
    next();
  };
};
