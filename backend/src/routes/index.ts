import { Router } from "express";
import authRoutes from "./auth";
import companyRoutes from "./company";
import userRoutes from "./user";
import inviteRoutes from "./invite";

const router = Router();
router.use("/auth", authRoutes);
router.use("/company", companyRoutes);
router.use("/users", userRoutes);
router.use("/invites", inviteRoutes);

export default router;
