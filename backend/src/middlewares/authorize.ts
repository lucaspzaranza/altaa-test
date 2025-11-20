import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth";

export const authorize = (roles: ("OWNER" | "ADMIN" | "MEMBER")[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role) return res.status(403).json({ message: "Forbidden" });
    if (roles.includes(role)) return next();
    return res.status(403).json({ message: "Insufficient permissions" });
  };
};
