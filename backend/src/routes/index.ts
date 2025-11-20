import { Router } from "express";
import authRoutes from "./auth";
import companyRoutes from "./company";

const router = Router();
router.use("/auth", authRoutes);
router.use("/company", companyRoutes);

export default router;
